
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_usuario TEXT NOT NULL DEFAULT 'usuario',
  nombre TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ubicaciones table
CREATE TABLE public.ubicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provincia TEXT NOT NULL,
  localidad TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ubicaciones" ON public.ubicaciones FOR SELECT TO authenticated USING (true);

-- Tasaciones table
CREATE TABLE public.tasaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_propiedad TEXT NOT NULL,
  provincia TEXT,
  partido TEXT,
  localidad TEXT,
  hectareas NUMERIC NOT NULL,
  coordenadas TEXT,
  tipo_campo TEXT,
  tipo_suelo TEXT,
  mejoras TEXT[],
  accesibilidad TEXT,
  servicios TEXT[],
  imagenes TEXT[],
  valor_estimado NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasaciones" ON public.tasaciones FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasaciones" ON public.tasaciones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasaciones" ON public.tasaciones FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasaciones" ON public.tasaciones FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Propiedades table
CREATE TABLE public.propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC,
  ubicacion_id UUID REFERENCES public.ubicaciones(id),
  cantidad_hectareas NUMERIC NOT NULL,
  tipo_campo TEXT NOT NULL,
  servicios TEXT[],
  foto_destacada TEXT,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  publicada BOOLEAN NOT NULL DEFAULT false,
  telefono_codigo_pais TEXT DEFAULT '+54',
  telefono_numero TEXT,
  email_contacto TEXT,
  calidad_suelo TEXT,
  acceso_agua BOOLEAN DEFAULT false,
  sistema_riego TEXT,
  salinidad_suelo NUMERIC DEFAULT 0,
  rocas_accidentes TEXT,
  uso_actual TEXT DEFAULT 'sin_uso',
  energia_renovable BOOLEAN DEFAULT false,
  conectividad_vial BOOLEAN DEFAULT false,
  conectividad_vial_descripcion TEXT,
  distancia_acopio NUMERIC,
  electricidad TEXT DEFAULT 'no_disponible',
  agua_potable TEXT DEFAULT 'no_disponible',
  gas TEXT DEFAULT 'no_disponible',
  cambio_cultivo BOOLEAN DEFAULT false,
  cambio_cultivo_descripcion TEXT,
  indice_productividad NUMERIC DEFAULT 50,
  titularidad_perfecta BOOLEAN DEFAULT false,
  indivision_hereditaria BOOLEAN DEFAULT false,
  hipoteca_gravamenes BOOLEAN DEFAULT false,
  hipoteca_gravamenes_detalle TEXT,
  restricciones_uso TEXT,
  regulaciones_ambientales TEXT,
  zonificacion TEXT,
  derechos_terceros TEXT,
  cargas_afectaciones TEXT,
  impuestos_al_dia BOOLEAN DEFAULT false,
  tasacion_id UUID REFERENCES public.tasaciones(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published propiedades" ON public.propiedades FOR SELECT USING (publicada = true);
CREATE POLICY "Authenticated can view published" ON public.propiedades FOR SELECT TO authenticated USING (publicada = true OR auth.uid() = usuario_id);
CREATE POLICY "Users can insert own propiedades" ON public.propiedades FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own propiedades" ON public.propiedades FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own propiedades" ON public.propiedades FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Propiedad imagenes
CREATE TABLE public.propiedad_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  imagen_url TEXT NOT NULL,
  es_destacada BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.propiedad_imagenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view propiedad_imagenes" ON public.propiedad_imagenes FOR SELECT USING (true);
CREATE POLICY "Users can insert propiedad_imagenes" ON public.propiedad_imagenes FOR INSERT TO authenticated WITH CHECK (true);

-- Catalog tables
CREATE TABLE public.cultivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cultivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cultivos" ON public.cultivos FOR SELECT USING (true);

CREATE TABLE public.instalaciones_ganaderia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.instalaciones_ganaderia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read instalaciones_ganaderia" ON public.instalaciones_ganaderia FOR SELECT USING (true);

CREATE TABLE public.instalaciones_agricultura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.instalaciones_agricultura ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read instalaciones_agricultura" ON public.instalaciones_agricultura FOR SELECT USING (true);

CREATE TABLE public.tipos_alambrado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tipos_alambrado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tipos_alambrado" ON public.tipos_alambrado FOR SELECT USING (true);

CREATE TABLE public.infraestructura_hidrica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.infraestructura_hidrica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read infraestructura_hidrica" ON public.infraestructura_hidrica FOR SELECT USING (true);

CREATE TABLE public.servidumbres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.servidumbres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read servidumbres" ON public.servidumbres FOR SELECT USING (true);

CREATE TABLE public.conectividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conectividad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read conectividad" ON public.conectividad FOR SELECT USING (true);

-- Junction tables
CREATE TABLE public.propiedad_cultivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  cultivo_id UUID REFERENCES public.cultivos(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_cultivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_cultivos" ON public.propiedad_cultivos FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_cultivos" ON public.propiedad_cultivos FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_instalaciones_ganaderia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  instalacion_id UUID REFERENCES public.instalaciones_ganaderia(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_instalaciones_ganaderia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_instalaciones_ganaderia" ON public.propiedad_instalaciones_ganaderia FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_instalaciones_ganaderia" ON public.propiedad_instalaciones_ganaderia FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_instalaciones_agricultura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  instalacion_id UUID REFERENCES public.instalaciones_agricultura(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_instalaciones_agricultura ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_instalaciones_agricultura" ON public.propiedad_instalaciones_agricultura FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_instalaciones_agricultura" ON public.propiedad_instalaciones_agricultura FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_alambrados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  tipo_alambrado_id UUID REFERENCES public.tipos_alambrado(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_alambrados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_alambrados" ON public.propiedad_alambrados FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_alambrados" ON public.propiedad_alambrados FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_infraestructura_hidrica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  infraestructura_id UUID REFERENCES public.infraestructura_hidrica(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_infraestructura_hidrica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_infraestructura_hidrica" ON public.propiedad_infraestructura_hidrica FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_infraestructura_hidrica" ON public.propiedad_infraestructura_hidrica FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_servidumbres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  servidumbre_id UUID REFERENCES public.servidumbres(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_servidumbres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_servidumbres" ON public.propiedad_servidumbres FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_servidumbres" ON public.propiedad_servidumbres FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.propiedad_conectividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID REFERENCES public.propiedades(id) ON DELETE CASCADE NOT NULL,
  conectividad_id UUID REFERENCES public.conectividad(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE public.propiedad_conectividad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read propiedad_conectividad" ON public.propiedad_conectividad FOR SELECT USING (true);
CREATE POLICY "Auth can insert propiedad_conectividad" ON public.propiedad_conectividad FOR INSERT TO authenticated WITH CHECK (true);
