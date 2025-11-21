export interface AdRequest {
  id: string;
  timestamp: Date;
  url: string;
  method: string;
  headers: Record<string, string>;
  payload?: any;
  status?: 'pending' | 'success' | 'error' | 'timeout';
  responseTime?: number;
  responseStatus?: number;
  responseData?: any;
  error?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  adRequestId?: string;
}

export interface CTVConfig {
  userAgent: string;
  deviceType: number;
  geo: {
    country: string;
    region?: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
  ip: string;
  vastTag?: string;
  openRtbEndpoint?: string;
  prebidServerConfig?: PrebidServerConfig;
  gdprConsent?: boolean;
  tcfString?: string;
}

export interface OpenRTBRequest {
  id: string;
  imp: Array<{
    id: string;
    video: {
      mimes: string[];
      minduration: number;
      maxduration: number;
      protocols: number[];
      w: number;
      h: number;
      startdelay: number;
      placement: number;
      linearity: number;
      skip: number;
      skipmin: number;
      skipafter: number;
      sequence: number;
      battr: number[];
      maxextended: number;
      minbitrate: number;
      maxbitrate: number;
      boxingallowed: number;
      playbackmethod: number[];
      playbackend: number;
      delivery: number[];
      pos: number;
      companionad: any[];
      api: number[];
      companiontype: number[];
    };
    displaymanager: string;
    displaymanagerver: string;
    instl: number;
    tagid: string;
    bidfloor: number;
    bidfloorcur: string;
    secure: number;
  }>;
  site?: {
    id: string;
    name: string;
    domain: string;
    cat: string[];
    sectioncat: string[];
    pagecat: string[];
    page: string;
    ref: string;
    search: string;
    mobile: number;
    privacypolicy: number;
    publisher: {
      id: string;
      name: string;
      cat: string[];
      domain: string;
    };
    content: {
      id: string;
      episode: number;
      title: string;
      series: string;
      season: string;
      artist: string;
      genre: string;
      album: string;
      isrc: string;
      producer: {
        id: string;
        name: string;
        cat: string[];
        domain: string;
      };
      url: string;
      cat: string[];
      prodq: number;
      videoquality: number;
      context: number;
      contentrating: string;
      userrating: string;
      qagmediarating: number;
      keywords: string;
      livestream: number;
      sourcerelationship: number;
      len: number;
      language: string;
      embeddable: number;
    };
    keywords: string;
  };
  app?: {
    id: string;
    name: string;
    bundle: string;
    domain: string;
    storeurl: string;
    cat: string[];
    sectioncat: string[];
    pagecat: string[];
    ver: string;
    privacypolicy: number;
    paid: number;
    publisher: {
      id: string;
      name: string;
      cat: string[];
      domain: string;
    };
    content: any;
    keywords: string;
  };
  device: {
    ua: string;
    geo: {
      lat: number;
      lon: number;
      type: number;
      accuracy: number;
      lastfix: number;
      ipservice: number;
      country: string;
      region: string;
      regionfips104: string;
      metro: string;
      city: string;
      zip: string;
      utcoffset: number;
    };
    dnt: number;
    lmt: number;
    ip: string;
    ipv6: string;
    devicetype: number;
    make: string;
    model: string;
    os: string;
    osv: string;
    hwv: string;
    h: number;
    w: number;
    ppi: number;
    pxratio: number;
    js: number;
    geofetch: number;
    flashver: string;
    language: string;
    carrier: string;
    mccmnc: string;
    connectiontype: number;
    ifa: string;
    didsha1: string;
    didmd5: string;
    dpidsha1: string;
    dpidmd5: string;
    macsha1: string;
    macmd5: string;
  };
  user?: {
    id: string;
    buyeruid: string;
    yob: number;
    gender: string;
    keywords: string;
    customdata: string;
    geo: any;
    data: any[];
  };
  test?: number;
  at: number;
  tmax: number;
  wseat: string[];
  bseat: string[];
  allimps: number;
  cur: string[];
  wlang: string[];
  bcat: string[];
  badv: string[];
  bapp: string[];
  source: {
    fd: number;
    tid: string;
    pchain: string;
  };
  regs?: {
    coppa: number;
    ext: {
      gdpr: number;
    };
  };
  ext?: {
    consent?: string;
  };
}

export interface SSPEndpoint {
  name: string;
  url: string;
  type: 'vast' | 'openrtb';
  description: string;
}

export interface PrebidBidder {
  bidder: string;
  params: Record<string, any>;
}

export interface PrebidDemandSource {
  name: string;
  bidder: string;
  params: Record<string, any>;
  defaultValues: Record<string, any>;
  enabled: boolean;
}

export interface PrebidServerConfig {
  endpoint: string;
  accountId: string;
  timeout: number;
  demandSources: PrebidDemandSource[];
}

export interface PrebidServerRequest {
  id: string;
  imp: Array<{
    id: string;
    video: {
      mimes: string[];
      minduration: number;
      maxduration: number;
      protocols: number[];
      w: number;
      h: number;
      startdelay: number;
      placement: number;
      linearity: number;
      skip: number;
      skipmin: number;
      skipafter: number;
      sequence: number;
      battr: number[];
      maxextended: number;
      minbitrate: number;
      maxbitrate: number;
      boxingallowed: number;
      playbackmethod: number[];
      playbackend: number;
      delivery: number[];
      pos: number;
      companionad: any[];
      api: number[];
      companiontype: number[];
    };
    displaymanager: string;
    displaymanagerver: string;
    instl: number;
    tagid: string;
    bidfloor: number;
    bidfloorcur: string;
    secure: number;
    ext: {
      prebid: {
        bidder: Record<string, any>;
      };
    };
  }>;
  app?: {
    id: string;
    name: string;
    bundle: string;
    domain: string;
    storeurl: string;
    cat: string[];
    sectioncat: string[];
    pagecat: string[];
    ver: string;
    privacypolicy: number;
    paid: number;
    publisher: {
      id: string;
      name: string;
      cat: string[];
      domain: string;
    };
    content: {
      id: string;
      episode: number;
      title: string;
      series: string;
      season: string;
      artist: string;
      genre: string;
      album: string;
      isrc: string;
      producer: {
        id: string;
        name: string;
        cat: string[];
        domain: string;
      };
      url: string;
      cat: string[];
      prodq: number;
      videoquality: number;
      context: number;
      contentrating: string;
      userrating: string;
      qagmediarating: number;
      keywords: string;
      livestream: number;
      sourcerelationship: number;
      len: number;
      language: string;
      embeddable: number;
    };
    keywords: string;
  };
  device: {
    ua: string;
    geo: {
      lat: number;
      lon: number;
      type: number;
      accuracy: number;
      lastfix: number;
      ipservice: number;
      country: string;
      region: string;
      regionfips104: string;
      metro: string;
      city: string;
      zip: string;
      utcoffset: number;
    };
    dnt: number;
    lmt: number;
    ip: string;
    ipv6: string;
    devicetype: number;
    make: string;
    model: string;
    os: string;
    osv: string;
    hwv: string;
    h: number;
    w: number;
    ppi: number;
    pxratio: number;
    js: number;
    geofetch: number;
    flashver: string;
    language: string;
    carrier: string;
    mccmnc: string;
    connectiontype: number;
    ifa: string;
    didsha1: string;
    didmd5: string;
    dpidsha1: string;
    dpidmd5: string;
    macsha1: string;
    macmd5: string;
    ext?: {
      atts?: number;
      ifv?: string;
      session_depth?: number;
      screen_orientation?: number;
    };
  };
  at: number;
  tmax: number;
  wseat: string[];
  bseat: string[];
  allimps: number;
  cur: string[];
  wlang: string[];
  bcat: string[];
  badv: string[];
  bapp: string[];
  source: {
    fd: number;
    tid: string;
    pchain: string;
    schain?: {
      complete: number;
      nodes: Array<{
        asi: string;
        sid: string;
        hp: number;
        rid: string;
        name: string;
        domain: string;
      }>;
      ver: string;
      ext?: {
        certification?: string;
        relationship_type?: string;
      };
    };
  };
  regs?: {
    coppa: number;
    ext: {
      gdpr?: number;
      us_privacy?: string;
      gpp?: string;
      gpp_sid?: number[];
    };
  };
  ext?: {
    consent?: string;
    prebid: {
      targeting: Record<string, any>;
      cache: {
        bids: Record<string, any>;
        vastxml: Record<string, any>;
      };
      storedrequest: {
        id: string;
      };
      ctv?: {
        device_model?: string;
        os_version?: string;
        app_version?: string;
        screen_density?: string;
        audio_capabilities?: string[];
        video_capabilities?: string[];
        drm_support?: string[];
        hdr_support?: string[];
      };
    };
  };
}

// Google AdX Integration Types
export interface AdXConfig {
  publisherId: string;
  adUnitPath: string;
  networkCode: string;
  serviceAccountKey?: string;
  enablePAL: boolean;
  useRealGAM?: boolean;
  useRealProgrammatic?: boolean;
  firstPartyData?: Record<string, any>;
  publisherDomain?: string;
  contentPageUrl?: string;
  videoContentId?: string;
  videoCMSId?: string;
  videoPosition?: 'preroll' | 'midroll' | 'postroll';
  sessionId?: string;
  omidPartnerName?: string;
  omidPartnerVersion?: string;
  tagForUnderAge?: string;
  customParams?: Record<string, any>;
  palConfig?: PALConfig;
}

export interface PALConfig {
  descriptionUrl: string;
  privacyPolicy: string;
  playerType: 'web' | 'ctv' | 'mobile';
  playerName: string;
  playerVersion: string;
  videoWidth: number;
  videoHeight: number;
  videoTitle?: string;
  videoDescription?: string;
  videoDuration?: number;
  contentRating?: string;
  isLive?: boolean;
  ctvProvider?: CTVProvider;
}

export interface CTVProvider {
  name: string;
  type: 'roku' | 'samsung' | 'lg' | 'firetv' | 'androidtv' | 'appletv' | 'tizen' | 'webos' | 'other';
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  userAgent: string;
  capabilities: {
    drm: string[];
    video: {
      codecs: string[];
      profiles: string[];
      hdr: boolean;
      resolution: string[];
    };
    audio: {
      codecs: string[];
      channels: number[];
    };
  };
}

export interface AdXRequest {
  adUnitCode: string;
  sizes: number[][];
  video: {
    playerSize: number[][];
    context: 'instream' | 'outstream' | 'adpod';
    mimes: string[];
    protocols: number[];
    minduration: number;
    maxduration: number;
    startdelay?: number;
    placement?: number;
    linearity?: number;
    skip?: number;
    skipmin?: number;
    skipafter?: number;
    playbackmethod?: number[];
    api?: number[];
  };
  gdpr?: {
    consentString?: string;
    gdprApplies?: boolean;
  };
  uspConsent?: string;
  schain?: any;
  userId?: Record<string, any>;
  ortb2?: any;
  ortb2Imp?: any;
  pal?: {
    nonce: string;
    adSessionId: string;
  };
}

export interface AdXResponse {
  requestId: string;
  adUnitCode: string;
  cpm: number;
  currency: string;
  width: number;
  height: number;
  vastXml?: string;
  vastUrl?: string;
  dealId?: string;
  creativeId: string;
  netRevenue: boolean;
  ttl: number;
  meta?: {
    advertiserDomains?: string[];
    brandName?: string;
    networkName?: string;
    primaryCatId?: string;
    secondaryCatIds?: string[];
    mediaType?: string;
  };
  adServerTargeting?: Record<string, any>;
  pal?: {
    verified: boolean;
    adSessionId: string;
    impressionUrl?: string;
  };
}

export interface PALNonceRequest {
  descriptionUrl: string;
  privacyPolicy: string;
  playerType: string;
  playerName: string;
  playerVersion: string;
  videoWidth: number;
  videoHeight: number;
  videoTitle?: string;
  videoDescription?: string;
  videoDuration?: number;
  contentRating?: string;
  isLive?: boolean;
  sessionId?: string;
  iconsSupported?: boolean;
  omidPartnerName?: string;
  omidPartnerVersion?: string;
  supportedApiFrameworks?: string[];
}

export interface PALNonceResponse {
  nonce: string;
  adSessionId: string;
  videoSessionId: string;
  settings: {
    numRedirectsRemaining: number;
    enabledEventTypes: string[];
    nonceExpiry: number;
  };
}

// DAI (Dynamic Ad Insertion) Types
export interface DAIConfig {
  enabled: boolean;
  authKeys: DAIAuthKey[];
  streamFormat: 'hls' | 'dash';
  contentSourceId?: string;
  videoId?: string;
  cmsId?: string;
  enableServerSideBeaconing?: boolean;
  apiKey?: string;
  hmacKey?: string;
  streamUrl?: string;
  fallbackStreamUrl?: string;
  adBreakConfiguration?: AdBreakConfig;
  customAssetKey?: string;
}

export interface DAIAuthKey {
  id: string;
  name: string;
  type: 'api' | 'hmac';
  key: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastUsed?: Date;
  description?: string;
}

export interface AdBreakConfig {
  preRoll?: boolean;
  midRoll?: {
    enabled: boolean;
    positions: number[]; // Time positions in seconds
    frequency?: number; // Every N seconds
  };
  postRoll?: boolean;
  maxAdsPerBreak?: number;
  maxAdDuration?: number;
}

export interface DAIStreamRequest {
  contentSourceId?: string;
  videoId?: string;
  cmsId?: string;
  authToken?: string;
  apiKey?: string;
  format: 'hls' | 'dash';
  adTagParameters?: Record<string, string>;
  streamActivityMonitorId?: string;
  sessionId?: string;
  userId?: string;
  customAssetKey?: string;
  streamUrl?: string;
}

export interface DAIStreamResponse {
  streamUrl: string;
  streamId: string;
  duration?: number;
  adBreaks?: AdBreak[];
  trackingUrls?: {
    contentTracking?: string;
    adTracking?: string;
    errorTracking?: string;
  };
  metadata?: {
    contentTitle?: string;
    contentDescription?: string;
    contentDuration?: number;
    adBreakCount?: number;
  };
}

export interface AdBreak {
  id: string;
  startTime: number; // seconds
  duration: number;
  adCount: number;
  type: 'preroll' | 'midroll' | 'postroll';
  ads?: DAIAd[];
}

export interface DAIAd {
  id: string;
  duration: number;
  title?: string;
  advertiser?: string;
  creativeId?: string;
  lineItemId?: string;
  clickThroughUrl?: string;
  trackingEvents?: {
    [eventType: string]: string[];
  };
}

export interface HLSManifest {
  version: number;
  targetDuration: number;
  mediaSequence: number;
  playlistType?: string;
  segments: HLSSegment[];
  adBreaks?: HLSAdBreak[];
  isDynamic?: boolean;
  endList?: boolean;
}

export interface HLSSegment {
  uri: string;
  duration: number;
  sequence: number;
  title?: string;
  byteRange?: string;
  key?: string;
  programDateTime?: string;
  discontinuity?: boolean;
}

export interface HLSAdBreak {
  startTime: number;
  duration: number;
  adCount: number;
  cueOut?: string;
  cueIn?: string;
  scte35?: string;
}

export interface DASHManifest {
  mediaPresentationDuration: string;
  minBufferTime: string;
  profiles: string;
  type?: 'static' | 'dynamic';
  periods: DASHPeriod[];
  adBreaks?: DASHAdBreak[];
}

export interface DASHPeriod {
  id: string;
  start: string;
  duration: string;
  adaptationSets: DASHAdaptationSet[];
}

export interface DASHAdaptationSet {
  id: string;
  mimeType: string;
  contentType: 'video' | 'audio';
  representations: DASHRepresentation[];
}

export interface DASHRepresentation {
  id: string;
  bandwidth: number;
  width?: number;
  height?: number;
  frameRate?: string;
  codecs?: string;
  segmentTemplate?: {
    media: string;
    initialization: string;
    timescale: number;
    duration: number;
    startNumber: number;
  };
}

export interface DASHAdBreak {
  periodId: string;
  startTime: string;
  duration: string;
  adCount: number;
}

export interface DAIVideoPlayer {
  loadStream: (streamUrl: string, config?: DAIConfig) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
  destroy: () => void;
}

export interface DAIEvent {
  type: 'adBreakStart' | 'adBreakEnd' | 'adStart' | 'adEnd' | 'streamLoaded' | 'error';
  timestamp: Date;
  data?: any;
  adBreak?: AdBreak;
  ad?: DAIAd;
  error?: string;
}

// =============================================================================
// OUTSTREAM VIDEO PLAYER TYPES
// =============================================================================

export interface OutstreamPlayerConfig {
  // Basic configuration
  id: string;
  autoplay: boolean;
  muted: boolean;

