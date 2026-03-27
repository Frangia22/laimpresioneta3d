# API REST v1 (DDD + Zod + OpenAPI + JWT)

La API vive bajo el prefijo **`/api/v1`**. Las rutas HTML/EJS (`/`, `/products`, `/admin`, etc.) se mantienen mientras evolucionáis el front hacia **Astro o React**; el contrato principal para nuevos clientes es esta API.

## Documentación interactiva (Swagger UI)

- **URL local:** `http://localhost:3000/api/v1/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/v1/openapi.json`

El contrato se genera a partir de esquemas **Zod** (`app/src/api-v1/interfaces/http/schemas/`) con `@asteasolutions/zod-to-openapi`. Los endpoints protegidos documentan **`BearerAuth`** (JWT de acceso).

## Autenticación recomendada (JWT)

1. **`POST /api/v1/auth/login`** con JSON `{ "email", "password" }`.
2. Respuesta: `{ "accessToken", "refreshToken", "tokenType": "Bearer" }`.
3. En las peticiones siguientes: cabecera **`Authorization: Bearer <accessToken>`**.
4. Para renovar: **`POST /api/v1/auth/refresh`** con `{ "refreshToken" }` (rota el par de tokens).
5. **`POST /api/v1/auth/logout`**: la API es **stateless**; respuesta **204** sin cuerpo — el cliente debe **borrar** los tokens almacenados.

### Variables de entorno obligatorias para JWT (`app/.env`)

```env
JWT_ACCESS_SECRET=clave_larga_y_aleatoria
JWT_REFRESH_SECRET=otra_clave_larga_y_distinta
# Opcionales:
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Sin estas claves, `login` y `refresh` responderán error de configuración del servidor.

### Front EJS (Fase 3 — API-first con JWT)

- **Login:** la vista `app/views/pages/singin.ejs` llama a **`POST /api/v1/auth/login`**, guarda `accessToken` y `refreshToken` en **`sessionStorage`** y enruta según `GET /api/v1/users/me` (admin → `/dashboard`).
- **Cliente:** `app/public/javascript/api-client.js` inyecta `Authorization: Bearer`, renueva una vez con **`POST /api/v1/auth/refresh`** ante un **401**, y expone `login` / `logout` / `me` / `apiJson`.
- **Backoffice:** `auth-guard.js` + `page-*.js` protegen formularios y listados en **cliente**; el servidor ya no bloquea esas rutas HTML con Passport (la seguridad efectiva del ABM es el **JWT** + rol en API).
- **Riesgo:** tokens en `sessionStorage` son visibles a XSS; la evolución recomendada es cookie **httpOnly** + front híbrido (Astro/React).

### Rutas web legadas (deprecadas)

| Ruta | Estado |
|------|--------|
| `POST /singin` | **410** — usar `POST /api/v1/auth/login` |
| `POST /addproduct`, `POST /addservice`, `POST /addcategory`, `POST /editproduct/:id`, `POST /editservice/:id` | **410** — usar `POST/PUT /api/v1/...` |
| `GET /deleteproduct/:id`, `GET /deleteservice/:id`, `GET /deletecategory/:id` | **410** — usar `DELETE /api/v1/...` |

### Compatibilidad (API + sesión)

El middleware de API puede aceptar **sesión Passport** si **no** se envía `Authorization: Bearer` (útil para pruebas o herramientas que comparten cookie). El panel EJS **no** depende de este modo.

Para **Swagger**, usá **Authorize** con el `accessToken` del login API.

## Endpoints (resumen)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/health` | No | Estado del servicio |
| POST | `/api/v1/auth/login` | No | Obtener tokens |
| POST | `/api/v1/auth/refresh` | No | Renovar tokens |
| POST | `/api/v1/auth/logout` | No | Indicación al cliente (204) |
| GET | `/api/v1/users/me` | Sí | Perfil del usuario autenticado |
| GET | `/api/v1/users` | Admin | Listar usuarios (solo `roleId === 1`) |
| GET | `/api/v1/products` | No | Listar productos |
| GET | `/api/v1/products/:id` | No | Detalle producto |
| POST | `/api/v1/products` | Admin | Crear producto |
| PUT | `/api/v1/products/:id` | Admin | Actualizar producto |
| DELETE | `/api/v1/products/:id` | Admin | Eliminar producto |
| GET | `/api/v1/services` | No | Listar servicios |
| GET | `/api/v1/services/:id` | No | Detalle servicio |
| POST | `/api/v1/services` | Admin | Crear servicio |
| PUT | `/api/v1/services/:id` | Admin | Actualizar servicio |
| DELETE | `/api/v1/services/:id` | Admin | Eliminar servicio |
| GET | `/api/v1/categories` | No | Listar categorías |
| GET | `/api/v1/categories/:id` | No | Detalle categoría |
| POST | `/api/v1/categories` | Admin | Crear categoría |
| DELETE | `/api/v1/categories/:id` | Admin | Eliminar categoría |

**Admin** = usuario con **`roleId === 1`**, vía Bearer o sesión.

## Errores JSON

Las respuestas bajo `/api/v1` usan formato uniforme, por ejemplo:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validación fallida",
  "details": []
}
```

En desarrollo (`NODE_ENV=development`) el manejador puede incluir `stack` para depuración.

## Arquitectura (capas)

- **Domain:** `app/src/api-v1/domain/` (errores HTTP).
- **Application:** casos de uso en `app/src/api-v1/application/use-cases/`.
- **Infrastructure:** repositorios Sequelize, JWT (`app/src/api-v1/infrastructure/`).
- **Interfaces HTTP:** router, middlewares Zod y OpenAPI en `app/src/api-v1/interfaces/http/`.

## Evolución hacia Astro / React

- **Front público y backoffice** pueden consumir solo `/api/v1` con Bearer (igual que el cliente actual en `public/javascript/`).
- El esqueleto EJS puede retirarse cuando el nuevo front cubra todas las pantallas; **Passport** puede quedar solo para registro/cierre de cookie si hace falta.
- **Patrón recomendado en Astro:** páginas estáticas + `fetch` en servidor (tokens en cookie httpOnly) o islands React con el mismo contrato OpenAPI.

## Base de datos

La API comparte modelos Sequelize con el sitio. PostgreSQL 18 en Docker (ver `docker-compose.yaml`).

Variables opcionales que sobrescriben `app/config/config.json` (`app/models/index.js`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_DIALECT`
