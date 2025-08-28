import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CatalogItem {
  id: string;
  nombre: string;
  activo: boolean;
}

interface UseCatalogsResult {
  cultivos: CatalogItem[];
  instalacionesGanaderia: CatalogItem[];
  instalacionesAgricultura: CatalogItem[];
  tiposAlambrado: CatalogItem[];
  infraestructuraHidrica: CatalogItem[];
  servidumbres: CatalogItem[];
  conectividad: CatalogItem[];
  loading: boolean;
  error: string | null;
}

export function usePropertyCatalogs(): UseCatalogsResult {
  const [cultivos, setCultivos] = useState<CatalogItem[]>([]);
  const [instalacionesGanaderia, setInstalacionesGanaderia] = useState<CatalogItem[]>([]);
  const [instalacionesAgricultura, setInstalacionesAgricultura] = useState<CatalogItem[]>([]);
  const [tiposAlambrado, setTiposAlambrado] = useState<CatalogItem[]>([]);
  const [infraestructuraHidrica, setInfraestructuraHidrica] = useState<CatalogItem[]>([]);
  const [servidumbres, setServidumbres] = useState<CatalogItem[]>([]);
  const [conectividad, setConectividad] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        
        const [
          cultivosRes,
          ganaderiasRes,
          agriculturasRes,
          alambradosRes,
          hidricasRes,
          servidumbresRes,
          conectividadRes
        ] = await Promise.all([
          supabase.from('cultivos').select('*').eq('activo', true).order('nombre'),
          supabase.from('instalaciones_ganaderia').select('*').eq('activo', true).order('nombre'),
          supabase.from('instalaciones_agricultura').select('*').eq('activo', true).order('nombre'),
          supabase.from('tipos_alambrado').select('*').eq('activo', true).order('nombre'),
          supabase.from('infraestructura_hidrica').select('*').eq('activo', true).order('nombre'),
          supabase.from('servidumbres').select('*').eq('activo', true).order('nombre'),
          supabase.from('conectividad').select('*').eq('activo', true).order('nombre')
        ]);

        if (cultivosRes.error) throw cultivosRes.error;
        if (ganaderiasRes.error) throw ganaderiasRes.error;
        if (agriculturasRes.error) throw agriculturasRes.error;
        if (alambradosRes.error) throw alambradosRes.error;
        if (hidricasRes.error) throw hidricasRes.error;
        if (servidumbresRes.error) throw servidumbresRes.error;
        if (conectividadRes.error) throw conectividadRes.error;

        setCultivos(cultivosRes.data || []);
        setInstalacionesGanaderia(ganaderiasRes.data || []);
        setInstalacionesAgricultura(agriculturasRes.data || []);
        setTiposAlambrado(alambradosRes.data || []);
        setInfraestructuraHidrica(hidricasRes.data || []);
        setServidumbres(servidumbresRes.data || []);
        setConectividad(conectividadRes.data || []);
      } catch (err: any) {
        console.error('Error fetching catalogs:', err);
        setError(err.message || 'Error cargando catálogos');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  return {
    cultivos,
    instalacionesGanaderia,
    instalacionesAgricultura,
    tiposAlambrado,
    infraestructuraHidrica,
    servidumbres,
    conectividad,
    loading,
    error
  };
}