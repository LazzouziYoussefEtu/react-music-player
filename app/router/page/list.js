import React from 'react';
import ListItem from '../components/listItem';
import { useOutletContext } from 'react-router-dom';

const List = () => {
    const { musicList } = useOutletContext();

    const items = musicList.map((item) => {
        return (
            <ListItem
                key={item.id}
                data={item}
            />
        );
    });

    return (
        <ul className="mt20">
            { items }
        </ul>
    );
};

export default List;