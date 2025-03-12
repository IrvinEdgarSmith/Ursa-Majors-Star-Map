import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Trash, X } from 'lucide-react';
import { CelestialObjectType, ObjectTypeDefinition, useStarMap } from '../contexts/StarMapContext';
import ConfirmationDialog from './ConfirmationDialog';

interface TypeSelectorProps {
  objectType: CelestialObjectType;
  selectedTypeId?: string;
  onSelect: (typeId: string | undefined) => void;
}

const TypeSelector = ({ 
  objectType = 'star' as CelestialObjectType, // Provide default value to prevent null
  selectedTypeId, 
  onSelect 
}: TypeSelectorProps) => {
  // Hooks must be called at the top level - never conditionally
  const { 
    getTypesByCategory, 
    getObjectTypeById, 
    addObjectType, 
    updateObjectType,
    deleteObjectType
  } = useStarMap();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingType, setIsEditingType] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
  
  // State for new/editing type form
  const [typeName, setTypeName] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use a safe category value to prevent errors
  const safeObjectType = objectType || 'star';
  const typeOptions = getTypesByCategory(safeObjectType);
  const selectedType = selectedTypeId ? getObjectTypeById(selectedTypeId) : undefined;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      // Use capture phase to handle the event before it propagates
      document.addEventListener('mousedown', handleClickOutside, true);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isDropdownOpen]);

  const handleOpenAddNewForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingNew(true);
    setIsDropdownOpen(false);
    setTypeName('');
    setTypeDescription('');
  };
  
  const handleOpenEditForm = (type: ObjectTypeDefinition, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingType(type.id);
    setIsDropdownOpen(false);
    setTypeName(type.name);
    setTypeDescription(type.description);
  };
  
  const handleCancelForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingNew(false);
    setIsEditingType(null);
  };
  
  const handleAddType = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!typeName.trim()) return;
    
    const newTypeId = addObjectType({
      name: typeName.trim(),
      description: typeDescription.trim(),
      category: safeObjectType
    });
    
    onSelect(newTypeId);
    setIsAddingNew(false);
    setTypeName('');
    setTypeDescription('');
  };
  
  const handleUpdateType = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditingType || !typeName.trim()) return;
    
    updateObjectType(isEditingType, {
      name: typeName.trim(),
      description: typeDescription.trim()
    });
    
    setIsEditingType(null);
    setTypeName('');
    setTypeDescription('');
  };
  
  const handleDeleteType = (typeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTypeToDelete(typeId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteType = () => {
    if (typeToDelete) {
      deleteObjectType(typeToDelete);
      if (selectedTypeId === typeToDelete) {
        onSelect(undefined);
      }
      setShowDeleteConfirmation(false);
      setTypeToDelete(null);
    }
  };
  
  const handleSelectType = (typeId: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(typeId);
    setIsDropdownOpen(false);
  };

  // Render add/edit form or the type selector based on state
  if (isAddingNew || isEditingType) {
    return (
      <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-3 bg-gray-800 rounded p-3 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-electric-blue">
              {isAddingNew ? 'Add New Type' : 'Edit Type'}
            </h4>
            <button 
              onClick={handleCancelForm}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Name</label>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="Type name"
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Description</label>
              <textarea
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                placeholder="Type description"
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white min-h-[60px]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <button
              onClick={isAddingNew ? handleAddType : handleUpdateType}
              disabled={!typeName.trim()}
              className="w-full mt-1 py-1 text-sm bg-electric-blue hover:bg-blue-500 text-white rounded 
                       disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isAddingNew ? 'Create Type' : 'Update Type'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
      <label className="text-sm text-gray-400 block mb-1">Object Type</label>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 border border-gray-700 rounded text-left text-sm"
        >
          <span className={selectedType ? 'text-white' : 'text-gray-500'}>
            {selectedType ? selectedType.name : 'Select type...'}
          </span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
        
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded z-[60] shadow-lg overflow-hidden"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Type options */}
            <div className="p-1">
              {typeOptions.length > 0 ? (
                typeOptions.map(type => (
                  <div 
                    key={type.id} 
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-700 rounded cursor-pointer group"
                    onClick={(e) => handleSelectType(type.id, e)}
                  >
                    <div className="flex-1">
                      <div className="text-sm text-white">{type.name}</div>
                      {type.description && (
                        <div className="text-xs text-gray-400 truncate max-w-full">
                          {type.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => handleOpenEditForm(type, e)}
                        className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white"
                      >
                        <Plus size={12} className="rotate-45" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteType(type.id, e)}
                        className="p-1 rounded hover:bg-red-900 text-gray-400 hover:text-red-300"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  No types defined yet
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-700 my-1"></div>
            
            {/* Clear selection option */}
            {selectedTypeId && (
              <div 
                className="px-3 py-2 hover:bg-gray-700 text-sm text-gray-400 hover:text-white cursor-pointer"
                onClick={(e) => handleSelectType(undefined, e)}
              >
                Clear selection
              </div>
            )}
            
            {/* Add new type option */}
            <div 
              className="px-3 py-2 hover:bg-gray-700 text-sm text-electric-blue flex items-center cursor-pointer"
              onClick={handleOpenAddNewForm}
            >
              <Plus size={16} className="mr-1" />
              <span>Add new type</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected type description */}
      {selectedType && selectedType.description && (
        <div className="mt-1 text-xs text-gray-400 italic">
          {selectedType.description}
        </div>
      )}

      {/* Delete Type Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Object Type"
        message={`Are you sure you want to delete this object type? Objects that use this type will have their type reference removed. This action cannot be undone.`}
        onConfirm={confirmDeleteType}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default TypeSelector;
