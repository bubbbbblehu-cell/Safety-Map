# 预览指南

本项目提供了多种预览方式，您可以根据自己的需求选择合适的方法。

## 🌐 方式一：Web 浏览器预览（最简单）

这是最快最简单的预览方式，适合快速查看应用界面和功能。

### 步骤：

1. **直接打开预览文件**
   - 在文件管理器中找到 `preview/index.html` 文件
   - 双击打开，会在默认浏览器中显示

2. **或者使用命令行**
   ```powershell
   cd d:\Safety-Map
   explorer preview\index.html
   ```

3. **功能说明**
   - ✅ 可以查看城市选择页面
   - ✅ 可以查看地图界面布局
   - ✅ 可以测试基本交互功能
   - ⚠️ 注意：Web预览版本使用Leaflet地图，与React Native版本略有差异

---

## 📱 方式二：React Native 模拟器/真机预览（完整功能）

这是最完整的预览方式，可以体验所有功能，包括地图、定位等原生功能。

### 前置要求：

- ✅ Node.js >= 16
- ✅ React Native CLI
- ✅ Android Studio（Android预览）或 Xcode（iOS预览，仅macOS）

### 安装步骤：

1. **安装项目依赖**
   ```bash
   npm install
   ```

2. **iOS 额外步骤**（仅 macOS）
   ```bash
   cd ios
   pod install
   cd ..
   ```

### 运行应用：

#### Android 预览：
```bash
npm run android
```
或
```bash
npx react-native run-android
```

#### iOS 预览（仅 macOS）：
```bash
npm run ios
```
或
```bash
npx react-native run-ios
```

### 启动 Metro Bundler：

如果应用没有自动启动，需要单独启动 Metro：
```bash
npm start
```
或
```bash
npx react-native start
```

---

## 🔧 方式三：使用 Expo Go（如果配置了Expo）

如果项目配置了Expo，可以使用Expo Go应用预览：

1. **安装 Expo CLI**（如果还没有）
   ```bash
   npm install -g expo-cli
   ```

2. **启动开发服务器**
   ```bash
   npx expo start
   ```

3. **扫描二维码**
   - 在手机上安装 Expo Go 应用
   - 扫描终端中显示的二维码
   - 应用会在手机上运行

---

## 📋 预览功能对比

| 功能 | Web预览 | React Native预览 |
|------|---------|------------------|
| 城市选择 | ✅ | ✅ |
| 地图显示 | ✅ (Leaflet) | ✅ (Google Maps) |
| 热力图 | ✅ | ✅ |
| 酒店标记 | ✅ | ✅ |
| 筛选功能 | ✅ | ✅ |
| 收藏功能 | ✅ | ✅ |
| 评价功能 | ✅ | ✅ |
| 个人中心 | ✅ | ✅ |
| 定位功能 | ⚠️ 受限 | ✅ |
| 原生体验 | ❌ | ✅ |

---

## 🚀 快速开始（推荐）

**最快的方式：**
1. 直接打开 `preview/index.html` 文件
2. 在浏览器中查看应用界面

**完整功能体验：**
1. 确保已安装 Node.js 和 React Native 环境
2. 运行 `npm install`
3. 运行 `npm run android` 或 `npm run ios`

---

## ⚠️ 注意事项

1. **Google Maps API Key**
   - React Native版本需要配置Google Maps API Key才能显示地图
   - Web预览版本使用Leaflet，无需API Key

2. **首次运行**
   - React Native首次运行可能需要较长时间编译
   - 建议使用真机或模拟器测试以获得最佳体验

3. **数据存储**
   - 收藏和评价数据存储在本地（AsyncStorage）
   - Web预览版本使用localStorage

---

## 🐛 常见问题

### Q: Web预览中地图不显示？
A: 检查网络连接，Leaflet需要加载在线地图资源。

### Q: React Native运行失败？
A: 
- 检查Node.js版本（需要>=16）
- 确保已安装所有依赖：`npm install`
- 检查Android Studio/Xcode是否正确配置

### Q: Metro Bundler无法启动？
A: 
- 检查端口8081是否被占用
- 尝试清除缓存：`npx react-native start --reset-cache`

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Node.js版本是否符合要求
2. 所有依赖是否正确安装
3. 开发环境是否正确配置

祝您预览愉快！🎉
