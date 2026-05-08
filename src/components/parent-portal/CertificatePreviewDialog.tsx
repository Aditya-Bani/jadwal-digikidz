import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCertificateAccess, getCertificatePreviewIssueMessage } from '@/hooks/useCertificateAccess';
import { StudentCertificate } from '@/hooks/useCertificates';

interface CertificatePreviewDialogProps {
  certificate: StudentCertificate | null;
  onClose: () => void;
}

export function CertificatePreviewDialog({ certificate, onClose }: CertificatePreviewDialogProps) {
  const { resolvedUrl, issue, loading, isPdf } = useCertificateAccess(certificate?.fileUrl);

  return (
    <Dialog open={!!certificate} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2rem] bg-slate-50 border-none shadow-3xl w-[94vw] sm:w-full">
        {certificate && (
          <div className="flex flex-col items-center gap-4 p-4 sm:p-10">
            <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-white ring-1 ring-slate-200">
              {loading ? (
                <div className="w-full min-h-[50vh] p-8 space-y-3">
                  <Skeleton className="h-6 w-52" />
                  <Skeleton className="h-[40vh] w-full rounded-xl" />
                </div>
              ) : issue && issue !== 'unsupported_format' ? (
                <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">Preview sertifikat tidak tersedia</p>
                  <p className="text-sm max-w-xl">{getCertificatePreviewIssueMessage(issue)}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => onClose()}>
                      Tutup
                    </Button>
                    <Button asChild type="button" variant="default" className="rounded-xl">
                      <a href={resolvedUrl || certificate.fileUrl} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
                    </Button>
                  </div>
                </div>
              ) : isPdf ? (
                <div className="w-full relative" style={{ height: '70vh' }}>
                  <iframe
                    src={resolvedUrl || certificate.fileUrl}
                    className="w-full h-full border-none bg-white"
                    title="Sertifikat Kelulusan"
                    onError={() => {/* handled by fallback below */}}
                  />
                  {/* Fallback overlay — visible only if iframe fails to render */}
                  <noscript>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500 p-6 text-center">
                      <p className="font-semibold text-slate-700">Preview tidak tersedia di browser ini</p>
                      <a href={resolvedUrl || certificate.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">
                        Buka di Tab Baru
                      </a>
                    </div>
                  </noscript>
                </div>
              ) : (
                issue ? (
                  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Preview sertifikat tidak tersedia</p>
                    <p className="text-sm max-w-xl">{getCertificatePreviewIssueMessage(issue)}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button asChild type="button" variant="default" className="rounded-xl">
                        <a href={resolvedUrl || certificate.fileUrl} target="_blank" rel="noopener noreferrer">Buka di Tab Baru</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={resolvedUrl || certificate.fileUrl}
                    alt="Sertifikat"
                    className="w-full h-auto object-contain bg-white"
                  />
                )
              )}
            </div>
            <Button asChild size="lg" className="rounded-xl bg-slate-900 hover:bg-black text-white px-10 h-12 font-bold uppercase tracking-widest text-xs">
              <a href={resolvedUrl || certificate.fileUrl} download target="_blank" rel="noopener noreferrer">Download Sertifikat</a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
