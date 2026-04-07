import React from 'react'
import { Plane } from 'lucide-react'

const Loader = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer Radar Ring */}
        <div className="absolute inset-0 border-2 border-aviation-primary rounded-full animate-ping opacity-20"></div>
        
        {/* Inner Pulsing Ring */}
        <div className="absolute inset-4 border-2 border-aviation-accent rounded-full animate-pulse opacity-40 blur-[1px]"></div>
        
        {/* Center Aircraft */}
        <div className="relative z-10 animate-float">
          <Plane className="w-10 h-10 text-aviation-accent transform -rotate-45" />
        </div>
      </div>
      
      <div className="mt-8 font-mono text-sm text-aviation-text-dim uppercase tracking-[0.3em] animate-pulse">
        Fetching Telemetry...
      </div>
    </div>
  )
}

export default Loader