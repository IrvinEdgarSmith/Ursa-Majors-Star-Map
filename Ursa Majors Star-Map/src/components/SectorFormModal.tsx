import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { useStarMap } from '../contexts/StarMapContext';

interface SectorFormModalProps {
  onSubmit: (name: string, color: string, color2: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
  sectorId?: string;
}

const SectorFormModal = ({ onSubmit, onCancel, isEditing = false, sectorId }: SectorFormModalProps) => {
  const { getSectorById } = useStarMap();
  const [name, setName] = useState('New Sector');
  const [primaryColor, setPrimaryColor] = useState('#4287f5');
  const [secondaryColor, setSecondaryColor] = useState('#42f5e3');

  // Load sector data if editing existing sector
  useEffect(() => {
    if (isEditing && sectorId) {
      const sector = getSectorById(sectorId);
      if (sector) {
        setName(sector.name);
        setPrimaryColor(sector.color);
        setSecondaryColor(sector.color2 || sector.color);
      }
    }
  }, [isEditing, sectorId, getSectorById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, primaryColor, secondaryColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="bg-space-black border border-gray-700 rounded-lg shadow-xl p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-electric-blue">
            {isEditing ? 'Edit Sector' : 'Create Sector'}
          </h3>
          <button 
            onClick={onCancel} 
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="sector-name" className="block text-sm font-medium text-gray-300 mb-1">
                Sector Name
              </label>
              <input
                id="sector-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Primary Color
              </label>
              <ColorPicker color={primaryColor} onChange={setPrimaryColor} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Secondary Color (Gradient)
              </label>
              <ColorPicker color={secondaryColor} onChange={setSecondaryColor} />
            </div>
            
            {/* Preview of the gradient */}
            <div className="mt-4 mb-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Gradient Preview
              </label>
              <div 
                className="h-12 w-full rounded border border-gray-700"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                }}
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-electric-blue hover:bg-blue-600 text-white rounded"
              >
                {isEditing ? 'Save Changes' : 'Create Sector'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectorFormModal;
