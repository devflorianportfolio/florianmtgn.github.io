-- ============================================
-- SCHÉMA SQL COMPLET POUR ANALYTICS DASHBOARD
-- ============================================

-- Table: page_analytics (vues de pages)
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  page_name TEXT NOT NULL,
  page_url TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
  browser TEXT, -- 'Chrome', 'Firefox', 'Safari', etc.
  os TEXT, -- 'Windows', 'MacOS', 'iOS', 'Android', etc.
  screen_resolution TEXT, -- '1920x1080'
  language TEXT, -- 'fr-FR', 'en-US', etc.
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_page_analytics_timestamp ON page_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON page_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_name ON page_analytics(page_name);
CREATE INDEX IF NOT EXISTS idx_page_analytics_country ON page_analytics(country);
CREATE INDEX IF NOT EXISTS idx_page_analytics_device ON page_analytics(device_type);

-- ============================================

-- Table: visitor_sessions (sessions visiteurs)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL,
  visitor_id TEXT, -- Cookie ou fingerprint unique
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  page_count INTEGER DEFAULT 1,
  is_returning BOOLEAN DEFAULT FALSE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_first_visit ON visitor_sessions(first_visit);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);

-- ============================================

-- Table: click_analytics (clics sur éléments)
CREATE TABLE IF NOT EXISTS click_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  element_id TEXT,
  element_text TEXT,
  element_type TEXT, -- 'button', 'link', 'image', etc.
  page_name TEXT NOT NULL,
  click_position JSONB, -- {x: 100, y: 200}
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_analytics_timestamp ON click_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_click_analytics_element ON click_analytics(element_id);
CREATE INDEX IF NOT EXISTS idx_click_analytics_page ON click_analytics(page_name);

-- ============================================

-- Table: gallery_interactions (interactions galerie)
CREATE TABLE IF NOT EXISTS gallery_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  image_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'lightbox_open', 'download'
  duration_seconds INTEGER, -- Durée de visionnage
  category TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_interactions_timestamp ON gallery_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_gallery_interactions_image ON gallery_interactions(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_interactions_type ON gallery_interactions(interaction_type);

-- ============================================

-- Table: search_analytics (recherches)
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_result TEXT, -- ID ou titre du résultat cliqué
  page_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);

-- ============================================

-- Table: conversion_events (conversions)
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  event_type TEXT NOT NULL, -- 'contact_form', 'email_click', 'social_click', 'download', etc.
  event_value TEXT,
  page_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_timestamp ON conversion_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);

-- ============================================

-- Table: performance_metrics (performance des pages)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  page_name TEXT NOT NULL,
  load_time INTEGER, -- Temps de chargement en ms
  dom_ready_time INTEGER, -- Temps DOM ready en ms
  first_paint INTEGER, -- First contentful paint en ms
  largest_contentful_paint INTEGER, -- LCP en ms
  cumulative_layout_shift DECIMAL, -- CLS score
  first_input_delay INTEGER, -- FID en ms
  connection_type TEXT, -- '4g', 'wifi', etc.
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page ON performance_metrics(page_name);

-- ============================================

-- Table: scroll_depth (profondeur de scroll)
CREATE TABLE IF NOT EXISTS scroll_depth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  page_name TEXT NOT NULL,
  max_depth_percent INTEGER, -- Pourcentage max de scroll (0-100)
  time_to_max_depth INTEGER, -- Temps pour atteindre max depth en secondes
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scroll_depth_timestamp ON scroll_depth(timestamp);
CREATE INDEX IF NOT EXISTS idx_scroll_depth_page ON scroll_depth(page_name);

-- ============================================

-- Table: error_logs (erreurs JavaScript)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  error_message TEXT,
  error_stack TEXT,
  page_name TEXT,
  browser TEXT,
  os TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_page ON error_logs(page_name);

-- ============================================
-- VUES MATERIALISÉES POUR PERFORMANCES
-- ============================================

-- Vue: statistiques quotidiennes
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_stats AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT page_name) as pages_viewed
FROM page_analytics
GROUP BY DATE(timestamp)
ORDER BY date DESC;

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Rafraîchir la vue (à exécuter périodiquement)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;

-- ============================================

-- Vue: top pages du mois
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_top_pages AS
SELECT 
  page_name,
  COUNT(*) as view_count,
  COUNT(DISTINCT session_id) as unique_visitors,
  DATE_TRUNC('month', timestamp) as month
FROM page_analytics
WHERE timestamp >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
GROUP BY page_name, DATE_TRUNC('month', timestamp)
ORDER BY view_count DESC;

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction: Calculer le taux de rebond
CREATE OR REPLACE FUNCTION calculate_bounce_rate(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS DECIMAL AS $$
DECLARE
  total_sessions INTEGER;
  bounce_sessions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_sessions
  FROM visitor_sessions
  WHERE first_visit >= start_date AND first_visit <= end_date;
  
  SELECT COUNT(*) INTO bounce_sessions
  FROM visitor_sessions
  WHERE first_visit >= start_date AND first_visit <= end_date
  AND page_count = 1;
  
  IF total_sessions = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((bounce_sessions::DECIMAL / total_sessions::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================

-- Fonction: Nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS VOID AS $$
BEGIN
  DELETE FROM page_analytics WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM visitor_sessions WHERE first_visit < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM click_analytics WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM gallery_interactions WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM search_analytics WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM conversion_events WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM scroll_depth WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  DELETE FROM error_logs WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scroll_depth ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs authentifiés peuvent lire toutes les données
CREATE POLICY "Admins can read all analytics" ON page_analytics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all sessions" ON visitor_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all clicks" ON click_analytics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all gallery" ON gallery_interactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all searches" ON search_analytics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all conversions" ON conversion_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all performance" ON performance_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all scroll" ON scroll_depth FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read all errors" ON error_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Politique: Tout le monde peut insérer (tracking anonyme)
CREATE POLICY "Anyone can insert analytics" ON page_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert sessions" ON visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert clicks" ON click_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert gallery" ON gallery_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert searches" ON search_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert conversions" ON conversion_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert performance" ON performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert scroll" ON scroll_depth FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert errors" ON error_logs FOR INSERT WITH CHECK (true);

-- Politique: Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete analytics" ON page_analytics FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete sessions" ON visitor_sessions FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete clicks" ON click_analytics FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete gallery" ON gallery_interactions FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete searches" ON search_analytics FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete conversions" ON conversion_events FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete performance" ON performance_metrics FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete scroll" ON scroll_depth FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete errors" ON error_logs FOR DELETE USING (auth.role() = 'authenticated');