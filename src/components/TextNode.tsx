import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useStore, NodeResizer } from 'reactflow';
import { renderFormattedText, handleTextareaTab } from '../utils/textUtils';

const TextNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const zoom = useStore((s) => s.transform[2]);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Текст');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isSimple = zoom < 0.4;

    const handleDoubleClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        window.dispatchEvent(
            new CustomEvent('nodeLabelUpdate', {
                detail: { nodeId: id, label: label },
            })
        );
    }, [id, label]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
                handleBlur();
            }
            if (e.key === 'Escape') {
                setLabel(data.label || 'Текст');
                setIsEditing(false);
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
        },
        [handleBlur, data.label, id, label]
    );

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: '4px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                cursor: isEditing ? 'text' : 'pointer',
                border: selected ? '1px dashed #4dabf7' : '1px solid transparent',
                borderRadius: '4px',
                backgroundColor: selected ? 'rgba(77, 171, 247, 0.05)' : 'transparent',
                transition: 'all 0.2s',
            }}
            onDoubleClick={handleDoubleClick}
        >
            <NodeResizer
                color="#4dabf7"
                isVisible={selected}
                minWidth={30}
                minHeight={20}
                handleStyle={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                }}
            />

            {isEditing ? (
                <textarea
                    ref={textareaRef}
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
                        fontSize: '14px',
                        color: 'inherit',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                />
            ) : (
                <div style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    flex: 1,
                    fontSize: '14px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-primary, #fff)',
                    fontWeight: '500',
                }}>
                    {label ? renderFormattedText(label) : <span style={{ opacity: 0.3 }}>Введите текст...</span>}
                </div>
            )}

            {/* Hidden handles to allow connections if needed, but invisible */}
            {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => (
                <Handle
                    key={pos}
                    type="source"
                    position={pos}
                    style={{ opacity: 0, pointerEvents: 'none' }}
                />
            ))}
            {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => (
                <Handle
                    key={pos}
                    type="target"
                    position={pos}
                    style={{ opacity: 0, pointerEvents: 'none' }}
                />
            ))}
        </div>
    );
};

export default React.memo(TextNode);
