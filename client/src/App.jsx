import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'

export default function App() {
  const coinRef = useRef(null)
  const shadowRef = useRef(null)
  const frameRef = useRef(null)
  const physicsRef = useRef(null)
  const [phase, setPhase] = useState('ready')
  const [result, setResult] = useState('')
  const [sound, setSound] = useState(false)

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  function renderPhysics(physics) {
    if (!coinRef.current || !shadowRef.current) return
    const progress = Math.min(1, Math.max(0, (physics.ground - physics.y) / physics.ground))
    coinRef.current.style.transform = `translate3d(${physics.x}px, ${physics.y}px, 0) rotateX(${physics.rx}deg) rotateY(${physics.ry}deg) rotateZ(${physics.rz}deg)`
    coinRef.current.style.opacity = physics.opacity
    shadowRef.current.style.transform = `translateX(calc(-50% + ${physics.x}px)) scale(${0.45 + progress * 0.75})`
    shadowRef.current.style.opacity = `${0.12 + progress * 0.4}`
  }

  function toss() {
    if (phase === 'tossing') return
    cancelAnimationFrame(frameRef.current)
    const ground = Math.min(330, Math.max(230, window.innerHeight * 0.42))
    const outcome = ['STANDS STRAIGHT', 'VANISHES', 'BOUNCES OUT'][Math.floor(Math.random() * 3)]
    const direction = Math.random() < 0.5 ? -1 : 1
    const physics = { x: -20, y: -ground, ground, vx: 22 + Math.random() * 12, vy: 0, rx: 10, ry: 12, rz: -4, arx: 370, ary: 460, arz: 80, bounces: 0, miniBounces: 0, time: 0, impactSlow: 1, outcome, direction, opacity: 1, bounceOutStarted: false }
    physicsRef.current = physics
    setPhase('tossing')
    setResult('')

    const tick = now => {
      const current = physicsRef.current
      if (!current) return
      const delta = Math.min(0.034, (now - (current.last || now)) / 1000) * 0.36 * current.impactSlow
      current.last = now
      current.time += delta
      current.vy += 920 * delta
      current.y += current.vy * delta
      current.x += current.vx * delta
      current.rx += current.arx * delta
      current.ry += current.ary * delta
      current.rz += current.arz * delta
      current.arx *= 0.999
      current.ary *= 0.999
      current.arz *= 0.998
      if (current.y >= 0) {
        current.y = 0
        current.bounces += 1

        if (current.outcome === 'BOUNCES OUT' && current.bounces === 1) {
          // First hit: redirect sideways with strong bounce
          current.vy = -Math.abs(current.vy) * 0.55
          current.vx = current.direction * (60 + Math.random() * 20)
          current.arx *= 0.5
          current.ary *= 0.6
          current.arz = current.direction * 200
          current.impactSlow = 0.4
          current.bounceOutStarted = true
        } else if (current.outcome === 'BOUNCES OUT' && current.bounceOutStarted) {
          // Each mini-bounce: smaller and faster off-screen
          current.miniBounces += 1
          const bounceFade = Math.pow(0.45, current.miniBounces)
          current.vy = -Math.abs(current.vy) * bounceFade * 0.9
          current.vx = current.direction * (80 + current.miniBounces * 35)
          current.arx *= 0.55
          current.ary *= 0.55
          current.arz = current.direction * (160 - current.miniBounces * 20)
          current.impactSlow = 1
        } else {
          current.vy = -Math.abs(current.vy) * (current.bounces === 1 ? 0.42 : 0.18)
          current.vx *= 0.78
          current.arx *= 0.65
          current.ary *= 0.7
          current.impactSlow = current.bounces === 1 ? 0.38 : 1
        }
      }
      if (current.outcome === 'BOUNCES OUT' && current.bounceOutStarted) {
        // Fade out as it moves off-screen
        const xFrac = Math.abs(current.x) / (window.innerWidth * 0.45)
        if (xFrac > 0.6) {
          current.opacity = Math.max(0.08, current.opacity - delta * 1.1)
        }
      }
      if (current.outcome === 'VANISHES' && current.bounces > 0 && current.time > 2.2) {
        current.opacity = Math.max(0, current.opacity - delta * 1.5)
      }
      if (current.bounces > 0 && current.time > 2.2) {
        const settle = Math.min(1, (current.time - 2.2) / 1)
        if (current.outcome === 'STANDS STRAIGHT') {
          current.ry = 90 + Math.sin(current.time * 10) * 10 * (1 - settle)
          current.rx = 0
          current.rz = 0
        }
      }
      renderPhysics(current)
      const exited = Math.abs(current.x) > window.innerWidth * 0.65 || current.y > ground + 80
      if ((current.outcome === 'VANISHES' && current.opacity <= 0) || (current.outcome === 'BOUNCES OUT' && (exited || current.time > 5.5)) || (current.outcome === 'STANDS STRAIGHT' && current.bounces > 0 && current.time > 3.2)) {
        setResult(current.outcome)
        setPhase('result')
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  function reset() {
    cancelAnimationFrame(frameRef.current)
    setPhase('ready')
    setResult('')
    if (coinRef.current) {
      coinRef.current.style.opacity = '1'
      coinRef.current.style.transform = 'translate3d(-20px, -230px, 0) rotateX(10deg) rotateY(12deg) rotateZ(-4deg)'
    }
  }

  return <main className="flip-app">
    <header className="flip-header">
      <div className="brand"><span className="brand-mark">$</span><span>COIN'T <b>FLIP</b></span></div>
      <button className="sound-button" onClick={() => setSound(!sound)} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
    </header>
    <section className="flip-stage">
      <p className="flip-kicker">A DECISION, SIMPLIFIED</p>
      <h1>Flip the coin.</h1>
      <div className="flip-scene">
        <div className="scene-label"><span>3D COIN FLIP</span><span>{phase === 'tossing' ? 'IN THE AIR' : result || 'READY'}</span></div>
        <div className="scene"><div className="ceiling-line" /><div className="height-mark"><span>HEIGHT</span><i /></div><div className="coin-wrap" ref={coinRef}><div className="coin"><div className="coin-face front"><small>UNITED STATES</small><strong>1</strong><span>DOLLAR</span></div><div className="coin-edge">✦ ✦ ✦ ✦ ✦</div><div className="coin-face back"><small>ONE</small><strong>$</strong><span>DOLLAR</span></div></div></div><div className="shadow" ref={shadowRef} /><div className="table"><span>FLIP SURFACE</span></div></div>
        <div className="scene-footer"><span>GRAVITY <b>9.81</b></span><span>3D PHYSICS</span><span>TIME SCALE <b>0.36×</b></span></div>
      </div>
      {result && <div className="flip-result" aria-live="polite"><span>THE COIN SAYS</span><strong>{result}</strong></div>}
      <button className="flip-button" onClick={toss} disabled={phase === 'tossing'}>{phase === 'tossing' ? 'FLIPPING...' : result ? 'FLIP AGAIN' : 'FLIP THE COIN'}</button>
      {result && <button className="reset-button" onClick={reset}><RotateCcw size={15} /> RESET</button>}
    </section>
    <footer>COIN'T FLIP <span>·</span> STAND, VANISH, OR BOUNCE AWAY.</footer>
  </main>
}
