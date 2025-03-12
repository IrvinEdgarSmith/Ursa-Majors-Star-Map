import { useRef, useEffect } from 'react';
import { useStarMap } from '../contexts/StarMapContext';

interface AssetPreviewProps {
  assetId: string;
  x: number;
  y: number;
  scale: number;
}

const AssetPreview = ({ assetId, x, y, scale }: AssetPreviewProps) => {
  const { getAssetById } = useStarMap();
  const imageRef = useRef<HTMLImageElement>(null);
  
  const asset = getAssetById(assetId);
  
  if (!asset) return null;
  
  // Calculate preview size (fixed width for preview, maintain aspect ratio)
  const previewWidth = 200 / scale;
  
  return (
    <div 
      className="absolute pointer-events-none z-40"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        width: `${previewWidth}px`,
        opacity: 0.8,
      }}
    >
      <img 
        ref={imageRef}
        src={asset.dataUrl}
        alt={asset.name}
        className="w-full h-auto object-contain"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
};

export default AssetPreview;
