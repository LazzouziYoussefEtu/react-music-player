const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database('./music.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            artist TEXT,
            file_path TEXT,
            cover TEXT
        )`);
    }
});

// Helper to recursively find files
function findMp3Files(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findMp3Files(filePath, fileList);
        } else {
            if (path.extname(file).toLowerCase() === '.mp3') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// API: Scan Directory
app.post('/api/scan', (req, res) => {
    const { dirPath } = req.body;
    if (!dirPath || !fs.existsSync(dirPath)) {
        return res.status(400).json({ error: 'Invalid directory path' });
    }

    try {
        const mp3Files = findMp3Files(dirPath);
        const stmt = db.prepare("INSERT INTO music (title, artist, file_path, cover) VALUES (?, ?, ?, ?)");
        
        db.serialize(() => {
            // Clear existing for simplicity, or we could upsert. Let's clear for now to sync with folder.
            // db.run("DELETE FROM music"); 
            // Actually, appending is safer, let's just append for now.

            mp3Files.forEach(filePath => {
                const fileName = path.basename(filePath, '.mp3');
                // Simple assumption: filename is title. Artist unknown.
                stmt.run(fileName, 'Unknown Artist', filePath, 'http://oj4t8z2d5.bkt.clouddn.com/%E9%AD%94%E9%AC%BC%E4%B8%AD%E7%9A%84%E5%A4%A9%E4%BD%BF.jpg'); // Default cover
            });
            stmt.finalize();
        });

        res.json({ message: `Scanned and added ${mp3Files.length} songs.`, count: mp3Files.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scan directory' });
    }
});

// API: Get Music List
app.get('/api/music', (req, res) => {
    db.all("SELECT * FROM music", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // Transform rows to match the frontend expected format
        const musicList = rows.map(row => ({
            id: row.id,
            title: row.title,
            artist: row.artist,
            // Construct a streaming URL
            file: `http://localhost:${PORT}/api/stream/${row.id}`,
            cover: row.cover
        }));
        res.json(musicList);
    });
});

// API: Stream Music
app.get('/api/stream/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT file_path FROM music WHERE id = ?", [id], (err, row) => {
        if (err || !row) {
            res.status(404).send('File not found');
            return;
        }
        const filePath = row.file_path;
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found on disk');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});