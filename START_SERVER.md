# 启动本地开发服务器

## 方法1：使用已有的server目录

1. 进入server目录：
```bash
cd server
```

2. 安装依赖（如果还没安装）：
```bash
npm install
```

3. 创建.env文件（复制env.example）：
```bash
cp ../env.example .env
```

4. 编辑.env文件，填入你的配置：
- COZE_API_KEY（可选，如果没有会使用模拟分析）
- 其他配置项

5. 启动服务器：
```bash
npm start
```

或者使用开发模式（自动重启）：
```bash
npm run dev
```

6. 服务器将运行在 http://localhost:3001

## 方法2：快速启动（PowerShell）

在项目根目录运行：
```powershell
cd server; npm install; npm start
```

## 验证服务器是否运行

打开浏览器访问：http://localhost:3001/health

如果看到 `{"status":"ok","timestamp":"..."}` 说明服务器运行成功！

## Vercel部署

项目已配置好Vercel Serverless Functions：

1. 确保 `api/` 目录存在
2. 确保 `vercel.json` 配置正确
3. 部署到Vercel：
```bash
vercel --prod
```

4. Vercel会自动：
   - 将 `/api/*` 路由到serverless函数
   - 处理CORS跨域问题
   - 提供全球CDN加速

## 注意事项

- **本地开发**：前端会自动连接到 `http://localhost:3001`
- **Vercel部署**：前端会自动使用相对路径 `/api/*`，无需修改代码
- **COZE API**：如果没有配置API Key，会使用模拟分析（仍然可以正常工作）
















