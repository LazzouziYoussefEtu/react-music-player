import React, { useState, useEffect } from 'react';
import Progress from './components/progress';

const Root = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        $("#player").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    mp3: "http://oj4t8z2d5.bkt.clouddn.com/%E9%AD%94%E9%AC%BC%E4%B8%AD%E7%9A%84%E5%A4%A9%E4%BD%BF.mp3"
                }).jPlayer('play');
            },
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true
        });

        $("#player").bind($.jPlayer.event.timeupdate, (e) => {
            setProgress(Math.round(e.jPlayer.status.currentTime));
        });

        return () => {
             $("#player").unbind($.jPlayer.event.timeupdate);
        };
    }, []);

    return (
        <div>
            <h1>Welcome to the React lesson~</h1>
            <h3>Let us play music</h3>
            <Progress progress={progress} />
        </div>
    );
};

export default Root;