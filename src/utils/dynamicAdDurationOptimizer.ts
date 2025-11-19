/**
 * Dynamic Ad Duration Optimizer for Outstream Video Ads
 *
 * Optimizes ad duration (6s, 15s, 30s) based on average time on page
 * to maximize revenue per pageview by optimizing revenue per second.
 *
 * Features:
 * - ML-powered duration prediction using DeepInfra
 * - URL-level time on page tracking by device type
 * - Bid caching and optimal sequencing
 * - Revenue per second optimization
 * - GCP Cloud Storage integration for analytics data
 *
 * Architecture:
 * 1. Track time on page per URL + device
 * 2. Use ML to predict optimal ad duration
 * 3. Cache winning video bids
 * 4. Sequence ads optimally based on predicted engagement time
 * 5. Maximize revenue/second within available time
 */

import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TimeOnPageData {
  url: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  averageTimeOnPage: number; // seconds
  sampleSize: number;
  lastUpdated: number;
}

export interface VideoBidCache {
  bidId: string;
  vastUrl: string;
  cpm: number;
  duration: 6 | 15 | 30; // seconds
  source: string;
  creativeUrl?: string;
  advertiserDomain?: string;
  cachedAt: number;
  expiresAt: number;
}

export interface AdSchedule {
  totalDuration: number;
  expectedRevenue: number;
  revenuePerSecond: number;
  ads: ScheduledAd[];
  reasoning: string;
}

export interface ScheduledAd {
  bidId: string;
  position: number;
  duration: 6 | 15 | 30;
  cpm: number;
  source: string;
  vastUrl: string;
  startTime: number; // offset in seconds
}

export interface DurationPrediction {
  recommendedDuration: 6 | 15 | 30;
  confidence: number;
  expectedTimeOnPage: number;
  alternativeDurations: Array<{
    duration: 6 | 15 | 30;
    score: number;
    expectedRevenue: number;
  }>;
  reasoning: string;
}

export interface OutstreamContext {
  url: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  placement: 'in-content' | 'sticky' | 'sidebar';
  contentCategory?: string;
  userSegments?: string[];
}

// ============================================================================
// DYNAMIC AD DURATION OPTIMIZER CLASS
// ============================================================================

export class DynamicAdDurationOptimizer {
  private timeOnPageData: Map<string, TimeOnPageData>;
  private bidCache: Map<string, VideoBidCache>;
  private deepInfraApiKey: string;
  private gcpStorageBucket: string;
  private gcpApiEndpoint: string;
  private enabled: boolean;

  // Revenue benchmarks per duration (average CPM)
  private durationBenchmarks = {
    6: 8.00,   // $8 CPM for 6s
    15: 12.00, // $12 CPM for 15s
    30: 15.00  // $15 CPM for 30s
  };

  constructor(config?: {
    deepInfraApiKey?: string;
    gcpStorageBucket?: string;
    gcpApiEndpoint?: string;
    enabled?: boolean;
  }) {
    this.deepInfraApiKey = config?.deepInfraApiKey || process.env.DEEPINFRA_API_KEY || '';
    this.gcpStorageBucket = config?.gcpStorageBucket || process.env.GCP_STORAGE_BUCKET || '';
    this.gcpApiEndpoint = config?.gcpApiEndpoint || '/api/gcp/outstream';
    this.enabled = config?.enabled !== false;

    this.timeOnPageData = new Map();
    this.bidCache = new Map();

    // Load data from localStorage initially
    this.loadFromLocalStorage();
  }

  // --------------------------------------------------------------------------
  // CORE OPTIMIZATION METHODS
  // --------------------------------------------------------------------------

  /**
   * Predict optimal ad duration using DeepInfra ML
   */
  async predictOptimalDuration(context: OutstreamContext): Promise<DurationPrediction> {
    if (!this.enabled) {
      return this.getDefaultPrediction(context);
    }

    // Get historical time on page data
    const timeOnPageKey = this.getTimeOnPageKey(context.url, context.deviceType);
    const historicalData = this.timeOnPageData.get(timeOnPageKey);

    // If we have enough data, use ML prediction
    if (historicalData && historicalData.sampleSize >= 50) {
      try {
        const mlPrediction = await this.getMLPrediction(context, historicalData);
        return mlPrediction;
      } catch (error) {
        console.error('ML prediction failed, using fallback:', error);
        return this.getFallbackPrediction(context, historicalData);
      }
    }

    // Not enough data, use heuristic-based prediction
    return this.getHeuristicPrediction(context, historicalData);
  }

