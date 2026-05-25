// import { useEffect, useRef, useState, useCallback } from 'react'
// import { cn } from '../../utils/tracker-ui'

// // ─── Types ────────────────────────────────────────────────────────────────────

// type SimKey =
//   | 'projectile'
//   | 'pendulum'
//   | 'waves'
//   | 'optics'
//   | 'electric'
//   | 'orbital'

// interface Sim {
//   key: SimKey
//   label: string
//   icon: string
//   description: string
//   color: string
// }

// // ─── Simulation registry ──────────────────────────────────────────────────────

// const SIMS: Sim[] = [
//   {
//     key: 'projectile',
//     label: 'Projectile Motion',
//     icon: '🎯',
//     description: 'Explore how angle and velocity affect trajectory',
//     color: '#4caf50',
//   },
//   {
//     key: 'pendulum',
//     label: 'Pendulum & Oscillations',
//     icon: '🔭',
//     description: 'Visualize simple and damped pendulum motion',
//     color: '#64b5f6',
//   },
//   {
//     key: 'waves',
//     label: 'Waves & Interference',
//     icon: '〰️',
//     description: 'See how waves combine and interfere',
//     color: '#ba68c8',
//   },
//   {
//     key: 'optics',
//     label: 'Optics (Lenses/Mirrors)',
//     icon: '🔬',
//     description: 'Ray diagrams for lenses and mirrors',
//     color: '#ffb74d',
//   },
//   {
//     key: 'electric',
//     label: 'Electric Fields',
//     icon: '⚡',
//     description: 'Visualize field lines between charges',
//     color: '#f06292',
//   },
//   {
//     key: 'orbital',
//     label: 'Orbital Mechanics',
//     icon: '🪐',
//     description: 'Simulate planetary orbits under gravity',
//     color: '#4db6ac',
//   },
// ]

// // ─── Canvas simulation components ─────────────────────────────────────────────

// // --- Projectile ---
// function ProjectileSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [angle, setAngle] = useState(45)
//   const [speed, setSpeed] = useState(60)
//   const animRef = useRef<number>(0)

//   const draw = useCallback(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width
//     const H = canvas.height
//     ctx.clearRect(0, 0, W, H)

//     const g = 9.8
//     const scale = 4
//     const rad = (angle * Math.PI) / 180
//     const vx = speed * Math.cos(rad)
//     const vy = speed * Math.sin(rad)
//     const tFlight = (2 * vy) / g
//     const range = vx * tFlight
//     const maxH = (vy * vy) / (2 * g)

//     // Grid
//     ctx.strokeStyle = 'rgba(255,255,255,0.05)'
//     ctx.lineWidth = 1
//     for (let x = 0; x < W; x += 40) {
//       ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
//     }
//     for (let y = 0; y < H; y += 40) {
//       ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
//     }

//     // Ground
//     ctx.strokeStyle = 'rgba(76,175,80,0.4)'
//     ctx.lineWidth = 1.5
//     ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke()

//     // Trajectory path
//     ctx.beginPath()
//     ctx.strokeStyle = 'rgba(76,175,80,0.25)'
//     ctx.lineWidth = 1
//     let first = true
//     for (let t = 0; t <= tFlight; t += 0.05) {
//       const px = (vx * t * scale) + 40
//       const py = H - 30 - (vy * t - 0.5 * g * t * t) * scale
//       if (first) { ctx.moveTo(px, py); first = false } else ctx.lineTo(px, py)
//     }
//     ctx.stroke()

//     // Trajectory filled gradient
//     ctx.beginPath()
//     first = true
//     for (let t = 0; t <= tFlight; t += 0.02) {
//       const px = (vx * t * scale) + 40
//       const py = H - 30 - (vy * t - 0.5 * g * t * t) * scale
//       if (first) { ctx.moveTo(px, py); first = false } else ctx.lineTo(px, py)
//     }
//     ctx.strokeStyle = '#4caf50'
//     ctx.lineWidth = 2.5
//     ctx.stroke()

//     // Animated ball
//     const now = (Date.now() / 1000) % (tFlight + 0.5)
//     const t = Math.min(now, tFlight)
//     const bx = (vx * t * scale) + 40
//     const by = H - 30 - (vy * t - 0.5 * g * t * t) * scale

