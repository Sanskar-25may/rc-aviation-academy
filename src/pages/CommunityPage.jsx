import React from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Award } from 'lucide-react'

const CommunityPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Users className="w-16 h-16 text-aviation-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-6">
            Pilot <span className="text-gradient">Community</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-2xl mx-auto mb-12">
            The community forum, project gallery, and mentor matching systems are currently under development for Phase 2 of the platform.
          </p>
          <div className="card max-w-lg mx-auto bg-aviation-primary/10 border-aviation-primary border border-dashed">
            <MessageSquare className="w-8 h-8 text-aviation-primary-light mx-auto mb-4" />
            <h3 className="text-xl font-bold text-aviation-light mb-2">Coming Soon</h3>
            <p className="text-sm text-aviation-text-dim">Stay tuned for the launch of our global builder network.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
export default CommunityPage