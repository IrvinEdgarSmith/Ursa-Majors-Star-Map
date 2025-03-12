import { useState } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Predefined space-themed colors
const spaceColors = [
  '#4287f5', // Blue
  '#42f5e3', // Teal
  '#f542e3', // Pink
  '#f5e642', // Yellow
  '#f55442', // Red
  '#8a42f5', // Purple
  '#42f55a', // Green
  '#f5a742', // Orange
  '#ffffff', // White
  '#c0c0c0', // Silver
];

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(color || spaceColors[0]);

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {spaceColors.map((presetColor, index) => (
          <button
            key={index}
            className={`w-6 h-6 rounded-full border-2 ${color === presetColor ? 'border-electric-blue' : 'border-transparent'}`}
            style={{ backgroundColor: presetColor }}
            onClick={() => handleColorChange(presetColor)}
            title={`Color ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-8 h-8 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
        />
        <input
          type="text"
          value={color || customColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="flex-grow bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white font-mono"
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
