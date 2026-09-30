-- ================================================================
-- inCognitus — Supabase Schema & Security Policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- 1. Create the events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL DEFAULT 'Biratnagar International College',
    image_url TEXT,
    registration_form_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Grant table permissions to PostgreSQL roles
GRANT ALL ON TABLE public.events TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "Admins have full access to events" ON public.events;
DROP POLICY IF EXISTS "Allow anon full access" ON public.events;

-- 5. Policies:
-- Allow anyone to read published events
CREATE POLICY "Public can view published events"
    ON public.events
    FOR SELECT
    USING (is_published = true);

-- Allow admin full access (select all, insert, update, delete)
CREATE POLICY "Allow anon full access"
    ON public.events
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Storage Bucket Setup (Unified media bucket for avatars and event banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean up and set policy for media bucket
DROP POLICY IF EXISTS "Allow anon public access media" ON storage.objects;

CREATE POLICY "Allow anon public access media"
    ON storage.objects FOR ALL
    TO anon, authenticated
    USING (bucket_id = 'media')
    WITH CHECK (bucket_id = 'media');

-- ================================================================
-- 7. Team Members Management Table
-- ================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    initials TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant table permissions
GRANT ALL ON TABLE public.team_members TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow anon full access team_members" ON public.team_members;

-- Allow anyone to view active members
CREATE POLICY "Public can view active team members"
    ON public.team_members
    FOR SELECT
    USING (is_active = true);

-- Allow admin full CRUD access (select, insert, update, delete)
CREATE POLICY "Allow anon full access team_members"
    ON public.team_members
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Insert initial team members if table is empty
INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'President', 'MN', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'President');

INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'Vice President', 'MN', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'Vice President');

INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'Technical Lead', 'MN', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'Technical Lead');

INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'Events Coordinator', 'MN', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'Events Coordinator');

INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'CTF Captain', 'MN', 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'CTF Captain');

INSERT INTO public.team_members (name, role, initials, display_order, is_active)
SELECT 'Member Name', 'Community Manager', 'MN', 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'Community Manager');

