import { supabase } from '../config/supabase';

/**
 * 酒店数据服务
 * 提供与 Supabase 数据库交互的方法
 * 
 * 数据加载策略：
 * - 城市列表：从数据库动态加载（5个城市）
 * - 酒店数据：按城市ID加载（每个城市约100-150个酒店，共578个）
 * - 支持匿名访问（RLS已禁用）
 */

/**
 * 从数据库获取所有城市列表
 * @returns {Promise<Array>} 城市列表，按 display_order 排序
 */
export const getCities = async () => {
  try {
    console.log('📍 从数据库加载城市列表...');
    
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    
    console.log(`✅ 成功加载 ${data?.length || 0} 个城市`);
    return data || [];
  } catch (error) {
    console.error('❌ 获取城市列表失败:', error);
    throw error;
  }
};

/**
 * 根据城市ID获取该城市的所有酒店
 * @param {string} cityId - 城市ID (UUID格式)
 * @returns {Promise<Array>} 酒店列表，按安全评分降序排列
 */
export const getHotelsByCityId = async (cityId) => {
  try {
    console.log('🏨 查询酒店，城市ID:', cityId);
    
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_active', true)
      .order('safety_score', { ascending: false });

    if (error) {
      console.error('❌ Supabase 查询错误:', error);
      throw error;
    }
    
    console.log(`✅ 找到 ${data?.length || 0} 个酒店`);
    return data || [];
  } catch (error) {
    console.error('❌ 获取酒店列表失败:', error);
    throw error;
  }
};

/**
 * 获取酒店详情
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<Object>} 酒店详情（包含城市信息和评价）
 */
export const getHotelById = async (hotelId) => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        city:cities(*),
        reviews(
          *,
          user:user_profiles(*)
        )
      `)
      .eq('id', hotelId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取酒店详情失败:', error);
    throw error;
  }
};

/**
 * 获取酒店的评价列表
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<Array>} 评价列表
 */
export const getHotelReviews = async (hotelId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:user_profiles(*)
      `)
      .eq('hotel_id', hotelId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取评价列表失败:', error);
    throw error;
  }
};

/**
 * 添加酒店评价（需要用户登录）
 * @param {Object} review - 评价数据
 * @param {string} review.hotelId - 酒店ID
 * @param {string} review.userId - 用户ID
 * @param {number} review.rating - 评分（1-5）
 * @param {string} review.comment - 评价内容
 * @returns {Promise<Object>} 创建的评价
 */
export const addHotelReview = async (review) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          hotel_id: review.hotelId,
          user_id: review.userId,
          rating: review.rating,
          comment: review.comment,
          photos: review.photos || [],
          is_visible: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('添加评价失败:', error);
    throw error;
  }
};

/**
 * 获取用户收藏列表（需要用户登录）
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 收藏列表
 */
export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        hotel:hotels(
          *,
          city:cities(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    throw error;
  }
};

/**
 * 添加收藏（需要用户登录）
 * @param {string} userId - 用户ID
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<Object>} 创建的收藏
 */
export const addFavorite = async (userId, hotelId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: userId,
          hotel_id: hotelId,
        },
      ])
      .select()
      .single();

    if (error) {
      // 如果是重复收藏，忽略错误
      if (error.code === '23505') {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('添加收藏失败:', error);
    throw error;
  }
};

/**
 * 取消收藏（需要用户登录）
 * @param {string} userId - 用户ID
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, hotelId) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('hotel_id', hotelId);

    if (error) throw error;
  } catch (error) {
    console.error('取消收藏失败:', error);
    throw error;
  }
};

/**
 * 检查是否已收藏（需要用户登录）
 * @param {string} userId - 用户ID
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<boolean>} 是否已收藏
 */
