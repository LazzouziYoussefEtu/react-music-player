import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const Search = ({ musicList = [], onPlayMusic }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [onlineResults, setOnlineResults] = useState([]);
    const [isSearchingOnline, setIsSearchingOnline] = useState(false);
    const searchRef = useRef(null);

    // Filter local songs
    const localResults = query.trim() === '' ? [] : musicList.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) || 
        song.artist.toLowerCase().includes(query.toLowerCase())
    );

    // Search online logic
    const handleSearchOnline = async () => {
        if (!query.trim()) return;
        setIsSearchingOnline(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/search-online?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setOnlineResults(data);
        } catch (error) {
            console.error("Online search failed", error);
        } finally {
            setIsSearchingOnline(false);
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSong = (song) => {
        onPlayMusic(song);
        setQuery('');
        setShowResults(false);
        setOnlineResults([]);
    };

    return (
        <div ref={searchRef} className="flex flex-col" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(107, 114, 128, 0.3)', paddingLeft: '10px', borderRadius: '6px', height: '40px', background: 'white' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m15.75 15.75-3.262-3.262M14.25 8.25a6 6 0 1 1-12 0 6 6 0 0 1 12 0" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                    type="text" 
                    placeholder="Search local or online..." 
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    style={{ border: 'none', outline: 'none', padding: '5px 10px', fontSize: '14px', flex: 1 }}
                />
                {query.trim() && (
                    <button 
                        onClick={handleSearchOnline}
                        disabled={isSearchingOnline}
                        style={{ background: '#2f9842', color: 'white', border: 'none', padding: '0 15px', height: '100%', borderTopRightRadius: '5px', borderBottomRightRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                    >
                        {isSearchingOnline ? '...' : 'Global'}
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (query.trim() !== '' || onlineResults.length > 0) && (
                <div style={{ position: 'absolute', top: '45px', left: 0, right: 0, background: 'white', border: '1px solid rgba(107, 114, 128, 0.3)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '400px', overflowY: 'auto', zIndex: 1000 }}>
                    
                    {/* Local Results */}
                    {localResults.length > 0 && (
                        <div>
                            <h5 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 15px', margin: 0, color: '#999', background: '#f9f9f9' }}>Local Library</h5>
                            {localResults.map(item => (
                                <div key={item.id} onClick={() => handleSelectSong(item)} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div style={{ fontSize: '14px', color: '#333' }}><span className="bold">{item.title}</span></div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{item.artist}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Online Results */}
                    {onlineResults.length > 0 && (
                        <div>
                            <h5 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 15px', margin: 0, color: '#2f9842', background: '#f0fdf4' }}>YouTube Music</h5>
                            {onlineResults.map(item => (
                                <div key={item.id} onClick={() => handleSelectSong(item)} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <img src={item.cover} style={{ width: '30px', height: '30px', borderRadius: '3px', marginRight: '10px' }} />
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#333' }}><span className="bold">{item.title}</span></div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{item.artist} (Online)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {localResults.length === 0 && onlineResults.length === 0 && (
                        <p style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                            No local results. Try clicking <b>Global</b> search.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;