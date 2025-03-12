import { useState } from 'react';
import { Image, Trash2 } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import ConfirmationDialog from './ConfirmationDialog';

interface AssetSettingsPanelProps {
  assetId: string;
}

const AssetSettingsPanel = ({ assetId }: AssetSettingsPanelProps) => {
  const { getMapAssetById, getAssetById, updateAssetSize, deleteMapAsset } = useStarMap();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const mapAsset = getMapAssetById(assetId);
  if (!mapAsset) return null;
  
  const assetData = getAssetById(mapAsset.assetId);
  if (!assetData) return null;

  const handleWidthChange = (value: number) => {
    // Calculate height to maintain aspect ratio
    const aspectRatio = mapAsset.height / mapAsset.width;
    const newHeight = value * aspectRatio;
    updateAssetSize(assetId, value, newHeight, mapAsset.x, mapAsset.y);
  };

  const handleHeightChange = (value: number) => {
    // Calculate width to maintain aspect ratio
    const aspectRatio = mapAsset.width / mapAsset.height;
    const newWidth = value * aspectRatio;
    updateAssetSize(assetId, newWidth, value, mapAsset.x, mapAsset.y);
  };

  const handleResetSize = () => {
    // Reset to default size (200px width)
    const aspectRatio = mapAsset.height / mapAsset.width;
    const newWidth = 200;
    const newHeight = newWidth * aspectRatio;
    updateAssetSize(assetId, newWidth, newHeight, mapAsset.x, mapAsset.y);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteMapAsset(assetId);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
        <Image className="text-green-300" size={20} />
        <h3 className="text-lg font-semibold">
          Image Asset Settings
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Image preview */}
        <div className="border border-gray-700 rounded p-2 bg-gray-900 bg-opacity-50">
          <div className="aspect-square w-full overflow-hidden flex items-center justify-center">
            <img 
              src={assetData.dataUrl} 
              alt={assetData.name}
              className="object-contain max-h-full max-w-full"
            />
          </div>
          <div className="mt-2 text-sm text-gray-300 text-center truncate" title={assetData.name}>
            {assetData.name}
          </div>
        </div>
        
        {/* Size settings */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Width</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="1000"
              value={Math.round(mapAsset.width)}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="flex-grow"
            />
            <input
              type="number"
              min="50"
              max="1000"
              value={Math.round(mapAsset.width)}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Height</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="1000"
              value={Math.round(mapAsset.height)}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="flex-grow"
            />
            <input
              type="number"
              min="50"
              max="1000"
              value={Math.round(mapAsset.height)}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-16 bg-dark-space border border-gray-700 rounded px-2 py-1 text-electric-blue"
            />
          </div>
        </div>
        
        <button
          onClick={handleResetSize}
          className="w-full py-1.5 bg-dark-space hover:bg-gray-800 text-white rounded border border-gray-700 text-sm"
        >
          Reset Size
        </button>
        
        <button
          onClick={handleDelete}
          className="w-full mt-4 py-2 px-3 flex items-center justify-center gap-2 bg-gray-800 hover:bg-crimson-red text-white rounded border border-gray-700 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Image Asset"
        message={`Are you sure you want to delete this image asset from the map? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default AssetSettingsPanel;
