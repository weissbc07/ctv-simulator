import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useStore } from '../store/useStore';
import { makeAdRequest } from '../utils/adRequests';
import { makePrebidServerRequest } from '../utils/prebidServer';
import { parseVastXml, fireTrackingPixel, formatDuration } from '../utils/vastParser';
import { AdXConfig } from '../types';
import { getOptimizer, AdOpportunity } from '../utils/dynamicAdPodOptimizer';
import { getCreativeQualityTracker } from '../utils/creativeQualityTracker';

interface VideoPlayerProps {
  activeTab?: 'config' | 'adx';
  adxConfig?: AdXConfig | null;
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'ctv' {
  if (typeof navigator === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;

  // Check for CTV/Smart TV
  if (
    ua.includes('tv') ||
    ua.includes('smarttv') ||
    ua.includes('googletv') ||
    ua.includes('appletv') ||
    ua.includes('roku') ||
    ua.includes('firetv')
  ) {
    return 'ctv';
  }

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

  return 'desktop';
}

/**
 * Detect connection speed (rough estimate)
 */
function detectConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  // Use Network Information API if available
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '4g') return 'fast';
      if (effectiveType === '3g') return 'medium';
      return 'slow';
    }
  }

  // Default to medium if API not available
  return 'medium';
}

/**
 * Get location (country code) - simplified version
 * In production, use geo-IP lookup or user data
 */
