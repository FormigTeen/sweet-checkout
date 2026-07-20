/* ============================================================
   Feedback sensorial — "açúcar" da interface.
   Sons gerados via Web Audio API (sem arquivos) + vibração tátil.
   Tudo é disparado por gesto do usuário e pode ser silenciado.
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
  if (!muted) tick() // pequeno retorno ao religar
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

type Wave = OscillatorType

function note(
  freq: number,
  start: number,
  dur: number,
  gain = 0.06,
  wave: Wave = 'sine',
  force = false,
) {
  if (!force) return
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

/** Toque leve — seleção / navegação. */
export function tick() {
  vibrate(8)
}

/** Confirmação de item / seleção que avança. */
export function select() {
  vibrate(12)
}

/** Etapa concluída — dois tons ascendentes. */
export function stepDone() {
  vibrate([14, 30, 10])
}

/** Confirmação de pagamento — som reservado para o momento de recompensa. */
export function paymentConfirm() {
  note(587.33, 0, 0.09, 0.05, 'triangle', true)
  note(880, 0.05, 0.12, 0.05, 'sine', true)
  vibrate([14, 24, 14])
}

/** Recompensa final — arpejo alegre. */
export function reward() {
  const seq = [523.25, 659.25, 783.99, 1046.5] // C E G C
  seq.forEach((f, i) => note(f, i * 0.11, 0.4, 0.07, 'sine', true))
  note(1318.51, 0.5, 0.6, 0.05, 'triangle', true)
  vibrate([20, 40, 20, 40, 60])
}

/** Produto protegido — selo de garantia (acorde caloroso). */
export function protect() {
  vibrate([12, 24, 12])
}

/** Aviso suave — erro de validação. */
export function warn() {
  vibrate([30, 20, 30])
}
