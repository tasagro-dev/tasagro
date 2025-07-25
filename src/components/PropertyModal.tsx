import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Ruler, DollarSign, Phone, Mail, User } from 'lucide-react';
import { Property } from '@/hooks/useProperties';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyModal = ({ property, isOpen, onClose }: PropertyModalProps) => {
  if (!property) return null;

  const formatPrice = (price?: number) => {
    if (!price) return 'Consultar precio';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://minypmsdvdhktkekbeaj.supabase.co/storage/v1/object/public/property-images/${imagePath}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {property.titulo}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {property.tipo_campo}
                </Badge>
                {property.precio && (
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(property.precio)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen principal */}
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-muted">
            <img
              src={getImageUrl(property.foto_destacada)}
              alt={property.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Detalles de la Propiedad</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Superficie</div>
                    <div className="text-sm text-muted-foreground">
                      {property.cantidad_hectareas.toLocaleString()} hectáreas
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Publicado</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(property.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              {property.servicios && property.servicios.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Servicios Disponibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.servicios.map(servicio => (
                      <Badge key={servicio} variant="secondary">
                        {servicio}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Contacto</h3>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="text-sm text-muted-foreground">
                  Para más información sobre esta propiedad, contacta al vendedor.
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Descripción */}
          {property.descripcion && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {property.descripcion}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};