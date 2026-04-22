import { Button } from '@/components/ui/button';
import { ActivityReport } from '@/hooks/useActivityReports';
import { LevelGroup } from '@/lib/levelUtils';

interface ActivityFilterBarProps {
  activityFilterLevel: string;
  setActivityFilterLevel: (val: string) => void;
  activityFilterWeek: string;
  setActivityFilterWeek: (val: string) => void;
  activityFilterMedia: 'all' | 'photo' | 'video';
  setActivityFilterMedia: (val: 'all' | 'photo' | 'video') => void;
  levels: LevelGroup[];
  allReportWeeks: number[];
  filteredActivityReports: ActivityReport[];
  hasActiveActivityFilter: boolean;
  activeActivityFilterCount: number;
  onOpenReport: (report: ActivityReport) => void;
}

export function ActivityFilterBar({
  activityFilterLevel,
  setActivityFilterLevel,
  activityFilterWeek,
  setActivityFilterWeek,
  activityFilterMedia,
  setActivityFilterMedia,
  levels,
  allReportWeeks,
  filteredActivityReports,
  hasActiveActivityFilter,
  activeActivityFilterCount,
  onOpenReport
}: ActivityFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cari Aktivitas Cepat</h3>
          {hasActiveActivityFilter && (
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-primary/10 text-primary">
              {activeActivityFilterCount} filter aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-500">{filteredActivityReports.length} hasil ditemukan</p>
          {hasActiveActivityFilter && (
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              onClick={() => {
                setActivityFilterLevel('all');
                setActivityFilterWeek('all');
                setActivityFilterMedia('all');
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <select
          value={activityFilterLevel}
          onChange={(e) => setActivityFilterLevel(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
        >
          <option value="all">Semua Level</option>
          {levels.map((lvl) => (
            <option key={lvl.level} value={String(lvl.level)}>Level {lvl.level}</option>
          ))}
        </select>
        <select
          value={activityFilterWeek}
          onChange={(e) => setActivityFilterWeek(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
        >
          <option value="all">Semua Minggu</option>
          {allReportWeeks.map((week) => (
            <option key={week} value={String(week)}>Week {week}</option>
          ))}
        </select>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant={activityFilterMedia === 'all' ? 'default' : 'outline'} className="rounded-xl h-10 text-xs font-bold" onClick={() => setActivityFilterMedia('all')}>Semua</Button>
          <Button type="button" variant={activityFilterMedia === 'photo' ? 'default' : 'outline'} className="rounded-xl h-10 text-xs font-bold" onClick={() => setActivityFilterMedia('photo')}>Foto</Button>
          <Button type="button" variant={activityFilterMedia === 'video' ? 'default' : 'outline'} className="rounded-xl h-10 text-xs font-bold" onClick={() => setActivityFilterMedia('video')}>Video</Button>
        </div>
      </div>
      {filteredActivityReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-medium text-slate-500">
          Tidak ada aktivitas yang cocok dengan filter saat ini.
        </div>
      ) : (
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {filteredActivityReports.slice(0, 12).map((report) => (
            <button
              key={report.id}
              onClick={() => onOpenReport(report)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-left hover:bg-slate-100 transition-colors"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Week {report.lessonWeek} • {report.level}</p>
              <p className="text-sm font-bold text-slate-800 truncate">{report.lessonName}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
