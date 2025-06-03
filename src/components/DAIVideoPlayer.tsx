import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Settings, Maximize, AlertCircle, Clock, Eye } from 'lucide-react';
import { 
  DAIConfig, 
  DAIStreamResponse, 
  AdBreak, 
  DAIAd, 
  DAIEvent,
  HLSManifest
} from '../types';
import { daiService } from '../utils/daiService';
import { useStore } from '../store/useStore';

interface DAIVideoPlayerProps {
  streamUrl?: string;
  config?: DAIConfig;
  onAdBreakStart?: (adBreak: AdBreak) => void;
  onAdBreakEnd?: (adBreak: AdBreak) => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
}

const DAIVideoPlayer: React.FC<DAIVideoPlayerProps> = ({
  streamUrl,
  config,
  onAdBreakStart,
  onAdBreakEnd,
  onError,
  autoPlay = false,
  muted = true,
  className = ''
}) => {
  const { addLog } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 0.5);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // DAI-specific state
  const [adBreaks, setAdBreaks] = useState<AdBreak[]>([]);
  const [currentAdBreak, setCurrentAdBreak] = useState<AdBreak | null>(null);
  const [isInAdBreak, setIsInAdBreak] = useState(false);
  const [currentAd, setCurrentAd] = useState<DAIAd | null>(null);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [manifest, setManifest] = useState<HLSManifest | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  
  // Player state
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferHealth, setBufferHealth] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (streamUrl && videoRef.current) {
      loadStream(streamUrl);
    }
  }, [streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      
      // Check for ad breaks
      checkAdBreaks(current);
      
      // Update ad countdown if in ad break
      if (isInAdBreak && currentAdBreak) {
        const timeInAdBreak = current - currentAdBreak.startTime;
        const remaining = Math.max(0, currentAdBreak.duration - timeInAdBreak);
        setAdTimeRemaining(remaining);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      setPlayerReady(true);
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLVideoElement).error;
      const errorMessage = error ? `Video error: ${error.message}` : 'Unknown video error';
      setStreamError(errorMessage);
      onError?.(errorMessage);
      
      addLog({
        level: 'error',
        message: `DAI video player error: ${errorMessage}`
      });
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    // Event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isInAdBreak, currentAdBreak]);

  const loadStream = async (url: string) => {
    try {
      setStreamError(null);
      setPlayerReady(false);
      
      addLog({
        level: 'info',
        message: `🎬 Loading DAI stream: ${url}`
      });

      // Parse manifest if HLS
      if (url.includes('.m3u8')) {
        try {
          const parsedManifest = await daiService.parseHLSManifest(url);
          setManifest(parsedManifest);
          setAdBreaks(parsedManifest.adBreaks?.map((hlsAdBreak, index) => ({
            id: `adbreak_${index}`,
            startTime: hlsAdBreak.startTime,
            duration: hlsAdBreak.duration,
            adCount: hlsAdBreak.adCount,
            type: hlsAdBreak.startTime === 0 ? 'preroll' : 'midroll'
          })) || []);

          addLog({
            level: 'success',
            message: `📋 HLS manifest parsed: ${parsedManifest.segments.length} segments, ${parsedManifest.adBreaks?.length || 0} ad breaks`
          });
        } catch (error) {
          console.warn('Could not parse manifest:', error);
          addLog({
            level: 'warning',
            message: `⚠️ Could not parse HLS manifest: ${error}`
          });
        }
      }

      // Set video source
      if (videoRef.current) {
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support
          videoRef.current.src = url;
        } else if (url.includes('.m3u8')) {
          // HLS.js fallback for browsers without native support
          await loadHLSJS(url);
        } else {
          videoRef.current.src = url;
        }

        if (autoPlay) {
          videoRef.current.play().catch(error => {
            console.warn('Autoplay failed:', error);
            addLog({
              level: 'warning',
              message: 'Autoplay blocked by browser policy'
            });
          });
        }
      }

    } catch (error) {
      const errorMessage = `Failed to load DAI stream: ${error}`;
      setStreamError(errorMessage);
      onError?.(errorMessage);
      
      addLog({
        level: 'error',
        message: errorMessage
      });
    }
  };

  const loadHLSJS = async (url: string) => {
    // Dynamic import of HLS.js for browsers that need it
    try {
      const Hls = (await import('hls.js')).default;
      
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
          addLog({
            level: 'success',
            message: `🎥 HLS.js loaded: ${data.levels.length} quality levels`
          });
          
          const qualities = data.levels.map((level: any, _index: number) => 
            `${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`
          );
          setQualityLevels(['auto', ...qualities]);
        });

        hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
          if (data.fatal) {
            const errorMessage = `HLS.js fatal error: ${data.type} - ${data.details}`;
            setStreamError(errorMessage);
            onError?.(errorMessage);
            
            addLog({
              level: 'error',
              message: errorMessage
            });
          }
        });
      }
    } catch (error) {
      console.warn('HLS.js not available:', error);
      // Fallback to direct video src
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const checkAdBreaks = (currentTime: number) => {
    // Check if we're entering an ad break
    const adBreak = adBreaks.find(ab => 
      currentTime >= ab.startTime && 
      currentTime < ab.startTime + ab.duration &&
      !isInAdBreak
    );

    if (adBreak && !isInAdBreak) {
      setIsInAdBreak(true);
      setCurrentAdBreak(adBreak);
      setCurrentAd(adBreak.ads?.[0] || null);
      setAdTimeRemaining(adBreak.duration);
      
      onAdBreakStart?.(adBreak);
      
      addLog({
        level: 'info',
        message: `📺 Ad break started: ${adBreak.type} (${adBreak.duration}s)`
      });
    }

    // Check if we're exiting an ad break
    if (isInAdBreak && currentAdBreak && 
        (currentTime < currentAdBreak.startTime || 
         currentTime >= currentAdBreak.startTime + currentAdBreak.duration)) {
      setIsInAdBreak(false);
      setAdTimeRemaining(0);
      
      onAdBreakEnd?.(currentAdBreak);
      
      addLog({
        level: 'info',
        message: `✅ Ad break ended: ${currentAdBreak.type}`
      });
      
      setCurrentAdBreak(null);
      setCurrentAd(null);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        addLog({
          level: 'warning',
          message: `Play failed: ${error.message}`
        });
      });
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    
    // Prevent seeking during ad breaks
    if (isInAdBreak) {
      addLog({
        level: 'warning',
        message: 'Seeking disabled during ad break'
      });
      return;
    }
    
    videoRef.current.currentTime = time;
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hideControlsTemporarily = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    setShowControls(true);
    
    if (isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={hideControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handlePlayPause}
      />

      {/* Canvas for overlays */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Buffering...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {streamError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <h3 className="text-white text-lg font-semibold">Stream Error</h3>
            <p className="text-gray-300 max-w-md">{streamError}</p>
            <button
              onClick={() => streamUrl && loadStream(streamUrl)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Ad Break Overlay */}
      {isInAdBreak && currentAdBreak && (
        <div className="absolute top-4 left-4 bg-yellow-600 text-black px-3 py-2 rounded-lg flex items-center gap-2 font-semibold">
          <Eye className="w-4 h-4" />
          <span>AD</span>
          {adTimeRemaining > 0 && (
            <>
              <Clock className="w-4 h-4" />
              <span>{Math.ceil(adTimeRemaining)}s</span>
            </>
          )}
        </div>
      )}

      {/* Ad Information */}
      {currentAd && isInAdBreak && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg max-w-xs">
          <div className="text-sm">
            <div className="font-semibold">{currentAd.title}</div>
            {currentAd.advertiser && (
              <div className="text-gray-300">{currentAd.advertiser}</div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/75 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative h-2 bg-gray-600 rounded-full cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const percent = (e.clientX - rect.left) / rect.width;
                   handleSeek(percent * duration);
                 }}>
              <div 
                className="absolute h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              
              {/* Ad Break Markers */}
              {adBreaks.map((adBreak) => (
                <div
                  key={adBreak.id}
                  className="absolute top-0 w-1 h-full bg-yellow-400"
                  style={{ left: `${(adBreak.startTime / duration) * 100}%` }}
                  title={`${adBreak.type} ad break`}
                />
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded-full"
                disabled={isInAdBreak}
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-3 hover:bg-white/20 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded-full"
                disabled={isInAdBreak}
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleMuteToggle}
                  className="p-2 hover:bg-white/20 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
              </div>
              
              <div className="text-white text-sm ml-4">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {qualityLevels.length > 1 && (
                <select
                  value={currentQuality}
                  onChange={(e) => setCurrentQuality(e.target.value)}
                  className="bg-black/50 text-white rounded px-2 py-1 text-sm"
                >
                  {qualityLevels.map((quality) => (
                    <option key={quality} value={quality}>
                      {quality}
                    </option>
                  ))}
                </select>
              )}
              
              <button
                onClick={handleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Info Overlay */}
      {manifest && (
        <div className="absolute top-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
          {manifest.segments.length} segments | {adBreaks.length} ad breaks
        </div>
      )}
    </div>
  );
};

export default DAIVideoPlayer; 