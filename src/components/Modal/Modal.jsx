import React from "react"
import { motion } from "framer-motion"

export default function Modal({ isVisible, onClose, children, action, actionMsg, cancelMsg }) {
  if (!isVisible) return null
  const handleClose = (e) => {
    if (e.target.id === 'wrapper') onClose()
  }
  return (
    <div className="fixed inset-0 bg-gray bg-opacity-50 backdrop-blur-xs flex justify-center items-center" id="wrapper" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-[450px] h-fit bg-background rounded-xl max-h-[90vh] overflow-y-auto">
          {children}
          <div className="flex items-center justify-center px-4 pb-6 gap-2">
            <button 
              className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-foreground text-red-400 ease duration-150"
              onClick={action}>
                {actionMsg}
            </button>
            <button 
              className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray/80 ease duration-150"
              onClick={() => onClose()}>{cancelMsg}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}