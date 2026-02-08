import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CITIES_BY_COUNTRY } from '../constants/cities';

const CitySelectionScreen = ({ navigation }) => {
  const handleCitySelect = async (city) => {
    try {
      // 标记应用已启动
      await AsyncStorage.setItem('hasLaunched', 'true');
      // 保存选中的城市
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      
      // 导航到地图页面
      navigation.replace('Map', { city });
    } catch (error) {
      console.error('Error saving city selection:', error);
    }
  };

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
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>欢迎使用女性安全地图</Text>
        <Text style={styles.subtitle}>请选择您要查看的城市</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {Object.entries(CITIES_BY_COUNTRY).map(([country, cities]) =>
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
  },
});

export default CitySelectionScreen;
