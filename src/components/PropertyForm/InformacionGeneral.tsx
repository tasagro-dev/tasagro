import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Plus, Phone, Mail } from 'lucide-react';

interface Tasacion {
  id: string;
  nombre_propiedad: string;
  hectareas: number;
  provincia: string;
  partido: string;
  localidad: string;
  tipo_campo: string;
  valor_estimado?: number;
}

interface Ubicacion {
  id: string;
  provincia: string;
  localidad: string;
}

interface FormData {
  titulo: string;
  descripcion: string;
  precio: string;
  ubicacion_id: string;
  cantidad_hectareas: string;
  tipo_campo: string;
  servicios: string[];
  tasacion_id: string;
  telefono_codigo_pais: string;
  telefono_numero: string;
  email_contacto: string;
}

interface InformacionGeneralProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  tasaciones: Tasacion[];
  ubicaciones: Ubicacion[];
  images: File[];
  setImages: (images: File[] | ((prev: File[]) => File[])) => void;
  onTasacionSelect: (tasacionId: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onTriggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const COUNTRY_CODES = [
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+1', country: 'Estados Unidos/Canadá', flag: '🇺🇸' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
];

const SERVICIOS_DISPONIBLES = [
  'Luz',
  'Gas',
  'Agua',
  'Internet',
  'Aguadas',
  'Alambrado'
];

export function InformacionGeneral({
  formData,
  setFormData,
  tasaciones,
  ubicaciones,
  images,
  setImages,
  onTasacionSelect,
  onImageUpload,
  onRemoveImage,
  onTriggerFileInput,
  fileInputRef
}: InformacionGeneralProps) {
  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicios: checked 
        ? [...prev.servicios, service]
        : prev.servicios.filter(s => s !== service)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tasación previa */}
      {tasaciones.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="tasacion">Usar datos de tasación previa (opcional)</Label>
          <Select onValueChange={onTasacionSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar una tasación..." />
            </SelectTrigger>
            <SelectContent>
              {tasaciones.map((tasacion) => (
                <SelectItem key={tasacion.id} value={tasacion.id}>
                  {tasacion.nombre_propiedad} - {tasacion.hectareas} ha
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Información básica */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título de la propiedad *</Label>
          <Input
            id="titulo"
            required
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ej: Campo ganadero en zona privilegiada"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe las características del campo..."
            rows={4}
          />
        </div>
      </div>

      {/* Precio y Hectáreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="precio">Precio (USD)</Label>
          <Input
            id="precio"
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hectareas">Superficie (hectáreas) *</Label>
          <Input
            id="hectareas"
            type="number"
            required
            value={formData.cantidad_hectareas}
            onChange={(e) => setFormData(prev => ({ ...prev, cantidad_hectareas: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Ubicación y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ubicacion_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ubicación..." />
            </SelectTrigger>
            <SelectContent>
              {ubicaciones.map((ubicacion) => (
                <SelectItem key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.localidad}, {ubicacion.provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo_campo">Tipo de campo *</Label>
          <Select
            required
            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_campo: value }))}
            value={formData.tipo_campo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ganadero">Ganadero</SelectItem>
              <SelectItem value="agricola">Agrícola</SelectItem>
              <SelectItem value="mixto">Mixto</SelectItem>
              <SelectItem value="forestal">Forestal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Servicios disponibles */}
      <div className="space-y-3">
        <Label>Servicios disponibles</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICIOS_DISPONIBLES.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.servicios.includes(service)}
                onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
              />
              <Label htmlFor={service} className="text-sm font-normal">
                {service}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Fotos */}
      <div className="space-y-3">
        <Label>Fotos del campo (máx. 15)</Label>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={onTriggerFileInput}
            className="w-full"
            disabled={images.length >= 15}
          >
            <Upload className="w-4 h-4 mr-2" />
            {images.length === 0 ? 'Elegir archivos' : `Agregar más fotos (${images.length}/15)`}
          </Button>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {/* Botón + para agregar más fotos */}
              {images.length < 15 && (
                <div 
                  onClick={onTriggerFileInput}
                  className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            {images.length}/15 fotos seleccionadas. Máximo 5MB por imagen.
          </p>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Información de contacto
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_pais">Código país</Label>
            <Select
              value={formData.telefono_codigo_pais}
              onValueChange={(value) => setFormData(prev => ({ ...prev, telefono_codigo_pais: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono_numero}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono_numero: e.target.value }))}
              placeholder="1123456789"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email_contacto">Email</Label>
            <Input
              id="email_contacto"
              type="email"
              value={formData.email_contacto}
              onChange={(e) => setFormData(prev => ({ ...prev, email_contacto: e.target.value }))}
              placeholder="contacto@ejemplo.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}