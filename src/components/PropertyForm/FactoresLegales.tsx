import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { usePropertyCatalogs } from '@/hooks/usePropertyCatalogs';

interface ExtendedFormData {
  titularidad_perfecta: boolean;
  indivision_hereditaria: boolean;
  hipoteca_gravamenes: boolean;
  hipoteca_gravamenes_detalle: string;
  servidumbres_activas: string[];
  restricciones_uso: string;
  regulaciones_ambientales: string;
  zonificacion: string;
  derechos_terceros: string;
  cargas_afectaciones: string;
  impuestos_al_dia: boolean;
}

interface FactoresLegalesProps {
  formData: ExtendedFormData;
  setFormData: (data: ExtendedFormData | ((prev: ExtendedFormData) => ExtendedFormData)) => void;
}

export function FactoresLegales({ formData, setFormData }: FactoresLegalesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { servidumbres, loading } = usePropertyCatalogs();

  const handleServidumbreChange = (servidumbreId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servidumbres_activas: checked 
        ? [...prev.servidumbres_activas, servidumbreId]
        : prev.servidumbres_activas.filter(id => id !== servidumbreId)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <div>
          <h4 className="font-medium text-amber-800 dark:text-amber-200">Información Legal Avanzada</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Esta sección es opcional pero recomendada para propiedades con aspectos legales complejos.
          </p>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <span className="font-medium">Expandir factores legales</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-4">
          {/* Titularidad y aspectos básicos */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <h4 className="font-medium">Aspectos de titularidad</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="titularidad_perfecta"
                  checked={formData.titularidad_perfecta}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, titularidad_perfecta: checked as boolean }))
                  }
                />
                <Label htmlFor="titularidad_perfecta">Titularidad perfecta</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="indivision_hereditaria"
                  checked={formData.indivision_hereditaria}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, indivision_hereditaria: checked as boolean }))
                  }
                />
                <Label htmlFor="indivision_hereditaria">Indivisión hereditaria</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="impuestos_al_dia"
                  checked={formData.impuestos_al_dia}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, impuestos_al_dia: checked as boolean }))
                  }
                />
                <Label htmlFor="impuestos_al_dia">Impuestos y tasas al día</Label>
              </div>
            </div>
          </div>

          {/* Hipotecas y gravámenes */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hipoteca_gravamenes"
                checked={formData.hipoteca_gravamenes}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hipoteca_gravamenes: checked as boolean }))
                }
              />
              <Label htmlFor="hipoteca_gravamenes">Hipoteca/gravámenes</Label>
            </div>
            
            {formData.hipoteca_gravamenes && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="hipoteca_gravamenes_detalle">Detalle de hipotecas/gravámenes</Label>
                <Textarea
                  id="hipoteca_gravamenes_detalle"
                  value={formData.hipoteca_gravamenes_detalle}
                  onChange={(e) => setFormData(prev => ({ ...prev, hipoteca_gravamenes_detalle: e.target.value }))}
                  placeholder="Describe las hipotecas o gravámenes existentes..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Servidumbres */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <Label>Servidumbres</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {servidumbres.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`servidumbre_${item.id}`}
                    checked={formData.servidumbres_activas.includes(item.id)}
                    onCheckedChange={(checked) => handleServidumbreChange(item.id, checked as boolean)}
                  />
                  <Label htmlFor={`servidumbre_${item.id}`} className="text-sm font-normal">
                    {item.nombre}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Restricciones y regulaciones */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restricciones_uso">Restricciones de uso</Label>
              <Textarea
                id="restricciones_uso"
                value={formData.restricciones_uso}
                onChange={(e) => setFormData(prev => ({ ...prev, restricciones_uso: e.target.value }))}
                placeholder="Describe las restricciones de uso del terreno..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regulaciones_ambientales">Regulaciones ambientales</Label>
              <Textarea
                id="regulaciones_ambientales"
                value={formData.regulaciones_ambientales}
                onChange={(e) => setFormData(prev => ({ ...prev, regulaciones_ambientales: e.target.value }))}
                placeholder="Describe las regulaciones ambientales aplicables..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zonificacion">Zonificación/ordenamiento territorial</Label>
              <Textarea
                id="zonificacion"
                value={formData.zonificacion}
                onChange={(e) => setFormData(prev => ({ ...prev, zonificacion: e.target.value }))}
                placeholder="Describe la zonificación y ordenamiento territorial..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="derechos_terceros">Derechos de terceros / conflictos de límites</Label>
              <Textarea
                id="derechos_terceros"
                value={formData.derechos_terceros}
                onChange={(e) => setFormData(prev => ({ ...prev, derechos_terceros: e.target.value }))}
                placeholder="Describe derechos de terceros o conflictos de límites..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargas_afectaciones">Cargas y afectaciones públicas</Label>
              <Textarea
                id="cargas_afectaciones"
                value={formData.cargas_afectaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, cargas_afectaciones: e.target.value }))}
                placeholder="Describe las cargas y afectaciones públicas..."
                rows={3}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}