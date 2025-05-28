import axios from 'axios';
import { CTVConfig, PrebidDemandSource, PrebidServerRequest, AdRequest } from '../types';

// Prebid Server demand sources based on the provided table
export const PREBID_DEMAND_SOURCES: PrebidDemandSource[] = [
  {
    name: 'One Tag',
    bidder: 'onetag',
    params: {
      pubId: '770a10a1445c7df'
    },
    defaultValues: {
      pubId: '770a10a1445c7df'
    },
    enabled: true
  },
  {
    name: 'PubMatic',
    bidder: 'pubmatic',
    params: {
      adSlot: '6117737',
      publisherId: '165218'
    },
    defaultValues: {
      adSlot: '6117737',
      publisherId: '165218'
    },
    enabled: true
  },
  {
    name: 'Rise',
    bidder: 'rise',
    params: {
      org: '6761a6098eb1b90001e9b1b5'
    },
    defaultValues: {
      org: '6761a6098eb1b90001e9b1b5'
    },
    enabled: true
  },
  {
    name: 'Xandr Monetise (fna AppNexus)',
    bidder: 'appnexus',
    params: {
      placementId: '35106313'
    },
    defaultValues: {
      placementId: '35106313'
    },
    enabled: true
  },
  {
    name: 'Magnite (fna Rubicon)',
    bidder: 'rubicon',
    params: {
      accountId: '26742',
      siteId: '579542',
      zoneId: '3686138'
    },
    defaultValues: {
      accountId: '26742',
      siteId: '579542',
      zoneId: '3686138'
    },
    enabled: true
  },
  {
    name: 'Sovrn',
    bidder: 'sovrn',
    params: {
      tagid: '1261560'
    },
    defaultValues: {
      tagid: '1261560'
    },
    enabled: true
  },
  {
    name: 'Amx',
    bidder: 'amx',
    params: {
      tagId: 'zOPvsVMV4'
    },
    defaultValues: {
      tagId: 'zOPvsVMV4'
    },
    enabled: true
  },
  {
    name: 'Aniview',
    bidder: 'aniview',
    params: {
      tagId: '67ea7a5e52e2cb011d0bbf78'
    },
    defaultValues: {
      tagId: '67ea7a5e52e2cb011d0bbf78'
    },
    enabled: true
  }
];

