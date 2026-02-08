# 项目结构说明

## 目录结构

```
safety-map-app/
├── src/                          # 源代码目录
│   ├── screens/                  # 页面组件
│   │   ├── CitySelectionScreen.js    # 首次启动城市选择页面
│   │   ├── MapScreen.js              # 主地图页面（含热力图）
│   │   └── CitySwitchScreen.js       # 城市切换模态组件
│   ├── components/               # 可复用组件（预留）
│   ├── constants/                # 常量配置
│   │   └── cities.js                 # 城市数据配置
│   ├── data/                     # 数据文件
│   │   └── mockHotelData.js          # 模拟酒店数据生成器
│   └── utils/                    # 工具函数（预留）
├── App.js                        # 应用主入口，处理导航逻辑
├── index.js                      # React Native 注册入口
├── package.json                  # 项目依赖配置
├── babel.config.js               # Babel 转译配置
├── metro.config.js               # Metro 打包配置
├── .gitignore                    # Git 忽略文件
├── README.md                     # 项目说明文档
├── SETUP.md                      # 快速设置指南
└── PROJECT_STRUCTURE.md           # 本文件

```

## 核心文件说明

### App.js
- 应用主入口
- 处理首次启动检测
- 配置导航结构
- 管理城市选择流程

### src/screens/CitySelectionScreen.js
- 首次启动时显示
- 按国家分组显示城市
- 选择后保存到本地存储

### src/screens/MapScreen.js
- 主地图页面
- 显示热力图（使用 Circle 组件模拟）
- 显示酒店标记点
- 支持切换热力图显示/隐藏

### src/screens/CitySwitchScreen.js
- 城市切换按钮组件
- 模态框形式显示城市列表
- 切换后更新地图

### src/constants/cities.js
- 定义所有支持的城市
- 包含城市坐标和区域信息
- 按国家分组

### src/data/mockHotelData.js
- 生成模拟酒店数据
- 生成热力图数据点
- 可根据城市 ID 生成不同数据

## 数据流

1. **首次启动流程**:
   - App.js 检测首次启动
   - 显示 CitySelectionScreen
   - 用户选择城市 → 保存到 AsyncStorage
   - 导航到 MapScreen

2. **非首次启动流程**:
   - App.js 检测非首次启动
   - 直接导航到 MapScreen
   - MapScreen 从 AsyncStorage 读取保存的城市

3. **城市切换流程**:
   - 点击右上角"切换城市"按钮
   - 显示 CitySwitchScreen 模态框
   - 选择新城市 → 更新 AsyncStorage
   - 更新 MapScreen 参数，重新加载数据

## 扩展建议

### 添加新城市
在 `src/constants/cities.js` 的 `CITIES` 数组中添加新城市对象。

### 连接真实 API
1. 创建 `src/services/api.js`
2. 替换 `src/data/mockHotelData.js` 中的数据生成逻辑
3. 在 MapScreen 中调用 API 获取数据

### 添加用户评价功能
1. 创建酒店详情页面
2. 添加评价表单组件
3. 实现数据提交到后端

### 优化热力图
- 使用专业的热力图库（如 react-native-heatmap）
- 或使用 WebView 加载基于 Web 的热力图库
