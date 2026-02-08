-- ============================================
-- 女性安全地图应用 - Supabase 数据库表结构
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- 如果需要地理空间查询

-- ============================================
-- 1. 城市表 (cities)
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 城市代码，如 'xishuangbanna'
    name VARCHAR(100) NOT NULL, -- 城市名称，如 '西双版纳'
    country VARCHAR(100) NOT NULL, -- 国家，如 '中国'
    latitude DECIMAL(10, 7) NOT NULL, -- 纬度
    longitude DECIMAL(10, 7) NOT NULL, -- 经度
    latitude_delta DECIMAL(10, 7) DEFAULT 0.1, -- 地图缩放纬度差
    longitude_delta DECIMAL(10, 7) DEFAULT 0.1, -- 地图缩放经度差
    zoom_level INTEGER DEFAULT 13, -- 地图缩放级别
    is_active BOOLEAN DEFAULT true, -- 是否启用
    display_order INTEGER DEFAULT 0, -- 显示顺序
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 城市表索引
CREATE INDEX idx_cities_code ON cities(code);
CREATE INDEX idx_cities_country ON cities(country);
CREATE INDEX idx_cities_is_active ON cities(is_active);

-- ============================================
-- 2. 酒店表 (hotels)
-- ============================================
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 酒店名称
    address TEXT, -- 地址
    latitude DECIMAL(10, 7) NOT NULL, -- 纬度
    longitude DECIMAL(10, 7) NOT NULL, -- 经度
    safety_score DECIMAL(3, 2) DEFAULT 0.0, -- 安全评分 (0-5)
    review_count INTEGER DEFAULT 0, -- 评价总数
    booking_url TEXT, -- 在线平台链接（如 Booking.com）
    phone VARCHAR(50), -- 联系电话
    description TEXT, -- 酒店描述
    is_verified BOOLEAN DEFAULT false, -- 是否已验证
    is_active BOOLEAN DEFAULT true, -- 是否启用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 酒店表索引
CREATE INDEX idx_hotels_city_id ON hotels(city_id);
CREATE INDEX idx_hotels_safety_score ON hotels(safety_score);
CREATE INDEX idx_hotels_location ON hotels USING GIST(ST_MakePoint(longitude, latitude)); -- PostGIS 空间索引
CREATE INDEX idx_hotels_is_active ON hotels(is_active);
CREATE INDEX idx_hotels_created_at ON hotels(created_at DESC);

-- ============================================
-- 3. 评价表 (reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 评分 (1-5)
    comment TEXT, -- 评价内容
    photos TEXT[], -- 照片URL数组（如果支持上传照片）
    is_verified BOOLEAN DEFAULT false, -- 是否已验证
    is_visible BOOLEAN DEFAULT true, -- 是否可见（可用于审核）
    helpful_count INTEGER DEFAULT 0, -- 有用数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, user_id) -- 每个用户对每个酒店只能评价一次
);

-- 评价表索引
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_visible ON reviews(is_visible);

-- ============================================
-- 4. 收藏表 (favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, hotel_id) -- 每个用户对每个酒店只能收藏一次
);

-- 收藏表索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_hotel_id ON favorites(hotel_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================
-- 5. 用户扩展信息表 (user_profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE, -- 用户名
    display_name VARCHAR(100), -- 显示名称
    avatar_url TEXT, -- 头像URL
    bio TEXT, -- 个人简介
    gender VARCHAR(20), -- 性别（可选，用于安全相关功能）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户扩展信息表索引
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- 6. 拍照检测记录表 (photo_detections)
-- ============================================
CREATE TABLE IF NOT EXISTS photo_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL, -- 可选，如果检测时未选择酒店
    photo_url TEXT NOT NULL, -- 照片URL
    detection_result JSONB, -- AI检测结果（JSON格式）
    safety_score DECIMAL(3, 2), -- 检测得出的安全评分
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 拍照检测表索引
CREATE INDEX idx_photo_detections_user_id ON photo_detections(user_id);
CREATE INDEX idx_photo_detections_hotel_id ON photo_detections(hotel_id);
CREATE INDEX idx_photo_detections_status ON photo_detections(status);
CREATE INDEX idx_photo_detections_created_at ON photo_detections(created_at DESC);

-- ============================================
-- 7. 评价有用性表 (review_helpful)
-- ============================================
CREATE TABLE IF NOT EXISTS review_helpful (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id) -- 每个用户对每个评价只能点一次有用
);

-- 评价有用性表索引
CREATE INDEX idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX idx_review_helpful_user_id ON review_helpful(user_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_detections_updated_at BEFORE UPDATE ON photo_detections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器：更新酒店评分和评价数
-- ============================================
CREATE OR REPLACE FUNCTION update_hotel_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新酒店的评价数和平均评分
    UPDATE hotels
    SET 
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE hotel_id = COALESCE(NEW.hotel_id, OLD.hotel_id)
            AND is_visible = true
        ),
        safety_score = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE hotel_id = COALESCE(NEW.hotel_id, OLD.hotel_id)
            AND is_visible = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.hotel_id, OLD.hotel_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hotel_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_hotel_stats();

-- ============================================
-- 触发器：更新评价有用数
-- ============================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reviews
    SET helpful_count = (
        SELECT COUNT(*)
        FROM review_helpful
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR DELETE ON review_helpful
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- ============================================
-- 视图：酒店详情视图（包含统计信息）
-- ============================================
CREATE OR REPLACE VIEW hotel_details AS
SELECT 
    h.id,
    h.city_id,
    c.name AS city_name,
    c.code AS city_code,
    h.name,
    h.address,
    h.latitude,
    h.longitude,
    h.safety_score,
    h.review_count,
    h.booking_url,
    h.phone,
    h.description,
    h.is_verified,
    h.is_active,
    h.created_at,
    h.updated_at,
    -- 评分分布统计
    (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id AND rating >= 4.5 AND is_visible = true) AS high_rating_count,
    (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id AND rating >= 4.0 AND rating < 4.5 AND is_visible = true) AS medium_rating_count,
    (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id AND rating < 4.0 AND is_visible = true) AS low_rating_count
FROM hotels h
JOIN cities c ON h.city_id = c.id
WHERE h.is_active = true;

-- ============================================
-- 视图：用户收藏列表视图
-- ============================================
CREATE OR REPLACE VIEW user_favorites_view AS
SELECT 
    f.id AS favorite_id,
    f.user_id,
    f.created_at AS favorited_at,
    h.id AS hotel_id,
    h.name AS hotel_name,
    h.safety_score,
    h.review_count,
    h.latitude,
    h.longitude,
    c.name AS city_name,
    c.code AS city_code
FROM favorites f
JOIN hotels h ON f.hotel_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE h.is_active = true;
