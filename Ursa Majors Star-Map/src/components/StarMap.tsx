import { useRef, useEffect, useState, useCallback } from 'react';
import { useStarMap } from '../contexts/StarMapContext';
import { CelestialObject, OrbitalObject } from '../contexts/StarMapContext';
import ContextMenu from './ContextMenu';
import SectorFormModal from './SectorFormModal';
import { CornerDownLeft, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

// Define map boundaries
const MAP_WIDTH = 50000;
const MAP_HEIGHT = 50000;
const MAP_CENTER_X = MAP_WIDTH / 2;
const MAP_CENTER_Y = MAP_HEIGHT / 2;

// Star colors
const STAR_COLORS = [
  'rgba(255, 255, 255, 0.8)',  // White
  'rgba(200, 220, 255, 0.7)',  // Blue-white
  'rgba(255, 220, 180, 0.7)',  // Yellow-white
  'rgba(255, 180, 180, 0.6)',  // Red-ish
  'rgba(180, 180, 255, 0.7)',  // Blue-ish
  'rgba(255, 255, 220, 0.7)',  // Yellow-ish
];

// Orbit line styles
const ORBIT_BASE_COLOR = 'rgba(100, 140, 255, 0.8)';
const ORBIT_HIGHLIGHT_COLOR = 'rgba(140, 180, 255, 0.9)';

const StarMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { 
    isPlacingObject, 
    celestialObjects, 
    placeObject, 
    selectedObjectId, 
    selectObject,
    updateObjectPosition,
    getObjectById,
    isCreatingSector,
    currentSectorPoints,
    addSectorPoint,
    createSectorWithDefaultValues,
    cancelSectorCreation,
    sectors,
    selectSector,
    selectedSectorId,
    updateSector,
    getSectorById
  } = useStarMap();
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastCursorPosition, setLastCursorPosition] = useState({ x: 0, y: 0 });
  const [backgroundStars, setBackgroundStars] = useState<Array<{ 
    x: number; 
    y: number; 
    size: number; 
    opacity: number;
    color: string;
    twinkleSpeed: number;
    twinklePhase: number;
  }>>([]);
  const [foregroundStars, setForegroundStars] = useState<Array<{ 
    x: number; 
    y: number; 
    size: number; 
    opacity: number;
    color: string;
  }>>([]);
  const [starClusters, setStarClusters] = useState<Array<{
    x: number;
    y: number;
    size: number;
    stars: number;
    color: string;
  }>>([]);
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);
  const [orbitAngles, setOrbitAngles] = useState<Record<string, number>>({});
  // Pulse effect for orbit lines
  const [orbitPulse, setOrbitPulse] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  // Show sector form modal when editing a newly created sector
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  // Track whether the click originated on a sector
  const [clickedOnSector, setClickedOnSector] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    objectId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    objectId: null
  });

  // Initialize viewport to center of map
  useEffect(() => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      // Center the view on map load
      setOffset({
        x: rect.width / 2 - MAP_CENTER_X * scale,
        y: rect.height / 2 - MAP_CENTER_Y * scale
      });
    }
  }, []);

  // Generate background stars with enhanced visuals
  useEffect(() => {
    if (!mapRef.current) return;
    
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    
    // Background distant stars (more numerous, smaller)
    const bgStars = Array.from({ length: 1500 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      twinkleSpeed: Math.random() * 0.01 + 0.002,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
    
    // Foreground brighter stars (fewer, larger, brighter)
    const fgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1.5,
      opacity: Math.random() * 0.4 + 0.6,
      color: STAR_COLORS[Math.floor(Math.random() * 3)], // Favor brighter colors
    }));
    
    // Generate a few star clusters
    const clusters = Array.from({ length: 15 }, () => {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const clusterSize = Math.random() * 2000 + 1000;
      const starCount = Math.floor(Math.random() * 100) + 50;
      
      // Choose a color bias for this cluster
      const colorIndex = Math.floor(Math.random() * STAR_COLORS.length);
      
      return {
        x: centerX,
        y: centerY,
        size: clusterSize,
        stars: starCount,
        color: STAR_COLORS[colorIndex]
      };
    });
    
    setBackgroundStars(bgStars);
    setForegroundStars(fgStars);
    setStarClusters(clusters);
    
    // Create animation for twinkling stars
    const animateStars = (timestamp: number) => {
      setBackgroundStars(prev => prev.map(star => {
        // Update the twinkle phase based on the star's twinkle speed
        const newPhase = (star.twinklePhase + star.twinkleSpeed) % (Math.PI * 2);
        // Calculate new opacity based on sine wave
        const opacityDelta = Math.sin(newPhase) * 0.15;
        const baseOpacity = star.opacity - 0.15;
        
        return {
          ...star,
          opacity: baseOpacity + opacityDelta,
          twinklePhase: newPhase
        };
      }));
      
      // Animate orbit pulse
      setOrbitPulse(prev => (prev + 0.015) % (Math.PI * 2));
      
      animationFrameRef.current = requestAnimationFrame(animateStars);
    };
    
    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animateStars);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  // Helper function to calculate orbital speed
  const getOrbitalSpeed = useCallback((objType: string, orbitDistance: number) => {
    // Base speed factors - constants that don't change
    let baseSpeed = 0.05; // Base speed in radians per second
    
    switch (objType) {
      case 'planet': 
        baseSpeed = 0.03;
        break;
      case 'moon': 
        baseSpeed = 0.06;
        break;
      case 'satellite': 
        baseSpeed = 0.09;
        break;
      case 'station': 
        baseSpeed = 0.02;
        break;
    }
    
    // Adjust for orbit distance - farther objects move slower
    return baseSpeed * (100 / Math.max(orbitDistance, 20));
  }, []);

  // Helper function to get the position of an object considering its orbital hierarchy
  const getObjectPosition = (objectId: string): { x: number, y: number } => {
    const object = getObjectById(objectId);
    if (!object) return { x: 0, y: 0 };

    // If not an orbital object or has no parent, return its direct position
    if (!('parentId' in object) || !object.parentId) {
      return { x: object.x, y: object.y };
    }

    // Get the parent object and its position
    const parent = getObjectById(object.parentId);
    if (!parent) return { x: object.x, y: object.y };

    // Get the parent's position (considering its own orbit if applicable)
    const parentPos = getObjectPosition(parent.id);

    const orbitalObj = object as OrbitalObject;
    const angle = orbitAngles[object.id] || 0;

    // Calculate position based on parent position and orbit
    const orbitalX = parentPos.x + Math.cos(angle) * orbitalObj.orbitDistance;
    const orbitalY = parentPos.y + Math.sin(angle) * orbitalObj.orbitDistance;

    return { x: orbitalX, y: orbitalY };
  };

  // Animation frame handler function
  const animateOrbits = useCallback((timestamp: number) => {
    // Calculate time delta in seconds
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;
    
    // Get all orbital objects
    const orbitalObjects = celestialObjects.filter(obj => 'parentId' in obj && obj.parentId);
    
    // Update orbit angles based on time delta
    setOrbitAngles(prev => {
      const newAngles = { ...prev };
      
      orbitalObjects.forEach(obj => {
        if ('orbitDistance' in obj && obj.orbitDistance) {
          const orbitalObj = obj as OrbitalObject;
          const speed = getOrbitalSpeed(obj.type, orbitalObj.orbitDistance);
          
          // Initialize angle if not present
          if (!newAngles[obj.id]) {
            newAngles[obj.id] = Math.random() * Math.PI * 2;
          }
          
          // Update angle based on constant speed and time delta
          newAngles[obj.id] = (newAngles[obj.id] + speed * deltaTime) % (Math.PI * 2);
        }
      });
      
      return newAngles;
    });
    
    animationFrameRef.current = requestAnimationFrame(animateOrbits);
  }, [celestialObjects, getOrbitalSpeed]);

  // Set up orbital animation with a stable animation loop
  useEffect(() => {
    // Start animation loop
    lastTimeRef.current = 0; // Reset time on component mount
    animationFrameRef.current = requestAnimationFrame(animateOrbits);
    
    // Initialize orbit angles for new objects
    celestialObjects.forEach(obj => {
      if ('parentId' in obj && obj.parentId && !orbitAngles[obj.id]) {
        setOrbitAngles(prev => ({
          ...prev,
          [obj.id]: Math.random() * Math.PI * 2 // Random starting angle
        }));
      }
    });
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateOrbits]);

  // Convert screen coordinates to map coordinates
  const screenToMapCoordinates = (screenX: number, screenY: number): { x: number, y: number } => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = (screenX - rect.left - offset.x) / scale;
    const y = (screenY - rect.top - offset.y) / scale;
    
    return { x, y };
  };

  // Helper function to check if a point is inside a polygon (for sector clicking)
  const isPointInPolygon = (point: { x: number, y: number }, polygon: { x: number, y: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const intersect = ((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Check if a point is on or very close to another point (for detecting first node clicks)
  const isPointOnFirstNode = (point: { x: number, y: number }): boolean => {
    if (currentSectorPoints.length === 0) return false;
    
    const firstPoint = currentSectorPoints[0];
    const clickRadius = 8 / scale; // Size of clickable area, adjusted for zoom level
    
    const distance = Math.sqrt(
      Math.pow((firstPoint.x - point.x), 2) + 
      Math.pow((firstPoint.y - point.y), 2)
    );
    
    return distance <= clickRadius;
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    // Reset the sector click tracking state
    setClickedOnSector(false);
    
    // If sector form is open, don't process map clicks
    if (showSectorForm) {
      return;
    }
    
    if (isPlacingObject) {
      const { x, y } = screenToMapCoordinates(e.clientX, e.clientY);
      placeObject(x, y);
      return;
    }
    
    // Handle sector creation clicks
    if (isCreatingSector) {
      const { x, y } = screenToMapCoordinates(e.clientX, e.clientY);
      
      // If points exist and user clicked on the first point specifically, complete the sector
      if (currentSectorPoints.length >= 3 && isPointOnFirstNode({ x, y })) {
        // Create the sector immediately with default values
        const newSectorId = createSectorWithDefaultValues(currentSectorPoints);
        if (newSectorId) {
          setEditingSectorId(newSectorId);
          setShowSectorForm(true);
          selectSector(newSectorId);
        }
        return;
      }
      
      // Otherwise add a new point
      addSectorPoint(x, y);
      return;
    }

    // Check if we clicked on a sector
    const mapCoords = screenToMapCoordinates(e.clientX, e.clientY);
    
    // Check sectors in reverse order (top-most first)
    for (let i = sectors.length - 1; i >= 0; i--) {
      const sector = sectors[i];
      if (sector.points.length >= 3 && isPointInPolygon(mapCoords, sector.points)) {
        // Clicked on this sector
        selectSector(sector.id);
        setClickedOnSector(true);
        break;
      }
    }

    // Start map dragging regardless of whether we clicked on a sector or not
    // This is the key fix - we always allow panning to start
    setIsMapDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    setLastCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Track current mouse position for drawing sector creation preview line
    if (isCreatingSector && !showSectorForm) {
      const { x, y } = screenToMapCoordinates(e.clientX, e.clientY);
      setMousePosition({ x, y });
    } else {
      setMousePosition(null);
    }
    
    if (isMapDragging) {
      // Pan the map
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setOffset(prev => ({ 
        x: prev.x + dx, 
        y: prev.y + dy 
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && draggingObjectId) {
      // Move the selected object
      const { x, y } = screenToMapCoordinates(e.clientX, e.clientY);
      updateObjectPosition(draggingObjectId, x, y);
    }
  };

  const handleMapMouseUp = (e: React.MouseEvent) => {
    setIsMapDragging(false);
    setIsDragging(false);
    setDraggingObjectId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    // Allow much more zoom out, from 0.5 to 0.05
    const newScale = Math.min(Math.max(scale * delta, 0.05), 5);
    
    // Calculate cursor position relative to the map
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust the offset to zoom toward the cursor position
    const newOffsetX = mouseX - (mouseX - offset.x) * delta;
    const newOffsetY = mouseY - (mouseY - offset.y) * delta;
    
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectObject(id);
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      objectId: id
    });
  };

  const handleObjectClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't select if we were dragging (just finished a drag operation)
    if (!isDragging) {
      selectObject(id);
    }
  };

  const handleObjectMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    e.stopPropagation(); // Prevent map drag
    selectObject(id);
    
    // Only allow dragging non-orbital objects or parent objects
    const obj = celestialObjects.find(o => o.id === id);
    if (obj && (!('parentId' in obj) || !obj.parentId)) {
      setDraggingObjectId(id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle explicit zoom controls
  const handleZoomIn = () => {
    if (scale < 5) {
      const newScale = Math.min(scale * 1.2, 5);
      setScale(newScale);
      
      // Keep the center of the view stable
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newOffsetX = centerX - (centerX - offset.x) * (newScale / scale);
        const newOffsetY = centerY - (centerY - offset.y) * (newScale / scale);
        
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  const handleZoomOut = () => {
    if (scale > 0.05) {
      const newScale = Math.max(scale / 1.2, 0.05);
      setScale(newScale);
      
      // Keep the center of the view stable
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newOffsetX = centerX - (centerX - offset.x) * (newScale / scale);
        const newOffsetY = centerY - (centerY - offset.y) * (newScale / scale);
        
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setScale(1);
      setOffset({
        x: rect.width / 2 - MAP_CENTER_X,
        y: rect.height / 2 - MAP_CENTER_Y
      });
    }
  };

  // Handle sector form submission - now updating an existing sector
  const handleSectorFormSubmit = (name: string, color: string, color2: string) => {
    if (editingSectorId) {
      updateSector(editingSectorId, { name, color, color2 });
      setShowSectorForm(false);
      setEditingSectorId(null);
    }
  };

  // Cancel sector form
  const handleCancelSectorForm = () => {
    setShowSectorForm(false);
    setEditingSectorId(null);
  };

  // Helper function to get grid line opacity based on zoom level
  const getGridLineOpacity = () => {
    // Increase opacity as we zoom out (scale gets smaller)
    // Range: 0.25 (zoomed in) to 0.5 (zoomed out)
    return 0.25 + Math.max(0, (1 - scale) * 0.25);
  };

  // Helper function to get grid line width based on zoom level
  const getGridLineWidth = () => {
    // Slightly increase width as we zoom out
    // Range: 1.5 (zoomed in) to 2 (zoomed out)
    return 1.5 + Math.max(0, (1 - scale) * 0.5);
  };

  // Helper function to get orbit line opacity based on zoom level
  const getOrbitLineOpacity = () => {
    // Increase opacity as we zoom out (scale gets smaller)
    // Range: 0.7 (zoomed in) to 0.9 (zoomed out)
    return 0.7 + Math.max(0, (1 - scale) * 0.2);
  };

  // Helper function to get orbit line width based on zoom level
  const getOrbitLineWidth = () => {
    // Slightly increase width as we zoom out
    // Range: 1.8 (zoomed in) to 2.7 (zoomed out)
    return 1.8 + Math.max(0, (1 - scale) * 0.9);
  };

  // Helper function to get orbit pulse effect
  const getOrbitPulseEffect = () => {
    // Return a value between 0 and 0.2 for subtle pulsing
    return Math.sin(orbitPulse) * 0.1 + 0.1;
  };

  // Render object name label
  const renderObjectName = (object: CelestialObject, x: number, y: number, objectSize: number) => {
    if (!object.showName) return null;

    // Color adaptation based on object color or type
    let textColor = 'text-white';
    if (object.color) {
      // Brighten the color for text visibility
      textColor = 'text-white'; // Default to white for better visibility
    }

    // Position label above the object
    const labelStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y - objectSize/2 - 20}px`, // Position above object
      transform: 'translate(-50%, -50%)',
      // Counter-scale to maintain constant text size regardless of zoom
      transformOrigin: 'center',
      scale: `${1/scale}`,
      // Text styling
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none', // Don't interfere with mouse events
      zIndex: 25,
    };

    return (
      <div 
        style={labelStyle}
        className={`${textColor} px-1 py-0.5 border border-gray-700 shadow-md`}
      >
        {object.name}
      </div>
    );
  };

  // Determine if we should render grid lines based on zoom level
  const shouldRenderGrid = scale < 0.5;

  // Render grid lines for the map
  const renderGrid = () => {
    if (!shouldRenderGrid) return null;
    
    const gridSpacing = 5000; // Spacing between grid lines
    const gridLinesX = Math.ceil(MAP_WIDTH / gridSpacing);
    const gridLinesY = Math.ceil(MAP_HEIGHT / gridSpacing);
    
    const gridLines = [];
    
    // Get dynamic opacity and width based on zoom level
    const opacity = getGridLineOpacity();
    const lineWidth = getGridLineWidth();
    
    // Horizontal grid lines
    for (let i = 0; i <= gridLinesY; i++) {
      const y = i * gridSpacing;
      gridLines.push(
        <div 
          key={`h-${i}`}
          style={{
            position: 'absolute',
            left: '0',
            top: `${y}px`,
            width: `${MAP_WIDTH}px`,
            height: `${lineWidth}px`,
            backgroundColor: `rgba(100, 110, 160, ${opacity})`,
            pointerEvents: 'none',
          }}
        />
      );
    }
    
    // Vertical grid lines
    for (let i = 0; i <= gridLinesX; i++) {
      const x = i * gridSpacing;
      gridLines.push(
        <div 
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: '0',
            width: `${lineWidth}px`,
            height: `${MAP_HEIGHT}px`,
            backgroundColor: `rgba(100, 110, 160, ${opacity})`,
            pointerEvents: 'none',
          }}
        />
      );
    }
    
    return gridLines;
  };

  // Render map boundaries
  const renderMapBoundaries = () => {
    return (
      <div 
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          border: '2px solid rgba(100, 110, 160, 0.4)',
          pointerEvents: 'none',
        }}
      />
    );
  };

  // Render star clusters for the enhanced background
  const renderStarClusters = () => {
    return starClusters.map((cluster, index) => {
      // Skip rendering clusters if zoomed out too far
      if (scale < 0.1) return null;
      
      // Create a radial gradient for the cluster
      const gradientStyle = {
        position: 'absolute' as const,
        left: `${cluster.x}px`,
        top: `${cluster.y}px`,
        width: `${cluster.size}px`,
        height: `${cluster.size}px`,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${cluster.color.replace(')', ', 0.1)')}, rgba(0,0,0,0) 70%)`,
        pointerEvents: 'none' as const,
      };
      
      return <div key={`cluster-${index}`} style={gradientStyle}></div>;
    });
  };

  // Create a stylish orbit line
  const renderOrbitPath = (parentX: number, parentY: number, orbitDistance: number, isSelected: boolean) => {
    // Get dynamic orbit styling
    const orbitOpacity = getOrbitLineOpacity();
    const orbitWidth = getOrbitLineWidth();
    const pulseEffect = getOrbitPulseEffect();
    
    // Orbit container style
    const circleStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${parentX}px`,
      top: `${parentY}px`,
      width: `${orbitDistance * 2}px`,
      height: `${orbitDistance * 2}px`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    };
    
    // Enhanced styling for orbit paths
    const baseOpacity = isSelected ? orbitOpacity + 0.1 : orbitOpacity;
    const glowOpacity = isSelected ? 0.3 : 0.15;
    
    return (
      <div style={circleStyle}>
        {/* Main orbit line with dashed pattern */}
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `${orbitWidth}px dashed ${ORBIT_BASE_COLOR.replace('0.8', String(baseOpacity))}`,
            boxShadow: `0 0 ${6 + pulseEffect * 4}px ${ORBIT_HIGHLIGHT_COLOR.replace('0.9', String(glowOpacity))}`,
          }}
        />
        
        {/* Subtle gradient overlay for added dimension */}
        {isSelected && (
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(0,0,0,0) 97%, ${ORBIT_HIGHLIGHT_COLOR.replace('0.9', String(0.4 + pulseEffect))})`,
            }}
          />
        )}
      </div>
    );
  };

  // Create a stylish orbit connection line
  const renderOrbitConnectionLine = (parentX: number, parentY: number, objectX: number, objectY: number, isSelected: boolean) => {
    // Get dynamic orbit styling
    const orbitOpacity = getOrbitLineOpacity();
    const orbitWidth = getOrbitLineWidth();
    const pulseEffect = getOrbitPulseEffect();
    const angle = Math.atan2(objectY - parentY, objectX - parentX);
    const distance = Math.sqrt(Math.pow(objectX - parentX, 2) + Math.pow(objectY - parentY, 2));
    
    // Enhanced styling for orbit connections
    const baseOpacity = isSelected ? orbitOpacity + 0.1 : orbitOpacity;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: `${parentX}px`,
          top: `${parentY}px`,
          width: `${distance}px`,
          height: `${orbitWidth}px`,
          background: `linear-gradient(to right, ${ORBIT_BASE_COLOR.replace('0.8', String(baseOpacity - 0.1))}, ${ORBIT_HIGHLIGHT_COLOR.replace('0.9', String(baseOpacity))})`,
          transform: `translate(0, 0) rotate(${angle * 180 / Math.PI}deg)`,
          transformOrigin: '0 50%',
          pointerEvents: 'none',
          boxShadow: isSelected ? `0 0 ${3 + pulseEffect * 2}px ${ORBIT_HIGHLIGHT_COLOR.replace('0.9', '0.3')}` : 'none',
        }}
      />
    );
  };

  // Render sectors with gradient fills
  const renderSectors = () => {
    return sectors.map(sector => {
      if (sector.points.length < 3) return null;
      
      // Create SVG path for sector polygon
      const pathPoints = sector.points.map(point => `${point.x},${point.y}`).join(' ');
      
      // Create gradient style with both colors
      const gradientStyle = sector.color2 
        ? `url(#sectorGradient-${sector.id})` 
        : sector.color;
        
      // Check if this sector is selected
      const isSelected = selectedSectorId === sector.id;
      
      return (
        <div key={`sector-${sector.id}`} className="absolute inset-0" style={{ zIndex: 5 }}>
          <svg
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="absolute top-0 left-0"
          >
            {/* Define gradient if we have two colors */}
            {sector.color2 && (
              <defs>
                <linearGradient id={`sectorGradient-${sector.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={sector.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={sector.color2} stopOpacity="0.25" />
                </linearGradient>
              </defs>
            )}
            
            {/* Fill polygon - with pointer events for clicking but no stopPropagation */}
            <polygon
              points={pathPoints}
              fill={gradientStyle}
              stroke={sector.color}
              strokeWidth={isSelected ? "3" : "2"}
              strokeOpacity={isSelected ? "1" : "0.8"}
              strokeLinejoin="round"
              style={{ 
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              className={isSelected ? "sector-selected" : ""}
            />
            
            {/* Render sector points */}
            {sector.points.map((point, idx) => (
              <circle
                key={`sector-point-${sector.id}-${idx}`}
                cx={point.x}
                cy={point.y}
                r={isSelected ? 5 / scale : 4 / scale}
                fill={sector.color}
                opacity={isSelected ? 1 : 0.8}
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </svg>
          
          {/* Sector name label if enabled */}
          {sector.showName && (
            <div
              style={{
                position: 'absolute',
                left: `${sector.points.reduce((sum, p) => sum + p.x, 0) / sector.points.length}px`,
                top: `${sector.points.reduce((sum, p) => sum + p.y, 0) / sector.points.length}px`,
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center',
                scale: `${2/scale}`,
                color: sector.color,
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                padding: '8px',
                pointerEvents: 'none',
                zIndex: 6,
              }}
              className="select-none"
            >
              {sector.name}
            </div>
          )}
        </div>
      );
    });
  };

  // Render sector creation preview
  const renderSectorCreationPreview = () => {
    if (!isCreatingSector || currentSectorPoints.length === 0 || showSectorForm) return null;
    
    // Create SVG path for current points
    const pathPoints = currentSectorPoints.map(point => `${point.x},${point.y}`).join(' ');
    
    // Preview color for creating sectors
    const previewColor = 'rgba(100, 170, 255, 0.7)';
    const highlightColor = 'rgba(120, 200, 255, 0.9)';
    
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
        <svg
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="absolute top-0 left-0 pointer-events-none"
        >
          {/* Current sector outline */}
          <polyline
            points={pathPoints}
            fill="none"
            stroke={previewColor}
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeLinejoin="round"
          />
          
          {/* Preview line to mouse position */}
          {mousePosition && currentSectorPoints.length > 0 && (
            <line
              x1={currentSectorPoints[currentSectorPoints.length - 1].x}
              y1={currentSectorPoints[currentSectorPoints.length - 1].y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke={previewColor}
              strokeWidth="2"
              strokeDasharray="8 4"
            />
          )}
          
          {/* Preview line to close the shape */}
          {mousePosition && currentSectorPoints.length >= 3 && (
            <line
              x1={mousePosition.x}
              y1={mousePosition.y}
              x2={currentSectorPoints[0].x}
              y2={currentSectorPoints[0].y}
              stroke={previewColor}
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="5 5"
            />
          )}
          
          {/* Points */}
          {currentSectorPoints.map((point, idx) => (
            <circle
              key={`preview-point-${idx}`}
              cx={point.x}
              cy={point.y}
              r={idx === 0 ? 6 / scale : 4 / scale}
              fill={idx === 0 ? highlightColor : previewColor}
              strokeWidth={idx === 0 ? 2 / scale : 0}
              stroke={idx === 0 ? 'rgba(255, 255, 255, 0.8)' : 'none'}
            />
          ))}
          
          {/* Current mouse position dot */}
          {mousePosition && (
            <circle
              cx={mousePosition.x}
              cy={mousePosition.y}
              r={4 / scale}
              fill="rgba(255, 255, 255, 0.5)"
            />
          )}
        </svg>
        
        {/* First point highlight when close enough to close the sector */}
        {mousePosition && currentSectorPoints.length >= 3 && (
          (() => {
            // Check if mouse is directly over the first point
            const isOverFirstPoint = isPointOnFirstNode(mousePosition);
            
            // If over first point, highlight it with a pulsing effect
            return isOverFirstPoint ? (
              <div
                style={{
                  position: 'absolute',
                  left: `${currentSectorPoints[0].x}px`,
                  top: `${currentSectorPoints[0].y}px`,
                  width: `${20 / scale}px`,
                  height: `${20 / scale}px`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ) : null;
          })()
        )}
      </div>
    );
  };

  const renderCelestialObject = (object: CelestialObject) => {
    const isSelected = selectedObjectId === object.id;
    const isDraggingThis = draggingObjectId === object.id;
    
    // If object is orbital and has a parent
    if ('parentId' in object && object.parentId) {
      const parent = getObjectById(object.parentId);
      if (!parent) return null;
      
      // Calculate position based on orbital hierarchy
      const position = getObjectPosition(object.id);
      // Get parent's position for drawing the orbit line
      const parentPosition = getObjectPosition(parent.id);
      
      return renderOrbitalObject(
        object, 
        position.x, 
        position.y, 
        parentPosition.x, 
        parentPosition.y, 
        isSelected,
        isDraggingThis
      );
    }
    
    // For non-orbital objects:
    let className = '';
    let style: React.CSSProperties = {
      left: `${object.x}px`,
      top: `${object.y}px`,
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      borderRadius: '50%',
      cursor: isDraggingThis ? 'grabbing' : 'grab',
      zIndex: isSelected ? 20 : (isDraggingThis ? 30 : 10),
    };

    // Apply custom color if it exists
    if (object.color) {
      style.backgroundColor = object.color;
      style.boxShadow = `0 0 30px ${object.color}80`;
    }

    // Add dragging visual feedback
    if (isDraggingThis) {
      style.boxShadow = object.color 
        ? `0 0 40px ${object.color}aa, 0 0 15px rgba(255, 255, 255, 0.7)` 
        : '0 0 40px rgba(255, 200, 0, 0.8), 0 0 15px rgba(255, 255, 255, 0.7)';
    }

    let objectSize = 0;

    switch (object.type) {
      case 'sun':
        className = `sun ${object.color ? '' : 'sun-yellow'} ${isSelected ? 'ring-2 ring-electric-blue' : ''}`;
        style = {
          ...style,
          width: `${object.size}px`,
          height: `${object.size}px`,
          boxShadow: isDraggingThis 
            ? (object.color ? `0 0 40px ${object.color}aa, 0 0 15px rgba(255, 255, 255, 0.7)` : '0 0 40px rgba(255, 200, 0, 0.8), 0 0 15px rgba(255, 255, 255, 0.7)')
            : (object.color ? `0 0 30px ${object.color}80` : '0 0 30px rgba(255, 200, 0, 0.6)'),
        };
        objectSize = object.size;
        break;
      case 'star':
        className = `sun ${object.color ? '' : 'sun-blue'} ${isSelected ? 'ring-2 ring-electric-blue' : ''}`;
        style = {
          ...style,
          width: `${object.size}px`,
          height: `${object.size}px`,
          boxShadow: isDraggingThis 
            ? (object.color ? `0 0 40px ${object.color}aa, 0 0 15px rgba(255, 255, 255, 0.7)` : '0 0 40px rgba(100, 200, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.7)')
            : (object.color ? `0 0 30px ${object.color}80` : '0 0 30px rgba(100, 200, 255, 0.6)'),
        };
        objectSize = object.size;
        break;
      case 'astralBody':
        className = `${isSelected ? 'ring-2 ring-electric-blue' : ''}`;
        style = {
          ...style,
          width: `${object.sizeX}px`,
          height: `${object.sizeY}px`,
          backgroundColor: object.color || '#aaa',
          border: '1px solid #ccc',
          boxShadow: isDraggingThis
            ? (object.color ? `0 0 25px ${object.color}aa, 0 0 10px rgba(255, 255, 255, 0.5)` : '0 0 25px rgba(150, 150, 150, 0.7), 0 0 10px rgba(255, 255, 255, 0.5)')
            : (object.color ? `0 0 15px ${object.color}80` : '0 0 15px rgba(150, 150, 150, 0.4)'),
          borderRadius: object.sizeX === object.sizeY ? '50%' : '30%',
        };
        objectSize = Math.max(object.sizeX, object.sizeY);
        
        // If orbit distance is set, add styled orbit circle
        if (object.orbitDistance && object.orbitDistance > 0) {
          return (
            <div key={object.id} style={{ position: 'absolute', left: `${object.x}px`, top: `${object.y}px` }}>
              {/* Render enhanced orbit path */}
              {renderOrbitPath(object.x, object.y, object.orbitDistance, isSelected)}
              <div 
                className={className}
                style={style}
                onClick={(e) => handleObjectClick(object.id, e)}
                onMouseDown={(e) => handleObjectMouseDown(object.id, e)}
                onContextMenu={(e) => handleContextMenu(object.id, e)}
              />
              {object.showName && renderObjectName(object, object.x, object.y, objectSize)}
            </div>
          );
        }
        break;
    }

    // Performance optimization: don't render very small objects when zoomed out too far
    if (scale < 0.2 && objectSize * scale < 3) {
      return null;
    }

    return (
      <div key={object.id}>
        <div 
          className={className}
          style={style}
          onClick={(e) => handleObjectClick(object.id, e)}
          onMouseDown={(e) => handleObjectMouseDown(object.id, e)}
          onContextMenu={(e) => handleContextMenu(object.id, e)}
        />
        {object.showName && renderObjectName(object, object.x, object.y, objectSize)}
      </div>
    );
  };

  const renderOrbitalObject = (
    object: CelestialObject,
    x: number,
    y: number,
    parentX: number,
    parentY: number,
    isSelected: boolean,
    isDraggingThis: boolean
  ) => {
    const orbitalObj = object as OrbitalObject;
    
    let className = `${isSelected ? 'ring-2 ring-electric-blue' : ''}`;
    let style: React.CSSProperties = {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      borderRadius: '50%',
      cursor: 'pointer',
      zIndex: isSelected ? 20 : (isDraggingThis ? 30 : 10),
    };
    
    // Apply custom color if it exists
    if (object.color) {
      style.backgroundColor = object.color;
      style.boxShadow = `0 0 10px ${object.color}80`;
    }
    
    // Style based on object type
    switch (object.type) {
      case 'planet':
        style = {
          ...style,
          width: `${orbitalObj.size}px`,
          height: `${orbitalObj.size}px`,
          backgroundColor: object.color || '#4287f5',
          boxShadow: object.color ? `0 0 10px ${object.color}80` : '0 0 10px rgba(66, 135, 245, 0.6)',
        };
        break;
      case 'moon':
        style = {
          ...style,
          width: `${orbitalObj.size}px`,
          height: `${orbitalObj.size}px`,
          backgroundColor: object.color || '#d4d4d4',
          boxShadow: object.color ? `0 0 8px ${object.color}80` : '0 0 8px rgba(200, 200, 200, 0.4)',
        };
        break;
      case 'satellite':
        style = {
          ...style,
          width: `${orbitalObj.size}px`,
          height: `${orbitalObj.size}px`,
          backgroundColor: object.color || '#73c2fb',
          boxShadow: object.color ? `0 0 6px ${object.color}80` : '0 0 6px rgba(115, 194, 251, 0.5)',
        };
        break;
      case 'station':
        style = {
          ...style,
          width: `${orbitalObj.size}px`,
          height: `${orbitalObj.size}px`,
          backgroundColor: object.color || '#f5b642',
          boxShadow: object.color ? `0 0 8px ${object.color}80` : '0 0 8px rgba(245, 182, 66, 0.5)',
          borderRadius: '20%',
        };
        break;
    }

    // Skip rendering tiny objects when zoomed far out to improve performance
    const objectSize = orbitalObj.size;
    if (scale < 0.2 && objectSize * scale < 3) {
      return null;
    }

    // Always render orbit paths now, but style differently based on zoom
    const renderOrbitDetails = scale >= 0.1;
    
    return (
      <div key={object.id}>
        {/* Enhanced Orbital path circle */}
        {renderOrbitPath(parentX, parentY, orbitalObj.orbitDistance, isSelected)}
        
        {/* Enhanced Connection line to parent */}
        {renderOrbitConnectionLine(parentX, parentY, x, y, isSelected)}
        
        {/* The orbital object itself */}
        <div 
          className={className}
          style={style}
          onClick={(e) => handleObjectClick(object.id, e)}
          onMouseDown={(e) => handleObjectClick(object.id, e)}
          onContextMenu={(e) => handleContextMenu(object.id, e)}
        />

        {/* Object name label if enabled */}
        {object.showName && renderObjectName(object, x, y, orbitalObj.size)}
      </div>
    );
  };

  return (
    <div 
      ref={mapRef}
      className="relative flex-grow bg-gray-950 overflow-hidden cursor-move"
      onMouseDown={handleMapMouseDown}
      onMouseMove={handleMapMouseMove}
      onMouseUp={handleMapMouseUp}
      onMouseLeave={handleMapMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background with multiple layers for depth effect */}
      <div className="absolute inset-0 bg-[#050811]"></div>
      
      {/* Background star clusters */}
      <div 
        className="absolute inset-0 transform"
        style={{
          transform: `translate(${offset.x * 0.2}px, ${offset.y * 0.2}px) scale(${scale})`,
          transformOrigin: '0 0',
          opacity: 0.5,
        }}
      >
        {renderStarClusters()}
      </div>
      
      {/* Background distant stars with parallax effect */}
      <div 
        className="absolute inset-0 transform"
        style={{
          transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {backgroundStars.map((star, i) => (
          <div 
            key={`bg-${i}`}
            className="star"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              backgroundColor: star.color
            }}
          />
        ))}
      </div>
      
      {/* Foreground brighter stars with stronger parallax effect */}
      <div 
        className="absolute inset-0 transform"
        style={{
          transform: `translate(${offset.x * 0.6}px, ${offset.y * 0.6}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {foregroundStars.map((star, i) => (
          <div 
            key={`fg-${i}`}
            className="star"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}`
            }}
          />
        ))}
      </div>
      
      {/* Map transformation container */}
      <div 
        className="absolute inset-0 transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Map boundaries */}
        {renderMapBoundaries()}
        
        {/* Grid lines - only visible when zoomed out */}
        {shouldRenderGrid && renderGrid()}
        
        {/* Render sectors */}
        {renderSectors()}
        
        {/* Render celestial objects */}
        {celestialObjects.map(renderCelestialObject)}
        
        {/* Render sector creation preview */}
        {renderSectorCreationPreview()}
      </div>
      
      {/* Zoom controls */}
      {showZoomControls && (
        <div className="absolute top-4 right-4 flex flex-col bg-space-black bg-opacity-60 p-1 rounded-lg border border-gray-800">
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-800 rounded-md text-electric-blue"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-800 rounded-md text-electric-blue"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={handleResetView}
            className="p-2 hover:bg-gray-800 rounded-md text-electric-blue"
            title="Reset View"
          >
            <Maximize size={20} />
          </button>
          <div className="border-t border-gray-700 my-1"></div>
          <div className="text-xs text-center py-1 text-gray-300">
            {Math.round(scale * 100)}%
          </div>
        </div>
      )}
      
      {/* Navigation indicator - shows when at map edge */}
      <div 
        className="absolute bottom-4 right-4 bg-space-black bg-opacity-60 px-2 py-1 rounded text-xs text-gray-400"
      >
        Map Size: 50,000 × 50,000
      </div>
      
      {isPlacingObject && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-canary-yellow bg-gray-900 bg-opacity-75 py-2 px-4 rounded-lg">
            Click anywhere on the map to place your object
          </div>
        </div>
      )}

      {isCreatingSector && currentSectorPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-canary-yellow bg-gray-900 bg-opacity-75 py-2 px-4 rounded-lg">
            Click on the map to place sector points
          </div>
        </div>
      )}

      {isCreatingSector && currentSectorPoints.length > 0 && !showSectorForm && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-gray-900 bg-opacity-90 py-2 px-4 rounded-lg text-sm text-gray-300">
            <span className="text-electric-blue mr-1">
              {currentSectorPoints.length}
            </span>
            {currentSectorPoints.length === 1 ? 'point' : 'points'} placed. 
            {currentSectorPoints.length >= 3 && 
              ' Click on the first point to complete the sector.'}
          </div>
        </div>
      )}

      {/* Dragging indicator */}
      {draggingObjectId && (
        <div className="fixed bottom-4 left-4 bg-space-black bg-opacity-60 px-3 py-2 rounded text-sm text-electric-blue">
          Dragging object...
        </div>
      )}

      {/* Selected sector indicator */}
      {selectedSectorId && (
        <div className="fixed bottom-4 left-4 bg-space-black bg-opacity-60 px-3 py-2 rounded text-sm text-electric-blue">
          Sector selected
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          objectId={contextMenu.objectId}
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        />
      )}

      {/* Sector Form Modal */}
      {showSectorForm && editingSectorId && (
        <SectorFormModal
          isEditing={true}
          sectorId={editingSectorId}
          onSubmit={handleSectorFormSubmit}
          onCancel={handleCancelSectorForm}
        />
      )}
    </div>
  );
};

export default StarMap;
