import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { MusicPlayerProvider, MusicPlayerContext } from './context/MusicPlayerProvider';
import PlayerPage from './page/player';
import ListPage from './page/list';
import Header from './components/header';
import Footer from './components/footer';
import Logo from './components/logo';

const App = () => {
    const { 
        isInitialized, 
        scanPath, 
        setScanPath, 
        isScanning, 
        setIsScanning,
        musicList, 
        currentMusicItem,
        playMusic,
    } = useContext(MusicPlayerContext);

    const handleScan = async (pathInput) => {
        setIsScanning(true);
        try {
            const response = await fetch('http://localhost:8080/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirPath: pathInput })
            });
            const result = await response.json();
            if (result.count > 0) {
                localStorage.setItem('musicPath', pathInput);
                setScanPath(pathInput);
                window.location.reload(); // Simple way to refresh data
            } else {
                alert("No MP3 files found.");
            }
        } catch (error) {
            console.error(error);
            alert("Scan failed.");
        } finally {
            setIsScanning(false);
        }
    };
    
    if (!isInitialized) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', fontFamily: 'sans-serif' }}>
                <Logo />
                <div style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
                    <h2>Setup Your Music Library</h2>
                    <input type="text" value={scanPath} onChange={(e) => setScanPath(e.target.value)} placeholder="/path/to/your/music" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    <button onClick={() => handleScan(scanPath)} disabled={isScanning} style={{ width: '100%', padding: '12px', background: '#2f9842', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>{isScanning ? 'Scanning...' : 'Start Playing'}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header onScan={handleScan} currentPath={scanPath} musicList={musicList} onPlayMusic={playMusic} />
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px', position: 'relative' }}>
                 <Outlet context={{ musicList, currentMusicItem }} />
            </div>
            <Footer />
        </div>
    );
};

const Root = () => (
    <MusicPlayerProvider>
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<PlayerPage />} />
                    <Route path="list" element={<ListPage />} />
                </Route>
            </Routes>
        </HashRouter>
    </MusicPlayerProvider>
);

export default Root;