// Script para confirmar email del usuario admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYzMTk2NCwiZXhwIjoyMDczMjA3OTY0fQ.B_ItfTDkP--ISS3OlODo4TGfyIDmW3fMzqQMttnRNQI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmAdminUser() {
  console.log('🚀 Confirmando email del usuario admin...');
  
  const email = 'admin@juridicadigital.cl';
  
  try {
    // 1. Buscar el usuario por email
    console.log('🔍 Buscando usuario:', email);
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error buscando usuarios:', listError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error('❌ Usuario no encontrado:', email);
      return;
    }
    
    console.log('👤 Usuario encontrado:', user.id);
    console.log('📧 Email confirmado:', user.email_confirmed_at ? '✅ SÍ' : '❌ NO');
    
    // 2. Actualizar usuario para confirmar email
    if (!user.email_confirmed_at) {
      console.log('📧 Confirmando email del usuario...');
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id, 
        { 
          email_confirm: true,
          user_metadata: {
            role: 'admin',
            name: 'Administrador LPDP'
          }
        }
      );
      
      if (updateError) {
        console.error('❌ Error confirmando email:', updateError.message);
        return;
      }
      
      console.log('✅ Email confirmado exitosamente');
    } else {
      console.log('✅ Email ya estaba confirmado');
    }
    
    // 3. Verificar login
    console.log('🔐 Probando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'Clave Padmin123!'
    });
    
    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
    } else {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario ID:', loginData.user.id);
      console.log('📧 Email:', loginData.user.email);
      console.log('✅ Email confirmado:', loginData.user.email_confirmed_at ? 'SÍ' : 'NO');
    }
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('🌐 URL: https://capac-03-lpdp.onrender.com');
    console.log('📧 Email: admin@juridicadigital.cl');
    console.log('🔐 Password: Clave Padmin123!');
    
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

confirmAdminUser();