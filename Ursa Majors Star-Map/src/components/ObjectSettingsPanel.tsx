import { ChangeEvent, useState } from 'react';
import { Globe, Moon, Satellite, Settings, Star, Sun, Trash2 } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import { CelestialObject } from '../contexts/StarMapContext';
import ConfirmationDialog from './ConfirmationDialog';

interface ObjectSettingsPanelProps {
  object: CelestialObject;
}

const ObjectSettingsPanel = ({ object }: ObjectSettingsPanelProps) => {
  const { updateObjectSettings, deleteObject, getObjectById } = useStarMap();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateObjectSettings(object.id, { name: e.target.value });
  };

  const handleSizeChange = (value: number) => {
    if ('size' in object) {
      // Apply min/max constraints based on object type
      let constrainedValue = value;
      const minSize = getMinSize();
      if (constrainedValue < minSize) constrainedValue = minSize;
      
      updateObjectSettings(object.id, { size: constrainedValue });
    }
  };

  const handleSizeXChange = (value: number) => {
    if (object.type === 'astralBody') {
      updateObjectSettings(object.id, { sizeX: value });
    }
  };

  const handleSizeYChange = (value: number) => {
    if (object.type === 'astralBody') {
      updateObjectSettings(object.id, { sizeY: value });
    }
  };

  const handleOrbitDistanceChange = (value: number) => {
    if ('orbitDistance' in object) {
      updateObjectSettings(object.id, { orbitDistance: value });
    }
  };

  const handleTransparentToggle = (e: ChangeEvent<HTMLInputElement>) => {
    if (object.type === 'astralBody') {
      updateObjectSettings(object.id, { transparent: e.target.checked });
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteObject(object.id);
    setShowDeleteConfirmation(false);
  };

  // Get min size based on object type
  const getMinSize = () => {
    switch (object.type) {
      case 'planet':
        return 30; // Updated minimum planet size
      case 'moon':
      case 'satellite':
      case 'station':
        return 5;
      case 'sun':
      case 'star':
        return 50;
      default:
        return 5;
    }
  };

  // Get max size based on object type
  const getMaxSize = () => {
    switch (object.type) {
      case 'sun':
      case 'star':
        return 3000;
      case 'planet':
      case 'moon':
      case 'satellite':
      case 'station':
        return 1000;
      case 'astralBody':
        return 1000;
      default:
        return 100;
    }
  };

  // Get max orbit distance based on parent type
  const getMaxOrbitDistance = () => {
    if (!('parentId' in object) || !object.parentId) return 4000;
    
    const parent = object.parentId ? getObjectById(object.parentId) : null;
    if (!parent) return 4000;
    
    // If parent is a star, max orbit is 4000, otherwise 1500
    return parent.type === 'star' ? 4000 : 1500;
  };

  const renderIcon = () => {
    switch (object.type) {
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

  const getObjectTypeName = () => {
    switch (object.type) {
      case 'sun': return 'Sun';
      case 'star': return 'Star';
      case 'astralBody': return 'Astral Body';
      case 'planet': return 'Planet';
      case 'moon': return 'Moon';
      case 'satellite': return 'Satellite';
      case 'station': return 'Station';
    }
  };

  const maxSize = getMaxSize();
  const minSize = getMinSize();
  const maxOrbitDistance = getMaxOrbitDistance();

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
        {renderIcon()}
        <h3 className="text-lg font-semibold">
          {getObjectTypeName()} Settings
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Name setting */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Name</label>
          <input
            type="text"
            value={object.name}
            onChange={handleNameChange}
            className="w-full bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
          />
        </div>
        
        {/* Size settings */}
        {'size' in object && (
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minSize}
                max={maxSize}
                value={object.size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="flex-grow"
              />
              <input
                type="number"
                min={minSize}
                max={maxSize}
                value={object.size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
              />
            </div>
          </div>
        )}
        
        {/* Astral Body specific settings */}
        {object.type === 'astralBody' && (
          <>
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Size X</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max={maxSize}
                  value={object.sizeX}
                  onChange={(e) => handleSizeXChange(Number(e.target.value))}
                  className="flex-grow"
                />
                <input
                  type="number"
                  min="10"
                  max={maxSize}
                  value={object.sizeX}
                  onChange={(e) => handleSizeXChange(Number(e.target.value))}
                  className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Size Y</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max={maxSize}
                  value={object.sizeY}
                  onChange={(e) => handleSizeYChange(Number(e.target.value))}
                  className="flex-grow"
                />
                <input
                  type="number"
                  min="10"
                  max={maxSize}
                  value={object.sizeY}
                  onChange={(e) => handleSizeYChange(Number(e.target.value))}
                  className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
                />
              </div>
            </div>

            {/* Transparent toggle for astral bodies */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!object.transparent}
                  onChange={handleTransparentToggle}
                  className="form-checkbox h-4 w-4 text-electric-blue bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">Transparent (Border Only)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Show only the border with transparent interior
              </p>
            </div>
          </>
        )}
        
        {/* Orbit Distance for orbital objects */}
        {'orbitDistance' in object && object.orbitDistance !== undefined && (
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Orbit Distance</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="20"
                max={maxOrbitDistance}
                value={object.orbitDistance}
                onChange={(e) => handleOrbitDistanceChange(Number(e.target.value))}
                className="flex-grow"
              />
              <input
                type="number"
                min="20"
                max={maxOrbitDistance}
                value={object.orbitDistance}
                onChange={(e) => handleOrbitDistanceChange(Number(e.target.value))}
                className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
              />
            </div>
          </div>
        )}
        
        <button
          className="w-full mt-4 py-2 px-3 flex items-center justify-center gap-2 bg-gray-800 hover:bg-crimson-red text-white rounded border border-gray-700 transition-colors"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title={`Delete ${getObjectTypeName()}`}
        message={`Are you sure you want to delete "${object.name}"? This action cannot be undone and will also delete all associated orbiting objects.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default ObjectSettingsPanel;
