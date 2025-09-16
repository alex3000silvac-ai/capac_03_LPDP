const { createClient } = require('@supabase/supabase-js');

// Configuración usando las mismas credenciales del frontend
const supabaseUrl = 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.ksKfolcFrxPvxte9A2UrV5-oDWSRKtw044UGbJvrW8s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarYCrearAdmin() {
  try {
    console.log('🔧 Conectando a Supabase...');

    // Verificar usuarios existentes
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('*')
      .limit(5);

    if (errorUsuarios) {
      console.log('⚠️ Error consultando usuarios:', errorUsuarios.message);
    } else {
      console.log('📊 Usuarios existentes:', usuarios.length);
      if (usuarios.length > 0) {
        console.log('👥 Usuarios encontrados:');
        usuarios.forEach(u => {
          console.log(`   - ${u.email} (${u.rol}) - ${u.is_active ? 'Activo' : 'Inactivo'}`);
        });
      }
    }

    // Intentar crear usuario de prueba
    const email = 'admin@juridicadigital.cl';
    const password = 'Padmin123!';

    console.log('\n📝 Intentando crear usuario admin...');

    // Usar signUp para crear usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (signUpError) {
      if (signUpError.message.includes('already')) {
        console.log('✅ El usuario ya existe. Puedes usar estas credenciales:');
      } else {
        console.log('⚠️ Error al crear usuario:', signUpError.message);
      }
    } else {
      console.log('✅ Usuario creado exitosamente');

      // Si se creó el usuario, intentar crear el perfil
      if (signUpData.user) {
        const { error: perfilError } = await supabase
          .from('usuarios')
          .insert({
            id: signUpData.user.id,
            email: email,
            nombre: 'Administrador',
            rol: 'admin',
            is_active: true,
            tenant_id: signUpData.user.id
          });

        if (perfilError) {
          console.log('⚠️ Error creando perfil:', perfilError.message);
        } else {
          console.log('✅ Perfil de usuario creado');
        }
      }
    }

    console.log('\n========================================');
    console.log('🚀 CREDENCIALES PARA INGRESAR AL SISTEMA');
    console.log('========================================');
    console.log('🌐 URL: http://192.168.67.39:3000');
    console.log('📧 Email: admin@juridicadigital.cl');
    console.log('🔑 Contraseña: Padmin123!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verificarYCrearAdmin();