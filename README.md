# MemoryTrain - Memory Support Web Application

A full-stack web application designed to help users improve their memory through various training exercises, scheduling, and learning resources.

## Project Structure

```
/frontend - React.js application built with Vite
/backend - FastAPI server
/db - Database migrations and configuration
docker-compose.yml - Orchestration for all services
.env - Environment variables (not committed to version control)
```

## Features

- **Home**: Landing page with app overview
- **MemoryTraining**: Interactive memory exercises
- **Calendar**: Schedule training sessions
- **Chatbot**: AI assistant for memory improvement
- **Learn**: Educational resources about memory techniques
- **Progress**: Track memory improvement over time

## Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Running Locally

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd memorytrain-1.0
   ```

2. Create `.env` file in the root directory with the following variables:
   ```
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

3. Start the application using Docker Compose
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

### Running in GitHub Codespaces

1. Open the repository in GitHub Codespaces
2. Create the `.env` file as described above
3. Run the following commands in the terminal:
   ```bash
   docker-compose up -d
   ```

4. When Codespaces provides the port forwarding links, access the application through those links

## Development

### Running Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Creating New Migrations

```bash
docker-compose exec backend alembic revision --autogenerate -m "description of changes"
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. Runs tests for both frontend and backend
2. Builds Docker images
3. Pushes to a staging server on commits to the main branch

## License

MIT