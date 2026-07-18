import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { BottomBar } from '../components/BottomBar'
import { Mail } from '../components/Icons'
import {
  AppleMark,
  FacebookMark,
  GoogleMark,
} from '../components/SocialIcons'
import { select, stepDone, tick, warn } from '../lib/feedback'

const TEST_CODE = '123456'
const SOCIAL_LOGIN_DELAY_MS = 4000

type Phase = 'start' | 'code' | 'password' | 'loading'
type LoadingState = {
  title: string
  subtitle: string
  provider?: 'google' | 'facebook' | 'apple'
}

export function AuthStep({ onNext }: { onNext: () => void }) {
  const { contact, setContact, tap, registerBack } = useCheckout()
  const [phase, setPhase] = useState<Phase>('start')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState<LoadingState>({
    title: '',
    subtitle: '',
  })
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  const emailOk = /\S+@\S+\.\S+/.test(email)

  // Autofocus somente depois da escolha do usuario; no e-mail inicial o teclado
  // mobile aparece cedo demais e atrapalha a leitura das opções.
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === 'code') boxes.current[0]?.focus()
      if (phase === 'password') passRef.current?.focus()
    }, 60)
    return () => clearTimeout(t)
  }, [phase])

  // voltar contextual: código/senha → volta para o início
  useEffect(() => {
    registerBack(() => {
      if (phase === 'code' || phase === 'password') {
        setPhase('start')
        return true
      }
      if (phase === 'loading') return true
      return false
    })
    return () => registerBack(null)
  }, [phase, registerBack])

  function loginWith(provider: 'google' | 'facebook' | 'apple') {
    const providerName =
      provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'Apple'
    tap()
    select()
    setLoading({
      title: `Conectando com ${providerName}`,
      subtitle: 'Estamos confirmando sua conta com segurança.',
      provider,
    })
    setPhase('loading')
    setContact({
      phone: contact?.phone ?? '',
      name: contact?.name ?? '',
      email: contact?.email ?? `voce@${provider}.com`,
      cpf: contact?.cpf ?? '',
    })
    setTimeout(() => {
      stepDone()
      onNext()
    }, SOCIAL_LOGIN_DELAY_MS)
  }

  function sendCode() {
    if (!emailOk) return
    select()
    setResent(false)
    setContact({
      phone: contact?.phone ?? '',
      name: contact?.name ?? '',
      email,
      cpf: contact?.cpf ?? '',
    })
    setPhase('code')
  }

  function resendCode() {
    tick()
    setCode(['', '', '', '', '', ''])
    setError(false)
    setResent(true)
    boxes.current[0]?.focus()
  }

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = d
    setCode(next)
    setError(false)
    if (d && i < 5) boxes.current[i + 1]?.focus()
    if (next.every((x) => x)) verify(next.join(''))
  }

  function verify(entered: string) {
    if (entered === TEST_CODE) {
      setLoading({
        title: 'Validando código',
        subtitle: 'Só um instante enquanto liberamos a entrega.',
      })
      setPhase('loading')
      setTimeout(() => {
        stepDone()
        onNext()
      }, 850)
    } else {
      warn()
      setError(true)
      setCode(['', '', '', '', '', ''])
      boxes.current[0]?.focus()
    }
  }

  function enterWithPassword() {
    select()
    stepDone()
    setTimeout(onNext, 220)
  }

  return (
    <>
      <div className="step-scroll auth">
        {phase === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="step-title">Que bom te ver!</h1>
            <p className="step-sub">Entre para finalizar sua compra.</p>

            <div className="social">
              <button className="social-btn" onClick={() => loginWith('google')}>
                <GoogleMark />
                Continuar com Google
              </button>
              <button
                className="social-btn"
                onClick={() => loginWith('facebook')}
              >
                <FacebookMark />
                Continuar com Facebook
              </button>
              <button className="social-btn" onClick={() => loginWith('apple')}>
                <AppleMark />
                Continuar com Apple
              </button>
            </div>

            <div className="divider">
              <span>ou com e-mail</span>
            </div>

            <label className="field">
              <span className="field-label">E-mail</span>
              <div className="input-wrap">
                <Mail className="input-lead" width={18} height={18} />
                <input
                  ref={emailRef}
                  className="field-input has-lead"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      sendCode()
                    }
                  }}
                />
              </div>
            </label>
          </motion.div>
        )}

        {phase === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-center"
          >
            <h1 className="step-title">Digite o código</h1>
            <p className="step-sub">
              Enviamos 6 dígitos para <b>{email}</b>.{' '}
              <button
                className="linkish"
                onClick={() => {
                  tick()
                  setPhase('start')
                }}
              >
                Alterar
              </button>
            </p>
            <div className={`otp otp-6 ${error ? 'error' : ''}`}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el
                  }}
                  className="otp-box"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[i] && i > 0)
                      boxes.current[i - 1]?.focus()
                  }}
                />
              ))}
            </div>
            <p className="otp-hint">
              {error
                ? 'Código incorreto, tente de novo.'
                : resent
                  ? `Código reenviado. Use ${TEST_CODE}.`
                  : `Código de teste: ${TEST_CODE}`}
            </p>
            <button className="linkish block otp-resend" onClick={resendCode}>
              Reenviar código
            </button>
            <button
              className="linkish block"
              onClick={() => {
                tick()
                setPhase('password')
              }}
            >
              Prefiro usar minha senha
            </button>
          </motion.div>
        )}

        {phase === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-center"
          >
            <h1 className="step-title">Sua senha</h1>
            <p className="step-sub">
              Entrando como <b>{email}</b>.
            </p>
            <label className="field">
              <span className="field-label">Senha</span>
              <input
                ref={passRef}
                className="field-input"
                type="password"
                placeholder="••••••••"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    enterWithPassword()
                  }
                }}
              />
            </label>
            <button
              className="linkish block"
              onClick={() => {
                tick()
                setPhase('code')
              }}
            >
              Entrar com código
            </button>
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div
            key="auth-loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-center auth-loading"
          >
            <div className="auth-loader" aria-hidden>
              {loading.provider === 'google' && <GoogleMark />}
              {loading.provider === 'facebook' && <FacebookMark />}
              {loading.provider === 'apple' && <AppleMark />}
              {!loading.provider && <span className="spinner" />}
            </div>
            <h1 className="step-title">{loading.title}</h1>
            <p className="step-sub">{loading.subtitle}</p>
            <div className="auth-progress" aria-hidden>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: loading.provider ? SOCIAL_LOGIN_DELAY_MS / 1000 : 0.85,
                  ease: 'easeOut',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {phase === 'start' && (
        <BottomBar
          label="Continuar com e-mail"
          variant="green"
          disabled={!emailOk}
          onNext={sendCode}
        />
      )}
      {phase === 'password' && (
        <BottomBar label="Entrar" variant="green" onNext={enterWithPassword} />
      )}
    </>
  )
}
