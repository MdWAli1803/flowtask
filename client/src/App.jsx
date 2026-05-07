import { useState, useEffect, createContext, useContext } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --surface2: #1a1a24;
      --border: #ffffff12;
      --accent: #7c6af7;
      --accent2: #f97316;
      --green: #22c55e;
      --red: #ef4444;
      --yellow: #eab308;
      --text: #f1f0ff;
      --muted: #6b6a80;
      --card: #15151e;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: 10px; border: none;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 14px; transition: all 0.2s;
    }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: #6b5af0; transform: translateY(-1px); box-shadow: 0 8px 24px #7c6af740; }
    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-danger { background: #ef444415; color: var(--red); border: 1px solid #ef444430; }
    .btn-danger:hover { background: #ef444425; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    input, textarea, select {
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); border-radius: 10px; padding: 12px 16px;
      font-family: 'DM Sans', sans-serif; font-size: 14px;
      width: 100%; outline: none; transition: border 0.2s;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--accent); }
    select option { background: var(--surface2); }
    textarea { resize: vertical; min-height: 80px; }
    label { font-size: 13px; color: var(--muted); font-weight: 500; display: block; margin-bottom: 6px; }

    .modal-overlay {
      position: fixed; inset: 0; background: #00000080; backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      padding: 20px;
    }
    .modal {
      background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
      padding: 28px; width: 100%; max-width: 480px;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform:translateY(0); } }

    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .badge-todo { background: #6b6a8020; color: var(--muted); border: 1px solid #6b6a8030; }
    .badge-inprogress { background: #7c6af720; color: var(--accent); border: 1px solid #7c6af730; }
    .badge-done { background: #22c55e20; color: var(--green); border: 1px solid #22c55e30; }
    .badge-overdue { background: #ef444420; color: var(--red); border: 1px solid #ef444430; }
    .badge-admin { background: #f9731620; color: var(--accent2); border: 1px solid #f9731630; }
    .badge-member { background: #7c6af720; color: var(--accent); border: 1px solid #7c6af730; }

    .card {
      background: var(--card); border: 1px solid var(--border); border-radius: 16px;
      padding: 20px; transition: border-color 0.2s;
    }
    .card:hover { border-color: #ffffff22; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    .sidebar {
      width: 240px; background: var(--surface); border-right: 1px solid var(--border);
      min-height: 100vh; padding: 24px 16px; display: flex; flex-direction: column; gap: 4px;
      position: fixed; left: 0; top: 0; bottom: 0;
    }
    .main { margin-left: 240px; padding: 32px; min-height: 100vh; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500;
      color: var(--muted); transition: all 0.15s; border: 1px solid transparent;
    }
    .nav-item:hover { color: var(--text); background: var(--surface2); }
    .nav-item.active { color: var(--accent); background: #7c6af715; border-color: #7c6af720; }

    .stat-card {
      background: var(--card); border: 1px solid var(--border); border-radius: 16px;
      padding: 24px; position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: -20px; right: -20px;
      width: 80px; height: 80px; border-radius: 50%; opacity: 0.08;
    }

    .progress-bar {
      height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), #a78bfa);
      border-radius: 3px; transition: width 0.5s ease;
    }

    .task-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border-radius: 12px; background: var(--surface2);
      border: 1px solid var(--border); margin-bottom: 8px; transition: all 0.15s;
    }
    .task-row:hover { border-color: #ffffff20; transform: translateX(2px); }

    .avatar {
      width: 32px; height: 32px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 12px;
      font-weight: 700; flex-shrink: 0;
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

    .page-header { margin-bottom: 28px; }
    .page-header h2 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .page-header p { color: var(--muted); font-size: 14px; }

    .empty-state {
      text-align: center; padding: 60px 20px; color: var(--muted);
    }
    .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 14px; }

    .tag {
      display: inline-flex; align-items: center; padding: 3px 8px;
      border-radius: 6px; font-size: 11px; font-weight: 600;
      background: var(--surface2); color: var(--muted);
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 16px; }
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }
  `}</style>
);

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_USERS = [
  { id: 1, name: "Arjun Singh", email: "admin@demo.com", password: "admin123", role: "admin", avatar: "#7c6af7", initials: "AS" },
  { id: 2, name: "Priya Sharma", email: "member@demo.com", password: "member123", role: "member", avatar: "#f97316", initials: "PS" },
  { id: 3, name: "Rahul Kumar", email: "rahul@demo.com", password: "rahul123", role: "member", avatar: "#22c55e", initials: "RK" },
];

const INIT_PROJECTS = [
  { id: 1, name: "E-commerce Platform", description: "Full-stack shopping platform with React & Node", members: [1, 2, 3], createdBy: 1, createdAt: "2025-04-01" },
  { id: 2, name: "Mobile App MVP", description: "React Native app for delivery tracking", members: [1, 2], createdBy: 1, createdAt: "2025-04-10" },
];

const today = new Date().toISOString().split("T")[0];
const past = "2025-04-15";
const future = "2025-06-30";

const INIT_TASKS = [
  { id: 1, title: "Design homepage UI", description: "Create Figma mockups for landing page", projectId: 1, assignedTo: 2, status: "done", priority: "high", dueDate: past, createdBy: 1 },
  { id: 2, title: "Setup API endpoints", description: "Build REST APIs for auth and products", projectId: 1, assignedTo: 3, status: "inprogress", priority: "high", dueDate: today, createdBy: 1 },
  { id: 3, title: "Database schema", description: "Design PostgreSQL schema for orders", projectId: 1, assignedTo: 1, status: "done", priority: "medium", dueDate: past, createdBy: 1 },
  { id: 4, title: "Payment integration", description: "Integrate Razorpay payment gateway", projectId: 1, assignedTo: 2, status: "todo", priority: "high", dueDate: future, createdBy: 1 },
  { id: 5, title: "App wireframes", description: "Wireframe all main screens", projectId: 2, assignedTo: 2, status: "inprogress", priority: "medium", dueDate: past, createdBy: 1 },
  { id: 6, title: "Push notifications", description: "Firebase push notification setup", projectId: 2, assignedTo: 1, status: "todo", priority: "low", dueDate: future, createdBy: 1 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isOverdue = (task) => task.status !== "done" && task.dueDate < today;
const statusLabel = { todo: "To Do", inprogress: "In Progress", done: "Done" };
const priorityColor = { high: "#ef4444", medium: "#eab308", low: "#22c55e" };

const Icon = ({ name }) => {
  const icons = {
    dashboard: "⬛", projects: "📁", tasks: "✅", team: "👥", logout: "🚪",
    plus: "＋", edit: "✏️", delete: "🗑️", check: "✓", clock: "🕐",
    fire: "🔥", folder: "📂", user: "👤", flag: "🏁", star: "⭐",
    chart: "📊", alert: "⚠️", menu: "☰", close: "✕",
  };
  return <span style={{ fontSize: 16 }}>{icons[name] || "•"}</span>;
};

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [users, setUsers] = useState(INIT_USERS);
  const [error, setError] = useState("");

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = () => {
    setError("");
    if (mode === "login") {
      const u = users.find(u => u.email === form.email && u.password === form.password);
      if (!u) return setError("Invalid email or password");
      onLogin(u, users);
    } else {
      if (!form.name || !form.email || !form.password) return setError("All fields required");
      if (users.find(u => u.email === form.email)) return setError("Email already exists");
      const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const colors = ["#7c6af7", "#f97316", "#22c55e", "#ef4444", "#eab308", "#06b6d4"];
      const newUser = {
        id: Date.now(), name: form.name, email: form.email,
        password: form.password, role: form.role,
        avatar: colors[Math.floor(Math.random() * colors.length)], initials
      };
      const updated = [...users, newUser];
      setUsers(updated);
      onLogin(newUser, updated);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #7c6af7, #a78bfa)", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne, sans-serif" }}>FlowTask</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Project management, simplified</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "white" : "var(--muted)" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label>Full Name</label>
                <input placeholder="Arjun Singh" value={form.name} onChange={handle("name")} />
              </div>
            )}
            <div>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={handle("email")} />
            </div>
            <div>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={handle("password")} />
            </div>
            {mode === "signup" && (
              <div>
                <label>Role</label>
                <select value={form.role} onChange={handle("role")}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 10, padding: "10px 14px", color: "var(--red)", fontSize: 13 }}>{error}</div>}

            <button className="btn btn-primary" onClick={submit} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600 }}>Demo Accounts:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Admin", email: "admin@demo.com", pass: "admin123" }, { label: "Member", email: "member@demo.com", pass: "member123" }].map(d => (
              <button key={d.label} onClick={() => { setForm({ ...form, email: d.email, password: d.pass }); setMode("login"); }}
                className={`btn btn-ghost btn-sm`}>
                {d.label}: {d.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ page, setPage, user, onLogout }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "projects", label: "Projects", icon: "projects" },
    { id: "tasks", label: "My Tasks", icon: "tasks" },
    ...(user.role === "admin" ? [{ id: "team", label: "Team", icon: "team" }] : []),
  ];

  return (
    <div className="sidebar">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c6af7, #a78bfa)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18 }}>FlowTask</span>
        </div>
      </div>

      <div style={{ marginBottom: 8, padding: "0 14px" }}>
        <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Navigation</p>
      </div>

      {navItems.map(item => (
        <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
          <Icon name={item.icon} />
          {item.label}
        </div>
      ))}

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 4 }}>
          <div className="avatar" style={{ background: user.avatar }}>{user.initials}</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>
        <div className="nav-item" onClick={onLogout} style={{ color: "var(--red)" }}>
          <Icon name="logout" /> Logout
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ user, tasks, projects, users }) => {
  const myTasks = user.role === "admin" ? tasks : tasks.filter(t => t.assignedTo === user.id);
  const stats = {
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === "todo").length,
    inprogress: myTasks.filter(t => t.status === "inprogress").length,
    done: myTasks.filter(t => t.status === "done").length,
    overdue: myTasks.filter(t => isOverdue(t)).length,
  };

  const StatCard = ({ label, value, color, icon }) => (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 36, fontWeight: 800, fontFamily: "Syne, sans-serif", color }}>{value}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      </div>
    </div>
  );

  const recentTasks = myTasks.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h2>Welcome back, {user.name.split(" ")[0]} 👋</h2>
        <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={stats.total} color="var(--text)" icon="📋" />
        <StatCard label="In Progress" value={stats.inprogress} color="var(--accent)" icon="⚡" />
        <StatCard label="Completed" value={stats.done} color="var(--green)" icon="✅" />
        <StatCard label="Overdue" value={stats.overdue} color="var(--red)" icon="⚠️" />
      </div>

      <div className="grid-2">
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: 16 }}>Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><p>No tasks yet</p></div>
          ) : recentTasks.map(task => {
            const assignee = users.find(u => u.id === task.assignedTo);
            const overdue = isOverdue(task);
            return (
              <div key={task.id} className="task-row">
                <div className="avatar" style={{ background: assignee?.avatar || "#555" }}>{assignee?.initials}</div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.5 : 1 }}>{task.title}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>{projects.find(p => p.id === task.projectId)?.name}</p>
                </div>
                <span className={`badge badge-${overdue ? "overdue" : task.status}`}>{overdue ? "Overdue" : statusLabel[task.status]}</span>
              </div>
            );
          })}
        </div>

        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: 16 }}>Project Progress</h3>
          {projects.map(project => {
            const pTasks = tasks.filter(t => t.projectId === project.id);
            const done = pTasks.filter(t => t.status === "done").length;
            const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            return (
              <div key={project.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{project.name}</p>
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{done}/{pTasks.length} tasks done</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
const Projects = ({ user, projects, setProjects, tasks, users, setPage, setSelectedProject }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [editing, setEditing] = useState(null);

  const myProjects = user.role === "admin" ? projects : projects.filter(p => p.members.includes(user.id));

  const save = () => {
    if (!form.name.trim()) return;
    const memberList = form.members.length ? form.members : [user.id];
    if (editing) {
      setProjects(projects.map(p => p.id === editing.id ? { ...p, ...form, members: memberList } : p));
    } else {
      setProjects([...projects, { id: Date.now(), ...form, members: memberList, createdBy: user.id, createdAt: today }]);
    }
    setShowModal(false); setForm({ name: "", description: "", members: [] }); setEditing(null);
  };

  const del = (id) => { if (confirm("Delete this project?")) setProjects(projects.filter(p => p.id !== id)); };

  const openEdit = (p) => {
    setEditing(p); setForm({ name: p.name, description: p.description, members: p.members });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Projects</h2>
          <p>{myProjects.length} project{myProjects.length !== 1 ? "s" : ""}</p>
        </div>
        {user.role === "admin" && (
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: "", description: "", members: [] }); setShowModal(true); }}>
            <Icon name="plus" /> New Project
          </button>
        )}
      </div>

      {myProjects.length === 0 ? (
        <div className="empty-state"><div className="icon">📂</div><p>No projects yet. Create one!</p></div>
      ) : (
        <div className="grid-2">
          {myProjects.map(project => {
            const pTasks = tasks.filter(t => t.projectId === project.id);
            const done = pTasks.filter(t => t.status === "done").length;
            const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            const overdue = pTasks.filter(t => isOverdue(t)).length;

            return (
              <div key={project.id} className="card" style={{ cursor: "pointer" }}
                onClick={() => { setSelectedProject(project); setPage("projectDetail"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #7c6af720, #7c6af740)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📁</div>
                  {user.role === "admin" && (
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(project)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(project.id)}>🗑️</button>
                    </div>
                  )}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{project.name}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{project.description}</p>

                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  <span>{done}/{pTasks.length} tasks</span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{pct}%</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: -4 }}>
                    {project.members.slice(0, 4).map(uid => {
                      const u = users.find(u => u.id === uid);
                      return u ? <div key={uid} className="avatar" style={{ background: u.avatar, width: 28, height: 28, fontSize: 10, border: "2px solid var(--card)", marginRight: -6 }}>{u.initials}</div> : null;
                    })}
                    {project.members.length > 4 && <div className="avatar" style={{ background: "var(--surface2)", width: 28, height: 28, fontSize: 10, border: "2px solid var(--card)" }}>+{project.members.length - 4}</div>}
                  </div>
                  {overdue > 0 && <span className="badge badge-overdue">⚠️ {overdue} overdue</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: 20 }}>{editing ? "Edit Project" : "New Project"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label>Project Name</label><input placeholder="E.g. Mobile App MVP" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label>Description</label><textarea placeholder="What's this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div>
                <label>Add Members</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto", padding: 4 }}>
                  {users.map(u => (
                    <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--surface2)", padding: "8px 12px", borderRadius: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={form.members.includes(u.id)} style={{ width: "auto" }}
                        onChange={e => setForm({ ...form, members: e.target.checked ? [...form.members, u.id] : form.members.filter(id => id !== u.id) })} />
                      <div className="avatar" style={{ background: u.avatar, width: 28, height: 28, fontSize: 10 }}>{u.initials}</div>
                      <span style={{ fontSize: 13 }}>{u.name}</span>
                      <span className={`badge badge-${u.role}`} style={{ marginLeft: "auto" }}>{u.role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save}>{editing ? "Save Changes" : "Create Project"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PROJECT DETAIL ───────────────────────────────────────────────────────────
const ProjectDetail = ({ project, user, tasks, setTasks, users, projects, setPage }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", status: "todo", priority: "medium", dueDate: "" });

  const pTasks = tasks.filter(t => t.projectId === project.id);
  const filtered = filter === "all" ? pTasks : pTasks.filter(t => t.status === filter);
  const isAdmin = user.role === "admin";

  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setTasks(tasks.map(t => t.id === editing.id ? { ...t, ...form, assignedTo: Number(form.assignedTo) } : t));
    } else {
      setTasks([...tasks, { id: Date.now(), ...form, assignedTo: Number(form.assignedTo), projectId: project.id, createdBy: user.id }]);
    }
    setShowModal(false); setEditing(null); setForm({ title: "", description: "", assignedTo: "", status: "todo", priority: "medium", dueDate: "" });
  };

  const del = (id) => setTasks(tasks.filter(t => t.id !== id));

  const cycleStatus = (task) => {
    const next = { todo: "inprogress", inprogress: "done", done: "todo" };
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: next[t.status] } : t));
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({ title: task.title, description: task.description, assignedTo: String(task.assignedTo), status: task.status, priority: task.priority, dueDate: task.dueDate });
    setShowModal(true);
  };

  const canEdit = (task) => isAdmin || task.assignedTo === user.id;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage("projects")}>← Back</button>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800 }}>{project.name}</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "todo", "inprogress", "done"].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : statusLabel[f]}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: "", description: "", assignedTo: "", status: "todo", priority: "medium", dueDate: "" }); setShowModal(true); }}>
            <Icon name="plus" /> Add Task
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">✅</div><p>No tasks in this view</p></div>
      ) : filtered.map(task => {
        const assignee = users.find(u => u.id === task.assignedTo);
        const overdue = isOverdue(task);

        return (
          <div key={task.id} className="task-row" style={{ flexWrap: "wrap" }}>
            <div className="avatar" style={{ background: assignee?.avatar || "#555" }}>{assignee?.initials || "?"}</div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 500, textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.5 : 1 }}>{task.title}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {task.description && <span style={{ fontSize: 12, color: "var(--muted)" }}>{task.description.slice(0, 60)}{task.description.length > 60 ? "…" : ""}</span>}
                {task.dueDate && <span style={{ fontSize: 11, color: overdue ? "var(--red)" : "var(--muted)" }}>📅 {task.dueDate}</span>}
                <span style={{ fontSize: 11, color: priorityColor[task.priority] }}>● {task.priority}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`badge badge-${overdue ? "overdue" : task.status}`}>{overdue ? "Overdue" : statusLabel[task.status]}</span>
              {canEdit(task) && (
                <button className="btn btn-ghost btn-sm" onClick={() => cycleStatus(task)} title="Cycle status">⟳</button>
              )}
              {isAdmin && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(task.id)}>🗑️</button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: 20 }}>{editing ? "Edit Task" : "New Task"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label>Task Title</label><input placeholder="E.g. Design login screen" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label>Description</label><textarea placeholder="Task details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid-2">
                <div>
                  <label>Assign To</label>
                  <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Select member</option>
                    {project.members.map(uid => {
                      const u = users.find(u => u.id === uid);
                      return u ? <option key={uid} value={uid}>{u.name}</option> : null;
                    })}
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save}>{editing ? "Save" : "Create Task"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MY TASKS ─────────────────────────────────────────────────────────────────
const MyTasks = ({ user, tasks, setTasks, users, projects }) => {
  const [filter, setFilter] = useState("all");
  const myTasks = user.role === "admin" ? tasks : tasks.filter(t => t.assignedTo === user.id);

  const filtered = filter === "overdue"
    ? myTasks.filter(t => isOverdue(t))
    : filter === "all" ? myTasks
    : myTasks.filter(t => t.status === filter);

  const cycleStatus = (task) => {
    const next = { todo: "inprogress", inprogress: "done", done: "todo" };
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: next[t.status] } : t));
  };

  return (
    <div>
      <div className="page-header">
        <h2>{user.role === "admin" ? "All Tasks" : "My Tasks"}</h2>
        <p>{filtered.length} task{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", "All"], ["todo", "To Do"], ["inprogress", "In Progress"], ["done", "Done"], ["overdue", "⚠️ Overdue"]].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">🎉</div><p>No tasks here!</p></div>
      ) : filtered.map(task => {
        const assignee = users.find(u => u.id === task.assignedTo);
        const project = projects.find(p => p.id === task.projectId);
        const overdue = isOverdue(task);
        const canEdit = user.role === "admin" || task.assignedTo === user.id;

        return (
          <div key={task.id} className="task-row">
            <div className="avatar" style={{ background: assignee?.avatar || "#555" }}>{assignee?.initials || "?"}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.5 : 1 }}>{task.title}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {project && <span className="tag">📁 {project.name}</span>}
                {task.dueDate && <span style={{ fontSize: 11, color: overdue ? "var(--red)" : "var(--muted)" }}>📅 {task.dueDate}</span>}
                <span style={{ fontSize: 11, color: priorityColor[task.priority] }}>● {task.priority}</span>
                {assignee && user.role === "admin" && <span style={{ fontSize: 11, color: "var(--muted)" }}>👤 {assignee.name}</span>}
              </div>
            </div>
            <span className={`badge badge-${overdue ? "overdue" : task.status}`}>{overdue ? "Overdue" : statusLabel[task.status]}</span>
            {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => cycleStatus(task)} title="Change status">⟳</button>}
          </div>
        );
      })}
    </div>
  );
};

// ─── TEAM PAGE (Admin only) ───────────────────────────────────────────────────
const Team = ({ user, users, setUsers, tasks, projects }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });

  const add = () => {
    if (!form.name || !form.email || !form.password) return alert("Fill all fields");
    if (users.find(u => u.email === form.email)) return alert("Email already exists");
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["#7c6af7", "#f97316", "#22c55e", "#ef4444", "#eab308", "#06b6d4"];
    setUsers([...users, { id: Date.now(), ...form, avatar: colors[Math.floor(Math.random() * colors.length)], initials }]);
    setShowModal(false); setForm({ name: "", email: "", password: "", role: "member" });
  };

  const toggleRole = (uid) => {
    if (uid === user.id) return alert("Cannot change your own role");
    setUsers(users.map(u => u.id === uid ? { ...u, role: u.role === "admin" ? "member" : "admin" } : u));
  };

  const del = (uid) => {
    if (uid === user.id) return alert("Cannot delete yourself");
    if (confirm("Remove this member?")) setUsers(users.filter(u => u.id !== uid));
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Team</h2>
          <p>{users.length} member{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" /> Add Member</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map(u => {
          const userTasks = tasks.filter(t => t.assignedTo === u.id);
          const done = userTasks.filter(t => t.status === "done").length;
          const userProjects = projects.filter(p => p.members.includes(u.id)).length;

          return (
            <div key={u.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="avatar" style={{ background: u.avatar, width: 48, height: 48, fontSize: 16 }}>{u.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontWeight: 600 }}>{u.name}</p>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                  {u.id === user.id && <span className="tag">You</span>}
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</p>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>📁 {userProjects} projects</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>✅ {done}/{userTasks.length} tasks</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u.id)}>
                  {u.role === "admin" ? "→ Member" : "→ Admin"}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: 20 }}>Add Team Member</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label>Full Name</label><input placeholder="Rahul Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label>Email</label><input type="email" placeholder="rahul@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label>Password</label><input type="password" placeholder="Set a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div>
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={add}>Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(INIT_USERS);
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);

  const handleLogin = (user, allUsers) => {
    setCurrentUser(user);
    setUsers(allUsers);
    setPage("dashboard");
  };

  const handleLogout = () => { setCurrentUser(null); setPage("dashboard"); };

  if (!currentUser) return <><GlobalStyles /><AuthScreen onLogin={handleLogin} /></>;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={currentUser} tasks={tasks} projects={projects} users={users} />;
      case "projects": return <Projects user={currentUser} projects={projects} setProjects={setProjects} tasks={tasks} users={users} setPage={setPage} setSelectedProject={setSelectedProject} />;
      case "projectDetail": return selectedProject ? <ProjectDetail project={selectedProject} user={currentUser} tasks={tasks} setTasks={setTasks} users={users} projects={projects} setPage={setPage} /> : null;
      case "tasks": return <MyTasks user={currentUser} tasks={tasks} setTasks={setTasks} users={users} projects={projects} />;
      case "team": return currentUser.role === "admin" ? <Team user={currentUser} users={users} setUsers={setUsers} tasks={tasks} projects={projects} /> : null;
      default: return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <Sidebar page={page} setPage={setPage} user={currentUser} onLogout={handleLogout} />
      <main className="main">{renderPage()}</main>
    </>
  );
}
