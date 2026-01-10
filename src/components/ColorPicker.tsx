import React from 'react'

interface ColorPickerProps {
    currentColor?: string
    onColorSelect: (color: string | undefined) => void
    label?: string
}

export const predefinedColors = [
    { value: '#339af0', label: 'Blue' },
    { value: '#51cf66', label: 'Green' },
    { value: '#ff6b6b', label: 'Red' },
    { value: '#cc5de8', label: 'Purple' },
    { value: '#ae3ec9', label: 'Magenta' },
    { value: '#845ef7', label: 'Indigo' },
    { value: '#fcc419', label: 'Yellow' },
    { value: '#ff922b', label: 'Orange' },
    { value: '#adb5bd', label: 'Gray' },
    { value: '#1a1a1a', label: 'Dark' },
]

export default function ColorPicker({ currentColor, onColorSelect, label = 'Цвет компонента:' }: ColorPickerProps) {
    return (
        <div style={{ marginBottom: '25px' }}>
            <label
                style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ccc',
                }}
            >
                {label}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {predefinedColors.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => onColorSelect(c.value)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: c.value,
                            border: currentColor === c.value ? '2px solid #fff' : '2px solid transparent',
                            cursor: 'pointer',
                            boxShadow: currentColor === c.value ? `0 0 10px ${c.value}` : 'none',
                            transition: 'all 0.2s',
                            padding: 0,
                        }}
                        title={c.label}
                    />
                ))}
                <button
                    onClick={() => onColorSelect(undefined)}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: !currentColor ? '2px solid #fff' : '2px solid #555',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px',
                        transition: 'all 0.2s',
                        padding: 0,
                    }}
                    title="Цвет по умолчанию"
                >
                    ×
                </button>
            </div>
        </div>
    )
}
