import { useEffect, useState } from 'react';
import './index.css';
import StarMap from './components/StarMap';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import SettingsModal from './components/SettingsModal';
import { StarMapProvider } from './contexts/StarMapContext';
import { BoardsProvider } from './contexts/BoardsContext';
import { ThemeProvider } from './contexts/ThemeContext';

export function App() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    // Include required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleToggleSettings = () => {
    setShowSettingsModal(prev => !prev);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  return (
    <BoardsProvider>
      <ThemeProvider>
        <StarMapProvider>
          <div 
            className="flex h-screen w-screen overflow-hidden text-theme-primary"
            style={{ 
              fontFamily: '"Orbitron", sans-serif',
              backgroundColor: 'var(--color-background)'
            }}
          >
            <LeftSidebar onOpenSettings={handleToggleSettings} />
            <StarMap />
            <RightSidebar />
            
            {/* Settings Modal */}
            {showSettingsModal && (
              <SettingsModal onClose={handleCloseSettings} />
            )}
          </div>
        </StarMapProvider>
      </ThemeProvider>
    </BoardsProvider>
  );
}

export default App;
