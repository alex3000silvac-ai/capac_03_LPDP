const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.ksKfolcFrxPvxte9A2UrV5-oDWSRKtw044UGbJvrW8s';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function crearUsuarioAdmin() {
  try {
    console.log('🔧 Conectando a Supabase...');

    // Crear usuario en Auth
    const email = 'admin@sistema.cl';
    const password = 'Admin123!';

    console.log('📝 Creando usuario admin...');

    // Primero intentar crear el usuario
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('⚠️ El usuario ya existe en Auth. Continuando...');

        // Obtener el ID del usuario existente
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          // Actualizar contraseña
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password }
          );
          if (updateError) {
            console.log('⚠️ No se pudo actualizar la contraseña:', updateError.message);
          } else {
            console.log('✅ Contraseña actualizada');
          }

          // Verificar si existe en tabla usuarios
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', existingUser.id)
            .single();

          if (userError && userError.code === 'PGRST116') {
            // No existe en tabla usuarios, crearlo
            const { error: insertError } = await supabase
              .from('usuarios')
              .insert({
                id: existingUser.id,
                email: email,
                nombre: 'Administrador',
                rol: 'admin',
                is_active: true,
                tenant_id: existingUser.id // Usar el mismo ID como tenant
              });

            if (insertError) {
              console.log('⚠️ Error creando perfil de usuario:', insertError.message);
            } else {
              console.log('✅ Perfil de usuario creado en tabla usuarios');
            }
          } else {
            console.log('✅ El usuario ya existe en la tabla usuarios');
          }
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuario creado en Auth:', authData.user.id);

      // Crear registro en tabla usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: email,
          nombre: 'Administrador',
          rol: 'admin',
          is_active: true,
          tenant_id: authData.user.id
        });

      if (insertError) {
        console.log('⚠️ Error creando perfil:', insertError.message);
      } else {
        console.log('✅ Perfil de usuario creado');
      }
    }

    console.log('\n========================================');
    console.log('✅ USUARIO ADMINISTRADOR CONFIGURADO');
    console.log('========================================');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('🌐 URL: http://192.168.67.39:3000');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearUsuarioAdmin();