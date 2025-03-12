import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Globe, Moon, Satellite, Settings, Star } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import ColorPicker from './ColorPicker';
import TypeSelector from './TypeSelector';
import ConfirmationDialog from './ConfirmationDialog';

interface ContextMenuProps {
  x: number;
  y: number;
  objectId: string | null;
  onClose: () => void;
}

type ExpandedState = {
  [key: string]: boolean;
};

const ContextMenu = ({ x, y, objectId, onClose }: ContextMenuProps) => {
  const { 
    celestialObjects, 
    getObjectById, 
    selectObject, 
    selectedObjectId,
    updateObjectSettings,
    setObjectType,
    getObjectTypeById,
    deleteObject
  } = useStarMap();

  const menuRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState<string | null>(null);
  
  // Get the clicked object
  const targetObject = objectId ? getObjectById(objectId) : null;

  // Find the root object (star) by traversing up the parent hierarchy
  const findRootObject = (objId: string | null) => {
    if (!objId) return null;
    
    let currentObj = getObjectById(objId);
    if (!currentObj) return null;
    
    // Keep going up the parent chain until we find an object without a parent (a star/sun)
    while (currentObj && 'parentId' in currentObj && currentObj.parentId) {
      const parent = getObjectById(currentObj.parentId);
      if (!parent) break;
      currentObj = parent;
    }
    
    return currentObj;
  };
  
  const rootObject = findRootObject(objectId);

  // If we don't have a valid root object to display, close the menu
  useEffect(() => {
    if (!rootObject) {
      onClose();
    }
  }, [rootObject, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Close the context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to ensure we intercept events before they reach the map
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [onClose]);

  // When component mounts, auto-expand all parent objects along the path to the selected object
  useEffect(() => {
    if (targetObject) {
      const newExpanded: ExpandedState = {};
      
      // If target is a moon or satellite, expand its planet
      if (targetObject.parentId) {
        newExpanded[targetObject.parentId] = true;
        
        // Also try to get planet's parent (star) and expand it
        const planet = getObjectById(targetObject.parentId);
        if (planet && planet.parentId) {
          newExpanded[planet.parentId] = true;
        }
      }
      
      setExpanded(newExpanded);
    }
  }, [targetObject, getObjectById]);

  // Handle click on a menu item
  const handleObjectClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectObject(id);
  };

  // Toggle expanded state for a parent item
  const toggleExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find all planets for the star
  const getPlanets = (starId: string) => {
    return celestialObjects.filter(obj => obj.parentId === starId && obj.type === 'planet');
  };

  // Get moons for a planet
  const getMoons = (planetId: string) => {
    return celestialObjects.filter(obj => obj.parentId === planetId && obj.type === 'moon');
  };

  // Get satellites/stations for a planet
  const getSatellitesAndStations = (planetId: string) => {
    return celestialObjects.filter(obj => 
      obj.parentId === planetId && (obj.type === 'satellite' || obj.type === 'station')
    );
  };

  // Update color for selected object
  const handleColorChange = (color: string) => {
    if (selectedObjectId) {
      updateObjectSettings(selectedObjectId, { color });
    }
  };

  // Toggle show name for selected object
  const handleShowNameToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObjectId) {
      updateObjectSettings(selectedObjectId, { showName: e.target.checked });
    }
  };

  // Set object type
  const handleSetObjectType = (typeId: string | undefined) => {
    if (selectedObjectId) {
      setObjectType(selectedObjectId, typeId);
    }
  };

  // Handle delete object button
  const handleDeleteClick = (objId: string) => {
    setObjectToDelete(objId);
    setShowDeleteConfirmation(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (objectToDelete) {
      deleteObject(objectToDelete);
      setShowDeleteConfirmation(false);
      setObjectToDelete(null);
      onClose(); // Close the context menu after deletion
    }
  };

  // Dynamically adjust position to keep menu in view
  const adjustPosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 350; // Approximate menu width
    const menuHeight = Math.min(500, windowHeight - 40); // Maximum menu height with 20px padding on top and bottom

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 10;
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 10;
    }

    return { x: adjustedX, y: adjustedY, maxHeight: menuHeight };
  };

  const position = adjustPosition();

  const renderIcon = (type: string) => {
    switch (type) {
      case 'star':
      case 'sun':
        return <Star className="text-blue-400" size={16} />;
      case 'planet':
        return <Globe className="text-blue-300" size={16} />;
      case 'moon':
        return <Moon className="text-gray-300" size={16} />;
      case 'satellite':
        return <Satellite className="text-gray-300" size={16} />;
      case 'station':
        return <Settings className="text-gray-300" size={16} />;
      default:
        return null;
    }
  };

  const getObjectName = (objId: string) => {
    const obj = getObjectById(objId);
    return obj ? obj.name : "Unknown Object";
  };

  if (!rootObject) return null;

  return (
    <>
      {/* Semi-transparent overlay to prevent map interactions */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div 
        ref={menuRef}
        className="fixed z-50 bg-space-black border border-gray-700 rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          width: '350px',
          maxHeight: `${position.maxHeight}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="p-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-electric-blue flex items-center gap-2">
            {renderIcon(rootObject.type)}
            {rootObject.name} System
          </h3>
        </div>

        <div className="flex flex-col overflow-hidden h-full">
          {/* Object tree - now with scrolling */}
          <div className="p-3 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <div className="text-sm text-gray-400 mb-2">Celestial Objects:</div>
            
            {/* Root star object */}
            <div 
              className={`flex items-center p-1.5 rounded ${selectedObjectId === rootObject.id ? 'bg-gray-800' : 'hover:bg-gray-800'} cursor-pointer`}
              onClick={(e) => handleObjectClick(rootObject.id, e)}
            >
              {renderIcon(rootObject.type)}
              <span className="ml-2 text-sm">{rootObject.name}</span>
              {rootObject.objectTypeId && (
                <span className="ml-auto text-xs text-electric-blue">
                  {getObjectTypeById(rootObject.objectTypeId)?.name}
                </span>
              )}
            </div>

            {/* Planets list */}
            {rootObject.type === 'star' || rootObject.type === 'sun' ? (
              <div className="ml-4 mt-1 border-l border-gray-800 pl-2">
                {getPlanets(rootObject.id).map(planet => (
                  <div key={planet.id} className="mb-2">
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => toggleExpanded(planet.id, e)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {expanded[planet.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <div 
                        className={`flex items-center flex-grow p-1 rounded ${selectedObjectId === planet.id ? 'bg-gray-800' : 'hover:bg-gray-800'} cursor-pointer`}
                        onClick={(e) => handleObjectClick(planet.id, e)}
                      >
                        {renderIcon('planet')}
                        <span className="ml-2 text-sm">{planet.name}</span>
                        {planet.objectTypeId && (
                          <span className="ml-auto text-xs text-electric-blue">
                            {getObjectTypeById(planet.objectTypeId)?.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Moons for this planet */}
                    {expanded[planet.id] && (
                      <div className="ml-6 mt-1 border-l border-gray-800 pl-2">
                        {getMoons(planet.id).map(moon => (
                          <div 
                            key={moon.id}
                            className={`flex items-center p-1 rounded ${selectedObjectId === moon.id ? 'bg-gray-800' : 'hover:bg-gray-800'} cursor-pointer`}
                            onClick={(e) => handleObjectClick(moon.id, e)}
                          >
                            {renderIcon('moon')}
                            <span className="ml-2 text-sm">{moon.name}</span>
                            {moon.objectTypeId && (
                              <span className="ml-auto text-xs text-electric-blue">
                                {getObjectTypeById(moon.objectTypeId)?.name}
                              </span>
                            )}
                          </div>
                        ))}
                        
                        {/* Satellites and stations for this planet */}
                        {getSatellitesAndStations(planet.id).map(obj => (
                          <div 
                            key={obj.id}
                            className={`flex items-center p-1 rounded ${selectedObjectId === obj.id ? 'bg-gray-800' : 'hover:bg-gray-800'} cursor-pointer`}
                            onClick={(e) => handleObjectClick(obj.id, e)}
                          >
                            {renderIcon(obj.type)}
                            <span className="ml-2 text-sm">{obj.name}</span>
                            {obj.objectTypeId && (
                              <span className="ml-auto text-xs text-electric-blue">
                                {getObjectTypeById(obj.objectTypeId)?.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 flex-shrink-0"></div>

          {/* Selected object settings - now with scrolling */}
          {selectedObjectId && (
            <div className="p-3 bg-gray-900 bg-opacity-50 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-electric-blue">Selected Object</h4>
                <div className="text-xs text-gray-400">
                  {getObjectById(selectedObjectId)?.type}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {renderIcon(getObjectById(selectedObjectId)?.type || '')}
                <input 
                  type="text" 
                  value={getObjectById(selectedObjectId)?.name || ''}
                  onChange={(e) => updateObjectSettings(selectedObjectId, { name: e.target.value })}
                  className="flex-grow bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Type selector */}
              <div className="mb-3">
                <TypeSelector 
                  objectType={getObjectById(selectedObjectId)?.type as any}
                  selectedTypeId={getObjectById(selectedObjectId)?.objectTypeId}
                  onSelect={handleSetObjectType}
                />
              </div>

              {/* Color picker */}
              <div className="mb-3">
                <label className="text-sm text-gray-400 block mb-1">Color</label>
                <ColorPicker 
                  color={getObjectById(selectedObjectId)?.color || ''}
                  onChange={handleColorChange}
                />
              </div>

              {/* Show Name on Map toggle */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={getObjectById(selectedObjectId)?.showName || false}
                    onChange={handleShowNameToggle}
                    className="form-checkbox h-4 w-4 text-electric-blue bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-gray-300">Show Name on Map</span>
                </label>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteClick(selectedObjectId)}
                className="mt-3 w-full py-1.5 flex items-center justify-center gap-2 bg-gray-800 hover:bg-crimson-red rounded border border-gray-700 text-sm text-white transition-colors"
              >
                Delete {getObjectById(selectedObjectId)?.name}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Object"
        message={`Are you sure you want to delete "${objectToDelete ? getObjectName(objectToDelete) : 'this object'}"? This action cannot be undone and will also delete any orbiting objects.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
};

export default ContextMenu;
