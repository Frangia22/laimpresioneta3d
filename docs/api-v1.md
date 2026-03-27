# API REST v1 (DDD + Zod + OpenAPI)

La API nueva vive bajo el prefijo **`/api/v1`**. Las rutas HTML/EJS existentes (`/`, `/products`, `/admin`, etc.) se mantienen; la API es un canal paralelo para clientes JSON.

## Documentación interactiva (Swagger UI)

- **URL local:** `http://localhost:3000/api/v1/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/v1/openapi.json`

El contrato se genera a partir de los esquemas **Zod** (`app/src/api-v1/interfaces/http/schemas/`) con `@asteasolutions/zod-to-openapi`.

## Autenticación (fase actual)

Las operaciones de **escritura** (POST/PUT/DELETE en productos, servicios y categorías) requieren:

1. Misma **sesión** que el sitio (Passport + cookie).
2. Usuario con **`roleId === 1`** (administrador).

Flujo típico para probar con Swagger o `curl`:

1. `POST /singin` con `email` y `password` (igual que el formulario web; content-type `application/x-www-form-urlencoded` o el que use tu cliente).
2. Reutilizar la cookie `connect.sid` en las peticiones a `/api/v1/...`.

> Evolución recomendada: JWT o API keys solo para la API, sin acoplar al login HTML.

## Endpoints (resumen)

| Método | Ruta | Auth admin | Descripción |
|--------|------|------------|-------------|
| GET | `/api/v1/health` | No | Estado del servicio |
| GET | `/api/v1/products` | No | Listar productos |
| GET | `/api/v1/products/:id` | No | Detalle producto |
| POST | `/api/v1/products` | Sí | Crear producto |
| PUT | `/api/v1/products/:id` | Sí | Actualizar producto |
| DELETE | `/api/v1/products/:id` | Sí | Eliminar producto |
| GET | `/api/v1/services` | No | Listar servicios |
| GET | `/api/v1/services/:id` | No | Detalle servicio |
| POST | `/api/v1/services` | Sí | Crear servicio |
| PUT | `/api/v1/services/:id` | Sí | Actualizar servicio |
| DELETE | `/api/v1/services/:id` | Sí | Eliminar servicio |
| GET | `/api/v1/categories` | No | Listar categorías |
| GET | `/api/v1/categories/:id` | No | Detalle categoría |
| POST | `/api/v1/categories` | Sí | Crear categoría |
| DELETE | `/api/v1/categories/:id` | Sí | Eliminar categoría |

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

- **Domain:** `app/src/api-v1/domain/` (errores HTTP de dominio aplicación).
- **Application:** casos de uso en `app/src/api-v1/application/use-cases/`.
- **Infrastructure:** repositorios Sequelize en `app/src/api-v1/infrastructure/persistence/sequelize/`.
- **Interfaces HTTP:** router, middlewares Zod y OpenAPI en `app/src/api-v1/interfaces/http/`.

## Base de datos

La API usa los mismos modelos Sequelize que el sitio. El motor objetivo es **PostgreSQL 18** (ver `docker-compose.yaml` e imagen `postgres:18-alpine`).

Variables opcionales que sobrescriben `app/config/config.json` (ver `app/models/index.js`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_DIALECT`
