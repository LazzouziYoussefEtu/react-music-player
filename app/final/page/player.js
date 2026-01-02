import React, { useContext } from 'react';
import Progress from '../components/progress';
import { Link } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import './player.less';

const Player = () => {
    const { 
        currentMusicItem, 
        repeatType, 
        isPlaying, 
        onNext,
        onPrev,
        onPlayPause,
        changeRepeat,
        progress,
        volume,
        duration,
        onProgressChange,
        onVolumeChange,
    } = useContext(MusicPlayerContext);

    const leftTime = duration > 0 ? (duration * (1 - progress / 100)) : 0;
    const formatTime = (time) => {
        time = Math.floor(time);
        let minute = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        return minute + ':' + (seconds < 10 ? '0' + seconds : seconds);
    };

    const title = currentMusicItem ? currentMusicItem.title : 'No Music';
    const artist = currentMusicItem ? currentMusicItem.artist : 'Unknown';
    const cover = currentMusicItem ? currentMusicItem.cover : '/static/images/logo.png';

    return (
        <div className="player-page">
            <h1 className="caption"><Link to="/list">Back to Music List &gt;</Link></h1>
            <div className="mt20 row">
                <div className="controll-wrapper">
                    <h2 className="music-title">{title}</h2>
                    <h3 className="music-artist mt10">{artist}</h3>
                    <div className="row mt20">
                        <div className="left-time -col-auto">-{formatTime(leftTime)}</div>
                        <div className="volume-container">
                            <i className="icon-volume rt" style={{top: 5, left: -5}}></i>
                            <div className="volume-wrapper">
                                <Progress progress={volume} onProgressChange={onVolumeChange} barColor='#aaa' />
                            </div>
                        </div>
                    </div>
                    <div style={{height: 10, lineHeight: '10px'}}>
                        <Progress progress={progress} onProgressChange={onProgressChange} />
                    </div>
                    <div className="mt35 row">
                        <div>
                            <i className="icon prev" onClick={onPrev}></i>
                            <i className={`icon ml20 ${isPlaying ? 'pause' : 'play'}`} onClick={onPlayPause}></i>
                            <i className="icon next ml20" onClick={onNext}></i>
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