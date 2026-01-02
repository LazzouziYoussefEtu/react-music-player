import React, { useContext } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext';


const ListItem = ({ data, focus }) => {
    const { playMusic } = useContext(MusicPlayerContext);

    return (
        <li 
            className={`list-group-item d-flex justify-content-between align-items-center ${focus ? 'active' : ''}`} 
            onClick={() => playMusic(data)}
            style={{ cursor: 'pointer' }}
        >
            <div className="d-flex align-items-center">
                <img 
                    src={data.cover || '/static/images/logo.png'} 
                    alt={data.title} 
                    onError={(e) => { e.target.src = '/static/images/logo.png'; }}
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    className="me-3 rounded"
                />
                <div>
                    <div className="fw-bold">{data.title}</div>
                    <div className="text-muted">{data.artist}</div>
                </div>
            </div>
        </li>
    );
};

export default ListItem;