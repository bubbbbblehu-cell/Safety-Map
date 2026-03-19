import argparse
import json
import logging
import os
import re
import time
from datetime import datetime

import pandas as pd
import requests
from openai import OpenAI
from supabase import create_client

# =========================
# 基础配置（全量运行模式）
# =========================
DEFAULT_CITY_CODE = "520100"  # 城市代码 (贵阳)，注意这个代码需要和你 cities 表里的城市对应
DEFAULT_KEYWORDS = ["酒店", "宾馆", "旅馆", "度假村", "民宿", "公寓"]
CRAWL_REQUEST_DELAY = 0.5     # 爬虫请求间隔
AUDIT_REQUEST_DELAY = 2.5     # 大模型请求间隔
MAX_PAGES_PER_KEYWORD = 2     # 测试阶段建议改小一点，正式跑再改成 20

# === Supabase 配置项 ===
SUPABASE_URL = "https://hmmruoankhohowlzajll.supabase.co"
# 注意：这里使用的是 Service Role Key，拥有最高权限，专门用于后台脚本直接写库
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUyNDE2OCwiZXhwIjoyMDg2MTAwMTY4fQ.vYyMRuwOVhrDY-qQYTQNort1s9dBcOVL9YCZ8xQU_aY"

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# 初始化 Supabase 客户端
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_openai_client() -> OpenAI:
    """初始化通义千问客户端"""
    api_key = "sk-83a34f650e484b03a17710d87b28a725" 
    if not api_key:
        raise ValueError("未检测到 Qwen API Key。")
    return OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )


def get_amap_key() -> str:
    """获取高德地图 API Key"""
    amap_key = "40fba5898e4fff9a89bc13545772ad4d"  
    if not amap_key:
        raise ValueError("未检测到高德 API Key。")
    return amap_key


def get_hotels_by_keyword(
    keyword: str,
    city_code: str,
    amap_key: str,
    max_pages: int = MAX_PAGES_PER_KEYWORD,
) -> list:
    """按关键词抓取高德 POI 数据"""
    hotels = []
    logger.info("开始抓取关键词: [%s]", keyword)
    for page in range(1, max_pages + 1):
        url = "https://restapi.amap.com/v3/place/text"
        params = {
            "keywords": keyword,
            "city": city_code,
            "output": "json",
            "page": page,
            "pagesize": 20,
            "key": amap_key,
        }
        try:
            res = requests.get(url, params=params, timeout=15)
            res.raise_for_status()
            res_json = res.json()
            
            if res_json.get("status") != "1":
                logger.error("关键词=[%s] 第%d页请求失败: %s", keyword, page, res_json.get("info", "未知错误"))
                break

            pois = res_json.get("pois", [])
            if not pois:
                logger.info("关键词=[%s] 第%d页无数据，停止抓取", keyword, page)
                break

            for poi in pois:
                location = str(poi.get("location", "0,0"))
                lng, lat = "N/A", "N/A"
                if "," in location:
                    parts = location.split(",")
                    if len(parts) == 2:
                        lng, lat = parts[0], parts[1]

                hotels.append({
                    "酒店名称": str(poi.get("name", "N/A")),
                    "地点": str(poi.get("address", "N/A")),
                    "联系电话": str(poi.get("tel", "N/A")),
                    "经度": str(lng),
                    "维度": str(lat),
                })
                
            logger.info("关键词=[%s] 第%d页抓取%d条，当前累计%d条", keyword, page, len(pois), len(hotels))
            if len(pois) < 20: 
                break
                
        except Exception as exc:
            logger.warning("关键词=[%s] 第%d页异常: %s", keyword, page, exc)
            time.sleep(2)
            continue

        time.sleep(CRAWL_REQUEST_DELAY)

    return hotels


def remove_duplicates(hotels_list: list) -> list:
    """根据酒店名称去重"""
    seen = set()
    unique_hotels = []
    for hotel in hotels_list:
        name = str(hotel.get("酒店名称", ""))
        if name not in seen:
            seen.add(name)
            unique_hotels.append(hotel)
    return unique_hotels


