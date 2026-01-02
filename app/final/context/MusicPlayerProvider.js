import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';
import { randomRange } from '../utils/util';
import { API_BASE_URL } from '../config/apiConfig';

export const MusicPlayerProvider = ({ children }) => {
    const [musicList, setMusicList] = useState([]);
    const [currentMusicItem, setCurrentMusicItem] = useState(null);
    const [repeatType, setRepeatType] = useState('cycle');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [volume, setVolume] = useState(0); 
    const [duration, setDuration] = useState(0);
    const [scanPath, setScanPath] = useState(localStorage.getItem('musicPath') || '');
    const [isScanning, setIsScanning] = useState(false);

    const currentMusicItemRef = useRef(null);
    useEffect(() => { currentMusicItemRef.current = currentMusicItem; }, [currentMusicItem]);
    
    const playWhenEndRef = useRef(null);

    const fetchMusic = useCallback(async (silent = false) => {
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
    }, []);

    const playMusic = useCallback((item) => {
        if (!item) return;
        $("#player").jPlayer("stop"); // Stop and clear current media to prevent AbortError
        $("#player").jPlayer("setMedia", { mp3: item.file }); // Set new media
        $("#player").jPlayer('play'); // Then play
        setCurrentMusicItem(item);
    }, []);

    const findMusicIndex = useCallback((music) => {
        if (!music || musicList.length === 0) return -1;
        return musicList.findIndex(m => m.id === music.id);
    }, [musicList]);

    const playNext = useCallback((type = 'next') => {
        if (musicList.length === 0) return;
        if (repeatType === 'once') {
            playMusic(currentMusicItemRef.current);
            return;
        }
        let index = findMusicIndex(currentMusicItemRef.current);
        if (repeatType === 'random') {
             let randomIndex = randomRange(0, musicList.length - 1);
             while (randomIndex === index && musicList.length > 1) {
                 randomIndex = randomRange(0, musicList.length - 1);
             }
             playMusic(musicList[randomIndex]);
             return;
        }
        let newIndex = (type === 'next') 
            ? (index + 1) % musicList.length 
            : (index + musicList.length - 1) % musicList.length;
        playMusic(musicList[newIndex]);
    }, [musicList, findMusicIndex, playMusic, repeatType]);

    const changeRepeat = useCallback(() => {
         setRepeatType(prev => {
            const repeatModes = ['cycle', 'once', 'random'];
            return repeatModes[(repeatModes.indexOf(prev) + 1) % repeatModes.length];
        });
    }, []);

    const playWhenEnd = useCallback(() => {
        if (repeatType === 'once') {
            playMusic(currentMusicItemRef.current);
        } else {
            playNext();
        }
    }, [playNext, playMusic, repeatType]);

    useEffect(() => {
        playWhenEndRef.current = playWhenEnd;
    }, [playWhenEnd]);

    useEffect(() => {
        fetchMusic(true);
    }, [fetchMusic]);

    useEffect(() => {
        $("#player").jPlayer({ supplied: "mp3", wmode: "window", useStateClassSkin: true });
        $("#player").bind($.jPlayer.event.ended, () => playWhenEndRef.current?.());
        $("#player").bind($.jPlayer.event.play, () => setIsPlaying(true));
        $("#player").bind($.jPlayer.event.pause, () => setIsPlaying(false));
        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            setDuration(e.jPlayer.status.duration);
            setProgress(e.jPlayer.status.currentPercentAbsolute);
            setVolume(e.jPlayer.options.volume * 100);
        });

        return () => {
            $("#player").unbind($.jPlayer.event.ended);
            $("#player").unbind($.jPlayer.event.play);
            $("#player").unbind($.jPlayer.event.pause);
            $("#player").unbind($.jPlayer.event.timeupdate);
        };
    }, []);

    const onPlayPause = () => isPlaying ? $("#player").jPlayer("pause") : $("#player").jPlayer("play");
    const onProgressChange = (p) => duration && $("#player").jPlayer("play", duration * p);
    const onVolumeChange = (p) => $("#player").jPlayer("volume", p);

    const value = {
        musicList,
        currentMusicItem,
        repeatType,
        isPlaying,
        progress,
        volume,
        duration,
        playMusic,
        playNext,
        changeRepeat,
        onPlayPause,
        onNext: () => playNext('next'),
        onPrev: () => playNext('prev'),
        onProgressChange,
        onVolumeChange,
        isInitialized,
        fetchMusic,
        setMusicList,
        scanPath,
        setScanPath,
        isScanning,
        setIsScanning
    };

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};