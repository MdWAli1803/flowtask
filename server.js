/**
 * ============================================================
 *  FlowTask — Complete Backend (server.js)
 *  Stack : Express.js + SQLite (better-sqlite3) + JWT + bcrypt
 * ============================================================
 *
 *  SETUP (run once):
 *    npm init -y
 *    npm install express better-sqlite3 bcryptjs jsonwebtoken cors dotenv
 *
 *  START:
 *    node server.js        (or: nodemon server.js)
 *
 *  ENV  →  create a .env file:
 *    PORT=5000
 *    JWT_SECRET=your_super_secret_key_here
 *
 *  BASE URL : http://localhost:5000/api
 * ============================================================
 */

require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "flowtask_dev_secret_change_in_prod";
const JWT_EXPIRES = "7d";

// ─── APP & DB ─────────────────────────────────────────────────────────────────
const app = express();
const db = new Database(path.join(__dirname, "flowtask.db"));

app.use(cors());
app.use(express.json());

// ─── DB: ENABLE WAL & FOREIGN KEYS ───────────────────────────────────────────
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── DB: CREATE TABLES ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'member' CHECK(role IN ('admin','member')),
    avatar      TEXT    DEFAULT '#7c6af7',
    initials    TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by  INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    status      TEXT    NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','inprogress','done')),
    priority    TEXT    NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
    due_date    TEXT,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );
