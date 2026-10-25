# Roadside AAA — Roadside Vehicle Assistance & Mechanic Booking Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Test Suite](https://img.shields.io/badge/tests-17%20passing-success.svg)](server/tests/)
[![Vite Client Build](https://img.shields.io/badge/client%20build-passing-success.svg)](client/)

**Roadside AAA** is a full-stack, enterprise-grade emergency vehicle assistance and mechanic dispatch platform. It connects stranded motorists with verified nearby mechanics and towing partners during vehicular breakdowns. The platform features role-based access control (RBAC), geospatial search (`2dsphere` GeoJSON), real-time WebSocket communication (Socket.IO), interactive Leaflet GPS tracking, transparent GST-compliant invoicing, live in-app chat, and administrative dispatch oversight.

---

## 1. System Architecture

The application is architected as a modular monorepo utilizing npm workspaces:

```
roadside-aaa/
├── client/                     # Frontend SPA (React 18 + Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI, Layout, Map components
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Public, Driver, Partner, Admin views
│   │   ├── services/           # Axios API client & Socket.IO client
│   │   ├── utils/              # Geo & currency helpers
│   │   ├── App.jsx             # React Router routing tree
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API & WebSocket Engine (Express + MongoDB)
│   ├── src/
│   │   ├── config/             # DB connection with auto in-memory fallback
│   │   ├── constants/          # Roles, statuses, transition rules
│   │   ├── controllers/        # REST route controllers
│   │   ├── middleware/         # Auth, RBAC, error handlers, rate limiters
│   │   ├── models/             # Mongoose schemas with 2dsphere indexes
│   │   ├── routes/             # Versioned API routes (/api/v1)
│   │   ├── scripts/            # Deterministic development seed script
│   │   ├── services/           # State transitions, pricing, geolocation
│   │   ├── sockets/            # Authenticated Socket.IO event handler
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # HTTP + WebSocket entry point
│   ├── tests/                  # Vitest + Supertest automated test suite
│   └── package.json
│
├── docs/                       # Comprehensive documentation
│   ├── PRD.md                  # Product Requirements Document
│   ├── TECHNICAL_DOCUMENTATION.md # Architecture & system specifications
│   ├── DATABASE_SCHEMA.md      # Mongoose schemas, relationships & indexes
│   ├── API_DOCUMENTATION.md    # REST API endpoint reference
│   ├── TESTING.md              # Test strategy and test execution logs
│   └── DEPLOYMENT.md           # Production deployment guide
│
├── package.json                # Root workspace configuration
└── README.md                   # Project overview & running instructions
```

---

## 2. Key Features by Role

### 🚗 Vehicle Owners (Drivers)
- **Vehicle Garage:** Add, view, edit, and delete multiple vehicles (Registration number, Make, Model, Year, Fuel Type).
- **7-Step Emergency Booking Flow:** Fast vehicle selection, service category (Breakdown, Towing, Battery, Flat Tire, Fuel), browser geolocation with Leaflet fallback, automated nearby verified partner discovery, transparent fee estimation, and instant dispatch request.
- **Live Tracking & Interactive Map:** Real-time visualization of breakdown location and assigned mechanic coordinates with radar pulse animations.
- **In-App Messaging:** Secure, persistent messaging directly between driver and assigned partner on active requests.
- **GST Invoices:** Itemized summary including base rate, distance fees, 18% GST calculation, and printable receipt.
- **Ratings & Reviews:** 1 to 5 star rating with written feedback upon job completion.
- **Dispute Resolution:** Submit and track support complaints.

### 🔧 Mechanics & Towing Partners
- **Partner Onboarding:** Business details, experience, vehicle categories, service radius, and operating hours.
- **Availability Radar:** One-click toggle between **Online** and **Offline** status.
- **Request Radar:** View incoming requests within partner radius with distance, payout, and breakdown details.
- **Atomic Acceptance:** Concurrency-safe job acceptance preventing multiple partners from claiming the same ticket.
- **Job Lifecycle Controls:** Backend-enforced state machine (`accepted` → `en_route` → `arrived` → `in_progress` → `completed`).
- **GPS Movement Simulator:** Built-in development tool to simulate transit toward the motorist and broadcast live GPS coordinates via Socket.IO.
- **Financial Earnings Dashboard:** Real-time earnings breakdown (90% partner payout, 10% platform fee) with history.

### 🛡️ Platform Administrators
- **Executive Operations Dashboard:** Real-time metrics computed directly from database records (users, active requests, verified partners, gross service value).
- **Partner Verification Desk:** Review incoming partner registrations, examine documents, and approve, reject, or suspend partners.
- **Dispatch Supervisor:** Real-time oversight over all ongoing requests across the city.
- **Service Category Manager:** Dynamically enable/disable services and configure pricing guidance.
- **Dispute Desk:** Review complaints, assign internal staff notes, and mark complaints resolved.
- **System Audit Logs:** Immutable trail recording administrative interventions, status changes, and user updates.
- **Visual Analytics:** Interactive Recharts visual graphs tracking requests by date, service distribution, and completion rates.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (JSX), Tailwind CSS, React Router DOM v6, Leaflet & React Leaflet, Lucide React, Recharts, Axios, Canvas Confetti |
| **Backend** | Node.js (v18+), Express.js 4, Mongoose 8, Socket.IO 4, JSON Web Token (JWT), bcryptjs, Helmet, CORS, Express Rate Limit, Morgan |
| **Database** | MongoDB (v6.0+) with `2dsphere` Geospatial Indexes (plus automatic `mongodb-memory-server` dev fallback) |
| **Testing** | Vitest, Supertest, MongoDB In-Memory Server |

---

## 4. Prerequisites

Before running the application, ensure you have installed:
- **Node.js**: `v18.0.0` or higher (tested on Node v20.x)
- **npm**: `v9.0.0` or higher (tested on npm v10.x)
- **MongoDB**: (Optional) A local MongoDB instance or MongoDB Atlas cluster.
  > *Note: If no local or remote MongoDB instance is found, the server automatically starts an isolated, in-memory MongoDB server (`mongodb-memory-server`) during local development and testing, ensuring zero setup friction!*

---

## 5. Quick Start (Development)

### Step 1: Clone or Navigate to Directory
```bash
cd roadside-aaa
```

### Step 2: Install Dependencies
Install all workspace dependencies across server and client in a single command:
```bash
npm install
```

### Step 3: Configure Environment Variables

The project includes pre-configured `.env` files. If customizing:

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/roadside_aaa
JWT_SECRET=super_secret_jwt_key_roadside_aaa_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4: Seed the Database
Populate the database with verified demo accounts, vehicles, service categories, sample requests, reviews, and complaints:
```bash
npm run seed
```

### Step 5: Start Development Servers
Run both backend API and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 6. Seeded Demo Accounts

You can log in instantly using the **Quick Demo Fill** buttons on the Login page (`/login`) or by entering these credentials:

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@roadside-aaa.com` | `Admin@123456` | Full platform management access |
| **Vehicle Owner (Driver)** | `john.driver@example.com` | `Driver@123456` | 2 vehicles registered, past bookings |
| **Vehicle Owner 2** | `priya.patel@example.com` | `Driver@123456` | 1 vehicle registered |
| **Verified Mechanic** | `rajesh.mechanic@example.com` | `Partner@123456` | Verified, Online, 5★ rating |
| **Verified Mechanic 2** | `amit.verma@example.com` | `Partner@123456` | Verified, Online, 4.8★ rating |
| **Verified Towing Partner** | `vikram.towing@example.com` | `Partner@123456` | Heavy-duty flatbed tow truck |
| **Pending Partner** | `sunil.pending@example.com` | `Partner@123456` | Pending verification application |

---

## 7. Automated Testing

Run the full automated test suite verifying Authentication, RBAC, Vehicle Ownership, Booking Concurrency, State Machine transitions, and Administrator actions:

```bash
npm test
```

### Test Results
```text
 ✓ tests/auth.test.js (5 tests)
   ✓ POST /auth/register - should register a new vehicle owner
   ✓ POST /auth/register - should reject duplicate email registration
   ✓ POST /auth/login - should authenticate user and return token
   ✓ POST /auth/login - should reject invalid credentials
   ✓ GET /auth/me - should reject unauthorized requests
 ✓ tests/vehicles.test.js (4 tests)
   ✓ POST /vehicles - should create a vehicle for authenticated user
   ✓ GET /vehicles - should return only user's own vehicles
   ✓ PATCH /vehicles/:id - should update vehicle details
   ✓ DELETE /vehicles/:id - should delete vehicle
 ✓ tests/bookings.test.js (5 tests)
   ✓ POST /requests - should create roadside assistance request
   ✓ GET /partners/nearby - should discover eligible verified partners
   ✓ POST /requests/:id/accept - atomic acceptance by verified partner
   ✓ POST /requests/:id/status - should enforce strict state transition sequence
   ✓ POST /requests/:id/review - should submit rating and review
 ✓ tests/admin.test.js (3 tests)
   ✓ GET /admin/stats - should reject non-admin users
   ✓ GET /admin/stats - should return database-derived stats for admin
   ✓ PATCH /admin/partners/:id/verify - should approve partner

 Test Files  4 passed (4)
      Tests  17 passed (17)
```

---

## 8. Step-by-Step Workflow Testing Guide

To experience the full end-to-end user journey across all roles:

### 1. The Motorist Breakdown Flow
1. Navigate to `http://localhost:5173/login` and click **"Demo Driver"** to log in as John.
2. Click **"Request Assistance"** in the top navigation or dashboard.
3. **Step 1:** Select the Honda City or register a new vehicle.
4. **Step 2:** Select **Breakdown Repair** (or Towing).
5. **Step 3:** Enter breakdown notes (e.g., "Engine overheating, white smoke from hood").
6. **Step 4:** Allow browser GPS or click on the Leaflet map to set your location.
7. **Step 5:** Enter landmark ("Near HDFC Bank, MG Road").
8. **Step 6 & 7:** Inspect nearby verified partners and estimated price breakdown (Base rate + 18% GST).
9. **Step 8:** Click **Confirm & Request Assistance**.

### 2. The Partner Dispatch & Service Flow
1. Open an Incognito window (or secondary browser), visit `http://localhost:5173/login`, and click **"Demo Mechanic"** to log in as Rajesh.
2. In the Partner Dashboard, observe the **Online** status and the newly incoming assistance card under **Incoming Requests**.
3. Click **"Accept Job"**. Atomic locking assigns the request to Rajesh and rejects duplicate claims.
4. On the **Active Job** page, advance the job through its mandatory lifecycle:
   - Click **"Mark as En Route"** → Click **"Start GPS Simulator"** to watch coordinates update in real time.
   - Click **"Mark as Arrived"**.
   - Click **"Start Work"**.
   - Once resolved, enter final charge (e.g., `₹850`) and click **"Complete Job"**.
5. Inspect the **Earnings** tab to see the updated gross value, platform commission, and net payout.

### 3. The Motorist Real-Time View & Review
1. Switch back to John's Driver window.
2. Observe live status updates: **Assigned** → **En Route** → **Arrived** → **In Progress** → **Completed**.
3. Send a chat message: *"I am standing next to the silver car"* — observe instant receipt on partner side.
4. Once completed, view the **Itemized Invoice** and click **Print Receipt**.
5. Submit a 5-star rating with feedback: *"Prompt arrival, fixed the radiator hose quickly!"*.

### 4. The Administrator Oversight Flow
1. Log in as **"Demo Admin"** (`admin@roadside-aaa.com`).
2. **Dashboard:** View real-time aggregated metrics computed from the database.
3. **Partner Verification:** Review Sunil's pending partner application, inspect credentials, and click **Approve Partner**.
4. **Live Dispatch:** Inspect active and completed requests with map coordinates.
5. **Complaints Desk:** Inspect user tickets, write private staff notes, and resolve issues.
6. **Reports:** Explore charts tracking daily request volumes, service category breakdown, and completion rates.

---

## 9. Operating System Specific Commands

### Windows (PowerShell)
```powershell
# Install
npm install

# Run seed
npm run seed

# Run tests
npm test

# Run development servers
npm run dev
```

### macOS & Linux (Bash / Zsh)
```bash
# Install
npm install

# Run seed
npm run seed

# Run tests
npm test

# Run development servers
npm run dev
```

### Running MongoDB on macOS
If you wish to use an external standalone MongoDB instance rather than the built-in in-memory fallback:
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify status
brew services list
```

---

## 10. Production Build Verification

To verify that the frontend and backend are ready for production packaging:

```bash
# Build frontend
npm run build

# Output:
# vite v5.4.14 building for production...
# transforming...
# ✓ 1845 modules transformed.
# rendering chunks...
# computing gzip size...
# dist/index.html                   1.43 kB │ gzip:   0.69 kB
# dist/assets/index-xxxx.css       37.28 kB │ gzip:   7.41 kB
# dist/assets/index-xxxx.js       612.44 kB │ gzip: 174.12 kB
# ✓ built in 2.82s
```

For full cloud hosting deployment instructions on **Render**, **Vercel**, and **MongoDB Atlas**, refer to [docs/DEPLOYMENT.md](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/DEPLOYMENT.md).

---

## 11. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `EADDRINUSE: port 5000` | Another process is occupying port 5000 | Kill the process occupying port 5000 (`npx kill-port 5000` or set `PORT=5001` in `server/.env`) |
| `MongoDB connection failed` | No local MongoDB running and network blocks memory server binary | Verify Internet connectivity for the initial binary download of `mongodb-memory-server`, or set a valid `MONGODB_URI` pointing to MongoDB Atlas |
| Map tiles do not render | Browser blocking OpenStreetMap resources or missing Leaflet CSS | Leaflet CSS is imported via CDN in `index.html` and bundled in `index.css`. Ensure browser is online |
| Socket disconnected | CORS origin mismatch between client and server | Ensure `CLIENT_ORIGIN` in `server/.env` exactly matches the URL in your browser address bar |

---

## 12. Documentation Index

- [PRD (Product Requirements Document)](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/PRD.md)
- [Technical Architecture Documentation](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/TECHNICAL_DOCUMENTATION.md)
- [Database Schema & Entity Relationship](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/DATABASE_SCHEMA.md)
- [REST API Specification](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/API_DOCUMENTATION.md)
- [Testing Strategy & Test Results](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/TESTING.md)
- [Cloud Deployment Guide](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/docs/DEPLOYMENT.md)

---

## 13. License
ISC License © 2026 Roadside AAA Engineering Team.
