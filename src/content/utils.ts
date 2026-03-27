export function getAccuracyColor(pct: number): string {
  if (pct <= 5) return '#58cc02'
  if (pct <= 15) return '#FFD93D'
  if (pct <= 30) return '#FF8C42'
  return '#FF6B6B'
}

export function getAccuracyEmoji(pct: number): string {
  if (pct === 0) return '\u{1F3C6}'
  if (pct <= 5) return '\u{1F929}'
  if (pct <= 10) return '\u{1F525}'
  if (pct <= 15) return '\u{1F44F}'
  if (pct <= 30) return '\u{1F914}'
  return '\u{1F605}'
}

export function getAccuracyLabel(pct: number): string {
  if (pct === 0) return 'PERFECT!'
  if (pct <= 5) return 'Incredible!'
  if (pct <= 10) return 'So close!'
  if (pct <= 15) return 'Not bad!'
  if (pct <= 30) return 'Nice try!'
  return 'Way off!'
}
