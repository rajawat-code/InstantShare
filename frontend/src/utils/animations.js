/**
 * InstantShare - Studio Framer Motion Variants
 * Clean, subtle, tactile animations (200-450ms, ease-out, zero jank).
 * Respects prefers-reduced-motion automatically.
 */

// Staggered Container for section elements
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
      ease: [0.16, 1, 0.3, 1],
    },
  },
});

// Staggered words for big editorial headline
export const wordSlideUp = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Fade up transition for cards and sections
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

// Subtle scale in for badges and stamps
export const stampPop = {
  hidden: { scale: 0.85, opacity: 0, rotate: -6 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      duration: 0.35,
    },
  },
};

// Wishlist heart pop
export const heartPop = {
  idle: { scale: 1 },
  popped: {
    scale: [1, 1.35, 0.95, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Hand-drawn SVG marker stroke draw
export const strokeDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1],
      delay: 0.25,
    },
  },
};

// Rotating stamp animation for Neighbor Trust badge
export const rotatingSeal = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 20,
      ease: 'linear',
    },
  },
};

// Card hover physics with hard shadow lift
export const cardHover = {
  rest: {
    y: 0,
    x: 0,
    boxShadow: '3px 3px 0px #14281D',
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  hover: {
    y: -3,
    x: -3,
    boxShadow: '6px 6px 0px #14281D',
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};
