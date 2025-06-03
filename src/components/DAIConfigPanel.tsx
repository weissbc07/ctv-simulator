import React, { useState, useEffect } from 'react';
import { Shield, Key, Play, Plus, Trash2, Download, Upload, Settings, Globe, Video, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  DAIConfig, 
  DAIAuthKey, 
  DAIStreamRequest, 
  DAIStreamResponse, 
  AdBreakConfig 
} from '../types';
import { daiService } from '../utils/daiService';
import { useStore } from '../store/useStore';

interface DAIConfigPanelProps {
  onConfigChange: (config: DAIConfig) => void;
  onStreamRequest: (request: DAIStreamRequest) => void;
}

const DAIConfigPanel: React.FC<DAIConfigPanelProps> = ({ onConfigChange, onStreamRequest }) => {
  const { addLog } = useStore();
  
  const [daiConfig, setDAIConfig] = useState<DAIConfig>({
    enabled: true,
    authKeys: [],
    streamFormat: 'hls',
    contentSourceId: 'CTV_DEMO_SOURCE',
    videoId: 'demo_video_001',
    cmsId: 'demo_cms',
    enableServerSideBeaconing: true,
    adBreakConfiguration: {
      preRoll: true,
      midRoll: {
        enabled: true,
        positions: [30, 120, 300],
        frequency: 90
      },
      postRoll: true,
      maxAdsPerBreak: 3,
      maxAdDuration: 30
    }
  });

  const [authKeys, setAuthKeys] = useState<DAIAuthKey[]>([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'api' | 'hmac'>('api');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  
  const [streamRequest, setStreamRequest] = useState<DAIStreamRequest>({
    contentSourceId: 'CTV_DEMO_SOURCE',
    videoId: 'demo_video_001',
    format: 'hls',
    adTagParameters: {
      'sz': '1920x1080',
      'iu': '/22106938864,22966701315/ctv-dai-demo',
      'env': 'vp',
      'gdfp_req': '1',
      'output': 'vast',
      'unviewed_position_start': '1',
      'url': 'https://example.com/dai-content',
      'description_url': 'https://example.com/content-description',
      'correlator': Date.now().toString()
    }
  });

  const [activeStreams, setActiveStreams] = useState<DAIStreamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastStreamResponse, setLastStreamResponse] = useState<DAIStreamResponse | null>(null);

  useEffect(() => {
    // Load existing auth keys
    const keys = daiService.getAuthKeys();
    setAuthKeys(keys);
    setDAIConfig(prev => ({ ...prev, authKeys: keys }));
  }, []);

  useEffect(() => {
    // Update config when changes are made
    onConfigChange(daiConfig);
  }, [daiConfig, onConfigChange]);

  useEffect(() => {
    // Update active streams periodically
    const interval = setInterval(() => {
      const streams = daiService.getActiveStreams();
      setActiveStreams(streams);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateAuthKey = () => {
    if (!newKeyName.trim()) {
      addLog({
        level: 'warning',
        message: 'Authentication key name is required'
      });
      return;
    }

    try {
      const authKey = daiService.createAuthKey(newKeyName, newKeyType, newKeyDescription);
      setAuthKeys(prev => [...prev, authKey]);
      setDAIConfig(prev => ({ 
        ...prev, 
        authKeys: [...prev.authKeys, authKey] 
      }));

      addLog({
        level: 'success',
        message: `DAI authentication key created: ${authKey.name}`,
        details: {
          type: authKey.type,
          keyId: authKey.id
        }
      });

      // Reset form
      setNewKeyName('');
      setNewKeyDescription('');
      setShowCreateKey(false);
    } catch (error) {
      addLog({
        level: 'error',
        message: `Failed to create authentication key: ${error}`
      });
    }
  };

  const handleDeleteAuthKey = (keyId: string) => {
    if (daiService.deleteAuthKey(keyId)) {
      setAuthKeys(prev => prev.filter(key => key.id !== keyId));
      setDAIConfig(prev => ({
        ...prev,
        authKeys: prev.authKeys.filter(key => key.id !== keyId)
      }));

      addLog({
        level: 'info',
        message: 'DAI authentication key deleted'
      });
    }
  };

  const handleToggleKeyStatus = (keyId: string) => {
    const authKey = authKeys.find(key => key.id === keyId);
    if (!authKey) return;

    const newStatus = authKey.status === 'active' ? 'inactive' : 'active';
    const updatedKey = daiService.updateAuthKey(keyId, { status: newStatus });
    
    if (updatedKey) {
      setAuthKeys(prev => prev.map(key => 
        key.id === keyId ? updatedKey : key
      ));

      addLog({
        level: 'info',
        message: `Authentication key ${newStatus}: ${authKey.name}`
      });
    }
  };

  const handleDAIConfigChange = (field: keyof DAIConfig, value: any) => {
    setDAIConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdBreakConfigChange = (field: keyof AdBreakConfig, value: any) => {
    setDAIConfig(prev => ({
      ...prev,
      adBreakConfiguration: {
        ...prev.adBreakConfiguration!,
        [field]: value
      }
    }));
  };

  const handleStreamRequestChange = (field: keyof DAIStreamRequest, value: any) => {
    setStreamRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequestDAIStream = async () => {
    setIsLoading(true);
    
    try {
      // Use active API key if available
      const activeApiKey = authKeys.find(key => key.type === 'api' && key.status === 'active');
      if (activeApiKey) {
        streamRequest.apiKey = activeApiKey.key;
      }

      // Generate HMAC token if HMAC key is available
      const activeHmacKey = authKeys.find(key => key.type === 'hmac' && key.status === 'active');
      if (activeHmacKey) {
        streamRequest.authToken = daiService.generateHMACToken(streamRequest, activeHmacKey.key);
      }

      const streamResponse = await daiService.requestDAIStream(streamRequest);
      setLastStreamResponse(streamResponse);

      addLog({
        level: 'success',
        message: '🎬 DAI stream request successful',
        details: {
          streamId: streamResponse.streamId,
          streamUrl: streamResponse.streamUrl,
          adBreaks: streamResponse.adBreaks?.length || 0
        }
      });

      onStreamRequest(streamRequest);

    } catch (error) {
      addLog({
        level: 'error',
        message: `DAI stream request failed: ${error}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addLog({
        level: 'info',
        message: `${label} copied to clipboard`
      });
    });
  };

  const exportAuthKeys = () => {
    const exportData = {
      keys: authKeys.map(key => ({
        name: key.name,
        type: key.type,
        description: key.description,
        createdAt: key.createdAt
      })),
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dai-auth-keys.json';
    link.click();
    
    URL.revokeObjectURL(url);

    addLog({
      level: 'info',
      message: 'DAI authentication keys exported'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold">Dynamic Ad Insertion (DAI)</h2>
        <div className={`px-2 py-1 rounded text-xs ${
          daiConfig.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
        }`}>
          {daiConfig.enabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* DAI Configuration */}
      <div className="bg-ctv-gray rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <h3 className="font-medium">DAI Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Enable DAI</label>
            <input
              type="checkbox"
              checked={daiConfig.enabled}
              onChange={(e) => handleDAIConfigChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stream Format</label>
            <select
              value={daiConfig.streamFormat}
              onChange={(e) => handleDAIConfigChange('streamFormat', e.target.value as 'hls' | 'dash')}
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            >
              <option value="hls">HLS (.m3u8)</option>
              <option value="dash">DASH (.mpd)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content Source ID</label>
            <input
              type="text"
              value={daiConfig.contentSourceId || ''}
              onChange={(e) => handleDAIConfigChange('contentSourceId', e.target.value)}
              placeholder="e.g., CTV_DEMO_SOURCE"
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Video ID</label>
            <input
              type="text"
              value={daiConfig.videoId || ''}
              onChange={(e) => handleDAIConfigChange('videoId', e.target.value)}
              placeholder="e.g., demo_video_001"
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CMS ID</label>
            <input
              type="text"
              value={daiConfig.cmsId || ''}
              onChange={(e) => handleDAIConfigChange('cmsId', e.target.value)}
              placeholder="e.g., demo_cms"
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Server-Side Beaconing</label>
            <input
              type="checkbox"
              checked={daiConfig.enableServerSideBeaconing}
              onChange={(e) => handleDAIConfigChange('enableServerSideBeaconing', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>

      {/* Authentication Keys Management */}
      <div className="bg-ctv-gray rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <h3 className="font-medium">Authentication Keys</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportAuthKeys}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={() => setShowCreateKey(true)}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              <Plus className="w-3 h-3" />
              Create Key
            </button>
          </div>
        </div>

        {showCreateKey && (
          <div className="bg-ctv-dark p-4 rounded border border-gray-600 space-y-3">
            <h4 className="font-medium">Create Authentication Key</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production Key"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Key Type</label>
                <select
                  value={newKeyType}
                  onChange={(e) => setNewKeyType(e.target.value as 'api' | 'hmac')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="api">API Key (Static)</option>
                  <option value="hmac">HMAC Key (Beta)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <input
                type="text"
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
                placeholder="Key description or usage notes"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateAuthKey}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                Create Key
              </button>
              <button
                onClick={() => setShowCreateKey(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Auth Keys List */}
        <div className="space-y-2">
          {authKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No authentication keys configured</p>
              <p className="text-sm">Create a key to enable DAI authentication</p>
            </div>
          ) : (
            authKeys.map((key) => (
              <div key={key.id} className="bg-ctv-dark p-3 rounded border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        key.type === 'api' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {key.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        key.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    {key.description && (
                      <p className="text-sm text-gray-400 mt-1">{key.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Created: {key.createdAt.toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <span>Last used: {key.lastUsed.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(key.key, 'Authentication key')}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                    >
                      Copy Key
                    </button>
                    <button
                      onClick={() => handleToggleKeyStatus(key.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        key.status === 'active' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {key.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAuthKey(key.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stream Request Configuration */}
      <div className="bg-ctv-gray rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-400" />
          <h3 className="font-medium">Stream Request</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content Source ID</label>
            <input
              type="text"
              value={streamRequest.contentSourceId || ''}
              onChange={(e) => handleStreamRequestChange('contentSourceId', e.target.value)}
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Video ID</label>
            <input
              type="text"
              value={streamRequest.videoId || ''}
              onChange={(e) => handleStreamRequestChange('videoId', e.target.value)}
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={streamRequest.format}
              onChange={(e) => handleStreamRequestChange('format', e.target.value)}
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            >
              <option value="hls">HLS</option>
              <option value="dash">DASH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Session ID</label>
            <input
              type="text"
              value={streamRequest.sessionId || ''}
              onChange={(e) => handleStreamRequestChange('sessionId', e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 bg-ctv-dark border border-gray-600 rounded text-white"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-600">
          <div className="text-sm text-gray-400">
            {authKeys.filter(k => k.status === 'active').length} active authentication key(s)
          </div>
          
          <button
            onClick={handleRequestDAIStream}
            disabled={isLoading || !daiConfig.enabled}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Request DAI Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Last Stream Response */}
      {lastStreamResponse && (
        <div className="bg-ctv-gray rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h3 className="font-medium">Stream Response</h3>
          </div>

          <div className="bg-ctv-dark p-3 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Stream ID:</span>
                <span className="ml-2 font-mono">{lastStreamResponse.streamId}</span>
              </div>
              <div>
                <span className="text-gray-400">Ad Breaks:</span>
                <span className="ml-2">{lastStreamResponse.adBreaks?.length || 0}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400">Stream URL:</span>
                <div className="mt-1 p-2 bg-gray-700 rounded font-mono text-xs break-all">
                  {lastStreamResponse.streamUrl}
                </div>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(lastStreamResponse.streamUrl, 'Stream URL')}
              className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Copy Stream URL
            </button>
          </div>
        </div>
      )}

      {/* Active Streams */}
      {activeStreams.length > 0 && (
        <div className="bg-ctv-gray rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="font-medium">Active Streams ({activeStreams.length})</h3>
          </div>

          <div className="space-y-2">
            {activeStreams.map((stream) => (
              <div key={stream.streamId} className="bg-ctv-dark p-3 rounded border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">{stream.streamId}</div>
                    <div className="text-xs text-gray-400">
                      {stream.adBreaks?.length || 0} ad breaks
                    </div>
                  </div>
                  <button
                    onClick={() => daiService.stopStream(stream.streamId)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                  >
                    Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DAIConfigPanel; 