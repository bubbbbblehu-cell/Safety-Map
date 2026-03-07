import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCities, transformCitiesData } from '../services/hotelService';

/**
 * 城市选择界面
 * 
 * 功能：
 * - 从数据库动态加载城市列表
 * - 按国家分组显示
 * - 保存用户选择到本地存储
 */
const CitySelectionScreen = ({ navigation }) => {
  const [cities, setCities] = useState([]);
  const [citiesByCountry, setCitiesByCountry] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  /**
   * 从数据库加载城市列表
   */
  const loadCities = async () => {
    try {
      console.log('📍 加载城市列表...');
      
      // 从数据库获取城市
      const dbCities = await getCities();
      
      if (dbCities && dbCities.length > 0) {
        console.log(`✅ 成功加载 ${dbCities.length} 个城市`);
        
        // 转换数据格式
        const transformedCities = transformCitiesData(dbCities);
        setCities(transformedCities);
        
        // 按国家分组
        const grouped = transformedCities.reduce((acc, city) => {
          if (!acc[city.country]) {
            acc[city.country] = [];
          }
          acc[city.country].push(city);
          return acc;
        }, {});
        
        setCitiesByCountry(grouped);
        console.log('✅ 城市分组完成:', Object.keys(grouped));
      } else {
        console.log('⚠️ 数据库中没有城市数据');
        Alert.alert('提示', '数据库中没有城市数据');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ 加载城市列表失败:', error);
      Alert.alert(
        '加载失败',
        `无法加载城市列表\n\n错误: ${error.message}\n\n请检查网络连接`,
        [
          { text: '重试', onPress: loadCities },
          { text: '取消', style: 'cancel' }
        ]
      );
      setLoading(false);
    }
  };

  /**
   * 选择城市
   */
  const handleCitySelect = async (city) => {
    try {
      console.log('✅ 用户选择城市:', city.name, 'ID:', city.id);
      
      // 标记应用已启动
      await AsyncStorage.setItem('hasLaunched', 'true');
      
      // 保存选中的城市
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      
      // 导航到地图页面
      navigation.replace('Map', { city });
    } catch (error) {
      console.error('保存城市选择失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  /**
   * 渲染国家分组
   */
  const renderCountrySection = (country, cities) => (
    <View key={country} style={styles.countrySection}>
      <Text style={styles.countryTitle}>{country}</Text>
      <View style={styles.citiesContainer}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city.id}
            style={styles.cityButton}
            onPress={() => handleCitySelect(city)}
            activeOpacity={0.7}
          >
            <Text style={styles.cityButtonText}>{city.name}</Text>
            <Text style={styles.cityCode}>{city.code}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>加载城市列表...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>欢迎使用女性安全地图</Text>
        <Text style={styles.subtitle}>请选择您要查看的城市</Text>
        <Text style={styles.cityCount}>共 {cities.length} 个城市可选</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {Object.entries(citiesByCountry).map(([country, cities]) =>
          renderCountrySection(country, cities)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  cityCount: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    paddingLeft: 4,
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cityButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  cityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cityCode: {
    fontSize: 12,
    color: '#999',
  },
});

export default CitySelectionScreen;
