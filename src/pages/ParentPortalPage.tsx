import { useState } from 'react';
import { useActivityReports, useAccessCodes, ActivityReport } from '@/hooks/useActivityReports';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft, BookOpen, FolderOpen, User, Loader2, Sparkles, Megaphone, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { groupReportsByLevel } from '@/lib/levelUtils';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader as DefaultDialogHeader,
  DialogTitle as DefaultDialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import logodk from '@/assets/logodk.png';
import mascotParent from '@/assets/Mascot Optional CS6_Artboard 8.png';
import { LinkifiedText } from '@/components/LinkifiedText';
import { LogOut } from 'lucide-react';


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
      // Ensure the code used for lookup is preserved if needed, though 'code' state already has it
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
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10 animate-fade-in">

        {/* Parent Portal Announcement Banner */}
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

        {/* Left Side: Illustration & Welcome */}
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

        {/* Right Side: Entry Card */}
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

      {/* Footer Decoration */}
      <p className="fixed bottom-8 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 pointer-events-none">
        School Of Technology • Digikidz Indonesia
      </p>
    </div>
  );
}

// ─── WeekCard ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-bold text-foreground w-20 shrink-0">{label}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function WeekCard({ report, onClick }: { report: ActivityReport; onClick: (r: ActivityReport) => void }) {
  return (
    <div className="w-[200px] sm:w-[220px] shrink-0">
      <button
        onClick={() => onClick(report)}
        className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-all text-left space-y-2 group shadow-sm hover:shadow-md"
      >

        <div className="flex justify-between items-start">
          <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">Week {report.lessonWeek}</p>
          <Sparkles className="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground line-clamp-2 leading-relaxed">{report.lessonName}</p>
        <div className="pt-2 border-t border-border/30">
          <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
            {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </button>
    </div>
  );
}


// ─── WeekRow ───────────────────────────────────────────────────────────────────

