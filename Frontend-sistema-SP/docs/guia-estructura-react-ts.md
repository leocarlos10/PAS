# Guía de Arquitectura Frontend — React + TypeScript

Análisis basado en el proyecto e-commerce existente y guía de aplicación para el sistema de seguridad perimetral.

---

## Lo que hiciste bien en el e-commerce ✅

### 1. Separación de tipos exhaustiva (`types/`)

Tener subcarpetas por dominio (`ContextType/`, `requestType/`, `TypeProps/`, `UItypes/`) es una práctica avanzada que muchos desarrolladores omiten. Al separar tipos como `CarritoResponse.ts`, `DetalleCarritoRequest.ts` y `ErrorResponse.ts` en archivos propios, el código quedó fuertemente tipado y los contratos con el backend son explícitos. Esto es exactamente lo que diferencia un proyecto TypeScript bien hecho de uno que solo usa TS como "JavaScript con tipos".

### 2. Barrel exports (`index.ts`) en cada carpeta

Cada carpeta de componentes tiene su propio `index.ts` de exportaciones. Esto permite importar así:

```typescript
// Sin barrel
import { AdminHeader } from '../components/admin/layout/AdminHeader';
import { AdminSidebar } from '../components/admin/layout/AdminSidebar';

// Con barrel ✅
import { AdminHeader, AdminSidebar } from '../components/admin/layout';
```

Limpio, mantenible y estándar en proyectos profesionales.

### 3. Componentes de estado vacío, error y skeleton por módulo

Dentro de `components/admin/categories/` y `components/admin/products/` tienes archivos como:
- `CategoryTableEmpty.tsx`
- `CategoryTableError.tsx`
- `CategoryTableSkeleton.tsx`

Esto demuestra comprensión real del ciclo de vida de la UI (carga → datos → error → vacío). Muchos proyectos académicos no cubren esto. Muy bien.

### 4. Separación de layouts por zona (`layout/` vs `admin/layout/`)

Tener un `PublicLayout.tsx` separado del `AdminLayout.tsx` es la forma correcta de manejar zonas con estructuras visuales distintas. Cada layout tiene su propio header, footer y sidebar sin mezclar lógica.

### 5. Rutas protegidas como componente (`ProtectedRoute.tsx`)

Separar la lógica de protección de rutas en su propio componente en `components/auth/` es una buena práctica. Mantiene `AppRoutes.tsx` limpio y la lógica de autorización encapsulada.

### 6. Utilidades puras bien identificadas (`utils/`)

Archivos como `cartCalculations.ts`, `cartValidations.ts`, y `cryptoUtils.ts` son funciones puras sin efectos secundarios. Tenerlos en `utils/` es correcto porque no hacen fetch ni manejan estado.

### 7. Documentación interna (`docs/`)

Tener una carpeta `docs/` con archivos como `implementacion-carrito-frontend.md` y `diagramas-flujo-sistema.md` es una práctica profesional que el 90% de proyectos académicos no tiene.

---

## Lo que debes corregir ⚠️

### Problema 1 — `cartApi.ts` está en `utils/` en vez de `api/`

**Qué pasó:** `utils/carritoUtils/cartApi.ts` es una función que hace fetch al backend, pero está dentro de `utils/`. Las utilidades deben ser funciones puras (sin red, sin estado). Mezclar llamadas HTTP con helpers de cálculo rompe la separación de responsabilidades.

**Regla:** `utils/` solo para funciones puras. Todo lo que toque la red va en `api/`.

```
❌ utils/carritoUtils/cartApi.ts
✅ api/carrito.api.ts
```

Lo mismo aplica para `utils/requestUtils/ApiRequest.ts` y `utils/requestUtils/handleApiResponse.ts` — estos pertenecen a `api/`.

---

### Problema 2 — El Context acumuló demasiado código

**Qué pasó:** `Carrito.Context.tsx` terminó con demasiadas líneas porque mezcló tres responsabilidades:

