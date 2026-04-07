import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Info, AlertTriangle } from 'lucide-react'

const StabilityCalculator = () => {
  const [inputs, setInputs] = useState({
    wingSpan: 100,
    wingChord: 15,
    wingArea: 1500,
    tailSpan: 40,
    tailChord: 10,
    tailMoment: 35,
    dihedral: 3,
    sweepAngle: 0
  })

  const [results, setResults] = useState({
    tailVolume: 0,
    lateralStability: '',
    directionalStability: '',
    longitudinalStability: '',
    overallRating: ''
  })

  useEffect(() => {
    calculateStability()
  }, [inputs])

  const calculateStability = () => {
    // Tail volume coefficient
    const tailArea = inputs.tailSpan * inputs.tailChord
    const tailVolume = (tailArea * inputs.tailMoment) / (inputs.wingArea * inputs.wingChord)

    // Stability ratings
    let lateralStability, directionalStability, longitudinalStability

    // Lateral stability (dihedral effect)
    if (inputs.dihedral >= 4) lateralStability = 'Excellent'
    else if (inputs.dihedral >= 2) lateralStability = 'Good'
    else if (inputs.dihedral >= 0.5) lateralStability = 'Marginal'
    else lateralStability = 'Poor'

    // Directional stability (tail volume)
    if (tailVolume >= 0.05) directionalStability = 'Excellent'
    else if (tailVolume >= 0.035) directionalStability = 'Good'
    else if (tailVolume >= 0.02) directionalStability = 'Marginal'
    else directionalStability = 'Poor'

    // Longitudinal stability
    if (tailVolume >= 0.6 && inputs.tailMoment >= 30) longitudinalStability = 'Excellent'
    else if (tailVolume >= 0.4) longitudinalStability = 'Good'
    else if (tailVolume >= 0.25) longitudinalStability = 'Marginal'
    else longitudinalStability = 'Poor'

    // Overall rating
    const ratings = [lateralStability, directionalStability, longitudinalStability]
    const excellentCount = ratings.filter(r => r === 'Excellent').length
    const goodCount = ratings.filter(r => r === 'Good').length
    const poorCount = ratings.filter(r => r === 'Poor').length

    let overallRating
    if (poorCount > 0) overallRating = 'Unstable - Needs Improvement'
    else if (excellentCount >= 2) overallRating = 'Very Stable'
    else if (goodCount >= 2) overallRating = 'Stable'
    else overallRating = 'Marginally Stable'

    setResults({
      tailVolume,
      lateralStability,
      directionalStability,
      longitudinalStability,
      overallRating
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const getStabilityColor = (rating) => {
    if (rating === 'Excellent' || rating === 'Very Stable') return 'text-green-400'
    if (rating === 'Good' || rating === 'Stable') return 'text-blue-400'
    if (rating === 'Marginal' || rating === 'Marginally Stable') return 'text-yellow-400'
    return 'text-red-400'
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
            <Shield className="w-6 h-6" />
            Wing Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Wing Span (cm)
              </label>
              <input
                type="number"
                value={inputs.wingSpan}
                onChange={(e) => handleInputChange('wingSpan', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Wing Chord (cm)
              </label>
              <input
                type="number"
                value={inputs.wingChord}
                onChange={(e) => handleInputChange('wingChord', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Wing Area (cm²)
              </label>
              <input
                type="number"
                value={inputs.wingArea}
                onChange={(e) => handleInputChange('wingArea', e.target.value)}
                className="input-field"
              />
              <p className="text-sm text-aviation-text-dim mt-1">
                Calculated: {inputs.wingSpan * inputs.wingChord} cm²
              </p>
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Dihedral Angle (degrees)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.dihedral}
                onChange={(e) => handleInputChange('dihedral', e.target.value)}
                className="input-field"
              />
              <p className="text-sm text-aviation-text-dim mt-1">
                Wing tip height difference from center
              </p>
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Wing Sweep (degrees)
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.sweepAngle}
                onChange={(e) => handleInputChange('sweepAngle', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6">
            Tail Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Horizontal Tail Span (cm)
              </label>
              <input
                type="number"
                value={inputs.tailSpan}
                onChange={(e) => handleInputChange('tailSpan', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Horizontal Tail Chord (cm)
              </label>
              <input
                type="number"
                value={inputs.tailChord}
                onChange={(e) => handleInputChange('tailChord', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2">
                Tail Moment Arm (cm)
              </label>
              <input
                type="number"
                value={inputs.tailMoment}
                onChange={(e) => handleInputChange('tailMoment', e.target.value)}
                className="input-field"
              />
              <p className="text-sm text-aviation-text-dim mt-1">
                Distance from wing to tail
              </p>
            </div>
          </div>

          <div className="formula-box mt-6">
            <h3 className="text-aviation-accent font-bold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Stability Formulas
            </h3>
            <div className="space-y-2 text-sm">
              <p>Tail Volume = (Tail Area × Moment Arm) / (Wing Area × Chord)</p>
              <p>Optimal Tail Volume: 0.4 - 0.6</p>
              <p>Optimal Dihedral: 2-5 degrees</p>
            </div>
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
            Stability Analysis
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Tail Volume Coefficient</span>
              <span className="text-aviation-accent font-bold text-2xl">
                {results.tailVolume.toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Lateral Stability (Roll)</span>
              <span className={`font-bold text-xl ${getStabilityColor(results.lateralStability)}`}>
                {results.lateralStability}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Directional Stability (Yaw)</span>
              <span className={`font-bold text-xl ${getStabilityColor(results.directionalStability)}`}>
                {results.directionalStability}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Longitudinal Stability (Pitch)</span>
              <span className={`font-bold text-xl ${getStabilityColor(results.longitudinalStability)}`}>
                {results.longitudinalStability}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Overall Assessment</span>
              <span className={`font-bold text-2xl ${getStabilityColor(results.overallRating)}`}>
                {results.overallRating}
              </span>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-6 p-4 bg-aviation-dark/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${getStabilityColor(results.overallRating)}`} />
              <span className="font-bold text-aviation-light">Design Feedback</span>
            </div>
            <p className="text-sm text-aviation-text-dim">
              {results.overallRating === 'Unstable - Needs Improvement' && 'Critical stability issues detected. Increase tail surface area or moment arm.'}
              {results.overallRating === 'Marginally Stable' && 'Aircraft will fly but requires constant pilot correction. Consider enlarging the tail or adding dihedral.'}
              {results.overallRating === 'Stable' && 'Good balance of stability and maneuverability. Suitable for sport flying.'}
              {results.overallRating === 'Very Stable' && 'Excellent trainer characteristics. The aircraft will naturally tend to self-level.'}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card bg-aviation-primary/10">
          <h3 className="text-xl font-display font-bold text-aviation-accent mb-4">
            Optimization Guide
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">Pitch Stability:</span>
                <span className="text-aviation-text-dim"> If poor, increase horizontal tail area or lengthen the fuselage. Target a tail volume coefficient of 0.4 to 0.6.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">Roll Stability:</span>
                <span className="text-aviation-text-dim"> If poor, increase the dihedral angle. Trainers typically use 3-6 degrees.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">Yaw Stability:</span>
                <span className="text-aviation-text-dim"> Ensure the vertical stabilizer is adequately sized. Sweep angle can also positively influence directional stability.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StabilityCalculator