import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggler = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
    );
};

export default ThemeToggler;
