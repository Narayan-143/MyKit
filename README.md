# MyKit

> **"Good Food. Your Way."**  
> A polished, portfolio-quality restaurant online-ordering and order-management web application engineered with Next.js (App Router), TypeScript, Tailwind CSS, MongoDB, Mongoose, and Redux Toolkit.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Folder Structure](#folder-structure)
6. [Server vs Client Components](#server-vs-client-components)
7. [Database](#database)
8. [Data Models](#data-models)
9. [API Endpoints](#api-endpoints)
10. [Redux State Management](#redux-state-management)
11. [Authentication](#authentication)
12. [Order Workflow](#order-workflow)
13. [Real-time Architecture](#real-time-architecture)
14. [Environment Variables](#environment-variables)
15. [Local Setup](#local-setup)
16. [Database Setup](#database-setup)
17. [Database Seeding](#database-seeding)
18. [Running Tests](#running-tests)
19. [Admin Demo Access](#admin-demo-access)
20. [Security Considerations](#security-considerations)
21. [Performance Considerations](#performance-considerations)
22. [Known Limitations](#known-limitations)
23. [Future Improvements](#future-improvements)
24. [Technical Decisions (Interview Q&A)](#technical-decisions)
25. [Assessment Requirement Coverage](#assessment-requirement-coverage)

---

## Overview

**MyKit** is an end-to-end culinary ordering platform designed for both customers seeking a fast, seamless food ordering experience and restaurant operators demanding an intuitive fulfillment command center. 

Built as a technical assessment for a Next.js Developer position, MyKit delivers a production-grade experience without over-engineering. It solves real-world challenges such as server-authoritative financial calculation, cart persistence across reloads, robust client and server validation, resilient session security, and automated order tracking.

---

## Features

### Customer Experience
- **Restaurant Landing Page**: Hero section with MyKit branding, tagline, restaurant story, chef picks, category navigation, quality commitments, and clear CTAs.
- **Dynamic Menu Catalog**: 28+ chef-curated items spanning 7 categories (Pizza, Burgers, Pasta, Starters, Indian, Beverages, Desserts) with realistic Indian Rupee (₹) pricing, ratings, preparation times, and high-resolution photography.
- **Instant Search & Category Filtering**: Case-insensitive instant search combined with category pills, yielding clear matching dishes or helpful empty states.
- **Interactive Shopping Cart**: Add dishes directly from cards, adjust quantities (1–50), delete items, or clear cart. Automatic calculations for subtotal, 5% GST, and grand total.
- **Cart Persistence**: Automatically synchronizes with `localStorage` and hydrates into Redux Toolkit on client mount with zero hydration errors or layout shift.
- **Slide-Over Cart Drawer & Dedicated `/cart` Page**: Quick access drawer from any page alongside a dedicated full review page.
- **Validated Checkout**: Accessible form powered by React Hook Form and Zod with strict field validations, including Indian 10-digit mobile regex (`^[6-9]\d{9}$`).
- **Simulated Payment Options**: Demo UPI, Demo Card, and Cash on Delivery with explicit demo notices.
- **Live Order Tracking (`/order/[orderNumber]`)**: Visual progression timeline (`Pending` → `Accepted` → `Preparing` → `Completed`) with automatic 5-second polling synchronization.

### Admin Experience
- **Protected Staff Portal**: Cookie-based JWT session security protecting `/admin` and `/api/admin/*` routes via Next.js Middleware.
- **Operational Dashboard (`/admin`)**: Real-time MongoDB metrics displaying Total Orders, Pending, Accepted, Preparing, Completed, and Total Revenue, paired with a recent orders table.
- **Fulfillment Queue (`/admin/orders`)**: Searchable, status-filterable table with responsive mobile card fallback, pagination controls, and rapid status transition dropdowns.
- **Order Inspector (`/admin/orders/[id]`)**: Deep-dive view of customer information, delivery coordinates, line items, timestamps, and forward-only status progression controls.

---

## Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16+ (App Router) | Hybrid Server/Client rendering, Route Handlers, Metadata |
| **Language** | TypeScript (Strict mode) | Compile-time safety and domain type modeling |
| **Styling** | Tailwind CSS v4 & Lucide Icons | Responsive styling, curated warm culinary theme, accessible icons |
| **Database** | MongoDB & Mongoose | Persistent document store with text & compound indexing |
| **State Management** | Redux Toolkit & React-Redux | Client-side cart state and local storage persistence |
| **Form Handling** | React Hook Form & Zod | Client UX validation and server-side request verification |
| **Authentication** | `jose` (JWT) & HTTP-Only Cookies | Stateless, secure admin session authentication |
| **Testing** | Vitest & React Testing Library | Unit & integration testing of business logic and components |

---

## Architecture

```
                    ┌─────────────────────────┐
                    │      Browser Client     │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
     [Customer Routes]                         [Admin Routes]
  / , /menu, /cart, /checkout           /admin/login, /admin, /admin/orders
             │                                       │
      (StoreProvider)                         (Middleware Gate)
     Redux Toolkit Cart                     HTTP-Only JWT Cookie
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Next.js Route Handlers │
                    │       (/api/*)          │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             │ Server Validation & Price Calculation │
             │   (calculateOrderTotals, Zod Schemas) │
             └───────────────────┬───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  MongoDB Atlas / Local  │
                    │   (Mongoose Schemas)    │
                    └─────────────────────────┘
```

---

## Folder Structure

```
MyKit/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Global root layout (Header, Providers, Footer)
│   │   ├── page.tsx                  # Home landing page (Server Component)
│   │   ├── loading.tsx               # Global skeleton loading state
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Design system tokens and styles
│   │   │
│   │   ├── menu/page.tsx             # Server-rendered culinary menu page
│   │   ├── cart/page.tsx             # Dedicated cart review page
│   │   ├── checkout/page.tsx         # Validated checkout form page
│   │   ├── order/[orderNumber]/page.tsx # Customer-safe live tracking
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin dashboard with live MongoDB metrics
│   │   │   ├── loading.tsx           # Admin skeleton loading
│   │   │   ├── login/page.tsx        # Staff authentication page
│   │   │   └── orders/
│   │   │       ├── page.tsx          # Order fulfillment table & filters
│   │   │       └── [id]/page.tsx     # Order detail inspector & status changer
│   │   │
│   │   └── api/
│   │       ├── menu/
│   │       │   ├── route.ts          # GET /api/menu (search, filter, pagination)
│   │       │   └── [id]/route.ts     # GET /api/menu/[id]
│   │       ├── orders/
│   │       │   ├── route.ts          # POST /api/orders (server calculation)
│   │       │   └── [orderNumber]/route.ts # GET /api/orders/[orderNumber]
│   │       └── admin/
│   │           ├── login/route.ts    # POST /api/admin/login
│   │           ├── logout/route.ts   # POST /api/admin/logout
│   │           ├── stats/route.ts    # GET /api/admin/stats
│   │           └── orders/
│   │               ├── route.ts      # GET /api/admin/orders
│   │               └── [id]/route.ts # GET & PATCH /api/admin/orders/[id]
│   │
│   ├── components/
│   │   ├── ui/                       # Button, Badge, EmptyState, LoadingSkeleton, Toast
│   │   ├── layout/                   # Header, Footer
│   │   ├── menu/                     # MenuCard, CategoryFilter, SearchBar, MenuSection
│   │   ├── cart/                     # CartDrawer
│   │   ├── admin/                    # AdminHeader, StatsCard, StatusUpdater
│   │   └── providers/                # StoreProvider (Redux + LocalStorage hydration)
│   │
│   ├── store/
│   │   ├── index.ts                  # Redux Toolkit store & typed hooks
│   │   └── cartSlice.ts              # Cart slice, reducers, & financial selectors
│   │
│   ├── models/
│   │   ├── MenuItem.ts               # Mongoose schema for dishes
│   │   └── Order.ts                  # Mongoose schema for orders
│   │
│   ├── types/
│   │   ├── menu.ts                   # MenuItem & MenuResponse interfaces
│   │   ├── order.ts                  # Order, CartItem, OrderTracking interfaces
│   │   ├── api.ts                    # Standard ApiResponse & AdminStats
│   │   └── auth.ts                   # AdminSession & Login DTO
│   │
│   ├── lib/
│   │   ├── db/mongodb.ts             # Cached Mongoose connection helper
│   │   ├── api/                      # Client-side API request abstractions
│   │   ├── auth/session.ts           # JWT sign/verify & cookie utilities
│   │   ├── constants/order.ts        # OrderStatus, PaymentMethod, Tax Rate
│   │   ├── orders/calculator.ts      # Server-authoritative price & tax engine
│   │   ├── orders/orderNumber.ts     # Collision-resistant order number generator
│   │   ├── realtime/index.ts         # Real-time event & polling abstraction
│   │   ├── validation/               # Zod schemas (checkout, order, admin)
│   │   └── utils.ts                  # Styling cn() & formatINR()
│   │
│   ├── data/seed/
│   │   ├── menuItems.ts              # 28 culinary seed items
│   │   └── seed.ts                   # Standalone database seed runner
│   │
│   ├── test/                         # Unit & integration test suites
│   └── middleware.ts                 # Route protection for /admin and /api/admin
│
├── .env.example                      # Documented environment variables template
├── .env.local                        # Ignored local environment configuration
├── vitest.config.ts                  # Vitest configuration with JSDOM
└── package.json
```

---

## Server vs Client Components

| Component / Page | Type | Rationale |
| :--- | :--- | :--- |
| `src/app/page.tsx` | **Server** | Directly loads featured dishes from MongoDB. Zero client JS overhead, superior SEO. |
| `src/app/menu/page.tsx` | **Server** | Pre-renders initial menu dishes on server; passes data to interactive child. |
| `src/app/order/[orderNumber]/page.tsx` | **Client** | Manages dynamic 5-second polling synchronization and live status progress. |
| `src/app/cart/page.tsx` | **Client** | Reads and dispatches Redux cart state, handles client interactions. |
| `src/app/checkout/page.tsx` | **Client** | Manages React Hook Form inputs, client validation, and submission state. |
| `src/app/admin/page.tsx` | **Client** | Handles periodic auto-refresh and manual sync of kitchen metrics. |
| `src/app/admin/orders/page.tsx` | **Client** | Manages search query, filter tabs, pagination, and inline status updates. |
| `src/components/layout/Header.tsx` | **Client** | Subscribes to Redux cart item counter and controls mobile drawer state. |

---

## Database

Persistent application data is managed via **MongoDB** with **Mongoose**.
The connection utility (`src/lib/db/mongodb.ts`) utilizes a global caching singleton pattern to prevent redundant connection pools during Next.js hot module reloading (HMR) in development.

---

## Data Models

### MenuItem (`src/models/MenuItem.ts`)
```typescript
{
  name: string;             // e.g. "Classic Margherita Pizza"
  slug: string;             // unique, lowercase slug
  description: string;      // recipe details
  category: string;         // "Pizza" | "Burgers" | "Pasta" | "Starters" | "Indian" | "Beverages" | "Desserts"
  price: number;            // INR price (e.g. 299)
  image: string;            // high-res food image URL
  available: boolean;       // in-stock flag
  featured: boolean;        // chef pick flag
  preparationTime: string;  // e.g. "15-20 mins"
  rating: number;           // 1.0 to 5.0
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes*: Text index on `{ name, description }` for keyword search; compound index on `{ category, available }` for menu queries.

### Order (`src/models/Order.ts`)
```typescript
{
  orderNumber: string;      // e.g. "ORD-1001", unique
  customer: {
    name: string;
    mobile: string;
    email: string;
    address: string;
  };
  items: [{
    menuItemId: string;
    name: string;
    price: number;          // Server-verified price
    quantity: number;
    image: string;
  }];
  subtotal: number;         // Server-computed
  tax: number;              // 5% GST
  total: number;            // Subtotal + Tax
  paymentMethod: "Cash on Delivery" | "Demo Card" | "Demo UPI";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Accepted" | "Preparing" | "Completed";
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes*: `{ orderNumber: 1 }` (unique), `{ createdAt: -1 }`, `{ orderStatus: 1 }`.

---

## API Endpoints

All responses adhere to a consistent structure:
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "error": { "message": "..." } }`

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu` | Public | List menu items (supports `?category=`, `?search=`, `?page=`, `?limit=`) |
| `GET` | `/api/menu/[id]` | Public | Retrieve single menu dish by ID or slug |
| `POST` | `/api/orders` | Public | Submit order; recalculates prices & tax server-side |
| `GET` | `/api/orders/[orderNumber]` | Public | Retrieve customer-safe order tracking details |
| `POST` | `/api/admin/login` | Public | Authenticate admin, returns HTTP-only session cookie |
| `POST` | `/api/admin/logout` | Protected | Invalidate admin session cookie |
| `GET` | `/api/admin/stats` | Protected | Compute live kitchen metrics and recent orders |
| `GET` | `/api/admin/orders` | Protected | Search and filter admin orders with pagination |
| `GET` | `/api/admin/orders/[id]` | Protected | Retrieve full order details |
| `PATCH` | `/api/admin/orders/[id]` | Protected | Update order status (`Pending` → `Accepted` → `Preparing` → `Completed`) |

---

## Redux State Management

Redux Toolkit is intentionally isolated to client-side cart management:
- **No Server State Bloat**: Server data (menus, orders, dashboard stats) remains on the server and is queried via API routes rather than replicated in Redux.
- **Cart Actions**: `addItem`, `removeItem`, `increaseQuantity`, `decreaseQuantity`, `clearCart`, `hydrateCart`.
- **Selectors**: `selectCartItems`, `selectCartItemCount`, `selectSubtotal`, `selectTax`, `selectGrandTotal`.
- **Tax Centralization**: The 5% tax computation is defined in one canonical location (`TAX_RATE = 0.05`).
- **Hydration Safety**: Cart items are stored in `localStorage` under `mykit_cart_items`. `StoreProvider` loads this on client mount only after initial render, eliminating React hydration mismatches.

---

## Authentication

- **Admin Session**: Authenticated via signed JWT tokens stored in an `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookie named `mykit_admin_session`.
- **Middleware Protection**: Intercepts requests targeting `/admin/*` (except `/admin/login`) and `/api/admin/*` (except `/api/admin/login`), redirecting unauthorized users to `/admin/login` or returning HTTP 401.
- **Server Verification**: Handlers re-verify tokens using the server secret key, ensuring defense-in-depth even if client spoofing is attempted.

---

## Order Workflow

```
[Customer browses Menu]
         │
[Adds Items to Cart] ──> (Redux + LocalStorage sync)
         │
[Proceeds to /checkout]
         │
[Submits Checkout Form] ──> (Client Zod validation)
         │
[POST /api/orders]
         │
    ├── 1. Validate body schema (Zod)
    ├── 2. Fetch authoritative prices from MongoDB for every item
    ├── 3. Confirm items exist and available === true
    ├── 4. Calculate subtotal = Σ(DB Price × Quantity)
    ├── 5. Calculate tax = round(subtotal × 0.05)
    ├── 6. Calculate total = subtotal + tax
    ├── 7. Generate atomic orderNumber (e.g. ORD-1005)
    └── 8. Persist Order in MongoDB
         │
[201 Created Response]
         │
    ├── Redux Cart Cleared
    └── Router pushes to /order/[orderNumber]
         │
[Live Customer Tracking] <── 5-second polling / real-time event
         │
[Admin transitions status via /admin/orders]
         │
[Customer page reflects new status automatically]
```

---

## Real-time Architecture

Order status changes triggered in the admin console automatically reflect on the customer tracking screen:
1. **Clean Abstraction**: `src/lib/realtime/index.ts` exposes `broadcastOrderStatusChange()`.
2. **Provider Agnostic**: Ready for managed services such as Pusher or Ably.
3. **Graceful Polling Fallback**: In local development without third-party API keys, the customer tracking page polls `/api/orders/[orderNumber]` every 5 seconds.
4. **Visual Indicator**: An animated "Live Status Sync" pill informs the customer of active real-time connectivity.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Configuration Parameters

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/mykit` |
| `MONGODB_DB_NAME` | Database name | `mykit` |
| `ADMIN_EMAIL` | Administrator login email | `admin@mykit.com` |
| `ADMIN_PASSWORD` | Administrator login password | `AdminSecure@123` |
| `ADMIN_JWT_SECRET` | Secret key for signing admin JWT cookies | *(min 32 character string)* |
| `REALTIME_PROVIDER` | Realtime backend (`polling`, `pusher`, `ably`) | `polling` |
| `REALTIME_CHANNEL` | Broadcast channel name | `mykit_orders` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |

---

## Local Setup

### Prerequisites
- **Node.js**: v20 or v24+
- **MongoDB**: Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)
- **npm** (or yarn / pnpm)

### Steps

1. **Clone & Install**:
   ```bash
   cd MyKit
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   ```

3. **Seed Database**:
   ```bash
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## Database Setup

1. Ensure MongoDB is active:
   - On Windows: Run `Get-Service MongoDB` in PowerShell or start MongoDB via Windows Services.
   - On macOS/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`.
2. The database `mykit` will be created automatically upon connection.

---

## Database Seeding

Run the seed command:
```bash
npm run seed
```
This populates:
- **28 realistic menu items** across 7 culinary categories with Indian Rupee (₹) pricing, ratings, preparation times, and verified images.
- **4 demonstration orders** spanning all order statuses (`Pending`, `Accepted`, `Preparing`, `Completed`) with realistic customer names and mobile numbers.

---

## Running Tests

Automated testing is configured using **Vitest** and **React Testing Library**:

```bash
# Run all unit tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- Redux cart slice actions (`addItem`, `increaseQuantity`, `decreaseQuantity`, `removeItem`, `clearCart`)
- Subtotal, 5% GST, and grand total calculations
- Zod schema validations for checkout fields and Indian mobile regex
- Order status transition rules (enforcing forward-only status updates)

---

## Admin Demo Access

- **Portal URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login Email**: `admin@mykit.com`
- **Login Password**: `AdminSecure@123`

*(These demo credentials are also displayed directly on the `/admin/login` page for fast evaluator testing).*

---

## Security Considerations

1. **Server-Side Financial Authority**: Client-side prices, subtotals, and taxes are strictly treated as presentation-only. The server looks up current prices from MongoDB, recalculates totals, and computes tax before persisting any order.
2. **Input Sanitization & Schema Validation**: All API bodies and query parameters pass through strict Zod schemas with regex constraints.
3. **Database Injection Protection**: Mongoose models and explicit regex anchoring prevent NoSQL query injection.
4. **Credential Isolation**: Admin passwords and JWT secrets are stored exclusively in environment variables and never exposed to client bundles.
5. **Cookie Hardening**: Admin tokens utilize `HttpOnly`, `SameSite=Lax`, and path isolation to prevent XSS exfiltration.

---

## Performance Considerations

1. **App Router Server Components**: Static and data-fetching components are rendered on the server, minimizing client JavaScript bundle size.
2. **MongoDB Indexing**:
   - Compound index on `{ category: 1, available: 1 }`
   - Full text index on `{ name: "text", description: "text" }`
   - Index on `{ orderNumber: 1 }` and `{ createdAt: -1 }`
3. **Image Optimization**: Remote food images from Unsplash are allowed via `next.config.ts` remote patterns with modern formats and responsive sizing.
4. **Pagination Architecture**: `/api/menu` and `/api/admin/orders` accept `page` and `limit` parameters using MongoDB `.skip()` and `.limit()` to ensure fast responses even with large catalogs.

---

## Known Limitations

- **Demo Payments**: Real payments (Stripe/Razorpay) are intentionally simulated for assessment evaluation without real credit card charges.
- **Real-Time Polling**: In local environments without Pusher credentials, order updates use 5-second polling rather than WebSockets.

---

## Future Improvements

1. Integration with Razorpay / UPI intent deep links for live transactions.
2. Push notifications via Web Push API for order milestones.
3. Driver assignment and GPS courier tracking map.
4. Multi-outlet kitchen inventory management.

---

## Technical Decisions (Interview Q&A)

### 1. Why Next.js App Router?
Next.js App Router allows Server Components by default, streaming SSR, native route handlers (`route.ts`), unified layouts, and robust metadata generation without requiring external routing libraries.

### 2. Why Server Components?
Server Components fetch data directly adjacent to the database with zero client-side JavaScript overhead. This yields faster First Contentful Paint (FCP), enhanced SEO, and keeps server secrets secure.

### 3. Why Client Components?
Client Components are used strictly where client interactivity is essential: Redux cart state, interactive quantity steppers, search inputs, modal dialogs, and form validation hooks.

### 4. Why Redux Toolkit?
Redux Toolkit provides predictable state management with centralized reducers and memoized selectors for cart calculations, preventing duplicated financial math across disjoint UI components.

### 5. Why isn't all server data stored in Redux?
Storing server data (menu items, admin statistics, order records) in Redux introduces stale cache issues and unnecessary boilerplate. Server Components and targeted API queries handle server data natively.

### 6. How does cart persistence work?
The cart items are stored in browser `localStorage`. A subscriber within `StoreProvider` writes changes to `localStorage` and dispatches `hydrateCart()` once after client mounting, avoiding SSR hydration mismatches.

### 7. How are totals calculated?
On the client, Redux selectors calculate `subtotal`, 5% GST (`Math.round(subtotal * 0.05)`), and `grandTotal`. On order submission, `/api/orders` re-fetches each item from MongoDB and independently re-calculates all financial figures.

### 8. Why are totals recalculated on the server?
Never trust the client for prices or totals. A malicious actor could inspect network requests and send a total of ₹1 for a ₹1000 feast. The server must be the sole authority on pricing.

### 9. How is MongoDB connected?
Via Mongoose using a cached connection promise attached to `globalThis` in development. This prevents exhaustion of connection pools during hot reloads.

### 10. How are APIs structured?
Using Next.js Route Handlers (`src/app/api/*`) following RESTful conventions with uniform JSON envelopes: `{ success: true, data: ... }` and `{ success: false, error: { message: ... } }`.

### 11. How is admin authentication handled?
Admins log in with verified credentials. A signed JWT containing email and role is issued inside an `HttpOnly`, `SameSite=Lax` cookie.

### 12. How are admin APIs protected?
Next.js Middleware intercepts `/api/admin/*` and verifies the JWT cookie. If missing or invalid, it immediately returns HTTP 401. Handlers also perform defensive server verification.

### 13. How does order tracking work?
When an order is created, the client is redirected to `/order/[orderNumber]`. The tracking view displays a 4-stage progression bar (`Pending` → `Accepted` → `Preparing` → `Completed`) with the active stage highlighted.

### 14. How does realtime updating work?
`src/lib/realtime/index.ts` provides a provider abstraction. For local operation without cloud credentials, customer tracking gracefully polls every 5 seconds, displaying a live synchronization status.

### 15. How would the menu scale to 1,000+ items?
By leveraging server-side MongoDB pagination (`?page=1&limit=20`), text indexing on dish names, and category indexing. Clients load only the active page window rather than parsing thousands of objects in the DOM.

### 16. How would you add pagination?
`/api/menu` already supports `page` and `limit` query parameters with `countDocuments()`, `.skip()`, and `.limit()`. The UI can render infinite scroll or page buttons.

### 17. How would you secure the application further for production?
Add rate limiting (e.g. `@upstash/ratelimit` via Redis), CSRF tokens for mutating actions, Content Security Policy (CSP) headers, and bcrypt password hashing with salt rounds.

### 18. How would you scale the system for thousands of orders?
Utilize MongoDB replica sets, read-only secondaries for analytics/dashboard queries, Redis for caching popular menu items, and Kafka / RabbitMQ for asynchronous order processing queues.

### 19. What would you change if this became a large production application?
Implement a micro-frontend architecture for restaurant chains, integrate real payment gateways (Razorpay/Stripe with webhooks), connect to thermal kitchen ticket printers (ESC/POS), and add SMS/WhatsApp notification webhooks.

---

## Assessment Requirement Coverage

| Requirement | Status | Implementation Details |
| :--- | :---: | :--- |
| **Restaurant Information** | ✅ | Home hero, restaurant story, operating hours, address, and food standards |
| **Menu Categories** | ✅ | 7 categories (Pizza, Burgers, Pasta, Starters, Indian, Beverages, Desserts) |
| **API/Data-based Menu** | ✅ | Stored in MongoDB; served via `GET /api/menu` |
| **Search & Filtering** | ✅ | Case-insensitive search bar combined with category filters |
| **Food Card Details** | ✅ | High-res image, dish name, description, INR price, prep time, rating |
| **Responsive Shopping Cart**| ✅ | Slide-over drawer and `/cart` page with quantity adjustment and removal |
| **Cart Persistence** | ✅ | Redux Toolkit state synced to `localStorage`, safe client hydration |
| **Subtotal, Tax, Grand Total** | ✅ | Item summation + 5% GST rate + Grand total in Redux selectors & server |
| **Validated Checkout** | ✅ | React Hook Form + Zod schema validation (Name, Indian Phone regex, Address) |
| **Place Order & Server Calculation**| ✅ | POST `/api/orders` recalculates totals from MongoDB prices; generates unique `ORD-XXXX` |
| **Customer Order Tracking** | ✅ | `/order/[orderNumber]` with 4-stage visual timeline and live status sync |
| **Admin Authentication** | ✅ | Cookie-based JWT auth via Next.js Middleware and `/admin/login` |
| **Admin Dashboard** | ✅ | `/admin` with 6 live MongoDB stats cards and recent orders table |
| **Admin Order Queue** | ✅ | `/admin/orders` with status filters, search, table/card responsive layouts |
| **Admin Status Transitions** | ✅ | Validated progression (`Pending` → `Accepted` → `Preparing` → `Completed`) |
| **Automated Testing** | ✅ | 15 Vitest tests + 24-step E2E integration test suite |
| **Production Build** | ✅ | `npm run build` succeeds cleanly with zero errors |

---

*MyKit — Good Food. Your Way.*
