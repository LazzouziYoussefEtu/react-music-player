import React from 'react';
import Progress from './progress';
import './footer.less';

const Footer = ({ 
    currentItem, 
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
}) => {
    if (!currentItem) return null;

    return (
        <div className="components-footer row">
            {/* Left: Info */}
            <div className="-col-auto left-info">
                <img 
                    src={currentItem.cover || 'http://placeholder.com/40'} 
                    alt={currentItem.title} 
                    className="cover-img"
                />
                <div className="info-text">
                    <div className="title bold text-overflow">{currentItem.title}</div>
                    <div className="artist text-overflow">{currentItem.artist}</div>
                </div>
            </div>

            {/* Middle: Controls & Progress */}
            <div className="middle-controls">
                <div className="buttons">
                    <i 
                        className={`icon repeat-${repeatType}`} 
                        onClick={onRepeatChange} 
                        title="Toggle Repeat/Shuffle"
                        style={{ cursor: 'pointer', transform: 'scale(0.8)' }}
                    ></i>
                    <i 
                        className="icon prev" 
                        onClick={onPrev} 
                        style={{ cursor: 'pointer' }}
                    ></i>
                    <i 
                        className={`icon ${isPlaying ? 'pause' : 'play'}`} 
                        onClick={onPlayPause} 
                        style={{ cursor: 'pointer', margin: '0 10px', transform: 'scale(1.2)' }}
                    ></i>
                    <i 
                        className="icon next" 
                        onClick={onNext} 
                        style={{ cursor: 'pointer' }}
                    ></i>
                </div>
                <div className="progress-container">
                    <Progress 
                        progress={progress} 
                        onProgressChange={onProgressChange} 
                        barColor="#2f9842" 
                    />
                </div>
            </div>

            {/* Right: Volume */}
            <div className="-col-auto right-volume">
                <i className="icon-volume" style={{ marginRight: 10 }}></i>
                <div className="volume-slider">
                    <Progress 
                        progress={volume} 
                        onProgressChange={(val) => onVolumeChange(val)} 
                        barColor="#aaa" 
                    />
                </div>
            </div>
        </div>
    );
};

export default Footer;