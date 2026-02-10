-- ============================================
-- 临时禁用 RLS 以测试数据访问
-- ============================================

-- 1. 检查当前 RLS 状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('hotels', 'cities');

-- 2. 临时禁用 hotels 表的 RLS（仅用于测试）
ALTER TABLE public.hotels DISABLE ROW LEVEL SECURITY;

-- 3. 临时禁用 cities 表的 RLS（仅用于测试）
ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;

-- 4. 测试查询
SELECT COUNT(*) as total_hotels FROM public.hotels;
SELECT COUNT(*) as active_hotels FROM public.hotels WHERE is_active = true;

-- ============================================
-- 测试完成后，重新启用 RLS（重要！）
-- ============================================

-- ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;





