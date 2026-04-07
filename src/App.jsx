import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Loader from './components/Loader'
import DynamicBackground from './components/DynamicBackground'
import VideoBackground from './components/VideoBackground'
// (You can delete the import for DynamicBackground)

// Lazy Imports
const HomePage = lazy(() => import('./pages/HomePage'))
const LearningPathPage = lazy(() => import('./pages/LearningPathPage'))
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'))
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'))
const BuildGuidePage = lazy(() => import('./pages/BuildGuidePage'))
const AirfoilAnalyzerPage = lazy(() => import('./pages/AirfoilAnalyzerPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const DesignStudioPage = lazy(() => import('./pages/DesignStudioPage'))
const FlightPhysicsPage = lazy(() => import('./pages/FlightPhysicsPage'))
const ConfiguratorPage = lazy(() => import('./pages/ConfiguratorPage'))
const WeatherDashboardPage = lazy(() => import('./pages/WeatherDashboardPage'))

// Create a sub-component to handle the animated routes
const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/learning" element={<PageWrapper><LearningPathPage /></PageWrapper>} />
        <Route path="/calculators" element={<PageWrapper><CalculatorsPage /></PageWrapper>} />
        <Route path="/knowledge" element={<PageWrapper><KnowledgeBasePage /></PageWrapper>} />
        <Route path="/build" element={<PageWrapper><BuildGuidePage /></PageWrapper>} />
        <Route path="/airfoil-analyzer" element={<PageWrapper><AirfoilAnalyzerPage /></PageWrapper>} />
        <Route path="/community" element={<PageWrapper><CommunityPage /></PageWrapper>} />
        <Route path="/design-studio" element={<FullscreenPageWrapper><DesignStudioPage /></FullscreenPageWrapper>} />
        <Route path="/flight-physics" element={<PageWrapper><FlightPhysicsPage /></PageWrapper>} />
        <Route path="/configurator" element={<PageWrapper><ConfiguratorPage /></PageWrapper>} />
        <Route path="/weather" element={<PageWrapper><WeatherDashboardPage /></PageWrapper>} />

      </Routes>
    </AnimatePresence>
  )
}

// Wrapper to apply the transition animation to every page
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
)

// Wrapper that hides nav/footer chrome — used for full-bleed app pages
const FullscreenPageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full"
  >
    {children}
  </motion.div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <AppShell />
      </div>
    </Router>
  )
}

// AppShell conditionally shows Navigation and Footer based on route
const AppShell = () => {
  const location = useLocation()
  const isFullscreen = location.pathname === '/design-studio'
  const isHomePage = location.pathname === '/'

  return (
    <>
      {!isFullscreen && !isHomePage && <VideoBackground />}
      {!isFullscreen && <Navigation />}
      
      <main className={`relative z-10 flex flex-col ${isFullscreen ? '' : 'flex-grow'}`}>
        <Suspense fallback={<Loader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      
      {!isFullscreen && <Footer />}
    </>
  )
}

export default App