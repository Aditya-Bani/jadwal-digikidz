import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HolidayBanner {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

interface DbBanner {
  id: string;
  name: string;
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

function dbToApp(row: DbBanner): HolidayBanner {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => (supabase as any).from('holiday_banners');

/** For admin panel — fetches all banners */
export function useHolidayBanners() {
  const [banners, setBanners] = useState<HolidayBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    const { data, error } = await db()
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching holiday banners:', error);
      setLoading(false);
      return;
    }

    setBanners((data as DbBanner[] || []).map(dbToApp));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const addBanner = useCallback(async (
    banner: Omit<HolidayBanner, 'id' | 'createdAt'>
  ) => {
    const { data, error } = await db()
      .insert({
        name: banner.name,
        image_url: banner.imageUrl,
        start_date: banner.startDate,
        end_date: banner.endDate,
        is_active: banner.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Full Supabase Error:', error);
      toast({ 
        title: 'Error', 
        description: `Gagal menambahkan banner: ${error.message || 'Unknown error'}`, 
        variant: 'destructive' 
      });
      return null;
    }

    const newBanner = dbToApp(data as DbBanner);
    setBanners((prev) => [newBanner, ...prev]);
    toast({ title: 'Berhasil!', description: 'Banner hari raya ditambahkan.' });
    return newBanner;
  }, [toast]);

  const toggleBanner = useCallback(async (id: string, isActive: boolean) => {
    const { error } = await db()
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status banner.', variant: 'destructive' });
      return;
    }

    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive } : b)));
  }, [toast]);

  const deleteBanner = useCallback(async (id: string) => {
    const { error } = await db()
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Gagal menghapus banner.', variant: 'destructive' });
      return;
    }

    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast({ title: 'Dihapus', description: 'Banner berhasil dihapus.' });
  }, [toast]);

  return { banners, loading, addBanner, toggleBanner, deleteBanner };
}

/** For Parent Portal — fetches only today's active banner */
export function useActiveBanner() {
  const [banner, setBanner] = useState<HolidayBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    db()
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }: { data: DbBanner[] | null; error: unknown }) => {
        if (!error && data && data.length > 0) {
          setBanner(dbToApp(data[0]));
        }
        setLoading(false);
      });
  }, []);

  return { banner, loading };
}

/** Convert banner image to Base64 data URL — stored directly in the database, no external storage needed */
export async function uploadBannerImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    // Compress the image before converting to Base64 to keep DB size manageable
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_WIDTH = 600;
      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
    img.src = objectUrl;
  });
}
