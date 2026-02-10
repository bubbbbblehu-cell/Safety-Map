# Supabase 数据库集成指南

本文档说明如何将 Safety-Map 应用连接到 Supabase 数据库，以便从数据库加载和显示酒店安全评分数据。

## 📋 前置条件

1. 已有 Supabase 账号和项目
2. 数据库 ID: `hmmruoankhohowlzajll`
3. 已执行数据库表结构创建（`supabase/schema.sql`）
4. 已导入酒店安全评分数据

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @supabase/supabase-js
```

或者使用 yarn:

```bash
yarn add @supabase/supabase-js
```

### 2. 获取 Supabase API 密钥

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目（ID: hmmruoankhohowlzajll）
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: `https://hmmruoankhohowlzajll.supabase.co`
   - **anon public key**: 一个很长的字符串（以 `eyJ` 开头）

### 3. 配置 Supabase 客户端

打开 `src/config/supabase.js` 文件，将 `YOUR_SUPABASE_ANON_KEY` 替换为您的实际密钥：

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmmruoankhohowlzajll.supabase.co';
const SUPABASE_ANON_KEY = '你的_anon_public_key'; // 替换这里

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 4. 验证数据库连接

应用会在启动时自动尝试从数据库加载数据。如果连接失败，会自动回退到本地模拟数据。

## 📁 项目结构

```
src/
├── config/
│   └── supabase.js          # Supabase 客户端配置
├── services/
│   └── hotelService.js      # 酒店数据服务（数据库操作）
└── screens/
    └── MapScreen.js         # 地图界面（已集成数据库加载）
```

## 🔧 主要功能

### 1. 从数据库加载酒店数据

`MapScreen.js` 中的 `loadCityData` 函数会：
- 首先尝试从 Supabase 数据库加载酒店数据
- 如果数据库中有数据，显示真实数据
- 如果数据库为空或连接失败，回退到本地模拟数据
- 显示相应的提示信息

### 2. 数据服务 API

`src/services/hotelService.js` 提供了完整的数据库操作方法：

#### 酒店相关
- `getAllHotels(filters)` - 获取所有酒店（支持筛选）
- `getHotelsByCityId(cityId)` - 根据城市ID获取酒店
- `getHotelsByCityCode(cityCode)` - 根据城市代码获取酒店
- `getHotelById(hotelId)` - 获取酒店详情
- `getHotelStats(cityId)` - 获取酒店统计信息

#### 评价相关
- `getHotelReviews(hotelId)` - 获取酒店评价
- `addHotelReview(review)` - 添加评价

#### 收藏相关
- `getUserFavorites(userId)` - 获取用户收藏
- `addFavorite(userId, hotelId)` - 添加收藏
- `removeFavorite(userId, hotelId)` - 取消收藏
- `isFavorite(userId, hotelId)` - 检查是否已收藏

#### 工具函数
- `generateHeatmapData(hotels)` - 生成热力图数据
- `transformHotelData(dbHotel)` - 转换数据格式
- `transformHotelsData(dbHotels)` - 批量转换数据格式

## 📊 数据库表结构

### hotels 表（酒店表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| city_id | UUID | 城市ID |
| name | VARCHAR(200) | 酒店名称 |
| address | TEXT | 地址 |
| latitude | DECIMAL(10,7) | 纬度 |
| longitude | DECIMAL(10,7) | 经度 |
| safety_score | DECIMAL(3,2) | 安全评分（0-5） |
| review_count | INTEGER | 评价总数 |
| booking_url | TEXT | 预订链接 |
| phone | VARCHAR(50) | 电话 |
| description | TEXT | 描述 |
| is_verified | BOOLEAN | 是否已验证 |
| is_active | BOOLEAN | 是否启用 |

### 数据示例

```sql
INSERT INTO hotels (city_id, name, address, latitude, longitude, safety_score, review_count)
VALUES (
  'city-uuid',
  '西双版纳安全酒店',
  '云南省西双版纳傣族自治州景洪市',
  22.0096,
  100.7975,
  4.5,
  120
);
```

