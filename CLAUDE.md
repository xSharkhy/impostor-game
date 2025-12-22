# El Impostor - Estado del Desarrollo

Plan detallado: `~/.claude/plans/enchanted-jingling-toast.md`

## Arquitectura Actual

El proyecto sigue **Clean Architecture** en el servidor:

```
server/src/
├── domain/           # Entidades y errores de dominio
│   ├── entities/     # Room, Player
│   └── errors/       # DomainError
├── application/      # Casos de uso y puertos
│   ├── useCases/     # Room, Game, Voting, Word
│   ├── ports/        # Interfaces (IRoomRepository, IWordRepository)
│   └── dto/          # Data Transfer Objects
├── infrastructure/   # Implementaciones concretas
│   ├── persistence/  # InMemoryRoomRepository, SupabaseWordRepository
│   ├── services/     # SupabaseAuthService, ResendEmailService
│   └── web/          # Socket handlers, REST controllers
└── config/           # DI Container, env, supabase client
```

**Persistencia:**
- Rooms: **En memoria** (InMemoryRoomRepository)
- Words/Categories: **Supabase** (SupabaseWordRepository)
- Auth: **Supabase Auth**

---

## Progreso por Fases

### Fase 1: Setup del Proyecto ✅
- [x] Crear monorepo con pnpm workspaces
- [x] Configurar Vite + React + Tailwind (cliente)
- [x] Instalar y configurar TanStack Router
- [x] Instalar y configurar Zustand
- [x] Inicializar shadcn/ui
- [x] Configurar Express + Socket.io (servidor)
- [x] Crear proyecto en Supabase (auth + DB)
- [x] Configurar TypeScript en todos los packages
- [x] Setup shared types
- [x] Diseño mobile-first

**Estado: 100%**

### Fase 2: Autenticación ✅
- [x] Implementar Supabase Auth en cliente (useAuth hook)
- [x] Crear UI de login (Google, GitHub)
- [x] Middleware de auth para sockets (JWT validation)
- [x] Manejo de sesiones y userStore
- [x] Hook useSocket para conexión autenticada

**Estado: 100%**

### Fase 3: Gestión de Salas ✅
- [x] Implementar RoomManager (InMemoryRoomRepository)
- [x] Generación de códigos únicos (4 chars)
- [x] Crear handlers de socket (crear/unirse/salir/expulsar)
- [x] UI de crear sala
- [x] UI de unirse (input de código)
- [x] RoomLobby (lista jugadores, admin controls)
- [x] Límite de 5 salas (server-side)
- [x] Auto-cleanup tras 5 min inactividad
- [x] Transferencia de admin en desconexión

**Estado: 100%**

### Fase 4: Lógica del Juego ✅
- [x] WordService (SupabaseWordRepository)
- [x] GameManager (UseCases + Room entity state machine)
- [x] Selección de impostor (random, oculto)
- [x] Generación de orden de turnos
- [x] GameView component (palabra o "???")
- [x] TurnOrder display
- [x] Admin controls (iniciar votación, siguiente ronda)

**Estado: 100%**

### Fase 5: Sistema de Votación ✅
- [x] Implementar emisión de votos
- [x] Cálculo de indicador 2/3
- [x] UI de votación (VotingPanel)
- [x] Manejo de empates
- [x] Flujo de confirmación del admin
- [x] Reveal de impostor si eliminado
- [x] Modo espectador para eliminados

**Estado: 100%**

### Fase 6: Condiciones de Victoria ✅
- [x] Check de victoria tras cada eliminación
- [x] Victoria crew: reveal impostor + palabra
- [x] Victoria impostor: reveal impostor + palabra
- [x] Pantalla de fin de juego (GameOverPanel)
- [x] Flujo de "jugar otra vez" (admin → todos vuelven al lobby)

**Estado: 100%**

### Fase 7: Sistema de Palabras ✅
- [x] Tablas en Supabase (words, categories)
- [x] Seed inicial de palabras (~50 por categoría) - **supabase-schema.sql**
- [x] UI de sugerencia de palabras (SuggestWord.tsx)
- [x] Panel admin para aprobar/rechazar (WordSuggestions.tsx)
- [ ] Integración con Resend (parcial, servicio listo)

