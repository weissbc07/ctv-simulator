/**
 * Dynamic Ad Pod Optimizer with Real-Time Yield Management
 *
 * AI-powered ad pod builder that maximizes revenue per video view by optimizing
 * pod composition in real-time using LLM-based strategy generation and ML predictions.
 *
 * Features:
 * - LLM-powered pod strategy optimization
 * - Dynamic floor price adjustment
 * - Real-time bid evaluation with ML scoring
 * - Competitive separation and brand safety
 * - Historical performance learning
 * - Multi-exchange parallel bidding
 */

import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AdOpportunity {
  position: 'preroll' | 'midroll' | 'postroll';
  videoLength: number;
  maxAdDuration: number;
  category: string;
  device: string;
  user: UserContext;
}

export interface UserContext {
  id: string;
  segments?: string[];
  ltv?: number;
  adEngagementScore?: number;
}

export interface DemandSource {
  name: string;
  endpoint: string;
  avgCPM: number;
  fillRate: number;
  responseTime: number;
  acceptedDurations: number[];
  competitiveCategories: string[];
  timeout: number;
  enabled: boolean;
}

export interface PodStrategy {
  slotCount: number;
  durations: number[];
  sequence: SlotStrategy[];
  expectedRevenue: number;
  expectedCompletionRate: number;
  reasoning: string;
}

export interface SlotStrategy {
  slot: number;
  sources: string[];
  floor: number;
  timeout: number;
  duration: number;
  expectedCPM: number;
  fillProbability: number;
  separation?: CompetitiveSeparation;
}

export interface CompetitiveSeparation {
  rules: string[];
  minimumTimeBetween: number;
  excludedCategories: string[];
}

export interface AdPodResult {
  slotsAttempted: number;
  slotsFilled: number;
  totalRevenue: number;
  totalDuration: number;
  completionRate: number;
  winningBids: WinningBid[];
  failedSlots: FailedSlot[];
}

export interface WinningBid {
  slot: number;
  source: string;
  cpm: number;
  vastUrl: string;
  duration: number;
  advertiserDomain?: string;
  category?: string;
  dealId?: string;
}

export interface FailedSlot {
  slot: number;
  reason: string;
  attemptedSources: string[];
}

export interface BidResponse {
  source: string;
  cpm: number;
  vastUrl: string;
  duration: number;
  advertiserDomain?: string;
  category?: string;
  dealId?: string;
  latency: number;
  confidence?: number;
}

export interface HistoricalPerformance {
  position: string;
  avgRevenue: number;
  avgFillRate: number;
  avgCompletionRate: number;
  topSources: { name: string; contribution: number }[];
  sampleSize: number;
  lastUpdated: number;
}

// ============================================================================
// DYNAMIC AD POD OPTIMIZER CLASS
// ============================================================================

export class DynamicAdPodOptimizer {
  private revenueTargets: Record<string, number>;
  private demandSources: Map<string, DemandSource>;
  private historicalPerformance: Map<string, HistoricalPerformance>;
  private llmEndpoint: string;
  private enabled: boolean;

