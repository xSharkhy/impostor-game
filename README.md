# El Impostor

Juego de deducción social en tiempo real donde un jugador (el impostor) no conoce la palabra secreta que comparten los demás.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4 + TanStack Router + Zustand
- **Backend:** Node.js + Express + Socket.io
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Frontend en Vercel, Backend en Raspberry Pi 5

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar desarrollo (cliente + servidor)
pnpm dev

# Solo cliente
pnpm dev:client

# Solo servidor
pnpm dev:server
```

## Estructura

```
impostor/
├── client/          # Frontend React
├── server/          # Backend Node.js
└── shared/          # Tipos compartidos
```

## Variables de entorno

Copia `.env.example` a `.env` y configura las variables.

## Licencia

MIT
