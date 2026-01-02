import React, { useState, useEffect } from 'react';
import Progress from '../components/progress';
import { Link, useOutletContext } from 'react-router-dom';
import './player.less';

let duration = null;

const Player = () => {
    const { 
        currentMusicItem, 
        repeatType, 
        isPlaying, 
        playNext, 
        changeRepeat 
    } = useOutletContext();

    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0);
    const [leftTime, setLeftTime] = useState('');

    const formatTime = (time) => {
        time = Math.floor(time);
        let miniute = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        return miniute + ':' + (seconds < 10 ? '0' + seconds : seconds);
    };

    useEffect(() => {
        const onTimeUpdate = (e) => {
            duration = e.jPlayer.status.duration;
            setProgress(e.jPlayer.status.currentPercentAbsolute);
            setVolume(e.jPlayer.options.volume * 100);
            setLeftTime(formatTime(duration * (1 - e.jPlayer.status.currentPercentAbsolute / 100)));
        };
        $("#player").bind($.jPlayer.event.timeupdate, onTimeUpdate);
        return () => $("#player").unbind($.jPlayer.event.timeupdate, onTimeUpdate);
    }, []);

    const play = () => {
        if (isPlaying) $("#player").jPlayer("pause");
        else $("#player").jPlayer("play");
    };

    const title = currentMusicItem ? currentMusicItem.title : 'No Music';
    const artist = currentMusicItem ? currentMusicItem.artist : 'Unknown';
    const cover = currentMusicItem ? currentMusicItem.cover : '/static/images/logo.png';

    return (
        <div className="player-page">
            <h1 className="caption"><Link to="/list">我的私人音乐坊 &gt;</Link></h1>
            <div className="mt20 row">
                <div className="controll-wrapper">
                    <h2 className="music-title">{title}</h2>
                    <h3 className="music-artist mt10">{artist}</h3>
                    <div className="row mt20">
                        <div className="left-time -col-auto">-{leftTime}</div>
                        <div className="volume-container">
                            <i className="icon-volume rt" style={{top: 5, left: -5}}></i>
                            <div className="volume-wrapper">
                                <Progress progress={volume} onProgressChange={(p) => $("#player").jPlayer("volume", p)} barColor='#aaa' />
                            </div>
                        </div>
                    </div>
                    <div style={{height: 10, lineHeight: '10px'}}>
                        <Progress progress={progress} onProgressChange={(p) => duration && $("#player").jPlayer("play", duration * p)} />
                    </div>
                    <div className="mt35 row">
                        <div>
                            <i className="icon prev" onClick={() => playNext('prev')}></i>
                            <i className={`icon ml20 ${isPlaying ? 'pause' : 'play'}`} onClick={play}></i>
                            <i className="icon next ml20" onClick={() => playNext('next')}></i>
                        </div>
                        <div className="-col-auto">
                            <i className={`icon repeat-${repeatType}`} onClick={changeRepeat}></i>
                        </div>
                    </div>
                </div>
                <div className="-col-auto cover">
                    <div style={{ width: '300px', height: '300px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#eee' }}>
                        <img 
                            src={cover} 
                            alt={title} 
                            onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;