  /**
   * ML-powered prediction using DeepInfra
   */
  private async getMLPrediction(
    context: OutstreamContext,
    historicalData: TimeOnPageData
  ): Promise<DurationPrediction> {
    const prompt = `You are an expert in video advertising optimization. Predict the optimal ad duration for maximum revenue per second.

CONTEXT:
- URL: ${context.url}
- Device: ${context.deviceType}
- Placement: ${context.placement}
- Content Category: ${context.contentCategory || 'general'}

HISTORICAL DATA (${historicalData.sampleSize} samples):
- Average Time on Page: ${historicalData.averageTimeOnPage} seconds

AD DURATION OPTIONS:
1. 6 seconds  - Avg CPM: $${this.durationBenchmarks[6]}  - Revenue per second: $${(this.durationBenchmarks[6] / 1000 / 6).toFixed(4)}
2. 15 seconds - Avg CPM: $${this.durationBenchmarks[15]} - Revenue per second: $${(this.durationBenchmarks[15] / 1000 / 15).toFixed(4)}
3. 30 seconds - Avg CPM: $${this.durationBenchmarks[30]} - Revenue per second: $${(this.durationBenchmarks[30] / 1000 / 30).toFixed(4)}

OPTIMIZATION GOAL:
Maximize revenue per pageview by choosing the optimal ad duration that:
1. Fits within the average time on page
2. Maximizes total revenue (not just revenue/second)
3. Considers user engagement (completion rate)

RULES:
- If time on page < 10s: Only recommend 6s
- If time on page 10-20s: Recommend 6s or 15s
- If time on page > 20s: Consider all options
- Account for viewability requirements (at least 50% completion)

Respond with JSON only:
{
  "recommendedDuration": 15,
  "confidence": 0.87,
  "expectedTimeOnPage": ${historicalData.averageTimeOnPage},
  "alternativeDurations": [
    {"duration": 6, "score": 0.75, "expectedRevenue": 0.008},
    {"duration": 15, "score": 0.87, "expectedRevenue": 0.012},
    {"duration": 30, "score": 0.65, "expectedRevenue": 0.011}
  ],
  "reasoning": "brief explanation"
}`;

    try {
      // Call DeepInfra API
      const response = await axios.post(
        'https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3.1-70B-Instruct',
        {
          input: prompt,
          max_tokens: 1024,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepInfraApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // Parse response
      const result = response.data.results?.[0]?.generated_text || response.data.output;
      const jsonMatch = result.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return this.validatePrediction(prediction);
      }

      throw new Error('Failed to parse ML response');
    } catch (error) {
      console.error('DeepInfra API error:', error);
      throw error;
    }
  }

  /**
   * Fallback prediction using heuristics
   */
  private getFallbackPrediction(
    context: OutstreamContext,
    historicalData?: TimeOnPageData
  ): DurationPrediction {
    const avgTime = historicalData?.averageTimeOnPage || this.estimateTimeOnPage(context);

    let recommendedDuration: 6 | 15 | 30;
    let confidence: number;

    if (avgTime < 10) {
      recommendedDuration = 6;
      confidence = 0.85;
    } else if (avgTime < 20) {
      recommendedDuration = 15;
      confidence = 0.80;
    } else {
      // For longer engagement, choose based on revenue per second
      // 15s typically has best revenue/second ratio
      recommendedDuration = 15;
      confidence = 0.75;
    }

    // Calculate expected revenues
    const alternatives = [6, 15, 30].map(duration => ({
      duration: duration as 6 | 15 | 30,
      score: this.calculateDurationScore(duration as 6 | 15 | 30, avgTime),
      expectedRevenue: (this.durationBenchmarks[duration as 6 | 15 | 30] / 1000)
    }));

    return {
      recommendedDuration,
      confidence,
      expectedTimeOnPage: avgTime,
      alternativeDurations: alternatives,
      reasoning: `Based on ${avgTime}s avg time on page, ${recommendedDuration}s ad provides optimal revenue/pageview ratio`
    };
  }

  /**
   * Get heuristic prediction when no historical data
   */
  private getHeuristicPrediction(
    context: OutstreamContext,
    historicalData?: TimeOnPageData
  ): DurationPrediction {
    const estimatedTime = historicalData?.averageTimeOnPage || this.estimateTimeOnPage(context);

    // Device-based heuristics
    let recommendedDuration: 6 | 15 | 30;

    if (context.deviceType === 'mobile') {
      // Mobile users have shorter attention spans
      recommendedDuration = estimatedTime > 15 ? 15 : 6;
    } else if (context.placement === 'sticky') {
      // Sticky placements can support longer durations
      recommendedDuration = 15;
    } else {
      // Desktop in-content
      recommendedDuration = estimatedTime > 20 ? 15 : 6;
    }

    return {
      recommendedDuration,
      confidence: 0.60, // Lower confidence without historical data
      expectedTimeOnPage: estimatedTime,
      alternativeDurations: [
        { duration: 6, score: 0.70, expectedRevenue: this.durationBenchmarks[6] / 1000 },
        { duration: 15, score: 0.75, expectedRevenue: this.durationBenchmarks[15] / 1000 },
        { duration: 30, score: 0.50, expectedRevenue: this.durationBenchmarks[30] / 1000 }
      ],
      reasoning: `Heuristic-based prediction (insufficient data). Estimated ${estimatedTime}s engagement.`
    };
  }

  /**
   * Build optimal ad schedule from cached bids
   */
  async buildOptimalSchedule(
    context: OutstreamContext,
    availableBids: VideoBidCache[],
    prediction: DurationPrediction
  ): Promise<AdSchedule> {
    // Filter bids by recommended duration
    const targetDuration = prediction.recommendedDuration;
    const suitableBids = availableBids.filter(bid => bid.duration === targetDuration);

    if (suitableBids.length === 0) {
      // Fallback to any available duration
      return this.buildFallbackSchedule(context, availableBids, prediction);
    }

    // Sort by CPM (highest first)
    suitableBids.sort((a, b) => b.cpm - a.cpm);

    // Calculate how many ads we can fit
    const maxAds = Math.floor(prediction.expectedTimeOnPage / targetDuration);
    const selectedBids = suitableBids.slice(0, Math.min(maxAds, 3)); // Max 3 ads

    // Build schedule
    const ads: ScheduledAd[] = selectedBids.map((bid, index) => ({
      bidId: bid.bidId,
      position: index + 1,
      duration: bid.duration,
      cpm: bid.cpm,
      source: bid.source,
      vastUrl: bid.vastUrl,
      startTime: index * bid.duration
    }));

    const totalDuration = ads.reduce((sum, ad) => sum + ad.duration, 0);
    const expectedRevenue = ads.reduce((sum, ad) => sum + (ad.cpm / 1000), 0);
    const revenuePerSecond = expectedRevenue / totalDuration;

    return {
      totalDuration,
      expectedRevenue,
      revenuePerSecond,
      ads,
      reasoning: `Optimized for ${targetDuration}s ads: ${ads.length} ad(s), $${expectedRevenue.toFixed(4)} revenue`
    };
  }

  // --------------------------------------------------------------------------
  // TIME ON PAGE TRACKING
  // --------------------------------------------------------------------------

  /**
   * Record time on page data point
   */
  recordTimeOnPage(url: string, deviceType: 'desktop' | 'mobile' | 'tablet', timeSpent: number): void {
    const key = this.getTimeOnPageKey(url, deviceType);
    const existing = this.timeOnPageData.get(key);

    if (existing) {
      // Update running average
      const newSampleSize = existing.sampleSize + 1;
      const newAverage =
        (existing.averageTimeOnPage * existing.sampleSize + timeSpent) / newSampleSize;

      this.timeOnPageData.set(key, {
        url,
        deviceType,
        averageTimeOnPage: newAverage,
        sampleSize: newSampleSize,
        lastUpdated: Date.now()
      });
    } else {
      // First data point
      this.timeOnPageData.set(key, {
        url,
        deviceType,
        averageTimeOnPage: timeSpent,
        sampleSize: 1,
        lastUpdated: Date.now()
      });
    }

    // Save to localStorage
    this.saveToLocalStorage();

    // Optionally sync to GCP
    if (this.gcpStorageBucket) {
      this.syncToGCP(key).catch(err => console.error('GCP sync failed:', err));
    }
  }

  /**
   * Get time on page data for URL + device
   */
  getTimeOnPageData(url: string, deviceType: 'desktop' | 'mobile' | 'tablet'): TimeOnPageData | null {
    const key = this.getTimeOnPageKey(url, deviceType);
    return this.timeOnPageData.get(key) || null;
  }

  // --------------------------------------------------------------------------
  // BID CACHING
  // --------------------------------------------------------------------------

  /**
   * Cache a winning video bid
   */
  cacheBid(bid: Omit<VideoBidCache, 'cachedAt' | 'expiresAt'>): void {
    const cached: VideoBidCache = {
      ...bid,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minute TTL
    };

    this.bidCache.set(bid.bidId, cached);
    this.saveToLocalStorage();
  }

  /**
   * Get cached bids for specific duration
   */
  getCachedBids(duration?: 6 | 15 | 30): VideoBidCache[] {
    const now = Date.now();
    const validBids = Array.from(this.bidCache.values())
      .filter(bid => bid.expiresAt > now);

    if (duration) {
      return validBids.filter(bid => bid.duration === duration);
    }

    return validBids;
  }

  /**
   * Clear expired bids from cache
   */
  clearExpiredBids(): void {
    const now = Date.now();
    for (const [bidId, bid] of this.bidCache.entries()) {
      if (bid.expiresAt <= now) {
        this.bidCache.delete(bidId);
      }
    }
    this.saveToLocalStorage();
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private getTimeOnPageKey(url: string, deviceType: string): string {
    // Normalize URL (remove query params for grouping)
    const urlObj = new URL(url, window.location.origin);
    const normalizedUrl = urlObj.origin + urlObj.pathname;
    return `${normalizedUrl}|${deviceType}`;
  }

  private estimateTimeOnPage(context: OutstreamContext): number {
    // Industry benchmarks
    const benchmarks = {
      desktop: { 'in-content': 45, 'sticky': 60, 'sidebar': 30 },
      mobile: { 'in-content': 30, 'sticky': 40, 'sidebar': 20 },
      tablet: { 'in-content': 40, 'sticky': 50, 'sidebar': 25 }
    };

    return benchmarks[context.deviceType][context.placement] || 30;
  }

  private calculateDurationScore(duration: 6 | 15 | 30, avgTime: number): number {
    // Score based on fit within available time and revenue potential
    const fitScore = Math.min(1, avgTime / duration); // How well it fits
    const revenueScore = this.durationBenchmarks[duration] / 20; // Normalized revenue
    const efficiencyScore = (this.durationBenchmarks[duration] / 1000 / duration) * 100; // Revenue per second

    return (fitScore * 0.4 + revenueScore * 0.3 + efficiencyScore * 0.3);
  }

  private validatePrediction(prediction: any): DurationPrediction {
    // Ensure valid duration
    if (![6, 15, 30].includes(prediction.recommendedDuration)) {
      prediction.recommendedDuration = 15; // Default
    }

    // Ensure confidence is 0-1
    prediction.confidence = Math.max(0, Math.min(1, prediction.confidence));

    return prediction as DurationPrediction;
  }

  private getDefaultPrediction(context: OutstreamContext): DurationPrediction {
    return {
      recommendedDuration: 15,
      confidence: 0.70,
      expectedTimeOnPage: 30,
      alternativeDurations: [
        { duration: 6, score: 0.75, expectedRevenue: 0.008 },
        { duration: 15, score: 0.80, expectedRevenue: 0.012 },
        { duration: 30, score: 0.65, expectedRevenue: 0.015 }
      ],
      reasoning: 'Default 15s duration (optimizer disabled)'
    };
  }

  private buildFallbackSchedule(
    context: OutstreamContext,
    availableBids: VideoBidCache[],
    prediction: DurationPrediction
  ): AdSchedule {
    // Use best available bid regardless of duration
    if (availableBids.length === 0) {
      return {
        totalDuration: 0,
        expectedRevenue: 0,
        revenuePerSecond: 0,
        ads: [],
        reasoning: 'No cached bids available'
      };
    }

    // Sort by CPM
    availableBids.sort((a, b) => b.cpm - a.cpm);
    const bestBid = availableBids[0];

    return {
      totalDuration: bestBid.duration,
      expectedRevenue: bestBid.cpm / 1000,
      revenuePerSecond: (bestBid.cpm / 1000) / bestBid.duration,
      ads: [{
        bidId: bestBid.bidId,
        position: 1,
        duration: bestBid.duration,
        cpm: bestBid.cpm,
        source: bestBid.source,
        vastUrl: bestBid.vastUrl,
        startTime: 0
      }],
      reasoning: `Fallback: Using best available ${bestBid.duration}s ad @ $${bestBid.cpm} CPM`
    };
  }

  // --------------------------------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------------------------------

  private loadFromLocalStorage(): void {
    try {
      const timeOnPageStr = localStorage.getItem('outstream_timeOnPage');
      if (timeOnPageStr) {
        const data = JSON.parse(timeOnPageStr);
        this.timeOnPageData = new Map(Object.entries(data));
      }

      const bidCacheStr = localStorage.getItem('outstream_bidCache');
      if (bidCacheStr) {
        const data = JSON.parse(bidCacheStr);
        this.bidCache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const timeOnPageObj: Record<string, TimeOnPageData> = {};
      this.timeOnPageData.forEach((value, key) => {
        timeOnPageObj[key] = value;
      });
      localStorage.setItem('outstream_timeOnPage', JSON.stringify(timeOnPageObj));

      const bidCacheObj: Record<string, VideoBidCache> = {};
      this.bidCache.forEach((value, key) => {
        bidCacheObj[key] = value;
      });
      localStorage.setItem('outstream_bidCache', JSON.stringify(bidCacheObj));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private async syncToGCP(key: string): Promise<void> {
    const data = this.timeOnPageData.get(key);
    if (!data) return;

    try {
      await axios.post(`${this.gcpApiEndpoint}/sync`, {
        bucket: this.gcpStorageBucket,
        key,
        data
      });
    } catch (error) {
      console.error('GCP sync error:', error);
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getAnalytics(): {
    totalURLs: number;
    totalBidsCached: number;
    avgTimeOnPageByDevice: Record<string, number>;
  } {
    const avgByDevice: Record<string, { sum: number; count: number }> = {
      desktop: { sum: 0, count: 0 },
      mobile: { sum: 0, count: 0 },
      tablet: { sum: 0, count: 0 }
    };

    this.timeOnPageData.forEach(data => {
      avgByDevice[data.deviceType].sum += data.averageTimeOnPage;
      avgByDevice[data.deviceType].count++;
    });

    return {
      totalURLs: this.timeOnPageData.size,
      totalBidsCached: this.bidCache.size,
      avgTimeOnPageByDevice: {
        desktop: avgByDevice.desktop.count > 0 ? avgByDevice.desktop.sum / avgByDevice.desktop.count : 0,
        mobile: avgByDevice.mobile.count > 0 ? avgByDevice.mobile.sum / avgByDevice.mobile.count : 0,
        tablet: avgByDevice.tablet.count > 0 ? avgByDevice.tablet.sum / avgByDevice.tablet.count : 0
      }
    };
  }

  clearAllData(): void {
    this.timeOnPageData.clear();
    this.bidCache.clear();
    this.saveToLocalStorage();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let optimizerInstance: DynamicAdDurationOptimizer | null = null;

export function getDurationOptimizer(config?: any): DynamicAdDurationOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new DynamicAdDurationOptimizer(config);
  }
  return optimizerInstance;
}

export function resetDurationOptimizer(): void {
  optimizerInstance = null;
}
