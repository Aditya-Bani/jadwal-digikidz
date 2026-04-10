import { useEffect, useState } from 'react';
import { useActivityReports, useAccessCodes, ActivityReport } from '@/hooks/useActivityReports';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCertificates, type StudentCertificate } from '@/hooks/useCertificates';
import { Label } from '@/components/ui/label';
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@/components/ui/accordion";
import {
   Sheet,
   SheetContent,
   SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { groupReportsByLevel } from '@/lib/levelUtils';
import { EmptyState } from '@/components/EmptyState';
import {
   KeyRound,
   ArrowLeft,
   BookOpen,
   FolderOpen,
   User,
   Loader2,
   Sparkles,
   Megaphone,
   Link as LinkIcon,
   ExternalLink,
   GraduationCap,
   Download,
   CheckCircle2,
   FileText,
   ChevronRight,
   ChevronLeft,
   PanelRightClose,
   PanelRightOpen,
   LayoutDashboard,
   Menu,
   PlayCircle,
   Trophy,
   Medal,
   ArrowRight,
   Rocket,
   LogOut
} from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';


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

const CERTIFICATES_BUCKET = 'certificates';
const CERTIFICATE_SIGNED_URL_EXPIRES_IN = 60 * 15;
const SUPPORTED_CERTIFICATE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

type CertificatePreviewIssue =
   | 'not_found'
   | 'not_public_or_forbidden'
   | 'unsupported_format'
   | 'invalid_url'
   | 'unknown';

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const normalizeCertificatePath = (rawUrl: string) => {
   const cleaned = rawUrl.trim();
   if (!cleaned) return '';

   if (!isAbsoluteUrl(cleaned)) {
      const withoutLeadingSlash = cleaned.replace(/^\/+/, '');
      return withoutLeadingSlash.startsWith(`${CERTIFICATES_BUCKET}/`)
         ? withoutLeadingSlash.slice(CERTIFICATES_BUCKET.length + 1)
         : withoutLeadingSlash;
   }

   try {
      const parsed = new URL(cleaned);
      const marker = `/object/public/${CERTIFICATES_BUCKET}/`;
      const markerIdx = parsed.pathname.indexOf(marker);
      if (markerIdx === -1) return '';
      const objectPath = parsed.pathname.slice(markerIdx + marker.length);
      return decodeURIComponent(objectPath);
   } catch {
      return '';
   }
};

const resolveCertificateUrl = (rawUrl: string) => {
   if (!rawUrl) return '';

   if (isAbsoluteUrl(rawUrl)) return rawUrl;

   const normalizedPath = normalizeCertificatePath(rawUrl);
   if (!normalizedPath) return rawUrl;

   const { data } = supabase.storage.from(CERTIFICATES_BUCKET).getPublicUrl(normalizedPath);
   return data.publicUrl;
};

const isPdfUrl = (url: string) => {
   if (!url) return false;
   try {
      return new URL(url).pathname.toLowerCase().endsWith('.pdf');
   } catch {
      return url.toLowerCase().split('?')[0].endsWith('.pdf');
   }
};

const getExtensionFromUrl = (url: string) => {
   try {
      return new URL(url).pathname.toLowerCase();
   } catch {
      return url.toLowerCase().split('?')[0];
   }
};

const isSupportedCertificateUrl = (url: string) => {
   const path = getExtensionFromUrl(url);
   return SUPPORTED_CERTIFICATE_EXTENSIONS.some(ext => path.endsWith(ext));
};

const getCertificatePreviewIssueMessage = (issue: CertificatePreviewIssue) => {
   switch (issue) {
      case 'not_found':
         return 'File sertifikat tidak ditemukan. Kemungkinan file sudah dipindah atau dihapus.';
      case 'not_public_or_forbidden':
         return 'File tidak bisa diakses. Biasanya karena bucket private atau izin akses belum benar.';
      case 'unsupported_format':
         return 'Format file belum didukung untuk preview. Gunakan PDF atau gambar (PNG/JPG/WEBP).';
      case 'invalid_url':
         return 'URL file sertifikat tidak valid.';
      default:
         return 'Preview sertifikat gagal dimuat. Coba lagi atau buka file di tab baru.';
   }
};

const resolveCertificateAccessUrl = async (rawUrl: string): Promise<{ url: string; issue: CertificatePreviewIssue | null }> => {
   const cleaned = rawUrl.trim();
   if (!cleaned) return { url: '', issue: 'invalid_url' };
   if (!isSupportedCertificateUrl(cleaned)) return { url: cleaned, issue: 'unsupported_format' };

   const normalizedPath = normalizeCertificatePath(cleaned);
   if (normalizedPath) {
      const { data, error } = await supabase.storage
         .from(CERTIFICATES_BUCKET)
         .createSignedUrl(normalizedPath, CERTIFICATE_SIGNED_URL_EXPIRES_IN);

      if (!error && data?.signedUrl) {
         return { url: data.signedUrl, issue: null };
      }

      if (error) {
         const msg = error.message.toLowerCase();
         if (msg.includes('not found') || msg.includes('404')) return { url: '', issue: 'not_found' };
         if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('forbidden')) {
            return { url: '', issue: 'not_public_or_forbidden' };
         }
      }

      const { data: publicData } = supabase.storage.from(CERTIFICATES_BUCKET).getPublicUrl(normalizedPath);
      if (publicData?.publicUrl) return { url: publicData.publicUrl, issue: null };
   }

   if (isAbsoluteUrl(cleaned)) return { url: cleaned, issue: null };
   return { url: cleaned, issue: 'invalid_url' };
};


