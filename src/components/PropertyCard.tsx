import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Ruler, DollarSign, Eye } from 'lucide-react';
import { Property } from '@/hooks/useProperties';

interface PropertyCardProps {
  property: Property;
  onViewMore: (property: Property) => void;
}

export const PropertyCard = ({ property, onViewMore }: PropertyCardProps) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://minypmsdvdhktkekbeaj.supabase.co/storage/v1/object/public/property-images/${imagePath}`;
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card">
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getImageUrl(property.foto_destacada)}
          alt={property.titulo}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground font-medium">
            {property.tipo_campo}
          </Badge>
        </div>
        {property.precio && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {formatPrice(property.precio)}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Título */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {property.titulo}
        </h3>

        {/* Hectáreas */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ruler className="h-4 w-4" />
          <span className="text-sm">
            {property.cantidad_hectareas.toLocaleString()} hectáreas
          </span>
        </div>

        {/* Descripción */}
        {property.descripcion && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.descripcion}
          </p>
        )}

        {/* Servicios */}
        {property.servicios && property.servicios.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.servicios.slice(0, 3).map(servicio => (
              <Badge key={servicio} variant="secondary" className="text-xs">
                {servicio}
              </Badge>
            ))}
            {property.servicios.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.servicios.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Publicado {formatDate(property.created_at)}</span>
        </div>

        <Button 
          onClick={() => onViewMore(property)}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver más
        </Button>
      </CardFooter>
    </Card>
  );
};