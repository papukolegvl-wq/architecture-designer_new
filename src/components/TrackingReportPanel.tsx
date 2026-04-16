import React from 'react'
import { Node } from 'reactflow'
import { ComponentData } from '../types'
import { Clock } from 'lucide-react'

interface TrackingReportPanelProps {
    nodes: Node[]
    onClose: () => void
}

export default function TrackingReportPanel({ nodes, onClose }: TrackingReportPanelProps) {
    // Filter tracking nodes
    const trackingNodes = nodes.filter(node => {
        const data = node.data as ComponentData
        return data.type === 'tracking'
    })

    // Group data by component
    const componentsData = trackingNodes.map(node => {
        const data = node.data as ComponentData
        // Check if the component as a whole is included (default to true) 
        if (data.trackingConfig?.included === false) return null

        const items = data.trackingConfig?.items || []
        const componentLabel = data.label || 'Без названия'
        const totalTime = items.reduce((sum, item) => {
            const t = parseFloat(item.time || '0')
            return sum + (isNaN(t) ? 0 : t)
        }, 0)

        // Only include if it has items or is relevant
        return {
            id: node.id,
            label: componentLabel,
            items: items.map(item => ({
                id: item.id,
                activity: (item.activity || 'Unknown Activity').trim(),
                time: parseFloat(item.time || '0')
            })),
            totalTime
        }
    }).filter((c): c is NonNullable<typeof c> => c !== null)

    // Calculate grand total
    const grandTotal = componentsData.reduce((sum, comp) => sum + comp.totalTime, 0)

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#2d2d2d',
                border: '2px solid #555',
                borderRadius: '12px',
                padding: '24px',
                width: '90vw',
                maxWidth: '1200px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={24} />
                    Планирование работ
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd43b' }}>
                        ИТОГО: {grandTotal.toFixed(1)} ITMD
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '24px',
                            padding: '0',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#444'
                            e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#888'
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            <div style={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'auto',
                display: 'flex',
                gap: '20px',
                paddingBottom: '10px'
            }}>
                {componentsData.length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', padding: '20px', width: '100%' }}>
                        Нет данных для отображения. Добавьте компоненты "Трекинг" на диаграмму.
                    </div>
                ) : (
                    <>
                        {componentsData.map((comp) => (
                            <div
                                key={comp.id}
                                style={{
                                    minWidth: '300px',
                                    backgroundColor: '#383838',
                                    borderRadius: '8px',
                                    border: '1px solid #555',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 'fit-content',
                                    maxHeight: '100%'
                                }}
                            >
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #555',
                                    backgroundColor: '#444',
                                    borderRadius: '8px 8px 0 0',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }} title={comp.label}>
                                        {comp.label}
                                    </span>
                                    <span style={{ color: '#ffd43b', fontSize: '14px' }}>
                                        {comp.totalTime.toFixed(1)}
                                    </span>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #555', backgroundColor: '#333' }}>
                                                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#aaa', fontSize: '12px', fontWeight: 'normal' }}>Активность</th>
                                                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#aaa', fontSize: '12px', fontWeight: 'normal' }}>ITMD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comp.items.map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #444' }}>
                                                    <td style={{ padding: '8px 12px', color: '#eee', fontSize: '14px' }}>{item.activity}</td>
                                                    <td style={{ padding: '8px 12px', color: '#4dabf7', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                                                        {(isNaN(item.time) ? 0 : item.time).toFixed(1)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
