-- ============================================================
-- NexoPro — Sistema de Puntos y Ranking (Vuelo Pro)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columnas a la tabla de perfiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS marketing_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- 2. Crear una función para incrementar puntos de forma segura
CREATE OR REPLACE FUNCTION increment_marketing_points(profile_id UUID, points_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    marketing_points = marketing_points + points_to_add,
    shares_count = shares_count + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
