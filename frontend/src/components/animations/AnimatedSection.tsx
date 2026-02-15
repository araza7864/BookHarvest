import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

type Props = {
  children: React.ReactNode
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn'
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article'
}

const variants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
}

export default function AnimatedSection({
  children,
  variant = 'fadeInUp',
  delay = 0,
  className = '',
  as: As = 'div',
}: Props) {
  const MotionEl = As === 'section' ? motion.section : As === 'article' ? motion.article : motion.div
  return (
    <MotionEl
      variants={variants[variant]}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </MotionEl>
  )
}
