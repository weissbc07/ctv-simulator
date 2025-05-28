import axios from 'axios';
import { CTVConfig, OpenRTBRequest, AdRequest } from '../types';

export const generateOpenRTBRequest = (config: CTVConfig): OpenRTBRequest => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const impId = Math.random().toString(36).substr(2, 9);
  
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
      tagid: 'ctv-simulator-tag',
      bidfloor: 0.01,
      bidfloorcur: 'GBP',
      secure: 1
    }],
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
      hwv: '',
      h: 1080,
      w: 1920,
      ppi: 72,
      pxratio: 1.0,
      js: 1,
      geofetch: 1,
      flashver: '',
      language: 'en',
      carrier: '',
      mccmnc: '',
      connectiontype: 1,
      ifa: Math.random().toString(36).substr(2, 16),
      didsha1: '',
      didmd5: '',
      dpidsha1: '',
      dpidmd5: '',
      macsha1: '',
      macmd5: ''
    },
    at: 1,
    tmax: 120,
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
      pchain: ''
    },
    regs: config.gdprConsent ? {
      coppa: 0,
      ext: {
        gdpr: 1
      }
    } : undefined,
    ext: config.gdprConsent && config.tcfString ? {
      consent: config.tcfString
    } : undefined
  };
};

export const makeAdRequest = async (
  config: CTVConfig,
  endpoint: string,
  type: 'vast' | 'openrtb'
): Promise<AdRequest> => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  const adRequest: AdRequest = {
    id: requestId,
    timestamp: new Date(),
    url: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': config.userAgent,
      'X-Forwarded-For': config.ip,
      'Accept': type === 'vast' ? 'application/xml' : 'application/json'
    },
    status: 'pending'
  };

  try {
    let response;
    
    if (type === 'openrtb') {
      const payload = generateOpenRTBRequest(config);
      adRequest.payload = payload;
      
      response = await axios.post(endpoint, payload, {
        headers: adRequest.headers,
        timeout: 5000
      });
    } else {
      // VAST request
      response = await axios.get(endpoint, {
        headers: adRequest.headers,
        timeout: 5000
      });
    }
    
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

export const parseVASTResponse = (xmlString: string) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const ads = xmlDoc.getElementsByTagName('Ad');
    const creatives = xmlDoc.getElementsByTagName('Creative');
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    
    return {
      adCount: ads.length,
      creativeCount: creatives.length,
      mediaFileCount: mediaFiles.length,
      hasError: xmlDoc.getElementsByTagName('Error').length > 0,
      isEmpty: ads.length === 0
    };
  } catch (error) {
    return {
      adCount: 0,
      creativeCount: 0,
      mediaFileCount: 0,
      hasError: true,
      isEmpty: true,
      parseError: error
    };
  }
};

export const SSP_ENDPOINTS = [
  {
    name: 'Freeview UK (AdSense)',
    url: 'https://uk.co.freeview.android.adsenseformobileapps.com/',
    type: 'vast' as const,
    description: 'Freeview UK AdSense endpoint for CTV'
  },
  {
    name: 'Magnite (Rubicon)',
    url: 'https://fastlane.rubiconproject.com/a/api/fastlane.json',
    type: 'openrtb' as const,
    description: 'Magnite OpenRTB endpoint for CTV'
  },
  {
    name: 'Xandr (AppNexus)',
    url: 'https://ib.adnxs.com/openrtb2',
    type: 'openrtb' as const,
    description: 'Xandr OpenRTB 2.5 endpoint'
  },
  {
    name: 'FreeWheel',
    url: 'https://demo.v.fwmrm.net/ad/g/1',
    type: 'vast' as const,
    description: 'FreeWheel VAST endpoint'
  },
  {
    name: 'Google Ad Manager',
    url: 'https://pubads.g.doubleclick.net/gampad/ads',
    type: 'vast' as const,
    description: 'Google Ad Manager VAST endpoint'
  },
  {
    name: 'SpotX',
    url: 'https://search.spotxchange.com/vast/2.00/85394',
    type: 'vast' as const,
    description: 'SpotX VAST 2.0 endpoint'
  }
]; 