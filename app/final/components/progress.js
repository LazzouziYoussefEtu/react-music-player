import React, { useRef } from 'react';

const Progress = ({ progress, onProgressChange, barColor = '#2f9842' }) => {
    const progressBarRef = useRef(null);

    const changeProgress = (e) => {
        const progressBar = progressBarRef.current;
        if (progressBar) {
            const rect = progressBar.getBoundingClientRect();
            let newProgress = (e.clientX - rect.left) / rect.width;
            
            // Clamp value between 0 and 1
            newProgress = Math.max(0, Math.min(1, newProgress));
            
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