// Real Programmatic Ad Exchange Integration
// Connects to live programmatic platforms for actual video ad auctions

import { createHash, randomBytes } from 'crypto';
import { performance } from 'perf_hooks';

// Real Ad Exchange Endpoints
const REAL_AD_EXCHANGES = {
  google_adx: {
    name: 'Google Ad Exchange',
    endpoint: 'https://googleads.g.doubleclick.net/gampad/ads',
    rtbEndpoint: 'https://googleads.g.doubleclick.net/pagead/ads',
    vastEndpoint: 'https://pubads.g.doubleclick.net/gampad/ads',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3', 'vast2'],
    maxBidTimeout: 1000,
    currency: 'USD'
  },
  amazon_dsp: {
    name: 'Amazon DSP',
    endpoint: 'https://aax-us-east.amazon-adsystem.com/e/rtb/v2',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3'],
    maxBidTimeout: 800,
    currency: 'USD'
  },
  trade_desk: {
    name: 'The Trade Desk',
    endpoint: 'https://insight.adsrvr.org/track/conv',
    rtbEndpoint: 'https://rtb.thetradedesk.com/bid/v1',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3'],
    maxBidTimeout: 1200,
    currency: 'USD'
  },
  magnite: {
    name: 'Magnite (Rubicon)',
    endpoint: 'https://fastlane.rubiconproject.com/a/api/fastlane.json',
    rtbEndpoint: 'https://exchange.rubiconproject.com/rtb/bid',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3'],
    maxBidTimeout: 1000,
    currency: 'USD'
  },
  pubmatic: {
    name: 'PubMatic',
    endpoint: 'https://hbopenbid.pubmatic.com/translator',
    rtbEndpoint: 'https://image2.pubmatic.com/AdServer/AdServerServlet',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3'],
    maxBidTimeout: 900,
    currency: 'USD'
  },
  openx: {
    name: 'OpenX',
    endpoint: 'https://rtb.openx.net/rtb/v1',
    requiresAuth: true,
    supportedFormats: ['vast4', 'vast3'],
    maxBidTimeout: 1000,
    currency: 'USD'
  }
};

// Real Programmatic Service Class
export class RealProgrammaticService {
  constructor(config = {}) {
    this.config = {
      timeout: 2000,
      maxParallelRequests: 8,
      enableQPS: true,
      enableFloorPrices: true,
      enablePrivateMarketplaces: true,
      enableHeaderBidding: true,
      ...config
    };
    
    this.credentials = new Map();
    this.floorPrices = new Map();
    this.pmpDeals = new Map();
    this.requestCounter = 0;
  }

  // Configure real ad exchange credentials
  addExchangeCredentials(exchangeId, credentials) {
    this.credentials.set(exchangeId, {
      ...credentials,
      timestamp: Date.now()
    });
    console.log(`✅ Configured credentials for ${REAL_AD_EXCHANGES[exchangeId]?.name || exchangeId}`);
  }

  // Set floor prices for different ad placements
  setFloorPrice(adUnitPath, currency, price) {
    this.floorPrices.set(adUnitPath, {
      currency,
      price,
      timestamp: Date.now()
    });
  }

  // Add Private Marketplace (PMP) deals
  addPMPDeal(dealId, advertiserId, price, adExchanges) {
    this.pmpDeals.set(dealId, {
      advertiserId,
      price,
      exchanges: adExchanges,
      isActive: true,
      timestamp: Date.now()
    });
  }

