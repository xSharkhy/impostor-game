# 🕵️ El Impostor

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

- 🔐 **Autenticación** con Google y GitHub
- 🎯 **Tiempo real** con WebSockets
- 📱 **Mobile-first** - optimizado para smartphones
- 🎨 **Animaciones fluidas** con Motion
- 🗳️ **Sistema de votación** con mayoría 2/3
- 👻 **Modo espectador** para eliminados
- 🔄 **Reconexión automática**

## 🛠️ Stack Técnico

### Frontend
- **React 19** + Vite 6
- **Tailwind CSS 4** + shadcn/ui
- **TanStack Router** - Routing type-safe
- **Zustand** - State management
- **Motion** - Animaciones

### Backend
- **Node.js** + Express
- **Socket.io** - WebSockets
- **Clean Architecture** - Separación de capas
- **Supabase** - Auth y base de datos

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │  React  │  │ Zustand │  │ Socket  │  │ shadcn/ui │  │
│  │  Views  │◄─┤  Store  │◄─┤ Client  │  │    UI     │  │
│  └─────────┘  └─────────┘  └────┬────┘  └───────────┘  │
└────────────────────────────────┬────────────────────────┘
                                 │ WebSocket
┌────────────────────────────────┴────────────────────────┐
│                        Server                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │                Infrastructure                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │  Socket  │  │ Supabase │  │   InMemory   │  │   │
│  │  │ Handlers │  │   Auth   │  │    Rooms     │  │   │
│  │  └────┬─────┘  └──────────┘  └──────────────┘  │   │
│  └───────┼─────────────────────────────────────────┘   │
│  ┌───────┴─────────────────────────────────────────┐   │
│  │                 Application                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │   Room   │  │   Game   │  │    Voting    │  │   │
│  │  │ UseCases │  │ UseCases │  │   UseCases   │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   Domain                         │   │
│  │         Room, Player, Game Entities              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

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
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── routes/        # TanStack Router
│   │   └── styles/        # Global CSS
│   └── package.json
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── domain/        # Entities
│   │   ├── application/   # Use Cases
│   │   ├── infrastructure/# Implementations
│   │   └── config/        # DI Container
│   └── package.json
├── shared/                 # Tipos compartidos
└── package.json           # Monorepo root
```

## 🎨 Design System

| Color | Hex | Uso |
|-------|-----|-----|
| Purple | `#a855f7` | Acento principal |
| Pink | `#ff2d6a` | Impostor |
| Green | `#22ff88` | Crew / Éxito |
| Red | `#ef4444` | Peligro |

## 📝 Scripts

```bash
pnpm dev          # Desarrollo (client + server)
pnpm dev:client   # Solo cliente (:5173)
pnpm dev:server   # Solo servidor (:3001)
pnpm build        # Build de producción
```

## 📄 Licencia

MIT
