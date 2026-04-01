import { useState } from 'react';
import { Header } from '@/components/Header';
import { useCertificates, StudentCertificate } from '@/hooks/useCertificates';
import { uploadReportMedia } from '@/hooks/useActivityReports'; // Reuse upload hook since we just need URL from storage
import { supabase } from '@/integrations/supabase/client';
import { LEVELS } from '@/types/schedule';
import { Search, Plus, Trash2, FileText, Upload, GraduationCap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function CertificatesAdminPage() {
  const { certificates, loading, addCertificate, deleteCertificate } = useCertificates();
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
                 <div className="text-center py-10 opacity-60 animate-pulse font-medium text-sm">Memuat data...</div>
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
      </main>

      <DeleteConfirmDialog
        isOpen={!!deletingCertId}
        onClose={() => setDeletingCertId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Sertifikat"
        description={`Apakah Anda yakin ingin menghapus file sertifikat milik ${deletingCertName}? File akan terhapus dari server selamanya.`}
      />
    </div>
  );
}
