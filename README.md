# Kosh

Kosh is a role-based procurement and inventory management web application. It brings business owners, employees, and suppliers onto a single platform, covering the full cycle from low-stock alerts and requests for quotation (RFQs) through purchase orders, goods receipt notes (GRNs), invoicing, and payments.

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

---

## Overview

Kosh provides a separate workspace for each type of user:

| Role     | Purpose                                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner    | Manages the business, warehouses, products, employees, and suppliers. Raises RFQs, evaluates quotations, approves purchase orders, makes payments, and reviews reports. |
| Employee | Joins a business through an invitation. Handles warehouse stock, orders, dispatches, and goods receipts.                                                                |
| Supplier | Responds to RFQs with quotations, fulfils and tracks orders, and manages payout details.                                                                                |

Each role has its own layout, navigation, and dashboard. Access to all application routes beyond the public pages is gated by an authentication check.

---

## Key Features

**Owner**

- Dashboard with an overview of stock, orders, and activity
- Warehouse and product management, including product creation and editing
- Low-stock alerts that lead directly into RFQ creation
- RFQ management and side-by-side quotation review and acceptance
- Purchase order and invoice management with downloadable PDF invoices
- Advance and balance payment flows through Razorpay
- Goods receipt (GRN) creation, with downloadable GRN documents
- Stock dispatch to outlets and a received-stock history
- Reports covering orders, invoices, and GRNs
- Employee and supplier management, including employee invitations
- Real-time notifications and an in-app AI assistant (Kosh AI)

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

- Email and password authentication with OTP verification
- Google and GitHub OAuth sign-in
- Password reset through OTP
- Multi-step onboarding for businesses, warehouses, and suppliers
- Automatic access token refresh with request retry
- Public landing page with a contact form

---

## Technology Stack

| Area                      | Technology           |
| ------------------------- | -------------------- |
| UI library                | React                |
| Build tool and dev server | Vite                 |
| Routing                   | React Router         |
| Styling                   | Tailwind CSS         |
| Notifications and toasts  | react-hot-toast      |
| Icons                     | react-icons          |
| Payments                  | Razorpay Checkout    |
| Real-time updates         | Native WebSocket API |
| Language                  | JavaScript (JSX)     |

State is managed through React Context and local component state. There is no external state management library.

---

## Getting Started

### Prerequisites

- Node.js (an active LTS release is recommended)
- npm, yarn, or pnpm
- A running instance of the Kosh backend API

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

4. Start the development server.

   ```bash
   npm run dev
   ```

The application will be available at the local address printed by Vite, typically `http://localhost:5173`.

To create a production build, run `npm run build`. To preview it locally, run `npm run preview`.

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
- A scheduled refresh runs periodically while a session is active.
- `apiFetch` wraps requests and, on a `401` response, refreshes the token once and retries the original request. Concurrent refresh calls are de-duplicated, and a `429` response from the refresh endpoint temporarily blocks further attempts, honouring the `Retry-After` header.
- If refresh fails with `400`, `401`, or `403`, the user is redirected to `/login`.
- `ProtectedRoute` guards all authenticated routes and shows a loading screen while the session is being restored.
- After login, the backend returns a `next_step` value that determines the destination: the relevant dashboard, a setup screen, the invitations page, or role selection.

---

## Real-Time Notifications

The `useNotificationSocket` hook establishes a WebSocket connection to `/ws/notifications/` on the backend host.

- A short-lived ticket is requested from the REST API and passed as a query parameter, so the access token itself is never placed in the socket URL.
- The protocol is derived from the configured API base URL (`wss` for HTTPS, `ws` for HTTP).
- Reconnection uses exponential backoff, starting at 3 seconds and capped at 30 seconds.
- The connection is closed cleanly on logout or component unmount.
