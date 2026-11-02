'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

export default function CandidateLoginPage() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const footerContent = (
    <div className="flex flex-col space-y-1.5 text-center text-xs text-slate-500">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {t('noAccount')}{' '}
        <Link href="/register/candidate" className="font-medium text-primary hover:underline">
          {t('registerAs.candidate')}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.04 }}
      >
        {t('notCandidate')}{' '}
        <Link href="/login/recruiter" className="font-medium text-primary hover:underline">
          {t('loginAs.recruiter')}
        </Link>
      </motion.div>
    </div>
  );

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('candidateLogin.title')}
          description={t('candidateLoginDescription')}
          footer={footerContent}
        >
          <LoginForm role="candidate" callbackUrl={redirectUrl || undefined} />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
