# Roadside AAA — Deployment & Production Guide

This document details the configuration, deployment, and operational procedures for running **Roadside AAA** across production environments, including cloud hosting providers (Render/Railway for Node.js backend, Vercel/Netlify for Vite React frontend, and MongoDB Atlas for database hosting).

---

## 1. Production Architecture Overview

```
                 +-------------------------------+
                 |        Client (Browser)       |
                 +---------------+---------------+
                                 |
                 HTTPS / WSS     |     HTTPS (Assets)
                                 v
        +------------------------+------------------------+
        |                                                 |
        v                                                 v
+-------------------------------+             +-------------------------------+
|    Vercel / Netlify (CDN)     |             |    Render / Node.js Backend   |
|    - Single Page React App    |             |    - Express REST API (/api)  |
|    - Static Asset Delivery    |             |    - Socket.IO Server (WSS)   |
|    - HTML5 PushState Rewrites |             |    - Rate Limiting & Helmet   |
+-------------------------------+             +---------------+---------------+
                                                              |
                                                              | Mongoose TLS
                                                              v
                                              +-------------------------------+
                                              |      MongoDB Atlas Cluster    |
                                              |      - 2dsphere Geospatial    |
                                              |      - Automated Backups      |
                                              +-------------------------------+
```

---

## 2. Environment Variables

### Backend (`server/.env` in production)

| Variable | Type | Description | Production Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | Environment mode | `production` |
| `PORT` | Number | Port on which Express listens | `5000` (or dynamically set by Render `$PORT`) |
| `MONGODB_URI` | String | Connection string to MongoDB Atlas | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/roadside_aaa?retryWrites=true&w=majority` |
| `JWT_SECRET` | String | Cryptographic key for signing access tokens | High-entropy string (>= 64 chars) |
| `JWT_EXPIRES_IN` | String | Access token validity window | `1h` or `1d` |
| `COOKIE_SECRET` | String | Signing key for cookies | High-entropy string |
| `CLIENT_ORIGIN` | String | Permitted CORS origin for frontend | `https://roadside-aaa.vercel.app` |
| `RATE_LIMIT_WINDOW_MS` | Number | Rate limit window in milliseconds | `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | Number | Max requests per IP per window | `100` |

### Frontend (`client/.env` in production)

| Variable | Type | Description | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | String | Fully qualified URL to Backend API | `https://roadside-aaa-api.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | String | Fully qualified URL for Socket.IO | `https://roadside-aaa-api.onrender.com` |

---

## 3. Database Deployment (MongoDB Atlas)

