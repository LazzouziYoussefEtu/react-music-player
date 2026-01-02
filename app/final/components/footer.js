import React, { useContext } from 'react';
import Progress from './progress';
import { MusicPlayerContext } from '../context/MusicPlayerContext';


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
        <footer className="footer bg-body-tertiary p-3">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-3 d-flex align-items-center">
                        <img 
                            src={currentMusicItem.cover || '/static/images/logo.png'} 
                            alt={currentMusicItem.title} 
                            onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="me-3 rounded"
                        />
                        <div>
                            <div className="fw-bold text-truncate">{currentMusicItem.title}</div>
                            <div className="text-muted text-truncate">{currentMusicItem.artist}</div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="d-flex justify-content-center align-items-center mb-2">
                            <button className="btn btn-link text-body-secondary" onClick={onRepeatChange}><i className={`icon repeat-${repeatType}`}></i></button>
                            <button className="btn btn-link text-body-secondary" onClick={onPrev}><i className="icon prev"></i></button>
                            <button className="btn btn-link text-body-secondary mx-2" onClick={onPlayPause}><i className={`icon h1 ${isPlaying ? 'pause' : 'play'}`}></i></button>
                            <button className="btn btn-link text-body-secondary" onClick={onNext}><i className="icon next"></i></button>
                        </div>
                        <Progress progress={progress} onProgressChange={onProgressChange} barColor="#2f9842" />
                    </div>

                    <div className="col-md-3 d-flex justify-content-end align-items-center">
                        <i className="icon-volume me-2"></i>
                        <div style={{ width: '100px' }}>
                            <Progress progress={volume} onProgressChange={onVolumeChange} barColor="#aaa" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;