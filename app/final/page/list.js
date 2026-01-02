import React from 'react';
import ListItem from '../components/listItem';
import { useOutletContext } from 'react-router-dom';

const List = () => {
    const { musicList, currentMusicItem } = useOutletContext();

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
        <ul>
            { items }
        </ul>
    );
};

export default List;