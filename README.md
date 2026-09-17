# KrishiSetu - B2B Agricultural Trading Platform

KrishiSetu is a full-stack agricultural marketplace that connects farmers and buyers through a role-based trading workflow. Farmers can publish harvest listings, buyers can discover and negotiate for produce, and both parties can track orders while admins manage verification and disputes.

## Tech Stack

- MongoDB, Express, React, Node.js
- JWT access and refresh tokens in httpOnly cookies
- Socket.io real-time offer negotiation
- Multer-based local listing image uploads
- Tailwind CSS, Framer Motion, Recharts, and react-hot-toast

## Implemented Features

- Separate Farmer, Buyer, and Admin experiences with protected routes and backend role-based access control.
- Farmer registration with phone/location details, OTP login, admin verification, and listing management.
- Buyer marketplace with crop search, state and district filters, price range filters, pagination, listing details, and mandi price charts.
- Real-time buyer-farmer negotiation rooms with offer creation, acceptance, and rejection.
- End-to-end order workflow with quantity, negotiated price, COD or offline payment selection, and Pending, Accepted, Shipped, Delivered, and Cancelled statuses.
- Buyer and farmer dispute reporting with admin flagging, notes, and resolution controls.
- Email OTP password reset flow with expiry and attempt limits.
- Admin dashboards for user verification, listing oversight, order monitoring, and dispute management.

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
- Buyers register and log in with email/password, browse and filter listings, negotiate, and place orders using COD or offline payment.
- Admins are seeded or created by an existing admin, verify farmers, review listings and orders, and flag or resolve disputes.

Every protected backend route uses `verifyToken`; role-specific routes also use `restrictTo(...)`. The frontend mirrors this with `ProtectedRoute` and `RoleBasedRoute`, but backend RBAC remains the source of truth.

## Extending

To add a feature, create a model if data is new, add controller functions, map them through a route file, expose an API helper in `client/src/api`, then build a small page/component under the relevant role folder.
