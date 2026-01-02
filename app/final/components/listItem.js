import React from 'react';
import PubSub from 'pubsub-js';
import './listitem.less';

const ListItem = ({ data, focus }) => {
    const deleteHandler = (e) => {
        e.stopPropagation();
        PubSub.publish('DEL_MUSIC', data);
    };

    const playMusic = () => {
        PubSub.publish('PLAY_MUSIC', data);
    };

    return (
        <li 
            className={`components-listitem${focus ? ' focus' : ''}`} 
            onClick={playMusic}
        >
            <div className="cover">
                <img src={data.cover || 'http://via.placeholder.com/40'} alt={data.title} />
            </div>
            <div className="info">
                <span className="title bold">{data.title}</span>
                <span className="artist">{data.artist}</span>
            </div>
            <div className="delete" onClick={deleteHandler}>✕</div>
        </li>
    );
};

export default ListItem;