export const generatePrebidServerRequest = (config: CTVConfig): PrebidServerRequest => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const impId = Math.random().toString(36).substr(2, 9);
  
  if (!config.prebidServerConfig) {
    throw new Error('Prebid server configuration is required');
  }

  // Build bidder configurations from enabled demand sources
  const bidderConfig: Record<string, any> = {};
  config.prebidServerConfig.demandSources
    .filter(source => source.enabled)
    .forEach(source => {
      bidderConfig[source.bidder] = source.params;
    });

  return {
    id: requestId,
    imp: [{
      id: impId,
      video: {
        mimes: ['video/mp4', 'video/webm'],
        minduration: 5,
        maxduration: 30,
        protocols: [2, 3, 5, 6],
        w: 1920,
        h: 1080,
        startdelay: 0,
        placement: 1,
        linearity: 1,
        skip: 1,
        skipmin: 5,
        skipafter: 5,
        sequence: 1,
        battr: [13, 14],
        maxextended: 30,
        minbitrate: 300,
        maxbitrate: 1500,
        boxingallowed: 1,
        playbackmethod: [1, 3],
        playbackend: 1,
        delivery: [2],
        pos: 7,
        companionad: [],
        api: [1, 2],
        companiontype: []
      },
      displaymanager: 'CTV-Simulator',
      displaymanagerver: '1.0.0',
      instl: 0,
      tagid: 'ctv-simulator-prebid',
      bidfloor: 0.01,
      bidfloorcur: 'GBP',
      secure: 1,
      ext: {
        prebid: {
          bidder: bidderConfig
        }
      }
    }],
    // Add app object for CTV (instead of site)
    app: {
      id: 'ctv-simulator-app',
      name: 'CTV Simulator',
      bundle: 'com.ctvsimulator.app',
      domain: 'ctvsimulator.com',
      storeurl: 'https://apps.samsung.com/ctv-simulator',
      cat: ['IAB1-1', 'IAB3-1'], // Entertainment categories
      sectioncat: ['IAB1-1'],
      pagecat: ['IAB1-1'],
      ver: '1.0.0',
      privacypolicy: 1,
      paid: 0,
      publisher: {
        id: 'ctv-sim-pub-001',
        name: 'CTV Simulator Publisher',
        cat: ['IAB1-1'],
        domain: 'ctvsimulator.com'
      },
      content: {
        id: 'big-buck-bunny',
        episode: 1,
        title: 'Big Buck Bunny',
        series: 'Sample Content',
        season: '1',
        artist: 'Blender Foundation',
        genre: 'Animation',
        album: '',
        isrc: '',
        producer: {
          id: 'blender-foundation',
          name: 'Blender Foundation',
          cat: ['IAB1-1'],
          domain: 'blender.org'
        },
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        cat: ['IAB1-1'],
        prodq: 3, // Professional quality
        videoquality: 3, // HD quality
        context: 1, // Video content
        contentrating: 'G',
        userrating: '4.5',
        qagmediarating: 3,
        keywords: 'animation,sample,test,ctv',
        livestream: 0,
        sourcerelationship: 1, // Direct relationship
        len: 596, // Length in seconds
        language: 'en',
        embeddable: 1
      },
      keywords: 'ctv,streaming,video,entertainment'
    },
    device: {
      ua: config.userAgent,
      geo: {
        lat: config.geo.lat || 51.5074,
        lon: config.geo.lon || -0.1278,
        type: 2,
        accuracy: 100,
        lastfix: Math.floor(Date.now() / 1000),
        ipservice: 3,
        country: config.geo.country,
        region: config.geo.region || 'England',
        regionfips104: 'UK',
        metro: 'London',
        city: config.geo.city || 'London',
        zip: 'SW1A 1AA',
        utcoffset: 0
      },
      dnt: 0,
      lmt: 0,
      ip: config.ip,
      ipv6: '',
      devicetype: config.deviceType,
      make: 'Samsung',
      model: 'Smart TV',
      os: 'Tizen',
      osv: '6.0',
      hwv: 'UN55TU8000',
      h: 1080,
      w: 1920,
      ppi: 72,
      pxratio: 1.0,
      js: 1,
      geofetch: 1,
      flashver: '',
      language: 'en',
      carrier: 'WiFi',
      mccmnc: '',
      connectiontype: 2, // WiFi connection
      ifa: Math.random().toString(36).substr(2, 16),
      didsha1: '',
      didmd5: '',
      dpidsha1: '',
      dpidmd5: '',
      macsha1: '',
      macmd5: '',
      ext: {
        // CTV-specific device extensions
        atts: 0, // App Tracking Transparency Status (iOS concept, but included for completeness)
        ifv: Math.random().toString(36).substr(2, 16), // Identifier for Vendor
        session_depth: Math.floor(Math.random() * 10) + 1,
        screen_orientation: 1 // Landscape
      }
    },
    at: 1,
    tmax: config.prebidServerConfig.timeout || 1000,
    wseat: [],
    bseat: [],
    allimps: 0,
    cur: ['GBP', 'USD'],
    wlang: ['en'],
    bcat: ['IAB7-39', 'IAB8-18', 'IAB9-9'],
    badv: [],
    bapp: [],
    source: {
      fd: 1,
      tid: requestId,
      pchain: 'ctvsimulator.com:1!samsung.com:2!tizen.org:3',
      schain: {
        complete: 1,
        nodes: [
          {
            asi: 'ctvsimulator.com',
            sid: 'ctv-sim-001',
            hp: 1,
            rid: requestId,
            name: 'CTV Simulator',
            domain: 'ctvsimulator.com'
          },
          {
            asi: 'samsung.com',
            sid: 'samsung-ctv-001',
            hp: 1,
            rid: requestId,
            name: 'Samsung Smart TV Platform',
            domain: 'samsung.com'
          },
          {
            asi: 'tizen.org',
            sid: 'tizen-os-001',
            hp: 0,
            rid: requestId,
            name: 'Tizen Operating System',
            domain: 'tizen.org'
          }
        ],
        ver: '1.0',
        ext: {
          // Additional supply chain metadata
          certification: 'ads.txt',
          relationship_type: 'direct'
        }
      }
    },
    regs: config.gdprConsent ? {
      coppa: 0,
      ext: {
        gdpr: 1,
        us_privacy: '1---', // CCPA compliance string
        gpp: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1---', // Global Privacy Platform
        gpp_sid: [2, 6] // GDPR and CCPA sections
      }
    } : {
      coppa: 0,
      ext: {
        us_privacy: '1---',
        gpp: 'DBACNYA~1---',
        gpp_sid: [6]
      }
    },
    ext: {
      consent: config.gdprConsent && config.tcfString ? config.tcfString : undefined,
      prebid: {
        targeting: {
          // CTV-specific targeting
          device_type: 'ctv',
          platform: 'tizen',
          manufacturer: 'samsung',
          screen_size: '55inch',
          connection_type: 'wifi',
          viewing_context: 'lean_back'
        },
        cache: {
          bids: {
            ttlseconds: 300
          },
          vastxml: {
            ttlseconds: 300
          }
        },
        storedrequest: {
          id: config.prebidServerConfig.accountId
        },
        // CTV-specific extensions
        ctv: {
          device_model: 'UN55TU8000',
          os_version: '6.0',
          app_version: '1.0.0',
          screen_density: 'hdpi',
          audio_capabilities: ['stereo', 'surround'],
          video_capabilities: ['h264', 'h265', 'vp9'],
          drm_support: ['widevine', 'playready'],
          hdr_support: ['hdr10', 'dolby_vision']
        }
      }
    }
  };
};

