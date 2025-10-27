import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle, Wrench } from 'lucide-react';

const NOTIFICATION_TYPES = {
  info: { icon: Info },
  warning: { icon: AlertTriangle },
  success: { icon: CheckCircle },
  maintenance: { icon: Wrench },
};

const useActiveNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchNotifications] Erreur:', error.message);
      return;
    }

    setNotifications(data || []);
  };

  return notifications;
};

export const NotificationBanner = () => {
  const notifications = useActiveNotifications();
  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem('dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const visible = notifications.filter((n) => !dismissedIds.includes(n.id));

  const dismiss = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 space-y-3 max-w-sm w-full sm:w-[22rem]">
      <AnimatePresence>
        {visible.map((n, i) => {
          const Icon = NOTIFICATION_TYPES[n.type]?.icon || Info;

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="group relative flex items-start gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-lg p-5 pr-12 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Bouton Fermer */}
              <button
                onClick={() => dismiss(n.id)}
                className="absolute top-3 right-3 p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-neutral-800 transition-all"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>

              {/* Icône */}
              <div className="flex items-center justify-center p-2 rounded-xl bg-neutral-800">
                <Icon className="w-6 h-6 text-neutral-200" />
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <h4 className="font-medium text-base text-white mb-2">
                  {n.title_fr}
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {n.message_fr}
                </p>

                {n.link_url && (
                  <a
                    href={n.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-neutral-100 hover:underline"
                  >
                    {n.link_text_fr || 'En savoir plus'}
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
