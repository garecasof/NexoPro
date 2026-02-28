-- ============================================================
-- NexoPro — Agregar Nuevas Categorías
-- Ejecutar en Supabase SQL Editor
-- Fecha: 28 de febrero de 2026
-- ============================================================

-- NUEVAS CATEGORÍAS:
-- 1. Locución             → grupo: comunicacion
-- 2. Marketing y Publicidad → grupo: comunicacion
-- 3. Gestor Automotor     → grupo: automotor
-- 4. Estética / Uñas      → grupo: bienestar
-- 5. Jardinería           → grupo: hogar
-- 6. Retiro de Escombros  → grupo: hogar

INSERT INTO categories (name, icon, "group", sort_order) VALUES
  ('Locución',               '🎙️', 'comunicacion', 10),
  ('Marketing y Publicidad', '📣', 'comunicacion', 20),
  ('Gestor Automotor',       '📋', 'automotor',    30),
  ('Estética / Uñas',        '💅', 'bienestar',    20),
  ('Jardinería',             '🌿', 'hogar',        70),
  ('Retiro de Escombros',    '🚛', 'hogar',        80)
ON CONFLICT DO NOTHING;

-- Verificar que se insertaron correctamente:
SELECT name, icon, "group", sort_order
FROM categories
ORDER BY "group", sort_order;
