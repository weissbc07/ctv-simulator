import React, { useState } from 'react';
import { Settings, ToggleLeft, ToggleRight, Edit3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PREBID_SERVER_ENDPOINTS } from '../utils/prebidServer';
import { PrebidDemandSource } from '../types';

const PrebidConfigPanel: React.FC = () => {
  const { ctvConfig, setCtvConfig } = useStore();
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [editParams, setEditParams] = useState<Record<string, any>>({});

  const updatePrebidConfig = (updates: any) => {
    setCtvConfig({
      prebidServerConfig: {
        ...ctvConfig.prebidServerConfig!,
        ...updates
      }
    });
  };

  const toggleDemandSource = (bidder: string) => {
    const updatedSources = ctvConfig.prebidServerConfig!.demandSources.map(source =>
      source.bidder === bidder ? { ...source, enabled: !source.enabled } : source
    );
    updatePrebidConfig({ demandSources: updatedSources });
  };

  const startEditing = (source: PrebidDemandSource) => {
    setEditingSource(source.bidder);
    setEditParams({ ...source.params });
  };

  const saveParams = () => {
    if (!editingSource) return;
    
    const updatedSources = ctvConfig.prebidServerConfig!.demandSources.map(source =>
      source.bidder === editingSource 
        ? { ...source, params: { ...editParams } }
        : source
    );
    updatePrebidConfig({ demandSources: updatedSources });
    setEditingSource(null);
    setEditParams({});
  };

  const cancelEditing = () => {
    setEditingSource(null);
    setEditParams({});
  };

  const resetToDefaults = (bidder: string) => {
    const updatedSources = ctvConfig.prebidServerConfig!.demandSources.map(source =>
      source.bidder === bidder 
        ? { ...source, params: { ...source.defaultValues } }
        : source
    );
    updatePrebidConfig({ demandSources: updatedSources });
  };

  if (!ctvConfig.prebidServerConfig) {
    return (
      <div className="p-4 bg-ctv-dark rounded-lg">
        <p className="text-gray-400">Prebid server configuration not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prebid Server Endpoint Configuration */}
      <div className="bg-ctv-dark rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Prebid Server Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prebid Server Endpoint</label>
            <select
              value={ctvConfig.prebidServerConfig.endpoint}
              onChange={(e) => updatePrebidConfig({ endpoint: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              {PREBID_SERVER_ENDPOINTS.map((endpoint) => (
                <option key={endpoint.name} value={endpoint.url}>
                  {endpoint.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account ID</label>
              <input
                type="text"
                value={ctvConfig.prebidServerConfig.accountId}
                onChange={(e) => updatePrebidConfig({ accountId: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
                placeholder="Account ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={ctvConfig.prebidServerConfig.timeout}
                onChange={(e) => updatePrebidConfig({ timeout: parseInt(e.target.value) || 1000 })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
                min="100"
                max="5000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Demand Sources Configuration */}
      <div className="bg-ctv-dark rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Demand Sources</h3>
        
        <div className="space-y-3">
          {ctvConfig.prebidServerConfig.demandSources.map((source) => (
            <div key={source.bidder} className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDemandSource(source.bidder)}
                    className="text-ctv-blue hover:text-blue-400"
                  >
                    {source.enabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  <div>
                    <h4 className={`font-medium ${source.enabled ? 'text-white' : 'text-gray-500'}`}>
                      {source.name}
                    </h4>
                    <p className="text-sm text-gray-400">Bidder: {source.bidder}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => resetToDefaults(source.bidder)}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => startEditing(source)}
                    className="px-3 py-1 text-xs bg-ctv-blue hover:bg-blue-600 rounded flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>

              {editingSource === source.bidder ? (
                <div className="space-y-3 border-t border-gray-600 pt-3">
                  <h5 className="text-sm font-medium">Edit Parameters</h5>
                  {Object.entries(editParams).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-400 mb-1">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setEditParams({ ...editParams, [key]: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveParams}
                      className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(source.params).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400">{key}:</span>
                      <span className="text-white font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            <strong>Enabled Sources:</strong> {ctvConfig.prebidServerConfig.demandSources.filter(s => s.enabled).length} / {ctvConfig.prebidServerConfig.demandSources.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrebidConfigPanel; 