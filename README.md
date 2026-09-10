# GeoMetrics – Enterprise Location & Distance Analysis

**GeoMetrics** is a modern, enterprise-grade Location & Distance Calculator web application built with **React 18**, **Vite**, **Tailwind CSS**, **Leaflet.js**, **OpenStreetMap**, **OSRM Routing Engine**, and **MongoDB**.

---

## 🌟 Key Features

- 🚗 **Road Distance & Time Calculation**: Exact road driving, cycling, and walking distance (KM / Miles) & travel time powered by OSRM.
- 🗺️ **Interactive Leaflet Map**: Custom SVG colored markers for Origin (A), Waypoints (1, 2, 3...), and Destination (B) with auto-fit bounds and Satellite/Roadmap layer toggle.
- 📍 **Free Address Search & GPS**: Instant location search (cities, addresses, PIN codes, landmarks) via OpenStreetMap Nominatim/Photon and browser GPS location.
- 🚦 **Multi-Stop Routes**: Add, remove, swap (⇅), and reorder intermediate waypoints.
- 👤 **User Tracking & Member Directory**: Tracks user names for every calculation and maintains member histories in MongoDB.
- 🧳 **Tour Management System**: Create, assign, and manage multi-destination tours/trips with status tracking (`PLANNED`, `IN_PROGRESS`, `COMPLETED`).
- ⚡ **100% Free & Keyless**: No API key or credit card required!
- ☁️ **Vercel & MongoDB Atlas Ready**: Pre-configured for one-click deployment on Vercel.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install frontend packages
npm install

# Install backend packages
cd server && npm install && cd ..
```

### 2. Run Development Servers
```bash
# Run Frontend (Vite)
npm run dev

# Run Backend API Server (Node.js/Express)
cd server && npm start
```

---

## ☁️ Deployment on Vercel

1. Push this repository to GitHub.
2. Connect the repository on [Vercel](https://vercel.com).
3. Set Environment Variable in Vercel:
   `MONGODB_URI` = `your_mongodb_atlas_connection_string`
