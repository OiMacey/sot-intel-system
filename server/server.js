const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Use Railway assigned port or 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // serve public folder

// SQLite database
const db = new sqlite3.Database(path.join(__dirname, "database.db"));

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codename TEXT UNIQUE,
  service TEXT,
  phrase TEXT,
  role TEXT
)`);

// Insert demo users if not exist
const demoUsers = [
  { codename: 'RAVEN-12', service: 'SAID-447291', phrase: 'GLASSHOUND', role: 'AGENT' },
  { codename: 'WATCHER-01', service: 'SAID-100001', phrase: 'BLACKVAULT', role: 'HANDLER' }
];

demoUsers.forEach(user => {
  db.run(
    `INSERT OR IGNORE INTO users (codename, service, phrase, role) VALUES (?, ?, ?, ?)`,
    [user.codename, user.service, user.phrase, user.role]
  );
});

// Login route
app.post("/login", (req, res) => {
  const { codename, service, phrase, role } = req.body;
  db.get(
    "SELECT * FROM users WHERE codename=? AND service=? AND phrase=? AND role=?",
    [codename, service, phrase, role],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!row) return res.status(401).json({ error: "ACCESS DENIED" });
      res.json({ ok: true });
    }
  );
});

// Socket.IO live chat
io.on("connection", socket => {
  socket.on("message", msg => {
    io.emit("message", msg);
  });
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`INTEL SYSTEM RUNNING ON PORT ${PORT}`);
});