def get_qwen_audit(client: OpenAI, hotel_name: str, max_retries: int = 3) -> dict:
    """调用千问执行联网安全审查"""
    prompt = f"""
你是一名资深的旅行安全专家，请深度联网搜索酒店：{hotel_name}。
任务：
1. 搜索各平台（携程、大众点评、小红书等）近期真实评价。
2. 重点关注：治安情况、单身女性入住安全性、设施老化程度、周边环境安全。
3. 必须严格返回如下 JSON 格式：
{{
  "score": 0.0-5.0,
  "risk_level": "低风险/中风险/高风险",
  "risk_tags": ["标签1", "标签2"],
  "audit_report": "综合结论",
  "security_issues": ["问题1", "问题2"],
  "negative_reviews": ["典型差评1", "典型差评2"],
  "booking_link": "预订链接或详情链接",
  "recommendation": "避雷或推荐建议"
}}
"""
    for attempt in range(max_retries):
        try:
            completion = client.chat.completions.create(
                model="qwen-max",
                messages=[
                    {"role": "system", "content": "你只输出合法的 JSON 代码块，不包含任何解释。"},
                    {"role": "user", "content": prompt},
                ],
                extra_body={"enable_search": True},
                temperature=0.3,
            )
            res_text = completion.choices[0].message.content or ""
            
            # JSON 提取
            match = re.search(r'\{.*\}', res_text, re.DOTALL)
            if not match:
                raise ValueError("未找到 JSON")
            
            clean_json = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', match.group())
            return json.loads(clean_json)
            
        except Exception as exc:
            logger.warning("酒店 [%s] 审计失败 (重试 %d/%d): %s", hotel_name, attempt + 1, max_retries, exc)
            time.sleep(2)
            
    return {"score": 0, "risk_level": "分析失败", "audit_report": "接口响应异常"}


def audit_and_save_to_supabase(df: pd.DataFrame, client: OpenAI):
    """全量审计并直接写入 Supabase 数据库"""
    total = len(df)
    logger.info("====== 开始全量深度审计并同步至数据库，共 %d 家酒店 ======", total)

    success_count = 0
    
    # 注意：确保 cities 表里有一条 id 为 '520100' 的数据，或者修改为你的城市 UUID。
    # 这里假设 DEFAULT_CITY_CODE (520100) 是可以直接用作外键的值。
    # 如果你的 cities 表是用 uuid 作为主键，你需要先查出对应城市的 uuid。

    for i, row in df.iterrows():
        hotel_name = str(row["酒店名称"])
        logger.info("[%d/%d] 正在联网审计: %s", i + 1, total, hotel_name)
        
        # 1. 抓取大模型审计结果
        result = get_qwen_audit(client, hotel_name)

        # 2. 组装符合 Supabase 表结构的字典
        lat_str = str(row.get("维度", "0"))
        lng_str = str(row.get("经度", "0"))
        try:
            latitude = float(lat_str) if lat_str != "N/A" else None
            longitude = float(lng_str) if lng_str != "N/A" else None
        except ValueError:
            latitude, longitude = None, None

        db_record = {
            # "city_id": DEFAULT_CITY_CODE, # ⚠️这里可能需要根据你的实际城市表设计做修改，如果 cities 的主键是 UUID，需要提供关联的 UUID
            "name": hotel_name,
            "address": str(row.get("地点", "")),
            "phone": str(row.get("联系电话", "")),
            "latitude": latitude,
            "longitude": longitude,
            "safety_score": float(result.get("score", 0.0)),
            "risk_level": result.get("risk_level", "未知"),
            "risk_tag": " | ".join(result.get("risk_tags", [])), 
            "conclusion": result.get("audit_report", ""),
            "negative_comments": "\n".join(result.get("negative_reviews", [])),
            "booking_url": result.get("booking_link", ""),
            "advice": result.get("recommendation", "")
        }

        # 3. 实时写入数据库
        try:
            supabase.table("hotels").insert(db_record).execute()
            logger.info("  ✅ 成功写入数据库: %s", hotel_name)
            success_count += 1
        except Exception as db_err:
            logger.error("  ❌ 写入数据库失败: %s - 原因: %s", hotel_name, db_err)

        # 保持请求间隔，防止被限流
        time.sleep(AUDIT_REQUEST_DELAY)
        
    logger.info("🎉 审计入库任务完成！成功入库 %d/%d 家酒店。", success_count, total)


def main():
    try:
        client = build_openai_client()
        amap_key = get_amap_key()
        
        # 1. 抓取阶段
        all_hotels = []
        for kw in DEFAULT_KEYWORDS:
            all_hotels.extend(get_hotels_by_keyword(kw, DEFAULT_CITY_CODE, amap_key))
        
        if not all_hotels:
            logger.error("未找到任何酒店数据，请检查城市编码或关键词。")
            return
            
        # 2. 去重阶段
        df = pd.DataFrame(all_hotels)
        df = remove_duplicates(df.to_dict('records'))
        df = pd.DataFrame(df)
        logger.info("抓取完毕，去重后共计 %d 家酒店待审计。", len(df))
        
        # 3. 审计并入库阶段 (替换掉原来的保存Excel逻辑)
        audit_and_save_to_supabase(df, client)

    except Exception as e:
        logger.exception("程序异常终止: %s", e)


if __name__ == "__main__":
    main()