//     const grad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 8)
//     grad.addColorStop(0, '#a5d6a7')
//     grad.addColorStop(1, '#2e7d32')
//     ctx.beginPath()
//     ctx.arc(bx, by, 8, 0, Math.PI * 2)
//     ctx.fillStyle = grad
//     ctx.fill()

//     // Velocity vector
//     if (t < tFlight * 0.9) {
//       const curVx = vx; const curVy = vy - g * t
//       const mag = Math.sqrt(curVx ** 2 + curVy ** 2)
//       const nvx = (curVx / mag) * 28; const nvy = (-curVy / mag) * 28
//       ctx.strokeStyle = '#81c784'
//       ctx.lineWidth = 1.5
//       ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + nvx, by + nvy); ctx.stroke()
//       ctx.beginPath()
//       ctx.arc(bx + nvx, by + nvy, 3, 0, Math.PI * 2)
//       ctx.fillStyle = '#81c784'; ctx.fill()
//     }

//     // Stats
//     ctx.fillStyle = 'rgba(0,0,0,0.5)'
//     ctx.fillRect(8, 8, 200, 72)
//     ctx.fillStyle = '#4caf50'
//     ctx.font = 'bold 11px DM Mono, monospace'
//     ctx.fillText(`RANGE: ${range.toFixed(1)} m`, 16, 26)
//     ctx.fillText(`MAX HEIGHT: ${maxH.toFixed(1)} m`, 16, 44)
//     ctx.fillText(`FLIGHT TIME: ${tFlight.toFixed(2)} s`, 16, 62)

//     animRef.current = requestAnimationFrame(draw)
//   }, [angle, speed])

//   useEffect(() => {
//     animRef.current = requestAnimationFrame(draw)
//     return () => cancelAnimationFrame(animRef.current)
//   }, [draw])

//   return (
//     <div className="space-y-4">
//       <canvas
//         ref={canvasRef}
//         width={680}
//         height={320}
//         className="w-full rounded-[10px] bg-[#0a0a0a]"
//       />
//       <div className="grid grid-cols-2 gap-4">
//         <SliderControl label="Launch Angle" value={angle} min={5} max={85} unit="°" onChange={setAngle} color="#4caf50" />
//         <SliderControl label="Initial Speed" value={speed} min={10} max={100} unit=" m/s" onChange={setSpeed} color="#4caf50" />
//       </div>
//     </div>
//   )
// }

// // --- Pendulum ---
// function PendulumSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [length, setLength] = useState(120)
//   const [damping, setDamping] = useState(0.1)
//   const animRef = useRef<number>(0)
//   const stateRef = useRef({ theta: Math.PI / 4, omega: 0, t: 0 })

//   const draw = useCallback(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width; const H = canvas.height
//     ctx.clearRect(0, 0, W, H)

//     const dt = 0.016
//     const g = 9.8
//     const L = length
//     const b = damping / 10

//     const s = stateRef.current
//     const alpha = -(g / L) * Math.sin(s.theta) - b * s.omega
//     s.omega += alpha * dt
//     s.theta += s.omega * dt
//     s.t += dt

//     const cx = W / 2; const cy = 60
//     const px = cx + L * Math.sin(s.theta)
//     const py = cy + L * Math.cos(s.theta)

//     // Trail
//     if (!(s as any).trail) (s as any).trail = []
//     const trail = (s as any).trail as { x: number; y: number }[]
//     trail.push({ x: px, y: py })
//     if (trail.length > 120) trail.shift()

//     for (let i = 1; i < trail.length; i++) {
//       const a = i / trail.length
//       ctx.strokeStyle = `rgba(100,181,246,${a * 0.5})`
//       ctx.lineWidth = a * 2
//       ctx.beginPath()
//       ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
//       ctx.lineTo(trail[i].x, trail[i].y)
//       ctx.stroke()
//     }

//     // Pivot
//     ctx.fillStyle = 'rgba(255,255,255,0.3)'
//     ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()

//     // Rod
//     ctx.strokeStyle = 'rgba(255,255,255,0.3)'
//     ctx.lineWidth = 1.5
//     ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke()

//     // Bob
//     const g2 = ctx.createRadialGradient(px - 4, py - 4, 2, px, py, 16)
//     g2.addColorStop(0, '#90caf9')
//     g2.addColorStop(1, '#1565c0')
//     ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2)
//     ctx.fillStyle = g2; ctx.fill()
//     ctx.strokeStyle = 'rgba(100,181,246,0.5)'; ctx.lineWidth = 1; ctx.stroke()

