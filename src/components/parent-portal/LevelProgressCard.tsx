import { Trophy, Medal, BookOpen, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LevelGroup } from '@/lib/levelUtils';
import { StudentCertificate } from '@/hooks/useCertificates';

interface LevelProgressCardProps {
  lvl: LevelGroup;
  certificate?: StudentCertificate;
  onViewCertificate: (cert: StudentCertificate) => void;
  onViewActivity: (level: number) => void;
}

export function LevelProgressCard({ lvl, certificate, onViewCertificate, onViewActivity }: LevelProgressCardProps) {
  const isCompleted = !!certificate;

  return (
    <div className={`group bg-white border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${isCompleted ? 'border-emerald-200 shadow-emerald-500/5 ring-1 ring-emerald-100/50' : 'border-slate-200'}`}>
      {isCompleted && (
        <div className="absolute top-0 right-0 p-4 opacity-10 -mr-2 -mt-2 rotate-12 group-hover:rotate-0 transition-transform duration-500">
          <Trophy className="w-20 h-20 text-emerald-600" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-lg ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            {isCompleted ? <Medal className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {isCompleted ? 'Telah diselesaikan' : 'Sedang dipelajari'}
              </span>
              {isCompleted && <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Level {lvl.level} - Kurikulum Pembelajaran</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Berisi laporan aktivitas mingguan dari Week {lvl.start} - {lvl.end}.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {certificate && (
            <Button onClick={() => onViewCertificate(certificate)} variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 text-slate-600 h-11">
              <FileText className="w-4 h-4" /> Lihat Sertifikat
            </Button>
          )}
          <Button onClick={() => onViewActivity(lvl.level)} className={`rounded-xl font-bold gap-2 h-11 px-8 ${isCompleted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
            {isCompleted ? 'Cek Activity Report' : 'Lanjutkan Belajar'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
