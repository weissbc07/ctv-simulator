import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8081;

// CTV Provider configurations
const CTV_PROVIDERS = {
  roku: {
    name: 'Roku',
    type: 'roku',
    userAgent: 'Roku/DVP-12.0 (12.0.0.4182-88)',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  samsung: {
    name: 'Samsung Tizen',
    type: 'tizen',
    userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 Samsung',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3', 'DTS'],
        channels: [2, 6, 8]
      }
    }
  },
  lg: {
    name: 'LG webOS',
    type: 'webos',
    userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 LG',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  firetv: {
    name: 'Amazon Fire TV',
    type: 'firetv',
    userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36 Fire TV',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9'],
        profiles: ['Main', 'High'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  androidtv: {
    name: 'Android TV',
    type: 'androidtv',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36',
    capabilities: {
      drm: ['PlayReady', 'Widevine'],
      video: {
        codecs: ['H.264', 'H.265', 'VP9', 'AV1'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  },
  appletv: {
    name: 'Apple TV',
    type: 'appletv',
    userAgent: 'AppleCoreMedia/1.0.0 (Apple TV; U; CPU OS 15_0)',
    capabilities: {
      drm: ['FairPlay'],
      video: {
        codecs: ['H.264', 'H.265'],
        profiles: ['Main', 'High', 'Main10'],
        hdr: true,
        resolution: ['1920x1080', '3840x2160']
      },
      audio: {
        codecs: ['AAC', 'AC3', 'EAC3'],
        channels: [2, 6, 8]
      }
    }
  }
};

// Helper functions
function generateRequestId() {
  return 'adx_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function generatePALNonce() {
  return 'pal_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function createMockAdXResponse(request, config) {
  const mockVastXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="adx_${generateRequestId()}">
    <InLine>
      <AdSystem>Google AdX</AdSystem>
      <AdTitle>Sample CTV Ad</AdTitle>
      <Impression><![CDATA[https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123456/?value=0&guid=ON&script=0]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://googleads.g.doubleclick.net/pagead/conversion/123456/?ev=start]]></Tracking>
              <Tracking event="complete"><![CDATA[https://googleads.g.doubleclick.net/pagead/conversion/123456/?ev=complete]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[https://example.com/click]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

  return {
    id: request.id || generateRequestId(),
    seatbid: [{
      bid: [{
        id: generateRequestId(),
        impid: '1',
        price: Math.random() * 10 + 1,
        adm: mockVastXml,
        crid: `adx_creative_${generateRequestId()}`,
        w: 1920,
        h: 1080,
        ext: {
          google: {
            line_item_id: Math.floor(Math.random() * 1000000),
            creative_id: Math.floor(Math.random() * 1000000),
            advertiser_id: Math.floor(Math.random() * 100000)
          }
        }
      }],
      seat: 'google_adx'
    }],
    ads: [{
      requestId: request.id || generateRequestId(),
      adUnitCode: config.adUnitPath,
      cpm: Math.random() * 10 + 1,
      currency: 'USD',
      width: 1920,
      height: 1080,
      vastXml: mockVastXml,
      creativeId: `adx_creative_${generateRequestId()}`,
      netRevenue: true,
      ttl: 300,
      meta: {
        advertiserDomains: ['example.com'],
        brandName: 'Sample Brand',
        networkName: 'Google AdX',
        mediaType: 'video'
      }
    }]
  };
}

// Mock OpenRTB response
const mockOpenRTBResponse = {
  id: "test-bid-response-001",
  seatbid: [
    {
      bid: [
        {
          id: "test-bid-001",
          impid: "test-imp-001",
          price: 2.50,
          adid: "test-ad-001",
          nurl: "https://example.com/win-notice",
          adm: `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="test-ad-001">
    <InLine>
      <AdSystem>Test SSP</AdSystem>
      <AdTitle>Test CTV Ad</AdTitle>
      <Impression><![CDATA[https://example.com/impression]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`,
          adomain: ["testadvertiser.com"],
          crid: "creative-001",
          w: 1920,
          h: 1080,
          ext: {
            advertiser_name: "Test Advertiser"
          }
        }
      ],
      seat: "test-seat-001"
    }
  ],
  bidid: "test-bidid-001",
  cur: "GBP"
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, X-Forwarded-For, Accept');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
  console.log('Headers:', req.headers);
  
  // Mock VAST endpoint
  if (pathname === '/vast' || pathname.includes('vast')) {
    res.setHeader('Content-Type', 'application/xml');
    
    // Simulate some response time
    setTimeout(() => {
      const vastPath = path.join(__dirname, 'public', 'sample-vast.xml');
      if (fs.existsSync(vastPath)) {
        const vastContent = fs.readFileSync(vastPath, 'utf8');
        res.writeHead(200);
        res.end(vastContent);
      } else {
        res.writeHead(404);
        res.end('VAST file not found');
      }
    }, Math.random() * 500 + 100); // 100-600ms delay
    
  // Google AdX + PAL API endpoints
  } else if (pathname.startsWith('/api/adx/')) {
    const subPath = pathname.replace('/api/adx/', '');
    
    if (subPath === 'pal/nonce') {
      // PAL nonce generation
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const palRequest = JSON.parse(body);
          console.log('PAL nonce request:', JSON.stringify(palRequest, null, 2));
          
          const palResponse = {
            nonce: generatePALNonce(),
            adSessionId: generateSessionId(),
            videoSessionId: generateSessionId(),
            settings: {
              numRedirectsRemaining: 5,
              enabledEventTypes: ['start', 'complete', 'error'],
              nonceExpiry: Date.now() + 3600000 // 1 hour
            }
          };
          
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(palResponse));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      
    } else if (subPath === 'pal/verify') {
      // PAL verification
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { adSessionId, nonce } = JSON.parse(body);
          console.log('PAL verification request:', { adSessionId, nonce });
          
          const verification = {
            verified: true,
            adSessionId: adSessionId,
            impressionUrl: `https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123456/?pal_session=${adSessionId}`
          };
          
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(verification));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      
    } else if (subPath === 'request') {
      // AdX ad request
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { adxConfig, adRequest, ctvProvider } = JSON.parse(body);
          console.log('AdX request received:');
          console.log('- Config:', JSON.stringify(adxConfig, null, 2));
          console.log('- Ad Request:', JSON.stringify(adRequest, null, 2));
          console.log('- CTV Provider:', ctvProvider);
          console.log('- Use Real GAM:', adxConfig.useRealGAM);
          
          // Get provider configuration
          const provider = CTV_PROVIDERS[ctvProvider] || CTV_PROVIDERS.roku;
          console.log('- Provider Details:', JSON.stringify(provider, null, 2));
          
          // Simulate response time
          setTimeout(() => {
            const response = createMockAdXResponse(adRequest, adxConfig);
            
            // Add PAL verification if enabled
            if (adxConfig.enablePAL && response.ads && response.ads.length > 0) {
              response.ads[0].pal = {
                verified: true,
                adSessionId: generateSessionId(),
                impressionUrl: `https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123456/?pal_verified=true`
              };
            }

            // Add GAM-specific response data
            if (adxConfig.useRealGAM) {
              response.source = 'Google Ad Manager';
              response.adUnitPath = adxConfig.adUnitPath;
              response.isRealGAM = true;
              
              // Simulate FailArmy specific response
              if (adxConfig.adUnitPath.includes('failarmy')) {
                response.ads[0].meta.brandName = 'FailArmy';
                response.ads[0].meta.advertiserDomains = ['failarmy.com'];
                response.ads[0].cpm = Math.random() * 5 + 2; // Higher CPM for real inventory
              }
            }
            
            console.log('AdX response:', JSON.stringify(response, null, 2));
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(response));
          }, Math.random() * 800 + 200);
          
        } catch (error) {
          console.error('Error processing AdX request:', error);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      
    } else if (subPath === 'providers') {
      // Get CTV providers
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(CTV_PROVIDERS));
      
    } else if (subPath.startsWith('providers/')) {
      // Get specific provider
      const providerId = subPath.replace('providers/', '');
      const provider = CTV_PROVIDERS[providerId];
      
      if (!provider) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Provider not found' }));
        return;
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(provider));
      
    } else if (subPath === 'health') {
      // AdX health check
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'Google AdX with PAL SDK',
        providers: Object.keys(CTV_PROVIDERS),
        timestamp: new Date().toISOString()
      }));
      
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'AdX endpoint not found' }));
    }
    
  // Mock OpenRTB endpoint (including Prebid Server)
  } else if (pathname === '/openrtb' || pathname.includes('openrtb') || pathname.includes('auction')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const bidRequest = JSON.parse(body);
        console.log('OpenRTB Request:', JSON.stringify(bidRequest, null, 2));
        
        res.setHeader('Content-Type', 'application/json');
        
        // Simulate response time
        setTimeout(() => {
          // Sometimes return no bid (10% chance)
          if (Math.random() < 0.1) {
            res.writeHead(204);
            res.end();
            return;
          }
          
          // Sometimes return error (5% chance)
          if (Math.random() < 0.05) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
          
          // Update response with request ID
          mockOpenRTBResponse.id = bidRequest.id;
          mockOpenRTBResponse.seatbid[0].bid[0].impid = bidRequest.imp[0].id;
          
          res.writeHead(200);
          res.end(JSON.stringify(mockOpenRTBResponse));
        }, Math.random() * 800 + 200); // 200-1000ms delay
        
      } catch (error) {
        console.error('Error parsing OpenRTB request:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    
  // Mock timeout endpoint (for testing)
  } else if (pathname === '/timeout') {
    // Don't respond to simulate timeout
    console.log('Simulating timeout - not responding');
    
  // Mock error endpoint (for testing)
  } else if (pathname === '/error') {
    res.writeHead(500);
    res.end('Internal Server Error');
    
  // Health check
  } else if (pathname === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      endpoints: {
        vast: 'http://localhost:8081/vast',
        openrtb: 'http://localhost:8081/openrtb',
        timeout: 'http://localhost:8081/timeout',
        error: 'http://localhost:8081/error',
        adx: {
          request: 'http://localhost:8081/api/adx/request',
          palNonce: 'http://localhost:8081/api/adx/pal/nonce',
          palVerify: 'http://localhost:8081/api/adx/pal/verify',
          providers: 'http://localhost:8081/api/adx/providers',
          health: 'http://localhost:8081/api/adx/health'
        }
      }
    }));
    
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 CTV Simulator Test Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  VAST: http://localhost:${PORT}/vast`);
  console.log(`  OpenRTB: http://localhost:${PORT}/openrtb`);
  console.log(`  Prebid Server: http://localhost:${PORT}/openrtb2/auction`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Timeout Test: http://localhost:${PORT}/timeout`);
  console.log(`  Error Test: http://localhost:${PORT}/error`);
  console.log('');
  console.log('🎯 Google AdX + PAL SDK endpoints:');
  console.log(`  AdX Request: http://localhost:${PORT}/api/adx/request`);
  console.log(`  PAL Nonce: http://localhost:${PORT}/api/adx/pal/nonce`);
  console.log(`  PAL Verify: http://localhost:${PORT}/api/adx/pal/verify`);
  console.log(`  CTV Providers: http://localhost:${PORT}/api/adx/providers`);
  console.log(`  AdX Health: http://localhost:${PORT}/api/adx/health`);
  console.log('');
  console.log('🎯 For Prebid Server testing, use: http://localhost:8081/openrtb2/auction');
  console.log('🔒 For AdX + PAL testing, configure in the AdX + PAL tab!');
  console.log('Use these endpoints in the CTV Simulator for testing!');
}); 