'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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

export default function TermsPage() {
  const t = useTranslations('Pages.terms');
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
            className="max-w-3xl mx-auto rounded-lg border border-slate-200 bg-white p-8 sm:p-12 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8 text-center">
              {t('title')}
            </h1>

            <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('sections.agreement.title')}
                </h2>
                <p className="text-slate-600">{t('sections.agreement.content')}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('sections.useLicense.title')}
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>{t('sections.useLicense.content.0')}</li>
                  <li>{t('sections.useLicense.content.1')}</li>
                  <li>{t('sections.useLicense.content.2')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('sections.disclaimer.title')}
                </h2>
                <p className="text-slate-600">{t('sections.disclaimer.content')}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('sections.limitations.title')}
                </h2>
                <p className="text-slate-600">{t('sections.limitations.content')}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('sections.governingLaw.title')}
                </h2>
                <p className="text-slate-600">{t('sections.governingLaw.content')}</p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
