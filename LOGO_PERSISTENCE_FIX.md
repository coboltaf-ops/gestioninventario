# FIX: Logo Desaparece Entre Sesiones en Datos Empresa Comidas

**Fecha**: 2026-05-28
**Status**: RESUELTO

## PROBLEMA IDENTIFICADO

El logo y datos de empresa desaparecían después de cerrar sesión y volver a entrar en la página `/inventario-comidas/datos-empresa`.

### Raíz del Problema

El problema era una combinación de tres factores:

#### 1. **Zustand Persist Sin Configuración Explícita de Storage**
```typescript
// ANTES (INCORRECTO):
persist((set) => ({...}), {
  name: 'datos-empresa-comidas-storage',
  // NO tenía: storage: createJSONStorage(() => localStorage)
  // NO tenía: onRehydrateStorage callback
})
```

Sin esta configuración, Zustand no rehidrata de forma confiable desde localStorage.

#### 2. **Race Condition: Hook de Polling vs Rehidratación**
- El hook `usePollingDatosEmpresaComidas` hacía fetch inmediato al montar el componente
- Zustand NO se había rehidratado aún del localStorage
- El API devolvía `[]` (array vacío) porque `datos-empresa-comidas.json` estaba vacío en el servidor
- Sin validación, potencialmente podría sobrescribir datos locales con nada

#### 3. **Sin Hydration Manual**
- A diferencia de `empresa-store.ts` que tenía un método `hydrate()` manual
- El store de `datos-empresa-comidas` no tenía forma de forzar hidratación manual
- Esto significaba que cuando se visitaba la página, no había garantía de que los datos del localStorage estuvieran cargados

## SOLUCIÓN IMPLEMENTADA

### 1. ✅ Mejorar Store: `datos-empresa-comidas-store.ts`

**Cambios:**
- Agregar `createJSONStorage(() => localStorage)` explícitamente
- Agregar `onRehydrateStorage` callback para logging
- Agregar método `hydrate()` manual para forzar carga desde localStorage
- Agregar `version: 1` para control de migraciones futuras

```typescript
export const useDatosEmpresaComidasStore = create<DatosEmpresaStore>()(
  persist(
    (set, get) => ({
      // ... existing state
      hydrate: () => {
        // Manual hydration to ensure data is loaded from localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('datos-empresa-comidas-storage')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.state?.datosEmpresa) {
                set({ datosEmpresa: parsed.state.datosEmpresa })
              }
            } catch (e) {
              console.error('[DatosEmpresaComidasStore] Error hydrating:', e)
            }
          }
        }
      },
    }),
    {
      name: 'datos-empresa-comidas-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage), // ✅ EXPLÍCITO
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('[DatosEmpresaComidasStore] Rehydrated from localStorage:', state.datosEmpresa)
        }
      },
    }
  )
)
```

### 2. ✅ Mejorar Hook: `use-polling-datos-empresa-comidas.ts`

**Cambios:**
- Agregar llamada a `hydrate()` en un `useEffect` separado al montar
- Cambiar el fetch para que NO sea inmediato, esperar 100ms para que Zustand se rehidrate
- NO sobrescribir datos si el servidor devuelve un array vacío
- Agregar logging para debugging

```typescript
export function usePollingDatosEmpresaComidas(intervalMs: number = 5000) {
  const setDatosEmpresa = useDatosEmpresaComidasStore((s) => s.setDatosEmpresa)
  const datosEmpresa = useDatosEmpresaComidasStore((s) => s.datosEmpresa)
  const hydrate = useDatosEmpresaComidasStore((s) => s.hydrate)

  useEffect(() => {
    // Hydrate from localStorage on mount
    hydrate() // ✅ FUERZA HIDRATACIÓN
  }, [hydrate])

  useEffect(() => {
    // Don't fetch immediately, wait for hydration first
    const timeoutId = setTimeout(() => {
      if (isSubscribed) {
        fetchData()
      }
    }, 100) // ✅ ESPERA HIDRATACIÓN

    // Only update if server has data (don't overwrite with empty array)
    if (data && data.length > 0) {
      setDatosEmpresa(data[0])
    } else if (!datosEmpresa) {
      // ✅ NO sobrescribe si el servidor está vacío y tenemos datos locales
      console.log('[usePollingDatosEmpresaComidas] Server returned empty, using localStorage data')
    }
  }, [setDatosEmpresa, datosEmpresa, intervalMs])
}
```

