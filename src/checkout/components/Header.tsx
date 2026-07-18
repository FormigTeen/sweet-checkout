import { useState } from 'react'
import { Logo } from './Logo'
import { ChevronLeft, Lock, SoundOff, SoundOn } from './Icons'
import { isMuted, toggleMuted, tick } from '../lib/feedback'
import { useCheckout } from '../CheckoutContext'

export function Header({
  canGoBack,
  onBack,
}: {
  canGoBack: boolean
  onBack: () => void
}) {
  const [muted, setMuted] = useState(isMuted())
  const { runBack } = useCheckout()

  return (
    <header className="hdr">
      <div className="hdr-left">
        {canGoBack ? (
          <button
            className="icon-btn"
            aria-label="Voltar"
            // evita que o 1º toque apenas tire o foco do input (blur) e "coma" o clique
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              tick()
              // primeiro desfaz um sub-estado da etapa; se não houver, volta de etapa
              if (!runBack()) onBack()
            }}
          >
            <ChevronLeft width={22} height={22} />
          </button>
        ) : (
          <span className="icon-btn-ghost" />
        )}
        <span className="logo-badge">
          <Logo height={18} />
        </span>
      </div>

      <div className="hdr-right">
        <button
          className="icon-btn subtle"
          aria-label={muted ? 'Ativar sons' : 'Silenciar sons'}
          aria-pressed={muted}
          onClick={() => setMuted(toggleMuted())}
        >
          {muted ? (
            <SoundOff width={20} height={20} />
          ) : (
            <SoundOn width={20} height={20} />
          )}
        </button>
        <span className="secure">
          <Lock width={15} height={15} />
          100% Seguro
        </span>
      </div>
    </header>
  )
}
