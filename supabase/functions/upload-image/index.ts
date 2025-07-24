import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorización requerido' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticación con el token del usuario
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    await userSupabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    } as any);

    const { data: { user } } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Usuario autenticado: ${user.id}`);

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      
      if (!contentType?.includes('multipart/form-data')) {
        return new Response(
          JSON.stringify({ error: 'Content-Type debe ser multipart/form-data' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No se encontró el archivo' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Tipo de archivo no permitido. Solo se permiten: jpg, jpeg, png, webp' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return new Response(
          JSON.stringify({ error: 'El archivo es demasiado grande. Máximo permitido: 5MB' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileName = `${user.id}/${timestamp}_${randomString}.${fileExtension}`;

      // Convertir archivo a ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Subir archivo a Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('property-images')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return new Response(
          JSON.stringify({ error: `Error al subir archivo: ${error.message}` }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Obtener URL pública del archivo
      const { data: publicUrl } = supabaseClient.storage
        .from('property-images')
        .getPublicUrl(fileName);

      console.log(`Archivo subido exitosamente: ${fileName}`);

      return new Response(
        JSON.stringify({ 
          data: {
            path: data.path,
            fullPath: data.fullPath,
            publicUrl: publicUrl.publicUrl,
            fileName: fileName
          }
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE - Eliminar imagen
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const fileName = url.searchParams.get('fileName');
      
      if (!fileName) {
        return new Response(
          JSON.stringify({ error: 'fileName es requerido' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar que el archivo pertenece al usuario
      if (!fileName.startsWith(`${user.id}/`)) {
        return new Response(
          JSON.stringify({ error: 'No tiene permisos para eliminar este archivo' }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient.storage
        .from('property-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting file:', error);
        return new Response(
          JSON.stringify({ error: `Error al eliminar archivo: ${error.message}` }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Archivo eliminado exitosamente: ${fileName}`);

      return new Response(
        JSON.stringify({ message: 'Archivo eliminado exitosamente' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});