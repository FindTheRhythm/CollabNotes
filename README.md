# CollabNotes - Interactive Notes with Collaborative Access

A production-ready fullstack web application for creating interactive notes with collaborative access control. Built with React, Node.js, Express, PostgreSQL, and Docker.

## 🎯 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Note Management**: Create, read, update, and delete notes
- **Collaborative Access**: Share notes with other users with granular permissions
- **Comments System**: Leave comments and edits on shared notes
- **Role-Based Access Control**: USER, EDITOR, ADMIN roles
- **Search Functionality**: Full-text search across notes
- **Real-time Caching**: Redis integration for performance
- **Responsive Design**: Mobile-friendly UI
- **Production Deployment**: Docker-based containerization with Nginx reverse proxy

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18+
- TypeScript
- Vite
- React Router
- Redux Toolkit
- Axios

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- Redis
- JWT Authentication

**Infrastructure:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- PostgreSQL (Database)
- Redis (Cache)
- PgAdmin (Database Management)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (Latest versions)
- Git
- (Optional) Node.js 20+ and npm for local development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CollabNotes
```

### 2. Configure Environment Variables

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=collabnotes
DB_USER=postgres
DB_PASSWORD=postgres_password
JWT_ACCESS_SECRET=your_secure_access_secret_key_32_chars_minimum
JWT_REFRESH_SECRET=your_secure_refresh_secret_key_32_chars_minimum
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=http://localhost
```

**Frontend (.env)**
```bash
cp frontend/.env.example frontend/.env
```

### 3. Build and Run with Docker Compose

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Initialize Database

The database will automatically initialize on first run. To manually initialize:

```bash
docker-compose exec postgres psql -U postgres -d collabnotes -f /docker-entrypoint-initdb.d/init-db.sh
```

### 5. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **PgAdmin**: http://localhost:5050
  - Email: admin@collabnotes.local
  - Password: admin_password

## 📖 API Documentation

See the comprehensive API documentation in the README above for all endpoints including:
- Authentication endpoints
- Notes management
- Comments management
- Access control
- User management

## 🔐 Authentication & Authorization

### JWT Tokens
- **Access Token**: 15-minute lifetime (configurable)
- **Refresh Token**: 7-day lifetime (configurable)
- Tokens are stored in localStorage on the frontend

### Role-Based Access Control
- **USER**: Can create and manage personal notes
- **EDITOR**: Can edit shared notes with edit permission
- **ADMIN**: Can manage users and view system analytics

## 📊 Database Schema

- **Users**: Authentication and user management
- **Notes**: Note storage with ownership
- **Shared Access**: Granular access control
- **Comments**: Note discussions
- **Refresh Tokens**: Token management

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🛠️ Development

### Local Backend Development
```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

### Local Frontend Development
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
docker-compose logs postgres
docker-compose down -v && docker-compose up postgres
```

### Port Conflicts
Edit `docker-compose.yml` to change port mappings

## 📚 Documentation

- Full API documentation with examples
- Database schema and relationships
- Architecture patterns and design decisions
- Deployment and monitoring guides

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Created**: 2026
