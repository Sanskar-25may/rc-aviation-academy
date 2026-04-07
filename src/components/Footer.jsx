import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Youtube, Mail, Plane } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Learn',
      links: [
        { to: '/learning', label: 'Learning Path' },
        { to: '/knowledge', label: 'Knowledge Base' },
        { to: '/flight-physics', label: 'Flight Physics' },
        { to: '/build', label: 'Build Guide' },
      ]
    },
    {
      title: 'Tools',
      links: [
        { to: '/calculators', label: 'Calculators' },
        { to: '/airfoil-analyzer', label: 'Airfoil Analyzer' },
        { to: '/design-studio', label: 'Design Studio' },
      ]
    },
    {
      title: 'Community',
      links: [
        { to: '/community', label: 'Forum' },
        { to: '/community#projects', label: 'Projects Gallery' },
        { to: '/community#events', label: 'Events' },
        { to: '/community#mentors', label: 'Find a Mentor' },
      ]
    }
  ]

  return (
    <footer className="relative z-10 bg-aviation-dark border-t border-aviation-primary mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Plane className="w-8 h-8 text-aviation-accent" />
              <span className="text-2xl font-display font-black text-aviation-accent tracking-wider">
                RC AVIATION
              </span>
            </div>
            <p className="text-aviation-text-dim mb-4 max-w-md">
              Master fixed-wing aviation from aerodynamics to first flight. 
              Comprehensive learning platform for RC planes and drones.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-aviation-primary/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-aviation-light" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-aviation-primary/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-aviation-light" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-aviation-primary/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-aviation-light" />
              </a>
              <a 
                href="mailto:contact@rcaviation.academy" 
                className="p-2 rounded-lg hover:bg-aviation-primary/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-aviation-light" />
              </a>
            </div>
          </div>

          {/* Link Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-display font-bold text-aviation-accent mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-aviation-text-dim hover:text-aviation-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-aviation-primary/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-aviation-text-dim text-sm">
              © {currentYear} RC Aviation Academy. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-aviation-text-dim hover:text-aviation-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-aviation-text-dim hover:text-aviation-accent transition-colors">
                Terms of Service
              </Link>
              <Link to="/safety" className="text-aviation-text-dim hover:text-aviation-accent transition-colors">
                Safety Guidelines
              </Link>
            </div>
          </div>
          <p className="text-aviation-text-dim text-xs text-center mt-4">
            Always fly safely and follow local regulations. Check with your local aviation authority.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
