# Farm2Market System Architecture

## Overview
Farm2Market is a full-stack digital marketplace connecting farmers directly with agricultural produce buyers (retailers, restaurants, bulk consumers) across India.

```mermaid
graph TD
    subgraph Client ["Frontend (React SPA)"]
        UI[Tailwind UI & Lucide Icons]
        AuthC[AuthContext + Firebase Auth]
        Voice[VoiceCommands Web Speech AI]
        i18n[i18next English / Hindi / Marathi]
        Map[Leaflet / OpenStreetMap]
    end

    subgraph Gateway ["Routing & Serverless"]
        Vercel[Vercel Serverless /api/index.js]
        Nginx[Docker Nginx Reverse Proxy]
    end

    subgraph Server ["Backend (Node.js & Express)"]
        Routes[API Routes: /auth, /crops, /orders, /users]
        JWT[JWT Authentication Middleware]
        Geo[Haversine Geolocation Engine]
        FirebaseAdmin[Firebase Admin SDK]
    end

    subgraph Data ["Database"]
        MongoDB[(MongoDB 7.0 Atlas / Docker)]
        MemoryDB[(In-Memory Dev Cache)]
    end

    Client --> Gateway
    Gateway --> Server
    Server --> Data
```

## Directory Structure
- `client/`: React 18 frontend with Tailwind CSS, React Query, react-i18next, and Lucide React.
- `server/`: Express REST API with Mongoose/MongoDB, bcryptjs, jsonwebtoken, and Firebase Admin.
- `api/`: Vercel serverless function entrypoint for serverless deployment.
- `nginx/`: Docker reverse proxy configuration and SSL certificate paths.
- `scripts/`: Production build automation scripts.
- `tests/`: Automated regression test suite and manual testing fixtures.
- `docs/`: Architectural specifications, API guides, and roadmap.
