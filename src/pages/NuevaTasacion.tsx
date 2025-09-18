
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, CheckCircle, TrendingUp } from 'lucide-react';
import { ComparablesModal } from '@/components/ComparablesModal';

type FormData = {
  nombre_propiedad?: string;
  provincia: string;
  partido: string;
  localidad: string;
  hectareas: number;
  coordenadas?: string;
  tipo_campo: 'agrícola' | 'ganadero' | 'mixto' | 'forestal';
  tipo_suelo?: string;
  mejoras: string[];
  accesibilidad: 'fácil' | 'media' | 'difícil';
  servicios: string[];
};

const provincias = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const tiposCampo = [
  { value: 'agrícola', label: 'Agrícola' },
  { value: 'ganadero', label: 'Ganadero' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'forestal', label: 'Forestal' }
];

const mejorasOptions = [
  'alambrado', 'molino', 'aguadas', 'corrales', 'casa', 'galpón'
];

const serviciosOptions = [
  'electricidad', 'agua', 'gas', 'internet'
];

const NuevaTasacion = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTasacionId, setCreatedTasacionId] = useState<string | null>(null);
  
  // Comparables modal state
  const [showComparablesModal, setShowComparablesModal] = useState(false);
  const [comparablesData, setComparablesData] = useState(null);
  const [loadingComparables, setLoadingComparables] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      mejoras: [],
      servicios: []
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const calcularValorEstimado = (data: FormData): number => {
    let valorPorHa = 0;

    if (data.tipo_campo === "agrícola") valorPorHa = 10000;
    if (data.tipo_campo === "ganadero") valorPorHa = 6000;
    if (data.tipo_campo === "mixto") valorPorHa = 8000;
    if (data.tipo_campo === "forestal") valorPorHa = 7000;

    if (data.mejoras.includes("casa")) valorPorHa += 1000;
    if (data.mejoras.includes("galpón")) valorPorHa += 500;
    if (data.mejoras.includes("corrales")) valorPorHa += 300;
    if (data.mejoras.includes("molino")) valorPorHa += 200;

    const valorTotal = valorPorHa * data.hectareas;
    return valorTotal;
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const uploadPromises = selectedFiles.map(async (file, index) => {
      const fileName = `${user!.id}/${Date.now()}_${index}_${file.name}`;
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return urls.filter(url => url !== null) as string[];
  };

  const searchComparables = async () => {
    const provincia = form.getValues('provincia');
    const localidad = form.getValues('localidad');
    const hectareas = form.getValues('hectareas');
    const tipo_campo = form.getValues('tipo_campo');

    if (!provincia || !localidad || !hectareas || !tipo_campo) {
      toast({
        title: "Campos requeridos",
        description: "Complete provincia, localidad, hectáreas y tipo de campo antes de buscar comparables.",
        variant: "destructive",
      });
      return;
    }

    setLoadingComparables(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadolibre-comparables', {
        body: {
          provincia,
          localidad,
          hectareas,
          tipo_campo,
          radioKm: 50
        }
      });

      if (error) {
        throw error;
      }

      setComparablesData(data);
      setShowComparablesModal(true);
    } catch (error) {
      console.error('Error searching comparables:', error);
      toast({
        title: "Error en búsqueda",
        description: "No se pudieron obtener comparables de MercadoLibre. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingComparables(false);
    }
  };

  const handleUseEstimate = (value: number) => {
    setEstimatedValue(value);
    toast({
      title: "Valor estimado actualizado",
      description: `Se estableció el valor en $${value.toLocaleString('es-AR')} basado en comparables de MercadoLibre.`,
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Use comparative estimate if available, otherwise calculate basic estimate  
      const valorEstimado = estimatedValue || calcularValorEstimado(data);

      // Save to database
      const { data: tasacionData, error } = await supabase
        .from('tasaciones')
        .insert({
          user_id: user.id,
          nombre_propiedad: data.nombre_propiedad,
          provincia: data.provincia,
          partido: data.partido,
          localidad: data.localidad,
          hectareas: data.hectareas,
          coordenadas: data.coordenadas,
          tipo_campo: data.tipo_campo,
          tipo_suelo: data.tipo_suelo,
          mejoras: data.mejoras,
          accesibilidad: data.accesibilidad,
          servicios: data.servicios,
          imagenes: imageUrls,
          valor_estimado: valorEstimado
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Save the created tasacion ID
      setCreatedTasacionId(tasacionData.id);

      // Show success modal instead of toast
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating tasacion:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tasación. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({
        title: "Máximo 5 imágenes",
        description: "Solo puedes subir hasta 5 imágenes por tasación.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFiles(files);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard/mis-tasaciones');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10">
                <img 
                  src="/lovable-uploads/142fdbf6-524d-4445-85ef-679e2cb9aecf.png" 
                  alt="TasAgro Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-agro-gradient">Nueva Tasación</span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Información de la propiedad */}
            <Card>
              <CardHeader>
                <CardTitle>🏞️ Información de la propiedad</CardTitle>
                <CardDescription>
                  Datos básicos de ubicación y características
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nombre_propiedad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la propiedad (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Estancia San Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provincia"
                    rules={{ required: "La provincia es requerida" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar provincia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provincias.map((provincia) => (
                              <SelectItem key={provincia} value={provincia}>
                                {provincia}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partido"
                    rules={{ required: "El partido es requerido" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: General Paz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="localidad"
                    rules={{ required: "La localidad es requerida" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localidad *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Ranchos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hectareas"
                    rules={{ 
                      required: "Las hectáreas son requeridas",
                      min: { value: 0.1, message: "Debe ser mayor a 0" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hectáreas *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ej: 150.5" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Comparative Search Button */}
                  <div className="flex flex-col space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tasación Comparativa
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={searchComparables}
                      disabled={loadingComparables}
                      className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      {loadingComparables ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Buscar Comparables en MercadoLibre
                        </>
                      )}
                    </Button>
                    {estimatedValue && (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Valor estimado: ${estimatedValue.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="coordenadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordenadas (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: -34.6118, -58.3960" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Características del campo */}
            <Card>
              <CardHeader>
                <CardTitle>🌱 Características del campo</CardTitle>
                <CardDescription>
                  Información técnica y mejoras de la propiedad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tipo_campo"
                    rules={{ required: "El tipo de campo es requerido" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de campo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposCampo.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_suelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de suelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Franco-arcilloso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accesibilidad"
                    rules={{ required: "La accesibilidad es requerida" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accesibilidad *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar accesibilidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fácil">Fácil</SelectItem>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="difícil">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mejoras"
                    render={() => (
                      <FormItem>
                        <FormLabel>Mejoras</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {mejorasOptions.map((mejora) => (
                            <FormField
                              key={mejora}
                              control={form.control}
                              name="mejoras"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={mejora}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(mejora)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, mejora])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== mejora
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal capitalize">
                                      {mejora}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servicios"
                    render={() => (
                      <FormItem>
                        <FormLabel>Servicios</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {serviciosOptions.map((servicio) => (
                            <FormField
                              key={servicio}
                              control={form.control}
                              name="servicios"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={servicio}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(servicio)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, servicio])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== servicio
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal capitalize">
                                      {servicio}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Multimedia */}
            <Card>
              <CardHeader>
                <CardTitle>📷 Imágenes</CardTitle>
                <CardDescription>
                  Subí hasta 5 imágenes de la propiedad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click para subir</span> o arrastrá las imágenes
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5 imágenes)</p>
                      </div>
                      <input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Tasación
              </Button>
            </div>
          </form>
        </Form>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              ¡Tasación realizada con éxito!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Ya podés descargar el informe desde la sección Mis Tasaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleSuccessModalClose} className="w-full">
              Ir a Mis Tasaciones
            </Button>
            {createdTasacionId && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/publicar-campo?tasacion_id=${createdTasacionId}`)}
                className="w-full"
              >
                Publicar en el Portal
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparables Modal */}
      <ComparablesModal
        isOpen={showComparablesModal}
        onClose={() => setShowComparablesModal(false)}
        data={comparablesData}
        onUseEstimate={handleUseEstimate}
        loading={loadingComparables}
      />
    </div>
  );
};

export default NuevaTasacion;
