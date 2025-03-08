import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBoards } from './BoardsContext';

// Available themes
export type ThemeColor = 'electric-blue' | 'crimson-red' | 'canary-yellow';

// Theme color values
export const themeColors = {
  'electric-blue': {
    primary: '#4a7bff', // Lightened from #2a63ff
    secondary: '#6b94ff', // Lightened from #4a7bff
    accent: '#7fd1ff', // Lightened from #64c4ff
    text: '#e6f1ff',
    muted: '#a8bbdd', // Slightly lightened
    border: '#4d6491', // Lightened from #324b7d
    background: '#0a0e17',
    backgroundAlt: '#13151a',
    primaryRgb: '74, 123, 255' // Updated RGB values for shadows
  },
  'crimson-red': {
    primary: '#dc143c',
    secondary: '#ee3959',
    accent: '#ff6b8b',
    text: '#ffe6ea',
    muted: '#d9a0a9',
    border: '#7d3246',
    background: '#170a0e',
    backgroundAlt: '#1a1315',
    primaryRgb: '220, 20, 60'
  },
  'canary-yellow': {
    primary: '#ffef00',
    secondary: '#ffe200',
    accent: '#ffd100',
    text: '#fffbe6',
    muted: '#d8d3a0',
    border: '#7d7832',
    background: '#17170a',
    backgroundAlt: '#1a1a13',
    primaryRgb: '255, 239, 0'
  }
};

interface ThemeContextType {
  currentTheme: ThemeColor;
  themeColors: Record<ThemeColor, Record<string, string>>;
  changeTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'electric-blue',
  themeColors,
  changeTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { currentBoardId, boards, updateBoardTheme } = useBoards();
  
  // Get current board's theme
  const currentBoard = boards.find(board => board.id === currentBoardId);
  const currentTheme = currentBoard?.theme || 'electric-blue';
  
  // Apply theme to document when it changes
  useEffect(() => {
    if (!currentTheme) return;
    
    const theme = themeColors[currentTheme];
    
    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-muted', theme.muted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-background-alt', theme.backgroundAlt);
    root.style.setProperty('--color-primary-rgb', theme.primaryRgb);
    
    // Set data-theme attribute for any CSS selectors that need it
    root.setAttribute('data-theme', currentTheme);
    
    // Define gradients based on theme
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`);
    root.style.setProperty('--gradient-button', 
      `linear-gradient(to right, ${theme.primary} 0%, ${theme.secondary} 100%)`);
    root.style.setProperty('--gradient-panel', 
      `linear-gradient(160deg, ${theme.backgroundAlt}cc 0%, ${theme.background}e6 100%)`);
    root.style.setProperty('--gradient-highlight', 
      `linear-gradient(to right, ${theme.primary} 0%, ${theme.accent} 100%)`);
    root.style.setProperty('--gradient-subtle', 
      `linear-gradient(to right, ${theme.primary}0d 0%, ${theme.accent}1a 100%)`);
    
    // Update meta theme color for browsers that support it
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.background);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = theme.background;
      document.head.appendChild(newMeta);
    }
    
  }, [currentTheme]);
  
  const changeTheme = (theme: ThemeColor) => {
    if (currentBoardId) {
      updateBoardTheme(currentBoardId, theme);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ currentTheme, themeColors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
