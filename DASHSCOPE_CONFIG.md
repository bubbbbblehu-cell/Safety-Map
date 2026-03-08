# 阿里云DashScope AI配置完成

## ✅ 已完成的配置

1. **更新了 `env.example`**：添加了DashScope配置
2. **更新了 `server/server.js`**：
   - 替换Coze API为阿里云DashScope API
   - 使用OpenAI兼容格式调用API
   - 使用 `qwen-vl-max` 视觉模型进行图片分析
3. **创建了 `create-env.bat`**：快速生成.env配置文件的脚本

## 🚀 快速启动步骤

### 方法1：使用批处理脚本（推荐）

1. 双击运行 `create-env.bat`
2. 脚本会自动在 `server/` 目录创建 `.env` 文件
3. 然后运行：
```bash
cd server
npm install
npm start
```

### 方法2：手动创建

1. 在 `server/` 目录创建 `.env` 文件
2. 复制以下内容：
```
SUPABASE_URL=https://hmmruoankhohowlzajll.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=sk-83a34f650e484b03a17710d87b28a725
PORT=3001
```
3. 保存后运行：
```bash
cd server
npm install
npm start
```

## 📝 API配置说明

- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **API Key**: `sk-83a34f650e484b03a17710d87b28a725`
- **模型**: `qwen-vl-max` (通义千问视觉大模型)
- **格式**: OpenAI兼容格式

## 🔧 工作原理

1. 前端上传图片到后端
2. 后端将图片转换为base64
3. 调用DashScope API进行AI视觉分析
4. AI返回JSON格式的安全评估结果
5. 后端解析并返回给前端展示

## ⚠️ 注意事项

- API Key已配置，可以直接使用真实的AI分析
- 如果API调用失败，会自动回退到模拟分析
- 图片大小限制：10MB
- 支持格式：jpeg, jpg, png, gif, webp

## 🌐 Vercel部署

本地测试通过后，可以部署到Vercel：
```bash
vercel --prod
```

Vercel会自动使用 `api/analyze-photos.js` 作为serverless函数。
















