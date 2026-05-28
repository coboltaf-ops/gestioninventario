# Configuración de Vercel Blob Storage

## Problema Resuelto

El endpoint PUT `/api/data/[collection]` causaba error **EXDEV** en Vercel al intentar hacer `fs.renameSync()` de `/tmp` a `/var/task/data/`. 

La raíz causa:
- En Vercel, `/var/task/` es un filesystem **read-only**
- Intentar renombrar un archivo entre `/tmp` (writable) y `/var/task/data/` (read-only) causa error EXDEV
- El código ahora evita este problema escribiendo directamente

## Solución Actual (Sin Persistencia)

**Estado por defecto**: Los datos se guardan en `localStorage` del cliente, pero NO persisten en el servidor.

- ✅ El endpoint retorna 200 OK
- ✅ El cliente mantiene los datos en localStorage
- ❌ No hay persistencia entre recargas (a menos que uses Blob Storage)

## Cómo Habilitar Persistencia (Recomendado)

### Paso 1: Crear un Vercel Blob Store

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar el proyecto **inventario-comidas**
3. Ir a **Settings → Integrations → Blob Storage**
4. Click en **Create Blob Storage**
5. Seleccionar región (ej: us-east-1)
6. Confirmar

### Paso 2: Configurar Variable de Entorno

Vercel automáticamente creará la variable `BLOB_READ_WRITE_TOKEN` en el proyecto.

**Verificar que está configurada**:
1. Ir a **Settings → Environment Variables**
2. Buscar `BLOB_READ_WRITE_TOKEN`
3. Debe estar presente y no estar vacía

### Paso 3: Deploy

```bash
git push origin main
```

O ir a Vercel Dashboard y hacer un redeploy manual.

### Paso 4: Verificar

Una vez desplegado:
1. Abrir la app en Vercel
2. Usar la app para guardar datos
3. Recargar la página
4. Los datos deberían persistir ✅

## Cómo Funciona Ahora

### Con Blob Storage (RECOMENDADO)

```
PUT /api/data/clientes
  → db.ts: USE_BLOB = true (tiene BLOB_READ_WRITE_TOKEN)
  → blobWrite() → almacenar en Vercel Blob Storage
  → Datos persisten entre recargas ✅
```

### Sin Blob Storage (Fallback)

```
PUT /api/data/clientes
  → db.ts: USE_BLOB = false (no hay BLOB_READ_WRITE_TOKEN)
  → writeCollection() intenta fs.writeFileSync()
  → Escritura falla en /var/task/ (read-only)
  → Capturado como "no persistido", pero OK para cliente
  → Endpoint retorna 200 OK (datos en localStorage)
  → Datos NO persisten entre recargas ❌
```

## Alternativa: Usar Supabase

Si prefieres no usar Vercel Blob, puedes usar Supabase (que ya está en dependencias):

1. Conectar a Supabase
2. Reemplazar `blobWrite/blobRead` con `supabase.storage.from('data')`
3. Esto da persistencia con más control

## Debugging

### Ver si Blob Storage está activo

En desarrollo local:
```bash
echo $BLOB_READ_WRITE_TOKEN
```

En Vercel (verificar logs):
```
[API] GET usuarios
[DB] Usando Vercel Blob Storage...
```

### Ver errores de escritura

En Vercel Logs:
```
[DB] Vercel (no Blob): usuarios no se persistió, usando localStorage del cliente
```

## Resumen

- **Cambio implementado**: Remover `fs.renameSync()` que causaba EXDEV
- **Resultado**: Endpoint ahora retorna 200 OK en Vercel (sin errores)
- **Persistencia**: Depende de configurar `BLOB_READ_WRITE_TOKEN`
- **Recomendación**: Configurar Vercel Blob Storage para persistencia completa
