import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhotoDetectionPanel from '../components/PhotoDetectionPanel';
import ProfilePanel from '../components/ProfilePanel';
import HotelDetailModal from '../components/HotelDetailModal';
import {
  getHotelsByCityId,
  getHotelStats,
  generateHeatmapData,
  transformHotelsData,
  getCities,
  transformCitiesData,
} from '../services/hotelService';

/**
 * 地图主界面
 * 
 * 功能：
 * - 显示选中城市的所有酒店
 * - 热力图可视化安全评分
 * - 酒店标记点击查看详情
 * - 评分筛选
 * - 收藏功能（本地存储，待实现用户登录后同步到数据库）
 */
const MapScreen = ({ route, navigation }) => {
  const [city, setCity] = useState(route.params?.city || null);
  const [hotels, setHotels] = useState([]); // 当前城市的所有酒店
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [minRating, setMinRating] = useState(0); // 最低评分筛选
  const [favorites, setFavorites] = useState([]); // 收藏列表（本地存储）
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterRating, setFilterRating] = useState('0');
  const [showCityModal, setShowCityModal] = useState(false); // 城市切换弹窗
  const [availableCities, setAvailableCities] = useState([]); // 可用城市列表

  // 加载城市数据
  useEffect(() => {
    loadCityData();
    loadFavorites();
    loadAvailableCities();
  }, [city]);

  // 使用 useMemo 优化筛选逻辑，避免重复计算
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => hotel.safetyScore >= minRating);
  }, [hotels, minRating]);

  // 当筛选条件变化时，更新热力图
  useEffect(() => {
    const heatmap = generateHeatmapData(filteredHotels);
    setHeatmapData(heatmap);
  }, [filteredHotels]);

  /**
   * 加载城市的酒店数据
   * 核心逻辑：按城市ID从数据库加载酒店
   */
  const loadCityData = async () => {
    try {
      setLoading(true);
      
      let currentCity = city;
      if (!currentCity) {
        // 如果没有传入城市，尝试从本地存储读取
        const savedCity = await AsyncStorage.getItem('selectedCity');
        if (savedCity) {
          currentCity = JSON.parse(savedCity);
          setCity(currentCity);
        } else {
          // 如果本地也没有，返回城市选择页面
          Alert.alert('提示', '请先选择城市', [
            { text: '确定', onPress: () => navigation.goBack() }
          ]);
          setLoading(false);
          return;
        }
      }

      console.log('========================================');
      console.log('📍 正在加载城市数据...');
      console.log('城市名称:', currentCity.name);
      console.log('城市ID:', currentCity.id);
      console.log('========================================');
      
      // 从数据库加载该城市的所有酒店
      const dbHotels = await getHotelsByCityId(currentCity.id);
      
      if (dbHotels && dbHotels.length > 0) {
        console.log('✅ 成功从数据库加载酒店数据！');
        console.log(`共 ${dbHotels.length} 个酒店`);
        
        // 转换数据格式
        const transformedHotels = transformHotelsData(dbHotels);
        setHotels(transformedHotels);
        
        // 生成热力图数据
        const heatmap = generateHeatmapData(transformedHotels);
        setHeatmapData(heatmap);
        
        console.log('========================================');
        console.log('✅ 数据加载完成！');
        console.log('========================================');
      } else {
        console.log('⚠️ 数据库返回空数组');
        Alert.alert('提示', `${currentCity.name}暂无酒店数据`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('========================================');
      console.error('❌ 数据加载失败');
      console.error('错误信息:', error.message);
      console.error('========================================');
      
      Alert.alert(
        '加载失败',
        `无法加载酒店数据\n\n错误: ${error.message}\n\n请检查网络连接`,
        [{ text: '确定' }]
      );
      
      setLoading(false);
    }
  };

  /**
   * 加载收藏列表（从本地存储）
   * TODO: 实现用户登录后，从数据库加载
   */
  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
    }
  };

  /**
   * 加载可用城市列表
   */
  const loadAvailableCities = async () => {
    try {
      const dbCities = await getCities();
      if (dbCities && dbCities.length > 0) {
        const transformedCities = transformCitiesData(dbCities);
        
        // 按国家分组
        const grouped = transformedCities.reduce((acc, city) => {
          if (!acc[city.country]) {
            acc[city.country] = [];
          }
          acc[city.country].push(city);
          return acc;
        }, {});
        
        setAvailableCities(grouped);
      }
    } catch (error) {
      console.error('加载城市列表失败:', error);
    }
  };

  /**
   * 切换城市
   */
  const handleCitySwitch = async (newCity) => {
    try {
      console.log('✅ 切换到城市:', newCity.name, 'ID:', newCity.id);
      
      // 保存选中的城市
      await AsyncStorage.setItem('selectedCity', JSON.stringify(newCity));
      
      // 更新当前城市
      setCity(newCity);
      
      // 关闭弹窗
      setShowCityModal(false);
      
      // 重新加载数据会由 useEffect 自动触发
    } catch (error) {
      console.error('切换城市失败:', error);
      Alert.alert('错误', '切换城市失败，请重试');
    }
  };

  /**
   * 点击酒店标记
   */
  const handleMarkerPress = (hotel) => {
    setSelectedHotel(hotel);
  };

  /**
   * 添加评价
   * TODO: 实现用户登录后，保存到数据库
   */
  const handleAddReview = async (review) => {
    try {
      // 更新酒店的评价数据（简单计算，实际应该从数据库重新加载）
      const updatedHotels = hotels.map(hotel => {
        if (hotel.id === review.hotelId) {
          const newReviewCount = (hotel.reviewCount || 0) + 1;
          const newScore = ((hotel.safetyScore * hotel.reviewCount) + review.rating) / newReviewCount;
          return {
            ...hotel,
            reviewCount: newReviewCount,
            safetyScore: Math.round(newScore * 10) / 10,
          };
        }
        return hotel;
      });
      setHotels(updatedHotels);
      
      // 保存评价到本地存储
      const reviews = await AsyncStorage.getItem('reviews');
      const reviewsList = reviews ? JSON.parse(reviews) : [];
      reviewsList.push(review);
      await AsyncStorage.setItem('reviews', JSON.stringify(reviewsList));
    } catch (error) {
      console.error('添加评价失败:', error);
    }
  };

  /**
   * 切换收藏状态
   * TODO: 实现用户登录后，同步到数据库
   */
  const handleToggleFavorite = async (hotel) => {
    try {
      const isFavorite = favorites.some(f => f.id === hotel.id);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(f => f.id !== hotel.id);
      } else {
        newFavorites = [...favorites, hotel];
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('切换收藏失败:', error);
    }
  };

  /**
   * 拍照检测
   */
  const handlePhotoDetection = () => {
    Alert.alert('拍照检测', '此功能正在开发中...');
  };

  /**
   * 应用筛选
   */
  const handleApplyFilter = () => {
    const rating = parseFloat(filterRating) || 0;
    setMinRating(rating);
    setShowFilterModal(false);
  };

  // 计算统计数据
  const totalHotels = hotels.length;
  const displayedHotels = filteredHotels.length;
  const hotelsWithRating = hotels.filter(h => h.safetyScore > 0).length;
  const isFavorite = selectedHotel ? favorites.some(f => f.id === selectedHotel.id) : false;

  if (loading || !city) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>加载地图中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 左侧：拍照检测面板 */}
      <PhotoDetectionPanel onPress={handlePhotoDetection} />

      {/* 中间：地图区域 */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={city.region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* 热力图 */}
          {showHeatmap && heatmapData.length > 0 && heatmapData.map((point, index) => {
            const intensity = point.weight || 0.5;
            const radius = 200 + intensity * 300;
            const opacity = 0.3 + intensity * 0.4;
            
            let fillColor = '#4ade80';
            if (intensity < 0.6) fillColor = '#fbbf24';
            if (intensity < 0.4) fillColor = '#f87171';
            
            return (
              <Circle
                key={`heatmap-${index}`}
                center={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                radius={radius}
                fillColor={fillColor}
                strokeColor={fillColor}
                strokeWidth={0}
                opacity={opacity}
              />
            );
          })}
          
          {/* 酒店标记 */}
          {filteredHotels.map((hotel) => (
            <Marker
              key={hotel.id}
              coordinate={{
                latitude: hotel.latitude,
                longitude: hotel.longitude,
              }}
              title={hotel.name}
              description={`安全评分: ${hotel.safetyScore}/5.0`}
              onPress={() => handleMarkerPress(hotel)}
              pinColor={getMarkerColor(hotel.safetyScore)}
            />
          ))}
        </MapView>

        {/* 左上角：酒店统计信息 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>酒店总数</Text>
            <Text style={styles.statsValue}>{totalHotels}</Text>
          </View>
          {minRating > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>筛选后</Text>
              <Text style={styles.statsValue}>{displayedHotels}</Text>
            </View>
          )}
        </View>

        {/* 右上角：控制按钮 */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowCityModal(true)}
          >
            <Text style={styles.controlButtonText}>
              {city?.name || '切换城市'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, showHeatmap && styles.controlButtonActive]}
            onPress={() => setShowHeatmap(!showHeatmap)}
          >
            <Text style={[styles.controlButtonText, showHeatmap && styles.controlButtonActiveText]}>
              热力图
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.controlButtonText}>
              筛选 {minRating > 0 ? `≥${minRating}` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowProfile(true)}
          >
            <Text style={styles.controlButtonText}>个人</Text>
          </TouchableOpacity>
        </View>

        {/* 底部图例 */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>安全评分图例</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
              <Text style={styles.legendText}>4.5-5.0</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#fbbf24' }]} />
              <Text style={styles.legendText}>4.0-4.5</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f87171' }]} />
              <Text style={styles.legendText}>3.5-4.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 右侧：个人中心面板 */}
      {showProfile && (
        <ProfilePanel
          favorites={favorites}
          onFavoritePress={(hotel) => {
            setSelectedHotel(hotel);
            setShowProfile(false);
          }}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* 酒店详情/评价弹窗 */}
      <HotelDetailModal
        visible={!!selectedHotel}
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
        onAddReview={handleAddReview}
        onToggleFavorite={() => selectedHotel && handleToggleFavorite(selectedHotel)}
        isFavorite={isFavorite}
      />

      {/* 筛选弹窗 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>筛选酒店</Text>
            <Text style={styles.filterLabel}>最低安全评分：</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="例如: 4.0"
              keyboardType="numeric"
              value={filterRating}
              onChangeText={setFilterRating}
            />
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, styles.filterButtonCancel]}
                onPress={() => {
                  setFilterRating('0');
                  setMinRating(0);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterButtonText}>清除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, styles.filterButtonApply]}
                onPress={handleApplyFilter}
              >
                <Text style={[styles.filterButtonText, styles.filterButtonTextApply]}>应用</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 城市切换弹窗 */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cityModal}>
            <View style={styles.cityModalHeader}>
              <Text style={styles.cityModalTitle}>切换城市</Text>
              <TouchableOpacity
                onPress={() => setShowCityModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.cityModalScroll}>
              {Object.entries(availableCities).map(([country, cities]) => (
                <View key={country} style={styles.countrySection}>
                  <Text style={styles.countryTitle}>{country}</Text>
                  <View style={styles.citiesContainer}>
                    {cities.map((cityItem) => (
                      <TouchableOpacity
                        key={cityItem.id}
                        style={[
                          styles.cityButton,
                          city?.id === cityItem.id && styles.cityButtonActive
                        ]}
                        onPress={() => handleCitySwitch(cityItem)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.cityButtonText,
                          city?.id === cityItem.id && styles.cityButtonTextActive
                        ]}>
                          {cityItem.name}
                        </Text>
                        <Text style={[
                          styles.cityCode,
                          city?.id === cityItem.id && styles.cityCodeActive
                        ]}>
                          {cityItem.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * 根据安全评分获取标记颜色
 */
const getMarkerColor = (safetyScore) => {
  if (safetyScore >= 4.5) return 'green';
  if (safetyScore >= 4.0) return 'orange';
  return 'red';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  topControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonActive: {
    backgroundColor: '#6366f1',
  },
  controlButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  controlButtonActiveText: {
    color: '#fff',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  filterButtonApply: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterButtonTextApply: {
    color: '#fff',
  },
  cityModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cityModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  cityModalScroll: {
    flex: 1,
    padding: 16,
  },
  countrySection: {
    marginBottom: 24,
  },
  countryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 12,
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cityButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cityButtonActive: {
    backgroundColor: '#6366f1',
  },
  cityButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cityButtonTextActive: {
    color: '#fff',
  },
  cityCode: {
    fontSize: 12,
    color: '#999',
  },
  cityCodeActive: {
    color: '#e0e7ff',
  },
});

export default MapScreen;
