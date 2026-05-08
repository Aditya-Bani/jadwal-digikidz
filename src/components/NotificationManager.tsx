import { useState } from 'react';
import { AdminNotification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

interface NotificationManagerProps {
  notifications: AdminNotification[];
  onAdd: (message: string) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NotificationManager({ notifications, onAdd, onToggle, onDelete }: NotificationManagerProps) {
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'internal' | 'parent'>('internal');

  const handleAdd = async () => {
    if (!newMessage.trim()) return;
    setSubmitting(true);

    // Add [PARENT] prefix if in parent tab
    let finalMessage = newMessage.trim();
    if (activeTab === 'parent' && !finalMessage.startsWith('[PARENT]')) {
      finalMessage = `[PARENT] ${finalMessage}`;
    }

    await onAdd(finalMessage);
    setNewMessage('');
    setSubmitting(false);
  };

  // Filter and format notifications based on the active tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'parent') return n.message.startsWith('[PARENT]');
    return !n.message.startsWith('[PARENT]');
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Megaphone className="w-4 h-4" />
          Notifikasi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Pengumuman</DialogTitle>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex bg-muted/50 p-1 rounded-xl mb-2 border border-border">
          <button
            onClick={() => setActiveTab('internal')}
            className={`flex-1 text-sm font-semibold py-1.5 rounded-lg transition-all ${activeTab === 'internal' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Dashboard Coach
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 text-sm font-semibold py-1.5 rounded-lg transition-all ${activeTab === 'parent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Parent Portal
          </button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder={activeTab === 'internal' ? "Pengumuman untuk Coach..." : "Pengumuman untuk Orang Tua..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={submitting || !newMessage.trim()} size="icon" className={activeTab === 'parent' ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto mt-4 pr-1 custom-scrollbar">
          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <Megaphone className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Belum ada pengumuman.</p>
            </div>
          )}
          {filteredNotifications.map((n) => {
            // Remove the [PARENT] prefix for display
            const displayMessage = n.message.replace(/^\[PARENT\]\s*/, '');

            return (
              <div
                key={n.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${n.isActive
                    ? activeTab === 'parent'
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/50 shadow-sm'
                      : 'bg-primary/5 border-primary/20 shadow-sm'
                    : 'bg-muted/30 border-border opacity-70'
                  }`}
              >
                <div className="flex-shrink-0">
                  <Switch
                    checked={n.isActive}
                    onCheckedChange={(checked) => onToggle(n.id, checked)}
                    className={activeTab === 'parent' ? "data-[state=checked]:bg-amber-500" : "data-[state=checked]:bg-primary"}
                  />
                </div>
                <span className={`flex-1 text-sm font-medium leading-tight transition-all ${n.isActive ? 'text-foreground' : 'text-muted-foreground line-through'
                  }`}>
                  {displayMessage}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={() => onDelete(n.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
