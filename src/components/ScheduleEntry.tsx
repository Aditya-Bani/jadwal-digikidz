import { ScheduleEntry as ScheduleEntryType } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleEntryProps {
  entry: ScheduleEntryType;
  onEdit: (entry: ScheduleEntryType) => void;
  onDelete: (id: string) => void;
}

function getLevelClass(level: string): string {
  if (level.startsWith('Little Creator')) return 'level-little-creator';
  if (level.startsWith('Junior')) return 'level-junior';
  if (level.startsWith('Teenager')) return 'level-teenager';
  if (level === 'Trial Class') return 'level-trial';
  return '';
}

export function ScheduleEntryCard({ entry, onEdit, onDelete }: ScheduleEntryProps) {
  const coachClass = entry.coach === 'Mr. Bani' ? 'coach-bani' : 'coach-argy';
  const levelClass = getLevelClass(entry.level);
  const inactiveClass = !entry.isActive ? 'opacity-40 grayscale hover:opacity-80 transition-opacity' : '';

  return (
    <div className={cn('schedule-entry group relative border shadow-sm/50 p-2.5 rounded-xl transition-all duration-300', coachClass, inactiveClass)}>
      {!entry.isActive && (
        <div className="absolute -top-2 -right-2 bg-slate-500 text-white text-[9px] px-2 py-1 rounded-full font-bold shadow-sm z-10 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
          <span className="opacity-70">Nonaktif</span>
          {entry.inactiveReason && (
            <>
              <div className="w-px h-2 bg-white/30" />
              <span>{entry.inactiveReason}</span>
            </>
          )}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn("font-bold text-foreground truncate text-sm tracking-tight", !entry.isActive && "line-through opacity-70")}>{entry.studentName}</p>
          <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-0.5">{entry.coach}</p>
          <div className="mt-2 text-left">
            <span className={cn('level-badge text-[10px] py-1 px-2 font-black uppercase tracking-tighter inline-block break-words max-w-full leading-tight', levelClass)}>
              {entry.level}
            </span>
          </div>
          {entry.notes && (
            <p className="text-[10px] text-muted-foreground mt-2 italic line-clamp-2">
              <span className="opacity-50">Note:</span> {entry.notes}
            </p>
          )}

          {(entry.updatedBy || entry.updatedAt) && (
            <div className="mt-2 pt-2 border-t border-border/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <p className="text-[9px] font-bold text-muted-foreground/60 flex items-center gap-1 leading-none">
                <span className="text-primary/50">✏️</span>
                {entry.updatedBy || 'System'} • {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 transform translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            title={entry.isActive ? "Nonaktifkan Murid" : "Aktifkan Murid"}
            className={cn("h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:text-white", entry.isActive ? "hover:bg-amber-500" : "hover:bg-emerald-500 text-slate-400")}
            onClick={(e) => {
              e.stopPropagation();
              onEdit({ ...entry, isActive: !entry.isActive });
            }}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:bg-primary hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:bg-destructive hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
