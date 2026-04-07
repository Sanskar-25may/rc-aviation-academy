import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Plane } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

 const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/learning', label: 'Learning Path' },
    { to: '/calculators', label: 'Calculators' },
    { to: '/knowledge', label: 'Knowledge Base' },
    { to: '/build', label: 'Build Guide' },
    { to: '/configurator', label: 'Component Configurator' },
    { to: '/airfoil-analyzer', label: 'Airfoil Analyzer' },
    { to: '/design-studio', label: 'Design Studio' },
    { to: '/flight-physics', label: 'Flight Physics' },
    { to: '/community', label: 'Community' },
    { to: '/weather', label: 'Weather Dashboard' },
  
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-aviation-dark/95 backdrop-blur-lg border-b border-aviation-primary shadow-lg' 
          : 'bg-aviation-dark/80 backdrop-blur-md border-b border-aviation-primary/50'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Plane className="w-8 h-8 text-aviation-accent" />
            </motion.div>
            <span className="text-2xl font-display font-black text-aviation-accent tracking-wider">
              RC AVIATION
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link px-3 py-2 rounded-lg text-sm ${
                  location.pathname === link.to 
                    ? 'text-aviation-accent bg-aviation-primary/20' 
                    : 'hover:bg-aviation-primary/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-aviation-primary/20 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-aviation-light" />
            ) : (
              <Menu className="w-6 h-6 text-aviation-light" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className={`block px-4 py-3 rounded-lg text-base ${
                        location.pathname === link.to
                          ? 'text-aviation-accent bg-aviation-primary/20'
                          : 'hover:bg-aviation-primary/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

export default Navigation
