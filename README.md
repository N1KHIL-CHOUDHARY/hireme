# Hirelytics - Advanced Recruitment Platform

A comprehensive recruitment and hiring platform built with Next.js 15 App Router, NextAuth v5, Supabase (PostgreSQL), and Supabase Storage. This system supports three roles: admin, recruiter, and candidate, each with their own login, registration, and dashboard experiences. The platform features AI-powered interviews, real-time audio processing, and automated evaluation of candidates.

## Features

- **Role-Based Authentication**: Separate login and registration flows for admin, recruiter, and candidate roles
- **Registration Control**: Toggle user registration on/off with a simple environment variable
- **Waitlist System**: Collect interested user information when registration is disabled
- **Protected Routes**:
  - Unified dashboard with role-specific content
  - Route-based authorization for admin, recruiter, and candidate sections
  - Custom middleware for route protection
  - Automatic role-based navigation and access control
- **Enhanced Security**:
  - Route-based authentication with role protection
  - Smart redirects for authenticated/unauthenticated users
  - JWT-based session management with maxAge of 30 days
  - Password hashing with bcrypt (10 rounds)
  - Form validation and API schema protection with Zod
  - Account activation/deactivation system with admin controls
  - Custom error handling and validation feedback
- **Supabase Integration**:
  - Persistent PostgreSQL data storage for users, jobs, applications, waitlists, and contact requests
  - Type-safe querying with pagination, search, and relations
- **Supabase Storage Integration**:
  - Cloud file storage for resumes, audio files, and candidate monitoring images
  - Secure signed URL generation and direct file downloads
- **AI Interview System**:
  - Automated technical interviews with Gemini AI
  - Real-time audio processing and text-to-speech
  - Webcam monitoring and attention tracking
  - Automatic interview evaluation and feedback
- **Multi-language Support**:
  - Internationalization with next-intl
  - Support for English and Hindi (extensible to more languages)
- **Social Media Sharing**: Share job posts across multiple platforms including:
  - Facebook
  - LinkedIn
  - Telegram
  - WhatsApp
  - Facebook Messenger
- **Modern UI**: Built with Tailwind CSS, shadcn/ui components and Framer Motion animations

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase project (free hosted project at supabase.com or self-hosted)
- Google Cloud API key (for Gemini AI)
- Deepgram API key (for text-to-speech)
- Resend API key (for email notifications)

### Database Setup

Run the SQL migration script in your Supabase SQL Editor:

```bash
# Execute the schema located in supabase/schema.sql
# You can copy and paste the contents of supabase/schema.sql into the Supabase Dashboard -> SQL Editor
```

This creates all required tables (`users`, `jobs`, `job_applications`, `contacts`, `wishlists`) and the `hirelytics` storage bucket.

### Environment Setup

Create a `.env` or `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=hirelytics

# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_string_for_jwt_encryption

# Registration Control
# Set to 'true' to allow new users to register, 'false' to disable registration
REGISTRATION_ENABLED=true

# Admin Email for Notifications
ADMIN_EMAIL=your_admin_email

# Email Service Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# AI Services API Keys
GOOGLE_API_KEY=your_google_api_key_for_gemini_ai
DEEPGRAM_API_KEY=your_deepgram_api_key_for_tts
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/hirelytics.git
   cd hirelytics
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create an Admin User:

   ```bash
   pnpm tsx scripts/create-admin.ts "Admin Name" "admin@example.com" "password"
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Authentication Routes

- **Main Login**: `/login`
- **Admin Login**: `/login/admin`
- **Recruiter Login**: `/login/recruiter`
- **Candidate Login**: `/login/candidate`
- **Recruiter Registration**: `/register/recruiter`
- **Candidate Registration**: `/register/candidate`

## Dashboard Route

- **Unified Dashboard**: `/dashboard` (content changes based on user role)

## Key Features

### For Recruiters

- Create and manage job listings with detailed requirements
- Review candidate applications and resumes
- Schedule and conduct AI-powered interviews
- Evaluate candidate performance with automated insights
- Share job postings across social media platforms

### For Candidates

- Browse and search job opportunities
- Apply for jobs with resume upload
- Participate in interactive AI-powered technical interviews
- Track application status and view interview feedback
- Receive detailed evaluation and performance insights

### For Admins

- System overview with comprehensive statistics
- User management (view, activate/deactivate accounts)
- Job management across all recruiters
- Platform monitoring and maintenance controls
- Waitlist management for registration-disabled mode

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- shadcn/ui components
- Framer Motion animations
- next-intl for internationalization

### Backend

- NextAuth v5 (Auth.js) for authentication
- Supabase (PostgreSQL) for persistent data storage
- Supabase Storage for file uploads (resumes, audio, images)
- Server Actions for API functionality

### AI Features

- Google Gemini AI for interviews and evaluations
- Deepgram API for text-to-speech
- Speech recognition for candidate responses
- Automated technical interview evaluation

### Tools & Utilities

- Zod for form validation and API schema validation
- React Hook Form for form management
- next-share for social media sharing integration
- DND Kit for drag and drop functionality
- Recharts for interactive charts and data visualization
- sonner for toast notifications
- Resend for email service

## Project Structure

```bash
src/
  ├── actions/       # Server actions
  ├── app/           # App router components and API routes
  ├── components/    # Reusable UI components
  ├── constants/     # Application constants
  ├── data/          # Static data and skill definitions
  ├── hooks/         # Custom React hooks
  ├── i18n/          # Internationalization
  ├── lib/           # Utility functions (database, supabase, storage, etc.)
  ├── models/        # Database models (User, Job, JobApplication, etc.)
  ├── provider/      # Global providers
  └── types/         # TypeScript type definitions
supabase/
  └── schema.sql     # Database schema and storage setup
scripts/
  └── create-admin.ts # Script to seed or update admin accounts
```

## AI Interview System

The platform features an advanced AI interview system that allows candidates to participate in automated technical interviews:

1. **Interview Preparation**: Candidates can check their camera and microphone before starting the interview.
2. **AI-Driven Questions**: The system asks technical, project-related, and behavioral questions tailored to the job position.
3. **Real-time Responses**: Candidates can respond via text or speech, with real-time speech recognition.
4. **Attention Monitoring**: The system monitors candidate attention through webcam and window focus tracking.
5. **Automated Evaluation**: After completion, the system generates an evaluation report with scores for technical skills, communication skills, problem-solving, and cultural fit.
6. **Feedback Generation**: Detailed feedback including strengths and areas for improvement is automatically generated.
