export interface VastCreative {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  clickThroughUrl?: string;
  trackingEvents: {
    impression: string[];
    start: string[];
    complete: string[];
    firstQuartile: string[];
    midpoint: string[];
    thirdQuartile: string[];
  };
}

export interface VastResponse {
  version: string;
  ads: VastCreative[];
}

export function parseVastXml(vastXml: string): VastResponse | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(vastXml, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('VAST XML parsing error:', parseError.textContent);
      return null;
    }
    
    const vastElement = xmlDoc.querySelector('VAST');
    if (!vastElement) {
      console.error('No VAST element found');
      return null;
    }
    
    const version = vastElement.getAttribute('version') || '4.0';
    const ads: VastCreative[] = [];
    
    // Parse Ad elements
    const adElements = xmlDoc.querySelectorAll('Ad');
    
    adElements.forEach((adElement) => {
      const adId = adElement.getAttribute('id') || 'unknown';
      const inLineElement = adElement.querySelector('InLine');
      
      if (!inLineElement) {
        console.warn('No InLine element found in Ad');
        return;
      }
      
      // Extract ad title
      const adTitleElement = inLineElement.querySelector('AdTitle');
      const title = adTitleElement?.textContent || 'Untitled Ad';
      
      // Extract creatives
      const creativeElements = inLineElement.querySelectorAll('Creative');
      
      creativeElements.forEach((creativeElement) => {
        const linearElement = creativeElement.querySelector('Linear');
        
        if (!linearElement) {
          return;
        }
        
        // Extract duration
        const durationElement = linearElement.querySelector('Duration');
        const duration = durationElement?.textContent || '00:00:30';
        
        // Extract media files
        const mediaFiles = linearElement.querySelectorAll('MediaFile');
        let videoUrl = '';
        
        // Find the best media file (prefer MP4)
        for (const mediaFile of mediaFiles) {
          const type = mediaFile.getAttribute('type');
          const url = mediaFile.textContent?.trim();
          
          if (url && type === 'video/mp4') {
            videoUrl = url;
            break;
          } else if (url && !videoUrl) {
            videoUrl = url; // Fallback to any video
          }
        }
        
        if (!videoUrl) {
          console.warn('No suitable video URL found in MediaFiles');
          return;
        }
        
        // Extract click-through URL
        const clickThroughElement = linearElement.querySelector('ClickThrough');
        const clickThroughUrl = clickThroughElement?.textContent?.trim();
        
        // Extract tracking events
        const trackingEvents = {
          impression: [] as string[],
          start: [] as string[],
          complete: [] as string[],
          firstQuartile: [] as string[],
          midpoint: [] as string[],
          thirdQuartile: [] as string[]
        };
        
        // Impression tracking (from InLine level)
        const impressionElements = inLineElement.querySelectorAll('Impression');
        impressionElements.forEach((imp) => {
          const url = imp.textContent?.trim();
          if (url) trackingEvents.impression.push(url);
        });
        
        // Video tracking events
        const trackingEventElements = linearElement.querySelectorAll('TrackingEvents Tracking');
        trackingEventElements.forEach((tracking) => {
          const event = tracking.getAttribute('event');
          const url = tracking.textContent?.trim();
          
          if (url && event) {
            switch (event) {
              case 'start':
                trackingEvents.start.push(url);
                break;
              case 'complete':
                trackingEvents.complete.push(url);
                break;
              case 'firstQuartile':
                trackingEvents.firstQuartile.push(url);
                break;
              case 'midpoint':
                trackingEvents.midpoint.push(url);
                break;
              case 'thirdQuartile':
                trackingEvents.thirdQuartile.push(url);
                break;
            }
          }
        });
        
        const creative: VastCreative = {
          id: adId,
          title,
          duration,
          videoUrl,
          clickThroughUrl,
          trackingEvents
        };
        
        ads.push(creative);
      });
    });
    
    return {
      version,
      ads
    };
    
  } catch (error) {
    console.error('Error parsing VAST XML:', error);
    return null;
  }
}

export function fireTrackingPixel(url: string, eventType: string) {
  try {
    // Use image pixel for tracking
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Tracking fired: ${eventType} - ${url}`);
    };
    img.onerror = () => {
      console.warn(`❌ Tracking failed: ${eventType} - ${url}`);
    };
    img.src = url;
  } catch (error) {
    console.error(`Error firing tracking pixel for ${eventType}:`, error);
  }
}

export function formatDuration(duration: string): number {
  // Convert HH:MM:SS to seconds
  const parts = duration.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // MM:SS
  } else if (parts.length === 1) {
    return parts[0]; // SS
  }
  return 30; // Default fallback
} 