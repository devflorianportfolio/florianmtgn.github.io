// src/components/AdminImageUpload.tsx
import { useState, useRef } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { motion } from 'framer-motion';
import { Upload, Trash2, X, Check } from 'lucide-react';

export const AdminImageUpload = () => {
  const { uploadImage, deleteImage, uploading, progress } = useImageUpload();
  const { refetch: refetchImages, data: images } = useGalleryImages();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    alt: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.category || !formData.alt) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await uploadImage(selectedFile, formData.category, formData.alt);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({ category: '', alt: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refetchImages();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      try {
        await deleteImage(imageId, imageUrl);
        await refetchImages();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const categories = Array.from(
    new Set(images?.map((img: any) => img.category) || [])
  );

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-lg border border-border"
      >
        <h2 className="text-xl font-semibold mb-6">Uploader une nouvelle image</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-accent transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner une image'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF (max 5MB)
              </p>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-48 rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                placeholder="ex: Portrait, Événement, Paysage"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2"
              />
              {categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat: string) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="alt">Texte alternatif (Alt)</Label>
              <Input
                id="alt"
                placeholder="Description de l'image"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span>Upload en cours...</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  className="h-full bg-accent"
                />
              </div>
            </motion.div>
          )}

          <Button type="submit" disabled={uploading || !selectedFile} className="w-full">
            {uploading ? 'Upload en cours...' : 'Uploader l\'image'}
          </Button>
        </form>
      </motion.div>

      {/* Image Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Images de la galerie</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images?.map((image: any, index: number) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card rounded-lg border border-border overflow-hidden"
            >
              <img
                src={image.image_url}
                alt={image.alt}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                <div className="w-full text-white text-sm space-y-1">
                  <p className="font-medium truncate">{image.alt}</p>
                  <p className="text-xs opacity-80">{image.category}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(image.id, image.image_url)}
                disabled={uploading}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};