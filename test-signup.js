const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.ksKfolcFrxPvxte9A2UrV5-oDWSRKtw044UGbJvrW8s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  try {
    console.log('🔧 Probando registro de usuario...');

    const email = 'test@lpdp.cl';
    const password = 'Test123!';

    // Usar signup normal (como lo haría la aplicación)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      console.log('❌ Error en signup:', error.message);

      // Si el usuario ya existe, intentar login
      if (error.message.includes('already registered')) {
        console.log('💡 Usuario ya existe, probando login...');

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (loginError) {
          console.log('❌ Error en login:', loginError.message);
        } else {
          console.log('✅ Login exitoso:', loginData.user?.email);
        }
      }
    } else {
      console.log('✅ Usuario registrado exitosamente:', data.user?.email);
      console.log('📧 Confirmar email en:', data.user?.email_confirmed_at);
    }

    console.log('\n========================================');
    console.log('🚀 CREDENCIALES DE PRUEBA');
    console.log('========================================');
    console.log('🌐 URL: http://localhost:3003');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSignup();