import React, { useState } from 'react';
import Logo from './logo';
import Search from './search';
import { Link } from 'react-router-dom';

const Header = ({ onScan, currentPath, musicList = [], onPlayMusic }) => {
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
            zIndex: 100,
            display: 'flex',
            alignItems: 'center'
        }}>
            {/* Left: Logo */}
            <div className="-col-auto">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Logo />
                </Link>
            </div>

            {/* Middle: Search Component */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Search musicList={musicList} onPlayMusic={onPlayMusic} />
            </div>

            {/* Right: Scan UI */}
            <div className="-col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                 <input 
                    type="text" 
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Music Path..."
                    style={{ 
                        padding: '8px', 
                        borderRadius: '4px 0 0 4px', 
                        border: '1px solid #ccc',
                        outline: 'none',
                        width: '200px'
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