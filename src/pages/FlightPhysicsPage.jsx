import React from 'react'
import { motion } from 'framer-motion'
import { Wind } from 'lucide-react'

const FlightPhysicsPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Wind className="w-16 h-16 text-aviation-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-6">
            Flight <span className="text-gradient">Physics</span> Engine
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-2xl mx-auto">
            The interactive force vector visualization engine is currently compiling. Please check back in the next update.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
export default FlightPhysicsPage