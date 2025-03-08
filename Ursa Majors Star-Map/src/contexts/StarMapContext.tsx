import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBoards, getStorageKeyForBoard } from './BoardsContext';

// Types
export type CelestialObjectType = 'sun' | 'star' | 'astralBody' | 'planet' | 'moon' | 'satellite' | 'station';

export interface MetadataSection {
  id: string;
  heading: string;
  body: string;
}

// New Sector type for polygonal regions
export interface Sector {
  id: string;
  name: string;
  points: { x: number, y: number }[];
  color: string;
  color2?: string; // Added color2 property for gradient
  showName?: boolean;
  metadata: MetadataSection[]; // Added metadata array for sectors
}

// New Types system
export interface ObjectTypeDefinition {
  id: string;
  name: string;
  description: string;
  category: CelestialObjectType; // Which celestial object category this type belongs to
}

export interface BaseCelestialObject {
  id: string;
  name: string;
  x: number;
  y: number;
  type: CelestialObjectType;
  parentId?: string;
  metadata: MetadataSection[];
  color?: string;
  showName?: boolean;
  objectTypeId?: string; // Reference to the selected type definition
}

export interface Sun extends BaseCelestialObject {
  type: 'sun';
  size: number;
}

export interface Star extends BaseCelestialObject {
  type: 'star';
  size: number;
}

export interface AstralBody extends BaseCelestialObject {
  type: 'astralBody';
  sizeX: number;
  sizeY: number;
  orbitDistance?: number;
  transparent?: boolean; // New property to make astral body transparent with border
}

export interface OrbitalObject extends BaseCelestialObject {
  size: number;
  orbitDistance: number;
  parentId: string;
}

export interface Planet extends OrbitalObject {
  type: 'planet';
  inhabited?: boolean; // Added inhabited property
}

export interface Moon extends OrbitalObject {
  type: 'moon';
  inhabited?: boolean; // Added inhabited property for moons
}

export interface Satellite extends OrbitalObject {
  type: 'satellite';
}

export interface Station extends OrbitalObject {
  type: 'station';
  inhabited?: boolean; // Added inhabited property for stations
}

export type CelestialObject = Sun | Star | AstralBody | Planet | Moon | Satellite | Station;

type StarMapContextType = {
  celestialObjects: CelestialObject[];
  sectors: Sector[];
  isPlacingObject: boolean;
  isCreatingSector: boolean;
  placingObjectType: CelestialObjectType | null;
  selectedObjectId: string | null;
  selectedSectorId: string | null;
  objectTypes: ObjectTypeDefinition[];
  currentSectorPoints: { x: number, y: number }[];
  isLoading: boolean;
  setIsPlacingObject: (isPlacing: boolean) => void;
  initializeObjectPlacement: (type: CelestialObjectType) => void;
  placeObject: (x: number, y: number) => void;
  deleteObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObjectSettings: (id: string, settings: Partial<CelestialObject>) => void;
  updateObjectPosition: (id: string, x: number, y: number) => void;
  createOrbitalObject: (type: CelestialObjectType, parentId: string) => void;
  getObjectById: (id: string) => CelestialObject | undefined;
  getChildObjects: (parentId: string) => CelestialObject[];
  addMetadataSection: (objectId: string) => void;
  updateMetadataSection: (objectId: string, sectionId: string, updates: Partial<MetadataSection>) => void;
  deleteMetadataSection: (objectId: string, sectionId: string) => void;
  // New type management functions
  getObjectTypeById: (id: string) => ObjectTypeDefinition | undefined;
  getTypesByCategory: (category: CelestialObjectType) => ObjectTypeDefinition[];
  addObjectType: (type: Omit<ObjectTypeDefinition, 'id'>) => string;
  updateObjectType: (id: string, updates: Partial<Omit<ObjectTypeDefinition, 'id'>>) => void;
  deleteObjectType: (id: string) => void;
  setObjectType: (objectId: string, typeId: string | undefined) => void;
  // Sector management functions
  initializeSectorCreation: () => void;
  addSectorPoint: (x: number, y: number) => void;
  completeSector: (name: string, color: string, color2: string) => string; // Updated to include color2
  createSectorWithDefaultValues: (points: { x: number, y: number }[]) => string; // Added this function
  cancelSectorCreation: () => void;
  updateSector: (id: string, updates: Partial<Sector>) => void;
  deleteSector: (id: string) => void;
  selectSector: (id: string | null) => void;
  getSectorById: (id: string) => Sector | undefined;
  // New sector metadata functions
  addSectorMetadataSection: (sectorId: string) => void;
  updateSectorMetadataSection: (sectorId: string, sectionId: string, updates: Partial<MetadataSection>) => void;
  deleteSectorMetadataSection: (sectorId: string, sectionId: string) => void;
};

