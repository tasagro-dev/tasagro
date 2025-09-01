import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { InformacionGeneral } from '@/components/PropertyForm/InformacionGeneral';
import { SueloRecursos } from '@/components/PropertyForm/SueloRecursos';
import { InfraestructuraInstalaciones } from '@/components/PropertyForm/InfraestructuraInstalaciones';
import { AccesibilidadServicios } from '@/components/PropertyForm/AccesibilidadServicios';
import { UsoActualPotencial } from '@/components/PropertyForm/UsoActualPotencial';
import { FactoresLegales } from '@/components/PropertyForm/FactoresLegales';

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

interface ExtendedFormData {
  // Información General (ya existente)
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
  
  // Suelo y Recursos Naturales
  calidad_suelo: string;
  acceso_agua: boolean;
  sistema_riego: string;
  salinidad_suelo: number;
  rocas_accidentes: string;
  cultivos_viables: string[];
  
  // Infraestructura e Instalaciones
  uso_actual: string;
  infraestructura_hidrica: string[];
  instalaciones_ganaderia: string[];
  instalaciones_agricultura: string[];
  tipos_alambrado: string[];
  energia_renovable: boolean;
  
  // Accesibilidad y Servicios
  conectividad_vial: boolean;
  conectividad_vial_descripcion: string;
  distancia_acopio: string;
  electricidad: string;
  agua_potable: string;
  gas: string;
  conectividad_servicios: string[];
  
  // Uso Actual y Potencial
  cambio_cultivo: boolean;
  cambio_cultivo_descripcion: string;
  indice_productividad: number;
  
  // Factores Legales
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

export default function PublicarCampo() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = Boolean(editId);
  
