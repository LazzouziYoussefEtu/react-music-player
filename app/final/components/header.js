import React, { useState } from 'react';
import Logo from './logo';
import Search from './search';
import ThemeToggler from './ThemeToggler';
import { Link } from 'react-router-dom';

const Header = ({ onScan, currentPath, musicList = [], onPlayMusic }) => {
    const [path, setPath] = useState(currentPath || '');

    const handleScan = () => {
        onScan(path);
    };

    return (
        <header className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <Logo />
                </Link>
                <div className="collapse navbar-collapse">
                    <div className="mx-auto">
                        <Search musicList={musicList} onPlayMusic={onPlayMusic} />
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="Music Path..."
                            />
                            <button 
                                onClick={handleScan} 
                                className="btn btn-success"
                            >
                                Scan
                            </button>
                        </div>
                        <div className="ms-3">
                            <ThemeToggler />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;