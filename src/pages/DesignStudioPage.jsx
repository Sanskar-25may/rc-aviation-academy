import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import {
  OrbitControls, Grid, Environment,
  ContactShadows, Preload
} from '@react-three/drei'
import * as THREE from 'three'
import {
  Sliders, Info, Ruler, Settings, Calculator, AlertTriangle,
  FileText, Eye, RotateCcw, Layers, ChevronRight, Cpu,
  Grid3X3, Zap, Wind, FlipHorizontal
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Coordinate system: nose=-Z, tail=+Z, right=+X, up=+Y ──

// NACA 2412 (cambered) normalized coords
const NACA_C_U = [[0,0],[0.025,0.0399],[0.05,0.0555],[0.1,0.0768],[0.15,0.0913],[0.2,0.1007],[0.3,0.1113],[0.4,0.1151],[0.5,0.1128],[0.6,0.1049],[0.7,0.0921],[0.8,0.0741],[0.9,0.0484],[1.0,0.0013]]
const NACA_C_L = [[0,0],[0.025,-0.0081],[0.05,-0.0120],[0.1,-0.0160],[0.15,-0.0177],[0.2,-0.0194],[0.3,-0.0199],[0.4,-0.0169],[0.5,-0.0127],[0.6,-0.0089],[0.7,-0.0057],[0.8,-0.0031],[0.9,-0.0012],[1.0,0.0013]]

// NACA 0012 (symmetric) for tail surfaces
const NACA_S_U = [[0,0],[0.025,0.0298],[0.05,0.0418],[0.1,0.0587],[0.2,0.0788],[0.3,0.0888],[0.4,0.0935],[0.5,0.0935],[0.6,0.0888],[0.7,0.0794],[0.8,0.0652],[0.9,0.0440],[1.0,0]]
const NACA_S_L = NACA_S_U.map(([x,y]) => [x,-y])

// Build wing/tail BufferGeometry
// span: along +X (for wings) or +Y (for v-fin)
// chord: along +Z (LE at z=0, TE at z=chord)
// thickness: along ±Y (for wings) or ±X (for v-fin)
function buildAeroGeo(spanLen, rootChord, tipChord, dihedralDeg, sweepDeg, upper, lower) {
  const NS = 14
  const NC = upper.length
  const dhRad = THREE.MathUtils.degToRad(dihedralDeg)
  const swRad = THREE.MathUtils.degToRad(sweepDeg)
  const pos = []
  const idx = []

  for (let si = 0; si <= NS; si++) {
    const t     = si / NS
    const xSpan = t * spanLen
    const yDih  = Math.sin(dhRad) * xSpan
    const chord = rootChord + (tipChord - rootChord) * t
    const zSweep = Math.tan(swRad) * xSpan  // positive = LE swept back

    // Upper surface: NC verts; x=xSpan, y=yDih+profile*chord, z=zSweep+xc*chord
    for (let ci = 0; ci < NC; ci++) {
      const [xc, yu] = upper[ci]
      pos.push(xSpan, yDih + yu * chord, zSweep + xc * chord)
    }
    // Lower surface
    for (let ci = 0; ci < NC; ci++) {
      const [xc, yl] = lower[ci]
      pos.push(xSpan, yDih + yl * chord, zSweep + xc * chord)
    }
  }

  const stride = NC * 2
  for (let si = 0; si < NS; si++) {
    const A = si * stride
    const B = (si + 1) * stride
    for (let ci = 0; ci < NC - 1; ci++) {
      // Upper surface
      idx.push(A+ci, B+ci, A+ci+1,  B+ci, B+ci+1, A+ci+1)
      // Lower surface (flipped winding)
      idx.push(A+NC+ci, A+NC+ci+1, B+NC+ci,  B+NC+ci, A+NC+ci+1, B+NC+ci+1)
    }
  }
  // Root cap (si=0)
  for (let ci = 0; ci < NC - 1; ci++) {
    idx.push(ci, NC+ci, ci+1,  ci+1, NC+ci, NC+ci+1)
  }
  // Tip cap (si=NS)
  const T = NS * stride
  for (let ci = 0; ci < NC - 1; ci++) {
    idx.push(T+ci, T+ci+1, T+NC+ci,  T+ci+1, T+NC+ci+1, T+NC+ci)
  }
  // Trailing-edge seam
  for (let si = 0; si < NS; si++) {
    const a = si*stride + NC-1, b = si*stride + stride-1
    const c = (si+1)*stride + NC-1, d = (si+1)*stride + stride-1
    idx.push(a, b, c,  b, d, c)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

// Vertical fin: same idea but span goes along +Y, chord along +Z, thickness along ±X
function buildFinGeo(height, rootChord, tipChord, sweepDeg) {
  const NS = 10, NC = NACA_S_U.length
  const swRad = THREE.MathUtils.degToRad(sweepDeg)
  const pos = [], idx = []

  for (let si = 0; si <= NS; si++) {
    const t = si / NS
    const y = t * height
    const chord = rootChord + (tipChord - rootChord) * t
    const zSweep = Math.tan(swRad) * y
    for (let ci = 0; ci < NC; ci++) {
      const [xc, th] = NACA_S_U[ci]
      pos.push( th * chord, y, zSweep + xc * chord)  // +X side
    }
    for (let ci = 0; ci < NC; ci++) {
      const [xc, th] = NACA_S_U[ci]
      pos.push(-th * chord, y, zSweep + xc * chord)  // -X side
    }
  }

  const stride = NC * 2
  for (let si = 0; si < NS; si++) {
    const A = si * stride, B = (si+1) * stride
    for (let ci = 0; ci < NC - 1; ci++) {
      idx.push(A+ci, A+ci+1, B+ci,  B+ci, A+ci+1, B+ci+1)
      idx.push(A+NC+ci, B+NC+ci, A+NC+ci+1,  B+NC+ci, B+NC+ci+1, A+NC+ci+1)
    }
  }
  for (let ci = 0; ci < NC-1; ci++) {
    idx.push(ci, ci+1, NC+ci,  ci+1, NC+ci+1, NC+ci)
  }
  const T = NS * stride
  for (let ci = 0; ci < NC-1; ci++) {
    idx.push(T+ci, T+NC+ci, T+ci+1,  T+ci+1, T+NC+ci, T+NC+ci+1)
  }
  for (let si = 0; si < NS; si++) {
    const a=si*stride+NC-1, b=si*stride+stride-1
    const c=(si+1)*stride+NC-1, d=(si+1)*stride+stride-1
    idx.push(a,b,c, b,d,c)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

// ─── WING PANEL (right side; left is scale X=-1) ─────────────────────────────
const WingPanel = ({ semiSpan, chord, tipChord, dihedral, sweep, aileronPct = 25, color, accentColor }) => {
  const geo = useMemo(
    () => buildAeroGeo(semiSpan, chord, tipChord, dihedral, sweep, NACA_C_U, NACA_C_L),
    [semiSpan, chord, tipChord, dihedral, sweep]
  )
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.35, metalness: 0.05, clearcoat: 0.45,
    clearcoatRoughness: 0.2, side: THREE.DoubleSide
  }), [color])
  const aileronMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: accentColor, roughness: 0.2, metalness: 0.1
  }), [accentColor])

  const aileronChordDepth = chord * (aileronPct / 100) * 0.7

  return (
    <>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {/* Aileron stripe: outer 40% span, rear X% chord */}
      <mesh position={[semiSpan * 0.73, chord * 0.006, chord * (1 - aileronPct / 100 * 0.7 + 0.05)]} castShadow>
        <boxGeometry args={[semiSpan * 0.42, chord * 0.012, aileronChordDepth]} />
        <primitive object={aileronMat} />
      </mesh>
    </>
  )
}

