/**
 * Creative Quality Tracker
 *
 * Tracks video ad creative performance, error rates, and quality metrics
 * segmented by device type, location, connection speed, and player type.
 *
 * Features:
 * - Error rate tracking per creative ID
 * - Context segmentation (device, location, connection, player)
 * - Automatic creative blocking for high error rates
 * - SSP error reporting
 * - Performance analytics and insights
 *
 * Auto-blocking thresholds:
 * - Error rate > 25% with 20+ impressions → Block
 * - Error rate > 50% with 10+ impressions → Block immediately
 * - No errors in 100 impressions after block → Unblock
 */

import axios from 'axios';
import { CreativeContext, CreativePerformance, ContextMetrics } from './vastUnwrapper';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CreativeEvent {
  creativeId: string;
  ssp: string;
  eventType: 'impression' | 'error' | 'complete' | 'click';
  errorType?: string;
  errorMessage?: string;
  context: CreativeContext;
  timestamp: number;
}

export interface BlockedCreative {
  creativeId: string;
  ssp: string;
  errorRate: number;
  totalImpressions: number;
  totalErrors: number;
  blockReason: string;
  blockedAt: number;
  autoUnblockAt?: number; // When to automatically unblock for testing
}

export interface SSPErrorReport {
  ssp: string;
  reportDate: string;
  creatives: CreativeErrorSummary[];
  totalCreatives: number;
  totalErrors: number;
  avgErrorRate: number;
}

export interface CreativeErrorSummary {
  creativeId: string;
  impressions: number;
  errors: number;
  errorRate: number;
  errorTypes: Record<string, number>;
  topErrorType: string;
  recommendation: 'investigate' | 'pause' | 'remove';
}

// ============================================================================
// CREATIVE QUALITY TRACKER CLASS
// ============================================================================

export class CreativeQualityTracker {
  private creativeData: Map<string, CreativePerformance>;
  private blockedCreatives: Map<string, BlockedCreative>;
  private eventBuffer: CreativeEvent[];
  private bufferFlushInterval: number;
  private reportEndpoint: string;

  // Thresholds
  private readonly ERROR_RATE_THRESHOLD_HIGH = 0.50; // 50% error rate
  private readonly ERROR_RATE_THRESHOLD_MEDIUM = 0.25; // 25% error rate
  private readonly MIN_IMPRESSIONS_FOR_BLOCKING = 10;
  private readonly IMPRESSIONS_BEFORE_MEDIUM_BLOCK = 20;
  private readonly UNBLOCK_TEST_IMPRESSIONS = 100;

  constructor(config?: {
    bufferFlushInterval?: number;
    reportEndpoint?: string;
  }) {
    this.creativeData = new Map();
    this.blockedCreatives = new Map();
    this.eventBuffer = [];
    this.bufferFlushInterval = config?.bufferFlushInterval || 30000; // 30 seconds
    this.reportEndpoint = config?.reportEndpoint || '/api/reports/creative-errors';

    // Load persisted data
    this.loadFromStorage();

    // Start buffer flushing
    this.startBufferFlushing();

    // Auto-unblock testing
    this.startAutoUnblockChecking();
  }

  // --------------------------------------------------------------------------
  // EVENT TRACKING
  // --------------------------------------------------------------------------

  /**
   * Track creative event (impression, error, completion, etc.)
   */
  trackEvent(event: CreativeEvent): void {
    // Add to buffer
    this.eventBuffer.push(event);

    // Update in-memory data immediately
    this.updateCreativeData(event);

    // Check if creative should be blocked
    if (event.eventType === 'error') {
      this.checkForBlocking(event.creativeId);
    }

    // Flush if buffer is large
    if (this.eventBuffer.length >= 100) {
      this.flushBuffer();
    }
  }

