import { useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Sound effect types
export type SoundEffect =
  | 'join'       // Player joins room
  | 'leave'      // Player leaves room
  | 'start'      // Game starts
  | 'vote'       // Vote cast
  | 'eliminate'  // Player eliminated
  | 'victory'    // Crew wins
  | 'defeat'     // Impostor wins
  | 'tick'       // Countdown tick
  | 'reveal'     // Impostor revealed
  | 'notification' // Generic notification

// Sound store for global mute state
interface SoundState {
  isMuted: boolean
  volume: number
  toggleMute: () => void
  setVolume: (volume: number) => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isMuted: false,
      volume: 0.5,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'impostor-sound',
    }
  )
)

// Sound file paths (relative to public folder)
const SOUND_PATHS: Record<SoundEffect, string> = {
  join: '/sounds/join.mp3',
  leave: '/sounds/leave.mp3',
  start: '/sounds/start.mp3',
  vote: '/sounds/vote.mp3',
  eliminate: '/sounds/eliminate.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  tick: '/sounds/tick.mp3',
  reveal: '/sounds/reveal.mp3',
  notification: '/sounds/notification.mp3',
}

// Audio cache
const audioCache = new Map<SoundEffect, HTMLAudioElement>()

// Preload sounds
function preloadSound(effect: SoundEffect): HTMLAudioElement | null {
  if (audioCache.has(effect)) {
    return audioCache.get(effect)!
  }

  try {
    const audio = new Audio(SOUND_PATHS[effect])
    audio.preload = 'auto'
    audioCache.set(effect, audio)
    return audio
  } catch {
    console.warn(`Failed to preload sound: ${effect}`)
    return null
  }
}

// Hook for playing sounds
export function useSound() {
  const { isMuted, volume } = useSoundStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preload common sounds on mount
  useEffect(() => {
    const commonSounds: SoundEffect[] = ['join', 'vote', 'notification']
    commonSounds.forEach(preloadSound)
  }, [])

  const play = useCallback(
    (effect: SoundEffect) => {
      if (isMuted) return

      const audio = preloadSound(effect)
      if (!audio) return

      // Clone audio for overlapping sounds
      const clone = audio.cloneNode() as HTMLAudioElement
      clone.volume = volume

      clone.play().catch(() => {
        // Ignore autoplay errors (user hasn't interacted yet)
      })

      audioRef.current = clone
    },
    [isMuted, volume]
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return {
    play,
    stop,
    isMuted,
    volume,
    toggleMute: useSoundStore.getState().toggleMute,
    setVolume: useSoundStore.getState().setVolume,
  }
}
