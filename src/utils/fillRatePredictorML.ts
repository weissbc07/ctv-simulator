/**
 * Fill Rate Predictor using Machine Learning
 *
 * Predicts the probability that a demand source will fill an ad request
 * based on historical data, contextual features, and real-time signals.
 *
 * Features:
 * - Feature engineering from context
 * - Lightweight ML model (no external dependencies)
 * - Real-time prediction
 * - Continuous learning from outcomes
 */

import { DemandSource } from './dynamicAdPodOptimizer';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PredictionContext {
  demandSource: string;
  hour: number;
  dayOfWeek: number;
  device: string;
  geography?: string;
  contentCategory: string;
  floorPrice: number;
  adPosition: string;
  seasonality?: number;
}

export interface FillPrediction {
  fillProbability: number;
  expectedCPM: number;
  expectedLatency: number;
  confidence: number;
  recommendation: 'call' | 'skip' | 'reduce_timeout';
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1
  value: any;
}

export interface TrainingData {
  context: PredictionContext;
  filled: boolean;
  cpm?: number;
  latency?: number;
  timestamp: number;
}

interface ModelWeights {
  hourOfDay: number[];
  dayOfWeek: number[];
  device: Record<string, number>;
  category: Record<string, number>;
  position: Record<string, number>;
  floorImpact: number;
  baselineBySource: Record<string, number>;
}

// ============================================================================
// FILL RATE PREDICTOR ML CLASS
// ============================================================================

export class FillRatePredictorML {
  private trainingData: TrainingData[] = [];
  private maxTrainingData = 10000;
  private modelWeights: ModelWeights;
  private learningRate = 0.01;

  constructor() {
    // Initialize with sensible defaults
    this.modelWeights = {
      hourOfDay: Array(24).fill(0),
      dayOfWeek: Array(7).fill(0),
      device: {
        'desktop': 0.05,
        'mobile': 0.02,
        'tablet': 0.03,
        'ctv': 0.08,
        'smarttv': 0.08
      },
      category: {
        'news': 0.04,
        'sports': 0.06,
        'entertainment': 0.03,
        'business': 0.07,
        'technology': 0.05
      },
      position: {
        'preroll': 0.10,
        'midroll': 0.15,
        'postroll': -0.05
      },
      floorImpact: -0.02, // Higher floors reduce fill rate
      baselineBySource: {}
    };

    // Load training data from localStorage
    this.loadTrainingData();
  }

  // --------------------------------------------------------------------------
  // PREDICTION
  // --------------------------------------------------------------------------