function WeekRow({ label, reports, onReportClick }: { label: string; reports: ActivityReport[]; onReportClick: (r: ActivityReport) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
      </div>
      <ScrollArea className="w-full">
        <div className="flex flex-row gap-4 pb-4">

          {reports.length > 0 ? (
            reports.map((r) => <WeekCard key={r.id} report={r} onClick={onReportClick} />)
          ) : (
            <div className="w-full text-center py-8 border border-dashed border-border/50 rounded-3xl bg-muted/20">
              <p className="text-xs text-muted-foreground italic">Belum ada report untuk periode ini</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}


// ─── ParentReportView ──────────────────────────────────────────────────────────

function ParentReportView({ studentName, accessCode, onBack }: { studentName: string; accessCode: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName, accessCode);

  const [selectedReport, setSelectedReport] = useState<ActivityReport | null>(null);
  const levels = groupReportsByLevel(reports);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">{studentName}</h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground truncate">
                Activity Report History
              </p>
            </div>
          </div>
          <img src={logodk} alt="DIGIKIDZ" className="h-8 sm:h-10 lg:h-12 shrink-0 object-contain" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10 animate-fade-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
            </div>
            <p className="font-bold text-muted-foreground animate-pulse">Menghubungkan ke arsip...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Laporan Belum Tersedia"
              description={`Sepertinya Coach belum menambahkan laporan aktivitas untuk ${studentName}. Hubungi Coach untuk informasi lebih lanjut.`}
            />
          </div>
        ) : (
          <div className="space-y-12">
            {levels.map((lvl) => (
              <div key={lvl.level} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">Level {lvl.level}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Kurikulum Pembelajaran</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="glass-card p-5 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] border-none shadow-2xl shadow-primary/5 bg-background/40 backdrop-blur-md">

                    <WeekRow
                      label={`Tahap Awal (Week ${lvl.start} – ${lvl.start + 7})`}
                      reports={lvl.halfA}
                      onReportClick={setSelectedReport}
                    />
                  </div>
                  <div className="glass-card p-5 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] border-none shadow-2xl shadow-primary/5 bg-background/40 backdrop-blur-md">
                    <WeekRow
                      label={`Tahap Lanjut (Week ${lvl.start + 8} – ${lvl.end})`}
                      reports={lvl.halfB}
                      onReportClick={setSelectedReport}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-border/50 text-center">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.5em]">© School Of Technology Digikidz</p>
        </div>
      </main>

      {/* Floating Logout Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" size="lg" className="rounded-full h-14 px-6 sm:px-8 shadow-2xl shadow-destructive/20 bg-background border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-bold transition-all group">
              <LogOut className="h-5 w-5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline text-base">Keluar Portal</span>
              <span className="sm:hidden ml-2 text-sm">Keluar</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 max-w-md border-none shadow-3xl bg-background/95 backdrop-blur-xl w-[90vw] sm:w-full">
            <AlertDialogHeader className="space-y-4">
              <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                <LogOut className="h-8 w-8 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl font-black text-center text-foreground">Keluar dari Portal?</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm font-medium text-muted-foreground leading-relaxed">
                Anda harus memasukkan ulang <span className="font-bold text-foreground">6 digit kode akses</span> jika ingin melihat laporan anak Anda kembali.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="w-full sm:w-1/2 rounded-xl h-12 font-bold bg-muted/50 hover:bg-muted border-none">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={onBack} className="w-full sm:w-1/2 rounded-xl h-12 font-bold bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20 border-none">
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Centralized Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-3xl bg-background/95 backdrop-blur-xl w-[92vw] sm:w-full">


          {selectedReport && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="bg-primary p-5 sm:p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="w-24 h-24" />
                </div>
                <DefaultDialogHeader className="p-0 text-left space-y-2 pr-8">

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Week {selectedReport.lessonWeek}</p>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-white/50" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{selectedReport.level}</p>
                  </div>
                  <DefaultDialogTitle className="text-xl sm:text-3xl font-black text-white leading-tight">
                    {selectedReport.lessonName}
                  </DefaultDialogTitle>

                </DefaultDialogHeader>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 sm:p-10 space-y-6 sm:space-y-8">
                  {/* Bio Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-muted/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/50">

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Murid</p>
                      <p className="font-bold text-foreground flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-primary" /> {selectedReport.studentName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Sesi</p>
                      <p className="font-bold text-foreground text-sm">
                        📅 {new Date(selectedReport.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border/30">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tools & Platform</p>
                      <p className="font-bold text-foreground text-sm">🛠 {selectedReport.tools || '-'}</p>
                    </div>
                  </div>

                  {/* Goals & Activity Sections */}
                  <div className="space-y-8">
                    {selectedReport.goalsMateri && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 rounded-full bg-primary" />
                          <h4 className="font-black text-[10px] sm:text-sm uppercase tracking-widest text-foreground">Goals Materi</h4>
                        </div>
                        <ul className="grid grid-cols-1 gap-2 sm:gap-3">
                          {selectedReport.goalsMateri.split('\n').filter(Boolean).map((line, i) => (
                            <li key={i} className="flex gap-3 text-sm text-foreground bg-muted/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/20">

                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed font-medium">{line.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReport.activityReportText && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 rounded-full bg-primary" />
                          <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Activity Summary</h4>
                        </div>
                        <div className="bg-card/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/30 shadow-inner">
                          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-line italic">
                            "<LinkifiedText text={selectedReport.activityReportText} />"
                          </div>
                        </div>

                      </div>
                    )}

                    {selectedReport.coachComment && (
                      <div className="bg-amber-50 border border-amber-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                          <Sparkles className="h-10 w-10 text-amber-500" />
                        </div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Komentar Khusus Coach :</p>
                        <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">{selectedReport.coachComment}</p>
                      </div>
                    )}


                    {selectedReport.externalLinks && selectedReport.externalLinks.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 rounded-full bg-primary" />
                          <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Link Tambahan</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedReport.externalLinks.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background shadow-sm border border-border/10 group-hover:text-primary transition-colors">
                                  <LinkIcon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-foreground">{link.label || 'Buka Link'}</span>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.mediaUrls.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 rounded-full bg-primary" />
                          <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Dokumentasi Kelas</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedReport.mediaUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-square relative group overflow-hidden rounded-2xl border border-border/50"
                            >
                              <img
                                src={url}
                                alt={`Kegiatan ${i + 1}`}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Lihat Foto</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Modal */}
                  <div className="pt-8 border-t border-border/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diinput oleh :</p>
                      <p className="text-sm font-black text-primary">{selectedReport.coach}</p>
                    </div>
                    <img src={logodk} alt="Logo" className="h-8 opacity-50" />
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

