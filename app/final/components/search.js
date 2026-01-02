import React, { useState, useEffect, useRef } from 'react';

const Search = ({ musicList = [], onPlayMusic }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Filter music based on search query
    const filteredMusic = searchQuery.trim() === '' 
        ? [] 
        : musicList.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSong = (item) => {
        onPlayMusic(item);
        setSearchQuery('');
        setShowResults(false);
    };

    return (
        <div ref={searchRef} className="flex flex-col" style={{ width: '100%', maxWidth: '300px', position: 'relative' }}>
            {/* Search Input Box */}
            <div className="flex items-center border pl-3 gap-2 bg-white border-gray-500/30 h-10 rounded-md overflow-hidden" 
                 style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(107, 114, 128, 0.3)', paddingLeft: '10px', borderRadius: '6px', height: '40px' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m15.75 15.75-3.262-3.262M14.25 8.25a6 6 0 1 1-12 0 6 6 0 0 1 12 0" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                    type="text" 
                    placeholder="Search the song" 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm" 
                    style={{ border: 'none', outline: 'none', padding: '5px', fontSize: '14px', width: '100%' }}
                />
            </div>
        
            {/* Results Dropdown */}
            {showResults && searchQuery.trim() !== '' && (
                <div className="py-3 bg-white border border-gray-500/30 rounded-md overflow-hidden" 
                     style={{ 
                        position: 'absolute', 
                        top: '45px', 
                        left: 0, 
                        right: 0, 
                        background: 'white', 
                        border: '1px solid rgba(107, 114, 128, 0.3)', 
                        borderRadius: '6px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        zIndex: 1000
                     }}>
                    <h5 className="text-xs pb-2 text-gray-800/80 px-4" style={{ fontSize: '12px', padding: '10px 15px', margin: 0, color: '#666' }}>Search Result</h5>
                    {filteredMusic.length > 0 ? (
                        filteredMusic.map(item => (
                            <p 
                                key={item.id}
                                onClick={() => handleSelectSong(item)}
                                className="text-sm text-gray-500 py-1 hover:bg-gray-200/80 cursor-pointer px-4"
                                style={{ padding: '8px 15px', cursor: 'pointer', margin: 0, fontSize: '14px' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <span className="bold">{item.title}</span> - {item.artist}
                            </p>
                        ))
                    ) : (
                        <p style={{ padding: '8px 15px', color: '#999', fontSize: '13px' }}>No songs found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;