import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminNotification {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  readBy: string[];
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
      return;
    }

    setNotifications(
      (data || []).map((r: any) => {
        const readMatch = r.message.match(/\[READ:(.*?)\]/);
        const readBy = readMatch ? readMatch[1].split(',').filter(Boolean) : [];
        const cleanMessage = r.message.replace(/\[READ:.*?\]/g, '').trim();

        return {
          id: r.id,
          message: cleanMessage,
          isActive: r.is_active,
          createdAt: r.created_at,
          readBy
        };
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback(async (message: string) => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({ message })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Gagal menambah notifikasi.', variant: 'destructive' });
      return;
    }

    setNotifications((prev) => [
      { id: data.id, message: data.message, isActive: data.is_active, createdAt: data.created_at, readBy: [] },
      ...prev,
    ]);
    toast({ title: 'Berhasil', description: 'Notifikasi ditambahkan.' });
  }, [toast]);

  const markAsRead = useCallback(async (id: string, coachName: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.readBy.includes(coachName)) return;

    const newReadBy = [...notification.readBy, coachName];
    const rawMessage = `${notification.message} [READ:${newReadBy.join(',')}]`;

    const { error } = await supabase
      .from('admin_notifications')
      .update({ message: rawMessage })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readBy: newReadBy } : n));
    }
  }, [notifications]);

  const toggleNotification = useCallback(async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status.', variant: 'destructive' });
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isActive } : n))
    );
  }, [toast]);

  const deleteNotification = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Gagal menghapus notifikasi.', variant: 'destructive' });
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, [toast]);

  const activeNotifications = notifications.filter((n) => n.isActive);

  return { notifications, activeNotifications, loading, addNotification, toggleNotification, deleteNotification, markAsRead };
}
