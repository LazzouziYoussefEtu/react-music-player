import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { randomRange } from './utils/util';
import PubSub from 'pubsub-js';

import PlayerPage from './page/player';
import ListPage from './page/list';
import Header from './components/header';
import Footer from './components/footer';
import Logo from './components/logo';
import { API_BASE_URL } from './config/apiConfig';

const App = () => {
    const [musicList, setMusicList] = useState([]);
    const [currentMusicItem, setCurrentMusicItem] = useState(null);
    const [repeatType, setRepeatType] = useState('cycle');
    const [scanPath, setScanPath] = useState(localStorage.getItem('musicPath') || '');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [volume, setVolume] = useState(0); 
    const [duration, setDuration] = useState(0);

    const currentMusicItemRef = useRef(null);
    const playWhenEndRef = useRef(null);

    useEffect(() => {
        currentMusicItemRef.current = currentMusicItem;
    }, [currentMusicItem]);

    const fetchMusic = async (silent = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/music`);
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
                setMusicList(data);
                if (!currentMusicItemRef.current) {
                   setCurrentMusicItem(data[0]);
                   $("#player").jPlayer("setMedia", { mp3: data[0].file });
                }
                setIsInitialized(true);
            } else if (!silent) {
                setIsInitialized(false);
            }
        } catch (error) {
            console.error("Failed to fetch music", error);
            if (!silent) setIsInitialized(false);
        }
    };

    const handleScan = async (pathInput) => {
        const path = pathInput || scanPath;
        if (!path) return alert("Please enter a path");
        setIsScanning(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirPath: path })
            });
            const result = await response.json();
            if (result.count > 0) {
                localStorage.setItem('musicPath', path);
                setScanPath(path);
                await fetchMusic();
            } else {
                alert("No MP3 files found.");
            }
        } catch (error) {
            console.error(error);
            alert("Scan failed.");
        } finally {
            setIsScanning(false);
        }
    };

    const findMusicIndex = useCallback((music) => {
        if (!music || musicList.length === 0) return -1;
        return musicList.findIndex(m => m.id === music.id);
    }, [musicList]);

    const playMusic = useCallback((item) => {
        if (!item) return;
        $("#player").jPlayer("setMedia", { mp3: item.file }).jPlayer('play');
        setCurrentMusicItem(item);
    }, [musicList]);

    const playNext = useCallback((type = 'next') => {
        if (musicList.length === 0) return;
        if (repeatType === 'once') {
            playMusic(currentMusicItemRef.current);
            return;
        }
        if (repeatType === 'random') {
             let index = findMusicIndex(currentMusicItemRef.current);
             let randomIndex = randomRange(0, musicList.length - 1);
             while (randomIndex === index && musicList.length > 1) {
                 randomIndex = randomRange(0, musicList.length - 1);
             }
             playMusic(musicList[randomIndex]);
             return;
        }
        let index = findMusicIndex(currentMusicItemRef.current);
        let newIndex = (type === 'next') 
            ? (index + 1) % musicList.length 
            : (index + musicList.length - 1) % musicList.length;
        playMusic(musicList[newIndex]);
    }, [musicList, findMusicIndex, playMusic, repeatType]);

    const changeRepeat = useCallback(() => {
         setRepeatType(prev => {
            let list = ['cycle', 'once', 'random'];
            return list[(list.indexOf(prev) + 1) % list.length];
        });
    }, []);

    const playWhenEnd = useCallback(() => {
        if (musicList.length === 0) return;
        if (repeatType === 'once') {
            playMusic(currentMusicItemRef.current);
        }
        else {
            playNext();
        }
    }, [repeatType, musicList, playNext, playMusic]);

    useEffect(() => {
        playWhenEndRef.current = playWhenEnd;
    }, [playWhenEnd]);

    useEffect(() => {
        $("#player").jPlayer({ supplied: "mp3", wmode: "window", useStateClassSkin: true });
        fetchMusic(true); 
        $("#player").bind($.jPlayer.event.ended, () => playWhenEndRef.current?.());
        $("#player").bind($.jPlayer.event.play, () => setIsPlaying(true));
        $("#player").bind($.jPlayer.event.pause, () => setIsPlaying(false));
        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            setDuration(e.jPlayer.status.duration);
            setProgress(e.jPlayer.status.currentPercentAbsolute);
            setVolume(e.jPlayer.options.volume * 100);
        });
        const playToken = PubSub.subscribe('PLAY_MUSIC', (msg, item) => playMusic(item));
        const delToken = PubSub.subscribe('DEL_MUSIC', (msg, item) => setMusicList(prev => prev.filter(m => m !== item)));
        const nextToken = PubSub.subscribe('PLAY_NEXT', () => playNext());
        const prevToken = PubSub.subscribe('PLAY_PREV', () => playNext('prev'));
        const repeatToken = PubSub.subscribe('CHANAGE_REPEAT', changeRepeat);
        return () => {
            $("#player").unbind($.jPlayer.event.ended).unbind($.jPlayer.event.play).unbind($.jPlayer.event.pause).unbind($.jPlayer.event.timeupdate);
            PubSub.unsubscribe(playToken); PubSub.unsubscribe(delToken); PubSub.unsubscribe(nextToken); PubSub.unsubscribe(prevToken); PubSub.unsubscribe(repeatToken);
        };
    }, [playMusic, playNext, changeRepeat]);

    if (!isInitialized) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', fontFamily: 'sans-serif' }}>
                <Logo />
                <div style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
                    <h2>Setup Your Music Library</h2>
                    <input type="text" value={scanPath} onChange={(e) => setScanPath(e.target.value)} placeholder="/path/to/your/music" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    <button onClick={() => handleScan(scanPath)} disabled={isScanning} style={{ width: '100%', padding: '12px', background: '#2f9842', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>{isScanning ? 'Scanning...' : 'Start Playing'}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header onScan={handleScan} currentPath={localStorage.getItem('musicPath')} musicList={musicList} onPlayMusic={playMusic} />
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px', position: 'relative' }}>
                 <Outlet context={{ musicList, currentMusicItem, repeatType, playMusic, playNext, isPlaying, changeRepeat }} />
            </div>
            <Footer currentItem={currentMusicItem} isPlaying={isPlaying} progress={progress} volume={volume} repeatType={repeatType} onPlayPause={() => isPlaying ? $("#player").jPlayer("pause") : $("#player").jPlayer("play")} onNext={() => playNext()} onPrev={() => playNext('prev')} onProgressChange={(p) => duration && $("#player").jPlayer("play", duration * p)} onVolumeChange={(p) => $("#player").jPlayer("volume", p)} onRepeatChange={changeRepeat} />
        </div>
    );
};

const Root = () => (
    <HashRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<PlayerPage />} />
                <Route path="list" element={<ListPage />} />
            </Route>
        </Routes>
    </HashRouter>
);

export default Root;