# 🚀 启动服务器指南

## ✅ 配置已完成

- ✅ `.env` 文件已创建
- ✅ DashScope API Key 已配置
- ✅ API地址：https://dashscope.aliyuncs.com/compatible-mode/v1

## 📋 启动步骤

### 1. 打开新的命令行窗口

在项目根目录打开 PowerShell 或 CMD

### 2. 进入 server 目录

```bash
cd server
```

### 3. 安装依赖（首次运行）

```bash
npm install
```

### 4. 启动服务器

```bash
npm start
```

### 5. 验证服务器运行

看到以下信息说明启动成功：
```
🚀 服务器运行在 http://localhost:3001
📁 上传目录: D:\Safety-Map\server\uploads
```

### 6. 测试API

在浏览器打开：http://localhost:3001/health

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xx..."
}
```

## 🔧 API配置信息

当前配置的API信息：

- **服务商**：阿里云 DashScope
- **Base URL**：https://dashscope.aliyuncs.com/compatible-mode/v1
- **API Key**：sk-83a34f650e484b03a17710d87b28a725
- **模型**：qwen-vl-max（通义千问视觉大模型）
- **功能**：图片分析、安全检测

## 📝 使用说明

1. **本地开发**：
   - 启动服务器后，前端会自动连接到 `http://localhost:3001`
   - 上传图片会调用 DashScope API 进行真实的AI分析

2. **API调用流程**：
   ```
   前端上传图片 
   → 后端接收 (http://localhost:3001/api/analyze-photos)
   → 转换为base64
   → 调用 DashScope API
   → 返回分析结果
   → 前端显示
   ```

3. **查看API调用日志**：
   - 服务器控制台会显示详细的API调用日志
   - 包括请求、响应、错误信息等

## ⚠️ 常见问题

### 问题1：端口被占用
```
Error: listen EADDRINUSE: address already in use :::3001
```
**解决**：
```bash
# 查找占用端口的进程
netstat -ano | findstr :3001
# 结束进程（替换PID为实际进程ID）
taskkill /PID <PID> /F
```

### 问题2：依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
npm install
```

### 问题3：API Key无效
- 检查 `.env` 文件中的 `DASHSCOPE_API_KEY` 是否正确
- 确认API Key没有过期
- 检查阿里云账户余额

### 问题4：没有调用API
**可能原因**：
1. 服务器没有启动 → 运行 `npm start`
2. 前端连接错误 → 检查浏览器控制台
3. API Key配置错误 → 检查 `.env` 文件

## 🔍 调试技巧

1. **查看服务器日志**：
   - 服务器控制台会显示所有API调用
   - 包括 "调用DashScope API..." 等信息

2. **查看前端日志**：
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 查看 Network 标签的请求

3. **测试API连接**：
   ```bash
   # 使用curl测试
   curl http://localhost:3001/health
   ```

## 📊 API消耗查看

1. 登录阿里云控制台
2. 进入 DashScope 服务
3. 查看"用量统计"或"账单明细"
4. 可以看到API调用次数和消耗

## 🎯 下一步

1. 启动服务器：`cd server && npm start`
2. 打开前端页面
3. 点击"拍照检测"
4. 上传图片测试
5. 查看服务器控制台的API调用日志

如果看到 "调用DashScope API..." 和 "DashScope API响应状态: 200"，说明API调用成功！
















