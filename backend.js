const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const YTMusic = require('ytmusic-api');
const ytdl = require('@distube/ytdl-core');
const app = express();
const PORT = 8080;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const ytmusic = new YTMusic();
let ytInitialized = false;

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Initialize Database
const db = new sqlite3.Database('./data/music.db', (err) => {
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
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) findMp3Files(filePath, fileList);
            else if (path.extname(file).toLowerCase() === '.mp3') fileList.push(filePath);
        });
    } catch (e) { console.error("Error reading directory:", dir, e.message); }
    return fileList;
}

// API: Scan Directory
app.post('/api/scan', (req, res) => {
    const { dirPath } = req.body;
    if (!dirPath || !fs.existsSync(dirPath)) return res.status(400).json({ error: 'Invalid directory path' });
    try {
        const mp3Files = findMp3Files(dirPath);
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run("DELETE FROM music");
            db.run("DELETE FROM sqlite_sequence WHERE name='music'");
            const stmt = db.prepare("INSERT INTO music (title, artist, file_path, cover) VALUES (?, ?, ?, ?)");
            mp3Files.forEach(filePath => {
                const fileName = path.basename(filePath, '.mp3');
                stmt.run(fileName, 'Unknown Artist', filePath, 'http://oj4t8z2d5.bkt.clouddn.com/%E9%AD%94%E9%AC%BC%E4%B8%AD%E7%9A%84%E5%A4%A9%E4%BD%BF.jpg');
            });
            stmt.finalize();
            db.run("COMMIT", (err) => {
                if (err) res.status(500).json({ error: 'Database commit failed' });
                else res.json({ message: `Scanned and added ${mp3Files.length} songs.`, count: mp3Files.length });
            });
        });
    } catch (error) { res.status(500).json({ error: 'Failed to scan directory' }); }
});

// API: Get Local Music List
app.get('/api/music', (req, res) => {
    db.all("SELECT * FROM music", [], (err, rows) => {
        if (err) res.status(400).json({ error: err.message });
        else {
            const musicList = rows.map(row => ({
                id: row.id,
                title: row.title,
                artist: row.artist,
                file: `http://localhost:${PORT}/api/stream/${row.id}`,
                cover: `http://localhost:${PORT}/api/cover/${row.id}`
            }));
            res.json(musicList);
        }
    });
});

// API: Search Online (YTM)
app.get('/api/search-online', async (req, res) => {
    const { q } = req.query;
    try {
        if (!ytInitialized) { await ytmusic.initialize(); ytInitialized = true; }
        const songs = await ytmusic.searchSongs(q);
        res.json(songs.map(s => ({
            id: `yt_${s.videoId}`, // Virtual ID
            title: s.name,
            artist: s.artist.name || (s.artists && s.artists[0] ? s.artists[0].name : 'Unknown Artist'),
            file: `http://localhost:${PORT}/api/stream-online/${s.videoId}`,
            cover: s.thumbnails[s.thumbnails.length - 1].url,
            isOnline: true
        })));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// API: Stream Online (Using @distube/ytdl-core with TV Headers)
app.get('/api/stream-online/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Streaming URL (TV headers):", url);
    
    const requestOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.2 Chrome/63.0.3239.150 TV Safari/537.36',
        }
    };

    try {
        const info = await ytdl.getInfo(url, { requestOptions });
        const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
        
        if (!audioFormat || !audioFormat.url) {
            throw new Error("No valid audio format found");
        }

        res.header('Content-Type', 'audio/mpeg');
        ytdl(url, {
            format: audioFormat,
            requestOptions
        }).pipe(res);

    } catch (error) { 
        console.error("Stream error for videoId:", videoId, error.message);
        if (!res.headersSent) {
            res.status(500).send(error.message);
        }
    }
});

// API: Thumbnail Proxy (Existing)
app.get('/api/cover/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT title, artist, cover FROM music WHERE id = ?", [id], async (err, row) => {
        if (err || !row) return res.redirect('/static/images/logo.png');
        if (row.cover && row.cover.includes('googleusercontent.com')) return res.redirect(row.cover);
        try {
            const query = `${row.title} ${row.artist !== 'Unknown Artist' ? row.artist : ''}`;
            if (!ytInitialized) { await ytmusic.initialize(); ytInitialized = true; }
            const songs = await ytmusic.searchSongs(query);
            if (songs && songs.length > 0) {
                const highResCover = songs[0].thumbnails[songs[0].thumbnails.length - 1].url.split('=')[0] + '=w500-h500';
                db.run("UPDATE music SET cover = ? WHERE id = ?", [highResCover, id]);
                return res.redirect(highResCover);
            }
        } catch (e) {}
        res.redirect('/static/images/logo.png');
    });
});

// API: Stream Local Music
app.get('/api/stream/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT file_path FROM music WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).send('File not found');
        if (fs.existsSync(row.file_path)) res.sendFile(row.file_path);
        else res.status(404).send('File not found on disk');
    });
});

app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));