// 支持的城市列表及其坐标信息
export const CITIES = [
  {
    id: 'a26978da-4f18-42e6-8949-624d108b6c24', // 西双版纳的数据库 UUID
    code: 'xishuangbanna',
    name: '西双版纳',
    country: '中国',
    latitude: 22.0084,
    longitude: 100.7979,
    region: {
      latitude: 22.0084,
      longitude: 100.7979,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    id: 'guiyang',
    name: '贵阳',
    country: '中国',
    latitude: 26.6470,
    longitude: 106.6302,
    region: {
      latitude: 26.6470,
      longitude: 106.6302,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    id: 'bangkok',
    name: '曼谷',
    country: '泰国',
    latitude: 13.7563,
    longitude: 100.5018,
    region: {
      latitude: 13.7563,
      longitude: 100.5018,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    id: 'shanghai',
    name: '上海',
    country: '中国',
    latitude: 31.2304,
    longitude: 121.4737,
    region: {
      latitude: 31.2304,
      longitude: 121.4737,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    id: 'naples',
    name: '那不勒斯',
    country: '意大利',
    latitude: 40.8518,
    longitude: 14.2681,
    region: {
      latitude: 40.8518,
      longitude: 14.2681,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
];

// 按国家分组城市
export const CITIES_BY_COUNTRY = CITIES.reduce((acc, city) => {
  if (!acc[city.country]) {
    acc[city.country] = [];
  }
  acc[city.country].push(city);
  return acc;
}, {});
