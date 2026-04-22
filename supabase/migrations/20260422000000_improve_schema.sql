-- Add updated_by column to schedule_entries
ALTER TABLE public.schedule_entries 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    max_levels INTEGER NOT NULL DEFAULT 6,
    weeks_per_level INTEGER NOT NULL DEFAULT 16,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public) for programs
CREATE POLICY "Allow public read access to programs"
ON public.programs FOR SELECT
USING (true);

-- Seed initial program data based on the app's hardcoded limits
INSERT INTO public.programs (name, max_levels, weeks_per_level)
VALUES 
('Little Creator 1', 3, 16),
('Little Creator 2', 3, 16),
('Junior 1', 4, 16),
('Junior 2', 4, 16),
('Teenager 1', 6, 16),
('Teenager 2', 6, 16),
('Teenager 3', 6, 16)
ON CONFLICT (name) DO UPDATE 
SET max_levels = EXCLUDED.max_levels,
    weeks_per_level = EXCLUDED.weeks_per_level;
