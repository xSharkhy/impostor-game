-- El Impostor - Database Schema
-- Run this in Supabase SQL Editor

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_ca TEXT,
  name_gl TEXT,
  name_eu TEXT
);

-- Words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  lang TEXT DEFAULT 'es',
  approved BOOLEAN DEFAULT false,
  suggested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for frequent queries
CREATE INDEX idx_words_category_lang ON words(category_id, lang) WHERE approved = true;
CREATE INDEX idx_words_pending ON words(approved) WHERE approved = false;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read approved words and categories
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read approved words" ON words
  FOR SELECT USING (approved = true);

-- Authenticated users can suggest words
CREATE POLICY "Authenticated users can suggest words" ON words
  FOR INSERT TO authenticated
  WITH CHECK (approved = false AND suggested_by = auth.uid());

-- Seed initial categories
INSERT INTO categories (id, name_es, name_en) VALUES
  ('animals', 'Animales', 'Animals'),
  ('food', 'Comida', 'Food'),
  ('places', 'Lugares', 'Places'),
  ('objects', 'Objetos', 'Objects'),
  ('professions', 'Profesiones', 'Professions'),
  ('sports', 'Deportes', 'Sports');

-- Seed some initial words (approved)
INSERT INTO words (word, category_id, lang, approved) VALUES
  -- Animals
  ('Perro', 'animals', 'es', true),
  ('Gato', 'animals', 'es', true),
  ('Elefante', 'animals', 'es', true),
  ('León', 'animals', 'es', true),
  ('Delfín', 'animals', 'es', true),
  ('Águila', 'animals', 'es', true),
  ('Serpiente', 'animals', 'es', true),
  ('Caballo', 'animals', 'es', true),
  ('Tigre', 'animals', 'es', true),
  ('Oso', 'animals', 'es', true),
  -- Food
  ('Pizza', 'food', 'es', true),
  ('Hamburguesa', 'food', 'es', true),
  ('Sushi', 'food', 'es', true),
  ('Paella', 'food', 'es', true),
  ('Tortilla', 'food', 'es', true),
  ('Helado', 'food', 'es', true),
  ('Chocolate', 'food', 'es', true),
  ('Pasta', 'food', 'es', true),
  ('Ensalada', 'food', 'es', true),
  ('Tacos', 'food', 'es', true),
  -- Places
  ('Playa', 'places', 'es', true),
  ('Montaña', 'places', 'es', true),
  ('Hospital', 'places', 'es', true),
  ('Aeropuerto', 'places', 'es', true),
  ('Biblioteca', 'places', 'es', true),
  ('Restaurante', 'places', 'es', true),
  ('Cine', 'places', 'es', true),
  ('Parque', 'places', 'es', true),
  ('Museo', 'places', 'es', true),
  ('Estadio', 'places', 'es', true),
  -- Objects
  ('Teléfono', 'objects', 'es', true),
  ('Ordenador', 'objects', 'es', true),
  ('Televisión', 'objects', 'es', true),
  ('Reloj', 'objects', 'es', true),
  ('Lámpara', 'objects', 'es', true),
  ('Silla', 'objects', 'es', true),
  ('Mesa', 'objects', 'es', true),
  ('Coche', 'objects', 'es', true),
  ('Bicicleta', 'objects', 'es', true),
  ('Libro', 'objects', 'es', true),
  -- Professions
  ('Médico', 'professions', 'es', true),
  ('Profesor', 'professions', 'es', true),
  ('Bombero', 'professions', 'es', true),
  ('Policía', 'professions', 'es', true),
  ('Chef', 'professions', 'es', true),
  ('Piloto', 'professions', 'es', true),
  ('Arquitecto', 'professions', 'es', true),
  ('Abogado', 'professions', 'es', true),
  ('Veterinario', 'professions', 'es', true),
  ('Astronauta', 'professions', 'es', true),
  -- Sports
  ('Fútbol', 'sports', 'es', true),
  ('Baloncesto', 'sports', 'es', true),
  ('Tenis', 'sports', 'es', true),
  ('Natación', 'sports', 'es', true),
  ('Ciclismo', 'sports', 'es', true),
  ('Golf', 'sports', 'es', true),
  ('Boxeo', 'sports', 'es', true),
  ('Surf', 'sports', 'es', true),
  ('Esquí', 'sports', 'es', true),
  ('Atletismo', 'sports', 'es', true);
