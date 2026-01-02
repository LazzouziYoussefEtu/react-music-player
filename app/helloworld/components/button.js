import React, { useState } from 'react';

const Button = () => {
    const [count, setCount] = useState(0);

    const counterHandler = () => {
        setCount(count + 1);
    };

    return (
        <div>
            <button onClick={counterHandler}>Count {count}</button>
        </div>
    );
};

export default Button;