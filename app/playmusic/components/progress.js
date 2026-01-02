import React from 'react';

const Progress = ({ progress }) => {
    return (
        <p>
            已播放：{progress}s
        </p>
    );
};

export default Progress;