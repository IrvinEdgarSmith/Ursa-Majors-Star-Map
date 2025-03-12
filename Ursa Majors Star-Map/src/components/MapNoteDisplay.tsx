import { X } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import { MetadataSection } from '../contexts/StarMapContext';

interface MapNoteDisplayProps {
  objectId: string;
  section: MetadataSection;
  x: number;
  y: number;
  scale: number;
  isVisible: boolean;
}

const MapNoteDisplay = ({ objectId, section, x, y, scale, isVisible }: MapNoteDisplayProps) => {
  const { updateMetadataSection, getObjectById } = useStarMap();
  
  if (!isVisible) return null;
  
  const object = getObjectById(objectId);
  if (!object) return null;

  // Calculate offset based on object type and size
  let offsetY = -40;  // Default offset
  let maxWidth = 250;  // Default width
  
  if (object.type === 'star' || object.type === 'sun') {
    offsetY = -('size' in object ? object.size / 2 : 0) - 60;
    maxWidth = 300;
  } else if (object.type === 'planet') {
    offsetY = -('size' in object ? object.size / 2 : 0) - 50;
    maxWidth = 250;
  } else if (object.type === 'astralBody') {
    const astralBody = object as any;
    offsetY = -(Math.max(astralBody.sizeY, astralBody.sizeX) / 2) - 50;
  }

  // Apply scaling factor to keep consistent appearance across zoom levels
  const scaleFactor = 1 / scale;
  
  // Handle closing the note
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateMetadataSection(objectId, section.id, { showOnMap: false });
  };
  
  // Use object color for the note accent if available
  const accentColor = object.color || 'var(--color-primary)';
  
  return (
    <div 
      className="absolute pointer-events-auto"
      style={{
        left: `${x}px`,
        top: `${y + offsetY}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 30,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative rounded shadow-lg bg-gray-900 bg-opacity-90 border border-gray-700"
        style={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'bottom center',
          maxWidth: `${maxWidth}px`,
          borderLeft: `3px solid ${accentColor}`,
        }}
      >
        <div className="flex justify-between items-center px-3 py-1.5 border-b border-gray-700">
          <h5 className="font-medium text-xs text-electric-blue truncate max-w-[200px]">{section.heading}</h5>
          <button 
            onClick={handleClose}
            className="p-0.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-gray-200"
          >
            <X size={12} />
          </button>
        </div>
        <div className="p-2">
          <p className="text-xs text-gray-300 overflow-hidden whitespace-pre-wrap" style={{ maxHeight: '150px' }}>
            {section.body}
          </p>
        </div>
        
        {/* Arrow pointing to the object */}
        <div 
          className="absolute w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-gray-700"
          style={{
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default MapNoteDisplay;
