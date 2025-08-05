import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

export const PublicarCampoCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-green-600" />
          Publicá tu campo
        </CardTitle>
        <CardDescription>
          Agilizá la venta cargando tu propiedad directamente en nuestro portal de campos en venta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          onClick={() => navigate('/dashboard/publicar-campo')}
        >
          Publicar campo
        </Button>
      </CardContent>
    </Card>
  );
};