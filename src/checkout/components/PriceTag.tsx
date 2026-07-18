import { brlParts } from '../lib/format'

export function PriceTag({
  cents,
  size = 'md',
  className = '',
}: {
  cents: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const { symbol, int, dec } = brlParts(cents)
  return (
    <span className={`price price-${size} ${className}`}>
      <span className="price-sym">{symbol}</span>
      <span className="price-int">{int}</span>
      <span className="price-dec">,{dec}</span>
    </span>
  )
}
