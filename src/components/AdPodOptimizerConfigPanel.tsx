/**
 * Ad Pod Optimizer Configuration Panel
 *
 * UI component for configuring the Dynamic Ad Pod Optimizer:
 * - Enable/disable optimizer
 * - Configure revenue targets
 * - Manage demand sources
 * - View performance analytics
 * - Monitor real-time pod results
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  DollarSign,
  Target,
  TrendingUp,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getOptimizer } from '../utils/dynamicAdPodOptimizer';
import { getPredictor } from '../utils/fillRatePredictorML';

const AdPodOptimizerConfigPanel: React.FC = () => {
  const {
    optimizerEnabled,
    setOptimizerEnabled,
    currentPodStrategy,
    lastPodResult,
    podHistory,
    clearPodHistory,
    revenueTargets,
    setRevenueTargets
  } = useStore();

  const [activeTab, setActiveTab] = useState<'config' | 'analytics' | 'history'>('config');
  const [localTargets, setLocalTargets] = useState(revenueTargets);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    setLocalTargets(revenueTargets);
  }, [revenueTargets]);

  useEffect(() => {
    // Load analytics
    const optimizer = getOptimizer();
    const predictor = getPredictor();

    const historicalPerf = optimizer.getHistoricalPerformance();
    const mlAnalytics = predictor.getAnalytics();

    setAnalytics({
      historical: historicalPerf,
      ml: mlAnalytics
    });
  }, [podHistory]);

  const handleSaveTargets = () => {
    setRevenueTargets(localTargets);
  };

  const calculateAverageRevenue = () => {
    if (podHistory.length === 0) return 0;
    const total = podHistory.reduce((sum, result) => sum + result.totalRevenue, 0);
    return total / podHistory.length;
  };

  const calculateFillRate = () => {
    if (podHistory.length === 0) return 0;
    const totalAttempted = podHistory.reduce((sum, result) => sum + result.slotsAttempted, 0);
    const totalFilled = podHistory.reduce((sum, result) => sum + result.slotsFilled, 0);
    return totalAttempted > 0 ? (totalFilled / totalAttempted) * 100 : 0;
  };

  return (
    <div className="bg-ctv-gray rounded-lg p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-ctv-blue" />
          <h2 className="text-lg font-semibold">AI Ad Pod Optimizer</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {optimizerEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={() => setOptimizerEnabled(!optimizerEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              optimizerEnabled ? 'bg-ctv-blue' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                optimizerEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-ctv-dark rounded-lg p-1">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'history', label: 'History', icon: TrendingUp }
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

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">AI-Powered Revenue Optimization</p>
                <p className="text-blue-300">
                  The Dynamic Ad Pod Optimizer uses machine learning and LLM-based strategies to
                  maximize revenue per video view by optimizing ad pod composition in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Targets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-ctv-blue" />
              <h3 className="text-md font-semibold">Revenue Targets (CPM)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Pre-roll Target CPM ($)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={localTargets.preroll}
                  onChange={(e) =>
                    setLocalTargets({ ...localTargets, preroll: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Mid-roll Target CPM ($)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={localTargets.midroll}
                  onChange={(e) =>
                    setLocalTargets({ ...localTargets, midroll: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Post-roll Target CPM ($)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={localTargets.postroll}
                  onChange={(e) =>
                    setLocalTargets({ ...localTargets, postroll: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-ctv-dark border border-gray-600 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleSaveTargets}
                className="w-full bg-ctv-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
              >
                Save Targets
              </button>
            </div>
          </div>

          {/* Current Strategy */}
          {currentPodStrategy && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-md font-semibold">Current Strategy</h3>
              </div>
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slots:</span>
                  <span className="font-medium">{currentPodStrategy.slotCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durations:</span>
                  <span className="font-medium">
                    {currentPodStrategy.durations.join('s, ')}s
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expected Revenue:</span>
                  <span className="font-medium text-green-400">
                    ${currentPodStrategy.expectedRevenue.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expected Completion:</span>
                  <span className="font-medium">
                    {(currentPodStrategy.expectedCompletionRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-xs text-gray-400 italic">{currentPodStrategy.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-ctv-blue" />
              <h3 className="text-md font-semibold">Performance Metrics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Avg Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  ${calculateAverageRevenue().toFixed(3)}
                </p>
                <p className="text-xs text-gray-500 mt-1">per pod</p>
              </div>
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Fill Rate</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {calculateFillRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">slots filled</p>
              </div>
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Total Pods</span>
                </div>
                <p className="text-2xl font-bold">{podHistory.length}</p>
                <p className="text-xs text-gray-500 mt-1">executed</p>
              </div>
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  ${podHistory.reduce((sum, r) => sum + r.totalRevenue, 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">lifetime</p>
              </div>
            </div>
          </div>

          {/* ML Analytics */}
          {analytics?.ml && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-md font-semibold">ML Model Analytics</h3>
              </div>
              <div className="bg-ctv-dark border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Training Samples:</span>
                  <span className="font-medium">{analytics.ml.totalSamples}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Fill Rate:</span>
                  <span className="font-medium">
                    {(analytics.ml.avgFillRate * 100).toFixed(1)}%
                  </span>
                </div>
                {Object.keys(analytics.ml.bySource).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Top Sources:</p>
                    {Object.entries(analytics.ml.bySource)
                      .slice(0, 3)
                      .map(([source, data]: [string, any]) => (
                        <div key={source} className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{source}</span>
                          <span className="text-gray-300">
                            {(data.fillRate * 100).toFixed(0)}% @ ${data.avgCPM.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ctv-blue" />
              <h3 className="text-md font-semibold">Pod Execution History</h3>
            </div>
            {podHistory.length > 0 && (
              <button
                onClick={clearPodHistory}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear History
              </button>
            )}
          </div>

          {podHistory.length === 0 ? (
            <div className="bg-ctv-dark border border-gray-600 rounded-lg p-8 text-center">
              <Info className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No pod execution history yet. Play a video to trigger the optimizer.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {podHistory.slice(0, 20).map((result, index) => (
                <div
                  key={index}
                  className="bg-ctv-dark border border-gray-600 rounded-lg p-4 hover:border-ctv-blue transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.slotsFilled > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm font-medium">
                        Pod #{podHistory.length - index}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                      ${result.totalRevenue.toFixed(3)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Slots:</span>
                      <span className="ml-1 font-medium">
                        {result.slotsFilled}/{result.slotsAttempted}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">{result.totalDuration}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fill:</span>
                      <span className="ml-1 font-medium">
                        {(result.completionRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {result.winningBids.length > 0 && (
                    <div className="text-xs text-gray-400 space-y-1">
                      {result.winningBids.map((bid, bidIndex) => (
                        <div key={bidIndex} className="flex justify-between">
                          <span>
                            Slot {bid.slot}: {bid.source}
                          </span>
                          <span className="text-green-400">${bid.cpm.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdPodOptimizerConfigPanel;
