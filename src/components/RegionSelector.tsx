import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, X, Check } from 'lucide-react';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface RegionSelectorProps {
    onConfirm: (rect: Rect) => void;
    onCancel: () => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ onConfirm, onCancel }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const [selection, setSelection] = useState<Rect | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
        setSelection(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setCurrentPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            calculateSelection();
        }
    };

    const calculateSelection = () => {
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        if (width > 50 && height > 50) {
            setSelection({ x, y, width, height });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                cursor: 'crosshair',
                backgroundColor: 'rgba(0,0,0,0.3)'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Background masks to dim unselected areas */}
            {/* Visual helper: when dragging or selected, we want the "hole" to be clear */}

            <div style={{
                position: 'absolute',
                border: '2px dashed #4dabf7',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                left: isDragging ? Math.min(startPos.x, currentPos.x) : selection?.x || 0,
                top: isDragging ? Math.min(startPos.y, currentPos.y) : selection?.y || 0,
                width: isDragging ? Math.abs(currentPos.x - startPos.x) : selection?.width || 0,
                height: isDragging ? Math.abs(currentPos.y - startPos.y) : selection?.height || 0,
                display: (isDragging || selection) ? 'block' : 'none',
                pointerEvents: 'none'
            }} />

            {/* Control Panel */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#2d2d2d',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    pointerEvents: 'auto' // Allow clicking buttons
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent starting drag on header
            >
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MousePointer2 size={18} />
                    {selection ? "Область выбрана. Начать запись?" : "Выделите область для записи"}
                </span>

                {selection && (
                    <button
                        onClick={() => onConfirm(selection)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#51cf66',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                        }}
                    >
                        <Check size={16} />
                        Записать
                    </button>
                )}

                <button
                    onClick={onCancel}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#fa5252',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <X size={16} />
                    Отмена
                </button>
            </div>
        </div>
    );
};
