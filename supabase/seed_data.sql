-- ============================================
-- 初始数据种子文件
-- ============================================

-- 插入城市数据
INSERT INTO cities (code, name, country, latitude, longitude, latitude_delta, longitude_delta, zoom_level, display_order) VALUES
('xishuangbanna', '西双版纳', '中国', 22.0084, 100.7979, 0.1, 0.1, 13, 1),
('guiyang', '贵阳', '中国', 26.6470, 106.6302, 0.1, 0.1, 13, 2),
('shanghai', '上海', '中国', 31.2304, 121.4737, 0.1, 0.1, 13, 3),
('bangkok', '曼谷', '泰国', 13.7563, 100.5018, 0.1, 0.1, 13, 4),
('naples', '那不勒斯', '意大利', 40.8518, 14.2681, 0.1, 0.1, 13, 5)
ON CONFLICT (code) DO NOTHING;

-- 插入示例酒店数据（需要先获取城市ID）
-- 注意：这里使用子查询获取城市ID，实际使用时可能需要调整
INSERT INTO hotels (city_id, name, latitude, longitude, safety_score, review_count, booking_url, is_verified, is_active)
SELECT 
    c.id,
    hotel_data.name,
    hotel_data.latitude,
    hotel_data.longitude,
    hotel_data.safety_score,
    hotel_data.review_count,
    hotel_data.booking_url,
    true,
    true
FROM (
    VALUES
    ('xishuangbanna', '西双版纳万达文华酒店', 22.0084, 100.7979, 4.5, 128, 'https://www.booking.com/searchresults.html?ss=西双版纳万达文华酒店'),
    ('xishuangbanna', '景洪大酒店', 22.0150, 100.8100, 4.2, 95, 'https://www.booking.com/searchresults.html?ss=景洪大酒店'),
    ('xishuangbanna', '西双版纳洲际酒店', 22.0000, 100.7900, 4.8, 156, 'https://www.booking.com/searchresults.html?ss=西双版纳洲际酒店'),
    ('guiyang', '贵阳喜来登酒店', 26.6470, 106.6302, 4.3, 112, 'https://www.booking.com/searchresults.html?ss=贵阳喜来登酒店'),
    ('guiyang', '贵阳凯宾斯基酒店', 26.6550, 106.6400, 4.6, 89, 'https://www.booking.com/searchresults.html?ss=贵阳凯宾斯基酒店'),
    ('guiyang', '贵阳万丽酒店', 26.6400, 106.6200, 4.4, 76, 'https://www.booking.com/searchresults.html?ss=贵阳万丽酒店'),
    ('bangkok', '曼谷文华东方酒店', 13.7563, 100.5018, 4.7, 234, 'https://www.booking.com/searchresults.html?ss=曼谷文华东方酒店'),
    ('bangkok', '曼谷半岛酒店', 13.7500, 100.5100, 4.5, 198, 'https://www.booking.com/searchresults.html?ss=曼谷半岛酒店'),
    ('bangkok', '曼谷素可泰酒店', 13.7600, 100.4950, 4.3, 167, 'https://www.booking.com/searchresults.html?ss=曼谷素可泰酒店'),
    ('shanghai', '上海外滩茂悦大酒店', 31.2304, 121.4737, 4.6, 312, 'https://www.booking.com/searchresults.html?ss=上海外滩茂悦大酒店'),
    ('shanghai', '上海和平饭店', 31.2350, 121.4800, 4.8, 289, 'https://www.booking.com/searchresults.html?ss=上海和平饭店'),
    ('shanghai', '上海半岛酒店', 31.2250, 121.4700, 4.7, 256, 'https://www.booking.com/searchresults.html?ss=上海半岛酒店'),
    ('naples', '那不勒斯大饭店', 40.8518, 14.2681, 4.2, 145, 'https://www.booking.com/searchresults.html?ss=那不勒斯大饭店'),
    ('naples', '那不勒斯皇家酒店', 40.8550, 14.2700, 4.4, 132, 'https://www.booking.com/searchresults.html?ss=那不勒斯皇家酒店'),
    ('naples', '那不勒斯地中海酒店', 40.8480, 14.2650, 4.1, 98, 'https://www.booking.com/searchresults.html?ss=那不勒斯地中海酒店')
) AS hotel_data(city_code, name, latitude, longitude, safety_score, review_count, booking_url)
JOIN cities c ON c.code = hotel_data.city_code
ON CONFLICT DO NOTHING;
