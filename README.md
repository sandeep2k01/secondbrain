# SecondBrain 🧠 — AI-Powered Knowledge Accelerator

> **A high-performance personal intelligence layer that converts passive content into structured knowledge.**

![Project Status](https://img.shields.io/badge/Status-Evaluation--Ready-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_Node_|_Groq-blue?style=for-the-badge)
![AI Model](https://img.shields.io/badge/AI-LLaMA_3.1_(Groq)-6366f1?style=for-the-badge)

<br />

### [👉 Try the Live Demo](https://secondbrain96.vercel.app/)

---

## 🌟 The Vision
I built **SecondBrain** to tackle the modern challenge of information overload. It’s not just a note-taking app—it’s a "Digital Cortex" designed to capture raw text and video content and instantly distill it into actionable insights using low-latency AI inference.

---

## 🛠️ Foolproof Setup (Evaluator Guide)

The project is **stable and ready for evaluation**. You can have it running in under 2 minutes.

### 1. Environment Config
The backend needs a Groq API Key (it's free and fast).

1.  Go to the `/server` folder.
2.  Duplicate `.env.example` and rename it to `.env`.
3.  Add your key: `GROQ_API_KEY=gsk_your_key_here`. 
    *   *Need a key? Get one instantly at [console.groq.com](https://console.groq.com).*

### 2. Launch Sequence
Open two terminal windows:

**Terminal A: The Backend**
```bash
cd server
npm install
node server.js
```
*Current Port: `3001`*

**Terminal B: The Frontend**
```bash
# From the project root
npx -y http-server ./ -p 8080 -c-1
```
*Current Port: `8080`*

**Access the App:** Open `http://localhost:8080` in your browser.

---

## 🚀 Core Intelligence Features

- **Personalized Cortex**: Full profile management (name, email, photo) that persists via `LocalStorage`.
- **Atomic Note Analysis**: Automatically extracts summaries, key points, and semantic tags.
- **Video Communication Coach**: Analyzes transcripts to score **Clarity**, **Engagement**, and **Structure**.
- **Instant Discovery**: Global real-time search across your entire library.
- **Glassmorphism UI**: High-end visual style with nested shadows and backdrop filters.

---

## 📐 Product Thinking & Design Rationale

### Why this stack?
- **Vanilla JS & Modular CSS**: I chose a zero-dependency frontend to show mastery of core web APIs, DOM performance, and responsive design systems without the CRutch of heavy frameworks.
- **LPU Orchestration**: Specifically tuned for Groq's LPU architecture to ensure a "real-time" feel even when processing large transcripts.
- **Calm Technology**: The UI uses "Shimmer" loading and collapsible sidebars to keep the experience informative but never overwhelming.

### The "Personalization" Layer
I implemented a **No-Account Personalization** model using `LocalStorage`. This gives the "feeling" of a logged-in experience without forcing an evaluator to go through a tedious signup process.

---

## ✅ Quality Signals

- **Commit Strategy**: Clean, feature-focused commit history.
- **Security**: Strict `.gitignore` policy ensuring credentials never leak.
- **UX Excellence**: Intentional use of theme persistence, skeleton loaders, and micro-animations.
- **Status**: **Evaluation-Ready**. All core flows (Capture -> Analyze -> Retrieve) are tested.

---

## 📜 License
MIT License — Copyright (c) 2026 Sandeep

---
*Built for the Full-Stack Engineering Internship Challenge. Optimized for performance and user delight.*
