# Nattile Backend API

REST API for **Nattile** — a Kerala hyperlocal information platform. Built with
Node.js, Express, TypeScript and MongoDB (Mongoose).

Everything is **village-first**: the location hierarchy is
State → District → Block → **Village/Town**, and every piece of content
(businesses, services, emergency contacts, announcements) belongs to a village.
The higher levels (district, block) are derived from the village automatically.

## Tech stack

- Node.js + Express 4
- TypeScript (strict)
- MongoDB + Mongoose 8
- Zod for request validation
- JWT auth + role-based access control
- helmet, cors, morgan

## Getting started

```bash
cd backend
cp .env.example .env        # adjust if needed
npm install
npm run seed                # populate sample Kerala data
npm run dev                 # start with hot reload on :5000
```

Requires a running MongoDB at the `MONGO_URI` in `.env`
(default `mongodb://127.0.0.1:27017/nattile`).

### Scripts

| Script             | Purpose                                |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Dev server with hot reload             |
| `npm run build`    | Compile TypeScript to `dist/`          |
| `npm start`        | Run compiled server                    |
| `npm run typecheck`| Type-check without emitting            |
| `npm run seed`     | Reset + seed sample data               |

The seed creates two logins:
- **Super admin** — `+919999999999` / `admin123` (manages the whole platform)
- **Local admin** (Omassery village) — `+919888888888` / `local123` (manages
  only their own village)

## Project structure

```
src/
  config/        env + db connection
  constants/     enums (roles, categories, types) — no hardcoded strings
  models/        Mongoose schemas (11 collections)
  middlewares/   auth, validate, error handling
  validators/    Zod request schemas
  controllers/   request handlers
  services/      reusable business logic (home aggregation)
  routes/        Express routers
  utils/         ApiError, response envelope, asyncHandler, pagination
  scripts/       seed.ts
  app.ts         express app factory
  server.ts      bootstrap (db connect + listen + graceful shutdown)
```

## Response envelope

Success:
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 10 } }
```

Error:
```json
{ "success": false, "error": { "message": "Validation failed", "details": [ ... ] } }
```

## API reference

Base URL: `http://localhost:5000/api`

### Health
- `GET /health`

### Locations
- `GET /api/locations/districts`
- `POST /api/locations/districts` 🔒 super_admin
- `GET /api/locations/blocks?district=:id`
- `POST /api/locations/blocks` 🔒 super_admin
- `GET /api/locations/villages?block=:id` (or `?district=:id`)
- `POST /api/locations/villages` 🔒 super_admin (district derived from block)

### Home (aggregated, village-first)
- `GET /api/home?villageId=:id` (districtId / blockId also accepted; at least
  one required)
  → `{ announcements, featuredBusinesses, emergencyContacts, services }`

### Search
- `GET /api/search?q=:term&district=:id&block=:id&village=:id`

### Categories
- `GET /api/categories?kind=business|service`

> Content writes take a `village` id; `district` and `block` are derived from
> it server-side. A `local_admin` may only write within their own village.

### Businesses
- `GET /api/businesses?district=&block=&village=&category=&featured=&verified=&q=&page=&limit=`
- `GET /api/businesses/:id`
- `POST /api/businesses` 🔒 admin roles (body: `village`, not district/block)
- `PUT /api/businesses/:id` 🔒 admin roles
- `DELETE /api/businesses/:id` 🔒 admin roles (soft delete)

### Service providers
- `GET /api/service-providers?district=&block=&village=&category=&verified=&q=&page=&limit=`
- `GET /api/service-providers/:id`
- `POST | PUT | DELETE` 🔒 admin roles

### Emergency contacts
- `GET /api/emergency-contacts?district=&block=&village=&type=`
- `POST | PUT | DELETE` 🔒 admin roles

### Announcements
- `GET /api/announcements?district=&block=&village=&type=&page=&limit=`
  (auto-hides items outside their start/expiry window)
- `POST | PUT | DELETE` 🔒 admin roles

### Auth
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` 🔒 (Bearer token)

🔒 = requires `Authorization: Bearer <token>`.

## Roles

`super_admin`, `local_admin`, `business_owner`, `service_provider`, `user`.

- **super_admin** — manages the whole platform, including the district / block /
  village hierarchy.
- **local_admin** — one per village/town; manages all content **within their own
  village only** (enforced by `restrictToOwnVillage`).

Write access to listings requires `super_admin` or `local_admin`.

## Notes

- Soft deletes: `DELETE` sets `isActive: false` rather than removing records.
- Geo: businesses store a GeoJSON `location` with a `2dsphere` index, ready for
  future "near me" queries.
- Bilingual: most entities carry an optional `nameMl` / Malayalam field.
