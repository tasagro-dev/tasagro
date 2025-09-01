import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PropertyFilters as IPropertyFilters } from '@/hooks/usePropertyFilters';
import { Filter, RotateCcw } from 'lucide-react';

interface PropertyFiltersProps {
  filters: IPropertyFilters;
  onFilterChange: (key: keyof IPropertyFilters, value: any) => void;
  onResetFilters: () => void;
  onToggleServicio: (servicio: string) => void;
}

const TIPOS_CAMPO = [
  'Agrícola',
  'Ganadero',
  'Mixto',
  'Forestal',
  'Recreativo'
];

const SERVICIOS_DISPONIBLES = [
  'Luz',
  'Agua',
  'Internet',
  'Gas',
  'Teléfono'
];

export const PropertyFilters = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  onToggleServicio 
}: PropertyFiltersProps) => {
  const hasActiveFilters = 
    filters.tipo_campo || 
    filters.hectareas_min || 
    filters.hectareas_max ||
    filters.precio_min ||
    filters.precio_max ||
    filters.servicios.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      <Separator />

      {/* Tipo de Campo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Tipo de Campo</Label>
        <Select value={filters.tipo_campo} onValueChange={(value) => onFilterChange('tipo_campo', value === 'todos' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {TIPOS_CAMPO.map(tipo => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hectáreas */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Cantidad de Hectáreas</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input
              type="number"
              placeholder="Mínimo"
              value={filters.hectareas_min}
              onChange={(e) => onFilterChange('hectareas_min', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input
              type="number"
              placeholder="Máximo"
              value={filters.hectareas_max}
              onChange={(e) => onFilterChange('hectareas_max', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Precio */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Precio (USD)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input
              type="number"
              placeholder="Mínimo"
              value={filters.precio_min}
              onChange={(e) => onFilterChange('precio_min', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input
              type="number"
              placeholder="Máximo"
              value={filters.precio_max}
              onChange={(e) => onFilterChange('precio_max', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Servicios Disponibles</Label>
        <div className="space-y-3">
          {SERVICIOS_DISPONIBLES.map(servicio => (
            <div key={servicio} className="flex items-center space-x-2">
              <Checkbox
                id={servicio}
                checked={filters.servicios.includes(servicio)}
                onCheckedChange={() => onToggleServicio(servicio)}
              />
              <Label 
                htmlFor={servicio} 
                className="text-sm font-normal text-foreground cursor-pointer"
              >
                {servicio}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};