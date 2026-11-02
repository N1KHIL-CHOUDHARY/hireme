'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

export default function AdminLoginPage() {
  const footerContent = (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="text-center text-xs text-slate-500"
    >
      Not an admin? Login as a{' '}
      <Link href="/login/recruiter" className="font-medium text-primary hover:underline">
        recruiter
      </Link>{' '}
      or{' '}
      <Link href="/login/candidate" className="font-medium text-primary hover:underline">
        candidate
      </Link>
    </motion.div>
  );

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title="Admin Login"
          description="Enter your credentials to access the admin portal"
          footer={footerContent}
        >
          <LoginForm role="admin" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
