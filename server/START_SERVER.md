# 🚀 服务器启动指南

## ✅ 已完成配置

### Coze API 配置
- API URL: `https://api.coze.cn/v3/chat`
- Bot ID: `7588350694353649679`
- API Key: 已配置 ✓

## 📝 启动步骤

### 1. 启动服务器

打开 PowerShell，运行：

```powershell
cd d:\Safety-Map\server
npm start
```

**应该看到：**
```
🚀 服务器运行在 http://localhost:3001
📁 上传目录: D:\Safety-Map\server\uploads
```

### 2. 验证服务器运行

在浏览器打开：`http://localhost:3001/health`

**应该看到：**
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### 3. 测试拍照检测功能

1. 在浏览器打开 `d:\Safety-Map\index.html`
2. 点击"拍照检测"
3. 选择检测部位（如"门锁"）
4. 上传一张图片
5. 点击"提交 AI 专家深度分析"

### 4. 查看 API 调用日志

在服务器控制台应该看到：
```
调用Coze API...
API URL: https://api.coze.cn/v3/chat
Bot ID: 7588350694353649679
Coze API响应状态: 200
AI返回的内容: {...}
```

## 🔍 检查 Token 消耗

1. 打开 Coze 后台：https://www.coze.cn/space/7383534396151693331/bot/7588350694353649679
2. 查看"费用详情"或"调用统计"
3. 每次成功调用都会消耗 Token

## ⚠️ 故障排查

### 问题1：服务器无法启动
- 检查端口 3001 是否被占用：`netstat -ano | findstr :3001`
- 如果被占用，杀掉进程或修改 `.env` 中的 `PORT`

### 问题2：API 调用失败
- 检查 `.env` 文件中的 API Key 是否正确
- 查看服务器控制台的错误信息
- 确认 Coze Bot 是否已发布并可用

### 问题3：没有消耗 Token
- 确认服务器正在运行（看到启动日志）
- 确认前端成功提交了图片（浏览器 Network 标签显示 200）
- 查看服务器控制台是否有"调用Coze API..."日志

## 📊 API 配置说明

当前使用的是 **Coze API**，配置如下：

```
API URL: https://api.coze.cn/v3/chat
Bot ID: 7588350694353649679
User ID: 123123
```

每次图片分析都会：
1. 将图片转换为 base64
2. 发送到 Coze API
3. 接收 AI 分析结果
4. 返回给前端显示

## 🎯 下一步

启动服务器后，上传一张图片测试，然后查看：
1. 服务器控制台的日志
2. Coze 后台的调用统计
3. 前端显示的分析结果

如果看到"调用Coze API..."日志，说明 API 已经被调用，Token 应该会被消耗！
















