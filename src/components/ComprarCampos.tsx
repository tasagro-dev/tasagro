import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SearchBar } from './SearchBar';
import { PropertyFilters } from './PropertyFilters';
import { PropertyCard } from './PropertyCard';
import { PropertyModal } from './PropertyModal';
import { useProperties, Property } from '@/hooks/useProperties';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { ArrowLeft, Filter, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ComprarCamposProps {
  onBack: () => void;
}

export const ComprarCampos = ({ onBack }: ComprarCamposProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    clearLocationFilters,
    toggleServicio
  } = usePropertyFilters();

  // Preparar filtros para la consulta
  const queryFilters = {
    search: filters.search || undefined,
    tipo_campo: filters.tipo_campo || undefined,
    provincia: filters.provincia || undefined,
    localidad: filters.localidad || undefined,
    hectareas_min: filters.hectareas_min ? Number(filters.hectareas_min) : undefined,
    hectareas_max: filters.hectareas_max ? Number(filters.hectareas_max) : undefined,
    precio_min: filters.precio_min ? Number(filters.precio_min) : undefined,
    precio_max: filters.precio_max ? Number(filters.precio_max) : undefined,
    servicios: filters.servicios.length > 0 ? filters.servicios : undefined,
    page: filters.page,
    limit: 12
  };

  const { properties, loading, error, totalCount } = useProperties(queryFilters);

  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
  };

  const handleProvinciaSuggestionSelect = (provincia: string) => {
    updateMultipleFilters({
      search: provincia,
      provincia,
      localidad: ''
    });
  };

  const handleLocalidadSuggestionSelect = (localidad: string, provincia: string) => {
    updateMultipleFilters({
      search: `${localidad}, ${provincia}`,
      provincia,
      localidad
    });
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campos en Venta</h1>
              <p className="text-muted-foreground">
                {totalCount > 0 && `${totalCount} propiedades disponibles`}
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex justify-center mb-6">
            <SearchBar
              value={filters.search}
              onChange={handleSearchChange}
              onProvinciaSuggestionSelect={handleProvinciaSuggestionSelect}
              onLocalidadSuggestionSelect={handleLocalidadSuggestionSelect}
            />
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros Sidebar */}
          {showFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-32">
                <PropertyFilters
                  filters={filters}
                  onFilterChange={updateFilter}
                  onResetFilters={resetFilters}
                  onToggleServicio={toggleServicio}
                />
              </div>
            </div>
          )}

          {/* Contenido Principal */}
          <div className="flex-1">
            {/* Tags de filtros activos */}
            {(filters.provincia || filters.localidad) && (
              <div className="mb-6 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {filters.provincia && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {filters.localidad ? `${filters.localidad}, ${filters.provincia}` : filters.provincia}
                    <button onClick={clearLocationFilters} className="hover:text-primary/70">
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-destructive mb-2">Error al cargar propiedades</div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
            )}

            {/* Loading State */}
            {loading && <LoadingSkeleton />}

            {/* Empty State */}
            {!loading && !error && properties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-foreground mb-2">
                  No se encontraron propiedades
                </div>
                <div className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros de búsqueda
                </div>
                <Button onClick={resetFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </div>
            )}

            {/* Properties Grid */}
            {!loading && properties.length > 0 && (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onViewMore={setSelectedProperty}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && properties.length > 0 && totalCount > 12 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => updateFilter('page', filters.page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Página {filters.page} de {Math.ceil(totalCount / 12)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={filters.page >= Math.ceil(totalCount / 12)}
                    onClick={() => updateFilter('page', filters.page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
};