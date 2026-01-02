import React, { useState, useEffect } from 'react';
import Progress from '../components/progress';
import { Link, useOutletContext } from 'react-router-dom';

const Player = () => {
    const { currentMusicItem } = useOutletContext();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            setProgress(Math.round(e.jPlayer.status.currentTime));
        });

        return () => {
            $("#player").unbind($.jPlayer.event.timeupdate);
        };
    }, []);

    const title = currentMusicItem ? currentMusicItem.title : '';

    return (
        <div>
            <h1 className="mt20">Welcome to the React lesson~</h1>
            <div className="mt20" style={{color: '#3aadff'}}><Link to="/list">See my music list</Link></div>
            <h3 className="mt20"><span className="bold">{title}</span> 播放中...</h3>
            <div className="mt20">
                <Progress progress={progress} />
            </div>
        </div>
    );
};

export default Player;