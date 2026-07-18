/* Benchmark de toques na tela para concluir o checkout.
   Conta apenas TOQUES discretos (botões / seleções), não digitação.
   O caminho mínimo assume: seleção = confirmação (auto-avança) e os
   padrões já vêm marcados (frete "padrão", pagamento PIX). */

export interface BenchRow {
  key: string
  label: string
  taps: number
  typing: boolean
  note: string
}

export const MERCADO_LIVRE_TAPS = 4 // 2ª compra, sem scroll (referência)
export const FAST_CHECKOUT_TAPS = 2 // link direto no pagamento + PIX + pagar

export const benchmark: BenchRow[] = [
  {
    key: 'fast-checkout',
    label: 'Fast checkout',
    taps: FAST_CHECKOUT_TAPS,
    typing: false,
    note: 'Link abre no pagamento. PIX → revisar → pagar.',
  },
  {
    key: 'complete-1',
    label: 'Recorrente + logado',
    taps: 4,
    typing: false,
    note: 'Sacola → entrega recomendada → PIX → pagar.',
  },
  {
    key: 'complete-0',
    label: 'Recorrente + login',
    taps: 5,
    typing: true,
    note: '+ 1 toque para enviar o código (dados já salvos).',
  },
  {
    key: 'simple-1',
    label: '1ª compra + logado',
    taps: 5,
    typing: true,
    note: 'Digita endereço; frete, PIX e pagar em 1 toque cada.',
  },
  {
    key: 'simple-0',
    label: '1ª compra completa',
    taps: 6,
    typing: true,
    note: 'Identificação + endereço + frete + PIX + pagar.',
  },
]

export function benchKey(mode: 'simple' | 'complete', auth: 0 | 1) {
  return `${mode}-${auth}`
}
