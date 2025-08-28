import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePropertyCatalogs } from '@/hooks/usePropertyCatalogs';

interface ExtendedFormData {
  conectividad_vial: boolean;
  conectividad_vial_descripcion: string;
  distancia_acopio: string;
  electricidad: string;
  agua_potable: string;
  gas: string;
  conectividad_servicios: string[];
}

interface AccesibilidadServiciosProps {
  formData: ExtendedFormData;
  setFormData: (data: ExtendedFormData | ((prev: ExtendedFormData) => ExtendedFormData)) => void;
}

const ELECTRICIDAD_OPTIONS = [
  { value: 'trifasica', label: 'Trifásica' },
  { value: 'monofasica', label: 'Monofásica' },
  { value: 'sin_acceso', label: 'Sin acceso' }
];

const AGUA_POTABLE_OPTIONS = [
  { value: 'red', label: 'Red pública' },
  { value: 'perforacion', label: 'Perforación' },
  { value: 'sin_acceso', label: 'Sin acceso' }
];

const GAS_OPTIONS = [
  { value: 'red', label: 'Red pública' },
  { value: 'envasado', label: 'Envasado' },
  { value: 'sin_acceso', label: 'Sin acceso' }
];

export function AccesibilidadServicios({ formData, setFormData }: AccesibilidadServiciosProps) {
  const { conectividad, loading } = usePropertyCatalogs();

  const handleConectividadChange = (itemId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conectividad_servicios: checked 
        ? [...prev.conectividad_servicios, itemId]
        : prev.conectividad_servicios.filter(id => id !== itemId)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Conectividad vial */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="conectividad_vial"
            checked={formData.conectividad_vial}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, conectividad_vial: checked as boolean }))
            }
          />
          <Label htmlFor="conectividad_vial">Conectividad vial</Label>
        </div>
        
        {formData.conectividad_vial && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="conectividad_vial_descripcion">Descripción del acceso vial</Label>
            <Textarea
              id="conectividad_vial_descripcion"
              value={formData.conectividad_vial_descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, conectividad_vial_descripcion: e.target.value }))}
              placeholder="Describe el tipo de camino, estado, accesibilidad..."
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Distancia a centros de acopio */}
      <div className="space-y-2">
        <Label htmlFor="distancia_acopio">Cercanía a centros de acopio/comercialización (km)</Label>
        <Input
          id="distancia_acopio"
          type="number"
          value={formData.distancia_acopio}
          onChange={(e) => setFormData(prev => ({ ...prev, distancia_acopio: e.target.value }))}
          placeholder="Distancia en kilómetros"
        />
      </div>

      {/* Servicios básicos */}
      <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium">Servicios básicos</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Electricidad */}
          <div className="space-y-2">
            <Label htmlFor="electricidad">Electricidad</Label>
            <Select
              value={formData.electricidad}
              onValueChange={(value) => setFormData(prev => ({ ...prev, electricidad: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de electricidad..." />
              </SelectTrigger>
              <SelectContent>
                {ELECTRICIDAD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agua potable */}
          <div className="space-y-2">
            <Label htmlFor="agua_potable">Agua potable</Label>
            <Select
              value={formData.agua_potable}
              onValueChange={(value) => setFormData(prev => ({ ...prev, agua_potable: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de agua..." />
              </SelectTrigger>
              <SelectContent>
                {AGUA_POTABLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gas */}
          <div className="space-y-2">
            <Label htmlFor="gas">Gas</Label>
            <Select
              value={formData.gas}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gas: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de gas..." />
              </SelectTrigger>
              <SelectContent>
                {GAS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conectividad */}
      <div className="space-y-4">
        <Label>Conectividad</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
          {conectividad.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`conectividad_${item.id}`}
                checked={formData.conectividad_servicios.includes(item.id)}
                onCheckedChange={(checked) => handleConectividadChange(item.id, checked as boolean)}
              />
              <Label htmlFor={`conectividad_${item.id}`} className="text-sm font-normal">
                {item.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}