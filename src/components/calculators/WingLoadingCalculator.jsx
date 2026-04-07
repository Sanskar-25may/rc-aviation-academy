import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Info, TrendingUp } from 'lucide-react'

const WingLoadingCalculator = () => {
  const [inputs, setInputs] = useState({
    weight: 800,
    span: 100,
    chord: 15,
    airfoilType: 1.1
  })

  const [results, setResults] = useState({
    area: 0,
    loading: 0,
    stallSpeed: 0,
    category: '',
    safeSpeed: 0
  })

  useEffect(() => {
    calculateWingLoading()
  }, [inputs])

  const calculateWingLoading = () => {
    const area = inputs.span * inputs.chord
    const areaDm = area / 100
    const loading = inputs.weight / areaDm

    // Stall speed calculation
    const loadingPa = loading * 10
    const clMax = 1.4 / inputs.airfoilType
    const rho = 1.225
    const stallSpeed = Math.sqrt((2 * loadingPa) / (rho * clMax))
    const safeSpeed = stallSpeed * 1.5

    let category
    if (loading < 40) category = 'Slow Flyer/Trainer'
    else if (loading < 60) category = 'Sport Flyer'
    else if (loading < 90) category = 'Fast Sport/Scale'
    else category = 'High-Speed/Aerobatic'

    setResults({
      area,
      loading,
      stallSpeed,
      category,
      safeSpeed
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  // Generate performance chart data
  const generateChartData = () => {
    const data = []
    for (let speed = 5; speed <= 30; speed += 0.5) {
      const lift = 0.5 * 1.225 * speed * speed * (results.area / 10000) * (1.4 / inputs.airfoilType)
      data.push({
        speed: speed.toFixed(1),
        lift: lift.toFixed(2),
        weight: inputs.weight / 1000
      })
    }
    return data
  }

  const getLoadingColor = (loading) => {
    if (loading < 40) return 'text-green-400'
    if (loading < 60) return 'text-blue-400'
    if (loading < 90) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6">
          Wing Configuration
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-aviation-light font-semibold mb-2">
              Aircraft Weight (grams)
            </label>
            <input
              type="number"
              value={inputs.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="input-field"
            />
            <p className="text-sm text-aviation-text-dim mt-1">
              Total ready-to-fly weight including battery
            </p>
          </div>

          <div>
            <label className="block text-aviation-light font-semibold mb-2">
              Wing Span (cm)
            </label>
            <input
              type="number"
              value={inputs.span}
              onChange={(e) => handleInputChange('span', e.target.value)}
              className="input-field"
            />
            <p className="text-sm text-aviation-text-dim mt-1">
              Tip-to-tip wing measurement
            </p>
          </div>

          <div>
            <label className="block text-aviation-light font-semibold mb-2">
              Average Chord (cm)
            </label>
            <input
              type="number"
              value={inputs.chord}
              onChange={(e) => handleInputChange('chord', e.target.value)}
              className="input-field"
            />
            <p className="text-sm text-aviation-text-dim mt-1">
              Front-to-back wing width
            </p>
          </div>

          <div>
            <label className="block text-aviation-light font-semibold mb-2">
              Airfoil Type
            </label>
            <select
              value={inputs.airfoilType}
              onChange={(e) => handleInputChange('airfoilType', e.target.value)}
              className="input-field"
            >
              <option value="1.0">Flat Bottom (High Lift)</option>
              <option value="1.1">Semi-Symmetrical</option>
              <option value="1.2">Symmetrical</option>
              <option value="0.9">High-Lift Special</option>
            </select>
          </div>
        </div>

        {/* Formula Display */}
        <div className="formula-box mt-6">
          <h3 className="text-aviation-accent font-bold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Formulas Used
          </h3>
          <div className="space-y-2 text-sm">
            <p>Wing Area = Span × Chord</p>
            <p>Wing Loading = Weight / Area</p>
            <p>V_stall = √(2 × WL / (ρ × CL_max))</p>
            <p className="text-aviation-text-dim text-xs mt-3">
              Where: ρ = 1.225 kg/m³, CL_max varies by airfoil
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
        {/* Results Card */}
        <div className="result-box">
          <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6">
            Performance Results
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Wing Area</span>
              <span className="text-aviation-success font-bold text-xl">
                {results.area.toFixed(0)} cm² ({(results.area / 100).toFixed(2)} dm²)
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Wing Loading</span>
              <span className={`font-bold text-2xl ${getLoadingColor(results.loading)}`}>
                {results.loading.toFixed(1)} g/dm²
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Flight Category</span>
              <span className="text-aviation-light font-bold">
                {results.category}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Stall Speed</span>
              <span className="text-aviation-warning font-bold text-xl">
                {results.stallSpeed.toFixed(1)} m/s ({(results.stallSpeed * 3.6).toFixed(1)} km/h)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Safe Flight Speed</span>
              <span className="text-aviation-success font-bold text-xl">
                {results.safeSpeed.toFixed(1)} m/s ({(results.safeSpeed * 3.6).toFixed(1)} km/h)
              </span>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-6 p-4 bg-aviation-dark/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-aviation-accent" />
              <span className="font-bold text-aviation-light">Performance Analysis</span>
            </div>
            <p className="text-sm text-aviation-text-dim">
              {results.loading < 40 && 'Excellent for beginners. Very stable and forgiving flight characteristics. Slow landing speed.'}
              {results.loading >= 40 && results.loading < 60 && 'Good balance of stability and performance. Suitable for sport flying and basic aerobatics.'}
              {results.loading >= 60 && results.loading < 90 && 'Higher performance. Requires more skill. Faster flight speeds and better wind penetration.'}
              {results.loading >= 90 && 'High-speed configuration. Advanced pilots only. Requires significant experience and fast reactions.'}
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card">
          <h3 className="text-xl font-display font-bold text-aviation-light mb-4">
            Lift vs Speed
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={generateChartData()}>
              <defs>
                <linearGradient id="colorLift" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e6bb8" opacity={0.2} />
              <XAxis 
                dataKey="speed" 
                stroke="#a8b2d1" 
                label={{ value: 'Speed (m/s)', position: 'insideBottom', offset: -5, fill: '#a8b2d1' }}
              />
              <YAxis 
                stroke="#a8b2d1"
                label={{ value: 'Force (kg)', angle: -90, position: 'insideLeft', fill: '#a8b2d1' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0d1b2a', 
                  border: '1px solid #1e6bb8',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="lift" 
                stroke="#ff6b35" 
                fillOpacity={1} 
                fill="url(#colorLift)" 
                name="Lift"
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#4ade80" 
                strokeWidth={2}
                dot={false}
                name="Weight"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-aviation-text-dim mt-2 text-center">
            Intersection point shows where lift equals weight (level flight)
          </p>
        </div>

        {/* Guidelines */}
        <div className="card bg-aviation-primary/10">
          <h3 className="text-xl font-display font-bold text-aviation-accent mb-4">
            Wing Loading Guidelines
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">20-40 g/dm²:</span>
                <span className="text-aviation-text-dim"> Trainers, slow flyers. Very stable, easy to fly.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">40-60 g/dm²:</span>
                <span className="text-aviation-text-dim"> Sport planes. Good balance of performance and stability.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">60-90 g/dm²:</span>
                <span className="text-aviation-text-dim"> Fast sport, scale. Better wind penetration, higher speeds.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0"></div>
              <div>
                <span className="text-aviation-light font-semibold">90+ g/dm²:</span>
                <span className="text-aviation-text-dim"> High-speed, aerobatic. Expert pilots only.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WingLoadingCalculator
