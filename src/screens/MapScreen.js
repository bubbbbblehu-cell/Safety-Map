import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '../config/supabase';

const MapScreen = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      console.log('🔥 开始加载酒店数据...');
      
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('safety_score', { ascending: false });

      if (error) {
        console.error('❌ 查询错误:', error);
        Alert.alert('错误', error.message);
        setLoading(false);
        return;
      }

      console.log('✅ 查询成功！获取到', data?.length || 0, '个酒店');

      if (data && data.length > 0) {
        // 转换数据
        const transformedHotels = data.map(h => ({
          id: h.id,
          name: h.name,
          address: h.address,
          latitude: parseFloat(h.latitude),
          longitude: parseFloat(h.longitude),
          safetyScore: parseFloat(h.safety_score) || 0,
        }));

        console.log('✅ 转换完成，设置', transformedHotels.length, '个酒店');
        setHotels(transformedHotels);
      } else {
        console.log('⚠️ 没有数据');
        Alert.alert('提示', '数据库中没有酒店数据');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ 加载失败:', err);
      Alert.alert('错误', err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 22.0084,
          longitude: 100.7979,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {/* 热力图 */}
        {showHeatmap && hotels.map((hotel, index) => (
          <Circle
            key={`heat-${index}`}
            center={{
              latitude: hotel.latitude,
              longitude: hotel.longitude,
            }}
            radius={300}
            fillColor={hotel.safetyScore >= 4.5 ? '#4ade8066' : hotel.safetyScore >= 4.0 ? '#fbbf2466' : '#f8717166'}
            strokeWidth={0}
          />
        ))}

        {/* 酒店标记 */}
        {hotels.map((hotel) => (
          <Marker
            key={hotel.id}
            coordinate={{
              latitude: hotel.latitude,
              longitude: hotel.longitude,
            }}
            title={hotel.name}
            description={`评分: ${hotel.safetyScore}/5.0`}
            pinColor={hotel.safetyScore >= 4.5 ? 'green' : hotel.safetyScore >= 4.0 ? 'orange' : 'red'}
          />
        ))}
      </MapView>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>酒店总数</Text>
          <Text style={styles.statsValue}>{hotels.length}</Text>
        </View>
      </View>

      {/* 热力图开关 */}
      <TouchableOpacity
        style={[styles.heatmapButton, showHeatmap && styles.heatmapButtonActive]}
        onPress={() => setShowHeatmap(!showHeatmap)}
      >
        <Text style={[styles.buttonText, showHeatmap && styles.buttonTextActive]}>
          热力图
        </Text>
      </TouchableOpacity>
    </View>
  );
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
  statsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  heatmapButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  heatmapButtonActive: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default MapScreen;
