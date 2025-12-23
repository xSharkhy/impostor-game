# El Impostor - Contexto de Desarrollo

Plan detallado: `~/.claude/plans/enchanted-jingling-toast.md`

## Qué es

Juego social multijugador en tiempo real. Un jugador (impostor) no conoce la palabra secreta. Los demás la describen por turnos y votan para encontrar al impostor.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 6, Tailwind 4, shadcn/ui |
| State | Zustand |
| Router | TanStack Router |
| Animations | Motion |
| Backend | Node, Express, Socket.io |
| Auth/DB | Supabase |

## Arquitectura

### Cliente
```
client/src/
├── components/
│   ├── ui/          # shadcn (Button, Card, Input, Select, AlertDialog)
│   ├── auth/        # LoginForm
│   ├── lobby/       # JoinRoom, RoomLobby
│   ├── game/        # GameView, VotingPanel, ResultsPanel, GameOverPanel
│   └── admin/       # WordSuggestions
├── hooks/           # useAuth, useSocket
├── stores/          # gameStore, roomStore, userStore (Zustand)
├── routes/          # TanStack Router
├── lib/             # utils, supabase, motion, playerColors
└── styles/          # global.css (Design System)
```

### Servidor (Clean Architecture)
```
server/src/
├── domain/           # Room, Player entities
├── application/      # Use Cases, Ports (interfaces)
├── infrastructure/   # InMemoryRoomRepository, SupabaseWordRepository
└── config/           # DI Container
```

## Design System

- **Acento**: Purple (#a855f7)
- **Impostor**: Pink (#ff2d6a)
- **Crew/Success**: Green (#22ff88)
- **Danger**: Red (#ef4444)
- **Estilo**: Minimal pero juguetón (Revolut > Vercel)

## Estado del Proyecto

### Completado
- [x] Auth (Google/GitHub)
- [x] Gestión de salas (crear, unirse, expulsar)
- [x] Lógica del juego (impostor, turnos, palabras)
- [x] Sistema de votación (2/3, empates)
- [x] Condiciones de victoria
- [x] Design system (acento purple)
- [x] Componentes shadcn/ui auditados
- [x] Estados de conexión/desconexión
- [x] UI Login/Home rediseñada
- [x] Skeletons, empty states, error retry
- [x] Accesibilidad WCAG AA (contraste, ARIA, focus)
- [x] Mobile-first (safe areas, touch targets)
- [x] README portfolio
- [x] Audio infraestructura (hook, store, toggle)

### Pendiente
- [ ] Phone OTP (requiere Twilio)
- [ ] Persistir displayName en Supabase
- [ ] i18n (ES/EN)
- [ ] Archivos mp3 de sonido
- [ ] Deploy Pi 5

## Comandos

```bash
pnpm dev          # Cliente + Servidor
pnpm dev:client   # Solo cliente (:5173)
pnpm dev:server   # Solo servidor (:3001)
pnpm build        # Build producción
```

## Eventos Socket.io

**Cliente → Servidor**:
- `room:create`, `room:join`, `room:leave`, `room:kick`
- `game:start`, `game:nextRound`, `game:startVoting`, `game:playAgain`
- `vote:cast`, `vote:confirm`

**Servidor → Cliente**:
- `room:state`, `room:playerJoined`, `room:playerLeft`, `room:adminChanged`
- `game:started`, `game:votingStarted`, `game:ended`
- `vote:update`, `vote:result`
- `error`

## Flujo del Juego

```
LOGIN → HOME → LOBBY → PLAYING ⟷ VOTING → RESULTS → FINISHED
                                    ↓
                              (loop hasta victoria)
```