  /**
   * Predict fill probability for a demand source
   */
  async predictFillProbability(
    demandSource: DemandSource,
    context: Partial<PredictionContext>
  ): Promise<FillPrediction> {
    const now = new Date();
    const fullContext: PredictionContext = {
      demandSource: demandSource.name,
      hour: context.hour ?? now.getHours(),
      dayOfWeek: context.dayOfWeek ?? now.getDay(),
      device: context.device || 'desktop',
      geography: context.geography,
      contentCategory: context.contentCategory || 'general',
      floorPrice: context.floorPrice || 8.00,
      adPosition: context.adPosition || 'preroll',
      seasonality: context.seasonality ?? this.getSeasonalityFactor()
    };

    // Extract features
    const features = this.extractFeatures(fullContext, demandSource);

    // Calculate base probability from historical data
    const baseProbability = this.calculateBaseProbability(demandSource, fullContext);

    // Apply feature weights
    let probability = baseProbability;
    const factors: PredictionFactor[] = [];

    // Hour of day impact
    const hourImpact = this.modelWeights.hourOfDay[fullContext.hour] || 0;
    probability += hourImpact;
    factors.push({ name: 'Hour of day', impact: hourImpact, value: fullContext.hour });

    // Day of week impact
    const dowImpact = this.modelWeights.dayOfWeek[fullContext.dayOfWeek] || 0;
    probability += dowImpact;
    factors.push({ name: 'Day of week', impact: dowImpact, value: fullContext.dayOfWeek });

    // Device impact
    const deviceImpact = this.modelWeights.device[fullContext.device.toLowerCase()] || 0;
    probability += deviceImpact;
    factors.push({ name: 'Device', impact: deviceImpact, value: fullContext.device });

    // Category impact
    const categoryImpact = this.modelWeights.category[fullContext.contentCategory.toLowerCase()] || 0;
    probability += categoryImpact;
    factors.push({ name: 'Content category', impact: categoryImpact, value: fullContext.contentCategory });

    // Position impact
    const positionImpact = this.modelWeights.position[fullContext.adPosition] || 0;
    probability += positionImpact;
    factors.push({ name: 'Ad position', impact: positionImpact, value: fullContext.adPosition });

    // Floor price impact (higher floor = lower fill)
    const floorImpact = this.modelWeights.floorImpact * (fullContext.floorPrice / 10);
    probability += floorImpact;
    factors.push({ name: 'Floor price', impact: floorImpact, value: `$${fullContext.floorPrice}` });

    // Seasonality impact
    const seasonalityImpact = (fullContext.seasonality || 1) - 1;
    probability += seasonalityImpact * 0.1;
    factors.push({ name: 'Seasonality', impact: seasonalityImpact * 0.1, value: fullContext.seasonality });

    // Clamp probability to [0, 1]
    probability = Math.max(0, Math.min(1, probability));

    // Calculate confidence based on sample size
    const sampleSize = this.getSourceSampleSize(demandSource.name);
    const confidence = Math.min(1, sampleSize / 100);

    // Expected CPM based on historical data
    const expectedCPM = this.predictCPM(demandSource, fullContext, probability);

    // Expected latency
    const expectedLatency = this.predictLatency(demandSource, fullContext);

    // Generate recommendation
    const recommendation = this.generateRecommendation(probability, expectedCPM, expectedLatency);

    return {
      fillProbability: probability,
      expectedCPM,
      expectedLatency,
      confidence,
      recommendation,
      factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    };
  }

  // --------------------------------------------------------------------------
  // FEATURE ENGINEERING
  // --------------------------------------------------------------------------

  private extractFeatures(context: PredictionContext, source: DemandSource): number[] {
    return [
      context.hour / 24, // Normalize hour
      context.dayOfWeek / 7, // Normalize day
      this.encodeDevice(context.device),
      this.encodeCategory(context.contentCategory),
      this.encodePosition(context.adPosition),
      context.floorPrice / 20, // Normalize floor (assuming max $20)
      context.seasonality || 1,
      source.fillRate, // Historical fill rate
      source.avgCPM / 20, // Normalized CPM
      source.responseTime / 2000 // Normalized latency
    ];
  }

  private encodeDevice(device: string): number {
    const encoding: Record<string, number> = {
      'desktop': 0.2,
      'mobile': 0.4,
      'tablet': 0.6,
      'ctv': 0.8,
      'smarttv': 1.0
    };
    return encoding[device.toLowerCase()] || 0.5;
  }

  private encodeCategory(category: string): number {
    const encoding: Record<string, number> = {
      'news': 0.3,
      'sports': 0.6,
      'entertainment': 0.4,
      'business': 0.8,
      'technology': 0.7,
      'lifestyle': 0.5
    };
    return encoding[category.toLowerCase()] || 0.5;
  }

  private encodePosition(position: string): number {
    const encoding: Record<string, number> = {
      'preroll': 0.8,
      'midroll': 1.0,
      'postroll': 0.4
    };
    return encoding[position] || 0.5;
  }

  // --------------------------------------------------------------------------
  // PROBABILITY CALCULATION
  // --------------------------------------------------------------------------

  private calculateBaseProbability(source: DemandSource, context: PredictionContext): number {
    // Start with source's historical fill rate
    let baseProbability = source.fillRate;

    // Adjust based on source-specific baseline if available
    const sourceBaseline = this.modelWeights.baselineBySource[source.name];
    if (sourceBaseline !== undefined) {
      baseProbability = sourceBaseline;
    }

    // Get recent fill rate from training data
    const recentFillRate = this.getRecentFillRate(source.name, 50);
    if (recentFillRate !== null) {
      // Weight recent data more heavily
      baseProbability = baseProbability * 0.6 + recentFillRate * 0.4;
    }

    return baseProbability;
  }

