import React, { memo, useState } from 'react'
import { NodeProps, Handle, Position, useStore } from 'reactflow'
import { RefreshCw, Trash2 } from 'lucide-react'
import { ComponentData } from '../types'

function GhostNode({ id, data, selected }: NodeProps<ComponentData>) {
    const [isHovered, setIsHovered] = useState(false)

    const isConnecting = useStore((s) => !!s.connectionStartHandle);

    const handleRestore = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('nodeDataUpdate', {
            detail: {
                nodeId: id,
                data: {
                    ...data.originalData,
                    isGhost: false,
                    originalData: undefined
                }
            }
        });
        window.dispatchEvent(event);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('nodeDeleteRequest', {
            detail: { nodeId: id }
        });
        window.dispatchEvent(event);
    };

    const color = '#ff4040'

    return (
        <div
            style={{
                width: '10px',
                height: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isHovered ? 'rgba(255, 64, 64, 0.2)' : 'transparent',
                border: isHovered ? `1px dashed ${color}` : 'none',
                borderRadius: '50%',
                transition: 'all 0.3s',
                position: 'relative',
                cursor: 'crosshair',
                zIndex: 1000,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={`Разорванная связь: ${data.label || 'Компонент'}`}
        >
            {/* Кнопки управления (видны только при наведении) */}
            {isHovered && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    marginBottom: '8px',
                    display: 'flex',
                    gap: '4px',
                    backgroundColor: '#2d2d2d',
                    padding: '2px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    zIndex: 1001,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                    <button onClick={handleRestore} style={{ background: '#40c057', border: 'none', borderRadius: '2px', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Восстановить">
                        <RefreshCw size={10} />
                    </button>
                    <button onClick={handleDelete} style={{ background: '#fa5252', border: 'none', borderRadius: '2px', color: 'white', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Удалить всё">
                        <Trash2 size={10} />
                    </button>
                </div>
            )}

            {/* Точки подключения сходятся в одну невидимую точку в центре */}
            {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
                [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                    <React.Fragment key={`${pos}-${p}`}>
                        <Handle
                            type="target"
                            position={pos}
                            id={`${pos}-target-${p}`}
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0,
                                pointerEvents: isHovered || isConnecting ? 'all' : 'none',
                            }}
                        />
                        <Handle
                            type="source"
                            position={pos}
                            id={`${pos}-source-${p}`}
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0,
                                pointerEvents: isHovered || isConnecting ? 'all' : 'none',
                            }}
                        />
                    </React.Fragment>
                ))
            )}
        </div>
    )
}

export default memo(GhostNode)
