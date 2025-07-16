
-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Create storage policies for property images
CREATE POLICY "Users can upload their own property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own property images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Drop existing valuations table if it exists and recreate with new structure
DROP TABLE IF EXISTS public.valuations;

-- Create tasaciones table with the specified fields
CREATE TABLE public.tasaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Información de la propiedad
  nombre_propiedad TEXT,
  provincia TEXT NOT NULL,
  partido TEXT NOT NULL,
  localidad TEXT NOT NULL,
  hectareas DECIMAL NOT NULL,
  coordenadas TEXT,
  
  -- Características del campo
  tipo_campo TEXT NOT NULL CHECK (tipo_campo IN ('agrícola', 'ganadero', 'mixto', 'forestal')),
  tipo_suelo TEXT,
  mejoras TEXT[], -- Array of improvements
  accesibilidad TEXT NOT NULL CHECK (accesibilidad IN ('fácil', 'media', 'difícil')),
  servicios TEXT[], -- Array of services
  
  -- Multimedia
  imagenes TEXT[], -- Array of image URLs
  
  -- Cálculo automático
  valor_estimado DECIMAL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.tasaciones ENABLE ROW LEVEL SECURITY;

-- Create policies for tasaciones
CREATE POLICY "Users can view their own tasaciones" 
  ON public.tasaciones 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasaciones" 
  ON public.tasaciones 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasaciones" 
  ON public.tasaciones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasaciones" 
  ON public.tasaciones 
  FOR DELETE 
  USING (auth.uid() = user_id);
