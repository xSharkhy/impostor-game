/**
 * Player Accent Color System
 * Each player gets a unique color from a closed set of 8 colors.
 * Colors are assigned based on join order (index in players array).
 */

export const PLAYER_COLORS = [
  { name: 'cyan', hex: '#00f0ff', css: 'var(--color-player-0)' },
  { name: 'pink', hex: '#ff2d6a', css: 'var(--color-player-1)' },
  { name: 'purple', hex: '#a855f7', css: 'var(--color-player-2)' },
  { name: 'green', hex: '#22ff88', css: 'var(--color-player-3)' },
  { name: 'yellow', hex: '#facc15', css: 'var(--color-player-4)' },
  { name: 'orange', hex: '#f97316', css: 'var(--color-player-5)' },
  { name: 'blue', hex: '#3b82f6', css: 'var(--color-player-6)' },
  { name: 'magenta', hex: '#ec4899', css: 'var(--color-player-7)' },
] as const

export type PlayerColorName = (typeof PLAYER_COLORS)[number]['name']

/**
 * Get player color by index (wraps around if > 8 players)
 */
export function getPlayerColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}

/**
 * Get player color by player ID from a list of players
 * Returns the color based on the player's position in the array
 */
export function getPlayerColorById(playerId: string, playerIds: string[]) {
  const index = playerIds.indexOf(playerId)
  if (index === -1) return PLAYER_COLORS[0]
  return getPlayerColor(index)
}

/**
 * Tailwind classes for player accent styling
 * Use these for consistent player identification across the app
 */
export const playerColorClasses = {
  cyan: {
    text: 'text-player-0',
    bg: 'bg-player-0',
    border: 'border-player-0',
    ring: 'ring-player-0',
  },
  pink: {
    text: 'text-player-1',
    bg: 'bg-player-1',
    border: 'border-player-1',
    ring: 'ring-player-1',
  },
  purple: {
    text: 'text-player-2',
    bg: 'bg-player-2',
    border: 'border-player-2',
    ring: 'ring-player-2',
  },
  green: {
    text: 'text-player-3',
    bg: 'bg-player-3',
    border: 'border-player-3',
    ring: 'ring-player-3',
  },
  yellow: {
    text: 'text-player-4',
    bg: 'bg-player-4',
    border: 'border-player-4',
    ring: 'ring-player-4',
  },
  orange: {
    text: 'text-player-5',
    bg: 'bg-player-5',
    border: 'border-player-5',
    ring: 'ring-player-5',
  },
  blue: {
    text: 'text-player-6',
    bg: 'bg-player-6',
    border: 'border-player-6',
    ring: 'ring-player-6',
  },
  magenta: {
    text: 'text-player-7',
    bg: 'bg-player-7',
    border: 'border-player-7',
    ring: 'ring-player-7',
  },
} as const

/**
 * Get Tailwind classes for a player by index
 */
export function getPlayerClasses(index: number) {
  const color = getPlayerColor(index)
  return playerColorClasses[color.name]
}

/**
 * Get inline style for player color (for dynamic styling)
 */
export function getPlayerStyle(index: number) {
  const color = getPlayerColor(index)
  return {
    color: color.css,
    borderColor: color.css,
    backgroundColor: color.css,
  }
}