  private getRecentFillRate(sourceName: string, count: number): number | null {
    const recentData = this.trainingData
      .filter(d => d.context.demandSource === sourceName)
      .slice(-count);

    if (recentData.length === 0) {
      return null;
    }

    const filled = recentData.filter(d => d.filled).length;
    return filled / recentData.length;
  }

  private getSourceSampleSize(sourceName: string): number {
    return this.trainingData.filter(d => d.context.demandSource === sourceName).length;
  }

  // --------------------------------------------------------------------------
  // CPM & LATENCY PREDICTION
  // --------------------------------------------------------------------------

  private predictCPM(source: DemandSource, context: PredictionContext, fillProb: number): number {
    // Base CPM from source
    let expectedCPM = source.avgCPM;

    // Get recent CPMs from training data
    const recentData = this.trainingData
      .filter(d => d.context.demandSource === source.name && d.filled && d.cpm)
      .slice(-50);

    if (recentData.length > 0) {
      const avgRecentCPM = recentData.reduce((sum, d) => sum + (d.cpm || 0), 0) / recentData.length;
      expectedCPM = expectedCPM * 0.5 + avgRecentCPM * 0.5;
    }

    // Adjust based on position (midrolls typically higher CPM)
    if (context.adPosition === 'midroll') {
      expectedCPM *= 1.15;
    } else if (context.adPosition === 'postroll') {
      expectedCPM *= 0.85;
    }

    // Adjust based on device (CTV typically higher CPM)
    if (context.device.toLowerCase().includes('tv') || context.device.toLowerCase() === 'ctv') {
      expectedCPM *= 1.25;
    }

    // Account for fill probability (lower fill prob might mean higher CPM competition)
    if (fillProb < 0.5) {
      expectedCPM *= 1.10;
    }

    return Math.round(expectedCPM * 100) / 100;
  }

  private predictLatency(source: DemandSource, context: PredictionContext): number {
    // Base latency from source
    let expectedLatency = source.responseTime;

    // Get recent latencies from training data
    const recentData = this.trainingData
      .filter(d => d.context.demandSource === source.name && d.latency)
      .slice(-50);

    if (recentData.length > 0) {
      const avgRecentLatency = recentData.reduce((sum, d) => sum + (d.latency || 0), 0) / recentData.length;
      expectedLatency = expectedLatency * 0.5 + avgRecentLatency * 0.5;
    }

    // Peak hours might have higher latency
    if (context.hour >= 18 && context.hour <= 22) {
      expectedLatency *= 1.10;
    }

    return Math.round(expectedLatency);
  }

  // --------------------------------------------------------------------------
  // RECOMMENDATIONS
  // --------------------------------------------------------------------------

  private generateRecommendation(
    fillProb: number,
    expectedCPM: number,
    expectedLatency: number
  ): 'call' | 'skip' | 'reduce_timeout' {
    // Skip if fill probability is very low
    if (fillProb < 0.30) {
      return 'skip';
    }

    // Reduce timeout if latency is high but fill prob is low
    if (expectedLatency > 1500 && fillProb < 0.60) {
      return 'reduce_timeout';
    }

    // Call if reasonable fill probability
    if (fillProb >= 0.60) {
      return 'call';
    }

    // Marginal case - call but with caution
    return 'call';
  }

  // --------------------------------------------------------------------------
  // LEARNING & TRAINING
  // --------------------------------------------------------------------------

  /**
   * Record actual outcome for learning
   */
  recordOutcome(
    context: PredictionContext,
    filled: boolean,
    cpm?: number,
    latency?: number
  ): void {
    const data: TrainingData = {
      context,
      filled,
      cpm,
      latency,
      timestamp: Date.now()
    };

    this.trainingData.push(data);

    // Limit training data size
    if (this.trainingData.length > this.maxTrainingData) {
      this.trainingData = this.trainingData.slice(-this.maxTrainingData);
    }

    // Periodically update model weights
    if (this.trainingData.length % 10 === 0) {
      this.updateModelWeights();
    }

    // Save to localStorage
    this.saveTrainingData();
  }

