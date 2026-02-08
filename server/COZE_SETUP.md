# Coze API 快速配置指南

## ✅ Bot ID 确认

您的 Bot ID 已正确配置：
- **Bot ID**: `7588350694353649679`
- **Space ID**: `7383534396151693331`
- **Bot 链接**: https://www.coze.cn/space/7383534396151693331/bot/7588350694353649679

## 🚀 快速配置步骤

### 1. 获取 API Key

1. 登录 [Coze 平台](https://www.coze.cn)
2. 进入你的 Bot 页面
3. 在设置中找到 **API 配置** 或 **开发者设置**
4. 创建新的 API Key
5. 复制 API Key（格式类似：`pat_xxxxxxxxxxxxx`）

### 2. 配置环境变量

在 `server` 目录下创建 `.env` 文件：

```env
# Coze API配置
COZE_API_KEY=你的API_Key_在这里
COZE_BOT_ID=7588350694353649679
COZE_SPACE_ID=7383534396151693331
COZE_API_URL=https://api.coze.cn/open_api/v2/chat

# 服务器配置
PORT=3001
```

### 3. 安装依赖

```bash
cd server
npm install
```

### 4. 启动服务器

```bash
npm start
```

## 🔍 验证配置

启动服务器后，查看控制台输出：

```
🚀 服务器运行在 http://localhost:3001
📁 上传目录: .../server/uploads
```

如果配置了 Coze API Key，上传照片时会看到：
```
调用Coze API，Bot ID: 7588350694353649679
Coze API调用成功
```

如果未配置 API Key，会看到：
```
Coze API Key未配置，使用模拟分析
```

## 📝 Bot 配置建议

为了获得最佳分析效果，建议在 Coze Bot 中配置：

### 提示词模板

```
你是一个专业的酒店安全检测专家。请分析用户上传的照片，检测是否存在安全隐患。

检测重点：
- 门锁：检查是否有撬动痕迹、松动、反锁失效等
- 窗户：检查外部是否有空调外机、水管等攀爬条件
- 镜子：检查是否为双面镜（敲击声音、镜后空间）
- 浴室：检查通风口是否有隐藏摄像头、异常红点
- 插座：检查是否有改装痕迹、异常反光点
- 路由器：检查是否有异常孔洞、多余接线

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

### Bot 能力设置

- ✅ 启用图像识别能力
- ✅ 启用 JSON 输出格式
- ✅ 配置超时时间（建议30秒以上）

## 🧪 测试 API

### 方法1：使用前端测试

1. 启动后端服务器
2. 打开前端页面
3. 进入拍照检测功能
4. 上传照片
5. 查看分析结果

### 方法2：使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/analyze-photo \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "photo=@test-image.jpg" \
  -F "detectionType=门锁"
```

## 🔧 故障排查

### 问题1：API Key 无效

**症状**：返回 401 错误

**解决**：
- 检查 API Key 是否正确
- 确认 API Key 是否有权限访问该 Bot
- 检查 API Key 是否过期

### 问题2：Bot ID 错误

**症状**：返回 404 或 Bot 不存在错误

**解决**：
- 确认 Bot ID 是否正确：`7588350694353649679`
- 检查 Bot 是否已发布
- 确认 Space ID 是否正确

### 问题3：图片上传失败

**症状**：返回格式错误

**解决**：
- 检查图片格式是否支持（JPEG、PNG）
- 检查图片大小（建议小于10MB）
- 查看服务器日志了解详细错误

### 问题4：返回格式解析失败

**症状**：分析结果格式不正确

**解决**：
- 检查 Bot 提示词是否要求返回 JSON 格式
- 查看服务器日志中的原始响应
- 如果 Bot 返回文本格式，代码会自动解析

## 📊 API 调用示例

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
      "detectedItems": ["门锁松动", "有撬动痕迹"],
      "recommendations": [
        "建议立即联系酒店前台",
        "记录详细位置信息",
        "考虑更换房间"
      ],
      "safetyScore": 2.0
    }
  }
}
```

## 💡 提示

1. **API Key 安全**：不要将 API Key 提交到 Git 仓库
2. **错误处理**：如果 Coze API 调用失败，会自动回退到模拟分析
3. **日志查看**：查看服务器控制台了解详细的 API 调用情况
4. **测试建议**：先用模拟分析测试功能，确认无误后再配置 Coze API

## 📚 相关文档

- [Coze 官方文档](https://www.coze.cn/docs)
- [Coze API 参考](https://www.coze.cn/open/api)
- 项目集成文档：`COZE_INTEGRATION.md`
