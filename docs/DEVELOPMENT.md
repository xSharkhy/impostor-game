# Development Guide

This guide will help you set up El Impostor for local development.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Supabase account** ([Sign up](https://supabase.com/))
- **Git** ([Download](https://git-scm.com/))

## Quick Start

```bash
# Clone the repository
git clone https://github.com/xSharkhy/impostor-game.git
cd impostor-game

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env

# Start development servers
pnpm dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## Supabase Setup

### 1. Create a New Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose a name and password
4. Wait for the project to be created

### 2. Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Google**:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add `http://localhost:5173` to Authorized JavaScript origins
   - Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` to Authorized redirect URIs
   - Copy Client ID and Secret to Supabase
3. Enable **GitHub**:
   - Create OAuth App in [GitHub Developer Settings](https://github.com/settings/developers)
   - Homepage URL: `http://localhost:5173`
   - Callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### 3. Configure Redirect URLs

In **Authentication** > **URL Configuration**:

- **Site URL**: `http://localhost:5173`
- **Redirect URLs**:
  ```
  http://localhost:5173/**
  http://localhost:4173/**
  ```

### 4. Create Database Tables

Run the following SQL in the **SQL Editor**:

```sql
-- Profiles table (auto-created on user signup)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Words table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  lang TEXT NOT NULL DEFAULT 'es',
  is_approved BOOLEAN DEFAULT true,
  suggested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories and approved words
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anyone can read approved words"
  ON public.words FOR SELECT TO authenticated
  USING (is_approved = true);

-- Insert some sample data
INSERT INTO public.categories (name, lang) VALUES
  ('Animals', 'en'),
  ('Food', 'en'),
  ('Sports', 'en'),
  ('Animales', 'es'),
  ('Comida', 'es'),
  ('Deportes', 'es');
```

### 5. Get API Keys

Go to **Settings** > **API** and copy:
- **Project URL** → `SUPABASE_URL`
- **anon public** key → `SUPABASE_PUBLISHABLE_KEY`
- **service_role** key → `SUPABASE_SECRET_KEY` (server only)

---

## Environment Variables

### Root `.env`

```env
# Shared configuration (optional)
NODE_ENV=development
```

### Client `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key
VITE_SOCKET_URL=http://localhost:3001
```

### Server `.env`

```env
PORT=3001
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key
SUPABASE_SECRET_KEY=eyJ...your-service-role-key

ADMIN_EMAILS=your@email.com
```

---

## Project Structure

```
impostor/
├── client/                 # React 19 Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── auth/       # Login forms
│   │   │   ├── lobby/      # Room management
│   │   │   ├── game/       # Game views
│   │   │   └── admin/      # Admin panel
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # Zustand stores
│   │   ├── routes/         # TanStack Router
│   │   ├── lib/            # Utilities
│   │   ├── locales/        # i18n translations
│   │   └── styles/         # Global CSS
│   └── package.json
├── server/                 # Node.js Backend (Clean Architecture)
│   ├── src/
│   │   ├── domain/         # Entities & Errors
│   │   ├── application/    # Use Cases & Ports
│   │   ├── infrastructure/ # Implementations
│   │   └── config/         # DI Container
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── src/index.ts
├── docs/                   # Documentation
└── package.json            # Monorepo root
```

---

## Available Scripts

```bash
# Development
pnpm dev              # Run client + server
pnpm dev:client       # Run only client (port 5173)
pnpm dev:server       # Run only server (port 3001)

# Build
pnpm build            # Build all packages
pnpm build:client     # Build only client
pnpm build:server     # Build only server

# Utilities
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript check
```

---

## Adding New Features

### Adding a New Game Mode

1. Add the mode to `shared/src/index.ts`:
   ```typescript
   export type GameMode = 'classic' | 'random' | 'custom' | 'roulette' | 'your-mode';
   ```

2. Create the use case in `server/src/application/useCases/game/`:
   ```typescript
   // YourModeUseCase.ts
   export class YourModeUseCase {
     constructor(private roomRepository: IRoomRepository) {}

     execute(roomId: string, data: YourModeData): Room {
       // Implementation
     }
   }
   ```

3. Register in `server/src/config/container.ts`

4. Add socket handler in `server/src/infrastructure/web/socket/handlers/GameHandler.ts`

5. Update client UI in `client/src/components/lobby/RoomLobby.tsx`

### Adding a New Language

1. Create translation file in `client/src/locales/`:
   ```typescript
   // fr.ts
   export default {
     common: {
       play: 'Jouer',
       // ...
     }
   }
   ```

2. Register in `client/src/lib/i18n.ts`:
   ```typescript
   import fr from '../locales/fr';

   i18n.init({
     resources: {
       // ...
       fr: { translation: fr }
     }
   });
   ```

3. Add to `SupportedLanguage` in `shared/src/index.ts`:
   ```typescript
   export type SupportedLanguage = 'es' | 'en' | 'ca' | 'eu' | 'gl' | 'fr';
   ```

### Adding a New UI Component

This project uses [shadcn/ui](https://ui.shadcn.com/). To add a new component:

```bash
cd client
npx shadcn@latest add button  # or any component
```

Custom variants are defined in `client/src/components/ui/button.tsx`.

---

## Testing Multiplayer Locally

To test with multiple players on the same machine:

1. Open the app in multiple browser tabs
2. Use different browsers (Chrome, Firefox, Safari)
3. Use incognito/private windows for different accounts

To test on other devices on your network:

1. Find your local IP: `hostname -I` (Linux) or `ipconfig` (Windows)
2. Update `VITE_SOCKET_URL` to use your IP instead of localhost
3. Access `http://YOUR_IP:5173` from other devices

> **Note**: OAuth redirects won't work with IP addresses. For full testing with auth, deploy to a staging environment.

---

## Troubleshooting

### WebSocket connection fails

1. Check that the server is running on port 3001
2. Verify `VITE_SOCKET_URL` in client `.env`
3. Check browser console for CORS errors

### Authentication not working

1. Verify Supabase URL and keys are correct
2. Check redirect URLs in Supabase dashboard
3. Ensure OAuth providers are configured correctly

### Build errors

```bash
# Clear caches and reinstall
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
pnpm install
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and add tests if applicable.

---

## Animations Implementation Plan

> Plan de implementación de animaciones para mejorar la experiencia del juego.
> Las animaciones deben ser **goofy pero elegantes** - manteniendo el estilo minimalista pero añadiendo personalidad party.

### Contexto Importante

**El juego está pensado para jugarse en persona**. Los turnos son en **sentido horario** desde un jugador designado aleatoriamente. La lista de turnos en pantalla es una **referencia visual** para cuando se juega a través de Discord o similar, no un sistema interactivo de avance de turno.

### Sistema de Animaciones Existente

Ya existe un sistema completo en `client/src/lib/motion.ts` (424 líneas) con:

| Categoría | Variantes |
|-----------|-----------|
| Transiciones | `springTransition`, `springBouncy`, `springGentle`, `easeOutExpo`, `easeOutBack` |
| Fade | `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInScale` |
| Slide | `slideInFromLeft`, `slideInFromRight`, `slideInFromBottom` |
| Scale | `scaleIn`, `popIn`, `bounceIn` |
| Goofy | `wobble`, `jelly`, `rubberBand`, `tada`, `swing`, `heartbeat` |
| Dramatic | `explosiveReveal`, `roundReveal`, `shakeAnimation` |
| Glow | `pulseGlow`, `pulseGlowPink`, `floatingAnimation` |
| Stagger | `staggerContainer`, `staggerContainerFast`, `staggerItem`, `listItem` |
| Victory | `victoryReveal`, `impostorReveal`, `wordReveal` |
| Hover | `hoverScale`, `hoverLift`, `tapScale` |

**Problema actual**: Estas variantes están **casi sin usar**. Los componentes del juego tienen animaciones mínimas o ninguna.

---

### FASE J — Animaciones del Juego

#### J1. Transición de Ronda (Round Transition)

**Componente**: `GameView.tsx`
**Animaciones**: `roundReveal`, `bounceIn`

Cuando cambia `currentRound`:
1. **Overlay dramático** con el número de ronda grande
2. Número entra con `roundReveal` (blur → bounce)
3. Opcional: cuenta regresiva 3...2...1 antes de empezar
4. Fade out del overlay, reveal del nuevo estado

```tsx
// Ejemplo de implementación
<AnimatePresence>
  {showRoundTransition && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      variants={fadeIn}
    >
      <motion.span
        className="text-9xl font-black text-accent"
        variants={roundReveal}
      >
        {currentRound}
      </motion.span>
    </motion.div>
  )}
</AnimatePresence>
```

**Trigger**: Cuando `phase` cambia a `'playing'` después de `'results'` o al inicio del juego.

---

#### J2. Reveal de la Palabra Secreta

**Componente**: `GameView.tsx`
**Animaciones**: `wordReveal`, `pulseGlowPink`

Al mostrar la palabra (o "???"):
1. Card entra con `fadeInScale`
2. Palabra entra con `wordReveal` (delay 0.5s)
3. Para impostor: "???" tiene `pulseGlowPink` infinito
4. Para crew: palabra tiene glow verde sutil

---

#### J3. Lista de Jugadores (Turn Order)

**Componente**: `GameView.tsx`
**Animaciones**: `staggerContainer`, `listItem`, `hoverLift`

La lista de turnos es **referencial** (para Discord, etc.):
1. Contenedor usa `staggerContainer`
2. Cada jugador entra con `listItem` (stagger 0.08s)
3. Hover con `hoverLift` en cada item
4. El jugador actual (tú) tiene borde accent con `pulseGlow` sutil
5. Jugador eliminado: fade con `strikethrough` animado

**Nota UX**: No hay "turno activo" porque el juego es presencial. La lista solo muestra el orden de referencia.

---

#### J4. Transición Playing → Voting

**Componente**: `GameView.tsx` / `VotingPanel.tsx`
**Animaciones**: `slideInFromRight`, `fadeIn`

Cuando admin inicia votación:
1. Vista de juego hace `slideInFromLeft` exit
2. VotingPanel entra con `slideInFromRight`
3. Título "Votación" con `bounceIn`

---

#### J5. Votación: Feedback Visual

**Componente**: `VotingPanel.tsx`
**Animaciones**: `jelly`, `tapScale`, `staggerContainer`

1. Lista de candidatos con `staggerContainer`
2. Al recibir un voto: badge hace `jelly` o `rubberBand`
3. Botones de voto con `tapScale`
4. Barra de progreso 2/3 con animación suave

---

#### J6. Results: Reveal del Eliminado

**Componente**: `ResultsPanel.tsx`
**Animaciones**: `impostorReveal`, `victoryReveal`, `tada`

1. Card de resultado entra con `victoryReveal`
2. Avatar del eliminado con `popIn`
3. Si era impostor: `impostorReveal` + confetti
4. Si era inocente: `shakeAnimation` sutil
5. Texto "Era impostor" / "Era inocente" con `fadeInUp`

---

#### J7. Game Over: Victoria Final

**Componente**: `GameOverPanel.tsx`
**Animaciones**: `explosiveReveal`, `tada`, `confetti`

1. Overlay entra con `fadeIn`
2. Emoji trofeo/calavera con `explosiveReveal`
3. Texto de victoria con `victoryReveal`
4. Reveal del impostor(es) con `impostorReveal`
5. Confetti party para crew / emojis skull para impostor

---

#### J8. Micro-interacciones Generales

**Componentes**: Varios
**Animaciones**: `hoverScale`, `tapScale`, `heartbeat`

1. **Botones**: `whileTap={tapScale}` en todos
2. **Cards interactivas**: `whileHover={hoverScale}`
3. **Timer bajo**: `heartbeat` cuando quedan <10 segundos
4. **Badge de ronda**: `wobble` al hacer hover

---

### Orden de Implementación Sugerido

1. **J1 - Round Transition** (alto impacto, cambio localizado)
2. **J2 - Word Reveal** (mejora inmediata en GameView)
3. **J3 - Turn Order Stagger** (mejora feeling de lista)
4. **J5 - Voting Feedback** (más interactivo)
5. **J6 - Results Reveal** (más dramático)
6. **J4 - Phase Transitions** (polish general)
7. **J7 - Game Over** (ya tiene confetti, añadir más drama)
8. **J8 - Micro-interactions** (polish final)

---

### Notas de Implementación

- Usar `AnimatePresence` para enter/exit animations
- Usar `motion.div` con `variants` para animaciones complejas
- No animar elementos que cambien frecuentemente (evitar jank)
- Respetar `prefers-reduced-motion` para accesibilidad
- Mantener animaciones < 1s para no interrumpir el flujo del juego

### Consideraciones de UX para Juego Presencial

Como el juego es **para jugar en persona**:
- Las animaciones son **celebratorias**, no informativas de turno
- La lista de turnos es **referencia estática** para Discord, no interactiva
- El foco visual debe estar en la **palabra** y el **número de ronda**
- Los momentos dramáticos son: reveal de palabra, votación, resultado, game over

---

## Roadmap UX-First: Tareas Pendientes

> Priorización basada en **impacto en la experiencia del usuario**.
> Última actualización: 2025-12-26

### Contexto: El Juego es Presencial

El Impostor está diseñado para **jugarse en persona**. Esto significa:
- La UI es una **herramienta de apoyo**, no el juego en sí
- Los momentos importantes son los **reveals** y **resultados**
- Las animaciones deben **celebrar** momentos, no informar turnos
- El audio refuerza momentos clave sin ser intrusivo

---

### Nivel 1: Alto Impacto UX (Hacer Ahora)

Estas mejoras transforman la experiencia de "app funcional" a "juego memorable".

#### FASE J — Animaciones del Juego
**Estado**: 🔴 Pendiente
**Impacto**: ⭐⭐⭐⭐⭐

El sistema de animaciones (`motion.ts`) está completo pero sin usar. Implementar:
- J1: Transición de ronda con número dramático
- J2: Reveal de palabra secreta
- J3: Lista de jugadores con stagger
- J4: Transiciones entre fases
- J5: Feedback visual en votación
- J6: Reveal del eliminado
- J7: Victoria final dramática
- J8: Micro-interacciones

**Por qué es prioritario**: Las animaciones dan **personalidad** al juego. Sin ellas, se siente como una app genérica. Con ellas, se convierte en una experiencia party memorable.

#### Archivos de Audio (mp3)
**Estado**: 🔴 Pendiente (infraestructura ✅)
**Impacto**: ⭐⭐⭐⭐

La infraestructura de audio está lista (`useSound`, `useSoundStore`, `SoundToggle`). Faltan los archivos:

| Efecto | Momento | Estilo sugerido |
|--------|---------|-----------------|
| `join.mp3` | Jugador entra | Pop suave |
| `start.mp3` | Juego inicia | Fanfarria corta |
| `vote.mp3` | Voto emitido | Click satisfactorio |
| `reveal.mp3` | Reveal impostor | Dramático/suspense |
| `win.mp3` | Crew gana | Celebración |
| `lose.mp3` | Impostor gana | Tono menor/misterioso |
| `tick.mp3` | Timer bajo | Tick tenso |
| `round.mp3` | Nueva ronda | Transición |

**Por qué es prioritario**: El audio refuerza los momentos emocionales. Un "ding" al votar o una fanfarria al ganar eleva la experiencia significativamente.

---

### Nivel 2: Impacto UX Medio (Después de Nivel 1)

Mejoras que expanden las posibilidades del juego.

#### FASE G — Nuevos Modos de Juego
**Estado**: 🔴 Pendiente
**Impacto**: ⭐⭐⭐

Modos actuales: Clásico, Random (RAE), Custom, Roulette

Modos propuestos:
- **Colaborativo**: Jugadores sugieren palabras antes de empezar
- **Temático**: Categorías especiales (películas, lugares, etc.)
- **Speed**: Rondas más cortas, más presión

**Consideración UX**: El modo Roulette ya es colaborativo. ¿Realmente necesitamos más modos o pulir los existentes?

#### I2-I4 — Auditoría UX Formal
**Estado**: 🔴 Pendiente
**Impacto**: ⭐⭐⭐

Tareas:
- Testing con usuarios reales
- Grabación de sesiones
- Identificar puntos de fricción
- Documentar mejoras

**Consideración**: Mejor hacer esto DESPUÉS de implementar animaciones y audio, para evaluar la experiencia completa.

---

### Nivel 3: Impacto UX Bajo (Nice-to-Have)

Mejoras técnicas o de nicho que no afectan la experiencia core.

#### E1 — Phone OTP
**Estado**: 🔴 Pendiente (requiere Twilio)
**Impacto**: ⭐⭐

Permite login con número de teléfono. Útil para usuarios sin cuentas Google/GitHub, pero:
- Requiere configurar Twilio (coste)
- Google/GitHub cubren 95%+ de usuarios
- No es bloqueante para jugar

#### FASE H — Monetización
**Estado**: 🔴 Pendiente
**Impacto**: ⭐

Ideas:
- Cosméticos (colores premium, animaciones especiales)
- Buy me a coffee
- Premium slots (>8 jugadores)

**Prohibido**: Paywalls, ventajas competitivas, revelar impostor.

**Consideración**: El juego debe ser excelente ANTES de monetizar. Priorizar experiencia.

#### Deploy Raspberry Pi 5
**Estado**: 🔴 Pendiente
**Impacto**: ⭐ (infraestructura)

Stack: nginx + PM2 + certbot

No afecta UX directamente, pero permite:
- Hosting propio
- Sin costes de cloud
- Control total

---

### Orden de Implementación Recomendado

```
1. FASE J - Animaciones (J1 → J8)
   └── Alto impacto, mejora inmediata de percepción

2. Audio mp3s
   └── Complementa las animaciones

3. UX Review (I2-I4)
   └── Evaluar experiencia completa

4. Pulir modos existentes vs nuevos modos
   └── Decisión basada en UX review

5. Deploy
   └── Cuando esté listo para producción

6. Phone OTP / Monetización
   └── Solo si hay demanda real
```

---

### Principios UX para Recordar

1. **El juego es presencial**: La app apoya, no reemplaza la interacción humana
2. **Momentos > Información**: Las animaciones celebran, no informan
3. **Audio sutil**: Refuerza sin molestar, siempre con opción de mute
4. **Mobile-first**: La mayoría jugará desde el móvil
5. **Accesibilidad**: Respetar `prefers-reduced-motion`, contrastes WCAG
6. **Party pero elegante**: Revolut > Vercel, goofy pero con clase
