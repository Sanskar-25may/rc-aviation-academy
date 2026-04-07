import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crosshair, Info, Target, ArrowRight } from 'lucide-react'

const CGCalculator = () => {
  const [inputs, setInputs] = useState({
    rootChord: 25,     // cm
    tipChord: 15,      // cm
    sweep: 5,          // cm (distance tip LE is behind root LE)
    span: 120,         // cm
    staticMargin: 10   // % of MAC
  })

  const [results, setResults] = useState({
    mac: 0,
    macPos: 0,
    cgPercent: 0,
    cgFromRootLE: 0,
    category: ''
  })

  useEffect(() => {
    calculateCG()
  }, [inputs])

  const calculateCG = () => {
    const { rootChord, tipChord, sweep, span, staticMargin } = inputs
    
    // Prevent division by zero or invalid inputs
    if (rootChord <= 0 || span <= 0) return

    const lambda = tipChord / rootChord

    // Mean Aerodynamic Chord (MAC) Calculation
    const mac = (2 * rootChord / 3) * ((1 + lambda + Math.pow(lambda, 2)) / (1 + lambda))

    // Spanwise position of MAC from centerline (y_MAC)
    const semiSpan = span / 2
    const macPos = (span / 6) * ((1 + 2 * lambda) / (1 + lambda))

    // Sweep at MAC (Leading Edge position of MAC relative to Root LE)
    const sweepAtMac = sweep * (macPos / semiSpan)

    // CG Percentage (assuming Aerodynamic Center / Neutral Point is at 25% MAC)
    const cgPercent = 25 - staticMargin

    // Final CG position measured from Root Leading Edge
    const cgFromRootLE = sweepAtMac + (cgPercent / 100) * mac

    // Stability Categorization based on Static Margin
    let category = ''
    if (staticMargin > 15) category = 'Overly Stable (Nose Heavy / Sluggish)'
    else if (staticMargin >= 10) category = 'Trainer / Gentle Sport'
    else if (staticMargin >= 5) category = 'Sport / Standard Aerobatic'
    else if (staticMargin > 0) category = '3D / Highly Agile'
    else category = 'Unstable (Tail Heavy - Unflyable)'

    setResults({
      mac,
      macPos,
      cgPercent,
      cgFromRootLE,
      category
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const getMarginColor = (margin) => {
    if (margin > 15) return 'text-blue-400'
    if (margin >= 10) return 'text-green-400'
    if (margin >= 5) return 'text-yellow-400'
    if (margin > 0) return 'text-orange-400'
    return 'text-red-500'
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="card">
          <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6 flex items-center gap-2">
            <Crosshair className="w-6 h-6" />
            Wing Geometry Inputs
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Root Chord (cm)
                </label>
                <input
                  type="number"
                  value={inputs.rootChord}
                  onChange={(e) => handleInputChange('rootChord', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-aviation-text-dim mt-1">Width at centerline</p>
              </div>
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Tip Chord (cm)
                </label>
                <input
                  type="number"
                  value={inputs.tipChord}
                  onChange={(e) => handleInputChange('tipChord', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-aviation-text-dim mt-1">Width at wingtip</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Full Wingspan (cm)
                </label>
                <input
                  type="number"
                  value={inputs.span}
                  onChange={(e) => handleInputChange('span', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  LE Sweep (cm)
                </label>
                <input
                  type="number"
                  value={inputs.sweep}
                  onChange={(e) => handleInputChange('sweep', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-aviation-text-dim mt-1">Tip LE distance behind Root LE</p>
              </div>
            </div>

            <div className="pt-4 border-t border-aviation-primary/30">
              <label className="block text-aviation-light font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-aviation-accent" />
                Desired Static Margin (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="-5"
                  max="20"
                  step="1"
                  value={inputs.staticMargin}
                  onChange={(e) => handleInputChange('staticMargin', e.target.value)}
                  className="w-full accent-aviation-accent"
                />
                <span className={`font-bold w-12 text-right ${getMarginColor(inputs.staticMargin)}`}>
                  {inputs.staticMargin}%
                </span>
              </div>
              <p className="text-sm text-aviation-text-dim mt-2">
                Distance ahead of Neutral Point (NP). 10-15% is standard for trainers.
              </p>
            </div>
          </div>
        </div>

        {/* Formulas Reference */}
        <div className="formula-box">
          <h3 className="text-aviation-accent font-bold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Engineering Formulas Used
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <p>λ = C_tip / C_root</p>
            <p>MAC = (2/3) * C_root * (1 + λ + λ²) / (1 + λ)</p>
            <p>Y_MAC = (Span/6) * (1 + 2λ) / (1 + λ)</p>
            <p>CG = 25% MAC - Static Margin</p>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="result-box">
          <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6">
            CG Position & Analysis
          </h2>

          <div className="space-y-4">
            {/* The Most Important Measurement */}
            <div className="bg-aviation-dark/50 p-6 rounded-xl border border-aviation-accent/50 mb-6">
              <p className="text-aviation-text-dim text-sm uppercase tracking-wider mb-2">
                Balance Point (From Root Leading Edge)
              </p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-display font-bold text-aviation-success">
                  {results.cgFromRootLE.toFixed(1)}
                </span>
                <span className="text-xl text-aviation-light mb-1">cm</span>
              </div>
              <p className="text-xs text-aviation-text-dim mt-2">
                Measure this distance straight back from the center of the wing where it meets the fuselage.
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Mean Aerodynamic Chord (MAC)</span>
              <span className="text-aviation-light font-bold">
                {results.mac.toFixed(1)} cm
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">MAC Spanwise Position</span>
              <span className="text-aviation-light font-bold">
                {results.macPos.toFixed(1)} cm from center
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">CG Location on MAC</span>
              <span className="text-aviation-light font-bold">
                {results.cgPercent.toFixed(1)}% of MAC
              </span>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-aviation-text-dim">Flight Characteristic</span>
              <span className={`font-bold text-right ${getMarginColor(inputs.staticMargin)}`}>
                {results.category}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Guide / Hints */}
        <div className="card bg-gradient-to-br from-aviation-primary/10 to-transparent">
          <h3 className="text-lg font-display font-bold text-aviation-light mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-aviation-accent" />
            Balancing Tips
          </h3>
          <ul className="space-y-3 text-sm text-aviation-text-dim">
            <li className="flex gap-2">
              <span className="text-aviation-accent">•</span>
              Always balance your plane fully assembled, exactly as it will fly (battery installed, hatch closed).
            </li>
            <li className="flex gap-2">
              <span className="text-aviation-accent">•</span>
              It is generally much safer to be slightly nose-heavy than tail-heavy. A tail-heavy plane is often uncontrollable.
            </li>
            <li className="flex gap-2">
              <span className="text-aviation-accent">•</span>
              Adjust the CG by physically moving the battery forward or backward before adding dead weight (like lead) to the airframe.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default CGCalculator