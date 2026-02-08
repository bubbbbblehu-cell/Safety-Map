# 后端API服务器

女性安全地图应用的后端API服务器，提供照片上传、AI分析等功能。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置相关参数。

### 启动服务器

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

服务器将在 `http://localhost:3001` 启动

## 📡 API接口

### 1. 获取检测部位列表
```http
GET /api/detection-types
```

### 2. 获取特定检测部位详情
```http
GET /api/detection-types/:type
```

### 3. 上传并分析单张照片
```http
POST /api/analyze-photo
Content-Type: multipart/form-data

参数:
- photo: 图片文件
- detectionType: 检测部位类型（可选）
- hotelId: 酒店ID（可选）
- userId: 用户ID（可选）
```

### 4. 批量上传和分析照片
```http
POST /api/analyze-photos
Content-Type: multipart/form-data

参数:
- photos[]: 图片文件数组（最多10张）
- detectionTypes[]: 对应的检测部位类型数组
```

### 5. 获取分析结果
```http
GET /api/analysis/:id
```

### 6. 健康检查
```http
GET /health
```

## 📁 目录结构

```
server/
├── server.js          # 主服务器文件
├── package.json       # 依赖配置
├── .env.example      # 环境变量示例
├── uploads/          # 上传文件目录（自动创建）
└── results/          # 分析结果目录（自动创建）
```

## 🔧 配置说明

### 环境变量

- `PORT`: 服务器端口（默认：3001）
- `MAX_FILE_SIZE`: 最大文件大小（默认：10MB）
- `UPLOAD_DIR`: 上传目录（默认：./uploads）

### 文件上传限制

- 单文件最大：10MB
- 支持格式：jpeg, jpg, png, gif, webp
- 批量上传：最多10张

## 🔌 集成真实AI服务

当前版本使用模拟AI分析。要集成真实AI服务，修改 `simulateAIAnalysis` 函数：

```javascript
async function simulateAIAnalysis(imagePath, detectionType) {
    // 调用真实的AI API
    const response = await axios.post(process.env.AI_API_URL, {
        image: fs.readFileSync(imagePath),
        detectionType: detectionType
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.AI_API_KEY}`
        }
    });
    
    return response.data;
}
```

## 🐳 Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

构建和运行：
```bash
docker build -t safety-map-api .
docker run -p 3001:3001 safety-map-api
```

## 📝 注意事项

1. **文件存储**：当前使用文件系统存储，生产环境建议使用云存储（如AWS S3、阿里云OSS）
2. **数据库**：当前使用JSON文件存储结果，生产环境建议使用数据库（如PostgreSQL、MongoDB）
3. **AI服务**：需要集成真实的AI分析服务
4. **安全性**：生产环境需要添加身份验证、速率限制等安全措施
