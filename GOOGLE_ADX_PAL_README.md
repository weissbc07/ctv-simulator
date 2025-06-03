# Google AdX + PAL SDK Integration for CTV Simulator

This documentation covers the integration of Google Ad Exchange (AdX) with the Publisher Audience Limits (PAL) SDK for Connected TV (CTV) advertising simulation across different CTV providers.

## Overview

The CTV Simulator now supports:
- **Google AdX Integration**: Server-side ad requests to Google's ad exchange
- **Real GAM Endpoint**: Direct integration with Google Ad Manager live endpoints
- **PAL SDK Support**: Privacy-focused audience limiting and verification
- **Multi-CTV Provider Support**: Roku, Samsung Tizen, LG webOS, Amazon Fire TV, Android TV, Apple TV
- **Comprehensive CTV Parameters**: All recommended programmatic CTV video parameters
- **Real-time Testing**: Mock and production-ready endpoints for development

## Features

### 🎯 Google AdX Integration
- Server-side ad request processing
- OpenRTB 2.5 compliant requests
- **Real GAM Endpoint Support**: Direct calls to `pubads.g.doubleclick.net`
- Publisher ID and ad unit path configuration
- Real-time bid response simulation
- VAST XML ad creative delivery
- **FailArmy CTV Integration**: Pre-configured for FailArmy's CTV Android inventory

### 🔒 PAL SDK Features
- Nonce generation for privacy protection
- Ad session verification
- CTV-specific player configuration
- OMID (Open Measurement Interface Definition) support
- Event tracking for compliance

### 📺 CTV Provider Support
- **Roku**: DVP player simulation with Roku-specific capabilities
- **Samsung Tizen**: Smart TV platform with enhanced codec support
- **LG webOS**: WebOS player with comprehensive DRM support
- **Amazon Fire TV**: Android-based platform with Fire TV optimizations
- **Android TV**: Google's TV platform with latest codec support
- **Apple TV**: iOS-based platform with FairPlay DRM

### 🎬 Comprehensive CTV Parameters
The integration now includes all recommended and required programmatic CTV parameters:

#### Core GAM Parameters
- `iu`: Inventory unit (e.g., `/22106938864,22966701315/failarmy-auth-ctv-android`)
- `description_url`: Content description URL
- `tfcd`: Tag For Child-Directed treatment
- `npa`: Non-Personalized Ads flag
- `pp=CTV`: Platform parameter for Connected TV
- `gdfp_req=1`: Google DFP request indicator
- `output=vast`: VAST XML output format
- `env=vp`: Video player environment
- `impl=s`: Server-side implementation
- `vad_type=linear`: Linear video ad type

#### Video & Device Parameters
- `sz`: Multiple video sizes (720p, 1080p, 4K)
- `min_ad_duration` / `max_ad_duration`: Ad duration limits
- `video_doc_id`: Video document identifier
- `api`: Supported API frameworks (VPAID 1.0/2.0, OMID 1.0, SIMID 1.0)
- `protocol`: VAST protocol versions (2.0-4.2)
- `mime_type`: Platform-specific MIME types
- `ua`: Platform-specific user agents
- `dt=3`: Device type (Connected TV)

#### Platform-Specific Device IDs
- **Roku**: `rdid` (Roku Device ID)
- **Samsung**: `tifa` (TV Identifier for Advertising)
- **LG**: `lgudid` (LG Unique Device ID)
- **Fire TV**: `amazon_aid` (Amazon Advertising ID)
- **Android TV**: `gaid` (Google Advertising ID)
- **Apple TV**: `idfa` (Identifier for Advertisers)

#### Privacy & Targeting
- `gdpr` / `gdpr_consent`: GDPR compliance
- `us_privacy`: CCPA compliance
- `schain`: Supply chain transparency
- `fpd`: First-party data
- `content_rating`: Content rating (G, PG, PG-13, R, NC-17)
- `live`: Live content indicator

#### PAL Integration
- `pal_nonce`: PAL-generated nonce
- `pal_session_id`: PAL session identifier

### 📋 Example GAM Request URL

When **"Use Real GAM Endpoint"** is enabled, the system generates a comprehensive URL like:

