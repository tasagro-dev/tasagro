import { useState, useCallback } from 'react';

export interface PropertyFilters {
  search: string;
  tipo_campo: string;
  provincia: string;
  localidad: string;
  hectareas_min: string;
  hectareas_max: string;
  precio_min: string;
  precio_max: string;
  servicios: string[];
  page: number;
}

const initialFilters: PropertyFilters = {
  search: '',
  tipo_campo: '',
  provincia: '',
  localidad: '',
  hectareas_min: '',
  hectareas_max: '',
  precio_min: '',
  precio_max: '',
  servicios: [],
  page: 1
};

export const usePropertyFilters = () => {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset page when changing filters
      page: key !== 'page' ? 1 : value
    }));
  }, []);

  const updateMultipleFilters = useCallback((updates: Partial<PropertyFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      page: 1 // Reset page when updating multiple filters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearLocationFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      provincia: '',
      localidad: '',
      page: 1
    }));
  }, []);

  const toggleServicio = useCallback((servicio: string) => {
    setFilters(prev => ({
      ...prev,
      servicios: prev.servicios.includes(servicio)
        ? prev.servicios.filter(s => s !== servicio)
        : [...prev.servicios, servicio],
      page: 1
    }));
  }, []);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    clearLocationFilters,
    toggleServicio
  };
};