import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface ExtendedFormData {
  cambio_cultivo: boolean;
  cambio_cultivo_descripcion: string;
  indice_productividad: number;
}

interface UsoActualPotencialProps {
  formData: ExtendedFormData;
  setFormData: (data: ExtendedFormData | ((prev: ExtendedFormData) => ExtendedFormData)) => void;
}

export function UsoActualPotencial({ formData, setFormData }: UsoActualPotencialProps) {
  const handleProductividadChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      indice_productividad: value[0]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Cambio de cultivo/actividad posible */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cambio_cultivo"
            checked={formData.cambio_cultivo}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, cambio_cultivo: checked as boolean }))
            }
          />
          <Label htmlFor="cambio_cultivo">Cambio de cultivo/actividad posible</Label>
        </div>
        
        {formData.cambio_cultivo && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="cambio_cultivo_descripcion">Descripción de los cambios posibles</Label>
            <Textarea
              id="cambio_cultivo_descripcion"
              value={formData.cambio_cultivo_descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, cambio_cultivo_descripcion: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
              placeholder="Describe qué cambios de cultivo o actividad son posibles..."
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Índice de productividad */}
      <div className="space-y-4">
        <Label>Índice de productividad (IP): {formData.indice_productividad}</Label>
        <div className="px-4">
          <Slider
            value={[formData.indice_productividad]}
            onValueChange={handleProductividadChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>0 (Muy Bajo)</span>
            <span>25 (Bajo)</span>
            <span>50 (Medio)</span>
            <span>75 (Alto)</span>
            <span>100 (Excelente)</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          El Índice de Productividad indica el potencial productivo del campo en una escala de 0 a 100.
        </p>
      </div>
    </div>
  );
}