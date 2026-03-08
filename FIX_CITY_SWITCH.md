## 城市切换问题修复方案

### 问题分析
当已经在地图页面时，切换城市后 `switchPage('mapPage')` 不会重新初始化地图，导致地图仍然显示旧城市的内容。

### 修复方法

在 `selectCity` 函数中（大约第 1893 行），找到这段代码：

```javascript
// 强制切换到地图页面，使用稍长的延迟确保模态框已关闭
setTimeout(() => {
    console.log('切换到地图页面，当前城市:', currentCity);
    // 只调用 switchPage，它会自动调用 initMap
    switchPage('mapPage');
}, 100);
```

替换为：

```javascript
// 🔥 关键修复：强制重新初始化地图
// 如果不在地图页面，先切换到地图页面
if (currentPage !== 'mapPage') {
    console.log('📍 当前不在地图页面，先切换到地图页面');
    switchPage('mapPage');
} else {
    // 如果已经在地图页面，直接重新初始化地图
    console.log('📍 已在地图页面，直接重新初始化地图');
    setTimeout(() => {
        initMap(currentCity.id);
        updateStats();
    }, 100);
}
```

### 原理说明
- 如果当前不在地图页面（`currentPage !== 'mapPage'`），调用 `switchPage('mapPage')` 切换到地图页面，这会自动调用 `initMap`
- 如果已经在地图页面，直接调用 `initMap(currentCity.id)` 重新初始化地图，这样可以确保地图更新到新城市的位置和数据

### 测试步骤
1. 选择西双版纳
2. 点击"切换城市"
3. 选择贵阳
4. 地图应该移动到贵阳的位置，并显示"贵阳 暂无酒店数据"的提示

