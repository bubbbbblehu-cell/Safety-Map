# Vercel 部署指南

使用 Vercel 部署后，您可以实时看到修改内容。Vercel 提供了多种实时预览方式。

## 🚀 部署方式

### 方式一：通过 Vercel CLI（推荐 - 实时预览）

这是最快的方式，支持实时预览修改：

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **启动开发服务器（实时预览）**
   ```bash
   vercel dev
   ```
   
   这会启动一个本地开发服务器，支持：
   - ✅ 实时预览修改（保存文件后自动刷新）
   - ✅ 本地预览地址（通常是 http://localhost:3000）
   - ✅ 热重载功能

4. **部署到生产环境**
   ```bash
   vercel
   ```
   
   首次部署会询问一些问题：
   - Set up and deploy? **Yes**
   - Which scope? 选择你的账户
   - Link to existing project? **No**（首次部署）
   - Project name? 输入项目名称（如：safety-map）
   - Directory? **preview**（或直接回车）
   - Override settings? **No**

---

### 方式二：通过 GitHub 集成（自动部署）

每次推送到 GitHub 都会自动部署：

1. **初始化 Git 仓库**（如果还没有）
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **创建 GitHub 仓库**
   - 在 GitHub 上创建新仓库
   - 不要初始化 README、.gitignore 或 license

3. **连接本地仓库到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

4. **在 Vercel 中导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 配置：
     - Framework Preset: **Other**
     - Root Directory: **preview**（或留空）
     - Build Command: 留空（静态文件）
     - Output Directory: 留空
   - 点击 "Deploy"

5. **自动部署**
   - 每次 `git push` 都会自动触发部署
   - Vercel 会为每次提交创建预览链接
   - 主分支的部署会自动更新生产环境

---

### 方式三：通过 Vercel Dashboard（拖拽部署）

最简单的方式，适合快速测试：

1. **访问 Vercel Dashboard**
   - 登录 [vercel.com](https://vercel.com)
   - 点击 "Add New Project"

2. **选择部署方式**
   - 选择 "Import Git Repository"（推荐）
   - 或选择 "Browse" 直接上传 `preview` 文件夹

3. **配置项目**
   - Framework Preset: **Other**
   - Root Directory: **preview**
   - 其他设置保持默认

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成

---

## 🔄 实时预览功能

### 1. 本地实时预览（`vercel dev`）

使用 `vercel dev` 命令启动本地开发服务器：

```bash
vercel dev
```

**特点：**
- ✅ 保存文件后自动刷新浏览器
- ✅ 支持热重载
- ✅ 本地预览地址：http://localhost:3000
- ✅ 模拟 Vercel 生产环境

### 2. 预览部署（Preview Deployments）

每次推送到 GitHub 都会创建预览部署：

**特点：**
- ✅ 每个 Git 提交都有独立的预览链接
- ✅ 可以在部署前测试更改
- ✅ 团队成员可以访问预览链接
- ✅ 自动生成，无需手动操作

**查看预览：**
- 在 Vercel Dashboard 中查看
- 或在 GitHub Pull Request 中查看（如果配置了）

### 3. 生产环境自动更新

推送到主分支（main/master）会自动更新生产环境：

**特点：**
- ✅ 自动部署最新代码
- ✅ 零停机时间部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速

---

## 📝 快速开始（推荐流程）

### 第一次部署：

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 按照提示完成配置
```

### 日常开发（实时预览）：

```bash
# 启动本地开发服务器（实时预览）
vercel dev

# 在浏览器中打开 http://localhost:3000
# 修改文件后，浏览器会自动刷新
```

### 部署更新：

```bash
# 方式1: 直接部署
vercel

# 方式2: 推送到 GitHub（如果已连接）
git add .
git commit -m "Update features"
git push
# Vercel 会自动部署
```

---

## 🎯 实时预览的优势

1. **即时反馈**
   - 保存文件后立即看到效果
   - 无需手动刷新浏览器

2. **多设备测试**
   - 本地预览可以通过局域网访问
   - 预览部署链接可以在任何设备上访问

3. **团队协作**
   - 分享预览链接给团队成员
   - 在合并代码前测试更改

4. **版本管理**
   - 每个提交都有独立的预览链接
   - 可以对比不同版本的效果

---

## ⚙️ 配置说明

项目已包含 `vercel.json` 配置文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "preview/index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/preview/$1"
    }
  ]
}
```

这个配置告诉 Vercel：
- 使用静态文件部署
- 从 `preview` 目录提供文件
- 所有路由都指向 `index.html`

---

## 🔗 获取部署链接

部署完成后，Vercel 会提供：

1. **生产环境链接**
   - 格式：`https://your-project.vercel.app`
   - 主分支的部署会自动更新这个链接

2. **预览链接**
   - 格式：`https://your-project-xxx.vercel.app`
   - 每次部署都有唯一的预览链接

---

## 💡 提示

1. **免费额度**
   - Vercel 免费版支持：
     - 无限预览部署
     - 100GB 带宽/月
     - 自动 HTTPS
     - 全球 CDN

2. **自定义域名**
   - 可以在 Vercel Dashboard 中添加自定义域名
   - 支持自动 SSL 证书

3. **环境变量**
   - 如果需要配置环境变量，在 Dashboard 中设置
   - 或在 `vercel.json` 中配置

---

## 🐛 常见问题

### Q: 修改后看不到更新？
A: 
- 确保已保存文件
- 如果使用 `vercel dev`，检查终端是否有错误
- 如果使用 GitHub 部署，确保已推送到 GitHub

### Q: 如何查看部署日志？
A: 
- 在 Vercel Dashboard 中点击项目
- 查看 "Deployments" 标签页
- 点击具体的部署查看日志

### Q: 如何回滚到之前的版本？
A: 
- 在 Vercel Dashboard 中
- 找到之前的部署
- 点击 "..." 菜单
- 选择 "Promote to Production"

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Vercel CLI 文档：https://vercel.com/docs/cli
- 社区支持：https://github.com/vercel/vercel/discussions

现在您可以开始使用 Vercel 进行实时预览了！🎉
