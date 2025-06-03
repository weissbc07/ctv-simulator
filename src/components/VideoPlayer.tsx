import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useStore } from '../store/useStore';
import { makeAdRequest } from '../utils/adRequests';
import { makePrebidServerRequest } from '../utils/prebidServer';
import { parseVastXml, fireTrackingPixel, formatDuration, VastCreative } from '../utils/vastParser';
import { AdXConfig } from '../types';

interface VideoPlayerProps {
  activeTab?: 'config' | 'adx';
  adxConfig?: AdXConfig | null;
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
    setIsPlayingAd
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

  const handleAdRequest = async (adType: string) => {
    // Skip ad requests if we're already playing an ad
    if (isPlayingAd) {
      addLog({
        level: 'info',
        message: `Skipping ${adType} ad request - ad already playing`
      });
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
            const vastXml = ad.vastXml;
            
            if (vastXml) {
              const vastResponse = parseVastXml(vastXml);
              if (vastResponse && vastResponse.ads.length > 0) {
                const adCreative = vastResponse.ads[0];
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