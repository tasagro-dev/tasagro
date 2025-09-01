
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, FileText, Plus, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PublicarCampoCard from '@/components/PublicarCampoCard';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasacionStats, setTasacionStats] = useState({ total: 0, thisMonth: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasacionStats();
    }
  }, [user]);

  const fetchTasacionStats = async () => {
    if (!user) return;
    
    try {
      // Obtener todas las tasaciones del usuario
      const { data: tasaciones, error } = await supabase
        .from('tasaciones')
        .select('created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching tasaciones:', error);
        return;
      }

      const total = tasaciones?.length || 0;
      
      // Calcular tasaciones de este mes
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = tasaciones?.filter(tasacion => 
        new Date(tasacion.created_at) >= startOfMonth
      ).length || 0;

      setTasacionStats({ total, thisMonth });
    } catch (error) {
      console.error('Error fetching tasacion stats:', error);
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
              <span className="text-xl font-bold text-agro-gradient">TasAgro Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tasar-campo')}
                className="flex items-center gap-1 sm:gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al inicio</span>
                <span className="sm:hidden">Inicio</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a TasAgro!
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus tasaciones de propiedades rurales desde aquí.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Nueva Tasación */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-600" />
                Nueva Tasación
              </CardTitle>
              <CardDescription>
                Crear una nueva tasación de propiedad rural
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/dashboard/nueva-tasacion')}>
                Comenzar tasación
              </Button>
            </CardContent>
          </Card>

          {/* Mis Tasaciones */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Mis Tasaciones
              </CardTitle>
              <CardDescription>
                Ver y gestionar tasaciones anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/dashboard/mis-tasaciones')}
              >
                Ver tasaciones
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Estadísticas de tus tasaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total tasaciones:</span>
                  <span className="font-semibold">{tasacionStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Este mes:</span>
                  <span className="font-semibold">{tasacionStats.thisMonth}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Card para publicar campo */}
        <div className="mt-6">
          <PublicarCampoCard />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
