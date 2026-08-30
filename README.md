# 🏢 FlatPredict AI - Enterprise Property Valuation

![GitHub Repo stars](https://img.shields.io/github/stars/rohitmandal2004/FlatPrice?style=social)
![GitHub forks](https://img.shields.io/github/forks/rohitmandal2004/FlatPrice?style=social)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688)

Welcome to **FlatPredict AI**, a next-generation real-estate valuation platform. Powered by a Multiple Linear Regression Machine Learning model, this application calculates highly accurate property estimates based on dynamic architectural parameters, all wrapped in a stunning, high-performance 3D interface.

## ✨ God-Tier Features

*   🧠 **Advanced ML Valuation:** Highly accurate pricing model accounting for area, configuration, floor level, and facing premiums.
*   🎮 **Interactive 3D Visualizer:** Explore an animated, fully optimized 3D environment rendered with React Three Fiber at a buttery smooth 60FPS.
*   📜 **Enterprise PDF Certificates:** Generate beautifully formatted, legal-style A4 property valuation certificates with QR code verification.
*   📊 **Rich Analytics Dashboard:** Visualize historical trends, price breakdowns, ROI projections, and EMI calculations in real-time.
*   🔐 **Secure Authentication:** Integrated Clerk Auth with Supabase Postgres backend enforcing strict Row Level Security (RLS).
*   🎵 **Procedural Audio Engine:** Immersive UI sound design powered by the Web Audio API (ambient weather, interactive whooshes).
*   📱 **Responsive & Shareable:** Seamlessly works on desktop and mobile, with native `navigator.share()` functionality.

## 🏢 Enterprise Infrastructure

To ensure production-readiness, the following advanced features are integrated:

*   **API Rate Limiting:** The `/predict` endpoint is protected against scraping and DDoS attacks using `slowapi`, limiting requests to 10 per minute per IP.
*   **Progressive Web App (PWA):** The frontend is configured with `vite-plugin-pwa`, allowing the application to be installed natively on desktop and mobile devices.
*   **Model Caching:** Duplicate identical predictions bypass the CPU entirely using Python's native `@lru_cache`, returning instantaneous results from memory.
*   **CI/CD Unit Testing:** The GitHub Actions pipeline is configured with `pytest` and `flake8` to automatically verify API health and model inference validity on every commit.

## 🛠️ Tech Stack

**Frontend:**
*   **React 18** (Vite)
*   **Tailwind CSS** (Styling & Layout)
*   **React Three Fiber / Drei** (3D Rendering)
*   **Framer Motion** (Micro-interactions & Animations)
*   **Recharts** (Data Visualization)
*   **Clerk** (Authentication)

**Backend:**
*   **FastAPI** (Python backend)
*   **Scikit-Learn** (ML Model)
*   **Supabase** (PostgreSQL Database)

## 🚀 Getting Started

### Prerequisites
Make sure you have `Node.js` and `Python 3.9+` installed on your machine.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## 🤝 Contributing
Contributions, issues and feature requests are welcome! 
Feel free to check [issues page](https://github.com/rohitmandal2004/FlatPrice/issues).

## 📝 License
This project is [MIT](https://opensource.org/licenses/MIT) licensed.
