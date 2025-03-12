import { useState, useRef } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';

interface AssetGalleryProps {
  onSelectAsset: (assetId: string) => void;
  onUploadClick: () => void;
  selectedAssetId?: string;
}

const AssetGallery = ({ onSelectAsset, onUploadClick, selectedAssetId }: AssetGalleryProps) => {
  const { assets = [], getAssetById } = useStarMap();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter assets based on search term
  const filteredAssets = searchTerm
    ? assets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : assets;

  // Handle asset selection
  const handleAssetClick = (assetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up
    onSelectAsset(assetId);
  };

  // Clear selection
  const handleClearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectAsset('');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-theme-primary flex items-center gap-2">
          <Image size={18} />
          <span>Asset Gallery</span>
        </h3>
        
        {selectedAssetId && (
          <button 
            onClick={handleClearSelection}
            className="text-xs flex items-center gap-1 text-theme-muted hover:text-theme-text px-2 py-1 rounded hover:bg-gray-800"
          >
            <X size={14} />
            <span>Clear Selection</span>
          </button>
        )}
      </div>
      
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          onClick={(e) => e.stopPropagation()}
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm('');
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Assets grid */}
      <div className="asset-grid">
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`group aspect-square border rounded-md p-1 cursor-pointer transition-colors relative 
                  ${selectedAssetId === asset.id 
                    ? 'border-theme-primary bg-theme-primary bg-opacity-20' 
                    : 'border-gray-700 hover:border-gray-500 bg-gray-900 bg-opacity-50'}`}
                onClick={(e) => handleAssetClick(asset.id, e)}
              >
                <div className="w-full h-full flex items-center justify-center rounded overflow-hidden bg-gray-900">
                  <img 
                    src={asset.dataUrl} 
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain"
                    draggable={false}
                  />
                </div>
                
                {selectedAssetId === asset.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-theme-primary rounded-full flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 bg-gray-900 bg-opacity-50 rounded-md border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">No assets available</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onUploadClick();
              }}
              className="flex items-center gap-1 text-theme-primary hover:text-theme-secondary text-sm"
            >
              <Upload size={14} />
              <span>Upload your first asset</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Upload button */}
      {assets.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUploadClick();
          }}
          className="w-full py-2 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-sm"
        >
          <Upload size={14} />
          <span>Upload New Asset</span>
        </button>
      )}
      
      {/* Selected asset info */}
      {selectedAssetId && (
        <div className="mt-2 p-2 border border-gray-700 rounded-md bg-gray-900 bg-opacity-50">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
              <img 
                src={getAssetById(selectedAssetId)?.dataUrl} 
                alt="Selected asset"
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-theme-primary font-medium truncate">
                {getAssetById(selectedAssetId)?.name}
              </p>
              <p className="text-xs text-theme-muted">
                Click on map to place this asset
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetGallery;
