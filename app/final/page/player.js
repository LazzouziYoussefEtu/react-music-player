import React, { useState, useEffect } from 'react';
import Progress from '../components/progress';
import { Link, useOutletContext } from 'react-router-dom';
import PubSub from 'pubsub-js';
import './player.less';

let duration = null;

const Player = () => {
    // Context from Root
    const { currentMusicItem, repeatType } = useOutletContext();

    // Local State
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0);
    const [isPlay, setIsPlay] = useState(true);
    const [leftTime, setLeftTime] = useState('');

    const formatTime = (time) => {
        time = Math.floor(time);
        let miniute = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);

        return miniute + ':' + (seconds < 10 ? '0' + seconds : seconds);
    };

    useEffect(() => {
        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            duration = e.jPlayer.status.duration;
            setProgress(e.jPlayer.status.currentPercentAbsolute);
            setVolume(e.jPlayer.options.volume * 100);
            setLeftTime(formatTime(duration * (1 - e.jPlayer.status.currentPercentAbsolute / 100)));
        });

        return () => {
            $("#player").unbind($.jPlayer.event.timeupdate);
        };
    }, []);

    const changeProgressHandler = (progress) => {
        if (duration) {
             $("#player").jPlayer("play", duration * progress);
             setIsPlay(true);
        }
    };

    const changeVolumeHandler = (progress) => {
        $("#player").jPlayer("volume", progress);
    };

    const play = () => {
        if (isPlay) {
            $("#player").jPlayer("pause");
        } else {
            $("#player").jPlayer("play");
        }
        setIsPlay(!isPlay);
    };

    const next = () => {
        PubSub.publish('PLAY_NEXT');
    };

    const prev = () => {
        PubSub.publish('PLAY_PREV');
    };

    const changeRepeat = () => {
        PubSub.publish('CHANAGE_REPEAT');
    };

    // Helper to safely access nested properties
    const title = currentMusicItem ? currentMusicItem.title : 'No Music';
    const artist = currentMusicItem ? currentMusicItem.artist : 'Unknown';
    const cover = currentMusicItem ? currentMusicItem.cover : '';

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
                                <Progress
                                    progress={volume}
                                    onProgressChange={changeVolumeHandler}
                                    barColor='#aaa'
                                >
                                </Progress>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 10, lineHeight: '10px'}}>
                        <Progress
                            progress={progress}
                            onProgressChange={changeProgressHandler}
                        >
                        </Progress>
                    </div>
                    <div className="mt35 row">
                        <div>
                            <i className="icon prev" onClick={prev}></i>
                            <i className={`icon ml20 ${isPlay ? 'pause' : 'play'}`} onClick={play}></i>
                            <i className="icon next ml20" onClick={next}></i>
                        </div>
                        <div className="-col-auto">
                            <i className={`icon repeat-${repeatType}`} onClick={changeRepeat}></i>
                        </div>
                    </div>
                </div>
                <div className="-col-auto cover">
                    <img src={cover} alt={title}/>
                </div>
            </div>
        </div>
    );
};

export default Player;