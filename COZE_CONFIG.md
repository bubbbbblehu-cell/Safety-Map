# Coze API 配置说明

## ✅ Bot 信息确认

您的 Coze Bot 信息：
- **Bot ID**: `7588350694353649679` ✅ 已配置
- **Space ID**: `7383534396151693331` ✅ 已配置
- **Bot 链接**: https://www.coze.cn/space/7383534396151693331/bot/7588350694353649679

## 🔑 需要配置的内容

只需要配置 **API Key** 即可开始使用：

### 步骤1：获取 API Key

1. 登录 [Coze 平台](https://www.coze.cn)
2. 进入你的 Bot 页面
3. 找到 **API 配置** 或 **开发者设置**
4. 创建新的 API Key
5. 复制 API Key

### 步骤2：配置到项目

在 `server/.env` 文件中添加：

```env
COZE_API_KEY=你的API_Key_在这里
```

其他配置已经默认设置好了：
- `COZE_BOT_ID=7588350694353649679` ✅
- `COZE_SPACE_ID=7383534396151693331` ✅
- `COZE_API_URL=https://api.coze.cn/open_api/v2/chat` ✅

## 🚀 快速开始

```bash
# 1. 进入服务器目录
cd server

# 2. 安装依赖（如果还没安装）
npm install

# 3. 创建 .env 文件并添加 API Key
# 复制 .env.example 为 .env，然后编辑添加你的 API Key

# 4. 启动服务器
npm start
```

## 📝 验证配置

启动服务器后，上传照片测试：

1. **如果配置了 API Key**：
   - 控制台会显示：`调用Coze API，Bot ID: 7588350694353649679`
   - 会调用真实的 Coze AI 进行分析

2. **如果未配置 API Key**：
   - 控制台会显示：`Coze API Key未配置，使用模拟分析`
   - 会使用模拟分析（用于测试功能）

## 🔍 Bot 配置建议

为了获得最佳分析效果，建议在 Coze Bot 中配置以下提示词：

```
你是一个专业的酒店安全检测专家。请分析用户上传的照片，检测是否存在安全隐患。

请严格按照以下JSON格式返回分析结果（只返回JSON，不要有其他文字）：

{
  "hasRisk": true/false,
  "riskLevel": "high/medium/low",
  "confidence": 0.0-1.0,
  "detectedItems": ["具体问题1", "具体问题2"],
  "recommendations": ["建议1", "建议2", "建议3"],
  "safetyScore": 0.0-5.0
}
```

## 📚 更多信息

- 详细集成文档：`server/COZE_INTEGRATION.md`
- 快速配置指南：`server/COZE_SETUP.md`
- 后端API文档：`server/README.md`
