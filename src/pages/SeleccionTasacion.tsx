import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, UserCheck, Clock, TrendingUp, FileCheck, Scale, ChevronLeft } from "lucide-react";

const SeleccionTasacion = () => {
  const navigate = useNavigate();

  const handleComparables = () => {
    navigate("/dashboard/nueva-tasacion", { state: { tipoTasacion: "comparables" } });
  };

  const handleProfesional = () => {
    navigate("/dashboard/nueva-tasacion", { state: { tipoTasacion: "profesional" } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Elegí el tipo de tasación</h1>
            <p className="text-sm text-muted-foreground">Seleccioná la opción que mejor se adapte a tu necesidad</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Tasación por comparables */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary" />
            
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Tasación por comparables</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Estimación del valor del campo basada en el análisis de precios de campos similares en la misma zona. Considera ubicación, hectáreas, tipo de suelo y uso productivo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Rápida y orientativa</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Basada en datos de mercado</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Ideal para una referencia inicial de valor</span>
                </div>
              </div>

              <Button 
                onClick={handleComparables}
                className="w-full"
                size="lg"
              >
                Continuar
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Tasación profesional */}
          <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/60 to-secondary" />
            
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <UserCheck className="w-7 h-7 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Tasación profesional</CardTitle>
              <p className="text-sm font-medium text-secondary-foreground/80">Por tasador rural y martillero</p>
              <CardDescription className="text-base leading-relaxed mt-2">
                Tasación realizada por un profesional matriculado, con análisis técnico y respaldo formal para operaciones de compra, venta o presentación legal.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Análisis en profundidad</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Realizada por tasador rural y martillero</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Scale className="w-4 h-4 text-foreground" />
                  </div>
                  <span>Mayor precisión y validez profesional</span>
                </div>
              </div>

              <Button 
                onClick={handleProfesional}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                Solicitar tasación profesional
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            ¿Tenés dudas sobre cuál elegir? La tasación por comparables es ideal para obtener una primera estimación rápida. 
            Si necesitás un documento formal para una operación inmobiliaria o legal, te recomendamos la tasación profesional.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SeleccionTasacion;
