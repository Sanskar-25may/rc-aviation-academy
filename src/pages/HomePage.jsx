import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  GraduationCap, Calculator, Book, Hammer, 
  Gamepad2, Wind, Users, Rocket, TrendingUp,
  Award, Clock, Target
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const v1Ref = useRef(null)
  const v2Ref = useRef(null)
  const scrollRef = useRef(null)
  const [scrollRange, setScrollRange] = useState('500vh') // default fallback

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Auto-scroll logic (activates after 5s idle, scrolls 180px/s = 1x video speed)
  useEffect(() => {
    let idleTimer = null
    let animationFrame = null
    let autoScrolling = false
    let lastTime = 0

    const resetIdleTimer = () => {
      autoScrolling = false
      if (idleTimer) clearTimeout(idleTimer)
      if (animationFrame) cancelAnimationFrame(animationFrame)
      
      idleTimer = setTimeout(() => {
        autoScrolling = true
        lastTime = performance.now()
        animationFrame = requestAnimationFrame(autoScrollLoop)
      }, 5000)
    }

    const autoScrollLoop = (time) => {
      if (!autoScrolling) return
      
      const deltaTime = time - lastTime
      lastTime = time
      
      // 180 pixels per second matches exact video playback speed
      const pxPerMs = 180 / 1000
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      if (window.scrollY < maxScroll) {
        window.scrollBy(0, pxPerMs * deltaTime)
        animationFrame = requestAnimationFrame(autoScrollLoop)
      } else {
        autoScrolling = false
      }
    }

    // Attach interaction events (omitting 'scroll' so programmable scroll doesn't cancel it)
    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'touchmove']
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    
    resetIdleTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer))
      if (idleTimer) clearTimeout(idleTimer)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Setup dual-video GSAP scrub
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const v1 = v1Ref.current
      const v2 = v2Ref.current
      if (!v1 || !v2) return

      // Calculate total duration once metadata loads to set exact scroll range
      const updateScrollRange = () => {
        if (v1.duration && v2.duration) {
          // 200 pixels of scroll per second of video
          const totalDur = v1.duration + v2.duration
          // Ensure a minimum height so it doesn't break layout if videos are very short
          setScrollRange(Math.max(totalDur * 180, window.innerHeight * 4) + 'px')
          ScrollTrigger.refresh()
        }
      }

      v1.addEventListener('loadedmetadata', updateScrollRange)
      v2.addEventListener('loadedmetadata', updateScrollRange)
      updateScrollRange()

      let scrubState = { p: 0 }
      
      gsap.to(scrubState, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true, // perfectly locked to scroll speed, no lag
        },
        onUpdate: () => {
          const p = scrubState.p
          
          if (p <= 0.5) {
            // Video 1 phase (0% to 50% scroll)
            const video1Progress = p / 0.5
            if (v1.duration) {
              // Only update if difference > tiny fraction to avoid freezing
              const targetTime = video1Progress * v1.duration
              if (Math.abs(v1.currentTime - targetTime) > 0.01) v1.currentTime = targetTime
            }
            v1.style.opacity = 1
            v2.style.opacity = 0
            
          } else {
            // Video 2 phase (50% to 100% scroll)
            const video2Progress = (p - 0.5) / 0.5
            if (v2.duration) {
              const targetTime = video2Progress * v2.duration
              if (Math.abs(v2.currentTime - targetTime) > 0.01) v2.currentTime = targetTime
            }
            // Quick crossfade logic at the 0.5 mark
            const crossfadeWindow = 0.05 // 5% scroll distance for fade
            if (p < 0.5 + crossfadeWindow) {
               const fadeProgress = (p - 0.5) / crossfadeWindow
               v1.style.opacity = 1 - fadeProgress
               v2.style.opacity = fadeProgress
            } else {
               v1.style.opacity = 0
               v2.style.opacity = 1
            }
          }
        }
      })
      
      return () => {
        v1.removeEventListener('loadedmetadata', updateScrollRange)
        v2.removeEventListener('loadedmetadata', updateScrollRange)
      }
    })

    return () => ctx.revert()
  }, [])

  const features = [
    { icon: <GraduationCap className="w-12 h-12" />, title: 'Structured Learning Path',     description: 'From absolute beginner to expert pilot with our comprehensive curriculum', link: '/learning',          color: 'from-blue-500 to-cyan-500' },
    { icon: <Calculator className="w-12 h-12" />,    title: 'Advanced Calculators',         description: 'Wing loading, CG, power systems, propeller selection, and more',         link: '/calculators',       color: 'from-orange-500 to-red-500' },
    { icon: <Wind className="w-12 h-12" />,          title: 'Airfoil Analyzer',             description: 'Analyze lift, drag, and performance of different airfoil profiles',      link: '/airfoil-analyzer',  color: 'from-purple-500 to-pink-500' },
    { icon: <Gamepad2 className="w-12 h-12" />,      title: '3D Flight Simulator',          description: 'Practice flying in realistic physics simulation before first flight',      link: '/simulator',         color: 'from-green-500 to-emerald-500' },
    { icon: <Hammer className="w-12 h-12" />,        title: 'Design Studio',                description: 'Design and optimize your own RC plane with CAD-like tools',              link: '/design-studio',     color: 'from-yellow-500 to-orange-500' },
    { icon: <Book className="w-12 h-12" />,          title: 'Knowledge Base',               description: 'Deep dive into aerodynamics, materials, electronics, and techniques',      link: '/knowledge',         color: 'from-indigo-500 to-blue-500' },
    { icon: <Rocket className="w-12 h-12" />,        title: 'Flight Physics Engine',        description: 'Interactive visualization of forces, moments, and flight dynamics',      link: '/flight-physics',    color: 'from-red-500 to-pink-500' },
    { icon: <Users className="w-12 h-12" />,         title: 'Community Hub',                description: 'Connect with pilots, share projects, find mentors, join events',         link: '/community',         color: 'from-teal-500 to-cyan-500' }
  ]

  const stats = [
    { icon: <Users />,   value: '50,000+',  label: 'Active Learners' },
    { icon: <Award />,   value: '10,000+',  label: 'Planes Built' },
    { icon: <Clock />,   value: '100,000+', label: 'Flight Hours' },
    { icon: <Target />,  value: '95%',      label: 'Success Rate' }
  ]

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } }

  return (
    <div className="relative w-full bg-black text-white selection:bg-aviation-accent selection:text-white">
      
      {/* --- NATIVE DUAL VIDEO BACKGROUND PINNED BEHIND CONTENT --- */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        {/* Video 1 */}
        <video 
          ref={v1Ref}
          src="/videos/rc-plane.mp4.mp4?v=2" 
          muted playsInline preload="auto" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Video 2 */}
        <video 
          ref={v2Ref}
          src="/RC_Aviation_Hobby_Montage.mp4?v=2" 
          muted playsInline preload="auto" 
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />
        
        {/* Cinematic Premium Overlay / Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95"></div>
        <div className="absolute inset-0 bg-aviation-darker/30 mix-blend-multiply backdrop-blur-[1px]"></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div 
        ref={scrollRef} 
        className="relative z-10 w-full flex flex-col justify-between" 
        style={{ minHeight: scrollRange }}
      >
        
        {/* HERO SECTION - Taller to allow video 1 scrubbing to be visible */}
        <section className="flex flex-col justify-start pt-[25vh] pb-[10vh] items-center relative px-4 sm:px-6 lg:px-8 text-center" style={{ minHeight: '100vh' }}>
          <motion.div
            className="absolute inset-0 pointer-events-none z-[-1]"
            animate={{ x: mousePosition.x * 0.02, y: mousePosition.y * 0.02 }}
            transition={{ type: 'spring', stiffness: 50 }}
          >
            <div className="absolute top-20 left-10 w-64 h-64 bg-aviation-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-60 right-10 w-96 h-96 bg-aviation-accent/20 rounded-full blur-[100px]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-display font-black mb-6 leading-tight tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 drop-shadow-2xl">THE SKY</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviation-primary to-aviation-accent">AWAITS YOU</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto font-light tracking-wide">
              Complete engineering-grade education for fixed-wing drones and RC planes. From aerodynamics theory to your first successful flight.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to="/learning" className="px-8 py-3.5 rounded-full bg-aviation-accent hover:bg-aviation-primary text-white font-bold text-lg transition-colors duration-300 shadow-[0_0_30px_rgba(255,107,53,0.3)] hover:shadow-[0_0_40px_rgba(30,107,184,0.4)]">
                Start Learning
              </Link>
              <Link to="/design-studio" className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-lg transition-all duration-300">
                Open Design Studio
              </Link>
            </div>
          </motion.div>

          <div className="absolute bottom-32 flex flex-col items-center opacity-60">
            <span className="text-sm uppercase tracking-[0.3em] mb-4">Scroll to Explore</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </section>

        {/* FEATURES GRID SECTION - Takes up next block of scroll */}
        <section className="min-h-screen py-20 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviation-primary to-aviation-accent">Master Flight</span>
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto">
              Professional-grade tools and education platform for RC aviation enthusiasts, built directly into your browser.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} className="group h-full">
                <Link to={feature.link} className="block h-full">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full hover:border-aviation-accent/50 hover:bg-black/60 transition-all duration-300">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-2 group-hover:text-aviation-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* WHY CHOOSE US & STATS - Sits in the crossfade / video 2 phase */}
        <section className="min-h-[120vh] py-32 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-200px" }}>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-12 text-center">
                Why RC Aviation Academy?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-12 mb-20">
                <div className="text-center">
                  <div className="w-20 h-20 bg-aviation-primary/10 border border-aviation-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <TrendingUp className="w-10 h-10 text-aviation-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">Engineering-First</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Learn the real physics, mathematics, and engineering principles behind flight. Not just "follow these steps" - understand WHY things work.</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-aviation-accent/10 border border-aviation-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                    <Gamepad2 className="w-10 h-10 text-aviation-accent" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">Hands-On Tools</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Interactive calculators, 3D flight simulator, airfoil analyzer, and design studio. Practice before you build, simulate before you fly.</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Users className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">Thriving Community</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Join thousands of builders and pilots. Share projects, get feedback, find mentors, and participate in competitions and events.</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-2">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-aviation-primary font-bold flex items-center justify-center gap-2">
                       {React.cloneElement(stat.icon, { className: 'w-4 h-4' })}
                       {stat.label}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </section>

        {/* CTA SECTION - End of video 2 */}
        <section className="flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: '80vh' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-100px" }} className="w-full max-w-5xl mx-auto px-4 text-center z-10">
            <h2 className="text-5xl md:text-[5rem] font-display font-black text-white mb-8 leading-none tracking-tighter">
              READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviation-accent to-[#ff8c5a]">TAKE FLIGHT?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-light">
              Join our community and start your journey from complete beginner to confident RC pilot today.
            </p>
            <Link to="/learning" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-black rounded-full font-black text-lg hover:bg-aviation-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
              BEGIN YOUR JOURNEY 
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

      </div>
    </div>
  )
}

// Quick inline icon since I forgot to import it
const ArrowRight = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
)

export default HomePage
