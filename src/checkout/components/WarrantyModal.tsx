import { AnimatePresence, motion } from 'framer-motion'
import { Shield, X } from './Icons'
import { tick } from '../lib/feedback'

// Detalhes da garantia estendida — obrigatório por legislação (CDC).
export function WarrantyModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
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
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-grip" />
            <div className="sheet-head">
              <span className="sheet-icon">
                <Shield width={20} height={20} />
              </span>
              <h2 className="sheet-title">Garantia estendida</h2>
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

            <div className="sheet-body">
              <p>
                A garantia estendida é um <b>seguro opcional</b> que amplia a
                cobertura do fabricante contra defeitos de fabricação após o
                término da garantia legal e contratual.
              </p>
              <ul>
                <li>
                  Vigência iniciada ao fim da garantia do fabricante, pelo prazo
                  contratado (12 ou 24 meses).
                </li>
                <li>Cobre defeitos de funcionamento em uso normal.</li>
                <li>
                  Não cobre mau uso, quedas, danos por líquidos ou desgaste
                  natural.
                </li>
                <li>
                  Cancelamento e reembolso conforme o Código de Defesa do
                  Consumidor.
                </li>
              </ul>
              <p className="sheet-fine">
                Condições completas no certificado enviado por e-mail após a
                compra. Seguro garantido pela seguradora parceira · SUSEP.{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Ler condições gerais
                </a>
                .
              </p>
            </div>

            <button
              className="cta cta-green full sheet-cta"
              onClick={() => {
                tick()
                onClose()
              }}
            >
              Entendi
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
