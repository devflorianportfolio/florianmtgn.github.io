import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useAboutContent } from "@/hooks/useAboutContent";
import { useSkills } from "@/hooks/useSkills";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/contexts/AdminAccessContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Upload,
  X,
  Edit2,
  Check,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Camera,
  Image,
  User,
  Briefcase,
  Mail,
  Share2,
  BarChart3,
  Maximize2,
} from "lucide-react";
import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const translations = {
  fr: {
    admin: "Administration",
    logout: "Déconnexion",
    gallery: "Galerie",
    uploadNew: "Uploader une nouvelle image",
    selectImage: "Cliquez pour sélectionner une image",
    maxSize: "PNG, JPG, GIF (max 50MB)",
    fileTooLarge: "Le fichier dépasse 50MB",
    category: "Catégorie",
    categoryPlaceholder: "ex: Portrait, Événement, Paysage",
    altText: "Texte alternatif (Alt)",
    altPlaceholder: "Description de l'image",
    uploading: "Upload en cours...",
    uploadButton: "Uploader l'image",
    galleryImages: "Images de la galerie",
    editAbout: "Éditer la section À propos",
    nameFr: "Nom (Français)",
    nameEn: "Nom (Anglais)",
    subtitleFr: "Sous-titre (Français)",
    subtitleEn: "Sous-titre (Anglais)",
    descriptionFr: "Description (Français)",
    descriptionEn: "Description (Anglais)",
    update: "Mettre à jour",
    addSkill: "Ajouter une compétence",
    titleFr: "Titre (Français)",
    titleEn: "Titre (Anglais)",
    skillDescriptionFr: "Description (Français)",
    skillDescriptionEn: "Description (Anglais)",
    addButton: "Ajouter",
    skills: "Compétences",
    configuredSkills: "Compétences configurées",
    editContact: "Éditer les informations de contact",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    addSocial: "Ajouter un réseau social",
    platform: "Nom de la plateforme",
    platformPlaceholder: "ex: Instagram, Facebook, Site Web",
    url: "URL",
    urlPlaceholder: "https://...",
    icon: "Icône",
    social: "Réseaux",
    configuredSocial: "Réseaux sociaux configurés",
    noSocial: "Aucun réseau social ajouté",
    analytics: "Analytics",
    edit: "Éditer",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    imageUpdated: "Image mise à jour",
    imageDeleted: "Image supprimée",
    imageUploaded: "Image uploadée",
    error: "Erreur",
    success: "Succès",
    fillAllFields: "Veuillez remplir tous les champs",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette image ?",
    aboutUpdated: "À propos mis à jour",
    skillAdded: "Compétence ajoutée",
    skillDeleted: "Compétence supprimée",
    contactUpdated: "Contact mis à jour",
    socialAdded: "Réseau social ajouté",
    socialDeleted: "Réseau social supprimé",
    fullscreenZoom: "Agrandir en plein écran",
    fullscreenZoomDesc: "L'image s'affichera en plein écran dans la lightbox",
    imageDimensions: "Dimensions de l'image",
    originalSize: "Taille originale",
    autoResize: "Redimensionner automatiquement",
  },
  en: {
    admin: "Administration",
    logout: "Logout",
    gallery: "Gallery",
    uploadNew: "Upload new image",
    selectImage: "Click to select an image",
    maxSize: "PNG, JPG, GIF (max 50MB)",
    fileTooLarge: "File exceeds 50MB",
    category: "Category",
    categoryPlaceholder: "ex: Portrait, Event, Landscape",
    altText: "Alternative text (Alt)",
    altPlaceholder: "Image description",
    uploading: "Uploading...",
    uploadButton: "Upload image",
    galleryImages: "Gallery images",
    editAbout: "Edit About section",
    nameFr: "Name (French)",
    nameEn: "Name (English)",
    subtitleFr: "Subtitle (French)",
    subtitleEn: "Subtitle (English)",
    descriptionFr: "Description (French)",
    descriptionEn: "Description (English)",
    update: "Update",
    addSkill: "Add a skill",
    titleFr: "Title (French)",
    titleEn: "Title (English)",
    skillDescriptionFr: "Description (French)",
    skillDescriptionEn: "Description (English)",
    addButton: "Add",
    skills: "Skills",
    configuredSkills: "Configured skills",
    editContact: "Edit contact information",
    email: "Email",
    phone: "Phone",
    address: "Address",
    addSocial: "Add a social network",
    platform: "Platform name",
    platformPlaceholder: "ex: Instagram, Facebook, Website",
    url: "URL",
    urlPlaceholder: "https://...",
    icon: "Icon",
    social: "Social",
    configuredSocial: "Configured social networks",
    noSocial: "No social networks added",
    analytics: "Stats",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    imageUpdated: "Image updated",
    imageDeleted: "Image deleted",
    imageUploaded: "Image uploaded",
    error: "Error",
    success: "Success",
    fillAllFields: "Please fill all fields",
    confirmDelete: "Are you sure you want to delete this image?",
    aboutUpdated: "About updated",
    skillAdded: "Skill added",
    skillDeleted: "Skill deleted",
    contactUpdated: "Contact updated",
    socialAdded: "Social network added",
    socialDeleted: "Social network deleted",
    fullscreenZoom: "Fullscreen zoom",
    fullscreenZoomDesc: "Image will be displayed fullscreen in lightbox",
    imageDimensions: "Image dimensions",
    originalSize: "Original size",
    autoResize: "Auto-resize",
  },
};

