import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

export const bounceSoft: Variants = {
  visible: {
    y: [0, -8, 0],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
}

export const wiggle: Variants = {
  visible: {
    rotate: [0, -5, 5, -5, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
}

export const float: Variants = {
  visible: {
    y: [0, -12, 0],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const staggerItem = fadeInUp
