import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, GraphDatabaseVendor } from '../types'

interface GraphDatabaseConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: GraphDatabaseVendor }) => void
    onClose: () => void
}

const vendors: Array<{ value: GraphDatabaseVendor; label: string; description: string }> = [
    { value: 'neo4j', label: 'Neo4j', description: 'Ведущая графовая база данных' },
    { value: 'amazon-neptune', label: 'Amazon Neptune', description: 'Графовая БД от AWS' },
    { value: 'arangodb', label: 'ArangoDB', description: 'Мультимодельная база данных (граф + документ)' },
    { value: 'orientdb', label: 'OrientDB', description: 'Мультимодельная графовая БД' },
    { value: 'dgraph', label: 'Dgraph', description: 'Нативная распределенная графовая БД' },
]

export default function GraphDatabaseConfigPanel({
    node,
    onUpdate,
    onClose,
}: GraphDatabaseConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<GraphDatabaseVendor | undefined>(
        data.graphDatabaseConfig?.vendor
    )

    useEffect(() => {
        if (!vendor && vendors.length > 0) {
            setVendor(vendors[0].value)
        }
    }, [vendor])

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor })
        }
        onClose()
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#2d2d2d',
                border: '2px solid #51cf66',
                borderRadius: '12px',
                padding: '25px',
                minWidth: '400px',
                maxWidth: '450px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Настройка графовой БД
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>Провайдер/Технология:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {vendors.map((v) => (
                        <label
                            key={v.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                                border: `2px solid ${vendor === v.value ? '#51cf66' : '#555'}`,
                            }}
                            onClick={() => setVendor(v.value)}
                        >
                            <input type="radio" checked={vendor === v.value} readOnly style={{ marginTop: '4px' }} />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{v.label}</div>
                                <div style={{ fontSize: '12px', color: '#aaa' }}>{v.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить</button>
            </div>
        </div>
    )
}
