import base64
import json
import os
import uuid
from pathlib import Path
from supabase import create_client
from dashscope import MultiModalConversation

# ==================== 配置 ====================
SUPABASE_URL = "https://hmmruoankhohowlzajll.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUyNDE2OCwiZXhwIjoyMDg2MTAwMTY4fQ.vYyMRuwOVhrDY-qQYTQNort1s9dBcOVL9YCZ8xQU_aY"
DASHSCOPE_API_KEY = "sk-83a34f650e484b03a17710d87b28a725"

# 桌面路径
DESKTOP_PATH = Path.home() / "Desktop"

# 要处理的图片文件（修改为你桌面上的实际文件名）
IMAGE_FILES = ["1.jpg", "2.png", "3.jpg"]

# ==================== 初始化 ====================
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==================== 第一步：上传图片 ====================
def upload_images():
    """将桌面图片编码为 Base64 并上传到 Supabase"""
    request_id = str(uuid.uuid4())  # 生成唯一的 request_id
    uid = "test_user_001"

    print(f"📤 开始上传图片，Request ID: {request_id}")

    uploaded_count = 0

    for image_filename in IMAGE_FILES:
        image_path = DESKTOP_PATH / image_filename

        if not image_path.exists():
            print(f"  ❌ 文件不存在: {image_path}")
            continue

        # 读取并编码图片
        try:
            with open(image_path, "rb") as f:
                base64_data = base64.b64encode(f.read()).decode("utf-8")
        except Exception as e:
            print(f"  ❌ 读取图片失败 {image_filename}: {e}")
            continue

        # 判断图片格式
        ext = image_path.suffix.lower()
        mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"
        base64_img = f"data:{mime_type};base64,{base64_data}"

        # 上传到 Supabase
        photos_data = {
            "uid": uid,
            "request_id": request_id,
            "photos": {
                "filename": image_filename,
                "data": base64_img,
                "size_bytes": image_path.stat().st_size,
            },
            "status": "pending"
        }

        try:
            result = supabase.table("room_photos").insert(photos_data).execute()
            if result.data:
                print(f"  ✅ 上传成功: {image_filename}")
                uploaded_count += 1
            else:
                print(f"  ❌ 上传失败: {image_filename}")
        except Exception as e:
            print(f"  ❌ 上传出错: {e}")

    print(f"\n📊 上传完成: {uploaded_count}/{len(IMAGE_FILES)} 张成功")
    return request_id if uploaded_count > 0 else None


# ==================== 第二步：分析图片 ====================
def run_analysis():
    """从 Supabase 获取待处理图片，调用 Qwen-VL 模型分析"""
    # 查询待处理记录
    response = (
        supabase.table("room_photos")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )

    if not response.data:
        print("⚠️ 没有发现待处理的图片。")
        return

    print(f"\n🔍 查询到 {len(response.data)} 条待处理记录")

    # 按 request_id 分组
    request_groups = {}
    for record in response.data:
        if isinstance(record, dict):
            rid = record.get("request_id")
            if rid:
                request_groups.setdefault(rid, []).append(record)

    # 逐组处理
    for request_id, records in request_groups.items():
        uid = records[0].get("uid")
        print(f"\n🔄 正在处理 Request ID: {request_id}（共 {len(records)} 张图片）")

        # 提取 Base64 图片数据
        images_data = [record["photos"]["data"] for record in records]

        # 构建多图消息
        content = [{"image": img} for img in images_data]
        content.append({
            "text": (
                "你是一位专业的酒店安全专家，请仔细分析这组酒店房间图片，"
                "判断门锁、窗户、天花板、电器等是否存在安全隐患或偷拍风险。"
                "请综合分析所有图片，严格以 JSON 格式输出结果："
                "{'risk_level': '高/中/低', 'issues': ['风险点1', '风险点2'], "
                "'suggestion': '建议', 'analyzed_images': 数量}。"
            )
        })

        messages = [{"role": "user", "content": content}]

        print(f"🤖 正在调用 Qwen-VL-Plus 模型分析 {len(images_data)} 张图片...")

        # 调用模型
        try:
            gen_response = MultiModalConversation.call(
                api_key=DASHSCOPE_API_KEY,
                model="qwen-vl-plus",
                messages=messages,
            )
        except Exception as e:
            print(f"❌ 模型调用异常: {e}")
            continue

        if gen_response.status_code != 200:
            print(f"❌ 模型调用失败: {gen_response.message}")
            continue

        result_text = gen_response.output.choices[0].message.content[0]["text"]

        # 存储报告
        report_data = {
            "request_id": request_id,
            "uid": uid,
            "report": result_text,
        }

        try:
            supabase.table("room_reports").insert(report_data).execute()

            # 更新状态为已完成
            for record in records:
                supabase.table("room_photos").update(
                    {"status": "completed"}
                ).eq("id", record["id"]).execute()

            print("✅ 分析完成，报告已存入 room_reports 表！")
            print(f"📊 报告内容：\n{result_text}")

        except Exception as e:
            print(f"❌ 存储报告失败: {e}")


# ==================== 主流程 ====================
if __name__ == "__main__":
    print("=" * 50)
    print("🏨 酒店房间安全检测系统")
    print("=" * 50)

    # 第一步：上传图片到 Supabase
    request_id = upload_images()

    if request_id:
        # 第二步：分析图片并生成报告
        run_analysis()
    else:
        print("❌ 没有成功上传的图片，跳过分析。")

    print("\n" + "=" * 50)
    print("🏁 流程结束")
    print("=" * 50)
