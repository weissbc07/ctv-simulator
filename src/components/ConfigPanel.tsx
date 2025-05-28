import React, { useState } from 'react';
import { Settings, Globe, Tv, Shield, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SSP_ENDPOINTS } from '../utils/adRequests';
import PrebidConfigPanel from './PrebidConfigPanel';

const ConfigPanel: React.FC = () => {
  const { ctvConfig, setCtvConfig } = useStore();
  const [activeTab, setActiveTab] = useState<'device' | 'geo' | 'ads' | 'prebid' | 'privacy'>('device');

  const userAgentPresets = [
    {
      name: 'Samsung Tizen',
      value: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) 85.0.4183.93/6.0 TV Safari/537.36'
    },
    {
      name: 'LG WebOS',
      value: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager'
    },
    {
      name: 'Android TV',
      value: 'Mozilla/5.0 (Linux; Android 9; SHIELD Android TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    },
    {
      name: 'Roku',
      value: 'Roku/DVP-9.10 (519.10E04111A)'
    }
  ];

  const ukIpPresets = [
    '91.245.227.10', // London
    '86.157.71.42',  // Manchester
    '94.175.232.15', // Birmingham
    '82.132.241.203' // Edinburgh
  ];

  return (
    <div className="bg-ctv-gray rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-ctv-blue" />
        <h2 className="text-lg font-semibold">CTV Configuration</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-ctv-dark rounded-lg p-1">
        {[
          { id: 'device', label: 'Device', icon: Tv },
          { id: 'geo', label: 'Geo', icon: Globe },
          { id: 'ads', label: 'Ads', icon: Settings },
          { id: 'prebid', label: 'Prebid', icon: Zap },
          { id: 'privacy', label: 'Privacy', icon: Shield }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-ctv-blue text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Device Tab */}
      {activeTab === 'device' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">User Agent</label>
            <select
              value={ctvConfig.userAgent}
              onChange={(e) => setCtvConfig({ userAgent: e.target.value })}
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              {userAgentPresets.map((preset) => (
                <option key={preset.name} value={preset.value}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Device Type</label>
            <select
              value={ctvConfig.deviceType}
              onChange={(e) => setCtvConfig({ deviceType: parseInt(e.target.value) })}
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value={1}>Mobile/Tablet</option>
              <option value={2}>Personal Computer</option>
              <option value={3}>Connected TV</option>
              <option value={4}>Phone</option>
              <option value={5}>Tablet</option>
              <option value={6}>Connected Device</option>
              <option value={7}>Set Top Box</option>
            </select>
          </div>
        </div>
      )}

      {/* Geo Tab */}
      {activeTab === 'geo' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">IP Address</label>
            <select
              value={ctvConfig.ip}
              onChange={(e) => setCtvConfig({ ip: e.target.value })}
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              {ukIpPresets.map((ip) => (
                <option key={ip} value={ip}>
                  {ip}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                value={ctvConfig.geo.country}
                onChange={(e) => setCtvConfig({ geo: { ...ctvConfig.geo, country: e.target.value } })}
                className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <input
                type="text"
                value={ctvConfig.geo.region || ''}
                onChange={(e) => setCtvConfig({ geo: { ...ctvConfig.geo, region: e.target.value } })}
                className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={ctvConfig.geo.lat || ''}
                onChange={(e) => setCtvConfig({ geo: { ...ctvConfig.geo, lat: parseFloat(e.target.value) } })}
                className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={ctvConfig.geo.lon || ''}
                onChange={(e) => setCtvConfig({ geo: { ...ctvConfig.geo, lon: parseFloat(e.target.value) } })}
                className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SSP Endpoint Presets</label>
            <select
              onChange={(e) => {
                const endpoint = SSP_ENDPOINTS.find(ep => ep.url === e.target.value);
                if (endpoint) {
                  if (endpoint.type === 'vast') {
                    setCtvConfig({ vastTag: endpoint.url, openRtbEndpoint: '' });
                  } else {
                    setCtvConfig({ openRtbEndpoint: endpoint.url, vastTag: '' });
                  }
                }
              }}
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select SSP Endpoint...</option>
              {SSP_ENDPOINTS.map((endpoint) => (
                <option key={endpoint.name} value={endpoint.url}>
                  {endpoint.name} ({endpoint.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">VAST Tag URL</label>
            <input
              type="url"
              value={ctvConfig.vastTag || ''}
              onChange={(e) => setCtvConfig({ vastTag: e.target.value, openRtbEndpoint: '' })}
              placeholder="https://example.com/vast"
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="text-center text-gray-400 text-sm">OR</div>

          <div>
            <label className="block text-sm font-medium mb-2">OpenRTB Endpoint</label>
            <input
              type="url"
              value={ctvConfig.openRtbEndpoint || ''}
              onChange={(e) => setCtvConfig({ openRtbEndpoint: e.target.value, vastTag: '' })}
              placeholder="https://example.com/openrtb"
              className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Prebid Tab */}
      {activeTab === 'prebid' && (
        <PrebidConfigPanel />
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">GDPR Consent</label>
            <button
              onClick={() => setCtvConfig({ gdprConsent: !ctvConfig.gdprConsent })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                ctvConfig.gdprConsent ? 'bg-ctv-blue' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  ctvConfig.gdprConsent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {ctvConfig.gdprConsent && (
            <div>
              <label className="block text-sm font-medium mb-2">TCF Consent String</label>
              <input
                type="text"
                value={ctvConfig.tcfString || ''}
                onChange={(e) => setCtvConfig({ tcfString: e.target.value })}
                placeholder="CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA"
                className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigPanel; 