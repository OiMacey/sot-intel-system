const express = require("express");
const http = require("http");
const sqlite3 = require("sqlite3").verbose();
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./server/database.db", (err) => {
  if (err) {
    console.error("DB ERROR:", err.message);
  } else {
    console.log("DATABASE CONNECTED");
  }
});

/* ✅ CREATE TABLE FIRST */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codename TEXT,
      service TEXT,
      phrase TEXT,
      role TEXT
    )
  `);

  /* ✅ INSERT DEMO USERS */
  db.run(`
    INSERT OR IGNORE INTO users (codename, service, phrase, role)
    VALUES 
    ('RAVEN-12','SAID-447291','GLASSHOUND','AGENT'),
    ('WATCHER-01','SAID-100001','BLACKVAULT','HANDLER')
  `);
});

/* 🔐 LOGIN ROUTE */
app.post("/login", (req, res) => {
  const { codename, service, phrase, role } = req.body;

  db.get(
    `SELECT * FROM users 
     WHERE codename = ? 
     AND service = ? 
     AND phrase = ? 
     AND role = ?`,
    [codename, service, phrase, role],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB ERROR" });
      }

      if (!row) {
        return res.status(401).json({ error: "ACCESS DENIED" });
      }

      res.json({ success: true });
    }
  );
});

/* 💬 LIVE CHAT */
io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});

server.listen(3000, () => {
  console.log("INTEL SYSTEM RUNNING ON http://localhost:3000");
});
