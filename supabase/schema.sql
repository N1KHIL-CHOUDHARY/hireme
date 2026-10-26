-- Hirelytics Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('admin', 'recruiter', 'candidate')),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "expiryDate" TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT,
  benefits TEXT,
  "urlId" TEXT NOT NULL UNIQUE,
  recruiter UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "interviewDuration" INTEGER NOT NULL DEFAULT 15,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public.jobs(recruiter);
CREATE INDEX IF NOT EXISTS idx_jobs_urlId ON public.jobs("urlId");
CREATE INDEX IF NOT EXISTS idx_jobs_isActive ON public.jobs("isActive");

-- 4. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "jobId" UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "candidateName" TEXT,
  email TEXT,
  "resumeUrl" TEXT NOT NULL,
  "resumeBase64" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "s3Key" TEXT,
  "s3Bucket" TEXT,
  "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  "parsedResume" JSONB,
  "monitoringEnabled" BOOLEAN DEFAULT false,
  "monitoringInterval" INTEGER DEFAULT 30000,
  "monitoringImages" JSONB DEFAULT '[]'::jsonb,
  "interviewChatHistory" JSONB DEFAULT '[]'::jsonb,
  "interviewState" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for job applications
CREATE INDEX IF NOT EXISTS idx_applications_jobId ON public.job_applications("jobId");
CREATE INDEX IF NOT EXISTS idx_applications_userId ON public.job_applications("userId");
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);

-- 5. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. WISHLISTS / WAITLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SUPABASE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('hirelytics', 'hirelytics', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: allow service role & authenticated/anon uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Hirelytics' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access for Hirelytics"
    ON storage.objects FOR ALL
    USING (bucket_id = 'hirelytics')
    WITH CHECK (bucket_id = 'hirelytics');
  END IF;
END $$;

