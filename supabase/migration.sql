-- ============================================================
-- NexoPro — Migración de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  "group" TEXT DEFAULT 'servicios',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Perfiles de Profesionales
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  photo_url TEXT,
  license_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categorías: todos pueden leer
CREATE POLICY "categories_read" ON categories FOR SELECT TO anon, authenticated USING (true);

-- Perfiles: todos pueden leer los activos, el dueño puede editar
CREATE POLICY "profiles_read" ON profiles FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Servicios: todos pueden leer, el dueño del perfil puede editar
CREATE POLICY "services_read" ON services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services_insert" ON services FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());
CREATE POLICY "services_update" ON services FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY "services_delete" ON services FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- Reseñas: todos pueden leer, cualquier autenticado puede crear
CREATE POLICY "reviews_read" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Insertar categorías iniciales
-- ============================================================

INSERT INTO categories (name, icon, "group", sort_order) VALUES
  -- 🏥 Salud
  ('Médicos',         '🩺', 'salud', 1),
  ('Veterinarios',    '🐾', 'salud', 2),
  ('Farmacias Turno', '💊', 'salud', 3),
  ('Laboratorios',    '🔬', 'salud', 4),
  ('Psicólogos',      '🧠', 'salud', 5),
  ('Kinesiólogos',    '🦴', 'salud', 6),
  -- ⚖️ Legal y Finanzas
  ('Abogados',        '⚖️', 'legal', 10),
  ('Escribanos',      '📝', 'legal', 11),
  ('Contadores',      '📊', 'legal', 12),
  ('Seguros',         '🛡️', 'legal', 13),
  -- 🏠 Hogar y Mantenimiento
  ('Electricistas',   '⚡', 'hogar', 20),
  ('Plomeros',        '🚿', 'hogar', 21),
  ('Técnicos',        '🔧', 'hogar', 22),
  ('Gasistas',        '🔥', 'hogar', 23),
  ('Cerrajeros',      '🔑', 'hogar', 24),
  ('Fumigadores',     '🪲', 'hogar', 25),
  -- 🏗️ Construcción
  ('Construcción',    '🏗️', 'construccion', 30),
  ('Carpintería',     '🪚', 'construccion', 31),
  ('Arquitectos',     '📐', 'construccion', 32),
  ('Pintores',        '🎨', 'construccion', 33),
  -- 🚗 Automotor
  ('Mecánicos',       '🔩', 'automotor', 40),
  ('Gomerías',        '🛞', 'automotor', 41),
  -- 📦 Servicios Generales
  ('Cadetería',       '📬', 'servicios', 50),
  ('Seguridad',       '🛡️', 'servicios', 51),
  ('Lunch/Catering',  '🍽️', 'servicios', 52),
  ('Mudanzas',        '🚚', 'servicios', 53),
  ('Profesores',      '📚', 'servicios', 54),
  -- 🏨 Inmuebles y Hotelería
  ('Alquileres',      '🏠', 'inmuebles', 60),
  ('Hotelería',       '🏨', 'inmuebles', 61),
  -- 💇 Bienestar y Estética
  ('Peluquería',      '💇', 'bienestar', 70);
