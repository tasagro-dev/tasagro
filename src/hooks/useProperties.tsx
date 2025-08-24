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
  telefono_codigo_pais?: string;
  telefono_numero?: string;
  email_contacto?: string;
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
      // Build select with conditional inner join if we need to filter by ubicaciones
      const selectUbicaciones = (filters.provincia || filters.localidad)
        ? 'ubicaciones:ubicacion_id!inner ( id, provincia, localidad )'
        : 'ubicaciones:ubicacion_id ( id, provincia, localidad )';

      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('propiedades')
        .select(`*, ${selectUbicaciones}` as any, { count: 'exact' })
        .eq('publicada', true)
        .range(from, to);

      if (filters.tipo_campo) query = query.eq('tipo_campo', filters.tipo_campo);
      if (typeof filters.hectareas_min === 'number') query = query.gte('cantidad_hectareas', filters.hectareas_min);
      if (typeof filters.hectareas_max === 'number') query = query.lte('cantidad_hectareas', filters.hectareas_max);
      if (typeof filters.precio_min === 'number') query = query.gte('precio', filters.precio_min);
      if (typeof filters.precio_max === 'number') query = query.lte('precio', filters.precio_max);
      if (filters.servicios && filters.servicios.length > 0) query = query.contains('servicios', filters.servicios);

      if (filters.search && filters.search.trim().length > 0) {
        const term = filters.search.trim();
        query = query.or(`titulo.ilike.%${term}%,descripcion.ilike.%${term}%`);
      }

      if (filters.provincia) query = query.eq('ubicaciones.provincia', filters.provincia);
      if (filters.localidad) query = query.eq('ubicaciones.localidad', filters.localidad);

      const { data, error, count } = await query;
      if (error) throw error;

      setProperties((data as unknown as Property[]) || []);
      setTotalCount(count || 0);
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