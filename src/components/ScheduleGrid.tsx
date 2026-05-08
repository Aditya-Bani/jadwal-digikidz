import { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS, DAY_LABELS, DayOfWeek, TimeSlot, ScheduleEntry } from '@/types/schedule';
import { ScheduleEntryCard } from './ScheduleEntry';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleGridProps {
  getEntriesForCell: (day: DayOfWeek, time: TimeSlot) => ScheduleEntry[];
  onAddEntry: (day: DayOfWeek, time: TimeSlot) => void;
  onEditEntry: (entry: ScheduleEntry) => void;
  onDeleteEntry: (id: string) => void;
  hasActiveFilter?: boolean;
}

// Removed old custom dayColorClasses. Use standard styling in the component instead.

/* ─── DESKTOP GRID VIEW ───────────────────────────────────────────────────── */

function DesktopGrid({ getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry, hasActiveFilter }: ScheduleGridProps) {
  // Check if any cell has entries — used to show empty state
  const totalEntries = DAYS.reduce((acc, day) =>
    acc + TIME_SLOTS.reduce((a, time) => a + getEntriesForCell(day, time).length, 0), 0);

  if (hasActiveFilter && totalEntries === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="Tidak Ada Jadwal Ditemukan"
          description="Tidak ada jadwal yang cocok dengan filter yang aktif. Coba ubah atau hapus filter untuk melihat semua jadwal."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-t border-l border-border">
          <div className="day-header bg-muted border-r border-b border-border">
            <span className="text-muted-foreground">Jam</span>
          </div>
          {DAYS.map((day) => (
            <div key={day} className="day-header bg-slate-50/50 dark:bg-slate-800/20 border-r border-b border-border">
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-8 border-l border-border">
            <div className="time-slot border-r border-b border-border flex items-center justify-center">
              <span className="font-medium">{time}</span>
            </div>
            {DAYS.map((day) => {
              const entries = getEntriesForCell(day, time);
              return (
                <div key={`${day}-${time}`} className="schedule-cell group relative">
                  {entries.map((entry) => (
                    <ScheduleEntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={onEditEntry}
                      onDelete={onDeleteEntry}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    onClick={() => onAddEntry(day, time)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MOBILE LIST VIEW (per hari) ────────────────────────────────────────── */

function MobileDayView({ day, getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry }: ScheduleGridProps & { day: DayOfWeek }) {
  const slotsWithEntries = TIME_SLOTS.map((time) => ({
    time,
    entries: getEntriesForCell(day, time),
  }));

  return (
    <div className="divide-y divide-border">
      {slotsWithEntries.map(({ time, entries }) => (
        <div key={time} className="flex gap-3 px-3 py-2">
          {/* Jam */}
          <div className="w-12 shrink-0 flex items-start pt-1">
            <span className="text-xs font-semibold text-muted-foreground">{time}</span>
          </div>
          {/* Konten */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <ScheduleEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                />
              ))
            ) : null}
            {/* Tombol tambah hanya ditampilkan jika slot kosong */}
            {entries.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 transition-colors"
                onClick={() => onAddEntry(day, time)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Tambah
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileView({ getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry, hasActiveFilter }: ScheduleGridProps) {
  // Map system day (0-6, 0 is Sun) to DAYS index (0-5)
  // 1 (Mon) -> 0, 2 (Tue) -> 1, ..., 6 (Sat) -> 5, 0 (Sun) -> 0
  const getTodayIndex = () => {
    const day = new Date().getDay();
    if (day === 0) return 0; // Sunday to Monday
    return day - 1;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getTodayIndex());
  const currentDay = DAYS[currentDayIndex];

  // Hitung total jadwal per hari untuk badge
  const dayCounts = DAYS.map((day) =>
    TIME_SLOTS.reduce((acc, time) => acc + getEntriesForCell(day, time).length, 0)
  );

  const totalEntries = dayCounts.reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Day Selector Tabs */}
      <div className="px-3 py-3 border-b border-border bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setCurrentDayIndex((i) => Math.max(0, i - 1))}
            disabled={currentDayIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-bold text-slate-800 dark:text-slate-100">{DAY_LABELS[currentDay]}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dayCounts[currentDayIndex]} jadwal
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setCurrentDayIndex((i) => Math.min(DAYS.length - 1, i + 1))}
            disabled={currentDayIndex === DAYS.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        {/* Mini day indicator dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {DAYS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentDayIndex(i)}
              className={cn(
                'rounded-full transition-all',
                i === currentDayIndex
                  ? 'w-4 h-1.5 bg-blue-600 dark:bg-blue-500'
                  : dayCounts[i] > 0
                    ? 'w-1.5 h-1.5 bg-blue-300 dark:bg-blue-800'
                    : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Empty state when filter active */}
      {hasActiveFilter && totalEntries === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Tidak Ada Jadwal Ditemukan"
            description="Tidak ada jadwal yang cocok dengan filter aktif. Coba ubah atau hapus filter."
            className="py-8"
          />
        </div>
      ) : (
        /* Day Content */
        <MobileDayView
          day={currentDay}
          getEntriesForCell={getEntriesForCell}
          onAddEntry={onAddEntry}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
        />
      )}
    </div>
  );
}

/* ─── ScheduleGrid (responsive wrapper) ─────────────────────────────────── */

export function ScheduleGrid(props: ScheduleGridProps) {
  return (
    <>
      {/* Mobile: tampilan list per hari */}
      <div className="sm:hidden">
        <MobileView {...props} />
      </div>
      {/* Desktop: grid lengkap */}
      <div className="hidden sm:block">
        <DesktopGrid {...props} />
      </div>
    </>
  );
}
