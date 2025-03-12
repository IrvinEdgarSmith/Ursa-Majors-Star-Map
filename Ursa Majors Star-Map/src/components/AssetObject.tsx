import { useRef, useState, MouseEvent } from 'react';
import { useStarMap } from '../contexts/StarMapContext';
import { MapAsset } from '../contexts/StarMapContext';

interface AssetObjectProps {
  asset: MapAsset;
  scale: number;
  onSelect: (id: string, e: MouseEvent) => void;
  onContextMenu: (id: string, e: MouseEvent) => void;
  isSelected: boolean;
}

const ResizeHandle = ({ position, onMouseDown }: { 
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', 
  onMouseDown: (e: MouseEvent, position: string) => void 
}) => {
  const positionClasses = {
    'top-left': 'top-0 left-0 cursor-nwse-resize',
    'top-right': 'top-0 right-0 cursor-nesw-resize',
    'bottom-left': 'bottom-0 left-0 cursor-nesw-resize',
    'bottom-right': 'bottom-0 right-0 cursor-nwse-resize'
  };

  return (
    <div 
      className={`absolute w-4 h-4 bg-theme-primary rounded-full z-30 transform -translate-x-1/2 -translate-y-1/2 ${positionClasses[position]}`}
      onMouseDown={(e) => onMouseDown(e, position)}
      style={{ opacity: 0.8 }}
    />
  );
};

const AssetObject = ({ asset, scale, onSelect, onContextMenu, isSelected }: AssetObjectProps) => {
  const { updateAssetPosition, updateAssetSize, getAssetById } = useStarMap();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  
  const assetRef = useRef<HTMLDivElement>(null);

  // Get asset data
  const assetData = getAssetById(asset.assetId);
  
  if (!assetData) return null;

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onSelect(asset.id, e);
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: asset.width, height: asset.height });
    setInitialPosition({ x: asset.x, y: asset.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isResizing) {
      // Calculate delta movement adjusted for scale
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      // Update position
      updateAssetPosition(asset.id, asset.x + dx, asset.y + dy);
      
      // Reset drag start
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      // Calculate delta movement adjusted for scale
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialPosition.x;
      let newY = initialPosition.y;
      
      // Apply resize based on which handle is being dragged
      switch (resizeHandle) {
        case 'bottom-right':
          newWidth = Math.max(50, initialSize.width + dx);
          newHeight = Math.max(50, initialSize.height + dy);
          break;
        case 'bottom-left':
          newWidth = Math.max(50, initialSize.width - dx);
          newHeight = Math.max(50, initialSize.height + dy);
          newX = initialPosition.x + (initialSize.width - newWidth);
          break;
        case 'top-right':
          newWidth = Math.max(50, initialSize.width + dx);
          newHeight = Math.max(50, initialSize.height - dy);
          newY = initialPosition.y + (initialSize.height - newHeight);
          break;
        case 'top-left':
          newWidth = Math.max(50, initialSize.width - dx);
          newHeight = Math.max(50, initialSize.height - dy);
          newX = initialPosition.x + (initialSize.width - newWidth);
          newY = initialPosition.y + (initialSize.height - newHeight);
          break;
      }
      
      // Update position and size
      updateAssetSize(asset.id, newWidth, newHeight, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Skip rendering very small assets when zoomed out too far to improve performance
  if (scale < 0.1 && asset.width * scale < 10) {
    return null;
  }

  return (
    <div
      ref={assetRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-theme-primary' : ''}`}
      style={{
        left: `${asset.x}px`,
        top: `${asset.y}px`,
        width: `${asset.width}px`,
        height: `${asset.height}px`,
        zIndex: 15,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove as any}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => onContextMenu(asset.id, e)}
    >
      <img
        src={assetData.dataUrl}
        alt={assetData.name}
        className="w-full h-full object-contain pointer-events-none"
      />
      
      {/* Resize handles - only visible when selected */}
      {isSelected && (
        <>
          <ResizeHandle position="top-left" onMouseDown={handleResizeStart} />
          <ResizeHandle position="top-right" onMouseDown={handleResizeStart} />
          <ResizeHandle position="bottom-left" onMouseDown={handleResizeStart} />
          <ResizeHandle position="bottom-right" onMouseDown={handleResizeStart} />
        </>
      )}
    </div>
  );
};

export default AssetObject;
