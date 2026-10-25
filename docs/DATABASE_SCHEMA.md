# Database Schema Documentation
## Roadside AAA — Roadside Vehicle Assistance & Mechanic Booking Platform

---

### Database Architecture
- **Engine:** MongoDB (v5.0+)
- **ODM:** Mongoose (v8.x)
- **Coordinate Standard:** GeoJSON Point format `[longitude, latitude]`
- **Geospatial Index:** `2dsphere`

---

### 1. User Collection (`users`)

| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique user identifier. |
| `name` | String | Required, Trim, Max: 100 | Full name of the user. |
| `email` | String | Required, Unique, Lowercase, Indexed | Normalized unique email. |
| `phone` | String | Required, Trim | Mobile phone number for dispatch contact. |
| `password` | String | Required, Min: 6, `select: false` | Bcrypt password hash. Stripped on query responses. |
| `role` | String | Enum: `['user', 'mechanic', 'towing_partner', 'admin']`, Default: `'user'`, Indexed | Role-based authorization. |
| `status` | String | Enum: `['active', 'suspended']`, Default: `'active'` | Account operational status. |
| `isEmailVerified` | Boolean | Default: `true` | Email confirmation status. |
| `lastLogin` | Date | Optional | Timestamp of last successful authentication. |
| `createdAt` | Date | Timestamp | Record creation timestamp. |
| `updatedAt` | Date | Timestamp | Record last update timestamp. |

---

### 2. Vehicle Collection (`vehicles`)

| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique vehicle identifier. |
| `owner` | ObjectId | Ref: `User`, Required, Indexed | Reference to vehicle owner. |
| `registrationNumber` | String | Required, Uppercase, Trim, Indexed | License plate / registration code (e.g. DL01-AB-1234). |
| `vehicleType` | String | Enum: `['car', 'suv', 'bike', 'truck', 'van', 'other']` | Vehicle class. |
| `make` | String | Required, Trim | Manufacturer (Hyundai, Tata, Honda, etc.). |
| `model` | String | Required, Trim | Vehicle model (Creta, Nexon, City, etc.). |
| `year` | Number | Required, Min: 1980 | Manufacturing year. |
| `fuelType` | String | Enum: `['petrol', 'diesel', 'electric', 'hybrid', 'cng']` | Fuel / propulsion type. |
| `color` | String | Optional | Vehicle exterior color. |
| `notes` | String | Max: 500 | Optional owner notes (e.g., Automatic transmission). |

**Indexes & Rules:**
- Compound index: `{ owner: 1, registrationNumber: 1 }`
- Deletion Constraint: Deletion is rejected if the vehicle has active bookings in progress.

---

### 3. PartnerProfile Collection (`partnerprofiles`)

| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique partner profile identifier. |
| `user` | ObjectId | Ref: `User`, Required, Unique, Indexed | Reference to authenticated user account. |
| `partnerType` | String | Enum: `['mechanic', 'towing_partner']`, Indexed | Service specialty. |
| `businessName` | String | Required, Trim | Registered garage, workshop, or fleet trade name. |
| `description` | String | Default: `''` | Bio and roadside capabilities description. |
| `experienceYears`| Number | Default: `1`, Min: `0` | Professional automotive experience in years. |
| `verificationStatus` | String | Enum: `['pending', 'verified', 'rejected', 'suspended']`, Indexed | Administrative vetting status. |
| `verificationDecisionHistory` | Array | Objects: `{ status, reason, decidedBy, date }` | Audit trail of verification approvals/rejections. |
| `serviceCategories` | [ObjectId] | Ref: `ServiceCategory` | List of approved services offered. |
| `pricing` | Object | `{ baseFee, perKmRate, diagnosticFee }` | Partner base pricing parameters. |
| `address` | String | Required | Physical workshop / depot address. |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` | Base workshop coordinates. |
| `serviceRadiusKm` | Number | Default: `20`, Min: `1`, Max: `100` | Maximum dispatch radius in kilometers. |
| `operatingHours` | Object | `{ start, end, is24x7 }` | Working hours configuration. |
| `isAvailable` | Boolean | Default: `true`, Indexed | Real-time Online / Offline availability switch. |
| `ratingSummary` | Object | `{ averageRating: Number, totalReviews: Number }` | Aggregate review metrics (1.0 to 5.0). |
| `documents` | Array | Objects: `{ docType, docName, fileUrl, verified, uploadedAt }` | Uploaded trade and identity documents. |

**Indexes:**
- Geospatial index: `{ location: '2dsphere' }`
- Compound index: `{ verificationStatus: 1, isAvailable: 1 }`

---

### 4. ServiceCategory Collection (`servicecategories`)

| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Category identifier. |
| `name` | String | Required, Unique, Trim | Category title (e.g. Battery Jump-Start). |
| `slug` | String | Required, Unique, Lowercase | URL slug (e.g. battery-jump-start). |
| `description` | String | Required | Scope of work included. |
| `basePrice` | Number | Required, Min: 0 | Recommended base guidance price in INR. |
| `perKmRate` | Number | Default: 0 | Recommended per-kilometer rate in INR. |
| `icon` | String | Default: `'Wrench'` | Lucide icon identifier. |
| `isActive` | Boolean | Default: `true` | Availability in public discovery. |

**Deletion Rule:**
If referenced by existing service requests, categories are soft-disabled (`isActive: false`) rather than hard-deleted.

---

### 5. ServiceRequest Collection (`servicerequests`) — Authoritative Booking Source

| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Internal booking ID. |
| `bookingReference` | String | Required, Unique, Indexed | Human-readable tracking reference (e.g. `AAA-202610-A1B2`). |
| `customer` | ObjectId | Ref: `User`, Required, Indexed | The vehicle owner requesting assistance. |
| `vehicle` | ObjectId | Ref: `Vehicle`, Required | Referenced vehicle. |
| `vehicleSnapshot` | Object | `{ registrationNumber, make, model, vehicleType, fuelType }` | Snapshot preserving historical data if vehicle is modified. |
| `serviceCategory` | ObjectId | Ref: `ServiceCategory`, Required | Primary service category requested. |
| `serviceCategorySnapshot` | Object | `{ name, slug }` | Category snapshot. |
| `breakdownDescription` | String | Required, Max: 1000 | Driver explanation of symptoms and failure. |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` | Breakdown coordinates. |
| `address` | String | Required | Road name and location description. |
| `landmark` | String | Optional | Nearby identifiable landmark. |
| `status` | String | Enum: `['requested', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'expired']`, Indexed | Current state in finite state machine. |
| `assignedPartner` | ObjectId | Ref: `PartnerProfile`, Default: `null`, Indexed | Assigned verified service partner. |
| `assignedPartnerUser` | ObjectId | Ref: `User`, Default: `null` | Partner user account reference. |
| `estimatedPrice` | Object | `{ base, distanceRate, estimatedDistanceKm, estimatedTotal, currency }` | Calculated estimate displayed upfront. |
| `finalPrice` | Object | `{ base, distanceRate, additionalCharges, taxes, total, currency, paymentStatus, paymentMethod }` | Final validated invoice calculated server-side. |
| `tracking` | Object | `{ currentLocation: GeoJSON Point, lastUpdatedAt, heading }` | Real-time partner GPS position. |
| `statusHistory` | Array | Objects: `{ status, timestamp, note, updatedBy }` | Audit trail of all state transitions. |
| `cancellation` | Object | `{ reason, cancelledBy, timestamp }` | Cancellation metadata if cancelled. |
| `hasReview` | Boolean | Default: `false` | Flag indicating review submission. |
| `acceptedAt` | Date | Optional | Timestamp when partner accepted. |
| `arrivedAt` | Date | Optional | Timestamp when partner arrived on spot. |
| `completedAt` | Date | Optional | Timestamp when service completed. |

**Indexes:**
- Geospatial index: `{ location: '2dsphere' }`
- Compound indexes: `{ customer: 1, createdAt: -1 }`, `{ assignedPartner: 1, status: 1 }`, `{ status: 1, createdAt: -1 }`

---

### 6. Ancillary Collections

- **Notification (`notifications`):**
  `recipient` (Ref User), `type`, `title`, `message`, `bookingId` (Ref ServiceRequest), `isRead`, `createdAt`.
  Index: `{ recipient: 1, isRead: 1, createdAt: -1 }`.

- **ChatMessage (`chatmessages`):**
  `bookingId` (Ref ServiceRequest), `sender` (Ref User), `senderRole`, `senderName`, `message`, `isRead`, `createdAt`.
  Index: `{ bookingId: 1, createdAt: 1 }`.

- **Review (`reviews`):**
  `bookingId` (Ref ServiceRequest, Unique), `customer` (Ref User), `partner` (Ref PartnerProfile), `rating` (1–5), `comment`, `createdAt`.
  Index: `{ partner: 1, createdAt: -1 }`.

- **Complaint (`complaints`):**
  `bookingId` (Ref ServiceRequest), `submittedBy` (Ref User), `category`, `description`, `status` (`'submitted'`, `'under_review'`, `'resolved'`, `'dismissed'`), `internalNotes` (Private to admin), `resolutionDetails`, `assignedAdmin`, `resolvedAt`.
  Index: `{ status: 1, createdAt: -1 }`.

- **AuditLog (`auditlogs`):**
  `actor` (Ref User), `action`, `resourceType`, `resourceId`, `metadata`, `ipAddress`, `createdAt`.
  Index: `{ createdAt: -1 }`.

- **PaymentRecord (`paymentrecords`):**
  `booking` (Ref ServiceRequest), `user` (Ref User), `amount`, `currency`, `method` (`cash`, `online_card`, `upi`), `status` (`pending`, `completed`), `transactionReference`, `notes`.
