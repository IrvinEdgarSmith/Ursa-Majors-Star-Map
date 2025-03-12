import { useState, useEffect, useRef } from 'react';
import { Archive, Check, CircleAlert, Copy, Download, Layers, LayoutDashboard, Palette, Upload, X } from 'lucide-react';
import BoardsManager from './BoardsManager';
import { useBoards } from '../contexts/BoardsContext';
import { ThemeColor, useTheme } from '../contexts/ThemeContext';
import { getStorageKeyForBoard } from '../contexts/BoardsContext';
import { useStarMap } from '../contexts/StarMapContext';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [currentTab, setCurrentTab] = useState('boards');
  const [showBoardsManager, setShowBoardsManager] = useState(false);
  const [switchMessage, setSwitchMessage] = useState<string | null>(null);
  const [switchingInProgress, setSwitchingInProgress] = useState(false);
  const [switchSuccessful, setSwitchSuccessful] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [duplicatingBoard, setDuplicatingBoard] = useState<string | null>(null);
  const [duplicateSuccess, setDuplicateSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { boards, currentBoardId, switchBoard, createBoard, duplicateBoard } = useBoards();
  const { currentTheme, changeTheme } = useTheme();
  const { celestialObjects, sectors, objectTypes } = useStarMap();
  
  const currentBoard = boards.find(board => board.id === currentBoardId);

  const handleCloseBoardsManager = () => {
    setShowBoardsManager(false);
  };

  // Clear any switch messages when the component unmounts
  useEffect(() => {
    return () => {
      setSwitchMessage(null);
      setSwitchingInProgress(false);
      setSwitchSuccessful(false);
    };
  }, []);

  // This is the core function that needs to be fixed
  const handleSwitchBoard = (boardId: string) => {
    if (boardId === currentBoardId || switchingInProgress) return;
    
    // Set switching state for visual feedback
    setSwitchingInProgress(true);
    setSwitchSuccessful(false);
    
    // Get the board name for the message
    const boardName = boards.find(b => b.id === boardId)?.name || 'board';
    setSwitchMessage(`Switching to "${boardName}"...`);
    
    // Switch to the selected board
    switchBoard(boardId);
    
    // After a brief delay to allow state to update, show success message
    // This timeout ensures the board data is loaded before we indicate success
    setTimeout(() => {
      setSwitchingInProgress(false);
      setSwitchSuccessful(true);
      setSwitchMessage(`Successfully switched to "${boardName}"`);
      
      // Close the modal only after a clear success indication
      // This delay is crucial to allow the user to see the success message
      // and for all state updates to fully propagate through the app
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 800);
  };

  const handleDuplicateBoard = (boardId: string) => {
    if (duplicatingBoard || !boardId) return;
    
    // Find the board to duplicate
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    
    setDuplicatingBoard(boardId);
    setDuplicateSuccess(null);
    
    try {
      // Perform the duplication
      const newBoardId = duplicateBoard(boardId);
      
      if (newBoardId) {
        // Show success message
        setDuplicateSuccess(`Board "${board.name}" was successfully duplicated.`);
        
        setTimeout(() => {
          setDuplicatingBoard(null);
          
          // Clear success message after a few seconds
          setTimeout(() => {
            setDuplicateSuccess(null);
          }, 3000);
        }, 800);
      } else {
        setDuplicatingBoard(null);
      }
    } catch (error) {
      console.error('Error duplicating board:', error);
      setDuplicatingBoard(null);
    }
  };

  const handleThemeChange = (theme: ThemeColor) => {
    changeTheme(theme);
  };

  // Export current board as a JSON file
  const handleExportBoard = () => {
    if (!currentBoardId || !currentBoard) return;

    setExportProgress("Preparing board data...");
    
    // Gather all data for the current board
    const objectsData = celestialObjects || [];
    const sectorsData = sectors || [];
    const objectTypesData = objectTypes || [];

    // Create full board data object with current data
    const boardData = {
      board: currentBoard,
      objects: objectsData,
      sectors: sectorsData,
      objectTypes: objectTypesData
    };

    setExportProgress("Creating export file...");

    // Create the JSON file
    const dataStr = JSON.stringify(boardData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Generate filename with board name and date
    const datePart = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const fileName = `ursa-majors-${currentBoard.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${datePart}.json`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportProgress("Board exported successfully!");
    setTimeout(() => {
      setExportProgress(null);
    }, 2000);
  };

  // Trigger file input click
  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process the selected import file
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate the data structure
        if (!importedData.board || !importedData.objects || !importedData.sectors) {
          throw new Error('Invalid file format. Missing required data.');
        }

        // Create a new board with a unique ID but keep original name and theme
        const newBoardId = crypto.randomUUID();
        const boardName = `${importedData.board.name} (Imported)`;
        
        // Create the new board with the original theme if available
        const newBoard = {
          id: newBoardId,
          name: boardName,
          createdAt: Date.now(),
          lastModified: Date.now(),
          theme: importedData.board.theme || 'electric-blue' as ThemeColor
        };
        
        // First save the imported data to localStorage
        localStorage.setItem(
          getStorageKeyForBoard(newBoardId, 'objects'), 
          JSON.stringify(importedData.objects)
        );
        
        localStorage.setItem(
          getStorageKeyForBoard(newBoardId, 'sectors'), 
          JSON.stringify(importedData.sectors)
        );
        
        localStorage.setItem(
          getStorageKeyForBoard(newBoardId, 'object-types'), 
          JSON.stringify(importedData.objectTypes || [])
        );
        
        // Then create the board - this will trigger the proper state updates
        createBoard(boardName, newBoard);
        
        // Show success message
        setImportSuccess(`Board "${boardName}" imported successfully!`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : 'Failed to import board.');
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading file.');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="modal-gradient p-0 w-[650px] max-w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-theme" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xl font-bold text-theme-primary">Settings</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-theme-background-alt rounded text-theme-muted hover:text-theme-text"
            disabled={switchingInProgress}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex h-full">
          {/* Settings tabs sidebar */}
          <div className="w-1/4 border-r border-theme p-4 sidebar-gradient" style={{ borderColor: 'var(--color-border)' }}>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${
                  currentTab === 'boards' 
                    ? 'btn-gradient-animated' 
                    : 'text-theme-muted hover:bg-theme-background-alt'
                }`}
                onClick={() => setCurrentTab('boards')}
              >
                <LayoutDashboard size={18} />
                <span>Boards</span>
              </button>
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${
                  currentTab === 'appearance' 
                    ? 'btn-gradient-animated' 
                    : 'text-theme-muted hover:bg-theme-background-alt'
                }`}
                onClick={() => setCurrentTab('appearance')}
              >
                <Palette size={18} />
                <span>Appearance</span>
              </button>
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${
                  currentTab === 'data' 
                    ? 'btn-gradient-animated' 
                    : 'text-theme-muted hover:bg-theme-background-alt'
                }`}
                onClick={() => setCurrentTab('data')}
              >
                <Archive size={18} />
                <span>Data</span>
              </button>
            </nav>
          </div>
          
          {/* Settings content */}
          <div className="w-3/4 p-4 overflow-y-auto">
            {currentTab === 'boards' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-theme-primary">Star Map Boards</h4>
                
                {/* Success message */}
                {switchMessage && (
                  <div className={`${
                    switchingInProgress 
                      ? 'bg-blue-900 bg-opacity-30 text-blue-300' 
                      : switchSuccessful
                        ? 'bg-green-900 bg-opacity-30 text-green-300'
                        : 'bg-yellow-900 bg-opacity-30 text-yellow-300'
                  } px-4 py-2 rounded-md flex items-center gap-2 mb-4 transition-all duration-300`}>
                    {switchingInProgress ? (
                      <div className="animate-spin h-4 w-4 border-2 border-theme-primary border-t-transparent rounded-full"></div>
                    ) : switchSuccessful ? (
                      <Check size={18} className="text-green-300" />
                    ) : (
                      <Check size={18} className="text-yellow-300" />
                    )}
                    <span>{switchMessage}</span>
                  </div>
                )}

                {/* Duplicate success message */}
                {duplicateSuccess && (
                  <div className="bg-green-900 bg-opacity-30 text-green-300 px-4 py-2 rounded-md flex items-center gap-2 mb-4">
                    <Check size={18} className="text-green-300" />
                    <span>{duplicateSuccess}</span>
                  </div>
                )}
                
                {/* Current board info */}
                <div className="bg-theme-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-theme-text">Current Board</h5>
                    <span className="text-xs btn-primary px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-xl font-semibold text-theme-primary mb-1">
                    {currentBoard?.name || 'Default Board'}
                  </div>
                  <div className="text-sm text-theme-muted">
                    Last modified: {currentBoard ? new Date(currentBoard.lastModified).toLocaleString() : 'N/A'}
                  </div>
                </div>
                
                {/* Boards summary */}
                <div className="bg-theme-card p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h5 className="font-medium text-theme-text">Your Boards</h5>
                      <p className="text-sm text-theme-muted mt-1">
                        You have {boards.length} {boards.length === 1 ? 'board' : 'boards'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBoardsManager(true)}
                      className="btn-primary text-sm"
                      disabled={switchingInProgress}
                    >
                      Manage Boards
                    </button>
                  </div>
                  
                  {/* Quick board list - now showing all boards */}
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {boards.length === 0 ? (
                      <div className="text-center py-8 text-theme-muted italic">
                        No boards yet. Create your first board in the Boards Manager.
                      </div>
                    ) : (
                      boards.map(board => (
                        <div 
                          key={board.id}
                          className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                            board.id === currentBoardId 
                              ? 'item-selected' 
                              : 'hover:bg-gray-800 hover:border-l-2 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`font-medium text-sm ${
                              board.id === currentBoardId 
                                ? 'text-theme-primary' 
                                : 'text-theme-text hover:text-theme-primary'
                            }`}
                              onClick={() => !switchingInProgress && handleSwitchBoard(board.id)}
                            >
                              {board.name}
                              {board.id === currentBoardId && (
                                <span className="ml-2 text-xs bg-theme-primary bg-opacity-20 text-theme-primary px-1.5 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDuplicateBoard(board.id)}
                                className="p-1 text-theme-muted hover:text-theme-primary"
                                title="Duplicate Board"
                                disabled={duplicatingBoard !== null}
                              >
                                {duplicatingBoard === board.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-theme-primary border-t-transparent rounded-full"></div>
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                              <div className="text-xs text-theme-muted">
                                {new Date(board.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-theme-muted">
                  Each board maintains its own separate star map with independent objects, sectors, and settings.
                  <br/>
                  <span className="italic text-theme-primary">Click on a board above to switch to it or use the duplicate button to create a copy.</span>
                </div>
              </div>
            )}
            
            {currentTab === 'appearance' && (
              <div>
                <h4 className="text-lg font-semibold text-theme-primary mb-4">Appearance Settings</h4>
                
                <div className="bg-theme-card mb-4 p-4">
                  <h5 className="font-medium text-theme-text mb-3">Board Theme</h5>
                  <p className="text-sm text-theme-muted mb-4">
                    Choose a color theme for the current board. Each board can have its own theme.
                  </p>
                  
                  <div className="space-y-3">
                    {/* Electric Blue Theme Option */}
                    <div 
                      className={`theme-card p-3 border rounded-md cursor-pointer flex items-center gap-3 ${
                        currentTheme === 'electric-blue' ? 'selected' : ''
                      }`}
                      onClick={() => handleThemeChange('electric-blue')}
                      style={{ borderColor: currentTheme === 'electric-blue' ? 'var(--color-primary)' : 'var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded-full bg-electric-blue flex-shrink-0"></div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-300">Electric Blue</span>
                          {currentTheme === 'electric-blue' && (
                            <Check size={18} className="text-blue-400" />
                          )}
                        </div>
                        <div className="text-xs text-blue-200 opacity-80 mt-1">
                          A gentle blue for peaceful civilizations
                        </div>
                      </div>
                    </div>
                    
                    {/* Crimson Red Theme Option */}
                    <div 
                      className={`theme-card p-3 border rounded-md cursor-pointer flex items-center gap-3 ${
                        currentTheme === 'crimson-red' ? 'selected' : ''
                      }`}
                      onClick={() => handleThemeChange('crimson-red')}
                      style={{ borderColor: currentTheme === 'crimson-red' ? 'var(--color-primary)' : 'var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded-full bg-crimson-red flex-shrink-0"></div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-300">Crimson Red</span>
                          {currentTheme === 'crimson-red' && (
                            <Check size={18} className="text-red-400" />
                          )}
                        </div>
                        <div className="text-xs text-red-200 opacity-80 mt-1">
                          A bold red theme perfect for warlike civilizations
                        </div>
                      </div>
                    </div>
                    
                    {/* Canary Yellow Theme Option */}
                    <div 
                      className={`theme-card p-3 border rounded-md cursor-pointer flex items-center gap-3 ${
                        currentTheme === 'canary-yellow' ? 'selected' : ''
                      }`}
                      onClick={() => handleThemeChange('canary-yellow')}
                      style={{ borderColor: currentTheme === 'canary-yellow' ? 'var(--color-primary)' : 'var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded-full bg-canary-yellow flex-shrink-0"></div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-yellow-300">Canary Yellow</span>
                          {currentTheme === 'canary-yellow' && (
                            <Check size={18} className="text-yellow-400" />
                          )}
                        </div>
                        <div className="text-xs text-yellow-200 opacity-80 mt-1">
                          A bright yellow theme for prosperous or scientific worlds
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-theme-muted italic">
                  Theme changes are automatically saved and will persist when you switch between boards.
                </div>
              </div>
            )}
            
            {currentTab === 'data' && (
              <div>
                <h4 className="text-lg font-semibold text-theme-primary mb-4">Data Management</h4>
                
                {/* Hidden file input for import */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelected} 
                  accept=".json" 
                  className="hidden" 
                />
                
                <div className="bg-theme-card mb-4 p-4">
                  <h5 className="font-medium text-theme-text mb-3">Board Import/Export</h5>
                  <p className="text-sm text-theme-muted mb-4">
                    Export your current board to a file for backup or sharing, or import a previously exported board.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <button 
                      onClick={handleExportBoard}
                      className="flex items-center justify-center gap-2 btn-primary py-2 px-4"
                      disabled={exportProgress !== null}
                    >
                      {exportProgress ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Download size={18} />
                      )}
                      <span>{exportProgress || "Export Current Board"}</span>
                    </button>
                    
                    <button 
                      onClick={handleImportClick}
                      className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    >
                      <Upload size={18} />
                      <span>Import Board</span>
                    </button>
                  </div>
                  
                  {/* Import error message */}
                  {importError && (
                    <div className="mt-4 px-4 py-3 bg-red-900 bg-opacity-30 border border-red-800 rounded-md text-red-300 flex items-start gap-2">
                      <CircleAlert size={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Import failed</div>
                        <div className="text-sm">{importError}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Import success message */}
                  {importSuccess && (
                    <div className="mt-4 px-4 py-3 bg-green-900 bg-opacity-30 border border-green-800 rounded-md text-green-300 flex items-start gap-2">
                      <Check size={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Import successful</div>
                        <div className="text-sm">{importSuccess}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-theme-muted italic mt-3">
                  Note: Imported boards are added as new boards, and will not replace your existing boards.
                  The imported board will appear in your board list with "(Imported)" added to its name.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Boards Manager */}
      {showBoardsManager && (
        <BoardsManager onClose={handleCloseBoardsManager} />
      )}
    </div>
  );
};

export default SettingsModal;
