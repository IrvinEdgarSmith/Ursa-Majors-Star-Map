import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeColor } from './ThemeContext';

interface Board {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  theme?: ThemeColor;
}

interface BoardsContextType {
  boards: Board[];
  currentBoardId: string;
  createBoard: (name: string, boardData?: Partial<Board>) => string;
  switchBoard: (boardId: string) => void;
  renameBoard: (boardId: string, newName: string) => void;
  deleteBoard: (boardId: string) => void;
  getCurrentBoard: () => Board | undefined;
  isBoardSwitchingInProgress: boolean;
  updateBoardTheme: (boardId: string, theme: ThemeColor) => void;
}

const BoardsContext = createContext<BoardsContextType>({
  boards: [],
  currentBoardId: '',
  createBoard: () => "",
  switchBoard: () => {},
  renameBoard: () => {},
  deleteBoard: () => {},
  getCurrentBoard: () => undefined,
  isBoardSwitchingInProgress: false,
  updateBoardTheme: () => {}
});

export const STORAGE_KEY_BOARDS = 'ursa-majors-boards';
export const STORAGE_KEY_CURRENT_BOARD = 'ursa-majors-current-board';

export const getStorageKeyForBoard = (boardId: string, dataType: string) => {
  return `ursa-majors-${boardId}-${dataType}`;
};

export const BoardsProvider = ({ children }: { children: ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const [isBoardSwitchingInProgress, setIsBoardSwitchingInProgress] = useState<boolean>(false);

  // Load boards from localStorage on initial mount
  useEffect(() => {
    const savedBoards = localStorage.getItem(STORAGE_KEY_BOARDS);
    if (savedBoards) {
      try {
        const parsedBoards = JSON.parse(savedBoards);
        setBoards(parsedBoards);

        // If there are boards but no current board is set, select the first one
        if (parsedBoards.length > 0) {
          const savedCurrentBoard = localStorage.getItem(STORAGE_KEY_CURRENT_BOARD);
          if (savedCurrentBoard) {
            // Verify the saved current board exists in our list
            const boardExists = parsedBoards.some((board: Board) => board.id === savedCurrentBoard);
            setCurrentBoardId(boardExists ? savedCurrentBoard : parsedBoards[0].id);
          } else {
            setCurrentBoardId(parsedBoards[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to parse saved boards:', error);
      }
    } else {
      // No boards exist yet, create a default board
      const defaultBoard = {
        id: crypto.randomUUID(),
        name: 'Default Board',
        createdAt: Date.now(),
        lastModified: Date.now(),
        theme: 'electric-blue' as ThemeColor
      };
      setBoards([defaultBoard]);
      setCurrentBoardId(defaultBoard.id);
      localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify([defaultBoard]));
    }
  }, []);

  // Save current board ID to localStorage whenever it changes
  useEffect(() => {
    if (currentBoardId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_BOARD, currentBoardId);
      
      // Update the lastModified timestamp for the current board
      setBoards(prev => prev.map(board => 
        board.id === currentBoardId 
          ? { ...board, lastModified: Date.now() } 
          : board
      ));
    }
  }, [currentBoardId]);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify(boards));
    }
  }, [boards]);

  const createBoard = (name: string, boardData?: Partial<Board>) => {
    const boardId = boardData?.id || crypto.randomUUID();
    
    const newBoard = {
      id: boardId,
      name: name || `New Board ${boards.length + 1}`,
      createdAt: Date.now(),
      lastModified: Date.now(),
      theme: 'electric-blue' as ThemeColor, // Default theme
      ...(boardData || {}) // Apply any provided board data
    };
    
    setBoards(prev => [...prev, newBoard]);
    
    // Trigger board switch with the loading state
    setIsBoardSwitchingInProgress(true);
    
    // Small delay to ensure board is created before switching
    setTimeout(() => {
      setCurrentBoardId(newBoard.id);
      setIsBoardSwitchingInProgress(false);
    }, 50);
    
    return boardId;
  };

  const switchBoard = (boardId: string) => {
    const boardExists = boards.some(board => board.id === boardId);
    if (boardExists && boardId !== currentBoardId) {
      // Set the switching flag to true before changing the board
      setIsBoardSwitchingInProgress(true);
      
      // Use setTimeout to ensure the UI has time to update with the loading state
      // This creates a cleaner transition between boards
      setTimeout(() => {
        setCurrentBoardId(boardId);
        
        // After a small delay, mark the switch as complete
        // This ensures StarMapContext has time to load the new data
        setTimeout(() => {
          setIsBoardSwitchingInProgress(false);
        }, 300);
      }, 50);
    }
  };

  const renameBoard = (boardId: string, newName: string) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, name: newName, lastModified: Date.now() } 
        : board
    ));
  };

  const deleteBoard = (boardId: string) => {
    // Don't delete if it's the only board
    if (boards.length <= 1) {
      alert('Cannot delete the only board. Create a new board first.');
      return;
    }

    // Delete board data from localStorage
    localStorage.removeItem(getStorageKeyForBoard(boardId, 'objects'));
    localStorage.removeItem(getStorageKeyForBoard(boardId, 'sectors'));
    localStorage.removeItem(getStorageKeyForBoard(boardId, 'object-types'));

    setBoards(prev => {
      const updatedBoards = prev.filter(board => board.id !== boardId);
      
      // If we're deleting the current board, switch to another one
      if (boardId === currentBoardId && updatedBoards.length > 0) {
        // Set the switching flag to true before changing the board
        setIsBoardSwitchingInProgress(true);
        
        setTimeout(() => {
          setCurrentBoardId(updatedBoards[0].id);
          
          // After a small delay, mark the switch as complete
          setTimeout(() => {
            setIsBoardSwitchingInProgress(false);
          }, 300);
        }, 50);
      }
      
      return updatedBoards;
    });
  };

  const updateBoardTheme = (boardId: string, theme: ThemeColor) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, theme, lastModified: Date.now() } 
        : board
    ));
  };

  const getCurrentBoard = () => {
    return boards.find(board => board.id === currentBoardId);
  };

  return (
    <BoardsContext.Provider
      value={{
        boards,
        currentBoardId,
        createBoard,
        switchBoard,
        renameBoard,
        deleteBoard,
        getCurrentBoard,
        isBoardSwitchingInProgress,
        updateBoardTheme
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoards = () => useContext(BoardsContext);
