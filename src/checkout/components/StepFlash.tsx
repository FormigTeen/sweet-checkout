import { AnimatePresence, motion } from 'framer-motion'
import { Check } from './Icons'

// Recompensa rápida ao concluir cada etapa: um selo verde que pulsa e some.
export function StepFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.span
            className="flash-badge"
            initial={{ scale: 0.3, rotate: -12 }}
            animate={{ scale: [0.3, 1.15, 1], rotate: 0 }}
            transition={{ duration: 0.45, times: [0, 0.6, 1] }}
          >
            <Check width={40} height={40} />
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
