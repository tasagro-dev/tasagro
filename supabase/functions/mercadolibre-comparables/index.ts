import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Códigos de provincias de MercadoLibre Argentina
const PROVINCE_CODES: Record<string, string> = {
  'buenos aires': 'TUxBUEJVRU5PUw',
  'capital federal': 'TUxBUENBUGw3M2E1',
  'catamarca': 'TUxBUENBVGFiY2Fm',
  'chaco': 'TUxBUENIQWFkZGUw',
  'chubut': 'TUxBUENIVXh4Mzc2',
  'cordoba': 'TUxBUENPUmFkZGIw',
  'córdoba': 'TUxBUENPUmFkZGIw',
  'corrientes': 'TUxBUENPUnMzOTRk',
  'entre rios': 'TUxBUEVOVHMzNTZi',
  'entre ríos': 'TUxBUEVOVHMzNTZi',
  'formosa': 'TUxBUEZPUnMxNzc4',
  'jujuy': 'TUxBUEpVSnk2ODA3',
  'la pampa': 'TUxBUExBUHMxNDM1MQ',
  'la rioja': 'TUxBUExBUmk3MDQ5',
  'mendoza': 'TUxBUE1FTnM0ZTdj',
  'misiones': 'TUxBUE1JU3MzNjIx',
  'neuquen': 'TUxBUE5FVW4xMzMzNQ',
  'neuquén': 'TUxBUE5FVW4xMzMzNQ',
  'rio negro': 'TUxBUFJJT24xMzEyOQ',
  'río negro': 'TUxBUFJJT24xMzEyOQ',
  'salta': 'TUxBUFNBTGE1ZmVj',
  'san juan': 'TUxBUFNBTno3Nzk0',
  'san luis': 'TUxBUFNBTno3Nzk1',
  'santa cruz': 'TUxBUFNBTno3Nzk2',
  'santa fe': 'TUxBUFNBTmU5Nzk2',
  'santiago del estero': 'TUxBUFNBTno3Nzk3',
  'tierra del fuego': 'TUxBUFRJRXM0YjEy',
  'tucuman': 'TUxBUFRVQ24xNDkw',
  'tucumán': 'TUxBUFRVQ24xNDkw',
};

interface SearchParams {
  provincia: string;
  localidad: string;
  hectareas: number;
  tipo_campo: string;
  radioKm?: number;
  page?: number;
  mejoras?: string[];
}

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
  raw: any;
  rural_data?: RuralData;
  ai_extracted: boolean;
}

interface SearchResponse {
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

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// MercadoLibre OAuth credentials
const mlAppId = Deno.env.get('MERCADOLIBRE_APP_ID');
const mlSecretKey = Deno.env.get('MERCADOLIBRE_SECRET_KEY');

// In-memory token cache (valid for ~5.5 hours to be safe, ML tokens last 6 hours)
let cachedToken: { token: string; expiresAt: number } | null = null;

// Get OAuth token using Client Credentials flow
async function getMercadoLibreToken(): Promise<string | null> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached MercadoLibre token');
    return cachedToken.token;
  }

  if (!mlAppId || !mlSecretKey) {
    console.log('MercadoLibre credentials not configured, using public API');
    return null;
  }

  try {
    console.log('Requesting new MercadoLibre OAuth token...');
    
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: mlAppId,
        client_secret: mlSecretKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OAuth token error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (data.access_token) {
      // Cache token for 5.5 hours (tokens are valid for 6 hours)
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (5.5 * 60 * 60 * 1000),
      };
      console.log('MercadoLibre OAuth token obtained successfully');
      return data.access_token;
    }
    
    console.error('No access_token in OAuth response:', data);
    return null;
  } catch (error) {
    console.error('Error getting MercadoLibre token:', error);
    return null;
  }
}

// Helper to make authenticated requests to MercadoLibre
async function fetchMercadoLibre(url: string, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'User-Agent': 'Tasagro-Comparables/1.0',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { headers });
}

