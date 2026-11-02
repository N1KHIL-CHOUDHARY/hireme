'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { WishlistForm } from '@/components/auth/wishlist-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

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

export default function WishlistPage() {
  const t = useTranslations('Wishlist');

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('title')}
          description={t('description')}
          contentClassName="flex flex-col space-y-4"
        >
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeIn}>
              <WishlistForm />
            </motion.div>
          </motion.div>
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
