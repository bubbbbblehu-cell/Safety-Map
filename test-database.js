/**
 * Supabase 数据库连接测试脚本
 * 用于验证数据库配置和检查数据
 */

import { supabase } from './src/config/supabase.js';

async function testDatabaseConnection() {
  console.log('=================================');
  console.log('Supabase 数据库连接测试');
  console.log('=================================\n');

  try {
    // 1. 测试基本连接
    console.log('1. 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('cities')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ 连接失败:', testError.message);
      return;
    }
    console.log('✅ 数据库连接成功！\n');

    // 2. 检查 cities 表
    console.log('2. 检查 cities 表...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true);
    
    if (citiesError) {
      console.error('❌ 查询 cities 表失败:', citiesError.message);
    } else {
      console.log(`✅ 找到 ${cities.length} 个城市`);
      if (cities.length > 0) {
        console.log('城市列表:');
        cities.forEach(city => {
          console.log(`  - ${city.name} (${city.code}) - ID: ${city.id}`);
        });
      }
    }
    console.log('');

    // 3. 检查 hotels 表
    console.log('3. 检查 hotels 表...');
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true);
    
    if (hotelsError) {
      console.error('❌ 查询 hotels 表失败:', hotelsError.message);
    } else {
      console.log(`✅ 找到 ${hotels.length} 个酒店`);
      
      if (hotels.length > 0) {
        console.log('\n酒店数据示例（前3个）:');
        hotels.slice(0, 3).forEach((hotel, index) => {
          console.log(`\n  酒店 ${index + 1}:`);
          console.log(`    名称: ${hotel.name}`);
          console.log(`    地址: ${hotel.address || '未提供'}`);
          console.log(`    安全评分: ${hotel.safety_score}`);
          console.log(`    评价数: ${hotel.review_count}`);
          console.log(`    坐标: ${hotel.latitude}, ${hotel.longitude}`);
          console.log(`    城市ID: ${hotel.city_id}`);
        });
        
        // 按城市统计
        console.log('\n按城市统计:');
        const cityStats = {};
        hotels.forEach(hotel => {
          const cityId = hotel.city_id;
          if (!cityStats[cityId]) {
            cityStats[cityId] = 0;
          }
          cityStats[cityId]++;
        });
        Object.entries(cityStats).forEach(([cityId, count]) => {
          console.log(`  城市 ${cityId}: ${count} 个酒店`);
        });
      } else {
        console.log('⚠️  数据库中没有酒店数据');
        console.log('请在 Supabase Dashboard 中导入酒店数据');
      }
    }
    console.log('');

    // 4. 测试关联查询
    if (hotels && hotels.length > 0) {
      console.log('4. 测试关联查询（hotels + cities）...');
      const { data: hotelsWithCity, error: joinError } = await supabase
        .from('hotels')
        .select(`
          *,
          city:cities(*)
        `)
        .eq('is_active', true)
        .limit(1);
      
      if (joinError) {
        console.error('❌ 关联查询失败:', joinError.message);
      } else if (hotelsWithCity && hotelsWithCity.length > 0) {
        console.log('✅ 关联查询成功');
        const hotel = hotelsWithCity[0];
        console.log(`示例: ${hotel.name} - ${hotel.city?.name || '未知城市'}`);
      }
    }

    console.log('\n=================================');
    console.log('测试完成！');
    console.log('=================================');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
    console.error('错误详情:', error.message);
  }
}

// 运行测试
testDatabaseConnection();





