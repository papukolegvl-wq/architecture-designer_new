import React from 'react';
import { StickyNote, Type, Square, Circle, Triangle } from 'lucide-react';
import { ComponentType } from '../types';

interface QuickToolsMenuProps {
  onAddQuickNode: (type: string, shapeType?: string) => void;
}

const QuickToolsMenu: React.FC<QuickToolsMenuProps> = ({ onAddQuickNode }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '56px', // Below the top TabsPanel/FilePanel
        left: '16px',
        display: 'flex',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: 'var(--color-bg-panel, #252526)',
        border: '1px solid var(--color-border, #3d3d3d)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 10,
        alignItems: 'center'
      }}
    >
      <button
        onClick={() => onAddQuickNode('note')}
        title="Стикер"
        style={buttonStyle}
      >
        <StickyNote size={18} color="#ffd666" />
      </button>
      <button
        onClick={() => onAddQuickNode('text')}
        title="Текст"
        style={buttonStyle}
      >
        <Type size={18} color="#fff" />
      </button>
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border, #3d3d3d)', margin: '0 8px' }} />
      <button
        onClick={() => onAddQuickNode('shape', 'rectangle')}
        title="Прямоугольник"
        style={buttonStyle}
      >
        <Square size={18} color="#4dabf7" />
      </button>
      <button
        onClick={() => onAddQuickNode('shape', 'circle')}
        title="Круг"
        style={buttonStyle}
      >
        <Circle size={18} color="#4dabf7" />
      </button>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
};

export default QuickToolsMenu;
