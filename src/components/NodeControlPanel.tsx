import React, { useState, useEffect, useRef } from 'react'
import { Node } from 'reactflow'
import {
    Sparkles,
    CheckCircle,
    AlertTriangle,
    Target,
    EyeOff,
    Settings,
    ShieldCheck,
    Link as LinkIcon,
    Link2,
    Palette,
    ChevronDown,
    ChevronUp,
    Tag,
    Info,
    Clock
} from 'lucide-react'
import { ComponentData, ComponentType } from '../types'

interface NodeControlPanelProps {
    node: Node
    onStatusChange: (nodeId: string, status: 'new' | 'existing' | 'refinement' | 'highlighted' | 'background' | undefined) => void
    onColorChange: (nodeId: string, color: string | undefined) => void
    onLinkConfigClick: (nodeId: string) => void
    onLinkClick: (link: any) => void
    onTruthSourceChange: (nodeId: string, isTruthSource: boolean) => void
    onBadgesChange: (nodeId: string, badges: string[]) => void
    onInfoClick: (nodeId: string) => void
    onSettingsClick?: (nodeId: string) => void
    componentColors: Record<string, string>
    style?: React.CSSProperties
}

export default function NodeControlPanel({
    node,
    onStatusChange,
    onColorChange,
    onLinkConfigClick,
    onLinkClick,
    onTruthSourceChange,
    onBadgesChange,
    onInfoClick,
    onSettingsClick,
    componentColors,
    style
}: NodeControlPanelProps) {
    const data = node.data as ComponentData
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [isBadgesOpen, setIsBadgesOpen] = useState(false)

    // Close color picker when clicking outside
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Reset states when node changes
        setIsColorPickerOpen(false)
        setIsStatusOpen(false)
        setIsBadgesOpen(false)
    }, [node.id])

    const statusOptions = [
        { value: undefined, label: 'По умолчанию', icon: <Settings size={14} />, color: '#888' },
        { value: 'new', label: 'Новый', icon: <Sparkles size={14} />, color: '#40c057' },
        { value: 'existing', label: 'Существующий', icon: <CheckCircle size={14} />, color: '#339af0' },
        { value: 'refinement', label: 'Требует доработки', icon: <AlertTriangle size={14} />, color: '#fab005' },
        { value: 'highlighted', label: 'Акцент (Презентация)', icon: <Target size={14} />, color: '#e64980' },
        { value: 'background', label: 'В фоне (Приглушен)', icon: <EyeOff size={14} />, color: '#555' },
    ]

    const availableBadges = [
        { id: 'cron', label: 'Cron (Scheduler)', icon: <Clock size={14} />, color: '#4dabf7' },
        // New badges can be added here easily
    ]

    const currentStatus = statusOptions.find(opt => opt.value === data.status) || statusOptions[0]
    const currentColor = data.customColor || componentColors[data.type] || '#4dabf7'
    const currentBadges = data.badges || []

    const predefinedColors = [
        '#000000', '#343a40', '#868e96', '#fa5252', '#e64980',
        '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf',
        '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14',
    ]

    return (
        <div
            ref={panelRef}
            style={{
                ...style,
                position: 'absolute',
                top: '20px',
                right: style?.right || '20px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '12px',
                width: '230px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 1000,
            }}
        >
            <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                Настройки компонента
            </h3>

            {/* Status Selection */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '500', color: '#ccc' }}>
                    Статус:
                </label>
                <div
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: currentStatus.color }}>{currentStatus.icon}</span>
                        <span>{currentStatus.label}</span>
                    </div>
                    {isStatusOpen ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
                </div>

                {isStatusOpen && (
                    <div style={{
                        marginTop: '4px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        zIndex: 10
                    }}>
                        {statusOptions.map(option => (
                            <div
                                key={String(option.value)}
                                onClick={() => {
                                    onStatusChange(node.id, option.value as any)
                                    setIsStatusOpen(false)
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    backgroundColor: data.status === option.value ? '#333' : 'transparent',
                                    color: '#ccc',
                                    fontSize: '12px',
                                    borderBottom: '1px solid #333'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = data.status === option.value ? '#333' : 'transparent'}
                            >
                                <span style={{ color: option.color }}>{option.icon}</span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Color Selection */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '500', color: '#ccc' }}>
                    Цвет:
                </label>
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: currentColor,
                                border: '1px solid rgba(255,255,255,0.2)'
                            }} />
                            <span style={{ fontSize: '12px', color: '#fff' }}>
                                {data.customColor ? 'Пользовательский' : 'По умолчанию'}
                            </span>
                        </div>
                        {isColorPickerOpen ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
                    </div>

                    {isColorPickerOpen && (
                        <div style={{
                            marginTop: '4px',
                            padding: '10px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #555',
                            borderRadius: '4px',
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                {predefinedColors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => onColorChange(node.id, c)}
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '4px',
                                            border: currentColor === c ? '2px solid #fff' : '1px solid #444',
                                            background: c,
                                            cursor: 'pointer',
                                        }}
                                        title={c}
                                    />
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onChange={(e) => onColorChange(node.id, e.target.value)}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            padding: 0,
                                            backgroundColor: 'transparent'
                                        }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#888' }}>Свой цвет</span>
                                </div>
                                {data.customColor && (
                                    <button
                                        onClick={() => onColorChange(node.id, undefined)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #555',
                                            color: '#aaa',
                                            fontSize: '11px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Сброс
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #444', paddingTop: '12px', marginTop: '4px' }}>

                {/* Configuration Button */}
                {onSettingsClick && (
                    <button
                        onClick={() => onSettingsClick(node.id)}
                        style={{
                            width: '100%',
                            background: 'rgba(51, 154, 240, 0.15)',
                            border: '1px solid rgba(51, 154, 240, 0.3)',
                            borderRadius: '4px',
                            color: '#339af0',
                            padding: '10px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <Settings size={16} />
                        Настроить компонент
                    </button>
                )}

                {/* Badges Selection Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag size={16} color="#888" />
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>Значки</span>
                    </div>

                    <div
                        onClick={() => setIsBadgesOpen(!isBadgesOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: '12px',
                            minHeight: '32px'
                        }}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                            {currentBadges.length === 0 && !data.isTruthSource && (
                                <span style={{ color: '#666' }}>Нет значков</span>
                            )}
                            {data.isTruthSource && (
                                <span style={{
                                    backgroundColor: 'rgba(81, 207, 102, 0.2)',
                                    color: '#51cf66',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    border: '1px solid rgba(81, 207, 102, 0.3)'
                                }}>Truth</span>
                            )}
                            {currentBadges.map(badgeId => {
                                const badge = availableBadges.find(b => b.id === badgeId)
                                return (
                                    <span key={badgeId} style={{
                                        backgroundColor: badge ? `${badge.color}20` : '#444',
                                        color: badge ? badge.color : '#ccc',
                                        padding: '1px 6px',
                                        borderRadius: '3px',
                                        fontSize: '10px',
                                        border: `1px solid ${badge ? `${badge.color}40` : '#555'}`
                                    }}>
                                        {badge ? badge.label.split(' ')[0] : badgeId}
                                    </span>
                                )
                            })}
                        </div>
                        {isBadgesOpen ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
                    </div>

                    {isBadgesOpen && (
                        <div style={{
                            marginTop: '2px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            zIndex: 10
                        }}>
                            {/* Truth Source Toggle as a badge option - ONLY for databases */}
                            {data.type === 'database' && (
                                <div
                                    onClick={() => onTruthSourceChange(node.id, !data.isTruthSource)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        cursor: 'pointer',
                                        backgroundColor: data.isTruthSource ? '#333' : 'transparent',
                                        color: data.isTruthSource ? '#51cf66' : '#ccc',
                                        fontSize: '12px',
                                        borderBottom: '1px solid #333'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = data.isTruthSource ? '#333' : 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={14} />
                                        <span>Источник истины</span>
                                    </div>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '2px',
                                        border: '1px solid #555',
                                        backgroundColor: data.isTruthSource ? '#51cf66' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {data.isTruthSource && <CheckCircle size={10} color="#fff" />}
                                    </div>
                                </div>
                            )}

                            {/* Dynamically generated badges from availableBadges */}
                            {availableBadges.map(badge => (
                                <div
                                    key={badge.id}
                                    onClick={() => {
                                        const newBadges = currentBadges.includes(badge.id)
                                            ? currentBadges.filter(id => id !== badge.id)
                                            : [...currentBadges, badge.id]
                                        onBadgesChange(node.id, newBadges)
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        cursor: 'pointer',
                                        backgroundColor: currentBadges.includes(badge.id) ? '#333' : 'transparent',
                                        color: currentBadges.includes(badge.id) ? badge.color : '#ccc',
                                        fontSize: '12px',
                                        borderBottom: '1px solid #333'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBadges.includes(badge.id) ? '#333' : 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {badge.icon}
                                        <span>{badge.label}</span>
                                    </div>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '2px',
                                        border: '1px solid #555',
                                        backgroundColor: currentBadges.includes(badge.id) ? badge.color : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {currentBadges.includes(badge.id) && <CheckCircle size={10} color="#fff" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Link Selection */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Link2 size={16} color={data.link ? '#51cf66' : '#888'} />
                        <span style={{ fontSize: '12px', color: '#fff' }}>Ссылка</span>
                    </div>
                    <button
                        onClick={() => {
                            if (node && node.id) {
                                onLinkConfigClick(node.id);
                            }
                        }}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: '#ccc',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            fontSize: '11px'
                        }}
                    >
                        {data.link ? 'Изменить' : 'Добавить'}
                    </button>
                </div>

                {/* Open Link Button */}
                {data.link && (
                    <button
                        onClick={() => onLinkClick(data.link)}
                        style={{
                            width: '100%',
                            background: 'rgba(81, 207, 102, 0.1)',
                            border: '1px solid rgba(81, 207, 102, 0.3)',
                            borderRadius: '4px',
                            color: '#51cf66',
                            padding: '10px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <LinkIcon size={14} />
                        Перейти по ссылке
                    </button>
                )}

                {/* Info button */}
                <button
                    onClick={() => onInfoClick(node.id)}
                    style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        color: '#ccc',
                        padding: '10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Info size={14} />
                    Подробнее
                </button>
            </div>
        </div>
    )
}
