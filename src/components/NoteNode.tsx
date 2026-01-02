import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useStore } from 'reactflow';
import { StickyNote, Link as LinkIcon, Link2 } from 'lucide-react';
import { ComponentLink } from '../types';

const NoteNode: React.FC<NodeProps & {
    onLinkClick?: (link: ComponentLink) => void,
    onLinkConfigClick?: (nodeId: string) => void
}> = ({ id, data, selected, onLinkClick, onLinkConfigClick }) => {
    const zoom = useStore((s) => s.transform[2]);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Примечание');
    const [isHovered, setIsHovered] = useState(false);

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
                backgroundColor: '#fffbe6',
                border: `1px solid ${selected ? '#ffd666' : '#ffe58f'}`,
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
                    const shouldRender = isHovered || isTargetConnected || isSourceConnected || isConnecting;

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
                                    opacity: isHovered || isConnecting ? (isCenter ? 0.8 : 0.4) : 0,
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
                                    opacity: isHovered || isConnecting ? (isCenter ? 0.8 : 0.4) : 0,
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
