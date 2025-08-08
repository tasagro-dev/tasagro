import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      propiedades: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          foto_destacada: string | null
          cantidad_hectareas: number
          servicios: string[] | null
          tipo_campo: string
          ubicacion_id: string | null
          usuario_id: string
          publicada: boolean
          precio: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          foto_destacada?: string | null
          cantidad_hectareas: number
          servicios?: string[] | null
          tipo_campo: string
          ubicacion_id?: string | null
          usuario_id: string
          publicada?: boolean
          precio?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          foto_destacada?: string | null
          cantidad_hectareas?: number
          servicios?: string[] | null
          tipo_campo?: string
          ubicacion_id?: string | null
          usuario_id?: string
          publicada?: boolean
          precio?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ubicaciones: {
        Row: {
          id: string
          provincia: string
          localidad: string
          created_at: string
          updated_at: string
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
    
    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (accessToken) {
      // Ensure requests run under the user's context
      // @ts-ignore - setAuth is available in server environments
      (supabaseClient.auth as any).setAuth(accessToken);
    }

    console.log(`[${method}] ${url.pathname}`);

    // GET /propiedades - Obtener todas las propiedades con filtros opcionales
    if (method === 'GET' && pathSegments.length === 1) {
      const searchParams = url.searchParams;
      
      let query = supabaseClient
        .from('propiedades')
        .select(`
          *,
          ubicaciones:ubicacion_id (
            id,
            provincia,
            localidad
          )
        `)
        .eq('publicada', true);

      // Aplicar filtros
      if (searchParams.has('tipo_campo')) {
        query = query.eq('tipo_campo', searchParams.get('tipo_campo'));
      }
      
      if (searchParams.has('provincia')) {
        query = query.eq('ubicaciones.provincia', searchParams.get('provincia'));
      }
      
      if (searchParams.has('localidad')) {
        query = query.eq('ubicaciones.localidad', searchParams.get('localidad'));
      }
      
      if (searchParams.has('hectareas_min')) {
        query = query.gte('cantidad_hectareas', parseFloat(searchParams.get('hectareas_min') || '0'));
      }
      
      if (searchParams.has('hectareas_max')) {
        query = query.lte('cantidad_hectareas', parseFloat(searchParams.get('hectareas_max') || '999999'));
      }
      
      if (searchParams.has('precio_min')) {
        query = query.gte('precio', parseFloat(searchParams.get('precio_min') || '0'));
      }
      
      if (searchParams.has('precio_max')) {
        query = query.lte('precio', parseFloat(searchParams.get('precio_max') || '999999999'));
      }
      
      if (searchParams.has('servicios')) {
        const servicios = searchParams.get('servicios')?.split(',') || [];
        query = query.contains('servicios', servicios);
      }

      // Paginación
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching propiedades:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data, page, limit }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /propiedades/:id - Obtener una propiedad específica
    if (method === 'GET' && pathSegments.length === 2) {
      const id = pathSegments[1];
      
      const { data, error } = await supabaseClient
        .from('propiedades')
        .select(`
          *,
          ubicaciones:ubicacion_id (
            id,
            provincia,
            localidad
          )
        `)
        .eq('id', id)
        .eq('publicada', true)
        .single();

      if (error) {
        console.error('Error fetching propiedad:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /propiedades - Crear nueva propiedad
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json();
      
      // Verificar autenticación
      const { data: { user } } = await supabaseClient.auth.getUser(accessToken || '');
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle both direct property data and wrapped format
      let propiedadData;
      if (body.action === 'create' && body.propiedad) {
        propiedadData = {
          ...body.propiedad,
          usuario_id: user.id
        };
      } else {
        propiedadData = {
          ...body,
          usuario_id: user.id,
          publicada: body.publicada !== undefined ? body.publicada : false
        };
      }

      const { data, error } = await supabaseClient
        .from('propiedades')
        .insert(propiedadData)
        .select()
        .single();

      if (error) {
        console.error('Error creating propiedad:', error);
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

    // PUT /propiedades/:id - Actualizar propiedad
    if (method === 'PUT' && pathSegments.length === 2) {
      const id = pathSegments[1];
      const body = await req.json();
      
      // Verificar autenticación
      const { data: { user } } = await supabaseClient.auth.getUser(accessToken || '');
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('propiedades')
        .update(body)
        .eq('id', id)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating propiedad:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Propiedad no encontrada o no autorizado' }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /propiedades/:id - Eliminar propiedad
    if (method === 'DELETE' && pathSegments.length === 2) {
      const id = pathSegments[1];
      
      // Verificar autenticación
      const { data: { user } } = await supabaseClient.auth.getUser(accessToken || '');
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('propiedades')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error deleting propiedad:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Propiedad eliminada exitosamente' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /propiedades/user/:userId - Obtener propiedades de un usuario específico
    if (method === 'GET' && pathSegments.length === 3 && pathSegments[1] === 'user') {
      const userId = pathSegments[2];
      
      // Verificar autenticación
      const { data: { user } } = await supabaseClient.auth.getUser(accessToken || '');
      if (!user || user.id !== userId) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('propiedades')
        .select(`
          *,
          ubicaciones:ubicacion_id (
            id,
            provincia,
            localidad
          )
        `)
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user propiedades:', error);
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