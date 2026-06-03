
-- Create schedule_entries table
CREATE TABLE public.schedule_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  coach TEXT NOT NULL,
  level TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth required per original project)
CREATE POLICY "Allow all access to schedule_entries" ON public.schedule_entries FOR ALL USING (true) WITH CHECK (true);

-- Create activity_reports table
CREATE TABLE public.activity_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  date TEXT NOT NULL,
  level TEXT NOT NULL,
  lesson_week INTEGER NOT NULL,
  lesson_name TEXT NOT NULL,
  tools TEXT,
  coach TEXT NOT NULL,
  coach_comment TEXT,
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to activity_reports" ON public.activity_reports FOR ALL USING (true) WITH CHECK (true);

-- Create student_access_codes table
CREATE TABLE public.student_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to student_access_codes" ON public.student_access_codes FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for report media
INSERT INTO storage.buckets (id, name, public) VALUES ('report-media', 'report-media', true);

CREATE POLICY "Allow public read on report-media" ON storage.objects FOR SELECT USING (bucket_id = 'report-media');
CREATE POLICY "Allow public upload on report-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-media');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schedule_entries_updated_at BEFORE UPDATE ON public.schedule_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activity_reports_updated_at BEFORE UPDATE ON public.activity_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
