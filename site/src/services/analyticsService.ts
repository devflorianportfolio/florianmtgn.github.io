// src/services/analyticsService.ts
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get user IP (via external service)
const getUserIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

// Parse user agent to extract device type and browser
const parseUserAgent = (userAgent: string) => {
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const isTablet = /ipad|android/i.test(userAgent);
  
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  return { deviceType, browser };
};

// Get visitor geolocation (via IP geolocation service)
const getGeolocation = async (ip: string) => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      country: data.country_name || 'unknown',
      city: data.city || 'unknown'
    };
  } catch (error) {
    return { country: 'unknown', city: 'unknown' };
  }
};

// Track page view
export const trackPageView = async (pageName: string) => {
  try {
    const sessionId = getSessionId();
    const ip = await getUserIp();
    const { deviceType } = parseUserAgent(navigator.userAgent);
    const { country, city } = await getGeolocation(ip);

    // Update or create visitor session
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingSession) {
      await supabase
        .from('visitor_sessions')
        .update({
          last_visit: new Date().toISOString(),
          page_views: existingSession.page_views + 1
        })
        .eq('session_id', sessionId);
    } else {
      await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          ip_address: ip,
          country,
          city,
          device_type: deviceType,
          browser: parseUserAgent(navigator.userAgent).browser
        });
    }

    // Track page view
    await supabase.from('page_analytics').insert({
      page_name: pageName,
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      ip_address: ip,
      session_id: sessionId,
      country,
      city,
      device_type: deviceType
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track click
export const trackClick = async (
  elementType: string,
  elementId?: string,
  elementName?: string
) => {
  try {
    const sessionId = getSessionId();
    const ip = await getUserIp();

    await supabase.from('click_analytics').insert({
      element_type: elementType,
      element_id: elementId,
      element_name: elementName,
      user_agent: navigator.userAgent,
      session_id: sessionId,
      ip_address: ip
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

// Track search
export const trackSearch = async (query: string, resultsCount: number) => {
  try {
    const sessionId = getSessionId();
    const ip = await getUserIp();

    await supabase.from('search_analytics').insert({
      search_query: query,
      results_count: resultsCount,
      session_id: sessionId,
      ip_address: ip
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

// Track gallery interaction
export const trackGalleryInteraction = async (
  imageId: string,
  interactionType: 'view' | 'click' | 'lightbox_open',
  durationSeconds?: number
) => {
  try {
    const sessionId = getSessionId();
    const ip = await getUserIp();

    await supabase.from('gallery_interactions').insert({
      image_id: imageId,
      interaction_type: interactionType,
      session_id: sessionId,
      ip_address: ip,
      duration_seconds: durationSeconds
    });
  } catch (error) {
    console.error('Error tracking gallery interaction:', error);
  }
};

// Track conversion event
export const trackConversionEvent = async (eventType: string, eventValue?: string) => {
  try {
    const sessionId = getSessionId();
    const ip = await getUserIp();

    await supabase.from('conversion_events').insert({
      event_type: eventType,
      event_value: eventValue,
      session_id: sessionId,
      ip_address: ip
    });
  } catch (error) {
    console.error('Error tracking conversion event:', error);
  }
};

// Track performance metrics
export const trackPerformanceMetrics = async (pageName: string) => {
  try {
    const sessionId = getSessionId();

    // Wait for page to load
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        supabase.from('performance_metrics').insert({
          page_name: pageName,
          load_time_ms: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          first_contentful_paint_ms: Math.round(
            performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          ),
          session_id: sessionId
        }).catch(err => console.error('Error tracking performance:', err));
      }
    });
  } catch (error) {
    console.error('Error setting up performance tracking:', error);
  }
};

// Get analytics summary (for admin dashboard)
export const getAnalyticsSummary = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [pageViews, uniqueVisitors, clicks, conversions, topPages, topCountries] = await Promise.all([
      supabase
        .from('page_analytics')
        .select('*', { count: 'exact' })
        .gte('timestamp', thirtyDaysAgo),
      supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact' })
        .gte('first_visit', thirtyDaysAgo),
      supabase
        .from('click_analytics')
        .select('*', { count: 'exact' })
        .gte('timestamp', thirtyDaysAgo),
      supabase
        .from('conversion_events')
        .select('*', { count: 'exact' })
        .gte('timestamp', thirtyDaysAgo),
      supabase
        .from('page_analytics')
        .select('page_name')
        .gte('timestamp', thirtyDaysAgo)
        .order('timestamp', { ascending: false })
        .limit(100),
      supabase
        .from('page_analytics')
        .select('country')
        .gte('timestamp', thirtyDaysAgo)
        .limit(100)
    ]);

    return {
      pageViews: pageViews.count || 0,
      uniqueVisitors: uniqueVisitors.count || 0,
      clicks: clicks.count || 0,
      conversions: conversions.count || 0
    };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }
};