export const makePrebidServerRequest = async (
  config: CTVConfig
): Promise<AdRequest> => {
  if (!config.prebidServerConfig) {
    throw new Error('Prebid server configuration is required');
  }

  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  const adRequest: AdRequest = {
    id: requestId,
    timestamp: new Date(),
    url: config.prebidServerConfig.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': config.userAgent,
      'X-Forwarded-For': config.ip,
      'Accept': 'application/json'
    },
    status: 'pending'
  };

  try {
    const payload = generatePrebidServerRequest(config);
    adRequest.payload = payload;
    
    const response = await axios.post(config.prebidServerConfig.endpoint, payload, {
      headers: adRequest.headers,
      timeout: config.prebidServerConfig.timeout || 5000
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      ...adRequest,
      status: 'success',
      responseTime,
      responseStatus: response.status,
      responseData: response.data
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      ...adRequest,
      status: error.code === 'ECONNABORTED' ? 'timeout' : 'error',
      responseTime,
      responseStatus: error.response?.status,
      error: error.message
    };
  }
};

export const PREBID_SERVER_ENDPOINTS = [
  {
    name: 'Local Test Server',
    url: 'http://localhost:8081/openrtb2/auction',
    description: 'Local test server for development and testing'
  },
  {
    name: 'Prebid Server (US East)',
    url: 'https://prebid-server.rubiconproject.com/openrtb2/auction',
    description: 'Rubicon Prebid Server - US East'
  },
  {
    name: 'Prebid Server (EU)',
    url: 'https://prebid-server-eu.rubiconproject.com/openrtb2/auction',
    description: 'Rubicon Prebid Server - EU'
  },
  {
    name: 'AppNexus Prebid Server',
    url: 'https://ib.adnxs.com/openrtb2/prebid',
    description: 'AppNexus Prebid Server'
  },
  {
    name: 'Custom Prebid Server',
    url: 'https://your-prebid-server.com/openrtb2/auction',
    description: 'Custom Prebid Server endpoint'
  }
]; 