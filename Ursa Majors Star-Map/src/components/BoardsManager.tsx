import { useState } from 'react';
import { Calendar, Pencil, Plus, Trash, X } from 'lucide-react';
import { useBoards } from '../contexts/BoardsContext';
import { ThemeColor } from '../contexts/ThemeContext';

interface BoardsManagerProps {
  onClose: () => void;
}

const BoardsManager = ({ onClose }: BoardsManagerProps) => {
  const { 
    boards, 
    currentBoardId, 
    createBoard, 
    switchBoard, 
    renameBoard, 
    deleteBoard,
    updateBoardTheme
  } = useBoards();
  
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [switchingInProgress, setSwitchingInProgress] = useState(false);
  
  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    createBoard(newBoardName);
    setNewBoardName('');
  };
  
  const handleStartEdit = (board: any) => {
    setEditingBoardId(board.id);
    setEditingName(board.name);
  };
  
  const handleSaveEdit = () => {
    if (editingBoardId && editingName.trim()) {
      renameBoard(editingBoardId, editingName);
      setEditingBoardId(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingBoardId(null);
  };
  
  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      deleteBoard(boardId);
    }
  };

  const handleSwitchBoard = (boardId: string) => {
    if (boardId === currentBoardId || switchingInProgress) return;
    
    setSwitchingInProgress(true);
    
    // Switch to the selected board
    switchBoard(boardId);
    
    // After a brief delay to allow state to update, close the manager
    setTimeout(() => {
      setSwitchingInProgress(false);
      onClose();
    }, 800);
  };

  const handleSetBoardTheme = (boardId: string, theme: ThemeColor) => {
    updateBoardTheme(boardId, theme);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="bg-theme-background border border-theme rounded-lg shadow-xl p-6 w-[550px] max-w-full max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-theme-primary">Star Map Boards</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-theme-background-alt rounded text-theme-muted hover:text-theme-text"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Create new board section */}
        <div className="mb-5 pb-4 border-b border-theme" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="text-sm text-theme-muted mb-2">Create New Board</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Enter board name"
              className="flex-grow bg-theme-background-alt border border-theme rounded px-3 py-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim()}
              className="px-3 py-2 bg-theme-primary hover:bg-theme-secondary text-white rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              <span>New Board</span>
            </button>
          </div>
        </div>
        
        {/* Boards list */}
        <h4 className="text-sm text-theme-muted mb-2">Your Boards</h4>
        <div className="overflow-y-auto flex-grow">
          {switchingInProgress && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
              <div className="flex flex-col items-center bg-theme-background p-4 rounded-lg shadow-lg">
                <div className="animate-spin h-8 w-8 border-4 border-theme-primary border-t-transparent rounded-full mb-2"></div>
                <div className="text-theme-primary font-medium">Switching board...</div>
              </div>
            </div>
          )}
          
          {boards.length === 0 ? (
            <div className="text-center py-8 text-theme-muted italic">
              No boards yet. Create your first board above.
            </div>
          ) : (
            <div className="space-y-2">
              {boards.map(board => (
                <div 
                  key={board.id}
                  className={`p-3 rounded-lg border ${
                    board.id === currentBoardId 
                      ? 'bg-theme-background-alt border-theme-primary' 
                      : 'bg-theme-background-alt border-theme hover:border-theme-muted'
                  } transition-colors`}
                  style={{ borderColor: board.id === currentBoardId ? 'var(--color-primary)' : 'var(--color-border)' }}
                >
                  {editingBoardId === board.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-grow bg-theme-background-alt border border-theme rounded px-2 py-1 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                        style={{ borderColor: 'var(--color-border)' }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-theme-background rounded text-theme-primary"
                        title="Save"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-theme-background rounded text-theme-muted"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h5 
                            className={`font-medium ${
                              board.id === currentBoardId ? 'text-theme-primary' : 'text-theme-text'
                            } cursor-pointer hover:underline`}
                            onClick={() => handleSwitchBoard(board.id)}
                          >
                            {board.name}
                          </h5>
                          {board.id === currentBoardId && (
                            <span className="ml-2 text-xs bg-theme-primary text-white px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                          {/* Theme indicator - small dot in theme color */}
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: board.theme === 'electric-blue' 
                                ? '#2a63ff' 
                                : board.theme === 'crimson-red' 
                                ? '#dc143c' 
                                : '#ffef00',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            title={`Theme: ${board.theme || 'Electric Blue'}`}
                          ></div>
                        </div>
                        <div className="text-xs text-theme-muted mt-1 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Created: {formatDate(board.createdAt)}</span>
                          </div>
                          <div>
                            Modified: {formatDate(board.lastModified)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(board)}
                          className="p-1.5 hover:bg-theme-background rounded text-theme-muted hover:text-theme-text"
                          title="Rename"
                        >
                          <Pencil size={16} />
                        </button>
                        {boards.length > 1 && (
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="p-1.5 hover:bg-crimson-red hover:bg-opacity-40 rounded text-theme-muted hover:text-red-300"
                            title="Delete"
                            disabled={boards.length <= 1}
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick theme selector - simplified to just color dots to change board theme */}
                  {!editingBoardId && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-theme-muted mr-1">Theme:</span>
                      <div 
                        className={`w-5 h-5 rounded-full bg-electric-blue cursor-pointer ${
                          board.theme === 'electric-blue' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => handleSetBoardTheme(board.id, 'electric-blue')}
                        title="Electric Blue"
                      ></div>
                      <div 
                        className={`w-5 h-5 rounded-full bg-crimson-red cursor-pointer ${
                          board.theme === 'crimson-red' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => handleSetBoardTheme(board.id, 'crimson-red')}
                        title="Crimson Red"
                      ></div>
                      <div 
                        className={`w-5 h-5 rounded-full bg-canary-yellow cursor-pointer ${
                          board.theme === 'canary-yellow' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => handleSetBoardTheme(board.id, 'canary-yellow')}
                        title="Canary Yellow"
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Help text */}
        <div className="mt-4 text-xs text-theme-muted italic">
          Each board has its own set of stars, planets, and sectors that are saved separately.
          <br />
          <span className="text-theme-primary">Click on a board to switch to it.</span>
        </div>
      </div>
    </div>
  );
};

export default BoardsManager;