  const [formData, setFormData] = useState<ExtendedFormData>({
    // Información General
    titulo: '',
    descripcion: '',
    precio: '',
    ubicacion_id: '',
    cantidad_hectareas: '',
    tipo_campo: '',
    servicios: [],
    tasacion_id: '',
    telefono_codigo_pais: '+54',
    telefono_numero: '',
    email_contacto: '',
    
    // Suelo y Recursos Naturales
    calidad_suelo: '',
    acceso_agua: false,
    sistema_riego: '',
    salinidad_suelo: 0,
    rocas_accidentes: '',
    cultivos_viables: [],
    
    // Infraestructura e Instalaciones
    uso_actual: '',
    infraestructura_hidrica: [],
    instalaciones_ganaderia: [],
    instalaciones_agricultura: [],
    tipos_alambrado: [],
    energia_renovable: false,
    
    // Accesibilidad y Servicios
    conectividad_vial: false,
    conectividad_vial_descripcion: '',
    distancia_acopio: '',
    electricidad: '',
    agua_potable: '',
    gas: '',
    conectividad_servicios: [],
    
    // Uso Actual y Potencial
    cambio_cultivo: false,
    cambio_cultivo_descripcion: '',
    indice_productividad: 50,
    
    // Factores Legales
    titularidad_perfecta: false,
    indivision_hereditaria: false,
    hipoteca_gravamenes: false,
    hipoteca_gravamenes_detalle: '',
    servidumbres_activas: [],
    restricciones_uso: '',
    regulaciones_ambientales: '',
    zonificacion: '',
    derechos_terceros: '',
    cargas_afectaciones: '',
    impuestos_al_dia: false
  });
  const [images, setImages] = useState<File[]>([]);
  const [tasaciones, setTasaciones] = useState<Tasacion[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
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
        setFormData(prev => ({
          ...prev,
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          precio: data.precio?.toString() || '',
          ubicacion_id: data.ubicacion_id || '',
          cantidad_hectareas: data.cantidad_hectareas?.toString() || '',
          tipo_campo: data.tipo_campo || '',
          servicios: data.servicios || [],
          telefono_codigo_pais: data.telefono_codigo_pais || '+54',
          telefono_numero: data.telefono_numero || '',
          email_contacto: data.email_contacto || '',
          
          // Nuevos campos (mantener valores por defecto si no existen)
          calidad_suelo: data.calidad_suelo || '',
          acceso_agua: data.acceso_agua || false,
          sistema_riego: data.sistema_riego || '',
          salinidad_suelo: data.salinidad_suelo || 0,
          rocas_accidentes: data.rocas_accidentes || '',
          uso_actual: data.uso_actual || '',
          conectividad_vial: data.conectividad_vial || false,
          conectividad_vial_descripcion: data.conectividad_vial_descripcion || '',
          distancia_acopio: data.distancia_acopio?.toString() || '',
          electricidad: data.electricidad || '',
          agua_potable: data.agua_potable || '',
          gas: data.gas || '',
          cambio_cultivo: data.cambio_cultivo || false,
          cambio_cultivo_descripcion: data.cambio_cultivo_descripcion || '',
          indice_productividad: data.indice_productividad || 50,
          energia_renovable: data.energia_renovable || false,
          titularidad_perfecta: data.titularidad_perfecta || false,
          indivision_hereditaria: data.indivision_hereditaria || false,
          hipoteca_gravamenes: data.hipoteca_gravamenes || false,
          hipoteca_gravamenes_detalle: data.hipoteca_gravamenes_detalle || '',
          restricciones_uso: data.restricciones_uso || '',
          regulaciones_ambientales: data.regulaciones_ambientales || '',
          zonificacion: data.zonificacion || '',
          derechos_terceros: data.derechos_terceros || '',
          cargas_afectaciones: data.cargas_afectaciones || '',
          impuestos_al_dia: data.impuestos_al_dia || false
        }));
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

  // Función auxiliar para guardar relaciones many-to-many
  const saveRelations = async (propertyId: string) => {
    const relationPromises = [];

    // Cultivos viables
    if (formData.cultivos_viables.length > 0) {
      const cultivoRecords = formData.cultivos_viables.map(cultivoId => ({
        propiedad_id: propertyId,
        cultivo_id: cultivoId
      }));
      relationPromises.push(
        supabase.from('propiedad_cultivos').insert(cultivoRecords)
      );
    }

    // Instalaciones de ganadería
    if (formData.instalaciones_ganaderia.length > 0) {
      const ganaderiaRecords = formData.instalaciones_ganaderia.map(instalacionId => ({
        propiedad_id: propertyId,
        instalacion_id: instalacionId
      }));
      relationPromises.push(
        supabase.from('propiedad_instalaciones_ganaderia').insert(ganaderiaRecords)
      );
    }

    // Instalaciones de agricultura
    if (formData.instalaciones_agricultura.length > 0) {
      const agriculturaRecords = formData.instalaciones_agricultura.map(instalacionId => ({
        propiedad_id: propertyId,
        instalacion_id: instalacionId
      }));
      relationPromises.push(
        supabase.from('propiedad_instalaciones_agricultura').insert(agriculturaRecords)
      );
    }

    // Tipos de alambrado
    if (formData.tipos_alambrado.length > 0) {
      const alambradoRecords = formData.tipos_alambrado.map(tipoId => ({
        propiedad_id: propertyId,
        tipo_alambrado_id: tipoId
      }));
      relationPromises.push(
        supabase.from('propiedad_alambrados').insert(alambradoRecords)
      );
    }

    // Infraestructura hídrica
    if (formData.infraestructura_hidrica.length > 0) {
      const hidricaRecords = formData.infraestructura_hidrica.map(infraId => ({
        propiedad_id: propertyId,
        infraestructura_id: infraId
      }));
      relationPromises.push(
        supabase.from('propiedad_infraestructura_hidrica').insert(hidricaRecords)
      );
    }

    // Servidumbres
    if (formData.servidumbres_activas.length > 0) {
      const servidumbreRecords = formData.servidumbres_activas.map(servidumbreId => ({
        propiedad_id: propertyId,
        servidumbre_id: servidumbreId
      }));
      relationPromises.push(
        supabase.from('propiedad_servidumbres').insert(servidumbreRecords)
      );
    }

    // Conectividad
    if (formData.conectividad_servicios.length > 0) {
      const conectividadRecords = formData.conectividad_servicios.map(conectividadId => ({
        propiedad_id: propertyId,
        conectividad_id: conectividadId
      }));
      relationPromises.push(
        supabase.from('propiedad_conectividad').insert(conectividadRecords)
      );
    }

    if (relationPromises.length > 0) {
      await Promise.all(relationPromises);
    }
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
        publicada: true,
        
        // Nuevos campos de Suelo y Recursos Naturales
        calidad_suelo: formData.calidad_suelo,
        acceso_agua: formData.acceso_agua,
        sistema_riego: formData.sistema_riego,
        salinidad_suelo: formData.salinidad_suelo,
        rocas_accidentes: formData.rocas_accidentes,
        
        // Nuevos campos de Infraestructura
        uso_actual: formData.uso_actual,
        energia_renovable: formData.energia_renovable,
        
        // Nuevos campos de Accesibilidad y Servicios
        conectividad_vial: formData.conectividad_vial,
        conectividad_vial_descripcion: formData.conectividad_vial_descripcion,
        distancia_acopio: formData.distancia_acopio ? parseFloat(formData.distancia_acopio) : null,
        electricidad: formData.electricidad,
        agua_potable: formData.agua_potable,
        gas: formData.gas,
        
        // Nuevos campos de Uso Actual y Potencial
        cambio_cultivo: formData.cambio_cultivo,
        cambio_cultivo_descripcion: formData.cambio_cultivo_descripcion,
        indice_productividad: formData.indice_productividad,
        
        // Nuevos campos de Factores Legales
        titularidad_perfecta: formData.titularidad_perfecta,
        indivision_hereditaria: formData.indivision_hereditaria,
        hipoteca_gravamenes: formData.hipoteca_gravamenes,
        hipoteca_gravamenes_detalle: formData.hipoteca_gravamenes_detalle,
        restricciones_uso: formData.restricciones_uso,
        regulaciones_ambientales: formData.regulaciones_ambientales,
        zonificacion: formData.zonificacion,
        derechos_terceros: formData.derechos_terceros,
        cargas_afectaciones: formData.cargas_afectaciones,
        impuestos_al_dia: formData.impuestos_al_dia
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

      // Save relations for new properties
      if (data?.data?.id && !isEditing) {
        try {
          await saveRelations(data.data.id);
        } catch (relationError) {
          console.error('Error saving property relations:', relationError);
          // Don't fail the entire process if relation saving fails
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
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEditing ? 'Editar campo' : 'Publicar campo'}
              <CheckCircle className="w-5 h-5 text-primary" />
            </CardTitle>
            <p className="text-muted-foreground">
              Complete toda la información del campo organizizada en secciones para crear una publicación completa.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="general" className="text-xs sm:text-sm">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="suelo" className="text-xs sm:text-sm">
                    Suelo
                  </TabsTrigger>
                  <TabsTrigger value="infraestructura" className="text-xs sm:text-sm">
                    Infraest.
                  </TabsTrigger>
                  <TabsTrigger value="servicios" className="text-xs sm:text-sm">
                    Servicios
                  </TabsTrigger>
                  <TabsTrigger value="uso" className="text-xs sm:text-sm">
                    Uso
                  </TabsTrigger>
                  <TabsTrigger value="legales" className="text-xs sm:text-sm">
                    Legales
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="general" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">1. Información General</h3>
                      <p className="text-sm text-muted-foreground">Datos básicos de la propiedad, ubicación, fotos y contacto</p>
                    </div>
                    <InformacionGeneral
                      formData={formData}
                      setFormData={setFormData}
                      tasaciones={tasaciones}
                      ubicaciones={ubicaciones}
                      images={images}
                      setImages={setImages}
                      onTasacionSelect={handleTasacionSelect}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={removeImage}
                      onTriggerFileInput={triggerFileInput}
                      fileInputRef={fileInputRef}
                    />
                  </TabsContent>

                  <TabsContent value="suelo" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">2. Suelo y Recursos Naturales</h3>
                      <p className="text-sm text-muted-foreground">Calidad del suelo, agua, riego, salinidad y cultivos viables</p>
                    </div>
                    <SueloRecursos formData={formData} setFormData={setFormData} />
                  </TabsContent>

                  <TabsContent value="infraestructura" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">3. Infraestructura e Instalaciones</h3>
                      <p className="text-sm text-muted-foreground">Instalaciones ganaderas, agrícolas, alambrados e infraestructura hídrica</p>
                    </div>
                    <InfraestructuraInstalaciones formData={formData} setFormData={setFormData} />
                  </TabsContent>

                  <TabsContent value="servicios" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">4. Accesibilidad y Servicios</h3>
                      <p className="text-sm text-muted-foreground">Conectividad vial, servicios básicos y telecomunicaciones</p>
                    </div>
                    <AccesibilidadServicios formData={formData} setFormData={setFormData} />
                  </TabsContent>

                  <TabsContent value="uso" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">5. Uso Actual y Potencial</h3>
                      <p className="text-sm text-muted-foreground">Posibilidad de cambios de cultivo e índice de productividad</p>
                    </div>
                    <UsoActualPotencial formData={formData} setFormData={setFormData} />
                  </TabsContent>

                  <TabsContent value="legales" className="space-y-6">
                    <div className="border-l-4 border-l-primary pl-4">
                      <h3 className="text-lg font-semibold">6. Factores Legales</h3>
                      <p className="text-sm text-muted-foreground">Información legal, titularidad, servidumbres y regulaciones</p>
                    </div>
                    <FactoresLegales formData={formData} setFormData={setFormData} />
                  </TabsContent>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ['general', 'suelo', 'infraestructura', 'servicios', 'uso', 'legales'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    disabled={activeTab === 'general'}
                  >
                    Anterior
                  </Button>

                  <div className="flex gap-2">
                    {activeTab !== 'legales' ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const tabs = ['general', 'suelo', 'infraestructura', 'servicios', 'uso', 'legales'];
                          const currentIndex = tabs.indexOf(activeTab);
                          if (currentIndex < tabs.length - 1) {
                            setActiveTab(tabs[currentIndex + 1]);
                          }
                        }}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={submitting || !formData.titulo || !formData.cantidad_hectareas || !formData.tipo_campo}
                      >
                        {submitting ? 'Publicando...' : (isEditing ? 'Actualizar Campo' : 'Publicar Campo')}
                      </Button>
                    )}
                  </div>
                </div>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
