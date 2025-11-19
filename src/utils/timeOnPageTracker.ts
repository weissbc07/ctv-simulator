/**
 * Time on Page Tracker for Outstream Video Ads
 *
 * Tracks user engagement time on specific URLs by device type
 * to power the Dynamic Ad Duration Optimizer.
 *
 * Features:
 * - Accurate time tracking with visibility API
 * - Per-URL tracking with device segmentation
 * - Automatic data submission to optimizer
 * - Session storage for pending data
 * - Handles page visibility changes and unload events
 */

import { getDurationOptimizer } from './dynamicAdDurationOptimizer';

export class TimeOnPageTracker {
  private startTime: number;
  private activeTime: number;
  private isVisible: boolean;
  private url: string;
  private deviceType: 'desktop' | 'mobile' | 'tablet';
  private visibilityChangeHandler: () => void;
  private beforeUnloadHandler: () => void;
  private intervalId: NodeJS.Timeout | null;

  constructor() {
    this.startTime = Date.now();
    this.activeTime = 0;
    this.isVisible = !document.hidden;
    this.url = window.location.href;
    this.deviceType = this.detectDeviceType();
    this.intervalId = null;

    // Bind handlers
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.beforeUnloadHandler = this.handleBeforeUnload.bind(this);

    // Set up event listeners
    this.setupEventListeners();

    // Start tracking
    this.startTracking();
  }

  // --------------------------------------------------------------------------
  // CORE TRACKING METHODS
  // --------------------------------------------------------------------------

  private startTracking(): void {
    // Update active time every second when page is visible
    this.intervalId = setInterval(() => {
      if (this.isVisible) {
        this.activeTime++;
      }
    }, 1000);
  }

  private stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get current time spent on page (in seconds)
   */
  getTimeSpent(): number {
    return this.activeTime;
  }

  /**
   * Submit time on page data to optimizer
   */
  submitData(): void {
    const timeSpent = this.getTimeSpent();

    // Only submit if user spent at least 3 seconds
    if (timeSpent < 3) {
      return;
    }

    try {
      const optimizer = getDurationOptimizer();
      optimizer.recordTimeOnPage(this.url, this.deviceType, timeSpent);

      console.log(`[TimeOnPage] Recorded: ${timeSpent}s on ${this.url} (${this.deviceType})`);
    } catch (error) {
      console.error('[TimeOnPage] Failed to submit data:', error);
    }
  }

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  private handleVisibilityChange(): void {
    this.isVisible = !document.hidden;

    if (!this.isVisible) {
      // Page is hidden - stop tracking
      console.log('[TimeOnPage] Page hidden at', this.activeTime, 'seconds');
    } else {
      // Page is visible again
      console.log('[TimeOnPage] Page visible again');
    }
  }

  private handleBeforeUnload(): void {
    // Submit data when user leaves page
    this.submitData();
    this.stopTracking();
  }

  // --------------------------------------------------------------------------
  // SETUP
  // --------------------------------------------------------------------------

  private setupEventListeners(): void {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Listen for page unload
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Also submit periodically (every 30 seconds) in case of crashes
    setInterval(() => {
      this.submitData();
    }, 30000);
  }

  private removeEventListeners(): void {
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  /**
   * Detect device type from user agent and screen size
   */
  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    // Check for tablet
    if (
      (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) ||
      (width >= 768 && width <= 1024)
    ) {
      return 'tablet';
    }

    // Check for mobile
    if (
      ua.includes('mobile') ||
      ua.includes('iphone') ||
      ua.includes('android') ||
      width < 768
    ) {
      return 'mobile';
    }

    // Desktop
    return 'desktop';
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  destroy(): void {
    this.submitData();
    this.stopTracking();
    this.removeEventListeners();
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  getUrl(): string {
    return this.url;
  }

  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    return this.deviceType;
  }

  isActive(): boolean {
    return this.isVisible && this.intervalId !== null;
  }
}

// ============================================================================
// GLOBAL TRACKER INSTANCE
// ============================================================================

let globalTracker: TimeOnPageTracker | null = null;

/**
 * Initialize global time on page tracker
 * Call this once when your page loads
 */
export function initTimeOnPageTracker(): TimeOnPageTracker {
  if (!globalTracker) {
    globalTracker = new TimeOnPageTracker();
    console.log('[TimeOnPage] Tracker initialized');
  }
  return globalTracker;
}

/**
 * Get the global tracker instance
 */
export function getTimeOnPageTracker(): TimeOnPageTracker | null {
  return globalTracker;
}

/**
 * Destroy the global tracker
 */
export function destroyTimeOnPageTracker(): void {
  if (globalTracker) {
    globalTracker.destroy();
    globalTracker = null;
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTimeOnPageTracker();
    });
  } else {
    initTimeOnPageTracker();
  }
}
