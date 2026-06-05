import { useState } from 'react';
import { useActivityReports, useAccessCodes, ActivityReport } from '@/hooks/useActivityReports';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCertificates, type StudentCertificate } from '@/hooks/useCertificates';
import { Label } from '@/components/ui/label';
import { groupReportsByLevel } from '@/lib/levelUtils';
import {
  KeyRound,
  Loader2,
  Megaphone,
} from 'lucide-react';
import logodk from '@/assets/logodk.png';
import mascotParent from '@/assets/Mascot Optional CS6_Artboard 8.png';

// New Refactored Components & Hooks
import { PortalHeader } from '@/components/parent-portal/PortalHeader';
import { PortalDashboard } from '@/components/parent-portal/PortalDashboard';
import { ActivityReportPlayer } from '@/components/parent-portal/ActivityReportPlayer';
import { CertificatePreviewDialog } from '@/components/parent-portal/CertificatePreviewDialog';
import { usePrograms } from '@/hooks/usePrograms';
import { useActiveBanner } from '@/hooks/useHolidayBanners';
import { HolidayBannerPopup } from '@/components/HolidayBannerPopup';

export default function ParentPortalPage() {
  const [code, setCode] = useState('');
  const [studentName, setStudentName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const { lookupByCode } = useAccessCodes();
  const { toast } = useToast();
  const { activeNotifications } = useNotifications();

  // Filter only notifications meant for parents
  const parentNotifications = activeNotifications
    .filter(n => n.message.startsWith('[PARENT]'))
    .map(n => n.message.replace(/^\[PARENT\]\s*/, ''));

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setLoadingCode(true);
    setError('');
    const result = await lookupByCode(code.trim());
    if (result) {
      setStudentName(result.studentName);
      toast({ title: 'Berhasil!', description: `Selamat datang, orang tua ${result.studentName}.` });
    } else {
      setError('Kode akses tidak ditemukan. Periksa kembali kode Anda.');
    }
    setLoadingCode(false);
  };

  if (studentName) {
    return <ParentReportView studentName={studentName} accessCode={code} onBack={() => setStudentName(null)} />;
  }

  return (
    <div className="text-[#191c1e] min-h-screen relative antialiased selection:bg-[#2563eb] selection:text-white transition-colors duration-300 font-sans flex flex-col items-center justify-between p-4" style={{ background: 'radial-gradient(circle at top right, #dbe1ff 0%, #f7f9fb 60%)' }}>
      <style>
        {`
          .glass-panel {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.4);
          }
          .bounce-in {
              animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); opacity: 1; }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); }
          }
        `}
      </style>
      
      <main className="w-full max-w-md flex flex-col items-center gap-8 py-8 z-10">
        
        {/* Notifications banner */}
        {parentNotifications.length > 0 && (
          <div className="w-full bg-[#fff7e6] border border-[#fd761a] rounded-xl p-3 md:p-4 flex gap-3 items-start text-left shadow-sm">
            <span className="material-symbols-outlined text-[#fd761a] shrink-0">campaign</span>
            <div>
              <p className="text-[11px] font-bold text-[#9d4300] uppercase tracking-wider mb-1">Pemberitahuan</p>
              {parentNotifications.map((msg, idx) => (
                <p key={idx} className="text-[13px] text-[#5c2400]">{msg}</p>
              ))}
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className="flex flex-col items-center text-center gap-4">
          <div className="w-48 h-auto">
            <img alt="Digikidz Logo" className="w-full h-auto object-contain" src={logodk} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004ac6]">Welcome Parents</h1>
            <p className="text-base text-[#434655] max-w-[280px] mx-auto font-medium">
              Enter your unique access code to view your child's progress.
            </p>
          </div>
        </header>

        {/* Mascot Image */}
        <div className="w-48 md:w-56 bounce-in">
          <img alt="Cheerful Digikidz Mascot" className="w-full h-auto drop-shadow-xl" src={mascotParent} />
        </div>

        {/* Login Card */}
        <div className="glass-panel w-full rounded-xl p-8 shadow-lg shadow-[#004ac6]/5">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmitCode(); }}>
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-[#434655] block ml-1" htmlFor="access-code">
                  Access Code
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] group-focus-within:text-[#004ac6] transition-colors">
                    lock
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-[#c3c6d7] rounded-lg focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all text-base outline-none uppercase placeholder:normal-case placeholder:text-[#c3c6d7]" 
                  id="access-code" 
                  placeholder="Enter PIN (e.g. 12345)" 
                  required 
                  type="password"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="w-full bg-[#fff0f0] border border-[#ffdad6] rounded-lg p-3 text-[13px] font-semibold text-[#ba1a1a]">
                {error}
              </div>
            )}

            <button 
              className="w-full h-14 bg-[#004ac6] hover:bg-[#2563eb] disabled:bg-[#b4c5ff] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md shadow-[#004ac6]/20 active:scale-95 transition-all duration-150" 
              type="submit"
              disabled={loadingCode || code.length < 6}
            >
              {loadingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Access Portal
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Help */}
      <footer className="mt-auto pb-6 z-10">
        <a className="text-sm font-semibold text-[#004ac6] hover:text-[#25D366] hover:underline transition-all flex items-center gap-1" href={`https://wa.me/6285169991918?text=${encodeURIComponent('Halo Education Consultant, saya ingin bertanya/konfirmasi mengenai laporan aktivitas anak saya yang belum diupload.')}`} target="_blank" rel="noopener noreferrer">
            Need help? Contact Support
        </a>
      </footer>
    </div>
  );
}



