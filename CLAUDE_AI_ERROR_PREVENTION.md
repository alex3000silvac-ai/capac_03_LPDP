# 🛡️ SISTEMA PREVENCIÓN ERRORES CLAUDE AI

## 📋 PROTOCOLO OBLIGATORIO PRE-MODIFICACIÓN

### **ANTES DE CUALQUIER CAMBIO DE CÓDIGO:**

#### 1. **VALIDACIÓN EXPORTS/IMPORTS** 🔍
```bash
# OBLIGATORIO ejecutar antes de modificar:
rg "export.*getCurrentTenantId" --type js
rg "import.*getCurrentTenantId" --type js  
rg "\.getCurrentTenantId\(" --type js
```

#### 2. **VERIFICACIÓN DEPENDENCIAS** 🔗
```bash
# Validar que el archivo/función existe:
ls -la src/services/ratService.js
rg "getCurrentTenantId" src/services/ratService.js
```

#### 3. **TEST AUTOMÁTICO PRE-CAMBIO** 🧪
```bash
# Ejecutar build para detectar errores:
npm run build 2>&1 | grep -E "(error|Error|ERROR)" | head -5
```

#### 4. **SNAPSHOT ESTADO ACTUAL** 📸
```bash
# Guardar estado antes de cambios:
git status > pre_change_status.txt
git diff > pre_change_diff.txt
```

---

## 🚨 REGLAS CRÍTICAS PARA CLAUDE AI

### **REGLA 1: NUNCA ASUMIR - SIEMPRE VERIFICAR**
- ❌ **PROHIBIDO**: Asumir que una función existe
- ✅ **OBLIGATORIO**: Usar `rg` para verificar definición
- ✅ **OBLIGATORIO**: Leer archivo completo antes de referenciar

### **REGLA 2: CAMBIOS ATÓMICOS - UNO A LA VEZ**
- ❌ **PROHIBIDO**: Modificar 10+ archivos simultáneamente
- ✅ **OBLIGATORIO**: Cambio → Test → Verificar → Siguiente
- ✅ **OBLIGATORIO**: Si falla, rollback inmediato

### **REGLA 3: VALIDACIÓN POST-CAMBIO INMEDIATA**
- ✅ **OBLIGATORIO**: `npm run build` después de cada cambio
- ✅ **OBLIGATORIO**: Verificar console.log sin errores
- ✅ **OBLIGATORIO**: Test endpoint afectado

### **REGLA 4: DOCUMENTAR CADA ERROR**
- ✅ **OBLIGATORIO**: Crear archivo ERROR_LOG_[timestamp].md
- ✅ **OBLIGATORIO**: Incluir causa, solución, prevención
- ✅ **OBLIGATORIO**: Actualizar este archivo con nuevas reglas

---

## 🔧 COMANDOS DE VALIDACIÓN AUTOMÁTICA

### **SCRIPT PRE-MODIFICACIÓN**
```bash
#!/bin/bash
echo "🔍 VALIDANDO ESTADO SISTEMA..."

# 1. Verificar exports críticos
echo "Verificando getCurrentTenantId..."
rg "getCurrentTenantId" --type js | wc -l

# 2. Build status
echo "🛠️ Ejecutando build..."
npm run build > build_result.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Build fallido - NO PROCEDER"
    cat build_result.log | tail -10
    exit 1
fi

# 3. Verificar imports rotos
echo "🔍 Buscando imports rotos..."
rg "import.*from.*'\.\./" --type js | grep -v node_modules | head -5

echo "✅ VALIDACIÓN COMPLETA - SEGURO PROCEDER"
```

### **SCRIPT POST-MODIFICACIÓN**
```bash
#!/bin/bash
echo "🧪 VALIDANDO CAMBIOS..."

# 1. Build verification
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ROLLBACK NECESARIO"
    git checkout HEAD~1
    exit 1
fi

# 2. Runtime errors check
echo "🔍 Verificando errores runtime..."
rg "TypeError.*not a function" --type js

# 3. Supabase connectivity
echo "🗃️ Verificando Supabase..."
curl -s https://xvnfpkxbsmfhqcyvjwmz.supabase.co/rest/v1/ | head -3

echo "✅ CAMBIOS VALIDADOS Y SEGUROS"
```

