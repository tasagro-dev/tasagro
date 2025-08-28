-- Extender tabla propiedades con nuevos campos
ALTER TABLE public.propiedades 
ADD COLUMN calidad_suelo text,
ADD COLUMN acceso_agua boolean DEFAULT false,
ADD COLUMN sistema_riego text,
ADD COLUMN salinidad_suelo integer CHECK (salinidad_suelo >= 0 AND salinidad_suelo <= 100),
ADD COLUMN rocas_accidentes text,
ADD COLUMN uso_actual text CHECK (uso_actual IN ('agricola', 'ganadero', 'mixto', 'forestal', 'sin_uso')),
ADD COLUMN conectividad_vial boolean DEFAULT false,
ADD COLUMN conectividad_vial_descripcion text,
ADD COLUMN distancia_acopio numeric,
ADD COLUMN electricidad text CHECK (electricidad IN ('trifasica', 'monofasica', 'sin_acceso')),
ADD COLUMN agua_potable text CHECK (agua_potable IN ('red', 'perforacion', 'sin_acceso')),
ADD COLUMN gas text CHECK (gas IN ('red', 'envasado', 'sin_acceso')),
ADD COLUMN cambio_cultivo boolean DEFAULT false,
ADD COLUMN cambio_cultivo_descripcion text,
ADD COLUMN indice_productividad numeric CHECK (indice_productividad >= 0 AND indice_productividad <= 100),
ADD COLUMN energia_renovable boolean DEFAULT false,
ADD COLUMN titularidad_perfecta boolean DEFAULT false,
ADD COLUMN indivision_hereditaria boolean DEFAULT false,
ADD COLUMN hipoteca_gravamenes boolean DEFAULT false,
ADD COLUMN hipoteca_gravamenes_detalle text,
ADD COLUMN restricciones_uso text,
ADD COLUMN regulaciones_ambientales text,
ADD COLUMN zonificacion text,
ADD COLUMN derechos_terceros text,
ADD COLUMN cargas_afectaciones text,
ADD COLUMN impuestos_al_dia boolean DEFAULT false;

-- Crear catálogos de opciones
CREATE TABLE public.cultivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.instalaciones_ganaderia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.instalaciones_agricultura (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.tipos_alambrado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.infraestructura_hidrica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.servidumbres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.conectividad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Tablas de relación muchos a muchos
CREATE TABLE public.propiedad_cultivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  cultivo_id uuid NOT NULL REFERENCES cultivos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, cultivo_id)
);

CREATE TABLE public.propiedad_instalaciones_ganaderia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  instalacion_id uuid NOT NULL REFERENCES instalaciones_ganaderia(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, instalacion_id)
);

CREATE TABLE public.propiedad_instalaciones_agricultura (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  instalacion_id uuid NOT NULL REFERENCES instalaciones_agricultura(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, instalacion_id)
);

CREATE TABLE public.propiedad_alambrados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  tipo_alambrado_id uuid NOT NULL REFERENCES tipos_alambrado(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, tipo_alambrado_id)
);

CREATE TABLE public.propiedad_infraestructura_hidrica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  infraestructura_id uuid NOT NULL REFERENCES infraestructura_hidrica(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, infraestructura_id)
);

CREATE TABLE public.propiedad_servidumbres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  servidumbre_id uuid NOT NULL REFERENCES servidumbres(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, servidumbre_id)
);

CREATE TABLE public.propiedad_conectividad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  conectividad_id uuid NOT NULL REFERENCES conectividad(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(propiedad_id, conectividad_id)
);

-- Insertar datos iniciales en los catálogos
INSERT INTO public.cultivos (nombre) VALUES
('Soja'), ('Maíz'), ('Trigo'), ('Girasol'), ('Sorgo'), ('Cebada'), ('Avena'), ('Centeno'),
('Pasturas perennes'), ('Pasturas anuales'), ('Alfalfa'), ('Moha'), ('Raigrás'),
('Forestales - Eucalipto'), ('Forestales - Pino'), ('Forestales - Sauce'),
('Hortalizas'), ('Frutales'), ('Citricos'), ('Vid');

INSERT INTO public.instalaciones_ganaderia (nombre) VALUES
('Corrales'), ('Mangas'), ('Cargadores'), ('Bebederos'), ('Feedlot'), 
('Lechería'), ('Bretes'), ('Báscula'), ('Aguadas naturales'), ('Aguadas artificiales');

INSERT INTO public.instalaciones_agricultura (nombre) VALUES
('Silos'), ('Galpones de almacenamiento'), ('Galpones para maquinaria'), ('Tinglados'),
('Sistemas de riego por aspersión'), ('Sistemas de riego por goteo'), ('Sistemas de pivot'),
('Drenaje'), ('Secaderos'), ('Báscula para granos');

INSERT INTO public.tipos_alambrado (nombre) VALUES
('Perimetral convencional'), ('Perimetral eléctrico'), ('Divisiones internas convencionales'), 
('Divisiones internas eléctricas'), ('Boyeros eléctricos');

INSERT INTO public.infraestructura_hidrica (nombre) VALUES
('Aguadas naturales'), ('Represas'), ('Molinos'), ('Bombas'), ('Perforaciones'), 
('Tanques australianos'), ('Canales'), ('Diques');

INSERT INTO public.servidumbres (nombre) VALUES
('Paso'), ('Acueducto'), ('Líneas eléctricas'), ('Gasoductos'), ('Oleoductos'), 
('Caminos públicos'), ('Ferrocarriles');

INSERT INTO public.conectividad (nombre) VALUES
('Telefonía móvil'), ('Internet banda ancha'), ('Internet satelital'), ('Telefonía fija');

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.cultivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalaciones_ganaderia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalaciones_agricultura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_alambrado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infraestructura_hidrica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servidumbres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conectividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_cultivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_instalaciones_ganaderia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_instalaciones_agricultura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_alambrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_infraestructura_hidrica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_servidumbres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_conectividad ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para catálogos (visibles para todos, solo admin puede modificar)
CREATE POLICY "Catálogos visibles para todos" ON public.cultivos FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.instalaciones_ganaderia FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.instalaciones_agricultura FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.tipos_alambrado FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.infraestructura_hidrica FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.servidumbres FOR SELECT USING (true);
CREATE POLICY "Catálogos visibles para todos" ON public.conectividad FOR SELECT USING (true);

-- Políticas RLS para relaciones (usuarios pueden gestionar relaciones de sus propiedades)
CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_cultivos 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_cultivos.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_cultivos 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_cultivos.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_cultivos.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

-- Replicar políticas similares para todas las tablas de relación
CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_instalaciones_ganaderia 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_ganaderia.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_instalaciones_ganaderia 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_ganaderia.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_ganaderia.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_instalaciones_agricultura 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_agricultura.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_instalaciones_agricultura 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_agricultura.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_instalaciones_agricultura.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_alambrados 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_alambrados.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_alambrados 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_alambrados.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_alambrados.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_infraestructura_hidrica 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_infraestructura_hidrica.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_infraestructura_hidrica 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_infraestructura_hidrica.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_infraestructura_hidrica.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_servidumbres 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_servidumbres.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_servidumbres 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_servidumbres.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_servidumbres.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver relaciones de sus propiedades publicadas" ON public.propiedad_conectividad 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_conectividad.propiedad_id 
    AND (p.publicada = true OR p.usuario_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden gestionar relaciones de sus propiedades" ON public.propiedad_conectividad 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_conectividad.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM propiedades p 
    WHERE p.id = propiedad_conectividad.propiedad_id 
    AND p.usuario_id = auth.uid()
  )
);