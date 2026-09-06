import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Watchlist } from '../models/Watchlist.js';
import { Stock } from '../models/Stock.js';
import { StockSnapshot } from '../models/StockSnapshot.js';
import { ChangeEvent } from '../models/ChangeEvent.js';
import { NewsArticle } from '../models/NewsArticle.js';
import { AIInsight } from '../models/AIInsight.js';
import { connectDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

export async function seedInitialData() {
  logger.info('[Seed] Seeding initial FinSmart database with baseline snapshots...');

  // 1. Seed Demo User
  const demoEmail = 'arjun.mehta@finsmart.io';
  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    user = await User.create({
      name: 'Arjun Mehta',
      email: demoEmail,
      passwordHash,
      lastVisitedAt: new Date(Date.now() - (7 * 60 + 42) * 60 * 1000), // 7h 42m ago
      preferences: { priceThreshold: 2.0, volumeThreshold: 1.5 },
    });
  }

  // 2. Seed Master Stocks
  const stockDefs = [
    { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy / Conglomerate' },
    { symbol: 'INFY', companyName: 'Infosys Limited', exchange: 'NSE', sector: 'Information Technology' },
    { symbol: 'TCS', companyName: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology' },
    { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking & Financial' },
    { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automotive' },
    { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'NVDA', companyName: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Semiconductors' },
    { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Consumer Electronics' },
  ];

  const stockMap = {};
  for (const def of stockDefs) {
    let stock = await Stock.findOne({ symbol: def.symbol });
    if (!stock) {
      stock = await Stock.create(def);
    }
    stockMap[def.symbol] = stock;
  }

  // 3. Seed Watchlist for Demo User
  let watchlist = await Watchlist.findOne({ userId: user._id });
  if (!watchlist) {
    watchlist = await Watchlist.create({
      userId: user._id,
      name: 'Core Holdings Watchlist',
      items: [
        { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd.', exchange: 'NSE' },
        { symbol: 'INFY', companyName: 'Infosys Limited', exchange: 'NSE' },
        { symbol: 'TCS', companyName: 'Tata Consultancy Services', exchange: 'NSE' },
        { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', exchange: 'NSE' },
        { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', exchange: 'NSE' },
      ],
    });
  }

  // 4. Seed Historical Snapshots for each key stock (Baseline 7h 42m ago + Current snapshot)
  const pastTime = new Date(Date.now() - (7 * 60 + 42) * 60 * 1000);
  const currentTime = new Date();

  // Baseline snapshots (historical)
  const baselines = [
    { symbol: 'RELIANCE', price: 1475.50, open: 1462.0, high: 1480.0, low: 1450.0, previousClose: 1475.50, volume: 1800000, avgVol: 2514000, time: pastTime },
    { symbol: 'INFY', price: 1455.00, open: 1458.0, high: 1465.0, low: 1450.0, previousClose: 1455.00, volume: 1400000, avgVol: 2600000, time: pastTime },
    { symbol: 'TCS', price: 3168.00, open: 3170.0, high: 3180.0, low: 3165.0, previousClose: 3168.00, volume: 550000, avgVol: 1100000, time: pastTime },
    { symbol: 'HDFCBANK', price: 1016.40, open: 1012.0, high: 1020.0, low: 1010.0, previousClose: 1016.40, volume: 5500000, avgVol: 11500000, time: pastTime },
    { symbol: 'TATAMOTORS', price: 619.00, open: 622.0, high: 625.0, low: 615.0, previousClose: 619.00, volume: 4200000, avgVol: 7100000, time: pastTime },
  ];

  for (const b of baselines) {
    await StockSnapshot.create({
      stockId: stockMap[b.symbol]._id,
      symbol: b.symbol,
      price: b.price,
      open: b.open,
      high: b.high,
      low: b.low,
      previousClose: b.previousClose,
      volume: b.volume,
      averageVolume: b.avgVol,
      timestamp: b.time,
      source: 'SEED',
      freshnessStatus: 'STALE',
    });
  }

  // Current snapshots (now)
  const currents = [
    { symbol: 'RELIANCE', price: 1428.30, open: 1462.0, high: 1480.0, low: 1416.0, previousClose: 1475.50, volume: 4200000, avgVol: 2514000, time: currentTime },
    { symbol: 'INFY', price: 1481.20, open: 1458.0, high: 1488.0, low: 1454.0, previousClose: 1455.00, volume: 3850000, avgVol: 2600000, time: currentTime },
    { symbol: 'TCS', price: 3180.40, open: 3170.0, high: 3192.0, low: 3165.0, previousClose: 3168.00, volume: 1120000, avgVol: 1100000, time: currentTime },
    { symbol: 'HDFCBANK', price: 991.00, open: 1010.0, high: 1014.0, low: 988.0, previousClose: 1016.40, volume: 18400000, avgVol: 11500000, time: currentTime },
    { symbol: 'TATAMOTORS', price: 642.50, open: 622.0, high: 648.0, low: 621.0, previousClose: 619.00, volume: 12800000, avgVol: 7100000, time: currentTime },
  ];

  for (const c of currents) {
    await StockSnapshot.create({
      stockId: stockMap[c.symbol]._id,
      symbol: c.symbol,
      price: c.price,
      open: c.open,
      high: c.high,
      low: c.low,
      previousClose: c.previousClose,
      volume: c.volume,
      averageVolume: c.avgVol,
      timestamp: c.time,
      source: 'SEED',
      freshnessStatus: 'FRESH',
    });
  }

  // 5. Seed Core Change Events (detected after last visit)
  const changeEventData = [
    {
      symbol: 'RELIANCE',
      severity: 'SIGNIFICANT',
      oldValue: 1475.50,
      newValue: 1428.30,
      percentageChange: -3.20,
      volumeRatio: 1.67,
      attentionScore: 82,
      primaryEventText: 'Price dropped 3.2% while trading volume increased 67%.',
      whyFlagged: 'Price movement crossed your configured 2.0% significance threshold while volume was unusually high.',
      signals: [
        { type: 'PRICE', score: 20, description: 'Price dropped 3.2%' },
        { type: 'VOLUME', score: 16, description: 'Volume is 1.67× daily average' },
        { type: 'USER_THRESHOLD', score: 10, description: 'Breached 2.0% significance threshold' }
      ]
    },
    {
      symbol: 'INFY',
      severity: 'WATCH',
      oldValue: 1455.00,
      newValue: 1481.20,
      percentageChange: 1.80,
      volumeRatio: 1.48,
      attentionScore: 54,
      primaryEventText: 'Trading volume increased 48% with moderate price gain.',
      whyFlagged: 'Trading volume activity is elevated compared to historical reference baseline.',
      signals: [
        { type: 'VOLUME', score: 10, description: 'Trading volume expanded 48%' },
        { type: 'PRICE', score: 12, description: 'Price shifted +1.8%' }
      ]
    },
    {
      symbol: 'TCS',
      severity: 'NORMAL',
      oldValue: 3168.00,
      newValue: 3180.40,
      percentageChange: 0.39,
      volumeRatio: 1.02,
      attentionScore: 16,
      primaryEventText: 'Trading within expected normal daily boundaries.',
      whyFlagged: 'Nothing meaningful changed.',
      signals: [
        { type: 'PRICE', score: 5, description: 'Quiet price movement (+0.4%)' }
      ]
    },
    {
      symbol: 'HDFCBANK',
      severity: 'SIGNIFICANT',
      oldValue: 1016.40,
      newValue: 991.00,
      percentageChange: -2.50,
      volumeRatio: 1.60,
      attentionScore: 78,
      primaryEventText: 'Price fell 2.5% below key 1,000 support level.',
      whyFlagged: 'Breached support level and configured 2% threshold on elevated banking volume.',
      signals: [
        { type: 'PRICE', score: 20, description: 'Price fell 2.5%' },
        { type: 'VOLUME', score: 16, description: 'Volume 60% above normal' }
      ]
    },
  ];

  for (const cd of changeEventData) {
    const event = await ChangeEvent.create({
      stockId: stockMap[cd.symbol]._id,
      symbol: cd.symbol,
      eventType: 'PRICE_VOLUME_MOVEMENT',
      severity: cd.severity,
      oldValue: cd.oldValue,
      newValue: cd.newValue,
      percentageChange: cd.percentageChange,
      volumeRatio: cd.volumeRatio,
      attentionScore: cd.attentionScore,
      signals: cd.signals,
      primaryEventText: cd.primaryEventText,
      whyFlagged: cd.whyFlagged,
      detectedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago (after lastVisitedAt)
    });

    // Seed cached AI Insight for RELIANCE
    if (cd.symbol === 'RELIANCE') {
      await AIInsight.create({
        stockId: stockMap['RELIANCE']._id,
        symbol: 'RELIANCE',
        changeEventId: event._id,
        summary: 'Reliance experienced a significant 3.2% decline accompanied by unusually heavy trading volume.',
        whyItMatters: 'Reliance fell beyond the configured 2.0% significance threshold while trading activity increased by 67%. The concurrence of elevated volume with negative price divergence suggests institutional repositioning rather than ordinary retail noise.',
        confidence: 'HIGH',
        evidence: [
          'Price dropped 3.2% crossing the 2.0% significance boundary',
          'Trading volume surged to 4.2M (1.67× daily average)',
          'Downside divergence accelerated during late morning session'
        ],
        model: 'gpt-4o-mini',
      });
    }
  }

  // 6. Seed News Articles
  const sampleNews = [
    {
      symbol: 'RELIANCE',
      title: 'Reliance Industries faces selling pressure amid crude oil volatility and refining margin concerns',
      description: 'Shares of Reliance fell over 3% in intraday trade following broader pressure on oil and gas benchmark indices.',
      url: 'https://finsmart.io/news/reliance-q2-margin-update-2026',
      source: 'Economic Times',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sentiment: 'NEGATIVE',
      relevanceScore: 0.94,
    },
    {
      symbol: 'INFY',
      title: 'Infosys expands cloud AI partnership with global enterprise consortium',
      description: 'IT major Infosys registers heavy volume uptick as new multicloud deal confirmations surface.',
      url: 'https://finsmart.io/news/infosys-ai-cloud-deal-2026',
      source: 'LiveMint',
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      sentiment: 'POSITIVE',
      relevanceScore: 0.88,
    }
  ];

  for (const n of sampleNews) {
    await NewsArticle.updateOne(
      { url: n.url },
      { $set: { ...n, stockId: stockMap[n.symbol]?._id } },
      { upsert: true }
    );
  }

  logger.info('[Seed] Initial FinSmart baseline data seeded successfully.');
}

// Execute directly if run as standalone script
if (process.argv[1]?.endsWith('seed.js')) {
  connectDatabase()
    .then(() => seedInitialData())
    .then(() => {
      console.log('Seed completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