  // Positioning
  sticky: boolean;
  stickyPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  stickyOffset?: { x: number; y: number };

  // Visibility controls
  playOnViewport: boolean;
  viewportThreshold: number; // 0-1, percentage of player visible to trigger autoplay
  pauseOnViewportExit: boolean;

  // Size & responsive
  width: number | string;
  height: number | string;
  aspectRatio?: string;

  // Ad configuration
  enableOptimizations: boolean;
  features: OutstreamFeatures;

  // Tracking
  trackingEnabled: boolean;
  analyticsEndpoint?: string;
}

export interface OutstreamFeatures {
  dynamicAdPods: boolean;
  intelligentTimeouts: boolean;
  vastUnwrapping: boolean;
  contextualAI: boolean;
  engagementOptimizer: boolean;
}

// =============================================================================
// FEATURE #1: DYNAMIC AD POD OPTIMIZER
// =============================================================================

export interface AdPodOpportunity {
  position: 'pre-roll' | 'mid-roll' | 'post-roll' | 'outstream';
  videoLength?: number;
  maxAdDuration: number;
  user: UserContext;
  category: string;
  device: string;
}

export interface UserContext {
  id: string;
  sessionCount: number;
  avgSessionDuration: number;
  totalVideosWatched: number;
  avgCompletionRate: number;
  adCompletionRate: number;
  estimatedLTV: number;
}

export interface DemandSource {
  name: string;
  avgCPM: number;
  fillRate: number;
  responseTime: number;
  acceptedDurations: number[];
  competitiveCategories: string[];
  timeout: number;
}

export interface AdPodStrategy {
  slotCount: number;
  durations: number[];
  sequence: AdSlotStrategy[];
  expectedRevenue: number;
  expectedCompletionRate: number;
  reasoning: string;
}

export interface AdSlotStrategy {
  slot: number;
  sources: string[];
  floor: number;
  timeout: number;
  duration: number;
  expectedCPM: number;
  fillProbability: number;
  parallelGroup?: string;
}

export interface AdPodResult {
  slotsAttempted: number;
  slotsFilled: number;
  totalRevenue: number;
  totalDuration: number;
  completionRate: number;
  actualCPM: number;
}

// =============================================================================
// FEATURE #2: INTELLIGENT TIMEOUT & BID LATENCY OPTIMIZER
// =============================================================================

export interface SSPPerformance {
  ssp: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  timeoutRate: number;
  avgCPM: number;
  fillRate: number;
  lastUpdated: Date;
  recentSamples: number;
}

export interface TimeoutAllocation {
  ssp: string;
  timeout: number;
  priority: number;
  parallelGroup?: string;
  expectedContribution: number;
}

export interface TimeoutStrategy {
  strategy: 'parallel' | 'sequential' | 'hybrid';
  ssps: TimeoutAllocation[];
  expectedRevenue: number;
  expectedLatency: number;
  expectedFillRate: number;
  reasoning: string;
}

export interface BidResult {
  ssp: string;
  cpm: number;
  currency: string;
  vastUrl?: string;
  vastXml?: string;
  responseTime: number;
  dealId?: string;
  meta?: Record<string, any>;
}

// =============================================================================
// FEATURE #3: SERVER-SIDE VAST UNWRAPPING + CREATIVE QUALITY VALIDATOR
// =============================================================================

export interface VASTUnwrapResult {
  originalUrl: string;
  chain: VASTWrapperChain[];
  finalVAST: VASTInline | null;
  trackingPixels: string[];
  verificationScripts: string[];
  duration: number;
  pricing: VASTPricing | null;
  errors: VASTError[];
  unwrapTime: number;
}

export interface VASTWrapperChain {
  depth: number;
  url: string;
  responseTime: number;
}

export interface VASTInline {
  adTitle: string;
  duration: number;
  mediaFiles: VASTMediaFile[];
  clickThrough?: string;
  trackingEvents: Record<string, string[]>;
  verifications?: any[];
}

export interface VASTMediaFile {
  url: string;
  type: string;
  bitrate: number;
  width: number;
  height: number;
  codec?: string;
}

export interface VASTPricing {
  price: number;
  currency: string;
  model: 'cpm' | 'cpc' | 'cpe';
}

export interface VASTError {
  depth: number;
  url: string;
  error: string;
}

export interface CreativeQualityScore {
  overallScore: number; // 0-100
  shouldServe: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  technical: TechnicalValidation;
  performance: PerformancePrediction;
  brandSafety: BrandSafetyCheck;
  reasoning: string;
}

export interface TechnicalValidation {
  score: number;
  issues: string[];
  critical: boolean;
  mediaFilesValid: boolean;
  trackingValid: boolean;
}

export interface PerformancePrediction {
  predictedCompletionRate: number;
  predictedCTR: number;
  predictedLoadTime: number;
  confidence: number;
}

export interface BrandSafetyCheck {
  score: number;
  safe: boolean;
  categories: string[];
  warnings: string[];
}

// =============================================================================
// FEATURE #4: CONTEXTUAL AI + FIRST-PARTY DATA ACTIVATION
// =============================================================================

export interface UserProfile {
  userId: string;

