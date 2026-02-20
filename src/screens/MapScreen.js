import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockHotelData, generateHeatmapData as generateMockHeatmap } from '../data/mockHotelData';
import { CITIES } from '../constants/cities';
import PhotoDetectionPanel from '../components/PhotoDetectionPanel';
import ProfilePanel from '../components/ProfilePanel';
import HotelDetailModal from '../components/HotelDetailModal';
import {
  getAllHotels,
  getHotelStats,
  generateHeatmapData,
  transformHotelsData,
  addHotelReview,
  addFavorite,
  removeFavorite,
  getUserFavorites,
} from '../services/hotelService';

const MapScreen = ({ route, navigation }) => {
  const [city, setCity] = useState(route.params?.city || null);
  const [allHotels, setAllHotels] = useState([]); // 所有酒店数据
  const [hotels, setHotels] = useState([]); // 筛选后的酒店
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [minRating, setMinRating] = useState(0); // 最低评分筛选
  const [favorites, setFavorites] = useState([]); // 收藏列表
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterRating, setFilterRating] = useState('0');

  useEffect(() => {
    loadCityData();
    loadFavorites();
  }, [city]);

  useEffect(() => {
    // 当筛选条件或所有酒店数据变化时，更新显示的酒店
    filterHotels();
  }, [minRating, allHotels]);

  const loadCityData = async () => {
    try {
      setLoading(true);
      
      let currentCity = city;
      if (!currentCity) {
        // 清除旧的缓存数据（临时）
        await AsyncStorage.removeItem('selectedCity');
        
        currentCity = CITIES[0];
        console.log('🔍 从 CITIES 数组获取的城市:', JSON.stringify(currentCity, null, 2));
        setCity(currentCity);
        // 保存新的城市数据
        await AsyncStorage.setItem('selectedCity', JSON.stringify(currentCity));
      } else {
        console.log('🔍 使用传入的城市参数:', JSON.stringify(currentCity, null, 2));
      }

      // 尝试从数据库加载酒店数据
      try {
        console.log('========================================');
        console.log('正在从数据库加载酒店数据...');
        console.log('当前城市:', currentCity.name);
        console.log('城市ID (UUID):', currentCity.id);
        console.log('========================================');
        
        // 直接使用城市 UUID 筛选酒店数据
        const dbHotels = await getAllHotels({ 
          cityId: currentCity.id
        });
        
        console.log(`数据库查询结果: ${dbHotels ? dbHotels.length : 0} 个酒店`);
        
        if (dbHotels && dbHotels.length > 0) {
          console.log('✅ 成功从数据库加载酒店数据！');
          console.log('前3个酒店示例:');
          dbHotels.slice(0, 3).forEach((hotel, i) => {
            console.log(`  ${i+1}. ${hotel.name} - 评分: ${hotel.safety_score}`);
          });
          
          const transformedHotels = transformHotelsData(dbHotels);
          console.log(`转换后的酒店数据: ${transformedHotels.length} 个`);
          
          setAllHotels(transformedHotels);
          
          const heatmap = generateHeatmapData(transformedHotels);
          console.log(`生成热力图数据点: ${heatmap.length} 个`);
          setHeatmapData(heatmap);
          
          console.log('========================================');
          console.log('✅ 数据库酒店数据已成功加载到地图！');
          console.log('========================================');
        } else {
          console.log('⚠️ 数据库返回空数组，使用模拟数据');
          const hotelData = generateMockHotelData(currentCity.id);
          setAllHotels(hotelData);
          
          const heatmap = generateMockHeatmap(hotelData);
          setHeatmapData(heatmap);
          
          Alert.alert(
            '提示',
            '数据库查询返回空结果。\n\n可能原因:\n1. 数据的 is_active 字段为 false\n2. RLS 策略阻止访问\n\n正在使用演示数据。',
            [{ text: '确定' }]
          );
        }
      } catch (dbError) {
        console.error('========================================');
        console.error('❌ 数据库加载失败');
        console.error('错误类型:', dbError.name);
        console.error('错误信息:', dbError.message);
        console.error('完整错误:', dbError);
        console.error('========================================');
        
        // 如果数据库加载失败，回退到模拟数据
        const hotelData = generateMockHotelData(currentCity.id);
        setAllHotels(hotelData);
        
        const heatmap = generateMockHeatmap(hotelData);
        setHeatmapData(heatmap);
        
        // 显示提示信息
        Alert.alert(
          '数据库连接失败',
          `无法从数据库加载数据，正在使用演示数据。\n\n错误: ${dbError.message}\n\n请检查:\n1. 网络连接\n2. Supabase API 密钥\n3. RLS 策略设置`,
          [{ text: '确定' }]
        );
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading city data:', error);
      setLoading(false);
      Alert.alert('错误', '加载数据失败，请重试');
    }
  };

  const loadFavorites = async () => {
    try {
      // 尝试从数据库加载收藏（需要用户登录）
      // 暂时使用本地存储
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterHotels = () => {
    const filtered = allHotels.filter(hotel => hotel.safetyScore >= minRating);
    setHotels(filtered);
    
    // 更新热力图数据
    const heatmap = generateHeatmapData(filtered);
    setHeatmapData(heatmap);
  };

  const handleMarkerPress = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleAddReview = async (review) => {
    try {
      // 更新酒店的评价数据（在实际应用中应该调用API）
      const updatedHotels = allHotels.map(hotel => {
        if (hotel.id === review.hotelId) {
          const newReviewCount = (hotel.reviewCount || 0) + 1;
          // 简单计算新评分（实际应该更复杂）
          const newScore = ((hotel.safetyScore * hotel.reviewCount) + review.rating) / newReviewCount;
          return {
            ...hotel,
            reviewCount: newReviewCount,
            safetyScore: Math.round(newScore * 10) / 10,
          };
        }
        return hotel;
      });
      setAllHotels(updatedHotels);
      
      // 保存评价到本地存储
      const reviews = await AsyncStorage.getItem('reviews');
      const reviewsList = reviews ? JSON.parse(reviews) : [];
      reviewsList.push(review);
      await AsyncStorage.setItem('reviews', JSON.stringify(reviewsList));
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

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
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePhotoDetection = async () => {
    // Coze agent URL - 请替换为你的实际 Coze agent 链接
    const cozeAgentUrl = 'https://www.coze.cn/store/bot/YOUR_BOT_ID';
    
    try {
      const supported = await Linking.canOpenURL(cozeAgentUrl);
      
      if (supported) {
        await Linking.openURL(cozeAgentUrl);
      } else {
        Alert.alert('错误', '无法打开 AI 助手链接');
      }
    } catch (error) {
      console.error('打开 Coze agent 失败:', error);
      Alert.alert('错误', '打开 AI 助手失败，请稍后重试');
    }
  };

  const handleApplyFilter = () => {
    const rating = parseFloat(filterRating) || 0;
    setMinRating(rating);
    setShowFilterModal(false);
  };

  // 计算统计数据
  const totalHotels = allHotels.length;
  const hotelsWithRating = allHotels.filter(h => h.safetyScore > 0).length;
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
          {showHeatmap && heatmapData.length > 0 && heatmapData.map((point, index) => {
            const intensity = point.weight || 0.5;
            const radius = 200 + intensity * 300;
            const opacity = 0.3 + intensity * 0.4;
            
            let fillColor = '#4ade80';
            if (intensity < 0.6) {
              fillColor = '#fbbf24';
            }
            if (intensity < 0.4) {
              fillColor = '#f87171';
            }
            
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
          
          {hotels.map((hotel) => (
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
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>已评分</Text>
            <Text style={styles.statsValue}>{hotelsWithRating}</Text>
          </View>
        </View>

        {/* 右上角：控制按钮 */}
        <View style={styles.topControls}>
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
    </View>
  );
};

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
});

export default MapScreen;
