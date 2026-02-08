# Coze API 集成指南

## 📋 概述

本项目已集成 Coze AI API，用于酒店安全环境的智能分析。Coze 是字节跳动的 AI Agent 平台，提供强大的图像识别和分析能力。

## 🔑 获取 API Key

1. **访问 Coze 平台**
   - 登录 [Coze 平台](https://www.coze.cn)
   - 进入你的 Bot 页面

2. **获取 API Key**
   - 在 Bot 设置中找到 API 配置
   - 创建新的 API Key
   - 复制 API Key（注意保密）

3. **获取 Bot ID 和 Space ID**
   - Bot ID: `7588350694353649679`
   - Space ID: `7383534396151693331`
   - 这些信息可以从 Bot URL 中获取

## ⚙️ 配置步骤

### 1. 配置环境变量

在 `server/.env` 文件中添加：

```env
# Coze API配置
COZE_API_KEY=your_coze_api_key_here
COZE_BOT_ID=7588350694353649679
COZE_SPACE_ID=7383534396151693331
COZE_API_URL=https://api.coze.cn/open_api/v2/chat
```

### 2. 安装依赖

```bash
cd server
npm install
```

### 3. 启动服务器

```bash
npm start
```

## 🔌 API 集成说明

### 当前实现

后端代码已集成 Coze API，具体实现：

1. **自动检测配置**
   - 如果配置了 `COZE_API_KEY`，使用 Coze API
   - 如果未配置，自动回退到模拟分析

2. **图片处理**
   - 自动将图片转换为 base64 格式
   - 支持 JPEG、PNG 等常见格式
   - 自动压缩和优化图片

3. **智能分析**
   - 根据检测部位类型发送不同的提示词
   - 解析 Coze 返回的 JSON 格式结果
   - 如果返回文本格式，自动解析关键信息

### API 调用流程

```
用户上传照片
    ↓
后端接收并处理图片
    ↓
转换为 base64 格式
    ↓
调用 Coze API
    ↓
解析返回结果
    ↓
返回分析结果给前端
```

## 📝 Coze Bot 配置建议

为了获得最佳的分析效果，建议在 Coze Bot 中配置：

### 1. Bot 提示词（Prompt）

```
你是一个专业的酒店安全检测专家。请分析用户上传的照片，检测是否存在安全隐患。

检测重点：
- 门锁：检查是否有撬动痕迹、松动等
- 窗户：检查外部是否有攀爬条件
- 镜子：检查是否为双面镜
- 浴室：检查通风口是否有隐藏摄像头
- 插座：检查是否有改装痕迹
- 路由器：检查是否有异常孔洞或接线

请用JSON格式返回分析结果：
{
  "hasRisk": boolean,  // 是否存在风险
  "riskLevel": "high" | "medium" | "low",  // 风险等级
  "confidence": number,  // 置信度 0-1
  "detectedItems": string[],  // 检测到的具体问题
  "recommendations": string[],  // 建议措施
  "safetyScore": number  // 安全评分 0-5
}
```

### 2. Bot 能力配置

- ✅ 启用图像识别能力
- ✅ 启用 JSON 输出格式
- ✅ 配置超时时间（建议30秒）

## 🧪 测试 API

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/analyze-photo \
  -H "Content-Type: multipart/form-data" \
  -F "photo=@test-image.jpg" \
  -F "detectionType=门锁"
```

### 使用 Postman 测试

1. 创建 POST 请求：`http://localhost:3001/api/analyze-photo`
2. 选择 Body → form-data
3. 添加字段：
   - `photo`: 选择文件
   - `detectionType`: 输入检测类型（如：门锁）
4. 发送请求

## 🔍 调试技巧

### 查看日志

服务器会输出详细的日志信息：

```bash
# 查看是否使用 Coze API
调用Coze API进行AI分析

# 如果API调用失败
调用Coze API失败: [错误信息]
回退到模拟分析
```

### 常见问题

1. **API Key 无效**
   - 检查 `.env` 文件中的 API Key 是否正确
   - 确认 API Key 是否有权限访问该 Bot

2. **超时错误**
   - Coze API 可能需要较长时间分析
   - 已设置30秒超时，如果超时会自动回退到模拟分析

3. **返回格式错误**
   - 如果 Coze 返回的不是 JSON 格式，代码会自动解析文本
   - 建议在 Bot 中配置返回 JSON 格式

## 📊 返回结果格式

### 成功响应

```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "detectionType": "门锁",
    "analysis": {
      "hasRisk": true,
      "riskLevel": "high",
      "confidence": 0.85,
      "detectedItems": ["松动", "摇晃"],
      "recommendations": [
        "建议立即联系酒店前台",
        "记录详细位置信息",
        "考虑更换房间"
      ],
      "safetyScore": 2.0,
      "aiResponse": "检测到门锁存在松动..."
    }
  }
}
```

### 模拟分析响应（未配置API Key时）

```json
{
  "success": true,
  "data": {
    "analysis": {
      "hasRisk": true,
      "riskLevel": "medium",
      "confidence": 0.75,
      "detectedItems": ["松动"],
      "recommendations": [...],
      "safetyScore": 3.5,
      "isSimulated": true
    }
  }
}
```

## 🚀 生产环境部署

### 1. 环境变量配置

在生产环境中，确保设置：

```env
COZE_API_KEY=your_production_api_key
COZE_BOT_ID=7588350694353649679
COZE_SPACE_ID=7383534396151693331
```

### 2. 安全建议

- ✅ 不要在代码中硬编码 API Key
- ✅ 使用环境变量管理敏感信息
- ✅ 定期轮换 API Key
- ✅ 限制 API 调用频率

### 3. 错误处理

代码已实现自动回退机制：
- Coze API 调用失败 → 自动使用模拟分析
- 确保服务始终可用
- 不会因为 API 问题导致功能完全失效

## 📚 相关资源

- [Coze 官方文档](https://www.coze.cn/docs)
- [Coze API 文档](https://www.coze.cn/open/api)
- Bot 链接：https://www.coze.cn/space/7383534396151693331/bot/7588350694353649679

## 💡 优化建议

1. **缓存结果**：相同图片可以缓存分析结果
2. **批量处理**：优化批量上传的处理逻辑
3. **异步处理**：对于大量图片，可以使用队列异步处理
4. **结果存储**：将分析结果存储到数据库，方便查询和统计
