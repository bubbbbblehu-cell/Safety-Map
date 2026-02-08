# Supabase 数据库表结构文档

本文档描述了女性安全地图应用的完整数据库表结构，适配 Supabase (PostgreSQL)。

## 📋 表结构概览

### 核心表

1. **cities** - 城市表
2. **hotels** - 酒店表
3. **reviews** - 评价表
4. **favorites** - 收藏表
5. **user_profiles** - 用户扩展信息表
6. **photo_detections** - 拍照检测记录表
7. **review_helpful** - 评价有用性表

### 视图

1. **hotel_details** - 酒店详情视图（包含统计信息）
2. **user_favorites_view** - 用户收藏列表视图

## 🗄️ 详细表结构

### 1. cities（城市表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | VARCHAR(50) | 城市代码（唯一），如 'xishuangbanna' |
| name | VARCHAR(100) | 城市名称 |
| country | VARCHAR(100) | 国家 |
| latitude | DECIMAL(10,7) | 纬度 |
| longitude | DECIMAL(10,7) | 经度 |
| latitude_delta | DECIMAL(10,7) | 地图缩放纬度差 |
| longitude_delta | DECIMAL(10,7) | 地图缩放经度差 |
| zoom_level | INTEGER | 地图缩放级别 |
| is_active | BOOLEAN | 是否启用 |
| display_order | INTEGER | 显示顺序 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引：**
- `code` (唯一索引)
- `country`
- `is_active`

### 2. hotels（酒店表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| city_id | UUID | 城市ID（外键） |
| name | VARCHAR(200) | 酒店名称 |
| address | TEXT | 地址 |
| latitude | DECIMAL(10,7) | 纬度 |
| longitude | DECIMAL(10,7) | 经度 |
| safety_score | DECIMAL(3,2) | 安全评分（0-5），自动计算 |
| review_count | INTEGER | 评价总数，自动计算 |
| booking_url | TEXT | 在线平台链接 |
| phone | VARCHAR(50) | 联系电话 |
| description | TEXT | 酒店描述 |
| is_verified | BOOLEAN | 是否已验证 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引：**
- `city_id`
- `safety_score`
- `is_active`
- 地理位置索引（PostGIS）

**触发器：**
- 自动更新 `safety_score` 和 `review_count`（当评价增删改时）

### 3. reviews（评价表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| hotel_id | UUID | 酒店ID（外键） |
| user_id | UUID | 用户ID（外键，auth.users） |
| rating | DECIMAL(2,1) | 评分（1-5） |
| comment | TEXT | 评价内容 |
| photos | TEXT[] | 照片URL数组 |
| is_verified | BOOLEAN | 是否已验证 |
| is_visible | BOOLEAN | 是否可见（用于审核） |
| helpful_count | INTEGER | 有用数，自动计算 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**约束：**
- 每个用户对每个酒店只能评价一次（UNIQUE）
- rating 必须在 1-5 之间

**索引：**
- `hotel_id`
- `user_id`
- `rating`
- `created_at`
- `is_visible`

**触发器：**
- 自动更新酒店的 `safety_score` 和 `review_count`
- 自动更新 `helpful_count`

### 4. favorites（收藏表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| hotel_id | UUID | 酒店ID（外键） |
| created_at | TIMESTAMP | 收藏时间 |

**约束：**
- 每个用户对每个酒店只能收藏一次（UNIQUE）

**索引：**
- `user_id`
- `hotel_id`
- `created_at`

### 5. user_profiles（用户扩展信息表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键（关联 auth.users.id） |
| username | VARCHAR(50) | 用户名（唯一） |
| display_name | VARCHAR(100) | 显示名称 |
| avatar_url | TEXT | 头像URL |
| bio | TEXT | 个人简介 |
| gender | VARCHAR(20) | 性别 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引：**
- `username` (唯一索引)

### 6. photo_detections（拍照检测记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| hotel_id | UUID | 酒店ID（外键，可选） |
| photo_url | TEXT | 照片URL |
| detection_result | JSONB | AI检测结果（JSON格式） |
| safety_score | DECIMAL(3,2) | 检测得出的安全评分 |
| status | VARCHAR(20) | 状态：pending, processing, completed, failed |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引：**
- `user_id`
- `hotel_id`
- `status`
- `created_at`

