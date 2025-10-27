// src/components/AdminAnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Eye, MousePointer, TrendingUp, Users, Download, Trash2, Clock, Globe, Image, Search, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
  conversions: number;
  avgSessionDuration: number;
  bounceRate: number;
  totalSearches: number;
  galleryInteractions: number;
  topPages: Array<{ page: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  dailyViews: Array<{ date: string; views: number; visitors: number }>;
  hourlyViews: Array<{ hour: string; count: number }>;
  conversionsByType: Array<{ type: string; count: number }>;
  topSearchTerms: Array<{ term: string; count: number }>;
  topClickedElements: Array<{ element: string; count: number }>;
  galleryStats: Array<{ image: string; views: number; clicks: number }>;
  referrers: Array<{ source: string; count: number }>;
  performanceMetrics: {
    avgLoadTime: number;
    slowestPages: Array<{ page: string; time: number }>;
  };
}

export const AdminAnalyticsDashboard = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString();

      // Fetch page views
      const { data: pageViewsData, count: pageViewsCount } = await supabase
        .from('page_analytics')
        .select('*', { count: 'exact' })
        .gte('timestamp', startDate);

      // Fetch unique visitors
      const { data: visitorsData, count: visitorsCount } = await supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact' })
        .gte('first_visit', startDate);

      // Fetch clicks
      const { data: clicksData, count: clicksCount } = await supabase
        .from('click_analytics')
        .select('*', { count: 'exact' })
        .gte('timestamp', startDate);

      // Fetch conversions
      const { data: conversionsData, count: conversionsCount } = await supabase
        .from('conversion_events')
        .select('*', { count: 'exact' })
        .gte('timestamp', startDate);

      // Fetch gallery interactions
      const { data: galleryData, count: galleryCount } = await supabase
        .from('gallery_interactions')
        .select('*', { count: 'exact' })
        .gte('timestamp', startDate);

      // Fetch search analytics
      const { data: searchData, count: searchCount } = await supabase
        .from('search_analytics')
        .select('*', { count: 'exact' })
        .gte('timestamp', startDate);

      // Calculate average session duration
      const avgDuration = visitorsData?.reduce((sum, visitor) => {
        const duration = new Date(visitor.last_visit).getTime() - new Date(visitor.first_visit).getTime();
        return sum + duration;
      }, 0) || 0;
      const avgSessionDuration = visitorsData?.length ? Math.round(avgDuration / visitorsData.length / 1000) : 0;

      // Calculate bounce rate
      const bounces = visitorsData?.filter(v => v.page_count === 1).length || 0;
      const bounceRate = visitorsData?.length ? Math.round((bounces / visitorsData.length) * 100) : 0;

      // Top pages
      const topPages = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.page_name] = (acc[item.page_name] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([page, count]) => ({ page, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top countries
      const topCountries = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          if (item.country && item.country !== 'unknown') {
            acc[item.country] = (acc[item.country] || 0) + 1;
          }
          return acc;
        }, {})
      )
        .map(([country, count]) => ({ country, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top cities
      const topCities = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          if (item.city && item.city !== 'unknown') {
            acc[item.city] = (acc[item.city] || 0) + 1;
          }
          return acc;
        }, {})
      )
        .map(([city, count]) => ({ city, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Device stats
      const deviceStats = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.device_type] = (acc[item.device_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([device, count]) => ({ device, count: count as number }));

      // Browser stats
      const browserStats = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          if (item.browser) {
            acc[item.browser] = (acc[item.browser] || 0) + 1;
          }
          return acc;
        }, {})
      )
        .map(([browser, count]) => ({ browser, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Daily views with unique visitors
      const dailyData: Record<string, { views: number; visitors: Set<string> }> = {};
      (pageViewsData || []).forEach((item: any) => {
        const date = new Date(item.timestamp).toLocaleDateString('fr-FR');
        if (!dailyData[date]) {
          dailyData[date] = { views: 0, visitors: new Set() };
        }
        dailyData[date].views++;
        if (item.session_id) dailyData[date].visitors.add(item.session_id);
      });

      const dailyViews = Object.entries(dailyData)
        .map(([date, data]) => ({ 
          date, 
          views: data.views,
          visitors: data.visitors.size 
        }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

      // Hourly distribution
      const hourlyData: Record<string, number> = {};
      (pageViewsData || []).forEach((item: any) => {
        const hour = new Date(item.timestamp).getHours();
        const hourStr = `${hour}h`;
        hourlyData[hourStr] = (hourlyData[hourStr] || 0) + 1;
      });

      const hourlyViews = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}h`,
        count: hourlyData[`${i}h`] || 0
      }));

      // Conversions by type
      const conversionsByType = Object.entries(
        (conversionsData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.event_type] = (acc[item.event_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({ type, count: count as number }));

      // Top search terms
      const topSearchTerms = Object.entries(
        (searchData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.query] = (acc[item.query] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([term, count]) => ({ term, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top clicked elements
      const topClickedElements = Object.entries(
        (clicksData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.element_text || item.element_id] = (acc[item.element_text || item.element_id] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([element, count]) => ({ element, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Gallery stats
      const galleryStatsMap: Record<string, { views: number; clicks: number }> = {};
      (galleryData || []).forEach((item: any) => {
        if (!galleryStatsMap[item.image_id]) {
          galleryStatsMap[item.image_id] = { views: 0, clicks: 0 };
        }
        if (item.interaction_type === 'view') galleryStatsMap[item.image_id].views++;
        if (item.interaction_type === 'click') galleryStatsMap[item.image_id].clicks++;
      });

      const galleryStats = Object.entries(galleryStatsMap)
        .map(([image, stats]) => ({ image, ...stats }))
        .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks))
        .slice(0, 10);

      // Referrers
      const referrers = Object.entries(
        (pageViewsData || []).reduce((acc: Record<string, number>, item: any) => {
          const ref = item.referrer || 'Direct';
          acc[ref] = (acc[ref] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([source, count]) => ({ source, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Performance metrics
      const { data: perfData } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate);

      const avgLoadTime = perfData?.length 
        ? Math.round(perfData.reduce((sum, item) => sum + (item.load_time || 0), 0) / perfData.length)
        : 0;

      const slowestPages = Object.entries(
        (perfData || []).reduce((acc: Record<string, { total: number; count: number }>, item: any) => {
          if (!acc[item.page_name]) {
            acc[item.page_name] = { total: 0, count: 0 };
          }
          acc[item.page_name].total += item.load_time || 0;
          acc[item.page_name].count++;
          return acc;
        }, {})
      )
        .map(([page, data]) => ({ page, time: Math.round(data.total / data.count) }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

      setAnalytics({
        pageViews: pageViewsCount || 0,
        uniqueVisitors: visitorsCount || 0,
        clicks: clicksCount || 0,
        conversions: conversionsCount || 0,
        avgSessionDuration,
        bounceRate,
        totalSearches: searchCount || 0,
        galleryInteractions: galleryCount || 0,
        topPages,
        topCountries,
        topCities,
        deviceStats,
        browserStats,
        dailyViews,
        hourlyViews,
        conversionsByType,
        topSearchTerms,
        topClickedElements,
        galleryStats,
        referrers,
        performanceMetrics: { avgLoadTime, slowestPages }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analytics) return;

    const report = {
      generatedAt: new Date().toISOString(),
      dateRange: `${dateRange} jours`,
      stats: analytics,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClearAnalytics = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les données d\'analyse ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    try {
      const tables = [
        'page_analytics',
        'visitor_sessions',
        'click_analytics',
        'gallery_interactions',
        'search_analytics',
        'conversion_events',
        'performance_metrics'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .gt('id', '');
        
        if (error) throw error;
      }

      toast({
        title: "Données d'analyse supprimées",
        description: "Toutes les données d'analyse ont été effacées avec succès"
      });

      setAnalytics(null);
      await fetchAnalytics();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Chargement des analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Erreur lors du chargement des données</div>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  dateRange === days
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {days}j
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleClearAnalytics}
            variant="destructive"
            size="sm"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Effacer
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { icon: Eye, label: 'Vues', value: analytics.pageViews, color: 'bg-blue-500/10 text-blue-600', format: 'number' },
          { icon: Users, label: 'Visiteurs', value: analytics.uniqueVisitors, color: 'bg-purple-500/10 text-purple-600', format: 'number' },
          { icon: MousePointer, label: 'Clics', value: analytics.clicks, color: 'bg-pink-500/10 text-pink-600', format: 'number' },
          { icon: TrendingUp, label: 'Conversions', value: analytics.conversions, color: 'bg-green-500/10 text-green-600', format: 'number' },
          { icon: Clock, label: 'Durée moy.', value: analytics.avgSessionDuration, color: 'bg-orange-500/10 text-orange-600', format: 'duration' },
          { icon: Activity, label: 'Taux rebond', value: analytics.bounceRate, color: 'bg-red-500/10 text-red-600', format: 'percent' },
          { icon: Search, label: 'Recherches', value: analytics.totalSearches, color: 'bg-cyan-500/10 text-cyan-600', format: 'number' },
          { icon: Image, label: 'Galerie', value: analytics.galleryInteractions, color: 'bg-indigo-500/10 text-indigo-600', format: 'number' }
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-lg border border-border ${metric.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs opacity-80">{metric.label}</p>
              <metric.icon className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-2xl font-bold">
              {metric.format === 'number' && metric.value.toLocaleString('fr-FR')}
              {metric.format === 'duration' && formatDuration(metric.value)}
              {metric.format === 'percent' && `${metric.value}%`}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Traffic */}
        {analytics.dailyViews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border lg:col-span-2"
          >
            <h3 className="font-semibold mb-4">Trafic quotidien</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyViews}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Vues"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                  name="Visiteurs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Hourly Distribution */}
        {analytics.hourlyViews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Distribution horaire</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Device Stats */}
        {analytics.deviceStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Appareils</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.deviceStats}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.deviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Browser Stats */}
        {analytics.browserStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Navigateurs</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.browserStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="browser" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top Pages */}
        {analytics.topPages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Pages populaires</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topPages.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="page" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Conversions */}
        {analytics.conversionsByType.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Conversions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.conversionsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Referrers */}
        {analytics.referrers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Sources de trafic</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.referrers.slice(0, 6)}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.referrers.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top Countries */}
        {analytics.topCountries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <h3 className="font-semibold mb-4">Pays</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topCountries.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" />
                <YAxis dataKey="country" type="category" stroke="var(--muted-foreground)" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar dataKey="count" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}