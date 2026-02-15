import { motion } from 'framer-motion'

type Props = { className?: string; height?: number }

/** Book Harvest logo: hands embracing colorful books. Crops to icon only (no text), enlarged. */
export default function BookHarvestLogo({ className = '', height = 56 }: Props) {
  return (
    <motion.span
      className={`inline-flex items-start justify-center shrink-0 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height }}
    >
      <img
        src="/bookharvest-logo.png"
        alt="Book Harvest"
        className="block w-auto object-contain object-top"
        style={{
          height: `${height * 1.35}px`,
          minHeight: `${height * 1.35}px`,
          maxWidth: 'none',
        }}
      />
    </motion.span>
  )
}