---

## 🎯 SISTEMA DETECCIÓN ERRORES ESPECÍFICOS

### **DETECTOR getCurrentTenantId**
```bash
# Comando para detectar este error específico:
rg "getCurrentTenantId" --type js -A 2 -B 2 | grep -E "(import|export|function)"
```

### **DETECTOR DATOS ESTÁTICOS**
```bash
# Detectar arrays hardcodeados:
rg "const.*=.*\[.*\{" --type js | grep -v node_modules | head -10
```

### **DETECTOR IMPORTS ROTOS**
```bash
# Detectar imports inexistentes:
rg "import.*from ['\"](\./|\.\./)" --type js | head -10
```

---

## 📋 CHECKLIST OBLIGATORIO CLAUDE AI

### **ANTES DE CADA MODIFICACIÓN:**
- [ ] ¿Verifiqué que la función/archivo existe?
- [ ] ¿Ejecuté build para verificar estado?
- [ ] ¿Busqué todas las referencias con rg?
- [ ] ¿Leí el archivo completo antes de modificar?

### **DURANTE LA MODIFICACIÓN:**
- [ ] ¿Modifiqué solo 1-2 archivos máximo?
- [ ] ¿Mantuve el mismo patrón que archivos existentes?
- [ ] ¿Verifiqué imports/exports afectados?
- [ ] ¿Documenté el cambio en comentarios?

### **DESPUÉS DE LA MODIFICACIÓN:**
- [ ] ¿Ejecuté npm run build exitosamente?
- [ ] ¿Verifiqué que no hay errores console?
- [ ] ¿Testé la funcionalidad modificada?
- [ ] ¿Documenté el cambio para futura referencia?

---

## 🚫 ERRORES PROHIBIDOS PARA CLAUDE AI

### **LISTA NEGRA DE ACCIONES:**
1. ❌ Modificar >5 archivos sin validar cada uno
2. ❌ Crear nuevas funciones sin verificar nombres únicos  
3. ❌ Eliminar exports sin verificar todas las referencias
4. ❌ Asumir que localStorage/Supabase funcionará sin test
5. ❌ Hacer changes masivos sin plan step-by-step
6. ❌ Ignorar errores de build "temporalmente"
7. ❌ Modificar configuración sin backup
8. ❌ Crear archivos sin verificar convenciones existentes

---

## 🎯 GARANTÍA DE CALIDAD CLAUDE AI

### **COMPROMISO DE LA IA:**
- ✅ **VALIDAR SIEMPRE** antes de modificar
- ✅ **TEST INMEDIATO** después de cada cambio  
- ✅ **ROLLBACK AUTOMÁTICO** si algo falla
- ✅ **DOCUMENTAR TODO** para prevenir repetición
- ✅ **SEGUIR PROTOCOLO** sin excepciones

### **MÉTRICAS DE ÉXITO:**
- **0 errores getCurrentTenantId** en próximas modificaciones
- **0 datos estáticos** introducidos accidentalmente  
- **100% builds exitosos** en primer intento
- **0 referencias rotas** post-modificación

---

## 📊 MONITOREO CONTINUO

### **COMANDOS DIARIOS DE VERIFICACIÓN:**
```bash
# Ejecutar cada día para verificar salud sistema:
npm run build && echo "✅ Build OK" || echo "❌ Build FAIL"
rg "getCurrentTenantId" --type js | wc -l  # Debe ser consistente
rg "TypeError.*not a function" --type js | wc -l  # Debe ser 0
```

### **ALERTAS AUTOMÁTICAS:**
- 🚨 Si build falla → Rollback inmediato
- 🚨 Si >10 errores console → Investigación obligatoria
- 🚨 Si nuevos datos estáticos → Eliminar inmediatamente

---

**🎯 OBJETIVO: 0 ERRORES EN PRÓXIMAS MODIFICACIONES**