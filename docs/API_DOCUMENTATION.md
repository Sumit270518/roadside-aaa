# REST API Documentation (v1)
## Roadside AAA — Roadside Vehicle Assistance & Mechanic Booking Platform

Base URL: `/api/v1`

Standard Response Format:
- Success: `{ "success": true, "message": "Operation successful", "data": { ... } }`
- Error: `{ "success": false, "message": "Error description", "errors": [ ... ] }`

---

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /auth/register`
- **Access:** Public
- **Description:** Registers a new vehicle owner. Users cannot self-assign the administrator role.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+91 98765 11111",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "success": true, "token": "JWT_TOKEN", "data": { "user": { ... } } }`
  - `400 Bad Request`: Email already registered or validation mismatch.

#### `POST /auth/login`
- **Access:** Public
- **Description:** Authenticates user credentials, sets HttpOnly cookie, and returns JWT.
- **Request Body:** `{ "email": "john.doe@example.com", "password": "Password@123" }`
- **Responses:**
  - `200 OK`: `{ "success": true, "token": "JWT_TOKEN", "data": { "user": { ... } } }`
  - `401 Unauthorized`: Invalid email or password.
  - `403 Forbidden`: Account suspended by administrator.

#### `POST /auth/logout`
- **Access:** Private
- **Description:** Clears session cookie and invalidates client token.
- **Responses:** `200 OK`

#### `GET /auth/me`
- **Access:** Private
- **Description:** Returns profile of the current authenticated user and partner profile if applicable.
- **Responses:** `200 OK: { "success": true, "data": { "user": { ... }, "partnerProfile": { ... } } }`

#### `PATCH /auth/profile`
- **Access:** Private
- **Request Body:** `{ "name": "Updated Name", "phone": "+91 98765 99999" }`
- **Responses:** `200 OK`

---

### 2. Vehicles Endpoints (`/api/v1/vehicles`)

#### `GET /vehicles`
- **Access:** Private (Customer)
- **Description:** Returns list of vehicles owned by current user.
- **Responses:** `200 OK: { "success": true, "count": 2, "data": [ ... ] }`

#### `POST /vehicles`
- **Access:** Private (Customer)
- **Request Body:**
  ```json
  {
    "registrationNumber": "DL01-AB-1234",
    "vehicleType": "car",
    "make": "Hyundai",
    "model": "Creta",
    "year": 2022,
    "fuelType": "petrol",
    "color": "Polar White",
    "notes": "Automatic"
  }
  ```
- **Responses:** `201 Created: { "success": true, "data": { ... } }`

#### `GET /vehicles/:id`
- **Access:** Private (Owner or Admin)
- **Responses:** `200 OK`, `403 Forbidden` if user does not own vehicle.

#### `PATCH /vehicles/:id`
- **Access:** Private (Owner or Admin)
- **Request Body:** Partial vehicle fields.
- **Responses:** `200 OK`

#### `DELETE /vehicles/:id`
- **Access:** Private (Owner or Admin)
- **Description:** Deletes vehicle if no active dispatches are currently in progress.
- **Responses:** `200 OK`, `400 Bad Request` if vehicle has active dispatches in progress.

---

### 3. Service Categories Endpoints (`/api/v1/services`)

#### `GET /services`
- **Access:** Public (Returns active categories; admins can pass `?all=true`)
- **Responses:** `200 OK: { "success": true, "data": [ ... ] }`

#### `POST /services`
- **Access:** Private (Admin)
- **Request Body:** `{ "name": "Towing", "description": "...", "basePrice": 1299, "perKmRate": 40, "icon": "Truck" }`
- **Responses:** `201 Created`

#### `PATCH /services/:id`
- **Access:** Private (Admin)
- **Responses:** `200 OK`

#### `DELETE /services/:id`
- **Access:** Private (Admin)
- **Description:** Hard-deletes if unused, or soft-disables (`isActive: false`) if referenced by bookings.
- **Responses:** `200 OK`

---

### 4. Service Partners Endpoints (`/api/v1/partners`)

#### `POST /partners/register`
- **Access:** Public / Private
- **Description:** Onboarding for mechanics and towing fleets. Sets verification status to `pending`.
- **Request Body:**
  ```json
  {
    "name": "Vikram Sharma",
    "email": "vikram@sharma.com",
    "phone": "+91 98765 33333",
    "password": "Password@123",
    "partnerType": "mechanic",
    "businessName": "Sharma Auto Garage",
    "address": "Connaught Place, New Delhi",
    "coordinates": [77.2197, 28.6315],
    "serviceRadiusKm": 25,
    "pricing": { "baseFee": 499, "perKmRate": 25, "diagnosticFee": 250 }
  }
  ```
- **Responses:** `201 Created`

#### `GET /partners/nearby`
- **Access:** Public
- **Query Parameters:** `longitude` (required), `latitude` (required), `serviceCategoryId` (optional), `maxDistanceKm` (default: 50)
- **Responses:** `200 OK: { "success": true, "count": 3, "data": [ ... ] }`

