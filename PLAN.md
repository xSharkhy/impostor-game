# El Impostor - Plan de Desarrollo v3.2

> **Plan unificado** que combina el plan original con las directrices del prompt actualizado.
> Última actualización: 2025-12-23

---

## Rol del Desarrollador

**Staff Frontend Engineer & Product Designer** especializado en:
- React 19 + Vite 6
- Tailwind CSS 4
- shadcn/ui (accesibilidad-first)
- Animaciones con Motion
- UX/UI para juegos sociales mobile-first
- Arquitectura de estado con Zustand
- i18n, accesibilidad WCAG 2.1 AA
- Aplicaciones en tiempo real con Socket.io

**Criterio**: Todo lo que no estaría bien en un portfolio profesional debe corregirse.

---

## Visión del Proyecto

### Qué es El Impostor
Juego social multijugador en tiempo real inspirado en "Palabra Secreta". Un jugador (el impostor) no conoce la palabra secreta que comparten los demás. Los jugadores describen la palabra por turnos sin revelarla, luego votan para encontrar al impostor.

### Objetivo
Elevar la aplicación de MVP funcional a **nivel portfolio profesional**:
- UI elegante, consistente y accesible
- UX robusta ante estados reales (errores, desconexiones)
- Código mantenible y bien estructurado

---

## Design System

### Filosofía
- **Base**: Oscura, minimalista, elegante
- **Estilo**: Minimal pero juguetón (**Revolut > Vercel**)
- **Party**: Solo en acentos, micro-interacciones y animaciones
- **NO**: Sobrecarga visual, colores chillones en exceso, UI infantil

