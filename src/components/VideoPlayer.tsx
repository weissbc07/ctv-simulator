import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useStore } from '../store/useStore';
import { makeAdRequest } from '../utils/adRequests';
import { makePrebidServerRequest } from '../utils/prebidServer';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  const {
    ctvConfig,
    addAdRequest,
    addLog,
    setIsPlaying,
    setCurrentTime,
    setDuration
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
        
        // Set up event listeners
        player.on('play', () => {
          setIsPlaying(true);
          addLog({
            level: 'info',
            message: 'Video playback started'
          });
          
          // Trigger pre-roll ad request
          handleAdRequest('pre-roll');
        });
        
        player.on('pause', () => {
          setIsPlaying(false);
          addLog({
            level: 'info',
            message: 'Video playback paused'
          });
        });
        
        player.on('timeupdate', () => {
          const currentTime = player.currentTime() || 0;
          setCurrentTime(currentTime);
          
          // Trigger mid-roll ads at specific times
          if (Math.floor(currentTime) === 30) {
            handleAdRequest('mid-roll');
          }
        });
        
        player.on('loadedmetadata', () => {
          const duration = player.duration() || 0;
          setDuration(duration);
          addLog({
            level: 'info',
            message: `Video loaded: ${Math.floor(duration)}s duration`
          });
        });
        
        player.on('ended', () => {
          setIsPlaying(false);
          addLog({
            level: 'info',
            message: 'Video playback ended'
          });
        });
      });
    }
  }, []);

  const handleAdRequest = async (adType: string) => {
    // Check for prebid server configuration first
    if (ctvConfig.prebidServerConfig?.endpoint) {
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

    // Fallback to traditional SSP endpoints
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