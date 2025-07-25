import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Ubicacion {
  id: string;
  provincia: string;
  localidad: string;
  created_at: string;
  updated_at: string;
}

export const useUbicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUbicaciones = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ubicaciones', {
        body: { action: 'list' }
      });

      if (error) throw error;

      setUbicaciones(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvincias = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ubicaciones', {
        body: { action: 'provincias' }
      });

      if (error) throw error;

      setProvincias(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar provincias');
    }
  };

  const getLocalidadesByProvincia = (provincia: string): string[] => {
    return ubicaciones
      .filter(u => u.provincia === provincia)
      .map(u => u.localidad)
      .filter((localidad, index, self) => self.indexOf(localidad) === index)
      .sort();
  };

  useEffect(() => {
    fetchUbicaciones();
    fetchProvincias();
  }, []);

  return {
    ubicaciones,
    provincias,
    loading,
    error,
    getLocalidadesByProvincia,
    refetch: fetchUbicaciones
  };
};