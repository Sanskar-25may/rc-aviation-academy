import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, Clock, Info, Navigation, Wind } from 'lucide-react'

const RangeCalculator = () => {
  const [inputs, setInputs] = useState({
    capacity: 3200,      // mAh
    cells: 4,            // S count
    avgCurrent: 12,      // Amps (Cruise current)
    cruiseSpeed: 15,     // m/s (approx V_best_LD)
    headwind: 0          // m/s
  })

  const [results, setResults] = useState({
    energyWh: 0,
    flightTimeMin: 0,
    groundSpeed: 0,
    rangeKm: 0,
    rangeMiles: 0,
    efficiency: 0,
    category: ''
  })

  useEffect(() => {
    calculateRange()
  }, [inputs])

  const calculateRange = () => {
    const { capacity, cells, avgCurrent, cruiseSpeed, headwind } = inputs

    // Battery Energy
    const nominalVoltage = cells * 3.7
    const capacityAh = capacity / 1000
    const energyWh = nominalVoltage * capacityAh

    // Flight Time (Using strict 80% capacity rule for LiPo safety)
    const usableCapacityAh = capacityAh * 0.80
    // Time in hours = Capacity(Ah) / Current(A)
    const flightTimeHours = usableCapacityAh / avgCurrent
    const flightTimeMin = flightTimeHours * 60

    // Range Calculation
    const groundSpeed = Math.max(0, cruiseSpeed - headwind) // Can't have negative range if blown backward
    // Distance = Speed * Time (in seconds)
    const rangeMeters = groundSpeed * (flightTimeHours * 3600)
    const rangeKm = rangeMeters / 1000
    const rangeMiles = rangeKm * 0.621371

    // Efficiency (mAh per km)
    // How many mAh are used to travel 1 km
    const efficiency = rangeKm > 0 ? (capacity * 0.8) / rangeKm : 0

    // Categorization
    let category = ''
    if (rangeKm > 20) category = 'Long Range (UAV / FPV Cruiser)'
    else if (rangeKm > 10) category = 'Medium Range (Sport / Scale)'
    else if (rangeKm > 5) category = 'Park Flyer / Local'
    else category = 'Short Range (3D / Glider tow)'

    setResults({
      energyWh,
      flightTimeMin,
      groundSpeed,
      rangeKm,
      rangeMiles,
      efficiency,
      category
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
        className="space-y-6"
      >
        <div className="card">
          <h2 className="text-2xl font-display font-bold text-aviation-accent mb-6 flex items-center gap-2">
            <Map className="w-6 h-6" />
            Flight & Power Parameters
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Battery Capacity (mAh)
                </label>
                <input
                  type="number"
                  value={inputs.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Cell Count (S)
                </label>
                <input
                  type="number"
                  value={inputs.cells}
                  onChange={(e) => handleInputChange('cells', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-aviation-light font-semibold mb-2 text-sm flex items-center gap-2">
                Average Cruise Current (A)
              </label>
              <input
                type="number"
                value={inputs.avgCurrent}
                onChange={(e) => handleInputChange('avgCurrent', e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-aviation-text-dim mt-1">Expected amp draw at level cruise</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-aviation-primary/30">
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm">
                  Cruise Airspeed (m/s)
                </label>
                <input
                  type="number"
                  value={inputs.cruiseSpeed}
                  onChange={(e) => handleInputChange('cruiseSpeed', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-aviation-text-dim mt-1">Ideally V_best_LD</p>
              </div>
              <div>
                <label className="block text-aviation-light font-semibold mb-2 text-sm flex items-center gap-2">
                  <Wind className="w-4 h-4 text-aviation-primary-light" />
                  Headwind (m/s)
                </label>
                <input
                  type="number"
                  value={inputs.headwind}
                  onChange={(e) => handleInputChange('headwind', e.target.value)}
                  className="input-field"
                />
              </div>
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
            <p>E (Wh) = V_nominal × C_Ah</p>
            <p>t_flight (min) = (C_mAh × 0.8) / I_avg × (60/1000)</p>
            <p>V_ground = V_cruise - V_wind</p>
            <p>Range = V_ground × t_flight(seconds)</p>
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
            Mission Capabilities
          </h2>

          <div className="space-y-4">
            {/* Primary Result Highlight */}
            <div className="bg-aviation-dark/50 p-6 rounded-xl border border-aviation-success/50 mb-6">
              <p className="text-aviation-text-dim text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-aviation-success" />
                Maximum Safe One-Way Range
              </p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-display font-bold text-aviation-success">
                  {results.rangeKm.toFixed(1)}
                </span>
                <span className="text-xl text-aviation-light mb-1">km</span>
              </div>
              <p className="text-sm text-aviation-text-dim mt-1 font-mono">
                ({results.rangeMiles.toFixed(1)} miles)
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim flex items-center gap-2">
                <Clock className="w-4 h-4 text-aviation-accent" />
                Safe Flight Endurance
              </span>
              <span className="text-aviation-accent font-bold text-2xl">
                {results.flightTimeMin.toFixed(1)} min
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Actual Ground Speed</span>
              <span className="text-aviation-light font-bold text-lg">
                {results.groundSpeed.toFixed(1)} m/s ({(results.groundSpeed * 3.6).toFixed(1)} km/h)
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">Total Onboard Energy</span>
              <span className="text-aviation-light font-bold">
                {results.energyWh.toFixed(1)} Wh
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-aviation-primary/30">
              <span className="text-aviation-text-dim">System Efficiency</span>
              <span className="text-aviation-warning font-bold">
                {results.efficiency > 0 ? `${results.efficiency.toFixed(0)} mAh/km` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-aviation-text-dim">Mission Profile</span>
              <span className="font-bold text-aviation-primary-light text-right ml-4">
                {results.category}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Guidelines */}
        <div className="card bg-gradient-to-br from-aviation-primary/10 to-transparent">
          <h3 className="text-lg font-display font-bold text-aviation-light mb-3">
            Pilot Guidelines
          </h3>
          <ul className="space-y-3 text-sm text-aviation-text-dim">
            <li className="flex gap-2">
              <span className="text-aviation-accent font-bold">!</span>
              <span>
                <strong>80% Rule Applied:</strong> This calculator assumes you land with 20% battery remaining (approx 3.7V per cell resting) to prevent irreversible LiPo damage.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-aviation-accent font-bold">!</span>
              <span>
                <strong>Round Trip Planning:</strong> Divide the maximum range by 2 for an out-and-back flight, and factor in that wind direction will reverse relative to the aircraft on the return leg.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-aviation-accent font-bold">!</span>
              <span>
                To maximize range, fly exactly at <em>V_best_LD</em> (the speed for maximum Lift-to-Drag ratio). To maximize endurance (time in air), fly slightly slower, near <em>V_endurance</em>.
              </span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default RangeCalculator