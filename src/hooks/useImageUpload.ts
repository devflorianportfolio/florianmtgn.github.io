// src/hooks/useImageUpload.ts
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File, category: string, alt: string) => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Validation
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner un fichier image');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La taille du fichier ne doit pas dépasser 10MB');
      }

      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être authentifié pour uploader des images');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const sanitizedCategory = category.toLowerCase().replace(/\s+/g, '-');
      const fileName = `${sanitizedCategory}/${timestamp}-${random}.${fileExtension}`;

      console.log('📤 Uploading file:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(uploadError.message || 'Erreur lors de l\'upload');
      }

      console.log('✅ Upload successful:', uploadData);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      if (!imageUrl) {
        throw new Error('Impossible de générer l\'URL de l\'image');
      }

      console.log('🔗 Public URL generated:', imageUrl);

      // Get the highest order_index
      const { data: images, error: fetchError } = await supabase
        .from('gallery_images')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      const nextOrderIndex = (images?.[0]?.order_index ?? -1) + 1;

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          image_url: imageUrl,
          alt: alt,
          category: category,
          order_index: nextOrderIndex
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        // Rollback: delete the uploaded file
        await supabase.storage.from('gallery').remove([fileName]);
        throw dbError;
      }

      console.log('💾 Saved to database:', dbData);

      setProgress(null);
      toast({
        title: 'Succès',
        description: 'Image uploadée avec succès'
      });

      return dbData;
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error.message || 'Erreur lors de l\'upload';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage
      });
      setProgress(null);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      setUploading(true);

      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être authentifié pour supprimer des images');
      }

      // Extract file path from URL - MÉTHODE AMÉLIORÉE
      // URL format: https://PROJECT.supabase.co/storage/v1/object/public/gallery/category/filename.jpg
      const urlObj = new URL(imageUrl);
      const pathParts = urlObj.pathname.split('/');
      
      // Trouver l'index de 'gallery' et prendre tout ce qui suit
      const galleryIndex = pathParts.indexOf('gallery');
      
      if (galleryIndex === -1 || galleryIndex === pathParts.length - 1) {
        throw new Error('Format d\'URL invalide - impossible d\'extraire le chemin du fichier');
      }

      // Reconstruire le chemin relatif au bucket
      const filePath = pathParts.slice(galleryIndex + 1).join('/');

      console.log('🗑️ Deleting file:', filePath);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([filePath]);

      if (storageError) {
        console.error('❌ Storage delete error:', storageError);
        // Ne pas throw si le fichier n'existe pas déjà
        if (!storageError.message?.includes('not found')) {
          throw storageError;
        }
      }

      console.log('✅ File deleted from storage');

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('❌ Database delete error:', dbError);
        throw dbError;
      }

      console.log('✅ Record deleted from database');

      toast({
        title: 'Succès',
        description: 'Image supprimée avec succès'
      });

      return true;
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression'
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress
  };
};