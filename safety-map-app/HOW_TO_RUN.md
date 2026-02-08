# 如何在项目目录中运行

## 项目位置
```
C:\Users\Hu\safety-map-app
```

## 方法一：使用文件资源管理器（最简单）

### 运行 GitHub 设置脚本

1. **打开项目文件夹**
   - 按 `Win + E` 打开文件资源管理器
   - 导航到：`C:\Users\Hu\safety-map-app`
   - 或者直接在地址栏输入：`C:\Users\Hu\safety-map-app`

2. **运行脚本**
   - **方式 A（推荐）**：双击 `setup-github.bat` 文件
   - **方式 B**：右键点击 `setup-github.ps1` → 选择"使用 PowerShell 运行"

### 运行 React Native 项目

1. **打开项目文件夹**（同上）

2. **在文件夹中打开终端**
   - 在地址栏输入 `cmd` 或 `powershell` 然后按回车
   - 或者按住 `Shift` 键，右键点击空白处 → 选择"在此处打开 PowerShell 窗口"

3. **运行命令**
   ```bash
   # 安装依赖（首次运行）
   npm install
   
   # 启动 Metro 打包器
   npm start
   
   # 在另一个终端窗口运行 Android（需要 Android Studio）
   npm run android
   ```

## 方法二：使用命令提示符（CMD）

1. **打开命令提示符**
   - 按 `Win + R`
   - 输入 `cmd` 按回车

2. **进入项目目录**
   ```cmd
   cd C:\Users\Hu\safety-map-app
   ```

3. **运行脚本**
   ```cmd
   setup-github.bat
   ```

4. **或运行 React Native 命令**
   ```cmd
   npm install
   npm start
   ```

## 方法三：使用 PowerShell

1. **打开 PowerShell**
   - 按 `Win + X` → 选择"Windows PowerShell"
   - 或按 `Win + R` → 输入 `powershell` 按回车

2. **进入项目目录**
   ```powershell
   cd C:\Users\Hu\safety-map-app
   ```

3. **运行脚本**
   ```powershell
   .\setup-github.ps1
   ```

4. **或运行 React Native 命令**
   ```powershell
   npm install
   npm start
   ```

## 方法四：在 VS Code / Cursor 中运行

1. **打开项目**
   - 打开 VS Code 或 Cursor
   - File → Open Folder → 选择 `C:\Users\Hu\safety-map-app`

2. **打开终端**
   - 按 `` Ctrl + ` ``（反引号）打开集成终端
   - 或菜单：Terminal → New Terminal

3. **运行命令**
   ```bash
   # GitHub 设置
   .\setup-github.bat
   
   # 或 React Native
   npm install
   npm start
   ```

## 快速命令参考

### GitHub 设置
```bash
# 方式 1：批处理文件
setup-github.bat

# 方式 2：PowerShell 脚本
.\setup-github.ps1

# 方式 3：手动 Git 命令
git init
git add .
git commit -m "Initial commit: 女性安全地图应用"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### React Native 开发
```bash
# 安装依赖（首次）
npm install

# 启动开发服务器
npm start

# 运行 Android（需要 Android Studio）
npm run android

# 运行 iOS（需要 macOS 和 Xcode）
npm run ios
```

## 常见问题

### Q: 双击 .bat 文件没有反应？
A: 可能是被安全软件阻止，尝试：
- 右键 → "以管理员身份运行"
- 或在命令行中运行

### Q: PowerShell 提示"无法执行脚本"？
A: 需要修改执行策略：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 如何快速打开项目文件夹？
A: 
- 在文件资源管理器地址栏输入：`C:\Users\Hu\safety-map-app`
- 或在命令行运行：`explorer C:\Users\Hu\safety-map-app`

### Q: npm 命令找不到？
A: 需要先安装 Node.js：
- 访问：https://nodejs.org/
- 下载并安装 LTS 版本

## 推荐工作流程

1. **首次设置**
   ```bash
   cd C:\Users\Hu\safety-map-app
   npm install
   ```

2. **推送到 GitHub**
   ```bash
   setup-github.bat
   ```

3. **开发应用**
   ```bash
   npm start          # 终端 1：启动 Metro
   npm run android    # 终端 2：运行 Android
   ```
