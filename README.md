# TaskFlow – Task Management Application

A full-stack MERN app for creating, updating and tracking tasks.

## Features
- User authentication (register / login, bcrypt-hashed passwords, JWT sessions)
- Authorization: every task belongs to a user; the API only returns or modifies the owner's tasks
- Full CRUD for tasks (title, description, status, priority, due date)
- Search and status filter
- Real-time updates with Socket.IO (changes appear instantly across tabs and devices)
- Responsive layout for desktop and mobile

## Tech stack
React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT · Socket.IO

## Run locally
Prerequisites: Node 18+ and a MongoDB instance (local or MongoDB Atlas).

```bash
# 1. API
cd server
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# 2. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/auth/me | Current user |
| GET | /api/tasks?status=&q= | List own tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Deployment
- Database: MongoDB Atlas
- API: Render (set MONGO_URI, JWT_SECRET, CLIENT_URL)
- Client: Vercel or Netlify (set VITE_API_URL to the API URL)
