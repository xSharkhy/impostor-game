/**
 * Motion animation variants and utilities
 * Using the Motion library for smooth, party-style animations
 */

import type { Transition, Variants } from 'motion/react'

// === TRANSITIONS ===

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 35,
}

export const easeOutExpo: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
}

export const easeOutBack: Transition = {
  duration: 0.4,
  ease: [0.34, 1.56, 0.64, 1],
}

// === FADE VARIANTS ===

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

// === SLIDE VARIANTS ===

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
}

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
}

// === SCALE VARIANTS ===

export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
}

export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springBouncy,
  },
  exit: { scale: 0.8, opacity: 0 },
}

export const bounceIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.4, 0.8, 1.15, 0.95, 1],
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  exit: { scale: 0, opacity: 0 },
}

// === GOOFY ANIMATIONS ===

export const wobble: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [0, -15, 10, -10, 5, -5, 0],
    transition: { duration: 1, ease: 'easeInOut' },
  },
}

export const jelly: Variants = {
  initial: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 0.9, 1.1, 0.95, 1],
    scaleY: [1, 1.1, 0.9, 1.05, 1],
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
}

export const rubberBand: Variants = {
  initial: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
    scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
    transition: { duration: 1, ease: 'easeInOut' },
  },
}

export const tada: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
    rotate: [0, -3, 3, -3, 3, -3, 3, -3, 0],
    transition: { duration: 1, ease: 'easeInOut' },
  },
}

export const swing: Variants = {
  initial: { rotate: 0, transformOrigin: 'top center' },
  animate: {
    rotate: [0, 20, -15, 10, -5, 0],
    transition: { duration: 1, ease: 'easeInOut' },
  },
}

export const heartbeat: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.3, 1, 1.3, 1],
    transition: { duration: 1.5, ease: 'easeInOut', repeat: Infinity },
  },
}

// === PARTY / DRAMATIC VARIANTS ===

export const explosiveReveal: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  animate: {
    scale: [0, 1.3, 1],
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 180,
  },
}

export const shakeAnimation: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
    transition: { duration: 0.5 },
  },
}

export const pulseGlow: Variants = {
  initial: {
    boxShadow: '0 0 0 rgba(168, 85, 247, 0)'
  },
  animate: {
    boxShadow: [
      '0 0 20px rgba(168, 85, 247, 0.4)',
      '0 0 40px rgba(168, 85, 247, 0.6)',
      '0 0 20px rgba(168, 85, 247, 0.4)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const pulseGlowPink: Variants = {
  initial: {
    textShadow: '0 0 0 rgba(255, 45, 106, 0)'
  },
  animate: {
    textShadow: [
      '0 0 20px rgba(255, 45, 106, 0.6)',
      '0 0 40px rgba(255, 45, 106, 0.8)',
      '0 0 20px rgba(255, 45, 106, 0.6)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Round number dramatic entrance
export const roundReveal: Variants = {
  initial: {
    scale: 4,
    opacity: 0,
    rotate: -180,
    filter: 'blur(20px)',
  },
  animate: {
    scale: [4, 1.2, 0.9, 1],
    opacity: 1,
    rotate: [-180, 10, -5, 0],
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 180,
    filter: 'blur(10px)',
    transition: { duration: 0.3 },
  },
}

export const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// === STAGGER CHILDREN ===

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

// === LIST ITEM VARIANTS ===

export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

// === HOVER ANIMATIONS ===

export const hoverScale = {
  scale: 1.02,
  transition: springTransition,
}

export const hoverLift = {
  y: -4,
  transition: springTransition,
}

export const tapScale = {
  scale: 0.98,
}

// === PAGE TRANSITIONS ===

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
}

// === CARD VARIANTS ===

export const cardHover: Variants = {
  initial: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hover: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.1)',
    transition: { duration: 0.3 },
  },
}

// === VICTORY / GAME END ===

export const victoryReveal: Variants = {
  initial: {
    opacity: 0,
    scale: 0.5,
    y: 50,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: 0.2,
    },
  },
}

export const impostorReveal: Variants = {
  initial: {
    opacity: 0,
    scale: 2,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export const wordReveal: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.5,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}
