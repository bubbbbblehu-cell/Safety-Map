# Vercel 预览界面问题解决方案

## 问题
Vercel 显示的是 React Native 代码（`index.js`），而不是预览页面（`preview/index.html`）。

## 解决方案

### 方案一：在 Vercel Dashboard 设置根目录（推荐）

1. **访问 Vercel Dashboard**
   - 进入你的项目：https://vercel.com/dashboard
   - 点击项目名称

2. **设置根目录**
   - 点击 **Settings**（设置）
   - 在 **General** 部分找到 **Root Directory**
   - 设置为：`preview`
   - 点击 **Save**

3. **重新部署**
   - 点击 **Deployments**
   - 找到最新的部署
   - 点击 **"..."** → **Redeploy**
   - 或者推送新的提交触发自动部署

### 方案二：将预览文件移到根目录（最简单）

如果方案一不行，可以直接将预览文件复制到根目录：

1. **复制文件**
   ```bash
   cp preview/index.html ./index.html
   ```

2. **更新 .gitignore**（如果需要保留两个文件）

3. **提交并推送**
   ```bash
   git add index.html
   git commit -m "添加根目录 index.html 用于 Vercel 部署"
   git push
   ```

4. **更新 vercel.json**
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

### 方案三：使用 vercel.json 明确配置（已更新）

已更新 `vercel.json` 配置，但还需要在 Dashboard 中设置根目录。

## 立即执行的步骤

### 步骤 1：提交更新的配置
```bash
git add vercel.json
git commit -m "修复 Vercel 配置，指定 preview 目录"
git push
```

### 步骤 2：在 Vercel Dashboard 设置
1. 进入项目 Settings
2. Root Directory → 设置为 `preview`
3. 保存并重新部署

### 步骤 3：验证
访问你的 Vercel URL，应该看到：
- ✅ 城市选择页面
- ✅ 地图功能正常
- ✅ 所有新功能可用

## 如果还是不行

检查以下几点：

1. **确认文件已推送**
   ```bash
   git log --oneline -5
   # 确认 vercel.json 和 preview/index.html 已提交
   ```

2. **检查 Vercel 部署日志**
   - 在 Vercel Dashboard → Deployments
   - 点击最新的部署
   - 查看 Build Logs
   - 确认没有错误

3. **清除浏览器缓存**
   - 按 Ctrl+Shift+R（Windows）或 Cmd+Shift+R（Mac）
   - 强制刷新页面

4. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签页
   - 查看是否有错误信息

## 推荐方案

**最简单有效的方式：**
1. 将 `preview/index.html` 复制到根目录
2. 提交并推送
3. Vercel 会自动重新部署并显示正确的页面

这样就不需要在 Dashboard 中设置根目录了。
