import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { RunningText } from '@/components/RunningText';
import { NotificationManager } from '@/components/NotificationManager';
import { NotificationHistory } from '@/components/NotificationHistory';
import { useSchedule } from '@/hooks/useSchedule';
import { useNotifications } from '@/hooks/useNotifications';
<<<<<<< HEAD
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES, DAY_LABELS } from '@/types/schedule';
=======
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES } from '@/types/schedule';
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7
import { Plus, Filter, X, Eye, EyeOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
<<<<<<< HEAD
import { getDisplayName } from '@/lib/displayNames';
import { Link } from 'react-router-dom';
=======
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7


import { WelcomeHero } from '@/components/WelcomeHero';
import { AnalyticsBento } from '@/components/AnalyticsBento';


const Index = () => {
  const { schedule, loading: scheduleLoading, addEntry, updateEntry, deleteEntry, getEntriesForCell } = useSchedule();
  const { notifications, activeNotifications, addNotification, toggleNotification, deleteNotification, markAsRead } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();

<<<<<<< HEAD
  const displayedCoachName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';

  const getSystemDayString = (): DayOfWeek => {
    const days: DayOfWeek[] = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };

  const getFormattedToday = (): string => {
    const day = getSystemDayString();
    const dayLabel = DAY_LABELS[day];
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long' });
    return `${dayLabel}, ${dateStr}`;
  };

  const todayDay = getSystemDayString();
  const isEC = displayedCoachName === 'Coach' || displayedCoachName === 'Ms. Zaura';
  const todaySchedule = schedule.filter(
    (entry) =>
      entry.day === todayDay &&
      entry.status === 'active' &&
      (isEC || entry.coach === displayedCoachName)
  );
  const sortedTodaySchedule = [...todaySchedule].sort((a, b) => a.time.localeCompare(b.time));
=======
  const coachName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Coach';
  const displayedCoachName = coachName.split(/[._-]/).map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7

  // Toast logic for new notifications
  const toastedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const coachNotifications = activeNotifications.filter(n => !n.message.startsWith('[PARENT]'));

    coachNotifications.forEach(n => {
      const isUnread = !n.readBy.includes(displayedCoachName);
      if (isUnread && !toastedIds.current.has(n.id)) {
        const { dismiss } = toast({
          title: "Update Baru! 📢",
          description: n.message,
          duration: Infinity,
          action: (
            <Button size="sm" variant="outline" onClick={() => {
              markAsRead(n.id, displayedCoachName);
              dismiss();
            }} className="h-9 sm:h-8 font-bold text-[11px] sm:text-[10px] px-3">
              SAYA MENGERTI
            </Button>
          ),
        });
        toastedIds.current.add(n.id);
      }
    });

    // Cleanup toastedIds for notifications that were deleted
    const currentIds = Array.from(toastedIds.current);
    currentIds.forEach(id => {
      if (!notifications.find(n => n.id === id)) {
        toastedIds.current.delete(id);
      }
    });
  }, [activeNotifications, displayedCoachName, markAsRead, toast, notifications]);


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
    // Check if this is a quick toggle from the Power button
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
<<<<<<< HEAD
    const adminName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';
=======
    // Get actual name from user metadata or format from email (e.g. "bani.coach@..." -> "Bani Coach")
    const rawId = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Coach';
    const adminName = rawId
      .split(/[._-]/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7

    const auditData = { ...data, updatedBy: adminName };


    if (editingEntry) {
      updateEntry(editingEntry.id, auditData);
      toast({
        title: 'Berhasil!',
        description: `Jadwal ${data.studentName} berhasil diperbarui oleh ${adminName}.`,
      });
    } else {
      addEntry(auditData);
      toast({
        title: 'Berhasil!',
        description: `Jadwal ${data.studentName} berhasil ditambahkan oleh ${adminName}.`,
      });
    }
  };


  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
      toast({
        title: 'Dihapus',
        description: `Jadwal ${deletingEntry.studentName} berhasil dihapus.`,
        variant: 'destructive',
      });
      setDeletingEntry(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative z-10 transition-colors duration-300">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <WelcomeHero />

        {/* Notifications */}
        <RunningText messages={activeNotifications.filter(n => !n.message.startsWith('[PARENT]')).map((n) => n.message)} />

        {/* Main Content Tabs */}
<<<<<<< HEAD
        <Tabs defaultValue="hari-ini" className="w-full mt-8">
          <TabsList className="mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1 w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap no-scrollbar rounded-xl">
            <TabsTrigger value="hari-ini" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 shrink-0 font-bold gap-1.5">
              📅 Agenda Hari Ini
            </TabsTrigger>
            <TabsTrigger value="jadwal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 shrink-0 font-bold gap-1.5">
              🗓️ Semua Jadwal
            </TabsTrigger>
            <TabsTrigger value="statistik" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 shrink-0 font-bold gap-1.5">
              📊 Ringkasan & Statistik
            </TabsTrigger>
            <TabsTrigger value="notifikasi" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 gap-2 shrink-0 font-bold">
              📢 Pesan & Update
=======
        <Tabs defaultValue="jadwal" className="w-full mt-8">
          <TabsList className="mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1 w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap no-scrollbar">
            <TabsTrigger value="jadwal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 shrink-0">
              Jadwal Mengajar
            </TabsTrigger>
            <TabsTrigger value="statistik" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 shrink-0">
              Ringkasan & Statistik
            </TabsTrigger>
            <TabsTrigger value="notifikasi" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-4 sm:px-6 gap-2 shrink-0">
              Pesan & Update
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7
              {activeNotifications.filter(n => !n.message.startsWith('[PARENT]') && !n.readBy.includes(displayedCoachName)).length > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

<<<<<<< HEAD
          <TabsContent value="hari-ini" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    <span>📅</span> Agenda Hari Ini
                  </h2>
                  <p className="text-sm text-muted-foreground font-semibold">
                    {getFormattedToday()} • {isEC ? 'Semua Jadwal' : `Jadwal Mengajar ${displayedCoachName}`}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider self-start md:self-center">
                  {sortedTodaySchedule.length} Kelas Terjadwal
                </div>
              </div>

              {sortedTodaySchedule.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h3 className="text-lg font-bold text-foreground">Tidak Ada Jadwal Mengajar</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                    {isEC 
                      ? 'Tidak ada murid yang terdaftar untuk kelas hari ini.' 
                      : 'Anda tidak memiliki jadwal mengajar hari ini. Selamat beristirahat!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedTodaySchedule.map((entry) => {
                    const coachClass =
                      entry.coach === 'Mr. Bani'
                        ? 'coach-bani'
                        : entry.coach === 'Mr. Argy'
                          ? 'coach-argy'
                          : 'coach-zaura';

                    const levelClass =
                      entry.level.startsWith('Little Creator') ? 'level-little-creator' :
                      entry.level.startsWith('Junior') ? 'level-junior' :
                      entry.level.startsWith('Teenager') ? 'level-teenager' :
                      'level-trial';

                    return (
                      <div
                        key={entry.id}
                        className={`schedule-entry group relative border shadow-sm/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between ${coachClass}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-foreground text-lg tracking-tight">{entry.studentName}</h4>
                              <p className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-widest mt-0.5">{entry.coach}</p>
                            </div>
                            <span className="bg-background/80 dark:bg-slate-900/80 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border/50 shadow-sm flex items-center gap-1">
                              🕒 {entry.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`level-badge text-[10px] py-1 px-2.5 font-black uppercase tracking-wider leading-none inline-block ${levelClass}`}>
                              {entry.level}
                            </span>
                          </div>

                          {entry.notes && (
                            <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/20">
                              <span className="opacity-50 font-bold">Note:</span> {entry.notes}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-border/20">
                          <Button asChild className="w-full h-11 rounded-xl font-bold gap-2 text-sm shadow-md hover:shadow-lg transition-all">
                            <Link to={`/reports?student=${encodeURIComponent(entry.studentName)}`}>
                              📝 Tulis Report
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

=======
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7
          <TabsContent value="notifikasi" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-500" />
                  Pesan & Update Coach
                </h2>
                <p className="text-sm text-muted-foreground font-medium"> Riwayat instruksi dan info terbaru untuk tim coach.</p>
              </div>
              <NotificationManager
                notifications={notifications}
                onAdd={addNotification}
                onToggle={toggleNotification}
                onDelete={deleteNotification}
              />
            </div>

            <NotificationHistory
              notifications={notifications.filter(n => !n.message.startsWith('[PARENT]'))}
              currentCoach={displayedCoachName}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent value="jadwal" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {/* Schedule Controls */}
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Jadwal Mengajar
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">
                    Kelola jadwal kursus murid dengan presisi
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border w-full md:w-auto">
                    <div className="p-1.5 bg-background rounded-lg shadow-sm">
                      <Filter className="h-4 w-4 text-primary" />
                    </div>
                    <Select value={filterCoach} onValueChange={(v) => setFilterCoach(v as Coach | 'all')}>
                      <SelectTrigger className="w-full sm:w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                        <SelectValue placeholder="Semua Coach" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">Semua Coach</SelectItem>
                        {COACHES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="hidden sm:block w-px h-4 bg-border/50 mx-1" />
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-full sm:w-[150px] border-none bg-transparent shadow-none focus:ring-0">
                        <SelectValue placeholder="Semua Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">Semua Level</SelectItem>
                        <SelectItem value="Little Creator">Little Creator</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Teenager">Teenager</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="hidden sm:block w-px h-4 bg-border/50 mx-1" />
                    <Select value={filterActive ? "active" : "all"} onValueChange={(v) => setFilterActive(v === "active")}>
                      <SelectTrigger className="w-full sm:w-[160px] border-none bg-transparent shadow-none focus:ring-0">
                        <div className="flex items-center gap-2">
                          {filterActive ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                          <SelectValue placeholder="Status Aktif" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="active">Sembunyikan Nonaktif</SelectItem>
                        <SelectItem value="all">Tampilkan Semua</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasActiveFilter && (
                      <Button variant="ghost" size="icon" onClick={clearFilters} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setEditingEntry(null);
                        setDefaultDay('senin');
                        setDefaultTime('08:00');
                        setDialogOpen(true);
                      }}
                      className="rounded-xl px-6 font-semibold shadow-sm transition-all hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Grid */}
            {scheduleLoading ? (
              <div className="space-y-6">
                {/* Skeleton — Schedule table */}
                <div className="glass-card p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-40 rounded-full" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                  <div className="space-y-2 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <ScheduleGrid
                  getEntriesForCell={filteredGetEntriesForCell}
                  onAddEntry={handleAddClick}
                  onEditEntry={handleEditClick}
                  onDeleteEntry={handleDeleteClick}
                  hasActiveFilter={hasActiveFilter}
                />
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--coach-bani)/0.3)] border-l-4 border-[hsl(var(--coach-bani))]" />
                <span className="text-sm text-muted-foreground">Mr. Bani</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--coach-argy)/0.3)] border-l-4 border-[hsl(var(--coach-argy))]" />
                <span className="text-sm text-muted-foreground">Mr. Argy</span>
              </div>
<<<<<<< HEAD
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--coach-zaura)/0.3)] border-l-4 border-[hsl(var(--coach-zaura))]" />
                <span className="text-sm text-muted-foreground">Ms. Zaura</span>
              </div>
=======
>>>>>>> 01b64abd17847f213ed541d744ad0a933d2affa7
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="level-badge level-little-creator">Little Creator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="level-badge level-junior">Junior</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="level-badge level-teenager">Teenager</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistik" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {scheduleLoading ? (
              <div className="space-y-6">
                {/* Skeleton - StatsCards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-5 rounded-2xl space-y-3">
                      <Skeleton className="h-12 w-12 rounded-2xl" />
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  ))}
                </div>
                {/* Skeleton - AnalyticsBento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                  </div>
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-[160px] w-full rounded-xl" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-3 w-full rounded-full" />)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <StatsCards schedule={schedule} />
                <AnalyticsBento schedule={schedule} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
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
    </div>
  );
};

export default Index;
