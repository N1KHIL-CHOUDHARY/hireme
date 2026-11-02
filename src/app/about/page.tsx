'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export default function AboutPage() {
  const t = useTranslations('Pages.about');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {common('navigation.back')}
            </Button>
          </div>

          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl mb-3">
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 items-center mb-16">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t('mission.title')}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{t('mission.description1')}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{t('mission.description2')}</p>
            </div>
            <div className="relative h-[220px] rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)] flex items-center justify-center">
              <Image
                src="/images/hirelytics-full-logo.svg"
                alt="Hirelytics Mission"
                width={300}
                height={80}
                className="h-16 w-auto"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {[
              {
                title: t('values.innovation.title'),
                description: t('values.innovation.description'),
              },
              {
                title: t('values.fairness.title'),
                description: t('values.fairness.description'),
              },
              {
                title: t('values.efficiency.title'),
                description: t('values.efficiency.description'),
              },
            ].map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
              >
                <h3 className="text-base font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center py-8 border-t border-slate-200">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-4">
              <Sparkles size={12} />
              <span>{t('cta.badge')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
              {t('cta.title')}
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto">{t('cta.description')}</p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Sparkles size={16} />
                <span>{common('buttons.getStarted')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