`);

// ─── SEED DEMO DATA (only if users table empty) ───────────────────────────────
const seedDB = () => {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (count > 0) return;

  const hash = (p) => bcrypt.hashSync(p, 10);
  const initials = (n) => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password, role, avatar, initials) VALUES (?,?,?,?,?,?)"
  );
  const u1 = insertUser.run("Arjun Singh",  "admin@demo.com",  hash("admin123"),  "admin",  "#7c6af7", initials("Arjun Singh"));
  const u2 = insertUser.run("Priya Sharma", "member@demo.com", hash("member123"), "member", "#f97316", initials("Priya Sharma"));
  const u3 = insertUser.run("Rahul Kumar",  "rahul@demo.com",  hash("rahul123"),  "member", "#22c55e", initials("Rahul Kumar"));

  const insertProject = db.prepare(
    "INSERT INTO projects (name, description, created_by) VALUES (?,?,?)"
  );
  const p1 = insertProject.run("E-commerce Platform", "Full-stack shopping platform with React & Node", u1.lastInsertRowid);
  const p2 = insertProject.run("Mobile App MVP",       "React Native app for delivery tracking",         u1.lastInsertRowid);

  const insertMember = db.prepare("INSERT INTO project_members (project_id, user_id) VALUES (?,?)");
  [u1, u2, u3].forEach(u => insertMember.run(p1.lastInsertRowid, u.lastInsertRowid));
  [u1, u2].forEach(u => insertMember.run(p2.lastInsertRowid, u.lastInsertRowid));

  const insertTask = db.prepare(
    "INSERT INTO tasks (title, description, project_id, assigned_to, created_by, status, priority, due_date) VALUES (?,?,?,?,?,?,?,?)"
  );
  const pid1 = p1.lastInsertRowid, pid2 = p2.lastInsertRowid;
  const a1 = u1.lastInsertRowid, a2 = u2.lastInsertRowid, a3 = u3.lastInsertRowid;

  insertTask.run("Design homepage UI",   "Create Figma mockups for landing page",      pid1, a2, a1, "done",       "high",   "2025-04-15");
  insertTask.run("Setup API endpoints",  "Build REST APIs for auth and products",       pid1, a3, a1, "inprogress", "high",   new Date().toISOString().split("T")[0]);
  insertTask.run("Database schema",      "Design PostgreSQL schema for orders",         pid1, a1, a1, "done",       "medium", "2025-04-15");
  insertTask.run("Payment integration",  "Integrate Razorpay payment gateway",          pid1, a2, a1, "todo",       "high",   "2025-06-30");
  insertTask.run("App wireframes",       "Wireframe all main screens",                  pid2, a2, a1, "inprogress", "medium", "2025-04-15");
  insertTask.run("Push notifications",   "Firebase push notification setup",            pid2, a1, a1, "todo",       "low",    "2025-06-30");

  console.log("✅ Demo data seeded");
};

seedDB();

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const respond = (res, status, data) => res.status(status).json(data);
const ok      = (res, data)         => respond(res, 200, { success: true, ...data });
const created = (res, data)         => respond(res, 201, { success: true, ...data });
const badReq  = (res, msg)          => respond(res, 400, { success: false, message: msg });
const unauth  = (res, msg)          => respond(res, 401, { success: false, message: msg });
const forbid  = (res, msg)          => respond(res, 403, { success: false, message: msg });
const notFound= (res, msg)          => respond(res, 404, { success: false, message: msg });
const err500  = (res, e)            => { console.error(e); respond(res, 500, { success: false, message: "Server error" }); };

const makeToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const safeUser = (u) => {
  const { password, ...rest } = u;
  return rest;
};

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────

/** Verify JWT and attach req.user */
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return unauth(res, "No token provided");
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    // Refresh user from DB (role may have changed)
    const u = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!u) return unauth(res, "User not found");
    req.user = u;
    next();
  } catch {
    return unauth(res, "Invalid or expired token");
  }
};

/** Admin-only gate */
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return forbid(res, "Admin access required");
  next();
};

/** Check if user is member of a project (or admin) */
const projectAccess = (req, res, next) => {
  const projectId = Number(req.params.projectId || req.body.project_id);
  if (!projectId) return badReq(res, "project_id required");
  const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  if (!proj) return notFound(res, "Project not found");
  if (req.user.role === "admin") { req.project = proj; return next(); }
  const member = db.prepare("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?")
    .get(projectId, req.user.id);
  if (!member) return forbid(res, "Not a member of this project");
  req.project = proj;
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH ROUTES  /api/auth
// ─────────────────────────────────────────────────────────────────────────────
const authRouter = express.Router();

/**
 * POST /api/auth/signup
 * Body: { name, email, password, role? }
 */
authRouter.post("/signup", (req, res) => {
  try {
    const { name, email, password, role = "member" } = req.body;
    if (!name || !email || !password) return badReq(res, "name, email and password are required");
    if (!["admin", "member"].includes(role)) return badReq(res, "role must be admin or member");

    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) return badReq(res, "Email already registered");

    const hashed   = bcrypt.hashSync(password, 10);
    const inits    = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors   = ["#7c6af7","#f97316","#22c55e","#ef4444","#eab308","#06b6d4"];
    const avatar   = colors[Math.floor(Math.random() * colors.length)];

    const result = db.prepare(
      "INSERT INTO users (name, email, password, role, avatar, initials) VALUES (?,?,?,?,?,?)"
    ).run(name, email, hashed, role, avatar, inits);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    created(res, { user: safeUser(user), token: makeToken(user) });
  } catch (e) { err500(res, e); }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
authRouter.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badReq(res, "email and password required");

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return unauth(res, "Invalid credentials");

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return unauth(res, "Invalid credentials");

    ok(res, { user: safeUser(user), token: makeToken(user) });
  } catch (e) { err500(res, e); }
});

/**
 * GET /api/auth/me  →  current user info
 */
authRouter.get("/me", auth, (req, res) => {
  ok(res, { user: safeUser(req.user) });
});

// ─────────────────────────────────────────────────────────────────────────────
//  USER ROUTES  /api/users  (admin only except GET self)
// ─────────────────────────────────────────────────────────────────────────────
const usersRouter = express.Router();
usersRouter.use(auth);

/** GET /api/users  →  all users (admin) or just self (member) */
usersRouter.get("/", (req, res) => {
  try {
    if (req.user.role === "admin") {
      const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all().map(safeUser);
      return ok(res, { users });
    }
    ok(res, { users: [safeUser(req.user)] });
  } catch (e) { err500(res, e); }
});

/** GET /api/users/:id */
usersRouter.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (req.user.role !== "admin" && req.user.id !== id) return forbid(res, "Forbidden");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return notFound(res, "User not found");
    ok(res, { user: safeUser(user) });
  } catch (e) { err500(res, e); }
});

/** PATCH /api/users/:id  →  update name / role (admin), or own profile */
usersRouter.patch("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (req.user.role !== "admin" && req.user.id !== id) return forbid(res, "Forbidden");

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return notFound(res, "User not found");

    const { name, role, avatar } = req.body;
    // Members cannot promote themselves
    if (role && req.user.role !== "admin") return forbid(res, "Only admins can change roles");
    if (role && !["admin","member"].includes(role)) return badReq(res, "Invalid role");

    const newName   = name   || user.name;
    const newRole   = role   || user.role;
    const newAvatar = avatar || user.avatar;
    const newInits  = newName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    db.prepare("UPDATE users SET name=?, role=?, avatar=?, initials=? WHERE id=?")
      .run(newName, newRole, newAvatar, newInits, id);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    ok(res, { user: safeUser(updated) });
  } catch (e) { err500(res, e); }
});

/** DELETE /api/users/:id  (admin only) */
usersRouter.delete("/:id", adminOnly, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (req.user.id === id) return badReq(res, "Cannot delete yourself");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return notFound(res, "User not found");
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    ok(res, { message: "User deleted" });
  } catch (e) { err500(res, e); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PROJECT ROUTES  /api/projects
// ─────────────────────────────────────────────────────────────────────────────
const projectsRouter = express.Router();
projectsRouter.use(auth);

/** Helper: get project with members array */
const getProjectWithMembers = (projectId) => {
  const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  if (!proj) return null;
  const members = db.prepare(
    "SELECT u.id, u.name, u.email, u.role, u.avatar, u.initials FROM users u JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?"
  ).all(projectId);
  return { ...proj, members };
};

/** GET /api/projects  →  admin: all  |  member: their projects */
projectsRouter.get("/", (req, res) => {
  try {
    let rows;
    if (req.user.role === "admin") {
      rows = db.prepare("SELECT id FROM projects ORDER BY created_at DESC").all();
    } else {
      rows = db.prepare(
        "SELECT p.id FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE pm.user_id = ? ORDER BY p.created_at DESC"
      ).all(req.user.id);
    }
    const projects = rows.map(r => getProjectWithMembers(r.id));
    ok(res, { projects });
  } catch (e) { err500(res, e); }
});

/** GET /api/projects/:projectId */
projectsRouter.get("/:projectId", (req, res) => {
  try {
    const id = Number(req.params.projectId);
    const proj = getProjectWithMembers(id);
    if (!proj) return notFound(res, "Project not found");
    if (req.user.role !== "admin" && !proj.members.find(m => m.id === req.user.id))
      return forbid(res, "Not a member of this project");
    ok(res, { project: proj });
  } catch (e) { err500(res, e); }
});

/** POST /api/projects  (admin only) */
projectsRouter.post("/", adminOnly, (req, res) => {
  try {
    const { name, description = "", member_ids = [] } = req.body;
    if (!name) return badReq(res, "name is required");

    const result = db.prepare(
      "INSERT INTO projects (name, description, created_by) VALUES (?,?,?)"
    ).run(name, description, req.user.id);

    const projectId = result.lastInsertRowid;

    // Always add creator as member
    const memberSet = new Set([req.user.id, ...member_ids.map(Number)]);
    const insertMember = db.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?,?)");
    memberSet.forEach(uid => insertMember.run(projectId, uid));

    const proj = getProjectWithMembers(projectId);
    created(res, { project: proj });
  } catch (e) { err500(res, e); }
});

/** PATCH /api/projects/:projectId  (admin only) */
projectsRouter.patch("/:projectId", adminOnly, (req, res) => {
  try {
    const id = Number(req.params.projectId);
    const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!proj) return notFound(res, "Project not found");

    const { name, description, member_ids } = req.body;
    db.prepare("UPDATE projects SET name=?, description=? WHERE id=?")
      .run(name || proj.name, description !== undefined ? description : proj.description, id);

    if (Array.isArray(member_ids)) {
      db.prepare("DELETE FROM project_members WHERE project_id = ?").run(id);
      const memberSet = new Set([proj.created_by, ...member_ids.map(Number)]);
      const ins = db.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?,?)");
      memberSet.forEach(uid => ins.run(id, uid));
    }

    ok(res, { project: getProjectWithMembers(id) });
  } catch (e) { err500(res, e); }
});

/** DELETE /api/projects/:projectId  (admin only) */
projectsRouter.delete("/:projectId", adminOnly, (req, res) => {
  try {
    const id = Number(req.params.projectId);
    const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!proj) return notFound(res, "Project not found");
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    ok(res, { message: "Project deleted" });
  } catch (e) { err500(res, e); }
});

/** POST /api/projects/:projectId/members  →  add member (admin) */
projectsRouter.post("/:projectId/members", adminOnly, (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { user_id } = req.body;
    if (!user_id) return badReq(res, "user_id required");
    const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
    if (!proj) return notFound(res, "Project not found");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(user_id));
    if (!user) return notFound(res, "User not found");
    db.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?,?)").run(projectId, Number(user_id));
    ok(res, { project: getProjectWithMembers(projectId) });
  } catch (e) { err500(res, e); }
});

/** DELETE /api/projects/:projectId/members/:userId  →  remove member (admin) */
projectsRouter.delete("/:projectId/members/:userId", adminOnly, (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId    = Number(req.params.userId);
    db.prepare("DELETE FROM project_members WHERE project_id = ? AND user_id = ?").run(projectId, userId);
    ok(res, { project: getProjectWithMembers(projectId) });
  } catch (e) { err500(res, e); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  TASK ROUTES  /api/tasks  and  /api/projects/:projectId/tasks
// ─────────────────────────────────────────────────────────────────────────────
const tasksRouter = express.Router();
tasksRouter.use(auth);

/** Helper: enrich task with user & project info */
const enrichTask = (task) => {
  const assignee = task.assigned_to
    ? safeUser(db.prepare("SELECT * FROM users WHERE id = ?").get(task.assigned_to))
    : null;
  const creator = safeUser(db.prepare("SELECT * FROM users WHERE id = ?").get(task.created_by));
  const project = db.prepare("SELECT id, name FROM projects WHERE id = ?").get(task.project_id);
  return { ...task, assignee, creator, project };
};

/** GET /api/tasks  →  admin: all tasks | member: assigned to them */
tasksRouter.get("/", (req, res) => {
  try {
    const { status, priority, project_id } = req.query;
    let query = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (req.user.role !== "admin") {
      query += " AND assigned_to = ?"; params.push(req.user.id);
    }
    if (status)     { query += " AND status = ?";     params.push(status); }
    if (priority)   { query += " AND priority = ?";   params.push(priority); }
    if (project_id) { query += " AND project_id = ?"; params.push(Number(project_id)); }
    query += " ORDER BY created_at DESC";

    const tasks = db.prepare(query).all(...params).map(enrichTask);
    ok(res, { tasks });
  } catch (e) { err500(res, e); }
});

/** GET /api/tasks/:id */
tasksRouter.get("/:id", (req, res) => {
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(Number(req.params.id));
    if (!task) return notFound(res, "Task not found");
    if (req.user.role !== "admin" && task.assigned_to !== req.user.id) return forbid(res, "Forbidden");
    ok(res, { task: enrichTask(task) });
  } catch (e) { err500(res, e); }
});

/** POST /api/tasks  (admin only) */
tasksRouter.post("/", adminOnly, (req, res) => {
  try {
    const { title, description = "", project_id, assigned_to, status = "todo", priority = "medium", due_date } = req.body;
    if (!title)      return badReq(res, "title is required");
    if (!project_id) return badReq(res, "project_id is required");

    const proj = db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(project_id));
    if (!proj) return notFound(res, "Project not found");

    if (assigned_to) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(assigned_to));
      if (!user) return notFound(res, "Assigned user not found");
    }

    if (!["todo","inprogress","done"].includes(status))   return badReq(res, "Invalid status");
    if (!["low","medium","high"].includes(priority))      return badReq(res, "Invalid priority");

    const result = db.prepare(
      "INSERT INTO tasks (title, description, project_id, assigned_to, created_by, status, priority, due_date) VALUES (?,?,?,?,?,?,?,?)"
    ).run(title, description, Number(project_id), assigned_to ? Number(assigned_to) : null, req.user.id, status, priority, due_date || null);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    created(res, { task: enrichTask(task) });
  } catch (e) { err500(res, e); }
});

/** PATCH /api/tasks/:id
 *  Admin: can change anything
 *  Member: can only change status of tasks assigned to them
 */
tasksRouter.patch("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!task) return notFound(res, "Task not found");

    if (req.user.role !== "admin") {
      if (task.assigned_to !== req.user.id) return forbid(res, "You can only update your own tasks");
      // Members can only update status
      const { status } = req.body;
      if (!status) return badReq(res, "Members can only update status");
      if (!["todo","inprogress","done"].includes(status)) return badReq(res, "Invalid status");
      db.prepare("UPDATE tasks SET status=?, updated_at=datetime('now') WHERE id=?").run(status, id);
      const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      return ok(res, { task: enrichTask(updated) });
    }

    // Admin: full update
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    if (status   && !["todo","inprogress","done"].includes(status))  return badReq(res, "Invalid status");
    if (priority && !["low","medium","high"].includes(priority))     return badReq(res, "Invalid priority");

    db.prepare(`
      UPDATE tasks SET
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        assigned_to = ?,
        status      = COALESCE(?, status),
        priority    = COALESCE(?, priority),
        due_date    = ?,
        updated_at  = datetime('now')
      WHERE id = ?
    `).run(
      title       || null,
      description !== undefined ? description : null,
      assigned_to !== undefined ? (assigned_to ? Number(assigned_to) : null) : task.assigned_to,
      status   || null,
      priority || null,
      due_date !== undefined ? due_date : task.due_date,
      id
    );

    const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    ok(res, { task: enrichTask(updated) });
  } catch (e) { err500(res, e); }
});

/** DELETE /api/tasks/:id  (admin only) */
tasksRouter.delete("/:id", adminOnly, (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!task) return notFound(res, "Task not found");
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    ok(res, { message: "Task deleted" });
  } catch (e) { err500(res, e); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD / STATS ROUTES  /api/stats
// ─────────────────────────────────────────────────────────────────────────────
const statsRouter = express.Router();
statsRouter.use(auth);

/** GET /api/stats  →  summary for logged-in user */
statsRouter.get("/", (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let taskQuery = "SELECT * FROM tasks";
    let taskParams = [];

    if (req.user.role !== "admin") {
      taskQuery += " WHERE assigned_to = ?";
      taskParams = [req.user.id];
    }

    const allTasks = db.prepare(taskQuery).all(...taskParams);

    const stats = {
      total:      allTasks.length,
      todo:       allTasks.filter(t => t.status === "todo").length,
      inprogress: allTasks.filter(t => t.status === "inprogress").length,
      done:       allTasks.filter(t => t.status === "done").length,
      overdue:    allTasks.filter(t => t.status !== "done" && t.due_date && t.due_date < today).length,
    };

    // Project progress
    let projRows;
    if (req.user.role === "admin") {
      projRows = db.prepare("SELECT id, name FROM projects").all();
    } else {
      projRows = db.prepare(
        "SELECT p.id, p.name FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE pm.user_id = ?"
      ).all(req.user.id);
    }

    const projects = projRows.map(p => {
      const pTasks = db.prepare("SELECT * FROM tasks WHERE project_id = ?").all(p.id);
      const done   = pTasks.filter(t => t.status === "done").length;
      return {
        id: p.id, name: p.name,
        total: pTasks.length, done,
        percent: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0,
      };
    });

    // Recent tasks (last 5)
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(enrichTask);

    ok(res, { stats, projects, recentTasks });
  } catch (e) { err500(res, e); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  MOUNT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRouter);
app.use("/api/users",    usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks",    tasksRouter);
app.use("/api/stats",    statsRouter);

/** Health check */
app.get("/api/health", (_, res) => ok(res, { message: "FlowTask API is running 🚀" }));

/** 404 fallback */
app.use((req, res) => respond(res, 404, { success: false, message: `Route ${req.method} ${req.url} not found` }));

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FlowTask API running → http://localhost:${PORT}/api`);
  console.log(`📋 Health check       → http://localhost:${PORT}/api/health`);
  console.log(`\n🔑 Demo accounts:`);
  console.log(`   Admin  → admin@demo.com  / admin123`);
  console.log(`   Member → member@demo.com / member123`);
  console.log(`   Member → rahul@demo.com  / rahul123\n`);
});

