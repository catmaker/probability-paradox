import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  children: ReactNode
}

export const Modal = ({ open, children }: ModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/50 backdrop-blur-sm z-10"
      >
        <div className="bg-black/80 backdrop-blur-md border border-cyan-800/60 rounded-2xl max-w-sm w-full mx-4" style={{ padding: '2.5rem 2rem' }}>
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