| Responsabilidad | Pertenece a |
|---|---|
| Crear el contexto y el Provider | `context/` |
| Lógica de negocio (agregar, quitar, calcular) | `hooks/` |
| Llamadas al backend | `api/` |

**La regla de los tres niveles:**

```
api/          → funciones puras que hablan con el backend (fetch)
context/      → solo useState + createContext + Provider (<40 líneas)
hooks/        → consume context + llama a api + contiene lógica
```

**Ejemplo correcto:**

```typescript
// api/carrito.api.ts — solo fetch
export const agregarItemAPI = async (item: DetalleCarritoRequest): Promise<CarritoResponse> => {
  const res = await fetch('/api/carrito/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleApiResponse<CarritoResponse>(res);
};

// context/Carrito.context.tsx — solo estado + Provider
const CarritoContext = createContext<CarritoContextType | null>(null);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <CarritoContext.Provider value={{ items, setItems, loading, setLoading }}>
      {children}
    </CarritoContext.Provider>
  );
};

export { CarritoContext };

// hooks/useCarrito.ts — lógica + une api y context
export const useCarrito = () => {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');

  const agregar = async (item: CartItem) => {
    ctx.setLoading(true);
    await agregarItemAPI(item);               // capa api
    ctx.setItems(prev => [...prev, item]);    // capa context
    ctx.setLoading(false);
  };

  const total = cartCalculations.calcularTotal(ctx.items); // capa utils

  return { items: ctx.items, loading: ctx.loading, agregar, total };
};
```

---

### Problema 3 — Inconsistencia de nombres en `context/`

Los archivos de contexto tienen nombres inconsistentes:
- `Auth.context.tsx` (punto como separador)
- `Carrito.Context.tsx` (mayúscula en Context)
- `CategoriaContext.tsx` (sin separador)
- `useDarkMode.context.tsx` (empieza con `use`)

**Convención recomendada:** `[nombre].context.tsx` en minúsculas con punto como separador.

```
❌ Carrito.Context.tsx
❌ CategoriaContext.tsx
❌ useDarkMode.context.tsx
✅ carrito.context.tsx
✅ categoria.context.tsx
✅ darkMode.context.tsx
```

---

### Problema 4 — `useDarkMode` no debería estar en `context/`

`useDarkMode.context.tsx` es un hook que maneja una preferencia de UI local. No necesita un Provider ni compartir estado global (puede usar `localStorage` o simplemente `useState` + `useEffect` en el componente raíz). Si lo conviertes en un hook puro, se mueve a `hooks/useDarkMode.ts` y eliminas un archivo de `context/`.

---

### Problema 5 — `TypeProps/` tiene demasiada granularidad

Tener un archivo por cada tipo de props (`FeaturedProductsProps.ts`, `ProductCardProps.ts`, etc.) genera fricción innecesaria. Los tipos de props de un componente deben vivir en el mismo archivo del componente o en un `types.ts` dentro de su carpeta.

```typescript
// ❌ types/TypeProps/ProductCardProps.ts (archivo separado)

// ✅ components/home/ProductCard.tsx (en el mismo archivo)
interface ProductCardProps {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

export const ProductCard = ({ id, nombre, precio, imagen }: ProductCardProps) => { ... };
```

Solo mueve tipos a `types/` cuando son **compartidos entre múltiples componentes o módulos**.

---

## Estructura corregida del e-commerce

