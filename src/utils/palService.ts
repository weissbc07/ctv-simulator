import { PALConfig, PALNonceRequest, PALNonceResponse } from '../types';

export class PALService {
  private static instance: PALService;
  private palScript: HTMLScriptElement | null = null;
  private palInstance: any = null;

  static getInstance(): PALService {
    if (!PALService.instance) {
      PALService.instance = new PALService();
    }
    return PALService.instance;
  }

  async loadPALSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.palScript) {
        resolve();
        return;
      }

      this.palScript = document.createElement('script');
      this.palScript.src = 'https://www.gstatic.com/pal/pal.js';
      this.palScript.async = true;
      this.palScript.onload = () => {
        console.log('PAL SDK loaded successfully');
        resolve();
      };
      this.palScript.onerror = () => {
        reject(new Error('Failed to load PAL SDK'));
      };

      document.head.appendChild(this.palScript);
    });
  }

  async initializePAL(config: PALConfig): Promise<void> {
    try {
      await this.loadPALSDK();
      
      // Check if PAL is available globally
      const pal = (window as any).pal;
      if (!pal) {
        throw new Error('PAL SDK not available');
      }

      const palConfig = {
        descriptionUrl: config.descriptionUrl,
        privacyPolicy: config.privacyPolicy,
        playerType: config.playerType,
        playerName: config.playerName,
        playerVersion: config.playerVersion,
        videoWidth: config.videoWidth,
        videoHeight: config.videoHeight,
        videoTitle: config.videoTitle,
        videoDescription: config.videoDescription,
        videoDuration: config.videoDuration,
        contentRating: config.contentRating,
        isLive: config.isLive || false,
        sessionId: this.generateSessionId(),
        iconsSupported: true,
        omidPartnerName: 'CTV-Simulator',
        omidPartnerVersion: '1.0',
        supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
      };

      this.palInstance = await pal.create(palConfig);
      console.log('PAL instance created successfully');
    } catch (error) {
      console.error('PAL initialization failed:', error);
      throw error;
    }
  }

  async generateNonce(config: PALConfig): Promise<PALNonceResponse> {
    try {
      const request: PALNonceRequest = {
        descriptionUrl: config.descriptionUrl,
        privacyPolicy: config.privacyPolicy,
        playerType: config.playerType,
        playerName: config.playerName,
        playerVersion: config.playerVersion,
        videoWidth: config.videoWidth,
        videoHeight: config.videoHeight,
        videoTitle: config.videoTitle,
        videoDescription: config.videoDescription,
        videoDuration: config.videoDuration,
        contentRating: config.contentRating,
        isLive: config.isLive || false,
        sessionId: this.generateSessionId(),
        iconsSupported: true,
        omidPartnerName: 'CTV-Simulator',
        omidPartnerVersion: '1.0',
        supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
      };

      const response = await fetch('/api/adx/pal/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`PAL nonce generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PAL nonce generation error:', error);
      throw error;
    }
  }

  async verifyAdSession(adSessionId: string, nonce: string): Promise<any> {
    try {
      const response = await fetch('/api/adx/pal/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adSessionId,
          nonce
        })
      });

      if (!response.ok) {
        throw new Error(`PAL verification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PAL verification error:', error);
      throw error;
    }
  }

  async sendSignals(eventType: string, data?: any): Promise<void> {
    if (!this.palInstance) {
      console.warn('PAL instance not initialized');
      return;
    }

    try {
      switch (eventType) {
        case 'adBreakStart':
          this.palInstance.sendAdBreakStartSignal();
          break;
        case 'adBreakEnd':
          this.palInstance.sendAdBreakEndSignal();
          break;
        case 'adStart':
          this.palInstance.sendAdStartSignal(data?.adId);
          break;
        case 'adEnd':
          this.palInstance.sendAdEndSignal();
          break;
        case 'adSkipped':
          this.palInstance.sendAdSkippedSignal();
          break;
        case 'adError':
          this.palInstance.sendAdErrorSignal(data?.errorCode, data?.errorMessage);
          break;
        case 'click':
          this.palInstance.sendClickSignal();
          break;
        case 'videoStart':
          this.palInstance.sendVideoStartSignal();
          break;
        case 'videoEnd':
          this.palInstance.sendVideoEndSignal();
          break;
        case 'pause':
          this.palInstance.sendPauseSignal();
          break;
        case 'resume':
          this.palInstance.sendResumeSignal();
          break;
        case 'volumeChange':
          this.palInstance.sendVolumeChangeSignal(data?.volume);
          break;
        case 'fullscreen':
          this.palInstance.sendFullscreenSignal(data?.isFullscreen);
          break;
        default:
          console.warn(`Unknown PAL event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`PAL signal error for ${eventType}:`, error);
    }
  }

  async trackImpression(vastXml: string, adSessionId: string): Promise<void> {
    if (!this.palInstance) {
      console.warn('PAL instance not initialized for impression tracking');
      return;
    }

    try {
      // Parse VAST XML and extract impression URLs
      const parser = new DOMParser();
      const vastDoc = parser.parseFromString(vastXml, 'text/xml');
      const impressionNodes = vastDoc.querySelectorAll('Impression');
      
      impressionNodes.forEach(async (node) => {
        const impressionUrl = node.textContent?.trim();
        if (impressionUrl) {
          // Add PAL parameters to impression URL
          const url = new URL(impressionUrl);
          url.searchParams.set('pal_ad_session_id', adSessionId);
          url.searchParams.set('pal_verified', 'true');
          
          // Fire impression
          await fetch(url.toString(), { 
            method: 'GET',
            mode: 'no-cors'
          });
          
          console.log('PAL impression tracked:', url.toString());
        }
      });
    } catch (error) {
      console.error('PAL impression tracking error:', error);
    }
  }

  generateSessionId(): string {
    return 'pal_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  dispose(): void {
    if (this.palInstance) {
      try {
        this.palInstance.dispose();
      } catch (error) {
        console.error('PAL instance disposal error:', error);
      }
      this.palInstance = null;
    }
  }
}

