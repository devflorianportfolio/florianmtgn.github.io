-- Create table for gallery images
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for about section content
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for skills
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for contact info
CREATE TABLE public.contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Gallery images are viewable by everyone" 
ON public.gallery_images 
FOR SELECT 
USING (true);

CREATE POLICY "About content is viewable by everyone" 
ON public.about_content 
FOR SELECT 
USING (true);

CREATE POLICY "Skills are viewable by everyone" 
ON public.skills 
FOR SELECT 
USING (true);

CREATE POLICY "Contact info is viewable by everyone" 
ON public.contact_info 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage content
CREATE POLICY "Authenticated users can insert gallery images" 
ON public.gallery_images 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update gallery images" 
ON public.gallery_images 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete gallery images" 
ON public.gallery_images 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update about content" 
ON public.about_content 
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage skills" 
ON public.skills 
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact info" 
ON public.contact_info 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Insert default data from portfolio.json
INSERT INTO public.about_content (name, subtitle, description)
VALUES (
  'Jean Dupont',
  'Photographe professionnel depuis 15 ans',
  'Spécialisé dans la photographie de portrait et de paysage, je capture les moments uniques de votre vie avec passion et créativité.'
);

INSERT INTO public.skills (title, description, order_index)
VALUES 
  ('Portrait', 'Mise en valeur de votre personnalité à travers des portraits artistiques et naturels.', 0),
  ('Événementiel', 'Capturer les moments précieux de vos événements avec discrétion et professionnalisme.', 1),
  ('Paysage', 'Immortaliser la beauté de la nature dans des compositions uniques.', 2);

INSERT INTO public.contact_info (email, phone, address)
VALUES ('contact@example.com', '+33 6 12 34 56 78', 'Paris, France');

UPDATE about_content 
SET 
  name_fr = name,
  subtitle_fr = subtitle,
  description_fr = description
WHERE name_fr IS NULL;

UPDATE skills 
SET 
  title_fr = title,
  description_fr = description
WHERE title_fr IS NULL;