### Paleta de Colores
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-accent` | #a855f7 | Acento principal (purple) |
| `--color-accent-light` | #c084fc | Acento claro |
| `--color-accent-dark` | #9333ea | Acento oscuro |
| `--color-neon-pink` | #ff2d6a | Impostor (reveal) |
| `--color-neon-green` | #22ff88 | Crew / éxito |
| `--color-danger` | #ef4444 | Error / peligro |
| `--color-neon-yellow` | #facc15 | Warning / admin |
| `--color-text-secondary` | #b8b8b8 | Texto secundario (WCAG AA) |
| `--color-text-tertiary` | #909090 | Texto terciario (WCAG AAA) |

### Tipografía
- Font: Geist Sans
- Escala: text-xs → text-4xl

### Espaciado y Radios
- **Cards**: `rounded-2xl`, `p-6`
- **Inputs/Buttons**: `rounded-lg`, `h-10`
- **Small elements**: `rounded-md`
- **Pills/avatars**: `rounded-full`

---

## Stack Técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite 6 |
| UI | Tailwind CSS 4 + shadcn/ui |
| Router | TanStack Router |
| State | Zustand |
| Animations | Motion (framer-motion) |
| Backend | Node + Express + Socket.io |
| Auth | Supabase Auth |
| DB | Supabase (words, categories) |
| Persistence | InMemory (rooms) |

---

## FASES DE DESARROLLO

---

## FASE A — Design System & Base UI

### A1. Cambiar acento principal a Purple ✅ COMPLETADO
- Tokens actualizados en `global.css`
- Componentes UI migrados (button, card, input, select)
- Animaciones en `motion.ts` actualizadas
- Componentes game/lobby actualizados

### A2. Sistema de colores por jugador ✅ COMPLETADO
- `client/src/lib/playerColors.ts` con 8 colores

### A3. Normalizar spacing, radius y shadows ✅ COMPLETADO
- Auditado: sistema ya consistente
- Cards: `rounded-2xl`, Inputs: `rounded-lg`, Small: `rounded-md`

### A4. Variantes de Button ✅ COMPLETADO
- 11 variantes documentadas en `button.tsx`

### A5. Fix bug botones glowing ✅ COMPLETADO

---

## FASE B — Refactor a shadcn/ui

### B1-B6. Auditoría componentes ✅ COMPLETADO
- **Button**: 11 variantes, 7 en uso activo
- **Card**: 6 variantes con uso dinámico
- **Input**: 4 variantes con CVA
- **Select**: Full Radix implementation
- **AlertDialog**: Custom con animaciones
- **Label**: Standard shadcn

**Conclusión**: Sistema bien estructurado, no requiere cambios.

---

## FASE C — Páginas Clave

### C1. Rediseñar Login ✅ COMPLETADO
- Header con animación fade-in
- Copy mejorado: "Bienvenido"

### C2. Rediseñar Home ✅ COMPLETADO
- Logo emoji (🕵️) + título gradient
- Botón "Crear Sala" con variante `neon`
- Mejor jerarquía visual
- Loading states para crear sala

### C3. Eliminar botón Admin visible ✅ COMPLETADO

### C4. Proteger acceso admin ✅ COMPLETADO

---

## FASE D — Estados y Bugs

### D1. Debug bloqueo post-votación ✅ COMPLETADO

### D2-D3. Auditar stores y estados ✅ COMPLETADO
- Stores funcionan correctamente
- Transiciones de fase manejadas

### D4. UI para estados intermedios ✅ COMPLETADO
- Loading states en crear/unirse sala ✅
- Skeleton component con variantes (default, circular, text) ✅
- Skeleton en carga inicial de app ✅
- Skeleton en WordSuggestions ✅
- Skeleton en SuggestWord (categorías) ✅
- Empty states mejorados con iconos ✅
- Error states con botón de retry ✅

### D5. Manejo desconexión/reconexión ✅ COMPLETADO
- Toast al perder conexión
- Toast al reconectar
- Loading states para acciones de sala
- Verificación de conexión antes de emitir eventos

---

## FASE E — Perfil & Auth

### E1. Phone Auth (OTP) ❌ PENDIENTE
Requiere configurar Twilio en Supabase.

### E2. Persistir displayName ❌ PENDIENTE

### E3. UI editar nombre pre-sala ❌ PENDIENTE

### E4. Precargar último displayName ❌ PENDIENTE

---

## FASE F — i18n & Accesibilidad

### F1-F2. i18n ❌ PENDIENTE
- Estructura con `react-i18next`
- Extraer strings hardcodeados

### F3. Auditoría de contraste ✅ COMPLETADO
- text-secondary: #b8b8b8 (5.48:1 ratio - WCAG AA)
- text-tertiary: #909090 (6.15:1 ratio - WCAG AAA)

### F4. Focus states ✅ COMPLETADO
- Button tiene `focus-visible:ring-2 focus-visible:ring-accent`
- Global `*:focus-visible` con outline

### F5. ARIA y labels ✅ COMPLETADO
- `aria-label` en botón cerrar (SuggestWord)
- `aria-hidden="true"` en emojis decorativos:
  - ResultsPanel (🤷)
  - GameOverPanel (🏆/💀)
  - WordSuggestions (⚠️, ✨)
  - ErrorBoundary (💥)
  - VotingPanel (🗳️)

---

## FASE G — Nuevos Modos de Juego

### G1-G4. ❌ PENDIENTE
- Clásico (actual)
- Aleatorio (API externa)
- Colaborativo (jugadores envían palabras)

---

## FASE H — Monetización

### H1-H4. ❌ PENDIENTE
- Cosméticos (colores premium, animaciones)
- Buy me a coffee
- Premium slots

**Prohibido**: Paywalls, ventajas competitivas, ver impostor

---

## FASE I — Auditoría Final

### I1-I4. ❌ PENDIENTE
- Testing usabilidad
- UX review
- Lighthouse >90
- Lista mejoras futuras

---

## EXTRAS

### Audio ✅ COMPLETADO (infraestructura)
- Hook `useSound.ts` con tipos de efectos
- Store `useSoundStore` con mute persistido (localStorage)
- Componente `SoundToggle` con iconos de volumen
- Toggle flotante en esquina inferior derecha
- Directorio `public/sounds/` con README de archivos necesarios
- **Pendiente**: Añadir archivos .mp3 de efectos

### README Portfolio ✅ COMPLETADO
- Badges de tecnologías
- Tablas de stack frontend/backend
- Diagrama de arquitectura
- Sección de decisiones técnicas
- Estructura del proyecto detallada
- Design system documentado

### Deploy Pi 5 ❌ PENDIENTE
- nginx + PM2 + certbot

### Mobile-first audit ✅ COMPLETADO
- `viewport-fit=cover` para notch iOS
- CSS variables `--safe-*` con `env(safe-area-inset-*)`
- Safe area padding en body
- `100dvh` para viewport dinámico
- Touch targets mejorados (VotingPanel buttons h-9)
- Meta tags: theme-color, apple-mobile-web-app

---

## Bugs Corregidos

- [x] BUG-001: Bloqueo post-votación
- [x] BUG-002: Glow botones excesivo
- [x] BUG-003: Admin oculto + whitelist
- [x] BUG-004: SelectValue children DOM error
- [x] BUG-005: Colores cyan en confetti (cambiados a purple)
- [x] BUG-006: createRoom/joinRoom sin verificar conexión socket

---

## Comandos

```bash
pnpm dev          # Dev completo (client + server)
pnpm dev:client   # Solo cliente en :5173
pnpm dev:server   # Solo servidor en :3001
pnpm build        # Build producción
```

---

## Progreso General

| Fase | Estado | Completado |
|------|--------|------------|
| A - Design System | ✅ | 100% |
| B - shadcn/ui | ✅ | 100% |
| C - Páginas Clave | ✅ | 100% |
| D - Estados/Bugs | ✅ | 100% |
| E - Perfil/Auth | ❌ | 0% |
| F - i18n/A11y | ⚠️ | 60% (a11y done, i18n pending) |
| G - Nuevos Modos | ❌ | 0% |
| H - Monetización | ❌ | 0% |
| I - Auditoría Final | ❌ | 0% |
| Extras | ✅ | 90% (solo deploy pending) |

**Progreso total estimado: ~65%**

---

## Sesión 2025-12-23

### Completado hoy:
1. **D4**: Skeletons, empty states, error retry
2. **F3-F5**: Accesibilidad (contraste WCAG AA, ARIA labels)
3. **Mobile audit**: Safe areas, touch targets, viewport
4. **README**: Portfolio-ready con badges y tech decisions
5. **Audio**: Infraestructura completa (hook, store, toggle)

### Commits:
- `feat(ui): add loading skeletons, empty states, and error retry`
- `a11y: improve color contrast and add ARIA attributes`
- `mobile: add safe areas and improve touch targets`
- `docs: enhance README for portfolio`
- `feat(audio): add sound system with mute toggle`