// Export singleton instance
export const palService = PALService.getInstance();

// Event tracking utilities for video player integration
export const PALEventTracker = {
  onAdBreakStart: () => palService.sendSignals('adBreakStart'),
  onAdBreakEnd: () => palService.sendSignals('adBreakEnd'),
  onAdStart: (adId: string) => palService.sendSignals('adStart', { adId }),
  onAdEnd: () => palService.sendSignals('adEnd'),
  onAdSkipped: () => palService.sendSignals('adSkipped'),
  onAdError: (errorCode: number, errorMessage: string) => 
    palService.sendSignals('adError', { errorCode, errorMessage }),
  onClick: () => palService.sendSignals('click'),
  onVideoStart: () => palService.sendSignals('videoStart'),
  onVideoEnd: () => palService.sendSignals('videoEnd'),
  onPause: () => palService.sendSignals('pause'),
  onResume: () => palService.sendSignals('resume'),
  onVolumeChange: (volume: number) => palService.sendSignals('volumeChange', { volume }),
  onFullscreen: (isFullscreen: boolean) => 
    palService.sendSignals('fullscreen', { isFullscreen })
};

// CTV Provider specific configurations
export const CTVProviderPALConfigs = {
  roku: {
    playerType: 'ctv' as const,
    playerName: 'Roku Player',
    omidPartnerName: 'Roku',
    supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
  },
  samsung: {
    playerType: 'ctv' as const,
    playerName: 'Samsung Tizen Player',
    omidPartnerName: 'Samsung',
    supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
  },
  lg: {
    playerType: 'ctv' as const,
    playerName: 'LG webOS Player',
    omidPartnerName: 'LG',
    supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
  },
  firetv: {
    playerType: 'ctv' as const,
    playerName: 'Amazon Fire TV Player',
    omidPartnerName: 'Amazon',
    supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
  },
  androidtv: {
    playerType: 'ctv' as const,
    playerName: 'Android TV Player',
    omidPartnerName: 'Google',
    supportedApiFrameworks: ['VPAID_2_0', 'OMID_1_0']
  },
  appletv: {
    playerType: 'ctv' as const,
    playerName: 'Apple TV Player',
    omidPartnerName: 'Apple',
    supportedApiFrameworks: ['VPAID_2_0']
  }
}; 