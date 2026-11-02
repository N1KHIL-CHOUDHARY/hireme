'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase as BriefcaseIcon,
  Building2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LineChart,
  Link as LinkIcon,
  MessageSquareText,
  Search,
  Sparkles,
  Upload,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TypeAnimation } from 'react-type-animation';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export default function Home() {
  const t = useTranslations('HomePage');
  const common = useTranslations('Common');
  const locale = useLocale();

  const headingSequence = [
    t('typingAnimation.aiPowered'),
    1500,
    t('typingAnimation.smartRecruitment'),
    1500,
    t('typingAnimation.automatedInterviews'),
    1500,
    t('typingAnimation.futureHiring'),
    1500,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/hirelytics-logo.svg"
              alt="Hirelytics"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-slate-900">Hirelytics</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="#features" className="hover:text-primary transition-colors">
              {t('featuresSection.title')}
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">
              {t('howItWorks.title')}
            </Link>
            <Link href="/jobs" className="hover:text-primary transition-colors">
              {t('userAccess.findJobs')}
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{common('buttons.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        <motion.div
          className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 text-center sm:px-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-medium text-primary"
            variants={fadeIn}
          >
            <Sparkles size={14} />
            <span>{t('hero.aiPoweredRecruitment')}</span>
          </motion.div>

          <motion.h1
            className="mb-4 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight"
            variants={fadeIn}
          >
            <span>{t('hero.revolutionizeHiring')} </span>
            <span className="text-primary block sm:inline">
              <TypeAnimation
                key={locale}
                sequence={headingSequence}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </motion.h1>

          <motion.p
            className="mb-8 max-w-2xl text-base text-slate-600 sm:text-lg"
            variants={fadeIn}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-3 mb-10" variants={fadeIn}>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Zap size={16} />
                <span>{common('buttons.getStarted')}</span>
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="gap-2">
                <BriefcaseIcon size={16} />
                <span>{t('userAccess.findJobs')}</span>
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="ghost" className="gap-2 text-slate-700">
                <Search size={16} />
                <span>{common('buttons.howItWorks')}</span>
              </Button>
            </Link>
          </motion.div>

          {/* User Quick Access */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200/70"
          >
            <span className="text-xs text-slate-500 font-medium">Quick Sign In:</span>
            <Link
              href="/login/candidate"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-primary transition-colors"
            >
              <UserIcon size={12} />
              <span>{t('userAccess.candidateLogin')}</span>
              <ChevronRight size={12} className="text-slate-400" />
            </Link>
            <Link
              href="/login/recruiter"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-primary transition-colors"
            >
              <Building2 size={12} />
              <span>{t('userAccess.recruiterLogin')}</span>
              <ChevronRight size={12} className="text-slate-400" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full border-t border-slate-200 bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Sparkles size={12} />
              <span>{t('featuresSection.title')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('featuresSection.subtitle')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('featuresSection.description')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FileText className="text-primary" size={20} />,
                title: t('featuresSection.smartJobPosting.title'),
                description: t('featuresSection.smartJobPosting.description'),
              },
              {
                icon: <LinkIcon className="text-primary" size={20} />,
                title: t('featuresSection.uniqueApplicationLinks.title'),
                description: t('featuresSection.uniqueApplicationLinks.description'),
              },
              {
                icon: <Upload className="text-primary" size={20} />,
                title: t('featuresSection.resumeAnalysis.title'),
                description: t('featuresSection.resumeAnalysis.description'),
              },
              {
                icon: <MessageSquareText className="text-primary" size={20} />,
                title: t('featuresSection.aiPoweredInterviews.title'),
                description: t('featuresSection.aiPoweredInterviews.description'),
              },
              {
                icon: <ClipboardCheck className="text-primary" size={20} />,
                title: t('featuresSection.comprehensiveFeedback.title'),
                description: t('featuresSection.comprehensiveFeedback.description'),
              },
              {
                icon: <LineChart className="text-primary" size={20} />,
                title: t('featuresSection.dataDrivenInsights.title'),
                description: t('featuresSection.dataDrivenInsights.description'),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all hover:border-slate-300"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue-50 p-2.5 border border-blue-100">
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full border-t border-slate-200 bg-slate-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Zap size={12} />
              <span>{t('howItWorks.title')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('howItWorks.subtitle')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('howItWorks.description')}</p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* Center vertical connector for desktop */}
            <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-slate-200 md:block" />

            <div className="space-y-8 md:space-y-12">
              {[
                {
                  step: 1,
                  title: t('howItWorks.steps.step1.title'),
                  description: t('howItWorks.steps.step1.description'),
                  label: t('howItWorks.steps.step1.label'),
                  cardTitle: t('howItWorks.steps.step1.cardTitle'),
                  cardDescription: t('howItWorks.steps.step1.cardDescription'),
                  icon: <Building2 className="text-primary" size={18} />,
                },
                {
                  step: 2,
                  title: t('howItWorks.steps.step2.title'),
                  description: t('howItWorks.steps.step2.description'),
                  label: t('howItWorks.steps.step2.label'),
                  cardTitle: t('howItWorks.steps.step2.cardTitle'),
                  cardDescription: t('howItWorks.steps.step2.cardDescription'),
                  icon: <LinkIcon className="text-primary" size={18} />,
                },
                {
                  step: 3,
                  title: t('howItWorks.steps.step3.title'),
                  description: t('howItWorks.steps.step3.description'),
                  label: t('howItWorks.steps.step3.label'),
                  cardTitle: t('howItWorks.steps.step3.cardTitle'),
                  cardDescription: t('howItWorks.steps.step3.cardDescription'),
                  icon: <GraduationCap className="text-primary" size={18} />,
                },
                {
                  step: 4,
                  title: t('howItWorks.steps.step4.title'),
                  description: t('howItWorks.steps.step4.description'),
                  label: t('howItWorks.steps.step4.label'),
                  cardTitle: t('howItWorks.steps.step4.cardTitle'),
                  cardDescription: t('howItWorks.steps.step4.cardDescription'),
                  icon: <Upload className="text-primary" size={18} />,
                },
                {
                  step: 5,
                  title: t('howItWorks.steps.step5.title'),
                  description: t('howItWorks.steps.step5.description'),
                  label: t('howItWorks.steps.step5.label'),
                  cardTitle: t('howItWorks.steps.step5.cardTitle'),
                  cardDescription: t('howItWorks.steps.step5.cardDescription'),
                  icon: <MessageSquareText className="text-primary" size={18} />,
                },
                {
                  step: 6,
                  title: t('howItWorks.steps.step6.title'),
                  description: t('howItWorks.steps.step6.description'),
                  label: t('howItWorks.steps.step6.label'),
                  cardTitle: t('howItWorks.steps.step6.cardTitle'),
                  cardDescription: t('howItWorks.steps.step6.cardDescription'),
                  icon: <ClipboardCheck className="text-primary" size={18} />,
                },
              ].map((item, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <div
                    key={item.step}
                    className={`flex flex-col md:flex-row md:items-center md:justify-between ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="md:w-5/12">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white font-mono text-xs font-semibold">
                          {item.step}
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 pl-10 md:pl-0">{item.description}</p>
                    </div>

                    <div className="mt-4 md:mt-0 md:w-5/12">
                      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary border border-blue-100">
                            {item.label}
                          </span>
                          {item.icon}
                        </div>
                        <h4 className="mb-1 text-sm font-semibold text-slate-900">
                          {item.cardTitle}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.cardDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <span>{t('howItWorks.getStarted')}</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full border-t border-slate-200 bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Users size={12} />
              <span>{t('testimonials.title')}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('testimonials.subtitle')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t('testimonials.description')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  'Hirelytics has revolutionized our recruitment process. We reduced our time-to-hire by 40% and found consistently better matches.',
                name: 'Sarah Johnson',
                role: 'HR Director',
                company: 'TechCorp',
              },
              {
                quote:
                  'The AI interview workflow is remarkably structured. It evaluates practical problem-solving with transparent benchmark scores.',
                name: 'David Rodriguez',
                role: 'Talent Acquisition Manager',
                company: 'InnovateX',
              },
              {
                quote:
                  'As a candidate, I appreciated getting objective evaluation criteria and real-time audio chat feedback instead of an ATS black hole.',
                name: 'Michael Chen',
                role: 'Senior Software Engineer',
                company: 'Candidate',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)] flex flex-col justify-between"
              >
                <p className="mb-6 text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary font-mono text-xs font-semibold border border-blue-100">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-primary">
              <Sparkles size={12} />
              <span>{t('footer.cta.title')}</span>
            </div>

            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('footer.cta.heading')}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-600 leading-relaxed">
              {t('footer.cta.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <Sparkles size={16} />
                  <span>{common('buttons.getStarted')}</span>
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline">
                  <span>Browse Jobs</span>
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">{t('footer.cta.noCreditCard')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
