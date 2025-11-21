/**
 * OUTSTREAM VIDEO PLAYER CONFIGURATION PANEL
 *
 * UI for configuring outstream player settings and monetization features
 */

import React, { useState } from 'react';
import { Play, Settings, Zap, Target, Brain, Users } from 'lucide-react';
import { OutstreamPlayerConfig, OutstreamFeatures } from '../types';

interface OutstreamConfigPanelProps {
  onConfigChange: (config: OutstreamPlayerConfig) => void;
  onTestPlayer: () => void;
}

const OutstreamConfigPanel: React.FC<OutstreamConfigPanelProps> = ({
  onConfigChange,
  onTestPlayer
}) => {
  const [config, setConfig] = useState<OutstreamPlayerConfig>({
    id: 'outstream-player-1',
    autoplay: true,
    muted: true,
    sticky: true,
    stickyPosition: 'bottom-right',
    stickyOffset: { x: 20, y: 20 },
    playOnViewport: true,
    viewportThreshold: 0.5,
    pauseOnViewportExit: true,
    width: '100%',
    height: 'auto',
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

  const handleChange = (updates: Partial<OutstreamPlayerConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    onConfigChange(updated);
  };

  const handleFeatureToggle = (feature: keyof OutstreamFeatures) => {
    const updated = {
      ...config,
      features: {
        ...config.features,
        [feature]: !config.features[feature]
      }
    };
    setConfig(updated);
    onConfigChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Outstream Player Config</h3>
      </div>

      {/* Basic Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Autoplay</label>
          <input
            type="checkbox"
            checked={config.autoplay}
            onChange={(e) => handleChange({ autoplay: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Muted</label>
          <input
            type="checkbox"
            checked={config.muted}
            onChange={(e) => handleChange({ muted: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Play on Viewport</label>
          <input
            type="checkbox"
            checked={config.playOnViewport}
            onChange={(e) => handleChange({ playOnViewport: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        {config.playOnViewport && (
          <div>
            <label className="text-sm font-medium block mb-1">
              Viewport Threshold: {(config.viewportThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.viewportThreshold}
              onChange={(e) => handleChange({ viewportThreshold: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Pause on Exit</label>
          <input
            type="checkbox"
            checked={config.pauseOnViewportExit}
            onChange={(e) => handleChange({ pauseOnViewportExit: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
      </div>

      {/* Sticky Settings */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold">Sticky Player</h4>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Sticky</label>
          <input
            type="checkbox"
            checked={config.sticky}
            onChange={(e) => handleChange({ sticky: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        {config.sticky && (
          <>
            <div>
              <label className="text-sm font-medium block mb-1">Position</label>
              <select
                value={config.stickyPosition}
                onChange={(e) => handleChange({ stickyPosition: e.target.value as any })}
                className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Monetization Features */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-semibold">AI Monetization Features</h4>
        </div>

        {/* Feature #1: Dynamic Ad Pods */}
        <div className="bg-gray-800 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Dynamic Ad Pods</span>
            </div>
            <input
              type="checkbox"
              checked={config.features.dynamicAdPods}
              onChange={() => handleFeatureToggle('dynamicAdPods')}
              className="w-4 h-4"
            />
          </div>
          <p className="text-xs text-gray-400">
            AI optimizes ad pod composition for maximum revenue (+35-60%)
          </p>
        </div>

        {/* Feature #2: Intelligent Timeouts */}
        <div className="bg-gray-800 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Intelligent Timeouts</span>
            </div>
            <input
              type="checkbox"
              checked={config.features.intelligentTimeouts}
              onChange={() => handleFeatureToggle('intelligentTimeouts')}
              className="w-4 h-4"
            />
          </div>
          <p className="text-xs text-gray-400">
            Per-SSP timeout optimization with predictive bidding (+20-35%)
          </p>
        </div>

        {/* Feature #3: VAST Unwrapping */}
        <div className="bg-gray-800 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">VAST Unwrapping</span>
            </div>
            <input
              type="checkbox"
              checked={config.features.vastUnwrapping}
              onChange={() => handleFeatureToggle('vastUnwrapping')}
              className="w-4 h-4"
            />
          </div>
          <p className="text-xs text-gray-400">
            Server-side unwrapping + creative quality validation (+15-30%)
          </p>
        </div>

        {/* Feature #4: Contextual AI */}
        <div className="bg-gray-800 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Contextual AI</span>
            </div>
            <input
              type="checkbox"
              checked={config.features.contextualAI}
              onChange={() => handleFeatureToggle('contextualAI')}
              className="w-4 h-4"
            />
          </div>
          <p className="text-xs text-gray-400">
            First-party data + contextual targeting for premium CPMs (+25-45%)
          </p>
        </div>

        {/* Feature #5: Engagement Optimizer */}
        <div className="bg-gray-800 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium">Engagement Optimizer</span>
            </div>
            <input
              type="checkbox"
              checked={config.features.engagementOptimizer}
              onChange={() => handleFeatureToggle('engagementOptimizer')}
              className="w-4 h-4"
            />
          </div>
          <p className="text-xs text-gray-400">
            Predictive abandonment risk + dynamic ad load (+20-30% long-term)
          </p>
        </div>
      </div>

      {/* Test Button */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={onTestPlayer}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5" />
          Test Outstream Player
        </button>
      </div>

      {/* Revenue Impact Summary */}
      <div className="border-t border-gray-700 pt-4">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Expected Revenue Impact
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">All Features Enabled:</span>
              <span className="text-green-400 font-semibold">+50-70%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">6-Month Projection:</span>
              <span className="text-green-400 font-semibold">+85-110%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">1-Year Projection:</span>
              <span className="text-green-400 font-semibold">+120-150%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutstreamConfigPanel;