// ─── FUSELAGE ───────────────────────────────────────────────────────────────
const Fuselage = ({ length, color, accentColor }) => {
  const fuseGeo = useMemo(() => {
    const profile = [
      [0.00,0.004],[0.04,0.028],[0.10,0.044],[0.18,0.052],
      [0.28,0.056],[0.38,0.054],[0.50,0.050],[0.62,0.044],
      [0.74,0.036],[0.84,0.026],[0.92,0.018],[0.97,0.012],[1.00,0.008]
    ]
    const pts = profile.map(([z,r]) => new THREE.Vector2(r * length, z * length - length * 0.5))
    const geo = new THREE.LatheGeometry(pts, 28)
    geo.rotateX(Math.PI / 2)
    return geo
  }, [length])

  const fuseMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.3, metalness: 0.06, clearcoat: 0.5,
    clearcoatRoughness: 0.15, envMapIntensity: 1.4
  }), [color])

  // Canopy: ellipsoid bubble above forward fuselage
  const canopyGeo = useMemo(() => new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), [])

  return (
    <group>
      <mesh geometry={fuseGeo} material={fuseMat} castShadow receiveShadow />

      {/* Canopy bubble */}
      <mesh
        geometry={canopyGeo}
        position={[0, length * 0.056, -length * 0.18]}
        scale={[length * 0.038, length * 0.03, length * 0.11]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#1a3a6b" roughness={0.05} metalness={0}
          transmission={0.55} transparent opacity={0.88}
          clearcoat={1} envMapIntensity={2}
        />
      </mesh>

      {/* Accent cheatline */}
      <mesh position={[0, length * 0.052, 0]} castShadow>
        <boxGeometry args={[length * 0.008, length * 0.004, length * 0.72]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─── HORIZONTAL STABILIZER ────────────────────────────────────────────────────
const HorizStab = ({ span, chord, sweep = 5, elevatorPct = 30, color, accentColor }) => {
  const semiSpan = span / 2
  // Right panel geo (left is mirrored)
  const geo = useMemo(
    () => buildAeroGeo(semiSpan, chord, chord * 0.6, 0, sweep, NACA_S_U, NACA_S_L),
    [semiSpan, chord, sweep]
  )
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.4, metalness: 0.04, clearcoat: 0.3, side: THREE.DoubleSide
  }), [color])
  const elvMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: accentColor, roughness: 0.25, metalness: 0.1
  }), [accentColor])

  return (
    <group>
      {/* Right panel */}
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {/* Left panel */}
      <group scale={[-1, 1, 1]}>
        <mesh geometry={geo} material={mat} castShadow receiveShadow />
      </group>
      {/* Elevator highlights */}
      <mesh position={[0, chord * 0.006, chord * (1 - elevatorPct / 100 * 0.5 + 0.55)]} castShadow>
        <boxGeometry args={[semiSpan * 1.7, chord * 0.01, chord * (elevatorPct / 100 * 0.6)]} />
        <primitive object={elvMat} />
      </mesh>
    </group>
  )
}

// ─── VERTICAL FIN ─────────────────────────────────────────────────────────────
const VertFin = ({ height, chord, sweep = 18, rudderPct = 35, color, accentColor }) => {
  const geo = useMemo(
    () => buildFinGeo(height, chord, chord * 0.55, sweep),
    [height, chord, sweep]
  )
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.35, metalness: 0.05, clearcoat: 0.35, side: THREE.DoubleSide
  }), [color])
  const rudMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: accentColor, roughness: 0.2, metalness: 0.1
  }), [accentColor])

  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {/* Rudder highlight */}
      <mesh position={[0, height * 0.5, chord * (1 - rudderPct / 100 * 0.5 + 0.55)]} castShadow>
        <boxGeometry args={[chord * 0.015, height * 0.8, chord * (rudderPct / 100 * 0.6)]} />
        <primitive object={rudMat} />
      </mesh>
    </group>
  )
}

// ─── MOTOR + PROP ─────────────────────────────────────────────────────────────
const Motor = ({ fuseLength, propDiameter = 22 }) => {
  const propR = propDiameter / 100 / 2
  return (
  <group position={[0, 0, -fuseLength * 0.52]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.038, 20]} />
      <meshPhysicalMaterial color="#1a1a2e" roughness={0.2} metalness={0.8} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.034]} castShadow>
      <coneGeometry args={[0.018, 0.038, 16]} />
      <meshPhysicalMaterial color="#e0e0e0" roughness={0.1} metalness={0.7} clearcoat={1} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]}>
      <cylinderGeometry args={[propR, propR, 0.002, 32]} />
      <meshPhysicalMaterial color="#aaaaaa" transparent opacity={0.15} roughness={0} />
    </mesh>
    {[-1, 1].map(s => (
      <mesh key={s} position={[s * propR * 0.55, 0, -0.014]} rotation={[Math.PI / 2, s * 0.14, 0]} castShadow>
        <boxGeometry args={[propR * 0.9, 0.002, propR * 0.16]} />
        <meshPhysicalMaterial color="#111" roughness={0.4} metalness={0.3} />
      </mesh>
    ))}
  </group>
  )
}

// ─── LANDING GEAR ─────────────────────────────────────────────────────────────
const LandingGear = ({ fuseLength }) => (
  <group>
    {[-1, 1].map(s => (
      <group key={s} position={[s * 0.065, -0.038, -fuseLength * 0.1]}>
        <mesh rotation={[0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.09, 8]} />
          <meshPhysicalMaterial color="#999" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.05, 0.005]}>
          <torusGeometry args={[0.019, 0.006, 8, 20]} />
          <meshPhysicalMaterial color="#222" roughness={0.9} />
        </mesh>
      </group>
    ))}
    <group position={[0, -0.038, -fuseLength * 0.37]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.003, 0.003, 0.07, 8]} />
        <meshPhysicalMaterial color="#999" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <torusGeometry args={[0.014, 0.005, 8, 16]} />
        <meshPhysicalMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  </group>
)