function generateQueryHash(params: SearchParams): string {
  const hashInput = `${params.provincia}_${params.localidad}_${params.hectareas}_${params.tipo_campo}_${params.radioKm || 50}_v3`;
  return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

async function getFromCache(queryHash: string): Promise<SearchResponse | null> {
  try {
    const { data, error } = await supabase
      .from('comparables_cache')
      .select('results')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.log('Cache miss or expired for query:', queryHash);
      return null;
    }

    console.log('Cache hit for query:', queryHash);
    return { ...data.results, from_cache: true };
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

async function saveToCache(queryHash: string, results: SearchResponse): Promise<void> {
  try {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 2);

    const { error } = await supabase
      .from('comparables_cache')
      .upsert({
        query_hash: queryHash,
        results: { ...results, from_cache: false },
        expires_at: expiryTime.toISOString()
      });

    if (error) {
      console.error('Cache save error:', error);
    } else {
      console.log('Results cached for query:', queryHash);
    }
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

function parseArea(text: string): number | null {
  if (!text) return null;
  
  const cleanText = text.toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const haPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:ha|has|hectareas?|hectáreas?)/,
    /(\d+(?:\.\d+)?)\s*(?:hectareas?|hectáreas?)/,
  ];

  for (const pattern of haPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  const m2Patterns = [
    /(\d+(?:\.\d+)?)\s*(?:m2|m²|metros?\s*cuadrados?)/,
  ];

  for (const pattern of m2Patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const m2 = parseFloat(match[1]);
      return m2 / 10000;
    }
  }

  return null;
}

function parseAreaFromAttributes(item: any): number | null {
  const totalArea = item.attributes?.find((a: any) => a.id === 'TOTAL_AREA');
  if (totalArea?.value_name) {
    const m2 = parseFloat(totalArea.value_name.replace(/[^0-9.]/g, ''));
    if (m2 > 0) return m2 / 10000;
  }
  return parseArea(item.title);
}

function parsePrice(item: any): number | null {
  if (!item.price || item.price <= 0) return null;
  return item.price;
}

async function getItemDescription(itemId: string, token: string | null): Promise<string> {
  try {
    const response = await fetchMercadoLibre(
      `https://api.mercadolibre.com/items/${itemId}/description`,
      token
    );
    if (response.ok) {
      const data = await response.json();
      return data.plain_text || '';
    }
  } catch (error) {
    console.error(`Error fetching description for ${itemId}:`, error);
  }
  return '';
}

async function extractRuralData(title: string, description: string): Promise<RuralData | null> {
  if (!openAIApiKey) {
    console.log('OpenAI API key not configured, using fallback extraction');
    return extractRuralDataFallback(title, description);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `Eres un experto en tasación de campos rurales en Argentina. Extrae datos estructurados de esta publicación.

Responde SOLO con JSON válido con este schema exacto:
{
  "tipo_campo": "agricola" | "ganadero" | "mixto" | "forestal" | "tambo" | "criadero" | "desconocido",
  "aptitud_suelo": ["agricola", "ganadero", etc.],
  "mejoras": {
    "casa": boolean,
    "galpon": boolean,
    "silos": boolean,
    "aguadas": boolean,
    "molinos": boolean,
    "alambrados": boolean,
    "corrales": boolean,
    "manga": boolean
  },
  "cultivos_actuales": ["soja", "maiz", "trigo", etc.],
  "pasturas": ["naturales", "implantadas", etc.],
  "infraestructura": ["electricidad", "gas", "camino", etc.],
  "confidence": 0.0 a 1.0
}

Responde siempre con todos los campos. Si no puedes determinar algo, usa valores por defecto (arrays vacíos, false, "desconocido", o confidence bajo).`
          },
          {
            role: 'user',
            content: `Título: ${title}\n\nDescripción: ${description.substring(0, 2000)}`
          }
        ]
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return extractRuralDataFallback(title, description);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      const parsed = JSON.parse(content) as RuralData;
      console.log('AI extraction successful, confidence:', parsed.confidence);
      return parsed;
    }
  } catch (error) {
    console.error('Error in AI extraction:', error);
  }

  return extractRuralDataFallback(title, description);
}