  // Main method to run real programmatic auction
  async runRealProgrammaticAuction(adRequest, ctvProvider, contentContext) {
    const auctionId = this.generateAuctionId();
    const startTime = performance.now();
    
    console.log(`🚀 Starting REAL Programmatic Auction: ${auctionId}`);
    console.log(`📱 CTV Device: ${ctvProvider.name} (${ctvProvider.type})`);
    console.log(`📺 Content: ${contentContext.title} - ${contentContext.category}`);

    try {
      // Step 1: Generate OpenRTB 2.6 bid request
      const rtbRequest = this.generateOpenRTBRequest(adRequest, ctvProvider, contentContext, auctionId);
      
      // Step 2: Send parallel requests to all configured exchanges
      const bidPromises = this.sendBidRequestsToExchanges(rtbRequest);
      
      // Step 3: Wait for responses with timeout
      const bidResponses = await this.collectBidResponses(bidPromises);
      
      // Step 4: Run second-price auction with real bids
      const auctionResult = this.conductSecondPriceAuction(bidResponses, auctionId);
      
      // Step 5: If we have a winner, get the real VAST tag
      if (auctionResult.winner) {
        const vastTag = await this.retrieveRealVAST(auctionResult.winner);
        auctionResult.vastXml = vastTag;
      }

      const endTime = performance.now();
      console.log(`🏆 Auction Complete: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`💰 Winner: ${auctionResult.winner?.exchange || 'No Winner'} - $${auctionResult.clearingPrice || 0} CPM`);
      
      return auctionResult;

    } catch (error) {
      console.error('❌ Real Programmatic Auction Error:', error);
      throw error;
    }
  }

  // Generate OpenRTB 2.6 compliant bid request
  generateOpenRTBRequest(adRequest, ctvProvider, contentContext, auctionId) {
    const deviceFingerprint = this.generateDeviceFingerprint(ctvProvider);
    
    return {
      id: auctionId,
      at: 2, // Second price auction
      tmax: this.config.timeout,
      imp: [{
        id: "1",
        video: {
          mimes: ["video/mp4", "video/webm", "application/javascript"],
          minduration: 15,
          maxduration: 60,
          protocols: [2, 3, 5, 6, 7, 8], // VAST 2.0-4.0
          w: adRequest.video?.playerSize?.[0]?.[0] || 1920,
          h: adRequest.video?.playerSize?.[0]?.[1] || 1080,
          startdelay: 0, // Pre-roll
          placement: 1, // In-stream
          linearity: 1, // Linear
          skip: 1,
          skipmin: 5,
          skipafter: 15,
          sequence: 1,
          battr: [13, 14, 6], // Block auto-play sound, audio ad, expandable
          maxextended: 30,
          minbitrate: 300,
          maxbitrate: 4000,
          playbackmethod: [1, 2, 3],
          delivery: [1, 2, 3],
          api: [1, 2, 3, 4, 5, 6, 7] // VPAID, MRAID, OMID
        },
        bidfloor: this.getFloorPrice(adRequest.adUnitCode),
        bidfloorcur: "USD",
        secure: 1,
        tagid: adRequest.adUnitCode
      }],
      site: {
        id: contentContext.id,
        name: contentContext.title,
        domain: new URL(adRequest.pageUrl || 'https://example.com').hostname,
        cat: [this.mapContentCategory(contentContext.category)],
        page: adRequest.pageUrl,
        ref: adRequest.referrer,
        publisher: {
          id: adRequest.publisherId,
          name: adRequest.publisherName || "CTV Publisher",
          domain: new URL(adRequest.pageUrl || 'https://example.com').hostname
        },
        content: {
          id: contentContext.id,
          episode: contentContext.episode || 1,
          title: contentContext.title,
          series: contentContext.series,
          season: contentContext.season,
          genre: contentContext.genre,
          cat: [this.mapContentCategory(contentContext.category)],
          videoquality: 4, // HD
          keywords: contentContext.keywords?.join(','),
          livestream: contentContext.isLive ? 1 : 0,
          len: contentContext.duration,
          language: contentContext.language || 'en'
        }
      },
      device: {
        ua: deviceFingerprint.userAgent,
        geo: {
          country: "USA",
          region: "CA",
          city: "Los Angeles",
          type: 1,
          utcoffset: -480
        },
        ip: this.generateRandomIP(),
        devicetype: 3, // Connected TV
        make: this.extractDeviceMake(deviceFingerprint.model),
        model: deviceFingerprint.model,
        os: this.extractOS(ctvProvider.type),
        osv: "11.0",
        w: 1920,
        h: 1080,
        ppi: 96,
        pxratio: 1.0,
        connectiontype: 1, // WiFi
        ifa: deviceFingerprint.advertisingId, // Advertising ID
        didmd5: createHash('md5').update(deviceFingerprint.advertisingId).digest('hex'),
        dpidmd5: createHash('md5').update(deviceFingerprint.advertisingId).digest('hex'),
        lmt: 0 // Limit ad tracking disabled
      },
      user: {
        id: this.generateUserId(),
        buyeruid: this.generateUserId()
      },
      test: 0, // Production traffic
      source: {
        fd: 0, // Not a direct deal
        tid: auctionId,
        pchain: "1.0" // Payment chain
      },
      regs: {
        ext: {
          gdpr: adRequest.gdpr?.gdprApplies ? 1 : 0,
          us_privacy: adRequest.uspConsent || "1---"
        }
      },
      user: {
        ext: {
          consent: adRequest.gdpr?.consentString
        }
      },
      ext: {
        prebid: {
          targeting: {},
          cache: {
            bids: {},
            vastxml: {
              returnCreative: true
            }
          }
        }
      }
    };
  }

  // Send bid requests to all configured exchanges
  async sendBidRequestsToExchanges(rtbRequest) {
    const promises = [];
    
    for (const [exchangeId, exchange] of Object.entries(REAL_AD_EXCHANGES)) {
      const credentials = this.credentials.get(exchangeId);
      if (!credentials) {
        console.log(`⚠️  Skipping ${exchange.name} - No credentials configured`);
        continue;
      }

      const promise = this.sendBidRequest(exchangeId, exchange, rtbRequest, credentials)
        .catch(error => ({
          exchangeId,
          error: error.message,
          timestamp: Date.now()
        }));
      
      promises.push(promise);
    }

    return promises;
  }

  // Send individual bid request to an exchange
  async sendBidRequest(exchangeId, exchange, rtbRequest, credentials) {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    try {
      console.log(`📤 Sending bid request to ${exchange.name}...`);

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CTV-Simulator/1.0',
          'X-Openrtb-Version': '2.6',
          'X-Request-ID': requestId,
          ...this.getExchangeHeaders(exchangeId, credentials)
        },
        body: JSON.stringify(rtbRequest),
        timeout: exchange.maxBidTimeout
      };

      const response = await fetch(exchange.rtbEndpoint, requestOptions);
      const responseData = await response.json();
      
      const responseTime = performance.now() - startTime;
      
      if (response.ok && responseData.seatbid?.length > 0) {
        console.log(`✅ ${exchange.name} responded: ${responseData.seatbid.length} bids in ${responseTime.toFixed(2)}ms`);
        
        return {
          exchangeId,
          exchangeName: exchange.name,
          bids: responseData.seatbid.flatMap(seat => 
            seat.bid.map(bid => ({
              ...bid,
              seatId: seat.seat,
              exchangeId,
              responseTime
            }))
          ),
          currency: responseData.cur || 'USD',
          timestamp: Date.now()
        };
      } else {
        console.log(`⚠️  ${exchange.name} no bids`);
        return {
          exchangeId,
          exchangeName: exchange.name,
          bids: [],
          timestamp: Date.now()
        };
      }

    } catch (error) {
      console.error(`❌ ${exchange.name} error:`, error.message);
      throw error;
    }
  }

  // Collect all bid responses with timeout
  async collectBidResponses(bidPromises) {
    try {
      const results = await Promise.allSettled(bidPromises);
      const successfulResponses = results
        .filter(result => result.status === 'fulfilled' && result.value.bids)
        .map(result => result.value);

      console.log(`📊 Collected ${successfulResponses.length} exchange responses`);
      return successfulResponses;
    } catch (error) {
      console.error('❌ Error collecting bid responses:', error);
      return [];
    }
  }

  // Conduct second-price auction with real bids
  conductSecondPriceAuction(bidResponses, auctionId) {
    const allBids = bidResponses.flatMap(response => 
      response.bids.map(bid => ({
        ...bid,
        exchangeName: response.exchangeName,
        price: parseFloat(bid.price),
        cpm: parseFloat(bid.price)
      }))
    );

    if (allBids.length === 0) {
      console.log('❌ No bids received from any exchange');
      return {
        auctionId,
        winner: null,
        clearingPrice: 0,
        totalBidders: 0,
        timestamp: Date.now()
      };
    }

    // Sort bids by price (descending)
    allBids.sort((a, b) => b.price - a.price);
    
    const winner = allBids[0];
    const runnerUp = allBids[1];
    
    // Second-price auction: winner pays runner-up bid + $0.01
    const clearingPrice = runnerUp ? runnerUp.price + 0.01 : winner.price * 0.95;

    console.log(`🏆 Auction Winner: ${winner.exchangeName} - $${clearingPrice.toFixed(2)} CPM`);
    console.log(`📈 Total Bidders: ${allBids.length} | Average Bid: $${(allBids.reduce((sum, bid) => sum + bid.price, 0) / allBids.length).toFixed(2)}`);

    return {
      auctionId,
      winner: {
        ...winner,
        clearingPrice
      },
      clearingPrice,
      runnerUpPrice: runnerUp?.price || 0,
      totalBidders: allBids.length,
      allBids,
      timestamp: Date.now()
    };
  }

  // Retrieve real VAST tag from winning exchange
  async retrieveRealVAST(winner) {
    try {
      console.log(`🎬 Retrieving VAST creative from ${winner.exchangeName}...`);
      
      // Most exchanges return VAST in the 'adm' field
      if (winner.adm) {
        // If it's a VAST URL, fetch it
        if (winner.adm.startsWith('http')) {
          const response = await fetch(winner.adm);
          return await response.text();
        }
        // If it's VAST XML, return directly
        else if (winner.adm.includes('<VAST')) {
          return winner.adm;
        }
      }

      // Fallback: try nurl (notification URL) which might contain VAST
      if (winner.nurl) {
        const response = await fetch(winner.nurl);
        return await response.text();
      }

      throw new Error('No VAST creative found in winning bid');

    } catch (error) {
      console.error('❌ Error retrieving VAST:', error);
      // Return a basic VAST wrapper as fallback
      return this.generateFallbackVAST(winner);
    }
  }

  // Helper methods
  getExchangeHeaders(exchangeId, credentials) {
    const headers = {};
    
    switch (exchangeId) {
      case 'google_adx':
        headers['Authorization'] = `Bearer ${credentials.accessToken}`;
        break;
      case 'amazon_dsp':
        headers['Authorization'] = `AWS4-HMAC-SHA256 ${credentials.signature}`;
        break;
      case 'trade_desk':
        headers['TTD-Auth'] = credentials.apiToken;
        break;
      default:
        if (credentials.apiKey) {
          headers['X-API-Key'] = credentials.apiKey;
        }
        if (credentials.authToken) {
          headers['Authorization'] = `Bearer ${credentials.authToken}`;
        }
    }
    
    return headers;
  }

  getFloorPrice(adUnitCode) {
    const floor = this.floorPrices.get(adUnitCode);
    return floor ? floor.price : 0.50; // Default $0.50 CPM floor
  }

  mapContentCategory(category) {
    const categoryMap = {
      'comedy': 'IAB1-5',
      'entertainment': 'IAB1-2',
      'technology': 'IAB19',
      'cooking': 'IAB8-5',
      'sports': 'IAB17',
      'documentary': 'IAB1-2',
      'news': 'IAB12'
    };
    return categoryMap[category.toLowerCase()] || 'IAB1';
  }

  generateDeviceFingerprint(ctvProvider) {
    // Use existing device fingerprint generation
    const deviceProfile = {
      model: `${ctvProvider.name} Device`,
      userAgent: ctvProvider.userAgent,
      advertisingId: this.generateAdvertisingId(ctvProvider.type),
      ipAddress: this.generateRandomIP()
    };
    return deviceProfile;
  }

  generateAdvertisingId(deviceType) {
    switch (deviceType) {
      case 'roku': return `ROKU_${randomBytes(8).toString('hex').toUpperCase()}`;
      case 'samsung': return `TIFA_${randomBytes(8).toString('hex').toUpperCase()}`;
      case 'lg': return `LGUDID_${randomBytes(8).toString('hex').toUpperCase()}`;
      case 'firetv': return `AMAZON_${randomBytes(8).toString('hex').toUpperCase()}`;
      case 'androidtv': return `GAID_${randomBytes(16).toString('hex')}`;
      case 'appletv': return `IDFA_${randomBytes(16).toString('hex').toUpperCase()}`;
      default: return `CTV_${randomBytes(8).toString('hex').toUpperCase()}`;
    }
  }

  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  extractDeviceMake(model) {
    if (model.includes('Roku')) return 'Roku';
    if (model.includes('Samsung')) return 'Samsung';
    if (model.includes('LG')) return 'LG';
    if (model.includes('Fire')) return 'Amazon';
    if (model.includes('Android')) return 'Google';
    if (model.includes('Apple')) return 'Apple';
    return 'Unknown';
  }

  extractOS(deviceType) {
    const osMap = {
      'roku': 'Roku OS',
      'samsung': 'Tizen',
      'lg': 'webOS',
      'firetv': 'Fire OS',
      'androidtv': 'Android TV',
      'appletv': 'tvOS'
    };
    return osMap[deviceType] || 'CTV OS';
  }

  generateAuctionId() {
    return `auction_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  generateRequestId() {
    return `req_${Date.now()}_${randomBytes(6).toString('hex')}`;
  }

  generateUserId() {
    return randomBytes(16).toString('hex');
  }

  generateFallbackVAST(winner) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="${winner.id || 'fallback'}">
    <InLine>
      <AdSystem>${winner.exchangeName}</AdSystem>
      <AdTitle>Live Programmatic Video Ad</AdTitle>
      <Impression><![CDATA[${winner.nurl || 'https://example.com/impression'}]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <VideoClicks>
              <ClickThrough><![CDATA[${winner.clickUrl || 'https://example.com'}]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
  }
}

export default RealProgrammaticService; 