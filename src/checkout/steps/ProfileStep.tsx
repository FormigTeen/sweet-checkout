import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { BottomBar } from '../components/BottomBar'
import { select, tick } from '../lib/feedback'

type ProfilePhase = 'name' | 'document' | 'birth' | 'gender'

const phases: ProfilePhase[] = ['name', 'document', 'birth', 'gender']

export function ProfileStep({ onNext }: { onNext: () => void }) {
  const { contact, setContact, registerBack } = useCheckout()
  const [phase, setPhase] = useState<ProfilePhase>('name')
  const [firstName, setFirstName] = useState(contact?.firstName ?? '')
  const [lastName, setLastName] = useState(contact?.lastName ?? '')
  const [cpf, setCpf] = useState(contact?.cpf ?? '')
  const [birthDate, setBirthDate] = useState(contact?.birthDate ?? '')
  const [gender, setGender] = useState(contact?.gender ?? '')

  const phaseIndex = phases.indexOf(phase)
  const ready = useMemo(() => {
    if (phase === 'name') return firstName.trim().length > 1 && lastName.trim().length > 1
    if (phase === 'document') return cpf.replace(/\D/g, '').length === 11
    if (phase === 'birth') return birthDate.length === 10
    return !!gender
  }, [phase, firstName, lastName, cpf, birthDate, gender])

  function saveAndNext() {
    if (!ready) return
    select()
    const nextContact = {
      phone: contact?.phone ?? '',
      email: contact?.email ?? '',
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      cpf: formatCpf(cpf),
      birthDate,
      gender,
    }
    setContact(nextContact)
    if (phaseIndex < phases.length - 1) {
      setPhase(phases[phaseIndex + 1])
      return
    }
    onNext()
  }

  function chooseGender(value: string) {
    tick()
    setGender(value)
  }

  useEffect(() => {
    registerBack(() => {
      if (phaseIndex <= 0) return false
      setPhase(phases[phaseIndex - 1])
      return true
    })
    return () => registerBack(null)
  }, [phaseIndex, registerBack])

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (ready) saveAndNext()
  }

  return (
    <>
      <div className="step-scroll profile-step">
        <div className="mini-progress">
          {phases.map((p, i) => (
            <span key={p} className={i <= phaseIndex ? 'on' : ''} />
          ))}
        </div>

        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {phase === 'name' && (
            <>
              <h1 className="step-title">Seus dados</h1>
              <p className="step-sub">Comece pelo nome de quem está comprando.</p>
              <label className="field">
                <span className="field-label">Nome</span>
                <input
                  className="field-input"
                  autoFocus
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={onInputKeyDown}
                />
              </label>
              <label className="field">
                <span className="field-label">Sobrenome</span>
                <input
                  className="field-input"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={onInputKeyDown}
                />
              </label>
            </>
          )}

          {phase === 'document' && (
            <>
              <h1 className="step-title">CPF</h1>
              <p className="step-sub">Usamos para emitir a nota fiscal.</p>
              <label className="field">
                <span className="field-label">CPF</span>
                <input
                  className="field-input big"
                  autoFocus
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  onKeyDown={onInputKeyDown}
                />
              </label>
            </>
          )}

          {phase === 'birth' && (
            <>
              <h1 className="step-title">Nascimento</h1>
              <p className="step-sub">Complete sua data de nascimento.</p>
              <label className="field">
                <span className="field-label">Data de nascimento</span>
                <input
                  className="field-input big"
                  autoFocus
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={birthDate}
                  onChange={(e) => setBirthDate(formatDate(e.target.value))}
                  onKeyDown={onInputKeyDown}
                />
              </label>
            </>
          )}

          {phase === 'gender' && (
            <>
              <h1 className="step-title">Gênero</h1>
              <p className="step-sub">Selecione uma opção para continuar.</p>
              <div className="profile-options">
                {['Feminino', 'Masculino', 'Prefiro não informar'].map((g) => (
                  <button
                    key={g}
                    className={gender === g ? 'on' : ''}
                    onClick={() => chooseGender(g)}
                  >
                    <span>{g}</span>
                    <i aria-hidden>{gender === g ? '✓' : ''}</i>
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <BottomBar
        label={phaseIndex === phases.length - 1 ? 'Salvar dados' : 'Continuar'}
        disabled={!ready}
        onNext={saveAndNext}
      />
    </>
  )
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatDate(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}
