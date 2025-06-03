// Real Programmatic Exchange Configuration
// Set up credentials and configurations for live ad exchanges

export const REAL_PROGRAMMATIC_CONFIG = {
  // Global settings
  settings: {
    enableRealProgrammatic: true,
    timeout: 2000, // 2 second timeout for auctions
    maxParallelRequests: 6,
    enableFloorPrices: true,
    enablePMPDeals: true,
    enableHeaderBidding: true,
    defaultFloorPrice: 0.50, // $0.50 CPM minimum
    // NEW: Test mode for getting started
    enableTestMode: true, // Set to false when you have real credentials
    fallbackToDemo: true  // Falls back to demo ads if no real credentials
  },

  // Real Ad Exchange Credentials (REPLACE WITH YOUR ACTUAL CREDENTIALS)
  exchangeCredentials: {
    google_adx: {
      // Google Ad Exchange / Google Ad Manager
      // STEP 1: Get these from https://admanager.google.com/
      clientId: process.env.GOOGLE_ADX_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_ADX_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
      refreshToken: process.env.GOOGLE_ADX_REFRESH_TOKEN || 'YOUR_GOOGLE_REFRESH_TOKEN',
      accessToken: process.env.GOOGLE_ADX_ACCESS_TOKEN || 'YOUR_GOOGLE_ACCESS_TOKEN',
      networkCode: process.env.GOOGLE_ADX_NETWORK_CODE || '22106938864', // Your GAM network code
      publisherId: process.env.GOOGLE_ADX_PUBLISHER_ID || 'YOUR_PUBLISHER_ID',
      
      // GAM-specific settings
      adUnitPath: '/22106938864,22966701315/failarmy-auth-ctv-android',
      sizes: [[1920, 1080], [1280, 720]],
      targeting: {
        device_category: ['ctv', 'connected_tv'],
        content_genre: ['entertainment', 'sports', 'news']
      },
      // NEW: Simple demo integration for testing
      demoMode: true, // Uses Google's demo ad units for testing
      demoNetworkCode: '22106938864'
    },

    amazon_dsp: {
      // Amazon DSP / Amazon Publisher Services
      // STEP 2: Get these from https://aps.amazon.com/
      accessKeyId: process.env.AMAZON_DSP_ACCESS_KEY || 'YOUR_AWS_ACCESS_KEY_ID',
      secretAccessKey: process.env.AMAZON_DSP_SECRET_KEY || 'YOUR_AWS_SECRET_ACCESS_KEY',
      region: 'us-east-1',
      publisherId: process.env.AMAZON_PUBLISHER_ID || 'YOUR_AMAZON_PUBLISHER_ID',
      siteId: process.env.AMAZON_SITE_ID || 'YOUR_AMAZON_SITE_ID',
      
      // Amazon-specific settings
      bidFloor: 0.75,
      categories: ['entertainment', 'sports'],
      targeting: {
        device_type: 'ctv',
        video_placement: 'preroll'
      },
      // NEW: Test with Amazon's demo endpoints
      demoMode: true,
      testEndpoint: 'https://c.amazon-adsystem.com/aax2/getads.js'
    },

    // NEW: Add SpotX (now Magnite) as they have easier onboarding
    spotx: {
      // SpotX/Magnite - Good for getting started with CTV
      channelId: process.env.SPOTX_CHANNEL_ID || 'YOUR_SPOTX_CHANNEL_ID',
      publisherId: process.env.SPOTX_PUBLISHER_ID || 'YOUR_SPOTX_PUBLISHER_ID',
      apiKey: process.env.SPOTX_API_KEY || 'YOUR_SPOTX_API_KEY',
      
      // SpotX settings
      bidFloor: 0.50,
      categories: ['video', 'entertainment'],
      demoMode: true, // Uses SpotX test campaigns
      testChannelId: '85394' // SpotX demo channel
    },

    trade_desk: {
      // The Trade Desk
      apiToken: 'YOUR_TTD_API_TOKEN',
      partnerId: 'YOUR_TTD_PARTNER_ID',
      advertiserId: 'YOUR_TTD_ADVERTISER_ID',
      
      // TTD-specific settings
      dataProviders: ['your_data_provider_id'],
      audienceSegments: ['ctv_viewers', 'premium_content'],
      geoTargeting: ['US', 'CA', 'UK']
    },

    magnite: {
      // Magnite (formerly Rubicon Project)
      siteId: 'YOUR_MAGNITE_SITE_ID',
      zoneId: 'YOUR_MAGNITE_ZONE_ID',
      accountId: 'YOUR_MAGNITE_ACCOUNT_ID',
      apiKey: 'YOUR_MAGNITE_API_KEY',
      
      // Magnite-specific settings
      floor: 0.60,
      categories: ['entertainment', 'lifestyle'],
      videoFormats: ['vast3', 'vast4']
    },

    pubmatic: {
      // PubMatic
      publisherId: 'YOUR_PUBMATIC_PUBLISHER_ID',
      adSlotId: 'YOUR_PUBMATIC_ADSLOT_ID',
      apiKey: 'YOUR_PUBMATIC_API_KEY',
      
      // PubMatic-specific settings
      floor: 0.55,
      categories: ['video', 'entertainment'],
      dealIds: ['your_pmp_deal_id_1', 'your_pmp_deal_id_2']
    },

    openx: {
      // OpenX
      deliveryDomain: 'your-publisher.openx.net',
      adUnitId: 'YOUR_OPENX_AD_UNIT_ID',
      apiKey: 'YOUR_OPENX_API_KEY',
      
      // OpenX-specific settings
      floor: 0.65,
      categories: ['video', 'ctv'],
      customTargeting: {
        content_rating: 'pg',
        genre: 'entertainment'
      }
    }
  },

  // Floor Prices by Ad Unit
  floorPrices: {
    '/22106938864,22966701315/failarmy-auth-ctv-android': {
      currency: 'USD',
      price: 0.75,
      lastUpdated: Date.now()
    },
    '/22106938864,22966701315/premium-ctv-content': {
      currency: 'USD',
      price: 1.50,
      lastUpdated: Date.now()
    },
    '/22106938864,22966701315/sports-ctv-live': {
      currency: 'USD',
      price: 2.25,
      lastUpdated: Date.now()
    }
  },

  // Private Marketplace (PMP) Deals
  pmpDeals: {
    'deal_premium_video_001': {
      dealId: 'deal_premium_video_001',
      advertiserId: 'nike_brand_advertising',
      price: 3.50,
      currency: 'USD',
      exchanges: ['google_adx', 'trade_desk'],
      categories: ['sports', 'fitness'],
      targeting: {
        device: 'ctv',
        content_rating: ['pg', 'pg13'],
        demographics: ['18-34', '25-54']
      },
      isActive: true,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    },
    'deal_entertainment_002': {
      dealId: 'deal_entertainment_002',
      advertiserId: 'disney_entertainment',
      price: 4.25,
      currency: 'USD',
      exchanges: ['google_adx', 'amazon_dsp'],
      categories: ['entertainment', 'family'],
      targeting: {
        device: 'ctv',
        content_genre: ['comedy', 'animation'],
        time_of_day: ['primetime', 'weekend']
      },
      isActive: true,
      startDate: '2025-01-01',
      endDate: '2025-06-30'
    }
  },

  // Content Category Mapping for Targeting
  contentCategoryMapping: {
    'comedy': 'IAB1-5',
    'entertainment': 'IAB1-2',
    'technology': 'IAB19',
    'cooking': 'IAB8-5',
    'sports': 'IAB17',
    'documentary': 'IAB1-2',
    'news': 'IAB12',
    'automotive': 'IAB2',
    'finance': 'IAB13',
    'travel': 'IAB20'
  },

  // Device Targeting Settings
  deviceTargeting: {
    roku: {
      advertisingIdType: 'ROKU_ID',
      targetingSupport: ['demographic', 'behavioral', 'contextual'],
      premiumMultiplier: 1.1
    },
    samsung: {
      advertisingIdType: 'TIFA',
      targetingSupport: ['demographic', 'behavioral', 'contextual', 'geographic'],
      premiumMultiplier: 1.15
    },
    lg: {
      advertisingIdType: 'LGUDID',
      targetingSupport: ['demographic', 'contextual'],
      premiumMultiplier: 1.10
    },
    firetv: {
      advertisingIdType: 'AMAZON_AID',
      targetingSupport: ['demographic', 'behavioral', 'contextual', 'purchase'],
      premiumMultiplier: 1.20
    },
    androidtv: {
      advertisingIdType: 'GAID',
      targetingSupport: ['demographic', 'behavioral', 'contextual', 'location'],
      premiumMultiplier: 1.05
    },
    appletv: {
      advertisingIdType: 'IDFA',
      targetingSupport: ['demographic', 'contextual'],
      premiumMultiplier: 1.25
    }
  },

  // Real-time Bidding Settings
  rtbSettings: {
    maxBidTimeout: 1500, // milliseconds
    enableSecondPriceAuction: true,
    bidFloorEnforcement: true,
    enableBrandSafety: true,
    enableViewabilityFiltering: true,
    
    // Bid adjustment factors
    bidAdjustments: {
      primetime: 1.30,    // 6pm-11pm
      morning: 1.15,      // 6am-12pm
      afternoon: 1.10,    // 12pm-6pm
      latenight: 0.85,    // 11pm-6am
      weekend: 1.20,      // Saturday-Sunday
      holiday: 1.40,      // Holiday periods
      
      // Content-based adjustments
      liveContent: 1.35,
      premiumContent: 1.25,
      exclusiveContent: 1.50,
      
      // Device-based adjustments
      hdr: 1.20,
      fourK: 1.30,
      dolbyAtmos: 1.15
    }
  },

  // Privacy and Compliance Settings
  privacySettings: {
    enableGDPR: true,
    enableCCPA: true,
    enableCOPPA: false, // CTV typically adult-oriented
    
    consentStrings: {
      gdpr: 'YOUR_GDPR_CONSENT_STRING',
      ccpa: 'YOUR_CCPA_CONSENT_STRING'
    },
    
    // Data collection settings
    enableDeviceFingerprinting: true,
    enableBehavioralTargeting: true,
    enableCrossPlatformTracking: true,
    
    // Required for CTV advertising
    enableLimitedAdTracking: false,
    respectDoNotTrack: false
  }
};

