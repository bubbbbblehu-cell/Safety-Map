import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CITIES_BY_COUNTRY } from '../constants/cities';

const CitySwitchScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCitySelect = async (city) => {
    try {
      // 保存选中的城市
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      
      // 更新地图页面
      navigation.setParams({ city });
      
      // 关闭模态框
      setModalVisible(false);
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
    <>
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.switchButtonText}>切换城市</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择城市</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {Object.entries(CITIES_BY_COUNTRY).map(([country, cities]) =>
                  renderCountrySection(country, cities)
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  switchButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
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
  modalScrollView: {
    flex: 1,
  },
  countrySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  cityButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});

export default CitySwitchScreen;