  // Behavioral signals
  avgSessionDuration: number;
  videosWatchedLast30Days: number;
  avgCompletionRate: number;
  preferredCategories: string[];
  peakActivityHours: number[];
  devicePreference: string;

  // AI-inferred attributes
  interestCategories: string[];
  intentSignals: string[];
  lifestageEstimate: string;
  purchaseIntent: Record<string, number>;
  brandAffinities: string[];

  // Value signals
  lifetimeValue: number;
  adEngagementScore: number; // 0-100
  premiumScore: number; // 0-100
}

export interface ContentAnalysis {
  videoId: string;
  title: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  contentIntensity: 'calm' | 'moderate' | 'high_energy';
  audienceSophistication: 'general' | 'intermediate' | 'expert';
  brandSafetyScore: number;
  suitableAdvertisers: string[];
  unsuitableAdvertisers: string[];
  premiumContentScore: number;
  optimalAdTypes: ('brand_awareness' | 'direct_response')[];
}

export interface TargetingPackage {
  standardTargeting: Record<string, any>;
  premiumTargeting: Record<string, any>;
  recommendedFloor: number;
  floorModifiers: Record<string, number>;
  preferredAdvertisers: string[];
  blockedCategories: string[];
  dealEligibility: string[];
  expectedCPMRange: string;
}

export interface MonetizationStrategy {
  recommendedFloor: number;
  floorModifiers: Record<string, number>;
  preferredAdvertisers: string[];
  blockedCategories: string[];
  dealEligibility: string[];
  expectedCPM: string;
  reasoning: string;
}

// =============================================================================
// FEATURE #5: PREDICTIVE USER ENGAGEMENT & RETENTION OPTIMIZER
// =============================================================================

export interface AbandonmentRisk {
  abandonmentRisk: number; // 0-1
  timeUntilAbandon: number; // seconds
  confidence: number;
  primaryFactors: string[];
  recommendation: 'serve_normal' | 'reduce_ad_load' | 'skip_ads' | 'gentle_treatment';
}

export interface EngagementContext {
  sessionDuration: number;
  videosThisSession: number;
  adsThisSession: number;
  lastAdCompletedRate: number;
  scrollSpeed: number;
  mouseMovement: number;
  timeOnPage: number;
  interactionCount: number;
  device: string;
  connection: string;
}

export interface AdLoadOptimization {
  adCount: number;
  positions: string[];
  maxTotalDuration: number;
  skipAds: boolean;
  reasoning: string;
  expectedImmediateRevenue: number;
  expectedFutureValue: number;
  recommendedAction: string;
}

export interface AdDecision {
  serve: boolean;
  reason: string;
  maxDuration?: number;
  floorAdjustment?: number;
  reasoning?: string;
}

export interface UserFeedbackEvent {
  type: 'ad_skipped' | 'ad_completed' | 'video_abandoned_during_ad' | 'video_completed' | 'clicked_ad' | 'returned_next_day' | 'churned';
  context: any;
  timestamp: Date;
}

// =============================================================================
// OUTSTREAM ANALYTICS & TRACKING
// =============================================================================

export interface OutstreamAnalytics {
  sessionId: string;
  playerInstanceId: string;

