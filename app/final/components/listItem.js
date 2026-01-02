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
        <li className={`components-listitem${focus ? ' focus' : ''}`} onClick={playMusic}>
            <div className="cover" style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '15px', overflow: 'hidden', backgroundColor: '#eee' }}>
                <img 
                    src={data.cover || '/static/images/logo.png'} 
                    alt={data.title} 
                    onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
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