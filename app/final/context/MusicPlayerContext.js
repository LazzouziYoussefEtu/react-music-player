import React from 'react';

export const MusicPlayerContext = React.createContext({
    musicList: [],
    currentMusicItem: null,
    repeatType: 'cycle',
    isPlaying: false,
    progress: 0,
    volume: 0,
    duration: 0,
    playMusic: () => {},
    playNext: () => {},
    changeRepeat: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrev: () => {},
    onProgressChange: () => {},
    onVolumeChange: () => {},
});
