import json
import time
import logging
from supabase import create_client
from dashscope import MultiModalConversation

# ==================== 配置 ====================
SUPABASE_URL = "https://hmmruoankhohowlzajll.supabase.co"
# 使用 Service Role Key
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUyNDE2OCwiZXhwIjoyMDg2MTAwMTY4fQ.vYyMRuwOVhrDY-qQYTQNort1s9dBcOVL9YCZ8xQU_aY"
DASHSCOPE_API_KEY = "sk-83a34f650e484b03a17710d87b28a725"

POLL_INTERVAL = 5  # 数据库轮询间隔（秒）

# 配置日志输出，方便在后台查看运行状态
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# 初始化 Supabase 客户端
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def process_pending_sessions():
    """查询并处理待分析的检测会话"""
    try:
        # 1. 查询状态为 'analyzing' 的会话
        response = (
            supabase.table("detection_sessions")
            .select("*")
            .eq("status", "analyzing")
            .order("created_at", desc=False) # 先进先出
            .execute()
        )
        sessions = response.data
    except Exception as e:
        logger.error(f"查询数据库失败: {e}")
        return

    if not sessions:
        return # 没有任务，直接返回，继续默默监听

    logger.info(f"🔍 发现 {len(sessions)} 个待处理的检测请求")

    for session in sessions:
        session_id = session["id"]
        logger.info(f"🔄 正在处理 Session ID: {session_id}")

        # 2. 获取该 session 下所有的照片 URL 和自查结果
        try:
            photos_res = (
                supabase.table("detection_photos")
                .select("category, photo_url, qa_result")
                .eq("session_id", session_id)
                .execute()
            )
            photos = photos_res.data
        except Exception as e:
            logger.error(f"  ❌ 获取照片明细失败: {e}")
            _update_session_status(session_id, "failed")
            continue

        if not photos:
            logger.warning(f"  ⚠️ Session {session_id} 没有关联任何照片，跳过分析")
            _update_session_status(session_id, "completed", {"error": "无照片"})
            continue

        # 3. 组装发给大模型的数据
        # Qwen-VL 支持直接传入图片 URL
        content = []
        for p in photos:
            # 存入图片URL
            content.append({"image": p["photo_url"]})
        
        # 组装 Prompt，把用户填的“正常/异常”也喂给模型作为参考
        qa_context = ", ".join([f"{p['category']}(自查:{p.get('qa_result', '未填')})" for p in photos])
        
        prompt_text = (
            f"你是一位专业的酒店安全专家，请仔细分析这组酒店房间图片。这些图片分别对应：{qa_context}。\n"
            "任务：\n"
            "1. 判断门锁、窗户、天花板、插座、镜子等是否存在安全隐患、改装痕迹或偷拍风险。\n"
            "2. 结合用户的自查结果进行综合研判。\n"
            "3. 必须严格返回如下 JSON 格式代码块，不要包含任何多余解释：\n"
            "{\n"
            '  "overall_risk_level": "高风险/中风险/低风险/安全",\n'
            '  "detected_issues": [\n'
            '    {"part": "门锁", "issue": "发现松动痕迹", "severity": "高"}\n'
            '  ],\n'
            '  "safe_parts": ["窗户", "浴室"],\n'
            '  "final_advice": "综合安全建议"\n'
            "}"
        )
        content.append({"text": prompt_text})

        messages = [{"role": "user", "content": content}]

        logger.info(f"  🤖 正在调用 Qwen-VL-Plus 模型分析 {len(photos)} 张图片...")

        # 4. 调用大模型
        try:
            gen_response = MultiModalConversation.call(
                api_key=DASHSCOPE_API_KEY,
                model="qwen-vl-plus",
                messages=messages,
            )
            
            if gen_response.status_code != 200:
                logger.error(f"  ❌ 模型调用失败: {gen_response.message}")
                _update_session_status(session_id, "failed")
                continue
                
            # 提取 JSON 文本
            result_text = gen_response.output.choices[0].message.content[0]["text"]
            
            # 清理可能的 Markdown 标记 (去除 ```json 和 ```)
            clean_json_str = result_text.replace("```json", "").replace("```", "").strip()
            ai_report_dict = json.loads(clean_json_str)

            # 5. 将报告存回数据库，并更新状态为 completed
            _update_session_status(session_id, "completed", ai_report_dict)
            logger.info(f"  ✅ 分析完成！报告已存入 Session: {session_id}")

        except Exception as e:
            logger.error(f"  ❌ 模型分析或解析报告过程中发生异常: {e}")
            _update_session_status(session_id, "failed")


def _update_session_status(session_id: str, status: str, ai_report: dict = None):
    """辅助函数：更新 Session 状态"""
    update_data = {"status": status}
    if ai_report:
        update_data["ai_report"] = ai_report
        
    try:
        supabase.table("detection_sessions").update(update_data).eq("id", session_id).execute()
    except Exception as e:
        logger.error(f"  ❌ 更新状态到数据库失败: {e}")


# ==================== 主入口 (守护进程) ====================
if __name__ == "__main__":
    logger.info("=" * 50)
    logger.info("🛡️ HerGuard 后台 AI 分析服务已启动")
    logger.info("监听中... 请按 Ctrl+C 停止")
    logger.info("=" * 50)

    try:
        while True:
            process_pending_sessions()
            time.sleep(POLL_INTERVAL)  # 休息 5 秒再查，避免把数据库刷崩
            
    except KeyboardInterrupt:
        logger.info("\n🛑 服务已手动停止。")