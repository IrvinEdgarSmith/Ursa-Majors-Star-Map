import { useState, useRef, useEffect } from 'react';
import { Image, Squircle, Trash2, Upload, X } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import ConfirmationDialog from './ConfirmationDialog';

interface AssetMenuProps {
  onClose: () => void;
  onSelectAsset: (assetId: string) => void;
}

const AssetMenu = ({ onClose, onSelectAsset }: AssetMenuProps) => {
  const { assets = [], uploadAsset, deleteAsset } = useStarMap();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.asset-menu-content') === null) {
        onClose();
      }
    };

    // Use mousedown to catch the click before it propagates
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Reset previous errors
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/png')) {
      setUploadError('Only PNG images are supported');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Create a new asset with the data URL
        uploadAsset(file.name, result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectAsset = (assetId: string) => {
    onSelectAsset(assetId);
  };

  const handleDeleteClick = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssetToDelete(assetId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete);
      setShowDeleteConfirmation(false);
      setAssetToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="modal-gradient p-0 w-[700px] max-w-[90vw] max-h-[80vh] asset-menu-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-theme" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xl font-bold text-theme-primary flex items-center gap-2">
            <Image size={20} /> Image Asset Library
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-theme-background-alt rounded text-theme-muted hover:text-theme-text"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
          {/* Upload Section */}
          <div 
            className={`
              mb-5 border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${isDragging 
                ? 'border-theme-primary bg-theme-primary bg-opacity-10' 
                : 'border-gray-700 hover:border-gray-500'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <h4 className="mt-2 text-theme-text font-medium">Drag and drop your image here</h4>
            <p className="mt-1 text-sm text-gray-400">PNG files only, max 5MB</p>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png"
              onChange={handleFileInputChange}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 btn-primary"
            >
              Select File
            </button>
            
            {uploadError && (
              <div className="mt-3 text-red-400 text-sm flex items-center justify-center gap-1">
                <Squircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
          
          {/* Asset Library */}
          <h4 className="text-lg font-semibold mb-3 text-theme-primary">Your Assets</h4>
          
          {!assets || assets.length === 0 ? (
            <div className="text-center py-8 text-theme-muted italic">
              No assets yet. Upload your first image above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto p-1">
              {assets.map(asset => (
                <div 
                  key={asset.id} 
                  className="group relative border border-gray-700 rounded-lg p-2 cursor-pointer hover:border-theme-primary bg-gray-800 bg-opacity-30 transition-colors"
                  onClick={() => handleSelectAsset(asset.id)}
                >
                  <div className="relative aspect-square overflow-hidden rounded bg-gray-900 flex items-center justify-center">
                    <img 
                      src={asset.dataUrl} 
                      alt={asset.name}
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-300 truncate max-w-[80%]" title={asset.name}>
                      {asset.name}
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(asset.id, e)}
                      className="p-1 opacity-0 group-hover:opacity-100 rounded hover:bg-red-800 text-gray-400 hover:text-white transition-opacity"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Instructions */}
          <div className="mt-5 text-sm text-theme-muted">
            <p>Click on an asset to select it for placement on the map. After selecting an asset, click anywhere on the map to place it.</p>
            <p className="mt-1">Placed assets can be moved and resized by selecting them on the map.</p>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? Any instances of it on the map will be removed as well."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default AssetMenu;