  /**
   * Update model weights based on training data
   */
  private updateModelWeights(): void {
    // Update hour of day weights
    for (let hour = 0; hour < 24; hour++) {
      const hourData = this.trainingData.filter(d => d.context.hour === hour);
      if (hourData.length >= 10) {
        const fillRate = hourData.filter(d => d.filled).length / hourData.length;
        const avgFillRate = this.trainingData.filter(d => d.filled).length / this.trainingData.length;
        this.modelWeights.hourOfDay[hour] = (fillRate - avgFillRate) * 0.1;
      }
    }

    // Update day of week weights
    for (let day = 0; day < 7; day++) {
      const dayData = this.trainingData.filter(d => d.context.dayOfWeek === day);
      if (dayData.length >= 10) {
        const fillRate = dayData.filter(d => d.filled).length / dayData.length;
        const avgFillRate = this.trainingData.filter(d => d.filled).length / this.trainingData.length;
        this.modelWeights.dayOfWeek[day] = (fillRate - avgFillRate) * 0.1;
      }
    }

    // Update baseline by source
    const sources = new Set(this.trainingData.map(d => d.context.demandSource));
    sources.forEach(source => {
      const sourceData = this.trainingData.filter(d => d.context.demandSource === source);
      if (sourceData.length >= 20) {
        const fillRate = sourceData.filter(d => d.filled).length / sourceData.length;
        this.modelWeights.baselineBySource[source] = fillRate;
      }
    });
  }

  // --------------------------------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------------------------------

  private loadTrainingData(): void {
    try {
      const stored = localStorage.getItem('fillRatePredictorTrainingData');
      if (stored) {
        const data = JSON.parse(stored);
        this.trainingData = data.trainingData || [];
        this.modelWeights = data.modelWeights || this.modelWeights;
      }
    } catch (error) {
      console.warn('Failed to load training data:', error);
    }
  }

  private saveTrainingData(): void {
    try {
      const data = {
        trainingData: this.trainingData,
        modelWeights: this.modelWeights
      };
      localStorage.setItem('fillRatePredictorTrainingData', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save training data:', error);
    }
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private getSeasonalityFactor(): number {
    const now = new Date();
    const month = now.getMonth();

    // Q4 holiday season (Oct-Dec)
    if (month >= 9 && month <= 11) {
      return 1.20; // 20% higher demand
    }

    // Q1 post-holiday lull (Jan-Feb)
    if (month <= 1) {
      return 0.90; // 10% lower demand
    }

    // Q2-Q3 normal
    return 1.0;
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): {
    totalSamples: number;
    avgFillRate: number;
    bySource: Record<string, { samples: number; fillRate: number; avgCPM: number }>;
  } {
    const bySource: Record<string, { samples: number; fillRate: number; avgCPM: number }> = {};

    const sources = new Set(this.trainingData.map(d => d.context.demandSource));
    sources.forEach(source => {
      const sourceData = this.trainingData.filter(d => d.context.demandSource === source);
      const filled = sourceData.filter(d => d.filled);
      const avgCPM = filled.length > 0
        ? filled.reduce((sum, d) => sum + (d.cpm || 0), 0) / filled.length
        : 0;

      bySource[source] = {
        samples: sourceData.length,
        fillRate: filled.length / sourceData.length,
        avgCPM: Math.round(avgCPM * 100) / 100
      };
    });

    return {
      totalSamples: this.trainingData.length,
      avgFillRate: this.trainingData.filter(d => d.filled).length / this.trainingData.length,
      bySource
    };
  }

  /**
   * Clear all training data
   */
  clearTrainingData(): void {
    this.trainingData = [];
    this.saveTrainingData();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let predictorInstance: FillRatePredictorML | null = null;

export function getPredictor(): FillRatePredictorML {
  if (!predictorInstance) {
    predictorInstance = new FillRatePredictorML();
  }
  return predictorInstance;
}

export function resetPredictor(): void {
  predictorInstance = null;
}
