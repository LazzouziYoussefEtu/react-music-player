import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { MUSIC_LIST } from './config/config';
import PubSub from 'pubsub-js';

import PlayerPage from './page/player';
import ListPage from './page/list';
import Logo from './components/logo';

const App = () => {
    const [musicList, setMusicList] = useState(MUSIC_LIST);
    const [currentMusicItem, setCurrentMusicItem] = useState(MUSIC_LIST[0]);

    const playMusic = useCallback((item) => {
        $("#player").jPlayer("setMedia", {
            mp3: item.file
        }).jPlayer('play');
        setCurrentMusicItem(item);
    }, []);

    useEffect(() => {
        $("#player").jPlayer({
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true
        });

        playMusic(currentMusicItem);

        const playToken = PubSub.subscribe('PLAY_MUSIC', (msg, item) => {
            playMusic(item);
        });

        const delToken = PubSub.subscribe('DEL_MUSIC', (msg, item) => {
            setMusicList(prevList => prevList.filter(music => music !== item));
        });

        return () => {
            PubSub.unsubscribe(playToken);
            PubSub.unsubscribe(delToken);
        };
    }, []); // Run once on mount

    return (
        <div className="container">
            <Logo />
            <Outlet context={{ musicList, currentMusicItem }} />
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