// Create context with default values
const StarMapContext = createContext<StarMapContextType>({
  celestialObjects: [],
  sectors: [],
  isPlacingObject: false,
  isCreatingSector: false,
  placingObjectType: null,
  selectedObjectId: null,
  selectedSectorId: null,
  objectTypes: [],
  currentSectorPoints: [],
  isLoading: false,
  setIsPlacingObject: () => {},
  initializeObjectPlacement: () => {},
  placeObject: () => {},
  deleteObject: () => {},
  selectObject: () => {},
  updateObjectSettings: () => {},
  updateObjectPosition: () => {},
  createOrbitalObject: () => {},
  getObjectById: () => undefined,
  getChildObjects: () => [],
  addMetadataSection: () => {},
  updateMetadataSection: () => {},
  deleteMetadataSection: () => {},
  getObjectTypeById: () => undefined,
  getTypesByCategory: () => [],
  addObjectType: () => "",
  updateObjectType: () => {},
  deleteObjectType: () => {},
  setObjectType: () => {},
  initializeSectorCreation: () => {},
  addSectorPoint: () => {},
  completeSector: () => "",
  createSectorWithDefaultValues: () => "", // Added default implementation
  cancelSectorCreation: () => {},
  updateSector: () => {},
  deleteSector: () => {},
  selectSector: () => {},
  getSectorById: () => undefined,
  addSectorMetadataSection: () => {},
  updateSectorMetadataSection: () => {},
  deleteSectorMetadataSection: () => {},
});

// Default type definitions for initial setup
const defaultObjectTypes: ObjectTypeDefinition[] = [
  {
    id: "star-type-1",
    name: "Main Sequence Star",
    description: "A standard hydrogen-burning star in the main phase of its life cycle.",
    category: "star"
  },
  {
    id: "star-type-2",
    name: "Red Giant",
    description: "An aging star that has expanded in size and cooled down.",
    category: "star"
  },
  {
    id: "planet-type-1",
    name: "Terrestrial",
    description: "Rocky planet with a solid surface, similar to Earth or Mars.",
    category: "planet"
  },
  {
    id: "planet-type-2",
    name: "Gas Giant",
    description: "Large planet composed primarily of hydrogen and helium, like Jupiter or Saturn.",
    category: "planet"
  },
  {
    id: "moon-type-1",
    name: "Rocky Moon",
    description: "A natural satellite with a solid, rocky surface.",
    category: "moon"
  },
  {
    id: "satellite-type-1",
    name: "Research Satellite",
    description: "Artificial satellite designed for scientific research and data collection.",
    category: "satellite"
  },
  {
    id: "station-type-1",
    name: "Space Station",
    description: "Large artificial structure designed for habitation in space.",
    category: "station"
  }
];

