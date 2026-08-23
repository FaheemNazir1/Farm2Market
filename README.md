# Farm2Market: A Digital Bridge for Maximizing Farmer Profits

[![Smart India Hackathon 2025](https://img.shields.io/badge/Smart%20India%20Hackathon-2025-brightgreen.svg)](https://sih.gov.in/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Farm2Market** is a modern, full-stack agricultural marketplace platform built to connect local farmers directly with wholesale buyers, retailers, and consumers. By eliminating intermediaries, the platform empowers farmers with fair market prices and transparent transactions while giving buyers access to verified, fresh agricultural produce.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Monorepo Structure](#-monorepo-structure)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Testing](#-testing)
- [License](#-license)

---

## 🏛️ Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │              Client Browser             │
                        └────────────────────┬────────────────────┘
                                             │
                       HTTP (Port 3000) / API (Port 5002)
                                             │
                        ┌────────────────────▼────────────────────┐
                        │        Farm2Market Monorepo             │
                        │                                         │
                        │   ┌─────────────────────────────────┐   │
                        │   │   Frontend (React + Tailwind)   │   │
                        │   │   - Marketplace & Crop Listings │   │
                        │   │   - Farmer/Buyer Dashboards     │   │
                        │   │   - Voice Commands & i18n       │   │
                        │   └────────────────┬────────────────┘   │
                        │                    │ REST API / JWT     │
                        │   ┌────────────────▼────────────────┐   │
                        │   │   Backend (Express + Node.js)   │   │
                        │   │   - Auth & Role-Based Access    │   │
                        │   │   - Crop & Order Management     │   │
                        │   │   - Payments (Stripe/Razorpay)  │   │
                        │   └────────────────┬────────────────┘   │
                        │                    │                    │
                        │   ┌────────────────▼────────────────┐   │
                        │   │ Storage (In-Memory / MongoDB)   │   │
                        │   └─────────────────────────────────┘   │
                        └─────────────────────────────────────────┘
```

---

## 📁 Monorepo Structure

```
Farm2Market/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets & HTML template
│   ├── src/
│   │   ├── components/         # Reusable UI components & Voice controls
│   │   ├── contexts/           # React Contexts (Auth, Cart, Language)
│   │   ├── i18n/               # Localization (English & Hindi)
│   │   ├── pages/              # Routed pages (Home, Marketplace, Dashboard, etc.)
│   │   ├── services/           # Axios API client services
│   │   ├── utils/              # Helper utilities and formatters
│   │   ├── App.js              # Application root and route configuration
│   │   └── index.js            # Frontend entrypoint
│   ├── .env.example            # Client environment template
│   ├── Dockerfile              # Production Dockerfile (multi-stage Nginx)
│   ├── nginx.conf              # Client-side Nginx config
│   └── package.json            # Frontend dependencies & scripts
├── server/                     # Express.js Backend API
│   ├── config/                 # Configuration modules
│   ├── middleware/             # Auth, role check, validation middleware
│   ├── models/                 # Mongoose schemas & data models
│   ├── routes/                 # Express API routes
│   │   ├── auth.js             # Authentication routes (login, register, me)
│   │   ├── crops.js            # Crop listing & search routes
│   │   ├── orders.js           # Order placement & management
│   │   ├── payments.js         # Stripe, Razorpay & COD payment routes
│   │   └── users.js            # Profile & user management routes
│   ├── uploads/                # Crop & profile media upload directory
│   ├── .env.example            # Backend environment template
│   ├── db.js                   # In-memory database manager & seed loader
│   ├── Dockerfile              # Backend production Dockerfile
│   ├── healthcheck.js          # Healthcheck script for containers
│   ├── index.js                # Express app entrypoint
│   ├── seedData.js             # Pre-configured sample crops & accounts
│   └── package.json            # Backend dependencies & scripts
├── api/                        # Vercel Serverless Function Bridge
│   └── index.js                # Serverless entrypoint
├── nginx/                      # Root Reverse Proxy (Docker Compose)
│   └── nginx.conf              # Nginx upstream load balancer & router
├── scripts/                    # Automation Scripts
│   └── vercel-build.js         # Vercel monorepo build script
├── tests/                      # Testing Fixtures & Suites
│   └── manual/                 # Manual browser API test files
│       ├── test-order.html
│       ├── test-registration.html
│       └── test-validation.html
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Multi-container Docker orchestration
├── mongo-init.js               # MongoDB initialization script
├── package.json                # Monorepo root workspace orchestrator
└── README.md                   # Project documentation
```

---

## ✨ Features

- 👨‍🌾 **For Farmers**:
  - Direct crop listing with high-resolution photo uploads.
  - Price management, quantity tracking, and harvest date logging.
  - Farmer dashboard with order status and sales analytics.
  - Voice command support (English & Hindi) for accessible operation.

- 🛒 **For Buyers & Retailers**:
  - Real-time produce marketplace with multi-faceted filtering (category, price, location).
  - Farmer credibility ratings and organic certification badges.
  - Shopping cart with direct-from-farmer order placement.
  - Multiple payment integrations: UPI (Razorpay), Credit/Debit Card (Stripe), and Cash on Delivery (COD).

- 🌐 **Localization & Accessibility**:
  - Bilingual support with on-the-fly switching between English and Hindi.
  - Responsive, high-contrast Tailwind CSS interface tailored for all screen sizes.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, React Query, Tailwind CSS, Lucide Icons, react-hot-toast, i18next |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), Bcrypt.js, Multer, Express Validator |
| **Database** | In-Memory (Zero-setup instant dev mode) / MongoDB with Mongoose |
| **Payments** | Stripe API, Razorpay UPI SDK |
| **DevOps** | Docker, Docker Compose, Nginx, Vercel Serverless |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
Clone the repository and install all dependencies (root, backend, and frontend) in one step:

```bash
git clone https://github.com/Invictus1coder/Farm2Market.git
cd Farm2Market
npm run install:all
```

### 3. Start Development Mode
Run both backend and frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5002](http://localhost:5002)
- **API Health Check**: [http://localhost:5002/api/health](http://localhost:5002/api/health)

### 4. Running Components Individually

- **Backend only**:
  ```bash
  npm run dev:server
  ```
- **Frontend only**:
  ```bash
  npm run dev:client
  ```

---

## ⚙️ Environment Configuration

Copy the sample environment files:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### Key Variables

| Variable | Scope | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | HTTP port for Express server | `5002` |
| `NODE_ENV` | Backend | Runtime mode (`development` / `production`) | `development` |
| `JWT_SECRET` | Backend | Secret key for signing auth tokens | `farm2market_jwt_super_secret_key_2025` |
| `MONGODB_URI` | Backend | MongoDB connection string | `mongodb://localhost:27017/farm2market` |
| `REACT_APP_API_URL` | Frontend | Target backend API base URL | `http://localhost:5002/api` |

---

## 🔐 Demo Credentials

The backend automatically bootstraps demo accounts on startup:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@test.com` | `farmer123` | Rajesh Kumar (Pune, Maharashtra) |
| **Buyer** | `buyer@test.com` | `buyer123` | Priya Sharma (Fresh Foods Ltd, Mumbai) |
| **Admin** | `admin@test.com` | `admin123` | Admin User (System Administrator) |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new farmer or buyer account.
- `POST /api/auth/login` — Authenticate and receive a JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`).
- `POST /api/auth/logout` — Invalidate user session.

### Crops (`/api/crops`)
- `GET /api/crops` — List all available crops (with query params: `search`, `category`, `minPrice`, `maxPrice`).
- `GET /api/crops/:id` — Retrieve details of a specific crop listing.
- `POST /api/crops` — Create a new crop listing (Farmer only).
- `PUT /api/crops/:id` — Update an existing crop listing (Farmer only).
- `DELETE /api/crops/:id` — Remove a crop listing (Farmer only).
- `GET /api/crops/farmer/my-crops` — List crops belonging to authenticated farmer.
- `GET /api/crops/prices/recent` — Get recent market pricing trends.

### Orders & Payments (`/api/orders`, `/api/payments`)
- `POST /api/orders` — Create a new crop purchase order.
- `GET /api/orders` — List orders for authenticated user.
- `POST /api/payments/create-payment-intent` — Initialize a Stripe card payment.
- `POST /api/payments/upi/create-order` — Create a Razorpay UPI order.
- `POST /api/payments/cod` — Confirm Cash on Delivery order.

---

## 🐳 Docker Deployment

To launch the full production environment including MongoDB, Backend, Frontend, and Nginx reverse proxy:

```bash
docker compose up --build
```

Access the unified portal through Nginx reverse proxy on [http://localhost:80](http://localhost:80).

---

## 🧪 Testing

- **Run all tests**:
  ```bash
  npm test
  ```
- **Backend healthcheck test**:
  ```bash
  npm run test:server
  ```
- **Manual API Test Fixtures**:
  Open files in `tests/manual/` in any browser to test endpoints directly.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
