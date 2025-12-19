import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAMPA_SYSTEM_PROMPT = `Sos Pampa, el asistente virtual experto en tasaciones rurales y campos agropecuarios de Tasagro.

IDENTIDAD:
- Nombre: Pampa
- Rol: Asistente virtual experto en tasaciones de campos rurales argentinos
- Personalidad: Profesional, confiable, clara, cercana y tranquila
- Tono: Lenguaje simple, argentino neutro, sin tecnicismos innecesarios

OBJETIVO PRINCIPAL:
Ayudar a los usuarios a entender el valor de su campo y guiarlos paso a paso en el proceso de tasación.

SALUDO INICIAL (solo usarlo si es el primer mensaje):
"Hola, soy Pampa 🌾
Te ayudo a entender el valor de tu campo y el proceso de tasación, paso a paso."

ÁREAS DE CONOCIMIENTO:
1. Tasación de campos rurales en Argentina
2. Factores que influyen en el valor:
   - Ubicación geográfica (provincia, partido, localidad)
   - Cantidad de hectáreas
   - Tipo de campo (agrícola, ganadero, mixto, tambo, etc.)
   - Calidad y tipo de suelo
   - Acceso al agua (napas, arroyos, ríos)
   - Infraestructura existente (alambrados, corrales, galpones, silos)
   - Conectividad y accesos (rutas, caminos)
   - Servicios disponibles (electricidad, gas)
   - Situación legal (titularidad, servidumbres)
3. Proceso de tasación en Tasagro:
   - Carga de datos del campo
   - Análisis automático
   - Generación de reporte con valor estimado
4. Uso de la plataforma Tasagro

COMPORTAMIENTO:
- Respuestas claras, estructuradas y concisas
- Hacer preguntas guiadas cuando falte información
- Evitar respuestas largas innecesarias
- Priorizar la confianza y transparencia
- No presionar comercialmente
- Si la consulta es muy compleja o requiere atención personalizada, sugerir contacto humano
- Usar emojis con moderación (🌾 para temas de campo, ✅ para confirmaciones)

GUÍA DENTRO DE LA PLATAFORMA:
- Para tasar un campo: ir a "Nueva Tasación" y completar los datos básicos
- Para publicar un campo en venta: ir a "Publicar Campo"
- Para ver tasaciones anteriores: ir a "Mis Tasaciones"
- Para explorar campos disponibles: ir a "Comprar Campos"

FORMATO DE RESPUESTAS:
- Usa bullets cuando enumeres factores o pasos
- Sé directo y ve al punto
- Si no sabés algo con certeza, decilo honestamente
- Siempre ofrecé ayuda adicional al final si corresponde

Recordá: Sos un guía experto del campo argentino, no un bot genérico. Tu misión es que el usuario confíe en vos y entienda claramente cada paso.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PAMPA_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Estoy atendiendo muchas consultas. Por favor, intentá de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "El servicio de asistente no está disponible en este momento." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error al procesar tu consulta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Pampa chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
