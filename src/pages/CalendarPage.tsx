import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useHolidays, Holiday } from '@/hooks/useHolidays';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, AlertCircle, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  return `${hari[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CalendarPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(now);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));

  const { holidays, loading, error } = useHolidays(year);

  const getHolidaysForDate = (date: Date): Holiday[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.filter((h) => h.date === dateStr);
  };

  const selectedHolidays = selectedDate ? getHolidaysForDate(selectedDate) : [];

  const holidaysByMonth = useMemo(() => {
    const grouped: Record<number, Holiday[]> = {};
    holidays.forEach((h) => {
      const month = new Date(h.date + 'T00:00:00').getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(h);
    });
    return grouped;
  }, [holidays]);

  const handleYearChange = (delta: number) => {
    const newYear = year + delta;
    setYear(newYear);
    setCalendarMonth(new Date(newYear, calendarMonth.getMonth(), 1));
    setSelectedDate(undefined);
  };

  const holidayDates = useMemo(() => {
    return holidays.map((h) => new Date(h.date + 'T00:00:00'));
  }, [holidays]);

  return (
    <div className="min-h-screen bg-background/50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-6 sm:p-8 mb-8 text-white shadow-xl shadow-primary/20 animate-fade-in">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                  <CalendarDays className="h-4 w-4 text-amber-200" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">Kalender Nasional</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Hari Libur <span className="text-amber-200">{year}</span>
              </h1>
              <p className="text-primary-foreground/80 text-sm max-w-sm font-medium">
                Daftar tanggal merah dan hari besar Indonesia. Klik tanggal untuk melihat detail.
              </p>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 self-start sm:self-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleYearChange(-1)}
                className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-2xl font-black text-white min-w-[72px] text-center">{year}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleYearChange(1)}
                className="h-9 w-9 rounded-xl text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 animate-pulse" />
              <Loader2 className="w-10 h-10 animate-spin text-primary relative" />
            </div>
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Memuat data hari libur...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="bg-destructive/10 p-4 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="font-bold text-foreground">Gagal Memuat Data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar Widget */}
            <div className="md:col-span-1 space-y-4">

              <div className="glass-card rounded-2xl p-5 border-none shadow-xl shadow-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Pilih Tanggal</h3>
                    <p className="text-xs text-muted-foreground">Klik untuk melihat detail</p>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  className="p-0 pointer-events-auto"
                  modifiers={{ holiday: holidayDates }}
                  modifiersClassNames={{
                    holiday: 'text-destructive font-black after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-destructive after:rounded-full',
                  }}
                />
              </div>

              {/* Selected Date Detail */}
              {selectedDate && (
                <div className={cn(
                  "glass-card rounded-2xl p-5 border-none shadow-xl animate-fade-in",
                  selectedHolidays.length > 0 ? "shadow-destructive/10" : "shadow-primary/5"
                )}>
                  {selectedHolidays.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-destructive/10 p-2 rounded-xl">
                          <CalendarDays className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground">Hari Libur</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Merah</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{formatTanggal(selectedHolidays[0].date)}</p>
                      {selectedHolidays.map((h, i) => (
                        <p key={i} className="text-sm font-semibold text-foreground">🎉 {h.localName}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Bukan hari libur nasional
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Stat */}
              {!loading && (
                <div className="glass-card rounded-2xl p-4 border-none shadow-lg shadow-primary/5 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{holidays.length}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hari Libur {year}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Holiday List */}
            <div className="md:col-span-2">

              <div className="glass-card rounded-2xl p-6 border-none shadow-xl shadow-primary/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-destructive/10 p-2 rounded-xl">
                      <CalendarDays className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Daftar Hari Libur Nasional</h3>
                      <p className="text-xs text-muted-foreground">Tahun {year}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {holidays.length} hari
                  </Badge>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(holidaysByMonth)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([monthIdx, monthHolidays]) => (
                      <div key={monthIdx}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                            {BULAN[Number(monthIdx)]}
                          </h3>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] font-bold text-muted-foreground">{monthHolidays.length} hari</span>
                        </div>
                        <div className="space-y-2 ml-5">
                          {monthHolidays.map((holiday, i) => {
                            const date = new Date(holiday.date + 'T00:00:00');
                            const isSelected =
                              selectedDate &&
                              selectedDate.toDateString() === date.toDateString();
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                                }}
                                className={cn(
                                  'w-full text-left rounded-xl p-3 border transition-all duration-200 hover:shadow-sm group',
                                  isSelected
                                    ? 'bg-destructive/10 border-destructive/30 shadow-sm ring-1 ring-destructive/20'
                                    : 'bg-background/60 border-border/50 hover:bg-card hover:border-border'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors",
                                      isSelected ? "bg-destructive text-white" : "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white"
                                    )}>
                                      {date.getDate()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-foreground">{holiday.localName}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{formatTanggal(holiday.date)}</p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs shrink-0",
                                      isSelected ? "border-destructive/50 text-destructive" : "border-destructive/30 text-destructive"
                                    )}
                                  >
                                    Libur
                                  </Badge>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
