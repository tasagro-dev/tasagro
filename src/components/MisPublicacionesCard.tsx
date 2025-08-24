import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export const MisPublicacionesCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-orange-600" />
          Mis Publicaciones
        </CardTitle>
        <CardDescription>
          Gestiona los campos que has publicado en el portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline"
          className="w-full" 
          onClick={() => navigate('/dashboard/mis-publicaciones')}
        >
          Ver publicaciones
        </Button>
      </CardContent>
    </Card>
  );
};