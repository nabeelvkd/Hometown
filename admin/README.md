# Nattile Admin Panel

React + TypeScript (Vite) admin console for **Nattile**. It consumes the
[backend API](../backend) to manage locality data: businesses, service
providers, emergency contacts, announcements and the district/block hierarchy.

The whole console is **village-first** — district, block and village selectors
live in the top bar and scope every listing and new record. The location
hierarchy is State → District → Block → Village/Town.

## Tech stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Plain `fetch` API client with JWT auth (no heavy data layer)

## Getting started

```bash
cd admin
cp .env.example .env         # point VITE_API_BASE_URL at the backend
npm install
npm run dev                  # http://localhost:5173
```

The backend must be running (default `http://localhost:5000/api`) and seeded.

**Logins** (seeded):
- Super admin — `+919999999999` / `admin123`
- Local admin (Omassery) — `+919888888888` / `local123` (can only manage
  Omassery's content)

### Scripts

| Script             | Purpose                          |
| ------------------ | -------------------------------- |
| `npm run dev`      | Vite dev server (hot reload)     |
| `npm run build`    | Type-check + production build    |
| `npm run preview`  | Preview the production build     |
| `npm run typecheck`| Type-check only                  |

## Structure

```
src/
  api/
    client.ts        fetch wrapper, JWT handling, success/error envelope
    resources.ts     typed CRUD calls per resource
  auth/              AuthContext (login/logout, token persistence)
  location/          LocationContext (global district/block selection)
  components/
    Layout.tsx       sidebar + topbar with locality selectors
    CrudPage.tsx     generic list/create/edit/delete page engine
    Modal.tsx, fields.tsx, ProtectedRoute.tsx
  pages/             Login, Dashboard, Businesses, ServiceProviders,
                     EmergencyContacts, Announcements, Locations
  constants.ts       category/type option lists (mirror the backend)
  types.ts           shared API types
```

## Features

- JWT login; token stored in `localStorage`, auto-restored on reload, cleared
  on 401.
- Global district + block + village selectors persist across reloads and scope
  all data (village is the primary scope).
- Full CRUD for businesses, service providers, emergency contacts and
  announcements, each with search and a category/type filter. New records are
  attached to the selected village (district/block derived server-side).
- Soft deletes (hits the backend `DELETE`, which deactivates the record).
- Manage the district → block → village hierarchy on the Locations page.
- Inline server validation errors surfaced in the edit modals.

## Notes

- Most write endpoints require `super_admin` or `local_admin`; a local admin can
  only manage content in their own village (the backend enforces this).
- New listings require a specific village selected in the top bar.
- The `CrudPage` engine drives four of the pages from a small config object —
  add a new managed resource by writing one page that supplies columns, a form
  and payload mappers.
