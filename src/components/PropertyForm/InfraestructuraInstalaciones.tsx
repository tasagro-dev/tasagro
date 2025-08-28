import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePropertyCatalogs } from '@/hooks/usePropertyCatalogs';

interface ExtendedFormData {
  uso_actual: string;
  infraestructura_hidrica: string[];
  instalaciones_ganaderia: string[];
  instalaciones_agricultura: string[];
  tipos_alambrado: string[];
  energia_renovable: boolean;
}

interface InfraestructuraInstalacionesProps {
  formData: ExtendedFormData;
  setFormData: (data: ExtendedFormData | ((prev: ExtendedFormData) => ExtendedFormData)) => void;
}

const USOS_ACTUALES = [
  { value: 'agricola', label: 'Agrícola' },
  { value: 'ganadero', label: 'Ganadero' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'forestal', label: 'Forestal' },
  { value: 'sin_uso', label: 'Sin uso' }
];

export function InfraestructuraInstalaciones({ formData, setFormData }: InfraestructuraInstalacionesProps) {
  const { 
    instalacionesGanaderia, 
    instalacionesAgricultura, 
    tiposAlambrado, 
    infraestructuraHidrica,
    loading 
  } = usePropertyCatalogs();

  const handleArrayFieldChange = (fieldName: keyof ExtendedFormData, itemId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: checked 
        ? [...(prev[fieldName] as string[]), itemId]
        : (prev[fieldName] as string[]).filter(id => id !== itemId)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Uso actual del campo */}
      <div className="space-y-2">
        <Label htmlFor="uso_actual">Uso actual del campo</Label>
        <Select
          value={formData.uso_actual}
          onValueChange={(value) => setFormData(prev => ({ ...prev, uso_actual: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar uso actual..." />
          </SelectTrigger>
          <SelectContent>
            {USOS_ACTUALES.map((uso) => (
              <SelectItem key={uso.value} value={uso.value}>
                {uso.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Infraestructura hídrica */}
      <div className="space-y-4">
        <Label>Infraestructura hídrica</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
          {infraestructuraHidrica.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`hidrica_${item.id}`}
                checked={formData.infraestructura_hidrica.includes(item.id)}
                onCheckedChange={(checked) => handleArrayFieldChange('infraestructura_hidrica', item.id, checked as boolean)}
              />
              <Label htmlFor={`hidrica_${item.id}`} className="text-sm font-normal">
                {item.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Instalaciones para Ganadería */}
      <div className="space-y-4">
        <Label>Instalaciones para Ganadería</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
          {instalacionesGanaderia.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`ganaderia_${item.id}`}
                checked={formData.instalaciones_ganaderia.includes(item.id)}
                onCheckedChange={(checked) => handleArrayFieldChange('instalaciones_ganaderia', item.id, checked as boolean)}
              />
              <Label htmlFor={`ganaderia_${item.id}`} className="text-sm font-normal">
                {item.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Instalaciones para Agricultura */}
      <div className="space-y-4">
        <Label>Instalaciones para Agricultura</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
          {instalacionesAgricultura.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`agricultura_${item.id}`}
                checked={formData.instalaciones_agricultura.includes(item.id)}
                onCheckedChange={(checked) => handleArrayFieldChange('instalaciones_agricultura', item.id, checked as boolean)}
              />
              <Label htmlFor={`agricultura_${item.id}`} className="text-sm font-normal">
                {item.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Alambres */}
      <div className="space-y-4">
        <Label>Tipos de alambrado</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
          {tiposAlambrado.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`alambrado_${item.id}`}
                checked={formData.tipos_alambrado.includes(item.id)}
                onCheckedChange={(checked) => handleArrayFieldChange('tipos_alambrado', item.id, checked as boolean)}
              />
              <Label htmlFor={`alambrado_${item.id}`} className="text-sm font-normal">
                {item.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Energía renovable */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="energia_renovable"
            checked={formData.energia_renovable}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, energia_renovable: checked as boolean }))
            }
          />
          <Label htmlFor="energia_renovable">Energía renovable disponible</Label>
        </div>
      </div>
    </div>
  );
}