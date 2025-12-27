# StockWatchlist

A stock analysis application built with **Node.js** and **React** that allows users to enter a stock ticker and receive **technical indicators** including **EMA** and **Hurst Exponent**, alongside **real-time news sentiment analysis**.

---

## 📊 StockPulse AI: News Aggregator & Technical Analyzer

**StockPulse AI** is a full-stack personal finance tool that scrapes real-time news from **Google News**, performs **sentiment analysis** using natural language processing (NLP), and visualizes **technical stock indicators** using Puppeteer and React.

---

## 🚀 Project Overview

### 🔹 Real-time Scraping
- No API keys required
- Uses **Puppeteer** to fetch the latest **24 hours** of Google News data

### 🔹 Sentiment Analysis
- Categorizes news as **Positive**, **Negative**, or **Neutral**
- Powered by the **AFINN lexicon**

### 🔹 Technical Indicators
- **12-day Exponential Moving Average (EMA)**
- **Hurst Exponent** (Trend vs. Mean Reversion)

### 🔹 Watchlist Persistence
- Saves favorite tickers using **browser LocalStorage**

---

## 🛠️ Installation Guide

---

## 1️⃣ Prerequisites

```bash
node -v
npm -v
```

---

## 2️⃣ Backend Setup

### 📁 backend/server.js

```js
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const natural = require("natural");

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  res.json({ status: "Backend running" });
});

app.listen(5000, () => console.log("Backend running on 5000"));
```

### Install Backend Dependencies

```bash
cd backend
npm init -y
npm install express puppeteer puppeteer-extra puppeteer-extra-plugin-stealth cors natural
node server.js
```

---

## 3️⃣ Frontend Setup

### 📁 frontend/src/App.js

```js
import React from "react";

function App() {
  return (
    <div>
      <h1>StockPulse AI</h1>
      <p>Frontend running</p>
    </div>
  );
}

export default App;
```

### Run Frontend

```bash
npx create-react-app frontend
cd frontend
npm start
```

---

## ⚖️ Disclaimer

Educational use only. No financial advice.

