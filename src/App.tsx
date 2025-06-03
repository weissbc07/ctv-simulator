import { useState, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ConfigPanel from './components/ConfigPanel';
import AdXConfigPanel from './components/AdXConfigPanel';
import LogPanel from './components/LogPanel';
import { useStore } from './store/useStore';
import { Tv, Activity, Shield, Settings } from 'lucide-react';
import { AdXConfig } from './types';

function App() {
  const { isPlaying, currentTime, duration, addLog, currentAd, isPlayingAd } = useStore();
  const [activeTab, setActiveTab] = useState<'config' | 'adx'>('config');
  const [adxConfig, setAdxConfig] = useState<AdXConfig | null>(null);

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
              UK Smart TV Ad Tech Testing & Debugging with Google AdX + PAL SDK
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
            
            {/* AdX Status */}
            {adxConfig && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className={`w-4 h-4 ${adxConfig.enablePAL ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className="text-green-400">AdX Active</span>
                {adxConfig.enablePAL && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">PAL</span>
                )}
              </div>
            )}
            
            {/* Version */}
            <div className="text-xs text-gray-500">
              v1.0.0
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
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'config'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Config
            </button>
            <button
              onClick={() => setActiveTab('adx')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'adx'
                  ? 'bg-ctv-blue text-white border-b-2 border-ctv-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              AdX + PAL
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'config' && <ConfigPanel />}
            {activeTab === 'adx' && (
              <AdXConfigPanel
                onConfigChange={handleAdXConfigChange}
                onTestRequest={handleAdXTestRequest}
              />
            )}
          </div>
        </div>
        
        {/* Center - Video Player */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              <VideoPlayer activeTab={activeTab} adxConfig={adxConfig} />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Logs */}
        <div className="w-96 border-l border-gray-700 p-4">
          <LogPanel />
        </div>
      </div>
    </div>
  );
}

export default App; 