**Estado: 90%**

### Fase 8: Audio y Polish 🔄
- [ ] Añadir efectos de sonido
- [ ] Toggle de mute
- [x] Animaciones con Motion (muy completo)
- [x] Confetti en victoria
- [x] Animación de cambio de ronda
- [x] Efectos goofy (wobble, jelly, tada)
- [x] Error handling + toasts (Sonner)
- [x] Confirmaciones para acciones destructivas (AlertDialog)
- [x] Error boundary component
- [ ] Testing manual completo

**Estado: 80%**

### Fase 9: Infraestructura Pi 5 ❌
- [ ] Instalar Node.js 20 LTS en Pi
- [ ] Instalar nginx + certbot
- [ ] Configurar DuckDNS con cron
- [ ] Añadir CNAME en Vercel DNS
- [ ] Configurar port forwarding
- [ ] Setup SSL con certbot
- [ ] Configurar PM2
- [ ] nginx reverse proxy config

**Estado: 0%**

### Fase 10: Deploy y Portfolio ❌
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
| 1 | Setup del Proyecto | ✅ 100% |
| 2 | Autenticación | ✅ 100% |
| 3 | Gestión de Salas | ✅ 100% |
| 4 | Lógica del Juego | ✅ 100% |
| 5 | Sistema de Votación | ✅ 100% |
| 6 | Condiciones de Victoria | ✅ 100% |
| 7 | Sistema de Palabras | ✅ 90% |
| 8 | Audio y Polish | 🔄 80% |
| 9 | Infraestructura Pi 5 | ❌ 0% |
| 10 | Deploy y Portfolio | ❌ 0% |

**Progreso total: ~77%**

---

## Próximos Pasos Prioritarios

### ✅ Completados
1. ~~**Seed de palabras**~~: Script SQL listo en `supabase-schema.sql`
2. ~~**Sistema de toasts**~~: Sonner integrado con estilos dark theme
3. ~~**Confirmaciones destructivas**~~: AlertDialog para expulsar, abandonar
4. ~~**Proteger ruta /admin**~~: Auth check con redirect
5. ~~**Error boundaries**~~: ErrorBoundary component

### 🟡 Importantes
6. **Ejecutar seed en Supabase**: Correr `supabase-schema.sql` en la BD
7. **Efectos de sonido**: Audio feedback para eventos
8. **Toggle de mute**: Control de audio

### 🟢 Mejoras
9. **URL con código de sala**: `/room/XXXX` para compartir links
10. **Estado de conexión visible**: Alertas de desconexión/reconexión
11. **Deploy Pi 5**: nginx/SSL/PM2

---

## Issues UX/UI Detectados

### Sin implementar (del plan)
- [ ] Phone OTP como alternativa de login
- [ ] Efectos de sonido
- [ ] Toggle de mute

### Problemas UX descubiertos
- [ ] Sin sistema de toasts/notificaciones
- [ ] Sin confirmaciones para acciones destructivas
- [ ] Sin error boundaries
- [ ] Ruta /admin no protegida
- [ ] URL no persistente para salas
- [ ] Estado de conexión poco visible
- [ ] Loading states muy básicos
- [ ] Algunos botones solo emoji (accesibilidad)

### Implementado correctamente
- [x] Animaciones Motion (muy completo)
- [x] Confetti y EmojiBurst
- [x] Timer auto-continue en empates
- [x] Animación de cambio de ronda
- [x] Estado de espectador (👻)
- [x] Glassmorphism sin bordes blancos
- [x] Design system con Geist font
- [x] Mobile-first responsive

---

## Bugs Corregidos (última sesión)

- [x] Jugadores no-admin no volvían al lobby tras "Nueva partida"
- [x] Impostor no veía la palabra al final del juego
- [x] InMemoryRoomRepository en lugar de Supabase (según plan original)

---

## Comandos

```bash
pnpm dev          # Cliente + Servidor
pnpm dev:client   # Solo cliente (5173)
pnpm dev:server   # Solo servidor (3001)
pnpm build        # Build completo
```
