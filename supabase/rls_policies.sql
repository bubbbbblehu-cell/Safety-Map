-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- ============================================
-- 1. 城市表 RLS
-- ============================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看启用的城市
CREATE POLICY "任何人都可以查看启用的城市"
    ON cities FOR SELECT
    USING (is_active = true);

-- 管理员可以管理城市（需要自定义角色检查）
CREATE POLICY "管理员可以管理城市"
    ON cities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
        )
    );

-- ============================================
-- 2. 酒店表 RLS
-- ============================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看启用的酒店
CREATE POLICY "任何人都可以查看启用的酒店"
    ON hotels FOR SELECT
    USING (is_active = true);

-- 用户可以创建酒店（可选，如果需要用户提交）
CREATE POLICY "用户可以创建酒店"
    ON hotels FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 管理员可以管理酒店
CREATE POLICY "管理员可以管理酒店"
    ON hotels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- 3. 评价表 RLS
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看可见的评价
CREATE POLICY "任何人都可以查看可见的评价"
    ON reviews FOR SELECT
    USING (is_visible = true);

-- 用户可以创建自己的评价
CREATE POLICY "用户可以创建自己的评价"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评价
CREATE POLICY "用户可以更新自己的评价"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的评价
CREATE POLICY "用户可以删除自己的评价"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- 管理员可以管理所有评价
CREATE POLICY "管理员可以管理所有评价"
    ON reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- 4. 收藏表 RLS
-- ============================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的收藏
CREATE POLICY "用户只能查看自己的收藏"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- 用户可以创建自己的收藏
CREATE POLICY "用户可以创建自己的收藏"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "用户可以删除自己的收藏"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. 用户扩展信息表 RLS
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看用户资料
CREATE POLICY "所有人都可以查看用户资料"
    ON user_profiles FOR SELECT
    USING (true);

-- 用户可以创建自己的资料
CREATE POLICY "用户可以创建自己的资料"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的资料
CREATE POLICY "用户可以更新自己的资料"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. 拍照检测记录表 RLS
-- ============================================
ALTER TABLE photo_detections ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的检测记录
CREATE POLICY "用户只能查看自己的检测记录"
    ON photo_detections FOR SELECT
    USING (auth.uid() = user_id);

-- 用户可以创建自己的检测记录
CREATE POLICY "用户可以创建自己的检测记录"
    ON photo_detections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的检测记录
CREATE POLICY "用户可以更新自己的检测记录"
    ON photo_detections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. 评价有用性表 RLS
-- ============================================
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看有用性记录
CREATE POLICY "所有人都可以查看有用性记录"
    ON review_helpful FOR SELECT
    USING (true);

-- 用户可以创建自己的有用性记录
CREATE POLICY "用户可以创建自己的有用性记录"
    ON review_helpful FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的有用性记录
CREATE POLICY "用户可以删除自己的有用性记录"
    ON review_helpful FOR DELETE
    USING (auth.uid() = user_id);
