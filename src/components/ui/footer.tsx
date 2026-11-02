'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-14 text-slate-600">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/hirelytics-logo.svg"
                alt="Hirelytics"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Hirelytics
              </span>
            </Link>
            <p className="max-w-sm text-sm text-slate-600 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-900">
              {t('footer.platform.title')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/#features" className="hover:text-primary transition-colors">
                  {t('footer.platform.features')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                  {t('footer.platform.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-primary transition-colors">
                  {t('footer.platform.wishlist')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Portals */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-900">
              Access
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/login/candidate" className="hover:text-primary transition-colors">
                  {t('footer.forCandidates.login')}
                </Link>
              </li>
              <li>
                <Link href="/register/candidate" className="hover:text-primary transition-colors">
                  {t('footer.forCandidates.register')}
                </Link>
              </li>
              <li>
                <Link href="/login/recruiter" className="hover:text-primary transition-colors">
                  {t('footer.forRecruiters.login')}
                </Link>
              </li>
              <li>
                <Link href="/register/recruiter" className="hover:text-primary transition-colors">
                  {t('footer.forRecruiters.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-900">
              {t('footer.company.title')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('footer.company.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t('footer.company.contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  {t('footer.company.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  {t('footer.company.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>

          <div className="flex items-center space-x-4">
            <Link
              href="https://www.linkedin.com/in/sumanta-kabiraj/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
            <Link
              href="https://x.com/infysumanta"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-primary transition-colors"
              aria-label="Twitter / X"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
