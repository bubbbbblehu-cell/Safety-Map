// 模拟酒店安全评价数据
// 在实际应用中，这些数据应该从后端API获取

export const generateMockHotelData = (cityIdOrCode) => {
  // 兼容旧的 code 格式
  const cityId = cityIdOrCode;
  // 为不同城市生成不同的模拟数据
  const baseData = {
    xishuangbanna: [
      { id: 1, name: '西双版纳万达文华酒店', latitude: 22.0084, longitude: 100.7979, safetyScore: 4.5, reviewCount: 128 },
      { id: 2, name: '景洪大酒店', latitude: 22.0150, longitude: 100.8100, safetyScore: 4.2, reviewCount: 95 },
      { id: 3, name: '西双版纳洲际酒店', latitude: 22.0000, longitude: 100.7900, safetyScore: 4.8, reviewCount: 156 },
    ],
    guiyang: [
      { id: 1, name: '贵阳喜来登酒店', latitude: 26.6470, longitude: 106.6302, safetyScore: 4.3, reviewCount: 112 },
      { id: 2, name: '贵阳凯宾斯基酒店', latitude: 26.6550, longitude: 106.6400, safetyScore: 4.6, reviewCount: 89 },
      { id: 3, name: '贵阳万丽酒店', latitude: 26.6400, longitude: 106.6200, safetyScore: 4.4, reviewCount: 76 },
    ],
    bangkok: [
      { id: 1, name: '曼谷文华东方酒店', latitude: 13.7563, longitude: 100.5018, safetyScore: 4.7, reviewCount: 234 },
      { id: 2, name: '曼谷半岛酒店', latitude: 13.7500, longitude: 100.5100, safetyScore: 4.5, reviewCount: 198 },
      { id: 3, name: '曼谷素可泰酒店', latitude: 13.7600, longitude: 100.4950, safetyScore: 4.3, reviewCount: 167 },
    ],
    shanghai: [
      { id: 1, name: '上海外滩茂悦大酒店', latitude: 31.2304, longitude: 121.4737, safetyScore: 4.6, reviewCount: 312 },
      { id: 2, name: '上海和平饭店', latitude: 31.2350, longitude: 121.4800, safetyScore: 4.8, reviewCount: 289 },
      { id: 3, name: '上海半岛酒店', latitude: 31.2250, longitude: 121.4700, safetyScore: 4.7, reviewCount: 256 },
    ],
    naples: [
      { id: 1, name: '那不勒斯大饭店', latitude: 40.8518, longitude: 14.2681, safetyScore: 4.2, reviewCount: 145 },
      { id: 2, name: '那不勒斯皇家酒店', latitude: 40.8550, longitude: 14.2700, safetyScore: 4.4, reviewCount: 132 },
      { id: 3, name: '那不勒斯地中海酒店', latitude: 40.8480, longitude: 14.2650, safetyScore: 4.1, reviewCount: 98 },
    ],
  };

  return baseData[cityId] || [];
};

// 生成热力图数据点（基于酒店数据生成密度点）
export const generateHeatmapData = (hotels) => {
  const heatmapPoints = [];
  
  hotels.forEach((hotel) => {
    // 根据安全评分和评价数量生成热力点
    const intensity = (hotel.safetyScore / 5) * (hotel.reviewCount / 100);
    
    // 在酒店周围生成多个点以形成热力图效果
    for (let i = 0; i < Math.ceil(hotel.reviewCount / 10); i++) {
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      
      heatmapPoints.push({
        latitude: hotel.latitude + offsetLat,
        longitude: hotel.longitude + offsetLng,
        weight: intensity,
      });
    }
  });

  return heatmapPoints;
};
