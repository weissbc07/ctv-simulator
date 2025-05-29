// VAST XML template for testing
const VAST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="ctv-simulator-ad">
    <InLine>
      <AdSystem version="1.0">CTV Simulator</AdSystem>
      <AdTitle>Test CTV Ad</AdTitle>
      <Description>Sample CTV advertisement for testing</Description>
      <Advertiser>CTV Simulator</Advertiser>
      <Pricing model="CPM" currency="GBP">
        <![CDATA[2.50]]>
      </Pricing>
      <Survey>
        <![CDATA[https://example.com/survey]]>
      </Survey>
      <Error>
        <![CDATA[https://example.com/error]]>
      </Error>
      <Impression>
        <![CDATA[https://example.com/impression]]>
      </Impression>
      <Creatives>
        <Creative id="ctv-creative-001" sequence="1">
          <Linear>
            <Duration>00:00:30</Duration>
            <TrackingEvents>
              <Tracking event="start">
                <![CDATA[https://example.com/tracking/start]]>
              </Tracking>
              <Tracking event="firstQuartile">
                <![CDATA[https://example.com/tracking/firstQuartile]]>
              </Tracking>
              <Tracking event="midpoint">
                <![CDATA[https://example.com/tracking/midpoint]]>
              </Tracking>
              <Tracking event="thirdQuartile">
                <![CDATA[https://example.com/tracking/thirdQuartile]]>
              </Tracking>
              <Tracking event="complete">
                <![CDATA[https://example.com/tracking/complete]]>
              </Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough>
                <![CDATA[https://example.com/clickthrough]]>
              </ClickThrough>
              <ClickTracking>
                <![CDATA[https://example.com/clicktracking]]>
              </ClickTracking>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" bitrate="1500" width="1920" height="1080" scalable="true" maintainAspectRatio="true">
                <![CDATA[https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Forwarded-For');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log(`${new Date().toISOString()} - ${req.method} /api/vast`);
  console.log('Headers:', req.headers);

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(VAST_XML);
} 