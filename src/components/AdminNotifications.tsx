import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Wrench,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const NOTIFICATION_TYPES = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-500', border: 'border-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-500' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500', border: 'border-green-500' },
  maintenance: { icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-500', border: 'border-purple-500' },
};

export const AdminNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    message_fr: '',
    message_en: '',
    type: 'info',
    link_url: '',
    link_text_fr: '',
    link_text_en: '',
    is_active: true,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: '',
      title_en: '',
      message_fr: '',
      message_en: '',
      type: 'info',
      link_url: '',
      link_text_fr: '',
      link_text_en: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('notifications').update(formData).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Notification mise à jour' });
      } else {
        const { error } = await supabase.from('notifications').insert([
          {
            ...formData,
            start_date: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
        toast({ title: 'Notification créée' });
      }
      resetForm();
      fetchNotifications();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  const handleEdit = (notif) => {
    setFormData({
      title_fr: notif.title_fr,
      title_en: notif.title_en,
      message_fr: notif.message_fr,
      message_en: notif.message_en,
      type: notif.type,
      link_url: notif.link_url || '',
      link_text_fr: notif.link_text_fr || '',
      link_text_en: notif.link_text_en || '',
      is_active: notif.is_active,
    });
    setEditingId(notif.id);
    setShowForm(true);
  };

  const handleDuplicate = (notif) => {
    setFormData({
      title_fr: notif.title_fr + ' (copie)',
      title_en: notif.title_en + ' (copy)',
      message_fr: notif.message_fr,
      message_en: notif.message_en,
      type: notif.type,
      link_url: notif.link_url || '',
      link_text_fr: notif.link_text_fr || '',
      link_text_en: notif.link_text_en || '',
      is_active: false,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette notification ?')) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Notification supprimée' });
      fetchNotifications();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast({
        title: currentStatus ? 'Notification désactivée' : 'Notification activée',
      });
      fetchNotifications();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Créez ou gérez vos notifications actives
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle notification
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-lg p-6 overflow-hidden"
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre (Français)</Label>
                  <Input
                    value={formData.title_fr}
                    onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Titre (Anglais)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Message (Français)</Label>
                  <Textarea
                    value={formData.message_fr}
                    onChange={(e) => setFormData({ ...formData, message_fr: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label>Message (Anglais)</Label>
                  <Textarea
                    value={formData.message_en}
                    onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="info">Information</option>
                  <option value="warning">Avertissement</option>
                  <option value="success">Succès</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <Label className="mb-2 block">Lien externe (optionnel)</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="URL"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  />
                  <Input
                    placeholder="Texte du lien (FR)"
                    value={formData.link_text_fr}
                    onChange={(e) => setFormData({ ...formData, link_text_fr: e.target.value })}
                  />
                  <Input
                    placeholder="Texte du lien (EN)"
                    value={formData.link_text_en}
                    onChange={(e) => setFormData({ ...formData, link_text_en: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Activer immédiatement
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit}>{editingId ? 'Mettre à jour' : 'Créer'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const typeConfig = NOTIFICATION_TYPES[notif.type];
          const Icon = typeConfig.icon;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border-l-4 ${typeConfig.border} rounded-lg p-4 ${
                notif.is_active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${typeConfig.bg} bg-opacity-10 mt-1`}>
                    <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{notif.title_fr}</h3>
                      {notif.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message_fr}</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(notif.id, notif.is_active)}
                    title={notif.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {notif.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(notif)} title="Dupliquer">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(notif)} title="Éditer">
                    <Plus className="w-4 h-4 rotate-45" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(notif.id)} title="Supprimer">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune notification créée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;