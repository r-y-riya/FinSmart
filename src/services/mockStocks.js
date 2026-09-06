/**
 * Pre-seeded stock universe with intraday chart data, baseline snapshots,
 * and historical event logs for FinSmart.
 */

export const INITIAL_STOCKS = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 1428.30,
    previousClose: 1475.50,
    dayOpen: 1462.00,
    dayHigh: 1480.00,
    dayLow: 1416.00,
    volume: 4200000,
    averageVolume: 2514000,
    fiftyTwoWeekHigh: 1600.00,
    fiftyTwoWeekLow: 1050.00,
    marketCap: '₹19.4 Lakh Cr',
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    lastVisitedSnapshot: {
      price: 1475.00,
      volume: 1800000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(), // 7h 42m ago
    },
    sparkline: [1475, 1478, 1465, 1450, 1442, 1435, 1420, 1428.30],
    chartHistory: [
      { time: '09:15', price: 1472, volume: 150000 },
      { time: '09:45', price: 1478, volume: 380000 },
      { time: '10:00', price: 1465, volume: 720000 },
      { time: '10:30', price: 1448, volume: 1400000, isEvent: true, eventTitle: 'Volume Spike' },
      { time: '11:00', price: 1432, volume: 1950000 },
      { time: '11:30', price: 1421, volume: 2600000, isEvent: true, eventTitle: 'Threshold Breach -3%' },
      { time: '12:15', price: 1416, volume: 3100000 },
      { time: '13:00', price: 1424, volume: 3600000 },
      { time: '13:45', price: 1428.30, volume: 4200000 }
    ],
    timeline: [
      { id: 'rel-1', time: '10:35 AM', type: 'PRICE_DROP', title: 'Price ↓ 3.2%', note: 'Crossed configured 2.0% significance threshold', severity: 'HIGH' },
      { id: 'rel-2', time: '09:50 AM', type: 'VOLUME_SURGE', title: 'Volume ↑ 67%', note: 'Trading activity surged significantly higher than daily average', severity: 'HIGH' },
      { id: 'rel-3', time: 'Yesterday', type: 'PRICE_RISE', title: 'Price ↑ 1.1%', note: 'Stable post-earnings accumulation', severity: 'NORMAL' },
    ],
    events: [
      { id: 'e1', type: 'PRICE', label: 'Price dropped 3.2%', detail: 'Crossed your significance threshold (2.0%).', color: 'peach' },
      { id: 'e2', type: 'VOLUME', label: 'Volume increased 67%', detail: 'Trading activity is unusually high (4.2M vs 2.5M avg).', color: 'yellow' }
    ]
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 1481.20,
    previousClose: 1455.00,
    dayOpen: 1458.00,
    dayHigh: 1488.00,
    dayLow: 1454.00,
    volume: 3850000,
    averageVolume: 2600000,
    fiftyTwoWeekHigh: 1950.00,
    fiftyTwoWeekLow: 1350.00,
    marketCap: '₹6.1 Lakh Cr',
    lastUpdated: new Date(Date.now() - 1.5 * 60 * 1000).toISOString(), // 1.5 mins ago
    lastVisitedSnapshot: {
      price: 1460.00,
      volume: 1200000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [1455, 1460, 1462, 1470, 1475, 1472, 1480, 1481.20],
    chartHistory: [
      { time: '09:15', price: 1456, volume: 180000 },
      { time: '09:45', price: 1462, volume: 490000 },
      { time: '10:15', price: 1468, volume: 1100000, isEvent: true, eventTitle: 'Volume surge +48%' },
      { time: '11:00', price: 1474, volume: 1800000 },
      { time: '12:00', price: 1479, volume: 2400000 },
      { time: '13:00', price: 1476, volume: 3000000 },
      { time: '13:45', price: 1481.20, volume: 3850000 }
    ],
    timeline: [
      { id: 'inf-1', time: '10:15 AM', type: 'VOLUME_SURGE', title: 'Volume ↑ 48%', note: 'Elevated participation following sector benchmark adjustments', severity: 'MEDIUM' },
      { id: 'inf-2', time: '09:30 AM', type: 'PRICE_RISE', title: 'Price ↑ 1.8%', note: 'Opening momentum holding above pivot levels', severity: 'MEDIUM' },
      { id: 'inf-3', time: 'Yesterday', type: 'NEUTRAL', title: 'Volume Flat', note: 'Standard rangebound session', severity: 'NORMAL' }
    ],
    events: [
      { id: 'e3', type: 'VOLUME', label: 'Trading volume increased 48%', detail: 'Activity expanded notably while price gained +1.8%.', color: 'yellow' }
    ]
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 3180.40,
    previousClose: 3168.00,
    dayOpen: 3170.00,
    dayHigh: 3192.00,
    dayLow: 3165.00,
    volume: 1120000,
    averageVolume: 1100000,
    fiftyTwoWeekHigh: 4200.00,
    fiftyTwoWeekLow: 3050.00,
    marketCap: '₹11.5 Lakh Cr',
    lastUpdated: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
    lastVisitedSnapshot: {
      price: 3172.00,
      volume: 450000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [3168, 3172, 3175, 3170, 3178, 3182, 3179, 3180.40],
    chartHistory: [
      { time: '09:15', price: 3169, volume: 90000 },
      { time: '10:00', price: 3173, volume: 260000 },
      { time: '11:00', price: 3176, volume: 480000 },
      { time: '12:00', price: 3172, volume: 690000 },
      { time: '13:00', price: 3179, volume: 880000 },
      { time: '13:45', price: 3180.40, volume: 1120000 }
    ],
    timeline: [
      { id: 'tcs-1', time: '11:00 AM', type: 'NEUTRAL', title: 'Price ↑ 0.4%', note: 'Normal movement within expected volatility boundaries', severity: 'NORMAL' },
      { id: 'tcs-2', time: 'Yesterday', type: 'NEUTRAL', title: 'Rangebound', note: 'No threshold crossed', severity: 'NORMAL' }
    ],
    events: []
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 991.00,
    previousClose: 1016.40,
    dayOpen: 1010.00,
    dayHigh: 1014.00,
    dayLow: 988.00,
    volume: 18400000,
    averageVolume: 11500000,
    fiftyTwoWeekHigh: 1750.00,
    fiftyTwoWeekLow: 980.00,
    marketCap: '₹12.8 Lakh Cr',
    lastUpdated: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 1016.00,
      volume: 6200000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [1016, 1012, 1004, 998, 992, 990, 989, 991.00],
    chartHistory: [
      { time: '09:15', price: 1012, volume: 1200000 },
      { time: '10:00', price: 1004, volume: 4500000, isEvent: true, eventTitle: 'Slipped below 1000' },
      { time: '11:00', price: 994, volume: 9200000 },
      { time: '12:00', price: 990, volume: 13500000, isEvent: true, eventTitle: 'Heavy Banking Flow' },
      { time: '13:00', price: 989, volume: 16100000 },
      { time: '13:45', price: 991, volume: 18400000 }
    ],
    timeline: [
      { id: 'hdfc-1', time: '10:12 AM', type: 'PRICE_DROP', title: 'Price ↓ 2.5%', note: 'Slipped below key 1,000 support level on elevated volume', severity: 'HIGH' },
      { id: 'hdfc-2', time: '09:40 AM', type: 'VOLUME_SURGE', title: 'Volume 1.6× Avg', note: 'Banking sector index experiencing strong selling pressure', severity: 'HIGH' }
    ],
    events: [
      { id: 'e4', type: 'PRICE', label: 'Price fell 2.5%', detail: 'Breached support level and configured 2% threshold.', color: 'peach' },
      { id: 'e5', type: 'VOLUME', label: 'Volume 60% above normal', detail: 'High institutional selling recorded.', color: 'yellow' }
    ]
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 642.50,
    previousClose: 619.00,
    dayOpen: 622.00,
    dayHigh: 648.00,
    dayLow: 621.00,
    volume: 12800000,
    averageVolume: 7100000,
    fiftyTwoWeekHigh: 1179.00,
    fiftyTwoWeekLow: 590.00,
    marketCap: '₹2.4 Lakh Cr',
    lastUpdated: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 619.00,
      volume: 3100000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [619, 624, 630, 634, 638, 645, 640, 642.50],
    chartHistory: [
      { time: '09:15', price: 622, volume: 800000 },
      { time: '10:00', price: 629, volume: 3200000 },
      { time: '11:00', price: 636, volume: 6400000, isEvent: true, eventTitle: 'EV Delivery Report' },
      { time: '12:00', price: 644, volume: 9800000 },
      { time: '13:00', price: 647, volume: 11500000 },
      { time: '13:45', price: 642.50, volume: 12800000 }
    ],
    timeline: [
      { id: 'tm-1', time: '11:15 AM', type: 'PRICE_RISE', title: 'Price ↑ 3.8%', note: 'Exceeded positive significance threshold following commercial sales data', severity: 'HIGH' },
      { id: 'tm-2', time: '10:20 AM', type: 'VOLUME_SURGE', title: 'Volume 1.8× normal', note: 'Heavy buy accumulation observed', severity: 'HIGH' }
    ],
    events: [
      { id: 'e6', type: 'PRICE', label: 'Price up 3.8%', detail: 'Strongest gainer in auto sector today.', color: 'peach' }
    ]
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 1215.10,
    previousClose: 1204.00,
    dayOpen: 1208.00,
    dayHigh: 1222.00,
    dayLow: 1205.00,
    volume: 5200000,
    averageVolume: 5800000,
    fiftyTwoWeekHigh: 1350.00,
    fiftyTwoWeekLow: 980.00,
    marketCap: '₹8.6 Lakh Cr',
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 1206.00,
      volume: 2100000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [1204, 1207, 1210, 1215, 1218, 1220, 1216, 1215.10],
    chartHistory: [
      { time: '09:15', price: 1208, volume: 400000 },
      { time: '10:30', price: 1214, volume: 1900000 },
      { time: '12:00', price: 1218, volume: 3400000 },
      { time: '13:45', price: 1215.10, volume: 5200000 }
    ],
    timeline: [
      { id: 'icici-1', time: '10:00 AM', type: 'NEUTRAL', title: 'Price ↑ 0.9%', note: 'Normal sector tracking; no trigger', severity: 'NORMAL' }
    ],
    events: []
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 1630.00,
    previousClose: 1596.00,
    dayOpen: 1602.00,
    dayHigh: 1642.00,
    dayLow: 1600.00,
    volume: 4800000,
    averageVolume: 3200000,
    fiftyTwoWeekHigh: 1780.00,
    fiftyTwoWeekLow: 1100.00,
    marketCap: '₹9.4 Lakh Cr',
    lastUpdated: new Date(Date.now() - 30 * 1000).toISOString(), // 30 sec ago
    lastVisitedSnapshot: {
      price: 1598.00,
      volume: 1400000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [1596, 1605, 1612, 1618, 1625, 1636, 1632, 1630.00],
    chartHistory: [
      { time: '09:15', price: 1602, volume: 320000 },
      { time: '10:15', price: 1616, volume: 1450000 },
      { time: '11:30', price: 1628, volume: 2900000, isEvent: true, eventTitle: 'ARPU Upgrade Note' },
      { time: '13:00', price: 1638, volume: 4100000 },
      { time: '13:45', price: 1630, volume: 4800000 }
    ],
    timeline: [
      { id: 'artl-1', time: '11:45 AM', type: 'PRICE_RISE', title: 'Price ↑ 2.1%', note: 'Crossed 2.0% threshold on steady accumulation', severity: 'MEDIUM' },
      { id: 'artl-2', time: '10:00 AM', type: 'VOLUME_SURGE', title: 'Volume 1.5× Avg', note: 'Higher participation in telecom sector', severity: 'MEDIUM' }
    ],
    events: [
      { id: 'e7', type: 'PRICE', label: 'Price up 2.1%', detail: 'Crossed threshold with expanding volume.', color: 'yellow' }
    ]
  }
];

// Universe of searchable stocks (for search bar discovery)
export const SEARCHABLE_UNIVERSE = [
  ...INITIAL_STOCKS,
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 128.40,
    previousClose: 122.90,
    dayOpen: 124.00,
    dayHigh: 130.50,
    dayLow: 123.80,
    volume: 48500000,
    averageVolume: 32000000,
    fiftyTwoWeekHigh: 140.76,
    fiftyTwoWeekLow: 75.60,
    marketCap: '$3.15T',
    lastUpdated: new Date(Date.now() - 1.2 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 123.00,
      volume: 14000000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [122.9, 124.5, 126.0, 127.8, 129.2, 128.4],
    chartHistory: [
      { time: '09:30', price: 124.2, volume: 4500000 },
      { time: '10:30', price: 126.8, volume: 15000000 },
      { time: '12:00', price: 129.5, volume: 31000000, isEvent: true, eventTitle: 'AI Infrastructure Capex' },
      { time: '14:00', price: 128.4, volume: 48500000 }
    ],
    timeline: [
      { id: 'nvda-1', time: '12:05 PM', type: 'PRICE_RISE', title: 'Price ↑ 4.5%', note: 'Massive volume surge on semiconductor sector earnings', severity: 'HIGH' }
    ],
    events: [
      { id: 'e8', type: 'PRICE', label: 'Price surged 4.5%', detail: 'Crossed 4% high significance boundary.', color: 'peach' }
    ]
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 224.20,
    previousClose: 224.80,
    dayOpen: 225.10,
    dayHigh: 226.40,
    dayLow: 223.70,
    volume: 24000000,
    averageVolume: 27000000,
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08,
    marketCap: '$3.42T',
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 224.50,
      volume: 8000000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [224.8, 225.2, 224.7, 224.1, 224.3, 224.2],
    chartHistory: [
      { time: '09:30', price: 225.1, volume: 3100000 },
      { time: '11:00', price: 224.8, volume: 11000000 },
      { time: '13:00', price: 224.1, volume: 18500000 },
      { time: '15:00', price: 224.2, volume: 24000000 }
    ],
    timeline: [
      { id: 'aapl-1', time: '11:00 AM', type: 'NEUTRAL', title: 'Price ↓ 0.3%', note: 'Normal trading range', severity: 'NORMAL' }
    ],
    events: []
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    exchange: 'NSE',
    currency: 'INR',
    currentPrice: 284.10,
    previousClose: 281.50,
    dayOpen: 282.00,
    dayHigh: 286.00,
    dayLow: 281.00,
    volume: 3100000,
    averageVolume: 3500000,
    fiftyTwoWeekHigh: 330.00,
    fiftyTwoWeekLow: 220.00,
    marketCap: '₹1.48 Lakh Cr',
    lastUpdated: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    lastVisitedSnapshot: {
      price: 282.00,
      volume: 1200000,
      timestamp: new Date(Date.now() - 7.7 * 60 * 60 * 1000).toISOString(),
    },
    sparkline: [281.5, 282.1, 283.4, 285.0, 284.1],
    chartHistory: [
      { time: '09:15', price: 282, volume: 400000 },
      { time: '11:00', price: 284.5, volume: 1600000 },
      { time: '13:30', price: 284.1, volume: 3100000 }
    ],
    timeline: [
      { id: 'wip-1', time: '10:30 AM', type: 'NEUTRAL', title: 'Price ↑ 0.9%', note: 'Quiet volume session', severity: 'NORMAL' }
    ],
    events: []
  }
];
