import { useState, useEffect } from 'react';
import { Image, Plus } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import AssetGallery from './AssetGallery';
import AssetMenu from './AssetMenu';

const AssetPanel = () => {
  const { initializeAssetPlacement, placingAssetId, isPlacingAsset } = useStarMap();
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  
  // Handle asset selection
  const handleSelectAsset = (assetId: string) => {
    if (assetId) {
      initializeAssetPlacement(assetId);
    } else {
      // Clear asset selection and reset cursor
      document.body.style.cursor = 'default';
      initializeAssetPlacement('');
    }
  };
  
  const handleOpenAssetMenu = () => {
    setShowAssetMenu(true);
  };
  
  const handleCloseAssetMenu = () => {
    setShowAssetMenu(false);
  };
  
  const handleSelectAssetFromMenu = (assetId: string) => {
    initializeAssetPlacement(assetId);
    setShowAssetMenu(false);
  };

  // Set the cursor when an asset is selected for placement
  useEffect(() => {
    if (isPlacingAsset && placingAssetId) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'default';
    }

    // Clean up the cursor when component unmounts
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isPlacingAsset, placingAssetId]);
  
  return (
    <div className="space-y-4 mb-5">
      <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
        <Image size={18} />
        <span>Image Assets</span>
      </h2>
      
      <AssetGallery 
        onSelectAsset={handleSelectAsset}
        onUploadClick={handleOpenAssetMenu}
        selectedAssetId={placingAssetId || undefined}
      />
      
      <div className="text-xs text-gray-400 italic">
        {isPlacingAsset && placingAssetId ? (
          <span className="text-theme-primary font-medium">
            Asset selected! Click on the map to place it.
          </span>
        ) : (
          <>
            Select an asset above, then click on the map to place it.
            <br />
            You can resize and move assets after placing them.
          </>
        )}
      </div>
      
      {/* Asset Menu Modal */}
      {showAssetMenu && (
        <AssetMenu 
          onClose={handleCloseAssetMenu}
          onSelectAsset={handleSelectAssetFromMenu}
        />
      )}
    </div>
  );
};

export default AssetPanel;
