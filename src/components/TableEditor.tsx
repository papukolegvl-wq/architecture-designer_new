import React, { useState } from 'react'
import { Node } from 'reactflow'
import { DatabaseTable, TableColumn, SQLColumnType, ComponentData } from '../types'
import { Key, Link, Trash2, Plus, X } from 'lucide-react'

interface TableEditorProps {
    node: Node
    allTables: { id: string, name: string }[]
    onUpdate: (nodeId: string, tableConfig: DatabaseTable) => void
    onClose: () => void
}

const sqlTypes: SQLColumnType[] = [
    'INTEGER', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN',
    'DATE', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE', 'BLOB', 'JSON'
]

export default function TableEditor({
    node,
    allTables,
    onUpdate,
    onClose,
}: TableEditorProps) {
    const data = node.data as ComponentData
    const [tableConfig, setTableConfig] = useState<DatabaseTable>(data.tableConfig || {
        name: data.label,
        columns: [],
    })

    const [newColumnName, setNewColumnName] = useState('')
    const [newColumnType, setNewColumnType] = useState<SQLColumnType>('VARCHAR')
    const [newColumnPK, setNewColumnPK] = useState(false)
    const [newColumnFK, setNewColumnFK] = useState<{ targetTableId: string, targetColumnName: string } | undefined>(undefined)

    const handleUpdateTableName = (name: string) => {
        const newConfig = { ...tableConfig, name }
        setTableConfig(newConfig)
        onUpdate(node.id, newConfig)
    }

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return

        const newColumn: TableColumn = {
            name: newColumnName.trim(),
            type: newColumnType,
            primaryKey: newColumnPK,
            foreignKey: newColumnFK,
            nullable: !newColumnPK,
        }

        const newConfig = {
            ...tableConfig,
            columns: [...tableConfig.columns, newColumn]
        }
        setTableConfig(newConfig)
        onUpdate(node.id, newConfig)

        setNewColumnName('')
        setNewColumnType('VARCHAR')
        setNewColumnPK(false)
        setNewColumnFK(undefined)
    }

    const handleDeleteColumn = (index: number) => {
        const newColumns = [...tableConfig.columns]
        newColumns.splice(index, 1)
        const newConfig = { ...tableConfig, columns: newColumns }
        setTableConfig(newConfig)
        onUpdate(node.id, newConfig)
    }

    const handleTogglePK = (index: number) => {
        const newColumns = tableConfig.columns.map((col, i) =>
            i === index ? { ...col, primaryKey: !col.primaryKey, nullable: col.primaryKey } : col
        )
        const newConfig = { ...tableConfig, columns: newColumns }
        setTableConfig(newConfig)
        onUpdate(node.id, newConfig)
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
                minWidth: '500px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Редактор таблицы
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
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>
                    Название таблицы
                </label>
                <input
                    type="text"
                    value={tableConfig.name}
                    onChange={(e) => handleUpdateTableName(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '14px',
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Колонки</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {tableConfig.columns.map((col, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                backgroundColor: '#1e1e1e',
                                borderRadius: '8px',
                                border: '1px solid #333',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{col.name}</div>
                                    {col.primaryKey && <Key size={12} color="#ffd43b" />}
                                    {col.foreignKey && <Link size={12} color="#4dabf7" />}
                                </div>
                                <div style={{ color: '#888', fontSize: '12px' }}>
                                    {col.type}
                                    {col.foreignKey && ` → ${allTables.find(t => t.id === col.foreignKey?.targetTableId)?.name}.${col.foreignKey.targetColumnName}`}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleTogglePK(index)}
                                    title="Primary Key"
                                    style={{
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: col.primaryKey ? '#ffd43b20' : 'transparent',
                                        color: col.primaryKey ? '#ffd43b' : '#555',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Key size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteColumn(index)}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#ff6b6b',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New Column Form */}
                <div style={{ padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px dashed #444' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', color: '#888' }}>Имя колонки</label>
                            <input
                                type="text"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                style={{
                                    padding: '8px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '13px',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', color: '#888' }}>Тип</label>
                            <select
                                value={newColumnType}
                                onChange={(e) => setNewColumnType(e.target.value as SQLColumnType)}
                                style={{
                                    padding: '8px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '13px',
                                }}
                            >
                                {sqlTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '12px', cursor: 'pointer', marginBottom: '10px' }}>
                            <input
                                type="checkbox"
                                checked={newColumnPK}
                                onChange={(e) => setNewColumnPK(e.target.checked)}
                            />
                            Primary Key
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: '#252525', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: '#5C7CFA', fontWeight: '600' }}>Foreign Key (опционально)</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <select
                                    value={newColumnFK?.targetTableId || ''}
                                    onChange={(e) => {
                                        const tableId = e.target.value
                                        if (tableId) {
                                            setNewColumnFK({ targetTableId: tableId, targetColumnName: '' })
                                        } else {
                                            setNewColumnFK(undefined)
                                        }
                                    }}
                                    style={{
                                        padding: '6px',
                                        backgroundColor: '#1e1e1e',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                >
                                    <option value="">Целевая таблица...</option>
                                    {allTables.filter(t => t.id !== node.id).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Целевая колонка"
                                    disabled={!newColumnFK?.targetTableId}
                                    value={newColumnFK?.targetColumnName || ''}
                                    onChange={(e) => setNewColumnFK(prev => prev ? { ...prev, targetColumnName: e.target.value } : undefined)}
                                    style={{
                                        padding: '6px',
                                        backgroundColor: '#1e1e1e',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        opacity: newColumnFK?.targetTableId ? 1 : 0.5
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleAddColumn}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: '#5C7CFA',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={16} /> Добавить колонку
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#5C7CFA',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Закрыть
                </button>
            </div>
        </div>
    )
}
