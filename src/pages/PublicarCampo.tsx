import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, Trash2, Phone, Mail, Plus } from 'lucide-react';

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

// Códigos de país más comunes
const COUNTRY_CODES = [
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+1', country: 'Estados Unidos/Canadá', flag: '🇺🇸' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
];

export default function PublicarCampo() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = Boolean(editId);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    ubicacion_id: '',
    cantidad_hectareas: '',
    tipo_campo: '',
    servicios: [] as string[],
    tasacion_id: '',
    telefono_codigo_pais: '+54',
    telefono_numero: '',
    email_contacto: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [tasaciones, setTasaciones] = useState<Tasacion[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasaciones();
      fetchUbicaciones();
      if (isEditing && editId) {
        fetchPropertyForEdit(editId);
      }
    }
  }, [user, isEditing, editId]);

  const fetchTasaciones = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tasaciones')
      .select('id, nombre_propiedad, hectareas, provincia, partido, localidad, tipo_campo, valor_estimado')
      .eq('user_id', user.id);

    if (!error && data) {
      setTasaciones(data);
    }
  };

  const fetchUbicaciones = async () => {
    const { data, error } = await supabase
      .from('ubicaciones')
      .select('id, provincia, localidad')
      .order('provincia', { ascending: true })
      .order('localidad', { ascending: true });

    if (!error && data) {
      setUbicaciones(data as Ubicacion[]);
    }
  };

  const fetchPropertyForEdit = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('propiedades')
        .select(`
          *,
          ubicaciones (
            id,
            provincia,
            localidad
          )
        `)
        .eq('id', propertyId)
        .eq('usuario_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          precio: data.precio?.toString() || '',
          ubicacion_id: data.ubicacion_id || '',
          cantidad_hectareas: data.cantidad_hectareas?.toString() || '',
          tipo_campo: data.tipo_campo || '',
          servicios: data.servicios || [],
          tasacion_id: '',
          telefono_codigo_pais: data.telefono_codigo_pais || '+54',
          telefono_numero: data.telefono_numero || '',
          email_contacto: data.email_contacto || ''
        });
      }
    } catch (error) {
      console.error('Error fetching property for edit:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la propiedad para editar.",
        variant: "destructive",
      });
      navigate('/dashboard/mis-publicaciones');
    }
  };

  const handleTasacionSelect = (tasacionId: string) => {
    const tasacion = tasaciones.find(t => t.id === tasacionId);
    if (tasacion) {
      setFormData(prev => ({
        ...prev,
        titulo: tasacion.nombre_propiedad || '',
        cantidad_hectareas: tasacion.hectareas.toString(),
        tipo_campo: tasacion.tipo_campo,
        precio: tasacion.valor_estimado?.toString() || '',
        tasacion_id: tasacionId
      }));
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicios: checked 
        ? [...prev.servicios, service]
        : prev.servicios.filter(s => s !== service)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 15 - images.length;
    
    if (files.length > remainingSlots) {
      toast({
        title: "Límite de imágenes",
        description: `Solo puedes agregar ${remainingSlots} imágenes más. Máximo 15 fotos en total.`,
        variant: "destructive",
      });
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    // Clear the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImages = async () => {
    if (!user || images.length === 0) return [];

    // Filter images by size before uploading
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validImages = images.filter(image => image.size <= maxSize);
    const oversizedImages = images.filter(image => image.size > maxSize);

    // Show warning for oversized images
    if (oversizedImages.length > 0) {
      toast({
        title: 'Imágenes demasiado grandes',
        description: `${oversizedImages.length} imagen(es) exceden 5MB y no serán subidas. Se procesarán solo las imágenes válidas.`,
        variant: 'destructive',
      });
    }

    if (validImages.length === 0) {
      toast({
        title: 'No hay imágenes válidas',
        description: 'Todas las imágenes seleccionadas exceden el límite de 5MB.',
        variant: 'destructive',
      });
      return [];
    }

    const uploadedUrls: string[] = [];
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      toast({ title: 'Sesión inválida', description: 'Inicia sesión nuevamente.', variant: 'destructive' });
      return [] as string[];
    }

    const endpoint = 'https://minypmsdvdhktkekbeaj.supabase.co/functions/v1/upload-image';

    for (let i = 0; i < validImages.length; i++) {
      const image = validImages[i];
      const fd = new FormData();
      fd.append('file', image);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || 'Error subiendo imagen');
        }

        const imageUrl = json?.url || json?.data?.publicUrl;
        if (imageUrl) {
          uploadedUrls.push(imageUrl);
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        toast({
          title: `Error subiendo imagen ${i + 1}`,
          description: err?.message || 'No se pudo subir la imagen',
          variant: 'destructive',
        });
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const propertyData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        ubicacion_id: formData.ubicacion_id || null,
        cantidad_hectareas: parseFloat(formData.cantidad_hectareas),
        tipo_campo: formData.tipo_campo,
        servicios: formData.servicios,
        foto_destacada: imageUrls[0] || null,
        telefono_codigo_pais: formData.telefono_codigo_pais,
        telefono_numero: formData.telefono_numero,
        email_contacto: formData.email_contacto,
        usuario_id: user.id,
        publicada: true
      };

      const endpoint = 'https://minypmsdvdhktkekbeaj.supabase.co/functions/v1/propiedades';
      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: isEditing ? 'update' : 'create',
          id: isEditing ? editId : undefined,
          propiedad: propertyData,
        }),
      });

      const respJson = await res.json();
      if (!res.ok) throw new Error(respJson?.error || 'Error publicando');

      const data = respJson;

      // If we have additional images and the property was created successfully
      if (data?.data?.id && imageUrls.length > 0) {
        try {
          // Save all images to the propiedad_imagenes table
          const imageRecords = imageUrls.map((url, index) => ({
            propiedad_id: data.data.id,
            imagen_url: url,
            es_destacada: index === 0,
            orden: index
          }));

          await supabase
            .from('propiedad_imagenes')
            .insert(imageRecords);
        } catch (imageError) {
          console.error('Error saving additional images:', imageError);
          // Don't fail the entire process if image saving fails
        }
      }

      toast({
        title: isEditing ? "¡Campo actualizado!" : "¡Campo publicado!",
        description: isEditing ? "Tu propiedad ha sido actualizada exitosamente." : "Tu propiedad ha sido publicada exitosamente en el portal.",
      });

      navigate('/dashboard/mis-publicaciones');
    } catch (error) {
      console.error('Error publishing property:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el campo. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Campo' : 'Publicar Campo'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar campo' : 'Publicá tu campo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tasación previa */}
              {tasaciones.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="tasacion">Usar datos de tasación previa (opcional)</Label>
                  <Select onValueChange={handleTasacionSelect}>
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

              {/* Título */}
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

              {/* Descripción */}
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

              {/* Servicios */}
              <div className="space-y-2">
                <Label>Servicios disponibles</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Luz', 'Agua', 'Internet', 'Gas', 'Alambrado', 'Aguadas'].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.servicios.includes(service)}
                        onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-blue-600" />
                    Información de Contacto
                  </h3>
                  
                  {/* Teléfono */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono_codigo">Código de país</Label>
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
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <span className="text-xs text-gray-500">{country.country}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="telefono_numero">Número de teléfono</Label>
                      <Input
                        id="telefono_numero"
                        type="tel"
                        value={formData.telefono_numero}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono_numero: e.target.value }))}
                        placeholder="Ej: 11 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email_contacto" className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email de contacto
                    </Label>
                    <Input
                      id="email_contacto"
                      type="email"
                      value={formData.email_contacto}
                      onChange={(e) => setFormData(prev => ({ ...prev, email_contacto: e.target.value }))}
                      placeholder="tu-email@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="images">Fotos ({images.length}/15)</Label>
                  <span className="text-sm text-gray-500">
                    Máximo 15 fotos
                  </span>
                </div>
                <Input
                  ref={fileInputRef}
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={images.length >= 15}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={images.length >= 15}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Elegir archivos
                </Button>
                {images.length >= 15 && (
                  <p className="text-sm text-orange-600">
                    Has alcanzado el límite máximo de 15 fotos. Elimina alguna para agregar más.
                  </p>
                )}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {images.length < 15 && (
                      <div 
                        className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                        onClick={triggerFileInput}
                      >
                        <Plus className="w-8 h-8 text-gray-400 hover:text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting 
                  ? (isEditing ? 'Actualizando...' : 'Publicando...') 
                  : (isEditing ? 'Actualizar campo' : 'Publicar campo')
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}