'use client';

import { ArrowLeft, Building2, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

export default function DemoPage() {
  const t = useTranslations('Demo');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          {/* Back link */}
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Sparkles size={12} />
              <span>Interactive Walkthroughs</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl mb-3">
              {t('page.title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">{t('page.description')}</p>
          </div>

          {/* Book a Demo CTA */}
          <div className="text-center mb-12">
            <Link href="/demo/book">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{t('page.bookPersonalizedDemo')}</span>
              </Button>
            </Link>
          </div>

          {/* Demo Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Recruiter Demo */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] overflow-hidden">
              <div className="aspect-video w-full relative bg-slate-100">
                <iframe
                  src="https://www.youtube.com/embed/WeKwq_9FSSI?si=zGqAo0q_hXc4J_ar"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-md bg-blue-50 border border-blue-100 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('sections.recruiter.title')}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('sections.recruiter.description')}
                </p>
              </div>
            </div>

            {/* Candidate Demo */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] overflow-hidden">
              <div className="aspect-video w-full relative bg-slate-100">
                <iframe
                  src="https://www.youtube.com/embed/__lHYyjGtBM?si=WS1NzXx6UpIH7DQs"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-md bg-blue-50 border border-blue-100 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('sections.candidate.title')}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('sections.candidate.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
