-- Create table for multiple images per property
CREATE TABLE IF NOT EXISTS public.propiedad_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID NOT NULL,
  imagen_url TEXT NOT NULL,
  es_destacada BOOLEAN NOT NULL DEFAULT false,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT propiedad_imagenes_propiedad_id_fkey FOREIGN KEY (propiedad_id)
    REFERENCES public.propiedades(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.propiedad_imagenes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view images of published properties"
ON public.propiedad_imagenes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades p
    WHERE p.id = propiedad_imagenes.propiedad_id AND p.publicada = true
  )
);

CREATE POLICY "Users can insert images for their own properties"
ON public.propiedad_imagenes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.propiedades p
    WHERE p.id = propiedad_imagenes.propiedad_id AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own images"
ON public.propiedad_imagenes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades p
    WHERE p.id = propiedad_imagenes.propiedad_id AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own images"
ON public.propiedad_imagenes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.propiedades p
    WHERE p.id = propiedad_imagenes.propiedad_id AND p.usuario_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_propiedad_imagenes_propiedad_id ON public.propiedad_imagenes (propiedad_id);
CREATE INDEX IF NOT EXISTS idx_propiedad_imagenes_propiedad_orden ON public.propiedad_imagenes (propiedad_id, orden);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_propiedad_imagenes_updated_at ON public.propiedad_imagenes;
CREATE TRIGGER update_propiedad_imagenes_updated_at
BEFORE UPDATE ON public.propiedad_imagenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();