/**
 * ============================================================
 *  FULL API REFERENCE
 * ============================================================
 *
 *  AUTH
 *  ─────────────────────────────────────────────────
 *  POST   /api/auth/signup          { name, email, password, role? }
 *  POST   /api/auth/login           { email, password }
 *  GET    /api/auth/me              (auth required)
 *
 *  USERS  (auth required)
 *  ─────────────────────────────────────────────────
 *  GET    /api/users                admin: all | member: self
 *  GET    /api/users/:id
 *  PATCH  /api/users/:id            { name?, role?(admin), avatar? }
 *  DELETE /api/users/:id            (admin only)
 *
 *  PROJECTS  (auth required)
 *  ─────────────────────────────────────────────────
 *  GET    /api/projects             admin: all | member: own
 *  GET    /api/projects/:id
 *  POST   /api/projects             (admin) { name, description?, member_ids? }
 *  PATCH  /api/projects/:id         (admin) { name?, description?, member_ids? }
 *  DELETE /api/projects/:id         (admin)
 *  POST   /api/projects/:id/members (admin) { user_id }
 *  DELETE /api/projects/:id/members/:uid (admin)
 *
 *  TASKS  (auth required)
 *  ─────────────────────────────────────────────────
 *  GET    /api/tasks                ?status=&priority=&project_id=
 *  GET    /api/tasks/:id
 *  POST   /api/tasks                (admin) { title, project_id, description?, assigned_to?, status?, priority?, due_date? }
 *  PATCH  /api/tasks/:id            admin: all fields | member: { status } only
 *  DELETE /api/tasks/:id            (admin)
 *
 *  STATS
 *  ─────────────────────────────────────────────────
 *  GET    /api/stats                dashboard summary for current user
 *
 *  All protected routes need header:
 *    Authorization: Bearer <token>
 * ============================================================
 */