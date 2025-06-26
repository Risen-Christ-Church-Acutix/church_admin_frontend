# Church Administration Frontend

This is the frontend for the Church Administration Software, built with React.js as a Single Page Application (SPA). It allows parish staff to manage users, events, sacraments, and finances.

## 🛠️ Technologies Used

- React.js
- Vite
- Tailwind CSS
- Axios (for API requests)
- Docker & Docker Compose

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (v14 or higher)
- Docker & Docker Compose
- Git


### Installation
#### After cloning

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🐳 Docker Deployment

Ensure you're in the root directory (where `docker-compose.yml` is located):

```bash
docker-compose up -d --build
```

To stop:

```bash
docker-compose down
```

## ⚙️ Environment Variables

Create the following environment files:

### `.env`

```env
VITE_API_URL=https://church-admin-backend.onrender.com/
VITE_NON_PRODUCTION_API_URL=http://localhost:4000/
```

### `.env.production`

```env
VITE_API_URL=/
```

## 📌 Notes

- Communicates with backend via RESTful API
- Served through Nginx in production
- UI not fully optimized for mobile yet
- Event reminders and certificate generation are pending features
