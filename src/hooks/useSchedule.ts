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
  let updatedBy = row.updated_by || undefined;
  let isActive = true;
  const inactiveReason = row.notes?.match(/\[INACTIVE:?(.*?)\]/)?.[1] || undefined;

  // Zero-Migration Hack 1: Extract Inactive Status & Reason
  if (notes && notes.includes('[INACTIVE')) {
    isActive = false;
    notes = notes.replace(/\[INACTIVE:?.*?\]\s*/g, '').trim() || undefined;
  }

  // Zero-Migration Hack 2: Extract updated_by from notes if column is missing
  if (!updatedBy && notes && notes.includes('✍️')) {
    const parts = notes.split('✍️');
    if (parts.length > 1) {
      updatedBy = parts[parts.length - 1].trim();
      notes = parts.slice(0, -1).join('✍️').trim() || undefined;
    }
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
    updatedBy: updatedBy,
    updatedAt: row.updated_at,
  };
}



export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedule = useCallback(async () => {
    let { data, error } = await supabase
      .from('schedule_entries')
      .select('*')
      .order('time', { ascending: true });

    // Fallback if updated_by column is missing or schema cache is stale
    if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('updated_by'))) {
      const fallback = await supabase
        .from('schedule_entries')
        .select('id, student_name, coach, level, day, time, notes, created_at, updated_at')
        .order('time', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }


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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSchedule((data || []).map((row: any) => dbToApp(row as DbScheduleEntry)));
    setLoading(false);
  }, [toast]);



  useEffect(() => {
    fetchSchedule();

    // Realtime subscription
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: any = {
      student_name: entry.studentName,
      coach: entry.coach,
      level: entry.level,
      day: entry.day,
      time: entry.time,
      notes: finalNotes || null,
    };

    // Only add updated_by if we're reasonably sure it exists or just try and handle error
    // For now, let's try to insert with it, and if it fails with 'column does not exist', try without it
    const { data, error } = await supabase
      .from('schedule_entries')
      .insert({ ...insertData, updated_by: entry.updatedBy || null })
      .select()
      .single();

    if (error) {
      console.warn('Original addEntry error:', error);
      if (error.message?.includes('column "updated_by" of relation "schedule_entries" does not exist') ||
        error.message?.includes('updated_by') ||
        error.code === '42703' ||
        error.code === 'PGRST204') {

        const notesWithAudit = entry.updatedBy
          ? (entry.notes ? `${entry.notes}\n✍️ ${entry.updatedBy}` : `✍️ ${entry.updatedBy}`)
          : entry.notes;

        const { data: retryData, error: retryError } = await supabase
          .from('schedule_entries')
          .insert({ ...insertData, notes: notesWithAudit })
          .select()
          .single();


        if (retryError) {
          console.error('Error adding entry (retry):', retryError);
          toast({
            title: 'Error (Retry)',
            description: `Gagal: ${retryError.message} (${retryError.code})`,
            variant: 'destructive',
          });
          return;
        }
        setSchedule((prev) => [...prev, dbToApp({ ...retryData, updated_by: entry.updatedBy } as DbScheduleEntry)]);

        return;
      }

      console.error('Error adding entry:', error);
      toast({
        title: 'Error',
        description: `Gagal menambahkan jadwal: ${error.message} (${error.code})`,
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) => [...prev, dbToApp(data as DbScheduleEntry)]);
  }, [toast]);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<ScheduleEntry, 'id'>>) => {
    const existingEntry = schedule.find(e => e.id === id);
    if (!existingEntry) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.studentName !== undefined) dbUpdates.student_name = updates.studentName;
    if (updates.coach !== undefined) dbUpdates.coach = updates.coach;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.day !== undefined) dbUpdates.day = updates.day;
    if (updates.time !== undefined) dbUpdates.time = updates.time;

    // Determine the base notes (what the user typed, ignoring internal tags)
    const baseNotes = updates.notes !== undefined ? updates.notes : existingEntry.notes;
    const finalIsActive = updates.isActive !== undefined ? updates.isActive : existingEntry.isActive;
    const finalReason = updates.inactiveReason !== undefined ? updates.inactiveReason : existingEntry.inactiveReason;

    // Inject or remove [INACTIVE]
    let finalNotes = baseNotes || '';
    if (!finalIsActive) {
      const tag = finalReason ? `[INACTIVE:${finalReason}]` : '[INACTIVE]';
      finalNotes = `${tag} ${finalNotes}`.trim();
    }

    dbUpdates.notes = finalNotes || null;

    // Attempt with updated_by first
    const dbUpdatesWithAudit = { ...dbUpdates };
    if (updates.updatedBy !== undefined) dbUpdatesWithAudit.updated_by = updates.updatedBy;

    const { error } = await supabase
      .from('schedule_entries')
      .update(dbUpdatesWithAudit)
      .eq('id', id);

    if (error) {
      if (error.message?.includes('column "updated_by" of relation "schedule_entries" does not exist') ||
        error.message?.includes('updated_by') ||
        error.code === '42703' ||
        error.code === 'PGRST204') {

        const targetNotes = finalNotes;
        const notesWithAudit = updates.updatedBy
          ? (targetNotes ? `${targetNotes}\n✍️ ${updates.updatedBy}` : `✍️ ${updates.updatedBy}`)
          : targetNotes;

        const { error: retryError } = await supabase
          .from('schedule_entries')
          .update({ ...dbUpdates, notes: notesWithAudit || null })
          .eq('id', id);

        if (retryError) {
          console.error('Error updating entry (retry):', retryError);
          toast({
            title: 'Error',
            description: 'Gagal memperbarui jadwal.',
            variant: 'destructive',
          });
          return;
        }

        setSchedule((prev) =>
          prev.map((entry) => (entry.id === id ? { ...entry, ...updates, notes: targetNotes, updatedBy: updates.updatedBy || entry.updatedBy } : entry))
        );
        return;
      }

      console.error('Error updating entry:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui jadwal.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
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
