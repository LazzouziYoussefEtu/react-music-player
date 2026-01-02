import React, { useRef } from 'react';
import './progress.less';

const Progress = ({ progress, onProgressChange, barColor = '#2f9842' }) => {
    const progressBarRef = useRef(null);

    const changeProgress = (e) => {
        const progressBar = progressBarRef.current;
        if (progressBar) {
            const newProgress = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.clientWidth;
            if (onProgressChange) {
                onProgressChange(newProgress);
            }
        }
    };

    return (
        <div className="components-progress" ref={progressBarRef} onClick={changeProgress}>
            <div className="progress" style={{ width: `${progress}%`, background: barColor }}></div>
        </div>
    );
};

export default Progress;