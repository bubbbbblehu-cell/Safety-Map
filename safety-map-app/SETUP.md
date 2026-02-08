# 快速设置指南

## 1. 安装 Node.js 和依赖

确保已安装 Node.js (>= 16)

```bash
npm install
```

## 2. 配置 Google Maps API Key

### Android

1. 获取 Google Maps API Key: https://console.cloud.google.com/
2. 编辑 `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
</application>
```

### iOS

1. 编辑 `ios/YourApp/Info.plist`:

```xml
<key>GMSApiKey</key>
<string>YOUR_API_KEY_HERE</string>
```

## 3. 运行应用

### Android

```bash
npm run android
```

确保 Android 模拟器正在运行或已连接真机。

### iOS (仅 macOS)

```bash
cd ios
pod install
cd ..
npm run ios
```

## 4. 常见问题

### Android: 找不到设备
- 确保已启用 USB 调试
- 运行 `adb devices` 检查设备连接

### iOS: Pod 安装失败
- 运行 `cd ios && pod repo update && pod install`

### 地图不显示
- 检查 API Key 是否正确配置
- 确保 API Key 已启用 Maps SDK for Android/iOS

## 5. 开发建议

- 使用真机测试以获得最佳体验
- 热力图效果在真机上更明显
- 建议使用 Expo Go 进行快速原型测试（需要调整配置）
