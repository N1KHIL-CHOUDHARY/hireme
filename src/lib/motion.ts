import type { Variants } from 'framer-motion';

/**
 * transitions-polish Motion Tokens
 * Standard transition curve and durations for the design system
 */
export const MOTION = {
  duration: {
    quick: 0.15, // 150ms
    fast: 0.2, // 200ms
  },
  ease: [0, 0, 0.2, 1] as const, // standard ease-out
  stagger: 0.035, // 35ms per item (30-40ms rule)
};

/**
 * Standard container variant with staggered child entrances (max 6 items)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION.stagger,
      delayChildren: 0.02,
    },
  },
};

/**
 * Standard item entrance variant (fade + 4px rise, transform/opacity only)
 */
export const fadeInRise: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.quick,
      ease: MOTION.ease,
    },
  },
};

/**
 * Dialog / Popover entrance (scale from 0.98 + fade)
 */
export const dialogScaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION.duration.quick,
      ease: MOTION.ease,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: MOTION.duration.quick,
      ease: MOTION.ease,
    },
  },
};
