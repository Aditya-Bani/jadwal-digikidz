import { useState } from 'react';
import { Header } from '@/components/Header';
import { useActivityReports, useAccessCodes, uploadReportMedia, ActivityReport } from '@/hooks/useActivityReports';
import { COACHES, LEVELS, Coach } from '@/types/schedule';
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
import { Plus, Trash2, Copy, Upload, FileText, Key, Pencil, FolderOpen, ChevronLeft, ChevronRight, Link as LinkIcon, ExternalLink, MessageSquare, Share2, Table, Download, Image, CalendarRange, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
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
  const coachTitle = r.coach.includes('Bani') ? 'Mr. Bani' : r.coach.includes('Argy') ? 'Mr. Argy' : r.coach;
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
  const coachClass = r.coach.includes('Bani') ? 'coach-bani' : 'coach-argy';
  return (
    <div className={`glass-card rounded-2xl p-4 border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 schedule-entry ${coachClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-sm text-foreground">W{r.lessonWeek}: {r.lessonName}</p>
            <span className={`level-badge ${r.level.startsWith('Little Creator') ? 'level-little-creator' :
              r.level.startsWith('Junior') ? 'level-junior' :
                r.level.startsWith('Teenager') ? 'level-teenager' : 'level-trial'
              }`}>{r.level.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{r.coach}
          </p>
          {r.tools && (
            <p className="text-xs text-muted-foreground bg-muted/50 inline-block px-2 py-0.5 rounded-md">
              🛠 {r.tools}
            </p>
          )}
          {r.coachComment && (
            <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2 mt-1 line-clamp-2">
              "{r.coachComment}"
            </p>
          )}
          {r.externalLinks && r.externalLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {r.externalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10 hover:bg-primary/10 transition-colors"
                >
                  <LinkIcon className="h-2.5 w-2.5" />
                  {link.label || 'Link'}
                  <ExternalLink className="h-2 w-2 opacity-50" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => shareToWhatsApp(r)} title="Share ke WhatsApp" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(r)} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(r.id, r.studentName)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {r.mediaUrls.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {r.mediaUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group">
              <img
                src={url}
                alt={`Media ${i + 1}`}
                className="h-14 w-14 object-cover rounded-xl border border-border group-hover:opacity-80 group-hover:scale-105 transition-all"
              />
            </a>
          ))}
        </div>
      )}
    </div>
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
  onSaveAndShare?: (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => Promise<void>;
}) {
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
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nama murid" />
        </div>
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
      </div>
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
              await (onSaveAndShare as any)(
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
    </div>
  );
}

// ─── ReportsAdminPage ────────────────────────────────────────────────────────

export default function ReportsAdminPage() {
  const { reports, loading: reportsLoading, addReport, updateReport, deleteReport } = useActivityReports();
  const { codes, generateCode, deleteCode } = useAccessCodes();
  const { toast } = useToast();

  const [editingReport, setEditingReport] = useState<ActivityReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [deletingReportName, setDeletingReportName] = useState<string | undefined>();
  const [newCodeName, setNewCodeName] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCoach, setFilterCoach] = useState('all');
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
    return matchesSearch && matchesCoach;
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

  // Get the latest report per student for the Grid view
  const latestFilteredReports = Object.values(
    filteredReports.reduce((acc, r) => {
      const existing = acc[r.studentName];
      if (!existing) {
        acc[r.studentName] = r;
      } else {
        const dateNew = new Date(r.date).getTime();
        const dateOld = new Date(existing.date).getTime();
        if (dateNew > dateOld) {
          acc[r.studentName] = r;
        } else if (dateNew === dateOld && r.lessonWeek > existing.lessonWeek) {
          acc[r.studentName] = r;
        }
      }
      return acc;
    }, {} as Record<string, typeof reports[0]>)
  ).sort((a, b) => a.studentName.localeCompare(b.studentName));

  const exportToCSV = () => {
    // Definisi header
    const headers = ["Nama Murid", "Tingkat Kelas", "Minggu Ke"];

    // Mapping data ke bentuk array
    const csvData = latestFilteredReports.map(r => [
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">Activity <span className="text-primary">Reports</span></h1>
            <p className="text-muted-foreground font-medium mt-1">Kelola laporan aktivitas murid dan kode akses orang tua.</p>
          </div>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <div className="flex justify-start overflow-x-hidden">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border/50 flex-wrap justify-start">

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
              <ReportForm onSubmit={handleCreateReport} submitLabel="Simpan Report" onSaveAndShare={handleCreateAndShare} />
            </div>
          </TabsContent>

          {/* ── Tab: Kode Akses ── */}
          <TabsContent value="codes" className="animate-fade-in">
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
          </TabsContent>

          {/* ── Tab: Riwayat (Grid view yang baru) ── */}
          <TabsContent value="history" className="animate-fade-in">
            <div className="flex justify-end mb-4">
              <Button onClick={exportToCSV} variant="outline" className="gap-2 font-bold shadow-sm shadow-primary/5 hover:bg-primary/5">
                <Download className="w-4 h-4 text-green-600" />
                Export ke Excel / CSV
              </Button>
            </div>

            <div className="glass-card rounded-3xl border-none shadow-xl shadow-primary/5 mb-6 overflow-hidden">
              <div className="p-0 overflow-x-auto max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-track]:bg-transparent">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-[13px] text-muted-foreground uppercase tracking-widest bg-muted sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-5 font-black w-1/3 border-b border-border/50 rounded-tl-3xl">Nama Murid</th>
                      <th className="px-6 py-5 font-black w-1/3 border-b border-border/50">Tingkat Kelas</th>
                      <th className="px-6 py-5 font-black w-1/3 border-b border-border/50 rounded-tr-3xl">Minggu Terakhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 bg-background/50">
                    {reportsLoading ? (
                      [...Array(6)].map((_, idx) => (
                        <tr key={`history-skeleton-${idx}`}>
                          <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-6 w-36 rounded-full" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-5 w-28" /></td>
                        </tr>
                      ))
                    ) : latestFilteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                            <Table className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-bold text-foreground">Tidak ada riwayat murid.</p>
                            <p className="text-xs text-muted-foreground">Laporan aktivitas yang Anda buat akan muncul di sini.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      latestFilteredReports.map((r) => (
                        <tr key={r.id} className="group hover:bg-card hover:shadow-sm transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{r.studentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${r.level.startsWith('Little Creator') ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                              r.level.startsWith('Junior') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                r.level.startsWith('Teenager') ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}>
                              {r.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                            Week <span className="font-bold text-foreground">{r.lessonWeek}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Update Perkembangan Murid (Folder view) ── */}
          <TabsContent value="update" className="animate-fade-in">
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

            {/* Folders Grid */}
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

            {/* Open folder detail — gunakan groupReportsByLevel dari shared utility */}
            {openFolder && (() => {
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
                                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black cursor-default transition-all border ${
                                      isUploaded
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
                                      studentName: openFolder,
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
                                    } as any)}
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
            })()}
          </TabsContent>

          {/* ── Tab: Banner Hari Raya ── */}
          <TabsContent value="banners" className="animate-fade-in">
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
                                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                                    banner.isActive
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
          </TabsContent>

        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Report</DialogTitle></DialogHeader>
            {editingReport && (
              <ReportForm initial={editingReport} onSubmit={handleUpdateReport} submitLabel="Update Report" />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deletingReportId}
          onOpenChange={(open) => { if (!open) { setDeletingReportId(null); setDeletingReportName(undefined); } }}
          onConfirm={() => {
            if (deletingReportId) {
              deleteReport(deletingReportId);
              toast({ title: 'Dihapus', description: `Laporan ${deletingReportName} berhasil dihapus.`, variant: 'destructive' });
              setDeletingReportId(null);
              setDeletingReportName(undefined);
            }
          }}
          studentName={deletingReportName}
        />
      </main>
    </div>
  );
}
