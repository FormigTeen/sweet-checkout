import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Mode } from '../types'
import type { SimConfig } from '../CheckoutContext'
import { Bolt, ChevronRight, Copy, Gear, Minus, Plus } from './Icons'
import { select, tick } from '../lib/feedback'

function fastLink(auth: 0 | 1) {
  const { origin, pathname } = window.location
  const step = auth === 1 ? 'payment' : 'auth'
  return `${origin}${pathname}?step=${step}&mode=complete&auth=${auth}&fast=1`
}

function SimRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const set = (v: number) => {
    if (v < min || v > max) return
    tick()
    onChange(v)
  }
  return (
    <div className="sim-row">
      <span className="sim-label">{label}</span>
      <div className="qty small">
        <button
          className="qty-btn"
          aria-label={`Menos ${label}`}
          disabled={value <= min}
          onClick={() => set(value - 1)}
        >
          <Minus width={14} height={14} />
        </button>
        <span className="qty-val">{value}</span>
        <button
          className="qty-btn"
          aria-label={`Mais ${label}`}
          disabled={value >= max}
          onClick={() => set(value + 1)}
        >
          <Plus width={14} height={14} />
        </button>
      </div>
    </div>
  )
}

export function DemoDock({
  mode,
  auth,
  sim,
  onChange,
  onSim,
  onFast,
}: {
  mode: Mode
  auth: 0 | 1
  sim: SimConfig
  onChange: (patch: Partial<{ mode: Mode; auth: 0 | 1 }>) => void
  onSim: (patch: Partial<SimConfig>) => void
  onFast: (auth: 0 | 1) => void
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<0 | 1 | null>(null)

  function copy(a: 0 | 1) {
    tick()
    navigator.clipboard?.writeText(fastLink(a)).catch(() => {})
    setCopied(a)
    window.setTimeout(() => setCopied((c) => (c === a ? null : c)), 1600)
  }

  return (
    <div className="demo-dock">
      <AnimatePresence>
        {open && (
          <motion.div
            className="demo-panel"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className="demo-group">
              <span className="demo-label">Modo</span>
              <div className="seg">
                <button
                  className={mode === 'simple' ? 'on' : ''}
                  onClick={() => {
                    tick()
                    onChange({ mode: 'simple' })
                  }}
                >
                  1ª compra
                </button>
                <button
                  className={mode === 'complete' ? 'on' : ''}
                  onClick={() => {
                    tick()
                    onChange({ mode: 'complete' })
                  }}
                >
                  Recorrente
                </button>
              </div>
            </div>
            <div className="demo-group">
              <span className="demo-label">Autenticação</span>
              <div className="seg">
                <button
                  className={auth === 0 ? 'on' : ''}
                  onClick={() => {
                    tick()
                    onChange({ auth: 0 })
                  }}
                >
                  Deslogado
                </button>
                <button
                  className={auth === 1 ? 'on' : ''}
                  onClick={() => {
                    tick()
                    onChange({ auth: 1 })
                  }}
                >
                  Logado
                </button>
              </div>
            </div>

            <div className="demo-group demo-sim">
              <span className="demo-label">Simulação</span>
              <SimRow
                label="Produtos"
                value={sim.products}
                min={1}
                max={4}
                onChange={(v) => onSim({ products: v })}
              />
              <SimRow
                label="Cartões salvos"
                value={sim.cards}
                min={0}
                max={3}
                onChange={(v) => onSim({ cards: v })}
              />
              <SimRow
                label="Endereços salvos"
                value={sim.addresses}
                min={0}
                max={3}
                onChange={(v) => onSim({ addresses: v })}
              />
            </div>

            <div className="demo-fast">
              <span className="demo-label">
                <Bolt width={12} height={12} /> Fast checkout
              </span>
              <p className="demo-fast-desc">
                Abre no pagamento; se deslogado, identifica antes.
              </p>
              <div className="fast-rows">
                <div className="fast-row">
                  <button
                    className="fast-go"
                    onClick={() => {
                      select()
                      onFast(1)
                    }}
                  >
                    Testar · logado
                  </button>
                  <button
                    className="fast-copy"
                    aria-label="Copiar link logado"
                    onClick={() => copy(1)}
                  >
                    {copied === 1 ? '✓' : <Copy width={15} height={15} />}
                  </button>
                </div>
                <div className="fast-row">
                  <button
                    className="fast-go alt"
                    onClick={() => {
                      select()
                      onFast(0)
                    }}
                  >
                    Testar · deslogado
                  </button>
                  <button
                    className="fast-copy"
                    aria-label="Copiar link deslogado"
                    onClick={() => copy(0)}
                  >
                    {copied === 0 ? '✓' : <Copy width={15} height={15} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="demo-fab"
        onClick={() => {
          tick()
          setOpen((o) => !o)
        }}
        aria-expanded={open}
      >
        <Gear width={18} height={18} />
        <span className="demo-fab-label">Configuração da Demo</span>
        <span className={`demo-fab-caret ${open ? 'open' : ''}`}>
          <ChevronRight width={16} height={16} />
        </span>
      </button>
    </div>
  )
}
