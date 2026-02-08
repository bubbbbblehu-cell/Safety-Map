# Vercel 部署空白问题解决方案

## 问题原因

Vercel 部署后显示空白，通常是因为配置问题。已修复 `vercel.json` 配置。

## 解决方案

### 方案一：使用修复后的配置（推荐）

已更新 `vercel.json` 为正确的配置。现在需要：

1. **提交更改到 GitHub**
   ```bash
   git add vercel.json
   git commit -m "修复 Vercel 部署配置"
   git push
   ```

2. **在 Vercel Dashboard 中设置根目录**
   - 访问 Vercel Dashboard
   - 进入项目设置（Settings）
   - 找到 "Root Directory"
   - 设置为：`preview`
   - 保存设置
   - 重新部署

### 方案二：直接在 Vercel Dashboard 配置（最简单）

如果方案一不行，直接在 Dashboard 配置：

1. **访问 Vercel Dashboard**
   - 进入你的项目
   - 点击 "Settings"

2. **配置项目设置**
   - **Root Directory**: `preview`
   - **Framework Preset**: `Other`
   - **Build Command**: 留空
   - **Output Directory**: 留空（或 `.`）
   - **Install Command**: 留空

3. **重新部署**
   - 点击 "Deployments"
   - 找到最新的部署
   - 点击 "..." → "Redeploy"

### 方案三：将 preview 目录内容移到根目录

如果以上方案都不行，可以：

1. **将 preview/index.html 复制到根目录**
   ```bash
   cp preview/index.html ./index.html
   ```

2. **更新 vercel.json**
   ```json
   {
     "version": 2,
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **提交并推送**
   ```bash
   git add .
   git commit -m "移动预览文件到根目录"
   git push
   ```

## 验证部署

部署成功后，应该能看到：
- ✅ 城市选择页面正常显示
- ✅ 地图可以正常加载
- ✅ 所有功能正常工作

## 常见问题

### Q: 还是空白怎么办？
A: 
1. 检查浏览器控制台（F12）是否有错误
2. 检查 Vercel 部署日志
3. 确认 `preview/index.html` 文件存在且内容正确

### Q: 如何查看部署日志？
A:
1. 在 Vercel Dashboard 中
2. 点击 "Deployments"
3. 点击具体的部署
4. 查看 "Build Logs" 和 "Runtime Logs"

### Q: 如何清除缓存？
A:
1. 在部署页面点击 "..." 菜单
2. 选择 "Redeploy"
3. 或使用 "Clear Build Cache" 选项

## 推荐步骤

1. ✅ 已更新 `vercel.json` 配置
2. 在 Vercel Dashboard 设置 Root Directory 为 `preview`
3. 重新部署项目
4. 检查是否正常显示

如果还有问题，请检查：
- 浏览器控制台的错误信息
- Vercel 部署日志
- `preview/index.html` 文件是否完整
