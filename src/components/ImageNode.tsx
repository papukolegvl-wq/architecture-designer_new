import React, { useMemo } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow'
import { ComponentData } from '../types'

const ImageNode: React.FC<NodeProps<ComponentData>> = ({ data, selected }) => {
    const imageConfig = data.imageConfig

    if (!imageConfig || !imageConfig.dataURL) {
        return (
            <div style={{ padding: '10px', background: '#333', color: '#fff', borderRadius: '4px' }}>
                Ошибка: Изображение не найдено
            </div>
        )
    }

    // Calculate aspect ratio if dimensions are provided
    const aspectRatio = imageConfig.width && imageConfig.height ? imageConfig.width / imageConfig.height : undefined

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <NodeResizer
                color="#4dabf7"
                isVisible={selected}
                minWidth={50}
                minHeight={50}
                keepAspectRatio={true}
            />

            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: selected ? '2px solid #4dabf7' : '1px solid #444',
                    backgroundColor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <img
                    src={imageConfig.dataURL}
                    alt={data.label || 'Pasted content'}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                />
            </div>

            {/* Connectivity handles */}
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
        </div>
    )
}

export default React.memo(ImageNode)
