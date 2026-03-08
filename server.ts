import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("everlasting.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS weddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    bride_name TEXT,
    groom_name TEXT,
    date TEXT,
    time TEXT,
    venue_name TEXT,
    venue_address TEXT,
    venue_maps_url TEXT,
    tagline TEXT,
    love_story TEXT,
    theme TEXT DEFAULT 'pastel',
    font_style TEXT DEFAULT 'serif',
    music_id TEXT,
    show_countdown INTEGER DEFAULT 1,
    rsvp_deadline TEXT,
    hero_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wedding_id INTEGER,
    name TEXT,
    status TEXT,
    guests INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(wedding_id) REFERENCES weddings(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.post("/api/weddings", (req, res) => {
    try {
      const {
        brideName, groomName, date, time, venueName, venueAddress,
        venueMapsUrl, tagline, loveStory, theme, fontStyle,
        musicId, showCountdown, rsvpDeadline, heroImage
      } = req.body;

      const slug = `${brideName.toLowerCase()}-and-${groomName.toLowerCase()}-${nanoid(6)}`.replace(/\s+/g, '-');

      const stmt = db.prepare(`
        INSERT INTO weddings (
          slug, bride_name, groom_name, date, time, venue_name, venue_address,
          venue_maps_url, tagline, love_story, theme, font_style,
          music_id, show_countdown, rsvp_deadline, hero_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        slug, brideName, groomName, date, time, venueName, venueAddress,
        venueMapsUrl, tagline, loveStory, theme, fontStyle,
        musicId, showCountdown ? 1 : 0, rsvpDeadline, heroImage
      );

      res.json({ success: true, slug, id: result.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create wedding" });
    }
  });

  app.get("/api/weddings/:slug", (req, res) => {
    try {
      const wedding = db.prepare("SELECT * FROM weddings WHERE slug = ?").get(req.params.slug);
      if (!wedding) return res.status(404).json({ error: "Wedding not found" });
      res.json(wedding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wedding" });
    }
  });

  app.post("/api/rsvps", (req, res) => {
    try {
      const { weddingId, name, status, guests, message } = req.body;
      const stmt = db.prepare(`
        INSERT INTO rsvps (wedding_id, name, status, guests, message)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(weddingId, name, status, guests, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
