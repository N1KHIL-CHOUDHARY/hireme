'use client';

import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const t = useTranslations('Auth');

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
            {t('unauthorized')}
          </h1>
          <p className="mb-6 text-sm text-slate-600">{t('unauthorizedMessage')}</p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={handleGoBack} variant="outline" className="flex-1">
              {t('goBack')}
            </Button>
            <Button onClick={handleGoToDashboard} variant="default" className="flex-1">
              {t('dashboard')}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 text-slate-600 hover:text-red-600"
            >
              {t('logout')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
