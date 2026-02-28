-- ============================================================
-- NexoPro — Fix: Política RLS de UPDATE en profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- El problema: La política de UPDATE actual no tiene WITH CHECK explícito.
-- PostgreSQL usa el USING como check implícito, pero está conflictuando
-- con la política de SELECT que exige is_active = true.
-- Esto bloquea al usuario al intentar poner is_active = false.

-- Paso 1: Eliminar la política de UPDATE actual
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Paso 2: Recrearla con WITH CHECK explícito que permita cualquier valor
-- USING = el usuario solo puede actualizar SU propia fila
-- WITH CHECK = la fila resultante es válida mientras siga siendo del mismo usuario
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Paso 3: Agregar política de lectura para que el dueño SIEMPRE pueda ver su propio perfil
-- (incluso cuando is_active = false, para poder gestionarlo desde el dashboard)
DROP POLICY IF EXISTS "profiles_read" ON profiles;

-- Lectura pública: solo perfiles activos
CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Lectura del dueño: siempre puede ver su propio perfil
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
