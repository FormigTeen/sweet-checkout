export function brl(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// "R$ 74,90" dividido para estilização (símbolo / inteiro / centavos)
export function brlParts(cents: number) {
  const value = (cents / 100).toFixed(2)
  const [int, dec] = value.split('.')
  return {
    symbol: 'R$',
    int: Number(int).toLocaleString('pt-BR'),
    dec,
  }
}
