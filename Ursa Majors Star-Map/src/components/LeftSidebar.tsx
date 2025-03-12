import { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe, Image, Info, Map, Moon, Plus, RotateCcw, Satellite, Settings, Star } from 'lucide-react';
import { useStarMap } from "../contexts/StarMapContext";
import ObjectSettingsPanel from "./ObjectSettingsPanel";
import SectorSettingsPanel from "./SectorSettingsPanel";
import AssetMenu from './AssetMenu';
import AssetSettingsPanel from './AssetSettingsPanel';
import AssetPanel from './AssetPanel';

interface LeftSidebarProps {
  onOpenSettings: () => void;
}

const LeftSidebar = ({ onOpenSettings }: LeftSidebarProps) => {
  const { 
    initializeObjectPlacement, 
    selectedObjectId,
    selectedSectorId,
    selectedMapAssetId,
    celestialObjects,
    getObjectById,
    createOrbitalObject,
    initializeSectorCreation,
    isCreatingSector,
    canUndo,
    undo,
    initializeAssetPlacement
  } = useStarMap();
  
  const [collapsed, setCollapsed] = useState(false);
  const [undoFeedback, setUndoFeedback] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  
  const selectedObject = selectedObjectId ? getObjectById(selectedObjectId) : undefined;
  const isStarSelected = selectedObject?.type === 'star';
  const isPlanetSelected = selectedObject?.type === 'planet';

  const handleCreateObject = (type: 'star' | 'astralBody') => {
    initializeObjectPlacement(type);
  };

  const handleCreatePlanet = () => {
    if (selectedObjectId && isStarSelected) {
      createOrbitalObject('planet', selectedObjectId);
    }
  };

  const handleCreateOrbitalObject = (type: 'moon' | 'satellite' | 'station') => {
    if (selectedObjectId && isPlanetSelected) {
      createOrbitalObject(type, selectedObjectId);
    }
  };

  const handleCreateSector = () => {
    initializeSectorCreation();
  };

  const handleUndo = () => {
    undo();
    // Show visual feedback for the undo action
    setUndoFeedback(true);
    setTimeout(() => setUndoFeedback(false), 500);
  };

  const handleOpenAssetMenu = () => {
    setShowAssetMenu(true);
  };

  const handleCloseAssetMenu = () => {
    setShowAssetMenu(false);
  };

  const handleSelectAsset = (assetId: string) => {
    initializeAssetPlacement(assetId);
    setShowAssetMenu(false);
  };

  return (
    <div className={`
      relative h-full bg-space-black border-r border-gray-800 
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-12' : 'w-64'}
    `}>
      {/* Collapse toggle button */}
      <button 
        className="absolute -right-3 top-16 z-10 p-1 rounded-full bg-gray-800 border border-gray-700 text-electric-blue"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      <div className={`p-4 flex flex-col h-full ${collapsed ? 'items-center' : ''}`}>
        <h1 className={`text-2xl font-bold mb-6 text-electric-blue ${collapsed ? 'hidden' : ''}`}>
          Ursa Majors
        </h1>
        
        {!collapsed && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-electric-blue">Create Objects</h2>
            <div className="space-y-2">              
              <button 
                onClick={() => handleCreateObject('star')}
                className="w-full py-2 px-3 flex items-center gap-2 bg-dark-space hover:bg-gray-800 rounded border border-gray-700 text-left"
              >
                <Star size={18} className="text-blue-400" />
                <span>Create Star</span>
              </button>
              
              <button 
                onClick={() => handleCreateObject('astralBody')}
                className="w-full py-2 px-3 flex items-center gap-2 bg-dark-space hover:bg-gray-800 rounded border border-gray-700 text-left"
              >
                <Globe size={18} className="text-gray-400" />
                <span>Create Astral Body</span>
              </button>

              <button 
                onClick={handleCreateSector}
                className={`w-full py-2 px-3 flex items-center gap-2 ${isCreatingSector ? 'bg-indigo-800 hover:bg-indigo-700' : 'bg-dark-space hover:bg-gray-800'} rounded border border-gray-700 text-left`}
              >
                <Map size={18} className="text-blue-300" />
                <span>Create Sector</span>
              </button>

              <button 
                onClick={handleOpenAssetMenu}
                className="w-full py-2 px-3 flex items-center gap-2 bg-dark-space hover:bg-gray-800 rounded border border-gray-700 text-left"
              >
                <Image size={18} className="text-green-300" />
                <span>Image Assets</span>
              </button>
              
              {/* Create Planet button - only show when a star is selected */}
              {isStarSelected && (
                <button 
                  onClick={handleCreatePlanet}
                  className="w-full py-2 px-3 flex items-center gap-2 bg-indigo-900 hover:bg-indigo-800 rounded border border-indigo-700 text-left"
                >
                  <Plus size={18} className="text-indigo-300" />
                  <span>Create Planet</span>
                </button>
              )}
              
              {/* Orbital object creation buttons - only show when a planet is selected */}
              {isPlanetSelected && (
                <>
                  <button 
                    onClick={() => handleCreateOrbitalObject('moon')}
                    className="w-full py-2 px-3 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-left"
                  >
                    <Moon size={18} className="text-gray-300" />
                    <span>Create Moon</span>
                  </button>
                  
                  <button 
                    onClick={() => handleCreateOrbitalObject('satellite')}
                    className="w-full py-2 px-3 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-left"
                  >
                    <Satellite size={18} className="text-gray-300" />
                    <span>Create Satellite</span>
                  </button>
                  
                  <button 
                    onClick={() => handleCreateOrbitalObject('station')}
                    className="w-full py-2 px-3 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-left"
                  >
                    <Settings size={18} className="text-gray-300" />
                    <span>Create Station</span>
                  </button>
                </>
              )}

              {/* Undo button */}
              <button 
                onClick={handleUndo}
                disabled={!canUndo}
                className={`w-full py-2 px-3 flex items-center gap-2 rounded border transition-all duration-300 text-left 
                  ${undoFeedback 
                    ? 'bg-theme-primary text-white border-theme-accent' 
                    : 'bg-dark-space hover:bg-gray-800 border-gray-700'}
                  ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RotateCcw size={18} className={undoFeedback ? 'text-white animate-spin' : 'text-gray-300'} />
                <span>Undo</span>
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mt-2 italic">
              {isCreatingSector ? 
                "Click on the map to add points, connect back to the first point to complete" :
                "Click on the star map to place"}
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex flex-col gap-4 items-center mt-4">
            <button 
              onClick={() => handleCreateObject('star')}
              className="p-2 rounded-full bg-dark-space hover:bg-gray-800 border border-gray-700"
              title="Create Star"
            >
              <Star size={18} className="text-blue-400" />
            </button>
            
            <button 
              onClick={() => handleCreateObject('astralBody')}
              className="p-2 rounded-full bg-dark-space hover:bg-gray-800 border border-gray-700"
              title="Create Astral Body"
            >
              <Globe size={18} className="text-gray-400" />
            </button>

            <button 
              onClick={handleCreateSector}
              className={`p-2 rounded-full ${isCreatingSector ? 'bg-indigo-800 hover:bg-indigo-700' : 'bg-dark-space hover:bg-gray-800'} border border-gray-700`}
              title="Create Sector"
            >
              <Map size={18} className="text-blue-300" />
            </button>

            <button 
              onClick={handleOpenAssetMenu}
              className="p-2 rounded-full bg-dark-space hover:bg-gray-800 border border-gray-700"
              title="Image Assets"
            >
              <Image size={18} className="text-green-300" />
            </button>
            
            {isStarSelected && (
              <button 
                onClick={handleCreatePlanet}
                className="p-2 rounded-full bg-indigo-900 hover:bg-indigo-800 border border-indigo-700"
                title="Create Planet"
              >
                <Plus size={18} className="text-indigo-300" />
              </button>
            )}
            
            {isPlanetSelected && (
              <>
                <button 
                  onClick={() => handleCreateOrbitalObject('moon')}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  title="Create Moon"
                >
                  <Moon size={18} className="text-gray-300" />
                </button>
                
                <button 
                  onClick={() => handleCreateOrbitalObject('satellite')}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  title="Create Satellite"
                >
                  <Satellite size={18} className="text-gray-300" />
                </button>
                
                <button 
                  onClick={() => handleCreateOrbitalObject('station')}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  title="Create Station"
                >
                  <Settings size={18} className="text-gray-300" />
                </button>
              </>
            )}

            {/* Undo button for collapsed sidebar */}
            <button 
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-2 rounded-full transition-all duration-300
                ${undoFeedback 
                  ? 'bg-theme-primary border-theme-accent' 
                  : 'bg-dark-space hover:bg-gray-800 border-gray-700'}
                ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Undo"
            >
              <RotateCcw size={18} className={undoFeedback ? 'text-white animate-spin' : 'text-gray-300'} />
            </button>
          </div>
        )}
        
        {!collapsed && !selectedObject && !selectedSectorId && !selectedMapAssetId && (
          <div className="flex-grow overflow-y-auto mb-4">
            <AssetPanel />
          </div>
        )}
        
        {!collapsed && selectedObject && (
          <div className="flex-grow overflow-y-auto mb-4">
            <ObjectSettingsPanel object={selectedObject} />
          </div>
        )}

        {!collapsed && selectedSectorId && (
          <div className="flex-grow overflow-y-auto mb-4">
            <SectorSettingsPanel />
          </div>
        )}

        {!collapsed && selectedMapAssetId && (
          <div className="flex-grow overflow-y-auto mb-4">
            <AssetSettingsPanel assetId={selectedMapAssetId} />
          </div>
        )}

        {!collapsed ? (
          <div className="mt-auto space-y-3">
            <button className="w-full py-2 px-3 flex items-center gap-2 bg-dark-space hover:bg-gray-800 rounded border border-gray-700 text-left">
              <Info size={18} />
              <span>About</span>
            </button>
            <button 
              onClick={onOpenSettings}
              className="w-full py-2 px-3 flex items-center gap-2 bg-dark-space hover:bg-gray-800 rounded border border-gray-700 text-left"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-3">
            <button className="p-2 rounded-full bg-dark-space hover:bg-gray-800 border border-gray-700" title="About">
              <Info size={18} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-dark-space hover:bg-gray-800 border border-gray-700" 
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Asset Menu Modal */}
      {showAssetMenu && (
        <AssetMenu 
          onClose={handleCloseAssetMenu} 
          onSelectAsset={handleSelectAsset}
        />
      )}
    </div>
  );
};

export default LeftSidebar;
