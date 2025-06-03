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