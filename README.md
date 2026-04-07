# RC Aviation Academy - Complete React Application

A comprehensive, production-ready web application for learning RC aviation, fixed-wing drones, and model aircraft design. Built with React, Tailwind CSS, and modern web technologies.

## 🚀 Features

### Core Learning Platform
- **Structured Learning Path**: Progressive curriculum from beginner to expert
- **Interactive Calculators**: Wing loading, power systems, CG, propeller selection, stability analysis
- **Knowledge Base**: Deep-dive articles on aerodynamics, materials, electronics
- **Build Guide**: Step-by-step construction tutorials with progress tracking

### Advanced Tools
- **3D Flight Simulator**: Practice flying with realistic physics before building
- **Airfoil Analyzer**: Analyze lift, drag, and performance of different airfoil profiles
- **Design Studio**: CAD-like tool for designing custom RC planes
- **Flight Physics Engine**: Interactive visualization of forces and flight dynamics

### Community Features
- **Forum & Discussions**: Connect with other builders and pilots
- **Project Gallery**: Share and showcase your builds
- **Event Calendar**: Find local flying events and competitions
- **Mentor Matching**: Connect with experienced pilots for guidance

## 📁 Project Structure

```
rc-aviation-academy/
├── public/
│   └── plane-icon.svg
├── src/
│   ├── components/
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   ├── calculators/
│   │   │   ├── WingLoadingCalculator.jsx
│   │   │   ├── PowerSystemCalculator.jsx
│   │   │   ├── CGCalculator.jsx
│   │   │   ├── PropellerCalculator.jsx
│   │   │   ├── StabilityCalculator.jsx
│   │   │   └── RangeCalculator.jsx
│   │   ├── simulator/
│   │   │   ├── FlightControls.jsx
│   │   │   ├── PlaneModel.jsx
│   │   │   └── Environment.jsx
│   │   ├── airfoil/
│   │   │   ├── AirfoilVisualizer.jsx
│   │   │   └── PerformanceChart.jsx
│   │   └── community/
│   │       ├── ProjectCard.jsx
│   │       ├── EventCard.jsx
│   │       └── ForumPost.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LearningPathPage.jsx
│   │   ├── CalculatorsPage.jsx
│   │   ├── KnowledgeBasePage.jsx
│   │   ├── BuildGuidePage.jsx
│   │   ├── FlightSimulatorPage.jsx
│   │   ├── AirfoilAnalyzerPage.jsx
│   │   ├── CommunityPage.jsx
│   │   ├── DesignStudioPage.jsx
│   │   └── FlightPhysicsPage.jsx
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── physics.js
│   │   └── airfoilData.js
│   ├── data/
│   │   ├── airfoils.json
│   │   ├── buildGuides.json
│   │   └── learningContent.json
│   ├── hooks/
│   │   ├── useFlightPhysics.js
│   │   ├── useLocalStorage.js
│   │   └── useScrollReveal.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

```bash
# Navigate to project directory
cd rc-aviation-academy

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:3000`

## 🎨 Technology Stack

### Core Technologies
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework with custom aviation theme
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions

### Data Visualization & 3D
- **Recharts**: Interactive charts for performance data
- **Three.js**: 3D graphics for flight simulator
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for react-three-fiber

### UI Components
- **Lucide React**: Beautiful icon library
- **Custom Components**: Aviation-themed UI components

## 📊 Calculator Details

### 1. Wing Loading Calculator
- Calculates wing area, wing loading, stall speed
- Real-time performance chart showing lift vs speed
- Flight category recommendations
- Airfoil type comparisons

### 2. Power System Calculator
- Motor sizing based on weight and flight style
- ESC rating recommendations
- Battery capacity calculations
- Current draw estimates
- Propeller compatibility

### 3. CG Calculator
- Center of gravity positioning
- Balance recommendations by airfoil type
- Visual CG diagram
- Stability analysis

### 4. Propeller Calculator
- RPM calculations
- Propeller diameter and pitch recommendations
- Static thrust estimates
- Thrust-to-weight ratio
- Pitch speed calculations

### 5. Stability Calculator
- Longitudinal, lateral, and directional stability
- Control surface sizing
- Dihedral angle recommendations
- Tail moment arm calculations

### 6. Flight Range Calculator
- Battery endurance estimation
- Range calculations based on cruise speed
- Power consumption analysis
- Efficiency optimization

## 🎮 Flight Simulator Features

The 3D flight simulator includes:
- Realistic flight physics (lift, drag, thrust, gravity)
- Multiple camera angles (chase, cockpit, orbit)
- Different aircraft models
- Environmental effects (wind, thermals)
- Performance telemetry display
- Crash detection and reset
- Training missions and scenarios

## 🔬 Airfoil Analyzer Features

- Visualize airfoil cross-sections
- Analyze lift and drag coefficients
- Compare multiple airfoils
- Reynolds number effects
- Stall characteristics
- Recommended applications

## 🎨 Design Studio Features

- Visual aircraft designer
- Parametric wing design
- Fuselage modeling
- Component placement
- Weight and balance calculator
- Export specifications
- 3D preview

## 📚 Knowledge Base Topics

### Aerodynamics
- Four forces of flight
- Bernoulli's principle
- Angle of attack
- Airfoil theory
- Boundary layer and Reynolds number

### Materials
- Foam board (DTFB)
- Balsa wood
- Plywood
- Carbon fiber
- EPP foam
- Covering materials

### Electronics
- Radio systems (transmitter/receiver)
- ESC (Electronic Speed Controller)
- Motors (brushed vs brushless)
- Servos
- Batteries (LiPo safety)
- Wiring and connections

### Building Techniques
- Wing construction methods
- Fuselage building
- Control surface installation
- Electronics mounting
- Finishing techniques

### Flying Techniques
- Pre-flight checks
- Takeoff procedures
- Basic maneuvers
- Landing approach
- Emergency procedures
- Aerobatic maneuvers

## 🎯 Learning Path Structure

### Phase 1: Fundamentals (Beginner)
1. Introduction to RC aviation
2. Basic aerodynamics
3. Component overview
4. Safety and regulations
5. Choosing your first plane

### Phase 2: Theory (Intermediate)
1. Advanced aerodynamics
2. Stability and control
3. Power system design
4. Weight and balance
5. Flight planning

### Phase 3: Building (Hands-on)
1. Reading plans
2. Material selection
3. Construction techniques
4. Electronics installation
5. Setup and tuning

### Phase 4: Flying (Practical)
1. Simulator practice
2. Maiden flight preparation
3. First flights
4. Skill progression
5. Troubleshooting

### Phase 5: Advanced (Expert)
1. Custom design
2. Performance optimization
3. Aerobatics
4. FPV integration
5. Competition flying

## 🌐 Community Features

### Forum System
- Topic-based discussions
- Question and answer format
- Expert moderators
- Search functionality
- User profiles and reputation

### Project Gallery
- Photo and video uploads
- Build logs
- Technical specifications
- Comments and feedback
- Featured projects

### Events
- Local flying meetups
- Competitions
- Workshops and classes
- Online webinars
- Annual conferences

### Mentorship
- Connect with experienced pilots
- One-on-one guidance
- Build assistance
- Flight instruction
- Design consultation

## 🔧 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the aviation theme:

```javascript
aviation: {
  dark: '#0d1b2a',
  primary: '#0a4d8f',
  accent: '#ff6b35',
  // ... more colors
}
```

### Adding New Calculators
1. Create component in `src/components/calculators/`
2. Import in `CalculatorsPage.jsx`
3. Add to calculators array with id, label, and component

### Adding New Airfoils
Add airfoil data to `src/data/airfoils.json`:

```json
{
  "name": "NACA 2412",
  "type": "Semi-Symmetrical",
  "thickness": 12,
  "camber": 2,
  "clMax": 1.6,
  "coordinates": [[x, y], ...]
}
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

## ⚡ Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Debounced input handlers

## 🔒 Safety Guidelines

The platform emphasizes safety with:
- Pre-flight checklists
- Battery safety information
- Weather considerations
- Airspace regulations
- Emergency procedures
- Risk assessment tools

## 🤝 Contributing

We welcome contributions! Areas for development:
- Additional calculators
- More airfoil profiles
- Enhanced 3D simulator
- Community features
- Translations
- Documentation

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- Documentation: `/knowledge`
- Community Forum: `/community`
- Email: support@rcaviation.academy
- Discord: [Join our server]

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] Advanced flight missions
- [ ] AI design assistant
- [ ] Multiplayer simulator

### Q2 2025
- [ ] VR flight simulator
- [ ] CAD file export
- [ ] Video tutorials
- [ ] Certification program

### Q3 2025
- [ ] Hardware integration (flight controllers)
- [ ] Telemetry logging
- [ ] Competition management
- [ ] Marketplace for plans

## 📞 Contact

- Website: https://rcaviation.academy
- Email: hello@rcaviation.academy
- Twitter: @rcaviationacad
- YouTube: RC Aviation Academy

---

**Built with ❤️ for the RC aviation community**

Happy Flying! ✈️
