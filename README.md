# Kosh

Kosh is a role-based procurement and inventory monitoring web application. It brings business owners, employees, and suppliers onto a single platform, covering the full cycle from low-stock alerts and requests for quotation (RFQs) through purchase orders, goods receipt notes (GRNs), invoicing, and payments.

This repository contains the frontend client, built with React and Vite. It communicates with a separate backend REST API and WebSocket service.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Application Routes](#application-routes)
- [Authentication and Session Handling](#authentication-and-session-handling)
- [Real-Time Notifications](#real-time-notifications)
- [Supplier Map](#supplier-map)

---

## Overview

Kosh provides a separate workspace for each type of user:

| Role     | Purpose                                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner    | Manages the business, warehouses, products, employees, and suppliers. Raises RFQs, evaluates quotations, approves purchase orders, makes payments, and reviews reports. |
| Employee | Joins a business through an invitation. Handles warehouse stock, orders, dispatches, and goods receipts.                                                                |
| Supplier | Responds to RFQs with quotations, fulfils and tracks orders, and manages payout details.                                                                                |

Each role has its own layout, navigation, theme, and dashboard. Access to all application routes beyond the public pages is gated by an authentication check, and each workspace is restricted to its own role.

---

## Key Features

**Owner**

- Dashboard with an overview of stock, orders, activity, and estimated savings
- Warehouse and product management, including product creation and editing
- Low-stock alerts that lead directly into RFQ creation
- RFQ management and side-by-side quotation review, with adjustable ranking weights, and acceptance
- Supplier Map to find nearby verified suppliers and send an RFQ directly
- Purchase order and invoice management with downloadable PDF invoices
- Advance and balance payment flows through Razorpay
- Goods receipt (GRN) creation, with downloadable GRN documents
- Stock dispatch to outlets and a received-stock history
- Reports covering orders, invoices, and GRNs
- Employee and supplier management, including employee invitations
- Real-time and push notifications, and an in-app AI assistant (Kosh AI)

**Employee**

- Invitation inbox with accept and decline actions
- Employee dashboard and warehouse view
- Order tracking, stock dispatch, and GRN creation
- Kosh AI assistant

**Supplier**

- Supplier onboarding and profile setup
- RFQ inbox with quotation creation and decline actions
- Quotation history
- Order list, order detail, and order progress tracking, including dispatch
- Payout account details management
- Kosh AI assistant

**Platform**

- Email and password authentication with OTP verification and reCAPTCHA
- Google and GitHub OAuth sign-in
- Password reset through OTP
- Optional "remember me" session persistence
- Multi-step onboarding for businesses, warehouses, and suppliers
- Automatic access token refresh with request retry
- Global search and independent light and dark themes for each workspace
- Public landing page with a contact form

---

## Technology Stack

| Area                      | Technology                                     |
| ------------------------- | ---------------------------------------------- |
| UI library                | React                                          |
| Build tool and dev server | Vite                                           |
| Routing                   | React Router                                   |
| Styling                   | Tailwind CSS                                   |
| State                     | React Context (auth), Redux Toolkit (theme)    |
| Notifications and toasts  | react-hot-toast                                |
| Icons                     | react-icons                                    |
| Charts                    | Recharts                                       |
| Maps                      | Google Maps JavaScript API                     |
| Payments                  | Razorpay Checkout                              |
| Real-time updates         | Native WebSocket API, Firebase Cloud Messaging |
| Language                  | JavaScript (JSX)                               |

Authentication state lives in React Context. Redux Toolkit holds the per-workspace theme, and server data is kept in local component state.

---

## Getting Started

### Prerequisites

- Node.js (an active LTS release is recommended)
- npm, yarn, or pnpm
- A running instance of the Kosh backend API
- A Google Maps API key (for the Supplier Map)

### Installation

1. Clone the repository.

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add the required environment variables.

   | Variable                   | Description                                                                                          |
   | -------------------------- | ---------------------------------------------------------------------------------------------------- |
   | `VITE_BASE_URL`            | Backend API base URL, with a trailing slash. The WebSocket host is derived from it.                  |
   | `VITE_RECAPTCHA_SITE_KEY`  | reCAPTCHA v3 site key                                                                                |
   | `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key                                                                       |
   | `VITE_MAPS_URL`            | Optional. Full URL the Supplier Map menu item opens (for example a subdomain)                        |
   | `VITE_*_API_URL`           | Full endpoint URLs for authentication, business, warehouse, product, supplier, and employee requests |

   Vite bakes these values into the build, so restart the dev server after editing `.env` and rebuild after changing them for production.

4. Start the development server.

   ```bash
   npm run dev
   ```

The application will be available at the local address printed by Vite, typically `http://localhost:5173`.

To create a production build, run `npm run build`. To preview it locally, run `npm run preview`. Serve the build as a single-page application, with unknown paths falling back to `index.html`.

---

## Application Routes

**Public**

| Path                                                 | Description                   |
| ---------------------------------------------------- | ----------------------------- |
| `/`                                                  | Landing page                  |
| `/role`                                              | Role selection                |
| `/login`, `/signup`                                  | Authentication                |
| `/registration-otp`                                  | Registration OTP verification |
| `/forgot-password`, `/verify-otp`, `/reset-password` | Password recovery             |
| `/oauth/callback`, `/github/callback`                | OAuth callbacks               |

**Onboarding (authenticated)**

| Path               | Description       |
| ------------------ | ----------------- |
| `/setup-business`  | Business details  |
| `/setup-warehouse` | Warehouse details |
| `/setup-supplier`  | Supplier profile  |
| `/complete-setup`  | Setup completion  |

**Owner (authenticated)**

| Path                                               | Description                  |
| -------------------------------------------------- | ---------------------------- |
| `/dashboard`                                       | Dashboard                    |
| `/rfq-alerts`                                      | RFQs and stock alerts        |
| `/supplier-map`                                    | Supplier Map                 |
| `/supplier-map/rfq/:supplierId`                    | Send an RFQ to one supplier  |
| `/manage-quotation/:rfqId`                         | Quotations for an RFQ        |
| `/manage-quotation/:rfqId/quotation/:quotationId`  | Quotation detail             |
| `/owner/orders`, `/owner/orders/:orderId`          | Orders                       |
| `/owner/invoices`, `/owner/invoices/:invoiceId`    | Purchase orders and invoices |
| `/goods-receipts`, `/goods-receipts/:id`           | Goods receipts               |
| `/warehouse`, `/add-products`, `/edit-product/:id` | Warehouse and products       |
| `/dispatch-stock`, `/received-stock`               | Dispatch and stock history   |
| `/reports`                                         | Reports and payments         |
| `/employees`, `/add-employee`                      | Employee management          |
| `/suppliers`, `/add-supplier`                      | Supplier management          |
| `/kosh-ai`                                         | AI assistant                 |

**Employee (authenticated)**

| Path                                                       | Description    |
| ---------------------------------------------------------- | -------------- |
| `/employee-invites`                                        | Invitations    |
| `/employee-dashboard`                                      | Dashboard      |
| `/employee-warehouse`                                      | Warehouse      |
| `/employee/orders`                                         | Orders         |
| `/employee/dispatch-stock`                                 | Dispatch       |
| `/employee/goods-receipts`, `/employee/goods-receipts/:id` | Goods receipts |
| `/employee/kosh-ai`                                        | AI assistant   |

**Supplier (authenticated)**

| Path                                            | Description        |
| ----------------------------------------------- | ------------------ |
| `/supplier-dashboard`                           | Dashboard          |
| `/supplier-rfqs`                                | Incoming RFQs      |
| `/supplier/create-quotation/:id`                | Quotation creation |
| `/quotations`                                   | Quotation history  |
| `/supplier/orders`, `/supplier/orders/:orderId` | Orders             |
| `/supplier/orders/:orderId/progress`            | Order progress     |
| `/account-details`                              | Payout details     |
| `/supplier/kosh-ai`                             | AI assistant       |

---

## Authentication and Session Handling

- The access token is held in memory within `AuthContext` and is never written to browser storage.
- The refresh token is managed by the backend as a cookie. All requests use `credentials: "include"`.
- On page load, the application attempts to restore the session by calling the refresh endpoint and then fetching the user profile.
- A scheduled refresh runs every 8 minutes while a session is active.
- `apiFetch` wraps requests and, on a `401` response, refreshes the token once and retries the original request. Concurrent refresh calls are de-duplicated, and a `429` response from the refresh endpoint temporarily blocks further attempts, honouring the `Retry-After` header.
- If refresh fails with `400`, `401`, or `403`, the user is redirected to `/login`.
- "Remember me" is stored as a flag in `localStorage` and a marker in `sessionStorage`, and decides whether a session is restored in a new browser session.
- `ProtectedRoute` guards all authenticated routes and shows a loading screen while the session is being restored. `RequireRole` restricts each workspace to its role.
- After login, the destination follows the user's role: the relevant dashboard, or role selection and the matching setup screen when no role is set.

---

## Real-Time Notifications

The `useNotificationSocket` hook establishes a WebSocket connection to `/ws/notifications/` on the backend host.

- A short-lived ticket is requested from the REST API and passed as a query parameter, so the access token itself is never placed in the socket URL.
- The protocol is derived from the configured API base URL (`wss` for HTTPS, `ws` for HTTP).
- Reconnection uses exponential backoff, starting at 3 seconds and capped at 30 seconds.
- The connection is closed cleanly on logout or component unmount.

Push notifications use Firebase Cloud Messaging through a service worker, so alerts also arrive when the app is closed.

---

## Supplier Map

The Supplier Map lists verified suppliers within 5, 10, or 50 km of the owner's warehouse, filtered by category and source (all, my suppliers, or platform). Markers and the side list stay in sync, and the owner can send an RFQ to a chosen supplier from the map.

- Add `https://your-domain.com/*` (and `http://localhost:5173/*` for development) to the Google API key's website restrictions, and enable the Maps JavaScript API with billing.
- If the map shows "This page didn't load Google Maps correctly", read the error name in the browser console. `RefererNotAllowedMapError` means the current origin is missing from the key restrictions.
- If `VITE_MAPS_URL` points to a subdomain, that subdomain must serve this same application, be added to the key restrictions, and be allowed in the backend CORS settings.
