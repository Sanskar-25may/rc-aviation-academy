import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wind, TrendingUp, Maximize, AlertCircle, Info, Target } from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts'

// Standard NACA Airfoil Database for RC Applications
const AIRFOIL_DATABASE = {
  '0012': { 
    name: 'Symmetrical (NACA 0012)', 
    m: 0.00, p: 0.0, t: 0.12, 
    desc: 'Zero camber. Generates equal lift inverted. Standard for 3D and aerobatic aircraft.',
    bestFor: '3D Aerobatics, Fast Sport',
    stallAngle: 12
  },
  '2412': { 
    name: 'Semi-Symmetrical (NACA 2412)', 
    m: 0.02, p: 0.4, t: 0.12, 
    desc: 'Slight camber. Excellent balance of upright lift and inverted performance. Used on Cessna 152.',
    bestFor: 'Sport Flyers, Scale Models',
    stallAngle: 14
  },
  '4412': { 
    name: 'High Lift / Flat Bottom (NACA 4412)', 
    m: 0.04, p: 0.4, t: 0.12, 
    desc: 'High camber. Generates massive lift at low speeds. Very stable and forgiving stall characteristics.',
    bestFor: 'Trainers, Heavy Lifters, Cargo',
    stallAngle: 15
  },
  '6409': { 
    name: 'High Performance Glider (NACA 6409)', 
    m: 0.06, p: 0.4, t: 0.09, 
    desc: 'Very thin, highly cambered. Extremely high Lift-to-Drag ratio at low Reynolds numbers.',
    bestFor: 'Thermal Gliders, Endurance UAVs',
    stallAngle: 11
  }
}

