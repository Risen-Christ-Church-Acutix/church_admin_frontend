# Church Administration Software - Project Transition Document

**Project Name:** Church Administration Software  
**Prepared By:** Intern Development Team (Sujan P, Kishore S, Dharaneesh K S)

---

## 1. Project Overview and Key Objectives

The Church Administration Software is a comprehensive web-based application designed to streamline parish management operations. The primary objectives include:

- **Parishioner Management:** Centralized database for managing parishioner records, families, and BCC (Basic Christian Community) groups
- **Sacramental Records:** Digital tracking and certificate generation for Baptism, First Holy Communion, Confirmation, Marriage, and Funeral services
- **Financial Management:** Income and expense tracking with automated receipt generation and reporting capabilities
- **Event Management:** Scheduling and registration system for Mass, feasts, retreats, and meetings
- **User Administration:** Role-based access control for different parish staff members

The solution aims to reduce manual paperwork, improve data accuracy, enhance community engagement, and provide comprehensive reporting capabilities for parish administration.

---

## 2. Architecture and Design Decisions

### 2.1 System Architecture

- **Architecture Type:** Web-based Single Page Application (SPA)
- **Frontend:** React.js with modern component architecture
- **Backend:** Node.js with Express.js framework
- **Database:** PostgreSQL for robust data management
- **Authentication:** JWT (JSON Web Tokens) for secure session management
- **Deployment:** Containerized using Docker on AWS LightSail
- **Web Server:** Nginx for serving frontend static files
- **Email Service:** SMTP integration for admin password reset

### 2.2 Code Structure

- **Frontend Repository:** Separate React.js application with component-based architecture
- **Backend Repository:** Node.js/Express API with RESTful endpoints
- **Database Schema:** Managed through Prisma ORM (schema located in `prisma/schema.prisma`)
- **Containerization:** Docker Compose configuration for orchestrating all services
- **Deployment:** Automated CI/CD pipeline using GitHub Actions

### 2.3 Security Considerations

- Password encryption using bcrypt
- Role-based access control (RBAC) with five user roles: Administrator, Parish Priest, Parish Secretary, Catechist, and Accountant
- JWT-based authentication for API security
- Environment variable management for sensitive configurations

---

## 3. Setup Instructions

### 3.1 Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git for version control

### 3.2 Local Development Setup

#### Step 1: Clone Repositories

```bash
# Create project directory
mkdir church-admin
cd church-admin

# Clone both repositories
git clone https://github.com/Risen-Christ-Church-Acutix/church_admin_frontend frontend
git clone https://github.com/Risen-Christ-Church-Acutix/church_admin_backend backend

# Copy docker-compose.yml to root level
cp docker-compose.yml ./
```

**Note:** Both repositories are stored in the same GitHub account: `churchrisenchrist@gmail.com`
the docker-compose.yml is present at the end of this file.

#### Step 2: Environment Configuration

**Frontend Environment (`.env` for local testing):**
```env
VITE_API_URL=https://church-admin-backend.onrender.com/
VITE_NON_PRODUCTION_API_URL=http://localhost:4000/
```

**Frontend Environment (`.env.production` for Docker):**
```env
VITE_API_URL=/
```

**Backend Environment (`.env`):**
```env
DATABASE_URL=_______________
PORT=4000
JWT_SECRET=_______________
EMAIL=_______________
EMAIL_PASSWORD=_______________
FRONTEND_URL=_______________
BACKEND_URL=_______________
```

**Database Environment (`backend/.env.db` only for Docker):**
```env
POSTGRES_USER=_______________
POSTGRES_PASSWORD=_______________
POSTGRES_DB=_______________
```

#### Step 3: Local Development

```bash
# Backend setup
cd backend
npm install
npx prisma generate
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

#### Step 4: Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Stop services
docker-compose down

# Clean up images (optional)
docker system prune -a
```

### 3.3 Production Deployment

The application is deployed on AWS LightSail with automated CI/CD:

- Frontend and backend repositories trigger deployment via GitHub Actions
- Deploy script present on LightSail (`deploy.sh`) handles containerization and service restart
- Lockfile mechanism prevents concurrent deployments. An overlapping deployment process waits up to 10 minutes for the running deployment to complete
- Complete rebuild process takes 3-5 minutes

---

## 4. Usage Guide

### 4.1 Access Information

