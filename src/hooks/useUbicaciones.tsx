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
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*')
        .order('provincia', { ascending: true })
        .order('localidad', { ascending: true });

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
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('provincia')
        .order('provincia', { ascending: true });

      if (error) throw error;

      // Extraer provincias únicas
      const provinciasUnicas = [...new Set(data?.map(item => item.provincia) || [])];
      setProvincias(provinciasUnicas);
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

// Hook separado para localidades de una provincia específica
export const useLocalidades = (provincia: string) => {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocalidades = async (provinciaSeleccionada: string) => {
    if (!provinciaSeleccionada) {
      setLocalidades([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('localidad')
        .eq('provincia', provinciaSeleccionada)
        .order('localidad', { ascending: true });

      if (error) throw error;

      const localidadesUnicas = data?.map(item => item.localidad) || [];
      setLocalidades(localidadesUnicas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar localidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalidades(provincia);
  }, [provincia]);

  return {
    localidades,
    loading,
    error,
    refetch: () => fetchLocalidades(provincia)
  };
};