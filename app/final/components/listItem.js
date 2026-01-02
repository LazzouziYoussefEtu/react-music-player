import React, { useContext } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import './listitem.less';

const ListItem = ({ data, focus }) => {
    const { playMusic } = useContext(MusicPlayerContext);

    return (
        <li className={`components-listitem${focus ? ' focus' : ''}`} onClick={() => playMusic(data)}>
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
            {/* The delete functionality will be added back if needed, for now it is removed for simplification */}
        </li>
    );
};

export default ListItem;