//     // Stats
//     const period = 2 * Math.PI * Math.sqrt(L / g)
//     ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, 8, 200, 62)
//     ctx.fillStyle = '#64b5f6'; ctx.font = 'bold 11px DM Mono, monospace'
//     ctx.fillText(`PERIOD: ${period.toFixed(2)} s`, 16, 26)
//     ctx.fillText(`ANGLE: ${(s.theta * 180 / Math.PI).toFixed(1)}°`, 16, 44)
//     ctx.fillText(`ω: ${s.omega.toFixed(3)} rad/s`, 16, 62)

//     animRef.current = requestAnimationFrame(draw)
//   }, [length, damping])

//   useEffect(() => {
//     stateRef.current = { theta: Math.PI / 4, omega: 0, t: 0 }
//     animRef.current = requestAnimationFrame(draw)
//     return () => cancelAnimationFrame(animRef.current)
//   }, [draw])

//   return (
//     <div className="space-y-4">
//       <canvas ref={canvasRef} width={680} height={340} className="w-full rounded-[10px] bg-[#0a0a0a]" />
//       <div className="grid grid-cols-2 gap-4">
//         <SliderControl label="Length" value={length} min={40} max={200} unit=" px" onChange={(v) => { setLength(v); stateRef.current = { theta: Math.PI / 4, omega: 0, t: 0 } }} color="#64b5f6" />
//         <SliderControl label="Damping" value={damping} min={0} max={20} unit="%" onChange={setDamping} color="#64b5f6" />
//       </div>
//     </div>
//   )
// }

// // --- Waves ---
// function WavesSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [freq1, setFreq1] = useState(2)
//   const [freq2, setFreq2] = useState(3)
//   const [amp2, setAmp2] = useState(60)
//   const animRef = useRef<number>(0)

//   const draw = useCallback(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width; const H = canvas.height
//     ctx.clearRect(0, 0, W, H)

//     const t = Date.now() / 1000
//     const cx = H / 2
//     const amp1 = 60

//     // Grid
//     ctx.strokeStyle = 'rgba(255,255,255,0.04)'
//     ctx.lineWidth = 1
//     for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
//     ctx.strokeStyle = 'rgba(186,104,200,0.15)'
//     ctx.beginPath(); ctx.moveTo(0, cx / 1.5); ctx.lineTo(W, cx / 1.5); ctx.stroke()
//     ctx.beginPath(); ctx.moveTo(0, cx / 1.5 * 2); ctx.lineTo(W, cx / 1.5 * 2); ctx.stroke()
//     ctx.beginPath(); ctx.moveTo(0, cx + cx / 2); ctx.lineTo(W, cx + cx / 2); ctx.stroke()

//     // Wave 1
//     ctx.beginPath()
//     for (let x = 0; x < W; x++) {
//       const y = cx / 1.5 + amp1 * 0.4 * Math.sin((x / W) * freq1 * 2 * Math.PI - t * 2)
//       x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
//     }
//     ctx.strokeStyle = '#ba68c8'; ctx.lineWidth = 2; ctx.stroke()

//     // Wave 2
//     ctx.beginPath()
//     for (let x = 0; x < W; x++) {
//       const y = cx / 1.5 * 2 + (amp2 * 0.4) * Math.sin((x / W) * freq2 * 2 * Math.PI - t * 2)
//       x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
//     }
//     ctx.strokeStyle = '#f48fb1'; ctx.lineWidth = 2; ctx.stroke()

//     // Superposition
//     ctx.beginPath()
//     for (let x = 0; x < W; x++) {
//       const y1 = amp1 * 0.4 * Math.sin((x / W) * freq1 * 2 * Math.PI - t * 2)
//       const y2 = (amp2 * 0.4) * Math.sin((x / W) * freq2 * 2 * Math.PI - t * 2)
//       const y = cx + cx / 2 + y1 + y2
//       x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
//     }
//     ctx.strokeStyle = '#ce93d8'; ctx.lineWidth = 2.5; ctx.stroke()

