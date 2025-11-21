import { useState, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ConfigPanel from './components/ConfigPanel';
import AdXConfigPanel from './components/AdXConfigPanel';
import DAIConfigPanel from './components/DAIConfigPanel';
import AdPodOptimizerConfigPanel from './components/AdPodOptimizerConfigPanel';
import DAIVideoPlayer from './components/DAIVideoPlayer';
import OutstreamConfigPanel from './components/OutstreamConfigPanel';
import OutstreamVideoPlayer from './components/OutstreamVideoPlayer';
import OutstreamAnalyticsDashboard from './components/OutstreamAnalyticsDashboard';
import LogPanel from './components/LogPanel';
import { useStore } from './store/useStore';
import { Tv, Activity, Shield, Settings, Video, Play } from 'lucide-react';
import { AdXConfig, DAIConfig, DAIStreamRequest, OutstreamPlayerConfig, OutstreamAnalytics, OutstreamEvent } from './types';

function App() {
  const { isPlaying, currentTime, duration, addLog, currentAd, isPlayingAd } = useStore();
  const [activeTab, setActiveTab] = useState<'config' | 'adx' | 'dai' | 'outstream'>('config');
  const [adxConfig, setAdxConfig] = useState<AdXConfig | null>(null);
  const [daiConfig, setDaiConfig] = useState<DAIConfig | null>(null);
  const [daiStreamUrl, setDaiStreamUrl] = useState<string | null>(null);
  const [outstreamConfig, setOutstreamConfig] = useState<OutstreamPlayerConfig>({
    id: 'outstream-player-1',
    autoplay: true,
    muted: true,
    sticky: true,
    stickyPosition: 'bottom-right',
    stickyOffset: { x: 20, y: 20 },
    playOnViewport: true,
    viewportThreshold: 0.5,
    pauseOnViewportExit: true,
    width: '640px',
    height: '360px',
    aspectRatio: '16/9',
    enableOptimizations: true,
    features: {
      dynamicAdPods: true,
      intelligentTimeouts: true,
      vastUnwrapping: true,
      contextualAI: true,
      engagementOptimizer: true
    },
    trackingEnabled: true
  });
  const [outstreamAnalytics, setOutstreamAnalytics] = useState<OutstreamAnalytics | null>(null);
  const [showOutstreamPlayer, setShowOutstreamPlayer] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdXConfigChange = useCallback((config: AdXConfig) => {
    setAdxConfig(config);
    addLog({
      level: 'info',
      message: 'Google AdX configuration updated',
      details: {
        publisherId: config.publisherId,
        adUnitPath: config.adUnitPath,
        palEnabled: config.enablePAL
      }
    });
  }, [addLog]);

  const handleAdXTestRequest = useCallback((config: AdXConfig, provider: string) => {
    addLog({
      level: 'info',
      message: `AdX test request sent for ${provider}`,
      details: {
        publisherId: config.publisherId,
        adUnitPath: config.adUnitPath,
        provider: provider,
        palEnabled: config.enablePAL
      }
    });
  }, [addLog]);

  const handleDAIConfigChange = useCallback((config: DAIConfig) => {
    setDaiConfig(config);
    addLog({
      level: 'info',
      message: '🎬 DAI configuration updated',
      details: {
        enabled: config.enabled,
        streamFormat: config.streamFormat,
        contentSourceId: config.contentSourceId,
        authKeysCount: config.authKeys.length
      }
    });
  }, [addLog]);

  const handleDAIStreamRequest = useCallback((request: DAIStreamRequest) => {
    // For demo purposes, generate a mock stream URL
    const mockStreamUrl = `http://localhost:8081/api/dai/stitch?streamUrl=${encodeURIComponent('https://demo-ctv-content.com/sample.m3u8')}&format=${request.format}`;
    setDaiStreamUrl(mockStreamUrl);

    addLog({
      level: 'success',
      message: '🚀 DAI stream request initiated',
      details: {
        contentSourceId: request.contentSourceId,
        videoId: request.videoId,
        format: request.format,
        streamUrl: mockStreamUrl
      }
    });
  }, [addLog]);

  const handleOutstreamConfigChange = useCallback((config: OutstreamPlayerConfig) => {
    setOutstreamConfig(config);
    addLog({
      level: 'info',
      message: '📐 Outstream player configuration updated',
      details: {
        autoplay: config.autoplay,
        sticky: config.sticky,
        featuresEnabled: Object.entries(config.features).filter(([_, v]) => v).map(([k]) => k).join(', ')
      }
    });
  }, [addLog]);

  const handleOutstreamTest = useCallback(() => {
    setShowOutstreamPlayer(true);
    addLog({
      level: 'success',
      message: '🎬 Outstream player test started',
      details: {
        playerId: outstreamConfig.id,
        allFeaturesEnabled: Object.values(outstreamConfig.features).every(v => v)
      }
    });
  }, [addLog, outstreamConfig]);

  const handleOutstreamAnalyticsUpdate = useCallback((analytics: OutstreamAnalytics) => {
    setOutstreamAnalytics(analytics);
  }, []);

  const handleOutstreamEvent = useCallback((event: OutstreamEvent) => {
    if (event.type === 'ad_request') {
      addLog({
        level: 'info',
        message: '🎯 Outstream ad request initiated',
        details: event.data
      });
    }
  }, [addLog]);

  return (
    <div className="min-h-screen bg-ctv-dark text-white">
      {/* Header */}
      <header className="bg-ctv-gray border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Tv className="w-8 h-8 text-ctv-blue" />
              <h1 className="text-2xl font-bold">CTV Simulator</h1>
            </div>
            <div className="text-sm text-gray-400">
              UK Smart TV Ad Tech Testing & Debugging with Google AdX + PAL SDK + DAI
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Video Status */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className={`w-4 h-4 ${isPlaying ? 'text-ctv-green' : 'text-gray-400'}`} />
              <span className={isPlaying ? 'text-ctv-green' : 'text-gray-400'}>
                {isPlayingAd && currentAd ? `🎬 Playing Ad: ${currentAd.title}` : 
                 isPlaying ? 'Playing' : 'Paused'}
              </span>
              {duration > 0 && (
                <span className="text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
              {isPlayingAd && currentAd && (
                <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                  AD
                </span>
              )}
            </div>
            
            {/* Optimizer Status */}
            {optimizerEnabled && activeTab === 'config' && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">AI Optimizer Active</span>
                <span className="text-xs bg-yellow-600 px-2 py-1 rounded">AI</span>
              </div>
            )}

            {/* AdX Status */}
            {adxConfig && activeTab !== 'dai' && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className={`w-4 h-4 ${adxConfig.enablePAL ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className="text-green-400">AdX Active</span>
                {adxConfig.enablePAL && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">PAL</span>
                )}
              </div>
            )}

            {/* DAI Status */}
            {daiConfig && activeTab === 'dai' && (
              <div className="flex items-center gap-2 text-sm">
                <Video className={`w-4 h-4 ${daiConfig.enabled ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={daiConfig.enabled ? 'text-purple-400' : 'text-gray-400'}>
                  DAI {daiConfig.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {daiConfig.enabled && daiConfig.authKeys.filter(k => k.status === 'active').length > 0 && (
                  <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                    {daiConfig.authKeys.filter(k => k.status === 'active').length} Keys
                  </span>
                )}
              </div>
            )}
            
            {/* Version */}
            <div className="text-xs text-gray-500">
              v1.1.0 - DAI
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Configuration */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 px-2 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'config'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Config
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'optimizer'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              AI Pod
            </button>
            <button
              onClick={() => setActiveTab('adx')}
              className={`flex-1 px-2 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'adx'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              AdX
            </button>
            <button
              onClick={() => setActiveTab('dai')}
              className={`flex-1 px-2 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'dai'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Video className="w-4 h-4" />
              DAI
            </button>
            <button
              onClick={() => setActiveTab('outstream')}
              className={`flex-1 px-2 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'outstream'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Play className="w-4 h-4" />
              Outstream
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'config' && <ConfigPanel />}
            {activeTab === 'optimizer' && <AdPodOptimizerConfigPanel />}
            {activeTab === 'adx' && (
              <AdXConfigPanel
                onConfigChange={handleAdXConfigChange}
                onTestRequest={handleAdXTestRequest}
              />
            )}
            {activeTab === 'dai' && (
              <DAIConfigPanel
                onConfigChange={handleDAIConfigChange}
                onStreamRequest={handleDAIStreamRequest}
              />
            )}
            {activeTab === 'outstream' && (
              <OutstreamConfigPanel
                onConfigChange={handleOutstreamConfigChange}
                onTestPlayer={handleOutstreamTest}
              />
            )}
          </div>
        </div>
        
        {/* Center - Video Player */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              {activeTab === 'outstream' ? (
                <>
                  <Play className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold">Outstream Video Player</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>•</span>
                    <span>AI-Powered Monetization</span>
                    {outstreamConfig && Object.values(outstreamConfig.features).filter(v => v).length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-purple-400">
                          {Object.values(outstreamConfig.features).filter(v => v).length} Features Active
                        </span>
                      </>
                    )}
                  </div>
                </>
              ) : activeTab === 'dai' ? (
                <>
                  <Video className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold">DAI Video Player</h2>
                  {daiConfig && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>•</span>
                      <span>Format: {daiConfig.streamFormat?.toUpperCase()}</span>
                      {daiConfig.contentSourceId && (
                        <>
                          <span>•</span>
                          <span>Source: {daiConfig.contentSourceId}</span>
                        </>
                      )}
                      {daiConfig.enabled && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400">DAI Active</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Tv className="w-5 h-5 text-ctv-blue" />
                  <h2 className="text-lg font-semibold">CTV Player</h2>
                  {adxConfig && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>•</span>
                      <span>AdX: {adxConfig.publisherId}</span>
                      {adxConfig.enablePAL && (
                        <>
                          <span>•</span>
                          <span className="text-green-400">PAL Enabled</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              {activeTab === 'outstream' ? (
                showOutstreamPlayer ? (
                  <OutstreamVideoPlayer
                    config={outstreamConfig}
                    onAnalyticsUpdate={handleOutstreamAnalyticsUpdate}
                    onEvent={handleOutstreamEvent}
                    className="h-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center space-y-4">
                      <Play className="w-16 h-16 mx-auto opacity-50" />
                      <div>
                        <p className="text-lg font-semibold mb-2">Outstream Video Player</p>
                        <p className="text-sm">Configure settings and click "Test Outstream Player" to start</p>
                      </div>
                    </div>
                  </div>
                )
              ) : activeTab === 'dai' ? (
                <DAIVideoPlayer
                  streamUrl={daiStreamUrl || undefined}
                  config={daiConfig || undefined}
                  autoPlay={false}
                  muted={true}
                  className="h-full"
                />
              ) : (
                <VideoPlayer activeTab={activeTab} adxConfig={adxConfig} />
              )}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Logs/Analytics */}
        <div className="w-96 border-l border-gray-700 p-4">
          {activeTab === 'outstream' && outstreamAnalytics ? (
            <OutstreamAnalyticsDashboard analytics={outstreamAnalytics} />
          ) : (
            <LogPanel />
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 