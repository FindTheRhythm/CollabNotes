# CollabNotes

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-blue.svg)

> A modern, full-featured collaborative note-taking platform built with React, TypeScript, Express, and PostgreSQL. Create, share, and collaborate on interactive notes with real-time synchronization and comprehensive access control.

## ✨ Key Features

- **Authentication & Security** — JWT-based authentication with access and refresh tokens
- **Role-Based Access Control** — Granular permissions for USER, EDITOR, and ADMIN roles
- **Rich Note Management** — CRUD operations with flexible sharing and collaboration settings
- **Real-Time Collaboration** — WebSocket support for live note editing and commenting
- **Advanced Search** — Full-text search capabilities across all notes
- **Performance Optimization** — Redis caching layer for improved response times
- **Production-Ready** — Fully containerized with Docker Compose and Nginx reverse proxy

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18** — Modern UI framework with hooks and concurrent features
- **TypeScript** — Type-safe development experience
- **Vite** — Lightning-fast build tool and development server
- **React Router** — Client-side routing
- **Redux Toolkit** — Predictable state management
- **Axios** — HTTP client for API communication

### Backend Stack
- **Node.js + Express** — Lightweight and scalable server framework
- **TypeScript** — Full type safety for backend code
- **PostgreSQL** — Robust relational database
- **Redis** — In-memory cache for performance optimization
- **JWT** — Secure token-based authentication

### Infrastructure
- **Docker & Docker Compose** — Containerization and orchestration
- **Nginx** — Reverse proxy and load balancing
- **PostgreSQL** — Database service
- **Redis** — Cache service
- **PgAdmin** — Database administration UI

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (v20.10+)
- **Git**
- *(Optional)* Node.js 20+ and npm for local development

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd CollabNotes
```

#### 2. Configure Environment Variables

Create and configure the necessary environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with appropriate values:

```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=collabnotes
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_SSL=false
JWT_ACCESS_SECRET=your_access_secret_key_min_32_characters_prod
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters_prod
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=http://localhost
```

#### 3. Build and Start Services

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

#### 4. Initialize Database

The database automatically initializes on first run. To manually initialize:

```bash
docker-compose exec postgres psql -U postgres -d collabnotes -f /docker-entrypoint-initdb.d/init-db.sh
```

#### 5. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost | — |
| Backend API | http://localhost:3000/api | — |
| WebSocket | http://localhost:4000 | — |
| PgAdmin | http://localhost:5050 | admin@example.com / admin_password |

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm install
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm install
npm test
```

## 💻 Local Development

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

The backend development server will start with hot-reload enabled.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend development server will start with HMR (Hot Module Replacement).

## 📁 Project Structure

```
CollabNotes/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Express middleware
│   │   ├── validators/        # Input validation
│   │   ├── config/            # Configuration files
│   │   └── database/          # Database configuration
│   ├── tests/                 # Unit and integration tests
│   ├── database/              # Database migrations
│   └── package.json
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store configuration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── api/               # API client services
│   │   └── utils/             # Utility functions
│   └── package.json
├── websocket/                 # Real-time WebSocket server
├── database/                  # Database migrations and seeds
│   ├── migrations/            # SQL migration files
│   └── seeds/                 # Initial seed data
├── docker-compose.yml         # Service orchestration
└── README.md
```

## 🔧 Troubleshooting

### Database Connection Issues

```bash
docker-compose logs postgres
docker-compose down -v
docker-compose up postgres
```

### Port Already in Use

Update port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 8080 to your preferred port
```

### Cache Issues

Clear Redis cache:

```bash
docker-compose exec redis redis-cli FLUSHALL
```

### View Service Logs

```bash
docker-compose logs -f <service-name>
# Examples: postgres, redis, backend, frontend
```

## 📊 Database Migrations

All migrations are stored in `database/migrations/`. To add a new migration:

1. Create a new SQL file with the naming convention: `###_description.sql`
2. Place it in the `database/migrations/` directory
3. Restart the services: `docker-compose up postgres`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** changes: `git commit -m "Add feature description"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request with a clear description

### Code Guidelines

- Follow TypeScript best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** May 2026  
