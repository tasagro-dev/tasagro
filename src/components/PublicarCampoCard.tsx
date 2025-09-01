import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import campoVerde from '@/assets/campo-verde.jpg';
import { Image as ImageIcon } from 'lucide-react';

const PublicarCampoCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-green-700" />
          Publica tu campo en nuestro CRM
        </CardTitle>
        <CardDescription>
          Agiliza tu venta publicando tu propiedad para que llegue a cientos de compradores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <img
            src={campoVerde}
            alt="Campo en venta"
            className="w-full max-w-[220px] rounded-lg object-cover shadow-md border"
            style={{ aspectRatio: '4/3' }}
          />
          <Button className="w-full" onClick={() => navigate('/publicar-campo')}>
            Publicar campo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicarCampoCard; 