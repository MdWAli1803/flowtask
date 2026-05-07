# 🌊 FlowTask — Project & Task Management System

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Railway-blueviolet?style=for-the-badge)](https://your-app.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-MdWAli1803%2Fflowtask-black?style=for-the-badge&logo=github)](https://github.com/MdWAli1803/flowtask)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

> A full-stack project & task management web application with **Role-Based Access Control (RBAC)**, Kanban-style task tracking, and real-time team collaboration — built with **React + Node.js + SQLite**.

---

## 📁 Project Structure

```
flowtask/
│
├── client/                         # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx                 # Main app with page routing (renderPage)
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── server.js                       # Express REST API (backend)
├── flowtask.db                     # SQLite database (auto-created)
├── package.json                    # Backend dependencies
├── package-lock.json
└── README.md
```

---

## ✨ Features

### 🔐 Authentication
- JWT-based Signup & Login
- Role selection at registration: **Admin** or **Member**
- Sessions persisted via localStorage token
- Auto-redirect on login/logout

### 👥 Role-Based Access Control (RBAC)

| Feature | Admin | Member |
|---|:---:|:---:|
| Create / Delete Projects | ✅ | ❌ |
| Manage Team Members | ✅ | ❌ |
| View All Projects | ✅ | Only joined |
| Create Tasks | ✅ | ✅ |
| Update Any Task | ✅ | ❌ |
| Update Own / Assigned Task | ✅ | ✅ |
| View Team Page | ✅ | ❌ |
| Dashboard Stats | Global | Personal |

### 📁 Project Management
- Create, edit, archive, delete projects
- Project status: `Active` / `Completed` / `Archived`
- Per-project team member management
- Task completion progress bar

### ✅ Task Management (Kanban Board)
- Three-column board: **To Do → In Progress → Done**
- Priority: 🔴 High / 🟡 Medium / 🟢 Low
- Assign tasks to project members
- Due date with overdue highlighting
- One-click status transitions

### 📊 Dashboard
- Total projects, tasks, completed & overdue counts
- Recent activity feed
- Project-wise completion summary
- Role-aware: Admins see global stats; Members see personal

### 👨‍👩‍👧 Team Page *(Admin Only)*
- View all registered users
- See roles and project memberships

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Tech | Usage |
|------|-------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Hooks** | State & side effects |
| **Custom CSS** | Styling (App.css, index.css) |

> **Routing:** Page-based rendering via `renderPage()` switch-case in `App.jsx` — no React Router, pure state-driven navigation using `page` and `setPage` props.

### Backend (`server.js`)
| Tech | Usage |
|------|-------|
| **Node.js + Express** | REST API server |
| **better-sqlite3** | Embedded SQL database (`flowtask.db`) |
| **jsonwebtoken** | JWT auth tokens |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation |
| **cors** | Cross-origin requests |

---

## 🗃️ Database Schema

```sql
-- Users table
users (
  id, name, email, password (bcrypt), role (admin|member), created_at
)

-- Projects table
projects (
  id, name, description, status (active|completed|archived),
  owner_id → users.id, created_at
)

-- Project Members (Many-to-Many)
project_members (
  id, project_id → projects.id, user_id → users.id,
  role (admin|member), joined_at
  UNIQUE(project_id, user_id)
)

-- Tasks table
tasks (
  id, title, description,
  status (todo|in_progress|done),
  priority (low|medium|high),
  project_id → projects.id,
  assigned_to → users.id,
  created_by → users.id,
  due_date, created_at, updated_at
)
```

---

## 🔌 REST API Reference

### Auth — `/api/auth`
```
POST   /api/auth/signup       Register (name, email, password, role)
POST   /api/auth/login        Login → returns JWT token
GET    /api/auth/me           Get current user  [Auth Required]
GET    /api/auth/users        List all users    [Auth Required]
```

### Projects — `/api/projects`
```
GET    /api/projects                    Get user's projects
POST   /api/projects                    Create project        [Admin]
GET    /api/projects/:id                Project details + members + tasks
PUT    /api/projects/:id                Update project        [Project Admin]
DELETE /api/projects/:id                Delete project        [Global Admin]
POST   /api/projects/:id/members        Add member            [Project Admin]
DELETE /api/projects/:id/members/:uid   Remove member         [Project Admin]
```

### Tasks — `/api/projects/:projectId/tasks`
```
GET    /.../:projectId/tasks            List all tasks
POST   /.../:projectId/tasks            Create task
PUT    /.../:projectId/tasks/:taskId    Update task
DELETE /.../:projectId/tasks/:taskId    Delete task
```

### Dashboard — `/api/dashboard`
```
GET    /api/dashboard         Role-aware stats for current user
```

> **Auth Header:** `Authorization: Bearer <token>`

---

## ⚙️ Local Setup

### Prerequisites
- Node.js **v18+**
- npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/MdWAli1803/flowtask.git
cd flowtask
```

### 2. Install Backend Dependencies
```bash
npm install
```

Create a `.env` file in the root:
```env
PORT=3000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Start the backend:
```bash
node server.js
# or for auto-reload:
npx nodemon server.js
```
> API runs at: `http://localhost:3000`

### 3. Install Frontend Dependencies
```bash
cd client
npm install
```

Update `vite.config.js` to proxy API (if not already set):
```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

Start the frontend:
```bash
npm run dev
```
> App runs at: `http://localhost:5173`

---

## ☁️ Deployment on Railway

### Step 1 — Push to GitHub *(already done ✅)*
```
https://github.com/MdWAli1803/flowtask
```

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. Select `MdWAli1803/flowtask`
3. Set **Root Directory** → `/` (root, where `server.js` is)
4. Set **Start Command** → `node server.js`
5. Add Environment Variables:
   ```
   PORT=3000
   JWT_SECRET=your_super_secret_key
   NODE_ENV=production
   ```
6. Deploy → Copy the Railway URL (e.g., `https://flowtask.up.railway.app`)

### Step 3 — Deploy Frontend (React Build)
**Option A — Serve from Express (Recommended for single Railway service):**

Add this to `server.js` before your routes:
```js
const path = require('path');

// Serve built React app
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Catch-all: serve React for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  }
});
```

Update `package.json` build script:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm install && npm run build"
  }
}
```

Set Railway **Build Command** → `npm run build`
Set Railway **Start Command** → `npm start`

### Step 4 — Set Frontend API URL
In `client/src/` wherever API calls are made, use:
```js
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

