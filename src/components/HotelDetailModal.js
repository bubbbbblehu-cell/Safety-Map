import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';

const HotelDetailModal = ({
  visible,
  hotel,
  onClose,
  onAddReview,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!hotel) return null;

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      Alert.alert('提示', '请输入评价内容');
      return;
    }
    onAddReview({
      hotelId: hotel.id,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    });
    setComment('');
    setRating(5);
    Alert.alert('成功', '评价已提交');
  };

  const handleOpenPlatform = () => {
    // 尝试打开在线平台（这里使用示例URL，实际应该根据酒店信息生成）
    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('错误', '无法打开链接');
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.infoSection}>
              <Text style={styles.label}>安全评分</Text>
              <Text style={styles.value}>{hotel.safetyScore}/5.0</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>评价数量</Text>
              <Text style={styles.value}>{hotel.reviewCount} 条</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, isFavorite && styles.favoriteButton]}
                onPress={onToggleFavorite}
              >
                <Text style={[styles.actionButtonText, isFavorite && styles.favoriteButtonText]}>
                  {isFavorite ? '★ 已收藏' : '☆ 收藏'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.platformButton]}
                onPress={handleOpenPlatform}
              >
                <Text style={styles.actionButtonText}>查看在线平台</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>添加评价</Text>
              
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>评分：</Text>
                <View style={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      style={[
                        styles.starButton,
                        rating >= star && styles.starButtonActive,
                      ]}
                      onPress={() => setRating(star)}
                    >
                      <Text style={[
                        styles.starText,
                        rating >= star && styles.starTextActive,
                      ]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="请输入您的评价..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitButtonText}>提交评价</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  content: {
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  favoriteButton: {
    backgroundColor: '#fbbf24',
  },
  platformButton: {
    backgroundColor: '#6366f1',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  favoriteButtonText: {
    color: '#fff',
  },
  reviewSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  starButtonActive: {
    backgroundColor: '#fbbf24',
  },
  starText: {
    fontSize: 20,
    color: '#ccc',
  },
  starTextActive: {
    color: '#fff',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HotelDetailModal;
