import { useState, useCallback, useEffect } from 'react';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, StudentLevel } from '@/types/schedule';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DbScheduleEntry {
  id: string;
  student_name: string;
  coach: string;
  level: string;
  day: string;
  time: string;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}


function dbToApp(row: DbScheduleEntry): ScheduleEntry {
  let notes = row.notes || undefined;
  let isActive = true;
  const inactiveReason = row.notes?.match(/\[INACTIVE:?(.*?)\]/)?.[1] || undefined;

  if (notes && notes.includes('[INACTIVE')) {
    isActive = false;
    notes = notes.replace(/\[INACTIVE:?.*?\]\s*/g, '').trim() || undefined;
  }

  return {
    id: row.id,
    studentName: row.student_name,
    coach: row.coach as Coach,
    level: row.level as StudentLevel,
    day: row.day as DayOfWeek,
    time: row.time as TimeSlot,
    isActive,
    notes: notes,
    updatedBy: row.updated_by || undefined,
    updatedAt: row.updated_at,
  };
}



export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedule = useCallback(async () => {
    const { data, error } = await supabase
      .from('schedule_entries')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat jadwal dari database.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setSchedule((data || []).map((row) => dbToApp(row as DbScheduleEntry)));
    setLoading(false);
  }, [toast]);



  useEffect(() => {
    fetchSchedule();

    const channel = supabase
      .channel('schedule-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_entries' },
        () => {
          fetchSchedule();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSchedule]);

  const addEntry = useCallback(async (entry: Omit<ScheduleEntry, 'id'>) => {
    let finalNotes = entry.notes || '';
    if (entry.isActive === false) {
      finalNotes = `[INACTIVE] ${finalNotes}`.trim();
    }

    const insertPayload = {
      student_name: entry.studentName,
      coach: entry.coach,
      level: entry.level,
      day: entry.day,
      time: entry.time,
      notes: finalNotes || null,
      updated_by: entry.updatedBy || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('schedule_entries')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // Fallback: if updated_by column doesn't exist yet (migration not run), retry without it
      const isMissingColumn =
        error.code === '42703' ||
        error.code === 'PGRST204' ||
        error.message?.toLowerCase().includes('updated_by');

      if (isMissingColumn) {
        const { updated_by, ...payloadWithoutAudit } = insertPayload;
        const { data: retryData, error: retryError } = await supabase
          .from('schedule_entries')
          .insert(payloadWithoutAudit)
          .select()
          .single();

        if (retryError) {
          console.error('Error adding entry (retry):', retryError);
          toast({ title: 'Error', description: `Gagal menambahkan jadwal: ${retryError.message}`, variant: 'destructive' });
          return;
        }
        setSchedule((prev) => [...prev, dbToApp({ ...retryData, updated_by: entry.updatedBy ?? null } as DbScheduleEntry)]);
        return;
      }

      console.error('Error adding entry:', error);
      toast({ title: 'Error', description: `Gagal menambahkan jadwal: ${error.message}`, variant: 'destructive' });
      return;
    }

    setSchedule((prev) => [...prev, dbToApp(data as DbScheduleEntry)]);
  }, [toast]);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<ScheduleEntry, 'id'>>) => {
    const existingEntry = schedule.find(e => e.id === id);
    if (!existingEntry) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.studentName !== undefined) dbUpdates.student_name = updates.studentName;
    if (updates.coach !== undefined) dbUpdates.coach = updates.coach;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.day !== undefined) dbUpdates.day = updates.day;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.updatedBy !== undefined) dbUpdates.updated_by = updates.updatedBy;

    const baseNotes = updates.notes !== undefined ? updates.notes : existingEntry.notes;
    const finalIsActive = updates.isActive !== undefined ? updates.isActive : existingEntry.isActive;
    const finalReason = updates.inactiveReason !== undefined ? updates.inactiveReason : existingEntry.inactiveReason;

    let finalNotes = baseNotes || '';
    if (!finalIsActive) {
      const tag = finalReason ? `[INACTIVE:${finalReason}]` : '[INACTIVE]';
      finalNotes = `${tag} ${finalNotes}`.trim();
    }

    dbUpdates.notes = finalNotes || null;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('schedule_entries')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Fallback: if updated_by column doesn't exist yet (migration not run), retry without it
      const isMissingColumn =
        error.code === '42703' ||
        error.code === 'PGRST204' ||
        error.message?.toLowerCase().includes('updated_by');

      if (isMissingColumn) {
        const { updated_by, ...dbUpdatesWithoutAudit } = dbUpdates;
        const { data: retryData, error: retryError } = await supabase
          .from('schedule_entries')
          .update(dbUpdatesWithoutAudit)
          .eq('id', id)
          .select()
          .single();

        if (retryError) {
          console.error('Error updating entry (retry):', retryError);
          toast({ title: 'Error', description: 'Gagal memperbarui jadwal.', variant: 'destructive' });
          return;
        }
        setSchedule((prev) =>
          prev.map((entry) => (entry.id === id ? dbToApp({ ...retryData, updated_by: updates.updatedBy ?? null } as DbScheduleEntry) : entry))
        );
        return;
      }

      console.error('Error updating entry:', error);
      toast({ title: 'Error', description: 'Gagal memperbarui jadwal.', variant: 'destructive' });
      return;
    }

    setSchedule((prev) =>
      prev.map((entry) => (entry.id === id ? dbToApp(data as DbScheduleEntry) : entry))
    );
  }, [toast, schedule]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus jadwal.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) => prev.filter((entry) => entry.id !== id));
  }, [toast]);

  const getEntriesForCell = useCallback(
    (day: DayOfWeek, time: TimeSlot) => {
      return schedule.filter((entry) => entry.day === day && entry.time === time);
    },
    [schedule]
  );

  return {
    schedule,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForCell,
  };
}
