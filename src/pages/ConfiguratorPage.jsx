import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Battery, Settings, AlertTriangle, CheckCircle2, ShieldCheck, Flame } from 'lucide-react'

// --- MOCK DATABASE ---
const MOTORS = [
  { id: 'm1', name: 'Micro 1806 2300Kv', maxAmps: 12, minCells: 2, maxCells: 3, weight: 18 },
  { id: 'm2', name: 'Parkflyer 2212 1400Kv', maxAmps: 25, minCells: 2, maxCells: 3, weight: 50 },
  { id: 'm3', name: 'Sport 2814 1000Kv', maxAmps: 40, minCells: 3, maxCells: 4, weight: 100 },
  { id: 'm4', name: 'Beast 3536 850Kv', maxAmps: 60, minCells: 3, maxCells: 5, weight: 150 },
]

const ESCS = [
  { id: 'e1', name: '15A Micro ESC', amps: 15, maxCells: 3 },
  { id: 'e2', name: '30A Standard ESC', amps: 30, maxCells: 4 },
  { id: 'e3', name: '50A Sport ESC', amps: 50, maxCells: 6 },
  { id: 'e4', name: '80A Heavy Duty ESC', amps: 80, maxCells: 6 },
]

const BATTERIES = [
  { id: 'b1', name: '850mAh 2S 20C', cells: 2, capacity: 850, cRating: 20 },
  { id: 'b2', name: '1500mAh 3S 30C', cells: 3, capacity: 1500, cRating: 30 },
  { id: 'b3', name: '2200mAh 3S 40C', cells: 3, capacity: 2200, cRating: 40 },
  { id: 'b4', name: '3300mAh 4S 50C', cells: 4, capacity: 3300, cRating: 50 },
]

