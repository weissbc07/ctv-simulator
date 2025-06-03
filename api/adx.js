import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { JSDOM } from 'jsdom';
import { createHash, randomBytes } from 'crypto';
import { RealProgrammaticService } from './real-programmatic.js';

const router = express.Router();

// Use jsdom for server-side XML parsing
const { window } = new JSDOM();
const DOMParser = window.DOMParser;

// Enhanced CTV Content Library with realistic video content scenarios
const CTV_CONTENT_LIBRARY = [
  {
    id: 'failarmy_comedy_fails_s3e12',
    title: 'FailArmy: Epic Comedy Fails Collection',
    description: 'Watch the funniest fails and bloopers from around the world',
    category: 'Comedy',
    iabCategory: 'IAB9-30', // Humor
    genre: 'Entertainment',
    duration: 1800, // 30 minutes
    series: 'FailArmy Originals',
    season: 3,
    episode: 12,
    contentRating: 'PG-13',
    language: 'en-US',
    country: 'US',
    keywords: ['fails', 'comedy', 'viral', 'entertainment', 'funny'],
    demographics: ['18-34', '25-44'],
    viewershipTier: 'premium',
    cmsId: 'cms_failarmy_12345',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'tech_review_smartphone_2024',
    title: 'Tech Today: Latest Smartphone Reviews',
    description: 'Comprehensive reviews of the newest smartphones hitting the market',
    category: 'Technology',
    iabCategory: 'IAB19-18', // Consumer Electronics
    genre: 'Reviews',
    duration: 2400, // 40 minutes
    series: 'Tech Today',
    season: 2,
    episode: 8,
    contentRating: 'G',
    language: 'en-US',
    country: 'US',
    keywords: ['technology', 'smartphones', 'reviews', 'gadgets'],
    demographics: ['25-44', '35-54'],
    viewershipTier: 'premium',
    cmsId: 'cms_techtoday_67890',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'cooking_masterclass_italian',
    title: 'Cooking Masterclass: Authentic Italian Cuisine',
    description: 'Learn to cook traditional Italian dishes from master chefs',
    category: 'Lifestyle',
    iabCategory: 'IAB8-5', // Cooking
    genre: 'Educational',
    duration: 3600, // 60 minutes
    series: 'Cooking Masterclass',
    season: 1,
    episode: 5,
    contentRating: 'G',
    language: 'en-US',
    country: 'US',
    keywords: ['cooking', 'italian', 'recipes', 'food', 'chef'],
    demographics: ['35-54', '45-64'],
    viewershipTier: 'standard',
    cmsId: 'cms_cooking_11223',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    id: 'sports_highlights_nfl_week12',
    title: 'NFL Week 12 Highlights',
    description: 'Best plays and moments from NFL Week 12',
    category: 'Sports',
    iabCategory: 'IAB17-13', // Football
    genre: 'Sports',
    duration: 1200, // 20 minutes
    series: 'NFL Highlights',
    season: 2024,
    episode: 12,
    contentRating: 'PG',
    language: 'en-US',
    country: 'US',
    keywords: ['nfl', 'football', 'sports', 'highlights', 'playoffs'],
    demographics: ['18-34', '25-44', '35-54'],
    viewershipTier: 'premium',
    cmsId: 'cms_nfl_44556',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    id: 'nature_documentary_amazon',
    title: 'Amazon Rainforest: Hidden Wonders',
    description: 'Explore the incredible biodiversity of the Amazon rainforest',
    category: 'Documentary',
    iabCategory: 'IAB13-4', // Nature
    genre: 'Documentary',
    duration: 4800, // 80 minutes
    series: 'Hidden Wonders',
    season: 1,
    episode: 3,
    contentRating: 'G',
    language: 'en-US',
    country: 'US',
    keywords: ['nature', 'documentary', 'amazon', 'wildlife', 'environment'],
    demographics: ['25-44', '35-54', '55+'],
    viewershipTier: 'premium',
    cmsId: 'cms_nature_77889',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

// Realistic Programmatic Ad Inventory with diverse advertisers and creative content
const PROGRAMMATIC_AD_INVENTORY = [
  // Automotive Ads
  {
    adId: 'auto_tesla_model_y_2024',
    brand: 'Tesla',
    title: 'Tesla Model Y - The Future is Electric',
    description: 'Experience the all-new Tesla Model Y with enhanced range and performance',
    category: 'Automotive',
    iabCategory: 'IAB2-1', // Auto Parts
    cpm: 28.50,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://example.com/tesla-model-y-thumb.jpg',
      creativeConcept: 'performance',
      creativeFormat: 'full_episode'
    },
    advertiser: 'Tesla Motors Inc.',
    advertiserDomain: 'tesla.com',
    clickThrough: 'https://tesla.com/model-y?utm_source=ctv&utm_campaign=2024',
    targeting: {
      demographics: ['25-44', '35-54'],
      income: ['75k+', '100k+'],
      interests: ['technology', 'sustainability', 'luxury'],
      geoTargets: ['US', 'CA', 'UK'],
      deviceTypes: ['ctv'],
      contentCategories: ['technology', 'automotive', 'lifestyle']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_tesla_2024_ctv'
  },
  {
    adId: 'auto_bmw_ix_luxury',
    brand: 'BMW',
    title: 'BMW iX - Luxury Redefined',
    description: 'Discover the ultimate electric luxury SUV with cutting-edge technology',
    category: 'Automotive',
    iabCategory: 'IAB2-1',
    cpm: 32.75,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://example.com/bmw-ix-thumb.jpg',
      creativeConcept: 'luxury',
      creativeFormat: 'cinematic'
    },
    advertiser: 'BMW Group',
    advertiserDomain: 'bmw.com',
    clickThrough: 'https://bmw.com/ix?utm_source=ctv&utm_campaign=luxury',
    targeting: {
      demographics: ['35-54', '45-64'],
      income: ['100k+', '150k+'],
      interests: ['luxury', 'technology', 'performance'],
      geoTargets: ['US', 'DE', 'UK'],
      deviceTypes: ['ctv'],
      contentCategories: ['automotive', 'luxury', 'technology']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_bmw_ix_luxury'
  },

  // Financial Services
  {
    adId: 'finance_chase_rewards_credit',
    brand: 'Chase',
    title: 'Chase Sapphire Preferred - Earn More',
    description: 'Get 60,000 bonus points with Chase Sapphire Preferred credit card',
    category: 'Financial Services',
    iabCategory: 'IAB13-3', // Credit/Lending
    cpm: 18.25,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnailUrl: 'https://example.com/chase-sapphire-thumb.jpg',
      creativeConcept: 'rewards',
      creativeFormat: 'lifestyle'
    },
    advertiser: 'JPMorgan Chase Bank',
    advertiserDomain: 'chase.com',
    clickThrough: 'https://chase.com/sapphire-preferred?utm_source=ctv&utm_campaign=rewards',
    targeting: {
      demographics: ['25-44', '35-54'],
      income: ['50k+', '75k+'],
      interests: ['travel', 'dining', 'rewards'],
      geoTargets: ['US'],
      deviceTypes: ['ctv'],
      contentCategories: ['travel', 'lifestyle', 'business']
    },
    flightDates: { start: '2024-01-01', end: '2024-06-30' },
    campaignId: 'camp_chase_sapphire_2024'
  },
  {
    adId: 'finance_fidelity_investment',
    brand: 'Fidelity',
    title: 'Fidelity Investments - Your Financial Future',
    description: 'Start investing with Fidelity - zero fees on stock trades',
    category: 'Financial Services',
    iabCategory: 'IAB13-7', // Investing
    cpm: 22.40,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://example.com/fidelity-invest-thumb.jpg',
      creativeConcept: 'investment',
      creativeFormat: 'educational'
    },
    advertiser: 'Fidelity Investments',
    advertiserDomain: 'fidelity.com',
    clickThrough: 'https://fidelity.com/investing?utm_source=ctv&utm_campaign=zero_fees',
    targeting: {
      demographics: ['30-54', '45-64'],
      income: ['60k+', '100k+'],
      interests: ['investing', 'retirement', 'financial planning'],
      geoTargets: ['US'],
      deviceTypes: ['ctv'],
      contentCategories: ['business', 'news', 'finance']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_fidelity_invest_2024'
  },

  // Technology & Software
  {
    adId: 'tech_microsoft_surface_pro',
    brand: 'Microsoft',
    title: 'Microsoft Surface Pro 9 - Do More',
    description: 'The most powerful Surface Pro yet with Intel Evo platform',
    category: 'Technology',
    iabCategory: 'IAB19-6', // Computer/Electronics
    cpm: 24.80,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://example.com/surface-pro-thumb.jpg',
      creativeConcept: 'productivity',
      creativeFormat: 'product_demo'
    },
    advertiser: 'Microsoft Corporation',
    advertiserDomain: 'microsoft.com',
    clickThrough: 'https://microsoft.com/surface-pro-9?utm_source=ctv&utm_campaign=productivity',
    targeting: {
      demographics: ['25-44', '35-54'],
      income: ['60k+', '75k+'],
      interests: ['technology', 'productivity', 'business'],
      geoTargets: ['US', 'CA', 'UK', 'AU'],
      deviceTypes: ['ctv'],
      contentCategories: ['technology', 'business', 'education']
    },
    flightDates: { start: '2024-01-01', end: '2024-09-30' },
    campaignId: 'camp_surface_pro_2024'
  },
  {
    adId: 'tech_adobe_creative_cloud',
    brand: 'Adobe',
    title: 'Adobe Creative Cloud - Create Anything',
    description: 'Unlock your creativity with Adobe Creative Cloud - all apps included',
    category: 'Technology',
    iabCategory: 'IAB19-18', // Software
    cpm: 19.60,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailUrl: 'https://example.com/adobe-cc-thumb.jpg',
      creativeConcept: 'creativity',
      creativeFormat: 'artistic'
    },
    advertiser: 'Adobe Inc.',
    advertiserDomain: 'adobe.com',
    clickThrough: 'https://adobe.com/creative-cloud?utm_source=ctv&utm_campaign=create',
    targeting: {
      demographics: ['18-34', '25-44'],
      income: ['40k+', '60k+'],
      interests: ['design', 'photography', 'video editing', 'creativity'],
      geoTargets: ['US', 'CA', 'UK', 'DE', 'FR'],
      deviceTypes: ['ctv'],
      contentCategories: ['arts', 'technology', 'education']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_adobe_cc_2024'
  },

  // Consumer Goods & Retail
  {
    adId: 'retail_nike_air_max',
    brand: 'Nike',
    title: 'Nike Air Max - Just Do It',
    description: 'Step into comfort and style with the new Nike Air Max collection',
    category: 'Retail',
    iabCategory: 'IAB18-6', // Fashion
    cpm: 16.90,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://example.com/nike-airmax-thumb.jpg',
      creativeConcept: 'athletic',
      creativeFormat: 'lifestyle'
    },
    advertiser: 'Nike Inc.',
    advertiserDomain: 'nike.com',
    clickThrough: 'https://nike.com/air-max?utm_source=ctv&utm_campaign=justdoit',
    targeting: {
      demographics: ['18-34', '25-44'],
      income: ['40k+', '60k+'],
      interests: ['sports', 'fitness', 'fashion', 'lifestyle'],
      geoTargets: ['US', 'CA', 'UK', 'FR', 'DE'],
      deviceTypes: ['ctv'],
      contentCategories: ['sports', 'fitness', 'lifestyle']
    },
    flightDates: { start: '2024-01-01', end: '2024-08-31' },
    campaignId: 'camp_nike_airmax_2024'
  },
  {
    adId: 'retail_amazon_prime_day',
    brand: 'Amazon',
    title: 'Amazon Prime Day - Exclusive Deals',
    description: 'Prime members save big with exclusive deals during Prime Day',
    category: 'Retail',
    iabCategory: 'IAB18-1', // Online Shopping
    cpm: 21.30,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://example.com/amazon-prime-thumb.jpg',
      creativeConcept: 'deals',
      creativeFormat: 'promotional'
    },
    advertiser: 'Amazon.com Inc.',
    advertiserDomain: 'amazon.com',
    clickThrough: 'https://amazon.com/prime-day?utm_source=ctv&utm_campaign=primeday2024',
    targeting: {
      demographics: ['25-44', '35-54'],
      income: ['50k+', '75k+'],
      interests: ['shopping', 'deals', 'technology', 'home'],
      geoTargets: ['US', 'UK', 'DE', 'FR', 'IT'],
      deviceTypes: ['ctv'],
      contentCategories: ['general', 'lifestyle', 'technology']
    },
    flightDates: { start: '2024-07-01', end: '2024-07-31' },
    campaignId: 'camp_amazon_primeday_2024'
  },

  // Food & Beverage
  {
    adId: 'food_mcdonalds_mcplant',
    brand: 'McDonald\'s',
    title: 'McDonald\'s McPlant - Plant-Based Choice',
    description: 'Try the new McPlant burger - 100% plant-based ingredients',
    category: 'Food & Beverage',
    iabCategory: 'IAB8-5', // Fast Food
    cpm: 14.75,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://example.com/mcplant-thumb.jpg',
      creativeConcept: 'plant_based',
      creativeFormat: 'product_showcase'
    },
    advertiser: 'McDonald\'s Corporation',
    advertiserDomain: 'mcdonalds.com',
    clickThrough: 'https://mcdonalds.com/mcplant?utm_source=ctv&utm_campaign=plantbased',
    targeting: {
      demographics: ['18-34', '25-44'],
      income: ['30k+', '50k+'],
      interests: ['health', 'sustainability', 'food', 'fast food'],
      geoTargets: ['US', 'CA', 'UK'],
      deviceTypes: ['ctv'],
      contentCategories: ['food', 'lifestyle', 'health']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_mcdonalds_mcplant_2024'
  },
  {
    adId: 'beverage_coca_cola_zero',
    brand: 'Coca-Cola',
    title: 'Coca-Cola Zero Sugar - Real Taste',
    description: 'All the great taste of Coca-Cola, now with zero sugar',
    category: 'Food & Beverage',
    iabCategory: 'IAB8-6', // Beverages
    cpm: 17.85,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://example.com/coke-zero-thumb.jpg',
      creativeConcept: 'refreshment',
      creativeFormat: 'lifestyle'
    },
    advertiser: 'The Coca-Cola Company',
    advertiserDomain: 'coca-cola.com',
    clickThrough: 'https://coca-cola.com/zero-sugar?utm_source=ctv&utm_campaign=realtaste',
    targeting: {
      demographics: ['18-34', '25-44', '35-54'],
      income: ['25k+', '50k+'],
      interests: ['beverages', 'lifestyle', 'sports', 'entertainment'],
      geoTargets: ['US', 'CA', 'MX', 'UK', 'AU'],
      deviceTypes: ['ctv'],
      contentCategories: ['sports', 'entertainment', 'lifestyle']
    },
    flightDates: { start: '2024-01-01', end: '2024-12-31' },
    campaignId: 'camp_coke_zero_2024'
  },

  // Entertainment & Streaming
  {
    adId: 'stream_netflix_stranger_things',
    brand: 'Netflix',
    title: 'Stranger Things 5 - Coming Soon',
    description: 'The final season of Stranger Things arrives this summer on Netflix',
    category: 'Entertainment',
    iabCategory: 'IAB9-30', // TV/Video
    cpm: 26.40,
    duration: 30,
    creative: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnailUrl: 'https://example.com/stranger-things-thumb.jpg',
      creativeConcept: 'drama',
      creativeFormat: 'trailer'
    },
    advertiser: 'Netflix Inc.',
    advertiserDomain: 'netflix.com',
    clickThrough: 'https://netflix.com/stranger-things?utm_source=ctv&utm_campaign=season5',
    targeting: {
      demographics: ['18-34', '25-44'],
      income: ['40k+', '60k+'],
      interests: ['sci-fi', 'drama', 'streaming', 'entertainment'],
      geoTargets: ['US', 'CA', 'UK', 'AU', 'BR'],
      deviceTypes: ['ctv'],
      contentCategories: ['entertainment', 'sci-fi', 'drama']
    },
    flightDates: { start: '2024-05-01', end: '2024-08-31' },
    campaignId: 'camp_netflix_st5_2024'
  }
];

