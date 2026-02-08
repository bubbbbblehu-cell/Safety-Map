@echo off
chcp 65001 >nul
echo === GitHub 仓库设置脚本 ===
echo.

REM 检查 Git 是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Git
    echo.
    echo 请先安装 Git:
    echo 1. 访问 https://git-scm.com/download/win
    echo 2. 下载并安装 Git for Windows
    echo 3. 安装完成后重新运行此脚本
    pause
    exit /b 1
)

echo [成功] Git 已安装
echo.

REM 获取 GitHub 信息
set /p githubUsername="请输入你的 GitHub 用户名: "
set /p repoName="请输入仓库名称 (直接回车使用 'safety-map-app'): "

if "%repoName%"=="" set repoName=safety-map-app

echo.
echo 仓库信息:
echo   用户名: %githubUsername%
echo   仓库名: %repoName%
echo   完整 URL: https://github.com/%githubUsername%/%repoName%
echo.

set /p confirm="确认创建? (y/n): "
if /i not "%confirm%"=="y" (
    echo 已取消
    pause
    exit /b 0
)

echo.
echo [步骤 1/5] 正在初始化 Git 仓库...
if exist .git (
    echo [警告] Git 仓库已存在，跳过初始化
) else (
    git init
    echo [成功] Git 仓库初始化完成
)

echo.
echo [步骤 2/5] 正在添加文件...
git add .
echo [成功] 文件已添加到暂存区

echo.
echo [步骤 3/5] 正在创建初始提交...
git commit -m "Initial commit: 女性安全地图应用"
echo [成功] 初始提交创建完成

echo.
echo [步骤 4/5] 正在设置远程仓库...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%githubUsername%/%repoName%.git
echo [成功] 远程仓库已添加

echo.
echo [步骤 5/5] 设置默认分支...
git branch -M main
echo [成功] 分支已设置为 main

echo.
echo ========================================
echo === 下一步操作 ===
echo ========================================
echo.
echo 1. 在浏览器中访问: https://github.com/new
echo 2. 创建新仓库，名称为: %repoName%
echo 3. 不要勾选 "Initialize this repository with a README"
echo 4. 创建仓库后，运行以下命令推送代码:
echo.
echo    git push -u origin main
echo.
echo 或者，如果你已安装 GitHub CLI，可以运行:
echo    gh repo create %repoName% --public --source=. --remote=origin --push
echo.
pause
