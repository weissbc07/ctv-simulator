import React, { useState, useEffect, useCallback } from 'react';
import { Tv, Shield, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { AdXConfig, PALConfig, CTVProvider, AdXRequest } from '../types';
import { parseVastXml, fireTrackingPixel } from '../utils/vastParser';
import { useStore } from '../store/useStore';

interface AdXConfigPanelProps {
  onConfigChange: (config: AdXConfig) => void;
  onTestRequest: (config: AdXConfig, provider: string) => void;
}

const AdXConfigPanel: React.FC<AdXConfigPanelProps> = ({ onConfigChange, onTestRequest }) => {
  const { playAdCreative, addLog } = useStore();
  const [adxConfig, setAdXConfig] = useState<AdXConfig>({
    publisherId: '22106938864',
    adUnitPath: '/22106938864,22966701315/failarmy-auth-ctv-android',
    networkCode: '22106938864',
    enablePAL: true,
    useRealGAM: true,
    contentPageUrl: 'https://failarmy.com',
    videoPosition: 'preroll',
    omidPartnerName: 'FailArmy',
    palConfig: {
      descriptionUrl: 'https://failarmy.com',
      privacyPolicy: 'https://failarmy.com/privacy-policy',
      playerType: 'ctv',
      playerName: 'FailArmy CTV Player',
      playerVersion: '1.0.0',
      videoWidth: 1920,
      videoHeight: 1080,
      videoTitle: 'FailArmy Video Content',
      videoDescription: 'FailArmy entertainment video content',
      videoDuration: 600,
      contentRating: 'PG',
      isLive: false
    }
  });

  const [selectedProvider, setSelectedProvider] = useState<string>('roku');
  const [providers, setProviders] = useState<Record<string, CTVProvider>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  useEffect(() => {
    // Load CTV providers from the correct test server port
    fetch('http://localhost:8081/api/adx/providers')
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(err => console.error('Failed to load providers:', err));
  }, []);

  useEffect(() => {
    // Call onConfigChange when config changes
    onConfigChange(adxConfig);
  }, [adxConfig, onConfigChange]);

  const handleAdXConfigChange = (field: keyof AdXConfig, value: any) => {
    setAdXConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePALConfigChange = (field: keyof PALConfig, value: any) => {
    const updatedConfig = {
      ...adxConfig,
      palConfig: {
        ...adxConfig.palConfig!,
        [field]: value
      }
    };
    setAdXConfig(updatedConfig);
    onConfigChange(updatedConfig);
  };

  const handleTestRequest = async () => {
    setIsLoading(true);
    try {
      const adRequest: AdXRequest = {
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
      };

      const response = await fetch('http://localhost:8081/api/adx/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adxConfig: adxConfig,
          adRequest: adRequest,
          ctvProvider: selectedProvider
        })
      });

      const result = await response.json();
      setLastTestResult(result);
      
      // Parse VAST and trigger ad playback if successful
      if (result.ads && result.ads.length > 0 && result.ads[0].vastXml) {
        const vastResponse = parseVastXml(result.ads[0].vastXml);
        
        if (vastResponse && vastResponse.ads.length > 0) {
          const adCreative = vastResponse.ads[0];
          
          addLog({
            level: 'success',
            message: `🎬 Ad creative ready to play: ${adCreative.title}`,
            details: {
              videoUrl: adCreative.videoUrl,
              duration: adCreative.duration,
              creativeId: result.ads[0].creativeId
            }
          });
          
          // Fire impression tracking
          adCreative.trackingEvents.impression.forEach(url => {
            fireTrackingPixel(url, 'impression');
          });
          
          // Trigger ad playback
          playAdCreative(adCreative);
          
          addLog({
            level: 'info',
            message: '▶️ Playing ad creative in video player'
          });
        } else {
          addLog({
            level: 'warning',
            message: 'Could not parse VAST XML for ad playback'
          });
        }
      }
      
      onTestRequest(adxConfig, selectedProvider);
    } catch (error) {
      console.error('Test request failed:', error);
      setLastTestResult({ error: 'Test request failed' });
      addLog({
        level: 'error',
        message: `AdX test request failed: ${error}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CTV_PROVIDER_ICONS = {
    roku: '📺',
    samsung: '📱',
    lg: '🖥️',
    firetv: '🔥',
    androidtv: '🤖',
    appletv: '🍎'
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">🎯 Enhanced Programmatic AdX + PAL</h2>
        <p className="opacity-90">
          Advanced CTV advertising with real-time bidding, device fingerprinting, and content-aware targeting
        </p>
      </div>

      {/* Enhanced Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🔧 Programmatic Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publisher ID (FailArmy Network)
            </label>
            <input
              type="text"
              value={adxConfig.publisherId}
              onChange={(e) => handleAdXConfigChange('publisherId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22106938864"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTV Provider (Device Targeting)
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(providers).map(([key, provider]) => (
                <option key={key} value={key}>
                  {provider.name} ({key})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad Unit Path (FailArmy CTV Inventory)
          </label>
          <input
            type="text"
            value={adxConfig.adUnitPath}
            onChange={(e) => handleAdXConfigChange('adUnitPath', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/22106938864,22966701315/failarmy-auth-ctv-android"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Position
            </label>
            <select
              value={adxConfig.videoPosition}
              onChange={(e) => handleAdXConfigChange('videoPosition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preroll">Pre-roll</option>
              <option value="midroll">Mid-roll</option>
              <option value="postroll">Post-roll</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={adxConfig.enablePAL}
                onChange={(e) => handleAdXConfigChange('enablePAL', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable PAL SDK</span>
            </label>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={adxConfig.useRealGAM}
                onChange={(e) => handleAdXConfigChange('useRealGAM', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enhanced Targeting</span>
            </label>
          </div>
        </div>
      </div>

      {/* Enhanced PAL Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🔒 PAL SDK & Content Context</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Title
            </label>
            <input
              type="text"
              value={adxConfig.palConfig?.videoTitle || ''}
              onChange={(e) => handlePALConfigChange('videoTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Rating
            </label>
            <select
              value={adxConfig.palConfig?.contentRating || 'PG'}
              onChange={(e) => handlePALConfigChange('contentRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="G">G - General Audiences</option>
              <option value="PG">PG - Parental Guidance</option>
              <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
              <option value="R">R - Restricted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Duration (seconds)
            </label>
            <input
              type="number"
              value={adxConfig.palConfig?.videoDuration || 600}
              onChange={(e) => handlePALConfigChange('videoDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={adxConfig.palConfig?.isLive || false}
                onChange={(e) => handlePALConfigChange('isLive', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Live Content</span>
            </label>
          </div>
        </div>
      </div>

      {/* Enhanced Test Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🚀 Programmatic Ad Testing</h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleTestRequest}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all"
          >
            {isLoading ? '🔄 Running Auction...' : '🎯 Run Programmatic Auction'}
          </button>
        </div>

        {/* Enhanced Result Display */}
        {lastTestResult && (
          <div className="space-y-4">
            {lastTestResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-red-500 text-xl mr-2">❌</span>
                  <span className="font-semibold text-red-800">
                    Test Failed
                  </span>
                </div>
                <p className="text-red-600">{lastTestResult.error}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-500 text-xl mr-2">✅</span>
                  <span className="font-semibold text-green-800">
                    Programmatic Auction Successful
                  </span>
                </div>
                
                {lastTestResult.ads && lastTestResult.ads.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                    <h4 className="font-bold text-lg">🎯 Enhanced Programmatic Ad</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Brand:</strong> {lastTestResult.ads[0].meta?.brandName || 'Unknown'}</p>
                        <p><strong>CPM:</strong> ${lastTestResult.ads[0].cpm?.toFixed(2) || '0.00'}</p>
                        <p><strong>Creative:</strong> {lastTestResult.ads[0].creative?.concept || 'Standard'}</p>
                      </div>
                      <div>
                        <p><strong>Category:</strong> {lastTestResult.ads[0].meta?.adCategory || 'General'}</p>
                        <p><strong>Device:</strong> {lastTestResult.ads[0].device?.model || 'Generic CTV'}</p>
                        <p><strong>Resolution:</strong> {lastTestResult.ads[0].device?.resolution || '1920x1080'}</p>
                      </div>
                    </div>

                    {lastTestResult.ads[0].auction && (
                      <div className="mt-3 p-3 bg-white bg-opacity-10 rounded">
                        <h5 className="font-semibold mb-2">📊 Auction Metrics</h5>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="opacity-75">Bidders</p>
                            <p className="font-bold">{lastTestResult.ads[0].auction.totalBidders}</p>
                          </div>
                          <div>
                            <p className="opacity-75">Win Rate</p>
                            <p className="font-bold">{lastTestResult.ads[0].auction.winRate?.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="opacity-75">Avg Bid</p>
                            <p className="font-bold">${lastTestResult.ads[0].auction.averageBid?.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {lastTestResult.ads[0].content && (
                      <div className="mt-3 p-3 bg-white bg-opacity-10 rounded">
                        <h5 className="font-semibold mb-2">📺 Content Context</h5>
                        <p className="text-xs"><strong>Title:</strong> {lastTestResult.ads[0].content.contextTitle}</p>
                        <p className="text-xs"><strong>Category:</strong> {lastTestResult.ads[0].content.contextCategory}</p>
                        <p className="text-xs"><strong>Keywords:</strong> {lastTestResult.ads[0].content.contextKeywords?.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdXConfigPanel; 