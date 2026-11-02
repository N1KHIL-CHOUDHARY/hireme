'use client';

import Cal from '@calcom/embed-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

export default function BookDemoPage() {
  const t = useTranslations('Demo');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6">
          <div className="mb-6">
            <Link href="/demo">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Demos
              </Button>
            </Link>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              {t('book.title')}
            </h1>
            <p className="text-sm text-slate-600">{t('book.description')}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] max-w-4xl mx-auto overflow-hidden">
            <Cal
              calLink="sumanta-kabiraj/hirelytics-demo"
              style={{ width: '100%', height: '700px' }}
              config={{
                name: 'Hirelytics Demo',
                hideEventTypeDetails: '0',
                layout: 'month_view',
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
