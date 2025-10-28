import { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Trash2, Eye, EyeOff, 
  Calendar, Image, Star, X, Folder
} from 'lucide-react';

interface Project {
  id: string;
  title_fr: string;
  title_en: string;
  slug: string;
  description_fr?: string;
  description_en?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  order_index: number;
  project_date?: string;
  views_count: number;
  created_at: string;
}

interface ProjectImage {
  id: string;
  image_id: string;
  order_index: number;
  image?: {
    image_url: string;
    alt: string;
    category: string;
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    project_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchProjects();
    fetchAvailableImages();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const mockProjects: Project[] = [
        {
          id: '1',
          title_fr: 'Architecture Moderne',
          title_en: 'Modern Architecture',
          slug: 'architecture-moderne',
          description_fr: 'Une collection de bâtiments contemporains',
          description_en: 'A collection of contemporary buildings',
          status: 'published',
          featured: true,
          order_index: 0,
          project_date: '2024-01-15',
          views_count: 245,
          created_at: '2024-01-01',
        },
        {
          id: '2',
          title_fr: 'Portraits Urbains',
          title_en: 'Urban Portraits',
          slug: 'portraits-urbains',
          description_fr: 'Portraits de rue et scènes de vie',
          description_en: 'Street portraits and life scenes',
          status: 'draft',
          featured: false,
          order_index: 1,
          project_date: '2024-02-20',
          views_count: 89,
          created_at: '2024-02-01',
        },
      ];
      
      setProjects(mockProjects);
    } catch (error: any) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const mockImages = Array.from({ length: 12 }, (_, i) => ({
        id: `img-${i + 1}`,
        image_url: `https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=400&h=300&fit=crop`,
        alt: `Image ${i + 1}`,
        category: 'architecture',
      }));
      
      setAvailableImages(mockImages);
    } catch (error: any) {
      console.error('Erreur chargement images:', error);
    }
  };

  const fetchProjectImages = async (projectId: string) => {
    try {
      const mockProjectImages: ProjectImage[] = projectId === '1' ? [
        {
          id: 'pi-1',
          image_id: 'img-1',
          order_index: 0,
          image: {
            image_url: 'https://images.unsplash.com/photo-1500000000000?w=400&h=300&fit=crop',
            alt: 'Image 1',
            category: 'architecture',
          },
        },
        {
          id: 'pi-2',
          image_id: 'img-2',
          order_index: 1,
          image: {
            image_url: 'https://images.unsplash.com/photo-1500000100000?w=400&h=300&fit=crop',
            alt: 'Image 2',
            category: 'architecture',
          },
        },
      ] : [];
      
      setProjectImages(mockProjectImages);
    } catch (error: any) {
      console.error('Erreur chargement images projet:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const resetForm = () => {
    setFormData({
      title_fr: '',
      title_en: '',
      description_fr: '',
      description_en: '',
      status: 'draft',
      featured: false,
      project_date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = generateSlug(formData.title_fr);
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...formData,
      slug,
      order_index: projects.length,
      views_count: 0,
      created_at: new Date().toISOString(),
    };

    setProjects([...projects, newProject]);
    alert('✅ Projet créé avec succès');
    resetForm();
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));
    
    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, ...updates });
    }
    
    alert('✅ Projet mis à jour');
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm('Supprimer ce projet ? Les images ne seront pas supprimées.')) return;

    setProjects(projects.filter(p => p.id !== projectId));
    
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setProjectImages([]);
    }
    
    alert('✅ Projet supprimé');
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    fetchProjectImages(project.id);
  };

  const handleAddImageToProject = (imageId: string) => {
    if (!selectedProject) return;

    const image = availableImages.find(img => img.id === imageId);
    if (!image) return;

    const newProjectImage: ProjectImage = {
      id: `pi-${Date.now()}`,
      image_id: imageId,
      order_index: projectImages.length,
      image: {
        image_url: image.image_url,
        alt: image.alt,
        category: image.category,
      },
    };

    setProjectImages([...projectImages, newProjectImage]);
    alert('✅ Image ajoutée au projet');
  };

  const handleRemoveImageFromProject = (projectImageId: string) => {
    setProjectImages(projectImages.filter(pi => pi.id !== projectImageId));
    alert('✅ Image retirée du projet');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Projets & Séries</h2>
            <p className="text-sm text-gray-600">
              Regroupez vos images en projets thématiques
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annuler' : 'Nouveau projet'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Titre (Français)</label>
                <input
                  type="text"
                  value={formData.title_fr}
                  onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Titre (Anglais)</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Français)</label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Anglais)</label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date du projet</label>
                <input
                  type="date"
                  value={formData.project_date}
                  onChange={(e) => setFormData({ ...formData, project_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Projet vedette</span>
                </label>
              </div>
            </div>

            <button 
              onClick={handleCreateProject}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Créer le projet
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Tous les projets ({projects.length})</h3>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Aucun projet créé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedProject?.id === project.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-400 bg-white'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold truncate">{project.title_fr}</h4>
                        {project.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className={`
                          px-2 py-0.5 rounded-full font-medium
                          ${project.status === 'published' ? 'bg-green-100 text-green-700' : ''}
                          ${project.status === 'draft' ? 'bg-orange-100 text-orange-700' : ''}
                          ${project.status === 'archived' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {project.status === 'published' && '✓ Publié'}
                          {project.status === 'draft' && '○ Brouillon'}
                          {project.status === 'archived' && '□ Archivé'}
                        </span>
                        
                        {project.project_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.project_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {project.views_count}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProject(project.id, { 
                            status: project.status === 'published' ? 'draft' : 'published' 
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {project.status === 'published' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {selectedProject ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Images de "{selectedProject.title_fr}"
                </h3>
                <span className="text-sm text-gray-600">
                  {projectImages.length} image{projectImages.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                {projectImages.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune image dans ce projet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {projectImages.map((pi) => (
                      <div key={pi.id} className="relative group">
                        <img
                          src={pi.image?.image_url}
                          alt={pi.image?.alt}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImageFromProject(pi.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Ajouter des images</h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {availableImages
                      .filter(img => !projectImages.some(pi => pi.image_id === img.id))
                      .map((img) => (
                        <div
                          key={img.id}
                          onClick={() => handleAddImageToProject(img.id)}
                          className="relative cursor-pointer group hover:ring-2 hover:ring-blue-600 rounded-lg overflow-hidden"
                        >
                          <img
                            src={img.image_url}
                            alt={img.alt}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Sélectionnez un projet pour gérer ses images
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}