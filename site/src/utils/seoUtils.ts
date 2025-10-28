import { supabase } from '@/integrations/supabase/client';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = window.location.origin;
  const urls: SitemapURL[] = [];

  urls.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0,
  });

  const staticPages = [
    { path: '/privacy', changefreq: 'monthly' as const, priority: 0.3 },
    { path: '/terms', changefreq: 'monthly' as const, priority: 0.3 },
    { path: '/legal', changefreq: 'monthly' as const, priority: 0.3 },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    projects?.forEach(project => {
      urls.push({
        loc: `${baseUrl}/project/${project.slug}`,
        lastmod: project.updated_at,
        changefreq: 'weekly',
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error('Erreur génération sitemap projets:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

export const downloadSitemap = async () => {
  try {
    const xml = await generateSitemap();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement sitemap:', error);
  }
};

export const generateOpenGraphTags = (data: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  locale?: string;
  siteName?: string;
}) => {
  const {
    title,
    description,
    image,
    url = window.location.href,
    type = 'website',
    locale = 'fr_FR',
    siteName = 'Portfolio',
  } = data;

  const tags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: locale },
    { property: 'og:site_name', content: siteName },
  ];

  if (image) {
    tags.push(
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: title }
    );
  }

  tags.push(
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description }
  );

  if (image) {
    tags.push({ name: 'twitter:image', content: image });
  }

  return tags;
};

export const applyOpenGraphTags = (tags: Array<{ property?: string; name?: string; content: string }>) => {
  document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(meta => {
    meta.remove();
  });

  tags.forEach(tag => {
    const meta = document.createElement('meta');
    if (tag.property) meta.setAttribute('property', tag.property);
    if (tag.name) meta.setAttribute('name', tag.name);
    meta.setAttribute('content', tag.content);
    document.head.appendChild(meta);
  });
};

import { useEffect } from 'react';

export const useSEO = (data: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
}) => {
  useEffect(() => {
    const {
      title = 'Portfolio',
      description = 'Portfolio photographe professionnel',
      image,
      keywords = [],
    } = data;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    if (keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    }

    const ogTags = generateOpenGraphTags({ title, description, image });
    applyOpenGraphTags(ogTags);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [data]);
};

export const generateJSONLD = (data: {
  type: 'Person' | 'Organization' | 'Article' | 'ImageGallery';
  name: string;
  description?: string;
  image?: string;
  url?: string;
  email?: string;
  jobTitle?: string;
  sameAs?: string[];
  images?: string[];
  datePublished?: string;
}) => {
  const baseUrl = window.location.origin;
  
  const jsonLD: any = {
    '@context': 'https://schema.org',
    '@type': data.type,
    name: data.name,
    url: data.url || baseUrl,
  };

  if (data.description) jsonLD.description = data.description;
  if (data.image) jsonLD.image = data.image;
  if (data.email) jsonLD.email = data.email;
  if (data.jobTitle) jsonLD.jobTitle = data.jobTitle;
  if (data.sameAs) jsonLD.sameAs = data.sameAs;
  if (data.datePublished) jsonLD.datePublished = data.datePublished;

  if (data.type === 'ImageGallery' && data.images) {
    jsonLD.associatedMedia = data.images.map(img => ({
      '@type': 'ImageObject',
      contentUrl: img,
    }));
  }

  return jsonLD;
};

export const applyJSONLD = (jsonLD: any) => {
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLD, null, 2);
  document.head.appendChild(script);
};

export const generateRobotsTxt = (config: {
  allowAll?: boolean;
  disallowPaths?: string[];
  sitemapUrl?: string;
}) => {
  const { 
    allowAll = true, 
    disallowPaths = ['/admin', '/auth'], 
    sitemapUrl = `${window.location.origin}/sitemap.xml` 
  } = config;

  let robotsTxt = 'User-agent: *\n';

  if (allowAll) {
    robotsTxt += 'Allow: /\n';
  }

  disallowPaths.forEach(path => {
    robotsTxt += `Disallow: ${path}\n`;
  });

  robotsTxt += `\nSitemap: ${sitemapUrl}\n`;

  return robotsTxt;
};

export const downloadRobotsTxt = (config?: Parameters<typeof generateRobotsTxt>[0]) => {
  const robotsTxt = generateRobotsTxt(config || {});
  const blob = new Blob([robotsTxt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'robots.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const optimizeImageForOG = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      const targetWidth = 1200;
      const targetHeight = 630;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const sourceRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (sourceRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

export const extractImageMetadata = async (file: File) => {
  return new Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    aspectRatio: number;
    dominantColors?: string[];
  }>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colorMap = new Map<string, number>();
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = Math.floor(imageData.data[i] / 50) * 50;
          const g = Math.floor(imageData.data[i + 1] / 50) * 50;
          const b = Math.floor(imageData.data[i + 2] / 50) * 50;
          const color = `rgb(${r}, ${g}, ${b})`;
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }

        const dominantColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);

        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          aspectRatio: img.width / img.height,
          dominantColors,
        });
      } else {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          aspectRatio: img.width / img.height,
        });
      }

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: 0,
        height: 0,
        size: file.size,
        type: file.type,
        aspectRatio: 1,
      });
    };

    img.src = url;
  });
};

export const generateAltText = async (imageUrl: string): Promise<string> => {
  try {
    const filename = imageUrl.split('/').pop() || '';
    const category = filename.split('-')[0] || 'image';
    const templates = [
      `Photo de ${category}`,
      `Image représentant ${category}`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} - photo professionnelle`,
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  } catch (error) {
    return 'Image';
  }
};