import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, Wind, Thermometer, Eye, Navigation, 
  AlertTriangle, CheckCircle2, CloudRain, MapPin, Loader2, ShieldCheck
} from 'lucide-react'

const WeatherDashboardPage = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locationName, setLocationName] = useState("Local Airspace")

  useEffect(() => {
    // 1. Get User Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          console.warn("Geolocation denied, using default coordinates.")
          fetchWeatherData(51.5074, -0.1278) // Default to a standard coordinate if denied
          setLocationName("Default Airspace (Location Denied)")
        }
      )
    } else {
      fetchWeatherData(51.5074, -0.1278)
    }
  }, [])

  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true)
      // Free Open-Meteo API - No API Key required
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`
      )
      
      if (!response.ok) throw new Error('Failed to fetch weather data')
      const data = await response.json()
      
      setWeather(data.current)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // --- FLIGHT READINESS ALGORITHM ---
  const analyzeConditions = (w) => {
    if (!w) return null

    const issues = []
    const warnings = []
    let score = 100

    // Wind Analysis (km/h)
    if (w.wind_speed_10m > 35) {
      issues.push("CRITICAL: Sustained winds exceed safe operational limits for most RC aircraft (>35 km/h).")
      score -= 50
    } else if (w.wind_speed_10m > 20) {
      warnings.push("High Winds: Flight recommended for advanced pilots or heavy, fast aircraft only.")
      score -= 20
    }

    // Gust Analysis
    const gustDifferential = w.wind_gusts_10m - w.wind_speed_10m
    if (gustDifferential > 20) {
      issues.push("CRITICAL: Severe wind shear/gusts detected. High risk of tip stalls on approach.")
      score -= 30
    } else if (gustDifferential > 10) {
      warnings.push("Turbulent air: Expect bumpy flight conditions. Keep airspeed up during landing.")
      score -= 15
    }

    // Precipitation (Weather Codes based on WMO standards)
    if (w.precipitation > 0 || w.weather_code >= 50) {
      issues.push("CRITICAL: Precipitation detected. Exposed electronics will short circuit.")
      score -= 60
    }

    // Temperature (LiPo efficiency drops in cold)
    if (w.temperature_2m < 5) {
      warnings.push("Cold Weather: LiPo battery voltage will sag significantly faster. Reduce flight timer by 30%.")
      score -= 10
    }

    score = Math.max(0, score)
    
    let status = "OPTIMAL"
    let color = "text-aviation-success"
    let borderColor = "border-aviation-success"
    let bg = "bg-aviation-success/10"

    if (score < 60) {
      status = "GROUNDED"
      color = "text-aviation-danger"
      borderColor = "border-aviation-danger"
      bg = "bg-aviation-danger/10"
    } else if (score < 90) {
      status = "MARGINAL"
      color = "text-aviation-warning"
      borderColor = "border-aviation-warning"
      bg = "bg-aviation-warning/10"
    }

    return { score, status, color, borderColor, bg, issues, warnings }
  }

  const analysis = analyzeConditions(weather)

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
            Pre-Flight <span className="text-gradient">Weather</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-3xl mx-auto flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-aviation-accent" />
            {locationName}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-aviation-accent animate-spin mb-4" />
            <p className="text-aviation-text-dim font-mono animate-pulse">Contacting Meteorological Towers...</p>
          </div>
        ) : error ? (
          <div className="card border-aviation-danger bg-aviation-danger/10 text-center p-8">
            <AlertTriangle className="w-12 h-12 text-aviation-danger mx-auto mb-4" />
            <h3 className="text-xl font-bold text-aviation-danger">Radar Offline</h3>
            <p className="text-aviation-light">{error}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Primary Status Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1"
            >
              <div className={`card h-full flex flex-col justify-between border-t-4 ${analysis.borderColor}`}>
                <div>
                  <h3 className="text-aviation-text-dim font-mono text-sm uppercase tracking-wider mb-2">
                    Flight Readiness Score
                  </h3>
                  <div className={`text-6xl font-display font-black mb-2 ${analysis.color}`}>
                    {analysis.score}<span className="text-3xl">%</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 font-bold px-4 py-1 rounded-full ${analysis.bg} ${analysis.color}`}>
                    {analysis.score >= 90 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    STATUS: {analysis.status}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-aviation-primary/30 space-y-4">
                  {analysis.issues.map((issue, i) => (
                    <div key={`iss-${i}`} className="flex gap-3 text-sm text-aviation-danger bg-aviation-danger/10 p-3 rounded-lg border border-aviation-danger/30">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>{issue}</span>
                    </div>
                  ))}
                  {analysis.warnings.map((warn, i) => (
                    <div key={`warn-${i}`} className="flex gap-3 text-sm text-aviation-warning bg-aviation-warning/10 p-3 rounded-lg border border-aviation-warning/30">
                      <Wind className="w-5 h-5 flex-shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                  {analysis.issues.length === 0 && analysis.warnings.length === 0 && (
                    <div className="flex gap-3 text-sm text-aviation-success bg-aviation-success/10 p-3 rounded-lg border border-aviation-success/30">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>Conditions are optimal for all skill levels and aircraft types.</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Telemetry Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 grid grid-cols-2 gap-4"
            >
              <div className="card bg-gradient-to-br from-aviation-primary/10 to-transparent">
                <Wind className="w-8 h-8 text-aviation-primary-light mb-4" />
                <div className="text-aviation-text-dim text-sm uppercase mb-1">Sustained Wind</div>
                <div className="text-3xl font-display font-bold text-aviation-light">
                  {weather.wind_speed_10m} <span className="text-base text-aviation-text-dim">km/h</span>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-aviation-accent/10 to-transparent">
                <Wind className="w-8 h-8 text-aviation-accent mb-4 border border-aviation-accent rounded-full p-1 border-dashed" />
                <div className="text-aviation-text-dim text-sm uppercase mb-1">Peak Gusts</div>
                <div className="text-3xl font-display font-bold text-aviation-accent">
                  {weather.wind_gusts_10m} <span className="text-base text-aviation-accent/60">km/h</span>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-aviation-warning/10 to-transparent">
                <Navigation 
                  className="w-8 h-8 text-aviation-warning mb-4" 
                  style={{ transform: `rotate(${weather.wind_direction_10m}deg)` }}
                />
                <div className="text-aviation-text-dim text-sm uppercase mb-1">Wind Direction</div>
                <div className="text-3xl font-display font-bold text-aviation-light">
                  {weather.wind_direction_10m}°
                </div>
              </div>

              <div className="card bg-gradient-to-br from-blue-400/10 to-transparent">
                <Thermometer className="w-8 h-8 text-blue-400 mb-4" />
                <div className="text-aviation-text-dim text-sm uppercase mb-1">Temperature</div>
                <div className="text-3xl font-display font-bold text-aviation-light">
                  {weather.temperature_2m}° <span className="text-base text-aviation-text-dim">C</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherDashboardPage