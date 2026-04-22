import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const CERTIFICATES_BUCKET = 'certificates';
export const CERTIFICATE_SIGNED_URL_EXPIRES_IN = 60 * 15;
export const SUPPORTED_CERTIFICATE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

export type CertificatePreviewIssue =
  | 'not_found'
  | 'not_public_or_forbidden'
  | 'unsupported_format'
  | 'invalid_url'
  | 'unknown';

export const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

export const normalizeCertificatePath = (rawUrl: string) => {
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

export const isPdfUrl = (url: string) => {
  if (!url) return false;
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return url.toLowerCase().split('?')[0].endsWith('.pdf');
  }
};

export const getExtensionFromUrl = (url: string) => {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase().split('?')[0];
  }
};

export const isSupportedCertificateUrl = (url: string) => {
  const path = getExtensionFromUrl(url);
  return SUPPORTED_CERTIFICATE_EXTENSIONS.some(ext => path.endsWith(ext));
};

export const resolveCertificateAccessUrl = async (rawUrl: string): Promise<{ url: string; issue: CertificatePreviewIssue | null }> => {
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

export const getCertificatePreviewIssueMessage = (issue: CertificatePreviewIssue) => {
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

export function useCertificateAccess(fileUrl?: string) {
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [issue, setIssue] = useState<CertificatePreviewIssue | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (!fileUrl) {
        setResolvedUrl('');
        setIssue(null);
        return;
      }

      setLoading(true);
      const result = await resolveCertificateAccessUrl(fileUrl);
      if (cancelled) return;
      
      setResolvedUrl(result.url);
      setIssue(result.issue);
      setLoading(false);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return { resolvedUrl, issue, loading, isPdf: isPdfUrl(resolvedUrl || fileUrl || '') };
}
