# KGOS 2031 — Kumar Gourav Operating System

An enterprise-grade, local-first Personal & Business ERP, AI command center, and strategic execution dashboard designed for Kumar Gourav.

[![Netlify Status](https://api.netlify.com/api/v1/badges/a562efde-0a8a-4bb3-ab9a-36fb1fb627d0/deploy-status)](https://kgos.netlify.app)

---

## 🌟 Key Features

1. **Local-First Architecture**: Completely functional offline. Uses **IndexedDB** (via **Dexie.js**) for rapid local reads/writes, minimizing latency.
2. **Cloud Sync Engine**: Bi-directional data synchronization with **Supabase (PostgreSQL)** for secure backups and cross-device usage.
3. **Founder ERP**:
   - **B2B CRM Pipeline**: Dynamic deal tracking, opportunity scoring algorithms, and client interaction logs.
   - **Product Formulation Catalog**: Deep integration for hydrocolloid stabilizers (Carrageenan profiles, Guar, Xanthan formulations).
   - **Supplier Management**: Standard MOQ tracking, quality rating matrices, and lead time tracking.
4. **Life & Self-Mastery Command**:
   - **Horizons of Focus**: Track goals across DECADE, 5-YEAR, 3-YEAR, and ANNUAL horizons.
   - **Habit Compounding**: Daily progress checks with automated streak counters.
   - **Health & Bio-Tracking**: Sleep logs, weight records, calorie intake, and protein metrics.
   - **Execution Hub**: Focus timers (Pomodoro integration) coupled with priority filters.
5. **Glassmorphism Design System**: Clean, futuristic dark-glass layout with reactive CSS micro-animations.

---

## 🛠 Tech Stack

* **Frontend Framework**: React 18 + Vite (configured for `es2022` speed optimization)
* **Local Storage**: Dexie.js (IndexedDB wrapper)
* **Cloud Database**: Supabase JS Client (Postgres)
* **Styling**: Vanilla CSS Variables (Premium Dark Theme)
* **Icons**: Lucide React
* **Charts**: Recharts

---

## 🚀 Installation & Local Setup

### Prerequisites
Make sure you have Node.js installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/Gouravgk21/KGOS.git
cd KGOS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```
The app will open automatically at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Production Build & Deployment

### Build Command
Compile static assets optimized for modern browser environments:
```bash
npm run build
```

### Netlify Deployment
This project is configured for single-page routing redirect fallback via `netlify.toml`. Make sure to specify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables inside your Netlify site dashboard settings.
