-- ============================================================
-- NexoPro — Actualización: Sistema de Reseñas Público
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columnas nuevas a la tabla reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_phone TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS edit_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex');
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Actualizar reseñas existentes como aprobadas
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- 3. Permitir que CUALQUIERA (anon) pueda insertar reseñas (no necesita cuenta)
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert_public" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Solo mostrar reseñas aprobadas al público
DROP POLICY IF EXISTS "reviews_read" ON reviews;
CREATE POLICY "reviews_read_approved" ON reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR profile_id = auth.uid());

-- 5. El profesional dueño puede actualizar el status de sus reseñas
CREATE POLICY "reviews_update_owner" ON reviews FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

-- 6. Cualquiera puede actualizar una reseña si conoce el edit_token
CREATE POLICY "reviews_update_by_token" ON reviews FOR UPDATE TO anon, authenticated
  USING (true);