// ─── FULL AIRCRAFT ASSEMBLY ───────────────────────────────────────────────────
const ParametricPlane = ({ config, materialSet }) => {
  const spanM      = config.wingSpan / 100
  const chordM     = config.wingChord / 100
  const tipChordM  = (config.wingTipChord ?? config.wingChord * 0.55) / 100
  const fuseM      = config.fuselageLength / 100
  const tailSpanM  = config.tailSpan / 100
  const tailChordM = config.tailChord / 100
  const finHeightM = (config.finHeight ?? config.tailSpan * 0.48) / 100
  const finChordM  = (config.finChord  ?? config.tailChord * 1.15) / 100
  const semiSpan   = spanM / 2

  const colors = {
    white:  { body: '#e8e9ea', accent: '#e85d04' },
    carbon: { body: '#1c1e21', accent: '#00b4d8' },
    balsa:  { body: '#c4935a', accent: '#2d6a4f' },
  }
  const pal = colors[materialSet] || colors.white

  const wingZ = -fuseM * 0.5 + fuseM * 0.30
  const wingY = 0

  return (
    <group position={[0, 0.06, 0]}>
      {/* FUSELAGE */}
      <Fuselage length={fuseM} color={pal.body} accentColor={pal.accent} />

      {/* RIGHT WING */}
      <group position={[0, wingY, wingZ]}>
        <WingPanel
          semiSpan={semiSpan}
          chord={chordM}
          tipChord={tipChordM}
          dihedral={config.dihedral ?? 3}
          sweep={config.sweep ?? 5}
          color={pal.body}
          accentColor={pal.accent}
          aileronPct={config.aileronSize ?? 25}
        />
      </group>

      {/* LEFT WING */}
      <group position={[0, wingY, wingZ]} scale={[-1, 1, 1]}>
        <WingPanel
          semiSpan={semiSpan}
          chord={chordM}
          tipChord={tipChordM}
          dihedral={config.dihedral ?? 3}
          sweep={config.sweep ?? 5}
          color={pal.body}
          accentColor={pal.accent}
          aileronPct={config.aileronSize ?? 25}
        />
      </group>

      {/* HORIZONTAL STABILIZER */}
      <group position={[0, fuseM * 0.01, fuseM * 0.38]}>
        <HorizStab
          span={tailSpanM}
          chord={tailChordM}
          sweep={config.tailSweep ?? 5}
          elevatorPct={config.elevatorSize ?? 30}
          color={pal.body}
          accentColor={pal.accent}
        />
      </group>

      {/* VERTICAL FIN */}
      <group position={[0, fuseM * 0.018, fuseM * 0.32]}>
        <VertFin
          height={finHeightM}
          chord={finChordM}
          sweep={config.finSweep ?? 18}
          rudderPct={config.rudderSize ?? 35}
          color={pal.accent}
          accentColor={pal.body}
        />
      </group>

      {/* MOTOR + PROP */}
      <Motor fuseLength={fuseM} propDiameter={config.propDiameter ?? 22} />

      {/* LANDING GEAR */}
      <LandingGear fuseLength={fuseM} />
    </group>
  )
}

// ─── CAMERA PRESETS ──────────────────────────────────────────────────────────
const CameraController = ({ preset }) => {
  const { camera } = useThree()
  useEffect(() => {
    const positions = {
      '3d':   [1.4, 0.9, 1.8],
      'front': [0, 0, 2.5],
      'side':  [2.5, 0.2, 0],
      'top':   [0, 2.8, 0.01],
    }
    const [x, y, z] = positions[preset] || positions['3d']
    camera.position.set(x, y, z)
    camera.lookAt(0, 0.1, 0)
  }, [preset, camera])
  return null
}

// ─── CANVAS SCREENSHOT HOOK ──────────────────────────────────────────────────
const CanvasCapturer = ({ onCapture }) => {
  const { gl } = useThree()
  useEffect(() => {
    if (onCapture) {
      onCapture(() => {
        gl.render(gl.domElement.ownerDocument.__r3fRoot?.fiber?.current, null)
        return gl.domElement.toDataURL('image/png')
      })
    }
  }, [gl, onCapture])
  return null
}