function extractRuralDataFallback(title: string, description: string): RuralData {
  const text = `${title} ${description}`.toLowerCase();
  
  let tipo_campo = 'desconocido';
  if (/agr[ií]cola|agricultura|siembra|cultivo/.test(text)) tipo_campo = 'agricola';
  else if (/ganader[iao]|hacienda|vacun/.test(text)) tipo_campo = 'ganadero';
  else if (/mixto|agro.?ganadero/.test(text)) tipo_campo = 'mixto';
  else if (/forestal|bosque|monte/.test(text)) tipo_campo = 'forestal';
  else if (/tambo|lecher[iao]/.test(text)) tipo_campo = 'tambo';
  
  const mejoras = {
    casa: /casa|vivienda|casero/.test(text),
    galpon: /galp[oó]n|dep[oó]sito|tinglado/.test(text),
    silos: /silo|almacen/.test(text),
    aguadas: /aguada|tanque|bebedero|pozo/.test(text),
    molinos: /molino/.test(text),
    alambrados: /alambrado|cerco|perimetral/.test(text),
    corrales: /corral/.test(text),
    manga: /manga|embarcadero/.test(text),
  };

  const cultivos_actuales: string[] = [];
  if (/soja/.test(text)) cultivos_actuales.push('soja');
  if (/ma[ií]z/.test(text)) cultivos_actuales.push('maíz');
  if (/trigo/.test(text)) cultivos_actuales.push('trigo');
  if (/girasol/.test(text)) cultivos_actuales.push('girasol');
  if (/sorgo/.test(text)) cultivos_actuales.push('sorgo');

  const pasturas: string[] = [];
  if (/pastura\s*natural|campo\s*natural/.test(text)) pasturas.push('naturales');
  if (/pastura\s*implantada|pradera/.test(text)) pasturas.push('implantadas');

  const infraestructura: string[] = [];
  if (/luz|electricidad|energ[ií]a/.test(text)) infraestructura.push('electricidad');
  if (/gas/.test(text)) infraestructura.push('gas');
  if (/ruta|camino|asfalto/.test(text)) infraestructura.push('camino');

  return {
    tipo_campo,
    aptitud_suelo: tipo_campo !== 'desconocido' ? [tipo_campo] : [],
    mejoras,
    cultivos_actuales,
    pasturas,
    infraestructura,
    confidence: 0.4,
  };
}

function calculateScore(comparable: Comparable, searchParams: SearchParams): number {
  let score = 0;
  
  const areaDiff = Math.abs(comparable.area_ha - searchParams.hectareas) / searchParams.hectareas;
  const areaScore = Math.max(0, 1 - areaDiff);
  score += areaScore * 0.20;
  
  const locationLower = comparable.location.toLowerCase();
  const localidadLower = searchParams.localidad.toLowerCase();
  const provinciaLower = searchParams.provincia.toLowerCase();
  
  let locationScore = 0.3;
  if (locationLower.includes(localidadLower)) locationScore = 1;
  else if (locationLower.includes(provinciaLower)) locationScore = 0.6;
  score += locationScore * 0.30;
  
  let tipoScore = 0.5;
  if (comparable.rural_data) {
    const tipoBuscado = searchParams.tipo_campo.toLowerCase();
    const tipoEncontrado = comparable.rural_data.tipo_campo.toLowerCase();
    
    if (tipoEncontrado === tipoBuscado) tipoScore = 1;
    else if (tipoEncontrado === 'mixto' || tipoBuscado === 'mixto') tipoScore = 0.7;
    else if (tipoEncontrado !== 'desconocido') tipoScore = 0.4;
  }
  score += tipoScore * 0.20;
  
  let mejorasScore = 0.5;
  if (comparable.rural_data && searchParams.mejoras && searchParams.mejoras.length > 0) {
    const mejorasEncontradas = Object.entries(comparable.rural_data.mejoras)
      .filter(([_, v]) => v)
      .map(([k, _]) => k);
    
    const matches = searchParams.mejoras.filter(m => 
      mejorasEncontradas.some(e => e.includes(m.toLowerCase()) || m.toLowerCase().includes(e))
    );
    mejorasScore = matches.length / searchParams.mejoras.length;
  }
  score += mejorasScore * 0.15;
  
  const confidenceScore = comparable.rural_data?.confidence || 0.3;
  score += confidenceScore * 0.15;
  
  return Math.min(score, 1);
}