```
src/
├── api/                          ← NUEVA: todo lo que hace fetch
│   ├── carrito.api.ts
│   ├── productos.api.ts
│   ├── categorias.api.ts
│   ├── usuarios.api.ts
│   └── helpers/
│       ├── apiRequest.ts         ← movido desde utils/requestUtils/
│       └── handleApiResponse.ts  ← movido desde utils/requestUtils/
│
├── context/                      ← Solo Provider + useState (<40 líneas)
│   ├── carrito.context.tsx
│   ├── auth.context.tsx
│   ├── producto.context.tsx
│   ├── categoria.context.tsx
│   ├── toast.context.tsx
│   └── usuario.context.tsx
│
├── hooks/                        ← Lógica + une context con api
│   ├── useCarrito.ts
│   ├── useAuth.ts
│   ├── useProducto.ts
│   ├── useCategoria.ts
│   ├── useToast.ts
│   ├── useUsuario.ts
│   ├── useDarkMode.ts            ← movido desde context/
│   └── useProductosActivos.ts
│
├── components/                   ← Igual, está muy bien organizado
│   ├── admin/
│   ├── auth/
│   ├── catalog/
│   ├── common/
│   ├── home/
│   ├── layout/
│   ├── Toast/
│   └── ui/
│
├── pages/
│   ├── private/                  ← minúscula para consistencia
│   └── public/
│
├── routes/
│   └── AppRoutes.tsx
│
├── types/
│   ├── models/                   ← Entidades del dominio
│   │   ├── carrito.types.ts      ← CartItem, CarritoResponse, etc.
│   │   ├── producto.types.ts
│   │   ├── usuario.types.ts
│   │   └── common.types.ts       ← ErrorResponse, Response genérico
│   └── context/                  ← Tipos de los contextos (ok mantenerlos)
│       ├── auth.context.types.ts
│       └── carrito.context.types.ts
│
├── utils/                        ← Solo funciones puras, sin fetch
│   ├── cartCalculations.ts
│   ├── cartValidations.ts
│   ├── cartStorage.ts
│   ├── cryptoUtils.ts
│   ├── secureStorage.ts
│   └── imageUpload.ts
│
├── lib/
│   └── utils.ts
│
└── assets/
```

---

## Estructura para el sistema de seguridad perimetral

Aplicando todas las lecciones aprendidas, esta es la estructura ideal para el nuevo proyecto:

```
src/
├── api/
│   ├── zonas.api.ts              ← GET/POST/PUT zonas
│   ├── sensores.api.ts           ← GET estado sensores
│   ├── eventos.api.ts            ← GET historial eventos
│   ├── usuarios.api.ts           ← CRUD usuarios
│   ├── auth.api.ts               ← login/logout
│   └── helpers/
│       ├── apiRequest.ts         ← función base para fetch con headers JWT
│       └── handleApiResponse.ts  ← manejo centralizado de errores HTTP
│
├── context/
│   ├── auth.context.tsx          ← usuario autenticado + token
│   └── alert.context.tsx         ← alertas activas del sistema (si necesitas global)
│
├── hooks/
│   ├── useAuth.ts                ← login, logout, verificar sesión
│   ├── useZonas.ts               ← listar, armar, desarmar zonas
│   ├── useSensores.ts            ← estado en tiempo real de sensores
│   ├── useEventos.ts             ← historial con filtros
│   └── useUsuarios.ts            ← CRUD de usuarios (solo admin)
│
├── components/
│   ├── ui/                       ← botones, badges, modales base
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── AppLayout.tsx
│   ├── zonas/
│   │   ├── ZonaCard.tsx          ← tarjeta de zona con estado visual
│   │   ├── ZonaCardSkeleton.tsx
│   │   └── ZonaCardEmpty.tsx
│   ├── sensores/
│   │   ├── SensorBadge.tsx       ← badge NORMAL / ACTIVADO
│   │   └── SensorList.tsx
│   ├── eventos/
│   │   ├── EventoTable.tsx       ← tabla del historial
│   │   ├── EventoTableRow.tsx
│   │   └── EventoTableSkeleton.tsx
│   └── common/
│       └── LoadingSpinner.tsx
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ZonasPage.tsx
│   ├── HistorialPage.tsx
│   └── UsuariosPage.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
├── types/
│   ├── models/
│   │   ├── zona.types.ts         ← Zona, EstadoZona
│   │   ├── sensor.types.ts       ← Sensor, TipoSensor, EstadoSensor
│   │   ├── evento.types.ts       ← Evento, SeveridadEvento
│   │   ├── usuario.types.ts      ← Usuario, RolUsuario
│   │   └── common.types.ts       ← ApiResponse<T>, ErrorResponse
│   └── context/
│       └── auth.context.types.ts
│
└── utils/
    ├── formatDate.ts             ← formatear fechas del historial
    ├── getSeverityColor.ts       ← color según severidad del evento
    └── getZonaStatusLabel.ts     ← texto según estado de zona
```

---

## Reglas de oro para no repetir errores

### Regla 1 — El límite de líneas por archivo

| Tipo de archivo | Límite sugerido |
|---|---|
| Context (Provider) | ~40 líneas |
| Hook | ~80 líneas |
| Componente UI simple | ~60 líneas |
| Componente de página | ~100 líneas |
| Archivo de API | ~50 líneas por módulo |

Si un archivo supera este límite, es una señal de que tiene más de una responsabilidad.

### Regla 2 — Flujo de datos unidireccional

```
Página / Componente
      ↓  llama a
    Hook
      ↓  usa
    Context  +  API
      ↓           ↓
  Estado UI    Backend
```

Un componente **nunca** debe llamar a `fetch` directamente ni acceder al contexto sin pasar por el hook.

### Regla 3 — Pregunta de ubicación para cada archivo nuevo

Antes de crear un archivo, responde estas preguntas:

1. ¿Hace fetch al backend? → va en `api/`
2. ¿Solo eleva estado con Provider? → va en `context/`
3. ¿Contiene lógica y usa context o api? → va en `hooks/`
4. ¿Es una función pura sin red ni estado? → va en `utils/`
5. ¿Renderiza JSX? → va en `components/` o `pages/`
6. ¿Define forma de datos? → va en `types/`

### Regla 4 — Tipos compartidos vs. locales

```typescript
// Tipos locales: defínelos en el mismo archivo del componente
interface ZonaCardProps { zona: Zona; onToggle: () => void; }

// Tipos compartidos (usados en 2+ archivos): muévelos a types/models/
// zona.types.ts
export type EstadoZona = 'ACTIVA' | 'INACTIVA' | 'ALERTA';
export interface Zona {
  id: number;
  nombre: string;
  estado: EstadoZona;
}
```

### Regla 5 — Naming conventions

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de contexto | `nombre.context.tsx` | `auth.context.tsx` |
| Archivos de hook | `useNombre.ts` | `useZonas.ts` |
| Archivos de api | `nombre.api.ts` | `zonas.api.ts` |
| Archivos de tipos | `nombre.types.ts` | `zona.types.ts` |
| Componentes | `NombrePascalCase.tsx` | `ZonaCard.tsx` |
| Páginas | `NombrePage.tsx` | `ZonasPage.tsx` |

---

## Resumen visual: e-commerce → seguridad perimetral

| Aspecto | E-commerce (lo que tenías) | Seguridad Perimetral (aplica esto) |
|---|---|---|
| **Barrel exports** | ✅ Bien aplicado | ✅ Mantener igual |
| **Separación de tipos** | ✅ Muy completa | ✅ Mantener, simplificar TypeProps |
| **Context** | ❌ Demasiado grande | ✅ Solo Provider + useState |
| **Hooks** | ⚠️ Dependía del context hinchado | ✅ Toda la lógica aquí |
| **API layer** | ⚠️ En utils/ mezclado | ✅ Carpeta `api/` dedicada |
| **Skeletons / empty states** | ✅ Bien implementado | ✅ Mantener igual |
| **Naming convention** | ❌ Inconsistente | ✅ Usar `nombre.context.tsx` |
| **Layouts separados** | ✅ Bien estructurado | ✅ Mantener igual |
| **Documentación** | ✅ carpeta docs/ | ✅ Mantener igual |
