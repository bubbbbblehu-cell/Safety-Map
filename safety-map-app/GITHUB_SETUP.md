# GitHub 仓库创建指南

## 方法一：使用 GitHub 网页界面（推荐）

### 步骤 1: 在 GitHub 上创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `safety-map-app` 或你喜欢的名称
   - **Description**: `女性安全地图应用 - 显示用户评价安全酒店的热力图`
   - **Visibility**: 选择 Public（公开）或 Private（私有）
   - **不要**勾选 "Initialize this repository with a README"（我们已经有了）
3. 点击 "Create repository"

### 步骤 2: 在本地初始化 Git 并推送

打开 PowerShell 或命令提示符，执行以下命令：

```powershell
# 进入项目目录
cd C:\Users\Hu\safety-map-app

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "Initial commit: 女性安全地图应用"

# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/safety-map-app.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 方法二：使用 GitHub CLI（如果已安装）

如果你安装了 GitHub CLI (`gh`)，可以使用以下命令：

```powershell
cd C:\Users\Hu\safety-map-app

# 初始化 Git
git init
git add .
git commit -m "Initial commit: 女性安全地图应用"

# 创建 GitHub 仓库并推送
gh repo create safety-map-app --public --source=. --remote=origin --push
```

## 方法三：使用 GitHub Desktop

1. 下载并安装 GitHub Desktop: https://desktop.github.com/
2. 打开 GitHub Desktop
3. 点击 "File" → "Add Local Repository"
4. 选择 `C:\Users\Hu\safety-map-app`
5. 点击 "Publish repository" 按钮
6. 填写仓库信息并发布

## 安装 Git（如果未安装）

如果系统没有安装 Git，请：

1. 访问 https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装完成后重启终端
4. 然后按照方法一执行

## 验证推送

推送成功后，访问你的 GitHub 仓库页面，应该能看到所有项目文件。

## 后续更新代码

以后更新代码时，使用以下命令：

```powershell
git add .
git commit -m "描述你的更改"
git push
```