1. **Create an Atlas Cluster:**
   - Log into [MongoDB Cloud](https://cloud.mongodb.com/).
   - Create a free shared cluster (M0) or dedicated tier.
   - Choose a region close to your backend hosting region (e.g., AWS us-east-1).

2. **Configure Security & Access:**
   - **Database Access:** Create a dedicated database user (e.g. `roadside_app_user`) with `readWriteAnyDatabase` privileges.
   - **Network Access:** Add an IP Access List entry. For platforms like Render with dynamic outbound IPs, set `0.0.0.0/0` (Allow Access from Anywhere) with a strong password.

3. **Retrieve Connection String:**
   - Click **Connect** -> **Connect your application** (Driver: Node.js, version 5.5+).
   - Copy the SRV URI: `mongodb+srv://roadside_app_user:<password>@cluster0.abcde.mongodb.net/roadside_aaa?retryWrites=true&w=majority`.
   - Assign this URI to `MONGODB_URI` in the backend environment.

4. **Verify Geospatial Indexes:**
   - The application automatically builds the required `2dsphere` index on `PartnerProfile.location` and `ServiceRequest.location` upon Mongoose startup.

---

## 4. Backend Deployment (Render / Railway / VPS)

### Option A: Render Blueprint (Recommended - 1 Click)
The repository includes an Infrastructure-as-Code [render.yaml](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/render.yaml) file.
1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Click **Blueprints** -> **New Blueprint Instance**.
3. Select this repository. Render automatically reads `render.yaml`, configures the Node web service, health check at `/api/v1/health`, port `10000`, and auto-generates `JWT_SECRET`.
4. Enter your `MONGODB_URI` (from Atlas) and `CLIENT_URL` (from Vercel).
5. Click **Apply**.

### Option B: Render Web Service (Manual)
1. In Render, select **New** -> **Web Service**.
2. Settings:
   - **Name:** `roadside-aaa-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `HOST`: `0.0.0.0`
   - `PORT`: `10000` (Render provides this automatically)
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/roadside_aaa?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<secure-random-32-char-string>`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
4. Health Check Path: `/api/v1/health`

### Option B: Linux VPS / Docker

If running on an Ubuntu VPS with PM2 and Nginx:
```bash
# Clone and setup
git clone https://github.com/your-username/roadside-aaa.git
cd roadside-aaa/server
npm install --omit=dev

# Start with PM2
pm2 start src/server.js --name "roadside-aaa-api"
pm2 save
pm2 startup
```

Nginx reverse proxy snippet with WebSocket support:
```nginx
server {
    server_name api.roadside-aaa.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Frontend Deployment (Vercel / Netlify)

### Option A: Vercel

1. Import your GitHub repository to [Vercel](https://vercel.com/).
2. Configure project settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Under **Environment Variables**, add:
   - `VITE_API_URL=https://roadside-aaa-api.onrender.com/api/v1`
   - `VITE_SOCKET_URL=https://roadside-aaa-api.onrender.com`
4. Note: SPA routing is already pre-configured via [client/vercel.json](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/client/vercel.json) and root [vercel.json](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/vercel.json).
5. Click **Deploy**. Vercel will build the frontend and provide your production URL (e.g., `https://roadside-aaa.vercel.app`).
6. Copy this Vercel URL and update `CLIENT_URL` in your Render backend settings so CORS and Socket.IO accept it.

### Option B: Netlify
1. Netlify SPA routing is pre-configured via [client/public/_redirects](file:///c:/Users/HP/OneDrive/Desktop/roadside-aaa/client/public/_redirects).
2. Root directory: `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set identical `VITE_API_URL` and `VITE_SOCKET_URL` variables in Netlify UI.

---

## 6. Socket.IO Production Considerations

1. **WebSocket Transport Priority:** The client socket connection initiates with polling and upgrades to `websocket`. In production, ensure load balancers do not terminate sticky connections prematurely.
2. **CORS:** Ensure `CLIENT_ORIGIN` matches the exact protocol and domain of the frontend (e.g., `https://roadside-aaa.vercel.app` without trailing slash).
3. **Horizontal Scaling:** When scaling to multiple backend instances, attach `@socket.io/redis-adapter` backed by a managed Redis instance (e.g., Upstash or Redis Cloud) so socket events propagate across nodes.

---

## 7. Health Checks and Monitoring

- **Health Probe:**
  ```http
  GET /api/v1/health HTTP/1.1
  Host: api.roadside-aaa.com
  ```
  Expected Response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-20T18:00:00.000Z",
    "uptime": 1284.52,
    "database": {
      "status": "connected",
      "host": "cluster0.abcde.mongodb.net",
      "name": "roadside_aaa"
    }
  }
  ```
  HTTP Status: `200 OK` (or `503 Service Unavailable` if MongoDB is down).

- **Logging:** Express is configured with `morgan('combined')` in production, outputting standard Apache/Nginx combined log format for ingestion into Datadog, Papertrail, or Render log streams.

---

## 8. Post-Deployment Verification Checklist

- [ ] Health check `GET /api/v1/health` returns `status: "healthy"` and `database: "connected"`.
- [ ] Root administrative user seeded or initialized via `npm run seed`.
- [ ] Driver registration, vehicle creation, and emergency request wizard functions on the live frontend.
- [ ] Mechanic can view incoming requests, accept, update live GPS, and transition through the full lifecycle.
- [ ] Socket.IO reconnects smoothly without errors in browser dev tools.
- [ ] Live map tiles load seamlessly using OpenStreetMap without API key failures.
- [ ] PDF/print invoice generator renders itemized costs with 18% GST and INR formatting.
