import { useState } from 'react';
import { Map, Save, Squircle, Trash2, X } from 'lucide-react';
import { useStarMap } from '../contexts/StarMapContext';
import { MetadataSection as MetadataSectionType } from '../contexts/StarMapContext';
import ConfirmationDialog from './ConfirmationDialog';

interface MetadataSectionProps {
  objectId: string;
  section: MetadataSectionType;
}

const MetadataSection = ({ objectId, section }: MetadataSectionProps) => {
  const { updateMetadataSection, deleteMetadataSection } = useStarMap();
  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState(section.heading);
  const [body, setBody] = useState(section.body);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSave = () => {
    updateMetadataSection(objectId, section.id, { heading, body });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setHeading(section.heading);
    setBody(section.body);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteMetadataSection(objectId, section.id);
    setShowDeleteConfirmation(false);
  };

  const handleShowOnMapToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMetadataSection(objectId, section.id, { showOnMap: e.target.checked });
  };

  return (
    <div className="bg-dark-space border border-gray-800 rounded overflow-hidden">
      {isEditing ? (
        <div className="p-3">
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-electric-blue mb-2"
            placeholder="Section Heading"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white min-h-[80px] mb-2"
            placeholder="Enter details..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Cancel"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-1 hover:bg-blue-800 rounded text-electric-blue hover:text-blue-300"
              title="Save"
            >
              <Save size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gray-900 p-2 flex justify-between items-center">
            <h5 className="font-medium text-sm text-electric-blue">{section.heading}</h5>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                title="Edit"
              >
                <Squircle size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-crimson-red hover:bg-opacity-80 rounded text-gray-400 hover:text-white"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{section.body}</p>
            <div className="mt-2 pt-2 border-t border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={section.showOnMap || false}
                  onChange={handleShowOnMapToggle}
                  className="form-checkbox h-4 w-4 text-electric-blue bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-300 flex items-center gap-1">
                  <Map size={12} className="text-electric-blue" />
                  Show on Map
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Section"
        message={`Are you sure you want to delete the "${section.heading}" section? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default MetadataSection;