  // Visibility tracking
  timeInViewport: number;
  timePlaying: number;
  viewabilityScore: number; // 0-100

  // Ad performance
  adsRequested: number;
  adsFilled: number;
  adsStarted: number;
  adsCompleted: number;
  fillRate: number;
  completionRate: number;

  // Revenue
  totalRevenue: number;
  avgCPM: number;
  eCPM: number;

  // Optimization metrics
  avgRequestLatency: number;
  timeoutRate: number;
  vastErrorRate: number;

  // User engagement
  userInteractions: number;
  clickThroughs: number;
  abandonmentRate: number;

  // Feature performance
  dynamicAdPodsUsed: boolean;
  intelligentTimeoutsUsed: boolean;
  vastUnwrappingUsed: boolean;
  contextualAIUsed: boolean;
  engagementOptimizerUsed: boolean;

  // Timestamps
  sessionStarted: Date;
  lastActivity: Date;
}

export interface OutstreamEvent {
  type: 'player_initialized' | 'viewport_enter' | 'viewport_exit' | 'ad_request' | 'ad_response' | 'ad_start' | 'ad_complete' | 'ad_error' | 'user_interaction' | 'optimization_applied';
  timestamp: Date;
  data?: any;
  analytics?: Partial<OutstreamAnalytics>;
} 