/**
 * OUTSTREAM VIDEO PLAYER with Advanced Monetization Features
 *
 * Standalone video ad player with:
 * - Autoplay on viewport visibility
 * - Sticky/floating positioning
 * - 5 AI-powered monetization features
 * - Comprehensive analytics tracking
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  OutstreamPlayerConfig,
  OutstreamAnalytics,
  OutstreamEvent,
  UserContext,
  AdPodOpportunity,
  BidResult,
  DemandSource,
  EngagementContext
} from '../types';
import { useStore } from '../store/useStore';

// Import monetization services
import { DynamicAdPodOptimizer } from '../services/outstream/dynamicAdPodOptimizer';
import { IntelligentTimeoutManager } from '../services/outstream/intelligentTimeoutOptimizer';
import { VASTUnwrapperAndValidator } from '../services/outstream/vastUnwrapperValidator';
import { ContextualAIEngine } from '../services/outstream/contextualAIEngine';
import { EngagementOptimizer } from '../services/outstream/engagementOptimizer';

interface OutstreamVideoPlayerProps {
  config: OutstreamPlayerConfig;
  onAnalyticsUpdate?: (analytics: OutstreamAnalytics) => void;
  onEvent?: (event: OutstreamEvent) => void;
  className?: string;
}

const OutstreamVideoPlayer: React.FC<OutstreamVideoPlayerProps> = ({
  config,
  onAnalyticsUpdate,
  onEvent,
  className = ''
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [isInViewport, setIsInViewport] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [analytics, setAnalytics] = useState<OutstreamAnalytics>(initializeAnalytics(config.id));

  const { addLog } = useStore();

  // Initialize monetization services
  const adPodOptimizer = useRef(new DynamicAdPodOptimizer()).current;
  const timeoutManager = useRef(new IntelligentTimeoutManager()).current;
  const vastValidator = useRef(new VASTUnwrapperAndValidator()).current;
  const contextualAI = useRef(new ContextualAIEngine()).current;
  const engagementOptimizer = useRef(new EngagementOptimizer()).current;

  /**
   * Initialize video.js player
   */
  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false, // We'll control autoplay manually
        controls: true,
        responsive: true,
        fluid: true,
        muted: config.muted,
        preload: 'auto'
      });

      // Set up event listeners
      setupPlayerEventListeners(player);

      emitEvent({
        type: 'player_initialized',
        timestamp: new Date(),
        data: { playerId: config.id }
      });

      addLog({
        level: 'success',
        message: `🎬 Outstream player initialized: ${config.id}`
      });
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  /**
   * Setup viewport observer for autoplay
   */
  useEffect(() => {
    if (!config.playOnViewport || !containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= config.viewportThreshold;

          setIsInViewport(inView);

          if (inView) {
            emitEvent({
              type: 'viewport_enter',
              timestamp: new Date(),
              data: { intersectionRatio: entry.intersectionRatio }
            });

            handleViewportEnter();
          } else {
            emitEvent({
              type: 'viewport_exit',
              timestamp: new Date()
            });

            handleViewportExit();
          }
        });
      },
      {
        threshold: config.viewportThreshold
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [config.playOnViewport, config.viewportThreshold]);

  /**
   * Handle sticky positioning
   */
  useEffect(() => {
    if (!config.sticky) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const shouldStick = rect.top < 0 && rect.bottom > window.innerHeight;

      setIsSticky(shouldStick);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [config.sticky]);

  /**
   * Setup player event listeners
   */
  const setupPlayerEventListeners = (player: any) => {
    player.on('play', () => {
      updateAnalytics({ timePlaying: analytics.timePlaying + 1 });
      addLog({ level: 'info', message: '▶️ Outstream ad playing' });
    });

    player.on('pause', () => {
      addLog({ level: 'info', message: '⏸️ Outstream ad paused' });
    });

    player.on('ended', () => {
      updateAnalytics({
        adsCompleted: analytics.adsCompleted + 1
      });

      emitEvent({
        type: 'ad_complete',
        timestamp: new Date()
      });

      addLog({ level: 'success', message: '✅ Outstream ad completed' });
    });

    player.on('error', (error: any) => {
      emitEvent({
        type: 'ad_error',
        timestamp: new Date(),
        data: { error: error?.message }
      });

      addLog({ level: 'error', message: `❌ Player error: ${error?.message}` });
    });

    player.on('timeupdate', () => {
      // Track time in viewport
      if (isInViewport) {
        updateAnalytics({
          timeInViewport: analytics.timeInViewport + 0.25
        });
      }
    });
  };

  /**
   * Handle entering viewport
   */
  const handleViewportEnter = async () => {
    if (!playerRef.current || !config.autoplay) return;

    addLog({ level: 'info', message: '👁️ Outstream player entered viewport' });

    // Request and play ad
    await requestAndPlayAd();
  };

  /**
   * Handle exiting viewport
   */
  const handleViewportExit = () => {
    if (!playerRef.current || !config.pauseOnViewportExit) return;

    if (playerRef.current.paused() === false) {
      playerRef.current.pause();
      addLog({ level: 'info', message: '⏸️ Paused outstream ad (left viewport)' });
    }
  };

  /**
   * Request and play ad using all optimization features
   */
  const requestAndPlayAd = async () => {
    const player = playerRef.current;
    if (!player) return;

    addLog({ level: 'info', message: '🎯 Requesting outstream ad with AI optimization...' });

    updateAnalytics({ adsRequested: analytics.adsRequested + 1 });

    emitEvent({
      type: 'ad_request',
      timestamp: new Date()
    });

    try {
      // Step 1: Build user context (simulated for demo)
      const userContext: UserContext = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        sessionCount: 15,
        avgSessionDuration: 12.5,
        totalVideosWatched: 45,
        avgCompletionRate: 0.82,
        adCompletionRate: 0.75,
        estimatedLTV: 3.5
      };

      // Step 2: Check engagement optimizer (Feature #5)
      if (config.features.engagementOptimizer) {
        const engagementContext: EngagementContext = {
          sessionDuration: 8,
          videosThisSession: 2,
          adsThisSession: analytics.adsCompleted,
          lastAdCompletedRate: 1.0,
          scrollSpeed: 500,
          mouseMovement: 50,
          timeOnPage: 120,
          interactionCount: 5,
          device: 'desktop',
          connection: '4g'
        };

        const adDecision = await engagementOptimizer.shouldServeAd(
          userContext.id,
          userContext,
          engagementContext,
          { position: 'outstream', duration: 30 }
        );

        if (!adDecision.serve) {
          addLog({
            level: 'warning',
            message: `⏭️ Skipping ad: ${adDecision.reason}`,
            details: { reasoning: adDecision.reasoning }
          });
          return;
        }

        addLog({
          level: 'info',
          message: '✅ Engagement check passed',
          details: { floorAdjustment: adDecision.floorAdjustment }
        });
      }

      // Step 3: Build optimal ad pod (Feature #1)
      let adPodStrategy;
      if (config.features.dynamicAdPods) {
        const opportunity: AdPodOpportunity = {
          position: 'outstream',
          maxAdDuration: 60,
          user: userContext,
          category: 'technology',
          device: 'desktop'
        };

        adPodStrategy = await adPodOptimizer.buildOptimalAdPod(opportunity);

        addLog({
          level: 'success',
          message: '🎯 Dynamic ad pod strategy created',
          details: {
            slots: adPodStrategy.slotCount,
            expectedRevenue: `$${(adPodStrategy.expectedRevenue * 1000).toFixed(2)}/1K`,
            reasoning: adPodStrategy.reasoning
          }
        });

        updateAnalytics({ dynamicAdPodsUsed: true });
      }

      // Step 4: Get contextual targeting (Feature #4)
      if (config.features.contextualAI) {
        const targetingPackage = await contextualAI.createTargetingPackage(
          userContext.id,
          userContext,
          'video_123',
          {
            id: 'video_123',
            title: 'Tech Innovation Summit 2025',
            category: 'technology'
          }
        );

        addLog({
          level: 'success',
          message: '🎯 Contextual AI targeting created',
          details: {
            floor: `$${targetingPackage.recommendedFloor}`,
            expectedCPM: targetingPackage.expectedCPMRange,
            deals: targetingPackage.dealEligibility.join(', ') || 'none'
          }
        });

        updateAnalytics({ contextualAIUsed: true });
      }

      // Step 5: Optimize timeouts (Feature #2)
      let timeoutStrategy;
      if (config.features.intelligentTimeouts) {
        const demandSources = adPodOptimizer.getDemandSourceStats();

        timeoutStrategy = await timeoutManager.calculateOptimalTimeouts(
          demandSources,
          { device: 'desktop', connection: '4g' }
        );

        addLog({
          level: 'success',
          message: '⚡ Intelligent timeout strategy optimized',
          details: {
            strategy: timeoutStrategy.strategy,
            latency: `${timeoutStrategy.expectedLatency}ms`,
            reasoning: timeoutStrategy.reasoning
          }
        });

        updateAnalytics({ intelligentTimeoutsUsed: true });
      }

      // Step 6: Simulate bid request with timeout optimization
      const bids = await simulateBidRequest(timeoutStrategy);

      if (bids.length === 0) {
        addLog({ level: 'warning', message: '❌ No bids received' });
        return;
      }

      // Select winning bid
      const winningBid = bids.reduce((best, current) =>
        current.cpm > best.cpm ? current : best
      );

      addLog({
        level: 'success',
        message: `🏆 Winning bid: ${winningBid.ssp} at $${winningBid.cpm}`,
        details: { responseTime: `${winningBid.responseTime}ms` }
      });

      // Step 7: Unwrap and validate VAST (Feature #3)
      if (config.features.vastUnwrapping && winningBid.vastUrl) {
        const { unwrapped, quality } = await vastValidator.unwrapAndValidateVAST(
          winningBid.vastUrl,
          { timeout: 1000 }
        );

        addLog({
          level: quality.shouldServe ? 'success' : 'warning',
          message: `🔍 VAST validation: ${quality.overallScore}/100`,
          details: {
            unwrapTime: `${unwrapped.unwrapTime}ms`,
            chain: `${unwrapped.chain.length} redirects`,
            shouldServe: quality.shouldServe,
            reasoning: quality.reasoning
          }
        });

        if (!quality.shouldServe) {
          addLog({ level: 'warning', message: '⏭️ Skipping low-quality creative' });
          return;
        }

        updateAnalytics({ vastUnwrappingUsed: true });

        // Play the unwrapped VAST
        if (unwrapped.finalVAST) {
          playVAST(unwrapped.finalVAST);
        }
      } else if (winningBid.vastXml) {
        // Play directly if no unwrapping
        playDirectVAST(winningBid.vastXml);
      }

      // Update analytics
      updateAnalytics({
        adsFilled: analytics.adsFilled + 1,
        totalRevenue: analytics.totalRevenue + (winningBid.cpm / 1000),
        adsStarted: analytics.adsStarted + 1
      });

      emitEvent({
        type: 'ad_response',
        timestamp: new Date(),
        data: { ssp: winningBid.ssp, cpm: winningBid.cpm }
      });

    } catch (error: any) {
      addLog({
        level: 'error',
        message: `❌ Ad request failed: ${error.message}`
      });

      emitEvent({
        type: 'ad_error',
        timestamp: new Date(),
        data: { error: error.message }
      });
    }
  };

  /**
   * Simulate bid request (in production, this would call real SSPs)
   */
  const simulateBidRequest = async (timeoutStrategy: any): Promise<BidResult[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate mock bids
    const bids: BidResult[] = [
      {
        ssp: 'PubMatic',
        cpm: 11.5 + Math.random() * 3,
        currency: 'USD',
        vastUrl: 'https://example.com/vast/pubmatic.xml',
        responseTime: 750 + Math.random() * 200
      },
      {
        ssp: 'Amazon',
        cpm: 12.1 + Math.random() * 3,
        currency: 'USD',
        vastUrl: 'https://example.com/vast/amazon.xml',
        responseTime: 600 + Math.random() * 150
      },
      {
        ssp: 'Google AdX',
        cpm: 14.5 + Math.random() * 4,
        currency: 'USD',
        vastUrl: 'https://example.com/vast/adx.xml',
        responseTime: 800 + Math.random() * 200
      }
    ];

    return bids;
  };

  /**
   * Play VAST creative
   */
  const playVAST = (vast: any) => {
    const player = playerRef.current;
    if (!player || !vast.mediaFiles || vast.mediaFiles.length === 0) return;

    // Use first media file
    const mediaFile = vast.mediaFiles[0];

    addLog({
      level: 'info',
      message: `🎬 Loading ad: ${vast.adTitle}`,
      details: {
        duration: `${vast.duration}s`,
        bitrate: `${mediaFile.bitrate}kbps`
      }
    });

    // Use demo video
    player.src({
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'video/mp4'
    });

    player.ready(() => {
      player.play().catch((error: any) => {
        addLog({ level: 'error', message: `Failed to autoplay: ${error.message}` });
      });
    });
  };

  /**
   * Play VAST XML directly
   */
  const playDirectVAST = (vastXml: string) => {
    // In production, parse and play VAST
    // For demo, play sample video
    const player = playerRef.current;
    if (!player) return;

    player.src({
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'video/mp4'
    });

    player.ready(() => {
      player.play();
    });
  };

  /**
   * Update analytics
   */
  const updateAnalytics = (updates: Partial<OutstreamAnalytics>) => {
    const updated = { ...analytics, ...updates, lastActivity: new Date() };

    // Calculate derived metrics
    updated.fillRate = updated.adsRequested > 0
      ? updated.adsFilled / updated.adsRequested
      : 0;

    updated.completionRate = updated.adsStarted > 0
      ? updated.adsCompleted / updated.adsStarted
      : 0;

    updated.avgCPM = updated.adsFilled > 0
      ? (updated.totalRevenue / updated.adsFilled) * 1000
      : 0;

    updated.eCPM = updated.adsRequested > 0
      ? (updated.totalRevenue / updated.adsRequested) * 1000
      : 0;

    updated.viewabilityScore = updated.timePlaying > 0
      ? Math.min(100, (updated.timeInViewport / updated.timePlaying) * 100)
      : 0;

    setAnalytics(updated);

    if (onAnalyticsUpdate) {
      onAnalyticsUpdate(updated);
    }
  };

  /**
   * Emit event
   */
  const emitEvent = (event: OutstreamEvent) => {
    if (onEvent) {
      onEvent({ ...event, analytics });
    }
  };

  /**
   * Get sticky positioning styles
   */
  const getStickyStyles = (): React.CSSProperties => {
    if (!isSticky || !config.stickyPosition) return {};

    const positions: Record<string, React.CSSProperties> = {
      'top-right': {
        position: 'fixed',
        top: (config.stickyOffset?.y || 20) + 'px',
        right: (config.stickyOffset?.x || 20) + 'px',
        maxWidth: '400px',
        zIndex: 9999
      },
      'top-left': {
        position: 'fixed',
        top: (config.stickyOffset?.y || 20) + 'px',
        left: (config.stickyOffset?.x || 20) + 'px',
        maxWidth: '400px',
        zIndex: 9999
      },
      'bottom-right': {
        position: 'fixed',
        bottom: (config.stickyOffset?.y || 20) + 'px',
        right: (config.stickyOffset?.x || 20) + 'px',
        maxWidth: '400px',
        zIndex: 9999
      },
      'bottom-left': {
        position: 'fixed',
        bottom: (config.stickyOffset?.y || 20) + 'px',
        left: (config.stickyOffset?.x || 20) + 'px',
        maxWidth: '400px',
        zIndex: 9999
      }
    };

    return positions[config.stickyPosition] || {};
  };

  return (
    <div
      ref={containerRef}
      className={`outstream-video-player ${isSticky ? 'sticky' : ''} ${className}`}
      style={{
        width: config.width,
        height: config.height,
        aspectRatio: config.aspectRatio,
        ...getStickyStyles()
      }}
    >
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-xl">
        {/* Player container */}
        <div data-vjs-player>
          <div ref={videoRef} className="w-full h-full" />
        </div>

        {/* Viewport indicator (for demo) */}
        {config.playOnViewport && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isInViewport ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}>
              {isInViewport ? '👁️ In View' : '🚫 Out of View'}
            </div>
          </div>
        )}

        {/* Sticky indicator */}
        {isSticky && (
          <div className="absolute top-2 left-2 z-10">
            <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              📌 Sticky
            </div>
          </div>
        )}

        {/* Feature indicators */}
        <div className="absolute bottom-2 left-2 z-10 flex gap-1">
          {config.features.dynamicAdPods && analytics.dynamicAdPodsUsed && (
            <div className="px-1.5 py-0.5 rounded text-xs bg-purple-600 text-white" title="Dynamic Ad Pods">
              🎯
            </div>
          )}
          {config.features.intelligentTimeouts && analytics.intelligentTimeoutsUsed && (
            <div className="px-1.5 py-0.5 rounded text-xs bg-orange-600 text-white" title="Intelligent Timeouts">
              ⚡
            </div>
          )}
          {config.features.vastUnwrapping && analytics.vastUnwrappingUsed && (
            <div className="px-1.5 py-0.5 rounded text-xs bg-green-600 text-white" title="VAST Unwrapping">
              🔍
            </div>
          )}
          {config.features.contextualAI && analytics.contextualAIUsed && (
            <div className="px-1.5 py-0.5 rounded text-xs bg-blue-600 text-white" title="Contextual AI">
              🤖
            </div>
          )}
          {config.features.engagementOptimizer && analytics.engagementOptimizerUsed && (
            <div className="px-1.5 py-0.5 rounded text-xs bg-pink-600 text-white" title="Engagement Optimizer">
              📊
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Initialize analytics object
 */
function initializeAnalytics(playerId: string): OutstreamAnalytics {
  return {
    sessionId: 'session_' + Date.now(),
    playerInstanceId: playerId,
    timeInViewport: 0,
    timePlaying: 0,
    viewabilityScore: 0,
    adsRequested: 0,
    adsFilled: 0,
    adsStarted: 0,
    adsCompleted: 0,
    fillRate: 0,
    completionRate: 0,
    totalRevenue: 0,
    avgCPM: 0,
    eCPM: 0,
    avgRequestLatency: 0,
    timeoutRate: 0,
    vastErrorRate: 0,
    userInteractions: 0,
    clickThroughs: 0,
    abandonmentRate: 0,
    dynamicAdPodsUsed: false,
    intelligentTimeoutsUsed: false,
    vastUnwrappingUsed: false,
    contextualAIUsed: false,
    engagementOptimizerUsed: false,
    sessionStarted: new Date(),
    lastActivity: new Date()
  };
}

export default OutstreamVideoPlayer;