const NOTIFIER_URL = import.meta.env.VITE_NOTIFIER_URL || "https://florianmtgn.fr/notify";
sessionStorage.setItem('session_start_ts', String(Date.now()));

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (key) => translations[language]?.[key] || key;

  const { data: images, refetch: refetchImages } = useGalleryImages();
  const { data: aboutData, refetch: refetchAbout } = useAboutContent();
  const { data: skills, refetch: refetchSkills } = useSkills();
  const { data: contactData, refetch: refetchContact } = useContactInfo();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ 
    category: "", 
    alt: "", 
    fullscreen_zoom: false,
    originalWidth: null,
    originalHeight: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ 
    category: "", 
    alt: "", 
    fullscreen_zoom: false,
    newFile: null,
    originalWidth: null,
    originalHeight: null,
  });
  const [uploading, setUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [aboutFormData, setAboutFormData] = useState({
    name_fr: "",
    name_en: "",
    subtitle_fr: "",
    subtitle_en: "",
    description_fr: "",
    description_en: "",
  });
  const [aboutLoading, setAboutLoading] = useState(false);

  const [skillFormData, setSkillFormData] = useState({
    title_fr: "",
    title_en: "",
    description_fr: "",
    description_en: "",
  });
  const [skillLoading, setSkillLoading] = useState(false);

  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState({
    platform: "",
    url: "",
    icon: "Globe",
  });
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
    fetchSocialLinks();
  }, [navigate]);

  useEffect(() => {
    if (aboutData) {
      setAboutFormData({
        name_fr: aboutData.name_fr || "",
        name_en: aboutData.name_en || "",
        subtitle_fr: aboutData.subtitle_fr || "",
        subtitle_en: aboutData.subtitle_en || "",
        description_fr: aboutData.description_fr || "",
        description_en: aboutData.description_en || "",
      });
    }
  }, [aboutData]);

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 1200, height: 1200 });
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fileTooLarge"),
      });
      return;
    }

    const dimensions = await getImageDimensions(file);
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
    }));

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const resizeImage = (file, maxWidth = 1200, maxHeight = 1200) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                width,
                height,
                file: new File([blob], file.name, { type: 'image/jpeg' })
              });
            },
            'image/jpeg',
            0.9
          );
        };
        
        img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!selectedFile || !formData.category || !formData.alt) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillAllFields"),
      });
      return;
    }

    setUploading(true);
    try {
      const dimensions = await getImageDimensions(selectedFile);

      let finalFile = selectedFile;
      let finalWidth = dimensions.width;
      let finalHeight = dimensions.height;

      if (
        formData.originalWidth &&
        formData.originalHeight &&
        (formData.originalWidth !== dimensions.width ||
          formData.originalHeight !== dimensions.height)
      ) {
        const resized = await resizeImage(
          selectedFile,
          formData.originalWidth,
          formData.originalHeight
        );
        finalFile = resized.file;
        finalWidth = resized.width;
        finalHeight = resized.height;
      }

      const { data, error } = await supabase.storage
        .from("gallery")
        .upload(`${Date.now()}-${finalFile.name}`, finalFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("gallery")
        .getPublicUrl(data.path);

      const { error: insertError } = await supabase.from("gallery_images").insert({
        image_url: publicData.publicUrl,
        category: formData.category,
        alt: formData.alt,
        width: finalWidth,
        height: finalHeight,
        fullscreen_zoom: formData.fullscreen_zoom || false,
      });

      if (insertError) throw insertError;

      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({
        category: "",
        alt: "",
        fullscreen_zoom: false,
        originalWidth: null,
        originalHeight: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      await refetchImages();
      toast({ title: t("imageUploaded") });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };


  const handleEditFileSelect = async (file, imageId) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fileTooLarge"),
      });
      return;
    }

    const dimensions = await getImageDimensions(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setEditData(prev => ({
        ...prev,
        newFile: file,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateImage = async (id) => {
    if (!editData.category || !editData.alt) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillAllFields"),
      });
      return;
    }

    setEditLoading(true);
    try {
      let updateData = {
        category: editData.category,
        alt: editData.alt,
        fullscreen_zoom: editData.fullscreen_zoom || false,
        width: editData.originalWidth || 1200,
        height: editData.originalHeight || 1200,
      };

      // --- Si un nouveau fichier est choisi ---
      if (editData.newFile) {
        const dimensions = await getImageDimensions(editData.newFile);
        let finalFile = editData.newFile;
        let finalWidth = dimensions.width;
        let finalHeight = dimensions.height;

        // Si l’utilisateur a modifié la taille manuellement, on redimensionne réellement
        if (
          (editData.originalWidth && editData.originalHeight) &&
          (editData.originalWidth !== dimensions.width ||
          editData.originalHeight !== dimensions.height)
        ) {
          const resized = await resizeImage(
            editData.newFile,
            editData.originalWidth,
            editData.originalHeight
          );
          finalFile = resized.file;
          finalWidth = resized.width;
          finalHeight = resized.height;
        }

        // Upload du fichier final (redimensionné ou non)
        const { data, error } = await supabase.storage
          .from("gallery")
          .upload(`${Date.now()}-${finalFile.name}`, finalFile);

        if (error) throw error;

        const { data: publicData } = supabase.storage
          .from("gallery")
          .getPublicUrl(data.path);

        updateData = {
          ...updateData,
          image_url: publicData.publicUrl,
          width: finalWidth,
          height: finalHeight,
        };
      }

      // --- Mise à jour en base ---
      const { error } = await supabase
        .from("gallery_images")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await refetchImages();
      toast({ title: t("imageUpdated") });
      setEditingId(null);
      setPreviewUrl(null);
      setEditData({
        category: "",
        alt: "",
        fullscreen_zoom: false,
        newFile: null,
        originalWidth: null,
        originalHeight: null,
      });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setEditLoading(false);
    }
  };


  const handleEditImage = (image) => {
    setEditingId(image.id);
    setEditData({ 
      category: image.category, 
      alt: image.alt,
      fullscreen_zoom: image.fullscreen_zoom || false,
      newFile: null,
      originalWidth: image.width,
      originalHeight: image.height,
    });
  };

  const handleDeleteImage = async (id, imageUrl) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (imageUrl) {
        const path = imageUrl.split('/').pop();
        await supabase.storage.from('gallery').remove([path]);
      }

      await refetchImages();
      toast({ title: t("imageDeleted") });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    }
  };

  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setAboutLoading(true);

    try {
      const { error } = await supabase
        .from("about_content")
        .update(aboutFormData)
        .eq("id", aboutData?.id);

      if (error) throw error;
      toast({ title: t("aboutUpdated") });
      await refetchAbout();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setAboutLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (
      !skillFormData.title_fr ||
      !skillFormData.title_en ||
      !skillFormData.description_fr ||
      !skillFormData.description_en
    ) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillAllFields"),
      });
      return;
    }

    setSkillLoading(true);
    try {
      const { error } = await supabase.from("skills").insert({
        ...skillFormData,
        order_index: skills?.length || 0,
      });

      if (error) throw error;
      toast({ title: t("skillAdded") });
      setSkillFormData({
        title_fr: "",
        title_en: "",
        description_fr: "",
        description_en: "",
      });
      await refetchSkills();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setSkillLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
      toast({ title: t("skillDeleted") });
      await refetchSkills();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setAboutLoading(true);

    const formDataObj = new FormData(e.currentTarget);
    try {
      const { error } = await supabase
        .from("contact_info")
        .update({
          email: formDataObj.get("email"),
          phone: formDataObj.get("phone"),
          address: formDataObj.get("address"),
        })
        .eq("id", contactData?.id);

      if (error) throw error;
      toast({ title: t("contactUpdated") });
      await refetchContact();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setAboutLoading(false);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    if (!newSocialLink.platform || !newSocialLink.url) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillAllFields"),
      });
      return;
    }

    setSocialLoading(true);
    try {
      const { error } = await supabase.from("social_links").insert({
        platform: newSocialLink.platform,
        url: newSocialLink.url,
        icon: newSocialLink.icon,
        order_index: socialLinks.length || 0,
      });

      if (error) throw error;
      toast({ title: t("socialAdded") });
      setNewSocialLink({ platform: "", url: "", icon: "Globe" });
      await fetchSocialLinks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleDeleteSocialLink = async (id) => {
    try {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
      toast({ title: t("socialDeleted") });
      await fetchSocialLinks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message,
      });
    }
  };

  const { currentIp } = useAdminAccess();

  const handleLogout = async () => {
    const tsStart = Number(sessionStorage.getItem('session_start_ts')) || null;
    const durationMs = tsStart ? (Date.now() - tsStart) : undefined;
    const email = supabase.auth.getUser?.email || 'unknown';

    await fetch(NOTIFIER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "signout",
        email,
        ip: currentIp || null,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        durationMs,
      }),
    });

    await supabase.auth.signOut();
    sessionStorage.removeItem('session_start_ts');
    navigate('/');
  };

  const categories = Array.from(
    new Set(images?.map((img) => img.category) || [])
  );

  const iconMap = {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Globe,
    Camera,
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || Globe;
    return <Icon className="w-5 h-5" />;
  };

  const renderCategoryButtons = (value, onChange, availableCategories) => (
    <>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("categoryPlaceholder")}
        className="mt-2"
      />
      {availableCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold">{t("admin")}</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            {t("logout")}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Tabs defaultValue="gallery" className="w-full">
          <div className="mb-6 md:mb-8 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid md:grid-cols-6 w-max md:w-full min-w-full">
              <TabsTrigger value="gallery" className="flex items-center gap-2 whitespace-nowrap">
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">{t("gallery")}</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2 whitespace-nowrap">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2 whitespace-nowrap">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">{t("skills")}</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 whitespace-nowrap">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2 whitespace-nowrap">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("social")}</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("analytics")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gallery" className="space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-lg border border-border"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
                {t("uploadNew")}
              </h2>

              <form onSubmit={handleUploadImage} className="space-y-4 md:space-y-6">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 cursor-pointer hover:border-accent transition-colors"
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
                    <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 text-muted-foreground" />
                    <p className="text-xs md:text-sm font-medium mb-1">
                      {selectedFile ? selectedFile.name : t("selectImage")}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("maxSize")}</p>
                    {formData.originalWidth && formData.originalHeight && (
                      <p className="text-xs text-accent mt-2">
                        {t("originalSize")}: {formData.originalWidth} × {formData.originalHeight}px
                        <br />
                        {t("autoResize")}: 1200 × 1200px max
                      </p>
                    )}
                  </div>
                </div>

                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-40 md:h-48 rounded-lg overflow-hidden bg-muted"
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
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm">
                      {t("category")}
                    </Label>
                    {renderCategoryButtons(
                      formData.category,
                      (val) => setFormData({ ...formData, category: val }),
                      categories
                    )}
                  </div>

                  <div>
                    <Label htmlFor="alt" className="text-sm">
                      {t("altText")}
                    </Label>
                    <Input
                      id="alt"
                      placeholder={t("altPlaceholder")}
                      value={formData.alt}
                      onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  {selectedFile && formData.originalWidth && formData.originalHeight && (
                    <div>
                      <Label className="text-sm mb-2 block">{t("imageDimensions")}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Largeur (px)</Label>
                          <Input
                            type="number"
                            min="100"
                            max="3000"
                            value={formData.originalWidth}
                            onChange={(e) => {
                              const newWidth = parseInt(e.target.value) || 1200;
                              setFormData({ ...formData, originalWidth: newWidth });
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Hauteur (px)</Label>
                          <Input
                            type="number"
                            min="100"
                            max="3000"
                            value={formData.originalHeight}
                            onChange={(e) => {
                              const newHeight = parseInt(e.target.value) || 1200;
                              setFormData({ ...formData, originalHeight: newHeight });
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Ajustez les dimensions d'affichage (l'image sera redimensionnée à 1200px max)
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <input
                      type="checkbox"
                      id="fullscreen_zoom"
                      checked={formData.fullscreen_zoom}
                      onChange={(e) => setFormData({ ...formData, fullscreen_zoom: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label htmlFor="fullscreen_zoom" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        {t("fullscreenZoom")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("fullscreenZoomDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full"
                >
                  {uploading ? t("uploading") : t("uploadButton")}
                </Button>
              </form>
            </motion.div>

            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t("galleryImages")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {images?.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      {editingId === image.id ? (
                        <div className="bg-card p-4 space-y-3 max-h-[90vh] overflow-y-auto">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Aperçu</Label>
                            <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
                              <img
                                src={previewUrl || image.image_url}
                                alt={image.alt}
                                className="max-w-full max-h-64 object-contain"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {editData.originalWidth || image.width || 1200} × {editData.originalHeight || image.height || 1200} px
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">{t("uploadNew")}</Label>
                            <div
                              className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-accent transition-colors"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    await handleEditFileSelect(file, image.id);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <div className="text-center text-sm">
                                <Upload className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xs font-medium">
                                  {editData.newFile ? editData.newFile.name : t("selectImage")}
                                </p>
                                {editData.newFile && editData.originalWidth && (
                                  <p className="text-xs text-accent mt-1">
                                    {t("originalSize")}: {editData.originalWidth} × {editData.originalHeight}px
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">{t("category")}</Label>
                              {renderCategoryButtons(
                                editData.category,
                                (val) => setEditData({ ...editData, category: val }),
                                categories
                              )}
                            </div>

                            <div>
                              <Label className="text-xs">{t("altText")}</Label>
                              <Input
                                value={editData.alt}
                                onChange={(e) =>
                                  setEditData({ ...editData, alt: e.target.value })
                                }
                                className="mt-1 text-sm"
                              />
                            </div>

                            <div>
                              <Label className="text-xs mb-2 block">{t("imageDimensions")}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">Largeur (px)</Label>
                                  <Input
                                    type="number"
                                    min="100"
                                    max="3000"
                                    value={editData.originalWidth || image.width || 1200}
                                    onChange={(e) => {
                                      const newWidth = parseInt(e.target.value) || 1200;
                                      setEditData({ ...editData, originalWidth: newWidth });
                                    }}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">Hauteur (px)</Label>
                                  <Input
                                    type="number"
                                    min="100"
                                    max="3000"
                                    value={editData.originalHeight || image.height || 1200}
                                    onChange={(e) => {
                                      const newHeight = parseInt(e.target.value) || 1200;
                                      setEditData({ ...editData, originalHeight: newHeight });
                                    }}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                💡 Modifiez les dimensions sans changer l'image
                              </p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <input
                                type="checkbox"
                                id="edit_fullscreen_zoom"
                                checked={editData.fullscreen_zoom}
                                onChange={(e) => setEditData({ ...editData, fullscreen_zoom: e.target.checked })}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1">
                                <Label htmlFor="edit_fullscreen_zoom" className="text-xs font-medium cursor-pointer flex items-center gap-2">
                                  <Maximize2 className="w-4 h-4" />
                                  {t("fullscreenZoom")}
                                </Label>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {t("fullscreenZoomDesc")}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateImage(image.id)}
                                disabled={editLoading}
                                size="sm"
                                className="flex-1"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {t("save")}
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingId(null);
                                  setPreviewUrl(null);
                                  setEditData({ 
                                    category: "", 
                                    alt: "", 
                                    fullscreen_zoom: false,
                                    newFile: null,
                                    originalWidth: null,
                                    originalHeight: null,
                                  });
                                }}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                {t("cancel")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative bg-card">
                          <img
                            src={image.image_url}
                            alt={image.alt}
                            className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                            <div className="w-full text-white text-sm space-y-1">
                              <p className="font-medium truncate">{image.alt}</p>
                              <p className="text-xs opacity-80">{image.category}</p>
                              <div className="flex items-center gap-2 text-xs opacity-60">
                                {image.width && image.height && (
                                  <span>{image.width}×{image.height}px</span>
                                )}
                                {image.fullscreen_zoom && (
                                  <span className="flex items-center gap-1 text-accent">
                                    <Maximize2 className="w-3 h-3" />
                                    Zoom
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleEditImage(image)}
                              className="p-2 bg-blue-500 text-white rounded-full hover:scale-110 transition-transform"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteImage(image.id, image.image_url)
                              }
                              disabled={uploading}
                              className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-lg border border-border"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t("editAbout")}
              </h2>
              <form onSubmit={handleUpdateAbout} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name_fr" className="text-sm">
                      {t("nameFr")}
                    </Label>
                    <Input
                      id="name_fr"
                      value={aboutFormData.name_fr}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          name_fr: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_en" className="text-sm">
                      {t("nameEn")}
                    </Label>
                    <Input
                      id="name_en"
                      value={aboutFormData.name_en}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          name_en: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="subtitle_fr" className="text-sm">
                      {t("subtitleFr")}
                    </Label>
                    <Input
                      id="subtitle_fr"
                      value={aboutFormData.subtitle_fr}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          subtitle_fr: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle_en" className="text-sm">
                      {t("subtitleEn")}
                    </Label>
                    <Input
                      id="subtitle_en"
                      value={aboutFormData.subtitle_en}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          subtitle_en: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="description_fr" className="text-sm">
                      {t("descriptionFr")}
                    </Label>
                    <Textarea
                      id="description_fr"
                      value={aboutFormData.description_fr}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          description_fr: e.target.value,
                        })
                      }
                      required
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_en" className="text-sm">
                      {t("descriptionEn")}
                    </Label>
                    <Textarea
                      id="description_en"
                      value={aboutFormData.description_en}
                      onChange={(e) =>
                        setAboutFormData({
                          ...aboutFormData,
                          description_en: e.target.value,
                        })
                      }
                      required
                      rows={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={aboutLoading}
                  className="w-full md:w-auto"
                >
                  {t("update")}
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-lg border border-border"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t("addSkill")}
              </h2>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="skill_title_fr" className="text-sm">
                      {t("titleFr")}
                    </Label>
                    <Input
                      id="skill_title_fr"
                      value={skillFormData.title_fr}
                      onChange={(e) =>
                        setSkillFormData({
                          ...skillFormData,
                          title_fr: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill_title_en" className="text-sm">
                      {t("titleEn")}
                    </Label>
                    <Input
                      id="skill_title_en"
                      value={skillFormData.title_en}
                      onChange={(e) =>
                        setSkillFormData({
                          ...skillFormData,
                          title_en: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="skill_description_fr" className="text-sm">
                      {t("skillDescriptionFr")}
                    </Label>
                    <Textarea
                      id="skill_description_fr"
                      value={skillFormData.description_fr}
                      onChange={(e) =>
                        setSkillFormData({
                          ...skillFormData,
                          description_fr: e.target.value,
                        })
                      }
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill_description_en" className="text-sm">
                      {t("skillDescriptionEn")}
                    </Label>
                    <Textarea
                      id="skill_description_en"
                      value={skillFormData.description_en}
                      onChange={(e) =>
                        setSkillFormData({
                          ...skillFormData,
                          description_en: e.target.value,
                        })
                      }
                      required
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={skillLoading}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addButton")}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold">
                {t("configuredSkills")}
              </h3>
              {skills?.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-4 md:p-6 rounded-lg border border-border"
                >
                  <div className="grid gap-4 md:gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        FRANÇAIS
                      </p>
                      <h3 className="font-semibold mb-2">{skill.title_fr}</h3>
                      <p className="text-muted-foreground text-sm">
                        {skill.description_fr}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        ENGLISH
                      </p>
                      <h3 className="font-semibold mb-2">{skill.title_en}</h3>
                      <p className="text-muted-foreground text-sm">
                        {skill.description_en}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteSkill(skill.id)}
                    variant="destructive"
                    size="sm"
                    className="mt-4 w-full md:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("delete")}
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-lg border border-border"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t("editContact")}
              </h2>
              <form onSubmit={handleUpdateContact} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={contactData?.email || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">
                    {t("phone")}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={contactData?.phone || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm">
                    {t("address")}
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={contactData?.address || ""}
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={aboutLoading}
                  className="w-full md:w-auto"
                >
                  {t("update")}
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-lg border border-border"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t("addSocial")}
              </h2>
              <form onSubmit={handleAddSocialLink} className="space-y-4">
                <div>
                  <Label htmlFor="platform" className="text-sm">
                    {t("platform")}
                  </Label>
                  <Input
                    id="platform"
                    placeholder={t("platformPlaceholder")}
                    value={newSocialLink.platform}
                    onChange={(e) =>
                      setNewSocialLink({
                        ...newSocialLink,
                        platform: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url" className="text-sm">
                    {t("url")}
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder={t("urlPlaceholder")}
                    value={newSocialLink.url}
                    onChange={(e) =>
                      setNewSocialLink({
                        ...newSocialLink,
                        url: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon" className="text-sm">
                    {t("icon")}
                  </Label>
                  <select
                    id="icon"
                    value={newSocialLink.icon}
                    onChange={(e) =>
                      setNewSocialLink({
                        ...newSocialLink,
                        icon: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Linkedin">LinkedIn</option>
                    <option value="Youtube">YouTube</option>
                    <option value="Camera">
                      {language === "fr" ? "Appareil Photo" : "Camera"}
                    </option>
                    <option value="Globe">
                      {language === "fr" ? "Site Web" : "Website"}
                    </option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={socialLoading}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addButton")}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold">
                {t("configuredSocial")}
              </h3>
              {socialLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t("noSocial")}</p>
              ) : (
                socialLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card p-4 md:p-6 rounded-lg border border-border"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="p-2 md:p-3 bg-accent/10 rounded-full flex-shrink-0">
                          {getIcon(link.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm md:text-base truncate">
                            {link.platform}
                          </h4>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm text-muted-foreground hover:text-accent transition-colors break-all"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteSocialLink(link.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-0 md:mr-2" />
                        <span className="sm:hidden md:inline">{t("delete")}</span>
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;