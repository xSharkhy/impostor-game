# El Impostor - Estado del Desarrollo

Plan detallado: `~/.claude/plans/enchanted-jingling-toast.md`
Prompt:

### Rol

Eres un **Staff Frontend Engineer & Product Designer** especializado en:

* React 19 + Vite
* Tailwind CSS 4
* shadcn/ui (accesibilidad-first)
* Animaciones con Motion
* UX/UI para juegos sociales mobile-first
* Arquitectura de estado con Zustand
* i18n, accesibilidad WCAG 2.1 AA
* Aplicaciones en tiempo real con Socket.io

Actúas con **criterio de portfolio senior**: todo lo que no estaría bien en un portfolio profesional debe corregirse.

---

### Contexto del proyecto

Proyecto: **El Impostor**, juego social multijugador en tiempo real.

* Stack:

  * Frontend: React 19 + Vite
  * UI: Tailwind + shadcn/ui
  * Router: TanStack Router
  * State: Zustand
  * Animations: Motion
  * Backend: Node + Express + Socket.io
  * Auth: Supabase Auth
* Diseño **mobile-first**, foco en smartphones.
* MVP funcional, pero con:

  * Inconsistencias visuales
  * UX debt
  * Bugs de estado
  * Falta de i18n y accesibilidad
* Las animaciones existentes **deben mantenerse**.

Dispones del plan original, la arquitectura y el estado actual del código.

---

### Objetivo global

Elevar la aplicación a **nivel portfolio profesional**, manteniendo el espíritu party pero con una UI:

* Elegante
* Consistente
* Accesible
* Robusta ante estados reales (errores, desconexiones, flujos incompletos)

---

### Design System (obligatorio)

* Base oscura, minimalista, elegante.
* Acento principal global: **purple**.
* Estilo: minimal pero juguetón (Revolut > Vercel).
* “Party” solo en:

  * Acentos
  * Micro-interacciones
  * Animaciones existentes
* Cada jugador tiene un **color de acento propio** (de un set cerrado) aplicado solo a:

  * Nombre
  * Avatar/borde
  * Highlights suaves
* Nunca usar más de un acento dominante por pantalla.

---

### Scope de trabajo

#### 1. Refactor UI con shadcn/ui

* Auditar todos los componentes que no usen shadcn/ui:

  * Formularios
  * Inputs
  * Selects
  * Buttons
  * Dialogs
  * Toasts / Sonner
* Refactorizarlos usando shadcn/ui.
* Mantener animaciones existentes.
* Usar como fuente oficial:

  * [https://ui.shadcn.com/llms.txt](https://ui.shadcn.com/llms.txt)

---

#### 2. Unificación visual

* Eliminar inconsistencias entre páginas.
* Unificar:

  * Espaciados
  * Tipografía
  * Jerarquía visual
* Resultado: sensación de **un solo producto coherente**.

---

#### 3. Rediseño de páginas clave

* Login:

  * Mejorar impacto visual y copy
  * Marketing suave
* Home / base:

  * Mejor narrativa visual
* Eliminar botón visible de Admin:

  * Acceso solo por ruta o autenticación.

---

#### 4. Bugs críticos UX/UI

* Botones glowing:

  * El glow no puede ocultar fondo ni texto.
* Tras votación:

  * UI queda bloqueada
  * Revisar estados, stores y eventos.

---

#### 5. Auth y perfil

* Añadir Phone Auth (OTP) con Supabase.
* DisplayName:

  * Persistido en Supabase
  * Editable antes de crear/unirse a sala
  * Input precargado con último valor usado.

---

#### 6. Estados y desconexiones

* Auditar todos los estados posibles.
* No debe existir ningún estado sin UI válida.
* Manejar:

  * Desconexiones a mitad de partida
  * Reconexiones
  * Cambio de admin
* El flujo del juego siempre debe resolverse.

---

#### 7. Mobile-first real

* Ajustar para distintos tamaños de smartphone.
* Revisar:

  * Hit targets
  * Safe areas
  * Overflows

---

#### 8. Accesibilidad

* Auditoría WCAG:

  * Contraste
  * Focus
  * ARIA
  * Navegación por teclado

---

#### 9. Monetización (no intrusiva)

* Cosméticos:

  * Colores
  * Animaciones visuales extra
* Buy me a coffee
* Premium:

  * Crear salas cuando no haya slots disponibles
* Opcional:

  * Banner ad pequeño y no invasivo
* Prohibido:

  * Paywalls
  * Ventajas competitivas
  * Categorías exclusivas

---

#### 10. Nuevos modos de juego

* Mantener modo clásico.
* Añadir:

  * Palabra aleatoria por API externa (i18n-ready)
  * Modo colaborativo (palabras de jugadores)
* Integrarlos sin romper el flujo existente.

---

#### 11. Git y roadmap

* Revisar cambios no commiteados.
* Crear commits pequeños y coherentes.
* Refactorizar el plan original en un roadmap accionable.
* Definir pasos post-MVP.

---

### Entregables

* Roadmap refactorizado
* Lista priorizada de tareas
* Propuestas UX/UI
* Lista de bugs y estados problemáticos
* Ideas de monetización viables

---

## FASE A — Design System & Base UI

A1. Definir tokens de color y tipografía en Tailwind
A2. Crear sistema de acentos por jugador (map + util)
A3. Normalizar spacing, radius y shadows globales
A4. Definir variantes de Button (default, primary, glowing)
A5. Fix definitivo del bug de botones glowing

---

## FASE B — Refactor a shadcn/ui

B1. Auditar componentes no-shadcn
B2. Refactor inputs a shadcn Input
B3. Refactor forms a shadcn Form
B4. Refactor selects a shadcn Select
B5. Refactor dialogs y alerts
B6. Normalizar Sonner / Toasts

---

## FASE C — Páginas clave

C1. Rediseñar Login (layout + copy)
C2. Rediseñar Home/base
C3. Eliminar botón Admin visible
C4. Proteger acceso admin por auth/ruta

---

## FASE D — Estados y Bugs

D1. Debug bloqueo post-votación
D2. Auditar Zustand stores
D3. Mapear estados posibles/imposibles
D4. UI para estados intermedios
D5. Manejo de desconexión/reconexión

---

## FASE E — Perfil & Auth

E1. Implementar Phone Auth (OTP)
E2. Persistir displayName en Supabase
E3. UI para editar nombre pre-sala
E4. Precargar último displayName

---

## FASE F — i18n & Accesibilidad

F1. Preparar estructura i18n
F2. Extraer strings
F3. Auditoría de contraste
F4. Focus states
F5. ARIA y labels

---

## FASE G — Nuevos Modos

G1. Diseño conceptual de modos
G2. Palabra aleatoria por API (i18n)
G3. Modo colaborativo (input jugadores)
G4. Integración en flujo actual

---

## FASE H — Monetización

H1. Diseño cosméticos
H2. Infra para colores/animaciones premium
H3. Buy me a coffee UI
H4. Premium slots UX

---

## FASE I — Auditoría Final

I1. Usabilidad
I2. UX
I3. Accesibilidad
I4. Lista final de mejoras

---

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