## 🔍 使用示例

### 在组件中使用数据服务

```javascript
import { getAllHotels, getHotelStats } from '../services/hotelService';

// 获取所有酒店
const hotels = await getAllHotels({ 
  cityId: 'city-uuid',
  minRating: 4.0 
});

// 获取统计信息
const stats = await getHotelStats('city-uuid');
console.log(`总酒店数: ${stats.totalHotels}`);
console.log(`已评分: ${stats.hotelsWithRating}`);
```

### 添加评价

```javascript
import { addHotelReview } from '../services/hotelService';

const review = await addHotelReview({
  hotelId: 'hotel-uuid',
  userId: 'user-uuid',
  rating: 4.5,
  comment: '非常安全的酒店！'
});
```

## 🐛 故障排除

### 问题 1: 无法连接到数据库

**症状**: 应用显示"无法连接到数据库，正在使用本地数据"

**解决方案**:
1. 检查网络连接
2. 确认 Supabase API 密钥配置正确
3. 检查 Supabase 项目是否处于活动状态
4. 查看浏览器控制台的错误信息

### 问题 2: 数据库中没有数据

**症状**: 应用显示"数据库中没有酒店数据，使用模拟数据"

**解决方案**:
1. 确认已执行 `supabase/schema.sql` 创建表结构
2. 确认已导入酒店数据
3. 检查数据是否设置了 `is_active = true`
4. 在 Supabase Dashboard 中查看 hotels 表

### 问题 3: RLS 策略阻止访问

**症状**: 查询返回空数组或权限错误

**解决方案**:
1. 确认已执行 `supabase/rls_policies.sql` 设置 RLS 策略
2. 检查 RLS 策略是否允许匿名访问（SELECT）
3. 在 Supabase Dashboard 中临时禁用 RLS 进行测试

## 📝 数据导入

### 方式 1: 使用 Supabase Dashboard

1. 进入 Supabase Dashboard
2. 选择 **Table Editor**
3. 选择 `hotels` 表
4. 点击 **Insert** → **Insert row**
5. 填写酒店信息并保存

### 方式 2: 使用 SQL 批量导入

```sql
-- 示例：批量插入酒店数据
INSERT INTO hotels (city_id, name, address, latitude, longitude, safety_score, review_count, is_active)
VALUES 
  ('city-uuid-1', '酒店A', '地址A', 22.0096, 100.7975, 4.5, 120, true),
  ('city-uuid-1', '酒店B', '地址B', 22.0106, 100.7985, 4.2, 85, true),
  ('city-uuid-1', '酒店C', '地址C', 22.0116, 100.7995, 4.8, 200, true);
```

### 方式 3: 从 CSV 导入

1. 准备 CSV 文件（包含所有必需字段）
2. 在 Supabase Dashboard 中选择 **Table Editor**
3. 点击 **Import data from CSV**
4. 上传 CSV 文件并映射字段

## 🔐 安全建议

1. **不要将 API 密钥提交到 Git**
   - 使用 `.env` 文件存储密钥
   - 将 `.env` 添加到 `.gitignore`

2. **使用 RLS 策略保护数据**
   - 确保已启用 Row Level Security
   - 为不同操作设置适当的权限

3. **验证用户输入**
   - 在添加评价前验证数据
   - 防止 SQL 注入（Supabase 客户端已自动处理）

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [数据库表结构](./supabase/README.md)
- [RLS 策略](./supabase/rls_policies.sql)

## 🎯 下一步

1. ✅ 安装 `@supabase/supabase-js` 依赖
2. ✅ 配置 Supabase API 密钥
3. ✅ 导入酒店安全评分数据
4. ✅ 测试数据库连接
5. 🔄 实现用户认证（可选）
6. 🔄 实现实时数据更新（可选）

## 💡 提示

- 应用会自动处理数据库连接失败的情况，回退到本地模拟数据
- 可以在开发时使用模拟数据，生产环境使用真实数据库
- 建议先在测试环境验证数据库配置，再部署到生产环境