export const isFavorite = async (userId, hotelId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('hotel_id', hotelId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

/**
 * 获取酒店统计信息
 * @param {string} cityId - 城市ID（可选）
 * @returns {Promise<Object>} 统计信息
 */
export const getHotelStats = async (cityId = null) => {
  try {
    let query = supabase
      .from('hotels')
      .select('id, safety_score, review_count', { count: 'exact' })
      .eq('is_active', true);

    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const stats = {
      totalHotels: count || 0,
      hotelsWithRating: data?.filter(h => h.safety_score > 0).length || 0,
      averageRating: 0,
      totalReviews: 0,
    };

    if (data && data.length > 0) {
      const hotelsWithRating = data.filter(h => h.safety_score > 0);
      if (hotelsWithRating.length > 0) {
        stats.averageRating =
          hotelsWithRating.reduce((sum, h) => sum + h.safety_score, 0) /
          hotelsWithRating.length;
      }
      stats.totalReviews = data.reduce((sum, h) => sum + (h.review_count || 0), 0);
    }

    return stats;
  } catch (error) {
    console.error('获取统计信息失败:', error);
    throw error;
  }
};

/**
 * 生成热力图数据
 * 根据酒店的安全评分生成热力图权重
 * @param {Array} hotels - 酒店列表
 * @returns {Array} 热力图数据点
 */
export const generateHeatmapData = (hotels) => {
  if (!hotels || hotels.length === 0) return [];

  return hotels.map(hotel => ({
    latitude: parseFloat(hotel.latitude),
    longitude: parseFloat(hotel.longitude),
    weight: hotel.safety_score / 5.0, // 归一化到 0-1
    intensity: hotel.safety_score / 5.0,
  }));
};

/**
 * 转换数据库酒店数据为应用格式
 * 将数据库字段（下划线命名）转换为前端字段（驼峰命名）
 * @param {Object} dbHotel - 数据库酒店对象
 * @returns {Object} 应用格式的酒店对象
 */
export const transformHotelData = (dbHotel) => {
  return {
    id: dbHotel.id,
    name: dbHotel.name,
    address: dbHotel.address,
    latitude: parseFloat(dbHotel.latitude),
    longitude: parseFloat(dbHotel.longitude),
    safetyScore: parseFloat(dbHotel.safety_score) || 0,
    reviewCount: dbHotel.review_count || 0,
    bookingUrl: dbHotel.booking_url,
    phone: dbHotel.phone,
    description: dbHotel.description,
    isVerified: dbHotel.is_verified,
    cityId: dbHotel.city_id,
  };
};

/**
 * 批量转换酒店数据
 * @param {Array} dbHotels - 数据库酒店数组
 * @returns {Array} 应用格式的酒店数组
 */
export const transformHotelsData = (dbHotels) => {
  if (!dbHotels || !Array.isArray(dbHotels)) return [];
  return dbHotels.map(transformHotelData);
};

/**
 * 转换数据库城市数据为应用格式
 * @param {Object} dbCity - 数据库城市对象
 * @returns {Object} 应用格式的城市对象
 */
export const transformCityData = (dbCity) => {
  return {
    id: dbCity.id,
    code: dbCity.code,
    name: dbCity.name,
    country: dbCity.country,
    latitude: parseFloat(dbCity.latitude),
    longitude: parseFloat(dbCity.longitude),
    region: {
      latitude: parseFloat(dbCity.latitude),
      longitude: parseFloat(dbCity.longitude),
      latitudeDelta: parseFloat(dbCity.latitude_delta) || 0.1,
      longitudeDelta: parseFloat(dbCity.longitude_delta) || 0.1,
    },
    zoomLevel: dbCity.zoom_level || 13,
    displayOrder: dbCity.display_order || 0,
  };
};

/**
 * 批量转换城市数据
 * @param {Array} dbCities - 数据库城市数组
 * @returns {Array} 应用格式的城市数组
 */
export const transformCitiesData = (dbCities) => {
  if (!dbCities || !Array.isArray(dbCities)) return [];
  return dbCities.map(transformCityData);
};