function ParentReportView({ studentName, accessCode, onBack }: { studentName: string; accessCode: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName, accessCode);
  const { certificates } = useCertificates(studentName);
  const { getProgramLimit } = usePrograms();
  const { banner } = useActiveBanner();

  const [viewMode, setViewMode] = useState<'dashboard' | 'player'>('dashboard');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<ActivityReport | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);
  const [activityFilterLevel, setActivityFilterLevel] = useState<string>('all');
  const [activityFilterWeek, setActivityFilterWeek] = useState<string>('all');
  const [activityFilterMedia, setActivityFilterMedia] = useState<'all' | 'photo' | 'video'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const programRaw = reports[0]?.level || '';
  const programName = programRaw.includes(' - ') ? programRaw.split(' - ')[0] : programRaw;
  const maxLevel = getProgramLimit(programName);

  const { levels, trialReport } = groupReportsByLevel(reports, maxLevel);
  const { activeNotifications } = useNotifications();

  // Filter only notifications meant for parents
  const parentNotifications = activeNotifications
    .filter(n => n.message.startsWith('[PARENT]'))
    .map(n => n.message.replace(/^\[PARENT\]\s*/, ''));

  const getCertForLevel = (levelNumber: number) => {
    return certificates.find(cert => {
      try {
        // Cert level stored as JSON: { level: "Level 1", jenjang: "Teenager 2" }
        // Match against parsed.level ("Level 1" → 1), NOT jenjang ("Teenager 2" → 2)
        const parsed = JSON.parse(cert.level);
        const certLevelStr = parsed.level || cert.level;
        const matchResult = certLevelStr.match(/\d+/);
        return matchResult ? parseInt(matchResult[0], 10) === levelNumber : false;
      } catch {
        // Fallback for plain string
        const matchResult = cert.level.match(/\d+/);
        return matchResult ? parseInt(matchResult[0], 10) === levelNumber : false;
      }
    });
  };

  const stats = {
    totalReports: reports.length,
    completedLevels: levels.filter(l => !!getCertForLevel(l.level)).length,
    currentLevel: levels.find(l => !getCertForLevel(l.level))?.level || Math.max(...levels.map(l => l.level), 0),
    programName,
    maxLevel
  };

  const handleStartLevel = (level: number) => {
    setSelectedLevel(level);
    setViewMode('player');
    const lvlData = levels.find(l => l.level === level);
    if (lvlData) {
      const firstReport = lvlData.halfA[0] || lvlData.halfB[0];
      if (firstReport) setSelectedReport(firstReport);
    }
  };

  const handleStartTrial = () => {
    if (!trialReport) return;
    setSelectedReport(trialReport);
    setViewMode('player');
  };

  const allReportWeeks = Array.from(new Set(reports.map(r => r.lessonWeek))).sort((a, b) => a - b);
  const filteredActivityReports = reports.filter((report) => {
    const calculatedLevel = Math.max(1, Math.ceil(report.lessonWeek / 16));
    const matchesLevel = activityFilterLevel === 'all' || String(calculatedLevel) === activityFilterLevel;
    const matchesWeek = activityFilterWeek === 'all' || String(report.lessonWeek) === activityFilterWeek;

    const hasVideo = report.mediaUrls.some((url) => /\.(mov|mp4|webm|ogg)$/i.test(url));
    const hasPhoto = report.mediaUrls.some((url) => !/\.(mov|mp4|webm|ogg)$/i.test(url));
    const matchesMedia =
      activityFilterMedia === 'all' ||
      (activityFilterMedia === 'video' && hasVideo) ||
      (activityFilterMedia === 'photo' && hasPhoto);

    return matchesLevel && matchesWeek && matchesMedia;
  });
  const hasActiveActivityFilter = activityFilterLevel !== 'all' || activityFilterWeek !== 'all' || activityFilterMedia !== 'all';
  const activeActivityFilterCount = [activityFilterLevel !== 'all', activityFilterWeek !== 'all', activityFilterMedia !== 'all'].filter(Boolean).length;

  const handleOpenFilteredActivity = (report: ActivityReport) => {
    const parsedLevel = Math.max(1, Math.ceil(report.lessonWeek / 16));
    setSelectedLevel(parsedLevel);
    setSelectedReport(report);
    setViewMode('player');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50/50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <>
      {banner && <HolidayBannerPopup banner={banner} />}
      
      {viewMode === 'dashboard' ? (
        <PortalDashboard
          studentName={studentName}
          parentNotifications={parentNotifications}
          stats={stats}
          levels={levels}
          trialReport={trialReport}
          getCertForLevel={getCertForLevel}
          onViewCertificate={setSelectedCertificate}
          onViewActivity={handleStartLevel}
          onViewTrial={handleStartTrial}
          activityFilterLevel={activityFilterLevel}
          setActivityFilterLevel={setActivityFilterLevel}
          activityFilterWeek={activityFilterWeek}
          setActivityFilterWeek={setActivityFilterWeek}
          activityFilterMedia={activityFilterMedia}
          setActivityFilterMedia={setActivityFilterMedia}
          allReportWeeks={allReportWeeks}
          filteredActivityReports={filteredActivityReports}
          hasActiveActivityFilter={hasActiveActivityFilter}
          activeActivityFilterCount={activeActivityFilterCount}
          onOpenReport={handleOpenFilteredActivity}
          onLogout={onBack}
        />
      ) : (
        <ActivityReportPlayer
          selectedReport={selectedReport}
          selectedLevel={selectedLevel}
          setSelectedReport={setSelectedReport}
          setSelectedLevel={(lvl) => lvl === null ? setViewMode('dashboard') : setSelectedLevel(lvl)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          progressPercent={Math.min(Math.round(( (levels.find(l => l.level === (selectedLevel ?? 1))?.halfA.length || 0) + (levels.find(l => l.level === (selectedLevel ?? 1))?.halfB.length || 0) ) / 16 * 100), 100)}
          trialReport={trialReport}
          levels={levels}
          reportsA={levels.find(l => l.level === selectedLevel)?.halfA || []}
          reportsB={levels.find(l => l.level === selectedLevel)?.halfB || []}
          effectiveLevel={selectedLevel}
        />
      )}

      <CertificatePreviewDialog
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </>
  );
}
