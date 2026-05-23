import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useStore, NodeResizer } from 'reactflow';
import { StickyNote, Link as LinkIcon, Link2, Sparkles, CheckCircle, AlertTriangle, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { renderFormattedText, handleTextareaTab } from '../utils/textUtils';
import { ComponentLink } from '../types';

const colors = [
    { id: 'yellow', bg: '#fffbe6', border: '#ffe58f', label: 'Желтый' },
    { id: 'red', bg: '#ffccc7', border: '#ff7875', label: 'Красный' },
    { id: 'green', bg: '#f6ffed', border: '#b7eb8f', label: 'Зеленый' },
    { id: 'blue', bg: '#e6f7ff', border: '#91d5ff', label: 'Синий' },
    { id: 'purple', bg: '#f9f0ff', border: '#d3adf7', label: 'Фиолетовый' },
    { id: 'orange', bg: '#fff7e6', border: '#ffd591', label: 'Оранжевый' },
    { id: 'cyan', bg: '#e6fffb', border: '#87e8de', label: 'Бирюзовый' },
    { id: 'gray', bg: '#f5f5f5', border: '#d9d9d9', label: 'Серый' },
    { id: 'pink', bg: '#fff0f6', border: '#ffadd2', label: 'Розовый' },
    { id: 'lime', bg: '#fcffe6', border: '#eaff8f', label: 'Лаймовый' },
    { id: 'indigo', bg: '#f0f5ff', border: '#adc6ff', label: 'Индиго' },
    { id: 'volcano', bg: '#fff2e8', border: '#ffbb96', label: 'Вулкан' },
    { id: 'mint', bg: '#e6ffec', border: '#8ce8a3', label: 'Мятный' },
    { id: 'lavender', bg: '#f0e6ff', border: '#b388ff', label: 'Лавандовый' },
];

const NoteNode: React.FC<NodeProps & {
    onLinkClick?: (link: ComponentLink) => void,
    onLinkConfigClick?: (nodeId: string) => void,
    onColorChange?: (nodeId: string, color: string | undefined) => void
}> = ({ id, data, selected, onLinkClick, onLinkConfigClick, onColorChange }) => {
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
            if (e.key === 'Enter' && e.ctrlKey) {
                setIsEditing(false);
                handleBlur();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const target = e.target as HTMLTextAreaElement;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const selectedText = label.substring(start, end);

                let newLabel = label;
                let newSelectionStart = start;
                let newSelectionEnd = end;

                if (start >= 2 && end <= label.length - 2 && 
                    label.substring(start - 2, start) === '**' && 
                    label.substring(end, end + 2) === '**') {
                    // Remove bold
                    newLabel = label.substring(0, start - 2) + selectedText + label.substring(end + 2);
                    newSelectionStart = start - 2;
                    newSelectionEnd = end - 2;
                } else {
                    // Add bold
                    newLabel = label.substring(0, start) + '**' + selectedText + '**' + label.substring(end);
                    newSelectionStart = start + 2;
                    newSelectionEnd = end + 2;
                }

                setLabel(newLabel);
                window.dispatchEvent(
                    new CustomEvent('nodeLabelUpdate', {
                        detail: { nodeId: id, label: newLabel },
                    })
                );

                setTimeout(() => {
                    if (target) {
                        target.selectionStart = newSelectionStart;
                        target.selectionEnd = newSelectionEnd;
                    }
                }, 0);
                return;
            }
            if (e.key === 'Tab') {
                handleTextareaTab(e as any, label, setLabel);
                const newLabel = label.substring(0, (e.target as any).selectionStart) + '  ' + label.substring((e.target as any).selectionEnd);
                window.dispatchEvent(
                    new CustomEvent('nodeLabelUpdate', {
                        detail: { nodeId: id, label: newLabel },
                    })
                );
            }
            e.stopPropagation();
        },
        [handleBlur, id, label]
    );

    const handleColorClick = (color: string) => {
        window.dispatchEvent(
            new CustomEvent('nodeColorUpdate', {
                detail: { nodeId: id, color: color },
            })
        );
        if (onColorChange) {
            onColorChange(id, color);
        }
    };

    const isLegacyRed = data.customColor === '#fff1f0';
    const activeColor = colors.find(c => c.bg === data.customColor) || (isLegacyRed ? colors.find(c => c.id === 'red') : undefined) || colors[0];
    const bgColor = isLegacyRed ? activeColor.bg : (data.customColor || activeColor.bg);
    const borderColor = selected ? '#ffd666' : activeColor.border;

    return (
        <div
            style={{
                boxSizing: 'border-box',
                padding: isSimple ? '4px' : data.collapsed ? '8px' : '16px',
                borderRadius: data.collapsed ? '12px' : '24px',
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                color: '#000000',
                minWidth: isSimple ? '40px' : data.collapsed ? '60px' : '150px',
                minHeight: isSimple ? '40px' : data.collapsed ? '60px' : '80px',
                width: data.collapsed ? '60px' : '100%',
                height: data.collapsed ? '60px' : '100%',
                maxWidth: '100%',
                boxShadow: selected ? '0 0 0 2px #ffe58f80' : (isHovered ? '0 4px 15px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.12)'),
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: "'Montserrat', sans-serif",
                cursor: isEditing ? 'text' : (selected ? 'move' : 'pointer'),
                transition: 'all 0.2s',
                textAlign: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleDoubleClick}
        >
            {!data.collapsed && <NodeResizer
                color="#ffd666"
                isVisible={selected}
                minWidth={150}
                minHeight={80}
                handleStyle={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#333',
                    border: 'none',
                    boxShadow: 'none',
                }}
                lineStyle={{
                    borderWidth: '1px',
                    borderColor: '#ccc',
                    borderStyle: 'dashed',
                }}
                onResize={(_event, { width, height }) => {
                    window.dispatchEvent(
                        new CustomEvent('nodeSizeUpdate', {
                            detail: { nodeId: id, width, height },
                        })
                    );
                }}
            />}



            {!isSimple && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                    {!isSimple && (
                        <div style={{ display: 'flex', gap: '4px', opacity: isHovered || data.collapsed ? 1 : 0, transition: 'opacity 0.2s' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const nextCollapsed = !data.collapsed;
                                    window.dispatchEvent(
                                        new CustomEvent('nodeDataUpdate', {
                                            detail: { nodeId: id, data: { collapsed: nextCollapsed } },
                                        })
                                    );
                                }}
                                style={{
                                    background: 'rgba(0,0,0,0.05)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#888',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                title={data.collapsed ? 'Развернуть' : 'Свернуть'}
                            >
                                {data.collapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                            </button>
                            {!data.collapsed && data.link && (
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
                            {!data.collapsed && (
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
                            )}

                            {!data.collapsed && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const nextStatus = !data.status ? 'new' : data.status === 'new' ? 'existing' : data.status === 'existing' ? 'refinement' : undefined
                                        const event = new CustomEvent('componentStatusChange', {
                                            detail: { nodeId: id, status: nextStatus },
                                        })
                                        window.dispatchEvent(event)
                                    }}
                                    style={{
                                        background: 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: data.status === 'new' ? '#40c057' : data.status === 'existing' ? '#339af0' : data.status === 'refinement' ? '#fab005' : '#888',
                                        padding: '2px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    title={`Статус: ${data.status === 'new' ? 'Новый' : data.status === 'existing' ? 'Существующий' : data.status === 'refinement' ? 'Требует доработки' : 'По умолчанию'}`}
                                >
                                    {data.status === 'new' ? <Sparkles size={12} /> : data.status === 'existing' ? <CheckCircle size={12} /> : data.status === 'refinement' ? <AlertTriangle size={12} /> : <Settings size={12} />}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isSimple || data.collapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <StickyNote size={24} color="#ffd666" />
                </div>
            ) : isEditing ? (
                <textarea
                    autoFocus
                    value={label}
                    onChange={(e) => {
                        const newLabel = e.target.value;
                        setLabel(newLabel);
                        window.dispatchEvent(
                            new CustomEvent('nodeLabelUpdate', {
                                detail: { nodeId: id, label: newLabel },
                            })
                        );
                    }}
                    onBlur={() => setIsEditing(false)}
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
                        fontWeight: 'inherit',
                        color: 'inherit',
                        textAlign: 'center',
                        display: 'block',
                    }}
                />
            ) : (
                <div style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    width: '100%',
                    overflowWrap: 'anywhere',
                    textAlign: 'left', // Better for indentation
                    padding: '0 8px'
                }}>
                    {renderFormattedText(label)}
                </div>
            )}

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
                                    opacity: isHovered || isConnecting || selected ? 1 : 0,
                                    width: isCenter ? '10px' : '6px',
                                    height: isCenter ? '10px' : '6px',
                                    background: bgColor,
                                    border: 'none',
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
                                    opacity: isHovered || isConnecting || selected ? 1 : 0,
                                    width: isCenter ? '10px' : '6px',
                                    height: isCenter ? '10px' : '6px',
                                    background: bgColor,
                                    border: 'none',
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
