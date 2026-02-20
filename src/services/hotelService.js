import { supabase } from '../config/supabase';

/**
 * 酒店数据服务
 * 提供与 Supabase 数据库交互的方法
 */

/**
 * 获取所有城市列表
 * @returns {Promise<Array>} 城市列表
 */
export const getCities = async () => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取城市列表失败:', error);
    throw error;
  }
};

/**
 * 根据城市ID获取酒店列表
 * @param {string} cityId - 城市ID (UUID)
 * @returns {Promise<Array>} 酒店列表
 */
export const getHotelsByCityId = async (cityId) => {
  try {
    console.log('查询酒店，城市ID:', cityId);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_active', true)
      .order('safety_score', { ascending: false });

    if (error) {
      console.error('Supabase 查询错误:', error);
      throw error;
    }
    console.log('查询结果:', data ? `找到 ${data.length} 个酒店` : '没有数据');
    return data || [];
  } catch (error) {
    console.error('获取酒店列表失败:', error);
    throw error;
  }
};

/**
 * 根据城市代码获取酒店列表
 * @param {string} cityCode - 城市代码（如 'xishuangbanna'）
 * @returns {Promise<Array>} 酒店列表
 */
export const getHotelsByCityCode = async (cityCode) => {
  try {
    console.log('查询酒店，城市代码:', cityCode);
    
    // 首先通过 code 获取城市的 UUID
    const { data: cityData, error: cityError } = await supabase
      .from('cities')
      .select('id')
      .eq('code', cityCode)
      .eq('is_active', true)
      .single();

    if (cityError) {
      console.error('查询城市失败:', cityError);
      throw cityError;
    }
    
    if (!cityData) {
      throw new Error(`城市不存在: ${cityCode}`);
    }

    console.log('找到城市 UUID:', cityData.id);

    // 然后用 UUID 查询酒店
    return await getHotelsByCityId(cityData.id);
  } catch (error) {
    console.error('获取酒店列表失败:', error);
    throw error;
  }
};



/**
 * 获取所有酒店（用于地图显示）
 * @param {Object} filters - 筛选条件
 * @param {number} filters.minRating - 最低评分
 * @param {string} filters.cityCode - 城市代码（如 'xishuangbanna'）
 * @param {string} filters.cityId - 城市 UUID（如果提供则直接使用，不查询 cities 表）
 * @returns {Promise<Array>} 酒店列表
 */
export const getAllHotels = async (filters = {}) => {
  try {
    console.log('getAllHotels 调用，筛选条件:', filters);
    
    let query = supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true);

    // 应用城市筛选
    if (filters.cityId) {
      console.log('使用城市 UUID 筛选:', filters.cityId);
      query = query.eq('city_id', filters.cityId);
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      console.log('按最低评分筛选:', filters.minRating);
      query = query.gte('safety_score', filters.minRating);
    }

    query = query.order('safety_score', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查询错误详情:', error);
      throw error;
    }
    
    console.log('查询成功，返回数据:', data ? `${data.length} 个酒店` : '空数组');
    if (data && data.length > 0) {
      console.log('第一个酒店示例:', data[0]);
    }
    
    return data || [];
  } catch (error) {
    console.error('获取酒店列表失败:', error);
    console.error('错误详情:', error.message);
    throw error;
  }
};

/**
 * 获取酒店详情
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<Object>} 酒店详情
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
 * 添加酒店评价
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
 * 获取用户收藏列表
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
 * 添加收藏
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
 * 取消收藏
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
 * 检查是否已收藏
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
 * @param {string} cityCode - 城市代码（可选）
 * @returns {Promise<Object>} 统计信息
 */
export const getHotelStats = async (cityCode = null) => {
  try {
    // 如果有城市代码，先获取城市 UUID
    let cityId = null;
    if (cityCode) {
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('id')
        .eq('code', cityCode)
        .eq('is_active', true)
        .single();

      if (cityError) throw cityError;
      if (cityData) cityId = cityData.id;
    }
    
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
          hotelsWithRatin.reduce((sum, h) => sum + h.safety_score, 0) /
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
 * @param {Array} hotels - 酒店列表
 * @returns {Array} 热力图数据点
 */
export const generateHeatmapData = (hotels) => {
  if (!hotels || hotels.length === 0) return [];

  return hotels.map(hotel => ({
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    weight: hotel.safety_score / 5.0, // 归一化到 0-1
    intensity: hotel.safety_score / 5.0,
  }));
};

/**
 * 转换数据库酒店数据为应用格式
 * @param {Object} dbHotel - 数据库酒店对象
 * @returns {Object} 应用格式的酒店对象
 */
export const transformHotelData = (dbHotel) => {
  console.log('转换酒店数据:', dbHotel.name, '经纬度:', dbHotel.latitude, dbHotel.longitude);
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