### 7. review_helpful（评价有用性表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| review_id | UUID | 评价ID（外键） |
| user_id | UUID | 用户ID（外键） |
| created_at | TIMESTAMP | 创建时间 |

**约束：**
- 每个用户对每个评价只能点一次有用（UNIQUE）

**索引：**
- `review_id`
- `user_id`

## 🔒 Row Level Security (RLS)

所有表都启用了 RLS，策略如下：

### 公共访问（SELECT）
- **cities**: 所有人可以查看启用的城市
- **hotels**: 所有人可以查看启用的酒店
- **reviews**: 所有人可以查看可见的评价
- **user_profiles**: 所有人可以查看用户资料

### 用户权限
- **reviews**: 用户可以创建、更新、删除自己的评价
- **favorites**: 用户只能查看和管理自己的收藏
- **photo_detections**: 用户只能查看和管理自己的检测记录
- **review_helpful**: 用户可以创建和删除自己的有用性记录
- **user_profiles**: 用户可以创建和更新自己的资料

### 管理员权限
- 管理员可以管理所有表的数据（需要设置用户角色为 'admin'）

## 🔄 自动触发器

### 1. 更新时间触发器
所有表都有 `updated_at` 字段的自动更新触发器。

### 2. 酒店统计更新触发器
当评价表增删改时，自动更新酒店的：
- `review_count`（评价总数）
- `safety_score`（平均评分）

### 3. 评价有用数更新触发器
当 `review_helpful` 表增删时，自动更新评价的 `helpful_count`。

## 📊 视图

### hotel_details
包含酒店信息和评分分布统计：
- 高评分数量（≥4.5）
- 中等评分数量（4.0-4.5）
- 低评分数量（<4.0）

### user_favorites_view
用户收藏列表，包含酒店和城市信息。

## 🚀 使用步骤

### 1. 在 Supabase Dashboard 中执行 SQL

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 依次执行以下文件：
   - `schema.sql` - 创建表结构
   - `rls_policies.sql` - 设置 RLS 策略
   - `seed_data.sql` - 插入初始数据（可选）

### 2. 配置存储桶（如果需要上传照片）

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-photos', 'hotel-photos', true);

-- 设置存储策略
CREATE POLICY "任何人都可以查看照片"
ON storage.objects FOR SELECT
USING (bucket_id = 'hotel-photos');

CREATE POLICY "用户可以上传照片"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'hotel-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. 在应用中连接 Supabase

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 📝 常用查询示例

### 获取城市列表
```sql
SELECT * FROM cities WHERE is_active = true ORDER BY display_order;
```

### 获取城市的酒店列表
```sql
SELECT * FROM hotel_details WHERE city_code = 'shanghai' ORDER BY safety_score DESC;
```

### 获取酒店的评价列表
```sql
SELECT * FROM reviews 
WHERE hotel_id = 'hotel-uuid' AND is_visible = true 
ORDER BY created_at DESC;
```

### 获取用户的收藏列表
```sql
SELECT * FROM user_favorites_view 
WHERE user_id = 'user-uuid' 
ORDER BY favorited_at DESC;
```

### 创建评价
```sql
INSERT INTO reviews (hotel_id, user_id, rating, comment)
VALUES ('hotel-uuid', 'user-uuid', 4.5, '非常安全的酒店！');
```

### 收藏/取消收藏酒店
```sql
-- 收藏
INSERT INTO favorites (user_id, hotel_id)
VALUES ('user-uuid', 'hotel-uuid')
ON CONFLICT DO NOTHING;

-- 取消收藏
DELETE FROM favorites 
WHERE user_id = 'user-uuid' AND hotel_id = 'hotel-uuid';
```

## 🔧 注意事项

1. **PostGIS 扩展**：如果需要使用地理空间查询，需要启用 PostGIS 扩展
2. **管理员角色**：需要在 `auth.users` 的 `raw_user_meta_data` 中设置 `role: 'admin'`
3. **存储策略**：如果使用 Supabase Storage 存储照片，需要配置相应的存储策略
4. **索引优化**：根据实际查询需求，可能需要添加额外的索引

## 📚 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [PostGIS 文档](https://postgis.net/documentation/)
