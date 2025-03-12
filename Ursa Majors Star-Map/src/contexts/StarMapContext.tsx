import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBoards, getStorageKeyForBoard } from './BoardsContext';

// Types
export type CelestialObjectType = 'sun' | 'star' | 'astralBody' | 'planet' | 'moon' | 'satellite' | 'station';

export interface MetadataSection {
  id: string;
  heading: string;
  body: string;
  showOnMap?: boolean;
}

// Asset type definitions
export interface Asset {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export interface MapAsset {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
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

// Action history types for undo functionality
export type ActionType = 
  | 'CREATE_OBJECT'
  | 'DELETE_OBJECT'
  | 'UPDATE_OBJECT'
  | 'MOVE_OBJECT'
  | 'CREATE_SECTOR'
  | 'UPDATE_SECTOR'
  | 'DELETE_SECTOR'
  | 'ADD_METADATA'
  | 'UPDATE_METADATA'
  | 'DELETE_METADATA'
  | 'ADD_SECTOR_METADATA'
  | 'UPDATE_SECTOR_METADATA'
  | 'DELETE_SECTOR_METADATA'
  | 'UPLOAD_ASSET'
  | 'DELETE_ASSET'
  | 'CREATE_MAP_ASSET'
  | 'UPDATE_MAP_ASSET'
  | 'DELETE_MAP_ASSET';

export interface HistoryAction {
  type: ActionType;
  payload: {
    objects?: CelestialObject[];
    sectors?: Sector[];
    objectIds?: string[];
    sectorIds?: string[];
    assets?: Asset[];
    mapAssets?: MapAsset[];
    metadata?: {
      objectId?: string;
      sectorId?: string;
      sectionId?: string;
      section?: MetadataSection;
    };
  };
  timestamp: number;
}

type StarMapContextType = {
  celestialObjects: CelestialObject[];
  sectors: Sector[];
  assets: Asset[];
  mapAssets: MapAsset[];
  isPlacingObject: boolean;
  isCreatingSector: boolean;
  isPlacingAsset: boolean;
  placingObjectType: CelestialObjectType | null;
  placingAssetId: string | null;
  selectedObjectId: string | null;
  selectedSectorId: string | null;
  selectedMapAssetId: string | null;
  objectTypes: ObjectTypeDefinition[];
  currentSectorPoints: { x: number, y: number }[];
  isLoading: boolean;
  actionHistory: HistoryAction[];
  canUndo: boolean;
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
  // Asset management functions
  uploadAsset: (name: string, dataUrl: string) => string;
  deleteAsset: (id: string) => void;
  getAssetById: (id: string) => Asset | undefined;
  initializeAssetPlacement: (assetId: string) => void;
  placeAsset: (x: number, y: number) => void;
  updateAssetPosition: (id: string, x: number, y: number) => void;
  updateAssetSize: (id: string, width: number, height: number, x: number, y: number) => void;
  deleteMapAsset: (id: string) => void;
  getMapAssetById: (id: string) => MapAsset | undefined;
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
  // Undo functionality
  undo: () => void;
};

// Create context with default values
const StarMapContext = createContext<StarMapContextType>({
  celestialObjects: [],
  sectors: [],
  assets: [],
  mapAssets: [],
  isPlacingObject: false,
  isCreatingSector: false,
  isPlacingAsset: false,
  placingObjectType: null,
  placingAssetId: null,
  selectedObjectId: null,
  selectedSectorId: null,
  selectedMapAssetId: null,
  objectTypes: [],
  currentSectorPoints: [],
  isLoading: false,
  actionHistory: [],
  canUndo: false,
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
  // Asset management functions
  uploadAsset: () => "",
  deleteAsset: () => {},
  getAssetById: () => undefined,
  initializeAssetPlacement: () => {},
  placeAsset: () => {},
  updateAssetPosition: () => {},
  updateAssetSize: () => {},
  deleteMapAsset: () => {},
  getMapAssetById: () => undefined,
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
  undo: () => {},
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

// Maximum number of actions to keep in history
const MAX_HISTORY_LENGTH = 50;

// Provider component
export const StarMapProvider = ({ children }: { children: ReactNode }) => {
  const { currentBoardId, isBoardSwitchingInProgress } = useBoards();
  const [celestialObjects, setCelestialObjects] = useState<CelestialObject[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mapAssets, setMapAssets] = useState<MapAsset[]>([]);
  const [isPlacingObject, setIsPlacingObject] = useState(false);
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [isPlacingAsset, setIsPlacingAsset] = useState(false);
  const [placingObjectType, setPlacingObjectType] = useState<CelestialObjectType | null>(null);
  const [placingAssetId, setPlacingAssetId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedMapAssetId, setSelectedMapAssetId] = useState<string | null>(null);
  const [objectTypes, setObjectTypes] = useState<ObjectTypeDefinition[]>(defaultObjectTypes);
  const [currentSectorPoints, setCurrentSectorPoints] = useState<{ x: number, y: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<HistoryAction[]>([]);
  const canUndo = actionHistory.length > 0;

  // Add action to history
  const addToHistory = (action: Omit<HistoryAction, 'timestamp'>) => {
    setActionHistory(prev => {
      const newHistory = [
        { ...action, timestamp: Date.now() },
        ...prev.slice(0, MAX_HISTORY_LENGTH - 1)
      ];
      return newHistory;
    });
  };

  // Load data from localStorage when currentBoardId changes or board switching status changes
  useEffect(() => {
    if (!currentBoardId) return;

    // Set loading state while data is being loaded
    setIsLoading(true);

    // Clear selections when changing boards
    setSelectedObjectId(null);
    setSelectedSectorId(null);
    setSelectedMapAssetId(null);
    // Clear action history when switching boards
    setActionHistory([]);

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

    // Load assets
    const savedAssets = localStorage.getItem(getStorageKeyForBoard(currentBoardId, 'assets'));
    if (savedAssets) {
      try {
        const parsed = JSON.parse(savedAssets);
        setAssets(parsed);
      } catch (error) {
        console.error("Failed to parse saved assets:", error);
        setAssets([]);
      }
    } else {
      setAssets([]);
    }

    // Load map assets
    const savedMapAssets = localStorage.getItem(getStorageKeyForBoard(currentBoardId, 'map-assets'));
    if (savedMapAssets) {
      try {
        const parsed = JSON.parse(savedMapAssets);
        setMapAssets(parsed);
      } catch (error) {
        console.error("Failed to parse saved map assets:", error);
        setMapAssets([]);
      }
    } else {
      setMapAssets([]);
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

  // Save assets to localStorage whenever they change
  useEffect(() => {
    if (!currentBoardId || isLoading) return;
    localStorage.setItem(getStorageKeyForBoard(currentBoardId, 'assets'), JSON.stringify(assets));
  }, [assets, currentBoardId, isLoading]);

  // Save map assets to localStorage whenever they change
  useEffect(() => {
    if (!currentBoardId || isLoading) return;
    localStorage.setItem(getStorageKeyForBoard(currentBoardId, 'map-assets'), JSON.stringify(mapAssets));
  }, [mapAssets, currentBoardId, isLoading]);

  const initializeObjectPlacement = (type: CelestialObjectType) => {
    setIsPlacingObject(true);
    setPlacingObjectType(type);
    setIsCreatingSector(false);
    setIsPlacingAsset(false);
    setPlacingAssetId(null);
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

    // Save to history before making the change
    addToHistory({
      type: 'CREATE_OBJECT',
      payload: {
        objects: [newObject]
      }
    });

    setCelestialObjects(prev => [...prev, newObject]);
    setSelectedObjectId(id);
    setIsPlacingObject(false);
    setPlacingObjectType(null);
  };

  const deleteObject = (id: string) => {
    // First get all child objects to also delete
    const allDescendantIds = getAllDescendantIds(id);
    const objectsToDelete = celestialObjects.filter(obj => 
      obj.id === id || allDescendantIds.includes(obj.id)
    );
    
    // Save to history before making the change
    addToHistory({
      type: 'DELETE_OBJECT',
      payload: {
        objects: objectsToDelete
      }
    });
    
    setCelestialObjects(prev => prev.filter(obj => 
      obj.id !== id && !allDescendantIds.includes(obj.id)
    ));
    
    if (selectedObjectId === id || allDescendantIds.includes(selectedObjectId || '')) {
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
      setSelectedMapAssetId(null); // Deselect any selected map asset
    }
  };

  const updateObjectSettings = (id: string, settings: Partial<CelestialObject>) => {
    // Get original object first for history
    const originalObject = celestialObjects.find(obj => obj.id === id);
    if (!originalObject) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_OBJECT',
      payload: {
        objects: [originalObject]
      }
    });

    setCelestialObjects(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, ...settings } : obj
      )
    );
  };

  const updateObjectPosition = (id: string, x: number, y: number) => {
    // Get original objects first for history
    const objectToMove = celestialObjects.find(obj => obj.id === id);
    if (!objectToMove) return;

    // Find all descendants to record their positions too
    const allDescendantIds = getAllDescendantIds(id);
    const descendantObjects = celestialObjects.filter(obj => allDescendantIds.includes(obj.id));

    // Save to history before making the change
    addToHistory({
      type: 'MOVE_OBJECT',
      payload: {
        objects: [objectToMove, ...descendantObjects]
      }
    });

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
    
    // Save to history before making the change
    addToHistory({
      type: 'CREATE_OBJECT',
      payload: {
        objects: [newObject]
      }
    });

    setCelestialObjects(prev => [...prev, newObject]);
    setSelectedObjectId(id);
  };

  const getObjectById = (id: string) => {
    return celestialObjects.find(obj => obj.id === id);
  };

  const getChildObjects = (parentId: string) => {
    return celestialObjects.filter(obj => obj.parentId === parentId);
  };

  // Asset management functions
  const uploadAsset = (name: string, dataUrl: string): string => {
    const id = crypto.randomUUID();
    const newAsset: Asset = {
      id,
      name,
      dataUrl,
      createdAt: Date.now()
    };

    // Save to history before making the change
    addToHistory({
      type: 'UPLOAD_ASSET',
      payload: {
        assets: [newAsset]
      }
    });

    setAssets(prev => [...prev, newAsset]);
    return id;
  };

  const deleteAsset = (id: string) => {
    // Get the asset for history
    const assetToDelete = assets.find(asset => asset.id === id);
    if (!assetToDelete) return;

    // Also find any map assets that use this asset
    const mapAssetsToDelete = mapAssets.filter(ma => ma.assetId === id);

    // Save to history before making the change
    addToHistory({
      type: 'DELETE_ASSET',
      payload: {
        assets: [assetToDelete],
        mapAssets: mapAssetsToDelete
      }
    });

    // Delete the asset
    setAssets(prev => prev.filter(asset => asset.id !== id));

    // Delete any map assets that use this asset
    if (mapAssetsToDelete.length > 0) {
      setMapAssets(prev => prev.filter(ma => ma.assetId !== id));
      
      // If a deleted map asset was selected, clear selection
      if (selectedMapAssetId && mapAssetsToDelete.some(ma => ma.id === selectedMapAssetId)) {
        setSelectedMapAssetId(null);
      }
    }
  };

  const getAssetById = (id: string): Asset | undefined => {
    return assets.find(asset => asset.id === id);
  };

  const initializeAssetPlacement = (assetId: string) => {
    // Verify the asset exists
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    setIsPlacingAsset(true);
    setPlacingAssetId(assetId);
    setIsPlacingObject(false);
    setIsCreatingSector(false);
    setPlacingObjectType(null);
    setCurrentSectorPoints([]);
  };

  const placeAsset = (x: number, y: number) => {
    if (!isPlacingAsset || !placingAssetId) return;

    const asset = assets.find(a => a.id === placingAssetId);
    if (!asset) {
      setIsPlacingAsset(false);
      setPlacingAssetId(null);
      return;
    }

    // Create a new map asset
    const id = crypto.randomUUID();
    const newMapAsset: MapAsset = {
      id,
      assetId: placingAssetId,
      x,
      y,
      width: 200, // Default width
      height: 200 // Default height
    };

    // Save to history before making the change
    addToHistory({
      type: 'CREATE_MAP_ASSET',
      payload: {
        mapAssets: [newMapAsset]
      }
    });

    // Add the new map asset
    setMapAssets(prev => [...prev, newMapAsset]);
    setSelectedMapAssetId(id);
    setIsPlacingAsset(false);
    setPlacingAssetId(null);
  };

  const updateAssetPosition = (id: string, x: number, y: number) => {
    // Get original map asset for history
    const originalAsset = mapAssets.find(ma => ma.id === id);
    if (!originalAsset) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_MAP_ASSET',
      payload: {
        mapAssets: [originalAsset]
      }
    });

    // Update the map asset position
    setMapAssets(prev => prev.map(ma => 
      ma.id === id ? { ...ma, x, y } : ma
    ));
  };

  const updateAssetSize = (id: string, width: number, height: number, x: number, y: number) => {
    // Get original map asset for history
    const originalAsset = mapAssets.find(ma => ma.id === id);
    if (!originalAsset) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_MAP_ASSET',
      payload: {
        mapAssets: [originalAsset]
      }
    });

