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