//     // Labels
//     ctx.font = 'bold 10px DM Mono, monospace'
//     ctx.fillStyle = '#ba68c8'; ctx.fillText(`WAVE 1  f=${freq1} Hz`, 12, cx / 1.5 - 14)
//     ctx.fillStyle = '#f48fb1'; ctx.fillText(`WAVE 2  f=${freq2} Hz`, 12, cx / 1.5 * 2 - 14)
//     ctx.fillStyle = '#ce93d8'; ctx.fillText('SUPERPOSITION', 12, cx + cx / 2 - 14)

//     animRef.current = requestAnimationFrame(draw)
//   }, [freq1, freq2, amp2])

//   useEffect(() => {
//     animRef.current = requestAnimationFrame(draw)
//     return () => cancelAnimationFrame(animRef.current)
//   }, [draw])

//   return (
//     <div className="space-y-4">
//       <canvas ref={canvasRef} width={680} height={320} className="w-full rounded-[10px] bg-[#0a0a0a]" />
//       <div className="grid grid-cols-3 gap-4">
//         <SliderControl label="Wave 1 Freq" value={freq1} min={1} max={8} unit=" Hz" onChange={setFreq1} color="#ba68c8" />
//         <SliderControl label="Wave 2 Freq" value={freq2} min={1} max={8} unit=" Hz" onChange={setFreq2} color="#f48fb1" />
//         <SliderControl label="Wave 2 Amp" value={amp2} min={10} max={100} unit="%" onChange={setAmp2} color="#ce93d8" />
//       </div>
//     </div>
//   )
// }

// // --- Optics ---
// function OpticsSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [focalLen, setFocalLen] = useState(100)
//   const [objDist, setObjDist] = useState(180)
//   const [mode, setMode] = useState<'convex' | 'concave'>('convex')

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width; const H = canvas.height
//     ctx.clearRect(0, 0, W, H)

//     const cx = W / 2; const cy = H / 2
//     const f = mode === 'convex' ? focalLen : -focalLen
//     const u = -objDist
//     const v = (f * u) / (u - f)
//     const m = v / u

//     // Axis
//     ctx.strokeStyle = 'rgba(255,255,255,0.15)'
//     ctx.lineWidth = 1
//     ctx.setLineDash([6, 4])
//     ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
//     ctx.setLineDash([])

//     // Lens
//     const lensColor = mode === 'convex' ? '#ffb74d' : '#80cbc4'
//     ctx.strokeStyle = lensColor
//     ctx.lineWidth = 2.5
//     if (mode === 'convex') {
//       ctx.beginPath()
//       ctx.moveTo(cx, cy - 80)
//       ctx.bezierCurveTo(cx + 30, cy - 40, cx + 30, cy + 40, cx, cy + 80)
//       ctx.stroke()
//       ctx.beginPath()
//       ctx.moveTo(cx, cy - 80)
//       ctx.bezierCurveTo(cx - 30, cy - 40, cx - 30, cy + 40, cx, cy + 80)
//       ctx.stroke()
//     } else {
//       ctx.beginPath()
//       ctx.moveTo(cx, cy - 80)
//       ctx.bezierCurveTo(cx - 20, cy - 40, cx - 20, cy + 40, cx, cy + 80)
//       ctx.stroke()
//       ctx.beginPath()
//       ctx.moveTo(cx, cy - 80)
//       ctx.bezierCurveTo(cx + 20, cy - 40, cx + 20, cy + 40, cx, cy + 80)
//       ctx.stroke()
//     }

//     // Focal points
//     ctx.fillStyle = lensColor
//     ;[cx + f, cx - f].forEach(fx => {
//       ctx.beginPath(); ctx.arc(fx, cy, 5, 0, Math.PI * 2); ctx.fill()
//     })
//     ctx.font = '10px DM Mono, monospace'
//     ctx.fillStyle = lensColor
//     ctx.fillText('F', cx + f + 8, cy - 8)
//     ctx.fillText('F', cx - f + 8, cy - 8)

//     const objX = cx + u
//     const objH = 60

//     // Object arrow
//     ctx.strokeStyle = '#81c784'; ctx.lineWidth = 2
//     ctx.beginPath(); ctx.moveTo(objX, cy); ctx.lineTo(objX, cy - objH); ctx.stroke()
//     ctx.fillStyle = '#81c784'
//     ctx.beginPath()
//     ctx.moveTo(objX, cy - objH)
//     ctx.lineTo(objX - 6, cy - objH + 12)
//     ctx.lineTo(objX + 6, cy - objH + 12)
//     ctx.fill()

