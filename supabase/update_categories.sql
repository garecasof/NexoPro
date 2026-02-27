-- ============================================================
-- NexoPro — Actualización: Subcategorías (Especialidades)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna parent_id para jerarquía de categorías
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- 2. Insertar Especialidades de Médicos
DO $$
DECLARE
  v_medicos_id UUID;
BEGIN
  SELECT id INTO v_medicos_id FROM categories WHERE name = 'Médicos' LIMIT 1;
  IF v_medicos_id IS NOT NULL THEN
    INSERT INTO categories (name, icon, "group", sort_order, parent_id) VALUES
      ('Pediatría',      '👶', 'salud', 101, v_medicos_id),
      ('Cardiología',    '❤️', 'salud', 102, v_medicos_id),
      ('Ginecología',    '🚺', 'salud', 103, v_medicos_id),
      ('Traumatología',  '🦴', 'salud', 104, v_medicos_id),
      ('Dermatología',   '👩‍⚕️', 'salud', 105, v_medicos_id),
      ('Oftalmología',   '👁️', 'salud', 106, v_medicos_id),
      ('Nutrición',      '🍎', 'salud', 107, v_medicos_id);
  END IF;
END $$;

-- 3. Insertar Especialidades de Abogados
DO $$
DECLARE
  v_abogados_id UUID;
BEGIN
  SELECT id INTO v_abogados_id FROM categories WHERE name = 'Abogados' LIMIT 1;
  IF v_abogados_id IS NOT NULL THEN
    INSERT INTO categories (name, icon, "group", sort_order, parent_id) VALUES
      ('Civil',         '⚖️', 'legal', 101, v_abogados_id),
      ('Penal',         '🚓', 'legal', 102, v_abogados_id),
      ('Laboral',       '💼', 'legal', 103, v_abogados_id),
      ('Familia',       '👨‍👩‍👧', 'legal', 104, v_abogados_id),
      ('Comercial',     '🏢', 'legal', 105, v_abogados_id),
      ('Sucesiones',    '📜', 'legal', 106, v_abogados_id);
  END IF;
END $$;

-- 4. Insertar Especialidades de Contadores
DO $$
DECLARE
  v_contadores_id UUID;
BEGIN
  SELECT id INTO v_contadores_id FROM categories WHERE name = 'Contadores' LIMIT 1;
  IF v_contadores_id IS NOT NULL THEN
    INSERT INTO categories (name, icon, "group", sort_order, parent_id) VALUES
      ('Auditoría',             '🔍', 'legal', 101, v_contadores_id),
      ('Liq. de Impuestos',     '🧾', 'legal', 102, v_contadores_id),
      ('Contabilidad General',  '📉', 'legal', 103, v_contadores_id),
      ('Asesoría Pyme',         '💡', 'legal', 104, v_contadores_id);
  END IF;
END $$;

-- 5. Insertar Especialidades de Técnicos
DO $$
DECLARE
  v_tecnicos_id UUID;
BEGIN
  SELECT id INTO v_tecnicos_id FROM categories WHERE name = 'Técnicos' LIMIT 1;
  IF v_tecnicos_id IS NOT NULL THEN
    INSERT INTO categories (name, icon, "group", sort_order, parent_id) VALUES
      ('Rep. Celulares',   '📱', 'hogar', 101, v_tecnicos_id),
      ('Rep. PC/Notebooks','💻', 'hogar', 102, v_tecnicos_id),
      ('Refrigeración',    '❄️', 'hogar', 103, v_tecnicos_id),
      ('Redes e Internet', '🌐', 'hogar', 104, v_tecnicos_id);
  END IF;
END $$;
