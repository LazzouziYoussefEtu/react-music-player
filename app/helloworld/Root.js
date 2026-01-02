import React, { useState } from 'react';
import Button from './components/button';

const Root = () => {
    const [count, setCount] = useState(0);

    const counterHandler = () => {
        setCount(count + 1);
    };

    return (
        <div>
            <p>hello world，welcome to the React lesson~</p>
            <Button />
        </div>
    );
};

export default Root;