```
https://pubads.g.doubleclick.net/gampad/live/ads?
iu=/22106938864,22966701315/failarmy-auth-ctv-android&
description_url=https://ctv-simulator.com&
url=https://ctv-simulator.com/content&
tfcd=0&npa=0&pp=CTV&gdfp_req=1&
unviewed_position_start=1&output=vast&env=vp&impl=s&
vad_type=linear&sz=1280x720|1920x1080|3840x2160&
correlator=1703123456789&nofb=1&
rdid=aaid_abc123456789&idtype=aaid&is_lat=0&
vid=content_abc123456&cmsid=123456&vpos=preroll&
plcmt=1&vpa=1&vpmute=0&
min_ad_duration=0&max_ad_duration=30000&
sid=sess_xyz789_1703123456&
omidpn=CTV-Simulator&omidpv=1.0.0&
us_privacy=1YN-&gdpr=1&
gdpr_consent=CPz_z_z_z_z_z_z_z_z_z_z_z_z_z_z_z&
tfua=0&ua=Roku%2FDVP-12.0&dt=3&make=Roku&model=Roku&
video_doc_id=video_abc123&video_duration=600&
api=1,2,7&protocol=2,3,5,6,7,8&
mime_type=video/mp4,video/webm&pos=1&
skippable=1&skip_delay=5&content_rating=G&
pal_nonce=pal_def456_1703123456&
pal_session_id=sess_ghi789_1703123456&
request_id=adx_req123_1703123456&
schain=1.0,1!ctv-simulator.com,ctv-simulator,1,...&
is_roku_tv=1&screen_width=1920&screen_height=1080&
screen_density=1.0&hdr_support=1&audio_channels=8&
hl=en&ad_type=video&videoad_start_delay=0&
frm=0&ga_fc=1&ga_cid=ga_client123456
```

This URL includes all **80+ CTV-specific parameters** for optimal programmatic performance and compliance.

### 🎯 **Enhanced Parameter Coverage**

#### **Required Parameters (per Google's spec):**
- ✅ `iu` - Ad unit path (FailArmy inventory)
- ✅ `description_url` - Content description URL
- ✅ `url` - Page URL where ad is displayed
- ✅ `correlator` - Unique request identifier
- ✅ `sz` - Supported video sizes (720p, 1080p, 4K)

#### **CTV Device Targeting:**
- ✅ `rdid` + `idtype` - Platform-specific advertising IDs
- ✅ `is_lat` - Limit Ad Tracking setting
- ✅ Device markers (`is_roku_tv`, `is_android_tv`, etc.)
- ✅ Screen capabilities and HDR support

#### **Video Content Parameters:**
- ✅ `vid` - Video content identifier
- ✅ `cmsid` - Content management system ID
- ✅ `vpos` - Ad position (preroll/midroll/postroll)
- ✅ `plcmt` - Placement type (in-stream)
- ✅ `vpa` / `vpmute` - Auto-play and mute settings

#### **Privacy & Compliance:**
- ✅ `us_privacy` - CCPA compliance string
- ✅ `gdpr` + `gdpr_consent` - GDPR TCF v2.0 compliance
- ✅ `tfua` - Tag for users under age of consent
- ✅ `omidpn` + `omidpv` - Open Measurement integration

#### **PAL SDK Integration:**
- ✅ `pal_nonce` - PAL-generated privacy nonce
- ✅ `pal_session_id` - PAL session identifier
- ✅ Real-time verification and event tracking

## Configuration

### AdX Settings
```typescript
interface AdXConfig {
  publisherId: string;        // Google Publisher ID (pub-xxx)
  adUnitPath: string;         // Ad unit path (/networkcode/adunit)
  networkCode: string;        // Google Ad Manager network code
  serviceAccountKey?: string; // Optional service account for authentication
  enablePAL: boolean;         // Enable PAL SDK integration
  palConfig?: PALConfig;      // PAL-specific configuration
}
```

### PAL Configuration
```typescript
interface PALConfig {
  descriptionUrl: string;     // Content description URL
  privacyPolicy: string;      // Privacy policy URL
  playerType: 'ctv';          // Player type (CTV)
  playerName: string;         // Player name
  playerVersion: string;      // Player version
  videoWidth: number;         // Video width (1920)
  videoHeight: number;        // Video height (1080)
  videoTitle?: string;        // Content title
  videoDescription?: string;  // Content description
  videoDuration?: number;     // Content duration in seconds
  contentRating?: string;     // Content rating (G, PG, PG-13, R, NC-17)
  isLive?: boolean;          // Live content flag
}
```

## API Endpoints

### PAL SDK Endpoints

