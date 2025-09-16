module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-undef': 'warn', // Cambiar de error a warning para supabase no definido
    'no-unused-vars': 'warn', // Cambiar a warning para variables no usadas
    'react-hooks/exhaustive-deps': 'warn' // Cambiar a warning para dependencias de hooks
  },
  globals: {
    supabase: 'readonly' // Declarar supabase como global para evitar errores no-undef
  }
};