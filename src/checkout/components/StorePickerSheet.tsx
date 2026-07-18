import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Store, X } from './Icons'
import { pickupStores } from '../lib/mockData'
import { select as selectSound, tick } from '../lib/feedback'

export function StorePickerSheet({
  open,
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')

  const stores = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = pickupStores.filter(
      (s) =>
        !q ||
        s.neighborhood.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    )
    return [...list].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
  }, [query])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            tick()
            onClose()
          }}
        >
          <motion.div
            className="sheet sheet-tall"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-grip" />
            <div className="sheet-head">
              <span className="sheet-icon">
                <Store width={20} height={20} />
              </span>
              <h2 className="sheet-title">
                Lojas para retirada · {pickupStores.length}
              </h2>
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

            <input
              className="pickup-search"
              autoFocus
              placeholder="Buscar por bairro ou cidade"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="store-sheet-list">
              {stores.map((s) => {
                const on = selectedId === s.id
                return (
                  <button
                    key={s.id}
                    className={`store-row ${on ? 'on' : ''}`}
                    onClick={() => {
                      selectSound()
                      onSelect(s.id)
                      onClose()
                    }}
                  >
                    <span className="sel-icon">
                      <Store width={20} height={20} />
                    </span>
                    <span className="store-row-body">
                      <span className="store-row-name">
                        {s.name}
                        {s.favorite && <span className="sel-badge">Sua loja</span>}
                      </span>
                      <span className="store-row-sub">
                        {s.neighborhood} · {s.city} ·{' '}
                        <b className="pickup-ready">{s.ready}</b>
                      </span>
                    </span>
                    <span className="store-row-dist">{s.distanceKm} km</span>
                    {on && (
                      <span className="store-row-check">
                        <Check width={15} height={15} />
                      </span>
                    )}
                  </button>
                )
              })}
              {stores.length === 0 && (
                <p className="pickup-empty">Nenhuma loja encontrada.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
