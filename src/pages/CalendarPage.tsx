import { useState, useCallback } from 'react';
import { LiveDateTime } from '@/components/LiveDateTime';

import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES } from '@/types/schedule';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/displayNames';

export default function CalendarPage() {
  const { schedule, loading: scheduleLoading, addEntry, updateEntry, deleteEntry, getEntriesForCell } = useSchedule();
  const { user } = useAuth();
  const { toast } = useToast();
  const displayedCoachName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';

  const [filterCoach, setFilterCoach] = useState<Coach | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean>(true);

  const filteredGetEntriesForCell = useCallback(
    (day: DayOfWeek, time: TimeSlot) => {
      return getEntriesForCell(day, time).filter((entry) => {
        const matchCoach = filterCoach === 'all' || entry.coach === filterCoach;
        const matchLevel =
          filterLevel === 'all' ||
          (filterLevel === 'Little Creator' && entry.level.startsWith('Little Creator')) ||
          (filterLevel === 'Junior' && entry.level.startsWith('Junior')) ||
          (filterLevel === 'Teenager' && entry.level.startsWith('Teenager'));
        const matchActive = !filterActive || entry.isActive;
        return matchCoach && matchLevel && matchActive;
      });
    },
    [getEntriesForCell, filterCoach, filterLevel, filterActive]
  );

  const hasActiveFilter = filterCoach !== 'all' || filterLevel !== 'all' || !filterActive;

  const clearFilters = () => {
    setFilterCoach('all');
    setFilterLevel('all');
    setFilterActive(true);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [defaultDay, setDefaultDay] = useState<DayOfWeek>('senin');
  const [defaultTime, setDefaultTime] = useState<TimeSlot>('08:00');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<ScheduleEntry | null>(null);

  const handleAddClick = (day: DayOfWeek, time: TimeSlot) => {
    setEditingEntry(null);
    setDefaultDay(day);
    setDefaultTime(time);
    setDialogOpen(true);
  };

  const handleEditClick = (entry: ScheduleEntry) => {
    const existing = schedule.find(e => e.id === entry.id);
    if (existing && existing.isActive !== entry.isActive) {
      updateEntry(entry.id, { isActive: entry.isActive, updatedBy: displayedCoachName });
      toast({
        title: entry.isActive ? 'Murid Diaktifkan' : 'Murid Dinonaktifkan',
        description: `${entry.studentName} kini berstatus ${entry.isActive ? 'Aktif' : 'Nonaktif'}.`,
      });
      return;
    }
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const entry = schedule.find((e) => e.id === id);
    if (entry) {
      setDeletingEntry(entry);
      setDeleteDialogOpen(true);
    }
  };

  const handleSave = (data: Omit<ScheduleEntry, 'id'>) => {
    const adminName = displayedCoachName;
    const auditData = { ...data, updatedBy: adminName };
    if (editingEntry) {
      updateEntry(editingEntry.id, auditData);
      toast({ title: 'Berhasil!', description: `Jadwal ${data.studentName} berhasil diperbarui oleh ${adminName}.` });
    } else {
      addEntry(auditData);
      toast({ title: 'Berhasil!', description: `Jadwal ${data.studentName} berhasil ditambahkan oleh ${adminName}.` });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
      toast({ title: 'Dihapus', description: `Jadwal ${deletingEntry.studentName} berhasil dihapus.`, variant: 'destructive' });
      setDeletingEntry(null);
    }
  };

  return (
    <>
      {/* ── Stitch-style Page Header with mascot ── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 4px 6px rgba(0,74,198,0.05)',
          padding: '24px',
        }}
      >
        {/* Left: mascot + title */}
        <div className="flex items-center gap-4 z-10">
          <img
            alt="Digikidz Mascot"
            className="w-16 h-16 object-contain flex-shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt5gIu3jt0lxlDWYuiCgoZdvOnEUL6E-C2fq4zlpaeIzGkz-20vc_EFpzVtnpiU0UQiIlt1nuzvQJTY4UkMQFZmsS-RpMx28zs0enwW_rGaePaE5xMQ02bLShC3DU9MQFr7YSJ3Kuhmt5ASQaGE8X4hF1lMFATnGObtiOgZAEUR1sPoD5ahwPpv5nsdewMt772r8W1uRl20ET0KfuaPnLdnYWDR0KHo2egE4MiPK5Pi1wiJl5Ys3fsAGh-qlAyxTPAfCIEy0DU9ok"
          />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#191c1e', margin: 0, lineHeight: 1.2 }}>
              Weekly Schedule
            </h1>
            <div className="mt-2">
              <LiveDateTime />
            </div>
          </div>
        </div>

        {/* Right: filters + add button */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto z-10">
          {/* Coach filter */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: '#fff', borderColor: '#c3c6d7', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#434655' }}>person</span>
            <Select value={filterCoach} onValueChange={(v) => setFilterCoach(v as Coach | 'all')}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-sm font-semibold text-gray-700 min-w-[100px]">
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">Semua Coach</SelectItem>
                {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Level filter */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: '#fff', borderColor: '#c3c6d7', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#434655' }}>school</span>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-sm font-semibold text-gray-700 min-w-[100px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="Little Creator">Little Creator</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Teenager">Teenager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: '#fff', borderColor: '#c3c6d7', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            {filterActive
              ? <EyeOff className="h-4 w-4 text-gray-500" />
              : <Eye className="h-4 w-4 text-blue-600" />
            }
            <Select value={filterActive ? 'active' : 'all'} onValueChange={(v) => setFilterActive(v === 'active')}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-sm font-semibold text-gray-700 min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="active">Sembunyikan Nonaktif</SelectItem>
                <SelectItem value="all">Tampilkan Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filter */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              title="Reset filter"
              style={{ background: '#ffdad6', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X className="h-4 w-4 text-red-700" />
            </button>
          )}

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: '#c3c6d7' }} className="hidden sm:block" />

          {/* Add Button — matches Stitch "New Session" */}
          <button
            onClick={() => {
              setEditingEntry(null);
              setDefaultDay('senin');
              setDefaultTime('08:00');
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg"
            style={{
              background: '#004ac6',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,74,198,0.3)',
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#003aab'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#004ac6'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Tambah Jadwal
          </button>
        </div>

        {/* Decorative orb — matches Stitch */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '30%', height: '200%', background: '#dbe1ff', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />
      </div>

      {/* ── Schedule Grid ── */}
      {scheduleLoading ? (
        <div
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 20,
            padding: 24,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl mb-3" />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 6px rgba(0,74,198,0.05)',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <ScheduleGrid
            getEntriesForCell={filteredGetEntriesForCell}
            onAddEntry={handleAddClick}
            onEditEntry={handleEditClick}
            onDeleteEntry={handleDeleteClick}
            hasActiveFilter={hasActiveFilter}
          />
        </div>
      )}

      {/* ── Legend — matches Stitch footer ── */}
      <div
        className="mt-5 flex flex-wrap items-center gap-6"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 16,
          padding: '14px 20px',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Coach Legend:
        </span>
        <div className="flex items-center gap-2">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', border: '2px solid #2563eb' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#434655' }}>Mr. Bani</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a855f7', border: '2px solid #9333ea' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#434655' }}>Mr. Argy</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ec4899', border: '2px solid #db2777' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#434655' }}>Ms. Zaura</span>
        </div>
        <div style={{ width: 1, height: 20, background: '#c3c6d7' }} />
        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: '#e8fce8', color: '#006229' }}>Little Creator</span>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: '#dbe1ff', color: '#004ac6' }}>Junior</span>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: '#ffdbca', color: '#9d4300' }}>Teenager</span>
      </div>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        defaultDay={defaultDay}
        defaultTime={defaultTime}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        studentName={deletingEntry?.studentName}
      />
    </>
  );
}
