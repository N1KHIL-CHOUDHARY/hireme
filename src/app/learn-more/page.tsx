'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, Lightbulb, Rocket, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
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

interface FAQ {
  question: string;
  answer: string;
}

interface TechFeature {
  title: string;
  description: string;
}

interface BenefitColumn {
  title: string;
  icon: React.ReactNode;
  benefits: string[];
}

export default function LearnMorePage() {
  const t = useTranslations('LearnMore');

  const keyObjectives = t.raw('mission.keyObjectives.items') as string[];
  const faqs = t.raw('faq.questions') as FAQ[];

  const benefitColumns: BenefitColumn[] = [
    {
      title: t('benefits.sections.recruiters.title'),
      icon: <Zap className="text-primary" size={20} />,
      benefits: t.raw('benefits.sections.recruiters.items') as string[],
    },
    {
      title: t('benefits.sections.candidates.title'),
      icon: <Sparkles className="text-primary" size={20} />,
      benefits: t.raw('benefits.sections.candidates.items') as string[],
    },
    {
      title: t('benefits.sections.platform.title'),
      icon: <Rocket className="text-primary" size={20} />,
      benefits: t.raw('benefits.sections.platform.items') as string[],
    },
  ];

  const techFeatures: TechFeature[] = [
    {
      title: t('technology.features.nlp.title'),
      description: t('technology.features.nlp.description'),
    },
    {
      title: t('technology.features.ml.title'),
      description: t('technology.features.ml.description'),
    },
    {
      title: t('technology.features.cv.title'),
      description: t('technology.features.cv.description'),
    },
    {
      title: t('technology.features.conversationalAi.title'),
      description: t('technology.features.conversationalAi.description'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Header / Hero */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                <span>{t('backToHome')}</span>
              </Button>
            </Link>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeIn} className="mb-4">
              <Image
                height={40}
                width={160}
                src="/images/hirelytics-full-logo.svg"
                alt="Hirelytics"
                className="h-9 w-auto"
                priority
              />
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-3"
            >
              <BookOpen size={12} />
              <span>{t('discoverHirelytics')}</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3"
            >
              {t('learnMoreTitle')} <span className="text-primary">Hirelytics</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-base text-slate-600 leading-relaxed">
              {t('learnMoreDescription')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-3">
                <Lightbulb size={12} />
                <span>{t('mission.title')}</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
                {t('mission.heading')}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {t('mission.description1')}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{t('mission.description2')}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                <span>{t('mission.keyObjectives.title')}</span>
              </h3>
              <ul className="space-y-3">
                {keyObjectives.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-slate-700">
                    <Check className="text-primary shrink-0 mr-2.5 mt-0.5" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-3">
              <Rocket size={12} />
              <span>{t('benefits.title')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('benefits.heading')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('benefits.description')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefitColumns.map((column: BenefitColumn, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-md bg-blue-50 p-2.5 border border-blue-100">
                  {column.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">{column.title}</h3>
                <ul className="space-y-2.5">
                  {column.benefits.map((benefit: string, j: number) => (
                    <li key={j} className="flex items-start text-xs text-slate-600 leading-relaxed">
                      <Check className="text-primary shrink-0 mr-2 mt-0.5" size={14} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-3">
                <Zap size={12} />
                <span>{t('technology.title')}</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl mb-2">
                {t('technology.heading')}
              </h2>
              <p className="text-sm text-slate-600">{t('technology.description')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {techFeatures.map((tech: TechFeature, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                >
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{tech.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary mb-3">
              <Lightbulb size={12} />
              <span>{t('faq.title')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('faq.heading')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('faq.description')}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq: FAQ, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{faq.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto rounded-xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Sparkles size={12} />
              <span>{t('cta.readyToStart')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
              {t('cta.heading')}
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">{t('cta.description')}</p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Zap size={16} />
                <span>{t('cta.getStarted')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
