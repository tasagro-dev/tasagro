import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { usePropertyCatalogs, CatalogItem } from '@/hooks/usePropertyCatalogs';

interface ExtendedFormData {
  calidad_suelo: string;
  acceso_agua: boolean;
  sistema_riego: string;
  salinidad_suelo: number;
  rocas_accidentes: string;
  cultivos_viables: string[];
}

interface SueloRecursosProps {
  formData: ExtendedFormData;
  setFormData: (data: ExtendedFormData | ((prev: ExtendedFormData) => ExtendedFormData)) => void;
}

const SISTEMAS_RIEGO = [
  'Sin sistema de riego',
  'Aspersión',
  'Goteo',
  'Pivot central',
  'Pivot lateral',
  'Surcos',
  'Manta'
];

export function SueloRecursos({ formData, setFormData }: SueloRecursosProps) {
  const { cultivos, loading } = usePropertyCatalogs();

  const handleCultivoChange = (cultivoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cultivos_viables: checked 
        ? [...prev.cultivos_viables, cultivoId]
        : prev.cultivos_viables.filter(c => c !== cultivoId)
    }));
  };

  const handleSalinidadChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      salinidad_suelo: value[0]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calidad y tipo de suelo */}
        <div className="space-y-2">
          <Label htmlFor="calidad_suelo">Calidad y tipo de suelo</Label>
          <Textarea
            id="calidad_suelo"
            value={formData.calidad_suelo}
            onChange={(e) => setFormData(prev => ({ ...prev, calidad_suelo: e.target.value }))}
            placeholder="Describe el tipo y calidad del suelo..."
            rows={3}
          />
        </div>

        {/* Sistema de riego */}
        <div className="space-y-2">
          <Label htmlFor="sistema_riego">Sistema de riego</Label>
          <Select
            value={formData.sistema_riego}
            onValueChange={(value) => setFormData(prev => ({ ...prev, sistema_riego: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sistema..." />
            </SelectTrigger>
            <SelectContent>
              {SISTEMAS_RIEGO.map((sistema) => (
                <SelectItem key={sistema} value={sistema}>
                  {sistema}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Acceso a fuentes de agua */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceso_agua"
            checked={formData.acceso_agua}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, acceso_agua: checked as boolean }))
            }
          />
          <Label htmlFor="acceso_agua">Acceso a fuentes de agua</Label>
        </div>
      </div>

      {/* Salinidad del suelo */}
      <div className="space-y-4">
        <Label>Salinidad del suelo: {formData.salinidad_suelo}%</Label>
        <div className="px-4">
          <Slider
            value={[formData.salinidad_suelo]}
            onValueChange={handleSalinidadChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>0% (Bajo)</span>
            <span>50% (Medio)</span>
            <span>100% (Alto)</span>
          </div>
        </div>
      </div>

      {/* Rocas o accidentes geográficos */}
      <div className="space-y-2">
        <Label htmlFor="rocas_accidentes">Presencia de rocas o accidentes geográficos</Label>
        <Textarea
          id="rocas_accidentes"
          value={formData.rocas_accidentes}
          onChange={(e) => setFormData(prev => ({ ...prev, rocas_accidentes: e.target.value }))}
          placeholder="Describe la presencia de rocas, pendientes, accidentes geográficos..."
          rows={3}
        />
      </div>

      {/* Cultivos viables */}
      <div className="space-y-4">
        <Label>Tipo de cultivos viables</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-border rounded-lg">
          {cultivos.map((cultivo) => (
            <div key={cultivo.id} className="flex items-center space-x-2">
              <Checkbox
                id={cultivo.id}
                checked={formData.cultivos_viables.includes(cultivo.id)}
                onCheckedChange={(checked) => handleCultivoChange(cultivo.id, checked as boolean)}
              />
              <Label htmlFor={cultivo.id} className="text-sm font-normal">
                {cultivo.nombre}
              </Label>
            </div>
          ))}
        </div>
        {formData.cultivos_viables.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {formData.cultivos_viables.length} cultivo{formData.cultivos_viables.length !== 1 ? 's' : ''} seleccionado{formData.cultivos_viables.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}