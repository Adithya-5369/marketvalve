# 💹 Financial Portfolio Dashboard

**Live Demo**: [realtimefinancialdashboard.vercel.app](https://realtimefinancialdashboard.vercel.app/)  
**GitHub**: [github.com/Adithya-5369/Financial-Dashboard-32](https://github.com/Adithya-5369/Financial-Dashboard-32)

## 🚀 Overview

This frontend-only Financial Portfolio Dashboard was built as a [hackathon](https://docs.google.com/document/d/1TlPmewnFYFvcEnAF1yduimY025AzMHXbWzLz6VnXODk/) project in response to the challenge:
> *“Build a financial portfolio dashboard with stock performance charts.”*

This frontend-only application provides a comprehensive and real-time overview of a user’s investment portfolio. It’s designed with a modern UI and intuitive UX to help users visualize, analyze, and explore their stock performance.

---

## 🎯 Features

### 📊 Portfolio Overview
- Visual summary of holdings by stock and sector.
- Dynamic pie chart for allocation insights.
- Daily gain/loss indicators and volatility metrics.

### 📈 Live Stock Charts
- Interactive **line** and **candlestick** charts.
- Time filters: 1D, 5D, 1M, 1Y, All.
- Hoverable tooltips with OHLC data and moving averages.

### 🔄 Real-Time Market Data
- Live quotes via financial APIs like Alpha Vantage/Yahoo Finance.
- Auto-refreshing dashboards.
- Currency toggling (e.g., USD ↔ INR).

### 🧠 Smart Insights
- Highlights top gainers and losers.
- Threshold alerts for price or percent change.
- Compare portfolio performance with major indices (e.g., S&P 500).

### 🧾 Watchlist & Notes
- Add non-owned stocks to watchlist.
- Attach notes for reminders, strategies, or earnings alerts.

### 🧑‍💼 User Roles (Concept)
- **Investor**: Full access to charts and custom portfolios.
- **Guest**: Demo mode with sample data.
- **Admin** *(optional)*: Suggestions and stock recommendations.

---

## 🛠️ Tech Stack

| Layer      | Tools / Libraries |
|------------|-------------------|
| **Frontend** | React.js, Tailwind CSS |
| **Charts**   | Recharts, Highcharts (future-ready: Plotly support) |
| **APIs**     | Alpha Vantage / Yahoo Finance |
| **Deployment** | Vercel |

> ❗ Note: This is a UI-only prototype — no backend, no persistent data storage. Built purely for hackathon demo purposes.

---

## 🧩 Modular Components

- **PortfolioManager.jsx** — Add/edit stock holdings
- **ChartRenderer.jsx** — Candlestick + Line chart component
- **Watchlist.jsx** — Manage stock watchlist and personal notes
- **InsightEngine.jsx** — Dynamic performance insights and visual summaries

---

## 📱 Design & UX

- Mobile-first, responsive layout
- Light & dark mode support
- Accessible components and typography for inclusive use
- Sidebar navigation for seamless transitions

---

## 🧠 Future Improvements

- ✅ Backend integration (Firebase or Node.js/Express)
- ✅ User authentication (OAuth / OTP)
- 📈 Enhanced analytics with ML-based predictions
- 📊 Export options: CSV, PDF snapshots of performance

---

## 🌟 Why It Stands Out

- Combines **live data** with **elegant visuals**
- Prioritizes **UX and accessibility**
- Crafted with a **hacker mindset**: efficient, functional, and deployable
- Ready for demos, investor tools, or startup MVPs

---

## 📌 Contributing & Feedback

Have an idea or want to contribute? Open an issue or PR on [GitHub](https://github.com/Adithya-5369/Financial-Dashboard-32).  
For feedback, feel free to connect on [LinkedIn](https://www.linkedin.com/in/adithyasaisrinivas) or drop a ⭐ if you find it useful!

---

## 🛡 License

This project is **not licensed for open-source use**.  
All rights reserved © 2025 Adithya Sai Srinivas.  
Please do **not copy, modify, reuse, or deploy** this project without explicit written permission.

📧 Contact for usage inquiries: muttaadithyasaisrinivas@gmail.com
