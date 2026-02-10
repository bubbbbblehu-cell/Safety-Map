-- ============================================
-- 允许匿名用户读取酒店和城市数据的 RLS 策略
-- ============================================

-- 1. 为 cities 表创建公开读取策略
DROP POLICY IF EXISTS "允许所有人查看启用的城市" ON public.cities;

CREATE POLICY "允许所有人查看启用的城市"
ON public.cities
FOR SELECT
USING (true);  -- 允许所有人读取

-- 2. 为 hotels 表创建公开读取策略
DROP POLICY IF EXISTS "允许所有人查看启用的酒店" ON public.hotels;

CREATE POLICY "允许所有人查看启用的酒店"
ON public.hotels
FOR SELECT
USING (true);  -- 允许所有人读取

-- 3. 确保 RLS 已启用
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- 4. 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('hotels', 'cities');





