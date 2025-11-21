/**
 * OUTSTREAM ANALYTICS DASHBOARD
 *
 * Real-time performance metrics and revenue tracking
 */

import React from 'react';
import { TrendingUp, DollarSign, Eye, Zap, Target, Activity } from 'lucide-react';
import { OutstreamAnalytics } from '../types';

interface OutstreamAnalyticsDashboardProps {
  analytics: OutstreamAnalytics;
}

const OutstreamAnalyticsDashboard: React.FC<OutstreamAnalyticsDashboardProps> = ({
  analytics
}) => {
  const formatCurrency = (value: number) => `$${value.toFixed(4)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold">Performance Analytics</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-300">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            {formatCurrency(analytics.totalRevenue)}
          </div>
        </div>

        {/* eCPM */}
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-300">eCPM</span>
          </div>
          <div className="text-xl font-bold text-purple-400">
            ${analytics.eCPM.toFixed(2)}
          </div>
        </div>

        {/* Fill Rate */}
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Fill Rate</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {formatPercent(analytics.fillRate)}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-300">Completion Rate</span>
          </div>
          <div className="text-xl font-bold text-orange-400">
            {formatPercent(analytics.completionRate)}
          </div>
        </div>
      </div>

      {/* Ad Performance */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Ad Performance
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Ads Requested:</span>
            <span className="font-semibold">{analytics.adsRequested}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ads Filled:</span>
            <span className="font-semibold text-green-400">{analytics.adsFilled}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ads Started:</span>
            <span className="font-semibold text-blue-400">{analytics.adsStarted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ads Completed:</span>
            <span className="font-semibold text-purple-400">{analytics.adsCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg CPM:</span>
            <span className="font-semibold text-green-400">${analytics.avgCPM.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Viewability */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          Viewability
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Time in Viewport:</span>
            <span className="font-semibold">{analytics.timeInViewport.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time Playing:</span>
            <span className="font-semibold">{analytics.timePlaying.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Viewability Score:</span>
            <span className={`font-semibold ${
              analytics.viewabilityScore > 70 ? 'text-green-400' :
              analytics.viewabilityScore > 50 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {analytics.viewabilityScore.toFixed(0)}/100
            </span>
          </div>
        </div>

        {/* Viewability Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              analytics.viewabilityScore > 70 ? 'bg-green-500' :
              analytics.viewabilityScore > 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, analytics.viewabilityScore)}%` }}
          />
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          AI Features Active
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {analytics.dynamicAdPodsUsed && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Dynamic Ad Pods</span>
            </div>
          )}
          {analytics.intelligentTimeoutsUsed && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Smart Timeouts</span>
            </div>
          )}
          {analytics.vastUnwrappingUsed && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>VAST Unwrapping</span>
            </div>
          )}
          {analytics.contextualAIUsed && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Contextual AI</span>
            </div>
          )}
          {analytics.engagementOptimizerUsed && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span>Engagement Opt</span>
            </div>
          )}
        </div>

        {!analytics.dynamicAdPodsUsed &&
         !analytics.intelligentTimeoutsUsed &&
         !analytics.vastUnwrappingUsed &&
         !analytics.contextualAIUsed &&
         !analytics.engagementOptimizerUsed && (
          <div className="text-xs text-gray-500 italic">
            No features used yet
          </div>
        )}
      </div>

      {/* Revenue Projection */}
      {analytics.adsCompleted > 0 && (
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Revenue Projection
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Per 1K Impressions:</span>
              <span className="text-green-400 font-semibold">
                ${(analytics.eCPM).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Per 100K Impressions:</span>
              <span className="text-green-400 font-semibold">
                ${(analytics.eCPM * 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Per 1M Impressions:</span>
              <span className="text-green-400 font-semibold">
                ${(analytics.eCPM * 1000).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Session: {analytics.sessionId.substring(0, 20)}...</div>
        <div>Started: {analytics.sessionStarted.toLocaleTimeString()}</div>
        <div>Last Activity: {analytics.lastActivity.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default OutstreamAnalyticsDashboard;
