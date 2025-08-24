-- Agregar campos de contacto a la tabla propiedades
ALTER TABLE public.propiedades 
ADD COLUMN telefono_codigo_pais text,
ADD COLUMN telefono_numero text,
ADD COLUMN email_contacto text;