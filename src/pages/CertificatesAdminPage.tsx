import { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useCertificates, StudentCertificate } from '@/hooks/useCertificates';
import { uploadReportMedia, useActivityReports } from '@/hooks/useActivityReports';
import { groupReportsByLevel } from '@/lib/levelUtils';
import { supabase } from '@/integrations/supabase/client';
import { LEVELS } from '@/types/schedule';
import { Search, Plus, Trash2, FileText, Upload, GraduationCap, Download, Eye, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

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
    return decodeURIComponent(parsed.pathname.slice(markerIdx + marker.length));
  } catch {
    return '';
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

const isPdfUrl = (url: string) => getExtensionFromUrl(url).endsWith('.pdf');

const getCertificatePreviewIssueMessage = (issue: CertificatePreviewIssue) => {
  switch (issue) {
    case 'not_found':
      return 'File sertifikat tidak ditemukan. Kemungkinan file sudah dipindah atau dihapus.';
    case 'not_public_or_forbidden':
      return 'File tidak bisa diakses. Periksa policy bucket/private access.';
    case 'unsupported_format':
      return 'Format file belum didukung untuk preview. Gunakan PDF atau gambar (PNG/JPG/WEBP).';
    case 'invalid_url':
      return 'URL file sertifikat tidak valid.';
    default:
      return 'Preview sertifikat gagal dimuat. Coba lagi atau buka file di tab baru.';
  }
};

// ─── Certificate Status Panel ────────────────────────────────────────────────
// Detects students who have completed levels (based on activity reports)
// but are missing their certificates.

interface StudentCertStatus {
  studentName: string;
  completedLevels: number[];
  missingLevels: number[];
  hasCertForLevel: (level: number) => boolean;
  certCount: number;
}

export default function CertificatesAdminPage() {
  const { certificates, loading, addCertificate, deleteCertificate } = useCertificates();
  const { reports, loading: reportsLoading } = useActivityReports();
  const [statusPanelExpanded, setStatusPanelExpanded] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'complete'>('missing');

  // Build status list from the UNION of students in activity_reports AND certificates.
  // Uses case-insensitive name normalization so "Neil", "neil", "Neil " all map to one entry.
  const certStatusList = useMemo<StudentCertStatus[]>(() => {
    if (reportsLoading) return [];

    // Build a map: normalizedKey (lowercase+trim) → canonical display name
    // Reports take priority for the display name; certs are added if not already present.
    const canonicalNames = new Map<string, string>();
    reports.forEach(r => {
      const key = r.studentName.trim().toLowerCase();
      if (!canonicalNames.has(key)) canonicalNames.set(key, r.studentName.trim());
    });
    certificates.forEach(c => {
      const key = c.studentName.trim().toLowerCase();
      if (!canonicalNames.has(key)) canonicalNames.set(key, c.studentName.trim());
    });

    return Array.from(canonicalNames.entries()).map(([nameKey, displayName]) => {
      // Match reports and certs using the normalized key (case-insensitive)
      const studentReports = reports.filter(
        r => r.studentName.trim().toLowerCase() === nameKey
      );
      const studentCerts = certificates.filter(
        c => c.studentName.trim().toLowerCase() === nameKey
      );

      const { levels } = groupReportsByLevel(studentReports);

      // A level is "completed" if it has at least 8 reports
      const completedLevels = levels
        .filter(lvl => (lvl.halfA.length + lvl.halfB.length) >= 8)
        .map(lvl => lvl.level);

      // Helper: does a specific curriculum level number have a certificate?
      const hasCertForLevel = (levelNum: number) => {
        return studentCerts.some(cert => {
          try {
            // Cert stored as JSON: { level: "Level 1", jenjang: "Teenager 2" }
            // Match against parsed.level ("Level 1" → 1), NOT jenjang ("Teenager 2" → 2)
            const parsed = JSON.parse(cert.level);
            const certLevelStr = parsed.level || cert.level;
            const match = certLevelStr.match(/\d+/);
            return match ? parseInt(match[0], 10) === levelNum : false;
          } catch {
            // Fallback for plain strings like "Level 1" or "1"
            const match = cert.level.match(/\d+/);
            return match ? parseInt(match[0], 10) === levelNum : false;
          }
        });
      };

      const missingLevels = completedLevels.filter(lvl => !hasCertForLevel(lvl));

      return {
        studentName: displayName,
        completedLevels,
        missingLevels,
        hasCertForLevel,
        certCount: studentCerts.length,
      };
    })
    .sort((a, b) => {
      if (b.missingLevels.length !== a.missingLevels.length) return b.missingLevels.length - a.missingLevels.length;
      return a.studentName.localeCompare(b.studentName);
    });
  }, [reports, certificates, reportsLoading]);

  const filteredStatusList = useMemo(() => {
    if (statusFilter === 'missing') {
      // Students who have completed levels but at least one cert is missing
      return certStatusList.filter(s => s.missingLevels.length > 0);
    }
    if (statusFilter === 'complete') {
      // Students who have at least one certificate uploaded AND no missing certs
      // (certCount > 0 catches students with certs but < 8 reports)
      return certStatusList.filter(s => s.certCount > 0 && s.missingLevels.length === 0);
    }
    return certStatusList; // 'all' — everyone
  }, [certStatusList, statusFilter]);

  const totalMissing = certStatusList.filter(s => s.missingLevels.length > 0).length;
  const totalComplete = certStatusList.filter(s => s.certCount > 0 && s.missingLevels.length === 0).length;
  const { toast } = useToast();


  const [studentName, setStudentName] = useState('');
  const [levelLulus, setLevelLulus] = useState('');
  const [jenjangMurid, setJenjangMurid] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [searchStudent, setSearchStudent] = useState('');
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [deletingCertName, setDeletingCertName] = useState<string | undefined>();
  const [deletingCertFileUrl, setDeletingCertFileUrl] = useState<string | undefined>();
  const [previewCertificate, setPreviewCertificate] = useState<StudentCertificate | null>(null);
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState('');
  const [previewIssue, setPreviewIssue] = useState<CertificatePreviewIssue | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const resolveCertificateAccessUrl = async (rawUrl: string): Promise<{ url: string; issue: CertificatePreviewIssue | null }> => {
    const cleaned = rawUrl.trim();
    if (!cleaned) return { url: '', issue: 'invalid_url' };
    if (!isSupportedCertificateUrl(cleaned)) return { url: cleaned, issue: 'unsupported_format' };

    const normalizedPath = normalizeCertificatePath(cleaned);
    if (normalizedPath) {
      const { data, error } = await supabase.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(normalizedPath, CERTIFICATE_SIGNED_URL_EXPIRES_IN);

      if (!error && data?.signedUrl) return { url: data.signedUrl, issue: null };
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

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (!previewCertificate?.fileUrl) {
        setResolvedPreviewUrl('');
        setPreviewIssue(null);
        return;
      }
      setPreviewLoading(true);
      const result = await resolveCertificateAccessUrl(previewCertificate.fileUrl);
      if (cancelled) return;
      setResolvedPreviewUrl(result.url);
      setPreviewIssue(result.issue);
      setPreviewLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
  }, [previewCertificate]);

  const filteredCertificates = certificates.filter(
    (c) => !searchStudent || c.studentName.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleUploadCertificate = async (file: File) => {
    // Custom upload logic to the 'certificates' bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, file);

    if (error) {
       throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleAddCertificate = async () => {
    if (!studentName.trim() || !levelLulus.trim() || !jenjangMurid || !certificateFile) {
      toast({ title: 'Error', description: 'Harap isi semua field dan pilih file PDF/Gambar.', variant: 'destructive' });
      return;
    }
    
    setUploading(true);
    try {
      const fileUrl = await handleUploadCertificate(certificateFile);
      
      // Simpan sebagai JSON string agar bisa diparsing di Parent Portal
      const combinedLevel = JSON.stringify({ level: levelLulus.trim(), jenjang: jenjangMurid });

      const result = await addCertificate({
        studentName: studentName.trim(),
        level: combinedLevel,
        fileUrl,
      });

      if (result.success) {
        toast({ title: 'Berhasil!', description: `Sertifikat untuk ${studentName} berhasil diupload.` });
        setStudentName('');
        setLevelLulus('');
        setJenjangMurid('');
        setCertificateFile(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message || 'Gagal mengupload sertifikat', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCertId) return;
    
    // Extract file name from URL to delete from storage as well
    let fileName;
    if (deletingCertFileUrl) {
       try {
         const urlObj = new URL(deletingCertFileUrl);
         const pathParts = urlObj.pathname.split('/');
         fileName = pathParts[pathParts.length - 1];
       } catch (e) {
         console.error("Invalid URL format", deletingCertFileUrl);
       }
    }

    const result = await deleteCertificate(deletingCertId, fileName);
    if (result.success) {
      toast({ title: 'Terhapus', description: 'Sertifikat berhasil dihapus.' });
    } else {
      toast({ title: 'Gagal', description: 'Gagal menghapus sertifikat.', variant: 'destructive' });
    }
    setDeletingCertId(null);
    setDeletingCertName(undefined);
    setDeletingCertFileUrl(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">Manajemen <span className="text-primary">Sertifikat</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Upload dan kelola sertifikat kelulusan tercetak versi digital.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Upload Sertifikat */}
          <div className="lg:col-span-1 border border-border/50 bg-card rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Sertifikat
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Murid *</Label>
                <Input 
                   value={studentName} 
                   onChange={(e) => setStudentName(e.target.value)} 
                   placeholder="Nama murid persis sesuai portal" 
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Sertifikat (Level Lulus) *</Label>
                <Input 
                   value={levelLulus} 
                   onChange={(e) => setLevelLulus(e.target.value)} 
                   placeholder="Contoh: Level 1, Level 2, dll." 
                />
              </div>
              <div className="space-y-2">
                <Label>Folder Jenjang Murid *</Label>
                <Select value={jenjangMurid} onValueChange={setJenjangMurid}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih jenjang murid" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">Digunakan untuk meletakkan sertifikat di folder yang benar pada Parent Portal.</p>
              </div>
              <div className="space-y-2">
                <Label>File Sertifikat (PDF/Gambar) *</Label>
                <Input 
                   type="file" 
                   accept=".pdf,image/*" 
                   onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} 
                />
                <p className="text-[10px] text-muted-foreground italic">Disarankan format PDF agar kualitas cetak tinggi saat didownload parent.</p>
              </div>
              
              <Button 
                 onClick={handleAddCertificate} 
                 disabled={uploading || !studentName || !levelLulus || !jenjangMurid || !certificateFile} 
                 className="w-full h-11 border border-primary/20 hover:border-primary shadow-md"
              >
                {uploading ? (
                  <><Upload className="w-4 h-4 mr-2 animate-spin" />Mengunggah...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" />Simpan & Upload</>
                )}
              </Button>
            </div>
          </div>

          {/* Daftar Sertifikat */}
          <div className="lg:col-span-2 border border-border/50 bg-card rounded-3xl p-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Daftar Sertifikat Terupload
            </h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchStudent} 
                onChange={(e) => setSearchStudent(e.target.value)} 
                placeholder="Cari berdasarkan nama murid..." 
                className="pl-9 h-11 rounded-xl" 
              />
            </div>
            
            <div className="space-y-3">
              {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {[...Array(4)].map((_, idx) => (
                     <div key={idx} className="border border-border rounded-2xl p-4 space-y-3">
                       <div className="flex items-center justify-between">
                         <Skeleton className="h-5 w-32" />
                         <Skeleton className="h-5 w-5 rounded-full" />
                       </div>
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-8 w-full rounded-lg" />
                     </div>
                   ))}
                 </div>
              ) : filteredCertificates.length === 0 ? (
                 <EmptyState 
                   title="Data Sertifikat Kosong" 
                   description="Belum ada sertifikat yang diupload atau data tidak ditemukan."
                 />
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredCertificates.map(cert => (
                       <div key={cert.id} className="border border-border rounded-2xl p-4 flex flex-col gap-3 group bg-background/50 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between">
                             <div className="space-y-1 pr-2">
                                <h4 className="font-extrabold text-foreground truncate">{cert.studentName}</h4>
                                {(() => {
                                    let certLevel = cert.level;
                                    let certJenjang = "";
                                    try {
                                       const parsed = JSON.parse(cert.level);
                                       certLevel = parsed.level;
                                       certJenjang = parsed.jenjang;
                                    } catch (e) {}
                                    return (
                                       <div className="flex flex-col gap-1 items-start mt-1">
                                         <span className="font-bold text-xs text-foreground bg-primary/10 px-2 py-0.5 rounded-md">
                                           {certLevel}
                                         </span>
                                         {certJenjang && (
                                           <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                             Folder: {certJenjang}
                                           </span>
                                         )}
                                       </div>
                                    );
                                })()}
                             </div>
                             <FileText className="h-6 w-6 text-muted-foreground opacity-50 shrink-0" />
                          </div>
                          
                          <div className="flex gap-2">
                             <Button
                                type="button"
                                variant="outline"
                                className="h-auto py-2 px-3 text-xs font-bold rounded-lg"
                                onClick={() => setPreviewCertificate(cert)}
                             >
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                             </Button>
                             <a 
                                href={cert.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold text-center py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                             >
                                <Download className="h-3 w-3" /> Buka File
                             </a>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-auto py-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                                onClick={() => {
                                   setDeletingCertId(cert.id);
                                   setDeletingCertName(cert.studentName);
                                   setDeletingCertFileUrl(cert.fileUrl);
                                }}
                             >
                                <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Certificate Status Panel ── */}
        <div className="mt-8 border border-border/50 bg-card rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setStatusPanelExpanded(v => !v)}
            className="w-full flex items-center justify-between p-6 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black text-foreground">Status Sertifikat Murid</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Murid yang sudah naik level berdasarkan activity report
                </p>
              </div>
              {totalMissing > 0 && (
                <span className="ml-2 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-600 border border-red-200">
                  {totalMissing} belum lengkap
                </span>
              )}
              {totalMissing === 0 && certStatusList.length > 0 && (
                <span className="ml-2 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ✓ Semua lengkap
                </span>
              )}
            </div>
            {statusPanelExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {statusPanelExpanded && (
            <div className="px-6 pb-6 space-y-4">
              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap">
                {(['missing', 'complete', 'all'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${
                      statusFilter === f
                        ? f === 'missing'
                          ? 'bg-red-500 text-white border-red-500'
                          : f === 'complete'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-primary text-white border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                  >
                    {f === 'missing' ? `❌ Belum Lengkap (${totalMissing})` : f === 'complete' ? `✓ Sudah Lengkap (${totalComplete})` : `Semua (${certStatusList.length})`}
                  </button>
                ))}
              </div>

              {reportsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border border-border rounded-2xl p-4 space-y-2 animate-pulse">
                      <div className="h-4 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-1/2" />
                      <div className="flex gap-1.5 mt-2">
                        {[...Array(3)].map((_, j) => <div key={j} className="h-7 w-7 bg-muted rounded-lg" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredStatusList.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                  <p className="font-bold text-sm">
                    {statusFilter === 'missing' ? 'Tidak ada murid yang kekurangan sertifikat!' : 'Tidak ada data untuk filter ini.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStatusList.map(student => (
                    <div
                      key={student.studentName}
                      className={`rounded-2xl p-4 border transition-all ${
                        student.missingLevels.length > 0
                          ? 'bg-red-50/50 border-red-200'
                          : student.certCount > 0
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-black text-sm text-foreground">{student.studentName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {student.certCount > 0
                              ? `${student.certCount} sertifikat · ${student.completedLevels.length} level selesai`
                              : student.completedLevels.length > 0
                              ? `${student.completedLevels.length} level selesai`
                              : 'Masih dalam progress'}
                          </p>
                        </div>
                        {student.missingLevels.length > 0 ? (
                          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                            {student.missingLevels.length} kurang
                          </span>
                        ) : student.certCount > 0 ? (
                          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            ✓ Lengkap
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            In Progress
                          </span>
                        )}
                      </div>

                      {/* Level chips — from completed activity report levels */}
                      {student.completedLevels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {student.completedLevels.map(lvl => {
                            const hasCert = student.hasCertForLevel(lvl);
                            return (
                              <div
                                key={lvl}
                                title={hasCert ? `Level ${lvl}: Sertifikat sudah ada` : `Level ${lvl}: Sertifikat BELUM diupload`}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                                  hasCert
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                    : 'bg-red-100 text-red-600 border-red-300 border-dashed'
                                }`}
                              >
                                {hasCert ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                Lv {lvl}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* If student has certs but no "completed" levels from reports — show cert chips directly */}
                      {student.completedLevels.length === 0 && student.certCount > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border bg-emerald-100 text-emerald-700 border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {student.certCount} sertifikat
                          </div>
                          <span className="text-[10px] text-muted-foreground self-center italic">
                            (report &lt;8 sesi)
                          </span>
                        </div>
                      )}

                      {/* Quick action */}
                      {student.missingLevels.length > 0 && (
                        <button
                          onClick={() => {
                            setStudentName(student.studentName);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="mt-2 w-full text-[10px] font-black py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Upload Sertifikat →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={!!deletingCertId}
        onClose={() => setDeletingCertId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Sertifikat"
        description={`Apakah Anda yakin ingin menghapus file sertifikat milik ${deletingCertName}? File akan terhapus dari server selamanya.`}
      />

      <Dialog open={!!previewCertificate} onOpenChange={(open) => !open && setPreviewCertificate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Sertifikat Admin</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-border overflow-hidden bg-background min-h-[50vh]">
            {previewLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-[40vh] w-full rounded-xl" />
              </div>
            ) : previewIssue ? (
              <div className="min-h-[50vh] p-8 text-center flex flex-col items-center justify-center gap-4">
                <p className="font-bold">Preview tidak tersedia</p>
                <p className="text-sm text-muted-foreground max-w-xl">{getCertificatePreviewIssueMessage(previewIssue)}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button type="button" variant="outline" onClick={() => setPreviewCertificate(prev => prev ? { ...prev } : prev)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
                  </Button>
                  <Button asChild type="button">
                    <a href={resolvedPreviewUrl || previewCertificate?.fileUrl} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
                  </Button>
                </div>
              </div>
            ) : isPdfUrl(resolvedPreviewUrl || previewCertificate?.fileUrl || '') ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolvedPreviewUrl || previewCertificate?.fileUrl || '')}&embedded=true`}
                className="w-full h-[70vh] border-none"
                title="Preview Sertifikat"
              />
            ) : (
              <img
                src={resolvedPreviewUrl || previewCertificate?.fileUrl}
                alt="Preview Sertifikat"
                className="w-full h-auto max-h-[70vh] object-contain bg-white"
                onError={() => setPreviewIssue('unknown')}
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <a href={resolvedPreviewUrl || previewCertificate?.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" /> Download Sertifikat
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
