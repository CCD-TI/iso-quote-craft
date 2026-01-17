import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for password (using Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, username, password, advisorId, newPassword } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'login') {
      // Validate inputs
      if (!username || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Usuario y contraseña son requeridos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find advisor by username
      const { data: advisor, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Error de base de datos' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!advisor) {
        return new Response(
          JSON.stringify({ success: false, message: 'Usuario no encontrado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!advisor.password_hash) {
        return new Response(
          JSON.stringify({ success: false, message: 'Este usuario no tiene contraseña configurada' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password
      const hashedInput = await hashPassword(password);
      if (hashedInput !== advisor.password_hash) {
        return new Response(
          JSON.stringify({ success: false, message: 'Contraseña incorrecta' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return advisor data (without password)
      return new Response(
        JSON.stringify({
          success: true,
          advisor: {
            id: advisor.id,
            name: advisor.name,
            email: advisor.email,
            phone: advisor.phone,
            username: advisor.username,
            isAdmin: advisor.is_admin || false,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'set-password') {
      // Set or update password for an advisor
      if (!advisorId || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, message: 'ID de asesor y contraseña son requeridos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (newPassword.length < 4) {
        return new Response(
          JSON.stringify({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hashedPassword = await hashPassword(newPassword);

      const { error } = await supabase
        .from('advisors')
        .update({ password_hash: hashedPassword })
        .eq('id', advisorId);

      if (error) {
        console.error('Update error:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Error al actualizar contraseña' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Contraseña actualizada correctamente' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
