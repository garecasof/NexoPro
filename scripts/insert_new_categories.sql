-- =====================================================
-- NexoPro — Insertar nuevas categorías en Supabase
-- Ejecutá este SQL en el Editor SQL de tu panel de Supabase:
-- https://supabase.com/dashboard → SQL Editor
-- =====================================================

-- Verificá primero cuáles son los grupos que ya tenés:
-- SELECT DISTINCT "group" FROM categories;

-- ─── Nuevas Categorías ───────────────────────────────

-- 🏠 Grupo: hogar
INSERT INTO categories (name, icon, "group", slug, is_active)
VALUES
  ('Jardineros',           '🌿', 'hogar',     'jardineros',           true),
  ('Retiro de Escombros',  '🚛', 'hogar',     'retiro-de-escombros',  true)
ON CONFLICT (slug) DO NOTHING;

-- 🚗 Grupo: automotor
INSERT INTO categories (name, icon, "group", slug, is_active)
VALUES
  ('Gestor Automotor', '📋', 'automotor', 'gestor-automotor', true)
ON CONFLICT (slug) DO NOTHING;

-- 📦 Grupo: servicios
INSERT INTO categories (name, icon, "group", slug, is_active)
VALUES
  ('Locución',              '🎙️', 'servicios', 'locucion',              true),
  ('Marketing y Publicidad','📣', 'servicios', 'marketing-publicidad',  true)
ON CONFLICT (slug) DO NOTHING;

-- 💇 Grupo: bienestar
INSERT INTO categories (name, icon, "group", slug, is_active)
VALUES
  ('Estéticas y Uñas', '💅', 'bienestar', 'esteticas-y-unas', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Verificar resultado ────────────────────────────
SELECT name, icon, "group" FROM categories ORDER BY "group", name;
