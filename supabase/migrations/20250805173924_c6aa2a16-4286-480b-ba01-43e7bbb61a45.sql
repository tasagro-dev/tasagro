-- Create table for storing multiple images per property
CREATE TABLE public.propiedad_imagenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  propiedad_id UUID NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  imagen_url TEXT NOT NULL,
  es_destacada BOOLEAN NOT NULL DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.propiedad_imagenes ENABLE ROW LEVEL SECURITY;

-- Create policies for propiedad_imagenes
CREATE POLICY "Usuarios pueden ver imágenes de propiedades publicadas" 
ON public.propiedad_imagenes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades 
    WHERE propiedades.id = propiedad_imagenes.propiedad_id 
    AND (propiedades.publicada = true OR propiedades.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden crear imágenes de sus propiedades" 
ON public.propiedad_imagenes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.propiedades 
    WHERE propiedades.id = propiedad_imagenes.propiedad_id 
    AND propiedades.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden actualizar imágenes de sus propiedades" 
ON public.propiedad_imagenes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades 
    WHERE propiedades.id = propiedad_imagenes.propiedad_id 
    AND propiedades.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden eliminar imágenes de sus propiedades" 
ON public.propiedad_imagenes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades 
    WHERE propiedades.id = propiedad_imagenes.propiedad_id 
    AND propiedades.usuario_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_propiedad_imagenes_updated_at
BEFORE UPDATE ON public.propiedad_imagenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();