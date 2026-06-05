import { useState, useEffect, useMemo } from 'react';
import { useActivityReports, useAccessCodes, uploadReportMedia, ActivityReport } from '@/hooks/useActivityReports';
import { COACHES, LEVELS, Coach } from '@/types/schedule';
import { useSchedule } from '@/hooks/useSchedule';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Upload, FileText, Key, Pencil, FolderOpen, ChevronLeft, ChevronRight, Link as LinkIcon, ExternalLink, MessageSquare, Share2, Table, Download, Image, CalendarRange, ToggleLeft, ToggleRight, Sparkles, PlayCircle, User } from 'lucide-react';
import { useHolidayBanners, uploadBannerImage } from '@/hooks/useHolidayBanners';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupReportsByLevel } from '@/lib/levelUtils';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


// ─── WhatsApp Message Formatter ─────────────────────────────────────────────

function formatWhatsAppMessage(r: {
  studentName: string;
  date: string;
  level: string;
  lessonWeek: number;
  lessonName: string;
  tools?: string;
  goalsMateri?: string;
  activityReportText?: string;
  coach: string;
  externalLinks?: { label: string; url: string }[];
  mediaUrls?: string[];
}): string {
  const d = new Date(r.date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const coachTitle = r.coach.includes('Bani') ? 'Mr. Bani' : r.coach.includes('Argy') ? 'Mr. Argy' : r.coach.includes('Zaura') ? 'Ms. Zaura' : r.coach;
  const lessonLabel = r.lessonWeek === 0 ? `Trial` : `Week ${r.lessonWeek}`;

  let msg = ``;
  msg += `Name      : ${r.studentName}\n`;
  msg += `Date      : ${dateStr}\n`;
  msg += `Level     : ${r.level}\n`;
  msg += `Lesson    : ${lessonLabel} | ${r.lessonName}\n`;
  msg += `Tools     : ${r.tools || '-'}\n`;

  if (r.goalsMateri) {
    msg += `\nGoals Materi :\n${r.goalsMateri}`;
  }

  if (r.activityReportText) {
    msg += `\n\nActivity report :\n${r.activityReportText}`;
  }

  if (r.externalLinks && r.externalLinks.length > 0) {
    msg += `\n\n🔗 Links :`;
    r.externalLinks.forEach((link) => {
      msg += `\n• ${link.label ? link.label + ': ' : ''}${link.url}`;
    });
  }

  if (r.mediaUrls && r.mediaUrls.length > 0) {
    msg += `\n\n📸 Foto/Video :`;
    r.mediaUrls.forEach((url, i) => {
      msg += `\n• Foto ${i + 1}: ${url}`;
    });
  }

  msg += `\n\n\nReport by : ${coachTitle}`;
  return msg;
}

function shareToWhatsApp(r: Parameters<typeof formatWhatsAppMessage>[0], windowProxy?: Window | null) {
  const msg = formatWhatsAppMessage(r);
  const encoded = encodeURIComponent(msg);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;

  if (windowProxy) {
    windowProxy.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

// ─── ReportCard ─────────────────────────────────────────────────────────────
// Dipindahkan ke tingkat modul agar React tidak recreate komponen setiap render

interface ReportCardProps {
  r: ActivityReport;
  onEdit: (r: ActivityReport) => void;
  onDelete: (id: string, name: string) => void;
}

function ReportCard({ r, onEdit, onDelete }: ReportCardProps) {
  return (
    <article className="glass-card rounded-xl p-4 shadow-sm bg-white/70 backdrop-blur-md border border-white/50 relative group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-white flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
            {r.studentName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{r.studentName}</h3>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className="bg-[#006229]/10 text-[#006229] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shrink-0">
          W{r.lessonWeek}
        </span>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">{r.lessonName}</h4>
        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
          {r.activityReportText || r.coachComment || "Tidak ada catatan."}
        </p>
      </div>
      
      {r.mediaUrls && r.mediaUrls.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {r.mediaUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              {url.toLowerCase().match(/\.(mov|mp4|webm|ogg)$/) ? (
                <div className="h-12 w-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  <PlayCircle className="w-5 h-5" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Media ${i + 1}`}
                  className="h-12 w-16 object-cover rounded-lg border border-slate-200"
                />
              )}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
        <button 
          onClick={() => onEdit(r)}
          className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[#004ac6]/20 text-[#004ac6] text-sm font-semibold hover:bg-[#004ac6]/5 active:scale-95 transition-all"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button 
          onClick={() => shareToWhatsApp(r)}
          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] active:scale-95 transition-all shadow-md shadow-[#25D366]/20"
        >
          <Share2 className="w-4 h-4" /> WhatsApp
        </button>
      </div>

      <button 
        onClick={() => onDelete(r.id, r.studentName)}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </article>
  );
}


// ─── ReportForm ──────────────────────────────────────────────────────────────

function ReportForm({
  initial,
  onSubmit,
  submitLabel,
  onSaveAndShare,
}: {
  initial?: Partial<ActivityReport>;
  onSubmit: (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => Promise<void>;
  submitLabel: string;
  onSaveAndShare?: (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[], waWindow?: Window | null) => Promise<void>;
}) {
  const { schedule } = useSchedule();
  const [studentName, setStudentName] = useState(initial?.studentName || '');
  const [date, setDate] = useState(initial?.date || '');
  const [level, setLevel] = useState(initial?.level || '');
  const [lessonWeek, setLessonWeek] = useState(initial?.lessonWeek?.toString() || '');
  const [lessonName, setLessonName] = useState(initial?.lessonName || '');
  const [tools, setTools] = useState(initial?.tools || '');
  const [coach, setCoach] = useState(initial?.coach || '');
  const [coachComment, setCoachComment] = useState(initial?.coachComment || '');
  const [goalsMateri, setGoalsMateri] = useState(initial?.goalsMateri || '');
  const [activityReportText, setActivityReportText] = useState(initial?.activityReportText || '');
  const [externalLinks, setExternalLinks] = useState<{ label: string; url: string }[]>(initial?.externalLinks || []);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Ambil daftar nama murid aktif unik dari jadwal
  const activeStudentNames = Array.from(
    new Set(
      schedule
        .filter((s) => s.status === 'active')
        .map((s) => s.studentName)
    )
  ).sort();

  // Pastikan nama murid pada data awal (jika mengedit) tetap ada di pilihan dropdown
  const dropdownOptions = [...activeStudentNames];
  if (initial?.studentName && !dropdownOptions.includes(initial.studentName)) {
    dropdownOptions.push(initial.studentName);
    dropdownOptions.sort();
  }

  const handleStudentChange = (name: string) => {
    setStudentName(name);
    const matched = schedule.find((s) => s.studentName === name);
    if (matched) {
      if (matched.level) setLevel(matched.level);
      if (matched.coach) setCoach(matched.coach);
    }
  };

  useEffect(() => {
    if (initial) {
      setStudentName(initial.studentName || '');
      setDate(initial.date || '');
      setLevel(initial.level || '');
      setLessonWeek(initial.lessonWeek?.toString() || '');
      setLessonName(initial.lessonName || '');
      setTools(initial.tools || '');
      setCoach(initial.coach || '');
      setCoachComment(initial.coachComment || '');
      setGoalsMateri(initial.goalsMateri || '');
      setActivityReportText(initial.activityReportText || '');
      setExternalLinks(initial.externalLinks || []);

      // Jika hanya studentName yang ada di data awal (URL parameter), auto-populate level & coach
      if (initial.studentName && !initial.level && !initial.coach && schedule.length > 0) {
        const matched = schedule.find((s) => s.studentName === initial.studentName);
        if (matched) {
          if (matched.level) setLevel(matched.level);
          if (matched.coach) setCoach(matched.coach);
        }
      }
    }
  }, [initial, schedule]);
  const resetForm = () => {
    setStudentName(''); setDate(''); setLevel(''); setLessonWeek('');
    setLessonName(''); setTools(''); setCoach(''); setCoachComment('');
    setGoalsMateri(''); setActivityReportText(''); setMediaFiles([]);
    setExternalLinks([]);
  };

  const handleSubmit = async () => {
    if (!studentName || !date || !level || !lessonWeek || !lessonName || !coach) {
      toast({ title: 'Error', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    await onSubmit(
      {
        studentName: studentName.trim(),
        date,
        level,
        lessonWeek: parseInt(lessonWeek),
        lessonName, tools, coach, coachComment,
        goalsMateri, activityReportText,
        mediaUrls: initial?.mediaUrls || [],
        externalLinks,
      },
      mediaFiles
    );
    setUploading(false);
    if (!initial) resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama Murid *</Label>
          <Select value={studentName} onValueChange={handleStudentChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={dropdownOptions.length > 0 ? "Pilih nama murid" : "Memuat daftar murid..."} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {dropdownOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div >
        <div className="space-y-2">
          <Label>Tanggal *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Level/Jenjang *</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih level" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Coach *</Label>
          <Select value={coach} onValueChange={setCoach}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih coach" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Minggu ke- *</Label>
          <Input type="number" min={1} value={lessonWeek} onChange={(e) => setLessonWeek(e.target.value)} placeholder="1" />
        </div>
        <div className="space-y-2">
          <Label>Nama Materi (Lesson) *</Label>
          <Input value={lessonName} onChange={(e) => setLessonName(e.target.value)} placeholder="Nama materi" />
        </div>
      </div >
      <div className="space-y-2">
        <Label>Tools</Label>
        <Input value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Alat/software yang digunakan" />
      </div>
      <div className="space-y-2">
        <Label>Goals Materi</Label>
        <Textarea value={goalsMateri} onChange={(e) => setGoalsMateri(e.target.value)} placeholder="Tulis goals materi (satu per baris)..." rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Activity Report</Label>
        <Textarea value={activityReportText} onChange={(e) => setActivityReportText(e.target.value)} placeholder="Tulis laporan aktivitas murid..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Komentar Coach</Label>
        <Textarea value={coachComment} onChange={(e) => setCoachComment(e.target.value)} placeholder="Catatan dan feedback untuk orang tua..." rows={3} />
      </div>
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Link Tambahan (YouTube, Canva, dll)
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExternalLinks([...externalLinks, { label: '', url: '' }])}
            className="h-8 rounded-lg text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Tambah Link
          </Button>
        </div>
        <div className="space-y-3">
          {externalLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start animate-fade-in">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <Input
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...externalLinks];
                    newLinks[index].label = e.target.value;
                    setExternalLinks(newLinks);
                  }}
                  placeholder="Label (Contoh: Design Canva)"
                  className="h-9 text-xs"
                />
                <Input
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...externalLinks];
                    newLinks[index].url = e.target.value;
                    setExternalLinks(newLinks);
                  }}
                  placeholder="URL (https://...)"
                  className="h-9 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setExternalLinks(externalLinks.filter((_, i) => i !== index))}
                className="h-9 w-9 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 h-4" />
              </Button>
            </div>
          ))}
          {externalLinks.length === 0 && (
            <p className="text-[10px] text-muted-foreground italic text-center py-2">Belum ada link tambahan.</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Foto/Video/Dokumen Kegiatan</Label>
        <Input type="file" multiple onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} />
        {mediaFiles.length > 0 && <p className="text-sm text-muted-foreground">{mediaFiles.length} file dipilih</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
          {uploading ? (
            <><Upload className="w-4 h-4 mr-2 animate-spin" />Mengunggah...</>
          ) : (
            <><Plus className="w-4 h-4 mr-2" />{submitLabel}</>
          )}
        </Button>
        {onSaveAndShare && (
          <Button
            onClick={async () => {
              if (!studentName || !date || !level || !lessonWeek || !lessonName || !coach) return;

              // Pre-open window to bypass popup blocker
              const waWindow = window.open('about:blank', '_blank');
              if (waWindow) {
                waWindow.document.write('Menyiapkan pesan WhatsApp...');
              }

              setUploading(true);
              await onSaveAndShare(
                {
                  studentName, date, level,
                  lessonWeek: parseInt(lessonWeek),
                  lessonName, tools, coach, coachComment,
                  goalsMateri, activityReportText,
                  mediaUrls: initial?.mediaUrls || [],
                  externalLinks,
                },
                mediaFiles,
                waWindow
              );
              setUploading(false);
              if (!initial) resetForm();
            }}
            disabled={uploading}
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Simpan & Share WA
          </Button>
        )}
      </div>
    </div >
  );
}

// ─── ReportsAdminPage ────────────────────────────────────────────────────────

export default function ReportsAdminPage() {
  const { reports, loading: reportsLoading, addReport, updateReport, deleteReport } = useActivityReports();
  const { codes, generateCode, deleteCode } = useAccessCodes();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialStudent = searchParams.get('student');
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    if (initialStudent) {
      setActiveTab('create');
    }
  }, [initialStudent]);

  const [editingReport, setEditingReport] = useState<ActivityReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [deletingReportName, setDeletingReportName] = useState<string | undefined>();
  const [newCodeName, setNewCodeName] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCoach, setFilterCoach] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchCode, setSearchCode] = useState('');
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REPORTS_PER_PAGE = 10;

  // Holiday Banners
  const { banners, loading: bannersLoading, addBanner, toggleBanner, deleteBanner } = useHolidayBanners();
  const [bannerName, setBannerName] = useState('');
  const [bannerStartDate, setBannerStartDate] = useState('');
  const [bannerEndDate, setBannerEndDate] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const handleAddBanner = async () => {
    if (!bannerName.trim() || !bannerStartDate || !bannerEndDate || !bannerFile) {
      toast({ title: 'Error', description: 'Harap isi semua field dan pilih foto.', variant: 'destructive' });
      return;
    }
    setBannerUploading(true);
    const imageUrl = await uploadBannerImage(bannerFile);
    if (!imageUrl) {
      toast({ title: 'Error', description: 'Gagal memproses foto. Coba pilih foto lain.', variant: 'destructive' });
      setBannerUploading(false);
      return;
    }
    await addBanner({ name: bannerName.trim(), imageUrl, startDate: bannerStartDate, endDate: bannerEndDate, isActive: true });
    setBannerName('');
    setBannerStartDate('');
    setBannerEndDate('');
    setBannerFile(null);
    setBannerUploading(false);
  };

  const filteredCodes = codes.filter((c) =>
    !searchCode || c.studentName.toLowerCase().includes(searchCode.toLowerCase())
  );

  const filteredReports = reports.filter((r) => {
    const sName = r.studentName.trim().toLowerCase();
    const query = searchStudent.trim().toLowerCase();
    const matchesSearch = !searchStudent || sName.includes(query);
    const matchesCoach = filterCoach === 'all' || r.coach === filterCoach;
    const matchesLevel = filterLevel === 'all' || (r.level && r.level.toLowerCase().includes(filterLevel.toLowerCase()));
    return matchesSearch && matchesCoach && matchesLevel;
  });

  const handleCreateReport = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => {
    const mediaUrls: string[] = [];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) mediaUrls.push(url);
    }
    const result = await addReport({ ...data, mediaUrls });
    if (result) {
      toast({ title: 'Berhasil!', description: `Laporan untuk ${data.studentName} berhasil ditambahkan.` });
    }
  };

  const handleCreateAndShare = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[], waWindow?: Window | null) => {
    const mediaUrls: string[] = [];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) mediaUrls.push(url);
    }
    const savedData = { ...data, mediaUrls };
    const result = await addReport(savedData);
    if (result) {
      toast({ title: 'Berhasil!', description: `Laporan untuk ${data.studentName} berhasil ditambahkan.` });
      shareToWhatsApp(savedData, waWindow);
    } else if (waWindow) {
      waWindow.close();
    }
  };

  const handleUpdateReport = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => {
    if (!editingReport) return;
    const newMediaUrls: string[] = [...data.mediaUrls];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) newMediaUrls.push(url);
    }
    const result = await updateReport(editingReport.id, { ...data, mediaUrls: newMediaUrls });
    if (result) {
      toast({ title: 'Berhasil!', description: `Laporan untuk ${data.studentName} berhasil diperbarui.` });
      setEditingReport(null);
    }
  };

  const handleGenerateCode = async () => {
    if (!newCodeName.trim()) {
      toast({ title: 'Error', description: 'Masukkan nama murid.', variant: 'destructive' });
      return;
    }
    const code = await generateCode(newCodeName.trim());
    if (code) {
      toast({ title: 'Kode Dibuat!', description: `Kode akses untuk ${newCodeName}: ${code}` });
      setNewCodeName('');
    }
  };

  const copyCode = async (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        toast({ title: 'Disalin!', description: 'Kode akses disalin ke clipboard.' });
      } else {
        throw new Error('Clipboard API unavailable or insecure context');
      }
    } catch (err) {
      // Fallback method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        // Ensure the textarea is not visible or affecting layout
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();

        if (successful) {
          toast({ title: 'Disalin!', description: 'Kode akses disalin ke clipboard.' });
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackErr) {
        toast({
          title: 'Gagal Menyalin',
          description: 'Gagal menyalin kode. Silakan salin teks secara manual.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteReport = (id: string, name: string) => {
    setDeletingReportId(id);
    setDeletingReportName(name);
  };

  // Group by student untuk folder view - gunakan SEMUA laporan agar hitungan akurat (tidak tersembunyi filter coach)
  const grouped: Record<string, typeof reports> = {};
  reports.forEach((r) => {
    // Hanya filter nama jika ada pencarian nama aktif
    const sName = (r.studentName || "").trim().toLowerCase();
    const query = searchStudent.trim().toLowerCase();
    if (searchStudent && !sName.includes(query)) return;

    // Gunakan nama asli (yang sudah di-trim) sebagai key agar Neil dan Neil (spasi) bergabung
    const name = (r.studentName || "").trim();
    // Normalisasi case agar Neil dan neil masuk ke folder yang sama
    const canonicalName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    if (!grouped[canonicalName]) grouped[canonicalName] = [];
    grouped[canonicalName].push(r);
  });
  const sortedNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const totalPages = Math.ceil(sortedNames.length / REPORTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pagedNames = sortedNames.slice((safePage - 1) * REPORTS_PER_PAGE, safePage * REPORTS_PER_PAGE);

  // Get the recent reports for the Grid view (sorted chronologically by created_at or date)
  const recentReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
  }, [filteredReports]);

  const exportToCSV = () => {
    // Definisi header
    const headers = ["Nama Murid", "Tingkat Kelas", "Minggu Ke"];

    // Mapping data ke bentuk array
    const csvData = recentReports.map(r => [
      `"${r.studentName}"`,
      `"${r.level}"`,
      `"Week ${r.lessonWeek}"`
    ]);

    // Gabungkan dengan newline, dan pisahkan dengan titik koma (;) agar lebih bersahabat dengan Excel khusus regional Indonesia
    const csvString = [
      headers.join(";"),
      ...csvData.map(row => row.join(";"))
    ].join("\n");

    // Bikin blob file CSV, tambahkan BOM (\uFEFF) di awalan supaya Excel tau itu UTF-8
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Buat elemen <a> temporer buat trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Riwayat_Murid_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Page Header */}
      <div className="hidden md:flex items-center justify-between bg-primary-fixed-dim/30 rounded-2xl p-6 relative overflow-hidden mb-8">
        <div className="flex flex-col gap-1 relative z-10">
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Activity Reports</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">Manage and send student activity reports.</p>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full filter blur-[60px] opacity-20"></div>
      </div>
      
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-start overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border/50 flex-nowrap md:flex-wrap w-max justify-start shrink-0">
              <TabsTrigger value="history" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold gap-2">
                <Table className="w-4 h-4" /> Riwayat
              </TabsTrigger>
              <TabsTrigger value="create" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold gap-2">
                <Plus className="w-4 h-4" /> Buat Report
              </TabsTrigger>
              <TabsTrigger value="codes" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold gap-2">
                <Key className="w-4 h-4" /> Kode Akses
              </TabsTrigger>
              <TabsTrigger value="update" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold gap-2">
                <FolderOpen className="w-4 h-4" /> Update Perkembangan Murid
              </TabsTrigger>
              <TabsTrigger value="banners" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold gap-2">
                <Image className="w-4 h-4" /> Banner Hari Raya
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab: Buat Report ── */}
          <TabsContent value="create" className="animate-fade-in">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border-none shadow-2xl shadow-primary/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Buat Activity Report Baru
              </h2>
              <ReportForm initial={initialStudent ? { studentName: initialStudent } : undefined} onSubmit={handleCreateReport} submitLabel="Simpan Report" onSaveAndShare={handleCreateAndShare} />
            </div >
          </TabsContent >

    {/* ── Tab: Kode Akses ── */ }
    < TabsContent value = "codes" className = "animate-fade-in" >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Generate Kode
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Murid</Label>
                <Input value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} placeholder="Masukkan nama murid" className="h-11 rounded-xl" />
              </div>
              <Button onClick={handleGenerateCode} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
                Generate Kode Akses
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5 min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Daftar Kode Akses
            </h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="Cari berdasarkan nama murid..." className="pl-9 h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{c.studentName}</p>
                    <p className="text-xs text-primary font-mono font-bold tracking-widest mt-0.5 uppercase">{c.accessCode}</p>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => copyCode(c.accessCode)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteCode(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {filteredCodes.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    title="Pelanggan Tidak Ditemukan"
                    description="Sepertinya belum ada kode akses untuk siswa ini. Ayo buat satu!"
                    className="py-10"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
          </TabsContent >

    {/* ── Tab: Riwayat (Grid view yang baru) ── */ }
    < TabsContent value = "history" className = "animate-fade-in" >
            <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5 mb-6">
              {/* --- Mobile View: Hero, Stats & Search --- */}
              <div className="md:hidden block mb-6">
                <section className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Activity Reports</h2>
                  <p className="text-sm text-muted-foreground">Track and share student progress.</p>
                </section>
                <section className="mb-6 relative overflow-hidden bg-white/60 backdrop-blur-md rounded-xl p-5 flex items-center justify-between shadow-sm border border-border/50">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#004ac6]/10 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#004ac6]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reports Sent</p>
                        <p className="text-xl font-black text-slate-900">{reports.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#fd761a]/10 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-[#fd761a] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drafts</p>
                        <p className="text-xl font-black text-[#fd761a]">0</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 h-24 flex-shrink-0 mr-[-10px] mb-[-20px]">
                    <img alt="Digikidz Mascot" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzs2Z9idacotKSOmDG9PTJi0DJypXHfDhaVGDzEc7GWME0CZEA8ZFMW_1xN7s5aVae7Oy-duCbWwfZrf5YT3YGnq1zVy4ztn8LSaL1nAeK64cSLftS4Yts9AWqtsGxvSn5H3CsGwMq5R8p8DnfQQ6lIdg4exERd3We8vsHuYR0QL8zCw-Cv7_p-z8LjJ2ViPnsL2KIJTt6A49IJiLOWEi4S0OtMqsxqLNqi9IrH56rMUBX9c3oOwSozllLzzhcDZccui8tevmf4QI" />
                  </div>
                </section>
                <section className="mb-2">
                  <div className="relative w-full mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama murid..."
                      value={searchStudent} 
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="pl-9 bg-background/50 border-none h-11 w-full rounded-xl focus-visible:ring-1"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-2">
                    <button 
                      onClick={() => setFilterLevel('all')}
                      className={`px-5 py-2 rounded-full font-semibold text-[13px] whitespace-nowrap shadow-sm ${filterLevel === 'all' ? 'bg-[#004ac6] text-white' : 'bg-white/60 border border-slate-200 text-slate-500'}`}
                    >Semua Jenjang</button>
                    <button 
                      onClick={() => setFilterLevel('Little Creator')}
                      className={`px-5 py-2 rounded-full font-semibold text-[13px] whitespace-nowrap shadow-sm ${filterLevel === 'Little Creator' ? 'bg-[#004ac6] text-white' : 'bg-white/60 border border-slate-200 text-slate-500'}`}
                    >Little Creator</button>
                    <button 
                      onClick={() => setFilterLevel('Junior')}
                      className={`px-5 py-2 rounded-full font-semibold text-[13px] whitespace-nowrap shadow-sm ${filterLevel === 'Junior' ? 'bg-[#004ac6] text-white' : 'bg-white/60 border border-slate-200 text-slate-500'}`}
                    >Junior</button>
                    <button 
                      onClick={() => setFilterLevel('Teenager')}
                      className={`px-5 py-2 rounded-full font-semibold text-[13px] whitespace-nowrap shadow-sm ${filterLevel === 'Teenager' ? 'bg-[#004ac6] text-white' : 'bg-white/60 border border-slate-200 text-slate-500'}`}
                    >Teenager</button>
                  </div>
                </section>
              </div>

              {/* --- Desktop View: Headers & Stats --- */}
              <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground mb-2">Activity Reports</h2>
                  <p className="text-muted-foreground font-medium">Track and share student progress with parents.</p>
                </div>
                <div className="flex items-end gap-4 relative">
                  <Button onClick={() => setActiveTab('create')} className="bg-[#004ac6] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#004ac6]/30 hover:bg-[#003ea8] transition-all flex items-center justify-center gap-2 h-12">
                    <FileText className="w-5 h-5" />
                    Create New Report
                  </Button>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between col-span-1 md:col-span-2 shadow-sm border border-border/50">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama murid..."
                      value={searchStudent} 
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="pl-9 bg-background/50 border-none h-10 w-full rounded-xl focus-visible:ring-1"
                    />
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 col-span-1 shadow-sm border border-border/50">
                  <div className="w-12 h-12 bg-blue-50 text-[#004ac6] rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reports Sent</p>
                    <p className="text-2xl font-black text-slate-900">{reports.length}</p>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 col-span-1 shadow-sm border border-border/50">
                  <div className="w-12 h-12 bg-amber-50 text-[#fd761a] rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drafts</p>
                    <p className="text-2xl font-black text-slate-900">0</p>
                  </div>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportsLoading ? (
                  [...Array(6)].map((_, idx) => (
                    <div key={`history-skeleton-${idx}`} className="glass-card rounded-2xl p-4 space-y-4">
                      <div className="flex gap-3"><Skeleton className="w-10 h-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div>
                      <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
                    </div>
                  ))
                ) : recentReports.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                      <Table className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-bold text-foreground">Tidak ada riwayat laporan.</p>
                      <p className="text-xs text-muted-foreground">Laporan aktivitas yang Anda buat akan muncul di sini.</p>
                    </div>
                  </div>
                ) : (
                  recentReports.slice(0, 50).map((r) => (
                    <ReportCard key={r.id} r={r} onEdit={setEditingReport} onDelete={handleDeleteReport} />
                  ))
                )}
              </div>
            </div>
          </TabsContent >

    {/* ── Tab: Update Perkembangan Murid (Folder view) ── */ }
    < TabsContent value = "update" className = "animate-fade-in" >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Cari nama murid atau materi..."
              className="pl-11 h-12 rounded-2xl bg-card border-none shadow-sm shadow-primary/5 focus-visible:ring-primary"
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <Select value={filterCoach} onValueChange={setFilterCoach}>
            <SelectTrigger className="h-12 rounded-2xl bg-card border-none shadow-sm shadow-primary/5 focus:ring-primary">
              <SelectValue placeholder="Semua Coach" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50 rounded-xl z-50">
              <SelectItem value="all">Semua Coach</SelectItem>
              {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

  {/* Folders Grid */ }
  <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5 min-h-[500px]">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-amber-500" />
        Folder Laporan
      </h3>
      {!reportsLoading && sortedNames.length > 0 && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{sortedNames.length} Siswa</p>
      )}
    </div>

    {reportsLoading ? (
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border/50 bg-background/50">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-2 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>

    ) : sortedNames.length === 0 ? (
      <EmptyState
        title="Arsip Masih Kosong"
        description="Belum ada laporan aktivitas yang tersimpan. Mulai buat laporan pertama Anda!"
      />
    ) : (
      <div className="space-y-6">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pagedNames.map((name) => (

            <button
              key={name}
              onClick={() => setOpenFolder(openFolder === name ? null : name)}
              className={cn(
                "flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                openFolder === name
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 bg-background/50 hover:bg-card hover:border-primary/30 hover:shadow-md"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                openFolder === name ? "bg-primary text-white" : "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
              )}>
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 w-full">
                <p className="font-bold text-sm truncate text-foreground">{name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5 tracking-tighter opacity-70">
                  {grouped[name].length} Reports
                </p>
              </div>
              {openFolder === name && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
            <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-muted px-3 py-1 rounded-lg">Hal {safePage}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">dari {totalPages}</span>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Open folder detail — gunakan groupReportsByLevel dari shared utility */ }
  {
    openFolder && (() => {
      // Cari semua report murid ini dengan case-insensitive dan trim
      const studentReports = reports
        .filter((r) => r.studentName.trim().toLowerCase() === openFolder.toLowerCase())
        .sort((a, b) => a.lessonWeek - b.lessonWeek);

      if (studentReports.length === 0) return null;

      const { levels, trialReport } = groupReportsByLevel(studentReports);

      // Compute missing weeks per level
      const getMissingWeeks = (lvl: typeof levels[0]) => {
        const uploaded = new Set([...lvl.halfA, ...lvl.halfB].map(r => r.lessonWeek));
        const allWeeks = Array.from({ length: lvl.end - lvl.start + 1 }, (_, i) => lvl.start + i);
        return allWeeks.filter(w => !uploaded.has(w));
      };

      return (
        <div className="mt-4 space-y-3 pb-20">
          <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-none">{openFolder}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{studentReports.length} Total Laporan</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpenFolder(null)} className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">Tutup</Button>
          </div>

          {/* ── Missing Weeks Tracker ── */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Tracker Minggu Belum Di-upload</h4>
            </div>

            {levels.length === 0 && !trialReport && (
              <p className="text-xs text-muted-foreground italic">Belum ada data level untuk murid ini.</p>
            )}

            <div className="space-y-5">
              {levels.map((lvl) => {
                const uploadedWeeks = new Set([...lvl.halfA, ...lvl.halfB].map(r => r.lessonWeek));
                const allWeeks = Array.from({ length: lvl.end - lvl.start + 1 }, (_, i) => lvl.start + i);
                const missingWeeks = allWeeks.filter(w => !uploadedWeeks.has(w));
                const uploadedCount = uploadedWeeks.size;
                const totalWeeks = allWeeks.length;
                const progressPct = Math.round((uploadedCount / totalWeeks) * 100);

                return (
                  <div key={lvl.level} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Level {lvl.level}</span>
                        <span className="text-[10px] text-muted-foreground">(W{lvl.start}–W{lvl.end})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600">{uploadedCount}/{totalWeeks} di-upload</span>
                        {missingWeeks.length > 0 && (
                          <span className="text-[10px] font-black bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                            {missingWeeks.length} belum
                          </span>
                        )}
                        {missingWeeks.length === 0 && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ✓ Lengkap
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: progressPct === 100 ? '#10b981' : progressPct >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>

                    {/* Week grid */}
                    <div className="flex flex-wrap gap-1.5">
                      {allWeeks.map(week => {
                        const isUploaded = uploadedWeeks.has(week);
                        const report = [...lvl.halfA, ...lvl.halfB].find(r => r.lessonWeek === week);
                        return (
                          <div
                            key={week}
                            title={isUploaded ? `Week ${week}: ${report?.lessonName || 'Sudah di-upload'}` : `Week ${week}: Belum di-upload`}
                            className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black cursor-default transition-all border ${isUploaded
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                                : 'bg-red-50 text-red-500 border-red-200 border-dashed'
                              }`}
                          >
                            {week}
                            {isUploaded && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-[6px] text-white font-black">✓</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Missing week pills */}
                    {missingWeeks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1 self-center">Belum upload:</span>
                        {missingWeeks.map(week => (
                          <button
                            key={week}
                            onClick={() => setEditingReport({
                              id: '',
                              studentName: openFolder || '',
                              date: new Date().toISOString().split('T')[0],
                              level: studentReports[0]?.level || '',
                              lessonWeek: week,
                              lessonName: '',
                              tools: '',
                              coach: studentReports[0]?.coach || '',
                              coachComment: '',
                              goalsMateri: '',
                              activityReportText: '',
                              mediaUrls: [],
                              externalLinks: [],
                              createdAt: '',
                            } as ActivityReport)}
                            title={`Klik untuk upload report Week ${week}`}
                            className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
                          >
                            W{week} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600" />
                <span className="text-[10px] font-bold text-muted-foreground">Sudah di-upload</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-red-50 border border-red-200 border-dashed" />
                <span className="text-[10px] font-bold text-muted-foreground">Belum di-upload</span>
              </div>
            </div>
          </div>

          {/* Sesi Trial jika ada */}
          {trialReport && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                Sesi Perkenalan (Trial)
              </h4>
              <ReportCard r={trialReport} onEdit={setEditingReport} onDelete={handleDeleteReport} />
            </div>
          )}

          {levels.map((lvl) => (
            <div key={lvl.level} className="space-y-3">
              <h4 className="text-md font-bold text-foreground border-b border-border pb-1">
                Level {lvl.level}{' '}
                <span className="text-sm font-normal text-muted-foreground">(Week {lvl.start} – {lvl.end})</span>
              </h4>
              {lvl.halfA.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Week {lvl.start} – {lvl.start + 7}
                  </p>
                  <div className="space-y-2">
                    {lvl.halfA.map((r) => (
                      <ReportCard key={r.id} r={r} onEdit={setEditingReport} onDelete={handleDeleteReport} />
                    ))}
                  </div>
                </div>
              )}
              {lvl.halfB.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Week {lvl.start + 8} – {lvl.end}
                  </p>
                  <div className="space-y-2">
                    {lvl.halfB.map((r) => (
                      <ReportCard key={r.id} r={r} onEdit={setEditingReport} onDelete={handleDeleteReport} />
                    ))}
                  </div>
                </div>
              )}
              {lvl.halfA.length === 0 && lvl.halfB.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">Belum ada report untuk level ini.</p>
              )}
            </div>
          ))}
        </div>
      );
    })()
  }
          </TabsContent >

    {/* ── Tab: Banner Hari Raya ── */ }
    < TabsContent value = "banners" className = "animate-fade-in" >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Tambah Banner
            </h3>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Event</Label>
              <Input
                value={bannerName}
                onChange={(e) => setBannerName(e.target.value)}
                placeholder="Contoh: Selamat Idul Fitri 1447H"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tanggal Mulai</Label>
                <Input type="date" value={bannerStartDate} onChange={(e) => setBannerStartDate(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tanggal Akhir</Label>
                <Input type="date" value={bannerEndDate} onChange={(e) => setBannerEndDate(e.target.value)} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Foto Banner</Label>
              <div className="relative">
                <Input
                  id="banner-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="h-11 rounded-xl file:mr-3 file:font-bold file:text-primary file:bg-primary/10 file:border-0 file:rounded-lg file:h-full file:px-3 cursor-pointer"
                />
              </div>
              {bannerFile && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border/50">
                  <img
                    src={URL.createObjectURL(bannerFile)}
                    alt="Preview"
                    className="w-full max-h-40 object-cover"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleAddBanner}
              disabled={bannerUploading}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {bannerUploading ? (
                <><Upload className="w-4 h-4 mr-2 animate-spin" />Mengunggah...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" />Simpan Banner</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground italic text-center leading-relaxed">
              💡 Foto dikompresi & disimpan otomatis, tidak perlu layanan penyimpanan eksternal.
            </p>
          </div>
        </div>

        {/* Banner List */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-3xl border-none shadow-xl shadow-primary/5 min-h-[400px]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <CalendarRange className="w-4 h-4 text-primary" /> Daftar Banner
            </h3>
            {bannersLoading ? (
              <div className="space-y-4 py-2">
                {[...Array(4)].map((_, idx) => (
                  <div key={`banner-skeleton-${idx}`} className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-background/50">
                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-40" />
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-20 rounded-lg" />
                        <Skeleton className="h-7 w-16 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : banners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-50 space-y-3">
                <Image className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">Belum ada banner.</p>
                <p className="text-xs text-muted-foreground">Tambahkan banner hari raya pertama di form kiri.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCurrentlyActive = banner.isActive && banner.startDate <= today && banner.endDate >= today;
                  return (
                    <div key={banner.id} className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-card transition-colors group">
                      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-border/50">
                        <img src={banner.imageUrl} alt={banner.name} className="w-full h-full object-cover" />
                        {isCurrentlyActive && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            Live
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{banner.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <CalendarRange className="w-3 h-3" />
                          {banner.startDate} → {banner.endDate}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => toggleBanner(banner.id, !banner.isActive)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${banner.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                          >
                            {banner.isActive ? (
                              <><ToggleRight className="w-3.5 h-3.5" />Aktif</>
                            ) : (
                              <><ToggleLeft className="w-3.5 h-3.5" />Nonaktif</>
                            )}
                          </button>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
          </TabsContent >

        </Tabs >

    {/* Edit Dialog */ }
    < Dialog open = {!!editingReport
} onOpenChange = {(open) => !open && setEditingReport(null)}>
  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader><DialogTitle>Edit Report</DialogTitle></DialogHeader>
    {editingReport && (
      <ReportForm initial={editingReport} onSubmit={handleUpdateReport} submitLabel="Update Report" />
    )}
  </DialogContent>
        </Dialog >

  {/* Delete Confirm */ }
  < DeleteConfirmDialog
open = {!!deletingReportId}
onOpenChange = {(open) => { if (!open) { setDeletingReportId(null); setDeletingReportName(undefined); } }}
onConfirm = {() => {
  if (deletingReportId) {
    deleteReport(deletingReportId);
    toast({ title: 'Dihapus', description: `Laporan ${deletingReportName} berhasil dihapus.`, variant: 'destructive' });
    setDeletingReportId(null);
    setDeletingReportName(undefined);
  }
}}
studentName = { deletingReportName }
  />
      </div>
    </>
  );
}