//     // Image arrow
//     const imgX = cx + v
//     const imgH = m * objH
//     if (Math.abs(v) < W) {
//       ctx.strokeStyle = 'rgba(255,183,77,0.8)'; ctx.lineWidth = 2
//       ctx.setLineDash(Math.abs(v) < 0 ? [4, 3] : [])
//       ctx.beginPath(); ctx.moveTo(imgX, cy); ctx.lineTo(imgX, cy - imgH); ctx.stroke()
//       ctx.setLineDash([])
//       ctx.fillStyle = '#ffb74d'
//       ctx.beginPath()
//       ctx.moveTo(imgX, cy - imgH)
//       ctx.lineTo(imgX - 5, cy - imgH + (imgH > 0 ? 10 : -10))
//       ctx.lineTo(imgX + 5, cy - imgH + (imgH > 0 ? 10 : -10))
//       ctx.fill()
//     }

//     // Ray 1 — parallel to axis then through focal point
//     ctx.strokeStyle = 'rgba(255,235,59,0.7)'; ctx.lineWidth = 1.2
//     ctx.beginPath()
//     ctx.moveTo(objX, cy - objH)
//     ctx.lineTo(cx, cy - objH)
//     ctx.lineTo(imgX < W && imgX > 0 ? imgX : (v > 0 ? W : 0), cy - imgH * ((v > 0 ? W - cx : cx) / Math.abs(v)))
//     ctx.stroke()

//     // Ray 2 — through center
//     ctx.beginPath()
//     ctx.moveTo(objX, cy - objH)
//     if (Math.abs(v) < W) {
//       ctx.lineTo(imgX, cy - imgH)
//     } else {
//       const slope = (-objH) / (-u)
//       ctx.lineTo(W, cy - objH + slope * (W - objX))
//     }
//     ctx.stroke()

//     // Stats
//     ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(8, 8, 220, 72)
//     ctx.fillStyle = lensColor; ctx.font = 'bold 11px DM Mono, monospace'
//     ctx.fillText(`IMAGE DIST: ${Math.abs(v).toFixed(1)} ${v > 0 ? '(real)' : '(virtual)'}`, 16, 26)
//     ctx.fillText(`MAGNIFICATION: ${Math.abs(m).toFixed(2)}×`, 16, 44)
//     ctx.fillText(`TYPE: ${Math.abs(m) > 1 ? 'Enlarged' : 'Reduced'} ${m < 0 ? '/ Inverted' : ''}`, 16, 62)
//   }, [focalLen, objDist, mode])

//   return (
//     <div className="space-y-4">
//       <canvas ref={canvasRef} width={680} height={300} className="w-full rounded-[10px] bg-[#0a0a0a]" />
//       <div className="flex gap-2 justify-center">
//         {(['convex', 'concave'] as const).map(m => (
//           <button
//             key={m}
//             type="button"
//             onClick={() => setMode(m)}
//             className={cn(
//               "px-4 py-1.5 rounded-md border font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-wider transition",
//               mode === m
//                 ? 'border-[#ffb74d]/60 bg-[#3a2b12] text-[#ffb74d]'
//                 : 'border-white/10 bg-[#111] text-[#666] hover:text-[#aaa]'
//             )}
//           >
//             {m} lens
//           </button>
//         ))}
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <SliderControl label="Focal Length" value={focalLen} min={40} max={180} unit=" px" onChange={setFocalLen} color="#ffb74d" />
//         <SliderControl label="Object Distance" value={objDist} min={50} max={300} unit=" px" onChange={setObjDist} color="#ffb74d" />
//       </div>
//     </div>
//   )
// }

// // --- Electric Fields ---
// function ElectricSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [charge1, setCharge1] = useState(1)
//   const [charge2, setCharge2] = useState(-1)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width; const H = canvas.height
//     ctx.clearRect(0, 0, W, H)

//     const charges = [
//       { x: W * 0.35, y: H / 2, q: charge1 },
//       { x: W * 0.65, y: H / 2, q: charge2 },
//     ]

//     const getField = (x: number, y: number) => {
//       let ex = 0; let ey = 0
//       for (const c of charges) {
//         const dx = x - c.x; const dy = y - c.y
//         const r2 = dx * dx + dy * dy
//         if (r2 < 1) continue
//         const r = Math.sqrt(r2)
//         const k = c.q * 8000 / (r2 * r)
//         ex += k * dx; ey += k * dy
//       }
//       return { ex, ey }
//     }

