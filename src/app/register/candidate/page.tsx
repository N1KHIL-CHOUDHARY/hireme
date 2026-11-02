'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { RegisterForm } from '@/components/auth/register-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';
import { config } from '@/lib/config';

export default function CandidateRegisterPage() {
  const t = useTranslations('Auth');
  const registrationEnabled = config.registrationEnabled;
  const router = useRouter();

  useEffect(() => {
    if (!registrationEnabled) {
      router.push('/wishlist');
    }
  }, [registrationEnabled, router]);

  if (!registrationEnabled) {
    return (
      <AnimatedBackground>
        <div className="w-full max-w-md px-4">
          <AnimatedAuthCard
            title={t('redirecting')}
            description={t('redirectingToWaitlist')}
            contentClassName="flex flex-col space-y-4 items-center justify-center"
          >
            <div className="py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          </AnimatedAuthCard>
        </div>
      </AnimatedBackground>
    );
  }

  const footerContent = (
    <div className="flex flex-col space-y-1.5 text-center text-xs text-slate-500">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {t('hasAccount')}{' '}
        <Link href="/login/candidate" className="font-medium text-primary hover:underline">
          {t('loginAs.candidate')}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.04 }}
      >
        {t('notCandidate')}{' '}
        <Link href="/register/recruiter" className="font-medium text-primary hover:underline">
          {t('registerAs.recruiter')}
        </Link>
      </motion.div>
    </div>
  );

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('candidateRegistration.title')}
          description={t('candidateRegistration.description')}
          footer={footerContent}
        >
          <RegisterForm role="candidate" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
