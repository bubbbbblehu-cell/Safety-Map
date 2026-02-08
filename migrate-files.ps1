# 从 safestay 仓库迁移文件脚本
# 使用方法：在 PowerShell 中运行 .\migrate-files.ps1

Write-Host "开始从 safestay 仓库迁移文件..." -ForegroundColor Green

# 设置变量
$oldRepo = "https://github.com/bubbbbblehu-cell/safestay.git"
$tempDir = "temp-safestay"
$targetDir = "preview"
$currentDir = Get-Location

# 检查是否在正确的目录
if (-not (Test-Path "preview")) {
    Write-Host "错误：请在 Safety-Map 项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 创建临时目录
Write-Host "正在克隆 safestay 仓库到临时目录..." -ForegroundColor Yellow
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
git clone $oldRepo $tempDir --quiet

if (-not (Test-Path "$tempDir\icon.png")) {
    Write-Host "警告：未找到 icon.png，尝试从 GitHub 直接下载..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/bubbbbblehu-cell/safestay/main/icon.png" -OutFile "$targetDir\icon.png" -ErrorAction Stop
        Write-Host "✓ icon.png 下载成功" -ForegroundColor Green
    } catch {
        Write-Host "✗ icon.png 下载失败: $_" -ForegroundColor Red
    }
} else {
    Copy-Item "$tempDir\icon.png" "$targetDir\icon.png" -Force
    Write-Host "✓ icon.png 复制成功" -ForegroundColor Green
}

if (-not (Test-Path "$tempDir\splash.png")) {
    Write-Host "警告：未找到 splash.png，尝试从 GitHub 直接下载..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/bubbbbblehu-cell/safestay/main/splash.png" -OutFile "$targetDir\splash.png" -ErrorAction Stop
        Write-Host "✓ splash.png 下载成功" -ForegroundColor Green
    } catch {
        Write-Host "✗ splash.png 下载失败: $_" -ForegroundColor Red
    }
} else {
    Copy-Item "$tempDir\splash.png" "$targetDir\splash.png" -Force
    Write-Host "✓ splash.png 复制成功" -ForegroundColor Green
}

# 清理临时目录
Write-Host "正在清理临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir

# 验证文件
Write-Host ""
Write-Host "验证文件..." -ForegroundColor Yellow
if (Test-Path "$targetDir\icon.png") {
    $iconSize = (Get-Item "$targetDir\icon.png").Length
    $iconSizeKB = [math]::Round($iconSize/1024, 2)
    Write-Host "icon.png 存在 ($iconSizeKB KB)" -ForegroundColor Green
} else {
    Write-Host "icon.png 不存在" -ForegroundColor Red
}

if (Test-Path "$targetDir\splash.png") {
    $splashSize = (Get-Item "$targetDir\splash.png").Length
    $splashSizeKB = [math]::Round($splashSize/1024, 2)
    Write-Host "splash.png 存在 ($splashSizeKB KB)" -ForegroundColor Green
} else {
    Write-Host "splash.png 不存在" -ForegroundColor Red
}

Write-Host "`n迁移完成！" -ForegroundColor Green
Write-Host "下一步：运行以下命令提交文件：" -ForegroundColor Yellow
Write-Host "  git add preview/icon.png preview/splash.png" -ForegroundColor Cyan
Write-Host "  git commit -m '添加应用图标和开屏页图片'" -ForegroundColor Cyan
Write-Host "  git push" -ForegroundColor Cyan
