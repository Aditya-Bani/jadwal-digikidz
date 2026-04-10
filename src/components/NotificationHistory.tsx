import { AdminNotification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, CheckCircle2, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationHistoryProps {
    notifications: AdminNotification[];
    currentCoach: string;
    onMarkAsRead: (id: string, name: string) => void;
}

export function NotificationHistory({ notifications, currentCoach, onMarkAsRead }: NotificationHistoryProps) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Belum ada riwayat pengumuman.</p>
                <p className="text-xs">Update terbaru dari admin akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map((n) => {
                const isRead = n.readBy.includes(currentCoach);

                return (
                    <div
                        key={n.id}
                        className={cn(
                            "group relative overflow-hidden p-5 rounded-2xl border transition-all duration-300",
                            isRead
                                ? "bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
                                : "bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10"
                        )}
                    >
                        {!isRead && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant={isRead ? "outline" : "default"} className={cn("text-[10px] uppercase tracking-tighter h-5 px-1.5 font-bold", isRead ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-blue-500 text-white border-transparent")}>
                                        {isRead ? "DIBACA" : "BARU"}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {new Date(n.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <h4 className={cn("text-sm md:text-base font-bold leading-relaxed", isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white")}>
                                    {n.message}
                                </h4>

                                {n.readBy.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mr-1">
                                            <User className="w-3 h-3" /> Dibaca oleh:
                                        </span>
                                        {n.readBy.map((name) => (
                                            <Badge key={name} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] h-4.5 font-medium border-0">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isRead && (
                                <Button
                                    size="sm"
                                    onClick={() => onMarkAsRead(n.id, currentCoach)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 gap-2 h-9"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Tandai Sudah Baca
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
