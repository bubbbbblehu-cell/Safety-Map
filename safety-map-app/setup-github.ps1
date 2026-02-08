# GitHub 仓库设置脚本
# 使用前请确保已安装 Git 并配置好 GitHub 账户

Write-Host "=== GitHub 仓库设置脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查 Git 是否安装
try {
    $gitVersion = git --version
    Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未检测到 Git" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Git:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. 下载并安装 Git for Windows" -ForegroundColor Yellow
    Write-Host "3. 安装完成后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 获取 GitHub 用户名和仓库名
$githubUsername = Read-Host "请输入你的 GitHub 用户名"
$repoName = Read-Host "请输入仓库名称 (直接回车使用 'safety-map-app')"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "safety-map-app"
}

Write-Host ""
Write-Host "仓库信息:" -ForegroundColor Cyan
Write-Host "  用户名: $githubUsername" -ForegroundColor Cyan
Write-Host "  仓库名: $repoName" -ForegroundColor Cyan
Write-Host "  完整 URL: https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "确认创建? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "正在初始化 Git 仓库..." -ForegroundColor Yellow

# 初始化 Git
if (Test-Path ".git") {
    Write-Host "⚠ Git 仓库已存在，跳过初始化" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✓ Git 仓库初始化完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "正在添加文件..." -ForegroundColor Yellow
git add .
Write-Host "✓ 文件已添加到暂存区" -ForegroundColor Green

Write-Host ""
Write-Host "正在创建初始提交..." -ForegroundColor Yellow
git commit -m "Initial commit: 女性安全地图应用"
Write-Host "✓ 初始提交创建完成" -ForegroundColor Green

Write-Host ""
Write-Host "正在设置远程仓库..." -ForegroundColor Yellow

# 检查是否已有远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠ 远程仓库已存在: $existingRemote" -ForegroundColor Yellow
    $update = Read-Host "是否更新为新的仓库地址? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin "https://github.com/$githubUsername/$repoName.git"
        Write-Host "✓ 远程仓库地址已更新" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$githubUsername/$repoName.git"
    Write-Host "✓ 远程仓库已添加" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 下一步操作 ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. 在浏览器中访问: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. 创建新仓库，名称为: $repoName" -ForegroundColor Cyan
Write-Host "3. 不要勾选 'Initialize this repository with a README'" -ForegroundColor Cyan
Write-Host "4. 创建仓库后，运行以下命令推送代码:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "或者，如果你已安装 GitHub CLI，可以运行:" -ForegroundColor Yellow
Write-Host "   gh repo create $repoName --public --source=. --remote=origin --push" -ForegroundColor White
Write-Host ""
