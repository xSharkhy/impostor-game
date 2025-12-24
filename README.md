# El Impostor

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white)](https://socket.io)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A real-time multiplayer social deduction game. One player is secretly the impostor and doesn't know the secret word. Can you figure out who's faking it?

**[Play Now](https://impostor.ismobla.dev)** | [Documentation](docs/)

![El Impostor Preview](docs/assets/preview.png)

---

## How It Works

1. **Create or join** a room with a 4-letter code
2. One player is randomly chosen as the **impostor** (they don't see the secret word)
3. Take turns **describing the word** without revealing it
4. The impostor must **bluff** and pretend they know it
5. **Vote** to eliminate the suspect
6. Crew wins if they catch the impostor. Impostor wins if they survive!

## Features

- **Real-time multiplayer** via WebSockets (Socket.io)
- **OAuth authentication** with Google and GitHub
- **4 game modes**: Classic, Random, Custom Word, Roulette
- **5 languages**: Spanish, English, Catalan, Basque, Galician
- **2/3 majority voting** system with live vote tracking
- **Mobile-first** responsive design with safe areas
- **Spectator mode** for eliminated players
- **Auto-reconnection** with state preservation
- **Accessible** - WCAG AA compliant

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 6 | Build Tool |
| TypeScript 5.7 | Type Safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | Component Library |
| Zustand 5 | State Management |
| TanStack Router | Type-safe Routing |
| Motion | Animations |
| i18next | Internationalization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP Server |
| Socket.io | WebSocket Server |
| Supabase | Auth + Database |
| Clean Architecture | Code Organization |

### Infrastructure
| Component | Service |
|-----------|---------|
| Frontend | Vercel |
| Backend | Raspberry Pi 5 + nginx |
| Database | Supabase (PostgreSQL) |
| SSL | Let's Encrypt (certbot) |

---

## Architecture

The server implements **Clean Architecture** with clear separation of concerns:

```
┌────────────────────────────────────────────────────────┐
│                      Client                            │
│  React + Zustand + Socket.io ◄─── WebSocket ──►        │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│                      Server                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Infrastructure                      │  │
│  │  nginx (SSL) → Express → Socket.io → Handlers    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │               Application                        │  │
│  │  Room UseCases │ Game UseCases │ Voting UseCases │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Domain                           │  │
│  │         Room Entity │ Player Entity              │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│                    Supabase                            │
│              Auth + Words Database                     │
└────────────────────────────────────────────────────────┘
```

**Key decisions:**
- **In-memory rooms** for low latency (auto-cleanup after 5 min)
- **Supabase** for persistent words and auth
- **Typed Socket events** shared between client/server
- **3 Zustand stores** for clean state separation

→ [Full Architecture Documentation](docs/ARCHITECTURE.md)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/xSharkhy/impostor-game.git
cd impostor-game

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run in development
pnpm dev
```

**Frontend**: http://localhost:5173
**Backend**: http://localhost:3001

→ [Full Development Guide](docs/DEVELOPMENT.md)

---

## Project Structure

```
impostor/
├── client/                 # React 19 Frontend
│   ├── src/
│   │   ├── components/     # UI, Auth, Lobby, Game components
│   │   ├── hooks/          # useAuth, useSocket, useSound
│   │   ├── stores/         # roomStore, gameStore, userStore
│   │   ├── routes/         # TanStack Router pages
│   │   └── locales/        # i18n translations
├── server/                 # Node.js Backend (Clean Architecture)
│   ├── src/
│   │   ├── domain/         # Entities (Room, Player)
│   │   ├── application/    # Use Cases + Ports
│   │   └── infrastructure/ # Implementations + Handlers
├── shared/                 # Shared TypeScript types
└── docs/                   # Documentation
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Development Guide](docs/DEVELOPMENT.md) | Local setup, Supabase config, project structure |
| [Deployment Guide](docs/DEPLOYMENT.md) | Deploy to Raspberry Pi + Vercel |
| [Architecture](docs/ARCHITECTURE.md) | Technical decisions and system design |
| [API Reference](docs/API.md) | Socket.io events and payloads |

---

## Design System

Minimal yet playful aesthetic (inspired by Revolut):

| Color | Hex | Usage |
|-------|-----|-------|
| Purple | `#a855f7` | Primary accent |
| Pink | `#ff2d6a` | Impostor |
| Green | `#22ff88` | Crew / Success |
| Yellow | `#facc15` | Admin / Warning |
| Red | `#ef4444` | Danger |

- **Font**: Geist Sans
- **Cards**: Rounded corners + glassmorphism
- **Buttons**: 11 variants (neon, glow, ghost, etc.)

---

## Scripts

```bash
pnpm dev          # Run client + server
pnpm dev:client   # Run only frontend
pnpm dev:server   # Run only backend
pnpm build        # Production build
```

---

## Roadmap

- [x] Core game logic
- [x] OAuth authentication
- [x] 4 game modes
- [x] i18n (5 languages)
- [x] Mobile-first design
- [x] Production deployment
- [ ] Phone OTP authentication
- [ ] Sound effects
- [ ] Game history
- [ ] Leaderboards

---

## Contributing

Contributions are welcome! Please read the [Development Guide](docs/DEVELOPMENT.md) first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Author

**Ismael Morejon** - [@xSharkhy](https://github.com/xSharkhy)

Built with React, TypeScript, and Socket.io.
