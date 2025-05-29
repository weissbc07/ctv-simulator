# CTV Simulator - Vercel Deployment Guide

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
│   └── test-server.js     # API endpoints for testing
├── src/                   # React application source
├── public/               # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and scripts
```

## API Endpoints

Once deployed, the following API endpoints will be available:

- **VAST**: `https://your-app.vercel.app/api/vast`
- **OpenRTB**: `https://your-app.vercel.app/api/openrtb2/auction`
- **Health Check**: `https://your-app.vercel.app/api/health`
- **Timeout Test**: `https://your-app.vercel.app/api/timeout`
- **Error Test**: `https://your-app.vercel.app/api/error`

## Configuration

### Prebid Server Endpoints
The application includes several prebid server endpoints:

1. **Vercel API (Production)** - Your deployed API
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
1. One Tag
2. PubMatic
3. Rise
4. Xandr Monetise (AppNexus)
5. Magnite (Rubicon)
6. Sovrn
7. Amx
8. Aniview

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

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure API endpoints have proper CORS headers
   - Check Vercel function configuration

2. **Timeout Issues**
   - Adjust timeout settings in prebid configuration
   - Monitor Vercel function execution time

3. **Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

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