function getLocation(): string {
  // Default to US for now
  // In production: use geo-IP API or server-side detection
  return 'US';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ activeTab = 'config', adxConfig = null }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const originalSourceRef = useRef<any>(null);
  
  const {
    ctvConfig,
    addAdRequest,
    addLog,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    currentAd,
    setCurrentAd,
    isPlayingAd,
    setIsPlayingAd,
    optimizerEnabled,
    setCurrentPodStrategy,
    addPodResult,
    revenueTargets
  } = useStore();

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");
      
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current!.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video/mp4'
        }],
        poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
      }, () => {
        console.log('Video.js player is ready');
        
        // Store original source for restoration after ads
        originalSourceRef.current = {
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video/mp4'
        };
        
        // Set up event listeners
        player.on('play', () => {
          setIsPlaying(true);

          if (isPlayingAd && currentAd) {
            addLog({
              level: 'info',
              message: `🎬 Ad started playing: ${currentAd.title}`
            });

            // Track impression in quality tracker
            const tracker = getCreativeQualityTracker();
            const creativeId = (currentAd as any).creativeId || 'unknown';
            const ssp = (currentAd as any).ssp || 'unknown';

            tracker.trackImpression(creativeId, ssp, {
              creativeId,
              deviceType: detectDeviceType(),
              location: getLocation(),
              connectionSpeed: detectConnectionSpeed(),
              playerType: 'instream',
              ssp
            });

            // Fire start tracking
            currentAd.trackingEvents.start.forEach(url => {
              fireTrackingPixel(url, 'start');
            });
          } else {
            addLog({
              level: 'info',
              message: 'Video playback started'
            });

            // Trigger pre-roll ad request for content
            handleAdRequest('pre-roll');
          }
        });
        
        player.on('pause', () => {
          setIsPlaying(false);
          addLog({
            level: 'info',
            message: isPlayingAd ? 'Ad playback paused' : 'Video playback paused'
          });
        });
        
        player.on('timeupdate', () => {
          const currentTime = player.currentTime() || 0;
          setCurrentTime(currentTime);
          
          if (isPlayingAd && currentAd) {
            const duration = formatDuration(currentAd.duration);
            const progress = currentTime / duration;
            
            // Fire quartile tracking events
            if (progress >= 0.25 && progress < 0.5) {
              // First quartile - fire once
              if (!(player as any).firstQuartileFired) {
                currentAd.trackingEvents.firstQuartile.forEach(url => {
                  fireTrackingPixel(url, 'firstQuartile');
                });
                (player as any).firstQuartileFired = true;
              }
            } else if (progress >= 0.5 && progress < 0.75) {
              // Midpoint - fire once
              if (!(player as any).midpointFired) {
                currentAd.trackingEvents.midpoint.forEach(url => {
                  fireTrackingPixel(url, 'midpoint');
                });
                (player as any).midpointFired = true;
              }
            } else if (progress >= 0.75) {
              // Third quartile - fire once
              if (!(player as any).thirdQuartileFired) {
                currentAd.trackingEvents.thirdQuartile.forEach(url => {
                  fireTrackingPixel(url, 'thirdQuartile');
                });
                (player as any).thirdQuartileFired = true;
              }
            }
          } else {
            // Content video - trigger mid-roll ads at specific times
            if (Math.floor(currentTime) === 30) {
              handleAdRequest('mid-roll');
            }
          }
        });
        
        player.on('loadedmetadata', () => {
          const duration = player.duration() || 0;
          setDuration(duration);
          
          if (isPlayingAd && currentAd) {
            addLog({
              level: 'info',
              message: `Ad loaded: ${currentAd.title} (${currentAd.duration})`
            });
          } else {
            addLog({
              level: 'info',
              message: `Video loaded: ${Math.floor(duration)}s duration`
            });
          }
        });
        
        player.on('ended', () => {
          setIsPlaying(false);

          if (isPlayingAd && currentAd) {
            // Fire completion tracking
            currentAd.trackingEvents.complete.forEach(url => {
              fireTrackingPixel(url, 'complete');
            });

            addLog({
              level: 'success',
              message: `🎬 Ad completed: ${currentAd.title}`
            });

            // Return to content after ad
            restoreContentVideo();
          } else {
            addLog({
              level: 'info',
              message: 'Video playback ended'
            });
          }
        });

        // Track ad errors
        player.on('error', () => {
          if (isPlayingAd && currentAd) {
            const error = player.error();
            const errorMessage = error ? `${error.code}: ${error.message}` : 'Unknown error';

            addLog({
              level: 'error',
              message: `🚨 Ad playback error: ${errorMessage}`
            });

            // Track error in quality tracker
            const tracker = getCreativeQualityTracker();
            const creativeId = (currentAd as any).creativeId || 'unknown';
            const ssp = (currentAd as any).ssp || 'unknown';

            tracker.trackError(
              creativeId,
              ssp,
              {
                creativeId,
                deviceType: detectDeviceType(),
                location: getLocation(),
                connectionSpeed: detectConnectionSpeed(),
                playerType: 'instream',
                ssp
              },
              error ? `MEDIA_ERR_${error.code}` : 'UNKNOWN_ERROR',
              errorMessage
            );

            // Return to content after error
            restoreContentVideo();
          }
        });
      });
    }
  }, []);

  // Effect to handle ad playback
  useEffect(() => {
    if (currentAd && playerRef.current) {
      playAdInPlayer(currentAd);
    }
  }, [currentAd]);

  const playAdInPlayer = (ad: any) => {
    const player = playerRef.current;
    if (!player) return;

    // Reset tracking flags
    (player as any).firstQuartileFired = false;
    (player as any).midpointFired = false;
    (player as any).thirdQuartileFired = false;

    setIsPlayingAd(true);
    
    addLog({
      level: 'info',
      message: `🎬 Loading ad creative: ${ad.title}`,
      details: {
        videoUrl: ad.videoUrl,
        duration: ad.duration
      }
    });

    // Switch to ad source
    player.src({
      src: ad.videoUrl,
      type: 'video/mp4'
    });

    // Auto-play the ad
    player.ready(() => {
      player.play().catch((error: any) => {
        addLog({
          level: 'error',
          message: `Failed to play ad: ${error.message}`
        });
      });
    });
  };

  const restoreContentVideo = () => {
    const player = playerRef.current;
    if (!player || !originalSourceRef.current) return;

    setIsPlayingAd(false);
    setCurrentAd(null);

    addLog({
      level: 'info',
      message: '📺 Returning to content video'
    });

    // Restore original content
    player.src(originalSourceRef.current);

    // Auto-play content after ad
    player.ready(() => {
      player.play().catch((error: any) => {
        console.log('Content autoplay blocked:', error);
      });
    });
  };

  /**
   * Unwrap VAST and validate creative quality before serving
   * Returns null if creative should not be served
   */
  const unwrapAndValidateVAST = async (
    vastUrl: string,
    creativeId: string | undefined,
    ssp: string
  ): Promise<{ vastXml: string; creativeId: string } | null> => {
    try {
      addLog({
        level: 'info',
        message: `🔍 Server-side VAST unwrapping: ${creativeId || 'unknown'} from ${ssp}`
      });

      // Get creative context
      const context = {
        creativeId: creativeId || 'unknown',
        deviceType: detectDeviceType(),
        location: getLocation(),
        connectionSpeed: detectConnectionSpeed(),
        playerType: 'instream' as const,
        ssp
      };

      // Check if creative is already blocked
      const tracker = getCreativeQualityTracker();
      if (creativeId && tracker.isCreativeBlocked(creativeId, ssp)) {
        addLog({
          level: 'warning',
          message: `🚫 Creative ${creativeId} from ${ssp} is BLOCKED due to high error rate`
        });
        return null;
      }

      // Call server-side unwrap API
      const response = await fetch('/api/vast/unwrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vastUrl,
          creativeId,
          ssp,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`Unwrap API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error('Invalid unwrap response');
      }

      const result = data.result;

      // Check quality score
      if (result.qualityScore < 50) {
        addLog({
          level: 'warning',
          message: `⚠️ Low quality creative (score: ${result.qualityScore}/100)`,
          details: {
            issues: result.qualityIssues,
            creativeId: result.creativeId
          }
        });
      }

      // Check if creative should be served
      if (!result.shouldServe) {
        addLog({
          level: 'error',
          message: `🚫 Creative REJECTED: ${result.blockReason}`,
          details: {
            creativeId: result.creativeId,
            qualityScore: result.qualityScore,
            issues: result.qualityIssues
          }
        });
        return null;
      }

      addLog({
        level: 'success',
        message: `✅ VAST unwrapped successfully (chain depth: ${result.chain.length}, quality: ${result.qualityScore}/100)`,
        details: {
          creativeId: result.creativeId,
          duration: result.duration,
          trackingPixels: result.trackingPixels.length
        }
      });

      // Return the final VAST XML and creative ID
      return {
        vastXml: result.finalVAST?.vastXml || '',
        creativeId: result.creativeId || creativeId || 'unknown'
      };
    } catch (error) {
      addLog({
        level: 'error',
        message: `VAST unwrap error: ${error}`,
        details: { error: String(error) }
      });
      return null;
    }
  };

  const handleOptimizedAdRequest = async (adType: string) => {
    addLog({
      level: 'info',
      message: `🤖 AI Pod Optimizer: Building optimal ${adType} strategy...`
    });

    // Build ad opportunity context
    const position = adType === 'pre-roll' ? 'preroll' :
                    adType === 'mid-roll' ? 'midroll' : 'postroll';

    const opportunity: AdOpportunity = {
      position,
      videoLength: playerRef.current?.duration() || 300,
      maxAdDuration: position === 'midroll' ? 60 : 30,
      category: 'entertainment',
      device: ctvConfig.deviceType === 3 ? 'ctv' : 'desktop',
      user: {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        segments: [],
        ltv: 2.50
      }
    };

    const optimizer = getOptimizer({
      revenueTargets,
      llmEndpoint: '/api/llm/optimize-pod',
      enabled: true
    });

    try {
      // Build optimal pod strategy
      const strategy = await optimizer.buildOptimalAdPod(opportunity);
      setCurrentPodStrategy(strategy);

      addLog({
        level: 'success',
        message: `🎯 Strategy generated: ${strategy.slotCount} slot(s), expected revenue $${strategy.expectedRevenue.toFixed(3)}`,
        details: {
          slots: strategy.slotCount,
          durations: strategy.durations,
          expectedRevenue: strategy.expectedRevenue,
          reasoning: strategy.reasoning
        }
      });

      // Execute the optimized ad pod
      const result = await optimizer.executeAdPod(strategy, opportunity);
      addPodResult(result);

      addLog({
        level: 'success',
        message: `📊 Pod completed: ${result.slotsFilled}/${result.slotsAttempted} slots filled, revenue $${result.totalRevenue.toFixed(3)}`,
        details: {
          winningBids: result.winningBids,
          failedSlots: result.failedSlots
        }
      });

      // Play the first winning ad if available
      if (result.winningBids.length > 0) {
        const firstBid = result.winningBids[0];

        try {
          // Unwrap and validate VAST before serving
          const unwrapResult = await unwrapAndValidateVAST(
            firstBid.vastUrl,
            firstBid.creativeId,
            firstBid.source
          );

          if (!unwrapResult) {
            addLog({
              level: 'warning',
              message: `Creative rejected by quality check, skipping ad`
            });
            return;
          }

          const vastResponse = parseVastXml(unwrapResult.vastXml);

          if (vastResponse && vastResponse.ads.length > 0) {
            const adCreative = vastResponse.ads[0];

            // Attach metadata for tracking
            (adCreative as any).creativeId = unwrapResult.creativeId;
            (adCreative as any).ssp = firstBid.source;

            setCurrentAd(adCreative);

            addLog({
              level: 'success',
              message: `🎬 Playing optimized ${adType}: ${adCreative.title}`,
              details: {
                source: firstBid.source,
                cpm: firstBid.cpm,
                slot: firstBid.slot,
                creativeId: unwrapResult.creativeId
              }
            });
          }
        } catch (error) {
          addLog({
            level: 'error',
            message: `Failed to load VAST creative: ${error}`
          });
        }
      } else {
        addLog({
          level: 'warning',
          message: `No ads filled for ${adType} - continuing with content`
        });
      }
    } catch (error) {
      addLog({
        level: 'error',
        message: `Optimizer error: ${error}`,
        details: { error: String(error) }
      });

      // Fallback to traditional ad request
      await handleTraditionalAdRequest(adType);
    }
  };

  const handleTraditionalAdRequest = async (adType: string) => {
    // Traditional ad request logic (existing code)
    const endpoint = ctvConfig.vastTag || ctvConfig.openRtbEndpoint;

    if (!endpoint) {
      addLog({
        level: 'warning',
        message: `${adType} ad request skipped - no endpoint configured`
      });
      return;
    }

    addLog({
      level: 'info',
      message: `Triggering ${adType} ad request to ${endpoint}`
    });

    try {
      const requestType = ctvConfig.vastTag ? 'vast' : 'openrtb';
      const adRequest = await makeAdRequest(ctvConfig, endpoint, requestType);

      addAdRequest(adRequest);

      if (adRequest.status === 'success') {
        addLog({
          level: 'success',
          message: `${adType} ad request successful (${adRequest.responseTime}ms)`,
          adRequestId: adRequest.id
        });
      } else {
        addLog({
          level: 'error',
          message: `${adType} ad request failed: ${adRequest.error}`,
          adRequestId: adRequest.id
        });
      }
    } catch (error) {
      addLog({
        level: 'error',
        message: `${adType} ad request error: ${error}`
      });
    }
  };

  const handleAdRequest = async (adType: string) => {
    // Skip ad requests if we're already playing an ad
    if (isPlayingAd) {
      addLog({
        level: 'info',
        message: `Skipping ${adType} ad request - ad already playing`
      });
      return;
    }

    // Use optimizer if enabled
    if (optimizerEnabled && activeTab === 'config') {
      await handleOptimizedAdRequest(adType);
      return;
    }

    // Priority 1: Check if AdX tab is active and has configuration
    if (activeTab === 'adx' && adxConfig) {
      addLog({
        level: 'info',
        message: `🎯 Triggering ${adType} AdX request for ${adxConfig.adUnitPath}`
      });
      
      try {
        // Make AdX request to local server
        const adxEndpoint = 'http://localhost:8081/api/adx/request';
        const ctvProvider = 'androidtv'; // Default or from config
        
        const response = await fetch(adxEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: adxConfig,
            adRequest: {
              adUnitCode: adxConfig.adUnitPath,
              sizes: [[1920, 1080]],
              video: {
                playerSize: [[1920, 1080]],
                context: 'instream',
                mimes: ['video/mp4', 'video/webm'],
                protocols: [2, 3, 5, 6],
                minduration: 15,
                maxduration: 60,
                startdelay: 0,
                placement: 1,
                linearity: 1,
                skip: 1,
                skipmin: 5,
                skipafter: 15,
                playbackmethod: [1, 2],
                api: [1, 2]
              },
              gdpr: {
                consentString: 'test_consent_string',
                gdprApplies: true
              }
            },
            ctvProvider: ctvProvider
          })
        });

        if (response.ok) {
          const adxResponse = await response.json();

          if (adxResponse.ads && adxResponse.ads.length > 0) {
            const ad = adxResponse.ads[0];
            const vastUrl = ad.vastUrl;

            if (vastUrl) {
              // Unwrap and validate VAST before serving
              const unwrapResult = await unwrapAndValidateVAST(
                vastUrl,
                ad.creativeId || ad.adId,
                'Google AdX'
              );

              if (!unwrapResult) {
                addLog({
                  level: 'warning',
                  message: `AdX creative rejected by quality check, skipping ad`
                });
                return;
              }

              const vastResponse = parseVastXml(unwrapResult.vastXml);
              if (vastResponse && vastResponse.ads.length > 0) {
                const adCreative = vastResponse.ads[0];

                // Attach metadata for tracking
                (adCreative as any).creativeId = unwrapResult.creativeId;
                (adCreative as any).ssp = 'Google AdX';

                setCurrentAd(adCreative);

                addLog({
                  level: 'success',
                  message: `🎬 AdX ${adType} ad loaded: ${adCreative.title}`,
                  details: {
                    cpm: ad.cpm,
                    currency: ad.currency,
                    brand: ad.meta?.brandName,
                    creativeId: unwrapResult.creativeId
                  }
                });
              }
            } else if (ad.vastXml) {
              // Fallback: if vastXml is directly provided instead of URL
              const vastResponse = parseVastXml(ad.vastXml);
              if (vastResponse && vastResponse.ads.length > 0) {
                const adCreative = vastResponse.ads[0];

                // Attach metadata for tracking
                (adCreative as any).creativeId = ad.creativeId || ad.adId || 'unknown';
                (adCreative as any).ssp = 'Google AdX';

                setCurrentAd(adCreative);

                addLog({
                  level: 'success',
                  message: `🎬 AdX ${adType} ad loaded: ${adCreative.title}`,
                  details: {
                    cpm: ad.cpm,
                    currency: ad.currency,
                    brand: ad.meta?.brandName
                  }
                });
              }
            }
          }
        } else {
          addLog({
            level: 'error',
            message: `AdX ${adType} request failed: ${response.statusText}`
          });
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `AdX ${adType} request error: ${error}`
        });
      }
      return;
    }

    // Priority 2: Check for prebid server configuration (only if not using AdX)
    if (activeTab === 'config' && ctvConfig.prebidServerConfig?.endpoint) {
      addLog({
        level: 'info',
        message: `Triggering ${adType} prebid server request to ${ctvConfig.prebidServerConfig.endpoint}`
      });
      
      try {
        const adRequest = await makePrebidServerRequest(ctvConfig);
        addAdRequest(adRequest);
        
        if (adRequest.status === 'success') {
          addLog({
            level: 'success',
            message: `${adType} prebid server request successful (${adRequest.responseTime}ms)`,
            adRequestId: adRequest.id
          });
        } else {
          addLog({
            level: 'error',
            message: `${adType} prebid server request failed: ${adRequest.error}`,
            adRequestId: adRequest.id
          });
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `${adType} prebid server request error: ${error}`
        });
      }
      return;
    }

    // Priority 3: Fallback to traditional SSP endpoints (only if not using AdX)
    if (activeTab === 'config') {
      const endpoint = ctvConfig.vastTag || ctvConfig.openRtbEndpoint;
      
      if (!endpoint) {
        addLog({
          level: 'warning',
          message: `${adType} ad request skipped - no endpoint configured`
        });
        return;
      }
      
      addLog({
        level: 'info',
        message: `Triggering ${adType} ad request to ${endpoint}`
      });
      
      try {
        const requestType = ctvConfig.vastTag ? 'vast' : 'openrtb';
        const adRequest = await makeAdRequest(ctvConfig, endpoint, requestType);
        
        addAdRequest(adRequest);
        
        if (adRequest.status === 'success') {
          addLog({
            level: 'success',
            message: `${adType} ad request successful (${adRequest.responseTime}ms)`,
            adRequestId: adRequest.id
          });
        } else {
          addLog({
            level: 'error',
            message: `${adType} ad request failed: ${adRequest.error}`,
            adRequestId: adRequest.id
          });
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `${adType} ad request error: ${error}`
        });
      }
    }
  };

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <div data-vjs-player>
        <div ref={videoRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default VideoPlayer; 