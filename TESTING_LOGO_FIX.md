# Testing Guide: Logo Persistence Fix for Vercel

## Quick Test (5 minutes)

### Prerequisites
- Access to production Vercel deployment: https://gestioninventario-comidas.vercel.app/
- Browser with DevTools (Chrome, Firefox, Safari, Edge)
- A test image file (2-3 MB JPEG or PNG)

### Step-by-Step Test

#### 1. Navigate to Datos Empresa
```
URL: https://gestioninventario-comidas.vercel.app/(main)/datos-empresa
(or if in different domain, the /datos-empresa page)
```

#### 2. Create/Edit an Empresa with Logo

**Option A: New Empresa**
- Click "Nuevo Registro"
- Fill in:
  - Nombre: "Test Empresa Logo" 
  - Tipo Identificación: (any)
  - Nro. Documento: (any)
  - (Other fields optional)
  - **Logo:** Click "Subir Logo" → Select test image (2-3 MB)
- Click "Guardar"

**Option B: Edit Existing**
- Find existing empresa in table
- Click "Edit" button
- Scroll to Logo section
- Upload new logo (2-3 MB) if not already present
- Click "Actualizar"

#### 3. Verify Storage in DevTools

**Open DevTools (F12)**

a) **Check localStorage (should NOT contain logo):**
```
DevTools → Application → Local Storage → gestioninventario-comidas.vercel.app
Search for: "empresa-storage"

Expected:
  Key: "empresa-storage"
  Value: { "state": { "empresas": [{ "id": "...", "nombre": "Test Empresa Logo", ..., "logo": "" }] }, "version": 1 }
  
  ✅ Logo field is EMPTY ("") - logo NOT in localStorage
```

b) **Check IndexedDB (SHOULD contain logo):**
```
DevTools → Application → IndexedDB → empresa-db → logos

Expected:
  Object Store: "logos"
  Contents: [
    {
      "id": "empresa-id-here",
      "logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...[VERY LONG BASE64]...==",
      "timestamp": 1714320000000
    }
  ]
  
  ✅ Logo is PRESENT and is full base64 data
```

#### 4. Verify Persistence (Critical Test)

a) **Close browser tab completely**
- Command+W (Mac) or Alt+F4 (Windows)

b) **Open new tab, navigate back to Datos Empresa**
```
URL: https://gestioninventario-comidas.vercel.app/(main)/datos-empresa
```

c) **Verify logo is still there**
- View the empresa you just saved
- Logo should display in the table preview (if applicable)
- Click "View" or "Edit" to see full logo

**Expected Result:** ✅ Logo appears (loaded from IndexedDB)

#### 5. Test IndexedDB Fallback

a) **Clear localStorage manually:**
```javascript
// In DevTools Console:
localStorage.removeItem('empresa-storage')
```

b) **F5 (refresh page)**

c) **Logo should STILL be visible**
- IndexedDB has the logo independent of localStorage

**Expected Result:** ✅ Logo still appears (from IndexedDB)

#### 6. Test LocalStorage Limit Edge Case

a) **In DevTools Console, check IndexedDB size:**
```javascript
// Approximate IndexedDB size
let total = 0;
const request = indexedDB.open('empresa-db', 1);
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('logos', 'readonly');
  const store = tx.objectStore('logos');
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = () => {
    const items = getAllRequest.result;
    items.forEach(item => {
      total += JSON.stringify(item).length;
    });
    console.log('IndexedDB logos size:', total, 'bytes');
  };
};
```

b) **Expected:** Should be 3-5 MB per logo, well within IndexedDB limits

---

## Advanced Testing (Local Development)

### Setup
```bash
cd /Users/josepalomares/aplicaciones/gestioninventario
npm run dev
# Opens at http://localhost:3000
```

### Test 1: Basic Flow
1. Go to http://localhost:3000/(main)/datos-empresa
2. Create new empresa with 2-3 MB logo
3. Check DevTools:
   - localStorage should have empty logo
   - IndexedDB should have full logo
4. Refresh page → logo persists
5. Clear localStorage → logo still persists from IndexedDB

### Test 2: Multiple Logos
1. Create 3 different empresas, each with different logo
2. Check IndexedDB → should have 3 entries, each with different logo
3. Edit one empresa → upload different logo
4. Check IndexedDB → old logo should be replaced
5. Navigate away → back → all logos persist

### Test 3: Hydration Timing
In DevTools Console, check when hydration completes:
```javascript
// Should see logs like:
// "✅ Store Zustand rehydrated (localStorage): Test Empresa Logo"
// "✅ Logo actualizado: { id: "...", nombre: "Test Empresa Logo", logoSize: 4234567 }"
// "✅ Store hidratado completamente (con logos desde IndexedDB)"
```

Expected order:
1. localStorage rehydration happens first (fast)
2. IndexedDB logo loading happens async
3. Component renders with logos populated

### Test 4: Browser Compatibility

Test on multiple browsers:

