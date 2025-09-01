import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUbicaciones, useLocalidades } from '@/hooks/useUbicaciones';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Loader2, Upload, X, ArrowLeft, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

type Tasacion = Tables<'tasaciones'>;

type FormData = {
  titulo: string;
  descripcion: string;
  precio: number;
  provincia: string;
  localidad: string;
  cantidad_hectareas: number;
  tipo_campo: string;
  servicios: string[];
  publicar_inmediatamente: boolean;
};

const tiposCampo = [
  { value: 'agrícola', label: 'Agrícola' },
  { value: 'ganadero', label: 'Ganadero' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'forestal', label: 'Forestal' }
];

const serviciosOptions = [
  'electricidad',
  'agua',
  'gas',
  'internet',
  'caminos',
  'alambrado',
  'molino',
  'aguadas',
  'corrales',
  'casa',
  'galpón'
];

const PublicarCampo = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { provincias, loading: loadingProvincias, error: errorProvincias } = useUbicaciones();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tasacionData, setTasacionData] = useState<Tasacion | null>(null);

  // Obtener datos de tasación desde la URL si existe
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tasacionId = searchParams.get('tasacion_id');
    
    if (tasacionId && user) {
      fetchTasacionData(tasacionId);
    }
  }, [location.search, user]);

  const fetchTasacionData = async (tasacionId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasaciones')
        .select('*')
        .eq('id', tasacionId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTasacionData(data);
        // Precargar el formulario con los datos de la tasación
        form.reset({
          titulo: data.nombre_propiedad || '',
          descripcion: `Campo ${data.tipo_campo} de ${data.hectareas} hectáreas ubicado en ${data.localidad}, ${data.partido}, ${data.provincia}.`,
          precio: data.valor_estimado || 0,
          provincia: data.provincia,
          localidad: data.localidad,
          cantidad_hectareas: data.hectareas,
          tipo_campo: data.tipo_campo,
          servicios: data.servicios || [],
          publicar_inmediatamente: false
        });
      }
    } catch (error) {
      console.error('Error fetching tasacion data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de la tasación.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<FormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      precio: 0,
      provincia: '',
      localidad: '',
      cantidad_hectareas: 0,
      tipo_campo: '',
      servicios: [],
      publicar_inmediatamente: false
    }
  });

  const provinciaSeleccionada = form.watch('provincia');
  const { localidades, loading: loadingLocalidades, error: errorLocalidades } = useLocalidades(provinciaSeleccionada);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Imágenes requeridas",
        description: "Debes subir al menos una imagen del campo.",
        variant: "destructive",
      });
      throw new Error('No images selected');
    }

    const uploadPromises = selectedFiles.map(async (file, index) => {
      const fileName = `${user!.id}/${Date.now()}_${index}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  };

  const createOrGetUbicacion = async (provincia: string, localidad: string): Promise<string | null> => {
    try {
      // Buscar si ya existe la ubicación
      const { data: existingUbicacion } = await supabase
        .from('ubicaciones')
        .select('id')
        .eq('provincia', provincia)
        .eq('localidad', localidad)
        .single();

      if (existingUbicacion) {
        return existingUbicacion.id;
      }

      // Si no existe, crear nueva ubicación
      const { data: newUbicacion, error } = await supabase
        .from('ubicaciones')
        .insert({
          provincia,
          localidad
        })
        .select('id')
        .single();

      if (error) throw error;
      return newUbicacion.id;
    } catch (error) {
      console.error('Error creating/getting ubicacion:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Subir imágenes
      setUploadProgress(20);
      const imageUrls = await uploadImages();
      setUploadProgress(60);

      // Crear o obtener ubicación
      const ubicacionId = await createOrGetUbicacion(data.provincia, data.localidad);
      setUploadProgress(80);

      // Guardar propiedad en la base de datos
      const { error } = await supabase
        .from('propiedades')
        .insert({
          titulo: data.titulo,
          descripcion: data.descripcion,
          precio: data.precio,
          cantidad_hectareas: data.cantidad_hectareas,
          tipo_campo: data.tipo_campo,
          servicios: data.servicios,
          foto_destacada: imageUrls[0], // Primera imagen como destacada
          ubicacion_id: ubicacionId,
          usuario_id: user.id,
          publicada: data.publicar_inmediatamente
        });

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "¡Campo publicado exitosamente!",
        description: data.publicar_inmediatamente 
          ? "Tu campo ya está visible en el portal de compras."
          : "Tu campo se guardó como borrador. Puedes publicarlo más tarde desde el Dashboard.",
      });

      // Redirigir al Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error publishing campo:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el campo. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      toast({
        title: "Máximo 10 imágenes",
        description: "Solo puedes subir hasta 10 imágenes por publicación.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProvinciaChange = (provincia: string) => {
    form.setValue('provincia', provincia);
    form.setValue('localidad', ''); // Reset localidad when provincia changes
  };

  if (loading || loadingProvincias) {
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center justify-center w-10 h-10">
                <img 
                  src="/lovable-uploads/142fdbf6-524d-4445-85ef-679e2cb9aecf.png" 
                  alt="TasAgro Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-agro-gradient">Publicar Campo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Publicar Campo en el Portal
          </h1>
          <p className="mt-2 text-gray-600">
            {tasacionData 
              ? "Completa los datos para publicar tu campo tasado en el portal de compras."
              : "Crea una publicación profesional para vender tu campo rural."
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-green-600" />
                  Información básica
                </CardTitle>
                <CardDescription>
                  Datos principales de la publicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  rules={{ required: "El título es requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la publicación *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Campo agrícola en Pergamino, 150 hectáreas" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  rules={{ required: "La descripción es requerida" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe las características del campo, mejoras, accesibilidad, etc."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precio"
                  rules={{ 
                    required: "El precio es requerido",
                    min: { value: 0, message: "El precio debe ser mayor a 0" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio final (USD) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 1500000" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Ubicación
                </CardTitle>
                <CardDescription>
                  Ubicación exacta del campo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="provincia"
                    rules={{ required: "La provincia es requerida" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia *</FormLabel>
                        <Select onValueChange={handleProvinciaChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loadingProvincias}>
                              <SelectValue placeholder={loadingProvincias ? "Cargando provincias..." : "Seleccionar provincia"} />
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
                        {errorProvincias && (
                          <p className="text-sm text-red-600">{errorProvincias}</p>
                        )}
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch('provincia') || loadingLocalidades}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !form.watch('provincia') 
                                  ? "Selecciona una provincia primero" 
                                  : loadingLocalidades 
                                    ? "Cargando localidades..." 
                                    : "Seleccionar localidad"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {localidades.map((localidad) => (
                              <SelectItem key={localidad} value={localidad}>
                                {localidad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errorLocalidades && (
                          <p className="text-sm text-red-600">{errorLocalidades}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Mapa de Google Maps */}
                <div className="mt-6">
                  <GoogleMap 
                    provincia={form.watch('provincia')} 
                    localidad={form.watch('localidad')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Características del campo */}
            <Card>
              <CardHeader>
                <CardTitle>Características del campo</CardTitle>
                <CardDescription>
                  Información técnica y servicios disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cantidad_hectareas"
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

                  <FormField
                    control={form.control}
                    name="tipo_campo"
                    rules={{ required: "El tipo de campo es requerido" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de campo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </div>

                <FormField
                  control={form.control}
                  name="servicios"
                  render={() => (
                    <FormItem>
                      <FormLabel>Servicios disponibles</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del campo</CardTitle>
                <CardDescription>
                  Sube fotos de tu campo (mínimo 1, máximo 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click para subir</span> o arrastra las imágenes
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 10 imágenes)</p>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opciones de publicación */}
            <Card>
              <CardHeader>
                <CardTitle>Opciones de publicación</CardTitle>
                <CardDescription>
                  Configura cómo quieres que aparezca tu campo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="publicar_inmediatamente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Publicar inmediatamente
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Si marcas esta opción, tu campo será visible inmediatamente en el portal de compras. 
                          Si no la marcas, se guardará como borrador y podrás publicarlo más tarde.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Progress bar */}
            {isSubmitting && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subiendo imágenes y guardando...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
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
                {form.watch('publicar_inmediatamente') ? 'Publicar Campo' : 'Guardar como Borrador'}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default PublicarCampo; 