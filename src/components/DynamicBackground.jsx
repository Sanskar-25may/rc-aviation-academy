import React from 'react'
import { motion } from 'framer-motion'

const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-aviation-darker">
      
      {/* Subtle Grain Overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* Primary Blue Aerodynamic Flow */}
      <motion.div
        animate={{
          x: ['0vw', '15vw', '-15vw', '0vw'],
          y: ['0vh', '10vh', '-10vh', '0vh'],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-aviation-primary/20 rounded-full blur-[120px]"
      />

      {/* Secondary Accent (Orange) Flow */}
      <motion.div
        animate={{
          x: ['0vw', '-20vw', '10vw', '0vw'],
          y: ['0vh', '-15vh', '15vh', '0vh'],
          scale: [1, 1.4, 0.8, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-aviation-accent/15 rounded-full blur-[140px]"
      />

      {/* Deep Cyan Core */}
      <motion.div
        animate={{
          x: ['0vw', '10vw', '-10vw', '0vw'],
          y: ['0vh', '-10vh', '10vh', '0vh'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* Final Glassmorphism Frosting Overlay */}
      <div className="absolute inset-0 backdrop-blur-[60px] bg-aviation-darker/40"></div>
    </div>
  )
}

export default DynamicBackground