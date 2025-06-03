# CTV Simulator - Vercel Deployment Guide

## 🚀 Live Deployment

**Production URL**: https://ctv-simulator.vercel.app

## API Endpoints

The following API endpoints are now live and functional:

- **VAST**: `https://ctv-simulator.vercel.app/api/vast`
- **OpenRTB Auction**: `https://ctv-simulator.vercel.app/api/openrtb2/auction`
- **Health Check**: `https://ctv-simulator.vercel.app/api/health`

## Overview
This guide explains how to deploy the CTV Simulator to Vercel with full prebid server functionality.

## Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository set up

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Configure Domain (Optional)
If you want to use a custom domain, configure it in the Vercel dashboard.

## Project Structure

```
ctv-simulator/
├── api/                    # Vercel serverless functions
│   ├── health.js          # Health check endpoint
│   ├── vast.js            # VAST XML endpoint
│   └── openrtb2/
│       └── auction.js     # OpenRTB auction endpoint
├── src/                   # React application source
├── public/               # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and scripts
```

## Configuration

### Prebid Server Endpoints
The application includes several prebid server endpoints:

1. **Vercel API (Production)** - `https://ctv-simulator.vercel.app/api/openrtb2/auction`
2. **Local Test Server** - For development
3. **Prebid Server (US East)** - Rubicon's US server
4. **Prebid Server (EU)** - Rubicon's EU server
5. **AppNexus Prebid Server** - AppNexus server
6. **Custom Prebid Server** - Configurable endpoint

### Default Configuration
- **Device**: Samsung Smart TV (Tizen 6.0)
- **Location**: London, UK
- **IP**: UK-based IP address
- **User Agent**: Samsung Smart TV user agent
- **GDPR**: Enabled with consent string
- **Default Endpoint**: Vercel Production API

## Features

### CTV Device Simulation
- ✅ Samsung Smart TV emulation
- ✅ Tizen OS 6.0
- ✅ 1920x1080 resolution
- ✅ WiFi connection type
- ✅ CTV-specific device identifiers

### Prebid Integration
- ✅ 8 demand sources configured
- ✅ OpenRTB 2.5 compliant requests
- ✅ Supply chain object (schain)
- ✅ GDPR/CCPA compliance
- ✅ CTV-specific targeting

### Demand Sources
1. One Tag (pubId: 770a10a1445c7df)
2. PubMatic (adSlot: 6117737, publisherId: 165218)
3. Rise (org: 6761a6098eb1b90001e9b1b5)
4. Xandr Monetise/AppNexus (placementId: 35106313)
5. Magnite/Rubicon (accountId: 26742, siteId: 579542, zoneId: 3686138)
6. Sovrn (tagid: 1261560)
7. Amx (tagId: zOPvsVMV4)
8. Aniview (tagId: 67ea7a5e52e2cb011d0bbf78)

## Environment Variables

No environment variables are required for basic deployment. All configuration is handled through the UI.

## Monitoring

### Logs
- Check Vercel function logs in the dashboard
- Monitor API requests and responses
- Track prebid server performance

### Analytics
- Request/response times
- Success/error rates
- Demand source performance

## Testing the Deployment

### Health Check
```bash
curl https://ctv-simulator.vercel.app/api/health
```

### VAST Endpoint
```bash
curl https://ctv-simulator.vercel.app/api/vast
```

### OpenRTB Auction
```bash
curl -X POST https://ctv-simulator.vercel.app/api/openrtb2/auction \
  -H "Content-Type: application/json" \
  -d '{"id":"test-request","imp":[{"id":"test-imp"}]}'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - All API endpoints include proper CORS headers
   - Check browser console for specific errors

2. **Timeout Issues**
   - Adjust timeout settings in prebid configuration
   - Monitor Vercel function execution time (max 10s for hobby plan)

3. **Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Run `npm run build` locally first

### Support
For issues with deployment or configuration, check:
- Vercel documentation
- Project GitHub repository
- Prebid.js documentation

## Performance Optimization

### Caching
- Static assets are cached by Vercel CDN
- API responses include appropriate cache headers

### Bundle Size
- Tree-shaking enabled for optimal bundle size
- Video.js loaded efficiently

### Loading Speed
- Optimized for fast initial load
- Progressive enhancement for CTV features

## Security

### HTTPS
- All traffic encrypted via Vercel's SSL
- Secure API endpoints

### Privacy
- GDPR compliance built-in
- No personal data stored
- Consent management included

## Updates

To update the deployment:

```bash
git add .
git commit -m "Update CTV simulator"
git push origin main
vercel --prod
```

Vercel will automatically deploy updates when you push to your main branch.

## Success! 🎉

Your CTV Simulator is now live at: **https://ctv-simulator.vercel.app**

The application includes:
- Full CTV device emulation
- 8 prebid demand sources
- Supply chain transparency (schain)
- GDPR/CCPA compliance
- Real-time ad request testing
- Comprehensive logging and monitoring 