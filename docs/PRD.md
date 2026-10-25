# Product Requirements Document (PRD)
## Roadside AAA — Roadside Vehicle Assistance & Mechanic Booking Platform

---

### 1. Executive Summary & Problem Statement
Vehicle breakdowns on highways and city roads leave drivers in vulnerable, high-stress situations. Motorists typically encounter three severe friction points:
1. **Unpredictable response times:** Drivers spend 45-90 minutes calling uncoordinated local garages or directory numbers without knowing whether help is actually coming.
2. **Predatory and arbitrary surge pricing:** Stranded drivers are frequently price-gouged on roadside towing and emergency repairs with hidden charges.
3. **Safety and verification concerns:** Drivers have no way to verify the mechanical competence, identity, or background of technicians approaching their stranded vehicle on isolated roads.

**Roadside AAA** bridges this gap by providing an on-demand, real-time roadside assistance platform connecting vehicle owners with nearby verified auto mechanics and towing fleet operators. The platform provides live GPS tracking, standardized transparent price estimates, direct authenticated chat, and digital itemized invoices.

---

### 2. Project Objectives
- **Sub-30 Minute Dispatch:** Match vehicle owners with verified partners within a 15–25 km radius for arrival within 20–30 minutes.
- **100% Verified Partners:** Enforce strict administrative vetting of partner identity, trade certifications, and workshop infrastructure before granting dispatch rights.
- **Zero Hidden Costs:** Calculate upfront base pricing and per-kilometer towing rates on the server, requiring explicit customer authorization for any additional line items.
- **Real-Time Operational Visibility:** Provide live bidirectional GPS tracking on OpenStreetMap and persistent booking communication via WebSockets (Socket.IO).

---

### 3. Target User Personas

| Persona | Role | Core Needs & Goals |
| :--- | :--- | :--- |
| **Priya S. (Motorist / Driver)** | Vehicle Owner | Rapid emergency dispatch, clear ETA, live map tracking, verified technician identity, upfront pricing without cash surprises. |
| **Vikram S. (Master Mechanic)** | Service Partner | Consistent breakdown call volume, clear vehicle breakdown description before dispatch, guaranteed payment upon service completion. |
| **Amit P. (Towing Fleet Owner)** | Towing Partner | Accurate stranded vehicle location coordinates, distance calculation, clear tow destination, fair per-kilometer flatbed rates. |
| **Super Admin (Operations Lead)** | Administrator | Partner application verification desk, live dispatch monitoring, customer dispute resolution, operational analytics. |

---

### 4. Scope & Feature Requirements

#### 4.1. Public & Discovery Surface
- **Brand Identity & Emergency Hotline:** 24/7 hotline banner, safety pledge, and responsive automotive UI.
- **Service Catalog:** 5 primary assistance categories: Breakdown Repair, Hydraulic Flatbed Towing, Battery Jump-Start, Flat Tire & Puncture, Emergency Fuel Delivery.
- **Location-Based Discovery:** Geospatial search for nearby available partners with distance calculation and transparent pricing guidance.
- **Authentication:** Role-based registration and login with bcrypt hashing, JWT tokens, secure cookie sessions, and 1-click testing credentials.

#### 4.2. Vehicle Owner Features
- **Vehicle Garage:** Add, edit, and manage cars, SUVs, bikes, and commercial vehicles with fuel type and registration details.
- **7-Step Guided Emergency Booking Wizard:** Select vehicle, select service, describe symptoms, pin location via GPS or map click, confirm address, inspect nearby partners, and submit request.
- **Real-Time Tracking & Dispatch Progress:** Stepper from Requested → Searching → Accepted → En Route → Arrived → In Progress → Completed.
- **Live In-Booking Chat:** Direct socket-based communication between driver and assigned partner.
- **Printable Invoices:** Itemized summary including base fee, towing mileage rate, approved parts, and 5% GST.
- **Verified Reviews & Complaints:** Rate completed services (1 to 5 stars) and file disputes for administrative intervention.

#### 4.3. Mechanic & Towing Partner Features
- **Onboarding:** Application workflow with trade details, workshop base coordinates, service radius (km), and base pricing.
- **Availability Controller:** Real-time Online / Offline status toggle.
- **Incoming Radar:** Live dispatch notifications for unassigned requests within radius with atomic acceptance logic preventing double-booking.
- **Active Job Lifecycle Management:** Step controller (Mark En Route → Arrived → In Progress → Complete Job with approved additional charges).
- **GPS Location Simulator:** Built-in development tool to advance GPS coordinates towards the driver for testing without physical travel.
- **Earnings & History:** Gross service value, 10% platform fee calculation, and 90% net partner payout breakdown.

#### 4.4. Administrator Features
- **Platform Overview:** Real database-derived KPIs (active jobs, verified partners, gross service value, revenue).
- **Partner Verification Desk:** Review documentation, 1-click Approve, Reject with recorded reason, or Suspend.
- **User & Account Management:** Search by name/email/phone, filter by role/status, toggle suspension.
- **Live Dispatch Supervisor:** Map and table of ongoing emergency dispatches with audit history inspector and emergency cancellation.
- **Service Categories Manager:** Create and update base prices, per-kilometer mileage rates, and active states.
- **Complaints & Dispute Resolution:** Record private internal notes and customer resolution summaries.
- **Reports & Analytics:** Recharts visual charts for requests timeline, category distribution, status breakdown, and top partner rankings.
- **Audit Ledger:** Chronological audit trail of all administrative actions.

---

### 5. Non-Functional Requirements
- **Security:** Passwords hashed with bcrypt (salt rounds = 10); JWT stored in HttpOnly cookies / Authorization headers; CORS restricted; Helmet security headers; Rate limiting against brute-force attacks.
- **Geospatial Accuracy:** Coordinates stored in GeoJSON format `[longitude, latitude]` with MongoDB 2dsphere spatial indexing.
- **Reliability:** Graceful server shutdown; MongoDB connection resilience with in-memory zero-configuration fallback for local testing; Centralized error middleware.
- **Performance:** Frontend build minification with Vite; Leaflet vector map rendering; Socket event throttling.

---

### 6. Phase 1 Assumptions & Constraints
- **Payment Method:** Phase 1 implements transparent on-site settlement (Cash or direct UPI scan upon verified completion) and server-calculated digital invoices. Online card gateway tokens are architected in `PaymentRecord` for Phase 2.
- **Location Permissions:** Browser Geolocation API is invoked only on explicit user action with graceful fallback to manual Leaflet pin selection.
