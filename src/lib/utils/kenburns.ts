import type { KenBurnsConfig } from '@/types'

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

export function generateKenBurnsConfig(): KenBurnsConfig {
  const startScale = rand(1.0, 1.15)
  let endScale = rand(1.0, 1.3)
  while (Math.abs(endScale - startScale) < 0.05) {
    endScale = rand(1.0, 1.3)
  }

  const startX = rand(-3, 3)
  const startY = rand(-3, 3)
  let endX = rand(-3, 3)
  let endY = rand(-3, 3)
  while (Math.abs(endX - startX) < 1) endX = rand(-3, 3)
  while (Math.abs(endY - startY) < 1) endY = rand(-3, 3)

  return { startScale, endScale, startX, startY, endX, endY }
}