  /**
   * Track creative impression
   */
  trackImpression(creativeId: string, ssp: string, context: CreativeContext): void {
    this.trackEvent({
      creativeId,
      ssp,
      eventType: 'impression',
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Track creative error
   */
  trackError(
    creativeId: string,
    ssp: string,
    context: CreativeContext,
    errorType: string,
    errorMessage?: string
  ): void {
    this.trackEvent({
      creativeId,
      ssp,
      eventType: 'error',
      errorType,
      errorMessage,
      context,
      timestamp: Date.now()
    });
  }

  // --------------------------------------------------------------------------
  // DATA MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Update creative performance data
   */
  private updateCreativeData(event: CreativeEvent): void {
    const key = this.getCreativeKey(event.creativeId, event.ssp);
    let data = this.creativeData.get(key);

    if (!data) {
      data = {
        creativeId: event.creativeId,
        ssp: event.ssp,
        byDeviceType: {},
        byLocation: {},
        byConnectionSpeed: {},
        byPlayerType: {},
        totalImpressions: 0,
        totalErrors: 0,
        errorRate: 0,
        isBlocked: false,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp
      };
      this.creativeData.set(key, data);
    }

    data.lastSeen = event.timestamp;

    // Update totals
    if (event.eventType === 'impression') {
      data.totalImpressions++;
    } else if (event.eventType === 'error') {
      data.totalErrors++;
    }

    data.errorRate = data.totalImpressions > 0 ? data.totalErrors / data.totalImpressions : 0;

    // Update context-specific metrics
    this.updateContextMetrics(data.byDeviceType, event.context.deviceType, event);
    this.updateContextMetrics(data.byLocation, event.context.location, event);
    this.updateContextMetrics(data.byConnectionSpeed, event.context.connectionSpeed, event);
    this.updateContextMetrics(data.byPlayerType, event.context.playerType, event);

    // Save to storage
    this.saveToStorage();
  }

  /**
   * Update context-specific metrics
   */
  private updateContextMetrics(
    contextMap: Record<string, ContextMetrics>,
    contextValue: string,
    event: CreativeEvent
  ): void {
    if (!contextMap[contextValue]) {
      contextMap[contextValue] = {
        impressions: 0,
        errors: 0,
        errorRate: 0,
        errorTypes: {}
      };
    }

    const metrics = contextMap[contextValue];

    if (event.eventType === 'impression') {
      metrics.impressions++;
    } else if (event.eventType === 'error') {
      metrics.errors++;

      if (event.errorType) {
        metrics.errorTypes[event.errorType] = (metrics.errorTypes[event.errorType] || 0) + 1;
      }
    }

    metrics.errorRate = metrics.impressions > 0 ? metrics.errors / metrics.impressions : 0;
  }

  // --------------------------------------------------------------------------
  // CREATIVE BLOCKING
  // --------------------------------------------------------------------------

  /**
   * Check if creative should be blocked
   */
  private checkForBlocking(creativeId: string): void {
    const data = Array.from(this.creativeData.values()).find(d => d.creativeId === creativeId);
    if (!data || data.isBlocked) return;

    let shouldBlock = false;
    let blockReason = '';

    // High error rate with minimal impressions
    if (
      data.errorRate >= this.ERROR_RATE_THRESHOLD_HIGH &&
      data.totalImpressions >= this.MIN_IMPRESSIONS_FOR_BLOCKING
    ) {
      shouldBlock = true;
      blockReason = `Critical error rate: ${(data.errorRate * 100).toFixed(1)}% (${data.totalErrors}/${data.totalImpressions})`;
    }

    // Medium error rate with more impressions
    if (
      data.errorRate >= this.ERROR_RATE_THRESHOLD_MEDIUM &&
      data.totalImpressions >= this.IMPRESSIONS_BEFORE_MEDIUM_BLOCK
    ) {
      shouldBlock = true;
      blockReason = `High error rate: ${(data.errorRate * 100).toFixed(1)}% (${data.totalErrors}/${data.totalImpressions})`;
    }

    if (shouldBlock) {
      this.blockCreative(data, blockReason);
    }
  }

  /**
   * Block a creative
   */
  private blockCreative(data: CreativePerformance, blockReason: string): void {
    const key = this.getCreativeKey(data.creativeId, data.ssp);

    // Update data
    data.isBlocked = true;
    data.blockReason = blockReason;
    data.blockedAt = Date.now();

    // Add to blocked list
    const blocked: BlockedCreative = {
      creativeId: data.creativeId,
      ssp: data.ssp,
      errorRate: data.errorRate,
      totalImpressions: data.totalImpressions,
      totalErrors: data.totalErrors,
      blockReason,
      blockedAt: Date.now(),
      autoUnblockAt: Date.now() + (24 * 60 * 60 * 1000) // Test unblock after 24 hours
    };

    this.blockedCreatives.set(key, blocked);

    console.warn(`[CreativeQuality] BLOCKED: ${data.creativeId} from ${data.ssp} - ${blockReason}`);

    // Send notification to SSP
    this.notifySSP(data, blockReason);

    this.saveToStorage();
  }

  /**
   * Manually unblock a creative
   */
  unblockCreative(creativeId: string, ssp: string): void {
    const key = this.getCreativeKey(creativeId, ssp);
    const data = this.creativeData.get(key);

    if (data && data.isBlocked) {
      data.isBlocked = false;
      delete data.blockReason;
      delete data.blockedAt;

      this.blockedCreatives.delete(key);

      console.log(`[CreativeQuality] UNBLOCKED: ${creativeId} from ${ssp}`);

      this.saveToStorage();
    }
  }

  /**
   * Check if creative is blocked
   */
  isCreativeBlocked(creativeId: string, ssp: string): boolean {
    const key = this.getCreativeKey(creativeId, ssp);
    return this.blockedCreatives.has(key);
  }

  /**
   * Get blocked reason
   */
  getBlockReason(creativeId: string, ssp: string): string | null {
    const key = this.getCreativeKey(creativeId, ssp);
    const blocked = this.blockedCreatives.get(key);
    return blocked?.blockReason || null;
  }

  /**
   * Auto-unblock creatives for testing
   */
  private startAutoUnblockChecking(): void {
    setInterval(() => {
      const now = Date.now();

      this.blockedCreatives.forEach((blocked, key) => {
        if (blocked.autoUnblockAt && now >= blocked.autoUnblockAt) {
          console.log(`[CreativeQuality] Auto-testing: ${blocked.creativeId} from ${blocked.ssp}`);

          // Unblock for testing
          const data = this.creativeData.get(key);
          if (data) {
            // Reset counters for test period
            data.totalImpressions = 0;
            data.totalErrors = 0;
            data.errorRate = 0;
            data.isBlocked = false;

            this.blockedCreatives.delete(key);
            this.saveToStorage();
          }
        }
      });
    }, 60000); // Check every minute
  }

  // --------------------------------------------------------------------------
  // SSP REPORTING
  // --------------------------------------------------------------------------

  /**
   * Notify SSP about blocked creative
   */
  private async notifySSP(data: CreativePerformance, blockReason: string): Promise<void> {
    try {
      await axios.post(this.reportEndpoint, {
        type: 'creative_blocked',
        creativeId: data.creativeId,
        ssp: data.ssp,
        errorRate: data.errorRate,
        totalImpressions: data.totalImpressions,
        totalErrors: data.totalErrors,
        blockReason,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('[CreativeQuality] Failed to notify SSP:', error);
    }
  }

  /**
   * Generate SSP error report
   */
  generateSSPReport(ssp: string): SSPErrorReport {
    const creatives = Array.from(this.creativeData.values())
      .filter(d => d.ssp === ssp && d.totalErrors > 0);

    const report: SSPErrorReport = {
      ssp,
      reportDate: new Date().toISOString(),
      creatives: [],
      totalCreatives: creatives.length,
      totalErrors: 0,
      avgErrorRate: 0
    };

    let totalErrorRate = 0;

    creatives.forEach(data => {
      const errorTypes = this.getErrorTypes(data);
      const topErrorType = Object.entries(errorTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

      let recommendation: 'investigate' | 'pause' | 'remove' = 'investigate';
      if (data.errorRate > 0.50) {
        recommendation = 'remove';
      } else if (data.errorRate > 0.25) {
        recommendation = 'pause';
      }

      report.creatives.push({
        creativeId: data.creativeId,
        impressions: data.totalImpressions,
        errors: data.totalErrors,
        errorRate: data.errorRate,
        errorTypes,
        topErrorType,
        recommendation
      });

      report.totalErrors += data.totalErrors;
      totalErrorRate += data.errorRate;
    });

    report.avgErrorRate = creatives.length > 0 ? totalErrorRate / creatives.length : 0;

    return report;
  }

  /**
   * Get all error types for a creative
   */
  private getErrorTypes(data: CreativePerformance): Record<string, number> {
    const errorTypes: Record<string, number> = {};

    Object.values(data.byDeviceType).forEach(metrics => {
      Object.entries(metrics.errorTypes).forEach(([type, count]) => {
        errorTypes[type] = (errorTypes[type] || 0) + count;
      });
    });

    return errorTypes;
  }

  /**
   * Send periodic reports to SSPs
   */
  async sendPeriodicReports(): Promise<void> {
    const ssps = new Set(Array.from(this.creativeData.values()).map(d => d.ssp));

    for (const ssp of ssps) {
      const report = this.generateSSPReport(ssp);

      if (report.creatives.length > 0) {
        try {
          await axios.post(this.reportEndpoint, {
            type: 'periodic_report',
            report
          });

          console.log(`[CreativeQuality] Sent report to ${ssp}: ${report.creatives.length} creatives with errors`);
        } catch (error) {
          console.error(`[CreativeQuality] Failed to send report to ${ssp}:`, error);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // ANALYTICS
  // --------------------------------------------------------------------------

  /**
   * Get creative performance data
   */
  getCreativePerformance(creativeId: string, ssp: string): CreativePerformance | null {
    const key = this.getCreativeKey(creativeId, ssp);
    return this.creativeData.get(key) || null;
  }

  /**
   * Get all blocked creatives
   */
  getBlockedCreatives(): BlockedCreative[] {
    return Array.from(this.blockedCreatives.values());
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): {
    totalCreatives: number;
    totalImpressions: number;
    totalErrors: number;
    avgErrorRate: number;
    blockedCount: number;
    topErrorTypes: Array<{ type: string; count: number }>;
  } {
    const allData = Array.from(this.creativeData.values());

    const totalImpressions = allData.reduce((sum, d) => sum + d.totalImpressions, 0);
    const totalErrors = allData.reduce((sum, d) => sum + d.totalErrors, 0);
    const avgErrorRate = totalImpressions > 0 ? totalErrors / totalImpressions : 0;

    // Aggregate error types
    const errorTypeMap: Record<string, number> = {};
    allData.forEach(data => {
      const types = this.getErrorTypes(data);
      Object.entries(types).forEach(([type, count]) => {
        errorTypeMap[type] = (errorTypeMap[type] || 0) + count;
      });
    });

    const topErrorTypes = Object.entries(errorTypeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      totalCreatives: allData.length,
      totalImpressions,
      totalErrors,
      avgErrorRate,
      blockedCount: this.blockedCreatives.size,
      topErrorTypes
    };
  }

  // --------------------------------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------------------------------

  private startBufferFlushing(): void {
    setInterval(() => {
      this.flushBuffer();
    }, this.bufferFlushInterval);
  }

  private flushBuffer(): void {
    if (this.eventBuffer.length === 0) return;

    // In production, send to backend/analytics service
    console.log(`[CreativeQuality] Flushing ${this.eventBuffer.length} events`);

    this.eventBuffer = [];
  }

  private loadFromStorage(): void {
    try {
      const dataStr = localStorage.getItem('creativeQualityData');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        this.creativeData = new Map(Object.entries(data.creativeData || {}));
        this.blockedCreatives = new Map(Object.entries(data.blockedCreatives || {}));
      }
    } catch (error) {
      console.error('[CreativeQuality] Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        creativeData: Object.fromEntries(this.creativeData),
        blockedCreatives: Object.fromEntries(this.blockedCreatives)
      };
      localStorage.setItem('creativeQualityData', JSON.stringify(data));
    } catch (error) {
      console.error('[CreativeQuality] Failed to save to storage:', error);
    }
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  private getCreativeKey(creativeId: string, ssp: string): string {
    return `${ssp}:${creativeId}`;
  }

  /**
   * Clear all data (use with caution)
   */
  clearAllData(): void {
    this.creativeData.clear();
    this.blockedCreatives.clear();
    this.eventBuffer = [];
    this.saveToStorage();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let trackerInstance: CreativeQualityTracker | null = null;

export function getCreativeQualityTracker(config?: any): CreativeQualityTracker {
  if (!trackerInstance) {
    trackerInstance = new CreativeQualityTracker(config);
  }
  return trackerInstance;
}

export function resetCreativeQualityTracker(): void {
  trackerInstance = null;
}