function ParentReportView({ studentName, accessCode, onBack }: { studentName: string; accessCode: string; onBack: () => void }) {
   const { reports, loading } = useActivityReports(studentName, accessCode);
   const { certificates } = useCertificates(studentName);

   const [viewMode, setViewMode] = useState<'dashboard' | 'player'>('dashboard');
   const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
   const [selectedReport, setSelectedReport] = useState<ActivityReport | null>(null);
   const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);
   const [resolvedCertificateUrl, setResolvedCertificateUrl] = useState('');
   const [isResolvingCertificate, setIsResolvingCertificate] = useState(false);
   const [certificatePreviewIssue, setCertificatePreviewIssue] = useState<CertificatePreviewIssue | null>(null);
   const [activityFilterLevel, setActivityFilterLevel] = useState<string>('all');
   const [activityFilterWeek, setActivityFilterWeek] = useState<string>('all');
   const [activityFilterMedia, setActivityFilterMedia] = useState<'all' | 'photo' | 'video'>('all');
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const { levels, trialReport } = groupReportsByLevel(reports);

   useEffect(() => {
      let cancelled = false;
      const resolve = async () => {
         if (!selectedCertificate?.fileUrl) {
            setResolvedCertificateUrl('');
            setCertificatePreviewIssue(null);
            return;
         }

         setIsResolvingCertificate(true);
         const result = await resolveCertificateAccessUrl(selectedCertificate.fileUrl);
         if (cancelled) return;
         setResolvedCertificateUrl(result.url);
         setCertificatePreviewIssue(result.issue);
         setIsResolvingCertificate(false);
      };

      resolve();
      return () => {
         cancelled = true;
      };
   }, [selectedCertificate]);

   // Program Logic
   const programRaw = reports[0]?.level || '';
   const programName = programRaw.includes(' - ') ? programRaw.split(' - ')[0] : programRaw;

   const PROGRAM_LIMITS: Record<string, number> = {
      'Little Creator 1': 3,
      'Little Creator 2': 3,
      'Junior 1': 4,
      'Junior 2': 4,
      'Teenager 1': 6,
      'Teenager 2': 6,
      'Teenager 3': 6,
   };
   const maxLevel = PROGRAM_LIMITS[programName] || 6;

   const getCertForLevel = (levelNumber: number) => {
      return certificates.find(cert => {
         let certJenjang = cert.level;
         try {
            const parsed = JSON.parse(cert.level);
            certJenjang = parsed.jenjang || parsed.level || cert.level;
         } catch {
            // Keep backward compatibility for older non-JSON `level` values.
         }
         const matchResult = certJenjang.match(/\d+/);
         const certLevelNumber = matchResult ? parseInt(matchResult[0], 10) : null;
         return certLevelNumber === levelNumber;
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
      return (
         <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
            <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10 space-y-8">
               <div className="flex items-end justify-between gap-6">
                  <div className="space-y-3">
                     <Skeleton className="h-9 w-64" />
                     <Skeleton className="h-4 w-72" />
                  </div>
                  <Skeleton className="h-20 w-72 rounded-2xl" />
               </div>
               <Skeleton className="h-28 w-full rounded-2xl" />
               <Skeleton className="h-36 w-full rounded-2xl" />
               <Skeleton className="h-36 w-full rounded-2xl" />
            </main>
         </div>
      );
   }

   if (viewMode === 'dashboard') {
      return (
         <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
               <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
               <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
               <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <img src={logodk} alt="Digikidz" className="h-6 sm:h-8" />
                     <div className="h-4 w-px bg-slate-200" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Portal</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex flex-col items-end">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Student Account</p>
                        <p className="text-sm font-black text-slate-800 leading-none">{studentName}</p>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <User className="w-5 h-5 text-slate-400" />
                     </div>
                  </div>
               </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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
                                 onClick={() => handleOpenFilteredActivity(report)}
                                 className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-left hover:bg-slate-100 transition-colors"
                              >
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Week {report.lessonWeek} • {report.level}</p>
                                 <p className="text-sm font-bold text-slate-800 truncate">{report.lessonName}</p>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                  {/* Trial Session Card */}
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
                           <Button onClick={handleStartTrial} className="rounded-xl font-bold gap-2 h-11 px-8 bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                              Lihat Detail Trial <ChevronRight className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                  )}

                  {levels.length === 0 && !trialReport ? (
                     <EmptyState title="Belum Ada Aktivitas" description="Hubungi Coach jika Anda merasa ini adalah kesalahan." />
                  ) : levels.map((lvl) => {
                     const cert = getCertForLevel(lvl.level);
                     const isCompleted = !!cert;
                     return (
                        <div key={lvl.level} className={`group bg-white border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${isCompleted ? 'border-emerald-200 shadow-emerald-500/5 ring-1 ring-emerald-100/50' : 'border-slate-200'}`}>
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
                                 {isCompleted && (
                                    <Button onClick={() => setSelectedCertificate(cert)} variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 text-slate-600 h-11">
                                       <FileText className="w-4 h-4" /> Lihat Sertifikat
                                    </Button>
                                 )}
                                 <Button onClick={() => handleStartLevel(lvl.level)} className={`rounded-xl font-bold gap-2 h-11 px-8 ${isCompleted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                                    {isCompleted ? 'Cek Activity Report' : 'Lanjutkan Belajar'} <ChevronRight className="w-4 h-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </main>

            <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="default" size="lg" className="rounded-full h-14 w-14 sm:w-auto px-0 sm:px-6 shadow-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all group">
                        <LogOut className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Keluar</span>
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl p-8 max-w-md bg-white border-none shadow-2xl">
                     <AlertDialogHeader className="space-y-4">
                        <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center">
                           <LogOut className="h-8 w-8 text-slate-400" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center">Keluar Portal?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium text-slate-500">Anda perlu memasukkan kode akses kembali untuk masuk.</AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter className="mt-8 flex gap-3">
                        <AlertDialogCancel className="flex-1 rounded-xl h-12 font-bold bg-slate-100 border-none">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={onBack} className="flex-1 rounded-xl h-12 font-bold bg-primary text-white border-none shadow-lg shadow-primary/20">Ya, Keluar</AlertDialogAction>
                     </AlertDialogFooter>
                  </AlertDialogContent>
               </AlertDialog>
            </div>

            <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
               <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2rem] bg-slate-50 border-none shadow-3xl w-[94vw] sm:w-full">
                  {selectedCertificate && (
                     <div className="flex flex-col items-center gap-4 p-4 sm:p-10">
                        <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-white ring-1 ring-slate-200">
                           {isResolvingCertificate ? (
                              <div className="w-full min-h-[50vh] p-8 space-y-3">
                                 <Skeleton className="h-6 w-52" />
                                 <Skeleton className="h-[40vh] w-full rounded-xl" />
                              </div>
                           ) : certificatePreviewIssue && certificatePreviewIssue !== 'unsupported_format' ? (
                              <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center text-slate-500">
                                 <p className="font-semibold text-slate-700">Preview sertifikat tidak tersedia</p>
                                 <p className="text-sm max-w-xl">{getCertificatePreviewIssueMessage(certificatePreviewIssue)}</p>
                                 <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSelectedCertificate(prev => prev ? { ...prev } : prev)}>
                                       Coba Lagi
                                    </Button>
                                    <Button asChild type="button" variant="default" className="rounded-xl">
                                       <a href={resolvedCertificateUrl || selectedCertificate.fileUrl} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
                                    </Button>
                                 </div>
                              </div>
                           ) : isPdfUrl(resolvedCertificateUrl || selectedCertificate.fileUrl) ? (
                              <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolvedCertificateUrl || selectedCertificate.fileUrl)}&embedded=true`} className="w-full h-[70vh] sm:h-auto sm:aspect-[1.414/1] bg-white border-none" title="Sertifikat Kelulusan" />
                           ) : (
                              certificatePreviewIssue ? (
                                 <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
                                    <p className="font-semibold text-slate-700">Preview sertifikat tidak tersedia</p>
                                    <p className="text-sm max-w-xl">{getCertificatePreviewIssueMessage(certificatePreviewIssue)}</p>
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                       <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSelectedCertificate(prev => prev ? { ...prev } : prev)}>
                                          Coba Lagi
                                       </Button>
                                       <Button asChild type="button" variant="default" className="rounded-xl">
                                          <a href={resolvedCertificateUrl || selectedCertificate.fileUrl} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
                                       </Button>
                                    </div>
                                 </div>
                              ) : (
                                 <img
                                    src={resolvedCertificateUrl || selectedCertificate.fileUrl}
                                    alt="Sertifikat"
                                    className="w-full h-auto object-contain bg-white"
                                    onError={() => setCertificatePreviewIssue('unknown')}
                                 />
                              )
                           )}
                        </div>
                        <Button asChild size="lg" className="rounded-xl bg-slate-900 hover:bg-black text-white px-10 h-12 font-bold uppercase tracking-widest text-xs">
                           <a href={resolvedCertificateUrl || selectedCertificate.fileUrl} download target="_blank" rel="noopener noreferrer">Download Sertifikat</a>
                        </Button>
                     </div>
                  )}
               </DialogContent>
            </Dialog>
         </div>
      );
   }

   const currentLvl = levels.find(l => l.level === selectedLevel);
   const reportsA = currentLvl?.halfA || [];
   const reportsB = currentLvl?.halfB || [];
   const totalWeeks = 16;
   const completedWeeks = reportsA.length + reportsB.length;
   const progressPercent = Math.min(Math.round((completedWeeks / totalWeeks) * 100), 100);

   // Dynamic Week Labels
   const lvlNum = selectedLevel || 1;
   const sW = (lvlNum - 1) * 16 + 1;
   const mW = sW + 7;
   const nmW = sW + 8;
   const eW = sW + 15;

   return (
      <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden">
         <header className="h-16 border-b border-slate-200 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white z-50">
            <div className="flex items-center gap-4 min-w-0">
               <Button variant="ghost" size="sm" onClick={() => setViewMode('dashboard')} className="rounded-xl hover:bg-slate-100 shrink-0 gap-2 px-2 sm:px-3 text-slate-600">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-xs font-bold">Dashboard</span>
               </Button>
               <div className="h-6 w-px bg-slate-200 hidden sm:block" />
               <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 truncate text-sm sm:text-base">Level {selectedLevel} - Kurikulum Pembelajaran</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">School of Technology Digikidz</p>
               </div>
            </div>
            <img src={logodk} alt="DIGIKIDZ" className="h-6 sm:h-8 hidden xs:block" />
         </header>

         <div className="flex flex-1 overflow-hidden relative">
            <main className={`flex-1 overflow-y-auto bg-slate-50/30 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-[350px]' : ''}`}>
               <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                  {selectedReport ? (
                     <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-primary p-6 sm:p-10 text-white relative">
                           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                              <Sparkles className="w-32 h-32" />
                           </div>
                           <div className="flex items-center gap-2 mb-4">
                              <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Week {selectedReport.lessonWeek}</p>
                              </div>
                              <div className="h-1 w-1 rounded-full bg-white/50" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{selectedReport.level}</p>
                           </div>
                           <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">{selectedReport.lessonName}</h1>
                        </div>

                        <div className="p-6 sm:p-10 space-y-10 relative select-none">
                           {/* Watermark Overlay */}
                           <div
                              className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden"
                              style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg width='400' height='400' xmlns='http://www.w3.org/2000/svg'><text x='50%' y='50%' text-anchor='middle' fill='black' font-size='14' font-family='sans-serif' font-weight='bold' transform='rotate(-45 200 200)'>DIGIKIDZ KOTA WISATA CIBUBUR</text></svg>`)}")` }}
                           />

                           <div className="relative z-10 space-y-10">
                              {selectedReport.goalsMateri && (
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                       <div className="h-6 w-1.5 rounded-full bg-primary" />
                                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Goals Materi</h3>
                                    </div>
                                    <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100">
                                       <ul className="space-y-4">
                                          {selectedReport.goalsMateri.split('\n').filter(Boolean).map((line, i) => (
                                             <li key={i} className="flex gap-4">
                                                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-black">{i + 1}</div>
                                                <p className="text-slate-700 font-medium leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
                                             </li>
                                          ))}
                                       </ul>
                                    </div>
                                 </div>
                              )}

                              {selectedReport.activityReportText && (
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                       <div className="h-6 w-1.5 rounded-full bg-primary" />
                                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Activity Report</h3>
                                    </div>
                                    <div className="prose prose-slate max-w-none">
                                       <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg"><LinkifiedText text={selectedReport.activityReportText} /></p>
                                    </div>
                                 </div>
                              )}

                              {selectedReport.mediaUrls.length > 0 && (
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                       <div className="h-6 w-1.5 rounded-full bg-primary" />
                                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Dokumentasi Kelas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                       {selectedReport.mediaUrls.map((url, i) => {
                                          const isVideo = url.toLowerCase().match(/\.(mov|mp4|webm|ogg)$/);
                                          return (
                                             <div key={i} onContextMenu={(e) => e.preventDefault()} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black relative group aspect-video sm:aspect-square">
                                                {isVideo ? (
                                                   <video src={url} className="w-full h-full object-cover pointer-events-none" autoPlay muted loop playsInline controls={false} onContextMenu={(e) => e.preventDefault()} />
                                                ) : (
                                                   <img src={url} alt="Activity" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                                                )}
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                   <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">Lihat Media Full HD</span>
                                                </a>
                                             </div>
                                          );
                                       })}
                                    </div>
                                 </div>
                              )}

                              <div className="pt-10 border-t border-slate-100 space-y-8">
                                 <div className="flex flex-col sm:flex-row justify-between gap-6">
                                    <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coach Pengajar :</p>
                                       <div className="flex items-center gap-2">
                                          <div className="p-2 bg-primary/10 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                                          <span className="font-bold text-slate-900">{selectedReport.coach}</span>
                                       </div>
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                       Sesi pada {new Date(selectedReport.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                 </div>

                                 {(() => {
                                    const all = [...reportsA, ...reportsB].sort((a, b) => a.lessonWeek - b.lessonWeek);
                                    const idx = all.findIndex(r => r.id === selectedReport.id);
                                    const prev = idx > 0 ? all[idx - 1] : null;
                                    const next = idx < all.length - 1 ? all[idx + 1] : null;
                                    if (!prev && !next) return null;
                                    return (
                                       <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                          {prev ? (
                                             <Button variant="ghost" onClick={() => setSelectedReport(prev)} className="flex flex-1 items-center justify-start gap-2 h-14 rounded-2xl border border-slate-100 px-2 sm:px-4">
                                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                                                <div className="text-left min-w-0">
                                                   <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sebelumnya</p>
                                                   <p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Week {prev.lessonWeek}</p>
                                                </div>
                                             </Button>
                                          ) : <div />}
                                          {next ? (
                                             <Button variant="ghost" onClick={() => setSelectedReport(next)} className="flex flex-1 items-center justify-end gap-2 h-14 rounded-2xl border border-slate-100 px-2 sm:px-4 text-right">
                                                <div className="text-right min-w-0">
                                                   <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Selanjutnya</p>
                                                   <p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Week {next.lessonWeek}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-primary" />
                                             </Button>
                                          ) : <div />}
                                       </div>
                                    );
                                 })()}
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="bg-slate-50 p-8 rounded-full"><PlayCircle className="w-16 h-16 text-slate-200" /></div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900">Pilih Pertemuan</h3>
                           <p className="text-slate-500 font-medium">Klik salah satu minggu di daftar sebelah kanan untuk melihat detail laporan aktivitas.</p>
                        </div>
                     </div>
                  )}
               </div>
            </main>

            <aside className={`fixed inset-y-0 right-0 w-full sm:w-[350px] bg-white border-l border-slate-200 z-[60] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
               <div className="h-full flex flex-col bg-white">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                     <h2 className="font-black text-slate-900 tracking-tight">Daftar pertemuan</h2>
                     <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden rounded-full"><ChevronRight className="w-5 h-5" /></Button>
                  </div>
                  <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress Level</span>
                        <span className="text-sm font-black text-primary">{progressPercent}% Selesai</span>
                     </div>
                     <Progress value={progressPercent} className="h-2 bg-slate-200 shadow-inner" />
                  </div>
                  <ScrollArea className="flex-1">
                     <div className="p-2 space-y-1">
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                           <AccordionItem value="item-1" className="border-none">
                              <AccordionTrigger className="hover:no-underline px-3 py-4 rounded-xl hover:bg-slate-50 group">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-colors"><FolderOpen className="w-4 h-4" /></div>
                                    <span className="font-bold text-sm text-slate-700">Tahap Awal (W{sW}-{mW})</span>
                                 </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2 px-2 space-y-1">
                                 {reportsA.length > 0 ? reportsA.map(r => (
                                    <button key={r.id} onClick={() => { setSelectedReport(r); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedReport?.id === r.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-slate-50 text-slate-500'}`}>
                                       <div className={`w-2 h-2 rounded-full shrink-0 ${selectedReport?.id === r.id ? 'bg-primary' : 'bg-slate-200'}`} />
                                       <div className="min-w-0">
                                          <p className="text-xs font-black leading-tight mb-1">Week {r.lessonWeek}</p>
                                          <p className="text-[11px] font-bold truncate leading-none">{r.lessonName}</p>
                                       </div>
                                    </button>
                                 )) : <div className="p-4 text-[10px] text-center italic text-slate-400">Belum ada modul terisi</div>}
                              </AccordionContent>
                           </AccordionItem>
                           <AccordionItem value="item-2" className="border-none">
                              <AccordionTrigger className="hover:no-underline px-3 py-4 rounded-xl hover:bg-slate-50 group">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-data-[state=open]:bg-indigo-600 group-data-[state=open]:text-white transition-colors"><FolderOpen className="w-4 h-4" /></div>
                                    <span className="font-bold text-sm text-slate-700">Tahap Lanjut (W{nmW}-{eW})</span>
                                 </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2 px-2 space-y-1">
                                 {reportsB.length > 0 ? reportsB.map(r => (
                                    <button key={r.id} onClick={() => { setSelectedReport(r); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedReport?.id === r.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-slate-50 text-slate-500'}`}>
                                       <div className={`w-2 h-2 rounded-full shrink-0 ${selectedReport?.id === r.id ? 'bg-primary' : 'bg-slate-200'}`} />
                                       <div className="min-w-0">
                                          <p className="text-xs font-black leading-tight mb-1">Week {r.lessonWeek}</p>
                                          <p className="text-[11px] font-bold truncate leading-none">{r.lessonName}</p>
                                       </div>
                                    </button>
                                 )) : <div className="p-4 text-[10px] text-center italic text-slate-400">Belum ada modul terisi</div>}
                              </AccordionContent>
                           </AccordionItem>
                        </Accordion>
                     </div>
                  </ScrollArea>
               </div>
            </aside>

            {!isSidebarOpen && (
               <Button onClick={() => setIsSidebarOpen(true)} className="fixed right-0 top-1/2 -translate-y-1/2 h-14 w-10 p-0 rounded-l-2xl bg-white border border-slate-200 border-r-0 shadow-xl z-50 text-slate-600 hover:bg-slate-50 hidden lg:flex items-center justify-center">
                  <PanelRightOpen className="w-5 h-5 mx-auto -translate-x-0.5" />
               </Button>
            )}
            {isSidebarOpen && (
               <Button onClick={() => setIsSidebarOpen(false)} className="fixed right-[350px] top-1/2 -translate-y-1/2 h-14 w-10 p-0 rounded-l-2xl bg-white border border-slate-200 border-r-0 shadow-xl z-[70] text-slate-600 hover:bg-slate-50 hidden lg:flex items-center justify-center transform transition-all duration-300">
                  <PanelRightClose className="w-5 h-5 mx-auto -translate-x-0.5" />
               </Button>
            )}
            <Button onClick={() => setIsSidebarOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-slate-900 shadow-2xl text-white lg:hidden z-50 animate-bounce">
               <Menu className="w-6 h-6" />
            </Button>
         </div>
      </div>
   );
}
