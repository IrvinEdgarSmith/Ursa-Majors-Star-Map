import { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe, Map, Moon, Plus, Satellite, Settings, Star, Sun, Trash2 } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import MetadataSection from './MetadataSection';
import SectorMetadataSection from './SectorMetadataSection';
import TypeSelector from './TypeSelector';

const RightSidebar = () => {
  const { 
    selectedObjectId, 
    selectedSectorId,
    celestialObjects, 
    getObjectById, 
    updateObjectSettings,
    addMetadataSection,
    selectObject,
    getObjectTypeById,
    setObjectType,
    getSectorById,
    updateSector,
    addSectorMetadataSection
  } = useStarMap();
  
  const [collapsed, setCollapsed] = useState(false);
  
  const selectedObject = selectedObjectId ? getObjectById(selectedObjectId) : undefined;
  const selectedSector = selectedSectorId ? getSectorById(selectedSectorId) : undefined;
  
  const renderIcon = () => {
    if (!selectedObject) return null;
    
    switch (selectedObject.type) {
      case 'sun':
        return <Sun className="text-yellow-400" size={20} />;
      case 'star':
        return <Star className="text-blue-400" size={20} />;
      case 'astralBody':
        return <Globe className="text-gray-400" size={20} />;
      case 'planet':
        return <Globe className="text-blue-300" size={20} />;
      case 'moon':
        return <Moon className="text-gray-300" size={20} />;
      case 'satellite':
        return <Satellite className="text-gray-300" size={20} />;
      case 'station':
        return <Settings className="text-gray-300" size={20} />;
    }
  };

  const renderObjectType = () => {
    if (!selectedObject) return null;
    
    switch (selectedObject.type) {
      case 'sun': return 'Sun';
      case 'star': return 'Star';
      case 'astralBody': return 'Astral Body';
      case 'planet': return 'Planet';
      case 'moon': return 'Moon';
      case 'satellite': return 'Satellite';
      case 'station': return 'Station';
    }
  };

  const getParentInfo = () => {
    if (!selectedObject || !('parentId' in selectedObject) || !selectedObject.parentId) return null;
    
    const parent = getObjectById(selectedObject.parentId);
    if (!parent) return null;
    
    return {
      name: parent.name,
      type: parent.type
    };
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObject) {
      updateObjectSettings(selectedObject.id, { name: e.target.value });
    } else if (selectedSector) {
      updateSector(selectedSector.id, { name: e.target.value });
    }
  };

  const handleAddMetadataSection = () => {
    if (selectedObject) {
      addMetadataSection(selectedObject.id);
    } else if (selectedSector) {
      addSectorMetadataSection(selectedSector.id);
    }
  };

  const handleSelectOrbitalObject = (objectId: string) => {
    selectObject(objectId);
  };

  const handleSetObjectType = (typeId: string | undefined) => {
    if (selectedObject) {
      setObjectType(selectedObject.id, typeId);
    }
  };

  // Handle inhabited checkbox change for planets, moons, and stations
  const handleInhabitedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObject && (selectedObject.type === 'planet' || selectedObject.type === 'moon' || selectedObject.type === 'station')) {
      updateObjectSettings(selectedObject.id, { inhabited: e.target.checked });
    }
  };

  const parentInfo = getParentInfo();
  const objectType = selectedObject?.objectTypeId 
    ? getObjectTypeById(selectedObject.objectTypeId) 
    : undefined;

  return (
    <div className={`
      relative h-full bg-space-black border-l border-gray-800 
      transition-all duration-300 ease-in-out overflow-y-auto
      ${collapsed ? 'w-12' : 'w-80'}
    `}>
      {/* Collapse toggle button */}
      <button 
        className="absolute -left-3 top-16 z-10 p-1 rounded-full bg-gray-800 border border-gray-700 text-electric-blue"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      
      <div className={`p-4 flex flex-col h-full ${collapsed ? 'items-center' : ''}`}>
        <h2 className={`text-xl font-bold mb-4 text-electric-blue ${collapsed ? 'hidden' : ''}`}>Object Details</h2>
        
        {!collapsed && selectedObject ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              {renderIcon()}
              <h3 className="text-lg font-semibold">{renderObjectType()}</h3>
            </div>
            
            {/* Name field - now directly editable */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Name</label>
              <input
                type="text"
                value={selectedObject.name}
                onChange={handleNameChange}
                className="w-full bg-dark-space border border-gray-700 rounded px-3 py-2 text-electric-blue"
              />
            </div>
            
            {/* Object Type Selection */}
            <div className="space-y-2">
              <TypeSelector 
                objectType={selectedObject.type}
                selectedTypeId={selectedObject.objectTypeId}
                onSelect={handleSetObjectType}
              />
            </div>

            {/* Inhabited checkbox for planets, moons, and stations */}
            {(selectedObject.type === 'planet' || selectedObject.type === 'moon' || selectedObject.type === 'station') && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!(selectedObject as any).inhabited} 
                    onChange={handleInhabitedChange}
                    className="form-checkbox h-4 w-4 text-electric-blue bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Inhabited</span>
                </label>
              </div>
            )}
            
            {/* Basic info section */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono">{selectedObject.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="font-mono">
                  X: {Math.round(selectedObject.x)}, Y: {Math.round(selectedObject.y)}
                </span>
              </div>
              
              {(selectedObject.type === 'sun' || selectedObject.type === 'star' || 
               selectedObject.type === 'planet' || selectedObject.type === 'moon' || 
               selectedObject.type === 'satellite' || selectedObject.type === 'station') && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span>{(selectedObject as any).size} units</span>
                </div>
              )}
              
              {selectedObject.type === 'astralBody' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size X:</span>
                    <span>{selectedObject.sizeX} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size Y:</span>
                    <span>{selectedObject.sizeY} units</span>
                  </div>
                </>
              )}
              
              {parentInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Orbiting:</span>
                  <span>{parentInfo.name} ({parentInfo.type})</span>
                </div>
              )}
              
              {'orbitDistance' in selectedObject && selectedObject.orbitDistance !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Orbit Distance:</span>
                  <span>{selectedObject.orbitDistance} units</span>
                </div>
              )}
            </div>
            
            {/* Metadata sections */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-gray-300">Notes & Metadata</h4>
                <button 
                  onClick={handleAddMetadataSection}
                  className="p-1 rounded bg-dark-space hover:bg-gray-800 text-electric-blue"
                  title="Add Section"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {selectedObject.metadata.length > 0 ? (
                <div className="space-y-4">
                  {selectedObject.metadata.map(section => (
                    <MetadataSection 
                      key={section.id}
                      objectId={selectedObject.id}
                      section={section}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-sm py-4 text-center">
                  No metadata sections yet.
                  <br />
                  Click + to add one.
                </div>
              )}
            </div>
            
            {/* Children count section */}
            {(selectedObject.type === 'star' || selectedObject.type === 'planet') && (
              <div className="mt-6 pt-4 border-t border-gray-800">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Orbital Objects:</h4>
                <div className="space-y-1 text-sm">
                  {celestialObjects.filter(obj => obj.parentId === selectedObject.id).length > 0 ? (
                    celestialObjects
                      .filter(obj => obj.parentId === selectedObject.id)
                      .map(child => (
                        <div 
                          key={child.id} 
                          className="flex justify-between items-center px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer group transition-colors"
                          onClick={() => handleSelectOrbitalObject(child.id)}
                        >
                          <div className="flex items-center gap-1">
                            {child.type === 'planet' && <Globe size={14} className="text-blue-300 group-hover:text-blue-400" />}
                            {child.type === 'moon' && <Moon size={14} className="text-gray-300 group-hover:text-gray-200" />}
                            {child.type === 'satellite' && <Satellite size={14} className="text-gray-300 group-hover:text-gray-200" />}
                            {child.type === 'station' && <Settings size={14} className="text-gray-300 group-hover:text-gray-200" />}
                            <span className="group-hover:text-electric-blue transition-colors">{child.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {child.objectTypeId && (
                              <span className="text-xs text-electric-blue">
                                {getObjectTypeById(child.objectTypeId)?.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors ml-1">
                              {child.type}
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-500 italic">No orbital objects</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : !collapsed && selectedSector ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Map size={20} className="text-blue-300" />
              <h3 className="text-lg font-semibold">Sector</h3>
            </div>
            
            {/* Name field */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Name</label>
              <input
                type="text"
                value={selectedSector.name}
                onChange={handleNameChange}
                className="w-full bg-dark-space border border-gray-700 rounded px-3 py-2 text-electric-blue"
              />
            </div>
            
            {/* Basic info section */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono">{selectedSector.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Points:</span>
                <span>{selectedSector.points.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Primary Color:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedSector.color }}
                  ></div>
                  <span className="font-mono">{selectedSector.color}</span>
                </div>
              </div>
              {selectedSector.color2 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Secondary Color:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: selectedSector.color2 }}
                    ></div>
                    <span className="font-mono">{selectedSector.color2}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Metadata sections */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-gray-300">Notes & Metadata</h4>
                <button 
                  onClick={handleAddMetadataSection}
                  className="p-1 rounded bg-dark-space hover:bg-gray-800 text-electric-blue"
                  title="Add Section"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {selectedSector.metadata && selectedSector.metadata.length > 0 ? (
                <div className="space-y-4">
                  {selectedSector.metadata.map(section => (
                    <SectorMetadataSection 
                      key={section.id}
                      sectorId={selectedSector.id}
                      section={section}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-sm py-4 text-center">
                  No metadata sections yet.
                  <br />
                  Click + to add one.
                </div>
              )}
            </div>
          </div>
        ) : collapsed ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            {selectedObject && renderIcon()}
            {selectedSector && <Map size={20} className="text-blue-300" />}
          </div>
        ) : (
          <div className="text-gray-500 italic text-center mt-10">
            Select an object or sector to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
