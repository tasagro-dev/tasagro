
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Download, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import jsPDF from 'jspdf';

type Tasacion = Tables<'tasaciones'>;

const MisTasaciones = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasaciones, setTasaciones] = useState<Tasacion[]>([]);
  const [loadingTasaciones, setLoadingTasaciones] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasaciones();
    }
  }, [user]);

  const fetchTasaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('tasaciones')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTasaciones(data || []);
    } catch (error) {
      console.error('Error fetching tasaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tasaciones.",
        variant: "destructive",
      });
    } finally {
      setLoadingTasaciones(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate('/');
    }
  };

  const generatePDF = (tasacion: Tasacion) => {
    try {
      const doc = new jsPDF();
      
      // Configuración de fuentes y colores
      doc.setFont('helvetica');
      
      // Header con logo y título
      // Agregar logo TasAgro
      doc.addImage('/lovable-uploads/758022d9-f59a-4f27-94f1-6f2bad184faf.png', 'PNG', 20, 15, 20, 20);
      
      // Título TasAgro en verde
      doc.setFontSize(24);
      doc.setTextColor(5, 150, 105); // Verde del gradiente agro (#059669)
      doc.text('TasAgro', 45, 30);
      
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text('Informe de Tasación Rural', 45, 45);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, 190, 55);
      
      // Información de la propiedad
      let yPosition = 75;
      
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('DATOS DE LA PROPIEDAD', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Nombre de la propiedad
      doc.text(`Nombre: ${tasacion.nombre_propiedad || 'Sin especificar'}`, 20, yPosition);
      yPosition += 10;
      
      // Ubicación
      doc.text(`Ubicación: ${tasacion.localidad}, ${tasacion.partido}, ${tasacion.provincia}`, 20, yPosition);
      yPosition += 10;
      
      // Superficie
      doc.text(`Superficie: ${tasacion.hectareas} hectáreas`, 20, yPosition);
      yPosition += 10;
      
      // Tipo de campo
      doc.text(`Tipo de campo: ${tasacion.tipo_campo}`, 20, yPosition);
      yPosition += 10;
      
      // Tipo de suelo
      if (tasacion.tipo_suelo) {
        doc.text(`Tipo de suelo: ${tasacion.tipo_suelo}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Accesibilidad
      doc.text(`Accesibilidad: ${tasacion.accesibilidad}`, 20, yPosition);
      yPosition += 15;
      
      // Mejoras
      if (tasacion.mejoras && tasacion.mejoras.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('MEJORAS:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        tasacion.mejoras.forEach((mejora) => {
          doc.text(`• ${mejora}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }
      
      // Servicios
      if (tasacion.servicios && tasacion.servicios.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('SERVICIOS:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        tasacion.servicios.forEach((servicio) => {
          doc.text(`• ${servicio}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Valor estimado (destacado)
      doc.setFillColor(240, 248, 255);
      doc.rect(20, yPosition - 5, 170, 25, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('VALOR ESTIMADO:', 25, yPosition + 5);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 120, 0);
      doc.text(formatCurrency(tasacion.valor_estimado), 25, yPosition + 15);
      yPosition += 35;
      
      // Fecha de tasación
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de tasación: ${formatDate(tasacion.created_at)}`, 20, yPosition);
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generado por TasAgro - Sistema de Tasación Rural', 20, pageHeight - 20);
      doc.text(`Informe generado el ${new Date().toLocaleDateString('es-AR')}`, 20, pageHeight - 10);
      
      // Generar nombre del archivo
      const fileName = `Tasacion_${tasacion.nombre_propiedad?.replace(/\s+/g, '_') || 'Propiedad'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Descargar el PDF
      doc.save(fileName);
      
      toast({
        title: "PDF Generado",
        description: "El informe se ha descargado correctamente.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'No calculado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || loadingTasaciones) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando tasaciones...</p>
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
              <span className="text-xl font-bold text-agro-gradient">Mis Tasaciones</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mis Tasaciones
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona y descarga los informes de tus tasaciones realizadas.
          </p>
        </div>

        {tasaciones.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No tienes tasaciones aún</h3>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primera tasación de propiedad rural.
                </p>
                <Button onClick={() => navigate('/dashboard/nueva-tasacion')}>
                  Crear nueva tasación
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasaciones.map((tasacion) => (
              <Card key={tasacion.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {tasacion.nombre_propiedad || 'Propiedad sin nombre'}
                  </CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tasacion.localidad}, {tasacion.partido}, {tasacion.provincia}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Superficie:</span>
                      <span className="font-semibold">{tasacion.hectareas} ha</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tipo de campo:</span>
                      <span className="font-semibold capitalize">{tasacion.tipo_campo}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Valor estimado:
                      </span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(tasacion.valor_estimado)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(tasacion.created_at)}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full" 
                        onClick={() => generatePDF(tasacion)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
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

export default MisTasaciones;
