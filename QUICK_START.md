# 快速启动指南

## 🚀 5分钟快速开始

### 方式一：仅前端预览（最简单）

1. **打开预览文件**
   - 直接双击 `preview/index.html`
   - 或在浏览器中打开

2. **功能说明**
   - ✅ 可以查看地图功能
   - ✅ 可以测试UI交互
   - ⚠️ 拍照检测功能需要后端支持

### 方式二：完整功能（前端 + 后端）

#### 步骤1：启动后端服务器

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 启动服务器
npm start
```

看到以下信息表示启动成功：
```
🚀 服务器运行在 http://localhost:3001
📁 上传目录: .../server/uploads
```

#### 步骤2：打开前端页面

1. 使用本地服务器打开 `preview/index.html`
   ```bash
   # 方法1：使用Python
   python -m http.server 8000
   
   # 方法2：使用Node.js
   npx http-server preview -p 8000
   ```

2. 或直接双击 `preview/index.html`（某些功能可能受限）

#### 步骤3：测试拍照检测功能

1. 点击"拍照检测"标签
2. 点击"开启守护"按钮
3. 选择检测部位（可多选）
4. 点击"确认并开始自查"
5. 完成自查引导
6. 上传照片
7. 提交AI分析

## 📝 配置说明

### 修改API地址

如果后端运行在不同的地址，需要修改 `preview/index.html`：

找到以下代码：
```javascript
const API_CONFIG = {
    current: 'http://localhost:3001'  // 修改这里
};
```

### 生产环境配置

部署到生产环境时：

1. **修改API地址**
   ```javascript
   const API_CONFIG = {
       current: 'https://your-api-domain.com'
   };
   ```

2. **配置CORS**
   在 `server/server.js` 中确保CORS配置正确：
   ```javascript
   app.use(cors({
       origin: 'https://your-frontend-domain.com'
   }));
   ```

## 🐛 常见问题

### Q: 后端启动失败？
A: 
- 检查Node.js版本（需要 >= 16）
- 检查端口3001是否被占用
- 查看错误日志

### Q: 照片上传失败？
A: 
- 确认后端服务器正在运行
- 检查API地址配置是否正确
- 查看浏览器控制台错误信息

### Q: 分析结果不显示？
A: 
- 检查网络连接
- 查看浏览器控制台
- 确认后端API返回了正确格式的数据

## 📚 更多信息

- 详细文档：查看 `README.md`
- API文档：查看 `server/README.md`
- 数据库设计：查看 `supabase/README.md`
