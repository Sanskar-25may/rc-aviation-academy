import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Battery, Zap, Clock, ShieldAlert } from 'lucide-react'

const PowerSystemCalculator = () => {
  const [inputs, setInputs] = useState({
    weight: 1200, // grams
    cells: 3,     // S count
    capacity: 2200, // mAh
    cRating: 30,    // C
    kv: 1000,       // RPM/V
    peakCurrent: 35, // Amps
    avgCurrent: 15   // Amps
  })

  const [results, setResults] = useState({
    voltage: 0,
    maxRpm: 0,
    maxDischarge: 0,
    escRating: 0,
    powerWatts: 0,
    powerToWeight: 0,
    flightTime: 0,
    performanceCategory: ''
  })

  useEffect(() => {
    calculatePowerSystem()
  }, [inputs])

  const calculatePowerSystem = () => {
    // Basic electrical calculations
    const voltage = inputs.cells * 3.7
    const maxRpm = inputs.kv * voltage
    const capacityAh = inputs.capacity / 1000
    
    // Limits and ratings
    const maxDischarge = inputs.cRating * capacityAh
    const escRating = inputs.peakCurrent * 1.25
    
    // Power calculations
    const powerWatts = voltage * inputs.peakCurrent
    const weightKg = inputs.weight / 1000
    const powerToWeight = powerWatts / weightKg // Watts per kg
    
    // Time calculation (using 80% rule for LiPo health)
    const flightTime = (capacityAh * 0.8) / inputs.avgCurrent * 60

    // Categorize performance based on Power to Weight (W/kg)
    // Note: 100 W/lb is roughly 220 W/kg
    let category = ''
    if (powerToWeight < 150) category = 'Underpowered (Not Recommended)'
    else if (powerToWeight < 220) category = 'Trainer / Slow Flyer'
    else if (powerToWeight < 350) category = 'Sport Aerobatics'
    else if (powerToWeight < 500) category = 'Advanced / Warbird'
    else category = '3D Aerobatics / Racing'

    setResults({
      voltage,
      maxRpm,
      maxDischarge,
      escRating,
      powerWatts,
      powerToWeight,
      flightTime,
      performanceCategory: category
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          System Parameters
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm">
                Aircraft Weight (g)
              </label>
              <input
                type="number"
                value={inputs.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm">
                Motor Kv (RPM/V)
              </label>
              <input
                type="number"
                value={inputs.kv}
                onChange={(e) => handleInputChange('kv', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-aviation-primary/30 pt-4">
            <div className="col-span-3">
              <h3 className="text-aviation-text-dim font-semibold mb-2 flex items-center gap-2">
                <Battery className="w-4 h-4" /> Battery Specifications
              </h3>
            </div>
            <div>
              <label className="block text-aviation-light text-sm mb-1">Cells (S)</label>
              <input
                type="number"
                value={inputs.cells}
                onChange={(e) => handleInputChange('cells', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-aviation-light text-sm mb-1">Capacity (mAh)</label>
              <input
                type="number"
                value={inputs.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-aviation-light text-sm mb-1">C-Rating</label>
              <input
                type="number"
                value={inputs.cRating}
                onChange={(e) => handleInputChange('cRating', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-aviation-primary/30 pt-4">
            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm">
                Expected Peak Current (A)
              </label>
              <input
                type="number"
                value={inputs.peakCurrent}
                onChange={(e) => handleInputChange('peakCurrent', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm">
                Cruise/Avg Current (A)
              </label>
              <input
                type="number"
                value={inputs.avgCurrent}
                onChange={(e) => handleInputChange('avgCurrent', e.target.value)}
                className="input-field"
              />
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
            System Analysis
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Nominal Voltage</span>
              <span className="text-aviation-light font-bold text-xl">
                {results.voltage.toFixed(1)} V
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Theoretical Top Speed (No Load)</span>
              <span className="text-aviation-light font-bold text-xl">
                {results.maxRpm.toLocaleString()} RPM
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Input Power (Peak)</span>
              <span className="text-aviation-warning font-bold text-xl">
                {results.powerWatts.toFixed(0)} W
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Power Loading</span>
              <span className="text-aviation-success font-bold text-xl">
                {results.powerToWeight.toFixed(0)} W/kg
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Performance Profile</span>
              <span className="text-aviation-light font-bold text-right ml-4">
                {results.performanceCategory}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim flex items-center gap-2">
                <Clock className="w-4 h-4 text-aviation-success" />
                Est. Safe Flight Time
              </span>
              <span className="text-aviation-success font-bold text-xl">
                {results.flightTime.toFixed(1)} mins
              </span>
            </div>
          </div>
        </div>

        {/* Safety Warnings Card */}
        <div className="card bg-aviation-darker/80 border-aviation-danger/50">
          <h3 className="text-lg font-display font-bold text-aviation-danger mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Safety Constraints
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Required ESC Rating</span>
              <span className={`font-bold ${results.escRating > 0 ? 'text-aviation-light' : 'text-aviation-danger'}`}>
                {results.escRating.toFixed(0)} A minimum
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Battery Max Safe Draw</span>
              <span className={`font-bold ${results.maxDischarge >= inputs.peakCurrent ? 'text-aviation-success' : 'text-aviation-danger'}`}>
                {results.maxDischarge.toFixed(0)} A
              </span>
            </div>

            {results.maxDischarge < inputs.peakCurrent && (
              <p className="text-aviation-danger text-xs mt-2 p-2 bg-aviation-danger/10 rounded">
                WARNING: Your peak current draw exceeds the battery's maximum safe discharge rate. This will damage the LiPo and risks fire. Increase battery capacity or C-rating.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PowerSystemCalculator