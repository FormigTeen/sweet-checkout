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

export const benchmark: BenchRow[] = [
  {
    key: 'complete-1',
    label: 'Recorrente + logado',
    taps: 3,
    typing: false,
    note: 'Sacola → Entrega → Pagar. Tudo pré-selecionado.',
  },
  {
    key: 'complete-0',
    label: 'Recorrente + login',
    taps: 4,
    typing: true,
    note: '+ 1 toque para enviar o código (dados já salvos).',
  },
  {
    key: 'simple-1',
    label: '1ª compra + logado',
    taps: 4,
    typing: true,
    note: 'Digita endereço; frete e PIX em 1 toque cada.',
  },
  {
    key: 'simple-0',
    label: '1ª compra completa',
    taps: 5,
    typing: true,
    note: 'Identificação + endereço + frete + PIX.',
  },
]

export function benchKey(mode: 'simple' | 'complete', auth: 0 | 1) {
  return `${mode}-${auth}`
}
