'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

export default function RecruiterLoginPage() {
  const t = useTranslations('Auth');

  const footerContent = (
    <div className="flex flex-col space-y-1.5 text-center text-xs text-slate-500">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {t('noAccount')}{' '}
        <Link href="/register/recruiter" className="font-medium text-primary hover:underline">
          {t('registerAs.recruiter')}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.04 }}
      >
        {t('notRecruiter')}{' '}
        <Link href="/login/candidate" className="font-medium text-primary hover:underline">
          {t('loginAs.candidate')}
        </Link>
      </motion.div>
    </div>
  );

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('loginAs.recruiter')}
          description={t('recruiterLoginDescription')}
          footer={footerContent}
        >
          <LoginForm role="recruiter" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
