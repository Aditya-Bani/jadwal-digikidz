
-- Add goals_materi and activity_report_text columns to activity_reports
ALTER TABLE public.activity_reports
ADD COLUMN IF NOT EXISTS goals_materi text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS activity_report_text text DEFAULT NULL;

-- Create role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update schedule_entries policies: public read, admin write
DROP POLICY IF EXISTS "Allow all access to schedule_entries" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public read access" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public insert access" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public update access" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public delete access" ON public.schedule_entries;

CREATE POLICY "Allow public read access" ON public.schedule_entries FOR SELECT USING (true);
CREATE POLICY "Admin can insert schedule" ON public.schedule_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update schedule" ON public.schedule_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete schedule" ON public.schedule_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update activity_reports policies
DROP POLICY IF EXISTS "Allow all access to activity_reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public read" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public insert" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public update" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public delete" ON public.activity_reports;

CREATE POLICY "Allow public read" ON public.activity_reports FOR SELECT USING (true);
CREATE POLICY "Admin can insert reports" ON public.activity_reports FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update reports" ON public.activity_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete reports" ON public.activity_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update student_access_codes policies
DROP POLICY IF EXISTS "Allow all access to student_access_codes" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public read by access code" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public insert" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public update" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public delete" ON public.student_access_codes;

CREATE POLICY "Allow public read by access code" ON public.student_access_codes FOR SELECT USING (true);
CREATE POLICY "Admin can insert access codes" ON public.student_access_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update access codes" ON public.student_access_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete access codes" ON public.student_access_codes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add delete policy for report-media storage
CREATE POLICY "Allow public delete from report-media" ON storage.objects FOR DELETE USING (bucket_id = 'report-media');

-- Insert existing schedule data
INSERT INTO public.schedule_entries (student_name, coach, level, day, time, notes) VALUES
  ('Neil', 'Mr. Bani', 'Little Creator 1', 'sabtu', '09:00', NULL),
  ('Aufar', 'Mr. Argy', 'Teenager 1', 'sabtu', '10:00', NULL),
  ('Chelsea', 'Mr. Bani', 'Junior 1', 'sabtu', '10:00', NULL),
  ('Donna', 'Mr. Bani', 'Junior 1', 'sabtu', '10:00', NULL),
  ('George', 'Mr. Argy', 'Teenager 1', 'sabtu', '11:00', NULL),
  ('Marchia', 'Mr. Bani', 'Junior 1', 'sabtu', '11:00', NULL),
  ('Veve', 'Mr. Bani', 'Junior 1', 'senin', '13:00', NULL),
  ('Donna', 'Mr. Bani', 'Junior 1', 'senin', '13:00', NULL),
  ('Kristof', 'Mr. Bani', 'Little Creator 1', 'selasa', '13:00', NULL),
  ('Jetro', 'Mr. Argy', 'Teenager 2', 'sabtu', '13:00', NULL),
  ('El', 'Mr. Bani', 'Teenager 1', 'selasa', '14:00', NULL),
  ('Ismail', 'Mr. Bani', 'Little Creator 1', 'rabu', '14:00', NULL),
  ('Darren', 'Mr. Argy', 'Teenager 1', 'kamis', '14:00', NULL),
  ('Clarisha', 'Mr. Bani', 'Teenager 1', 'jumat', '14:00', NULL),
  ('Lubna', 'Mr. Bani', 'Trial Class', 'sabtu', '14:00', NULL),
  ('Lionel', 'Mr. Argy', 'Teenager 2', 'jumat', '14:00', NULL),
  ('Kania', 'Mr. Bani', 'Teenager 2', 'senin', '15:00', NULL),
  ('Nora', 'Mr. Bani', 'Little Creator 1', 'selasa', '15:00', NULL),
  ('Safaa', 'Mr. Bani', 'Junior 1', 'rabu', '15:00', NULL),
  ('Nael', 'Mr. Bani', 'Teenager 1', 'kamis', '15:00', NULL),
  ('Nael', 'Mr. Argy', 'Teenager 1', 'jumat', '15:00', NULL),
  ('Sherleen', 'Mr. Argy', 'Junior 1', 'kamis', '15:00', NULL),
  ('Ara', 'Mr. Bani', 'Little Creator 1', 'rabu', '16:00', NULL),
  ('Jacob', 'Mr. Argy', 'Teenager 2', 'kamis', '16:00', 'Cuti'),
  ('Barta', 'Mr. Argy', 'Teenager 2', 'kamis', '16:00', NULL),
  ('Nehal', 'Mr. Bani', 'Junior 1', 'jumat', '16:00', NULL),
  ('Ara', 'Mr. Bani', 'Little Creator 1', 'senin', '16:00', NULL),
  ('Bilal', 'Mr. Bani', 'Junior 1', 'kamis', '16:00', NULL),
  ('Barta', 'Mr. Argy', 'Teenager 1', 'jumat', '16:00', NULL),
  ('Luna', 'Mr. Argy', 'Little Creator 1', 'kamis', '17:00', 'Keep'),
  ('Abee', 'Mr. Bani', 'Trial Class', 'rabu', '17:00', NULL),
  ('Leia', 'Mr. Bani', 'Junior 1', 'kamis', '17:00', 'Keep');
