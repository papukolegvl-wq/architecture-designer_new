import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, VectorDatabaseVendor, VectorDatabaseConfig } from '../types'

interface VectorDatabaseConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: VectorDatabaseConfig) => void
    onClose: () => void
}

const vendors: Array<{ value: VectorDatabaseVendor; label: string; description: string }> = [
    { value: 'pinecone', label: 'Pinecone', description: 'Fully managed vector database' },
    { value: 'milvus', label: 'Milvus', description: 'Open-source vector database for AI' },
    { value: 'weaviate', label: 'Weaviate', description: 'Open-source vector search engine' },
    { value: 'qdrant', label: 'Qdrant', description: 'Vector Database for the next generation of AI' },
    { value: 'chroma', label: 'Chroma', description: 'The open-source embedding database' },
    { value: 'faiss', label: 'FAISS', description: 'Library for efficient similarity search' },
    { value: 'zilliz', label: 'Zilliz', description: 'Managed Milvus' },
    { value: 'elastic-vector', label: 'Elasticsearch Vector', description: 'Vector search in Elasticsearch' },
    { value: 'pgvector', label: 'pgvector (PostgreSQL)', description: 'Open-source vector similarity search for Postgres' },
]

export default function VectorDatabaseConfigPanel({
    node,
    onUpdate,
    onClose,
}: VectorDatabaseConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<VectorDatabaseVendor | undefined>(
        data.vectorDatabaseConfig?.vendor
    )
    const [dimensions, setDimensions] = useState<number | undefined>(
        data.vectorDatabaseConfig?.dimensions
    )
    const [indexType, setIndexType] = useState<'hnsw' | 'ivf' | 'flat' | 'diskann' | undefined>(
        data.vectorDatabaseConfig?.indexType
    )

    const handleSave = () => {
        onUpdate(node.id, {
            vendor,
            dimensions,
            indexType,
        })
        onClose()
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#2d2d2d',
                border: '2px solid #5C7CFA',
                borderRadius: '12px',
                padding: '25px',
                minWidth: '350px',
                maxWidth: '400px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Настройка Векторной БД
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
                    Выберите вендора:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                    {vendors.map((v) => (
                        <label
                            key={v.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                                border: `2px solid ${vendor === v.value ? '#5C7CFA' : '#555'}`,
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
                                style={{ cursor: 'pointer' }}
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
                <label
                    style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ccc',
                    }}
                >
                    Размерность (Dimensions):
                </label>
                <input
                    type="number"
                    value={dimensions || ''}
                    onChange={(e) => setDimensions(parseInt(e.target.value) || undefined)}
                    placeholder="Напр. 1536"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #555',
                        color: '#fff',
                        fontSize: '14px',
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
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#666'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#555'
                    }}
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#5C7CFA',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4c6ef5'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#5C7CFA'
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
