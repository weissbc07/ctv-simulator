import { create } from 'zustand';
import { AdRequest, LogEntry, CTVConfig } from '../types';
import { PREBID_DEMAND_SOURCES } from '../utils/prebidServer';
import { VastCreative } from '../utils/vastParser';
import { PodStrategy, AdPodResult, DemandSource } from '../utils/dynamicAdPodOptimizer';

interface AppState {
  // CTV Configuration
  ctvConfig: CTVConfig;
  setCtvConfig: (config: Partial<CTVConfig>) => void;
  
  // Ad Requests
  adRequests: AdRequest[];
  addAdRequest: (request: AdRequest) => void;
  updateAdRequest: (id: string, updates: Partial<AdRequest>) => void;
  clearAdRequests: () => void;
  
  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // UI State
  selectedAdRequest: string | null;
  setSelectedAdRequest: (id: string | null) => void;
  logFilter: 'all' | 'info' | 'warning' | 'error' | 'success';
  setLogFilter: (filter: 'all' | 'info' | 'warning' | 'error' | 'success') => void;
  
  // Video State
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  
  // Ad Playback State
  currentAd: VastCreative | null;
  setCurrentAd: (ad: VastCreative | null) => void;
  isPlayingAd: boolean;
  setIsPlayingAd: (playing: boolean) => void;
  playAdCreative: (ad: VastCreative) => void;
  stopAdPlayback: () => void;

  // Ad Pod Optimizer State
  optimizerEnabled: boolean;
  setOptimizerEnabled: (enabled: boolean) => void;
  currentPodStrategy: PodStrategy | null;
  setCurrentPodStrategy: (strategy: PodStrategy | null) => void;
  lastPodResult: AdPodResult | null;
  setLastPodResult: (result: AdPodResult | null) => void;
  podHistory: AdPodResult[];
  addPodResult: (result: AdPodResult) => void;
  clearPodHistory: () => void;
  revenueTargets: Record<string, number>;
  setRevenueTargets: (targets: Record<string, number>) => void;
  customDemandSources: DemandSource[];
  setCustomDemandSources: (sources: DemandSource[]) => void;
}

const defaultCTVConfig: CTVConfig = {
  userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) 85.0.4183.93/6.0 TV Safari/537.36',
  deviceType: 3, // CTV
  geo: {
    country: 'GB',
    region: 'England',
    city: 'London',
    lat: 51.5074,
    lon: -0.1278,
  },
  ip: '91.245.227.10', // UK IP
  vastTag: '',
  openRtbEndpoint: '',
  prebidServerConfig: {
    endpoint: 'https://ctv-simulator.vercel.app/api/openrtb2/auction',
    accountId: 'ctv-simulator-account',
    timeout: 1000,
    demandSources: PREBID_DEMAND_SOURCES
  },
  gdprConsent: true,
  tcfString: 'CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA',
};

export const useStore = create<AppState>((set) => ({
  // CTV Configuration
  ctvConfig: defaultCTVConfig,
  setCtvConfig: (config) =>
    set((state) => ({
      ctvConfig: { ...state.ctvConfig, ...config },
    })),
  
  // Ad Requests
  adRequests: [],
  addAdRequest: (request) =>
    set((state) => ({
      adRequests: [request, ...state.adRequests],
    })),
  updateAdRequest: (id, updates) =>
    set((state) => ({
      adRequests: state.adRequests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),
  clearAdRequests: () => set({ adRequests: [] }),
  
  // Logs
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
        ...state.logs,
      ],
    })),
  clearLogs: () => set({ logs: [] }),
  
  // UI State
  selectedAdRequest: null,
  setSelectedAdRequest: (id) => set({ selectedAdRequest: id }),
  logFilter: 'all',
  setLogFilter: (filter) => set({ logFilter: filter }),
  
  // Video State
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  duration: 0,
  setDuration: (duration) => set({ duration: duration }),
  
  // Ad Playback State
  currentAd: null,
  setCurrentAd: (ad) => set({ currentAd: ad }),
  isPlayingAd: false,
  setIsPlayingAd: (playing) => set({ isPlayingAd: playing }),
  playAdCreative: (ad) => set({ currentAd: ad }),
  stopAdPlayback: () => set({ currentAd: null }),

  // Ad Pod Optimizer State
  optimizerEnabled: true,
  setOptimizerEnabled: (enabled) => set({ optimizerEnabled: enabled }),
  currentPodStrategy: null,
  setCurrentPodStrategy: (strategy) => set({ currentPodStrategy: strategy }),
  lastPodResult: null,
  setLastPodResult: (result) => set({ lastPodResult: result }),
  podHistory: [],
  addPodResult: (result) =>
    set((state) => ({
      podHistory: [result, ...state.podHistory].slice(0, 100), // Keep last 100 results
      lastPodResult: result,
    })),
  clearPodHistory: () => set({ podHistory: [], lastPodResult: null }),
  revenueTargets: {
    preroll: 8.50,
    midroll: 12.00,
    postroll: 6.00,
  },
  setRevenueTargets: (targets) =>
    set((state) => ({
      revenueTargets: { ...state.revenueTargets, ...targets },
    })),
  customDemandSources: [],
  setCustomDemandSources: (sources) => set({ customDemandSources: sources }),
})); 