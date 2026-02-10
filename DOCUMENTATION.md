# SecondBrain 🧠 — Product Documentation & Design Rationale

## 🏗️ Architecture Overview

The system is designed as a lightweight, high-performance distributed application. We avoided heavy frameworks (like React) for this demo to achieve **sub-100ms load times** and demonstrate deep proficiency in the Core Web Stack.

### 1. Frontend (The Interface)
- **Vanilla JavaScript**: Used a custom event-driven architecture for state management.
- **CSS Design System**: Built a modular design system in `variables.css` using HSL color tokens for seamless Theme Swapping.
- **Glassmorphism UI**: High-end visual style using backdrop-filters and layered shadows to create depth.

### 2. Backend (The Orchestration)
- **Express.js API**: A clean RESTful interface that acts as the bridge between the user and the LLM.
- **LPU Orchestration**: Specifically tuned for Groq's LPU architecture, allowing us to pipe large video transcripts for instant analysis.

---

## 💡 UX & Interaction Principles

### "Calm Technology" approach
The dashboard is designed to be **informative but not overwhelming**.
- **Collapsible Sidebar**: Gives content maximum screen real estate.
- **Shimmer Loading**: Provides cognitive feedback while AI is "thinking."
- **Visual Feedback**: Success toasts for all major actions (Saving, Deleting, Profile Updates).

### The "Personalization" Layer
We implemented a **No-Account Personalization** model:
- Users can change their name, email, and photo.
- Data is hashed and stored in `LocalStorage`.
- This provides the "feeling" of a logged-in experience without the friction of a signup form.

---

## 🤖 AI "Agent Thinking" Logic

Our AI prompts in `server.js` are not simple templates. They are **System Instructions** that force the model to behave as a "Knowledge Architect."

### Text Extraction Strategy
The AI is instructed to identify "Atomic Knowledge." Instead of a long summary, it breaks down content into **Key Points** that can be consumed in under 10 seconds.

### Video Communication scoring
We use a custom rubric for the AI to score communication:
1. **Clarity**: Is the speaker using jargon? Is the message direct?
2. **Engagement**: Is the tone dynamic?
3. **Structure**: Is there a clear introduction, body, and conclusion?

---

## 🛠️ Infrastructure & Maintenance 

- **Security**: All API keys are stored in server-side process environments.
- **Scalability**: The modular JS files (`api.js`, `dashboard.js`) allow for easy migration to a framework like React in the future.
- **Maintenance**: Zero build step required. The project runs directly in any modern browser.