#### `GET /partners/me`
- **Access:** Private (Partner)
- **Responses:** `200 OK`

#### `PATCH /partners/me`
- **Access:** Private (Partner)
- **Responses:** `200 OK`

#### `PATCH /partners/me/availability`
- **Access:** Private (Partner)
- **Description:** Toggles Online / Offline status.
- **Responses:** `200 OK: { "success": true, "data": { "isAvailable": true } }`

#### `GET /partners/me/jobs`
- **Access:** Private (Partner)
- **Query Parameters:** `status` (optional, e.g. `incoming`, `completed`)
- **Responses:** `200 OK`

#### `GET /partners/me/earnings`
- **Access:** Private (Partner)
- **Description:** Computes gross completed volume, 10% platform fee, and 90% net payout.
- **Responses:** `200 OK`

---

### 5. Service Requests Endpoints (`/api/v1/requests`)

#### `POST /requests`
- **Access:** Private (Customer)
- **Description:** Creates an emergency roadside assistance booking.
- **Request Body:**
  ```json
  {
    "vehicleId": "VEHICLE_ID",
    "serviceCategoryId": "CATEGORY_ID",
    "breakdownDescription": "Dead battery in office basement.",
    "coordinates": [77.2150, 28.6280],
    "address": "Barakhamba Road, Connaught Place",
    "landmark": "Near Metro Gate 2",
    "targetPartnerId": "OPTIONAL_PARTNER_ID"
  }
  ```
- **Responses:** `201 Created: { "success": true, "data": { "bookingReference": "AAA-...", ... } }`

#### `GET /requests`
- **Access:** Private
- **Query Parameters:** `status` (optional), `limit` (default: 20), `page` (default: 1)
- **Responses:** `200 OK`

#### `GET /requests/:id`
- **Access:** Private (Customer, Assigned Partner, or Admin)
- **Responses:** `200 OK`, `403 Forbidden` if unauthorized.

#### `POST /requests/:id/accept`
- **Access:** Private (Verified Partner)
- **Description:** Atomically assigns booking to partner using MongoDB compound filter. Prevents duplicate assignments.
- **Responses:** `200 OK`, `409 Conflict` if already accepted.

#### `POST /requests/:id/status`
- **Access:** Private (Assigned Partner or Admin)
- **Description:** Enforces valid lifecycle transitions (`en_route -> arrived -> in_progress`).
- **Request Body:** `{ "status": "en_route", "note": "Technician started trip" }`
- **Responses:** `200 OK`, `400 Bad Request` if state transition is invalid.

#### `POST /requests/:id/location`
- **Access:** Private (Assigned Partner)
- **Request Body:** `{ "coordinates": [77.2180, 28.6285], "heading": 90 }`
- **Responses:** `200 OK`

#### `POST /requests/:id/complete`
- **Access:** Private (Assigned Partner or Admin)
- **Request Body:**
  ```json
  {
    "additionalCharges": [{ "description": "Battery terminal cleaner", "amount": 150 }],
    "paymentMethod": "cash"
  }
  ```
- **Responses:** `200 OK`

#### `POST /requests/:id/cancel`
- **Access:** Private (Customer, Partner, or Admin)
- **Request Body:** `{ "reason": "Friend assisted with spare tire" }`
- **Responses:** `200 OK`

#### `GET /requests/:id/invoice`
- **Access:** Private (Customer, Partner, or Admin)
- **Responses:** `200 OK: { "success": true, "data": { "bookingReference", "pricing", ... } }`

#### `POST /requests/:id/review`
- **Access:** Private (Customer)
- **Description:** Submits rating (1–5) and feedback for completed bookings. Prevents duplicate reviews.
- **Request Body:** `{ "rating": 5, "comment": "Great service!" }`
- **Responses:** `201 Created`, `400 Bad Request` if duplicate or uncompleted.

#### `GET /requests/:id/messages`
- **Access:** Private (Authorized booking participants)
- **Responses:** `200 OK`

#### `POST /requests/:id/messages`
- **Access:** Private (Authorized booking participants)
- **Request Body:** `{ "message": "I am standing next to the blue Hyundai" }`
- **Responses:** `201 Created`

---

### 6. Complaints & Admin Endpoints

- `POST /complaints`: File complaint linked to a booking.
- `GET /complaints`: Get customer's complaints (or all if admin).
- `GET /admin/stats`: Real database-derived operational KPIs.
- `GET /admin/users`: Search and filter users by role and status.
- `PATCH /admin/users/:id/status`: Suspend or reactivate account.
- `GET /admin/partners`: List partner applications.
- `PATCH /admin/partners/:id/verify`: Approve (`status: "verified"`) or reject (`status: "rejected"`).
- `GET /admin/bookings`: Live dispatch monitor across cities.
- `PATCH /admin/complaints/:id`: Record private internal notes and resolution details.
- `GET /admin/reports`: Operational aggregations (requests timeline, category breakdown, top partners).
- `GET /admin/audit-logs`: Immutable system audit ledger.
- `GET /health`: Server health and database connection status check.
