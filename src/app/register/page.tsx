'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

const fadeIn = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const registrationEnabled = config.registrationEnabled;

  useEffect(() => {
    if (!registrationEnabled) {
      router.push('/wishlist');
    }
  }, [router, registrationEnabled]);

  if (!registrationEnabled) {
    return (
      <AnimatedBackground>
        <div className="w-full max-w-md px-4">
          <AnimatedAuthCard
            title="Redirecting..."
            description="Please wait while we redirect you to the waitlist page."
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

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('register')}
          description={t('chooseRoleRegister')}
          contentClassName="flex flex-col space-y-4"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            <motion.div variants={fadeIn}>
              <Link href="/register/candidate" className="block w-full">
                <Button variant="default" className="w-full">
                  {t('registerAs.candidate')}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Link href="/register/recruiter" className="block w-full">
                <Button variant="outline" className="w-full">
                  {t('registerAs.recruiter')}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">{t('hasAccount')}</span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full">
                  {t('login')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
