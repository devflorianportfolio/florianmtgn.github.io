-- Add admin_ips table for IP whitelist
CREATE TABLE IF NOT EXISTS public.admin_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_ips ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view admin IPs
CREATE POLICY "Authenticated users can view admin IPs"
ON public.admin_ips
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can manage admin IPs
CREATE POLICY "Authenticated users can manage admin IPs"
ON public.admin_ips
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Update skills table to allow full CRUD
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS skills_pkey;
ALTER TABLE public.skills ADD PRIMARY KEY (id);

-- Update contact_info table structure (already exists, just ensure it's correct)
ALTER TABLE public.contact_info 
ALTER COLUMN email DROP NOT NULL;

-- Insert default admin IP (localhost for development)
INSERT INTO public.admin_ips (ip_address, description) 
VALUES ('127.0.0.1', 'Localhost - Development')
ON CONFLICT (ip_address) DO NOTHING;

-- Permet à tout le monde de lire la table admin_ips (lecture seule)
CREATE POLICY "Allow public read access to admin_ips"
ON admin_ips
FOR SELECT
TO public
USING (true);

INSERT INTO public.admin_ips (ip_address, description) 
VALUES ('000.000.000.000', 'Florian Owner')
ON CONFLICT (ip_address) DO NOTHING;