    // Update the map asset size and position
    setMapAssets(prev => prev.map(ma => 
      ma.id === id ? { ...ma, width, height, x, y } : ma
    ));
  };

  const deleteMapAsset = (id: string) => {
    // Get the map asset for history
    const mapAssetToDelete = mapAssets.find(ma => ma.id === id);
    if (!mapAssetToDelete) return;

    // Save to history before making the change
    addToHistory({
      type: 'DELETE_MAP_ASSET',
      payload: {
        mapAssets: [mapAssetToDelete]
      }
    });

    // Delete the map asset
    setMapAssets(prev => prev.filter(ma => ma.id !== id));
    
    // If this was the selected map asset, clear selection
    if (selectedMapAssetId === id) {
      setSelectedMapAssetId(null);
    }
  };

  const getMapAssetById = (id: string): MapAsset | undefined => {
    return mapAssets.find(ma => ma.id === id);
  };

  // Metadata section management
  const addMetadataSection = (objectId: string) => {
    const object = celestialObjects.find(obj => obj.id === objectId);
    if (!object) return;
    
    const newSection = {
      id: crypto.randomUUID(),
      heading: 'New Section',
      body: 'Add details here...'
    };

    // Save to history before making the change
    addToHistory({
      type: 'ADD_METADATA',
      payload: {
        metadata: {
          objectId,
          section: newSection
        }
      }
    });

    setCelestialObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        return {
          ...obj,
          metadata: [
            ...obj.metadata,
            newSection
          ]
        };
      }
      return obj;
    }));
  };

  const updateMetadataSection = (objectId: string, sectionId: string, updates: Partial<MetadataSection>) => {
    const object = celestialObjects.find(obj => obj.id === objectId);
    if (!object) return;
    
    const originalSection = object.metadata.find(section => section.id === sectionId);
    if (!originalSection) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_METADATA',
      payload: {
        metadata: {
          objectId,
          sectionId,
          section: originalSection
        }
      }
    });

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
    const object = celestialObjects.find(obj => obj.id === objectId);
    if (!object) return;
    
    const sectionToDelete = object.metadata.find(section => section.id === sectionId);
    if (!sectionToDelete) return;

    // Save to history before making the change
    addToHistory({
      type: 'DELETE_METADATA',
      payload: {
        metadata: {
          objectId,
          sectionId,
          section: sectionToDelete
        }
      }
    });

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
    // Get original object for history
    const originalObject = celestialObjects.find(obj => obj.id === objectId);
    if (!originalObject) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_OBJECT',
      payload: {
        objects: [originalObject]
      }
    });

    setCelestialObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, objectTypeId: typeId } : obj
    ));
  };

  // Sector management functions
  const initializeSectorCreation = () => {
    setIsCreatingSector(true);
    setIsPlacingObject(false);
    setIsPlacingAsset(false);
    setPlacingObjectType(null);
    setPlacingAssetId(null);
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

    // Save to history before making the change
    addToHistory({
      type: 'CREATE_SECTOR',
      payload: {
        sectors: [newSector]
      }
    });

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

    // Save to history before making the change
    addToHistory({
      type: 'CREATE_SECTOR',
      payload: {
        sectors: [newSector]
      }
    });

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
    // Get original sector for history
    const originalSector = sectors.find(sector => sector.id === id);
    if (!originalSector) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_SECTOR',
      payload: {
        sectors: [originalSector]
      }
    });

    setSectors(prev => 
      prev.map(sector => 
        sector.id === id ? { ...sector, ...updates } : sector
      )
    );
  };

  const deleteSector = (id: string) => {
    // Get sector to delete for history
    const sectorToDelete = sectors.find(sector => sector.id === id);
    if (!sectorToDelete) return;

    // Save to history before making the change
    addToHistory({
      type: 'DELETE_SECTOR',
      payload: {
        sectors: [sectorToDelete]
      }
    });

    setSectors(prev => prev.filter(sector => sector.id !== id));
    if (selectedSectorId === id) {
      setSelectedSectorId(null);
    }
  };

  const selectSector = (id: string | null) => {
    setSelectedSectorId(id);
    if (id) {
      setSelectedObjectId(null); // Deselect any selected object
      setSelectedMapAssetId(null); // Deselect any selected map asset
    }
  };

  const getSectorById = (id: string) => {
    return sectors.find(sector => sector.id === id);
  };

  // Sector metadata management
  const addSectorMetadataSection = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) return;
    
    const newSection = {
      id: crypto.randomUUID(),
      heading: 'New Section',
      body: 'Add details here...'
    };

    // Save to history before making the change
    addToHistory({
      type: 'ADD_SECTOR_METADATA',
      payload: {
        metadata: {
          sectorId,
          section: newSection
        }
      }
    });

    setSectors(prev => prev.map(sector => {
      if (sector.id === sectorId) {
        return {
          ...sector,
          metadata: [
            ...(sector.metadata || []),
            newSection
          ]
        };
      }
      return sector;
    }));
  };

  const updateSectorMetadataSection = (sectorId: string, sectionId: string, updates: Partial<MetadataSection>) => {
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector || !sector.metadata) return;
    
    const originalSection = sector.metadata.find(section => section.id === sectionId);
    if (!originalSection) return;

    // Save to history before making the change
    addToHistory({
      type: 'UPDATE_SECTOR_METADATA',
      payload: {
        metadata: {
          sectorId,
          sectionId,
          section: originalSection
        }
      }
    });

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
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector || !sector.metadata) return;
    
    const sectionToDelete = sector.metadata.find(section => section.id === sectionId);
    if (!sectionToDelete) return;

    // Save to history before making the change
    addToHistory({
      type: 'DELETE_SECTOR_METADATA',
      payload: {
        metadata: {
          sectorId,
          sectionId,
          section: sectionToDelete
        }
      }
    });

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

  // Undo functionality
  const undo = () => {
    if (actionHistory.length === 0) return;

    // Get the most recent action
    const [latestAction, ...remainingHistory] = actionHistory;

    // Perform the undo based on action type
    switch (latestAction.type) {
      case 'CREATE_OBJECT':
        if (latestAction.payload.objects && latestAction.payload.objects.length > 0) {
          const objectIds = latestAction.payload.objects.map(obj => obj.id);
          setCelestialObjects(prev => prev.filter(obj => !objectIds.includes(obj.id)));
          
          // If we were selecting one of these objects, clear selection
          if (selectedObjectId && objectIds.includes(selectedObjectId)) {
            setSelectedObjectId(null);
          }
        }
        break;

      case 'DELETE_OBJECT':
        if (latestAction.payload.objects && latestAction.payload.objects.length > 0) {
          // Restore the deleted objects
          setCelestialObjects(prev => [...prev, ...latestAction.payload.objects!]);
        }
        break;

      case 'UPDATE_OBJECT':
      case 'MOVE_OBJECT':
        if (latestAction.payload.objects && latestAction.payload.objects.length > 0) {
          // Restore objects to their previous state
          setCelestialObjects(prev => {
            const updatedObjects = [...prev];
            
            latestAction.payload.objects!.forEach(originalObj => {
              const index = updatedObjects.findIndex(obj => obj.id === originalObj.id);
              if (index !== -1) {
                updatedObjects[index] = originalObj;
              } else {
                updatedObjects.push(originalObj);
              }
            });
            
            return updatedObjects;
          });
        }
        break;

      case 'CREATE_SECTOR':
        if (latestAction.payload.sectors && latestAction.payload.sectors.length > 0) {
          const sectorIds = latestAction.payload.sectors.map(sector => sector.id);
          setSectors(prev => prev.filter(sector => !sectorIds.includes(sector.id)));
          
          // If we were selecting one of these sectors, clear selection
          if (selectedSectorId && sectorIds.includes(selectedSectorId)) {
            setSelectedSectorId(null);
          }
        }
        break;

      case 'DELETE_SECTOR':
        if (latestAction.payload.sectors && latestAction.payload.sectors.length > 0) {
          // Restore the deleted sectors
          setSectors(prev => [...prev, ...latestAction.payload.sectors!]);
        }
        break;

      case 'UPDATE_SECTOR':
        if (latestAction.payload.sectors && latestAction.payload.sectors.length > 0) {
          // Restore sectors to their previous state
          setSectors(prev => {
            const updatedSectors = [...prev];
            
            latestAction.payload.sectors!.forEach(originalSector => {
              const index = updatedSectors.findIndex(sector => sector.id === originalSector.id);
              if (index !== -1) {
                updatedSectors[index] = originalSector;
              } else {
                updatedSectors.push(originalSector);
              }
            });
            
            return updatedSectors;
          });
        }
        break;

      case 'UPLOAD_ASSET':
        if (latestAction.payload.assets && latestAction.payload.assets.length > 0) {
          const assetIds = latestAction.payload.assets.map(asset => asset.id);
          setAssets(prev => prev.filter(asset => !assetIds.includes(asset.id)));
        }
        break;

      case 'DELETE_ASSET':
        if (latestAction.payload.assets && latestAction.payload.assets.length > 0) {
          // Restore the deleted assets
          setAssets(prev => [...prev, ...latestAction.payload.assets!]);
          
          // Also restore any deleted map assets
          if (latestAction.payload.mapAssets && latestAction.payload.mapAssets.length > 0) {
            setMapAssets(prev => [...prev, ...latestAction.payload.mapAssets]);
          }
        }
        break;

      case 'CREATE_MAP_ASSET':
        if (latestAction.payload.mapAssets && latestAction.payload.mapAssets.length > 0) {
          const mapAssetIds = latestAction.payload.mapAssets.map(ma => ma.id);
          setMapAssets(prev => prev.filter(ma => !mapAssetIds.includes(ma.id)));
          
          // If we were selecting one of these map assets, clear selection
          if (selectedMapAssetId && mapAssetIds.includes(selectedMapAssetId)) {
            setSelectedMapAssetId(null);
          }
        }
        break;

      case 'UPDATE_MAP_ASSET':
        if (latestAction.payload.mapAssets && latestAction.payload.mapAssets.length > 0) {
          // Restore map assets to their previous state
          setMapAssets(prev => {
            const updatedMapAssets = [...prev];
            
            latestAction.payload.mapAssets!.forEach(originalMapAsset => {
              const index = updatedMapAssets.findIndex(ma => ma.id === originalMapAsset.id);
              if (index !== -1) {
                updatedMapAssets[index] = originalMapAsset;
              } else {
                updatedMapAssets.push(originalMapAsset);
              }
            });
            
            return updatedMapAssets;
          });
        }
        break;

      case 'DELETE_MAP_ASSET':
        if (latestAction.payload.mapAssets && latestAction.payload.mapAssets.length > 0) {
          // Restore the deleted map assets
          setMapAssets(prev => [...prev, ...latestAction.payload.mapAssets!]);
        }
        break;

      case 'ADD_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.objectId) {
          // Remove the added metadata section
          const { objectId, section } = latestAction.payload.metadata;
          setCelestialObjects(prev => prev.map(obj => {
            if (obj.id === objectId && section) {
              return {
                ...obj,
                metadata: obj.metadata.filter(s => s.id !== section.id)
              };
            }
            return obj;
          }));
        }
        break;

      case 'DELETE_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.objectId) {
          // Restore the deleted metadata section
          const { objectId, section } = latestAction.payload.metadata;
          if (section) {
            setCelestialObjects(prev => prev.map(obj => {
              if (obj.id === objectId) {
                return {
                  ...obj,
                  metadata: [...obj.metadata, section]
                };
              }
              return obj;
            }));
          }
        }
        break;

      case 'UPDATE_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.objectId) {
          // Restore the previous metadata section state
          const { objectId, sectionId, section } = latestAction.payload.metadata;
          if (section && sectionId) {
            setCelestialObjects(prev => prev.map(obj => {
              if (obj.id === objectId) {
                return {
                  ...obj,
                  metadata: obj.metadata.map(s => 
                    s.id === sectionId ? section : s
                  )
                };
              }
              return obj;
            }));
          }
        }
        break;

      case 'ADD_SECTOR_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.sectorId) {
          // Remove the added metadata section
          const { sectorId, section } = latestAction.payload.metadata;
          setSectors(prev => prev.map(sector => {
            if (sector.id === sectorId && section && sector.metadata) {
              return {
                ...sector,
                metadata: sector.metadata.filter(s => s.id !== section.id)
              };
            }
            return sector;
          }));
        }
        break;

      case 'DELETE_SECTOR_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.sectorId) {
          // Restore the deleted metadata section
          const { sectorId, section } = latestAction.payload.metadata;
          if (section) {
            setSectors(prev => prev.map(sector => {
              if (sector.id === sectorId) {
                return {
                  ...sector,
                  metadata: [...(sector.metadata || []), section]
                };
              }
              return sector;
            }));
          }
        }
        break;

      case 'UPDATE_SECTOR_METADATA':
        if (latestAction.payload.metadata && latestAction.payload.metadata.sectorId) {
          // Restore the previous metadata section state
          const { sectorId, sectionId, section } = latestAction.payload.metadata;
          if (section && sectionId) {
            setSectors(prev => prev.map(sector => {
              if (sector.id === sectorId && sector.metadata) {
                return {
                  ...sector,
                  metadata: sector.metadata.map(s => 
                    s.id === sectionId ? section : s
                  )
                };
              }
              return sector;
            }));
          }
        }
        break;
    }

    // Remove the action from history
    setActionHistory(remainingHistory);
  };

  return (
    <StarMapContext.Provider
      value={{
        celestialObjects,
        sectors,
        assets,
        mapAssets,
        isPlacingObject,
        isCreatingSector,
        isPlacingAsset,
        placingObjectType,
        placingAssetId,
        selectedObjectId,
        selectedSectorId,
        selectedMapAssetId,
        objectTypes,
        currentSectorPoints,
        isLoading,
        actionHistory,
        canUndo,
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
        uploadAsset,
        deleteAsset,
        getAssetById,
        initializeAssetPlacement,
        placeAsset,
        updateAssetPosition,
        updateAssetSize,
        deleteMapAsset,
        getMapAssetById,
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
        undo,
      }}
    >
      {children}
    </StarMapContext.Provider>
  );
};

// Custom hook for using the context - moved outside the provider component to avoid HMR issues
export const useStarMap = () => useContext(StarMapContext);
