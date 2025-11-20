/**
 * Creative Quality Analytics Dashboard
 *
 * Displays creative performance metrics, error rates, and blocklist
 * to help publishers monitor ad quality and identify problematic creatives.
 */

import React, { useState, useEffect } from 'react';
import { getCreativeQualityTracker } from '../utils/creativeQualityTracker';

interface CreativeStats {
  creativeId: string;
  ssp: string;
  impressions: number;
  errors: number;
  errorRate: number;
  isBlocked: boolean;
  lastError?: string;
  deviceBreakdown: Record<string, { impressions: number; errors: number }>;
}

const CreativeQualityDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [creativeStats, setCreativeStats] = useState<CreativeStats[]>([]);
  const [selectedSSP, setSelectedSSP] = useState<string>('all');
  const [filterBlocked, setFilterBlocked] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Load analytics data
  const loadData = () => {
    const tracker = getCreativeQualityTracker();
    const data = tracker.getAnalytics();
    setAnalytics(data);

    // Build creative stats list
    const stats: CreativeStats[] = [];
    const creativeMap = (data as any).creativeMap || {};

    Object.entries(creativeMap).forEach(([key, value]: [string, any]) => {
      const [creativeId, ssp] = key.split('::');
      const errorRate = value.impressions > 0 ? value.errors / value.impressions : 0;

      // Calculate device breakdown
      const deviceBreakdown: Record<string, { impressions: number; errors: number }> = {};
      Object.entries(value.byDevice || {}).forEach(([device, deviceData]: [string, any]) => {
        deviceBreakdown[device] = {
          impressions: deviceData.impressions,
          errors: deviceData.errors
        };
      });

      stats.push({
        creativeId,
        ssp,
        impressions: value.impressions,
        errors: value.errors,
        errorRate,
        isBlocked: value.isBlocked || false,
        lastError: value.errorTypes?.[0],
        deviceBreakdown
      });
    });

    // Sort by error rate descending
    stats.sort((a, b) => b.errorRate - a.errorRate);

    setCreativeStats(stats);
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds if enabled
    const interval = autoRefresh ? setInterval(loadData, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter creatives
  const filteredStats = creativeStats.filter(stat => {
    if (selectedSSP !== 'all' && stat.ssp !== selectedSSP) return false;
    if (filterBlocked && !stat.isBlocked) return false;
    return true;
  });

  // Get unique SSPs
  const ssps = ['all', ...Array.from(new Set(creativeStats.map(s => s.ssp)))];

  if (!analytics) {
    return (
      <div className="p-6 bg-gray-900 text-white rounded-lg">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Creative Quality Monitor</h2>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Total Creatives</div>
          <div className="text-2xl font-bold">{analytics.totalCreatives}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Total Impressions</div>
          <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Total Errors</div>
          <div className="text-2xl font-bold text-red-400">{analytics.totalErrors.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Avg Error Rate</div>
          <div className="text-2xl font-bold">
            {(analytics.avgErrorRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Blocked Creatives</div>
          <div className="text-2xl font-bold text-yellow-400">{analytics.blockedCount}</div>
        </div>
      </div>

      {/* Top Error Types */}
      {analytics.topErrorTypes && analytics.topErrorTypes.length > 0 && (
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-lg font-semibold mb-3">Top Error Types</div>
          <div className="space-y-2">
            {analytics.topErrorTypes.slice(0, 5).map(([errorType, count]: [string, number]) => (
              <div key={errorType} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{errorType}</span>
                <span className="text-sm font-semibold text-red-400">{count} errors</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center bg-gray-800 p-4 rounded">
        <div>
          <label className="text-sm text-gray-400 mr-2">SSP:</label>
          <select
            value={selectedSSP}
            onChange={(e) => setSelectedSSP(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            {ssps.map(ssp => (
              <option key={ssp} value={ssp}>
                {ssp === 'all' ? 'All SSPs' : ssp}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterBlocked}
            onChange={(e) => setFilterBlocked(e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-sm">Show only blocked</span>
        </label>
        <div className="ml-auto text-sm text-gray-400">
          Showing {filteredStats.length} of {creativeStats.length} creatives
        </div>
      </div>

      {/* Creative List */}
      <div className="bg-gray-800 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm">Creative ID</th>
              <th className="px-4 py-3 text-left text-sm">SSP</th>
              <th className="px-4 py-3 text-right text-sm">Impressions</th>
              <th className="px-4 py-3 text-right text-sm">Errors</th>
              <th className="px-4 py-3 text-right text-sm">Error Rate</th>
              <th className="px-4 py-3 text-left text-sm">Status</th>
              <th className="px-4 py-3 text-left text-sm">Devices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No creatives found
                </td>
              </tr>
            ) : (
              filteredStats.map((stat) => (
                <tr
                  key={`${stat.creativeId}-${stat.ssp}`}
                  className={`hover:bg-gray-700 ${stat.isBlocked ? 'bg-red-900/20' : ''}`}
                >
                  <td className="px-4 py-3 text-sm font-mono">
                    {stat.creativeId.substring(0, 20)}...
                  </td>
                  <td className="px-4 py-3 text-sm">{stat.ssp}</td>
                  <td className="px-4 py-3 text-sm text-right">{stat.impressions}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">{stat.errors}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`font-semibold ${
                        stat.errorRate > 0.5
                          ? 'text-red-500'
                          : stat.errorRate > 0.25
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {(stat.errorRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {stat.isBlocked ? (
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                        🚫 BLOCKED
                      </span>
                    ) : stat.errorRate > 0.25 && stat.impressions >= 20 ? (
                      <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">
                        ⚠️ WARNING
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                        ✅ OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {Object.entries(stat.deviceBreakdown).map(([device, data]) => (
                        <span
                          key={device}
                          className="px-2 py-1 bg-gray-600 rounded text-xs"
                          title={`${device}: ${data.impressions} imp, ${data.errors} err`}
                        >
                          {device.substring(0, 3)}: {data.impressions}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            const tracker = getCreativeQualityTracker();
            const reports = ssps
              .filter(s => s !== 'all')
              .map(ssp => tracker.generateSSPReport(ssp));

            console.log('SSP Reports:', reports);
            alert(`Generated ${reports.length} SSP reports. Check console for details.`);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
        >
          📊 Generate SSP Reports
        </button>
        <button
          onClick={() => {
            const dataStr = JSON.stringify(analytics, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `creative-quality-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
        >
          💾 Export JSON
        </button>
      </div>
    </div>
  );
};

export default CreativeQualityDashboard;