| Browser | localStorage | IndexedDB | Expected |
|---------|--------------|-----------|----------|
| Chrome/Chromium | ✅ | ✅ | Logo persists |
| Firefox | ✅ | ✅ | Logo persists |
| Safari | ✅ | ✅ | Logo persists |
| Edge | ✅ | ✅ | Logo persists |
| Vercel Edge | ✅ | ✅ | Logo persists |

---

## Troubleshooting

### Logo Disappears After Refresh

**Diagnosis:**
```javascript
// In console:
const stored = localStorage.getItem('empresa-storage');
console.log('localStorage has:', stored ? 'data' : 'empty');

const request = indexedDB.open('empresa-db', 1);
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('logos', 'readonly');
  const store = tx.objectStore('logos');
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = () => {
    console.log('IndexedDB has', getAllRequest.result.length, 'logos');
    if (getAllRequest.result.length > 0) {
      console.log('First logo size:', getAllRequest.result[0].logo.length);
    }
  };
};
```

**If localStorage is empty but IndexedDB has data:**
- ✅ This is correct behavior, hydrate() will load from IndexedDB

**If both are empty:**
- ❌ Logo was never saved. Check browser console for errors during save
- Check if `saveLogoToIndexedDB()` was called
- Check if IndexedDB is enabled in browser

### IndexedDB Not Available

**Fallback behavior:**
- If IndexedDB fails, `saveLogoToIndexedDB` silently fails
- Logo will be available in current session (in memory)
- Logo won't persist across sessions (no fallback storage)

**Enable IndexedDB:**
- Chrome: Settings → Site Settings → Cookies and data
- Firefox: about:preferences → Privacy → Enhanced Tracking Protection (disable for site)
- Safari: Develop menu → check "Allow Local Storage"

---

## Automated Testing (Jest/Vitest)

### Mock IndexedDB for Tests
```typescript
// src/features/datos-empresa/store/__tests__/empresa-store.test.ts

import { useEmpresaStore } from '../empresa-store'

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(() => ({
    result: {
      objectStoreNames: { contains: () => false },
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          put: jest.fn(),
          get: jest.fn(() => ({
            onsuccess: jest.fn(),
            onerror: jest.fn(),
          })),
        })),
        oncomplete: jest.fn(),
        onerror: jest.fn(),
      })),
    },
    onupgradeneeded: jest.fn(),
    onsuccess: jest.fn(),
    onerror: jest.fn(),
  })),
}

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

describe('useEmpresaStore', () => {
  test('saves logo to IndexedDB on updateEmpresa', async () => {
    const store = useEmpresaStore()
    const baseLogoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
    
    store.updateEmpresa('1', {
      nombre: 'Test',
      logo: baseLogoData,
    })
    
    // IndexedDB should be called with logo
    expect(mockIndexedDB.open).toHaveBeenCalledWith('empresa-db', 1)
  })

  test('hydrate loads logos from IndexedDB', async () => {
    const store = useEmpresaStore()
    await store.hydrate()
    
    // After hydration, isHydrated should be true
    expect(store.isHydrated).toBe(true)
  })
})
```

---

## Performance Monitoring

### Measure Hydration Time
```javascript
// In console:
const startTime = performance.now();
useEmpresaStore.getState().hydrate().then(() => {
  const endTime = performance.now();
  console.log('Hydration took', endTime - startTime, 'ms');
});
```

**Expected:**
- Local development: 10-50ms
- Vercel production: 50-200ms (depends on IndexedDB DB size)

### Monitor Storage Size
```javascript
// Check localStorage size
const stored = localStorage.getItem('empresa-storage');
console.log('localStorage size:', new Blob([stored]).size, 'bytes');

// Check IndexedDB size
// (See "Test 6" above)
```

**Expected:**
- localStorage: < 10 KB (no logos)
- IndexedDB: 3-5 MB per logo (acceptable)

---

## Sign-Off Checklist

- [ ] Logo uploads in Datos Empresa page
- [ ] After save, logo appears in table/list
- [ ] localStorage has EMPTY logo field
- [ ] IndexedDB has FULL logo base64 data
- [ ] After refresh (F5), logo persists
- [ ] After closing tab + reopening, logo persists
- [ ] After clearing localStorage, logo still persists from IndexedDB
- [ ] Multiple logos can coexist in IndexedDB
- [ ] Logo displays in inventario-comidas layout header
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Works on Vercel production environment

---

## Rollback Plan (If Needed)

If solution fails:

1. **Revert to previous store:**
```bash
git checkout HEAD~1 src/features/datos-empresa/store/empresa-store.ts
git checkout HEAD~1 src/app/inventario-comidas/layout.tsx
git checkout HEAD~1 src/app/(main)/datos-empresa/page.tsx
npm run dev  # Test locally
```

2. **Deploy rollback:**
```bash
git push  # Vercel auto-deploys on push
```

---

## Support

For questions or issues:
1. Check browser console for error messages (search for "❌")
2. Check DevTools IndexedDB tab for stored data
3. Review LOGO_FIX_VERCEL.md for technical details
4. Check performance timeline in DevTools
