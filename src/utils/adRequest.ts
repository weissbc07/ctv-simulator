// Ad Request Utility for CTV Simulator
// Handles real and mock ad requests to various ad servers

import { AdXConfig } from '../types/index';

export interface AdRequestConfig {
  adUnitCode: string;
  sizes: number[][];
  video?: {
    playerSize: number[][];
    context: string;
    mimes: string[];
    protocols: number[];
    minduration: number;
    maxduration: number;
    startdelay: number;
    placement: number;
    linearity: number;
    skip?: number;
    skipmin?: number;
    skipafter?: number;
    playbackmethod?: number[];
    api?: number[];
  };
  gdpr?: {
    consentString: string;
    gdprApplies: boolean;
  };
  uspConsent?: string;
}

export interface AdResponse {
  requestId: string;
  adUnitCode: string;
  cpm: number;
  currency: string;
  width: number;
  height: number;
  vastXml: string;
  creativeId: string;
  netRevenue: boolean;
  ttl: number;
  meta: {
    advertiserDomains: string[];
    brandName: string;
    networkName: string;
    mediaType: string;
  };
}

// Make ad request to AdX service
export async function makeAdRequest(
  config: AdXConfig,
  adRequestConfig: AdRequestConfig,
  ctvProvider: string,
  serverUrl: string = 'http://localhost:8081'
): Promise<AdResponse[]> {
  try {
    console.log('🎯 Making ad request to AdX service...');
    
    const requestPayload = {
      config,
      adRequest: adRequestConfig,
      ctvProvider
    };

    const response = await fetch(`${serverUrl}/api/adx/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`AdX request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both single ad and multiple ads response formats
    if (data.ads && Array.isArray(data.ads)) {
      return data.ads;
    } else if (data.vastXml) {
      // Single ad response
      return [{
        requestId: data.requestId || generateRequestId(),
        adUnitCode: adRequestConfig.adUnitCode,
        cpm: data.cpm || 0,
        currency: data.currency || 'USD',
        width: data.width || 1920,
        height: data.height || 1080,
        vastXml: data.vastXml,
        creativeId: data.creativeId || generateCreativeId(),
        netRevenue: data.netRevenue !== false,
        ttl: data.ttl || 300,
        meta: data.meta || {
          advertiserDomains: [],
          brandName: 'Unknown',
          networkName: 'AdX',
          mediaType: 'video'
        }
      }];
    } else {
      console.warn('⚠️ No ads returned from AdX service');
      return [];
    }

  } catch (error) {
    console.error('❌ AdX request error:', error);
    throw error;
  }
}

// Create default ad request configuration
export function createDefaultAdRequest(adUnitCode: string): AdRequestConfig {
  return {
    adUnitCode,
    sizes: [[1920, 1080], [1280, 720]],
    video: {
      playerSize: [[1920, 1080]],
      context: 'instream',
      mimes: ['video/mp4', 'video/webm'],
      protocols: [2, 3, 5, 6], // VAST 2.0-4.0
      minduration: 15,
      maxduration: 60,
      startdelay: 0, // Pre-roll
      placement: 1, // In-stream
      linearity: 1, // Linear
      skip: 1,
      skipmin: 5,
      skipafter: 15,
      playbackmethod: [1, 2], // Auto-play
      api: [1, 2] // VPAID 1.0-2.0
    },
    gdpr: {
      consentString: 'test_consent_string',
      gdprApplies: true
    },
    uspConsent: '1---'
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique creative ID
function generateCreativeId(): string {
  return `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate ad request configuration
export function validateAdRequest(config: AdRequestConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.adUnitCode) {
    errors.push('Ad unit code is required');
  }

  if (!config.sizes || config.sizes.length === 0) {
    errors.push('At least one ad size is required');
  }

  if (config.video) {
    if (!config.video.playerSize || config.video.playerSize.length === 0) {
      errors.push('Video player size is required');
    }
    if (!config.video.mimes || config.video.mimes.length === 0) {
      errors.push('Video MIME types are required');
    }
    if (!config.video.protocols || config.video.protocols.length === 0) {
      errors.push('Video protocols are required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  makeAdRequest,
  createDefaultAdRequest,
  validateAdRequest
}; 