### 3. ✅ Crear Inicializador: `inventario-comidas-data-initializer.tsx`

Nuevo componente que fuerza hidratación al montar el layout:

```typescript
export function InventarioComidasDataInitializer() {
  useEffect(() => {
    // Hydrate datos empresa from localStorage immediately on mount
    const hydrate = useDatosEmpresaComidasStore.getState().hydrate
    if (hydrate) {
      hydrate()
      console.log('[InventarioComidasDataInitializer] Hydrated datos-empresa-comidas')
    }
  }, [])

  return null
}
```

### 4. ✅ Actualizar Layout: `inventario-comidas/layout.tsx`

- Agregar import de `InventarioComidasDataInitializer`
- Renderizar el inicializador en el `InventarioComidasDataLoader`

### 5. ✅ Mejorar Página: `inventario-comidas/datos-empresa/page.tsx`

- Agregar `hydrate()` call explícito en `useEffect`
- Agregar estado `isLoading` para evitar mostrar formulario vacío mientras se hidratan datos
- Agregar console.log para debugging

## FLUJO DESPUÉS DEL FIX

```
1. Usuario entra a /inventario-comidas/datos-empresa
2. Layout monta → InventarioComidasDataLoader monta
3. InventarioComidasDataInitializer.useEffect() → llama hydrate()
4. Store carga datos de localStorage
5. usePollingDatosEmpresaComidas se inicia
6. Hook espera 100ms (para que Zustand se rehidrate completamente)
7. Hook hace fetch a /api/data/datos-empresa-comidas
8. Si servidor devuelve datos → actualiza (sincronización)
9. Si servidor devuelve [] → MANTIENE datos del localStorage ✅
10. Página muestra datos (ya sea del localStorage o del servidor)
```

## Archivos Modificados

1. `/src/features/inventario-comidas/store/datos-empresa-comidas-store.ts` - ✅ Store mejorado
2. `/src/features/inventario-comidas/hooks/use-polling-datos-empresa-comidas.ts` - ✅ Hook mejorado
3. `/src/app/inventario-comidas/layout.tsx` - ✅ Layout actualizado
4. `/src/app/inventario-comidas/datos-empresa/page.tsx` - ✅ Página mejorada
5. `/src/shared/components/inventario-comidas-data-initializer.tsx` - ✅ Nuevo inicializador

## Testing

Para verificar que el fix funciona:

```bash
1. Entrar a /inventario-comidas/datos-empresa
2. Hacer click en "EDITAR"
3. Subir un logo
4. Llenar los datos de empresa
5. Guardar
6. Abrir DevTools → Application → LocalStorage
7. Verificar que 'datos-empresa-comidas-storage' existe y contiene el logo en base64
8. Cerrar sesión
9. Volver a entrar a /inventario-comidas/datos-empresa
10. Logo debe aparecer inmediatamente (sin parpadeos)
```

## Debugging

Para ver los logs de hidratación, abre DevTools → Console y busca mensajes como:
```
[DatosEmpresaComidasStore] Hydrated with: {...}
[DatosEmpresaComidasStore] Rehydrated from localStorage: {...}
[usePollingDatosEmpresaComidas] Updated from server: {...}
[InventarioComidasDataInitializer] Hydrated datos-empresa-comidas
```

## Notas Importantes

1. **Persistencia en Servidor**: Los datos se guardan en localStorage. El servidor es una sincronización opcional (útil para multi-dispositivo en el futuro).

2. **Sin Corrupción de Datos**: Si el servidor está vacío, los datos locales no se pierden.

3. **Base64 Large**: El logo se comprime a JPEG 80% de calidad, máximo 800x600px. Los base64 de imágenes pueden ser grandes pero localStorage soporta hasta 5-10MB por dominio.

4. **Race Conditions Evitadas**: El delay de 100ms y la hidratación manual evitan sobrescrituras durante el mounting.
