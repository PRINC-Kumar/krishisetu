# KrishiSetu

KrishiSetu is a MERN-stack MVP for a B2B agricultural trading loop: farmers list harvests, buyers discover and negotiate, orders move through fulfillment, and admins verify farmers and oversee disputes.

## Tech Stack

- MongoDB, Express, React, Node.js
- JWT in httpOnly cookies
- Socket.io negotiation events
- Multer local uploads
- Tailwind CSS, Framer Motion, Recharts, react-hot-toast

## Setup

1. Copy `.env.example` to `server/.env` and update values if needed.
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Seed an admin and mandi prices:
   ```bash
   npm run seed --prefix server
   ```
4. Start both apps:
   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5001`

## Folder Structure

`server` follows a layered MVC style. Routes map endpoints, controllers orchestrate requests, services hold reusable business logic, models define MongoDB documents, middleware handles auth/errors/uploads, and sockets are isolated from the HTTP bootstrap.

`client/src` is feature-based. API files hide axios calls, contexts hold auth/socket state, route wrappers enforce login and role checks, common components are reusable, and pages are split by role.

## Role Flow

- Farmers register with phone/location and log in using OTP. They must be admin-approved before creating listings.
- Buyers register and log in with email/password, browse listings, negotiate, and place orders.
- Admins are seeded or created by an existing admin, verify farmers, view listings/orders, and flag or resolve disputes.

Every protected backend route uses `verifyToken`; role-specific routes also use `restrictTo(...)`. The frontend mirrors this with `ProtectedRoute` and `RoleBasedRoute`, but backend RBAC remains the source of truth.

## Extending

To add a feature, create a model if data is new, add controller functions, map them through a route file, expose an API helper in `client/src/api`, then build a small page/component under the relevant role folder.
