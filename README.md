#  MemoryMate

*MemoryMate* is a digital memory companion for early-stage dementia patients and their caregivers. It combines cognitive support, daily structure, and emotional connection in a respectful, accessible web app.

🔗 Live App: [https://focused-meadowlark-488.convex.app]

---

##  Why MemoryMate?

> "Over 55 million people worldwide live with dementia." – WHO, 2021

- 76% of early-stage dementia patients live at home  
- 80% of caregivers report stress, burnout, or emotional fatigue  
- Most apps offer one tool — *MemoryMate focuses on connection and continuity*

---

##  Key Features

### 📅 Gentle Reminders  
- Caregivers or patients set daily or recurring tasks (e.g. medication, appointments)  
- Calming schedule view with optional sound prompts  
- Built to reinforce routine without stress

### 🧠 Cognitive Games  
- Simple games like face-name recall and word association  
- Designed to promote cognitive engagement without frustration

### 💬 Chatbot Assistant  
- Uses OpenAI to answer questions like “What’s next?” or “Did I take my meds?”  
- Encourages independence and reduces repetitive questions

### 🛡 Caregiver Dashboard  
- Monitor reminders, games, and mood trends  
- Send notes of encouragement  
- Maintain visibility without overwhelming the patient

### 🫂 Strengthening Family Connection  
- Caregivers see progress and activity trends  
- Patients feel supported, not monitored  
- Encourages trust and engagement on both sides

---

##  Built With

- *Frontend:* React, Vite, Tailwind CSS  
- *Backend & Hosting:* Convex (real-time DB, functions, auth, deployment)  
  

---

##  Get Started (Local Development)

### Prerequisites

- Node.js  
- npm  
- Convex CLI (npm install -g convex)

### Setup

```bash
git clone <https://github.com/Abdul-Hannan-21/Digital-Product-Development>  # or open it on GitHub Codespaces
cd memorymate
npm install
npm run dev         # Start frontend at http://localhost:5173


---

 Deployment

MemoryMate is deployed via Convex, which hosts both backend and frontend.

 Production

Live App: https://focused-meadowlark-488.convex.app


Deploy to Production

npx convex deploy

This uploads all backend logic and the frontend (if configured) to Convex's production environment.

 Staging Environment

Run locally using:

npx convex dev

Convex auto-generates .env.local and uses a separate dev deployment.

No manual .env editing is needed between environments.


---

📁 Project Structure

memorymate/
├── src/             # React frontend
│   ├── features/    # Dashboard, games, chatbot, etc.
│   └── auth/        # Auth components
├── convex/          # Convex backend
│   ├── reminders.ts
│   ├── memoryGames.ts
│   ├── mood.ts
│   ├── chatbot.ts
│   ├── schema.ts
│   └── _generated/
├── .env.local
├── package.json
├── vite.config.ts

---
## Team Contributions

Abdul Hannan

Abdul Mannan

Muhammad Salman

Ayesha Hamid
