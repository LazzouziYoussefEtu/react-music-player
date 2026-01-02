import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { randomRange } from './utils/util';
import PubSub from 'pubsub-js';

import PlayerPage from './page/player';
import ListPage from './page/list';
import Header from './components/header';
import Footer from './components/footer';
import Logo from './components/logo';

const App = () => {
    // 1. State
    const [musicList, setMusicList] = useState([]);
    const [currentMusicItem, setCurrentMusicItem] = useState(null);
    const [repeatType, setRepeatType] = useState('cycle');
    const [scanPath, setScanPath] = useState(localStorage.getItem('musicPath') || '');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    
    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [volume, setVolume] = useState(0); 
    const [duration, setDuration] = useState(0);

    // Refs
    const currentMusicItemRef = useRef(null);
    const playWhenEndRef = useRef(null);

    // Update ref whenever state changes
    useEffect(() => {
        currentMusicItemRef.current = currentMusicItem;
    }, [currentMusicItem]);

    // 2. Logic Functions
    const fetchMusic = async (silent = false) => {
        try {
            const response = await fetch('http://localhost:8080/api/music');
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
            const response = await fetch('http://localhost:8080/api/scan', {
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
                alert("No MP3 files found in that directory.");
            }
        } catch (error) {
            console.error(error);
            alert("Scan failed. Ensure backend.js is running.");
        } finally {
            setIsScanning(false);
        }
    };

    const findMusicIndex = useCallback((music) => {
        if (!music || musicList.length === 0) return -1;
        return musicList.findIndex(m => m.id === music.id || m === music);
    }, [musicList]);

    const playMusic = useCallback((item) => {
        if (!item) return;
        $("#player").jPlayer("setMedia", {
            mp3: item.file
        }).jPlayer('play');
        setCurrentMusicItem(item);
    }, []);

    const playNext = useCallback((type = 'next') => {
        if (musicList.length === 0) return;

        // If "Repeat Once" is active, manual "Next/Prev" also repeats the current song
        if (repeatType === 'once') {
            playMusic(currentMusicItemRef.current);
            return;
        }

        // Check for Shuffle Mode
        if (repeatType === 'random') {
             let index = findMusicIndex(currentMusicItemRef.current);
             let randomIndex = randomRange(0, musicList.length - 1);
             while (randomIndex === index && musicList.length > 1) {
                 randomIndex = randomRange(0, musicList.length - 1);
             }
             playMusic(musicList[randomIndex]);
             return;
        }

        // Sequential (Cycle)
        let index = findMusicIndex(currentMusicItemRef.current);
        let newIndex = (type === 'next') 
            ? (index + 1) % musicList.length 
            : (index + musicList.length - 1) % musicList.length;
        playMusic(musicList[newIndex]);
    }, [musicList, findMusicIndex, playMusic, repeatType]);

    const playWhenEnd = useCallback(() => {
        if (musicList.length === 0) return;
        
        if (repeatType === 'once') {
            // Replay current song via full playMusic cycle for reliability
            playMusic(currentMusicItemRef.current);
        } else {
            // 'random' or 'cycle'
            playNext();
        }
    }, [repeatType, musicList, playNext, playMusic]);

    // Keep playWhenEndRef updated
    useEffect(() => {
        playWhenEndRef.current = playWhenEnd;
    }, [playWhenEnd]);


    const changeRepeat = () => {
         setRepeatType(prev => {
            let list = ['cycle', 'once', 'random'];
            return list[(list.indexOf(prev) + 1) % list.length];
        });
    };

    const handleProgressChange = (p) => {
         if (duration) {
             $("#player").jPlayer("play", duration * p);
         }
    };

    const handleVolumeChange = (p) => {
        $("#player").jPlayer("volume", p);
    };

    // 3. Lifecycle
    useEffect(() => {
        $("#player").jPlayer({
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true
        });

        fetchMusic(true); 

        // Bind Events
        $("#player").bind($.jPlayer.event.ended, () => {
            if (playWhenEndRef.current) playWhenEndRef.current();
        });
        
        $("#player").bind($.jPlayer.event.play, () => setIsPlaying(true));
        $("#player").bind($.jPlayer.event.pause, () => setIsPlaying(false));
        
        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            setDuration(e.jPlayer.status.duration);
            setProgress(e.jPlayer.status.currentPercentAbsolute);
            setVolume(e.jPlayer.options.volume * 100);
        });

        const playToken = PubSub.subscribe('PLAY_MUSIC', (msg, item) => playMusic(item));
        const delToken = PubSub.subscribe('DEL_MUSIC', (msg, item) => {
            setMusicList(prev => prev.filter(m => m !== item));
        });
        const nextToken = PubSub.subscribe('PLAY_NEXT', () => playNext());
        const prevToken = PubSub.subscribe('PLAY_PREV', () => playNext('prev'));
        const repeatToken = PubSub.subscribe('CHANAGE_REPEAT', changeRepeat);

        return () => {
            $("#player").unbind($.jPlayer.event.ended);
            $("#player").unbind($.jPlayer.event.play);
            $("#player").unbind($.jPlayer.event.pause);
            $("#player").unbind($.jPlayer.event.timeupdate);
            PubSub.unsubscribe(playToken);
            PubSub.unsubscribe(delToken);
            PubSub.unsubscribe(nextToken);
            PubSub.unsubscribe(prevToken);
            PubSub.unsubscribe(repeatToken);
        };
    }, []);

    // 4. Initialization Overlay
    if (!isInitialized) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', fontFamily: 'sans-serif'
            }}>
                <Logo />
                <div style={{ 
                    padding: '40px', background: 'white', borderRadius: '8px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px'
                }}>
                    <h2>Setup Your Music Library</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Please provide the absolute path to your local music folder.
                    </p>
                    <input 
                        type="text" value={scanPath} onChange={(e) => setScanPath(e.target.value)} 
                        placeholder="/path/to/your/music"
                        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                    <button 
                        onClick={() => handleScan(scanPath)} disabled={isScanning}
                        style={{ width: '100%', padding: '12px', background: '#2f9842', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                    >
                        {isScanning ? 'Scanning...' : 'Start Playing'}
                    </button>
                </div>
            </div>
        );
    }

    // 5. Main Render
    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header onScan={handleScan} currentPath={localStorage.getItem('musicPath')} />
            
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px', position: 'relative' }}>
                 <Outlet context={{ musicList, currentMusicItem, repeatType, playMusic, playNext }} />
            </div>

            <Footer 
                currentItem={currentMusicItem} 
                isPlaying={isPlaying}
                progress={progress}
                volume={volume}
                repeatType={repeatType}
                onPlayPause={() => isPlaying ? $("#player").jPlayer("pause") : $("#player").jPlayer("play")}
                onNext={() => playNext()}
                onPrev={() => playNext('prev')}
                onProgressChange={handleProgressChange}
                onVolumeChange={handleVolumeChange}
                onRepeatChange={changeRepeat}
            />
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