# 🧠 MemoryTrain – Memory Support Web Application

**MemoryTrain** is a full-stack web application designed to support early dementia patients and their caregivers through cognitive training, daily reminders, and helpful educational tools — all within a simple and accessible interface.

---

## 📁 Project Structure

```
/frontend            - React.js app built with Vite  
/backend             - FastAPI backend  
/db                  - Alembic migrations and configuration  
docker-compose.yml   - Orchestrates frontend, backend, and DB  
.env                 - Environment variables (excluded from version control)  
```

---

## ✨ Key Features

| Module            | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| 🏠 Home            | Minimal landing screen with simple navigation                              |
| 🧠 MemoryTraining  | Interactive memory games (face-name match, word recall)                     |
| 📅 Calendar        | Schedule training sessions, reminders for meds/events                       |
| 💬 Chatbot         | Keyword-based assistant for basic questions like appointments/reminders     |
| 📘 Learn           | Educational resources for caregivers to understand tools and techniques     |
| 📊 Progress        | Track memory activity and routine engagement over time                      |

---

## 🛠 Technology Stack

| Layer         | Stack                                 |
|---------------|----------------------------------------|
| Frontend      | React.js with Vite                     |
| Backend       | FastAPI (Python), SQLAlchemy ORM       |
| Database      | PostgreSQL                             |
| DevOps        | Docker, Docker Compose                 |
| CI/CD         | GitHub Actions                         |

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Docker & Docker Compose installed  
- Git

### 🖥️ Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdul-Hannan-21/Digital-Product-Development.git
   cd Digital-Product-Development
   ```

2. **Create a `.env` file** in the root directory:

   ```env
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=memorytrain
   POSTGRES_HOST=db
   POSTGRES_PORT=5432

   # Backend
   BACKEND_PORT=8000

   # Frontend
   FRONTEND_PORT=3000
   ```

3. **Start the application**

   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend UI: http://localhost:3000  
   - Backend API Docs: http://localhost:8000/docs

---

### ⚙️ Running in GitHub Codespaces

1. Open the project in **GitHub Codespaces**  
2. Create the `.env` file as shown above  
3. Run:

   ```bash
   docker-compose up -d
   ```

4. Use the **forwarded ports** provided by Codespaces to access the app

---


---

## 🔁 CI/CD Pipeline (GitHub Actions)

The project includes a GitHub Actions workflow that:

- ✅ Runs frontend and backend tests  
- 🐳 Builds Docker containers  
- 🚀 Deploys to staging server on push to `main` branch

---

## 👨‍💻 Team Contributors

- Abdul Hannan  
- Abdul Mannnan  
- Muhammad Salman Tariq 
- Ayesha Hamid  

---
