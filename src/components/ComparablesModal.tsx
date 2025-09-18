import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, MapPin, Ruler, DollarSign, TrendingUp, Star } from 'lucide-react';

interface Comparable {
  id: string;
  title: string;
  price: number;
  area_ha: number;
  price_per_ha: number;
  permalink: string;
  thumbnail: string;
  lat?: number;
  lng?: number;
  location: string;
  score: number;
}

interface ComparablesData {
  comparables: Comparable[];
  total_found: number;
  estimated_price_per_ha: number;
  estimated_price_total: number;
  min_price: number;
  max_price: number;
  median_price: number;
  confidence_score: number;
  from_cache: boolean;
}

interface ComparablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ComparablesData | null;
  onUseEstimate: (estimatedValue: number) => void;
  loading: boolean;
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  } else {
    return `$${price.toLocaleString()}`;
  }
};

const formatPriceDetailed = (price: number): string => {
  return `$${price.toLocaleString('es-AR')}`;
};

const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600 bg-green-100';
  if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getConfidenceText = (score: number): string => {
  if (score >= 0.8) return 'Alta';
  if (score >= 0.6) return 'Media';
  return 'Baja';
};

export const ComparablesModal: React.FC<ComparablesModalProps> = ({
  isOpen,
  onClose,
  data,
  onUseEstimate,
  loading
}) => {
  const handleUseEstimate = () => {
    if (data) {
      onUseEstimate(data.estimated_price_total);
      onClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Buscando Comparables...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Consultando MercadoLibre...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data || data.comparables.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No se encontraron comparables</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="mb-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Pocos datos disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron suficientes propiedades similares en MercadoLibre para esta ubicación.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Sugerencias:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 text-left list-disc list-inside">
                <li>Ampliar el radio de búsqueda</li>
                <li>Considerar propiedades de tipo similar</li>
                <li>Solicitar tasación profesional</li>
              </ul>
            </div>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tasación por Comparativa - MercadoLibre
            {data.from_cache && (
              <Badge variant="secondary" className="text-xs">
                Datos en cache
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Statistics Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio Promedio/Ha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(data.estimated_price_per_ha)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total estimado: {formatPrice(data.estimated_price_total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rango de Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Mínimo:</span>
                  <span className="font-medium">{formatPrice(data.min_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mediana:</span>
                  <span className="font-medium">{formatPrice(data.median_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Máximo:</span>
                  <span className="font-medium">{formatPrice(data.max_price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4" />
                Confianza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getConfidenceColor(data.confidence_score)}>
                  {getConfidenceText(data.confidence_score)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.total_found} comparables encontrados
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Comparables List */}
        <div className="flex-1">
          <h3 className="font-medium mb-3">Propiedades Comparables</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {data.comparables.map((comparable) => (
                <Card key={comparable.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {comparable.thumbnail ? (
                          <img
                            src={comparable.thumbnail}
                            alt="Propiedad"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                            {comparable.title}
                          </h4>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Score: {(comparable.score * 100).toFixed(0)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>Precio total:</span>
                            </div>
                            <div className="font-medium">{formatPriceDetailed(comparable.price)}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Ruler className="h-3 w-3" />
                              <span>Superficie:</span>
                            </div>
                            <div className="font-medium">{comparable.area_ha.toFixed(1)} ha</div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Precio por hectárea</div>
                            <div className="font-semibold text-primary">
                              {formatPriceDetailed(comparable.price_per_ha)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {comparable.location}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(comparable.permalink, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p className="text-amber-800">
            <strong>Disclaimer:</strong> Esta es una estimación orientativa basada en comparables públicos de MercadoLibre. 
            El resultado no sustituye una tasación profesional y debe ser considerado como referencia únicamente.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleUseEstimate} className="flex-1">
            Usar Valor Estimado ({formatPrice(data.estimated_price_total)})
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};