  constructor(config?: {
    revenueTargets?: Record<string, number>;
    llmEndpoint?: string;
    enabled?: boolean;
  }) {
    this.revenueTargets = config?.revenueTargets || {
      preroll: 8.50,
      midroll: 12.00,
      postroll: 6.00
    };

    this.demandSources = new Map();
    this.historicalPerformance = new Map();
    this.llmEndpoint = config?.llmEndpoint || '/api/llm/optimize-pod';
    this.enabled = config?.enabled !== false;

    // Initialize with default demand sources
    this.initializeDefaultDemandSources();

    // Load historical performance from localStorage
    this.loadHistoricalPerformance();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private initializeDefaultDemandSources(): void {
    const defaultSources: DemandSource[] = [
      {
        name: 'Google AdX',
        endpoint: '/api/adx',
        avgCPM: 12.50,
        fillRate: 0.85,
        responseTime: 950,
        acceptedDurations: [15, 30],
        competitiveCategories: ['automotive', 'insurance', 'finance'],
        timeout: 1200,
        enabled: true
      },
      {
        name: 'Amazon DSP',
        endpoint: '/api/real-programmatic?exchange=amazon',
        avgCPM: 11.20,
        fillRate: 0.78,
        responseTime: 1100,
        acceptedDurations: [15, 30],
        competitiveCategories: ['retail', 'ecommerce'],
        timeout: 1500,
        enabled: true
      },
      {
        name: 'The Trade Desk',
        endpoint: '/api/real-programmatic?exchange=tradedesk',
        avgCPM: 13.80,
        fillRate: 0.72,
        responseTime: 1200,
        acceptedDurations: [15, 30],
        competitiveCategories: ['cpg', 'automotive', 'tech'],
        timeout: 1500,
        enabled: true
      },
      {
        name: 'Magnite',
        endpoint: '/api/real-programmatic?exchange=magnite',
        avgCPM: 9.50,
        fillRate: 0.88,
        responseTime: 850,
        acceptedDurations: [15, 30],
        competitiveCategories: [],
        timeout: 1200,
        enabled: true
      },
      {
        name: 'PubMatic',
        endpoint: '/api/real-programmatic?exchange=pubmatic',
        avgCPM: 10.80,
        fillRate: 0.82,
        responseTime: 900,
        acceptedDurations: [15, 30],
        competitiveCategories: [],
        timeout: 1200,
        enabled: true
      },
      {
        name: 'OpenX',
        endpoint: '/api/real-programmatic?exchange=openx',
        avgCPM: 8.90,
        fillRate: 0.75,
        responseTime: 1050,
        acceptedDurations: [15, 30],
        competitiveCategories: [],
        timeout: 1300,
        enabled: true
      },
      {
        name: 'Prebid Server',
        endpoint: '/api/prebid-server',
        avgCPM: 9.20,
        fillRate: 0.80,
        responseTime: 1400,
        acceptedDurations: [15, 30],
        competitiveCategories: [],
        timeout: 1800,
        enabled: true
      }
    ];

    defaultSources.forEach(source => {
      this.demandSources.set(source.name, source);
    });
  }

  private loadHistoricalPerformance(): void {
    try {
      const stored = localStorage.getItem('adPodHistoricalPerformance');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.historicalPerformance.set(key, value as HistoricalPerformance);
        });
      }
    } catch (error) {
      console.warn('Failed to load historical performance:', error);
    }
  }

  private saveHistoricalPerformance(): void {
    try {
      const data: Record<string, HistoricalPerformance> = {};
      this.historicalPerformance.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem('adPodHistoricalPerformance', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save historical performance:', error);
    }
  }

  // --------------------------------------------------------------------------
  // CORE OPTIMIZATION METHODS
  // --------------------------------------------------------------------------

  /**
   * Build optimal ad pod strategy for maximum revenue
   */
  async buildOptimalAdPod(opportunity: AdOpportunity): Promise<PodStrategy> {
    if (!this.enabled) {
      return this.getDefaultStrategy(opportunity);
    }

    const context = {
      position: opportunity.position,
      videoLength: opportunity.videoLength,
      userValue: await this.estimateUserValue(opportunity.user),
      timeAvailable: opportunity.maxAdDuration,
      contentCategory: opportunity.category,
      deviceType: opportunity.device,
      fillRateHistory: this.getHistoricalFillRate(opportunity.position)
    };

    try {
      // Get AI-powered strategy from LLM
      const strategy = await this.getAIStrategy(context, opportunity);
      return strategy;
    } catch (error) {
      console.error('Failed to get AI strategy, falling back to default:', error);
      return this.getDefaultStrategy(opportunity);
    }
  }

  /**
   * LLM-powered strategy engine
   */
  private async getAIStrategy(context: any, opportunity: AdOpportunity): Promise<PodStrategy> {
    const historicalPerf = this.historicalPerformance.get(context.position);
    const enabledSources = Array.from(this.demandSources.values()).filter(s => s.enabled);

    const prompt = `You are a video ad monetization expert. Optimize this ad pod for maximum publisher revenue:

OPPORTUNITY:
- Position: ${context.position}
- Video length: ${context.videoLength}s
- Available ad time: ${context.timeAvailable}s
- User LTV estimate: $${context.userValue.toFixed(2)}
- Device: ${context.deviceType}
- Content: ${context.contentCategory}
- Historical fill rate: ${context.fillRateHistory}%

HISTORICAL PERFORMANCE (30 days):
${historicalPerf ? JSON.stringify(historicalPerf, null, 2) : 'No historical data available'}

DEMAND SOURCES AVAILABLE:
${enabledSources.map(d => `
- ${d.name}:
  * Avg CPM: $${d.avgCPM}
  * Fill rate: ${(d.fillRate * 100).toFixed(0)}%
  * Avg response time: ${d.responseTime}ms
  * Accepts durations: ${d.acceptedDurations.join(', ')}s
  * Competitive categories: ${d.competitiveCategories.join(', ') || 'none'}
`).join('\n')}

OPTIMIZE FOR:
1. Maximum total revenue (not just CPM - consider fill rates)
2. User experience (completion rate target: >75%)
3. Time efficiency (total timeout < 3 seconds)
4. Competitive separation (no competing brands in same pod)

CALCULATE:
1. Optimal number of ad slots (1-3)
2. Duration per slot (15s or 30s)
3. Which demand sources to call, in what order
4. Floor price per slot (dynamic based on position/context)
5. Timeout per source
6. Expected total revenue for this pod
7. Expected completion rate

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "slotCount": 2,
  "durations": [15, 30],
  "sequence": [
    {
      "slot": 1,
      "duration": 15,
      "sources": ["Google AdX", "PubMatic", "Magnite"],
      "floor": 8.50,
      "timeout": 1200,
      "expectedCPM": 11.20,
      "fillProbability": 0.92,
      "separation": {
        "rules": ["no_competing_auto_brands"],
        "minimumTimeBetween": 30,
        "excludedCategories": []
      }
    },
    {
      "slot": 2,
      "duration": 30,
      "sources": ["The Trade Desk", "Amazon DSP"],
      "floor": 10.00,
      "timeout": 1500,
      "expectedCPM": 13.50,
      "fillProbability": 0.85,
      "separation": {
        "rules": ["no_competing_brands_from_slot_1"],
        "minimumTimeBetween": 0,
        "excludedCategories": []
      }
    }
  ],
  "expectedRevenue": 0.024,
  "expectedCompletionRate": 0.78,
  "reasoning": "brief explanation"
}`;

    try {
      const response = await axios.post(this.llmEndpoint, { prompt });

      // Parse LLM response, handling potential markdown code blocks
      let jsonText = response.data.strategy || response.data;
      if (typeof jsonText === 'string') {
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const strategy: PodStrategy = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;

      // Validate and sanitize strategy
      return this.validateStrategy(strategy, opportunity);
    } catch (error) {
      console.error('LLM strategy generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate and sanitize LLM strategy
   */
  private validateStrategy(strategy: PodStrategy, opportunity: AdOpportunity): PodStrategy {
    // Ensure slot count is reasonable
    strategy.slotCount = Math.min(Math.max(strategy.slotCount, 1), 3);

    // Ensure durations match slot count
    if (strategy.durations.length !== strategy.slotCount) {
      strategy.durations = Array(strategy.slotCount).fill(15);
    }

    // Ensure sequence matches slot count
    if (strategy.sequence.length !== strategy.slotCount) {
      strategy.sequence = strategy.sequence.slice(0, strategy.slotCount);
    }

    // Validate each slot
    strategy.sequence = strategy.sequence.map((slot, index) => {
      // Ensure sources exist
      slot.sources = slot.sources.filter(s => this.demandSources.has(s));
      if (slot.sources.length === 0) {
        slot.sources = Array.from(this.demandSources.keys()).slice(0, 3);
      }

      // Ensure reasonable floor
      slot.floor = Math.max(slot.floor, 0.50);
      slot.floor = Math.min(slot.floor, 50.00);

      // Ensure reasonable timeout
      slot.timeout = Math.max(slot.timeout, 400);
      slot.timeout = Math.min(slot.timeout, 3000);

      // Set duration from durations array
      slot.duration = strategy.durations[index] || 15;

      return slot;
    });

    return strategy;
  }

  /**
   * Fallback default strategy
   */
  private getDefaultStrategy(opportunity: AdOpportunity): PodStrategy {
    const duration = opportunity.maxAdDuration >= 30 ? 30 : 15;
    const sources = Array.from(this.demandSources.values())
      .filter(s => s.enabled)
      .sort((a, b) => b.avgCPM - a.avgCPM)
      .slice(0, 3)
      .map(s => s.name);

    return {
      slotCount: 1,
      durations: [duration],
      sequence: [
        {
          slot: 1,
          duration,
          sources,
          floor: this.revenueTargets[opportunity.position] || 8.00,
          timeout: 1500,
          expectedCPM: 10.00,
          fillProbability: 0.80,
          separation: {
            rules: [],
            minimumTimeBetween: 0,
            excludedCategories: []
          }
        }
      ],
      expectedRevenue: 0.015,
      expectedCompletionRate: 0.75,
      reasoning: 'Default strategy - single slot with top 3 sources'
    };
  }

  /**
   * Execute optimized ad pod
   */
  async executeAdPod(strategy: PodStrategy, opportunity: AdOpportunity): Promise<AdPodResult> {
    const results: AdPodResult = {
      slotsAttempted: strategy.slotCount,
      slotsFilled: 0,
      totalRevenue: 0,
      totalDuration: 0,
      completionRate: 0,
      winningBids: [],
      failedSlots: []
    };

    const excludedAdvertisers: string[] = [];
    const excludedCategories: string[] = [];

    for (const slot of strategy.sequence) {
      try {
        // Fetch bids from demand sources
        const bids = await this.fetchBids(slot, opportunity, {
          excludedAdvertisers,
          excludedCategories
        });

        if (bids.length === 0) {
          results.failedSlots.push({
            slot: slot.slot,
            reason: 'No bids received',
            attemptedSources: slot.sources
          });
          continue;
        }

        // Evaluate bids with ML scoring
        const winningBid = await this.evaluateBids(bids, slot);

        if (winningBid) {
          results.winningBids.push(winningBid);
          results.slotsFilled++;
          results.totalRevenue += (winningBid.cpm / 1000);
          results.totalDuration += winningBid.duration;

          // Track for competitive separation
          if (winningBid.advertiserDomain) {
            excludedAdvertisers.push(winningBid.advertiserDomain);
          }
          if (winningBid.category) {
            excludedCategories.push(winningBid.category);
          }

          // Learn from this impression
          await this.updateLearningModel(slot, winningBid);
        } else {
          results.failedSlots.push({
            slot: slot.slot,
            reason: 'All bids below floor',
            attemptedSources: slot.sources
          });
        }
      } catch (error) {
        console.error(`Error executing slot ${slot.slot}:`, error);
        results.failedSlots.push({
          slot: slot.slot,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
          attemptedSources: slot.sources
        });
      }
    }

    // Calculate completion rate (simplified - would need actual video analytics)
    results.completionRate = results.slotsFilled / results.slotsAttempted;

    return results;
  }

  /**
   * Fetch bids from multiple demand sources
   */
  private async fetchBids(
    slot: SlotStrategy,
    opportunity: AdOpportunity,
    exclusions: { excludedAdvertisers: string[]; excludedCategories: string[] }
  ): Promise<BidResponse[]> {
    const bidPromises = slot.sources.map(async (sourceName) => {
      const source = this.demandSources.get(sourceName);
      if (!source || !source.enabled) {
        return null;
      }

      const startTime = Date.now();

      try {
        const response = await axios.post(
          source.endpoint,
          {
            floor: slot.floor,
            duration: slot.duration,
            position: opportunity.position,
            category: opportunity.category,
            device: opportunity.device,
            excludedAdvertisers: exclusions.excludedAdvertisers,
            excludedCategories: exclusions.excludedCategories
          },
          { timeout: slot.timeout }
        );

        const latency = Date.now() - startTime;

        // Parse response based on endpoint type
        if (response.data.seatbid && response.data.seatbid.length > 0) {
          // OpenRTB format
          const bid = response.data.seatbid[0].bid[0];
          return {
            source: sourceName,
            cpm: bid.price,
            vastUrl: bid.adm || bid.nurl,
            duration: slot.duration,
            advertiserDomain: bid.adomain?.[0],
            category: bid.cat?.[0],
            dealId: bid.dealid,
            latency
          };
        } else if (response.data.vastUrl || response.data.vast_url) {
          // Custom format
          return {
            source: sourceName,
            cpm: response.data.cpm || response.data.price || slot.floor,
            vastUrl: response.data.vastUrl || response.data.vast_url,
            duration: slot.duration,
            advertiserDomain: response.data.advertiserDomain,
            category: response.data.category,
            dealId: response.data.dealId,
            latency
          };
        }

        return null;
      } catch (error) {
        console.warn(`Bid request failed for ${sourceName}:`, error);
        return null;
      }
    });

    const bids = await Promise.all(bidPromises);
    return bids.filter((bid): bid is BidResponse => bid !== null);
  }

  /**
   * Evaluate bids with ML-powered scoring
   */
  private async evaluateBids(bids: BidResponse[], slot: SlotStrategy): Promise<WinningBid | null> {
    if (bids.length === 0) {
      return null;
    }

    // Score each bid
    const scoredBids = bids.map(bid => {
      const source = this.demandSources.get(bid.source);

      // Multi-factor scoring
      const revenueScore = bid.cpm / 20; // Normalize to 0-1 (assuming max $20 CPM)
      const fillConfidenceScore = source ? source.fillRate : 0.5;
      const latencyScore = Math.max(0, 1 - (bid.latency / 2000)); // Penalize slow responses

      // Weighted composite score
      const compositeScore =
        revenueScore * 0.70 +
        fillConfidenceScore * 0.20 +
        latencyScore * 0.10;

      return {
        ...bid,
        score: compositeScore
      };
    });

    // Sort by score and pick winner
    scoredBids.sort((a, b) => b.score - a.score);
    const winner = scoredBids[0];

    // Check if winner meets floor
    if (winner.cpm < slot.floor) {
      return null;
    }

    return {
      slot: slot.slot,
      source: winner.source,
      cpm: winner.cpm,
      vastUrl: winner.vastUrl,
      duration: winner.duration,
      advertiserDomain: winner.advertiserDomain,
      category: winner.category,
      dealId: winner.dealId
    };
  }

  /**
   * Update learning model with impression results
   */
  private async updateLearningModel(slot: SlotStrategy, result: WinningBid): Promise<void> {
    // Update demand source performance
    const source = this.demandSources.get(result.source);
    if (source) {
      // Exponential moving average for CPM
      source.avgCPM = source.avgCPM * 0.95 + result.cpm * 0.05;

      // Track successful fill
      source.fillRate = source.fillRate * 0.98 + 0.02;

      this.demandSources.set(result.source, source);
    }

    // Update historical performance for this position
    const position = slot.slot === 1 ? 'preroll' : slot.slot === 2 ? 'midroll' : 'postroll';
    const histKey = position;
    let hist = this.historicalPerformance.get(histKey);

    if (!hist) {
      hist = {
        position,
        avgRevenue: 0,
        avgFillRate: 0,
        avgCompletionRate: 0.75,
        topSources: [],
        sampleSize: 0,
        lastUpdated: Date.now()
      };
    }

    const revenue = result.cpm / 1000;
    hist.avgRevenue = (hist.avgRevenue * hist.sampleSize + revenue) / (hist.sampleSize + 1);
    hist.avgFillRate = (hist.avgFillRate * hist.sampleSize + 1) / (hist.sampleSize + 1);
    hist.sampleSize++;
    hist.lastUpdated = Date.now();

    this.historicalPerformance.set(histKey, hist);
    this.saveHistoricalPerformance();
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private async estimateUserValue(user: UserContext): Promise<number> {
    // Use LTV if available
    if (user.ltv) {
      return user.ltv;
    }

    // Estimate based on engagement score
    if (user.adEngagementScore) {
      return user.adEngagementScore / 10; // Convert 0-100 to $0-$10
    }

    // Default estimate
    return 2.50;
  }

  private getHistoricalFillRate(position: string): number {
    const hist = this.historicalPerformance.get(position);
    return hist ? hist.avgFillRate * 100 : 75;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Add or update demand source
   */
  addDemandSource(source: DemandSource): void {
    this.demandSources.set(source.name, source);
  }

  /**
   * Remove demand source
   */
  removeDemandSource(name: string): void {
    this.demandSources.delete(name);
  }

  /**
   * Get all demand sources
   */
  getDemandSources(): DemandSource[] {
    return Array.from(this.demandSources.values());
  }

  /**
   * Update revenue targets
   */
  setRevenueTargets(targets: Record<string, number>): void {
    this.revenueTargets = { ...this.revenueTargets, ...targets };
  }

  /**
   * Get historical performance
   */
  getHistoricalPerformance(position?: string): HistoricalPerformance | Map<string, HistoricalPerformance> {
    if (position) {
      return this.historicalPerformance.get(position) || {
        position,
        avgRevenue: 0,
        avgFillRate: 0,
        avgCompletionRate: 0,
        topSources: [],
        sampleSize: 0,
        lastUpdated: Date.now()
      };
    }
    return this.historicalPerformance;
  }

  /**
   * Enable/disable optimizer
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if optimizer is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let optimizerInstance: DynamicAdPodOptimizer | null = null;

export function getOptimizer(config?: any): DynamicAdPodOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new DynamicAdPodOptimizer(config);
  }
  return optimizerInstance;
}

export function resetOptimizer(): void {
  optimizerInstance = null;
}
