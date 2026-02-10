# 数据库集成更新日志

## 更新内容

本次更新实现了从 Supabase 数据库加载酒店安全评分数据的功能。

### 新增文件

1. **`src/config/supabase.js`** - Supabase 客户端配置
   - 配置数据库连接
   - 数据库 URL: `https://hmmruoankhohowlzajll.supabase.co`
   - 需要配置 ANON_KEY

2. **`src/services/hotelService.js`** - 酒店数据服务
   - 提供完整的数据库操作 API
   - 包含酒店、评价、收藏等功能
   - 自动处理数据格式转换

3. **`SUPABASE_SETUP.md`** - 数据库集成指南
   - 详细的配置步骤
   - API 使用示例
   - 故障排除指南

4. **`env.example`** - 环境变量配置示例
   - Supabase 配置模板
   - Coze AI 配置模板

### 修改文件

1. **`src/screens/MapScreen.js`**
   - 导入数据库服务模块
   - 修改 `loadCityData` 函数，优先从数据库加载数据
   - 添加错误处理和回退机制
   - 如果数据库连接失败，自动使用本地模拟数据

### 主要功能

#### 1. 智能数据加载
```javascript
// 优先从数据库加载
const dbHotels = await getAllHotels({ cityId: currentCity.id });

// 如果数据库为空或失败，回退到模拟数据
if (!dbHotels || dbHotels.length === 0) {
  const mockData = generateMockHotelData(currentCity.id);
  setAllHotels(mockData);
}
```

#### 2. 数据库服务 API

**酒店相关**:
- `getAllHotels(filters)` - 获取所有酒店（支持城市和评分筛选）
- `getHotelsByCityId(cityId)` - 根据城市ID获取酒店
- `getHotelById(hotelId)` - 获取酒店详情
- `getHotelStats(cityId)` - 获取统计信息

**评价相关**:
- `getHotelReviews(hotelId)` - 获取评价列表
- `addHotelReview(review)` - 添加评价

**收藏相关**:
- `getUserFavorites(userId)` - 获取收藏列表
- `addFavorite(userId, hotelId)` - 添加收藏
- `removeFavorite(userId, hotelId)` - 取消收藏

#### 3. 自动回退机制

应用会自动处理以下情况：
- 数据库连接失败 → 使用本地模拟数据
- 数据库中没有数据 → 使用本地模拟数据
- 网络错误 → 显示提示并使用本地数据

### 配置步骤

#### 1. 安装依赖
```bash
npm install @supabase/supabase-js
```

#### 2. 获取 Supabase API 密钥
1. 访问 https://app.supabase.com
2. 选择项目（ID: hmmruoankhohowlzajll）
3. 进入 Settings → API
4. 复制 `anon public` 密钥

#### 3. 配置密钥
编辑 `src/config/supabase.js`，替换 `YOUR_SUPABASE_ANON_KEY`:
```javascript
const SUPABASE_ANON_KEY = '你的实际密钥'; // 替换这里
```

#### 4. 导入数据
在 Supabase Dashboard 中导入酒店安全评分数据到 `hotels` 表。

### 数据格式

#### 数据库格式（hotels 表）
```javascript
{
  id: 'uuid',
  city_id: 'uuid',
  name: '酒店名称',
  address: '地址',
  latitude: 22.0096,
  longitude: 100.7975,
  safety_score: 4.5,      // 安全评分 0-5
  review_count: 120,      // 评价数量
  booking_url: 'https://...',
  phone: '电话',
  description: '描述',
  is_verified: true,
  is_active: true
}
```

#### 应用格式（转换后）
```javascript
{
  id: 'uuid',
  name: '酒店名称',
  address: '地址',
  latitude: 22.0096,
  longitude: 100.7975,
  safetyScore: 4.5,       // 驼峰命名
  reviewCount: 120,       // 驼峰命名
  bookingUrl: 'https://...',
  phone: '电话',
  description: '描述',
  isVerified: true,
  city: { ... }           // 关联的城市信息
}
```

### 使用示例

#### 在地图上显示数据库中的酒店
```javascript
// MapScreen.js 中已自动实现
// 打开地图时会自动从数据库加载数据
```

#### 筛选酒店
```javascript
// 获取评分 >= 4.0 的酒店
const hotels = await getAllHotels({ 
  cityId: 'city-uuid',
  minRating: 4.0 
});
```

#### 获取统计信息
```javascript
const stats = await getHotelStats('city-uuid');
console.log(`总酒店数: ${stats.totalHotels}`);
console.log(`已评分: ${stats.hotelsWithRating}`);
console.log(`平均评分: ${stats.averageRating}`);
```

### 测试

#### 1. 测试数据库连接
打开应用，查看控制台输出：
- ✅ "正在从数据库加载酒店数据..."
- ✅ "成功从数据库加载 X 个酒店"

#### 2. 测试回退机制
暂时断开网络或使用错误的 API 密钥：
- ✅ 应显示提示："无法连接到数据库，正在使用本地数据"
- ✅ 地图仍然正常显示（使用模拟数据）

#### 3. 测试数据显示
- ✅ 地图上显示酒店标记
- ✅ 热力图正确显示
- ✅ 统计信息正确显示

### 注意事项

1. **API 密钥安全**
   - 不要将 API 密钥提交到 Git
   - 使用环境变量存储敏感信息
   - `anon public` 密钥可以在客户端使用（受 RLS 保护）

2. **数据库权限**
   - 确保已设置 RLS 策略（`supabase/rls_policies.sql`）
   - 匿名用户应该可以读取（SELECT）酒店数据
   - 写入操作需要用户认证

3. **性能优化**
   - 数据会在组件加载时一次性获取
   - 可以考虑添加缓存机制
   - 大量数据时可以实现分页加载

4. **错误处理**
   - 所有数据库操作都有 try-catch 错误处理
   - 失败时自动回退到本地数据
   - 用户会看到友好的提示信息

### 下一步计划

- [ ] 实现用户认证（Supabase Auth）
- [ ] 实现实时数据更新（Supabase Realtime）
- [ ] 添加数据缓存机制
- [ ] 实现离线支持
- [ ] 添加数据同步功能

### 相关文档

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 详细配置指南
- [supabase/README.md](./supabase/README.md) - 数据库表结构
- [supabase/schema.sql](./supabase/schema.sql) - 表结构 SQL
- [supabase/rls_policies.sql](./supabase/rls_policies.sql) - RLS 策略

### 问题反馈

如果遇到问题，请检查：
1. Supabase API 密钥是否正确配置
2. 数据库表是否已创建
3. RLS 策略是否已设置
4. 网络连接是否正常
5. 控制台错误信息

---

**更新时间**: 2026-02-09
**版本**: 1.0.0





