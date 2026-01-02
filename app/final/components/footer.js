import React, { useContext } from 'react';
import Progress from './progress';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import './footer.less';

const Footer = () => {
    const {
        currentMusicItem,
        isPlaying, 
        progress, 
        volume, 
        repeatType, 
        onPlayPause, 
        onNext, 
        onPrev, 
        onProgressChange, 
        onVolumeChange, 
        onRepeatChange 
    } = useContext(MusicPlayerContext);

    if (!currentMusicItem) return null;

    return (
        <div className="components-footer row">
            <div className="-col-auto left-info">
                <div className="cover-img" style={{ width: '50px', height: '50px', borderRadius: '4px', marginRight: '15px', overflow: 'hidden' }}>
                    <img 
                        src={currentMusicItem.cover || '/static/images/logo.png'} 
                        alt={currentMusicItem.title} 
                        onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </div>
                <div className="info-text">
                    <div className="title bold text-overflow">{currentMusicItem.title}</div>
                    <div className="artist text-overflow">{currentMusicItem.artist}</div>
                </div>
            </div>

            <div className="middle-controls">
                <div className="buttons">
                    <i className={`icon repeat-${repeatType}`} onClick={onRepeatChange} style={{ cursor: 'pointer', transform: 'scale(0.8)' }}></i>
                    <i className="icon prev" onClick={onPrev} style={{ cursor: 'pointer' }}></i>
                    <i className={`icon ${isPlaying ? 'pause' : 'play'}`} onClick={onPlayPause} style={{ cursor: 'pointer', margin: '0 10px', transform: 'scale(1.2)' }}></i>
                    <i className="icon next" onClick={onNext} style={{ cursor: 'pointer' }}></i>
                </div>
                <div className="progress-container">
                    <Progress progress={progress} onProgressChange={onProgressChange} barColor="#2f9842" />
                </div>
            </div>

            <div className="-col-auto right-volume">
                <i className="icon-volume" style={{ marginRight: 10 }}></i>
                <div className="volume-slider">
                    <Progress progress={volume} onProgressChange={onVolumeChange} barColor="#aaa" />
                </div>
            </div>
        </div>
    );
};

export default Footer;