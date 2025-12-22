# El Impostor - Estado del Desarrollo

Plan detallado: `~/.claude/plans/enchanted-jingling-toast.md`

## Progreso por Fases

### Fase 1: Setup del Proyecto
- [x] Crear monorepo con pnpm workspaces
- [x] Configurar Vite + React + Tailwind (cliente)
- [x] Instalar y configurar TanStack Router
- [x] Instalar y configurar Zustand
- [x] Inicializar shadcn/ui (Button, Card, Input) - estilo elegante
- [x] Configurar Express + Socket.io (servidor básico)
- [x] Crear proyecto en Supabase (auth + DB)
- [x] Configurar TypeScript en todos los packages
- [x] Setup shared types
- [x] Diseño mobile-first elegante
- [x] Cliente Supabase configurado (lib/supabase.ts)
- [x] Esquema SQL ejecutado (categories + words)

**Estado: 100%**

### Fase 2: Autenticación
- [x] Implementar Supabase Auth en cliente (useAuth hook)
- [x] Crear UI de login (Google, GitHub)
- [x] Middleware de auth para sockets (JWT validation)
- [x] Manejo de sesiones y userStore
- [x] Hook useSocket para conexión autenticada

**Estado: 100%**

### Fase 3: Gestión de Salas
- [x] Implementar RoomManager service
- [x] Generación de códigos únicos (4 chars)
- [x] Crear handlers de socket (crear/unirse/salir/expulsar)
- [x] UI de crear sala
- [x] UI de unirse (input de código)
- [x] RoomLobby (lista jugadores, admin controls)
- [x] Límite de 5 salas (server-side)
- [x] Auto-cleanup tras 5 min inactividad
- [x] Transferencia de admin en desconexión

**Estado: 100%**

### Fase 4: Lógica del Juego
- [ ] WordService (query a Supabase por categoría)
- [ ] GameManager (state machine)
- [ ] Selección de impostor (random, oculto)
- [ ] Generación de orden de turnos
- [ ] WordDisplay component (palabra o "???")
- [ ] TurnOrder component
- [ ] PlayerList con estados

**Estado: 0%**

### Fase 5: Sistema de Votación
- [ ] Implementar emisión de votos
- [ ] Cálculo de indicador 2/3
- [ ] UI de votación (grid de jugadores)
- [ ] Manejo de empates
- [ ] Flujo de confirmación del admin
- [ ] Reveal de impostor si eliminado
- [ ] Modo espectador para eliminados

**Estado: 0%**

### Fase 6: Condiciones de Victoria
- [ ] Check de victoria tras cada eliminación
- [ ] Victoria crew: reveal + fanfarria
- [ ] Victoria impostor: reveal dramático
- [ ] Pantallas de victoria/derrota
- [ ] Flujo de "jugar otra vez"

**Estado: 0%**

### Fase 7: Sistema de Palabras
- [ ] Crear tablas en Supabase
- [ ] Seed inicial de palabras (~50 por categoría)
- [ ] UI de sugerencia de palabras
- [ ] Panel admin para aprobar/rechazar
- [ ] Integración con Resend

**Estado: 0%**

### Fase 8: Audio y Polish
- [ ] Añadir efectos de sonido
- [ ] Toggle de mute
- [ ] Animaciones con Motion
- [ ] Confetti en victoria
- [ ] Error handling + toasts
- [ ] Testing manual completo

**Estado: 0%**

### Fase 9: Infraestructura Pi 5
- [ ] Instalar Node.js 20 LTS en Pi
- [ ] Instalar nginx + certbot
- [ ] Configurar DuckDNS con cron
- [ ] Añadir CNAME en Vercel DNS
- [ ] Configurar port forwarding
- [ ] Setup SSL con certbot
- [ ] Configurar PM2
- [ ] nginx reverse proxy config

**Estado: 0%**

### Fase 10: Deploy y Portfolio
- [ ] Build de producción
- [ ] Deploy en Pi 5
- [ ] Testing en producción
- [ ] Añadir proyecto al portfolio
- [ ] Screenshots/GIFs para showcase
- [ ] Documentación README

**Estado: 0%**

---

## Resumen

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Setup del Proyecto | 100% |
| 2 | Autenticación | 100% |
| 3 | Gestión de Salas | 100% |
| 4 | Lógica del Juego | 0% |
| 5 | Sistema de Votación | 0% |
| 6 | Condiciones de Victoria | 0% |
| 7 | Sistema de Palabras | 0% |
| 8 | Audio y Polish | 0% |
| 9 | Infraestructura Pi 5 | 0% |
| 10 | Deploy y Portfolio | 0% |

**Progreso total: ~30%**

---

## Próximos Pasos

1. Completar Fase 1: Crear proyecto Supabase, diseño mobile-first
2. Fase 2: Implementar autenticación con Supabase Auth
3. Fase 3: Room management con Socket.io

## Comandos

```bash
pnpm dev          # Cliente + Servidor
pnpm dev:client   # Solo cliente (5173)
pnpm dev:server   # Solo servidor (3001)
```
