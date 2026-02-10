# SecondBrain 🧠 — AI-Powered Knowledge System

> **Transforming raw content into structured intelligence.**

A high-performance personal knowledge management system that captures, analyzes, and organizes knowledge from text notes and video content using state-of-the-art AI.

![SecondBrain Banner](https://img.shields.io/badge/Status-Project_Ready-brightgreen) ![AI Stack](https://img.shields.io/badge/AI-Groq_LLaMA_3.1-6366f1) ![UI](https://img.shields.io/badge/UI-Vanilla_JS-f7df1e)

---

## 🎯 Project Overview

SecondBrain is built for researchers, students, and creators who need more than just a place to store notes. It converts passive content into active knowledge through:

- **AI Discovery**: Automatically extracts summaries, key points, and semantic tags.
- **Video Analytics**: Exclusive communication scoring (Clarity, Engagement, Structure).
- **Persistent Personalization**: Custom profile management with local persistence.
- **Smart Library**: Real-time retrieval and intelligent categorization.

---

## 🚀 Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js 18+**
- **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com).

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/sandeep2k01/secondbrain.git
cd secondbrain

# Setup Backend
cd server
npm install
cp .env.example .env  # Add your GROQ_API_KEY to this file
```

### 3. Start Servers
**Terminal 1 (Backend API):**
```bash
cd server
node server.js
```

**Terminal 2 (Frontend):**
```bash
# From project root
npx -y http-server ./ -p 8080 -c-1
```

**Open [http://localhost:8080](http://localhost:8080)** in your browser.

---

## 🏗️ Architecture & Infrastructure

### System Design
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     FRONTEND    │       │     BACKEND     │       │     AI LAYER    │
│  (Vanilla JS)   │◀─────▶│  (Node/Express) │◀─────▶│   (Groq LPU)    │
│  Port: 8080     │       │  Port: 3001     │       │   LLaMA 3.1 8B  │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
  ┌──────▼──────┐          ┌──────▼──────┐
  │ LocalStorage│          │ In-Memory DB│
  │ (User Prefs)│          │ (Session)   │
  └─────────────┘          └─────────────┘
```

### Infrastructure Details
- **Frontend**: Single-page architecture using CSS variables for theme management and standard DOM APIs for extremely fast load times.
- **Backend**: Express.js REST API with zero-dependency orchestration (other than `groq-sdk` and `dotenv`).
- **AI Integration**: Leverages Groq's LPU (Language Processing Unit) for near-instant inference, providing a "real-time" feel to content analysis.

---

## 💡 UX Principles & "Agent Thinking"

### UX Principles
1. **Zero Friction**: No login required for reviewers. Enter the platform and start analyzing immediately.
2. **Contextual Intelligence**: Insights are never more than one click away.
3. **Responsive Aesthetics**: A "Mobile-First" approach ensuring the complex dashboard remains usable on any device.
4. **Visual Hierarchy**: Use of gradients and shadows (the "Glassmorphism" touch) to separate structure from content.

### Agent Logic (The "Brain")
Our AI prompts are engineered to be **deterministic yet creative**.
- **The Text Agent**: Focuses on semantic density (maximum information, minimum words).
- **The Video Agent**: Acts as a communication coach, analyzing transcripts for structural integrity and audience engagement metrics.

---

## ✨ Features Checklist

- [x] **Universal Capture**: Support for rich text and YouTube URLs.
- [x] **AI Summarization**: Intelligent extraction of key concepts.
- [x] **Video Communication Scores**: Clarity, Engagement, and Structure metrics.
- [x] **Smart Tagging**: Contextual tags based on AI interpretation.
- [x] **Search & Retrieval**: Real-time filtering across the library.
- [x] **Dark/Light Mode**: Full theme persistence and auto-toggle.
- [x] **Profile Management**: Custom user name, email, and photo upload (with LocalStorage).

---

## 📁 Project Structure

```text
├── index.html           # Main Application Entry (Landing + Dashboard)
├── css/
│   ├── variables.css    # Design System & Colors
│   ├── components.css   # Buttons, Modals, Cards
│   └── landing/dashboard.css
├── js/
│   ├── app.js           # Navigation & Core App Logic
│   ├── api.js           # Global API Client
│   └── dashboard.js     # Dashboard State Management
└── server/
    ├── server.js        # Express Node Server
    ├── .env.example     # Instructions for the evaluator
    └── package.json     # Node dependencies
```

---

## ✅ Submission Checklist

- [x] **GitHub Repo**: Clean history, well-structured.
- [x] **Comprehensive README**: Setup, Tech stack, and Design rationale.
- [x] **Env Template**: Included `.env.example`.
- [x] **AI Working**: Verified Groq API integration (Llama 3.1).
- [x] **Responsive**: Verified on Mobile, Tablet, and Desktop.

---

## 📜 License
Built for the **Full-Stack Engineering Internship Challenge**.

*Developed by Sandeep — Optimized for Performance & User Delight.*
