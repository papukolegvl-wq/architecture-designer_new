import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';

const ShapeNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const shapeType = data.shapeType || 'rectangle'; // 'rectangle', 'circle'
    
    // Default colors for shape
    const bgColor = 'transparent';
    const borderColor = data.customColor || (selected ? '#4dabf7' : '#5c7cfa');

    let borderRadius = '8px';
    if (shapeType === 'circle') {
        borderRadius = '50%';
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                minWidth: '60px',
                minHeight: '60px',
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: borderRadius,
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                cursor: selected ? 'move' : 'pointer',
            }}
        >
            <NodeResizer
                color="#4dabf7"
                isVisible={selected}
                minWidth={60}
                minHeight={60}
                handleStyle={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                }}
            />

            {/* Connection Handles */}
            {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => (
                <React.Fragment key={pos}>
                    <Handle
                        type="target"
                        position={pos}
                        id={`${pos}-target`}
                        style={{ opacity: 0, width: '1px', height: '1px' }}
                    />
                    <Handle
                        type="source"
                        position={pos}
                        id={`${pos}-source`}
                        style={{ opacity: 0, width: '1px', height: '1px' }}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

export default React.memo(ShapeNode);
