import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  titulo: string;
  descripcion?: string;
  cantidad_hectareas: number;
  precio?: number;
  tipo_campo: string;
  servicios?: string[];
  foto_destacada?: string;
  ubicacion_id?: string;
  usuario_id: string;
  publicada: boolean;
  created_at: string;
  updated_at: string;
}

interface UsePropertiesFilters {
  search?: string;
  tipo_campo?: string;
  provincia?: string;
  localidad?: string;
  hectareas_min?: number;
  hectareas_max?: number;
  precio_min?: number;
  precio_max?: number;
  servicios?: string[];
  page?: number;
  limit?: number;
}

export const useProperties = (filters: UsePropertiesFilters = {}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('propiedades', {
        body: {
          action: 'list',
          filters: {
            ...filters,
            publicada: true // Solo propiedades publicadas
          }
        }
      });

      if (error) throw error;

      setProperties(data.properties || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [
    filters.search,
    filters.tipo_campo,
    filters.provincia,
    filters.localidad,
    filters.hectareas_min,
    filters.hectareas_max,
    filters.precio_min,
    filters.precio_max,
    filters.servicios?.join(','),
    filters.page,
    filters.limit
  ]);

  return {
    properties,
    loading,
    error,
    totalCount,
    refetch: fetchProperties
  };
};