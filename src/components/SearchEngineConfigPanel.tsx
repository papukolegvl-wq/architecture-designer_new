import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, SearchEngineVendor } from '../types'

interface SearchEngineConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: SearchEngineVendor; indexCount?: number; documentCount?: number }) => void
    onClose: () => void
}

const vendors: Array<{ value: SearchEngineVendor; label: string; description: string }> = [
    { value: 'elasticsearch', label: 'Elasticsearch', description: 'Популярный поисковый движок на базе Lucene' },
    { value: 'opensearch', label: 'OpenSearch', description: 'Open-source форк Elasticsearch' },
    { value: 'solr', label: 'Apache Solr', description: 'Корпоративная поисковая платформа' },
    { value: 'algolia', label: 'Algolia', description: 'SaaS решение для поиска' },
    { value: 'meilisearch', label: 'Meilisearch', description: 'Легковесный и быстрый поиск' },
    { value: 'typesense', label: 'Typesense', description: 'Open-source альтернатива Algolia' },
]

export default function SearchEngineConfigPanel({
    node,
    onUpdate,
    onClose,
}: SearchEngineConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<SearchEngineVendor | undefined>(
        data.searchEngineConfig?.vendor
    )
    const [indexCount, setIndexCount] = useState<number>(
        data.searchEngineConfig?.indexCount || 1
    )
    const [documentCount, setDocumentCount] = useState<number>(
        data.searchEngineConfig?.documentCount || 0
    )

    useEffect(() => {
        if (!vendor && vendors.length > 0) {
            setVendor(vendors[0].value)
        }
    }, [vendor])

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor, indexCount, documentCount })
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
                border: '2px solid #20c997',
                borderRadius: '12px',
                padding: '25px',
                minWidth: '400px',
                maxWidth: '450px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Настройка поисковой системы
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#aaa'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label
                    style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ccc',
                    }}
                >
                    Поисковый движок:
                </label>
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
                                border: `2px solid ${vendor === v.value ? '#20c997' : '#555'}`,
                                transition: 'all 0.2s',
                            }}
                            onClick={() => setVendor(v.value)}
                        >
                            <input
                                type="radio"
                                name="vendor"
                                value={v.value}
                                checked={vendor === v.value}
                                onChange={() => setVendor(v.value)}
                                style={{ cursor: 'pointer', marginTop: '2px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                                    {v.label}
                                </div>
                                <div style={{ fontSize: '12px', color: '#aaa' }}>{v.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
                    Количество индексов:
                </label>
                <input
                    type="number"
                    value={indexCount}
                    onChange={(e) => setIndexCount(parseInt(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: '#fff',
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    disabled={!vendor}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: vendor ? '#20c997' : '#555',
                        color: vendor ? '#000' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: vendor ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
