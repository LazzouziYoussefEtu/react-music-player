import React from 'react';
import PubSub from 'pubsub-js';
import './listitem.less';

const ListItem = ({ data }) => {
    const deleteHandler = (e) => {
        e.stopPropagation();
        PubSub.publish('DEL_MUSIC', data);
    };

    const playMusic = () => {
        PubSub.publish('PLAY_MUSIC', data);
    };

    return (
        <li className="row components-listitem" onClick={playMusic}>
            <p><span className="bold">{data.title}</span>  -  {data.artist}</p>
            <p className="-col-auto delete" onClick={deleteHandler}></p>
        </li>
    );
};

export default ListItem;