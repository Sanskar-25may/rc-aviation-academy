import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, BookOpen, Wind, Zap, Hammer, 
  Crosshair, ChevronRight, BookText, Filter
} from 'lucide-react'

const KnowledgeBasePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = [
    { id: 'All', icon: <BookOpen className="w-5 h-5" />, label: 'All Topics' },
    { id: 'Aerodynamics', icon: <Wind className="w-5 h-5" />, label: 'Aerodynamics' },
    { id: 'Electronics', icon: <Zap className="w-5 h-5" />, label: 'Electronics' },
    { id: 'Materials', icon: <Hammer className="w-5 h-5" />, label: 'Materials' },
    { id: 'Flight', icon: <Crosshair className="w-5 h-5" />, label: 'Flight Training' },
  ]

  const articles = [
    {
      id: 1,
      category: 'Aerodynamics',
      title: 'The Four Forces of Flight',
      readTime: '5 min read',
      description: 'Understand how Lift, Weight, Thrust, and Drag interact to keep an aircraft in the sky.',
      difficulty: 'Beginner'
    },
    {
      id: 2,
      category: 'Aerodynamics',
      title: 'Unpowered Glider Optimization',
      readTime: '12 min read',
      description: 'Advanced techniques for maximizing Lift-to-Drag (L/D) ratios, managing kinetic energy, and designing competitive, podium-worthy unpowered gliders.',
      difficulty: 'Advanced'
    },
    {
      id: 3,
      category: 'Electronics',
      title: 'LiPo Battery Safety & Math',
      readTime: '8 min read',
      description: 'Everything you need to know about cell counts (S), capacity (mAh), C-ratings, and safe charging practices.',
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      category: 'Electronics',
      title: 'Choosing the Right Motor and ESC',
      readTime: '10 min read',
      description: 'How to match your motor Kv, propeller size, and ESC amperage to your desired flight style.',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      category: 'Materials',
      title: 'Foam Board vs. Balsa Wood',
      readTime: '6 min read',
      description: 'A comparison of modern building materials, focusing on weight, repairability, and structural rigidity.',
      difficulty: 'Beginner'
    },
    {
      id: 6,
      category: 'Materials',
      title: 'Carbon Fiber Reinforcement Strategies',
      readTime: '7 min read',
      description: 'Where and how to use carbon fiber spars to prevent wing folding under high-G aerodynamic loads.',
      difficulty: 'Advanced'
    },
    {
      id: 7,
      category: 'Flight',
      title: 'Pre-Flight Checklist & Safety',
      readTime: '4 min read',
      description: 'The mandatory ground checks every pilot must perform before throttling up for a maiden flight.',
      difficulty: 'Beginner'
    },
    {
      id: 8,
      category: 'Aerodynamics',
      title: 'Understanding Center of Gravity (CG)',
      readTime: '9 min read',
      description: 'Why a nose-heavy plane flies poorly, but a tail-heavy plane flies only once. Calculating your Mean Aerodynamic Chord.',
      difficulty: 'Intermediate'
    },
    {
      id: 9,
      category: 'Flight',
      title: 'Recovering from a Tip Stall',
      readTime: '6 min read',
      description: 'Identifying the warning signs of an impending stall and the correct stick inputs to recover airspeed.',
      difficulty: 'Intermediate'
    }
  ]

  // Filter articles based on search query and active category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Intermediate': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'Advanced': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-aviation-light mb-6">
            <span className="text-gradient">Knowledge</span> Base
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-aviation-text-dim group-focus-within:text-aviation-accent transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search aerodynamics, materials, electronics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-aviation-dark/80 border-2 border-aviation-primary/50 rounded-2xl 
                       text-aviation-light placeholder-aviation-text-dim focus:outline-none focus:border-aviation-accent 
                       focus:shadow-[0_0_20px_rgba(255,107,53,0.2)] transition-all duration-300 text-lg"
            />
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/4"
          >
            <div className="card sticky top-24">
              <h3 className="font-display font-bold text-aviation-light mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-aviation-accent" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeCategory === category.id 
                        ? 'bg-aviation-primary/30 text-aviation-accent border border-aviation-primary' 
                        : 'text-aviation-text-dim hover:bg-aviation-primary/10 hover:text-aviation-light border border-transparent'
                    }`}
                  >
                    {category.icon}
                    <span className="font-semibold">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Articles Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-aviation-light">
                {activeCategory === 'All' ? 'Latest Articles' : `${activeCategory} Articles`}
              </h2>
              <span className="text-aviation-text-dim text-sm">
                Showing {filteredArticles.length} results
              </span>
            </div>

            <motion.div layout className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredArticles.map((article) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={article.id}
                    className="knowledge-card flex flex-col h-full group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-aviation-primary-light">
                        {article.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(article.difficulty)}`}>
                        {article.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-aviation-light mb-2 group-hover:text-aviation-accent transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-aviation-text-dim text-sm mb-6 flex-grow">
                      {article.description}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-aviation-primary/30 mt-auto">
                      <span className="text-xs text-aviation-text-dim flex items-center gap-1">
                        <BookText className="w-4 h-4" />
                        {article.readTime}
                      </span>
                      <span className="text-aviation-accent text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                        Read Article <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredArticles.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12 bg-aviation-dark/50 rounded-xl border border-aviation-primary/30"
                >
                  <Search className="w-12 h-12 text-aviation-text-dim mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-aviation-light mb-2">No articles found</h3>
                  <p className="text-aviation-text-dim">
                    Try adjusting your search terms or category filter.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBasePage