import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { X, ChevronRight, Plus, GitCompare, Lightbulb } from 'lucide-react'
import { recommendationScenarios, comparisonData } from '../data/comparisonData'
import { ComponentType } from '../types'

interface RecommendationPanelProps {
    onClose: () => void
    onAdd: (type: ComponentType, vendor?: string) => void
    onCompare: (type: string) => void
}

export default function RecommendationPanel({ onClose, onAdd, onCompare }: RecommendationPanelProps) {
    const [selectedScenarioId, setSelectedScenarioId] = useState<string>(recommendationScenarios[0].id)

    const selectedScenario = recommendationScenarios.find(s => s.id === selectedScenarioId)

    // Group scenarios by category
    const groupedScenarios = recommendationScenarios.reduce((acc, scenario) => {
        const category = scenario.category || 'Other'
        if (!acc[category]) acc[category] = []
        acc[category].push(scenario)
        return acc
    }, {} as Record<string, typeof recommendationScenarios>)

    // Helper to find vendor details across all categories
    const getVendorDetails = (vendorId: string) => {
        for (const key of Object.keys(comparisonData)) {
            const category = comparisonData[key]
            const vendor = category.vendors.find(v => v.id === vendorId)
            if (vendor) {
                return { ...vendor, categoryKey: key, componentType: category.componentType }
            }
        }
        return null
    }

    const renderIcon = (iconName?: string, size = 18) => {
        const Icon = (LucideIcons as any)[iconName || 'Lightbulb'] || Lightbulb
        return <Icon size={size} />
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                zIndex: 2500,
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
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#252525',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            backgroundColor: 'rgba(77, 171, 247, 0.15)',
                            padding: '8px',
                            borderRadius: '8px',
                            color: '#4dabf7'
                        }}>
                            <Lightbulb size={24} />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                                Ассистент по выбору технологий
                            </h2>
                            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '13px' }}>
                                Рекомендации инструментов под ваши задачи
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar: Scenarios */}
                    <div style={{
                        width: '300px',
                        borderRight: '1px solid #333',
                        overflowY: 'auto',
                        padding: '16px',
                        backgroundColor: '#222',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {Object.entries(groupedScenarios).map(([category, scenarios]) => (
                                <div key={category}>
                                    <h3 style={{
                                        color: '#555',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: '8px',
                                        paddingLeft: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {category}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {scenarios.map(scenario => {
                                            const isSelected = selectedScenarioId === scenario.id
                                            return (
                                                <button
                                                    key={scenario.id}
                                                    onClick={() => setSelectedScenarioId(scenario.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        backgroundColor: isSelected ? 'rgba(77, 171, 247, 0.15)' : 'transparent',
                                                        color: isSelected ? '#4dabf7' : '#aaa',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        fontWeight: isSelected ? 600 : 400,
                                                        fontSize: '13px',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = '#2d2d2d'
                                                            e.currentTarget.style.color = '#fff'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                            e.currentTarget.style.color = '#aaa'
                                                        }
                                                    }}
                                                >
                                                    <span style={{
                                                        color: isSelected ? '#4dabf7' : '#666',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        {renderIcon(scenario.icon, 16)}
                                                    </span>
                                                    <span style={{ flex: 1 }}>{scenario.label}</span>
                                                    {isSelected && <div style={{
                                                        width: '4px',
                                                        height: '4px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#4dabf7'
                                                    }} />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Details */}
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#1e1e1e' }}>
                        {selectedScenario && (
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px', marginTop: 0 }}>
                                        {selectedScenario.label}
                                    </h1>
                                    <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.5', marginTop: 0 }}>
                                        {selectedScenario.description}
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: 'rgba(77, 171, 247, 0.08)',
                                    border: '1px solid rgba(77, 171, 247, 0.2)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '32px',
                                }}>
                                    <h3 style={{ color: '#4dabf7', fontSize: '16px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Lightbulb size={18} />
                                        Почему это рекомендуется?
                                    </h3>
                                    <p style={{ color: '#ddd', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                        {selectedScenario.reasoning}
                                    </p>
                                </div>

                                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>
                                    Рекомендуемые инструменты
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {selectedScenario.recommendedVendors.map(vendorId => {
                                        const vendor = getVendorDetails(vendorId)
                                        if (!vendor) return null

                                        return (
                                            <div
                                                key={vendor.id}
                                                style={{
                                                    backgroundColor: '#252525',
                                                    border: '1px solid #333',
                                                    borderRadius: '12px',
                                                    padding: '20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '16px' }}>
                                                            {vendor.name}
                                                        </h4>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            backgroundColor: '#333',
                                                            color: '#888',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px'
                                                        }}>
                                                            {vendor.componentType}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: '#aaa', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                                                        {vendor.description}
                                                    </p>
                                                </div>

                                                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            onAdd(vendor.componentType, vendor.id)
                                                            onClose()
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px',
                                                            backgroundColor: '#4dabf7',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            fontSize: '13px',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                        Добавить
                                                    </button>
                                                    <button
                                                        onClick={() => onCompare(vendor.categoryKey)}
                                                        style={{
                                                            padding: '8px', // Square button
                                                            backgroundColor: '#333',
                                                            color: '#ccc',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                        title="Сравнить с аналогами"
                                                    >
                                                        <GitCompare size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {selectedScenario.recommendedTypes.length > 0 && (
                                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => onCompare(comparisonData[selectedScenario.recommendedTypes[0]] ? selectedScenario.recommendedTypes[0] : (Object.keys(comparisonData).find(k => comparisonData[k].componentType === selectedScenario.recommendedTypes[0]) || ''))}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #444',
                                                color: '#aaa',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa' }}
                                        >
                                            <GitCompare size={14} />
                                            Открыть полное сравнение категории "{selectedScenario.recommendedTypes[0]}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
