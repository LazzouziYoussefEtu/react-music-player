import React, { useState } from 'react';
import Logo from './logo';
import { Link } from 'react-router-dom';

const Header = ({ onScan, currentPath }) => {
    const [path, setPath] = useState(currentPath || '');

    const handleScan = () => {
        onScan(path);
    };

    return (
        <div className="components-header row" style={{ 
            height: '80px', 
            borderBottom: '1px solid #ddd', 
            background: 'white', 
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <Link to="/" className="-col-auto" style={{ textDecoration: 'none' }}>
                <Logo />
            </Link>
            <div style={{ flex: 1 }}></div>
            <div className="-col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                 <input 
                    type="text" 
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Absolute Music Path..."
                    style={{ 
                        padding: '8px', 
                        borderRadius: '4px 0 0 4px', 
                        border: '1px solid #ccc',
                        outline: 'none',
                        width: '300px'
                    }}
                />
                <button 
                    onClick={handleScan} 
                    style={{ 
                        padding: '8px 15px', 
                        background: '#2f9842', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0 4px 4px 0',
                        cursor: 'pointer' 
                    }}
                >
                    Scan
                </button>
            </div>
        </div>
    );
};

export default Header;