import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      ubicaciones: {
        Row: {
          id: string
          provincia: string
          localidad: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provincia: string
          localidad: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provincia?: string
          localidad?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    console.log(`[${method}] ${url.pathname}`);

    // GET /ubicaciones - Obtener todas las ubicaciones
    if (method === 'GET' && pathSegments.length === 1) {
      const { data, error } = await supabaseClient
        .from('ubicaciones')
        .select('*')
        .order('provincia', { ascending: true })
        .order('localidad', { ascending: true });

      if (error) {
        console.error('Error fetching ubicaciones:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /ubicaciones/provincias - Obtener todas las provincias únicas
    if (method === 'GET' && pathSegments.length === 2 && pathSegments[1] === 'provincias') {
      const { data, error } = await supabaseClient
        .from('ubicaciones')
        .select('provincia')
        .order('provincia', { ascending: true });

      if (error) {
        console.error('Error fetching provincias:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extraer provincias únicas
      const provincias = [...new Set(data?.map(item => item.provincia) || [])];

      return new Response(
        JSON.stringify({ data: provincias }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /ubicaciones/localidades/:provincia - Obtener localidades de una provincia
    if (method === 'GET' && pathSegments.length === 3 && pathSegments[1] === 'localidades') {
      const provincia = decodeURIComponent(pathSegments[2]);
      
      const { data, error } = await supabaseClient
        .from('ubicaciones')
        .select('localidad')
        .eq('provincia', provincia)
        .order('localidad', { ascending: true });

      if (error) {
        console.error('Error fetching localidades:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const localidades = data?.map(item => item.localidad) || [];

      return new Response(
        JSON.stringify({ data: localidades }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /ubicaciones - Crear nueva ubicación (solo admins)
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json();
      
      // Obtener el token de autorización
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        supabaseClient.auth.setSession({
          access_token: authHeader.replace('Bearer ', ''),
          refresh_token: ''
        } as any);
      }

      // Verificar autenticación
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar si el usuario es admin
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', user.id)
        .single();

      if (!profile || profile.tipo_usuario !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Permisos insuficientes' }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('ubicaciones')
        .insert({
          provincia: body.provincia,
          localidad: body.localidad
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ubicacion:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }), 
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ruta no encontrada' }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});