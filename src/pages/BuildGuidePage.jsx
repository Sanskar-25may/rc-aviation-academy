import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hammer, Scissors, Ruler, PenTool,
  Battery, Settings, CheckCircle2, Circle,
  AlertTriangle, ArrowRight, FileText, Link as LinkIcon,
  Package, Wrench, ChevronDown
} from 'lucide-react'
import { Link } from 'react-router-dom'

const BuildGuidePage = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isGenerating, setIsGenerating] = useState(false)

  const tools = [
    { icon: <Scissors className="w-5 h-5" />, name: 'Hobby Knife & Extra Blades', note: 'Fresh blade per session' },
    { icon: <Ruler className="w-5 h-5" />, name: 'Metal Ruler (30cm+)', note: 'Do not use plastic' },
    { icon: <PenTool className="w-5 h-5" />, name: 'Hot Glue Gun & Sticks', note: 'Low-temp preferred' },
    { icon: <Hammer className="w-5 h-5" />, name: 'Cutting Mat', note: 'A3 size minimum' },
    { icon: <Settings className="w-5 h-5" />, name: 'Packing Tape', note: 'For structural reinforcement' },
    { icon: <Battery className="w-5 h-5" />, name: 'Velcro Straps', note: 'Battery retention' },
  ]

  const materials = [
    { item: '2x Sheets of 5mm Foam Board (DTFB or Depron)', qty: '2 sheets' },
    { item: '1x Carbon Fiber Tube or Wood Spar (5mm diameter)', qty: '1 × 120cm' },
    { item: 'Music Wire for Pushrods (1.2mm)', qty: '60cm' },
    { item: 'Control Horns & Clevises', qty: '4 sets' },
    { item: 'Plywood for Motor Mount (3mm)', qty: '10×10cm' },
    { item: 'Electronics Combo (Motor, ESC, Servos, Rx, Battery)', qty: '1 set' },
  ]

  const buildSteps = [
    {
      id: 1,
      title: 'Printing and Cutting Plans',
      phase: 'Preparation',
      duration: '45–60 min',
      description: 'Start by taping your tiled PDF plans together and transferring them to the foam board.',
      tips: [
        'Ensure your printer is set to "Actual Size" or "100% scale", never "Fit to Page".',
        'Use a fresh hobby blade. A dull blade will tear the foam interior.',
        'Keep the knife at a perfect 90-degree angle for clean, square edges.',
      ],
      warning: 'Always cut away from your body and keep fingers clear of the ruler edge.',
    },
    {
      id: 2,
      title: 'Wing Construction & Spars',
      phase: 'Aerodynamics',
      duration: '90–120 min',
      description: 'The wing is the most critical aerodynamic component. Create a folded airfoil with a central spar.',
      tips: [
        'Score the fold lines at 50% depth. Do not cut all the way through.',
        'Glue the carbon fiber or wood spar exactly on the CG line for maximum strength.',
        'Use packing tape on the outside of the leading edge fold to prevent tearing when you bend it.',
      ],
      warning: 'Make sure your wing halves have equal dihedral (upward angle) or the plane will pull to one side.',
    },
    {
      id: 3,
      title: 'Fuselage Assembly',
      phase: 'Structure',
      duration: '60–90 min',
      description: 'Building the main body square and true is vital for correct thrust angles and tail alignment.',
      tips: [
        'Use an A-B fold technique: cut a channel, apply hot glue, and fold to exactly 90 degrees.',
        'Use a square or triangle ruler to hold the fuselage sides perfectly vertical while the glue cools.',
        'Reinforce the nose area with extra tape or a doubler layer of foam, as this takes the most impact.',
      ],
      warning: 'Do not twist the fuselage while the glue is setting.',
    },
    {
      id: 4,
      title: 'Empennage (Tail Surfaces)',
      phase: 'Aerodynamics',
      duration: '45–60 min',
      description: 'Installing the horizontal stabilizer (elevator) and vertical stabilizer (rudder).',
      tips: [
        'Cut a 45-degree bevel hinge on the control surfaces using your hobby knife.',
        'Seal the hinge with a thin layer of hot glue and immediately wipe it smooth with a scrap piece of foam.',
        'Ensure the horizontal tail is perfectly parallel to the main wing.',
      ],
    },
    {
      id: 5,
      title: 'Electronics Installation',
      phase: 'Systems',
      duration: '60–90 min',
      description: 'Mounting the servos, motor, ESC, and running the pushrods to the control surfaces.',
      tips: [
        'Center your servos using your radio BEFORE installing the control arms and gluing them into the foam.',
        'Mount the motor to a rigid plywood firewall, then glue the firewall to the foam fuselage.',
        'Ensure the propeller is removed whenever working on powered electronics.',
      ],
      warning: 'Never plug the battery in with the propeller attached while working on the bench.',
    },
    {
      id: 6,
      title: 'Balance and CG Check',
      phase: 'Final Check',
      duration: '30–45 min',
      description: 'The final and most important step before flight. Setting the Center of Gravity.',
      tips: [
        'Use the CG Calculator to find your exact balance point from the wing root leading edge.',
        'Mark the CG on the bottom of the wing. Support the plane on your fingertips at these marks.',
        'Move the battery forward or backward until the plane balances level or slightly nose-down.',
      ],
      action: { label: 'Open CG Calculator', link: '/calculators' },
      warning: 'A nose-heavy plane flies poorly. A tail-heavy plane flies only once.',
    },
  ]

  const toggleComplete = (id) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const progressPercent = Math.round((completedSteps.size / buildSteps.length) * 100)

  // ── PDF Report Generation ────────────────────────────────────────────────
  const generateReport = useCallback(async () => {
    setIsGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, H = 297
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

      const drawHeader = (title) => {
        doc.setFillColor(13, 27, 42)
        doc.rect(0, 0, W, H, 'F')
        doc.setFillColor(30, 107, 184)
        doc.rect(0, 0, W, 36, 'F')
        doc.setFillColor(255, 107, 53)
        doc.rect(0, 33, W, 3, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('RC AVIATION ACADEMY', 14, 12)
        doc.setFontSize(6)
        doc.setFont('helvetica', 'normal')
        doc.text('BUILD GUIDE  •  ENGINEERING REPORT', 14, 18)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 14, 29)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(180, 210, 240)
        doc.text(`Generated: ${today}`, W - 14, 29, { align: 'right' })
      }

      const drawFooter = () => {
        doc.setFillColor(10, 20, 35)
        doc.rect(0, H - 12, W, 12, 'F')
        doc.setFillColor(255, 107, 53)
        doc.rect(0, H - 12, W, 0.8, 'F')
        doc.setTextColor(80, 100, 130)
        doc.setFontSize(6)
        doc.text('RC Aviation Academy — Build Guide Report — For educational purposes only', 14, H - 4)
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`, W - 14, H - 4, { align: 'right' })
      }

      // ── PAGE 1: OVERVIEW + TOOLS ─────────────────────────────────────
      drawHeader('Build Guide Report')

      // Progress Bar
      doc.setFillColor(15, 30, 50)
      doc.roundedRect(14, 44, W - 28, 14, 3, 3, 'F')
      const barW = ((W - 28) - 4) * (progressPercent / 100)
      if (barW > 0) {
        doc.setFillColor(74, 222, 128)
        doc.roundedRect(16, 46, barW, 10, 2, 2, 'F')
      }
      doc.setTextColor(220, 240, 220)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(`Build Progress: ${progressPercent}%  (${completedSteps.size} of ${buildSteps.length} steps marked complete)`, 20, 53)

      // Tools section
      let y = 68
      doc.setTextColor(255, 107, 53)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('REQUIRED TOOLS', 14, y)
      y += 6

      tools.forEach((t, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const tx = col === 0 ? 14 : W / 2 + 4
        const ty = y + row * 14
        doc.setFillColor(18, 36, 58)
        doc.roundedRect(tx, ty - 4, (W / 2) - 18, 12, 2, 2, 'F')
        doc.setFillColor(30, 107, 184)
        doc.roundedRect(tx, ty - 4, 3, 12, 1, 1, 'F')
        doc.setTextColor(200, 220, 240)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(t.name, tx + 6, ty + 1)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 140, 180)
        doc.setFontSize(6)
        doc.text(t.note, tx + 6, ty + 5.5)
      })

      y += Math.ceil(tools.length / 2) * 14 + 8

      // Materials / BOM
      doc.setTextColor(255, 107, 53)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('BILL OF MATERIALS (BOM)', 14, y)
      y += 6

      materials.forEach((m, i) => {
        const my = y + i * 11
        doc.setFillColor(i % 2 === 0 ? 18 : 22, i % 2 === 0 ? 36 : 42, i % 2 === 0 ? 58 : 68)
        doc.rect(14, my - 3, W - 28, 10, 'F')
        doc.setFillColor(255, 107, 53)
        doc.circle(17.5, my + 1.5, 1.5, 'F')
        doc.setTextColor(210, 225, 240)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(m.item, 22, my + 2)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 160, 220)
        doc.text(m.qty, W - 16, my + 2, { align: 'right' })
      })

      drawFooter()

      // ── PAGE 2: BUILD STEPS ─────────────────────────────────────────────
      doc.addPage()
      drawHeader('Assembly Steps')

      const phaseColors = {
        'Preparation': [100, 180, 240],
        'Aerodynamics': [74, 222, 128],
        'Structure': [251, 191, 36],
        'Systems': [167, 139, 250],
        'Final Check': [255, 107, 53],
      }

      let sy = 44
      buildSteps.forEach((step) => {
        const isComplete = completedSteps.has(step.id)
        const pc = phaseColors[step.phase] || [100, 150, 200]

        // Step card background
        doc.setFillColor(15, 28, 48)
        doc.roundedRect(14, sy, W - 28, 42, 3, 3, 'F')

        // Color sidebar
        doc.setFillColor(...pc)
        doc.roundedRect(14, sy, 4, 42, 2, 2, 'F')

        // Step number badge
        doc.setFillColor(...pc)
        doc.circle(26, sy + 7, 5, 'F')
        doc.setTextColor(10, 20, 35)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(String(step.id), 26, sy + 9.5, { align: 'center' })

        // Completed check
        if (isComplete) {
          doc.setFillColor(74, 222, 128)
          doc.circle(W - 18, sy + 7, 4, 'F')
          doc.setTextColor(10, 20, 35)
          doc.setFontSize(7)
          doc.text('✓', W - 18, sy + 9.5, { align: 'center' })
        }

        // Title & phase
        doc.setTextColor(...pc)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        doc.text(step.phase.toUpperCase(), 34, sy + 5)
        doc.setTextColor(230, 240, 255)
        doc.setFontSize(9)
        doc.text(step.title, 34, sy + 11)
        doc.setFontSize(6)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 140, 180)
        doc.text(`Est. Duration: ${step.duration}`, 34, sy + 16.5)

        // Description
        doc.setTextColor(160, 185, 210)
        doc.setFontSize(6.5)
        const descLines = doc.splitTextToSize(step.description, W - 50)
        doc.text(descLines, 34, sy + 22)

        // Warning
        if (step.warning) {
          doc.setFillColor(80, 20, 20)
          doc.roundedRect(14, sy + 35, W - 28, 9, 1, 1, 'F')
          doc.setTextColor(255, 120, 100)
          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.text('⚠ ' + step.warning, 18, sy + 41)
          sy += 43 + 4
        } else {
          sy += 42 + 4
        }

        // Page break check
        if (sy > H - 50 && step.id < buildSteps.length) {
          drawFooter()
          doc.addPage()
          drawHeader('Assembly Steps (continued)')
          sy = 44
        }
      })

      // ── ALL PAGES FOOTER ─────────────────────────────────────────────────
      for (let p = 1; p <= doc.getNumberOfPages(); p++) {
        doc.setPage(p)
        drawFooter()
      }

      doc.save('rc-build-guide-report.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [completedSteps, progressPercent])

  const activeStepData = buildSteps.find(s => s.id === activeStep)

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0a1628 60%, #050d1a 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(30,107,184,0.15)', border: '1px solid rgba(30,107,184,0.4)', color: '#60a5fa' }}>
            <Wrench className="w-3.5 h-3.5" /> RC Aircraft Build Guide
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            The <span className="text-gradient">Build Guide</span>
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-8" style={{ color: '#6090b0' }}>
            From flat foam board to a flight-ready aircraft. Engineering-approved steps for structural integrity and aerodynamic success.
          </p>

          {/* Progress + Generate Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Progress Bar */}
            <div className="w-full sm:w-64">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#4a7fa8' }}>
                <span>Build Progress</span>
                <span className="font-bold" style={{ color: '#4ade80' }}>{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30,107,184,0.2)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, #4ade80, #22c55e)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300"
              style={{
                background: isGenerating ? 'rgba(255,107,53,0.3)' : 'linear-gradient(135deg, #ff6b35, #e85d04)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255,107,53,0.3)',
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <FileText className="w-4 h-4" />
              {isGenerating ? 'Generating PDF...' : 'Generate Build Report'}
            </button>
          </div>
        </motion.div>

        {/* ── TOOLS & MATERIALS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Tools */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(30,107,184,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(30,107,184,0.2)' }}>
              <Wrench className="w-5 h-5" style={{ color: '#ff6b35' }} />
              <h2 className="font-display font-bold text-white">Required Tools</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tools.map((tool, i) => (
                <div key={i}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'rgba(20,40,65,0.6)', border: '1px solid rgba(30,107,184,0.2)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(30,107,184,0.2)', color: '#60a5fa' }}>
                    {tool.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#d0e8ff' }}>{tool.name}</div>
                    <div className="text-xs" style={{ color: '#4a7fa8' }}>{tool.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(30,107,184,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(30,107,184,0.2)' }}>
              <Package className="w-5 h-5" style={{ color: '#ff6b35' }} />
              <h2 className="font-display font-bold text-white">Bill of Materials</h2>
            </div>
            <div className="p-5 space-y-2.5">
              {materials.map((m, i) => (
                <div key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: i % 2 === 0 ? 'rgba(20,40,65,0.5)' : 'rgba(15,30,50,0.4)', border: '1px solid rgba(30,107,184,0.15)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff6b35' }} />
                    <span className="text-sm" style={{ color: '#b0c8e0' }}>{m.item}</span>
                  </div>
                  <span className="text-xs font-mono font-bold flex-shrink-0 ml-2 px-2 py-0.5 rounded-lg" style={{ color: '#60a5fa', background: 'rgba(30,107,184,0.15)' }}>
                    {m.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── STEP-BY-STEP GUIDE ── */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Step Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 rounded-2xl overflow-hidden" style={{ background: 'rgba(8,18,35,0.9)', border: '1px solid rgba(30,107,184,0.25)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(30,107,184,0.2)' }}>
                <h3 className="font-display font-bold text-white text-sm">Build Sequence</h3>
              </div>
              <div className="p-3 space-y-1.5">
                {buildSteps.map((step) => {
                  const isActive = activeStep === step.id
                  const isComplete = completedSteps.has(step.id)
                  const phaseColor = {
                    'Preparation': '#60a5fa',
                    'Aerodynamics': '#4ade80',
                    'Structure': '#fbbf24',
                    'Systems': '#a78bfa',
                    'Final Check': '#ff6b35',
                  }[step.phase] || '#60a5fa'

                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className="w-full flex items-center gap-3 text-left p-3 rounded-xl transition-all duration-250"
                      style={{
                        background: isActive ? 'rgba(255,107,53,0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: '#4ade80' }} />
                        ) : (
                          <Circle className="w-5 h-5" style={{ color: isActive ? '#ff6b35' : '#2a4a6a' }} />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: phaseColor }}>
                          Step {step.id} · {step.phase}
                        </div>
                        <div className="text-sm font-semibold truncate" style={{ color: isActive ? '#e0f0ff' : '#6090b0' }}>
                          {step.title}
                        </div>
                      </div>
                      <ChevronDown
                        className="w-4 h-4 flex-shrink-0 transition-transform"
                        style={{
                          color: '#2a4a6a',
                          transform: isActive ? 'rotate(-90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Active Step Content */}
          <motion.div className="lg:col-span-2" layout>
            <AnimatePresence mode="wait">
              {activeStepData && (
                <motion.div
                  key={activeStepData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.28 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(8,18,35,0.9)',
                    border: '1px solid rgba(30,107,184,0.25)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Step Header */}
                  <div className="p-6 border-b" style={{ borderColor: 'rgba(30,107,184,0.2)', background: 'rgba(15,28,50,0.5)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(255,107,53,0.15)',
                              color: '#ff6b35',
                              border: '1px solid rgba(255,107,53,0.3)',
                            }}>
                            Phase {activeStepData.id} of {buildSteps.length}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: '#4a7fa8', background: 'rgba(30,107,184,0.1)' }}>
                            {activeStepData.duration}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white">{activeStepData.title}</h2>
                      </div>
                      <button
                        onClick={() => toggleComplete(activeStepData.id)}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                        style={{
                          background: completedSteps.has(activeStepData.id) ? 'rgba(74,222,128,0.15)' : 'rgba(30,107,184,0.1)',
                          border: `1px solid ${completedSteps.has(activeStepData.id) ? 'rgba(74,222,128,0.4)' : 'rgba(30,107,184,0.3)'}`,
                          color: completedSteps.has(activeStepData.id) ? '#4ade80' : '#4a7fa8',
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {completedSteps.has(activeStepData.id) ? 'Done' : 'Mark Done'}
                      </button>
                    </div>
                    <p className="mt-4 text-base" style={{ color: '#6090b0' }}>{activeStepData.description}</p>
                  </div>

                  {/* Tips */}
                  <div className="p-6">
                    <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                      <PenTool className="w-4 h-4" style={{ color: '#4ade80' }} />
                      Technique & Tips
                    </h3>
                    <div className="space-y-3">
                      {activeStepData.tips.map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-3 p-4 rounded-xl"
                          style={{ background: 'rgba(20,40,65,0.5)', border: '1px solid rgba(30,107,184,0.15)' }}
                        >
                          <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
                          <span className="text-sm" style={{ color: '#90b8d8' }}>{tip}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Warning */}
                    {activeStepData.warning && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-5 flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
                      >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
                        <div>
                          <div className="font-bold text-sm mb-1" style={{ color: '#ef4444' }}>Critical Warning</div>
                          <p className="text-sm" style={{ color: 'rgba(239,68,68,0.85)' }}>{activeStepData.warning}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Action link */}
                    {activeStepData.action && (
                      <div className="mt-5">
                        <Link
                          to={activeStepData.action.link}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: 'rgba(30,107,184,0.15)', border: '1px solid rgba(30,107,184,0.35)', color: '#60a5fa' }}
                        >
                          <LinkIcon className="w-4 h-4" />
                          {activeStepData.action.label}
                        </Link>
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: 'rgba(30,107,184,0.2)' }}>
                      <button
                        onClick={() => setActiveStep(Math.max(1, activeStepData.id - 1))}
                        disabled={activeStepData.id === 1}
                        className="px-5 py-2 rounded-xl border font-semibold text-sm transition-all duration-200 disabled:opacity-30"
                        style={{ borderColor: 'rgba(30,107,184,0.3)', color: '#4a7fa8' }}
                      >
                        ← Previous
                      </button>

                      {activeStepData.id < buildSteps.length ? (
                        <button
                          onClick={() => {
                            toggleComplete(activeStepData.id)
                            setActiveStep(activeStepData.id + 1)
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: 'linear-gradient(135deg, #1e6bb8, #0a4d8f)', color: 'white', boxShadow: '0 4px 16px rgba(30,107,184,0.35)' }}
                        >
                          Complete & Next <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          to="/design-studio"
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
                        >
                          Go to Design Studio <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BuildGuidePage