#### Generate PAL Nonce
```http
POST /api/adx/pal/nonce
Content-Type: application/json

{
  "descriptionUrl": "https://your-domain.com",
  "privacyPolicy": "https://your-domain.com/privacy",
  "playerType": "ctv",
  "playerName": "CTV Player",
  "playerVersion": "1.0.0",
  "videoWidth": 1920,
  "videoHeight": 1080
}
```

**Response:**
```json
{
  "nonce": "pal_abc123_1234567890",
  "adSessionId": "sess_def456_1234567890",
  "videoSessionId": "vid_ghi789_1234567890",
  "settings": {
    "numRedirectsRemaining": 5,
    "enabledEventTypes": ["start", "complete", "error"],
    "nonceExpiry": 1234567890000
  }
}
```

#### Verify PAL Ad Session
```http
POST /api/adx/pal/verify
Content-Type: application/json

{
  "adSessionId": "sess_def456_1234567890",
  "nonce": "pal_abc123_1234567890"
}
```

**Response:**
```json
{
  "verified": true,
  "adSessionId": "sess_def456_1234567890",
  "impressionUrl": "https://googleads.g.doubleclick.net/..."
}
```

### AdX Request Endpoint

#### Request Ads from Google AdX
```http
POST /api/adx/request
Content-Type: application/json

{
  "adxConfig": {
    "publisherId": "pub-1234567890123456",
    "adUnitPath": "/12345678/ctv_video_ads",
    "networkCode": "12345678",
    "enablePAL": true,
    "palConfig": { ... }
  },
  "adRequest": {
    "adUnitCode": "/12345678/ctv_video_ads",
    "sizes": [[1920, 1080]],
    "video": {
      "playerSize": [[1920, 1080]],
      "context": "instream",
      "mimes": ["video/mp4", "video/webm"],
      "protocols": [2, 3, 5, 6],
      "minduration": 15,
      "maxduration": 60
    }
  },
  "ctvProvider": "roku"
}
```

**Response:**
```json
{
  "id": "adx_abc123_1234567890",
  "ads": [{
    "requestId": "adx_abc123_1234567890",
    "adUnitCode": "/12345678/ctv_video_ads",
    "cpm": 5.25,
    "currency": "USD",
    "width": 1920,
    "height": 1080,
    "vastXml": "<?xml version=\"1.0\"?>...",
    "creativeId": "adx_creative_def456",
    "netRevenue": true,
    "ttl": 300,
    "meta": {
      "advertiserDomains": ["example.com"],
      "brandName": "Sample Brand",
      "networkName": "Google AdX",
      "mediaType": "video"
    },
    "pal": {
      "verified": true,
      "adSessionId": "sess_def456_1234567890",
      "impressionUrl": "https://googleads.g.doubleclick.net/..."
    }
  }]
}
```

### CTV Provider Endpoints

#### Get All CTV Providers
```http
GET /api/adx/providers
```

**Response:**
```json
{
  "roku": {
    "name": "Roku",
    "type": "roku",
    "userAgent": "Roku/DVP-12.0 (12.0.0.4182-88)",
    "capabilities": {
      "drm": ["PlayReady", "Widevine"],
      "video": {
        "codecs": ["H.264", "H.265", "VP9"],
        "profiles": ["Main", "High"],
        "hdr": true,
        "resolution": ["1920x1080", "3840x2160"]
      },
      "audio": {
        "codecs": ["AAC", "AC3", "EAC3"],
        "channels": [2, 6, 8]
      }
    }
  }
}
```

#### Get Specific CTV Provider
```http
GET /api/adx/providers/roku
```

## Frontend Integration

### Using the AdX Configuration Panel

1. **Open the AdX + PAL Tab**: Click on the "AdX + PAL" tab in the left panel
2. **Configure AdX Settings**:
   - Enter your Google Publisher ID
   - Set the network code
   - Specify the ad unit path
3. **Configure PAL Settings**:
   - Enable PAL integration
   - Set content URLs and metadata
   - Configure video specifications
4. **Select CTV Provider**: Choose from available CTV platforms
5. **Test Configuration**: Click "Test AdX Request" to verify setup

### PAL Event Tracking

```typescript
import { PALEventTracker } from './utils/palService';

// Video playback events
PALEventTracker.onVideoStart();
PALEventTracker.onVideoEnd();
PALEventTracker.onPause();
PALEventTracker.onResume();

// Ad events
PALEventTracker.onAdBreakStart();
PALEventTracker.onAdStart('ad-id-123');
PALEventTracker.onAdEnd();
PALEventTracker.onAdBreakEnd();

// Error handling
PALEventTracker.onAdError(500, 'VAST parsing error');

// User interactions
PALEventTracker.onClick();
PALEventTracker.onVolumeChange(0.8);
PALEventTracker.onFullscreen(true);
```

