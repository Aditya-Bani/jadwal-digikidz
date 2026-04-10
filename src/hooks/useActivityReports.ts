import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityReport {
  id: string;
  studentName: string;
  date: string;
  level: string;
  lessonWeek: number;
  lessonName: string;
  tools: string;
  coach: string;
  coachComment: string;
  goalsMateri: string;
  activityReportText: string;
  mediaUrls: string[];
  externalLinks?: { label: string; url: string }[];
  createdAt: string;
}

interface DbReport {
  id: string;
  student_name: string;
  date: string;
  level: string;
  lesson_week: number;
  lesson_name: string;
  tools: string | null;
  coach: string;
  coach_comment: string | null;
  goals_materi: string | null;
  activity_report_text: string | null;
  media_urls: string[] | null;
  external_links: { label: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
}

function dbToApp(row: DbReport): ActivityReport {
  return {
    id: row.id,
    studentName: row.student_name,
    date: row.date,
    level: row.level,
    lessonWeek: row.lesson_week,
    lessonName: row.lesson_name,
    tools: row.tools || '',
    coach: row.coach,
    coachComment: row.coach_comment || '',
    goalsMateri: row.goals_materi || '',
    activityReportText: row.activity_report_text || '',
    mediaUrls: row.media_urls || [],
    externalLinks: row.external_links || [],
    createdAt: row.created_at,
  };
}

export function useActivityReports(studentName?: string, accessCode?: string) {
  const [reports, setReports] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    let data: unknown, error: unknown;

    if (studentName && accessCode) {
      // @ts-expect-error - RPC function created via SQL
      const result = await supabase.rpc('get_student_reports', {
        p_student_name: studentName,
        p_access_code: accessCode
      });

      // Smart Fallback: If function doesn't exist yet, use old direct query
      if (result.error && (result.error.code === 'PGRST202' || result.error.message?.includes('function public.get_student_reports'))) {
        console.warn('Security RPC not found, falling back to direct query');
        const fallback = await supabase
          .from('activity_reports')
          .select('*')
          .eq('student_name', studentName)
          .order('date', { ascending: false });
        data = fallback.data;
        error = fallback.error;
      } else {
        data = result.data;
        error = result.error;
      }
    } else {
      // Use standard query for Admin (Authenticated)
      let query = supabase
        .from('activity_reports')
        .select('*')
        .order('date', { ascending: false });

      if (studentName) {
        query = query.eq('student_name', studentName);
      }

      const result = await query;
      data = result.data;
      error = result.error;
    }


    if (error) {
      console.error('Error fetching reports:', error);
      toast({ title: 'Error', description: 'Gagal memuat laporan.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setReports((data as DbReport[] || []).map(dbToApp));
    setLoading(false);
  }, [studentName, accessCode, toast]);

  useEffect(() => {
    fetchReports();

    // Realtime subscription — mirip dengan useSchedule
    const channel = supabase
      .channel(`activity-reports-realtime${studentName ? `-${studentName}` : ''}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_reports' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports, studentName, accessCode]);

  const addReport = useCallback(async (report: Omit<ActivityReport, 'id' | 'createdAt'>) => {
    let activityText = report.activityReportText || '';
    if (report.externalLinks && report.externalLinks.length > 0) {
      const linksText = report.externalLinks
        .map(link => `\n🔗 ${link.label || 'Link'}: ${link.url}`)
        .join('');
      activityText += `\n\nVideo Presentasi:${linksText}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      student_name: report.studentName,
      date: report.date,
      level: report.level,
      lesson_week: report.lessonWeek,
      lesson_name: report.lessonName,
      tools: report.tools || null,
      coach: report.coach,
      coach_comment: report.coachComment || null,
      goals_materi: report.goalsMateri || null,
      activity_report_text: activityText,
      media_urls: report.mediaUrls,
    };

    const { data, error } = await supabase
      .from('activity_reports')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error adding report:', error);
      const msg = error.message || error.code || 'Gagal menambahkan laporan.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return;
    }

    setReports((prev) => [dbToApp(data as DbReport), ...prev]);
    return data;
  }, [toast]);

  const updateReport = useCallback(async (id: string, report: Omit<ActivityReport, 'id' | 'createdAt'>) => {
    let activityText = report.activityReportText || '';
    if (report.externalLinks && report.externalLinks.length > 0) {
      // Avoid duplicating links if they're already in the text (simple check)
      if (!activityText.includes('Video Presentasi:')) {
        const linksText = report.externalLinks
          .map(link => `\n🔗 ${link.label || 'Link'}: ${link.url}`)
          .join('');
        activityText += `\n\nVideo Presentasi:${linksText}`;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      student_name: report.studentName,
      date: report.date,
      level: report.level,
      lesson_week: report.lessonWeek,
      lesson_name: report.lessonName,
      tools: report.tools || null,
      coach: report.coach,
      coach_comment: report.coachComment || null,
      goals_materi: report.goalsMateri || null,
      activity_report_text: activityText,
      media_urls: report.mediaUrls,
    };

    const { data, error } = await supabase
      .from('activity_reports')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
      const msg = error.message || error.code || 'Gagal memperbarui laporan.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return;
    }

    setReports((prev) => prev.map((r) => (r.id === id ? dbToApp(data as DbReport) : r)));
    return data;
  }, [toast]);

  const deleteReport = useCallback(async (id: string) => {
    const { error } = await supabase.from('activity_reports').delete().eq('id', id);
    if (error) {
      console.error('Error deleting report:', error);
      toast({ title: 'Error', description: 'Gagal menghapus laporan.', variant: 'destructive' });
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, [toast]);

  return { reports, loading, addReport, updateReport, deleteReport, refetch: fetchReports };
}

export function useAccessCodes() {
  const [codes, setCodes] = useState<{ id: string; studentName: string; accessCode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCodes = useCallback(async () => {
    const { data, error } = await supabase
      .from('student_access_codes')
      .select('*')
      .order('student_name');

    if (error) {
      console.error('Error fetching codes:', error);
      setLoading(false);
      return;
    }

    setCodes(
      (data || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        studentName: r.student_name as string,
        accessCode: r.access_code as string,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCode = useCallback(async (studentName: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('student_access_codes')
      .insert({ student_name: studentName, access_code: code })
      .select()
      .single();

    if (error) {
      console.error('Error generating code:', error);
      toast({ title: 'Error', description: 'Gagal membuat kode akses.', variant: 'destructive' });
      return;
    }

    setCodes((prev) => [...prev, { id: data.id, studentName: data.student_name, accessCode: data.access_code }]);
    return data.access_code;
  }, [toast]);

  const deleteCode = useCallback(async (id: string) => {
    const { error } = await supabase.from('student_access_codes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Gagal menghapus kode akses.', variant: 'destructive' });
      return;
    }
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }, [toast]);

  const lookupByCode = useCallback(async (code: string) => {
    // @ts-expect-error - RPC function created via SQL
    const result = await supabase.rpc('verify_student_access', {
      p_access_code: code.toUpperCase()
    });

    let data: unknown;
    let error: any;
    data = result.data;
    error = result.error;


    // Smart Fallback: If function doesn't exist yet, use old direct query
    if (error && (error.code === 'PGRST202' || error.message?.includes('function public.verify_student_access'))) {
      console.warn('Security RPC not found, falling back to direct query');
      const fallback = await supabase
        .from('student_access_codes')
        .select('*')
        .eq('access_code', code.toUpperCase())
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data || (Array.isArray(data) && data.length === 0)) return null;

    // Result matches p_student_name, p_access_code
    const finalResult = Array.isArray(data) ? data[0] : data;
    return { studentName: finalResult.student_name || finalResult.studentName, accessCode: finalResult.access_code || finalResult.accessCode };
  }, []);


  return { codes, loading, generateCode, deleteCode, lookupByCode };
}

export async function uploadReportMedia(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from('report-media').upload(path, file);
  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from('report-media').getPublicUrl(path);
  return data.publicUrl;
}