// Provider component
export const StarMapProvider = ({ children }: { children: ReactNode }) => {
  const { currentBoardId, isBoardSwitchingInProgress } = useBoards();
  const [celestialObjects, setCelestialObjects] = useState<CelestialObject[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isPlacingObject, setIsPlacingObject] = useState(false);
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [placingObjectType, setPlacingObjectType] = useState<CelestialObjectType | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [objectTypes, setObjectTypes] = useState<ObjectTypeDefinition[]>(defaultObjectTypes);
  const [currentSectorPoints, setCurrentSectorPoints] = useState<{ x: number, y: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage when currentBoardId changes or board switching status changes
  useEffect(() => {
    if (!currentBoardId) return;

    // Set loading state while data is being loaded
    setIsLoading(true);

    // Clear selections when changing boards
    setSelectedObjectId(null);
    setSelectedSectorId(null);

    // Load object types
    const savedTypes = localStorage.getItem(getStorageKeyForBoard(currentBoardId, 'object-types'));
    if (savedTypes) {
      try {
        const parsedTypes = JSON.parse(savedTypes);
        setObjectTypes(parsedTypes);
      } catch (error) {
        console.error("Failed to parse saved object types:", error);
        // Fall back to default types
        setObjectTypes(defaultObjectTypes);
      }
    } else {
      // If no types exist for this board, set defaults
      setObjectTypes(defaultObjectTypes);
    }

    // Load celestial objects
    const savedObjects = localStorage.getItem(getStorageKeyForBoard(currentBoardId, 'objects'));
    if (savedObjects) {
      try {
        const parsed = JSON.parse(savedObjects);
        // Ensure metadata exists for backward compatibility
        const objectsWithMetadata = parsed.map((obj: any) => ({
          ...obj,
          metadata: obj.metadata || [],
          showName: obj.showName || false,
          objectTypeId: obj.objectTypeId || undefined
        }));
        setCelestialObjects(objectsWithMetadata);
      } catch (error) {
        console.error("Failed to parse saved objects:", error);
        setCelestialObjects([]);
      }
    } else {
      setCelestialObjects([]);
    }

    // Load sectors
    const savedSectors = localStorage.getItem(getStorageKeyForBoard(currentBoardId, 'sectors'));
    if (savedSectors) {
      try {
        const parsed = JSON.parse(savedSectors);
        // Ensure metadata exists for backward compatibility
        const sectorsWithMetadata = parsed.map((sector: any) => ({
          ...sector,
          metadata: sector.metadata || []
        }));
        setSectors(sectorsWithMetadata);
      } catch (error) {
        console.error("Failed to parse saved sectors:", error);
        setSectors([]);
      }
    } else {
      setSectors([]);
    }

    // Set loading state back to false after a short delay
    // This ensures the UI has time to update with the new data
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [currentBoardId, isBoardSwitchingInProgress]);

  // Save data to localStorage whenever celestial objects change
  useEffect(() => {
    if (!currentBoardId || isLoading) return;
    localStorage.setItem(getStorageKeyForBoard(currentBoardId, 'objects'), JSON.stringify(celestialObjects));
  }, [celestialObjects, currentBoardId, isLoading]);

  // Save sectors to localStorage whenever they change
  useEffect(() => {
    if (!currentBoardId || isLoading) return;
    localStorage.setItem(getStorageKeyForBoard(currentBoardId, 'sectors'), JSON.stringify(sectors));
  }, [sectors, currentBoardId, isLoading]);

  // Save object types to localStorage whenever they change
  useEffect(() => {
    if (!currentBoardId || isLoading) return;
    localStorage.setItem(getStorageKeyForBoard(currentBoardId, 'object-types'), JSON.stringify(objectTypes));
  }, [objectTypes, currentBoardId, isLoading]);

  const initializeObjectPlacement = (type: CelestialObjectType) => {
    setIsPlacingObject(true);
    setPlacingObjectType(type);
    setIsCreatingSector(false);
    setCurrentSectorPoints([]);
  };

  const placeObject = (x: number, y: number) => {
    if (!placingObjectType) return;

    const id = crypto.randomUUID();
    let newObject: CelestialObject;

    switch (placingObjectType) {
      case 'sun':
        newObject = {
          id,
          name: 'New Sun',
          x,
          y,
          size: 100,
          type: 'sun',
          metadata: [],
          showName: false
        };
        break;
      case 'star':
        newObject = {
          id,
          name: 'New Star',
          x,
          y,
          size: 80,
          type: 'star',
          metadata: [],
          showName: false
        };
        break;
      case 'astralBody':
        newObject = {
          id,
          name: 'New Astral Body',
          x,
          y,
          sizeX: 60,
          sizeY: 60,
          type: 'astralBody',
          metadata: [],
          showName: false,
          transparent: false // Initialize as not transparent
        };
        break;
      default:
        return;
    }

    setCelestialObjects(prev => [...prev, newObject]);
    setSelectedObjectId(id);
    setIsPlacingObject(false);
    setPlacingObjectType(null);
  };

  const deleteObject = (id: string) => {
    // First get all child objects to also delete
    const allDescendants = getAllDescendantIds(id);
    
    setCelestialObjects(prev => prev.filter(obj => 
      obj.id !== id && !allDescendants.includes(obj.id)
    ));
    
    if (selectedObjectId === id || allDescendants.includes(selectedObjectId || '')) {
      setSelectedObjectId(null);
    }
  };

  // Get all descendant IDs recursively
  const getAllDescendantIds = (parentId: string): string[] => {
    const children = celestialObjects.filter(obj => obj.parentId === parentId);
    let descendantIds: string[] = children.map(child => child.id);
    
    // Recursively get descendants of each child
    children.forEach(child => {
      descendantIds = [...descendantIds, ...getAllDescendantIds(child.id)];
    });
    
    return descendantIds;
  };

  const selectObject = (id: string | null) => {
    setSelectedObjectId(id);
    if (id) {
      setSelectedSectorId(null); // Deselect any selected sector
    }
  };

  const updateObjectSettings = (id: string, settings: Partial<CelestialObject>) => {
    setCelestialObjects(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, ...settings } : obj
      )
    );
  };

  const updateObjectPosition = (id: string, x: number, y: number) => {
    setCelestialObjects(prev => {
      // First update the position of the target object
      const updatedObjects = prev.map(obj =>
        obj.id === id ? { ...obj, x, y } : obj
      );
      
      // Then update the position of all child objects
      const updateChildPositions = (parentId: string, parentX: number, parentY: number) => {
        const children = updatedObjects.filter(obj => obj.parentId === parentId);
        
        children.forEach(child => {
          if ('orbitDistance' in child) {
            // Update position to match parent
            const childIdx = updatedObjects.findIndex(o => o.id === child.id);
            if (childIdx >= 0) {
              updatedObjects[childIdx] = { ...child, x: parentX, y: parentY };
            }
            
            // Recursively update this child's children
            updateChildPositions(child.id, parentX, parentY);
          }
        });
      };
      
      updateChildPositions(id, x, y);
      
      return updatedObjects;
    });
  };

  const createOrbitalObject = (type: CelestialObjectType, parentId: string) => {
    const parent = celestialObjects.find(obj => obj.id === parentId);
    if (!parent) return;
    
    const id = crypto.randomUUID();
    
    let defaultSize = 15;
    let defaultOrbitDistance = 200;
    let name = 'New Object';
    
    // Get max orbit distance based on parent type
    const maxOrbitDistance = parent.type === 'star' ? 4000 : 1500;
    
    switch (type) {
      case 'planet':
        defaultSize = 50;
        defaultOrbitDistance = 500;
        name = 'New Planet';
        break;
      case 'moon':
        defaultSize = 20;
        defaultOrbitDistance = 120;
        name = 'New Moon';
        break;
      case 'satellite':
        defaultSize = 15;
        defaultOrbitDistance = 80;
        name = 'New Satellite';
        break;
      case 'station':
        defaultSize = 30;
        defaultOrbitDistance = 150;
        name = 'New Station';
        break;
    }
    
    // Create the new orbital object with the correct type
    let newObject: CelestialObject;
    
    switch (type) {
      case 'planet':
        newObject = {
          id,
          name,
          x: parent.x,
          y: parent.y,
          size: defaultSize,
          type: 'planet',
          parentId,
          orbitDistance: defaultOrbitDistance,
          metadata: [],
          showName: false,
          inhabited: false // Initialize as not inhabited
        } as Planet;
        break;
      case 'moon':
        newObject = {
          id,
          name,
          x: parent.x,
          y: parent.y,
          size: defaultSize,
          type: 'moon',
          parentId,
          orbitDistance: defaultOrbitDistance,
          metadata: [],
          showName: false,
          inhabited: false // Initialize as not inhabited
        } as Moon;
        break;
      case 'satellite':
        newObject = {
          id,
          name,
          x: parent.x,
          y: parent.y,
          size: defaultSize,
          type: 'satellite',
          parentId,
          orbitDistance: defaultOrbitDistance,
          metadata: [],
          showName: false
        } as Satellite;
        break;
      case 'station':
        newObject = {
          id,
          name,
          x: parent.x,
          y: parent.y,
          size: defaultSize,
          type: 'station',
          parentId,
          orbitDistance: defaultOrbitDistance,
          metadata: [],
          showName: false,
          inhabited: false // Initialize as not inhabited
        } as Station;
        break;
      default:
        return; // Exit if we get an invalid type
    }
    
    setCelestialObjects(prev => [...prev, newObject]);
    setSelectedObjectId(id);
  };

  const getObjectById = (id: string) => {
    return celestialObjects.find(obj => obj.id === id);
  };

  const getChildObjects = (parentId: string) => {
    return celestialObjects.filter(obj => obj.parentId === parentId);
  };

  // Metadata section management
  const addMetadataSection = (objectId: string) => {
    setCelestialObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        return {
          ...obj,
          metadata: [
            ...obj.metadata,
            {
              id: crypto.randomUUID(),
              heading: 'New Section',
              body: 'Add details here...'
            }
          ]
        };
      }
      return obj;
    }));
  };

  const updateMetadataSection = (objectId: string, sectionId: string, updates: Partial<MetadataSection>) => {
    setCelestialObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        return {
          ...obj,
          metadata: obj.metadata.map(section => 
            section.id === sectionId ? { ...section, ...updates } : section
          )
        };
      }
      return obj;
    }));
  };

  const deleteMetadataSection = (objectId: string, sectionId: string) => {
    setCelestialObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        return {
          ...obj,
          metadata: obj.metadata.filter(section => section.id !== sectionId)
        };
      }
      return obj;
    }));
  };

  // Object Type management
  const getObjectTypeById = (id: string) => {
    return objectTypes.find(type => type.id === id);
  };

  const getTypesByCategory = (category: CelestialObjectType) => {
    return objectTypes.filter(type => type.category === category);
  };

  const addObjectType = (typeData: Omit<ObjectTypeDefinition, 'id'>) => {
    const id = crypto.randomUUID();
    const newType: ObjectTypeDefinition = {
      ...typeData,
      id
    };
    
    setObjectTypes(prev => [...prev, newType]);
    return id;
  };

  const updateObjectType = (id: string, updates: Partial<Omit<ObjectTypeDefinition, 'id'>>) => {
    setObjectTypes(prev => prev.map(type => 
      type.id === id ? { ...type, ...updates } : type
    ));
  };

  const deleteObjectType = (id: string) => {
    // Remove references from objects first
    setCelestialObjects(prev => prev.map(obj => 
      obj.objectTypeId === id ? { ...obj, objectTypeId: undefined } : obj
    ));
    
    // Then remove the type
    setObjectTypes(prev => prev.filter(type => type.id !== id));
  };

  const setObjectType = (objectId: string, typeId: string | undefined) => {
    setCelestialObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, objectTypeId: typeId } : obj
    ));
  };

  // Sector management functions
  const initializeSectorCreation = () => {
    setIsCreatingSector(true);
    setIsPlacingObject(false);
    setPlacingObjectType(null);
    setCurrentSectorPoints([]);
  };

  const addSectorPoint = (x: number, y: number) => {
    if (!isCreatingSector) return;
    setCurrentSectorPoints(prev => [...prev, { x, y }]);
  };

  // Function to create a sector with default values
  const createSectorWithDefaultValues = (points: { x: number, y: number }[]): string => {
    // Need at least 3 points to form a valid polygon
    if (points.length < 3) return "";

    const id = crypto.randomUUID();
    const newSector: Sector = {
      id,
      name: 'New Sector',
      points: [...points],
      color: '#4287f5', // Default primary color - blue
      color2: '#42f5e3', // Default secondary color - teal
      showName: true,
      metadata: [] // Initialize empty metadata array
    };

    setSectors(prev => [...prev, newSector]);
    setCurrentSectorPoints([]);
    setIsCreatingSector(false);
    return id;
  };

  const completeSector = (name: string, color: string, color2: string) => {
    // Need at least 3 points to form a valid polygon
    if (currentSectorPoints.length < 3) return "";

    const id = crypto.randomUUID();
    const newSector: Sector = {
      id,
      name,
      points: [...currentSectorPoints],
      color,
      color2, // Store the second color for gradient
      showName: true,
      metadata: [] // Initialize empty metadata array
    };

    setSectors(prev => [...prev, newSector]);
    setSelectedSectorId(id);
    setIsCreatingSector(false);
    setCurrentSectorPoints([]);
    return id;
  };

  const cancelSectorCreation = () => {
    setIsCreatingSector(false);
    setCurrentSectorPoints([]);
  };

  const updateSector = (id: string, updates: Partial<Sector>) => {
    setSectors(prev => 
      prev.map(sector => 
        sector.id === id ? { ...sector, ...updates } : sector
      )
    );
  };

  const deleteSector = (id: string) => {
    setSectors(prev => prev.filter(sector => sector.id !== id));
    if (selectedSectorId === id) {
      setSelectedSectorId(null);
    }
  };

  const selectSector = (id: string | null) => {
    setSelectedSectorId(id);
    if (id) {
      setSelectedObjectId(null); // Deselect any selected object
    }
  };

  const getSectorById = (id: string) => {
    return sectors.find(sector => sector.id === id);
  };

  // Sector metadata management
  const addSectorMetadataSection = (sectorId: string) => {
    setSectors(prev => prev.map(sector => {
      if (sector.id === sectorId) {
        return {
          ...sector,
          metadata: [
            ...(sector.metadata || []),
            {
              id: crypto.randomUUID(),
              heading: 'New Section',
              body: 'Add details here...'
            }
          ]
        };
      }
      return sector;
    }));
  };

  const updateSectorMetadataSection = (sectorId: string, sectionId: string, updates: Partial<MetadataSection>) => {
    setSectors(prev => prev.map(sector => {
      if (sector.id === sectorId && sector.metadata) {
        return {
          ...sector,
          metadata: sector.metadata.map(section => 
            section.id === sectionId ? { ...section, ...updates } : section
          )
        };
      }
      return sector;
    }));
  };

  const deleteSectorMetadataSection = (sectorId: string, sectionId: string) => {
    setSectors(prev => prev.map(sector => {
      if (sector.id === sectorId && sector.metadata) {
        return {
          ...sector,
          metadata: sector.metadata.filter(section => section.id !== sectionId)
        };
      }
      return sector;
    }));
  };

  return (
    <StarMapContext.Provider
      value={{
        celestialObjects,
        sectors,
        isPlacingObject,
        isCreatingSector,
        placingObjectType,
        selectedObjectId,
        selectedSectorId,
        objectTypes,
        currentSectorPoints,
        isLoading,
        setIsPlacingObject,
        initializeObjectPlacement,
        placeObject,
        deleteObject,
        selectObject,
        updateObjectSettings,
        updateObjectPosition,
        createOrbitalObject,
        getObjectById,
        getChildObjects,
        addMetadataSection,
        updateMetadataSection,
        deleteMetadataSection,
        getObjectTypeById,
        getTypesByCategory,
        addObjectType,
        updateObjectType,
        deleteObjectType,
        setObjectType,
        initializeSectorCreation,
        addSectorPoint,
        completeSector,
        createSectorWithDefaultValues,
        cancelSectorCreation,
        updateSector,
        deleteSector,
        selectSector,
        getSectorById,
        addSectorMetadataSection,
        updateSectorMetadataSection,
        deleteSectorMetadataSection,
      }}
    >
      {children}
    </StarMapContext.Provider>
  );
};

// Custom hook for using the context - moved outside the provider component to avoid HMR issues
export const useStarMap = () => useContext(StarMapContext);
