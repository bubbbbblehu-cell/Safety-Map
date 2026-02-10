# 数据库连接测试指南

## 问题诊断

根据您的控制台输出，应用正在使用模拟数据，这意味着数据库连接可能存在以下问题之一：

1. ❌ 数据库中没有酒店数据
2. ❌ 城市ID不匹配
3. ❌ 数据的 `is_active` 字段为 false
4. ❌ API 密钥配置问题

## 🔍 诊断步骤

### 步骤 1：运行数据库测试脚本

```bash
node test-database.js
```

这个脚本会：
- ✅ 测试数据库连接
- ✅ 检查 cities 表中的数据
- ✅ 检查 hotels 表中的数据
- ✅ 显示详细的数据信息

### 步骤 2：检查数据库表

访问 Supabase Dashboard：
1. 打开 https://app.supabase.com
2. 选择项目（ID: `hmmruoankhohowlzajll`）
3. 进入 **Table Editor**

#### 检查 cities 表
- 确保有城市数据
- 记录城市的 `id` 和 `code`
- 确保 `is_active = true`

#### 检查 hotels 表
- 确保有酒店数据
- 检查 `city_id` 是否匹配 cities 表中的 id
- 确保 `is_active = true`
- 检查 `safety_score` 字段有值

### 步骤 3：检查城市ID匹配

应用中的城市配置在 `src/constants/cities.js`，需要确保：

```javascript
// cities.js 中的城市ID
export const CITIES = [
  {
    id: 'xishuangbanna',  // 这个ID需要匹配数据库
    name: '西双版纳',
    // ...
  }
];
```

**问题**：应用使用的是字符串 ID（如 'xishuangbanna'），但数据库中的 `city_id` 可能是 UUID。

## 🔧 解决方案

### 方案 1：使用城市代码查询（推荐）

修改查询逻辑，使用城市的 `code` 字段而不是 `id`：

```javascript
// 在 MapScreen.js 中
const dbHotels = await getHotelsByCityCode(currentCity.code);
```

### 方案 2：在数据库中添加数据

如果数据库为空，需要导入数据：

#### 2.1 首先添加城市数据

在 Supabase SQL Editor 中执行：

```sql
-- 插入城市数据
INSERT INTO cities (code, name, country, latitude, longitude, is_active)
VALUES 
  ('xishuangbanna', '西双版纳', '中国', 22.0096, 100.7975, true),
  ('guiyang', '贵阳', '中国', 26.6470, 106.6302, true),
  ('bangkok', '曼谷', '泰国', 13.7563, 100.5018, true),
  ('shanghai', '上海', '中国', 31.2304, 121.4737, true),
  ('naples', '那不勒斯', '意大利', 40.8518, 14.2681, true);
```

#### 2.2 然后添加酒店数据

```sql
-- 获取西双版纳的城市ID
SELECT id FROM cities WHERE code = 'xishuangbanna';

-- 使用返回的 UUID 插入酒店数据
INSERT INTO hotels (city_id, name, address, latitude, longitude, safety_score, review_count, is_active)
VALUES 
  ('城市UUID', '西双版纳安全酒店', '云南省西双版纳傣族自治州', 22.0096, 100.7975, 4.5, 120, true),
  ('城市UUID', '景洪舒适酒店', '云南省西双版纳景洪市', 22.0106, 100.7985, 4.2, 85, true),
  ('城市UUID', '版纳度假酒店', '云南省西双版纳', 22.0116, 100.7995, 4.8, 200, true);
```

### 方案 3：修改应用使用 UUID

如果数据库已有数据，修改 `src/constants/cities.js` 使用数据库中的实际 UUID：

```javascript
export const CITIES = [
  {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // 使用数据库中的实际 UUID
    code: 'xishuangbanna',
    name: '西双版纳',
    // ...
  }
];
```

## 📊 验证数据格式

确保数据库中的数据格式正确：

```sql
-- 检查数据
SELECT 
  h.id,
  h.name,
  h.safety_score,
  h.is_active,
  c.name as city_name,
  c.code as city_code
FROM hotels h
LEFT JOIN cities c ON h.city_id = c.id
WHERE h.is_active = true
LIMIT 5;
```

## 🎯 快速修复

最快的解决方案是修改 `MapScreen.js`，不使用城市ID筛选：

```javascript
// 临时方案：获取所有酒店
const dbHotels = await getAllHotels({});  // 不传 cityId
```

这样可以先看到所有酒店数据，然后再调整城市匹配逻辑。

## 📞 需要帮助？

如果运行 `node test-database.js` 后仍有问题，请提供：
1. 测试脚本的完整输出
2. Supabase Dashboard 中 cities 和 hotels 表的截图
3. 控制台中的错误信息

---

**更新时间**: 2026-02-09





