# 女性安全地图应用

一款专为女性用户设计的移动应用，通过热力图展示用户评价的安全酒店信息，帮助用户选择安全的住宿地点。

## 功能特性

- 🗺️ **安全地图热力图**：直观展示各区域酒店的安全评分分布
- 🌍 **多城市支持**：首期支持西双版纳、贵阳、曼谷、上海、那不勒斯
- 🔄 **城市切换**：轻松切换查看不同城市的安全地图
- 📍 **酒店标记**：显示酒店位置和安全评分
- 🎨 **可视化图例**：清晰的颜色编码表示安全等级

## 技术栈

- **React Native** 0.72.6
- **React Navigation** - 页面导航
- **React Native Maps** - 地图功能
- **AsyncStorage** - 本地数据存储

## 项目结构

```
safety-map-app/
├── src/
│   ├── screens/          # 页面组件
│   │   ├── CitySelectionScreen.js  # 城市选择页面
│   │   ├── MapScreen.js            # 地图主页面
│   │   └── CitySwitchScreen.js      # 城市切换组件
│   ├── components/       # 通用组件
│   ├── constants/        # 常量配置
│   │   └── cities.js     # 城市数据
│   ├── data/             # 数据文件
│   │   └── mockHotelData.js  # 模拟酒店数据
│   └── utils/            # 工具函数
├── App.js                # 应用入口
├── index.js              # 注册入口
└── package.json          # 项目配置
```

## 安装和运行

### 前置要求

- Node.js >= 16
- React Native 开发环境
- Android Studio (Android 开发)
- Xcode (iOS 开发，仅 macOS)

### 安装步骤

1. **安装依赖**
   ```bash
   cd safety-map-app
   npm install
   ```

2. **iOS 安装额外依赖** (仅 macOS)
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **运行应用**

   Android:
   ```bash
   npm run android
   ```

   iOS:
   ```bash
   npm run ios
   ```

## 配置说明

### Android 配置

1. 在 `android/app/src/main/AndroidManifest.xml` 中添加 Google Maps API Key:
   ```xml
   <application>
     <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
   </application>
   ```

2. 确保已安装 Google Play Services

### iOS 配置

1. 在 `ios/YourApp/Info.plist` 中添加 Google Maps API Key:
   ```xml
   <key>GMSApiKey</key>
   <string>YOUR_GOOGLE_MAPS_API_KEY</string>
   ```

2. 在 Xcode 中配置 Bundle Identifier 和 Signing

## 使用说明

1. **首次启动**：应用会显示城市选择页面，选择要查看的城市
2. **查看地图**：选择城市后进入地图页面，可以看到：
   - 热力图显示安全酒店分布
   - 标记点显示具体酒店位置
   - 点击标记查看酒店详情
3. **切换城市**：点击右上角"切换城市"按钮，选择其他城市

## 支持的城市

- 🇨🇳 **中国**
  - 西双版纳
  - 贵阳
  - 上海
- 🇹🇭 **泰国**
  - 曼谷
- 🇮🇹 **意大利**
  - 那不勒斯

## 数据说明

当前版本使用模拟数据。在实际部署中，需要：

1. 连接后端 API 获取真实的酒店数据
2. 实现用户评价系统
3. 实现数据实时更新

## 推送到 GitHub

### 快速方式（使用脚本）

1. 确保已安装 Git
2. 运行 PowerShell 脚本：
   ```powershell
   .\setup-github.ps1
   ```
3. 按照提示操作

### 手动方式

详细步骤请查看 [GITHUB_SETUP.md](./GITHUB_SETUP.md)

## 开发计划

- [ ] 用户登录/注册功能
- [ ] 酒店详情页面
- [ ] 用户评价功能
- [ ] 数据筛选功能（按评分、价格等）
- [ ] 路线规划功能
- [ ] 离线地图支持
- [ ] 推送通知

## 注意事项

- 需要配置 Google Maps API Key 才能正常显示地图
- 热力图功能使用 Circle 组件模拟实现
- 建议在真机上测试以获得最佳体验

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。
test