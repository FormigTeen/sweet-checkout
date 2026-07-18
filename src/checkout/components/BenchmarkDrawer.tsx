import { AnimatePresence, motion } from 'framer-motion'
import { X } from './Icons'
import { tick } from '../lib/feedback'
import {
  FAST_CHECKOUT_TAPS,
  MERCADO_LIVRE_TAPS,
  benchKey,
  benchmark,
} from '../lib/benchmark'
import type { Mode } from '../types'

export function BenchmarkDrawer({
  open,
  taps,
  elapsedMs,
  mode,
  auth,
  onClose,
}: {
  open: boolean
  taps: number
  elapsedMs: number | null
  mode: Mode
  auth: 0 | 1
  onClose: () => void
}) {
  const currentKey = benchKey(mode, auth)
  const beatsMl = taps <= MERCADO_LIVRE_TAPS
  const elapsedLabel = formatElapsed(elapsedMs)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bench-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            tick()
            onClose()
          }}
        >
          <motion.aside
            className="bench-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bench-drawer-head">
              <span className="bench-eyebrow">Benchmark de toques</span>
              <button
                className="icon-btn subtle"
                aria-label="Fechar"
                onClick={() => {
                  tick()
                  onClose()
                }}
              >
                <X width={20} height={20} />
              </button>
            </div>

            <div className="bench-hero">
              <div className="bench-metric">
                <span className="bench-big">{taps}</span>
                <span className="bench-unit">
                  toques
                  <br />
                  nesta compra
                </span>
              </div>
              <div className="bench-metric time">
                <span className="bench-big">{elapsedLabel}</span>
                <span className="bench-unit">
                  do 1º toque
                  <br />
                  até concluir
                </span>
              </div>
            </div>
            <p className={`bench-verdict ${beatsMl ? 'win' : ''}`}>
              {beatsMl
                ? `Igualou ou superou o Mercado Livre (${MERCADO_LIVRE_TAPS} toques na 2ª compra).`
                : `Mercado Livre finaliza em ${MERCADO_LIVRE_TAPS} toques na 2ª compra.`}
              {' '}Fast checkout fica em {FAST_CHECKOUT_TAPS} toques.
            </p>

            <table className="bench-table">
              <thead>
                <tr>
                  <th>Cenário</th>
                  <th>Toques</th>
                </tr>
              </thead>
              <tbody>
                {benchmark.map((r) => (
                  <tr
                    key={r.key}
                    className={`${r.key === currentKey ? 'me' : ''} ${
                      r.key === 'fast-checkout' ? 'fast' : ''
                    }`}
                  >
                    <td>
                      <b>{r.label}</b>
                      <span className="bench-note">{r.note}</span>
                    </td>
                    <td className="bench-taps">
                      {r.taps}
                      {r.typing && <em>+ digitação</em>}
                    </td>
                  </tr>
                ))}
                <tr className="ml">
                  <td>
                    <b>Mercado Livre</b>
                    <span className="bench-note">2ª compra · referência de mercado</span>
                  </td>
                  <td className="bench-taps">{MERCADO_LIVRE_TAPS}</td>
                </tr>
              </tbody>
            </table>
            <p className="bench-foot">
              Toques = seleções e botões. Não conta digitação de teclado. Sem
              scroll nas etapas rápidas. Tempo = do primeiro toque registrado
              até a compra concluída.
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function formatElapsed(ms: number | null) {
  if (ms == null) return '—'
  const totalSeconds = Math.max(1, Math.round(ms / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`
}
