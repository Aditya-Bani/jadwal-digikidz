-- Create holiday_banners table for seasonal popup banners on Parent Portal
CREATE TABLE IF NOT EXISTS public.holiday_banners (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  image_url   text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holiday_banners ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated Parent Portal visitors) can read banners
CREATE POLICY "Anyone can read holiday banners"
  ON public.holiday_banners FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can insert banners
CREATE POLICY "Authenticated users can insert holiday banners"
  ON public.holiday_banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update banners
CREATE POLICY "Authenticated users can update holiday banners"
  ON public.holiday_banners FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated admins can delete banners
CREATE POLICY "Authenticated users can delete holiday banners"
  ON public.holiday_banners FOR DELETE
  TO authenticated
  USING (true);
