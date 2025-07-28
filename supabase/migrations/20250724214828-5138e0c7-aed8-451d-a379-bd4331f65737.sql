-- Crear tabla de ubicaciones
CREATE TABLE public.ubicaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provincia TEXT NOT NULL,
  localidad TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índice para búsquedas más eficientes
CREATE INDEX idx_ubicaciones_provincia_localidad ON public.ubicaciones(provincia, localidad);

-- Crear tabla de propiedades (campos en venta)
CREATE TABLE public.propiedades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  foto_destacada TEXT,
  cantidad_hectareas NUMERIC NOT NULL,
  servicios TEXT[],
  tipo_campo TEXT NOT NULL,
  ubicacion_id UUID REFERENCES public.ubicaciones(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publicada BOOLEAN NOT NULL DEFAULT false,
  precio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejor performance en búsquedas
CREATE INDEX idx_propiedades_usuario_id ON public.propiedades(usuario_id);
CREATE INDEX idx_propiedades_ubicacion_id ON public.propiedades(ubicacion_id);
CREATE INDEX idx_propiedades_tipo_campo ON public.propiedades(tipo_campo);
CREATE INDEX idx_propiedades_publicada ON public.propiedades(publicada);
CREATE INDEX idx_propiedades_cantidad_hectareas ON public.propiedades(cantidad_hectareas);

-- Actualizar tabla profiles para incluir tipo_usuario
ALTER TABLE public.profiles 
ADD COLUMN tipo_usuario TEXT DEFAULT 'vendedor' CHECK (tipo_usuario IN ('admin', 'vendedor'));

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ubicaciones (lectura pública)
CREATE POLICY "Ubicaciones son visibles para todos" 
ON public.ubicaciones 
FOR SELECT 
USING (true);

CREATE POLICY "Solo admins pueden crear ubicaciones" 
ON public.ubicaciones 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND tipo_usuario = 'admin'
  )
);

-- Políticas RLS para propiedades
CREATE POLICY "Propiedades publicadas son visibles para todos" 
ON public.propiedades 
FOR SELECT 
USING (publicada = true OR usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus propias propiedades" 
ON public.propiedades 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias propiedades" 
ON public.propiedades 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias propiedades" 
ON public.propiedades 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Crear bucket de storage para imágenes de propiedades
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para imágenes
CREATE POLICY "Imágenes son visibles públicamente" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Usuarios autenticados pueden subir imágenes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden actualizar sus propias imágenes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden eliminar sus propias imágenes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_ubicaciones_updated_at
  BEFORE UPDATE ON public.ubicaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propiedades_updated_at
  BEFORE UPDATE ON public.propiedades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunas ubicaciones de ejemplo
INSERT INTO public.ubicaciones (provincia, localidad) VALUES
('Buenos Aires', 'Pergamino'),
('Buenos Aires', 'Junín'),
('Buenos Aires', 'Balcarce'),
('Santa Fe', 'Rosario'),
('Santa Fe', 'Venado Tuerto'),
('Córdoba', 'Río Cuarto'),
('Córdoba', 'Villa María'),
('Entre Ríos', 'Gualeguaychú'),
('La Pampa', 'Santa Rosa');