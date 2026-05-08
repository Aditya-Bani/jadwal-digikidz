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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10 animate-fade-in">
        {parentNotifications.length > 0 && (
          <div className="col-span-1 lg:col-span-2 mb-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-sm animate-fade-in">
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

        <div className="hidden lg:flex flex-col items-center justify-center text-center lg:text-left lg:items-start space-y-6">
          <img src={logodk} alt="DIGIKIDZ" className="h-16 w-auto mb-4" />
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
              Parent <br /> <span className="text-primary italic">Portal.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-sm">
              Lihat perkembangan kreativitas buah hati Anda melalui Activity Report eksklusif dari Digikidz.
            </p>
          </div>

          <div className="relative pt-10">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-75 animate-pulse" />
            <img
              src={mascotParent}
              alt="Mascot Parent"
              className="relative h-64 object-contain drop-shadow-2xl animate-bounce-subtle"
            />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="lg:hidden mb-10 text-center flex flex-col items-center">
            <img src={logodk} alt="DIGIKIDZ" className="h-12 mb-6" />
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-75 animate-pulse" />
              <img src={mascotParent} alt="Mascot Parent" className="relative h-32 object-contain drop-shadow-xl animate-bounce-subtle" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Parent Portal</h2>
          </div>

          <div className="glass-card w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] border-none shadow-2xl shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4">
              <KeyRound className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Akses Laporan Murid</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Masukkan 6 digit kode unik yang diberikan oleh Coach
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Code</Label>
                  <Input
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="XXXXXX"
                    className="h-16 rounded-2xl border-none bg-muted/50 text-center text-3xl font-black tracking-[0.5em] focus-visible:ring-primary shadow-inner"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-xl text-center border border-destructive/20 animate-shake">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSubmitCode}
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
                  size="lg"
                  disabled={loadingCode || code.length < 6}
                >
                  {loadingCode ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      Masuk Portal
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-6 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  Belum punya kode? <a
                    href="https://wa.me/6285169991918?text=Halo%20Education%20Center%20Digikidz%2C%20saya%20adalah%20orang%20tua%20murid.%20Boleh%20saya%20minta%20kode%20akses%20untuk%20melihat%20Activity%20Report%20anak%20saya%20di%20Parent%20Portal%3F%20Terima%20kasih."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold cursor-pointer hover:underline"
                  >
                    Hubungi Education Center
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="fixed bottom-8 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 pointer-events-none">
        School Of Technology • Digikidz Indonesia
      </p>
    </div>
  );
}

function ParentReportView({ studentName, accessCode, onBack }: { studentName: string; accessCode: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName, accessCode);
  const { certificates } = useCertificates(studentName);
  const { getProgramLimit } = usePrograms();

  const [viewMode, setViewMode] = useState<'dashboard' | 'player'>('dashboard');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<ActivityReport | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);
  const [activityFilterLevel, setActivityFilterLevel] = useState<string>('all');
  const [activityFilterWeek, setActivityFilterWeek] = useState<string>('all');
  const [activityFilterMedia, setActivityFilterMedia] = useState<'all' | 'photo' | 'video'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { levels, trialReport } = groupReportsByLevel(reports);
  const { activeNotifications } = useNotifications();

  // Filter only notifications meant for parents
  const parentNotifications = activeNotifications
    .filter(n => n.message.startsWith('[PARENT]'))
    .map(n => n.message.replace(/^\[PARENT\]\s*/, ''));

  const programRaw = reports[0]?.level || '';
  const programName = programRaw.includes(' - ') ? programRaw.split(' - ')[0] : programRaw;
  const maxLevel = getProgramLimit(programName);

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
    const levelFromReport = report.level.match(/\d+/)?.[0] || '';
    const matchesLevel = activityFilterLevel === 'all' || levelFromReport === activityFilterLevel;
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
    const levelMatch = report.level.match(/\d+/);
    const parsedLevel = levelMatch ? parseInt(levelMatch[0], 10) : null;
    if (parsedLevel) setSelectedLevel(parsedLevel);
    setSelectedReport(report);
    setViewMode('player');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50/50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <PortalHeader studentName={studentName} onLogout={onBack} />
      
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
