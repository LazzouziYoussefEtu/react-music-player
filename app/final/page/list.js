import React, { useContext } from 'react';
import ListItem from '../components/listItem';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

const List = () => {
    const { musicList, currentMusicItem } = useContext(MusicPlayerContext);

    const items = musicList.map((item) => {
        return (
            <ListItem
                key={item.id}
                data={item}
                focus={currentMusicItem === item}
            ></ListItem>
        );
    });

    return (
        <ul className="list-group">
            { items }
        </ul>
    );
};

export default List;