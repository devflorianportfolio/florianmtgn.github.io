// components/AdminSEOManager.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  Download, Search, FileText, Image as ImageIcon, 
  Globe, Tag, Hash, CheckCircle, AlertCircle, RefreshCw,
  Eye, Code
} from 'lucide-react';
import { 
  generateSitemap, 
  downloadSitemap, 
  downloadRobotsTxt,
  extractImageMetadata,
  generateAltText,
  optimizeImageForOG
} from '@/utils/seoUtils';

export const AdminSEOManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [metadataForm, setMetadataForm] = useState({
    og_title: '',
    og_description: '',
    keywords: '',
    ai_tags: '',
  });
  const [sitemapPreview, setSitemapPreview] = useState('');
  const [seoScore, setSeoScore] = useState<number>(0);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data: imagesData, error } = await supabase
        .from('gallery_images')
        .select(`
          *,
          metadata:image_metadata(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(imagesData || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      const sitemap = await generateSitemap();
      setSitemapPreview(sitemap);
      toast({
        title: '✅ Sitemap généré',
        description: 'Le sitemap XML a été créé avec succès',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  const handleAutoOptimizeImage = async (image: any) => {
    try {
      setLoading(true);

      // Générer alt text automatique
      const altText = await generateAltText(image.image_url);

      // Optimiser pour Open Graph
      const ogImage = await optimizeImageForOG(image.image_url);

      // Extraire couleurs dominantes (simulation)
      const colorPalette = {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
      };

      // Sauvegarder métadonnées
      const { error } = await supabase
        .from('image_metadata')
        .upsert({
          image_id: image.id,
          og_title: image.alt || altText,
          og_description: `Photo professionnelle - ${image.category}`,
          og_image_url: ogImage,
          ai_tags: [image.category, 'photographie', 'portfolio'],
          color_palette: colorPalette,
          keywords: [image.category, 'photo', 'art'],
        });

      if (error) throw error;

      toast({
        title: '✅ Image optimisée',
        description: 'Métadonnées SEO générées automatiquement',
      });

      fetchImages();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOptimize = async () => {
    if (!confirm('Optimiser toutes les images ? Cette opération peut prendre du temps.')) {
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const image of images) {
        try {
          await handleAutoOptimizeImage(image);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: '✅ Optimisation terminée',
        description: `${successCount} images optimisées, ${errorCount} erreurs`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSEOScore = (metadata: any) => {
    let score = 0;
    const checks = [
      { field: 'og_title', weight: 20 },
      { field: 'og_description', weight: 20 },
      { field: 'keywords', weight: 15 },
      { field: 'ai_tags', weight: 15 },
      { field: 'og_image_url', weight: 15 },
      { field: 'color_palette', weight: 10 },
      { field: 'blockchain_hash', weight: 5 },
    ];

    checks.forEach(check => {
      if (metadata && metadata[check.field]) {
        score += check.weight;
      }
    });

    return score;
  };

  const handleUpdateMetadata = async (imageId: string) => {
    try {
      const keywords = metadataForm.keywords.split(',').map(k => k.trim());
      const aiTags = metadataForm.ai_tags.split(',').map(t => t.trim());

      const { error } = await supabase
        .from('image_metadata')
        .upsert({
          image_id: imageId,
          og_title: metadataForm.og_title,
          og_description: metadataForm.og_description,
          keywords,
          ai_tags: aiTags,
        });

      if (error) throw error;

      toast({
        title: '✅ Métadonnées mises à jour',
      });

      setSelectedImage(null);
      fetchImages();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">SEO & Métadonnées</h2>
            <p className="text-sm text-muted-foreground">
              Optimisez votre référencement et vos métadonnées
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleBulkOptimize} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Optimiser tout
          </Button>
          <Button onClick={() => downloadRobotsTxt()}>
            <Download className="w-4 h-4 mr-2" />
            robots.txt
          </Button>
          <Button onClick={downloadSitemap}>
            <Download className="w-4 h-4 mr-2" />
            sitemap.xml
          </Button>
        </div>
      </div>

      {/* Sitemap Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-xl border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Sitemap XML</h3>
              <p className="text-sm text-muted-foreground">
                Générez votre sitemap pour les moteurs de recherche
              </p>
            </div>
          </div>
          <Button onClick={handleGenerateSitemap}>
            <FileText className="w-4 h-4 mr-2" />
            Générer
          </Button>
        </div>

        {sitemapPreview && (
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">sitemap.xml</span>
              <Button size="sm" variant="ghost" onClick={() => setSitemapPreview('')}>
                <Eye className="w-3 h-3" />
              </Button>
            </div>
            <pre className="text-xs overflow-x-auto max-h-60 overflow-y-auto">
              {sitemapPreview}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Images avec métadonnées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-xl border border-border"
      >
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          Images & Métadonnées SEO
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => {
            const metadata = Array.isArray(image.metadata) ? image.metadata[0] : image.metadata;
            const score = calculateSEOScore(metadata);
            const hasMetadata = metadata && Object.keys(metadata).length > 0;

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-muted/30 rounded-lg border border-border overflow-hidden"
              >
                <img
                  src={image.image_url}
                  alt={image.alt}
                  className="w-full h-40 object-cover"
                />

                {/* Score SEO */}
                <div className="absolute top-2 right-2">
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
                    ${score >= 80 ? 'bg-green-500 text-white' : ''}
                    ${score >= 50 && score < 80 ? 'bg-orange-500 text-white' : ''}
                    ${score < 50 ? 'bg-red-500 text-white' : ''}
                  `}>
                    {score >= 80 && <CheckCircle className="w-3 h-3" />}
                    {score < 80 && <AlertCircle className="w-3 h-3" />}
                    {score}%
                  </div>
                </div>

                <div className="p-3">
                  <p className="font-medium text-sm truncate mb-2">{image.alt}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {metadata?.keywords?.slice(0, 3).map((keyword: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(image);
                        setMetadataForm({
                          og_title: metadata?.og_title || image.alt,
                          og_description: metadata?.og_description || '',
                          keywords: metadata?.keywords?.join(', ') || '',
                          ai_tags: metadata?.ai_tags?.join(', ') || '',
                        });
                      }}
                      className="flex-1"
                    >
                      <Code className="w-3 h-3 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAutoOptimizeImage(image)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Auto
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal édition métadonnées */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4">Éditer les métadonnées</h3>

            <div className="space-y-4">
              <div>
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.alt}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </div>

              <div>
                <Label>Titre Open Graph</Label>
                <Input
                  value={metadataForm.og_title}
                  onChange={(e) => setMetadataForm({ ...metadataForm, og_title: e.target.value })}
                  placeholder="Titre optimisé pour le partage social"
                />
              </div>

              <div>
                <Label>Description Open Graph</Label>
                <Textarea
                  value={metadataForm.og_description}
                  onChange={(e) => setMetadataForm({ ...metadataForm, og_description: e.target.value })}
                  placeholder="Description optimisée (max 160 caractères)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metadataForm.og_description.length} / 160 caractères
                </p>
              </div>

              <div>
                <Label>Mots-clés (séparés par des virgules)</Label>
                <Input
                  value={metadataForm.keywords}
                  onChange={(e) => setMetadataForm({ ...metadataForm, keywords: e.target.value })}
                  placeholder="photo, portrait, professionnel, art"
                />
              </div>

              <div>
                <Label>Tags IA (séparés par des virgules)</Label>
                <Input
                  value={metadataForm.ai_tags}
                  onChange={(e) => setMetadataForm({ ...metadataForm, ai_tags: e.target.value })}
                  placeholder="photographie, nature, lumière naturelle"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleUpdateMetadata(selectedImage.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};