import React, { useState } from 'react'

interface SystemColorPickerProps {
    nodeId: string
    currentColor?: string
    onUpdate: (nodeId: string, color: string) => void
    onClose: () => void
}

const SystemColorPicker: React.FC<SystemColorPickerProps> = ({
    nodeId,
    currentColor = '#4dabf7',
    onUpdate,
    onClose,
}) => {
    const [selectedColor, setSelectedColor] = useState(currentColor)

    const predefinedColors = [
        '#4dabf7', // Синий (по умолчанию)
        '#51cf66', // Зеленый
        '#ffd43b', // Желтый
        '#ff6b6b', // Красный
        '#845ef7', // Фиолетовый
        '#20c997', // Бирюзовый
        '#ffa94d', // Оранжевый
        '#ff8787', // Светло-красный
        '#9c88ff', // Светло-фиолетовый
        '#fd7e14', // Темно-оранжевый
    ]

    const handleSave = () => {
        onUpdate(nodeId, selectedColor)
        onClose()
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                zIndex: 10000,
                minWidth: '320px',
                border: '1px solid #444',
            }}
        >
            <h3
                style={{
                    margin: '0 0 16px 0',
                    color: 'var(--color-text-primary)',
                    fontSize: '18px',
                }}
            >
                Выбор цвета системы
            </h3>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    marginBottom: '20px',
                }}
            >
                {predefinedColors.map((color) => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: color,
                            border: selectedColor === color ? '3px solid var(--color-text-primary)' : '2px solid #666',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: selectedColor === color ? `0 0 12px ${color}` : 'none',
                        }}
                        title={color}
                    />
                ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label
                    style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--color-text-primary)',
                        fontSize: '14px',
                    }}
                >
                    Или введите свой цвет:
                </label>
                <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{
                        width: '100%',
                        height: '48px',
                        border: '2px solid #666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #666',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: selectedColor,
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    Применить
                </button>
            </div>

            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: -1,
                }}
            />
        </div>
    )
}

export default SystemColorPicker