//     // Field lines
//     const numLines = 14
//     for (const c of charges) {
//       if (c.q === 0) continue
//       for (let i = 0; i < numLines; i++) {
//         const ang = (i / numLines) * 2 * Math.PI
//         let x = c.x + 18 * Math.cos(ang)
//         let y = c.y + 18 * Math.sin(ang)
//         const dir = c.q > 0 ? 1 : -1

//         ctx.beginPath(); ctx.moveTo(x, y)
//         for (let step = 0; step < 200; step++) {
//           const { ex, ey } = getField(x, y)
//           const mag = Math.sqrt(ex * ex + ey * ey)
//           if (mag < 0.001) break
//           x += dir * (ex / mag) * 4
//           y += dir * (ey / mag) * 4
//           ctx.lineTo(x, y)
//           if (x < 5 || x > W - 5 || y < 5 || y > H - 5) break
//           const near = charges.some(cc => (x - cc.x) ** 2 + (y - cc.y) ** 2 < 200 && cc !== c)
//           if (near) break
//         }

//         const isPositive = c.q > 0
//         const lineColor = isPositive ? '#f06292' : '#64b5f6'
//         ctx.strokeStyle = lineColor
//         ctx.lineWidth = 1
//         ctx.globalAlpha = 0.7
//         ctx.stroke()
//         ctx.globalAlpha = 1
//       }
//     }

//     // Equipotential hint dots
//     for (let gx = 20; gx < W; gx += 28) {
//       for (let gy = 20; gy < H; gy += 28) {
//         let V = 0
//         for (const c of charges) {
//           const r = Math.sqrt((gx - c.x) ** 2 + (gy - c.y) ** 2)
//           if (r > 5) V += c.q / r
//         }
//         const level = Math.round(V * 30)
//         if (level % 3 === 0) {
//           ctx.beginPath()
//           ctx.arc(gx, gy, 1.2, 0, Math.PI * 2)
//           ctx.fillStyle = `rgba(255,255,255,0.12)`
//           ctx.fill()
//         }
//       }
//     }

//     // Charges
//     for (const c of charges) {
//       const isPos = c.q > 0
//       const g = ctx.createRadialGradient(c.x - 5, c.y - 5, 4, c.x, c.y, 20)
//       g.addColorStop(0, isPos ? '#f48fb1' : '#90caf9')
//       g.addColorStop(1, isPos ? '#880e4f' : '#0d47a1')
//       ctx.beginPath(); ctx.arc(c.x, c.y, 20, 0, Math.PI * 2)
//       ctx.fillStyle = g; ctx.fill()
//       ctx.strokeStyle = isPos ? '#f06292' : '#64b5f6'; ctx.lineWidth = 1.5; ctx.stroke()

//       ctx.fillStyle = '#fff'
//       ctx.font = 'bold 18px DM Mono, monospace'
//       ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
//       ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y)
//       ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
//     }

//     // Legend
//     ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, 8, 200, 44)
//     ctx.font = 'bold 10px DM Mono, monospace'
//     ctx.fillStyle = '#f06292'; ctx.fillText('● Positive charge (+)', 16, 24)
//     ctx.fillStyle = '#64b5f6'; ctx.fillText('● Negative charge (−)', 16, 42)
//   }, [charge1, charge2])

//   return (
//     <div className="space-y-4">
//       <canvas ref={canvasRef} width={680} height={320} className="w-full rounded-[10px] bg-[#0a0a0a]" />
//       <div className="grid grid-cols-2 gap-4">
//         <SliderControl label="Charge 1 (Left)" value={charge1} min={-3} max={3} unit=" C" onChange={setCharge1} color="#f06292" />
//         <SliderControl label="Charge 2 (Right)" value={charge2} min={-3} max={3} unit=" C" onChange={setCharge2} color="#64b5f6" />
//       </div>
//     </div>
//   )
// }

// // --- Orbital Mechanics ---
// function OrbitalSim() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [speed, setSpeed] = useState(5)
//   const [mass, setMass] = useState(5)
//   const animRef = useRef<number>(0)
//   const stateRef = useRef<{ x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[] }>({
//     x: 0, y: 0, vx: 0, vy: 0, trail: [],
//   })
//   const initialized = useRef(false)

