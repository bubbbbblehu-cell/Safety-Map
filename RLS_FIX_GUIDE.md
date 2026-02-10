# 🔍 数据库连接问题诊断

## 问题现状

✅ 数据库中有 593 条酒店记录
❌ 应用无法读取这些数据
❌ 应用显示"使用模拟数据"

## 🎯 最可能的原因：RLS（行级安全）策略

Supabase 默认启用 RLS，这会阻止匿名用户访问数据。

## 🔧 立即修复（3个步骤）

### 步骤 1：在 Supabase Dashboard 中执行 SQL

1. 访问 https://app.supabase.com
2. 选择您的项目（ID: `hmmruoankhohowlzajll`）
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New query**
5. 复制粘贴以下 SQL 并点击 **Run**：

```sql
-- 允许匿名用户读取酒店和城市数据
DROP POLICY IF EXISTS "允许所有人查看启用的城市" ON public.cities;
DROP POLICY IF EXISTS "允许所有人查看启用的酒店" ON public.hotels;

CREATE POLICY "允许所有人查看启用的城市"
ON public.cities
FOR SELECT
USING (true);

CREATE POLICY "允许所有人查看启用的酒店"
ON public.hotels
FOR SELECT
USING (true);

-- 确保 RLS 已启用
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
```

### 步骤 2：验证策略已创建

在 SQL Editor 中运行：

```sql
-- 查看策略
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('hotels', 'cities');
```

应该看到两个策略：
- `允许所有人查看启用的城市`
- `允许所有人查看启用的酒店`

### 步骤 3：重新启动应用

```bash
# 停止应用（Ctrl+C）
npm start
```

## 🔍 替代方案：临时禁用 RLS（仅用于测试）

如果上面的方法不起作用，可以临时禁用 RLS 进行测试：

```sql
-- 临时禁用 RLS
ALTER TABLE public.hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;
```

⚠️ **警告**：这会让所有人都能访问数据。测试完成后记得重新启用！

## 📊 验证数据

在 SQL Editor 中运行以下查询，确认数据存在：

```sql
-- 检查酒店总数
SELECT COUNT(*) as total FROM hotels;

-- 检查启用的酒店
SELECT COUNT(*) as active FROM hotels WHERE is_active = true;

-- 查看前5个酒店
SELECT id, name, safety_score, is_active 
FROM hotels 
LIMIT 5;
```

## 🎯 预期结果

执行 RLS 策略后，重新启动应用，您应该看到：

```
========================================
正在从数据库加载酒店数据...
当前城市: 西双版纳
========================================
数据库查询结果: 593 个酒店
✅ 成功从数据库加载酒店数据！
前3个酒店示例:
  1. 宜家大酒店 - 评分: 4.00
  2. 118酒店(火车广场店) - 评分: 4.00
  3. 金鼎商务酒店(曼迈国际机场店) - 评分: 4.30
转换后的酒店数据: 593 个
生成热力图数据点: 593 个
========================================
✅ 数据库酒店数据已成功加载到地图！
========================================
```

## 🐛 如果仍然失败

### 检查 1：API 密钥是否正确

打开 `src/config/supabase.js`，确认密钥是：
```javascript
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQxNjgsImV4cCI6MjA4NjEwMDE2OH0.nGVgFlrTPQh86Ba0doT_mmeHvCnF0NjJ6MUJEvQKV3g';
```

### 检查 2：网络连接

在浏览器中访问：
```
https://hmmruoankhohowlzajll.supabase.co/rest/v1/hotels?select=*&limit=1
```

应该返回 JSON 数据（如果 RLS 策略正确）。

### 检查 3：查看详细错误

打开应用的控制台，查找以 `❌` 开头的错误信息，并提供给我。

## 📁 相关文件

- `supabase/fix_rls_policies.sql` - RLS 策略修复脚本
- `supabase/disable_rls_test.sql` - 临时禁用 RLS 测试脚本

## 💡 为什么会这样？

Supabase 默认启用 RLS 保护数据安全。如果没有创建允许读取的策略，即使使用正确的 API 密钥，匿名用户也无法读取数据。

创建 `USING (true)` 的策略后，所有人都可以读取数据（但不能修改）。

---

**请立即执行步骤 1 中的 SQL，然后重新启动应用！**