function buildSearchUrl(params: SearchParams): string {
  const baseUrl = 'https://api.mercadolibre.com/sites/MLA/search';
  
  let url = `${baseUrl}?category=MLA1496`;
  
  const queryParts = ['campo'];
  if (params.tipo_campo) queryParts.push(params.tipo_campo);
  if (params.localidad) queryParts.push(params.localidad);
  url += `&q=${encodeURIComponent(queryParts.join(' '))}`;
  
  const provinceCode = PROVINCE_CODES[params.provincia.toLowerCase()];
  if (provinceCode) {
    url += `&state=${provinceCode}`;
  }
  
  const minM2 = Math.floor(params.hectareas * 0.6 * 10000);
  const maxM2 = Math.ceil(params.hectareas * 1.4 * 10000);
  url += `&TOTAL_AREA=${minM2}-${maxM2}`;
  
  url += '&limit=50&offset=0';
  
  return url;
}

async function searchMercadoLibreWithRetry(url: string, token: string | null): Promise<any> {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} - Searching MercadoLibre: ${url}`);
      
      const response = await fetchMercadoLibre(url, token);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Found ${data.results?.length || 0} results from MercadoLibre`);
      return data;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

async function searchComparables(params: SearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  
  // Get OAuth token
  const token = await getMercadoLibreToken();
  if (token) {
    console.log('Using authenticated MercadoLibre API');
  } else {
    console.log('Using public MercadoLibre API (may be rate limited)');
  }
  
  const searchUrl = buildSearchUrl(params);
  
  try {
    const mlResponse = await searchMercadoLibreWithRetry(searchUrl, token);
    
    if (!mlResponse.results || mlResponse.results.length === 0) {
      console.log('No results from primary search, trying broader search...');
      
      const broaderUrl = `https://api.mercadolibre.com/sites/MLA/search?category=MLA1496&q=${encodeURIComponent(`campo ${params.tipo_campo} ${params.provincia}`)}&limit=50`;
      const broaderResponse = await searchMercadoLibreWithRetry(broaderUrl, token);
      
      if (!broaderResponse.results || broaderResponse.results.length === 0) {
        return {
          comparables: [],
          total_found: 0,
          estimated_price_per_ha: 0,
          estimated_price_total: 0,
          min_price: 0,
          max_price: 0,
          median_price: 0,
          confidence_score: 0,
          from_cache: false
        };
      }
      
      mlResponse.results = broaderResponse.results;
    }

    const comparables: Comparable[] = [];
    const itemsToProcess = mlResponse.results.slice(0, 25);
    
    console.log(`Processing ${itemsToProcess.length} items with AI extraction...`);
    
    for (const item of itemsToProcess) {
      const price = parsePrice(item);
      const area_ha = parseAreaFromAttributes(item);
      
      if (!price || !area_ha || area_ha <= 0) {
        continue;
      }

      const price_per_ha = price / area_ha;
      
      const location = item.location ? 
        `${item.location.city?.name || ''}, ${item.location.state?.name || ''}`.trim().replace(/^,\s*/, '') : 
        params.localidad;

      let lat, lng;
      if (item.location?.latitude && item.location?.longitude) {
        lat = item.location.latitude;
        lng = item.location.longitude;
      }

      const description = await getItemDescription(item.id, token);
      const rural_data = await extractRuralData(item.title, description);

      const comparable: Comparable = {
        id: item.id,
        title: item.title,
        price: price,
        area_ha: area_ha,
        price_per_ha: price_per_ha,
        permalink: item.permalink,
        thumbnail: item.thumbnail || item.pictures?.[0]?.url || '',
        lat: lat,
        lng: lng,
        location: location,
        score: 0,
        raw: item,
        rural_data: rural_data || undefined,
        ai_extracted: !!rural_data && rural_data.confidence > 0.5,
      };

      comparable.score = calculateScore(comparable, params);
      comparables.push(comparable);
    }

    comparables.sort((a, b) => b.score - a.score);
    const topComparables = comparables.slice(0, 15);

    if (topComparables.length === 0) {
      return {
        comparables: [],
        total_found: 0,
        estimated_price_per_ha: 0,
        estimated_price_total: 0,
        min_price: 0,
        max_price: 0,
        median_price: 0,
        confidence_score: 0,
        from_cache: false
      };
    }

    const prices = topComparables.map(c => c.price);
    const pricesPerHa = topComparables.map(c => c.price_per_ha);
    
    const min_price = Math.min(...prices);
    const max_price = Math.max(...prices);
    
    pricesPerHa.sort((a, b) => a - b);
    const median_price_per_ha = pricesPerHa.length % 2 === 0 
      ? (pricesPerHa[pricesPerHa.length / 2 - 1] + pricesPerHa[pricesPerHa.length / 2]) / 2
      : pricesPerHa[Math.floor(pricesPerHa.length / 2)];

    const estimated_price_per_ha = pricesPerHa.reduce((sum, price) => sum + price, 0) / pricesPerHa.length;
    const estimated_price_total = estimated_price_per_ha * params.hectareas;
    
    const avgScore = topComparables.reduce((sum, c) => sum + c.score, 0) / topComparables.length;
    const avgAiConfidence = topComparables.reduce((sum, c) => sum + (c.rural_data?.confidence || 0.3), 0) / topComparables.length;
    const quantityFactor = Math.min(topComparables.length / 10, 1);
    const confidence_score = (avgScore * 0.5) + (avgAiConfidence * 0.3) + (quantityFactor * 0.2);

    const response: SearchResponse = {
      comparables: topComparables,
      total_found: comparables.length,
      estimated_price_per_ha: Math.round(estimated_price_per_ha),
      estimated_price_total: Math.round(estimated_price_total),
      min_price: Math.round(min_price),
      max_price: Math.round(max_price),
      median_price: Math.round(median_price_per_ha * params.hectareas),
      confidence_score: Math.round(confidence_score * 100) / 100,
      from_cache: false
    };

    const endTime = Date.now();
    console.log(`Search completed in ${endTime - startTime}ms. Found ${topComparables.length} valid comparables with AI extraction.`);

    return response;

  } catch (error) {
    console.error('MercadoLibre search error:', error);
    throw new Error(`Error searching MercadoLibre: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provincia, localidad, hectareas, tipo_campo, radioKm = 50, page = 1, mejoras }: SearchParams = await req.json();

    if (!provincia || !localidad || !hectareas || !tipo_campo) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: provincia, localidad, hectareas, tipo_campo' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (hectareas <= 0) {
      return new Response(JSON.stringify({ 
        error: 'hectareas must be greater than 0' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const searchParams: SearchParams = { provincia, localidad, hectareas, tipo_campo, radioKm, page, mejoras };
    const queryHash = generateQueryHash(searchParams);

    let result = await getFromCache(queryHash);
    
    if (!result) {
      result = await searchComparables(searchParams);
      await saveToCache(queryHash, result);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mercadolibre-comparables function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
