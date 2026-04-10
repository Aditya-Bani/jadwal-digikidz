-- Migration: Add external_links column to activity_reports table
ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb;
