'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';
import { Button } from '@/components/ui/button';

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

export default function LoginPage() {
  const t = useTranslations('Auth');

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('login')}
          description={t('chooseRole')}
          contentClassName="flex flex-col space-y-4"
          footer={
            <div className="text-center text-xs text-slate-500">
              Are you an administrator?{' '}
              <Link href="/login/admin" className="font-medium text-primary hover:underline">
                Admin portal
              </Link>
            </div>
          }
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            <motion.div variants={fadeIn}>
              <Link href="/login/recruiter" className="block w-full">
                <Button variant="default" className="w-full">
                  {t('loginAs.recruiter')}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Link href="/login/candidate" className="block w-full">
                <Button variant="outline" className="w-full">
                  {t('loginAs.candidate')}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">{t('noAccount')}</span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Link href="/register/candidate" className="block w-full">
                <Button variant="outline" className="w-full">
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
          </motion.div>
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