// Realistic CTV Device Profiles with authentic fingerprinting data
const CTV_DEVICE_PROFILES = {
  roku: {
    deviceModels: [
      { model: 'Roku Ultra 4K', userAgent: 'Roku/DVP-11.5 (11.5.0.4312-88)', marketShare: 35 },
      { model: 'Roku Streaming Stick 4K+', userAgent: 'Roku/DVP-11.5 (11.5.0.4312-89)', marketShare: 25 },
      { model: 'Roku Express 4K+', userAgent: 'Roku/DVP-11.0 (11.0.0.4193-88)', marketShare: 20 },
      { model: 'Roku TCL TV', userAgent: 'Roku/DVP-11.5 (11.5.0.4312-87)', marketShare: 20 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'Dolby Vision'],
    audioFormats: ['Dolby Atmos', 'DTS'],
    resolutions: ['1920x1080', '3840x2160'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateRokuDeviceId()
  },
  samsung: {
    deviceModels: [
      { model: 'Samsung QN85B Neo QLED', userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.5) AppleWebKit/537.36 Samsung/6.5', marketShare: 30 },
      { model: 'Samsung AU8000 Crystal UHD', userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 Samsung/6.0', marketShare: 25 },
      { model: 'Samsung The Frame', userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.5) AppleWebKit/537.36 Samsung/6.5', marketShare: 20 },
      { model: 'Samsung TU7000', userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 5.5) AppleWebKit/537.36 Samsung/5.5', marketShare: 25 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'HDR10+', 'Dolby Vision'],
    audioFormats: ['Dolby Atmos', 'DTS:X'],
    resolutions: ['1920x1080', '3840x2160', '7680x4320'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateTIFA()
  },
  lg: {
    deviceModels: [
      { model: 'LG C2 OLED', userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 Chrome/87.0.4280.88 LG', marketShare: 35 },
      { model: 'LG A2 OLED', userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 Chrome/87.0.4280.88 LG', marketShare: 25 },
      { model: 'LG QNED99', userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 Chrome/79.0.3945.79 LG', marketShare: 20 },
      { model: 'LG UP7000', userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 Chrome/79.0.3945.79 LG', marketShare: 20 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'Dolby Vision', 'HLG'],
    audioFormats: ['Dolby Atmos', 'DTS:X'],
    resolutions: ['1920x1080', '3840x2160'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateLGUDID()
  },
  firetv: {
    deviceModels: [
      { model: 'Fire TV Stick 4K Max', userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36 Fire TV', marketShare: 40 },
      { model: 'Fire TV Cube', userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTS) AppleWebKit/537.36 Fire TV', marketShare: 30 },
      { model: 'Fire TV Stick Lite', userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTSS) AppleWebKit/537.36 Fire TV', marketShare: 20 },
      { model: 'Toshiba Fire TV', userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36 Fire TV', marketShare: 10 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'Dolby Vision', 'HDR10+'],
    audioFormats: ['Dolby Atmos'],
    resolutions: ['1920x1080', '3840x2160'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateAmazonAID()
  },
  androidtv: {
    deviceModels: [
      { model: 'Sony X90J Android TV', userAgent: 'Mozilla/5.0 (Linux; Android 10; X90J) AppleWebKit/537.36 Android TV', marketShare: 25 },
      { model: 'Nvidia Shield TV Pro', userAgent: 'Mozilla/5.0 (Linux; Android 11; SHIELD Android TV) AppleWebKit/537.36', marketShare: 20 },
      { model: 'Chromecast with Google TV', userAgent: 'Mozilla/5.0 (Linux; Android 10; Chromecast) AppleWebKit/537.36', marketShare: 30 },
      { model: 'Philips Android TV', userAgent: 'Mozilla/5.0 (Linux; Android 9; Philips TV) AppleWebKit/537.36 Android TV', marketShare: 25 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'Dolby Vision', 'HLG'],
    audioFormats: ['Dolby Atmos', 'DTS:X'],
    resolutions: ['1920x1080', '3840x2160'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateGAID()
  },
  appletv: {
    deviceModels: [
      { model: 'Apple TV 4K (3rd gen)', userAgent: 'AppleTV/tvOS 16.0', marketShare: 60 },
      { model: 'Apple TV 4K (2nd gen)', userAgent: 'AppleTV/tvOS 15.6', marketShare: 30 },
      { model: 'Apple TV HD', userAgent: 'AppleTV/tvOS 15.6', marketShare: 10 }
    ],
    iptvSupport: true,
    hdrFormats: ['HDR10', 'Dolby Vision', 'HLG'],
    audioFormats: ['Dolby Atmos', 'Spatial Audio'],
    resolutions: ['1920x1080', '3840x2160'],
    connectionTypes: ['wifi', 'ethernet'],
    advertisingId: () => generateIDFA()
  }
};

// Geographic and demographic targeting data
const TARGETING_DATA = {
  geoMarkets: {
    'US': {
      dmas: ['New York', 'Los Angeles', 'Chicago', 'Philadelphia', 'Dallas-Ft. Worth', 'San Francisco-Oakland-San Jose', 'Boston', 'Atlanta', 'Washington DC', 'Houston'],
      adSpend: { premium: 45.50, standard: 28.30, value: 12.80 },
      demographics: {
        '18-34': 28.5, '25-44': 32.1, '35-54': 25.8, '45-64': 18.9, '55+': 15.2
      }
    },
    'CA': {
      dmas: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa-Gatineau', 'Edmonton', 'Winnipeg', 'Quebec City'],
      adSpend: { premium: 38.20, standard: 24.50, value: 11.30 },
      demographics: {
        '18-34': 26.8, '25-44': 30.4, '35-54': 27.2, '45-64': 20.1, '55+': 17.8
      }
    },
    'UK': {
      dmas: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh'],
      adSpend: { premium: 42.80, standard: 26.90, value: 13.20 },
      demographics: {
        '18-34': 25.2, '25-44': 29.8, '35-54': 28.5, '45-64': 22.3, '55+': 19.4
      }
    }
  },
  psychographics: {
    'tech_early_adopters': { cpmMultiplier: 1.35, interests: ['technology', 'gadgets', 'innovation'] },
    'luxury_consumers': { cpmMultiplier: 1.65, interests: ['luxury', 'premium brands', 'high-end'] },
    'value_seekers': { cpmMultiplier: 0.85, interests: ['deals', 'savings', 'coupons'] },
    'health_conscious': { cpmMultiplier: 1.25, interests: ['health', 'fitness', 'wellness'] },
    'entertainment_lovers': { cpmMultiplier: 1.15, interests: ['movies', 'tv shows', 'streaming'] }
  }
};

// CTV Provider configurations
const CTV_PROVIDERS = {
  roku: {
    name: 'Roku',
    type: 'roku',
    userAgent: 'Roku/DVP-12.0 (12.0.0.4182-88)',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  samsung: {
    name: 'Samsung Tizen',
    type: 'tizen',
    userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 Samsung',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3', 'DTS'],
        channels: [2, 6, 8]
      }
    }
  },
  lg: {
    name: 'LG webOS',
    type: 'webos',
    userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 LG',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  firetv: {
    name: 'Amazon Fire TV',
    type: 'firetv',
    userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36 Fire TV',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  androidtv: {
    name: 'Android TV',
    type: 'androidtv',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9', 'AV1'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  appletv: {
    name: 'Apple TV',
    type: 'appletv',
    userAgent: 'AppleCoreMedia/1.0.0 (Apple TV; U; CPU OS 15_0)',
    capabilities: {
      drm: ['FairPlay'],
      video: {
        codecs: ['H.264', 'H.265'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  }
};

// PAL SDK Integration
class PALService {
  constructor() {
    this.palEndpoint = 'https://pubads.g.doubleclick.net/gampad/live/ads';
  }

  async generateNonce(request) {
    try {
      const response = await fetch(`${this.palEndpoint}/pal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': request.playerName || 'CTV-Simulator/1.0'
        },
        body: JSON.stringify({
          description_url: request.descriptionUrl,
          privacy_policy: request.privacyPolicy,
          player_type: request.playerType,
          player_name: request.playerName,
          player_version: request.playerVersion,
          video_width: request.videoWidth,
          video_height: request.videoHeight,
          video_title: request.videoTitle,
          video_description: request.videoDescription,
          video_duration: request.videoDuration,
          content_rating: request.contentRating,
          is_live: request.isLive,
          session_id: request.sessionId || this.generateSessionId(),
          icons_supported: request.iconsSupported || true,
          omid_partner_name: request.omidPartnerName || 'CTV-Simulator',
          omid_partner_version: request.omidPartnerVersion || '1.0',
          supported_api_frameworks: request.supportedApiFrameworks || ['VPAID_2_0', 'OMID_1_0']
        })
      });

      if (!response.ok) {
        throw new Error(`PAL nonce generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        nonce: data.nonce,
        adSessionId: data.ad_session_id || this.generateSessionId(),
        videoSessionId: data.video_session_id || this.generateSessionId(),
        settings: {
          numRedirectsRemaining: data.num_redirects_remaining || 5,
          enabledEventTypes: data.enabled_event_types || ['start', 'complete', 'error'],
          nonceExpiry: data.nonce_expiry || Date.now() + 3600000 // 1 hour
        }
      };
    } catch (error) {
      console.error('PAL nonce generation error:', error);
      throw error;
    }
  }

  generateSessionId() {
    return 'pal_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async verifyAdSession(adSessionId, nonce) {
    try {
      const response = await fetch(`${this.palEndpoint}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ad_session_id: adSessionId,
          nonce: nonce
        })
      });

      if (!response.ok) {
        throw new Error(`PAL verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        verified: data.verified || false,
        adSessionId: adSessionId,
        impressionUrl: data.impression_url
      };
    } catch (error) {
      console.error('PAL verification error:', error);
      return {
        verified: false,
        adSessionId: adSessionId
      };
    }
  }
}

// Google AdX Service
class AdXService {
  constructor() {
    this.requestCounter = 0;
    this.adRotationIndex = 0;
    this.realProgrammaticService = new RealProgrammaticService();
  }

  async requestAds(adxConfig, adRequest, ctvProvider) {
    try {
      console.log('🎯 AdX Service: Enhanced Programmatic Video Ad Request');
      console.log(`📱 CTV Provider: ${ctvProvider.name} (${ctvProvider.type})`);
      
      // Check if real programmatic mode is enabled
      if (adxConfig.useRealProgrammatic) {
        return await this.handleRealProgrammaticRequest(adxConfig, adRequest, ctvProvider);
      }
      
      // Existing mock/simulation logic
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

      const currentContent = this.selectContentContext(adRequest);
      console.log(`📺 Content Context: ${currentContent.title} (${currentContent.category})`);

      const deviceFingerprint = this.generateDeviceFingerprint(ctvProvider);
      console.log(`🔍 Device Fingerprint: ${deviceFingerprint.model} | ${deviceFingerprint.resolution}`);

      const palService = new PALService();
      const palData = await palService.generateNonce({
        ...adxConfig.palConfig,
        ctvProvider: ctvProvider.type,
        contentId: currentContent.id,
        deviceFingerprint
      });

      const auctionResult = this.runProgrammaticAuction(
        adxConfig, 
        adRequest, 
        ctvProvider, 
        currentContent,
        deviceFingerprint
      );

      console.log(`💰 Auction Winner: ${auctionResult.winningAd.brand} - $${auctionResult.winningAd.cpm} CPM`);
      console.log(`🎬 Ad Creative: ${auctionResult.winningAd.title}`);

      const vastResponse = this.generateAdvancedVAST(
        auctionResult.winningAd,
        adxConfig,
        ctvProvider,
        currentContent,
        deviceFingerprint,
        palData
      );

      const response = this.buildProgrammaticResponse(
        auctionResult,
        vastResponse,
        adxConfig,
        palData,
        currentContent,
        deviceFingerprint
      );

      this.logAdServingMetrics(auctionResult, currentContent, deviceFingerprint);
      return response;

    } catch (error) {
      console.error('❌ AdX Service Error:', error);
      return this.generateFallbackResponse(adxConfig, adRequest, ctvProvider);
    }
  }

  // New method to handle real programmatic requests
  async handleRealProgrammaticRequest(adxConfig, adRequest, ctvProvider) {
    try {
      console.log('🚀 REAL PROGRAMMATIC MODE ENABLED');
      
      // Select content context
      const contentContext = this.selectContentContext(adRequest);
      
      // Check if we should use demo mode
      const hasRealCredentials = this.hasValidCredentials(adxConfig.realExchangeCredentials);
      const useDemoMode = !hasRealCredentials || adxConfig.enableDemoMode;
      
      let auctionResult;
      
      if (useDemoMode) {
        console.log('🎬 Using DEMO MODE - Fetching real VAST ads from demo endpoints');
        auctionResult = await this.realProgrammaticService.runDemoMode(
          adRequest,
          ctvProvider,
          contentContext
        );
      } else {
        console.log('🔐 Using LIVE MODE - Real exchange credentials detected');
        
        // Configure credentials if provided
        if (adxConfig.realExchangeCredentials) {
          for (const [exchangeId, credentials] of Object.entries(adxConfig.realExchangeCredentials)) {
            this.realProgrammaticService.addExchangeCredentials(exchangeId, credentials);
          }
        }
        
        // Set floor prices if configured
        if (adxConfig.floorPrice) {
          this.realProgrammaticService.setFloorPrice(
            adRequest.adUnitCode, 
            'USD', 
            adxConfig.floorPrice
          );
        }
        
        // Run real programmatic auction
        auctionResult = await this.realProgrammaticService.runRealProgrammaticAuction(
          {
            ...adRequest,
            publisherId: adxConfig.publisherId,
            pageUrl: adxConfig.contentPageUrl || 'https://example.com',
            publisherName: adxConfig.publisherName || 'CTV Publisher'
          },
          ctvProvider,
          contentContext
        );
      }
      
      // Generate PAL data for the real ad
      const palService = new PALService();
      const palData = await palService.generateNonce({
        ...adxConfig.palConfig,
        ctvProvider: ctvProvider.type,
        contentId: contentContext.id,
        auctionId: auctionResult.auctionId
      });
      
      // Build response in expected format
      return this.buildRealProgrammaticResponse(
        auctionResult,
        adxConfig,
        palData,
        contentContext,
        ctvProvider
      );
      
    } catch (error) {
      console.error('❌ Real Programmatic Error:', error);
      // Fallback to mock if real fails
      console.log('🔄 Falling back to mock programmatic...');
      adxConfig.useRealProgrammatic = false;
      return await this.requestAds(adxConfig, adRequest, ctvProvider);
    }
  }

  // Check if valid credentials are provided
  hasValidCredentials(credentials) {
    if (!credentials) return false;
    
    for (const [exchangeId, creds] of Object.entries(credentials)) {
      // Check for basic auth requirements
      const hasGoogleAuth = creds.clientId && creds.clientId !== 'YOUR_GOOGLE_CLIENT_ID';
      const hasAmazonAuth = creds.accessKeyId && creds.accessKeyId !== 'YOUR_AWS_ACCESS_KEY_ID';
      const hasGenericAuth = creds.apiKey && creds.apiKey !== 'YOUR_API_KEY';
      
      if (hasGoogleAuth || hasAmazonAuth || hasGenericAuth) {
        console.log(`✅ Valid credentials found for ${exchangeId}`);
        return true;
      }
    }
    
    console.log('⚠️ No valid exchange credentials found, using demo mode');
    return false;
  }

  // Build response for real programmatic auction
  buildRealProgrammaticResponse(auctionResult, adxConfig, palData, contentContext, ctvProvider) {
    const requestId = this.generateRequestId();
    
    if (!auctionResult.winner) {
      console.log('❌ No winner from real auction');
      return this.generateFallbackResponse(adxConfig, {}, ctvProvider);
    }

    const winner = auctionResult.winner;
    const isDemoMode = auctionResult.isDemoMode || false;
    
    // OpenRTB response format
    const openRtbResponse = {
      id: auctionResult.auctionId,
      seatbid: [{
        bid: [{
          id: winner.id || winner.adId,
          impid: "1",
          price: auctionResult.clearingPrice,
          adm: auctionResult.vastXml || winner.adm || winner.vastXml,
          crid: winner.crid || winner.adId || winner.id,
          w: 1920,
          h: 1080,
          ext: {
            exchange: winner.exchangeName || winner.source,
            bidder: winner.seatId || winner.exchangeId || winner.sourceId,
            isDemoMode: isDemoMode,
            auctionData: {
              totalBidders: auctionResult.totalBidders,
              runnerUpPrice: auctionResult.runnerUpPrice,
              auctionTime: auctionResult.timestamp
            }
          }
        }],
        seat: winner.exchangeId || winner.sourceId
      }],
      cur: "USD",
      ext: {
        realProgrammatic: true,
        isDemoMode: isDemoMode,
        auctionId: auctionResult.auctionId
      }
    };

    // Prebid-style response
    const prebidResponse = {
      ads: [{
        requestId: requestId,
        adUnitCode: adxConfig.adUnitPath,
        cpm: auctionResult.clearingPrice,
        currency: "USD",
        width: 1920,
        height: 1080,
        vastXml: auctionResult.vastXml || winner.vastXml,
        creativeId: winner.crid || winner.adId || winner.id,
        netRevenue: true,
        ttl: 300,
        meta: {
          advertiserDomains: winner.adomain || [],
          brandName: winner.exchangeName || winner.source,
          networkName: winner.exchangeName || winner.source,
          mediaType: "video",
          isRealProgrammatic: true,
          isDemoMode: isDemoMode,
          vastSource: isDemoMode ? 'Demo Exchange' : 'Live Exchange'
        },
        pal: {
          verified: palData.verified,
          adSessionId: palData.adSessionId,
          impressionUrl: palData.impressionUrl,
          nonce: palData.nonce
        },
        auction: {
          auctionId: auctionResult.auctionId,
          totalBidders: auctionResult.totalBidders,
          clearingPrice: auctionResult.clearingPrice,
          runnerUpPrice: auctionResult.runnerUpPrice,
          exchange: winner.exchangeName || winner.source,
          realTime: true,
          isDemoMode: isDemoMode
        }
      }],
      source: isDemoMode ? "Real VAST Demo Exchanges" : "Live Programmatic Exchanges",
      adUnitPath: adxConfig.adUnitPath,
      isRealProgrammatic: true,
      isDemoMode: isDemoMode,
      contentContext: {
        title: contentContext.title,
        category: contentContext.category,
        keywords: contentContext.keywords
      },
      deviceFingerprint: {
        type: ctvProvider.type,
        name: ctvProvider.name,
        advertisingId: winner.ifa || 'unknown'
      }
    };

    console.log(`🎯 ${isDemoMode ? 'Demo' : 'Live'} Programmatic Response Generated:`);
    console.log(`   💰 CPM: $${auctionResult.clearingPrice.toFixed(2)}`);
    console.log(`   🏆 Winner: ${winner.exchangeName || winner.source}`);
    console.log(`   📊 Bidders: ${auctionResult.totalBidders}`);
    console.log(`   🎬 VAST: ${auctionResult.vastXml ? 'Real VAST Retrieved' : 'Fallback'}`);
    console.log(`   🎪 Mode: ${isDemoMode ? 'DEMO (Real VAST from demo endpoints)' : 'LIVE (Real exchange credentials)'}`);

    return {
      ...openRtbResponse,
      ...prebidResponse
    };
  }

  // Configure real exchange credentials
  configureRealExchange(exchangeId, credentials) {
    this.realProgrammaticService.addExchangeCredentials(exchangeId, credentials);
    console.log(`✅ Configured ${exchangeId} for real programmatic auctions`);
  }

  // Set real floor prices
  setRealFloorPrice(adUnitPath, price) {
    this.realProgrammaticService.setFloorPrice(adUnitPath, 'USD', price);
    console.log(`💰 Set floor price: ${adUnitPath} = $${price} CPM`);
  }

  // Add PMP deals
  addRealPMPDeal(dealId, advertiserId, price, exchanges) {
    this.realProgrammaticService.addPMPDeal(dealId, advertiserId, price, exchanges);
    console.log(`🤝 Added PMP deal: ${dealId} - $${price} CPM`);
  }

  selectContentContext(adRequest) {
    // Simulate realistic content selection based on request context
    const availableContent = CTV_CONTENT_LIBRARY.filter(content => {
      // Basic content filtering logic
      return content.language === 'en-US' && content.viewershipTier === 'premium';
    });

    // Weighted random selection based on viewership tiers
    const weights = availableContent.map(content => 
      content.viewershipTier === 'premium' ? 3 : 
      content.viewershipTier === 'standard' ? 2 : 1
    );
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < availableContent.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableContent[i];
      }
    }
    
    return availableContent[0] || CTV_CONTENT_LIBRARY[0];
  }

  generateDeviceFingerprint(ctvProvider) {
    const deviceProfile = CTV_DEVICE_PROFILES[ctvProvider.type];
    if (!deviceProfile) {
      return this.generateGenericFingerprint(ctvProvider);
    }

    // Select device model based on market share
    const models = deviceProfile.deviceModels;
    const random = Math.random() * 100;
    let cumulative = 0;
    
    let selectedModel = models[0];
    for (const model of models) {
      cumulative += model.marketShare;
      if (random <= cumulative) {
        selectedModel = model;
        break;
      }
    }

    // Generate realistic device characteristics
    const resolutions = deviceProfile.resolutions;
    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
    
    const connectionTypes = deviceProfile.connectionTypes;
    const connection = connectionTypes[Math.floor(Math.random() * connectionTypes.length)];

    return {
      model: selectedModel.model,
      userAgent: selectedModel.userAgent,
      resolution,
      connection,
      hdrSupported: deviceProfile.hdrFormats.length > 0,
      audioFormats: deviceProfile.audioFormats,
      advertisingId: deviceProfile.advertisingId(),
      iptvSupport: deviceProfile.iptvSupport,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };
  }

  runProgrammaticAuction(adxConfig, adRequest, ctvProvider, content, deviceFingerprint) {
    console.log('🔥 Running Enhanced Programmatic Auction...');
    
    // Filter ads based on targeting criteria
    const eligibleAds = PROGRAMMATIC_AD_INVENTORY.filter(ad => {
      return this.evaluateTargeting(ad, ctvProvider, content, deviceFingerprint);
    });

    console.log(`📊 Eligible Ads: ${eligibleAds.length}/${PROGRAMMATIC_AD_INVENTORY.length}`);

    if (eligibleAds.length === 0) {
      console.log('⚠️  No eligible ads found, using fallback inventory');
      eligibleAds.push(PROGRAMMATIC_AD_INVENTORY[0]); // Fallback
    }

    // Apply bid adjustments and run auction
    const bidsWithAdjustments = eligibleAds.map(ad => {
      const adjustedCpm = this.calculateBidAdjustments(ad, ctvProvider, content, deviceFingerprint);
      return {
        ...ad,
        originalCpm: ad.cpm,
        adjustedCpm,
        bidScore: adjustedCpm * (1 + Math.random() * 0.2) // Add bid variance
      };
    });

    // Sort by bid score (highest wins)
    bidsWithAdjustments.sort((a, b) => b.bidScore - a.bidScore);
    
    const winningAd = bidsWithAdjustments[0];
    const runnerUp = bidsWithAdjustments[1];

    // Calculate clearing price (second price auction)
    const clearingPrice = runnerUp ? 
      Math.min(winningAd.adjustedCpm, runnerUp.bidScore + 0.01) : 
      winningAd.adjustedCpm * 0.95;

    return {
      winningAd: {
        ...winningAd,
        cpm: clearingPrice
      },
      auctionData: {
        totalBidders: bidsWithAdjustments.length,
        averageBid: bidsWithAdjustments.reduce((sum, bid) => sum + bid.adjustedCpm, 0) / bidsWithAdjustments.length,
        winRate: (1 / bidsWithAdjustments.length) * 100,
        auctionId: this.generateRequestId(),
        timestamp: Date.now()
      }
    };
  }

  evaluateTargeting(ad, ctvProvider, content, deviceFingerprint) {
    // Device targeting
    if (!ad.targeting.deviceTypes.includes('ctv')) return false;
    
    // Content category targeting
    const contentMatches = ad.targeting.contentCategories.some(category => 
      content.category.toLowerCase().includes(category.toLowerCase()) ||
      content.keywords.some(keyword => keyword.toLowerCase().includes(category.toLowerCase()))
    );
    if (!contentMatches) return false;

    // Demographic targeting (simplified)
    const demographicMatches = ad.targeting.demographics.some(demo => 
      content.demographics.includes(demo)
    );
    if (!demographicMatches) return false;

    // Geographic targeting (simplified - assume US for now)
    if (!ad.targeting.geoTargets.includes('US')) return false;

    // Flight date targeting
    const now = new Date();
    const flightStart = new Date(ad.flightDates.start);
    const flightEnd = new Date(ad.flightDates.end);
    if (now < flightStart || now > flightEnd) return false;

    return true;
  }

  calculateBidAdjustments(ad, ctvProvider, content, deviceFingerprint) {
    let adjustedCpm = ad.cpm;

    // Content tier adjustment
    if (content.viewershipTier === 'premium') {
      adjustedCpm *= 1.25;
    } else if (content.viewershipTier === 'standard') {
      adjustedCpm *= 1.10;
    }

    // Device type premium
    const premiumDevices = ['lg', 'samsung', 'appletv'];
    if (premiumDevices.includes(ctvProvider.type)) {
      adjustedCpm *= 1.15;
    }

    // 4K resolution premium
    if (deviceFingerprint.resolution === '3840x2160') {
      adjustedCpm *= 1.20;
    }

    // HDR support premium
    if (deviceFingerprint.hdrSupported) {
      adjustedCpm *= 1.10;
    }

    // Time-based adjustments (prime time = higher CPMs)
    const hour = new Date().getHours();
    if (hour >= 19 && hour <= 22) { // Prime time
      adjustedCpm *= 1.30;
    } else if (hour >= 6 && hour <= 9) { // Morning
      adjustedCpm *= 1.15;
    }

    // Content category premium
    const premiumCategories = ['Sports', 'Technology', 'Documentary'];
    if (premiumCategories.includes(content.category)) {
      adjustedCpm *= 1.20;
    }

    return Math.round(adjustedCpm * 100) / 100; // Round to 2 decimal places
  }

  generateAdvancedVAST(ad, adxConfig, ctvProvider, content, deviceFingerprint, palData) {
    const vastId = this.generateRequestId();
    const impressionId = this.generateRequestId();
    
    // Enhanced tracking URLs with rich parameters
    const trackingParams = new URLSearchParams({
      ad_id: ad.adId,
      campaign_id: ad.campaignId,
      cpm: ad.cpm,
      provider: ctvProvider.type,
      device_model: encodeURIComponent(deviceFingerprint.model),
      content_id: content.id,
      content_category: content.category,
      resolution: deviceFingerprint.resolution,
      hdr: deviceFingerprint.hdrSupported,
      session_id: deviceFingerprint.sessionId,
      auction_id: ad.auctionId || 'unknown',
      timestamp: Date.now()
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.2">
  <Ad id="${vastId}" sequence="1">
    <InLine>
      <AdSystem version="1.0">${ad.advertiser}</AdSystem>
      <AdTitle><![CDATA[${ad.title}]]></AdTitle>
      <Description><![CDATA[${ad.description}]]></Description>
      <Survey><![CDATA[https://survey.${ad.advertiserDomain}/ctv-survey?${trackingParams}]]></Survey>
      <Error><![CDATA[https://track.${ad.advertiserDomain}/error?${trackingParams}&error=[ERRORCODE]]]></Error>
      <Impression><![CDATA[https://track.${ad.advertiserDomain}/impression?${trackingParams}]]></Impression>
      <Pricing model="CPM" currency="USD">
        <![CDATA[${ad.cpm}]]>
      </Pricing>
      <AdCategories>
        <Category authority="IAB">${ad.iabCategory}</Category>
      </AdCategories>
      <Creatives>
        <Creative id="${ad.adId}" sequence="1" adId="${ad.adId}">
          <Linear>
            <Duration>00:00:${ad.duration}</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://track.${ad.advertiserDomain}/start?${trackingParams}]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://track.${ad.advertiserDomain}/q1?${trackingParams}]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://track.${ad.advertiserDomain}/midpoint?${trackingParams}]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://track.${ad.advertiserDomain}/q3?${trackingParams}]]></Tracking>
              <Tracking event="complete"><![CDATA[https://track.${ad.advertiserDomain}/complete?${trackingParams}]]></Tracking>
              <Tracking event="mute"><![CDATA[https://track.${ad.advertiserDomain}/mute?${trackingParams}]]></Tracking>
              <Tracking event="unmute"><![CDATA[https://track.${ad.advertiserDomain}/unmute?${trackingParams}]]></Tracking>
              <Tracking event="pause"><![CDATA[https://track.${ad.advertiserDomain}/pause?${trackingParams}]]></Tracking>
              <Tracking event="resume"><![CDATA[https://track.${ad.advertiserDomain}/resume?${trackingParams}]]></Tracking>
              <Tracking event="fullscreen"><![CDATA[https://track.${ad.advertiserDomain}/fullscreen?${trackingParams}]]></Tracking>
              <Tracking event="exitFullscreen"><![CDATA[https://track.${ad.advertiserDomain}/exit_fullscreen?${trackingParams}]]></Tracking>
              <Tracking event="skip"><![CDATA[https://track.${ad.advertiserDomain}/skip?${trackingParams}]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[${ad.clickThrough}&${trackingParams}]]></ClickThrough>
              <ClickTracking><![CDATA[https://track.${ad.advertiserDomain}/click?${trackingParams}]]></ClickTracking>
            </VideoClicks>
            <MediaFiles>
              <MediaFile 
                delivery="progressive" 
                type="video/mp4" 
                width="1920" 
                height="1080"
                bitrate="5000"
                scalable="true"
                maintainAspectRatio="true">
                <![CDATA[${ad.creative.videoUrl}]]>
              </MediaFile>
            </MediaFiles>
            <AdParameters>
              <![CDATA[
                {
                  "advertiser": "${ad.advertiser}",
                  "campaign": "${ad.campaignId}",
                  "creative_concept": "${ad.creative.creativeConcept}",
                  "content_context": "${content.id}",
                  "targeting_score": ${Math.random() * 100},
                  "viewability_threshold": 50,
                  "device_type": "${ctvProvider.type}",
                  "pal_verified": ${palData ? 'true' : 'false'}
                }
              ]]>
            </AdParameters>
          </Linear>
        </Creative>
      </Creatives>
      <Extensions>
        <Extension type="IAB-TechLab">
          <AdServingData>
            <AuctionPrice currency="USD">${ad.cpm}</AuctionPrice>
            <BidderName>${ad.brand}</BidderName>
            <BidderSeat>${ad.campaignId}</BidderSeat>
          </AdServingData>
        </Extension>
        <Extension type="PAL">
          <PALData>
            <AdSessionId>${palData?.adSessionId || 'unknown'}</AdSessionId>
            <Verified>${palData ? 'true' : 'false'}</Verified>
          </PALData>
        </Extension>
      </Extensions>
    </InLine>
  </Ad>
</VAST>`;
  }

  buildProgrammaticResponse(auctionResult, vastXml, adxConfig, palData, content, deviceFingerprint) {
    const { winningAd, auctionData } = auctionResult;
    
    return {
      id: auctionData.auctionId,
      timestamp: new Date().toISOString(),
      seatbid: [{
        bid: [{
          id: this.generateRequestId(),
          impid: '1',
          price: winningAd.cpm,
          adm: vastXml,
          crid: winningAd.adId,
          w: 1920,
          h: 1080,
          ext: {
            programmatic: {
              auction_id: auctionData.auctionId,
              line_item_id: `li_${winningAd.campaignId}`,
              creative_id: winningAd.adId,
              advertiser_id: `adv_${winningAd.brand.toLowerCase().replace(/\s+/g, '_')}`,
              campaign_id: winningAd.campaignId,
              bid_adjustments: {
                content_tier: content.viewershipTier,
                device_premium: deviceFingerprint.model.includes('4K') ? 1.2 : 1.0,
                time_of_day: this.getTimeOfDayMultiplier(),
                geo_premium: 1.0
              }
            }
          }
        }],
        seat: `${winningAd.brand.toLowerCase().replace(/\s+/g, '_')}_dsp`
      }],
      ads: [{
        requestId: this.generateRequestId(),
        adUnitCode: adxConfig.adUnitPath,
        cpm: winningAd.cpm,
        originalCpm: winningAd.originalCpm,
        currency: 'USD',
        width: 1920,
        height: 1080,
        vastXml: vastXml,
        creativeId: winningAd.adId,
        netRevenue: true,
        ttl: 300,
        meta: {
          advertiserDomains: [winningAd.advertiserDomain],
          brandName: winningAd.brand,
          networkName: 'Enhanced Programmatic Ad Exchange',
          mediaType: 'video',
          adCategory: winningAd.category,
          primaryCategoryId: winningAd.iabCategory,
          targeting: {
            demographics: winningAd.targeting.demographics,
            interests: winningAd.targeting.interests,
            contentMatch: content.category,
            deviceType: deviceFingerprint.model
          }
        },
        pal: {
          verified: palData ? true : false,
          adSessionId: palData?.adSessionId || `sess_${this.generateRequestId()}`,
          impressionUrl: `https://track.${winningAd.advertiserDomain}/pal_impression?ad=${winningAd.adId}&verified=true`
        },
        // Enhanced ad metadata for player
        creative: {
          title: winningAd.title,
          description: winningAd.description,
          videoUrl: winningAd.creative.videoUrl,
          duration: winningAd.duration,
          concept: winningAd.creative.creativeConcept,
          format: winningAd.creative.creativeFormat
        },
        content: {
          contextId: content.id,
          contextTitle: content.title,
          contextCategory: content.category,
          contextKeywords: content.keywords
        },
        device: {
          model: deviceFingerprint.model,
          type: deviceFingerprint.connection,
          resolution: deviceFingerprint.resolution,
          hdrSupported: deviceFingerprint.hdrSupported
        },
        auction: {
          auctionId: auctionData.auctionId,
          totalBidders: auctionData.totalBidders,
          winRate: auctionData.winRate,
          averageBid: auctionData.averageBid
        },
        source: 'Enhanced Programmatic CTV Ad Exchange',
        isRealAd: true,
        isProgrammatic: true
      }],
      source: 'Enhanced Programmatic Ad Exchange',
      adUnitPath: adxConfig.adUnitPath,
      isRealGAM: true,
      contentContext: content,
      deviceFingerprint: deviceFingerprint,
      auctionMetadata: auctionData
    };
  }

  getTimeOfDayMultiplier() {
    const hour = new Date().getHours();
    if (hour >= 19 && hour <= 22) return 1.30; // Prime time
    if (hour >= 6 && hour <= 9) return 1.15;   // Morning
    if (hour >= 12 && hour <= 14) return 1.10; // Lunch
    return 1.00; // Off-peak
  }

  logAdServingMetrics(auctionResult, content, deviceFingerprint) {
    const { winningAd, auctionData } = auctionResult;
    
    console.log('\n🎯 ===== ENHANCED PROGRAMMATIC AD SERVING METRICS =====');
    console.log(`📊 Auction ID: ${auctionData.auctionId}`);
    console.log(`🏆 Winner: ${winningAd.brand} - ${winningAd.title}`);
    console.log(`💰 Winning CPM: $${winningAd.cpm} (Original: $${winningAd.originalCpm})`);
    console.log(`📈 Bid Adjustments: ${((winningAd.cpm / winningAd.originalCpm - 1) * 100).toFixed(1)}%`);
    console.log(`🎭 Creative Concept: ${winningAd.creative.creativeConcept}`);
    console.log(`📺 Content: ${content.title} (${content.category})`);
    console.log(`📱 Device: ${deviceFingerprint.model}`);
    console.log(`🔍 Resolution: ${deviceFingerprint.resolution} | HDR: ${deviceFingerprint.hdrSupported}`);
    console.log(`🎯 Targeting Match: ${winningAd.targeting.demographics.join(', ')}`);
    console.log(`📊 Competition: ${auctionData.totalBidders} bidders, avg bid $${auctionData.averageBid.toFixed(2)}`);
    console.log(`⏰ Served at: ${new Date().toLocaleTimeString()}`);
    console.log('========================================================\n');
  }

  generateFallbackResponse(adxConfig, adRequest, ctvProvider) {
    const fallbackAd = PROGRAMMATIC_AD_INVENTORY[0]; // Use first ad as fallback
    const vastXml = this.generateAdvancedVAST(
      fallbackAd, 
      adxConfig, 
      ctvProvider, 
      CTV_CONTENT_LIBRARY[0], 
      this.generateGenericFingerprint(ctvProvider), 
      null
    );

    return {
      id: this.generateRequestId(),
      fallback: true,
      ads: [{
        requestId: this.generateRequestId(),
        adUnitCode: adxConfig.adUnitPath,
        cpm: fallbackAd.cpm * 0.8, // Reduced CPM for fallback
        currency: 'USD',
        width: 1920,
        height: 1080,
        vastXml: vastXml,
        creativeId: fallbackAd.adId,
        creative: fallbackAd.creative,
        meta: {
          brandName: fallbackAd.brand,
          networkName: 'Fallback Ad Network'
        },
        source: 'Fallback Response'
      }]
    };
  }

  generateGenericFingerprint(ctvProvider) {
    return {
      model: `Generic ${ctvProvider.name}`,
      userAgent: ctvProvider.userAgent || 'Generic CTV Device',
      resolution: '1920x1080',
      connection: 'wifi',
      hdrSupported: false,
      audioFormats: ['AAC'],
      advertisingId: this.generateRequestId(),
      iptvSupport: true,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };
  }

  // Device ID Generators
  generateRokuDeviceId() {
    return 'roku_' + Array.from({length: 12}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('').toUpperCase();
  }

  generateTIFA() {
    return 'tifa_' + Array.from({length: 8}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 12}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  }

  generateLGUDID() {
    return 'lg_' + Array.from({length: 16}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('').toLowerCase();
  }

  generateAmazonAID() {
    return 'amzn_' + Array.from({length: 8}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 12}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  }

  generateGAID() {
    return Array.from({length: 8}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 12}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  }

  generateIDFA() {
    return Array.from({length: 8}, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 4}, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('') + '-' + Array.from({length: 12}, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('');
  }

  generateRequestId() {
    return 'req_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
  }

  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 10) + '_' + Date.now();
  }

  // ... existing methods ...
}

const adxService = new AdXService();

// API Endpoints

// Get PAL nonce
router.post('/pal/nonce', async (req, res) => {
  try {
    const palRequest = req.body;
    const nonce = await adxService.palService.generateNonce(palRequest);
    res.json(nonce);
  } catch (error) {
    console.error('PAL nonce error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify PAL ad session
router.post('/pal/verify', async (req, res) => {
  try {
    const { adSessionId, nonce } = req.body;
    const verification = await adxService.palService.verifyAdSession(adSessionId, nonce);
    res.json(verification);
  } catch (error) {
    console.error('PAL verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request ads from Google AdX
router.post('/request', async (req, res) => {
  try {
    const { adxConfig, adRequest, ctvProvider } = req.body;
    
    // Get CTV provider configuration
    const provider = CTV_PROVIDERS[ctvProvider] || CTV_PROVIDERS.roku;
    
    const response = await adxService.requestAds(adxConfig, adRequest, provider);
    res.json(response);
  } catch (error) {
    console.error('AdX request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get CTV provider configurations
router.get('/providers', (req, res) => {
  res.json(CTV_PROVIDERS);
});

// Get specific CTV provider configuration
router.get('/providers/:provider', (req, res) => {
  const provider = CTV_PROVIDERS[req.params.provider];
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  res.json(provider);
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Google AdX with PAL SDK',
    providers: Object.keys(CTV_PROVIDERS),
    timestamp: new Date().toISOString()
  });
});

export default router; 