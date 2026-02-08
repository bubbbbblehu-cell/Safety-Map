import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockHotelData, generateHeatmapData } from '../data/mockHotelData';
import { CITIES } from '../constants/cities';

const MapScreen = ({ route, navigation }) => {
  const [city, setCity] = useState(route.params?.city || null);
  const [hotels, setHotels] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    loadCityData();
  }, [city]);

  const loadCityData = async () => {
    try {
      setLoading(true);
      
      // 如果没有传入城市参数，尝试从存储中读取
      let currentCity = city;
      if (!currentCity) {
        const savedCity = await AsyncStorage.getItem('selectedCity');
        if (savedCity) {
          currentCity = JSON.parse(savedCity);
          setCity(currentCity);
        } else {
          // 如果没有保存的城市，默认使用第一个城市
          currentCity = CITIES[0];
          setCity(currentCity);
        }
      }

      // 生成模拟数据
      const hotelData = generateMockHotelData(currentCity.id);
      setHotels(hotelData);
      
      // 生成热力图数据
      const heatmap = generateHeatmapData(hotelData);
      setHeatmapData(heatmap);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading city data:', error);
      setLoading(false);
    }
  };

  const handleMarkerPress = (hotel) => {
    // 可以显示酒店详情
    alert(`${hotel.name}\n安全评分: ${hotel.safetyScore}/5.0\n评价数: ${hotel.reviewCount}`);
  };

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
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={city.region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {showHeatmap && heatmapData.length > 0 && heatmapData.map((point, index) => {
          const intensity = point.weight || 0.5;
          const radius = 200 + intensity * 300; // 根据强度调整半径
          const opacity = 0.3 + intensity * 0.4; // 根据强度调整透明度
          
          // 根据强度选择颜色
          let fillColor = '#4ade80'; // 绿色 - 高安全
          if (intensity < 0.6) {
            fillColor = '#fbbf24'; // 黄色 - 中等安全
          }
          if (intensity < 0.4) {
            fillColor = '#f87171'; // 红色 - 低安全
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

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, showHeatmap && styles.controlButtonActive]}
          onPress={() => setShowHeatmap(!showHeatmap)}
        >
          <Text style={[styles.controlButtonText, showHeatmap && styles.controlButtonActiveText]}>
            {showHeatmap ? '隐藏热力图' : '显示热力图'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>安全评分图例</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
            <Text style={styles.legendText}>4.5-5.0 (很安全)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#fbbf24' }]} />
            <Text style={styles.legendText}>4.0-4.5 (较安全)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f87171' }]} />
            <Text style={styles.legendText}>3.5-4.0 (一般)</Text>
          </View>
        </View>
      </View>
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
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
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
    fontWeight: '500',
    fontSize: 14,
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
});

export default MapScreen;
