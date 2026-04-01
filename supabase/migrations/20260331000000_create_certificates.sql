-- 1. Membuat tabel student_certificates
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    level TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Mengaktifkan Row Level Security (RLS) pada tabel
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- 3. Membuat policy: Admin bisa melakukan apa saja (Insert, Update, Delete)
CREATE POLICY "Allow full access to authenticated users" 
ON public.student_certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Membuat policy: Parent (Anon / public) bisa membaca (Select) data sertifikat berdasarkan nama
CREATE POLICY "Allow public read access" 
ON public.student_certificates FOR SELECT USING (true);

-- 5. Membuat Bucket Storage bernama 'certificates' (untuk menyimpan file PDF)
-- Jika bucket belum ada, maka akan dibuat otomatis.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Memberi Izin Akses pada Bucket 'certificates'
-- Public dapat membaca (mendownload) file PDF
CREATE POLICY "Public Access Certificates" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'certificates');

-- Admin dapat mengupload (Insert/Update/Delete) file ke bucket
CREATE POLICY "Authenticated Upload Certificates" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated Update Certificates" 
ON storage.objects FOR UPDATE TO authenticated 
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated Delete Certificates" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'certificates');