## CTV Provider Configurations

### Roku
- **Device Type**: Roku streaming device
- **User Agent**: `Roku/DVP-12.0 (12.0.0.4182-88)`
- **Video Codecs**: H.264, H.265, VP9
- **DRM**: PlayReady, Widevine
- **Resolutions**: 1080p, 4K

### Samsung Tizen
- **Device Type**: Samsung Smart TV
- **User Agent**: `Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 Samsung`
- **Video Codecs**: H.264, H.265, VP9
- **DRM**: PlayReady, Widevine
- **Audio**: Enhanced DTS support

### LG webOS
- **Device Type**: LG Smart TV
- **User Agent**: `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 LG`
- **Video Codecs**: H.264, H.265, VP9
- **DRM**: PlayReady, Widevine
- **Features**: WebOS optimizations

### Amazon Fire TV
- **Device Type**: Fire TV Stick/Cube
- **User Agent**: `Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36 Fire TV`
- **Video Codecs**: H.264, H.265, VP9
- **DRM**: PlayReady, Widevine
- **Platform**: Android-based

### Android TV
- **Device Type**: Android TV device
- **User Agent**: `Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36`
- **Video Codecs**: H.264, H.265, VP9, AV1
- **DRM**: PlayReady, Widevine
- **Features**: Latest codec support

### Apple TV
- **Device Type**: Apple TV device
- **User Agent**: `AppleCoreMedia/1.0.0 (Apple TV; U; CPU OS 15_0)`
- **Video Codecs**: H.264, H.265
- **DRM**: FairPlay
- **Platform**: iOS-based

## Testing and Development

### Local Development Server

Start the test server with AdX endpoints:
```bash
npm run test-server
```

The server provides mock endpoints for:
- PAL nonce generation
- PAL session verification
- AdX ad requests
- CTV provider configurations

### Mock Responses

The test server provides realistic mock responses for development:
- Random CPM values ($1-$11)
- Sample VAST XML with tracking
- PAL verification simulation
- Provider-specific configurations

### Production Integration

For production use:
1. Replace mock endpoints with actual Google AdX URLs
2. Configure service account authentication
3. Implement real PAL SDK integration
4. Set up proper error handling and logging

## Compliance and Privacy

### PAL SDK Benefits
- **Audience Limiting**: Prevents over-targeting of users
- **Privacy Protection**: Reduces cross-site tracking
- **Transparency**: Provides verification mechanisms
- **Industry Standards**: Follows IAB and Google guidelines

### GDPR and Privacy
- Supports GDPR consent strings
- Handles TCF (Transparency and Consent Framework) data
- Provides privacy policy integration
- Enables user consent management

## Troubleshooting

### Common Issues

1. **PAL Nonce Generation Fails**
   - Verify description URL is accessible
   - Check privacy policy URL validity
   - Ensure player configuration is correct

2. **AdX Requests Timeout**
   - Check network connectivity
   - Verify publisher ID format
   - Confirm ad unit path structure

3. **CTV Provider Not Recognized**
   - Ensure provider exists in configuration
   - Check user agent string format
   - Verify capability specifications

### Debug Mode

Enable detailed logging in the browser console:
```typescript
localStorage.setItem('adx_debug', 'true');
localStorage.setItem('pal_debug', 'true');
```

## Support and Resources

- [Google AdX Documentation](https://developers.google.com/ad-exchange)
- [PAL SDK Documentation](https://developers.google.com/ad-manager/pal)
- [OpenRTB 2.5 Specification](https://www.iab.com/guidelines/openrtb/)
- [VAST 4.0 Specification](https://www.iab.com/guidelines/vast/)
- [OMID SDK Documentation](https://iabtechlab.com/standards/open-measurement-sdk/)

## Contributing

To extend CTV provider support or enhance AdX integration:

1. Add new provider configurations in `CTV_PROVIDERS`
2. Update user agent strings and capabilities
3. Test with the configuration panel
4. Update documentation

For PAL SDK enhancements:
1. Extend event tracking in `PALEventTracker`
2. Add new signal types to `PALService`
3. Update type definitions
4. Test with different CTV platforms 