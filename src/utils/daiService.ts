import { 
  DAIConfig, 
  DAIAuthKey, 
  DAIStreamRequest, 
  DAIStreamResponse, 
  HLSManifest, 
  DASHManifest,
  AdBreak,
  DAIAd,
  HLSSegment,
  HLSAdBreak
} from '../types';
import CryptoJS from 'crypto-js';

export class DAIService {
  private static instance: DAIService;
  private authKeys: Map<string, DAIAuthKey> = new Map();
  private activeStreams: Map<string, DAIStreamResponse> = new Map();

  public static getInstance(): DAIService {
    if (!DAIService.instance) {
      DAIService.instance = new DAIService();
    }
    return DAIService.instance;
  }

  // Authentication Key Management
  public createAuthKey(name: string, type: 'api' | 'hmac', description?: string): DAIAuthKey {
    const key = type === 'api' 
      ? this.generateAPIKey()
      : this.generateHMACKey();
    
    const authKey: DAIAuthKey = {
      id: this.generateId(),
      name,
      type,
      key,
      status: 'active',
      createdAt: new Date(),
      description
    };

    this.authKeys.set(authKey.id, authKey);
    return authKey;
  }

  public getAuthKeys(): DAIAuthKey[] {
    return Array.from(this.authKeys.values());
  }

  public getAuthKey(id: string): DAIAuthKey | undefined {
    return this.authKeys.get(id);
  }

  public updateAuthKey(id: string, updates: Partial<DAIAuthKey>): DAIAuthKey | null {
    const authKey = this.authKeys.get(id);
    if (!authKey) return null;

    const updatedKey = { ...authKey, ...updates };
    this.authKeys.set(id, updatedKey);
    return updatedKey;
  }

  public deactivateAuthKey(id: string): boolean {
    const authKey = this.authKeys.get(id);
    if (!authKey) return false;

    authKey.status = 'inactive';
    this.authKeys.set(id, authKey);
    return true;
  }

  public deleteAuthKey(id: string): boolean {
    return this.authKeys.delete(id);
  }

  // Stream Request Generation
  public async requestDAIStream(request: DAIStreamRequest): Promise<DAIStreamResponse> {
    try {
      let streamUrl: string;
      
      if (request.contentSourceId && request.videoId) {
        // VOD stream request
        streamUrl = await this.requestVODStream(request);
      } else if (request.customAssetKey) {
        // Live stream request
        streamUrl = await this.requestLiveStream(request);
      } else if (request.streamUrl) {
        // Custom stream stitching
        streamUrl = await this.stitchCustomStream(request);
      } else {
        throw new Error('Invalid stream request parameters');
      }

      const streamResponse: DAIStreamResponse = {
        streamUrl,
        streamId: this.generateStreamId(),
        adBreaks: await this.detectAdBreaks(streamUrl),
        trackingUrls: {
          contentTracking: this.generateTrackingUrl('content'),
          adTracking: this.generateTrackingUrl('ad'),
          errorTracking: this.generateTrackingUrl('error')
        }
      };

      this.activeStreams.set(streamResponse.streamId, streamResponse);
      return streamResponse;

    } catch (error) {
      throw new Error(`DAI stream request failed: ${error}`);
    }
  }

  // VOD Stream Request
  private async requestVODStream(request: DAIStreamRequest): Promise<string> {
    const baseUrl = 'https://dai.google.com/ondemand';
    const format = request.format === 'hls' ? 'hls' : 'dash';
    
    const params = new URLSearchParams({
      ...(request.apiKey && { 'api-key': request.apiKey }),
      ...(request.adTagParameters && Object.entries(request.adTagParameters).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>))
    });

    if (request.authToken) {
      params.append('auth-token', request.authToken);
    }

    const streamUrl = `${baseUrl}/${format}/content/${request.contentSourceId}/vid/${request.videoId}/master.${format === 'hls' ? 'm3u8' : 'mpd'}`;
    
    if (params.toString()) {
      return `${streamUrl}?${params.toString()}`;
    }
    
