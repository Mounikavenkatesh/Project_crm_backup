# Startup CRM Lite 🚀

A comprehensive, full-stack CRM (Customer Relationship Management) system designed for startups. Built with **React 19 (Vite)** on the frontend and **Node.js, Express, and MongoDB (Mongoose)** on the backend. 

This repository houses both the frontend client and the backend server.

---

## 💻 Tech Stack

### Frontend
* **Core**: React 19, Vite (Build Tool)
* **Styling**: Tailwind CSS v4
* **State & Navigation**: React Context API, React Router DOM (v7)
* **Visuals**: Recharts (Analytics Charts), Lucide React (Icons)
* **Notifications**: React Hot Toast
* **HTTP Client**: Axios (with interceptors for automatic JWT authorization headers)

### Backend
* **Runtime & Framework**: Node.js, Express.js
* **Database**: MongoDB Atlas, Mongoose (ODM)
* **Authentication**: JWT (JSON Web Tokens), bcryptjs (Password Hashing)
* **Security & Hardening**:
  * `express-rate-limit` (brute-force defense)
  * `helmet` (HTTP security headers)
  * `express-mongo-sanitize` (SQL/NoSQL injection prevention)
  * Custom CORS configuration with whitelist support
  * Request size limitations (10kb payload limit)
* **Utilities & Middleware**: `express-validator` (input validation), `morgan` (HTTP request logger)

---

## ✨ Features

* **Secure Authentication**: Register and Login system using secure password hashing and stateless JWT-based authorization.
* **Owner Isolation**: Users can only see, create, edit, or delete their own leads.
* **Lead Pipeline CRUD**: Manage leads through stages (`New`, `Contacted`, `Meeting Scheduled`, `Proposal Sent`, `Won`, `Lost`) with automated status-change timestamp tracking.
* **Advanced Analytics Dashboard**:
  * Total lead count, won/lost metrics, conversion rate, and growth rate.
  * Pipeline status breakdown chart.
  * Lead source breakdown chart (`Website`, `Referral`, `LinkedIn`, `Cold Call`, `Email Campaign`, `Other`).
  * Last 6 months monthly volume and conversion rate trend line.
* **Real-time Autocomplete Search**: Quickly search leads by name, email, or company.
* **Responsive Design**: Elegant user interface supporting dark mode toggling.

---

## 📁 Repository Structure

```text
project_crm/
├── backend/                  # Express API Server
│   ├── config/               # Database connection setup
│   ├── controllers/          # Business logic (auth, leads)
│   ├── middleware/           # Protect route, validation runner, global error handler
│   ├── models/               # MongoDB Schemas (User, Lead)
│   ├── routes/               # API endpoint definitions
│   ├── utils/                # Standardized API response formatters
│   ├── .env                  # Backend environment secrets (never commit!)
│   ├── package.json          # Backend dependencies & scripts
│   └── server.js             # Main server entrypoint
├── src/                      # React Frontend client
│   ├── assets/               # Static assets & icons
│   ├── components/           # Reusable UI components (Analytics, Dashboard, Leads, Common)
│   ├── constants/            # Styling constants & colors
│   ├── context/              # Context Providers (Auth, Leads, Theme)
│   ├── hooks/                # Custom React hooks (useAnalytics, useLocalStorage)
│   ├── pages/                # App views (Dashboard, Leads, Analytics, Login, Register)
│   ├── routes/               # Public and Protected route components
│   ├── services/             # Axios API wrapper services
│   └── main.jsx              # Application entrypoint
├── package.json              # Frontend dependencies & scripts
└── vite.config.js            # Vite configuration
```

---

## 🛠️ Getting Started & Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (local installation or MongoDB Atlas cluster URI)

### Setup the Backend
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` root directory and define the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/startup-crm   # Or your MongoDB Atlas connection string
   JWT_SECRET=your_super_secret_key                   # A long random secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server (with automatic reload via Nodemon):
   ```bash
   npm run dev
   ```
   *The server will start on http://localhost:5000*

### Setup the Frontend
1. Navigate back to the project root directory:
   ```bash
   cd ..
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root directory to configure the API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The app will be accessible at http://localhost:5173*

---

## 📡 API Endpoints Reference

### Authentication (Public)
* `POST /api/auth/register` - Create a new account. Body: `{ name, email, password }`
* `POST /api/auth/login` - Authenticate and return JWT token. Body: `{ email, password }`

### Authentication (Protected - Requires Bearer Token)
* `GET /api/auth/profile` - Fetch profile details of the logged-in user.
* `PUT /api/auth/profile` - Update user details. Body: `{ name, oldPassword, newPassword }`
* `POST /api/auth/logout` - Invalidate user session (client clears local token storage).

### Lead Management (Protected - Requires Bearer Token)
* `GET /api/leads` - List all leads for the user (supports query filters: `status`, `search`, `source`, `page`, `limit`, `sortBy`, `sortOrder`, `dateFrom`, `dateTo`).
* `POST /api/leads` - Create a new lead. Body: `{ name, company, email, phone, status, source, value, notes }`
* `GET /api/leads/:id` - Retrieve details of a specific lead.
* `PUT /api/leads/:id` - Update all details of a specific lead.
* `PATCH /api/leads/:id/status` - Update only the pipeline status of a lead. Body: `{ status }`
* `DELETE /api/leads/:id` - Permanently delete a lead.
* `GET /api/leads/search` - Autocomplete search helper. Query: `?q=search_term`
* `GET /api/leads/stats/summary` - Fetch lead counts and metrics for the dashboard widgets.
* `GET /api/leads/stats/monthly` - Fetch past 6 months volume and conversion rate trends.

---

## 🔒 Security Measures

* **Input Sanitization**: Automatically strips potential `$`/`.` keys from query parameters, request bodies, and params to protect against NoSQL Injection.
* **Payload Limit**: Request sizes are capped at `10kb` to prevent memory exhaustion/DoS attacks.
* **IP Rate Limiting**:
  * General requests: Max 100 requests per 15 minutes.
  * Authentication endpoints (`/api/auth/`): Max 10 attempts per 15 minutes.
* **Security Headers**: Uses `helmet` to set HTTP headers defense against XSS, clickjacking, and mime-sniffing.
