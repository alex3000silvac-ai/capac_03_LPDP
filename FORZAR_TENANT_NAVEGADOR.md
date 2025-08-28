# 🔧 SOLUCIÓN RÁPIDA - FORZAR TENANT EN NAVEGADOR

## Abre la consola del navegador (F12) y ejecuta esto:

```javascript
// 1. ESTABLECER TENANT CORRECTO
localStorage.setItem('lpdp_current_tenant', JSON.stringify({
  id: 'juridica_digital',
  company_name: 'Jurídica Digital',
  display_name: 'Jurídica Digital',
  user_id: 'ca0f7530-8176-4069-be04-d65488054274'
}));

// 2. VERIFICAR
console.log('Tenant establecido:', JSON.parse(localStorage.getItem('lpdp_current_tenant')));

// 3. RECARGAR
window.location.reload();
```

## Después de ejecutar esto:
1. La página se recargará
2. Deberías poder navegar a todos los módulos
3. Deberías ver los 15 proveedores

## Si sigue sin funcionar, ejecuta también:
```javascript
// LIMPIAR TODO Y REESTABLECER
localStorage.clear();
localStorage.setItem('lpdp_current_tenant', JSON.stringify({
  id: 'juridica_digital',
  company_name: 'Jurídica Digital',
  display_name: 'Jurídica Digital',
  user_id: 'ca0f7530-8176-4069-be04-d65488054274'
}));
sessionStorage.clear();
window.location.href = '/dashboard-dpo';
```