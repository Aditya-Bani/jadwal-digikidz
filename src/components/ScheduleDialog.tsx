import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ScheduleEntry,
  COACHES,
  LEVELS,
  DAYS,
  TIME_SLOTS,
  DAY_LABELS,
  DayOfWeek,
  TimeSlot,
} from '@/types/schedule';

const formSchema = z.object({
  studentName: z.string().min(1, 'Nama murid wajib diisi').max(100),
  coach: z.enum(['Mr. Bani', 'Mr. Argy']),
  level: z.enum([
    'Little Creator 1', 'Little Creator 2',
    'Junior 1', 'Junior 2',
    'Teenager 1', 'Teenager 2', 'Teenager 3',
  ]),
  day: z.enum(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']),
  time: z.enum(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']),
  isActive: z.boolean().default(true),
  inactiveReason: z.string().optional(),
  notes: z.string().max(200).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ScheduleEntry | null;
  defaultDay?: DayOfWeek;
  defaultTime?: TimeSlot;
  onSave: (data: Omit<ScheduleEntry, 'id'>) => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  entry,
  defaultDay,
  defaultTime,
  onSave,
}: ScheduleDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      coach: 'Mr. Bani',
      level: 'Little Creator 1',
      day: defaultDay || 'senin',
      time: defaultTime || '08:00',
      notes: '',
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        studentName: entry.studentName,
        coach: entry.coach,
        level: entry.level,
        day: entry.day,
        time: entry.time,
        isActive: entry.isActive,
        notes: entry.notes || '',
      });
    } else {
      form.reset({
        studentName: '',
        coach: 'Mr. Bani',
        level: 'Little Creator 1',
        day: defaultDay || 'senin',
        time: defaultTime || '08:00',
        isActive: true,
        notes: '',
      });
    }
  }, [entry, defaultDay, defaultTime, form]);

  const handleSubmit = (data: FormData) => {
    onSave({
      studentName: data.studentName,
      coach: data.coach,
      level: data.level,
      day: data.day,
      time: data.time,
      isActive: data.isActive,
      notes: data.notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {entry ? 'Edit Jadwal Murid' : 'Tambah Jadwal Baru'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {entry && (entry.updatedBy || entry.updatedAt) && (
              <div className="bg-muted/50 p-3 rounded-xl border border-border/50 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Terakhir</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {entry.updatedBy && (
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span className="text-primary">👤</span> {entry.updatedBy}
                    </p>
                  )}
                  {entry.updatedAt && (
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <span className="text-primary/70">🕒</span> {new Date(entry.updatedAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Murid</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama murid" {...field} className="rounded-xl border-border/50 bg-background mb-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih coach" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {COACHES.map((coach) => (
                          <SelectItem key={coach} value={coach}>
                            {coach}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenjang</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenjang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hari" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {DAY_LABELS[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jam</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">Status Keaktifan</FormLabel>
                    <p className="text-[10px] text-muted-foreground leading-tight">Matikan jika murid sudah tidak lanjut (arsip).</p>
                  </div>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 rounded-lg px-3 transition-all font-bold text-[11px] uppercase tracking-wider",
                        field.value
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      )}
                      onClick={() => field.onChange(!field.value)}
                    >
                      {field.value ? '🟢 Aktif' : '⚪ Nonaktif'}
                    </Button>
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch('isActive') && (
              <FormField
                control={form.control}
                name="inactiveReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alasan Nonaktif</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                          <SelectValue placeholder="Pilih alasan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="Cuti">Cuti</SelectItem>
                        <SelectItem value="Lulus">Lulus</SelectItem>
                        <SelectItem value="Pindah Jadwal">Pindah Jadwal</SelectItem>
                        <SelectItem value="Berhenti">Berhenti</SelectItem>
                        <SelectItem value="Lainnya">Lainnya (Tulis di Catatan)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan jika perlu..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">
                {entry ? 'Simpan Perubahan' : 'Tambah Jadwal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
