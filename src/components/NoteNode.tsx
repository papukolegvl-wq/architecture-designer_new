import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useStore, NodeResizer, useReactFlow } from 'reactflow';
import { StickyNote, Link as LinkIcon, Link2 } from 'lucide-react';
import { ComponentLink } from '../types';

const NoteNode: React.FC<NodeProps<any> & {
    onLinkClick?: (link: ComponentLink) => void,
    onLinkConfigClick?: (nodeId: string) => void
}> = ({ id, data, selected, onLinkClick, onLinkConfigClick }) => {
    const { getNodes } = useReactFlow();
    const zoom = useStore((s) => s.transform[2]);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Примечание');
    const [isHovered, setIsHovered] = useState(false);
    const [isManuallyResized, setIsManuallyResized] = useState(data.isManuallyResized || false);
    const [childNodes, setChildNodes] = useState<string[]>(data.childNodes || []);

    // Ref to track if component is mounted
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const updateSize = React.useCallback(() => {
        if (!isMounted.current) return;
        const allNodes = getNodes(); // Use getNodes from hook
        const node = allNodes.find((n) => n.id === id);
        if (!node) return;

        const padding = 20;
        const minWidth = 150;
        const minHeight = 80;

        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const currentWidth = node.width || minWidth;
        const currentHeight = node.height || minHeight;

        // Detect nodes inside this note
        const insideNodes = allNodes.filter((n) => {
            if (n.id === id || n.parentNode === id) return false;

            const nX = n.position.x;
            const nY = n.position.y;
            const nW = n.width || 0;
            const nH = n.height || 0;
            const nCenterX = nX + nW / 2;
            const nCenterY = nY + nH / 2;

            return (
                nCenterX > nodeX &&
                nCenterX < nodeX + currentWidth &&
                nCenterY > nodeY &&
                nCenterY < nodeY + currentHeight
            );
        });

        const childIds = insideNodes.map((n) => n.id);
        const childrenChanged = JSON.stringify(childIds.sort()) !== JSON.stringify(childNodes.sort());

        if (childrenChanged) {
            if (isMounted.current) {
                setChildNodes(childIds);
            }
        }

        // Auto-resize logic (Frame behavior)
        if ((!isManuallyResized && insideNodes.length > 0) || childrenChanged) {
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            if (insideNodes.length > 0) {
                insideNodes.forEach((n) => {
                    minX = Math.min(minX, n.position.x);
                    minY = Math.min(minY, n.position.y);
                    maxX = Math.max(maxX, n.position.x + (n.width || 0));
                    maxY = Math.max(maxY, n.position.y + (n.height || 0));
                });

                // Only resize if we are wrapping children
                if (!isManuallyResized) {
                    const newWidth = Math.max(minWidth, maxX - minX + padding * 2);
                    const newHeight = Math.max(minHeight, maxY - minY + padding * 2);

                    if (Math.abs(newWidth - currentWidth) > 5 || Math.abs(newHeight - currentHeight) > 5) {
                        // We would dispatch an event here if we wanted App.tsx to handle it
                        // For now, we rely on standard ReactFlow resizing or node updates
                        // But since NoteNode logic in App.tsx might not listen to 'noteSizeUpdate', 
                        // we might need to add it or just let it be manual.
                        // However, standard Frame behavior implies auto-resize. 
                        // Let's at least support NodeResizer for manual frames.
                    }
                }
            }
        }
    }, [id, getNodes, isManuallyResized, childNodes]);

    React.useEffect(() => {
        updateSize();
        const interval = setInterval(updateSize, 2000);
        return () => clearInterval(interval);
    }, [updateSize]);


    const connectedHandleIds = useStore((s) =>
        s.edges
            .filter((e) => e.source === id || e.target === id)
            .map((e) => (e.source === id ? e.sourceHandle : e.targetHandle))
    );
    const isConnecting = useStore((s) => !!s.connectionStartHandle);

    const isSimple = zoom < 0.4;

    const handleDoubleClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        // Отправляем событие обновления метки
        window.dispatchEvent(
            new CustomEvent('nodeLabelUpdate', {
                detail: { nodeId: id, label: label },
            })
        );
    }, [id, label]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                setIsEditing(false);
                handleBlur();
            }
        },
        [handleBlur]
    );

    return (
        <div
            style={{
                padding: isSimple ? '4px' : '12px',
                borderRadius: '8px',
                backgroundColor: data.color || '#fffbe6',
                border: `1px solid ${selected ? '#ffd666' : (data.color || '#ffe58f')}`,
                color: '#262626',
                minWidth: isSimple ? '40px' : '150px',
                minHeight: isSimple ? '40px' : '80px',
                boxShadow: selected ? '0 0 0 2px #ffe58f80' : '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '14px',
                cursor: isEditing ? 'text' : 'pointer',
                transition: 'all 0.2s',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleDoubleClick}
        >
            <NodeResizer
                isVisible={selected}
                minWidth={150}
                minHeight={80}
                color="#e0c000"
                onResizeStart={() => setIsManuallyResized(true)}
            />
            {!isSimple && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                        <StickyNote size={14} />
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Note</span>
                    </div>
                    {!isSimple && (
                        <div style={{ display: 'flex', gap: '4px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                            {data.link && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onLinkClick) onLinkClick(data.link);
                                    }}
                                    style={{
                                        background: 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#51cf66',
                                        padding: '2px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    title="Перейти по ссылке"
                                >
                                    <LinkIcon size={12} />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onLinkConfigClick) onLinkConfigClick(id);
                                }}
                                style={{
                                    background: 'rgba(0,0,0,0.05)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: data.link ? '#51cf66' : '#888',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
                            >
                                <Link2 size={12} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isSimple ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <StickyNote size={24} color="#ffd666" />
                </div>
            ) : isEditing ? (
                <textarea
                    autoFocus
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                    }}
                />
            ) : (
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
                    {label}
                </div>
            )}

            {/* Handles for NoteNode */}
            {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
                [0, 50, 100].map((p) => {
                    const isHorizontal = pos === Position.Top || pos === Position.Bottom;
                    const isCenter = p === 50;
                    const targetId = `${pos}-target-${p}`;
                    const sourceId = `${pos}-source-${p}`;

                    const isTargetConnected = connectedHandleIds.includes(targetId);
                    const isSourceConnected = connectedHandleIds.includes(sourceId);
                    const shouldRender = isHovered || isTargetConnected || isSourceConnected || isConnecting || isCenter || selected;

                    if (!shouldRender) return null;

                    return (
                        <React.Fragment key={`${pos}-${p}`}>
                            <Handle
                                type="target"
                                position={pos}
                                id={targetId}
                                style={{
                                    [isHorizontal ? 'left' : 'top']: `${p}%`,
                                    [pos]: '-4px',
                                    opacity: isHovered || isConnecting || selected ? (isCenter ? 0.8 : 0.4) : (isTargetConnected || isSourceConnected ? 0.6 : 0),
                                    width: isCenter ? '10px' : '6px',
                                    height: isCenter ? '10px' : '6px',
                                    background: '#ffd666',
                                    border: '1px solid #d4b106',
                                    transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
                                    zIndex: 10,
                                }}
                            />
                            <Handle
                                type="source"
                                position={pos}
                                id={sourceId}
                                style={{
                                    [isHorizontal ? 'left' : 'top']: `${p}%`,
                                    [pos]: '-4px',
                                    opacity: isHovered || isConnecting || selected ? (isCenter ? 0.8 : 0.4) : (isTargetConnected || isSourceConnected ? 0.6 : 0),
                                    width: isCenter ? '10px' : '6px',
                                    height: isCenter ? '10px' : '6px',
                                    background: '#ffd666',
                                    border: '1px solid #d4b106',
                                    transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
                                    zIndex: 10,
                                }}
                            />
                        </React.Fragment>
                    );
                })
            )}
        </div>
    );
};

export default React.memo(NoteNode);