const AirfoilAnalyzerPage = () => {
  const [activeProfile, setActiveProfile] = useState('4412')
  const [activeChart, setActiveChart] = useState('lift')

  const airfoil = AIRFOIL_DATABASE[activeProfile]

  // --- NACA 4-DIGIT MATHEMATICAL GENERATOR ---
  // Calculates exact SVG coordinates for the airfoil shape
  const airfoilPath = useMemo(() => {
    const { m, p, t } = airfoil
    const points = 100
    let upperCoords = []
    let lowerCoords = []

    for (let i = 0; i <= points; i++) {
      // Cosine spacing puts more resolution near the leading edge
      const beta = (i / points) * Math.PI
      const x = 0.5 * (1 - Math.cos(beta))

      // Thickness distribution formula
      const yt = 5 * t * (
        0.2969 * Math.sqrt(x) - 
        0.1260 * x - 
        0.3516 * Math.pow(x, 2) + 
        0.2843 * Math.pow(x, 3) - 
        0.1015 * Math.pow(x, 4)
      )

      // Camber line formula
      let yc = 0
      let dyc_dx = 0
      if (p > 0) {
        if (x >= 0 && x <= p) {
          yc = (m / Math.pow(p, 2)) * (2 * p * x - Math.pow(x, 2))
          dyc_dx = (2 * m / Math.pow(p, 2)) * (p - x)
        } else {
          yc = (m / Math.pow(1 - p, 2)) * ((1 - 2 * p) + 2 * p * x - Math.pow(x, 2))
          dyc_dx = (2 * m / Math.pow(1 - p, 2)) * (p - x)
        }
      }

      const theta = Math.atan(dyc_dx)

      // Upper and lower surface coordinates
      const xu = x - yt * Math.sin(theta)
      const yu = yc + yt * Math.cos(theta)
      const xl = x + yt * Math.sin(theta)
      const yl = yc - yt * Math.cos(theta)

      upperCoords.push(`${xu * 100},${-yu * 100}`) // SVG Y is inverted
      lowerCoords.unshift(`${xl * 100},${-yl * 100}`)
    }

    return `M ${upperCoords.join(' L ')} L ${lowerCoords.join(' L ')} Z`
  }, [airfoil])

  // --- AERODYNAMIC POLAR CALCULATOR ---
  // Generates theoretical flight characteristics
  const chartData = useMemo(() => {
    const { m, t, stallAngle } = airfoil
    const data = []
    
    // Theoretical zero-lift angle approximation
    const alphaZeroLift = -m * 100 * 1.5 
    
    for (let alpha = -5; alpha <= 20; alpha += 1) {
      // 1. Lift Coefficient (Cl) Calculation
      // 2*pi per radian is theoretical max, ~0.11 per degree
      let cl = 0.11 * (alpha - alphaZeroLift)
      
      // Post-stall dropoff simulation
      if (alpha > stallAngle) {
        const stallSeverity = alpha - stallAngle
        cl = cl - (0.05 * Math.pow(stallSeverity, 2))
      }

      // 2. Drag Coefficient (Cd) Calculation
      // Profile drag + induced drag approximation for 2D section
      const cd0 = 0.005 + (t * 0.02) // Base profile drag scales with thickness
      const clOpt = m * 10 // Optimal Cl is near camber peak
      const cd = cd0 + 0.006 * Math.pow(cl - clOpt, 2)

      // 3. Efficiency (L/D Ratio)
      const lod = cl > 0 ? cl / cd : 0

      data.push({
        alpha,
        Cl: Number(cl.toFixed(3)),
        Cd: Number(cd.toFixed(4)),
        LOD: Number(lod.toFixed(1))
      })
    }
    return data
  }, [airfoil])

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
            Airfoil <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-3xl mx-auto">
            Analyze lift profiles, drag polars, and stall characteristics using mathematical NACA 4-digit generation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Controls & Information Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="card">
              <h3 className="font-display font-bold text-aviation-accent mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" /> Select Profile
              </h3>
              <div className="space-y-3">
                {Object.keys(AIRFOIL_DATABASE).map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveProfile(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeProfile === key 
                        ? 'bg-aviation-primary text-white font-bold shadow-[0_0_15px_rgba(30,107,184,0.5)]' 
                        : 'bg-aviation-dark/50 text-aviation-text-dim hover:bg-aviation-primary/30 hover:text-aviation-light'
                    }`}
                  >
                    {AIRFOIL_DATABASE[key].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-aviation-primary/10 to-transparent">
              <h3 className="text-xl font-display font-bold text-aviation-light mb-4">
                Aerodynamic Profile
              </h3>
              <p className="text-aviation-text-dim text-sm mb-6 leading-relaxed">
                {airfoil.desc}
              </p>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-aviation-primary/30">
                  <span className="text-aviation-text-dim">Optimal Use</span>
                  <span className="text-aviation-light font-bold text-right ml-2">{airfoil.bestFor}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-aviation-primary/30">
                  <span className="text-aviation-text-dim">Max Thickness</span>
                  <span className="text-aviation-light font-bold">{(airfoil.t * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-aviation-primary/30">
                  <span className="text-aviation-text-dim">Max Camber</span>
                  <span className="text-aviation-light font-bold">{(airfoil.m * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-aviation-primary/30">
                  <span className="text-aviation-text-dim">Critical Angle (Stall)</span>
                  <span className="text-aviation-danger font-bold">+{airfoil.stallAngle}°</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visualization & Charts */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* SVG Airfoil Renderer */}
            <div className="card relative overflow-hidden group">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-aviation-primary-light">
                <Maximize className="w-5 h-5" />
                <span className="font-display font-bold text-sm tracking-wider">CROSS-SECTION RENDER</span>
              </div>
              
              <div className="w-full h-48 flex items-center justify-center p-8 mt-4">
                {/* SVG Coordinate System setup to match standard airfoil plotting */}
                <svg viewBox="-5 -25 110 50" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,107,53,0.3)]">
                  {/* Grid Lines */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#1e6bb8" strokeWidth="0.2" strokeDasharray="2,2" opacity="0.5" />
                  <line x1="0" y1="-20" x2="0" y2="20" stroke="#1e6bb8" strokeWidth="0.2" opacity="0.5" />
                  
                  {/* The Airfoil Path */}
                  <path 
                    d={airfoilPath} 
                    fill="url(#airfoil-gradient)" 
                    stroke="#ff6b35" 
                    strokeWidth="0.5" 
                  />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="airfoil-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e6bb8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0a4d8f" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Airflow Visual Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-fly-across"></div>
                <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-fly-across" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            {/* Interactive Data Charts */}
            <div className="card">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-display font-bold text-aviation-light flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-aviation-success" />
                  Performance Polars
                </h3>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveChart('lift')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeChart === 'lift' ? 'bg-aviation-primary text-white' : 'bg-aviation-dark text-aviation-text-dim hover:text-aviation-light'}`}
                  >
                    Lift (Cl) vs Angle
                  </button>
                  <button 
                    onClick={() => setActiveChart('drag')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeChart === 'drag' ? 'bg-aviation-danger/20 text-aviation-danger border border-aviation-danger' : 'bg-aviation-dark text-aviation-text-dim hover:text-aviation-light'}`}
                  >
                    Drag Polar
                  </button>
                  <button 
                    onClick={() => setActiveChart('efficiency')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeChart === 'efficiency' ? 'bg-aviation-success/20 text-aviation-success border border-aviation-success' : 'bg-aviation-dark text-aviation-text-dim hover:text-aviation-light'}`}
                  >
                    Efficiency (L/D)
                  </button>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'lift' ? (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e6bb8" opacity={0.2} />
                      <XAxis dataKey="alpha" stroke="#a8b2d1" label={{ value: 'Angle of Attack (Degrees)', position: 'insideBottom', offset: -10, fill: '#a8b2d1' }} />
                      <YAxis stroke="#a8b2d1" label={{ value: 'Lift Coefficient (Cl)', angle: -90, position: 'insideLeft', fill: '#a8b2d1' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050a12', borderColor: '#1e6bb8', borderRadius: '8px' }}
                        itemStyle={{ color: '#e0e1dd' }}
                      />
                      <ReferenceLine x={airfoil.stallAngle} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Stall', fill: '#ef4444' }} />
                      <ReferenceLine y={0} stroke="#a8b2d1" opacity={0.5} />
                      <Line type="monotone" dataKey="Cl" stroke="#1e6bb8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ff6b35' }} isAnimationActive={true} animationDuration={1500} />
                    </LineChart>
                  ) : activeChart === 'drag' ? (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ef4444" opacity={0.2} />
                      <XAxis dataKey="Cl" stroke="#a8b2d1" label={{ value: 'Lift Coefficient (Cl)', position: 'insideBottom', offset: -10, fill: '#a8b2d1' }} />
                      <YAxis dataKey="Cd" stroke="#a8b2d1" label={{ value: 'Drag Coefficient (Cd)', angle: -90, position: 'insideLeft', fill: '#a8b2d1' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050a12', borderColor: '#ef4444', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="Cd" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1500} />
                    </LineChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4ade80" opacity={0.2} />
                      <XAxis dataKey="alpha" stroke="#a8b2d1" label={{ value: 'Angle of Attack (Degrees)', position: 'insideBottom', offset: -10, fill: '#a8b2d1' }} />
                      <YAxis stroke="#a8b2d1" label={{ value: 'Lift/Drag Ratio (L/D)', angle: -90, position: 'insideLeft', fill: '#a8b2d1' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050a12', borderColor: '#4ade80', borderRadius: '8px' }}
                      />
                      <ReferenceLine x={airfoil.stallAngle} stroke="#ef4444" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="LOD" stroke="#4ade80" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1500} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 bg-aviation-dark/50 rounded-lg flex gap-3 text-sm text-aviation-text-dim border border-aviation-primary/30">
                <Info className="w-5 h-5 text-aviation-primary-light flex-shrink-0" />
                <p>
                  These graphs represent 2D theoretical section data. Actual 3D wing performance will vary based on Aspect Ratio (AR) due to the addition of induced drag at the wingtips. Use the Wing Loading Calculator to assess full aircraft performance.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AirfoilAnalyzerPage