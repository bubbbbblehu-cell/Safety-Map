# 快速配置指南

## 🚀 立即开始使用数据库

### 第一步：安装依赖

在项目根目录运行：

```bash
npm install @supabase/supabase-js
```

### 第二步：获取 API 密钥

1. 访问 https://app.supabase.com
2. 选择您的项目（数据库 ID: `hmmruoankhohowlzajll`）
3. 点击左侧菜单 **Settings** → **API**
4. 复制 **anon public** 密钥（一个很长的字符串，以 `eyJ` 开头）

### 第三步：配置密钥

打开文件 `src/config/supabase.js`，找到这一行：

```javascript
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

替换为您的实际密钥：

```javascript
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 您的密钥
```

### 第四步：启动应用

```bash
npm start
```

打开地图，应用会自动从数据库加载酒店数据！

## ✅ 验证是否成功

打开应用后，查看控制台输出：

- ✅ 看到 "正在从数据库加载酒店数据..." 
- ✅ 看到 "成功从数据库加载 X 个酒店"
- ✅ 地图上显示酒店标记

## ❌ 如果遇到问题

### 问题 1：显示"无法连接到数据库"

**原因**：API 密钥配置错误或网络问题

**解决**：
1. 检查 `src/config/supabase.js` 中的密钥是否正确
2. 确保密钥完整复制（很长的字符串）
3. 检查网络连接

### 问题 2：显示"数据库中没有酒店数据"

**原因**：数据库表为空

**解决**：
1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `supabase/schema.sql` 创建表结构
3. 导入您的酒店安全评分数据

### 问题 3：应用无法启动

**原因**：依赖未安装

**解决**：
```bash
npm install
```

## 📚 更多帮助

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 详细配置指南
- [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) - 集成说明
- [supabase/README.md](./supabase/README.md) - 数据库文档

## 💡 提示

- 应用会自动处理数据库连接失败，回退到本地数据
- 您可以先使用本地数据测试，稍后再配置数据库
- 数据库配置是可选的，但推荐使用以获得最佳体验





