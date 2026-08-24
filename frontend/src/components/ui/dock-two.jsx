import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const DockIconButton = React.forwardRef(
  ({ icon: Icon, label, onClick, isActive, className }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        animate={{ 
          scale: isActive ? 1.15 : 1,
          y: isActive ? -4 : 0
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative group p-3 rounded-xl flex flex-col items-center justify-center gap-1 flex-1",
          className
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeDockBubble"
            className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10 shadow-sm border border-emerald-100/50"
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
          />
        )}
        
        {/* We keep a subtle hover background for non-active items */}
        {!isActive && (
          <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/40 rounded-2xl -z-10 transition-colors duration-300" />
        )}

        <Icon className={cn(
          "w-6 h-6 relative z-10 transition-colors duration-300",
          isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
        )} />
        
        <span className={cn(
          "absolute -top-12 left-1/2 -translate-x-1/2",
          "px-3 py-1.5 rounded-lg text-xs font-bold shadow-md",
          "bg-white text-emerald-800 border border-emerald-100",
          "opacity-0 group-hover:opacity-100",
          "transition-all duration-300 pointer-events-none",
          "scale-90 group-hover:scale-100 origin-bottom"
        )}>
          {label}
        </span>
      </motion.button>
    )
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef(
  ({ items, className }, ref) => {
    return (
      <div ref={ref} className={cn("w-full bg-white/80 backdrop-blur-2xl border-t border-emerald-100/60 shadow-[0_-8px_30px_rgba(16,185,129,0.06)]", className)}>
        <div className="max-w-md mx-auto w-full h-16 flex items-center justify-around px-4 relative">
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock }
