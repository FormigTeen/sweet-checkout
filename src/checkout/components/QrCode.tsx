// QR "decorativo" determinístico (apenas visual — checkout estático).
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function QrCode({
  data = 'lebiscuit-pix',
  size = 188,
}: {
  data?: string
  size?: number
}) {
  const n = 25
  const cell = size / n
  const seed = hash(data)

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0)
  }
  const finderOn = (r: number, c: number) => {
    const local = (br: number, bc: number) => {
      const y = r - br
      const x = c - bc
      if (y === 0 || y === 6 || x === 0 || x === 6) return true
      if (y >= 2 && y <= 4 && x >= 2 && x <= 4) return true
      return false
    }
    if (r < 7 && c < 7) return local(0, 0)
    if (r < 7 && c >= n - 7) return local(0, n - 7)
    if (r >= n - 7 && c < 7) return local(n - 7, 0)
    return false
  }

  const rects: { x: number; y: number }[] = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isFinder(r, c)) {
        if (finderOn(r, c)) rects.push({ x: c, y: r })
        continue
      }
      // módulos de dados pseudo-aleatórios estáveis
      const v = hash(`${seed}:${r}:${c}`)
      if (v % 100 < 46) rects.push({ x: c, y: r })
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR Code PIX"
    >
      <rect width={size} height={size} rx="10" fill="#fff" />
      {rects.map((m, i) => (
        <rect
          key={i}
          x={m.x * cell + 1}
          y={m.y * cell + 1}
          width={cell - 1}
          height={cell - 1}
          rx={cell * 0.2}
          fill="#1d1d1f"
        />
      ))}
    </svg>
  )
}
