# 从 safestay 仓库迁移文件指南

## 📋 需要迁移的文件

从 `safestay` 仓库需要迁移以下文件：
- `icon.png` - 应用图标
- `splash.png` - 开屏页图片
- `index.html` - （如果需要保留旧版本的话）

## 🚀 方法一：直接从 GitHub 下载（推荐）

### 步骤1：下载文件

1. **访问 safestay 仓库**
   - 打开：https://github.com/bubbbbblehu-cell/safestay

2. **下载文件**
   - 点击 `icon.png` → 点击 "Download" 或右键保存
   - 点击 `splash.png` → 点击 "Download" 或右键保存

3. **保存到项目**
   - 将 `icon.png` 保存到 `d:\Safety-Map\preview\` 目录
   - 将 `splash.png` 保存到 `d:\Safety-Map\preview\` 目录

### 步骤2：添加到 Git

```bash
cd d:\Safety-Map
git add preview/icon.png preview/splash.png
git commit -m "添加应用图标和开屏页图片"
git push
```

## 🔄 方法二：使用 Git 克隆后复制

### 步骤1：克隆旧仓库

```bash
# 在临时目录克隆
cd d:\
git clone https://github.com/bubbbbblehu-cell/safestay.git safestay-temp
```

### 步骤2：复制文件

```bash
# 复制文件到新仓库
copy d:\safestay-temp\icon.png d:\Safety-Map\preview\icon.png
copy d:\safestay-temp\splash.png d:\Safety-Map\preview\splash.png
```

### 步骤3：清理临时目录

```bash
# 删除临时克隆的仓库
rmdir /s d:\safestay-temp
```

### 步骤4：提交文件

```bash
cd d:\Safety-Map
git add preview/icon.png preview/splash.png
git commit -m "从safestay仓库迁移图标和开屏页"
git push
```

## 📥 方法三：使用 PowerShell 脚本（自动化）

创建一个 PowerShell 脚本来自动下载：

```powershell
# download-files.ps1
$baseUrl = "https://raw.githubusercontent.com/bubbbbblehu-cell/safestay/main"
$targetDir = "d:\Safety-Map\preview"

# 下载 icon.png
Invoke-WebRequest -Uri "$baseUrl/icon.png" -OutFile "$targetDir\icon.png"

# 下载 splash.png
Invoke-WebRequest -Uri "$baseUrl/splash.png" -OutFile "$targetDir\splash.png"

Write-Host "文件下载完成！"
```

运行脚本：
```powershell
.\download-files.ps1
```

## ✅ 验证文件

下载完成后，检查文件是否存在：

```bash
cd d:\Safety-Map\preview
dir icon.png splash.png
```

## 📝 提交更改

```bash
cd d:\Safety-Map

# 添加文件
git add preview/icon.png preview/splash.png

# 提交
git commit -m "添加应用图标和开屏页图片（从safestay仓库迁移）"

# 推送
git push
```

## 🎯 快速命令（一键执行）

如果你想快速完成，可以执行以下命令：

```bash
cd d:\Safety-Map

# 创建临时目录并克隆
git clone https://github.com/bubbbbblehu-cell/safestay.git temp-safestay

# 复制文件
copy temp-safestay\icon.png preview\icon.png
copy temp-safestay\splash.png preview\splash.png

# 清理临时目录
rmdir /s /q temp-safestay

# 提交并推送
git add preview/icon.png preview/splash.png
git commit -m "添加应用图标和开屏页图片"
git push
```

## 📍 文件位置确认

迁移后，文件应该位于：
- `d:\Safety-Map\preview\icon.png`
- `d:\Safety-Map\preview\splash.png`

这些文件会被自动引用：
- `icon.png` - 用于 Apple Web App 图标
- `splash.png` - 用于开屏页显示

## ⚠️ 注意事项

1. **文件大小**：确保图片文件不会太大（建议小于500KB）
2. **文件格式**：PNG格式最佳
3. **Git忽略**：如果文件很大，可能需要添加到 `.gitignore`，但通常图标和开屏页应该提交

## 🔍 验证迁移

迁移完成后：

1. **检查文件**：
   ```bash
   ls preview/icon.png preview/splash.png
   ```

2. **测试开屏页**：
   - 打开 `preview/index.html`
   - 应该能看到开屏页（如果有splash.png）

3. **检查Git状态**：
   ```bash
   git status
   ```

需要我帮你执行这些命令吗？
