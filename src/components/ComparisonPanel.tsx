import React, { useState } from 'react'
import { X, Check, Star, Info } from 'lucide-react'
import { comparisonData } from '../data/comparisonData'

interface ComparisonPanelProps {
    type: string
    onClose: () => void
}

export default function ComparisonPanel({ type, onClose }: ComparisonPanelProps) {
    try {
        console.log('=== ComparisonPanel Render ===')
        console.log('Type received:', type, 'Type of type:', typeof type)
        console.log('comparisonData keys:', Object.keys(comparisonData))

        // Defensive check: ensure type is a string
        const typeStr = String(type || '').toLowerCase().trim()
        console.log('Normalized type:', typeStr)

        const category = comparisonData[typeStr]
        console.log('Category found:', !!category, 'for type:', typeStr)

        if (category) {
            console.log('Vendors:', category.vendors?.map(v => v.name))
        } else {
            console.error('❌ Category not found for type:', typeStr)
            console.error('Available categories:', Object.keys(comparisonData))
        }

        const [selectedVendors, setSelectedVendors] = useState<string[]>(() => {
            if (!category?.vendors?.length) {
                console.log('No vendors, returning empty array')
                return []
            }
            const initial = category.vendors.slice(0, 2).map(v => v.id)
            console.log('Initial selection:', initial)
            return initial
        })

        const toggleVendor = (id: string) => {
            console.log('Toggle vendor clicked:', id)
            setSelectedVendors(prev => {
                console.log('Previous selection:', prev)
                if (prev.includes(id)) {
                    const newSelection = prev.length > 1 ? prev.filter(v => v !== id) : prev
                    console.log('New selection (remove):', newSelection)
                    return newSelection
                }
                const newSelection = prev.length < 4 ? [...prev, id] : prev
                console.log('New selection (add):', newSelection)
                return newSelection
            })
        }

        if (!category) {
            console.log('Rendering error state - no category')
            const availableTypes = Object.keys(comparisonData).join(', ')
            return (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        backgroundColor: '#1e1e1e',
                        padding: '40px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        maxWidth: '600px',
                    }}>
                        <h3 style={{ color: '#fff', marginBottom: '16px' }}>Ошибка</h3>
                        <p style={{ color: '#888', marginBottom: '12px' }}>
                            Категория "{type}" не найдена
                        </p>
                        <p style={{ color: '#666', marginBottom: '20px', fontSize: '12px' }}>
                            Доступные категории: {availableTypes}
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4dabf7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )
        }

        console.log('Rendering main panel, selected vendors:', selectedVendors)

        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>
                            Порівняння рішень: {category.componentType}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                padding: '8px',
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                        {/* Vendor Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            {category.vendors.map(vendor => {
                                const isSelected = selectedVendors.includes(vendor.id)
                                return (
                                    <button
                                        key={vendor.id}
                                        onClick={() => {
                                            console.log('Button clicked for:', vendor.name)
                                            toggleVendor(vendor.id)
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: `1px solid ${isSelected ? '#4dabf7' : '#333'}`,
                                            backgroundColor: isSelected ? 'rgba(77, 171, 247, 0.1)' : '#252525',
                                            color: isSelected ? '#4dabf7' : '#aaa',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <span style={{
                                            display: 'inline-flex',
                                            opacity: isSelected ? 1 : 0,
                                            width: isSelected ? '16px' : '0px',
                                            overflow: 'hidden',
                                            transition: 'opacity 0.2s, width 0.2s'
                                        }}>
                                            <Check size={16} />
                                        </span>
                                        {vendor.name}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Simple table */}
                        {selectedVendors.length > 0 && (
                            <div style={{ backgroundColor: '#252525', padding: '20px', borderRadius: '12px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', color: '#666', padding: '12px' }}>
                                                ХАРАКТЕРИСТИКА
                                            </th>
                                            {selectedVendors.map(id => {
                                                const v = category.vendors.find(vendor => vendor.id === id)
                                                return (
                                                    <th key={id} style={{ textAlign: 'center', color: '#fff', padding: '12px' }}>
                                                        {v?.name}
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.metrics.map(metric => (
                                            <tr key={metric.name}>
                                                <td style={{ padding: '12px', color: '#eee' }}>
                                                    {metric.label}
                                                </td>
                                                {selectedVendors.map(id => {
                                                    const v = category.vendors.find(vendor => vendor.id === id)
                                                    const value = v?.metrics[metric.name]

                                                    let content
                                                    if (metric.type === 'rating' && typeof value === 'number') {
                                                        content = (
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <Star
                                                                        key={s}
                                                                        size={14}
                                                                        fill={s <= value ? '#fab005' : 'none'}
                                                                        color={s <= value ? '#fab005' : '#444'}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )
                                                    } else if (metric.type === 'boolean') {
                                                        content = value ? (
                                                            <Check size={20} style={{ color: '#51cf66' }} />
                                                        ) : (
                                                            <X size={20} style={{ color: '#ff6b6b' }} />
                                                        )
                                                    } else {
                                                        content = <span style={{ color: '#ccc' }}>{String(value || '—')}</span>
                                                    }

                                                    return (
                                                        <td key={id} style={{ padding: '12px', textAlign: 'center' }}>
                                                            {content}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '20px 24px',
                        borderTop: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#4dabf7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                            }}
                        >
                            Закрити
                        </button>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('❌❌❌ CRITICAL ERROR in ComparisonPanel:', error)
        console.error('Error details:', error instanceof Error ? error.message : String(error))
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')

        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    backgroundColor: '#1e1e1e',
                    border: '2px solid #ff6b6b',
                    padding: '40px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    maxWidth: '600px',
                }}>
                    <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>Критическая ошибка</h3>
                    <p style={{ color: '#888', marginBottom: '12px' }}>
                        Произошла ошибка при рендеринге компонента
                    </p>
                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '12px', fontFamily: 'monospace' }}>
                        {error instanceof Error ? error.message : String(error)}
                    </p>
                    <p style={{ color: '#555', marginBottom: '20px', fontSize: '11px' }}>
                        Проверьте консоль браузера (F12) для подробностей
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ff6b6b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        )
    }
}
