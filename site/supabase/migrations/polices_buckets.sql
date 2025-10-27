-- Script de setup complet et sécurisé pour Storage
-- À exécuter dans SQL Editor du Dashboard Supabase

-- ========================================
-- ÉTAPE 1 : Créer/vérifier le bucket
-- ========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,  -- IMPORTANT: PUBLIC = true
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ========================================
-- ÉTAPE 2 : Supprimer les anciennes politiques (si elles existent)
-- ========================================
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

-- ========================================
-- ÉTAPE 3 : Créer les nouvelles politiques
-- ========================================

-- Politique 1: Lecture publique (pour afficher les images sur le site)
CREATE POLICY "Public can view gallery images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Politique 2: Upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Politique 3: Update pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Politique 4: Delete pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- ========================================
-- VÉRIFICATION
-- ========================================
SELECT 
  'Bucket gallery' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'gallery' AND public = true)
    THEN '✅ OK - Bucket existe et est public'
    ELSE '❌ ERREUR - Bucket manquant ou privé'
  END as status;

SELECT 
  'Politiques Storage' as check_type,
  COUNT(*) || ' politiques créées' as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%gallery%';