- **Production URL:** [AWS LightSail instance URL] current http link (http://43.204.163.169/)
- **Alternative Deployments:**
  - **Frontend:** Vercel deployment (using churchrisenchrist@gmail.com) [https://risen-christ-church.vercel.app/]
  - **Backend:** Render deployment (using churchrisenchrist@gmail.com) (may take 3-5 minutes to wake up after inactivity) [https://church-admin-backend.onrender.com]
  - **Database:** Supabase hosting on same email (churchrisenchrist@gmail.com)

**Note:** All of these were deployed before LightSail deployment and can still be used. For Vercel deployment, the repository should be kept public for collaboration. Since we are using LightSail, the repository can be changed to private after stopping the Vercel deployment.

### 4.2 User Roles and Access

- **Administrator:** Full system access including user management
- **Parish Priest:** Access to all parish records and sacramental functions
- **Parish Secretary:** Administrative tasks and parishioner management
- **Catechist:** Event management and educational program coordination
- **Accountant:** Financial management and reporting

### 4.3 Key Workflows

#### User Management
- Admin dashboard displays user statistics and management interface
- Password reset functionality (admin-only via email)
- Profile management with role-based restrictions

#### Parishioner Management
- Three-tier hierarchy: BCC Groups → Families → Individual Parishioners
- Comprehensive CRUD operations with soft delete functionality
- Family and parishioner migration capabilities

#### Event Management
- Event creation with categories (Mass, Feast, Retreat, Meeting)
- Registration system supporting both family and individual registration
- Automatic receipt generation for paid events
- Featured events (upcoming within one week)

#### Financial Management
- Income tracking (collections, offerings, donations, subscriptions)
- Expense recording (salaries, maintenance, events, charity)
- Receipt generation and ledger reports

---

## 5. Known Issues, Limitations, and To-Do Items

### 5.1 Implemented Features
- User Management with roles
- Parishioner Management (BCC Groups, Families, Individuals)
- Basic Sacramental Record Management
- Event Management with Registration
- Financial Transaction Recording
- Automated Deployment Pipeline

### 5.2 Pending Implementation

- **Role-based Access Restrictions:** RBAC roles are defined but access control enforcement needs implementation
- **Sacramental Certificate Generation:** Auto-generate PDF certificates for sacraments
- **Family/Parishioner Migration:** Frontend interface for moving families between BCC groups and parishioners between families (backend done, frontend pending).
- **HTTPS Configuration:** SSL certificate setup after domain purchase
- **Database Backup System:** Implement automated daily database backups
- **Event Notifications:** Email/SMS/WhatsApp reminders for events
- **Communication Module:** Bulk messaging system for parish announcements
- **Mobile Responsiveness:** Optimize UI for mobile devices
- **Reporting Dashboard:** Analytics and statistics visualization
- **Document Management:** File upload and storage system
- **Calendar Integration:** Sync with external calendar applications

### 5.3 Known Technical Limitations

- **Backend Cold Start:** Render deployment experiences 3-5 minute delay after inactivity
- **Concurrent Deployment:** 10-minute timeout limit for deployment queue
- **Storage Limitations:** No persistent file storage implemented yet but can be done simply by updating the docker-compose file to use mount/volume for data storage
- **Email Dependencies:** Relies on single Gmail account for notifications

### 5.4 Security Notes

- All passwords are encrypted using bcrypt
- Environment variables contain sensitive information and must be secured
- Database credentials should be rotated regularly
- Consider implementing rate limiting for API endpoints

---

## 6. Handover Recommendations

1. Complete role-based access control implementation
2. Set up automated database backup system
3. Implement remaining CRUD operations for parishioner management
4. Configure HTTPS with proper SSL certificates
5. Implement comprehensive logging and monitoring
6. Add comprehensive test coverage
7. Consider API documentation using tools like Swagger

### 6.1 Maintenance Considerations

- Regular security updates for dependencies
- Database performance monitoring as data grows
- User training documentation
- Backup and disaster recovery procedures

---

## Docker Compose Configuration

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend
    env_file:
      - ./backend/.env
    volumes:
      - backend-receipts:/app/uploads/receipts
    depends_on:
      - db
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:15
    container_name: postgres
    env_file:
      - ./backend/.env.db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  backend-receipts:
    driver: local

networks:
  app-network:
    driver: bridge
```
