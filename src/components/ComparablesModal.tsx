import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ExternalLink, MapPin, Ruler, DollarSign, TrendingUp, Star, 
  Home, Warehouse, Droplets, Wind, Fence, Brain, Wheat, Trees
} from 'lucide-react';

interface RuralData {
  tipo_campo: string;
  aptitud_suelo: string[];
  mejoras: {
    casa: boolean;
    galpon: boolean;
    silos: boolean;
    aguadas: boolean;
    molinos: boolean;
    alambrados: boolean;
    corrales: boolean;
    manga: boolean;
  };
  cultivos_actuales: string[];
  pasturas: string[];
  infraestructura: string[];
  confidence: number;
}

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
  rural_data?: RuralData;
  ai_extracted?: boolean;
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
  if (score >= 0.8) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const getConfidenceText = (score: number): string => {
  if (score >= 0.8) return 'Alta';
  if (score >= 0.6) return 'Media';
  return 'Baja';
};

const getTipoCampoColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    'agricola': 'bg-emerald-100 text-emerald-700',
    'ganadero': 'bg-amber-100 text-amber-700',
    'mixto': 'bg-blue-100 text-blue-700',
    'forestal': 'bg-green-100 text-green-700',
    'tambo': 'bg-cyan-100 text-cyan-700',
    'criadero': 'bg-orange-100 text-orange-700',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-700';
};

const getTipoCampoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    'agricola': 'Agrícola',
    'ganadero': 'Ganadero',
    'mixto': 'Mixto',
    'forestal': 'Forestal',
    'tambo': 'Tambo',
    'criadero': 'Criadero',
    'desconocido': 'Sin clasificar',
  };
  return labels[tipo] || tipo;
};

const MejorasIcons: React.FC<{ mejoras: RuralData['mejoras'] }> = ({ mejoras }) => {
  const items = [
    { key: 'casa', icon: Home, label: 'Casa', active: mejoras.casa },
    { key: 'galpon', icon: Warehouse, label: 'Galpón', active: mejoras.galpon },
    { key: 'silos', icon: Warehouse, label: 'Silos', active: mejoras.silos },
    { key: 'aguadas', icon: Droplets, label: 'Aguadas', active: mejoras.aguadas },
    { key: 'molinos', icon: Wind, label: 'Molinos', active: mejoras.molinos },
    { key: 'alambrados', icon: Fence, label: 'Alambrados', active: mejoras.alambrados },
  ];

  const activeItems = items.filter(i => i.active);

  if (activeItems.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex gap-1 flex-wrap">
        {activeItems.map(({ key, icon: Icon, label }) => (
          <Tooltip key={key}>
            <TooltipTrigger>
              <div className="p-1 bg-muted rounded">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

const AIConfidenceBadge: React.FC<{ confidence: number; aiExtracted: boolean }> = ({ confidence, aiExtracted }) => {
  if (!aiExtracted) {
    return (
      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
        <Wheat className="h-3 w-3 mr-1" />
        Básico
      </Badge>
    );
  }

  const color = confidence >= 0.7 
    ? 'bg-purple-100 text-purple-700 border-purple-200' 
    : confidence >= 0.5 
      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <Badge variant="outline" className={`text-xs ${color}`}>
      <Brain className="h-3 w-3 mr-1" />
      IA {Math.round(confidence * 100)}%
    </Badge>
  );
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
            <DialogTitle>Buscando Comparables con IA...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <div className="text-center">
              <p className="text-muted-foreground">Consultando MercadoLibre...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Extrayendo datos rurales con inteligencia artificial
              </p>
            </div>
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

  // Contar cuántos tienen extracción IA exitosa
  const aiExtractedCount = data.comparables.filter(c => c.ai_extracted).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tasación por Comparativa
            <div className="flex gap-2 ml-2">
              {data.from_cache && (
                <Badge variant="secondary" className="text-xs">
                  Cache
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Brain className="h-3 w-3 mr-1" />
                {aiExtractedCount}/{data.comparables.length} con IA
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                Confianza General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getConfidenceColor(data.confidence_score)}>
                  {getConfidenceText(data.confidence_score)} ({Math.round(data.confidence_score * 100)}%)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.total_found} comparables analizados
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex-1">
          <h3 className="font-medium mb-3">Propiedades Comparables</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {data.comparables.map((comparable) => (
                <Card key={comparable.id} className="border-l-4 border-l-primary/20 hover:border-l-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {comparable.thumbnail ? (
                          <img
                            src={comparable.thumbnail}
                            alt="Propiedad"
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-muted rounded-lg border flex items-center justify-center">
                            <Trees className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-2">
                              {comparable.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {comparable.rural_data && comparable.rural_data.tipo_campo !== 'desconocido' && (
                                <Badge className={`text-xs ${getTipoCampoColor(comparable.rural_data.tipo_campo)}`}>
                                  {getTipoCampoLabel(comparable.rural_data.tipo_campo)}
                                </Badge>
                              )}
                              <AIConfidenceBadge 
                                confidence={comparable.rural_data?.confidence || 0} 
                                aiExtracted={comparable.ai_extracted || false}
                              />
                              <Badge variant="outline" className="text-xs">
                                Score: {(comparable.score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Mejoras detectadas */}
                        {comparable.rural_data && (
                          <div className="mb-2">
                            <MejorasIcons mejoras={comparable.rural_data.mejoras} />
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>Precio:</span>
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

                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">$/ha</div>
                            <div className="font-semibold text-primary">
                              {formatPrice(comparable.price_per_ha)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {comparable.location}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => window.open(comparable.permalink, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver en ML
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p className="text-amber-800">
            <strong>Disclaimer:</strong> Estimación orientativa basada en comparables públicos de MercadoLibre 
            y análisis con IA. No sustituye una tasación profesional.
          </p>
        </div>

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