// Helper function to validate configuration
export function validateRealProgrammaticConfig(config = REAL_PROGRAMMATIC_CONFIG) {
  const errors = [];
  
  // Check required exchange credentials
  for (const [exchangeId, credentials] of Object.entries(config.exchangeCredentials)) {
    if (!credentials.apiKey && !credentials.accessToken && !credentials.clientId) {
      errors.push(`Missing authentication for ${exchangeId}`);
    }
  }
  
  // Check floor prices
  for (const [adUnit, floor] of Object.entries(config.floorPrices)) {
    if (!floor.price || floor.price <= 0) {
      errors.push(`Invalid floor price for ${adUnit}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to get exchange credentials
export function getExchangeCredentials(exchangeId) {
  return REAL_PROGRAMMATIC_CONFIG.exchangeCredentials[exchangeId] || null;
}

// Function to get floor price for ad unit
export function getFloorPrice(adUnitPath) {
  const floor = REAL_PROGRAMMATIC_CONFIG.floorPrices[adUnitPath];
  return floor ? floor.price : REAL_PROGRAMMATIC_CONFIG.settings.defaultFloorPrice;
}

// Function to get active PMP deals
export function getActivePMPDeals() {
  return Object.values(REAL_PROGRAMMATIC_CONFIG.pmpDeals)
    .filter(deal => deal.isActive)
    .filter(deal => {
      const now = new Date();
      const start = new Date(deal.startDate);
      const end = new Date(deal.endDate);
      return now >= start && now <= end;
    });
}

export default REAL_PROGRAMMATIC_CONFIG; 