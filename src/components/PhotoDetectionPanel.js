import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const PhotoDetectionPanel = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.buttonText}>拍照检测</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    width: 56,
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PhotoDetectionPanel;