Add Railway env variable:
```
VITE_API_URL=/api
```

### ✅ App is Live!
Visit your Railway URL — both frontend and backend served together.

---

## 🧪 Test Accounts

Register via the Signup page and choose your role:

| Role | Suggested Email | Password |
|------|----------------|----------|
| Admin | admin@flowtask.com | admin123 |
| Member | member@flowtask.com | member123 |

**Admin can:** Create projects → Add members → Create & assign tasks → View team

**Member can:** View joined projects → Create tasks → Update own tasks → Track progress

---

## 🔒 Security Highlights

- 🔑 Passwords hashed with **bcrypt** (10 salt rounds)
- 🎟️ JWT tokens expire in **7 days**
- 🛡️ RBAC enforced at **middleware level** (server-side, not just frontend)
- ✅ All inputs validated with **express-validator**
- 🔒 SQL injection prevented via **parameterized queries**
- 🚫 Members cannot access projects they haven't joined

---

## 📹 Demo Video

🎬 **[Watch Demo on YouTube](https://youtube.com/your-link-here)** *(2–5 min)*

Demo covers:
1. Signup as Admin → Create project → Add member
2. Signup as Member → View project → Create task
3. Kanban board — move tasks across columns
4. Dashboard stats for both roles
5. Live Railway URL walkthrough

---

## 👨‍💻 Author

**Md Wali** — [@MdWAli1803](https://github.com/MdWAli1803)

---

## 📄 License

MIT License © 2025 Md Wali
