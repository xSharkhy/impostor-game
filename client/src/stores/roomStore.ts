import { create } from 'zustand'
import type { ClientRoom, Player, RoomStatus, SupportedLanguage } from '@impostor/shared'

interface RoomState {
  room: ClientRoom | null
  isConnecting: boolean
  error: string | null

  // Actions
  setRoom: (room: ClientRoom | null) => void
  updateRoomStatus: (status: RoomStatus) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  setAdmin: (adminId: string) => void
  setLanguage: (language: SupportedLanguage) => void
  setError: (error: string | null) => void
  setConnecting: (connecting: boolean) => void
  reset: () => void
}

const initialState = {
  room: null,
  isConnecting: false,
  error: null,
}

export const useRoomStore = create<RoomState>((set) => ({
  ...initialState,

  setRoom: (room) => set({ room, error: null }),

  updateRoomStatus: (status) =>
    set((state) =>
      state.room ? { room: { ...state.room, status } } : state
    ),

  addPlayer: (player) =>
    set((state) =>
      state.room
        ? { room: { ...state.room, players: [...state.room.players, player] } }
        : state
    ),

  removePlayer: (playerId) =>
    set((state) =>
      state.room
        ? {
            room: {
              ...state.room,
              players: state.room.players.filter((p) => p.id !== playerId),
            },
          }
        : state
    ),

  updatePlayer: (playerId, updates) =>
    set((state) =>
      state.room
        ? {
            room: {
              ...state.room,
              players: state.room.players.map((p) =>
                p.id === playerId ? { ...p, ...updates } : p
              ),
            },
          }
        : state
    ),

  setAdmin: (adminId) =>
    set((state) =>
      state.room ? { room: { ...state.room, adminId } } : state
    ),

  setLanguage: (language) =>
    set((state) =>
      state.room ? { room: { ...state.room, language } } : state
    ),

  setError: (error) => set({ error }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  reset: () => set(initialState),
}))