//   const reset = useCallback((W: number, H: number) => {
//     const cx = W / 2; const cy = H / 2
//     const r = 130
//     stateRef.current = {
//       x: cx + r, y: cy,
//       vx: 0, vy: -(speed * 0.4),
//       trail: [],
//     }
//   }, [speed])

//   const draw = useCallback(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width; const H = canvas.height
//     const cx = W / 2; const cy = H / 2
//     const G = mass * 2000

//     if (!initialized.current) { reset(W, H); initialized.current = true }

//     const s = stateRef.current
//     const dx = cx - s.x; const dy = cy - s.y
//     const r2 = dx * dx + dy * dy; const r = Math.sqrt(r2)
//     const ax = G * dx / (r2 * r); const ay = G * dy / (r2 * r)

//     const dt = 0.4
//     s.vx += ax * dt; s.vy += ay * dt
//     s.x += s.vx * dt; s.y += s.vy * dt

//     s.trail.push({ x: s.x, y: s.y })
//     if (s.trail.length > 300) s.trail.shift()

//     // Reset if too close / escaped
//     if (r < 14 || r > W) { reset(W, H) }

//     ctx.clearRect(0, 0, W, H)

//     // Stars bg
//     if (!(ctx as any)._stars) {
//       (ctx as any)._stars = Array.from({ length: 60 }, () => ({
//         x: Math.random() * W, y: Math.random() * H,
//         r: Math.random() * 1.2 + 0.3,
//       }))
//     }
//     for (const star of (ctx as any)._stars) {
//       ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
//       ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.1})`; ctx.fill()
//     }

//     // Trail
//     if (s.trail.length > 2) {
//       ctx.beginPath()
//       ctx.moveTo(s.trail[0].x, s.trail[0].y)
//       for (let i = 1; i < s.trail.length; i++) {
//         const a = i / s.trail.length
//         ctx.strokeStyle = `rgba(77,182,172,${a * 0.7})`
//         ctx.lineWidth = a * 2
//         ctx.lineTo(s.trail[i].x, s.trail[i].y)
//       }
//       ctx.stroke()
//     }

//     // Sun
//     const sg = ctx.createRadialGradient(cx - 6, cy - 6, 4, cx, cy, 22)
//     sg.addColorStop(0, '#fff9c4'); sg.addColorStop(0.5, '#ffb300'); sg.addColorStop(1, '#e65100')
//     ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2)
//     ctx.fillStyle = sg; ctx.fill()

//     // Glow
//     const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 60)
//     glow.addColorStop(0, 'rgba(255,180,0,0.15)'); glow.addColorStop(1, 'rgba(255,180,0,0)')
//     ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2)
//     ctx.fillStyle = glow; ctx.fill()

//     // Planet
//     const pg = ctx.createRadialGradient(s.x - 4, s.y - 4, 2, s.x, s.y, 12)
//     pg.addColorStop(0, '#80cbc4'); pg.addColorStop(1, '#00695c')
//     ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, Math.PI * 2)
//     ctx.fillStyle = pg; ctx.fill()
//     ctx.strokeStyle = '#4db6ac'; ctx.lineWidth = 1; ctx.stroke()

//     // Stats
//     const vel = Math.sqrt(s.vx ** 2 + s.vy ** 2)
//     ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, 8, 200, 62)
//     ctx.fillStyle = '#4db6ac'; ctx.font = 'bold 11px DM Mono, monospace'
//     ctx.fillText(`VELOCITY: ${vel.toFixed(2)} u/s`, 16, 26)
//     ctx.fillText(`DISTANCE: ${r.toFixed(1)} px`, 16, 44)
//     ctx.fillText(`GRAVITY: ${(G / r2).toFixed(4)} u/s²`, 16, 62)

//     animRef.current = requestAnimationFrame(draw)
//   }, [speed, mass, reset])

//   useEffect(() => {
//     initialized.current = false
//     animRef.current = requestAnimationFrame(draw)
//     return () => cancelAnimationFrame(animRef.current)
//   }, [draw])

