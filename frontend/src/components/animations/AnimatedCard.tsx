import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export default function AnimatedCard({ children, delay = 0, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
