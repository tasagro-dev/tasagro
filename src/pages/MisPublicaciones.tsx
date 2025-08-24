import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Property {
  id: string;
  titulo: string;
  descripcion?: string;
  cantidad_hectareas: number;
  precio?: number;
  tipo_campo: string;
  publicada: boolean;
  created_at: string;
  ubicaciones?: {
    provincia: string;
    localidad: string;
  };
}

const MisPublicaciones = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      setLoadingProperties(true);
      const { data, error } = await supabase
        .from('propiedades')
        .select(`
          *,
          ubicaciones (
            provincia,
            localidad
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las publicaciones.",
        variant: "destructive",
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const togglePublishStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('propiedades')
        .update({ publicada: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Propiedad ${!currentStatus ? 'publicada' : 'despublicada'} correctamente.`,
      });

      fetchProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la publicación.",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Propiedad eliminada correctamente.",
      });

      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Precio a consultar';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || loadingProperties) {
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
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Mis Publicaciones</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes publicaciones aún
              </h3>
              <p className="text-gray-600 mb-4">
                Publica tu primera propiedad para comenzar a recibir consultas
              </p>
              <Button onClick={() => navigate('/dashboard/publicar-campo')}>
                Publicar campo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{property.titulo}</CardTitle>
                    <Badge variant={property.publicada ? "default" : "secondary"}>
                      {property.publicada ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </div>
                  {property.ubicaciones && (
                    <p className="text-sm text-gray-600">
                      {property.ubicaciones.localidad}, {property.ubicaciones.provincia}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Hectáreas:</span> {property.cantidad_hectareas}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Tipo:</span> {property.tipo_campo}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Precio:</span> {formatPrice(property.precio)}
                    </p>
                    {property.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {property.descripcion}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/publicar-campo?edit=${property.id}`)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(property.id, property.publicada)}
                      className="flex-1"
                    >
                      {property.publicada ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Publicar
                        </>
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProperty(property.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MisPublicaciones;