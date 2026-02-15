import { motion } from 'framer-motion'

type Props = { className?: string }

export default function DeliveryTruck({ className = '' }: Props) {
  return (
    <motion.span
      className={`inline-block text-5xl md:text-6xl ${className}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      transition={{ type: 'spring', stiffness: 120 }}
      whileHover={{
        x: 4,
        transition: { duration: 0.2 },
      }}
    >
      🚚
    </motion.span>
  )
}