    return streamUrl;
  }

  // Live Stream Request
  private async requestLiveStream(request: DAIStreamRequest): Promise<string> {
    const baseUrl = 'https://dai.google.com/linear';
    const format = request.format === 'hls' ? 'hls' : 'dash';
    
    const params = new URLSearchParams({
      ...(request.apiKey && { 'api-key': request.apiKey }),
      ...(request.adTagParameters && Object.entries(request.adTagParameters).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>))
    });

    if (request.authToken) {
      params.append('auth-token', request.authToken);
    }

    const streamUrl = `${baseUrl}/${format}/event/${request.customAssetKey}/stream.${format === 'hls' ? 'm3u8' : 'mpd'}`;
    
    if (params.toString()) {
      return `${streamUrl}?${params.toString()}`;
    }
    
    return streamUrl;
  }

  // Custom Stream Stitching
  private async stitchCustomStream(request: DAIStreamRequest): Promise<string> {
    if (!request.streamUrl) {
      throw new Error('Stream URL required for custom stitching');
    }

    // For custom streams, we create a proxy URL that handles ad insertion
    const stitchingServiceUrl = 'http://localhost:8081/api/dai/stitch';
    const params = new URLSearchParams({
      streamUrl: request.streamUrl,
      format: request.format,
      ...(request.adTagParameters && { adParams: JSON.stringify(request.adTagParameters) })
    });

    return `${stitchingServiceUrl}?${params.toString()}`;
  }

  // Manifest Parsing
  public async parseHLSManifest(manifestUrl: string): Promise<HLSManifest> {
    try {
      const response = await fetch(manifestUrl);
      const manifestText = await response.text();
      
      return this.parseHLSManifestText(manifestText);
    } catch (error) {
      throw new Error(`Failed to parse HLS manifest: ${error}`);
    }
  }

  public parseHLSManifestText(manifestText: string): HLSManifest {
    const lines = manifestText.split('\n').filter(line => line.trim());
    const manifest: HLSManifest = {
      version: 3,
      targetDuration: 10,
      mediaSequence: 0,
      segments: [],
      adBreaks: []
    };

    let currentSegment: Partial<HLSSegment> = {};
    let sequenceNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXT-X-VERSION:')) {
        manifest.version = parseInt(line.split(':')[1]);
      } else if (line.startsWith('#EXT-X-TARGETDURATION:')) {
        manifest.targetDuration = parseInt(line.split(':')[1]);
      } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:')) {
        manifest.mediaSequence = parseInt(line.split(':')[1]);
        sequenceNumber = manifest.mediaSequence;
      } else if (line.startsWith('#EXT-X-PLAYLIST-TYPE:')) {
        manifest.playlistType = line.split(':')[1];
      } else if (line.startsWith('#EXTINF:')) {
        const duration = parseFloat(line.split(':')[1].split(',')[0]);
        const title = line.split(',')[1] || '';
        currentSegment = { duration, title, sequence: sequenceNumber++ };
      } else if (line.startsWith('#EXT-X-CUE-OUT:')) {
        // Ad break start
        const duration = parseFloat(line.split(':')[1] || '30');
        manifest.adBreaks?.push({
          startTime: this.calculateCurrentTime(manifest.segments),
          duration,
          adCount: 1,
          cueOut: line
        });
      } else if (line.startsWith('#EXT-X-CUE-IN')) {
        // Ad break end
        if (manifest.adBreaks && manifest.adBreaks.length > 0) {
          const lastAdBreak = manifest.adBreaks[manifest.adBreaks.length - 1];
          lastAdBreak.cueIn = line;
        }
      } else if (line.startsWith('#EXT-X-DISCONTINUITY')) {
        currentSegment.discontinuity = true;
      } else if (line.startsWith('#EXT-X-ENDLIST')) {
        manifest.endList = true;
      } else if (!line.startsWith('#') && line.length > 0) {
        // Segment URI
        if (currentSegment.duration !== undefined) {
          manifest.segments.push({
            uri: line,
            duration: currentSegment.duration,
            sequence: currentSegment.sequence || sequenceNumber++,
            title: currentSegment.title,
            discontinuity: currentSegment.discontinuity
          });
          currentSegment = {};
        }
      }
    }

    return manifest;
  }

  // Ad Break Detection
  private async detectAdBreaks(streamUrl: string): Promise<AdBreak[]> {
    const adBreaks: AdBreak[] = [];
    
    try {
      if (streamUrl.includes('.m3u8')) {
        const manifest = await this.parseHLSManifest(streamUrl);
        
        manifest.adBreaks?.forEach((hlsAdBreak, index) => {
          adBreaks.push({
            id: `adbreak_${index}`,
            startTime: hlsAdBreak.startTime,
            duration: hlsAdBreak.duration,
            adCount: hlsAdBreak.adCount,
            type: hlsAdBreak.startTime === 0 ? 'preroll' : 'midroll'
          });
        });
      }
    } catch (error) {
      console.warn('Could not detect ad breaks:', error);
    }

    return adBreaks;
  }

  // HMAC Token Generation
  public generateHMACToken(request: DAIStreamRequest, hmacKey: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      contentSourceId: request.contentSourceId,
      videoId: request.videoId,
      timestamp,
      sessionId: request.sessionId || this.generateSessionId()
    };

    const message = JSON.stringify(payload);
    const signature = CryptoJS.HmacSHA256(message, hmacKey).toString();
    
    return btoa(JSON.stringify({ ...payload, signature }));
  }

  // Utility Methods
  private generateAPIKey(): string {
    // Generate a 64-character API key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 64; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private generateHMACKey(): string {
    // Generate a 32-character HMAC secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private generateId(): string {
    return 'dai_' + Math.random().toString(36).substr(2, 12);
  }

  private generateStreamId(): string {
    return 'stream_' + Math.random().toString(36).substr(2, 12);
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 12);
  }

  private generateTrackingUrl(type: string): string {
    return `http://localhost:8081/api/dai/tracking/${type}/${this.generateId()}`;
  }

  private calculateCurrentTime(segments: HLSSegment[]): number {
    return segments.reduce((total, segment) => total + segment.duration, 0);
  }

  // Stream Management
  public getActiveStreams(): DAIStreamResponse[] {
    return Array.from(this.activeStreams.values());
  }

  public getStream(streamId: string): DAIStreamResponse | undefined {
    return this.activeStreams.get(streamId);
  }

  public stopStream(streamId: string): boolean {
    return this.activeStreams.delete(streamId);
  }

  // Manifest Stitching
  public async stitchHLSManifest(
    originalManifest: HLSManifest,
    adBreaks: AdBreak[]
  ): Promise<string> {
    let stitchedManifest = '#EXTM3U\n';
    stitchedManifest += `#EXT-X-VERSION:${originalManifest.version}\n`;
    stitchedManifest += `#EXT-X-TARGETDURATION:${originalManifest.targetDuration}\n`;
    stitchedManifest += `#EXT-X-MEDIA-SEQUENCE:${originalManifest.mediaSequence}\n`;
    
    if (originalManifest.playlistType) {
      stitchedManifest += `#EXT-X-PLAYLIST-TYPE:${originalManifest.playlistType}\n`;
    }

    let currentTime = 0;
    let segmentIndex = 0;

    for (const segment of originalManifest.segments) {
      // Check if we need to insert an ad break before this segment
      const adBreak = adBreaks.find(ab => 
        Math.abs(ab.startTime - currentTime) < 1 && 
        ab.type !== 'preroll'
      );

      if (adBreak) {
        // Insert ad break
        stitchedManifest += `#EXT-X-CUE-OUT:${adBreak.duration}\n`;
        stitchedManifest += `#EXT-X-DISCONTINUITY\n`;
        
        // Add ad segments (mock)
        for (let i = 0; i < adBreak.adCount; i++) {
          const adDuration = adBreak.duration / adBreak.adCount;
          stitchedManifest += `#EXTINF:${adDuration.toFixed(3)},Ad ${i + 1}\n`;
          stitchedManifest += `ad_segment_${adBreak.id}_${i}.ts\n`;
        }
        
        stitchedManifest += `#EXT-X-CUE-IN\n`;
        stitchedManifest += `#EXT-X-DISCONTINUITY\n`;
      }

      // Add original segment
      if (segment.discontinuity) {
        stitchedManifest += `#EXT-X-DISCONTINUITY\n`;
      }
      
      stitchedManifest += `#EXTINF:${segment.duration.toFixed(3)},${segment.title || ''}\n`;
      stitchedManifest += `${segment.uri}\n`;

      currentTime += segment.duration;
      segmentIndex++;
    }

    if (originalManifest.endList) {
      stitchedManifest += `#EXT-X-ENDLIST\n`;
    }

    return stitchedManifest;
  }
}

// Export singleton instance
export const daiService = DAIService.getInstance(); 