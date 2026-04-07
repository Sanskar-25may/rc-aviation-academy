import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Fan, Info, AlertTriangle, Gauge, Zap } from 'lucide-react'

const PropellerCalculator = () => {
  const [inputs, setInputs] = useState({
    diameter: 10,      // inches
    pitch: 5,          // inches
    rpm: 10000,        // Revolutions per minute
    weight: 1200,      // grams (for TWR calculation)
    propType: 'sport'  // sport, sf (slow fly), apc
  })

  const [results, setResults] = useState({
    thrustGrams: 0,
    powerWatts: 0,
    pitchSpeedMph: 0,
    pitchSpeedKmh: 0,
    tipSpeedMs: 0,
    machNumber: 0,
    twr: 0,
    category: ''
  })

  useEffect(() => {
    calculatePropeller()
  }, [inputs])

  const calculatePropeller = () => {
    // 1. Constants and Conversions
    const rho = 1.225; // Air density in kg/m^3
    const D_meters = inputs.diameter * 0.0254; // Convert inches to meters
    const n_rps = inputs.rpm / 60; // Convert RPM to RPS (revolutions per second)
    
    // Determine coefficients based on prop type (approximations for RC)
    let Ct = 0.10; // Thrust coefficient
    let Cp = 0.05; // Power coefficient
    
    if (inputs.propType === 'sf') {
      Ct = 0.12; Cp = 0.06; // Slow fly props generate more thrust at low RPM but absorb more power
    } else if (inputs.propType === 'apc') {
      Ct = 0.11; Cp = 0.045; // Thin electric props are highly efficient
    }

    // 2. Static Thrust Calculation
    // T = Ct * rho * n^2 * D^4 (Result is in Newtons)
    const thrustNewtons = Ct * rho * Math.pow(n_rps, 2) * Math.pow(D_meters, 4);
    const thrustGrams = thrustNewtons * 101.9716; // Convert N to grams-force

    // 3. Power Absorption Calculation
    // P = Cp * rho * n^3 * D^5 (Result is in Watts)
    const powerWatts = Cp * rho * Math.pow(n_rps, 3) * Math.pow(D_meters, 5);

    // 4. Pitch Speed
    // V_pitch (mph) = RPM * pitch / 1056
    const pitchSpeedMph = (inputs.rpm * inputs.pitch) / 1056;
    const pitchSpeedKmh = pitchSpeedMph * 1.60934;

    // 5. Tip Speed
    // V_tip = pi * D * n
    const tipSpeedMs = Math.PI * D_meters * n_rps;
    const machNumber = tipSpeedMs / 343; // Speed of sound is approx 343 m/s

    // 6. Thrust-to-Weight Ratio
    const twr = thrustGrams / inputs.weight;

    // 7. Flight Category Based on TWR
    let category = '';
    if (twr < 0.5) category = 'Underpowered (Glider only)';
    else if (twr < 0.8) category = 'Trainer / Scale';
    else if (twr < 1.2) category = 'Sport Aerobatic';
    else if (twr < 1.5) category = 'Advanced Aerobatic / Fast Sport';
    else category = '3D Aerobatic / Unlimited Vertical';

    setResults({
      thrustGrams,
      powerWatts,
      pitchSpeedMph,
      pitchSpeedKmh,
      tipSpeedMs,
      machNumber,
      twr,
      category
    });
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) || value }))
  }

  const getTwrColor = (twr) => {
    if (twr >= 1.5) return 'text-purple-400';
    if (twr >= 1.0) return 'text-green-400';
    if (twr >= 0.7) return 'text-blue-400';
    return 'text-yellow-400';
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
            <Fan className="w-6 h-6" />
            Propeller & Motor Data
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Prop Diameter (in)
                </label>
                <input
                  type="number"
                  value={inputs.diameter}
                  onChange={(e) => handleInputChange('diameter', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Prop Pitch (in)
                </label>
                <input
                  type="number"
                  value={inputs.pitch}
                  onChange={(e) => handleInputChange('pitch', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-aviation-primary-light" />
                  Operating RPM
                </label>
                <input
                  type="number"
                  value={inputs.rpm}
                  onChange={(e) => handleInputChange('rpm', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-aviation-text-dim mt-1">Loaded RPM, not no-load</p>
              </div>
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
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm">
                Propeller Style / Airfoil
              </label>
              <select
                value={inputs.propType}
                onChange={(e) => handleInputChange('propType', e.target.value)}
                className="input-field"
              >
                <option value="sport">Standard Sport (e.g., Master Airscrew)</option>
                <option value="apc">Thin Electric (e.g., APC E-series)</option>
                <option value="sf">Slow Flyer (e.g., APC SF / GWS)</option>
              </select>
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
            <p>Thrust (N) = Ct × ρ × n² × D⁴</p>
            <p>Power (W) = Cp × ρ × n³ × D⁵</p>
            <p>V_pitch (mph) = RPM × pitch / 1056</p>
            <p>V_tip (m/s) = π × D × (RPM/60)</p>
            <p className="text-xs text-aviation-text-dim mt-2 font-sans">
              * Where ρ (rho) = 1.225 kg/m³, n = revs/sec, D = meters
            </p>
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
            Aerodynamic Output
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Static Thrust</span>
              <span className="text-aviation-success font-bold text-2xl">
                {results.thrustGrams.toFixed(0)} g
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim flex items-center gap-2">
                <Zap className="w-4 h-4 text-aviation-warning" />
                Power Absorbed
              </span>
              <span className="text-aviation-warning font-bold text-xl">
                {results.powerWatts.toFixed(0)} W
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Pitch Speed (Theoretical)</span>
              <div className="text-right">
                <div className="text-aviation-light font-bold text-lg">
                  {results.pitchSpeedKmh.toFixed(1)} km/h
                </div>
                <div className="text-aviation-text-dim text-sm">
                  ({results.pitchSpeedMph.toFixed(1)} mph)
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Thrust-to-Weight Ratio</span>
              <span className={`font-bold text-xl ${getTwrColor(results.twr)}`}>
                {results.twr.toFixed(2)} : 1
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Flight Profile</span>
              <span className={`font-bold text-right ml-4 ${getTwrColor(results.twr)}`}>
                {results.category}
              </span>
            </div>
          </div>
        </div>

        {/* Tip Speed Warning Card */}
        <div className={`card ${results.tipSpeedMs > 170 ? 'bg-aviation-danger/10 border-aviation-danger' : 'bg-aviation-darker/80'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${results.tipSpeedMs > 170 ? 'text-aviation-danger' : 'text-aviation-light'}`}>
            <AlertTriangle className="w-5 h-5" />
            Acoustic & Efficiency Analysis
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Blade Tip Speed</span>
              <span className={`font-bold ${results.tipSpeedMs > 170 ? 'text-aviation-danger' : 'text-aviation-light'}`}>
                {results.tipSpeedMs.toFixed(1)} m/s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Mach Number</span>
              <span className={`font-bold ${results.machNumber > 0.6 ? 'text-aviation-danger' : 'text-aviation-light'}`}>
                Mach {results.machNumber.toFixed(2)}
              </span>
            </div>

            {results.tipSpeedMs > 170 ? (
              <p className="text-aviation-danger text-xs mt-2 font-bold">
                WARNING: Tip speed exceeds 170 m/s (Mach 0.5+). The propeller will be extremely loud, highly inefficient, and may suffer from flutter or structural failure. Reduce RPM or use a smaller diameter propeller.
              </p>
            ) : (
              <p className="text-aviation-success text-xs mt-2">
                Tip speed is within the optimal efficiency range. The propeller will operate quietly without severe compressibility drag.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PropellerCalculator