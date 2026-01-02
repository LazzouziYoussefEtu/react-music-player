import os
import sqlite3
import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import RedirectResponse, StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import yt_dlp
from ytmusicapi import YTMusic
import asyncio
import aiofiles

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure data directory exists
DATA_DIR = os.path.join(os.getcwd(), 'data')
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

DB_PATH = os.path.join(DATA_DIR, 'music.db')

# Initialize Database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            artist TEXT,
            file_path TEXT,
            cover TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

ytmusic = YTMusic()

class ScanRequest(BaseModel):
    dirPath: str

class UpdateCoverRequest(BaseModel):
    id: int
    cover: str

class DownloadRequest(BaseModel):
    videoId: str
    title: str
    artist: str
    cover: str
    dirPath: str

def find_mp3_files(directory: str) -> List[str]:
    file_list = []
    try:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.lower().endswith('.mp3'):
                    file_list.append(os.path.join(root, file))
    except Exception as e:
        print(f"Error reading directory: {directory} {str(e)}")
    return file_list

@app.post("/api/scan")
async def scan_directory(request: ScanRequest):
    if not os.path.exists(request.dirPath):
        raise HTTPException(status_code=400, detail="Invalid directory path")
    
    try:
        mp3_files = find_mp3_files(request.dirPath)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM music")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='music'")
        
        for file_path in mp3_files:
            file_name = os.path.splitext(os.path.basename(file_path))[0]
            cursor.execute(
                "INSERT INTO music (title, artist, file_path, cover) VALUES (?, ?, ?, ?)",
                (file_name, 'Unknown Artist', file_path, 'http://oj4t8z2d5.bkt.clouddn.com/%E9%AD%94%E9%AC%BC%E4%B8%AD%E7%9A%84%E5%A4%A9%E4%BD%BF.jpg')
            )
        
        conn.commit()
        count = len(mp3_files)
        conn.close()
        return {"message": f"Scanned and added {count} songs.", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/music")
async def get_music_list():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, artist, cover FROM music")
        rows = cursor.fetchall()
        conn.close()
        
        music_list = []
        for row in rows:
            music_list.append({
                "id": row[0],
                "title": row[1],
                "artist": row[2],
                "file": f"http://localhost:8080/api/stream/{row[0]}",
                "cover": f"http://localhost:8080/api/cover/{row[0]}"
            })
        return music_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/stream/{song_id}")
async def stream_local_music(song_id: int):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT file_path FROM music WHERE id = ?", (song_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = row[0]
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
            raise HTTPException(status_code=404, detail="File not found on disk")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-online")
async def search_online(q: str):
    try:
        results = ytmusic.search(q, filter="songs")
        online_songs = []
        for s in results:
            online_songs.append({
                "id": f"yt_{s['videoId']}",
                "title": s['title'],
                "artist": ", ".join([a['name'] for a in s['artists']]),
                "file": f"http://localhost:8080/api/stream-online/{s['videoId']}",
                "cover": s['thumbnails'][-1]['url'],
                "isOnline": True,
                "videoId": s['videoId']
            })
        return online_songs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stream-online/{video_id}")
async def stream_online(video_id: str):
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }
    
    def get_stream_url():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return info['url']

    try:
        loop = asyncio.get_event_loop()
        stream_url = await loop.run_in_executor(None, get_stream_url)
        return RedirectResponse(url=stream_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/download")
async def download_song(request: DownloadRequest):
    if not os.path.exists(request.dirPath):
        raise HTTPException(status_code=400, detail="Invalid directory path")

    file_path = os.path.join(request.dirPath, f"{request.title}.mp3")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': file_path,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={request.videoId}"])

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO music (title, artist, file_path, cover) VALUES (?, ?, ?, ?)",
            (request.title, request.artist, file_path, request.cover)
        )
        conn.commit()
        conn.close()

        return {"message": "Song downloaded and added to library."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cover/{song_id}")
async def proxy_cover(song_id: int):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT title, artist, cover FROM music WHERE id = ?", (song_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return RedirectResponse(url='/static/images/logo.png')
        
        title, artist, cover = row
        if cover and 'googleusercontent.com' in cover:
            conn.close()
            return RedirectResponse(url=cover)
        
        # Search YTM for cover
        query = f"{title} {artist}" if artist != 'Unknown Artist' else title
        search_results = ytmusic.search(query, filter="songs")
        
        if search_results:
            high_res_cover = search_results[0]['thumbnails'][-1]['url'].split('=')[0] + '=w500-h500'
            cursor.execute("UPDATE music SET cover = ? WHERE id = ?", (high_res_cover, song_id))
            conn.commit()
            conn.close()
            return RedirectResponse(url=high_res_cover)
        
        conn.close()
        return RedirectResponse(url='/static/images/logo.png')
    except Exception as e:
        print(f"Cover proxy error: {str(e)}")
        return RedirectResponse(url='/static/images/logo.png')

@app.post("/api/update-cover")
async def update_cover(request: UpdateCoverRequest):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE music SET cover = ? WHERE id = ?", (request.cover, request.id))
        conn.commit()
        conn.close()
        return {"message": "Cover updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)