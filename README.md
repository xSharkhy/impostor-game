# 🕵️ El Impostor

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io)

Juego social multijugador en tiempo real inspirado en "Palabra Secreta". Descubre quién es el impostor antes de que sea demasiado tarde.

![El Impostor - Game Preview](docs/preview.png)

## 🎮 Cómo se juega

1. **Crea o únete** a una sala con un código de 4 letras
2. Un jugador es elegido al azar como **impostor** (no conoce la palabra secreta)
3. Por turnos, cada jugador **describe la palabra** sin revelarla
4. El impostor debe **fingir** que conoce la palabra
5. **Vota** para eliminar al sospechoso
6. ¡Gana el equipo que descubra la verdad!

## ✨ Features

- 🔐 **Autenticación** con Google y GitHub (Supabase Auth)
- 🎯 **Tiempo real** con WebSockets bidireccionales
- 📱 **Mobile-first** con safe areas para iOS
- 🎨 **Animaciones fluidas** con Motion (Framer Motion)
- 🗳️ **Sistema de votación** con mayoría 2/3
- 👻 **Modo espectador** para jugadores eliminados
- 🔄 **Reconexión automática** con estado persistente
- ♿ **Accesible** - WCAG AA compliant

## 🛠️ Stack Técnico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI Library |
| Vite | 6 | Build tool |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | - | Component library |
| TanStack Router | 1 | Type-safe routing |
| Zustand | 5 | State management |
| Motion | 12 | Animations |

### Backend
| Tecnología | Uso |
|------------|-----|
| Node.js + Express | HTTP server |
| Socket.io | WebSocket server |
| Supabase | Auth + Database |
| Clean Architecture | Domain separation |

## 🏗️ Arquitectura

El servidor implementa **Clean Architecture** con separación clara de capas:

```
┌────────────────────────────────────────────────────────┐
│                        Client                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │  React  │  │ Zustand │  │ Socket  │  │ shadcn/ui │  │
│  │  Views  │◄─┤  Store  │◄─┤ Client  │  │    UI     │  │
│  └─────────┘  └─────────┘  └────┬────┘  └───────────┘  │
└─────────────────────────────────┼──────────────────────┘
                                  │ WebSocket
┌─────────────────────────────────┴─────────────────────┐
│                        Server                         │
│  ┌────────────────────────────────────────────────┐   │
│  │                Infrastructure                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │  Socket  │  │ Supabase │  │   InMemory   │  │   │
│  │  │ Handlers │  │   Auth   │  │    Rooms     │  │   │
│  │  └────┬─────┘  └──────────┘  └──────────────┘  │   │
│  └───────┼────────────────────────────────────────┘   │
│  ┌───────┴────────────────────────────────────────┐   │
│  │                 Application                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │   Room   │  │   Game   │  │    Voting    │  │   │
│  │  │ UseCases │  │ UseCases │  │   UseCases   │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │                   Domain                       │   │
│  │         Room, Player, Game Entities            │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

### Decisiones Técnicas

- **InMemory rooms**: Las salas se almacenan en memoria para baja latencia. Auto-cleanup tras 5 min de inactividad.
- **Supabase words**: Las palabras y categorías se persisten en Supabase para fácil gestión.
- **Zustand stores**: Estado global separado en `roomStore`, `gameStore`, `userStore`.
- **Socket events tipados**: Tipos compartidos entre client/server en `@impostor/shared`.

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/impostor.git
cd impostor

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

```
impostor/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # UI components (ui/, game/, lobby/, auth/)
│   │   ├── hooks/         # useAuth, useSocket
│   │   ├── stores/        # Zustand stores
│   │   ├── routes/        # TanStack Router pages
│   │   ├── lib/           # Utils, supabase client
│   │   └── styles/        # Design system (global.css)
│   └── package.json
├── server/                 # Backend Node.js (Clean Architecture)
│   ├── src/
│   │   ├── domain/        # Entities (Room, Player)
│   │   ├── application/   # Use Cases + Ports
│   │   ├── infrastructure/# Implementations
│   │   └── config/        # DI Container
│   └── package.json
├── shared/                 # Tipos TypeScript compartidos
└── package.json           # Monorepo root (pnpm workspaces)
```

## 🎨 Design System

Estilo **minimal pero juguetón** (Revolut > Vercel):

| Color | Hex | Uso |
|-------|-----|-----|
| Purple | `#a855f7` | Acento principal |
| Pink | `#ff2d6a` | Impostor |
| Green | `#22ff88` | Crew / Éxito |
| Yellow | `#facc15` | Admin / Warning |
| Red | `#ef4444` | Peligro |

- **Font**: Geist Sans
- **Cards**: `rounded-2xl`, glassmorphism
- **Buttons**: 11 variantes (neon, glow, ghost, etc.)

## 📝 Scripts

```bash
pnpm dev          # Desarrollo (client + server)
pnpm dev:client   # Solo cliente (:5173)
pnpm dev:server   # Solo servidor (:3001)
pnpm build        # Build de producción
```

## 📄 Licencia

MIT
