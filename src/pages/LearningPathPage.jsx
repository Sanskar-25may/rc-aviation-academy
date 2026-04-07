import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, PenTool, Wind, PlaneTakeoff, Award, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const LearningPathPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const phases = [
    {
      id: 1,
      title: "Phase 1: Ground School",
      subtitle: "Aerodynamics & Fundamentals",
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      color: "border-blue-500",
      bgGradient: "from-blue-500/20 to-transparent",
      description: "Understand the physics of flight before you ever pick up a tool. Learn why planes fly and what makes them stable.",
      topics: [
        "The Four Forces of Flight (Lift, Weight, Thrust, Drag)",
        "Airfoils and Bernoulli's Principle",
        "Understanding Center of Gravity (CG)",
        "Flight Control Surfaces (Aileron, Elevator, Rudder)",
        "Safety Guidelines and Local Regulations"
      ],
      action: { label: "Go to Knowledge Base", link: "/knowledge" }
    },
    {
      id: 2,
      title: "Phase 2: The Workshop",
      subtitle: "Materials, Electronics & Building",
      icon: <PenTool className="w-8 h-8 text-orange-400" />,
      color: "border-orange-500",
      bgGradient: "from-orange-500/20 to-transparent",
      description: "Learn about the hardware. Select your materials, understand RC electronics, and start your first foam board build.",
      topics: [
        "Foam Board vs. Balsa Wood Construction",
        "Understanding Brushless Motors, ESCs, and LiPo Batteries",
        "Radio Transmitters and Receivers",
        "Sizing servos and pushrod linkages",
        "Step-by-step Trainer Build Guide"
      ],
      action: { label: "Open Build Guide", link: "/build" }
    },
    {
      id: 3,
      title: "Phase 3: Virtual Training",
      subtitle: "Simulator Practice",
      icon: <Wind className="w-8 h-8 text-green-400" />,
      color: "border-green-500",
      bgGradient: "from-green-500/20 to-transparent",
      description: "Crashing in a simulator costs nothing. Build your muscle memory and learn orientation before flying the real thing.",
      topics: [
        "Transmitter stick mapping (Mode 1 vs Mode 2)",
        "Takeoff and basic pattern flying",
        "Maintaining orientation at a distance",
        "Crosswind landing techniques",
        "Emergency recovery (stall recovery)"
      ],
      action: { label: "Learn Flight Physics", link: "/flight-physics" }
    },
    {
      id: 4,
      title: "Phase 4: Maiden Flight",
      subtitle: "Pre-flight & First Sortie",
      icon: <PlaneTakeoff className="w-8 h-8 text-purple-400" />,
      color: "border-purple-500",
      bgGradient: "from-purple-500/20 to-transparent",
      description: "The moment of truth. How to prepare your plane, do final checks, and safely execute your first real-world flight.",
      topics: [
        "Pre-flight hardware checklist",
        "Range checking your radio receiver",
        "Checking wind direction and weather",
        "The hand-launch technique",
        "Trimming the aircraft in the air"
      ],
      action: { label: "View Pre-flight Checklist", link: "/knowledge#checklists" }
    },
    {
      id: 5,
      title: "Phase 5: Advanced Engineering",
      subtitle: "Design & Optimization",
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      color: "border-yellow-500",
      bgGradient: "from-yellow-500/20 to-transparent",
      description: "Move from building existing plans to designing your own custom aircraft using mathematical optimization.",
      topics: [
        "Using the Airfoil Analyzer for custom lift",
        "Calculating advanced Static Margins",
        "Designing for 3D Aerobatics vs. Speed",
        "FPV (First Person View) Integration",
        "Participating in Aeromodelling Competitions"
      ],
      action: { label: "Open Calculators", link: "/calculators" }
    }
  ]

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-4">
            The <span className="text-gradient">Learning Path</span>
          </h1>
          <p className="text-xl text-aviation-text-dim max-w-3xl mx-auto">
            A structured, engineering-based curriculum to take you from complete beginner to advanced RC aircraft designer.
          </p>
        </motion.div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Vertical Line for Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-aviation-primary/30 transform -translate-x-1/2 rounded-full"></div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 lg:space-y-24"
          >
            {phases.map((phase, index) => (
              <motion.div 
                key={phase.id} 
                variants={itemVariants}
                className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Center Node for Desktop */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-aviation-darker border-4 border-aviation-primary rounded-full items-center justify-center z-10">
                  <span className="font-display font-bold text-aviation-light">{phase.id}</span>
                </div>

                {/* Content Card */}
                <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pl-16' : 'lg:pr-16'}`}>
                  <div className={`card bg-gradient-to-br ${phase.bgGradient} border-l-4 ${phase.color}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-aviation-darker rounded-lg shadow-lg">
                        {phase.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-aviation-light">{phase.title}</h2>
                        <h3 className="text-aviation-accent font-semibold">{phase.subtitle}</h3>
                      </div>
                    </div>
                    
                    <p className="text-aviation-text-dim mb-6">
                      {phase.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <h4 className="font-semibold text-aviation-light flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-aviation-primary-light" />
                        Key Topics Covered:
                      </h4>
                      <ul className="space-y-2 text-sm text-aviation-text-dim ml-7">
                        {phase.topics.map((topic, i) => (
                          <li key={i} className="list-disc">{topic}</li>
                        ))}
                      </ul>
                    </div>

                    <Link 
                      to={phase.action.link}
                      className="inline-flex items-center gap-2 text-aviation-accent hover:text-aviation-light transition-colors font-semibold group"
                    >
                      {phase.action.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center p-8 bg-aviation-primary/10 rounded-2xl border border-aviation-primary/30"
        >
          <h2 className="text-3xl font-display font-bold text-aviation-light mb-4">
            Ready to start Phase 1?
          </h2>
          <p className="text-aviation-text-dim mb-8 max-w-2xl mx-auto">
            The best engineers understand the theory before they touch the materials. Let's dive into the aerodynamics of how wings generate lift.
          </p>
          <Link to="/knowledge" className="btn-primary inline-flex items-center gap-2">
            Go to Ground School
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}

export default LearningPathPage