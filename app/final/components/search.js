import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const Search = ({ musicList = [], onPlayMusic }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [onlineResults, setOnlineResults] = useState([]);
    const [isSearchingOnline, setIsSearchingOnline] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
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

    const handleDownload = async (item, e) => {
        e.stopPropagation();
        setDownloadingId(item.id);
        const dirPath = localStorage.getItem('musicPath');
        if (!dirPath) {
            alert('Please set a music path first.');
            setDownloadingId(null);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId: item.videoId,
                    title: item.title,
                    artist: item.artist,
                    cover: item.cover,
                    dirPath: dirPath
                })
            });
            const result = await response.json();
            alert(result.message || 'Download complete!');
        } catch (error) {
            console.error('Download failed', error);
            alert('Download failed.');
        } finally {
            setDownloadingId(null);
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
        <div ref={searchRef} className="dropdown" style={{ width: '100%', maxWidth: '400px' }}>
            {/* Search Input */}
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m15.75 15.75-3.262-3.262M14.25 8.25a6 6 0 1 1-12 0 6 6 0 0 1 12 0" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
                <input 
                    type="text" 
                    className="form-control border-start-0"
                    placeholder="Search local or online..." 
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                />
                {query.trim() && (
                    <button 
                        className="btn btn-success"
                        onClick={handleSearchOnline}
                        disabled={isSearchingOnline}
                    >
                        {isSearchingOnline ? '...' : 'Global'}
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (query.trim() !== '' || onlineResults.length > 0) && (
                <ul className="dropdown-menu show shadow-lg w-100" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    
                    {/* Local Results */}
                    {localResults.length > 0 && (
                        <>
                            <li><h6 className="dropdown-header bg-light">Local Library</h6></li>
                            {localResults.map(item => (
                                <li key={item.id}>
                                    <button className="dropdown-item d-flex align-items-center py-2" onClick={() => handleSelectSong(item)}>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{item.title}</div>
                                            <div className="text-muted" style={{ fontSize: '12px' }}>{item.artist}</div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </>
                    )}

                    {/* Online Results */}
                    {onlineResults.length > 0 && (
                        <>
                            {localResults.length > 0 && <li><hr className="dropdown-divider" /></li>}
                            <li><h6 className="dropdown-header bg-success bg-opacity-10 text-success">YouTube Music</h6></li>
                            {onlineResults.map(item => (
                                <li key={item.id}>
                                    <div className="dropdown-item d-flex align-items-center py-2 gap-3">
                                        <img 
                                            src={item.cover} 
                                            alt="" 
                                            className="rounded" 
                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                            onClick={() => handleSelectSong(item)}
                                        />
                                        <div className="flex-grow-1 cursor-pointer" onClick={() => handleSelectSong(item)} style={{ cursor: 'pointer' }}>
                                            <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{item.title}</div>
                                            <div className="text-muted" style={{ fontSize: '12px' }}>{item.artist} (Online)</div>
                                        </div>
                                        <button 
                                            className="btn btn-sm btn-outline-success border-0"
                                            onClick={(e) => handleDownload(item, e)}
                                            disabled={downloadingId === item.id}
                                            title="Download to local library"
                                        >
                                            {downloadingId === item.id ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <svg width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </>
                    )}

                    {localResults.length === 0 && onlineResults.length === 0 && (
                        <li className="p-4 text-center text-muted">
                            No local results. Try clicking <b>Global</b> search.
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Search;