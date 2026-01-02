import React, { useContext } from 'react';
import Progress from '../components/progress';
import { Link } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';


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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1><Link to="/list" className="text-decoration-none">&lt; Back to Music List</Link></h1>
                    <div className="row mt-4 align-items-center">
                        <div className="col-md-8">
                            <h2 className="text-truncate">{title}</h2>
                            <h3 className="text-muted">{artist}</h3>
                            <div className="d-flex align-items-center mt-4">
                                <span className="me-3">-{formatTime(leftTime)}</span>
                                <div className="flex-grow-1">
                                    <Progress progress={progress} onProgressChange={onProgressChange} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <button className="btn btn-link text-body-secondary" onClick={onPrev}><i className="icon prev h2"></i></button>
                                <button className="btn btn-link text-body-secondary mx-3" onClick={onPlayPause}><i className={`icon h1 ${isPlaying ? 'pause' : 'play'}`}></i></button>
                                <button className="btn btn-link text-body-secondary" onClick={onNext}><i className="icon next h2"></i></button>
                                <button className="btn btn-link text-body-secondary ms-4" onClick={changeRepeat}><i className={`icon repeat-${repeatType}`}></i></button>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <img 
                                src={cover} 
                                alt={title} 
                                onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                                className="img-fluid rounded shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;