//   return (
//     <div className="space-y-4">
//       <canvas ref={canvasRef} width={680} height={340} className="w-full rounded-[10px] bg-[#0a0a0a]" />
//       <div className="grid grid-cols-2 gap-4">
//         <SliderControl label="Initial Speed" value={speed} min={1} max={12} unit=" u/s" onChange={(v) => { setSpeed(v); initialized.current = false }} color="#4db6ac" />
//         <SliderControl label="Star Mass" value={mass} min={1} max={12} unit=" M" onChange={(v) => { setMass(v); initialized.current = false }} color="#ffb300" />
//       </div>
//     </div>
//   )
// }

// // ─── Shared slider control ─────────────────────────────────────────────────────

// function SliderControl({
//   label, value, min, max, unit, onChange, color,
// }: {
//   label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; color: string
// }) {
//   return (
//     <div>
//       <div className="mb-1.5 flex items-center justify-between">
//         <span className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.1em] text-[#777]">
//           {label}
//         </span>
//         <span className="font-['DM_Mono',monospace] text-[11px] font-bold" style={{ color }}>
//           {value}{unit}
//         </span>
//       </div>
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={value}
//         onChange={(e) => onChange(Number(e.target.value))}
//         className="w-full h-1 rounded-full appearance-none cursor-pointer"
//         style={{
//           background: `linear-gradient(to right, ${color}66 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`,
//           accentColor: color,
//         }}
//       />
//     </div>
//   )
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// export default function PhysicsVisualizer() {
//   const [open, setOpen] = useState(false)
//   const [activeSim, setActiveSim] = useState<SimKey>('projectile')

//   const activeMeta = SIMS.find(s => s.key === activeSim)!

//   const renderSim = () => {
//     switch (activeSim) {
//       case 'projectile': return <ProjectileSim />
//       case 'pendulum':   return <PendulumSim />
//       case 'waves':      return <WavesSim />
//       case 'optics':     return <OpticsSim />
//       case 'electric':   return <ElectricSim />
//       case 'orbital':    return <OrbitalSim />
//     }
//   }

//   return (
//     <>
//       {/* Floating button */}
//       <button
//         type="button"
//         onClick={() => setOpen(true)}
//         className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] text-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition hover:scale-105 hover:bg-[#252525] active:scale-95"
//         title="Physics Visualizer"
//       >
//         ⚛️
//       </button>

//       {/* Modal overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
//           onClick={() => setOpen(false)}
//         >
//           <div
//             className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
//             style={{ maxHeight: 'calc(100vh - 2rem)' }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between border-b border-white/10 bg-[#161616] px-5 py-4">
//               <div className="flex items-center gap-3">
//                 <span className="text-xl">⚛️</span>
//                 <div>
//                   <h2 className="text-[15px] font-bold text-[#f2f0eb]">Physics Visualizer</h2>
//                   <p className="text-[11px] text-[#666]">Interactive physics simulations</p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setOpen(false)}
//                 className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#1e1e1e] text-[#888] transition hover:bg-[#2a2a2a] hover:text-[#d4d4d4]"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Body: sidebar + canvas */}
//             <div className="flex flex-1 overflow-hidden">
//               {/* Sim picker */}
//               <div className="flex w-52 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-white/10 bg-[#0e0e0e] p-3">
//                 {SIMS.map((sim) => (
//                   <button
//                     key={sim.key}
//                     type="button"
//                     onClick={() => setActiveSim(sim.key)}
//                     className={cn(
//                       "flex flex-col items-start gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition",
//                       activeSim === sim.key
//                         ? 'border-white/15 bg-[#1e1e1e]'
//                         : 'border-transparent hover:border-white/8 hover:bg-[#161616]'
//                     )}
//                   >
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm">{sim.icon}</span>
//                       <span
//                         className="font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.06em]"
//                         style={{ color: activeSim === sim.key ? sim.color : '#888' }}
//                       >
//                         {sim.label}
//                       </span>
//                     </div>
//                     {activeSim === sim.key && (
//                       <p className="ml-6 text-[10px] leading-[1.4] text-[#555]">{sim.description}</p>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {/* Sim canvas area */}
//               <div className="flex-1 overflow-y-auto p-5">
//                 <div className="mb-3 flex items-center gap-2">
//                   <span
//                     className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em]"
//                     style={{ color: activeMeta.color }}
//                   >
//                     {activeMeta.icon} {activeMeta.label}
//                   </span>
//                   <span className="text-[9px] text-[#444]">—</span>
//                   <span className="text-[11px] text-[#555]">{activeMeta.description}</span>
//                 </div>

//                 {renderSim()}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }