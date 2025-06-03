# Real Programmatic Video Advertising Setup Guide

## Overview

This guide shows you how to configure the CTV Simulator to connect to **real programmatic ad exchanges** for live video ad auctions instead of mock/simulated ads.

## Supported Real Ad Exchanges

✅ **Google Ad Exchange (AdX)** - Premium video inventory  
✅ **Amazon DSP** - Connected TV advertising platform  
✅ **The Trade Desk** - Programmatic advertising platform  
✅ **Magnite** (formerly Rubicon Project) - Header bidding  
✅ **PubMatic** - Programmatic monetization platform  
✅ **OpenX** - Real-time bidding platform

---

## Step 1: Enable Real Programmatic Mode

In the AdX Configuration Panel, check **"Enable Real Programmatic"** to switch from mock auctions to live exchanges.

---

## Step 2: Configure Ad Exchange Credentials

### Google Ad Exchange (AdX) Setup

1. **Create Google Cloud Project**
   ```bash
   # Install Google Cloud SDK
   curl https://sdk.cloud.google.com | bash
   gcloud auth login
   gcloud projects create your-ctv-project
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable adexchangebuyer.googleapis.com
   gcloud services enable doubleclick.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create ctv-adx-service
   gcloud projects add-iam-policy-binding your-ctv-project \
     --member="serviceAccount:ctv-adx-service@your-ctv-project.iam.gserviceaccount.com" \
     --role="roles/adexchangebuyer.buyer"
   ```

4. **Get Credentials**
   ```javascript
   // Add to config/real-programmatic-config.js
   exchangeCredentials: {
     google_adx: {
       clientId: 'your-google-client-id.googleusercontent.com',
       clientSecret: 'your-google-client-secret',
       refreshToken: 'your-refresh-token',
       networkCode: '22106938864', // Your GAM network code
       publisherId: 'your-publisher-id'
     }
   }
   ```

### Amazon DSP Setup

1. **Get Amazon Publisher Services Account**
   - Apply at: https://aps.amazon.com/

2. **Configure AWS Credentials**
   ```javascript
   exchangeCredentials: {
     amazon_dsp: {
       accessKeyId: 'AKIAXXXXXXXXXXXXXXXX',
       secretAccessKey: 'your-secret-access-key',
       region: 'us-east-1',
       publisherId: 'your-amazon-publisher-id',
       siteId: 'your-amazon-site-id'
     }
   }
   ```

### The Trade Desk Setup

1. **Get TTD Partner Account**
   - Contact The Trade Desk for API access

2. **Configure API Token**
   ```javascript
   exchangeCredentials: {
     trade_desk: {
       apiToken: 'your-ttd-api-token',
       partnerId: 'your-ttd-partner-id',
       advertiserId: 'your-ttd-advertiser-id'
     }
   }
   ```

### Magnite (Rubicon) Setup

1. **Get Magnite Publisher Account**
   - Apply at: https://www.magnite.com/

2. **Configure Site/Zone IDs**
   ```javascript
   exchangeCredentials: {
     magnite: {
       siteId: 'your-magnite-site-id',
       zoneId: 'your-magnite-zone-id',
       accountId: 'your-magnite-account-id',
       apiKey: 'your-magnite-api-key'
     }
   }
   ```

---

## Step 3: Set Floor Prices

Configure minimum CPM prices for your ad inventory:

```javascript
// In config/real-programmatic-config.js
floorPrices: {
  '/22106938864,22966701315/failarmy-auth-ctv-android': {
    currency: 'USD',
    price: 0.75  // $0.75 CPM minimum
  },
  '/22106938864,22966701315/premium-ctv-content': {
    currency: 'USD',
    price: 1.50  // $1.50 CPM for premium content
  }
}
```

---

## Step 4: Configure Private Marketplace (PMP) Deals

Set up direct deals with specific advertisers:

```javascript
pmpDeals: {
  'deal_premium_video_001': {
    dealId: 'deal_premium_video_001',
    advertiserId: 'nike_brand_advertising',
    price: 3.50,  // $3.50 CPM guaranteed
    currency: 'USD',
    exchanges: ['google_adx', 'trade_desk'],
    categories: ['sports', 'fitness'],
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  }
}
```

---

## Step 5: Test Real Programmatic Auctions

### Method 1: Using the Web Interface

1. Open http://localhost:3000
2. Go to **AdX + PAL** tab
3. Check **"Enable Real Programmatic"**
4. Select CTV provider (Roku, Samsung, etc.)
5. Click **"Test AdX Request"**

### Method 2: Using API Directly

```bash
# Test real programmatic auction
curl -X POST http://localhost:8081/api/adx/request \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "publisherId": "22106938864",
      "adUnitPath": "/22106938864,22966701315/failarmy-auth-ctv-android",
      "useRealProgrammatic": true,
      "floorPrice": 0.75,
      "realExchangeCredentials": {
        "google_adx": {
          "clientId": "your-client-id",
          "accessToken": "your-access-token",
          "networkCode": "22106938864"
        }
      }
    },
    "adRequest": {
      "adUnitCode": "/22106938864,22966701315/failarmy-auth-ctv-android",
      "sizes": [[1920, 1080]],
      "video": {
        "playerSize": [[1920, 1080]],
        "context": "instream",
        "mimes": ["video/mp4"],
        "protocols": [2, 3, 5, 6],
        "minduration": 15,
        "maxduration": 60
      }
    },
    "ctvProvider": "roku"
  }'
```

---

## Step 6: Monitor Real Auction Results

### Console Output Example
```
🚀 Starting REAL Programmatic Auction: auction_1748927209542_a1b2c3d4
📱 CTV Device: Roku Ultra 4K (roku)
📺 Content: FailArmy Comedy Fails - entertainment
📤 Sending bid request to Google Ad Exchange...
📤 Sending bid request to Amazon DSP...
📤 Sending bid request to The Trade Desk...
✅ Google Ad Exchange responded: 1 bids in 245.67ms
✅ Amazon DSP responded: 1 bids in 312.45ms
⚠️  The Trade Desk no bids
📊 Collected 2 exchange responses
🏆 Auction Winner: Google Ad Exchange - $2.34 CPM
📈 Total Bidders: 2 | Average Bid: $1.89
🎬 Retrieving VAST creative from Google Ad Exchange...
🏆 Auction Complete: 567.89ms
💰 Winner: Google Ad Exchange - $2.34 CPM
```

### Response Format
```json
{
  "id": "auction_1748927209542_a1b2c3d4",
  "ads": [{
    "requestId": "req_1748927209542_xyz789",
    "cpm": 2.34,
    "vastXml": "<VAST version='4.0'>...</VAST>",
    "meta": {
      "isRealProgrammatic": true,
      "brandName": "Google Ad Exchange"
    },
    "auction": {
      "totalBidders": 2,
      "clearingPrice": 2.34,
      "exchange": "Google Ad Exchange",
      "realTime": true
    }
  }],
  "isRealProgrammatic": true
}
```

---

## Step 7: Advanced Configuration

### Bid Adjustments
```javascript
rtbSettings: {
  bidAdjustments: {
    primetime: 1.30,     // 30% premium 6pm-11pm
    weekend: 1.20,       // 20% premium weekends
    liveContent: 1.35,   // 35% premium for live content
    hdr: 1.20,          // 20% premium for HDR content
    fourK: 1.30         // 30% premium for 4K content
  }
}
```

### Privacy Compliance
```javascript
privacySettings: {
  enableGDPR: true,
  enableCCPA: true,
  consentStrings: {
    gdpr: 'your-gdpr-consent-string',
    ccpa: 'your-ccpa-consent-string'
  }
}
```

---

## Troubleshooting

### No Bids Received
- Check exchange credentials are valid
- Verify floor prices aren't too high
- Ensure proper ad unit configuration
- Check network connectivity to exchanges

### Low CPM Prices
- Increase floor prices
- Add more premium exchanges
- Configure PMP deals
- Improve content categorization

### High Latency
- Reduce bid timeout settings
- Optimize parallel request handling
- Use regional exchange endpoints

---

## Production Deployment

### Environment Variables
```bash
# .env file
GOOGLE_ADX_CLIENT_ID=your-client-id
GOOGLE_ADX_CLIENT_SECRET=your-client-secret
AMAZON_DSP_ACCESS_KEY=your-access-key
AMAZON_DSP_SECRET_KEY=your-secret-key
TTD_API_TOKEN=your-api-token
```

### Security Best Practices
- Store credentials in environment variables
- Use HTTPS for all exchange communications
- Implement request rate limiting
- Monitor for unusual auction activity
- Regularly rotate API keys

---

## Success Metrics

- **Fill Rate**: % of requests that receive bids
- **Average CPM**: Revenue per thousand impressions  
- **Auction Speed**: Time to complete auctions
- **Exchange Diversity**: Number of active exchanges
- **VAST Delivery**: Successful video ad delivery rate

Ready to generate real revenue with live programmatic video ads! 🚀💰 