// ─── MAIN STUDIO COMPONENT ────────────────────────────────────────────────────
const DesignStudioPage = () => {
  const [config, setConfig] = useState({
    // Wing
    wingSpan: 120,
    wingChord: 18,
    wingTipChord: 10,
    dihedral: 3,
    sweep: 5,
    // Fuselage
    fuselageLength: 90,
    // Horizontal Stabilizer
    tailSpan: 40,
    tailChord: 12,
    tailSweep: 5,
    // Vertical Fin
    finHeight: 18,
    finChord: 14,
    finSweep: 18,
    // Control Surfaces
    aileronSize: 25,
    elevatorSize: 30,
    rudderSize: 35,
    // Propulsion
    propDiameter: 22,
  })
  const [materialSet, setMaterialSet] = useState('white')
  const [viewPreset, setViewPreset] = useState('3d')
  const [showGrid, setShowGrid] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)
  const captureRef = useRef(null)
  const orbitRef = useRef(null)

  // ── Standard Model Database ────────────────────────────────────────────────
  const STANDARD_MODELS = [
    {
      name: 'Hobby King Bixler 2',  type: 'Glider / FPV',
      wingSpan: 140, wingChord: 20, fuselageLength: 95, tailSpan: 45, tailChord: 13,
      dihedral: 4, sweep: 3, aspectRatio: 9.8, tailVolume: 0.42, wingArea: 28,
      desc: 'Beginner-friendly EPO glider with high aspect ratio wing and gentle handling.',
      color: '#4ade80'
    },
    {
      name: 'FT Flyer',  type: 'Trainer',
      wingSpan: 100, wingChord: 20, fuselageLength: 70, tailSpan: 35, tailChord: 12,
      dihedral: 6, sweep: 0, aspectRatio: 5.0, tailVolume: 0.38, wingArea: 20,
      desc: 'Classic high-wing foam trainer with high dihedral for self-leveling stability.',
      color: '#60a5fa'
    },
    {
      name: 'Parkzone T-28 Trojan', type: 'Warbird',
      wingSpan: 106, wingChord: 18, fuselageLength: 88, tailSpan: 38, tailChord: 13,
      dihedral: 3, sweep: 8, aspectRatio: 6.2, tailVolume: 0.44, wingArea: 18,
      desc: 'Classic warbird with semi-elliptical wings and balanced aerobatic capability.',
      color: '#f59e0b'
    },
    {
      name: 'E-Flite Apprentice S', type: 'Trainer',
      wingSpan: 152, wingChord: 22, fuselageLength: 108, tailSpan: 55, tailChord: 16,
      dihedral: 5, sweep: 2, aspectRatio: 9.6, tailVolume: 0.50, wingArea: 33,
      desc: 'SAFE-equipped beginner trainer with large wing and forgiving flight envelope.',
      color: '#a78bfa'
    },
    {
      name: 'Zephyr II Sport', type: 'Sport / Aerobatic',
      wingSpan: 100, wingChord: 16, fuselageLength: 90, tailSpan: 36, tailChord: 12,
      dihedral: 1, sweep: 10, aspectRatio: 6.25, tailVolume: 0.41, wingArea: 16,
      desc: 'Mid-wing sport plane with swept wings for crisp roll response and aerobatics.',
      color: '#f87171'
    },
    {
      name: 'FT Explorer',  type: 'FPV / Cruiser',
      wingSpan: 130, wingChord: 22, fuselageLength: 100, tailSpan: 48, tailChord: 14,
      dihedral: 3, sweep: 5, aspectRatio: 7.6, tailVolume: 0.45, wingArea: 28.6,
      desc: 'High-wing pod-and-boom FPV cruiser with good stability and long range.',
      color: '#34d399'
    },
    {
      name: 'Multiplex Acromaster', type: 'Aerobatic',
      wingSpan: 96, wingChord: 15, fuselageLength: 85, tailSpan: 34, tailChord: 12,
      dihedral: 0, sweep: 5, aspectRatio: 6.1, tailVolume: 0.40, wingArea: 14.4,
      desc: 'Symmetrical wing aerobatic model with zero dihedral for neutral roll stability.',
      color: '#fb923c'
    },
  ]

  const matchedModel = useMemo(() => {
    const wA = config.wingSpan * config.wingChord / 100
    const ar = (config.wingSpan ** 2) / (config.wingSpan * config.wingChord)
    const tv = (config.tailSpan * config.tailChord * config.fuselageLength * 0.55) / (config.wingSpan * config.wingChord * config.wingChord)
    const scored = STANDARD_MODELS.map(m => {
      const dSpan    = Math.abs(config.wingSpan - m.wingSpan) / m.wingSpan
      const dChord   = Math.abs(config.wingChord - m.wingChord) / m.wingChord
      const dFuse    = Math.abs(config.fuselageLength - m.fuselageLength) / m.fuselageLength
      const dDih     = Math.abs(config.dihedral - m.dihedral) / Math.max(m.dihedral, 1)
      const dSweep   = Math.abs((config.sweep ?? 5) - m.sweep) / Math.max(m.sweep, 1)
      const dAR      = Math.abs(ar - m.aspectRatio) / m.aspectRatio
      const score    = 1 - (dSpan*0.25 + dChord*0.15 + dFuse*0.1 + dDih*0.15 + dSweep*0.1 + dAR*0.25)
      return { ...m, score: Math.max(0, Math.min(1, score)) }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored[0]
  }, [config])

  const analysis = useMemo(() => {
    const wingAreaCm = config.wingSpan * config.wingChord
    const wingAreaDm = wingAreaCm / 100
    const aspectRatio = (config.wingSpan ** 2) / wingAreaCm
    const taperRatio  = config.wingTipChord / config.wingChord
    const tailMomentCm = config.fuselageLength * 0.55
    const tailAreaCm   = config.tailSpan * config.tailChord
    const finAreaCm    = config.finHeight * config.finChord
    const tailVolume   = (tailAreaCm * tailMomentCm) / (wingAreaCm * config.wingChord)
    const finVolume    = (finAreaCm * tailMomentCm) / (wingAreaCm * config.wingSpan)
    const wingLoadingEst = 250 / wingAreaDm
    const rho = 1.225
    const CLmax = 1.4
    const stallSpeedMs = Math.sqrt((2 * wingLoadingEst * 0.001 * 9.81) / (rho * CLmax * 0.01)) // simplified
    const pitchStability = tailVolume >= 0.3 && tailVolume <= 0.65 ? 'Stable' : tailVolume < 0.3 ? 'Unstable' : 'Overstable'
    const rollStability  = config.dihedral >= 2 && config.dihedral <= 7 ? 'Good' : config.dihedral < 2 ? 'Neutral' : 'High Pendulum'
    const cgPct = 25 + taperRatio * 5  // estimated CG as % MAC

    const warnings = []
    if (tailVolume < 0.3) warnings.push('Tail volume too low — pitchly unstable.')
    if (tailVolume > 0.7) warnings.push('Tail volume too high — sluggish pitch response.')
    if (aspectRatio > 10) warnings.push('Very high AR — wing spar reinforcement needed.')
    if (config.wingTipChord > config.wingChord) warnings.push('Tip chord exceeds root chord — taper is inverted!')
    if (config.dihedral > 10) warnings.push('Excessive dihedral — strong pendulum effect.')
    if (config.sweep > 20 && aspectRatio > 8) warnings.push('High sweep + high AR may cause tip stall.')

    let stabilityRating = 'GOOD'
    if (warnings.length > 0) stabilityRating = 'CHECK'
    if (tailVolume < 0.2 || config.wingTipChord > config.wingChord) stabilityRating = 'DANGER'

    return {
      wingAreaDm:    wingAreaDm.toFixed(1),
      aspectRatio:   aspectRatio.toFixed(2),
      taperRatio:    taperRatio.toFixed(2),
      tailVolume:    tailVolume.toFixed(3),
      finVolume:     finVolume.toFixed(3),
      wingLoading:   wingLoadingEst.toFixed(1),
      stallSpeed:    stallSpeedMs.toFixed(1),
      pitchStability,
      rollStability,
      cgPct:         cgPct.toFixed(1),
      warnings,
      stabilityRating,
    }
  }, [config])

  const handleSlider = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) }))
    setAutoRotate(false)
  }

  // ── PDF Report Generation ──────────────────────────────────────────────────
  const generateReport = useCallback(async () => {
    setIsGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, H = 297

      // helpers
      const hex2rgb = (hex) => {
        const r = parseInt(hex.slice(1,3),16)
        const g = parseInt(hex.slice(3,5),16)
        const b = parseInt(hex.slice(5,7),16)
        return [r,g,b]
      }

      // ── PAGE 1: COVER ────────────────────────────────────────────────────
      doc.setFillColor(13, 27, 42)
      doc.rect(0, 0, W, H, 'F')

      // Header band
      doc.setFillColor(30, 107, 184)
      doc.rect(0, 0, W, 38, 'F')
      doc.setFillColor(255, 107, 53)
      doc.rect(0, 35, W, 3, 'F')

      doc.setTextColor(255,255,255)
      doc.setFontSize(9)
      doc.setFont('helvetica','bold')
      doc.text('RC AVIATION ACADEMY', 14, 13)
      doc.setFontSize(6)
      doc.setFont('helvetica','normal')
      doc.text('DESIGN STUDIO  •  ENGINEERING REPORT', 14, 19)

      doc.setFontSize(22)
      doc.setFont('helvetica','bold')
      doc.text('Aircraft Design Report', 14, 30)

      const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      doc.setFontSize(7.5)
      doc.setFont('helvetica','normal')
      doc.text(`Generated: ${today}`, W - 14, 30, { align: 'right' })

      // Canvas screenshot
      let imgY = 50
      const canvas = canvasRef.current
      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL('image/png')
          const imgW = W - 28
          const imgH = imgW * 0.55
          doc.setFillColor(20, 35, 55)
          doc.roundedRect(14, imgY - 2, imgW, imgH + 4, 3, 3, 'F')
          doc.addImage(dataUrl, 'PNG', 14, imgY, imgW, imgH)
          imgY += imgH + 10
        } catch(e) { imgY += 10 }
      }

      // Configuration summary cards
      const materialNames = { white: 'White Composite', carbon: 'Carbon Fiber', balsa: 'Balsa Wood' }
      const summaryItems = [
        ['Aircraft Profile', `${materialNames[materialSet]} — Custom Design`],
        ['Wingspan', `${config.wingSpan} cm  (${(config.wingSpan/100).toFixed(2)} m)`],
        ['Wing Chord', `${config.wingChord} cm  (${(config.wingSpan/config.wingChord).toFixed(1)} AR)`],
        ['Fuselage Length', `${config.fuselageLength} cm`],
        ['H-Stab Span', `${config.tailSpan} cm`],
        ['H-Stab Chord', `${config.tailChord} cm`],
        ['Wing Dihedral', `${config.dihedral}°`],
      ]

      doc.setFillColor(20, 40, 65)
      doc.roundedRect(14, imgY, (W-28)/2 - 3, summaryItems.length * 9 + 10, 3, 3, 'F')
      doc.setFillColor(15, 30, 50)
      doc.roundedRect(14 + (W-28)/2 + 3, imgY, (W-28)/2 - 3, summaryItems.length * 9 + 10, 3, 3, 'F')

      summaryItems.forEach((item, i) => {
        const col = i < 4 ? 0 : 1
        const row = i < 4 ? i : i - 4
        const x = col === 0 ? 18 : 14 + (W-28)/2 + 7
        const y = imgY + 8 + row * 9
        doc.setFontSize(6.5)
        doc.setFont('helvetica','bold')
        doc.setTextColor(100, 160, 220)
        doc.text(item[0].toUpperCase(), x, y)
        doc.setFontSize(8)
        doc.setFont('helvetica','normal')
        doc.setTextColor(220, 230, 240)
        doc.text(item[1], x, y + 4.5)
      })

      // ── PAGE 2: ENGINEERING ANALYSIS ──────────────────────────────────────
      doc.addPage()
      doc.setFillColor(13, 27, 42)
      doc.rect(0, 0, W, H, 'F')
      doc.setFillColor(30, 107, 184)
      doc.rect(0, 0, W, 18, 'F')
      doc.setFillColor(255, 107, 53)
      doc.rect(0, 15, W, 2, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(12)
      doc.setFont('helvetica','bold')
      doc.text('ENGINEERING ANALYSIS', 14, 12)

      const metrics = [
        { label: 'Wing Area', value: `${analysis.wingAreaDm} dm²`, sub: 'Total lifting surface area', color: '#4ade80' },
        { label: 'Aspect Ratio', value: analysis.aspectRatio, sub: 'Span² / Wing Area — efficiency metric', color: '#60a5fa' },
        { label: 'Tail Volume Coeff.', value: analysis.tailVolume, sub: 'Longitudinal stability indicator (target: 0.3–0.6)', color: '#f59e0b' },
        { label: 'Est. Wing Loading', value: `${analysis.wingLoading} g/dm²`, sub: 'Estimated at 250g AUW', color: '#a78bfa' },
      ]

      metrics.forEach((m, i) => {
        const x = 14 + (i % 2) * ((W-28)/2 + 3)
        const y = 30 + Math.floor(i / 2) * 42
        doc.setFillColor(20, 40, 65)
        doc.roundedRect(x, y, (W-28)/2 - 3, 36, 3, 3, 'F')
        const rgb = hex2rgb(m.color)
        doc.setFillColor(...rgb)
        doc.rect(x, y, 3, 36, 'F')
        doc.setTextColor(...rgb)
        doc.setFontSize(7)
        doc.setFont('helvetica','bold')
        doc.text(m.label.toUpperCase(), x + 6, y + 7)
        doc.setFontSize(18)
        doc.setFont('helvetica','bold')
        doc.setTextColor(240, 245, 255)
        doc.text(String(m.value), x + 6, y + 22)
        doc.setFontSize(6)
        doc.setFont('helvetica','normal')
        doc.setTextColor(120, 150, 190)
        doc.text(m.sub, x + 6, y + 30)
      })

      // Stability status
      const statusY = 120
      const statusColor = analysis.stabilityRating === 'GOOD' ? [74,222,128] :
                          analysis.stabilityRating === 'CHECK' ? [251,191,36] : [239,68,68]
      doc.setFillColor(20, 40, 65)
      doc.roundedRect(14, statusY, W-28, 18, 3, 3, 'F')
      doc.setFillColor(...statusColor)
      doc.roundedRect(14, statusY, 40, 18, 3, 3, 'F')
      doc.setTextColor(...statusColor)
      doc.setFontSize(9)
      doc.setFont('helvetica','bold')
      doc.text(analysis.stabilityRating, 20, statusY + 11)
      doc.setTextColor(220, 230, 240)
      doc.setFontSize(7.5)
      doc.setFont('helvetica','normal')
      doc.text(analysis.stabilityWarning || 'All aerodynamic parameters are within acceptable ranges.', 58, statusY + 11)

      // Engineering formulas
      const formulaY = statusY + 28
      doc.setFillColor(20, 40, 65)
      doc.roundedRect(14, formulaY, W-28, 80, 3, 3, 'F')
      doc.setTextColor(100,160,220)
      doc.setFontSize(8)
      doc.setFont('helvetica','bold')
      doc.text('DESIGN FORMULAS & METHODOLOGY', 20, formulaY + 10)
      const formulas = [
        ['Wing Area (Sw)',   `${config.wingSpan} cm × ${config.wingChord} cm = ${(config.wingSpan * config.wingChord).toFixed(0)} cm² = ${analysis.wingAreaDm} dm²`],
        ['Aspect Ratio (AR)', `b² / Sw = ${config.wingSpan}² / ${config.wingSpan * config.wingChord} = ${analysis.aspectRatio}`],
        ['Tail Moment (lt)',  `Fuselage × 0.55 = ${config.fuselageLength} × 0.55 = ${(config.fuselageLength * 0.55).toFixed(1)} cm`],
        ['Tail Volume (VH)', `(St × lt) / (Sw × MAC) = ${analysis.tailVolume}`],
        ['Dihedral Effect',  `${config.dihedral}° — ${config.dihedral < 3 ? 'Low lateral stability' : config.dihedral > 8 ? 'High pendulum effect' : 'Optimal roll stability'}`],
      ]
      formulas.forEach((f, i) => {
        const fy = formulaY + 20 + i * 12
        doc.setFontSize(7)
        doc.setFont('helvetica','bold')
        doc.setTextColor(160, 190, 220)
        doc.text(f[0] + ':', 20, fy)
        doc.setFont('helvetica','normal')
        doc.setTextColor(200, 215, 230)
        doc.text(f[1], 70, fy)
      })

      // Footer on all pages
      for (let p = 1; p <= doc.getNumberOfPages(); p++) {
        doc.setPage(p)
        doc.setFillColor(10, 20, 35)
        doc.rect(0, H-12, W, 12, 'F')
        doc.setFillColor(255,107,53)
        doc.rect(0, H-12, W, 0.8, 'F')
        doc.setTextColor(80,100,130)
        doc.setFontSize(6)
        doc.text('RC Aviation Academy — Design Studio Report — For educational purposes only', 14, H-4)
        doc.text(`Page ${p} of ${doc.getNumberOfPages()}`, W-14, H-4, { align: 'right' })
      }

      doc.save('rc-aircraft-design-report.pdf')
    } catch(err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [config, analysis, materialSet])

  const materialOptions = [
    { id: 'white', label: 'White Composite', color: '#e8e9ea' },
    { id: 'carbon', label: 'Carbon Fiber', color: '#1a1c1e' },
    { id: 'balsa', label: 'Balsa Wood', color: '#c4935a' },
  ]

  const viewButtons = [
    { id: '3d', label: '3D', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'front', label: 'Front', icon: <Wind className="w-3.5 h-3.5" /> },
    { id: 'side', label: 'Side', icon: <FlipHorizontal className="w-3.5 h-3.5" /> },
    { id: 'top', label: 'Top', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
  ]

  const sliderGroups = [
    {
      title: 'Main Wing',
      icon: <Sliders className="w-4 h-4" />,
      color: '#60a5fa',
      items: [
        { field: 'wingSpan',     label: 'Wingspan',       min: 60,  max: 250, unit: 'cm',  step: 1 },
        { field: 'wingChord',    label: 'Root Chord',     min: 10,  max: 35,  unit: 'cm',  step: 0.5 },
        { field: 'wingTipChord', label: 'Tip Chord',      min: 5,   max: 30,  unit: 'cm',  step: 0.5 },
        { field: 'dihedral',     label: 'Dihedral',       min: 0,   max: 15,  unit: '°',   step: 0.5 },
        { field: 'sweep',        label: 'Sweep Angle',    min: 0,   max: 25,  unit: '°',   step: 1 },
      ]
    },
    {
      title: 'Fuselage',
      icon: <Ruler className="w-4 h-4" />,
      color: '#a78bfa',
      items: [
        { field: 'fuselageLength', label: 'Fuselage Length', min: 50, max: 180, unit: 'cm', step: 1 },
      ]
    },
    {
      title: 'Tail Surfaces',
      icon: <ChevronRight className="w-4 h-4" />,
      color: '#4ade80',
      items: [
        { field: 'tailSpan',  label: 'H-Stab Span',   min: 15, max: 80,  unit: 'cm', step: 1 },
        { field: 'tailChord', label: 'H-Stab Chord',  min: 6,  max: 25,  unit: 'cm', step: 0.5 },
        { field: 'tailSweep', label: 'H-Stab Sweep',  min: 0,  max: 20,  unit: '°',  step: 1 },
        { field: 'finHeight', label: 'V-Fin Height',  min: 8,  max: 40,  unit: 'cm', step: 0.5 },
        { field: 'finChord',  label: 'V-Fin Chord',   min: 6,  max: 25,  unit: 'cm', step: 0.5 },
        { field: 'finSweep',  label: 'V-Fin Sweep',   min: 0,  max: 35,  unit: '°',  step: 1 },
      ]
    },
    {
      title: 'Control Surfaces',
      icon: <Zap className="w-4 h-4" />,
      color: '#f59e0b',
      items: [
        { field: 'aileronSize',  label: 'Aileron Width',   min: 10, max: 40, unit: '%', step: 1 },
        { field: 'elevatorSize', label: 'Elevator Depth',  min: 15, max: 45, unit: '%', step: 1 },
        { field: 'rudderSize',   label: 'Rudder Depth',    min: 15, max: 50, unit: '%', step: 1 },
      ]
    },
    {
      title: 'Propulsion',
      icon: <Zap className="w-4 h-4" />,
      color: '#f87171',
      items: [
        { field: 'propDiameter', label: 'Prop Diameter', min: 8, max: 45, unit: 'cm', step: 1 },
      ]
    },
  ]

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: '#06101e', zIndex: 50 }}
    >
      {/* ── TOP NAV BAR for Design Studio ── */}
      <div
        className="flex items-center justify-between px-5 h-14 flex-shrink-0"
        style={{
          background: 'rgba(5,13,26,0.98)',
          borderBottom: '1px solid rgba(30,107,184,0.3)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <h1 className="flex items-center gap-2 text-base font-display font-black text-white">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e6bb8,#0a4d8f)' }}>
            <Settings className="w-4 h-4 text-white" />
          </span>
          Design Studio
          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>LIVE</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs" style={{ color: '#4a7fa8' }}>← Back</Link>
          <Link
            to="/calculators"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(30,107,184,0.15)', color: '#60a5fa', border: '1px solid rgba(30,107,184,0.3)' }}
          >
            <Calculator className="w-3.5 h-3.5" /> Calculators
          </Link>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#ff6b35,#e85d04)', color: 'white' }}
          >
            <FileText className="w-3.5 h-3.5" />
            {isGenerating ? 'Generating…' : 'PDF Report'}
          </button>
        </div>
      </div>

      {/* ── MAIN BODY: sidebar + canvas ── */}
      <div className="flex flex-1 overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-[22rem] z-20 flex flex-col h-full overflow-y-auto flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(8,18,35,0.98) 0%, rgba(5,13,26,0.99) 100%)',
          borderRight: '1px solid rgba(30,107,184,0.3)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
        }}
      >


        {/* Material Selector */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(30,107,184,0.15)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4a7fa8' }}>
            Surface Material
          </h3>
          <div className="flex gap-2">
            {materialOptions.map(m => (
              <button
                key={m.id}
                onClick={() => setMaterialSet(m.id)}
                title={m.label}
                className="flex-1 h-8 rounded-lg transition-all duration-200 relative"
                style={{
                  background: m.color,
                  border: materialSet === m.id ? '2px solid #ff6b35' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: materialSet === m.id ? '0 0 12px rgba(255,107,53,0.4)' : 'none',
                }}
              >
                {materialSet === m.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: '#4a7fa8' }}>
            {materialOptions.find(m => m.id === materialSet)?.label}
          </p>
        </div>

        {/* Sliders */}
        <div className="p-4 flex-grow space-y-5">
          {sliderGroups.map((group) => (
            <div key={group.title} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${group.color}22` }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: `${group.color}18`, borderBottom: `1px solid ${group.color}22` }}>
                <span style={{ color: group.color }}>{group.icon}</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: group.color }}>
                  {group.title}
                </h3>
              </div>
              <div className="p-3 space-y-4">
                {group.items.map(({ field, label, min, max, unit, step = 1 }) => (
                  <div key={field}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#90aec5' }}>{label}</span>
                      <span className="font-mono font-bold" style={{ color: group.color }}>
                        {Number.isInteger(config[field]) ? config[field] : Number(config[field]).toFixed(1)}{unit}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step}
                      value={config[field]}
                      onChange={(e) => handleSlider(field, e.target.value)}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${group.color} 0%, ${group.color} ${((config[field]-min)/(max-min))*100}%, rgba(30,107,184,0.2) ${((config[field]-min)/(max-min))*100}%, rgba(30,107,184,0.2) 100%)`,
                        accentColor: group.color,
                      }}
                    />
                    <div className="flex justify-between text-xs mt-0.5" style={{ color: 'rgba(74,127,168,0.45)' }}>
                      <span>{min}{unit}</span><span>{max}{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>


      </motion.div>

      {/* ── MAIN CANVAS AREA ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(5,13,26,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(30,107,184,0.3)' }}>
            {viewButtons.map(v => (
              <button
                key={v.id}
                onClick={() => setViewPreset(v.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                style={{
                  background: viewPreset === v.id ? 'rgba(255,107,53,0.25)' : 'transparent',
                  color: viewPreset === v.id ? '#ff6b35' : '#6090b0',
                  border: viewPreset === v.id ? '1px solid rgba(255,107,53,0.4)' : '1px solid transparent',
                }}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowGrid(s => !s)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            title="Toggle Grid"
            style={{
              background: showGrid ? 'rgba(30,107,184,0.3)' : 'rgba(5,13,26,0.8)',
              border: '1px solid rgba(30,107,184,0.3)',
              color: showGrid ? '#60a5fa' : '#4a7fa8',
            }}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAutoRotate(a => !a)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            title="Auto Rotate"
            style={{
              background: autoRotate ? 'rgba(255,107,53,0.2)' : 'rgba(5,13,26,0.8)',
              border: '1px solid rgba(30,107,184,0.3)',
              color: autoRotate ? '#ff6b35' : '#4a7fa8',
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2" style={{ background: 'rgba(5,13,26,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(30,107,184,0.25)', color: '#4a7fa8' }}>
            <Eye className="w-3.5 h-3.5" />
            <span>Rotate · Scroll · Right-drag Pan</span>
          </div>
        </div>

        {/* THREE.JS CANVAS */}
        <div className="flex-grow relative" style={{ minHeight: '60vh' }}>
          <Canvas
            ref={canvasRef}
            shadows
            gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            style={{ background: 'transparent' }}
          >
            <CameraController preset={viewPreset} />
            <OrbitControls
              ref={orbitRef}
              enablePan={true}
              enableZoom={true}
              minDistance={0.4}
              maxDistance={6}
              maxPolarAngle={Math.PI / 1.8}
              autoRotate={autoRotate}
              autoRotateSpeed={0.6}
              dampingFactor={0.08}
              enableDamping
            />

            {/* HDR Environment */}
            <Environment preset="warehouse" />

            {/* Lighting Rig */}
            <ambientLight intensity={0.35} color="#d0e8ff" />
            <directionalLight
              castShadow
              position={[4, 7, 3]}
              intensity={2.5}
              color="#ffffff"
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={20}
              shadow-camera-left={-5}
              shadow-camera-right={5}
              shadow-camera-top={5}
              shadow-camera-bottom={-5}
            />
            <directionalLight position={[-3, 2, -4]} intensity={0.6} color="#4080c0" />
            <pointLight position={[0, 3, -2]} intensity={0.8} color="#ff8040" distance={8} />
            <pointLight position={[0, -1, 1]} intensity={0.3} color="#80c0ff" distance={5} />

            {/* Aircraft */}
            <ParametricPlane config={config} materialSet={materialSet} />

            {/* Studio Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial
                color="#060e1a"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>

            {/* Grid Floor */}
            {showGrid && (
              <Grid
                position={[0, -0.079, 0]}
                args={[20, 20]}
                cellSize={0.1}
                cellThickness={0.4}
                cellColor="#1e3a5f"
                sectionSize={1}
                sectionThickness={0.8}
                sectionColor="#1e6bb8"
                fadeDistance={8}
                fadeStrength={1.5}
              />
            )}

            {/* Contact shadows for grounding */}
            <ContactShadows
              position={[0, -0.079, 0]}
              opacity={0.7}
              scale={8}
              blur={3}
              far={3}
              color="#000020"
            />

            <Preload all />
          </Canvas>
        </div>

        {/* ── BOTTOM HUD ── */}
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="z-20"
          style={{
            background: 'linear-gradient(180deg, rgba(5,13,26,0.98) 0%, rgba(8,18,35,0.99) 100%)',
            borderTop: '1px solid rgba(30,107,184,0.3)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(30,107,184,0.15)' }}>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#4a7fa8' }}>
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              Live Aerodynamic Analysis
            </h3>
            <div className="flex items-center gap-2">
              {analysis.stabilityRating !== 'GOOD' && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold animate-pulse" style={{
                  background: analysis.stabilityRating === 'CHECK' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                  color: analysis.stabilityRating === 'CHECK' ? '#fbbf24' : '#ef4444',
                  border: `1px solid ${analysis.stabilityRating === 'CHECK' ? 'rgba(251,191,36,0.4)' : 'rgba(239,68,68,0.4)'}`,
                }}>{analysis.stabilityRating}</span>
              )}
              {analysis.stabilityRating === 'GOOD' && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>✓ GOOD</span>
              )}
            </div>
          </div>

          <div className="flex gap-0" style={{ minHeight: '0' }}>
            {/* LEFT: Metric Cards */}
            <div className="flex-1 p-3">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Wing Area',    value: analysis.wingAreaDm,  unit: 'dm²',  color: '#4ade80',  ideal: '15–35', ok: +analysis.wingAreaDm >= 15 && +analysis.wingAreaDm <= 35 },
                  { label: 'Aspect Ratio', value: analysis.aspectRatio, unit: ':1',   color: '#60a5fa',  ideal: '5–10',  ok: +analysis.aspectRatio >= 5 && +analysis.aspectRatio <= 10 },
                  { label: 'Taper Ratio',  value: analysis.taperRatio,  unit: '',     color: '#a78bfa',  ideal: '0.4–0.8', ok: +analysis.taperRatio >= 0.4 && +analysis.taperRatio <= 0.8 },
                  { label: 'Tail Vol. Vh', value: analysis.tailVolume,  unit: '',     color: +analysis.tailVolume < 0.3 ? '#ef4444' : '#f59e0b', ideal: '0.3–0.65', ok: +analysis.tailVolume >= 0.3 && +analysis.tailVolume <= 0.65 },
                  { label: 'Fin Vol. Vv',  value: analysis.finVolume,   unit: '',     color: '#34d399',  ideal: '0.04–0.08', ok: +analysis.finVolume >= 0.04 && +analysis.finVolume <= 0.08 },
                ].map(m => (
                  <div key={m.label} className="rounded-lg p-2 relative overflow-hidden" style={{ background: 'rgba(12,24,44,0.9)', border: `1px solid ${m.color}30` }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.color }} />
                    <div className="text-xs mb-0.5 truncate" style={{ color: '#4a7fa8', fontSize: '0.6rem' }}>{m.label}</div>
                    <div className="font-mono font-bold text-sm" style={{ color: m.color }}>{m.value}<span className="text-xs font-normal ml-0.5" style={{ color: '#4a7fa8' }}>{m.unit}</span></div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs" style={{ color: m.ok ? '#4ade80' : '#f59e0b', fontSize: '0.55rem' }}>{m.ok ? '✓' : '!'} {m.ideal}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second row of metrics */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                  { label: 'Wing Loading',   value: analysis.wingLoading, unit: 'g/dm²', color: '#a78bfa', ideal: '8–25',    ok: +analysis.wingLoading >= 8 && +analysis.wingLoading <= 25 },
                  { label: 'Stall Speed',    value: analysis.stallSpeed,  unit: 'm/s',   color: '#fb923c', ideal: '5–14',    ok: +analysis.stallSpeed >= 5 && +analysis.stallSpeed <= 14 },
                  { label: 'Est. CG',        value: analysis.cgPct,       unit: '% MAC', color: '#f472b6', ideal: '25–33',   ok: +analysis.cgPct >= 25 && +analysis.cgPct <= 33 },
                  { label: 'Pitch Stability',value: analysis.pitchStability, unit: '',  color: analysis.pitchStability === 'Stable' ? '#4ade80' : analysis.pitchStability === 'Overstable' ? '#f59e0b' : '#ef4444', ideal: 'Stable', ok: analysis.pitchStability === 'Stable' },
                  { label: 'Roll Stability', value: analysis.rollStability,  unit: '',  color: analysis.rollStability === 'Good' ? '#4ade80' : '#f59e0b', ideal: 'Good', ok: analysis.rollStability === 'Good' },
                ].map(m => (
                  <div key={m.label} className="rounded-lg p-2 relative overflow-hidden" style={{ background: 'rgba(12,24,44,0.9)', border: `1px solid ${m.color}30` }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.color }} />
                    <div className="text-xs mb-0.5 truncate" style={{ color: '#4a7fa8', fontSize: '0.6rem' }}>{m.label}</div>
                    <div className="font-mono font-bold text-sm" style={{ color: m.color }}>{m.value}<span className="text-xs font-normal ml-0.5" style={{ color: '#4a7fa8' }}>{m.unit}</span></div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span style={{ color: m.ok ? '#4ade80' : '#f59e0b', fontSize: '0.55rem' }}>{m.ok ? '✓' : '!'} {m.ideal}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs rounded-lg px-2 py-1" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Standard Model Match */}
            <div className="w-72 border-l p-3 flex-shrink-0" style={{ borderColor: 'rgba(30,107,184,0.2)', background: 'rgba(8,16,32,0.6)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#4a7fa8' }}>
                <Info className="w-3.5 h-3.5" style={{ color: matchedModel.color }} />
                Closest Standard Model
              </div>

              {/* Match card */}
              <div className="rounded-xl p-3 mb-2" style={{ background: `${matchedModel.color}10`, border: `1px solid ${matchedModel.color}40` }}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-bold text-sm" style={{ color: matchedModel.color }}>{matchedModel.name}</div>
                    <div className="text-xs" style={{ color: '#4a7fa8' }}>{matchedModel.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-black" style={{ color: matchedModel.color }}>
                      {Math.round(matchedModel.score * 100)}%
                    </div>
                    <div className="text-xs" style={{ color: '#4a7fa8', fontSize: '0.6rem' }}>MATCH</div>
                  </div>
                </div>
                {/* Match bar */}
                <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(30,107,184,0.2)' }}>
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${Math.round(matchedModel.score * 100)}%`, background: matchedModel.color }} />
                </div>
                <p className="text-xs" style={{ color: '#6090b0' }}>{matchedModel.desc}</p>
              </div>

              {/* Delta comparison table */}
              <div className="text-xs space-y-1">
                {[
                  { label: 'Wingspan', yours: config.wingSpan, ref: matchedModel.wingSpan, unit: 'cm' },
                  { label: 'Chord',    yours: config.wingChord, ref: matchedModel.wingChord, unit: 'cm' },
                  { label: 'Fuse Len', yours: config.fuselageLength, ref: matchedModel.fuselageLength, unit: 'cm' },
                  { label: 'Dihedral', yours: config.dihedral, ref: matchedModel.dihedral, unit: '°' },
                ].map(row => {
                  const delta = row.yours - row.ref
                  const pct   = Math.abs(delta / row.ref * 100).toFixed(0)
                  const col   = Math.abs(delta) < row.ref * 0.05 ? '#4ade80' : Math.abs(delta) < row.ref * 0.15 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={row.label} className="flex items-center justify-between rounded px-2 py-0.5" style={{ background: 'rgba(15,30,50,0.6)' }}>
                      <span style={{ color: '#4a7fa8' }}>{row.label}</span>
                      <span style={{ color: '#c0d8f0' }}>{row.yours}{row.unit}</span>
                      <span style={{ color: '#4a7fa8' }}>vs {row.ref}{row.unit}</span>
                      <span style={{ color: col }}>{delta > 0 ? '+' : ''}{delta}{row.unit}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  )
}

export default DesignStudioPage