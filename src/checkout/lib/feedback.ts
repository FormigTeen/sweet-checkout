/* ============================================================
   Feedback sensorial.
   A recompensa sonora fica concentrada na finalização do pagamento.
   ============================================================ */

let ctx: AudioContext | null = null
let muted = loadMuted()

function loadMuted(): boolean {
  try {
    return localStorage.getItem('lb.sound') === 'off'
  } catch {
    return false
  }
}

export function isMuted() {
  return muted
}

export function toggleMuted(): boolean {
  muted = !muted
  try {
    localStorage.setItem('lb.sound', muted ? 'off' : 'on')
  } catch {
    /* noop */
  }
  return muted
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Prepara o AudioContext no gesto de pagar, sem emitir som. */
export function armRewardAudio() {
  void audio()
}

type Wave = OscillatorType

function note(
  freq: number,
  start: number,
  dur: number,
  gain = 0.06,
  wave: Wave = 'sine',
) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = wave
  osc.frequency.value = freq
  const t = ac.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* noop */
  }
}

/** Interações comuns ficam silenciosas para preservar a recompensa final. */
export function tick() {
  /* intentionally silent */
}

export function select() {
  /* intentionally silent */
}

export function stepDone() {
  vibrate(10)
}

/** Recompensa final — arpejo alegre. */
export function reward() {
  const seq = [523.25, 659.25, 783.99, 1046.5] // C E G C
  seq.forEach((f, i) => note(f, i * 0.11, 0.4, 0.07, 'sine'))
  note(1318.51, 0.5, 0.6, 0.05, 'triangle')
  vibrate([20, 40, 20, 40, 60])
}

export function protect() {
  /* intentionally silent */
}

export function warn() {
  /* intentionally silent */
}
