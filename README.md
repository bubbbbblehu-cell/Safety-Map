# 女性安全地图应用

一款专为女性用户设计的移动应用，通过热力图展示用户评价的安全酒店信息，帮助用户选择安全的住宿地点。应用集成了AI拍照检测功能，可以智能识别酒店环境中的安全隐患。

## ✨ 功能特性

### 🗺️ 地图功能
- **安全地图热力图**：直观展示各区域酒店的安全评分分布
- **多城市支持**：首期支持西双版纳、贵阳、曼谷、上海、那不勒斯
- **城市切换**：轻松切换查看不同城市的安全地图
- **酒店标记**：显示酒店位置和安全评分
- **可视化图例**：清晰的颜色编码表示安全等级
- **评分筛选**：可按最低安全评分筛选酒店
- **酒店收藏**：收藏喜欢的酒店，方便快速查看

### 📷 AI拍照检测功能
- **多部位检测**：支持门锁、窗户、镜子、浴室、插座、路由器等6个关键部位的检测
- **智能自查引导**：提供详细的自查步骤和风险提示
- **照片上传分析**：上传照片进行AI智能分析（集成 Coze AI）
- **安全评分报告**：生成详细的安全评估报告
- **风险识别**：自动识别潜在安全隐患
- **Coze AI集成**：使用 Coze Bot (`7588350694353649679`) 进行智能分析

### 👤 个人中心
- **收藏管理**：查看和管理收藏的酒店
- **评价记录**：查看自己的评价历史
- **个人资料**：管理个人信息

## 🛠️ 技术栈

### 前端
- **HTML5 + CSS3 + JavaScript** - 纯前端实现
- **Leaflet Maps** - 地图功能
- **LocalStorage** - 本地数据存储

### 后端
- **Node.js + Express** - RESTful API服务器
- **Multer** - 文件上传处理
- **Sharp** - 图片处理和优化
- **CORS** - 跨域支持

### 数据库
- **Supabase (PostgreSQL)** - 云数据库存储
- 完整的表结构设计（见 `supabase/` 目录）
- 自动从数据库加载酒店安全评分数据
- 支持离线回退到本地模拟数据

## 📁 项目结构

```
Safety-Map/
├── preview/              # Web预览版本
│   └── index.html        # 主预览文件
├── server/               # 后端API服务器
│   ├── server.js        # Express服务器主文件
│   ├── package.json     # 后端依赖配置
│   ├── uploads/         # 上传文件目录（自动创建）
│   └── results/         # 分析结果目录（自动创建）
├── src/                 # React Native源代码
│   ├── screens/         # 页面组件
│   ├── components/      # 通用组件
│   ├── constants/       # 常量配置
│   ├── data/            # 数据文件
│   ├── config/          # 配置文件
│   │   └── supabase.js  # Supabase数据库配置
│   └── services/        # 服务层
│       └── hotelService.js  # 酒店数据服务
├── supabase/            # 数据库表结构
│   ├── schema.sql       # 数据库表结构
│   ├── rls_policies.sql # 安全策略
│   ├── seed_data.sql    # 初始数据
│   └── README.md        # 数据库文档
├── App.js               # React Native应用入口
├── index.js             # 应用注册入口
├── index.html           # Web版本入口（用于Vercel部署）
├── package.json         # 项目配置
├── env.example          # 环境变量配置示例
├── SUPABASE_SETUP.md    # Supabase配置指南
├── DATABASE_INTEGRATION.md  # 数据库集成文档
└── README.md           # 本文档
```

## 🚀 快速开始

### 方式一：Web预览（最简单）

1. **直接打开预览文件**
   ```bash
   # 在文件管理器中打开
   preview/index.html
   ```

2. **或使用本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server preview -p 8000
   ```

3. **访问**
   - 打开浏览器访问 `http://localhost:8000`

### 方式二：完整功能（前端 + 后端）

#### 1. 启动后端服务器

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 启动服务器
npm start

# 或使用开发模式（自动重启）
npm run dev
```

服务器将在 `http://localhost:3001` 启动

#### 2. 配置前端API地址

在 `preview/index.html` 中，找到以下代码并修改API地址：

```javascript
// 开发环境
const API_URL = 'http://localhost:3001';

// 生产环境（部署后）
const API_URL = 'https://your-api-domain.com';
```

#### 3. 启动前端

使用本地服务器或直接打开 `preview/index.html`

### 方式三：React Native（移动应用）

#### 1. 安装依赖
```bash
npm install
```

#### 2. 配置 Supabase 数据库（可选但推荐）

**获取 API 密钥：**
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目（ID: `hmmruoankhohowlzajll`）
3. 进入 Settings → API
4. 复制 `anon public` 密钥

**配置密钥：**
编辑 `src/config/supabase.js`，替换 `YOUR_SUPABASE_ANON_KEY`：
```javascript
const SUPABASE_ANON_KEY = '你的实际密钥';
```

详细配置步骤请参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

#### 3. iOS 安装额外依赖（仅 macOS）
```bash
cd ios
pod install
cd ..
```

#### 4. 运行应用
```bash
# Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 📡 API接口文档

### 基础URL
```
开发环境: http://localhost:3001
生产环境: https://your-api-domain.com
```

### 1. 获取检测部位列表
```http
GET /api/detection-types
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "type": "门锁",
      "question": "握住门把手摇晃，是否感觉到明显松动...",
      "risk": "门锁松动极可能是被撬动的痕迹..."
    }
  ]
}
```

### 2. 获取特定检测部位详情
```http
GET /api/detection-types/:type
```

**参数：**
- `type`: 检测部位类型（门锁、窗户、镜子、浴室、插座、路由器）

### 3. 上传并分析单张照片
```http
POST /api/analyze-photo
Content-Type: multipart/form-data
```

**请求参数：**
- `photo`: 图片文件
- `detectionType`: 检测部位类型（可选）
- `hotelId`: 酒店ID（可选）
- `userId`: 用户ID（可选）

**响应示例：**
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
      "recommendations": ["建议立即联系酒店前台"],
      "safetyScore": 2.0
    }
  }
}
```

### 4. 批量上传和分析照片
```http
POST /api/analyze-photos
Content-Type: multipart/form-data
```

**请求参数：**
- `photos[]`: 图片文件数组（最多10张）
- `detectionTypes[]`: 对应的检测部位类型数组

### 5. 获取分析结果
```http
GET /api/analysis/:id
```

**参数：**
- `id`: 分析结果ID

### 6. 健康检查
```http
GET /health
```

## 🎯 使用说明

### 地图功能

1. **首次启动**：应用会显示城市选择页面，选择要查看的城市
2. **查看地图**：选择城市后进入地图页面，可以看到：
   - 热力图显示安全酒店分布
   - 标记点显示具体酒店位置
   - 点击标记查看酒店详情
3. **筛选酒店**：点击右上角"筛选"按钮，设置最低安全评分
4. **收藏酒店**：在酒店详情弹窗中点击"收藏"按钮
5. **添加评价**：点击酒店标记，在弹窗中添加评价和评分

### 拍照检测功能

1. **选择检测部位**
   - 点击"拍照检测"页面的"开启守护"按钮
   - 选择要检测的部位（可多选）
   - 点击"确认并开始自查"

2. **安全自查**
   - 按照引导步骤进行自查
   - 回答每个部位的问题
   - 查看风险提示

3. **上传照片**
   - 完成自查后，点击"完成自查，去拍摄照片"
   - 为每个检测部位拍摄照片
   - 点击照片上传区域选择图片

4. **AI分析**
   - 上传完成后，点击"提交 AI 专家深度分析"
   - 等待分析完成
   - 查看分析结果和安全评分

## 🌍 支持的城市

- 🇨🇳 **中国**
  - 西双版纳
  - 贵阳
  - 上海
- 🇹🇭 **泰国**
  - 曼谷
- 🇮🇹 **意大利**
  - 那不勒斯

## 📊 数据库设计

项目包含完整的 Supabase 数据库表结构设计：

- **cities** - 城市表
- **hotels** - 酒店表（存储酒店安全评分数据）
- **reviews** - 评价表
- **favorites** - 收藏表
- **user_profiles** - 用户扩展信息表
- **photo_detections** - 拍照检测记录表
- **review_helpful** - 评价有用性表

### 数据库集成

应用已集成 Supabase 数据库，可以自动从数据库加载酒店安全评分数据：

- ✅ **自动加载**：打开地图时自动从数据库获取酒店数据
- ✅ **智能回退**：如果数据库连接失败，自动使用本地模拟数据
- ✅ **实时更新**：数据库中的评分更新会立即反映在地图上
- ✅ **筛选功能**：支持按城市和评分筛选酒店

**配置步骤：**
1. 安装依赖：`npm install @supabase/supabase-js`
2. 配置 API 密钥（见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)）
3. 导入酒店数据到数据库
4. 启动应用，自动从数据库加载数据

详细说明请查看：
- [supabase/README.md](./supabase/README.md) - 数据库表结构
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 配置指南
- [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) - 集成文档

## 🚢 部署说明

### Vercel部署（前端）

1. **连接GitHub仓库到Vercel**
2. **设置根目录为** `preview`（或在根目录放置 `index.html`）
3. **自动部署**：每次推送代码自动部署

详细说明请查看 `VERCEL_DEPLOY.md`

### 后端部署

#### 使用Node.js服务器

1. **安装依赖**
   ```bash
   cd server
   npm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

3. **启动服务器**
   ```bash
   npm start
   ```

#### 使用Docker（推荐）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

#### 使用云服务

- **Vercel**：支持Serverless Functions
- **Railway**：一键部署Node.js应用
- **Heroku**：传统PaaS平台
- **AWS/GCP/Azure**：云服务器部署

## 🔧 配置说明

### 前端配置

在 `preview/index.html` 中配置：

```javascript
// API地址配置
const API_URL = 'http://localhost:3001'; // 开发环境
// const API_URL = 'https://your-api.com'; // 生产环境
```

### 后端配置

在 `server/.env` 中配置：

```env
PORT=3001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Android配置

在 `android/app/src/main/AndroidManifest.xml` 中添加 Google Maps API Key:
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

### iOS配置

在 `ios/YourApp/Info.plist` 中添加 Google Maps API Key:
```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY</string>
```

## 📝 开发计划

- [x] 用户登录/注册功能
- [x] 酒店详情页面
- [x] 用户评价功能
- [x] 数据筛选功能（按评分）
- [x] AI拍照检测功能
- [x] Coze AI集成
- [ ] 路线规划功能
- [ ] 离线地图支持
- [ ] 推送通知
- [ ] 多语言支持

## ⚠️ 注意事项

1. **Google Maps API Key**
   - React Native版本需要配置Google Maps API Key才能正常显示地图
   - Web预览版本使用Leaflet，无需API Key

2. **文件上传限制**
   - 单文件最大10MB
   - 支持格式：jpeg, jpg, png, gif, webp
   - 批量上传最多10张

3. **数据存储**
   - Web版本使用LocalStorage存储收藏和评价
   - 生产环境建议使用Supabase数据库

4. **AI分析**
   - 当前版本使用模拟AI分析
   - 生产环境需要集成真实的AI服务

## 🐛 常见问题

### Q: 地图不显示？
A: 
- Web版本：检查网络连接，Leaflet需要加载在线地图资源
- React Native版本：检查Google Maps API Key配置

### Q: 照片上传失败？
A: 
- 检查文件大小是否超过10MB
- 检查文件格式是否支持
- 确认后端服务器正在运行

### Q: API请求失败？
A: 
- 检查API地址是否正确
- 检查CORS配置
- 查看浏览器控制台错误信息

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，欢迎反馈。

---

**版本**: 2.0.0  
**最后更新**: 2026-02-08
