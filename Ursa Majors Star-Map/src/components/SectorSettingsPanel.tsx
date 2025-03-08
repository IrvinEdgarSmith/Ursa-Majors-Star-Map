import { ChangeEvent } from 'react';
import { Map, Trash2 } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import ColorPicker from './ColorPicker';

const SectorSettingsPanel = () => {
  const { 
    selectedSectorId, 
    getSectorById, 
    updateSector,
    deleteSector 
  } = useStarMap();

  if (!selectedSectorId) return null;
  
  const sector = getSectorById(selectedSectorId);
  if (!sector) return null;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSector(selectedSectorId, { name: e.target.value });
  };

  const handleShowNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSector(selectedSectorId, { showName: e.target.checked });
  };

  const handlePrimaryColorChange = (color: string) => {
    updateSector(selectedSectorId, { color });
  };

  const handleSecondaryColorChange = (color: string) => {
    updateSector(selectedSectorId, { color2: color });
  };

  const handleDelete = () => {
    deleteSector(selectedSectorId);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
        <Map className="text-blue-300" size={20} />
        <h3 className="text-lg font-semibold">
          Sector Settings
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Name setting */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Name</label>
          <input
            type="text"
            value={sector.name}
            onChange={handleNameChange}
            className="w-full bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
          />
        </div>
        
        {/* Primary Color */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Primary Color</label>
          <ColorPicker
            color={sector.color}
            onChange={handlePrimaryColorChange}
          />
        </div>
        
        {/* Secondary Color */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Secondary Color (Gradient)</label>
          <ColorPicker
            color={sector.color2 || sector.color}
            onChange={handleSecondaryColorChange}
          />
        </div>
        
        {/* Show Name on Map toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={sector.showName || false}
              onChange={handleShowNameChange}
              className="form-checkbox h-4 w-4 text-electric-blue bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300">Show Name on Map</span>
          </label>
        </div>
        
        {/* Preview of the gradient */}
        <div className="pt-2">
          <label className="text-sm text-gray-400 block mb-1">Gradient Preview</label>
          <div 
            className="h-12 w-full rounded border border-gray-700"
            style={{
              background: `linear-gradient(to right, ${sector.color}, ${sector.color2 || sector.color})`,
            }}
          />
        </div>
        
        {/* Delete button */}
        <button
          className="w-full mt-4 py-2 px-3 flex items-center justify-center gap-2 bg-gray-800 hover:bg-crimson-red text-white rounded border border-gray-700 transition-colors"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          <span>Delete Sector</span>
        </button>
      </div>
    </div>
  );
};

export default SectorSettingsPanel;
