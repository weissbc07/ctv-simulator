import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8081;

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
        error: 'http://localhost:8081/error'
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
  console.log('🎯 For Prebid Server testing, use: http://localhost:8081/openrtb2/auction');
  console.log('Use these endpoints in the CTV Simulator for testing!');
}); 