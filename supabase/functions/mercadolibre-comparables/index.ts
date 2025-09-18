import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  provincia: string;
  localidad: string;
  hectareas: number;
  tipo_campo: string;
  radioKm?: number;
  page?: number;
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

function generateQueryHash(params: SearchParams): string {
  const hashInput = `${params.provincia}_${params.localidad}_${params.hectareas}_${params.tipo_campo}_${params.radioKm || 50}`;
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
    expiryTime.setHours(expiryTime.getHours() + 1); // 1 hour cache

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
  
  // Remove common noise words and normalize
  const cleanText = text.toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Look for hectares patterns
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

  // Look for m² patterns and convert to hectares
  const m2Patterns = [
    /(\d+(?:\.\d+)?)\s*(?:m2|m²|metros?\s*cuadrados?)/,
    /(\d+(?:\.\d+)?)\s*(?:metros?\s*cuadrados?)/,
  ];

  for (const pattern of m2Patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const m2 = parseFloat(match[1]);
      return m2 / 10000; // Convert m² to hectares
    }
  }

  return null;
}

function parsePrice(item: any): number | null {
  if (!item.price || item.price <= 0) return null;
  
  // MercadoLibre API returns price as number
  return item.price;
}

function calculateScore(comparable: Comparable, searchParams: SearchParams): number {
  let score = 0;
  
  // Area similarity (25%)
  const areaDiff = Math.abs(comparable.area_ha - searchParams.hectareas) / searchParams.hectareas;
  const areaScore = Math.max(0, 1 - areaDiff);
  score += areaScore * 0.25;
  
  // Location similarity (40%) - simplified
  const locationScore = comparable.location.toLowerCase().includes(searchParams.localidad.toLowerCase()) ? 1 : 0.3;
  score += locationScore * 0.4;
  
  // Type similarity (15%) - basic text matching
  const typeScore = comparable.title.toLowerCase().includes(searchParams.tipo_campo.toLowerCase()) ? 1 : 0.5;
  score += typeScore * 0.15;
  
  // Data quality (10%)
  let qualityScore = 0.5; // base score
  if (comparable.thumbnail) qualityScore += 0.2;
  if (comparable.lat && comparable.lng) qualityScore += 0.2;
  if (comparable.price > 0 && comparable.area_ha > 0) qualityScore += 0.1;
  score += Math.min(qualityScore, 1) * 0.1;
  
  // Freshness (10%) - assume recent for now
  score += 0.8 * 0.1;
  
  return Math.min(score, 1);
}

async function geocodeLocation(location: string): Promise<{lat: number, lng: number} | null> {
  try {
    const query = encodeURIComponent(location + ', Argentina');
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

async function searchMercadoLibreWithRetry(query: string, offset: number = 0): Promise<any> {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} - Searching MercadoLibre with query: ${query}`);
      
      const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&category=MLA1459&limit=50&offset=${offset}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Tasagro-Comparables/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Found ${data.results?.length || 0} results from MercadoLibre`);
      return data;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

async function searchComparables(params: SearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  
  // Build search query
  const query = `campo ${params.tipo_campo} ${params.hectareas} hectareas ${params.provincia} ${params.localidad}`;
  
  try {
    const mlResponse = await searchMercadoLibreWithRetry(query);
    
    if (!mlResponse.results || mlResponse.results.length === 0) {
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

    const comparables: Comparable[] = [];

    for (const item of mlResponse.results) {
      const price = parsePrice(item);
      const area_ha = parseArea(item.title);
      
      if (!price || !area_ha || area_ha <= 0) {
        continue; // Skip items without valid price or area
      }

      const price_per_ha = price / area_ha;
      
      // Basic location extraction
      const location = item.location ? 
        `${item.location.city?.name || ''}, ${item.location.state?.name || ''}`.trim().replace(/^,\s*/, '') : 
        params.localidad;

      let lat, lng;
      if (item.location?.latitude && item.location?.longitude) {
        lat = item.location.latitude;
        lng = item.location.longitude;
      } else {
        // Try geocoding as fallback
        const coords = await geocodeLocation(location);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

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
        score: 0, // Will be calculated next
        raw: item
      };

      comparable.score = calculateScore(comparable, params);
      comparables.push(comparable);
    }

    // Sort by score descending
    comparables.sort((a, b) => b.score - a.score);

    // Take top 20 results
    const topComparables = comparables.slice(0, 20);

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

    // Calculate statistics
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
    
    // Calculate confidence score based on number of comparables and average score
    const avgScore = topComparables.reduce((sum, c) => sum + c.score, 0) / topComparables.length;
    const quantityFactor = Math.min(topComparables.length / 10, 1); // Max confidence at 10+ comparables
    const confidence_score = (avgScore * 0.7) + (quantityFactor * 0.3);

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
    console.log(`Search completed in ${endTime - startTime}ms. Found ${topComparables.length} valid comparables.`);

    return response;

  } catch (error) {
    console.error('MercadoLibre search error:', error);
    throw new Error(`Error searching MercadoLibre: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provincia, localidad, hectareas, tipo_campo, radioKm = 50, page = 1 }: SearchParams = await req.json();

    // Validate required parameters
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

    const searchParams: SearchParams = { provincia, localidad, hectareas, tipo_campo, radioKm, page };
    const queryHash = generateQueryHash(searchParams);

    // Try to get from cache first
    let result = await getFromCache(queryHash);
    
    if (!result) {
      // Search MercadoLibre and cache results
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