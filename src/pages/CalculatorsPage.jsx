import React, { useState } from 'react'
import { motion } from 'framer-motion'
import WingLoadingCalculator from '../components/calculators/WingLoadingCalculator'
import PowerSystemCalculator from '../components/calculators/PowerSystemCalculator'
import CGCalculator from '../components/calculators/CGCalculator'
import PropellerCalculator from '../components/calculators/PropellerCalculator'
import StabilityCalculator from '../components/calculators/StabilityCalculator'
import RangeCalculator from '../components/calculators/RangeCalculator'

const CalculatorsPage = () => {
  const [activeTab, setActiveTab] = useState('wing')

  const calculators = [
    { id: 'wing', label: 'Wing Loading', component: <WingLoadingCalculator /> },
    { id: 'power', label: 'Power System', component: <PowerSystemCalculator /> },
    { id: 'cg', label: 'CG & Balance', component: <CGCalculator /> },
    { id: 'prop', label: 'Propeller', component: <PropellerCalculator /> },
    { id: 'stability', label: 'Stability', component: <StabilityCalculator /> },
    { id: 'range', label: 'Flight Range', component: <RangeCalculator /> },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-4">
            Flight <span className="text-gradient">Calculators</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-3xl mx-auto">
            Professional-grade calculators for designing and optimizing your RC aircraft
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-aviation-primary pb-4">
          {calculators.map((calc) => (
            <button
              key={calc.id}
              onClick={() => setActiveTab(calc.id)}
              className={`tab-button ${activeTab === calc.id ? 'active' : ''}`}
            >
              {calc.label}
            </button>
          ))}
        </div>

        {/* Calculator Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {calculators.find(calc => calc.id === activeTab)?.component}
        </motion.div>
      </div>
    </div>
  )
}

export default CalculatorsPage
