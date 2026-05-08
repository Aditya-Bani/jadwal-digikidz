import { Megaphone, Rocket, Sparkles, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { LevelGroup } from '@/lib/levelUtils';
import { StudentCertificate } from '@/hooks/useCertificates';
import { ActivityReport } from '@/hooks/useActivityReports';
import { LevelProgressCard } from './LevelProgressCard';
import { ActivityFilterBar } from './ActivityFilterBar';
import logodk from '@/assets/logodk.png';

interface PortalDashboardProps {
  studentName: string;
  parentNotifications: string[];
  stats: {
    totalReports: number;
    completedLevels: number;
    currentLevel: number;
    programName: string;
    maxLevel: number;
  };
  levels: LevelGroup[];
  trialReport: ActivityReport | undefined;
  getCertForLevel: (level: number) => StudentCertificate | undefined;
  onViewCertificate: (cert: StudentCertificate) => void;
  onViewActivity: (level: number) => void;
  onViewTrial: () => void;
  
  // Filter props
  activityFilterLevel: string;
  setActivityFilterLevel: (val: string) => void;
  activityFilterWeek: string;
  setActivityFilterWeek: (val: string) => void;
  activityFilterMedia: 'all' | 'photo' | 'video';
  setActivityFilterMedia: (val: 'all' | 'photo' | 'video') => void;
  allReportWeeks: number[];
  filteredActivityReports: ActivityReport[];
  hasActiveActivityFilter: boolean;
  activeActivityFilterCount: number;
  onOpenReport: (report: ActivityReport) => void;
}

export function PortalDashboard({
  studentName,
  parentNotifications,
  stats,
  levels,
  trialReport,
  getCertForLevel,
  onViewCertificate,
  onViewActivity,
  onViewTrial,
  activityFilterLevel,
  setActivityFilterLevel,
  activityFilterWeek,
  setActivityFilterWeek,
  activityFilterMedia,
  setActivityFilterMedia,
  allReportWeeks,
  filteredActivityReports,
  hasActiveActivityFilter,
  activeActivityFilterCount,
  onOpenReport
}: PortalDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {parentNotifications.length > 0 && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-sm animate-fade-in">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-xl shrink-0">
              <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Pemberitahuan</p>
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                {parentNotifications.map((msg, idx) => (
                  <p key={idx}>{msg}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 sm:flex items-end justify-between gap-6">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Aktivitas Belajar</h1>
            <p className="text-slate-500 font-medium mt-1">Progres pembelajaran di <span className="text-primary font-bold">{stats.programName}</span></p>
          </div>
          <div className="grid grid-cols-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white shadow-sm shrink-0 overflow-hidden">
            <div className="text-center px-3 sm:px-5 py-3 sm:py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sesi</p>
              <p className="text-lg font-black text-primary leading-none">{stats.totalReports}</p>
            </div>
            <div className="text-center px-3 sm:px-5 py-3 sm:py-4 border-l border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lulus</p>
              <p className="text-lg font-black text-emerald-600 leading-none">{stats.completedLevels} <span className="text-[10px] text-slate-400">lvl</span></p>
            </div>
            <div className="text-center px-3 sm:px-5 py-3 sm:py-4 border-l border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Akhir</p>
              <p className="text-lg font-black text-amber-500 leading-none">Lv {stats.maxLevel}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ActivityFilterBar
            activityFilterLevel={activityFilterLevel}
            setActivityFilterLevel={setActivityFilterLevel}
            activityFilterWeek={activityFilterWeek}
            setActivityFilterWeek={setActivityFilterWeek}
            activityFilterMedia={activityFilterMedia}
            setActivityFilterMedia={setActivityFilterMedia}
            levels={levels}
            allReportWeeks={allReportWeeks}
            filteredActivityReports={filteredActivityReports}
            hasActiveActivityFilter={hasActiveActivityFilter}
            activeActivityFilterCount={activeActivityFilterCount}
            onOpenReport={onOpenReport}
          />

          {trialReport && (
            <div className="group bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ring-1 ring-indigo-50/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 -mr-2 -mt-2 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Rocket className="w-20 h-20 text-indigo-600" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                        Sesi Perkenalan
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">TRIAL</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Masa Percobaan (Trial Session)</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Laporan aktivitas pertama kali saat bergabung di Digikidz.</p>
                  </div>
                </div>
                <Button onClick={onViewTrial} className="rounded-xl font-bold gap-2 h-11 px-8 bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                  Lihat Detail Trial <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {levels.length === 0 && !trialReport ? (
            <EmptyState title="Belum Ada Aktivitas" description="Hubungi Coach jika Anda merasa ini adalah kesalahan." />
          ) : levels.map((lvl) => (
            <LevelProgressCard
              key={lvl.level}
              lvl={lvl}
              certificate={getCertForLevel(lvl.level)}
              onViewCertificate={onViewCertificate}
              onViewActivity={onViewActivity}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