const ConfiguratorPage = () => {
  const [selectedMotor, setSelectedMotor] = useState(MOTORS[1].id)
  const [selectedESC, setSelectedESC] = useState(ESCS[1].id)
  const [selectedBattery, setSelectedBattery] = useState(BATTERIES[2].id)

  // --- COMPATIBILITY ENGINE ---
  const analysis = useMemo(() => {
    const motor = MOTORS.find(m => m.id === selectedMotor)
    const esc = ESCS.find(e => e.id === selectedESC)
    const battery = BATTERIES.find(b => b.id === selectedBattery)

    const errors = []
    const warnings = []

    // 1. Check ESC Amp Rating (Needs ~20% headroom over motor max)
    const requiredEscAmps = motor.maxAmps * 1.2
    if (esc.amps < motor.maxAmps) {
      errors.push(`CRITICAL: The ESC (${esc.amps}A) will burn out. The motor pulls up to ${motor.maxAmps}A.`)
    } else if (esc.amps < requiredEscAmps) {
      warnings.push(`Warning: ESC (${esc.amps}A) barely covers the motor's peak draw (${motor.maxAmps}A). Recommend upgrading for safety headroom.`)
    }

    // 2. Check Battery Discharge Rate (Continuous Amps = Ah * C-Rating)
    const batteryContinuousAmps = (battery.capacity / 1000) * battery.cRating
    if (batteryContinuousAmps < motor.maxAmps) {
      errors.push(`CRITICAL: Battery can only provide ${batteryContinuousAmps.toFixed(1)}A safely. The motor will draw ${motor.maxAmps}A, causing the battery to puff, overheat, or ignite.`)
    }

    // 3. Check Voltage Compatibility (Cell Count)
    if (battery.cells > motor.maxCells) {
      errors.push(`CRITICAL: The ${battery.cells}S battery voltage is too high for this motor (Max ${motor.maxCells}S). Motor will overheat and fail.`)
    } else if (battery.cells < motor.minCells) {
      warnings.push(`Warning: The ${battery.cells}S battery is below the motor's optimal range. The plane will be severely underpowered.`)
    }

    if (battery.cells > esc.maxCells) {
      errors.push(`CRITICAL: The ${battery.cells}S battery exceeds the ESC's maximum voltage rating (${esc.maxCells}S). The ESC will short circuit.`)
    }

    const isSafe = errors.length === 0
    const isPerfect = isSafe && warnings.length === 0

    return { motor, esc, battery, batteryContinuousAmps, errors, warnings, isSafe, isPerfect }
  }, [selectedMotor, selectedESC, selectedBattery])

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-4">
            Component <span className="text-gradient">Configurator</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-3xl mx-auto">
            Mix and match electronics safely. Our engine checks for voltage mismatches, amp limits, and discharge rates before you buy.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Motor Selection */}
            <div className="card">
              <h3 className="text-aviation-light font-display font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-aviation-accent" />
                Select Brushless Motor
              </h3>
              <select 
                value={selectedMotor} 
                onChange={(e) => setSelectedMotor(e.target.value)}
                className="input-field mb-2"
              >
                {MOTORS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="flex gap-4 text-sm text-aviation-text-dim">
                <span>Max Draw: <strong className="text-aviation-warning">{analysis.motor.maxAmps}A</strong></span>
                <span>Supported: <strong>{analysis.motor.minCells}-{analysis.motor.maxCells}S</strong></span>
              </div>
            </div>

            {/* ESC Selection */}
            <div className="card">
              <h3 className="text-aviation-light font-display font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-aviation-primary-light" />
                Select Speed Controller (ESC)
              </h3>
              <select 
                value={selectedESC} 
                onChange={(e) => setSelectedESC(e.target.value)}
                className="input-field mb-2"
              >
                {ESCS.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <div className="flex gap-4 text-sm text-aviation-text-dim">
                <span>Rated Limit: <strong className="text-aviation-primary-light">{analysis.esc.amps}A</strong></span>
                <span>Max Voltage: <strong>{analysis.esc.maxCells}S</strong></span>
              </div>
            </div>

            {/* Battery Selection */}
            <div className="card">
              <h3 className="text-aviation-light font-display font-bold mb-4 flex items-center gap-2">
                <Battery className="w-5 h-5 text-aviation-success" />
                Select LiPo Battery
              </h3>
              <select 
                value={selectedBattery} 
                onChange={(e) => setSelectedBattery(e.target.value)}
                className="input-field mb-2"
              >
                {BATTERIES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="flex gap-4 text-sm text-aviation-text-dim">
                <span>Voltage: <strong>{analysis.battery.cells}S ({(analysis.battery.cells * 3.7).toFixed(1)}V)</strong></span>
                <span>Safe Output: <strong className="text-aviation-success">{analysis.batteryContinuousAmps.toFixed(0)}A</strong></span>
              </div>
            </div>
          </motion.div>

          {/* Analysis & Results Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col h-full"
          >
            <div className={`card flex-grow flex flex-col ${analysis.isPerfect ? 'border-aviation-success/50' : analysis.isSafe ? 'border-aviation-warning/50' : 'border-aviation-danger/50'}`}>
              
              <h3 className="text-2xl font-display font-bold text-aviation-light mb-6 border-b border-aviation-primary/30 pb-4">
                System Compatibility Analysis
              </h3>

              <div className="flex-grow space-y-4">
                <AnimatePresence mode="popLayout">
                  {/* Critical Errors */}
                  {analysis.errors.map((error, idx) => (
                    <motion.div 
                      key={`err-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-aviation-danger/10 border border-aviation-danger rounded-lg p-4 flex gap-3 text-aviation-danger"
                    >
                      <Flame className="w-6 h-6 flex-shrink-0" />
                      <p className="font-semibold text-sm leading-relaxed">{error}</p>
                    </motion.div>
                  ))}

                  {/* Warnings */}
                  {analysis.warnings.map((warning, idx) => (
                    <motion.div 
                      key={`warn-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-aviation-warning/10 border border-aviation-warning/50 rounded-lg p-4 flex gap-3 text-aviation-warning"
                    >
                      <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                      <p className="font-semibold text-sm leading-relaxed">{warning}</p>
                    </motion.div>
                  ))}

                  {/* Perfect Match */}
                  {analysis.isPerfect && (
                    <motion.div 
                      key="perfect"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-aviation-success/10 border border-aviation-success rounded-lg p-6 text-center"
                    >
                      <ShieldCheck className="w-16 h-16 text-aviation-success mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-aviation-success mb-2">Systems Nominal</h4>
                      <p className="text-aviation-text-dim text-sm">
                        This combination is perfectly balanced. The ESC has adequate headroom, the battery can safely supply the required current, and the voltages align.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Footer */}
              <div className="mt-8 pt-4 border-t border-aviation-primary/30 flex items-center justify-between">
                <span className="text-aviation-text-dim font-mono text-sm uppercase tracking-wider">Flight Readiness</span>
                {analysis.isSafe ? (
                  <span className="flex items-center gap-2 text-aviation-success font-bold text-lg">
                    <CheckCircle2 className="w-6 h-6" /> CLEARED FOR BUILD
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-aviation-danger font-bold text-lg">
                    <AlertTriangle className="w-6 h-6" /> GROUNDED
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}

export default ConfiguratorPage