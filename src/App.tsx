import React from 'react';
import VideoPlayer from './components/VideoPlayer';
import ConfigPanel from './components/ConfigPanel';
import LogPanel from './components/LogPanel';
import { useStore } from './store/useStore';
import { Tv, Settings, Activity } from 'lucide-react';

function App() {
  const { isPlaying, currentTime, duration } = useStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              UK Smart TV Ad Tech Testing & Debugging
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Video Status */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className={`w-4 h-4 ${isPlaying ? 'text-ctv-green' : 'text-gray-400'}`} />
              <span className={isPlaying ? 'text-ctv-green' : 'text-gray-400'}>
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
              {duration > 0 && (
                <span className="text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>
            
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
        <div className="w-80 border-r border-gray-700 p-4">
          <ConfigPanel />
        </div>
        
        {/* Center - Video Player */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Tv className="w-5 h-5 text-ctv-blue" />
              <h2 className="text-lg font-semibold">CTV Player</h2>
            </div>
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              <VideoPlayer />
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