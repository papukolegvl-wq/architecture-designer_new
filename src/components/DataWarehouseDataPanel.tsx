import { useState, useRef } from 'react'
import { Node } from 'reactflow'
import { ComponentData, DatabaseTable, TableColumn, SQLColumnType } from '../types'

interface DataWarehouseDataPanelProps {
  node: Node
  onUpdate: (nodeId: string, tables: DatabaseTable[]) => void
  onClose: () => void
}

const sqlTypes: SQLColumnType[] = [
  'INTEGER', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN', 
  'DATE', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE', 'BLOB', 'JSON'
]

export default function DataWarehouseDataPanel({
  node,
  onUpdate,
  onClose,
}: DataWarehouseDataPanelProps) {
  const data = node.data as ComponentData
  const vendor = data.dataWarehouseConfig?.vendor
  
  const [tables, setTables] = useState<DatabaseTable[]>(data.dataWarehouseConfig?.tables || [])
  
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [newTableName, setNewTableName] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState<SQLColumnType>('VARCHAR')
  const [newColumnNullable, setNewColumnNullable] = useState(false)
  const [newColumnPrimaryKey, setNewColumnPrimaryKey] = useState(false)
  const [newColumnUnique, setNewColumnUnique] = useState(false)
  const [newColumnDefault, setNewColumnDefault] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Если платформа не выбрана, показываем сообщение
  if (!vendor) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#2d2d2d',
          border: '2px solid #ff6b6b',
          borderRadius: '12px',
          padding: '25px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 1001,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
            Настройка хранилища данных
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
            }}
          >
            ×
          </button>
        </div>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>
          Сначала необходимо выбрать платформу хранилища данных.
          Двойной клик по компоненту откроет панель настройки.
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#51cf66',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Закрыть
        </button>
      </div>
    )
  }

  const handleAddTable = () => {
    if (newTableName.trim()) {
      const newTable: DatabaseTable = {
        name: newTableName.trim(),
        columns: [],
        rows: [],
      }
      setTables([...tables, newTable])
      setNewTableName('')
      setEditingTable(newTable.name)
    }
  }

  const handleDeleteTable = (tableName: string) => {
    setTables(tables.filter(t => t.name !== tableName))
    if (editingTable === tableName) {
      setEditingTable(null)
    }
  }

  const handleAddColumn = (tableName: string) => {
    if (newColumnName.trim()) {
      const newColumn: TableColumn = {
        name: newColumnName.trim(),
        type: newColumnType,
        nullable: newColumnNullable,
        primaryKey: newColumnPrimaryKey,
        unique: newColumnUnique,
        defaultValue: newColumnDefault || undefined,
      }
      setTables(tables.map(t => 
        t.name === tableName 
          ? { ...t, columns: [...t.columns, newColumn] }
          : t
      ))
      setNewColumnName('')
      setNewColumnType('VARCHAR')
      setNewColumnNullable(false)
      setNewColumnPrimaryKey(false)
      setNewColumnUnique(false)
      setNewColumnDefault('')
    }
  }

  const handleDeleteColumn = (tableName: string, columnIndex: number) => {
    setTables(tables.map(t => 
      t.name === tableName 
        ? { ...t, columns: t.columns.filter((_, i) => i !== columnIndex) }
        : t
    ))
  }

  const handleAddRow = (tableName: string) => {
    const table = tables.find(t => t.name === tableName)
    if (!table || table.columns.length === 0) return

    const newRow: Record<string, any> = {}
    table.columns.forEach(col => {
      newRow[col.name] = col.defaultValue || null
    })

    setTables(tables.map(t => 
      t.name === tableName 
        ? { ...t, rows: [...(t.rows || []), newRow] }
        : t
    ))
  }

  const handleUpdateRow = (tableName: string, rowIndex: number, columnName: string, value: string) => {
    setTables(tables.map(t => {
      if (t.name === tableName && t.rows) {
        const newRows = [...t.rows]
        newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: value }
        return { ...t, rows: newRows }
      }
      return t
    }))
  }

  const handleDeleteRow = (tableName: string, rowIndex: number) => {
    setTables(tables.map(t => 
      t.name === tableName 
        ? { ...t, rows: (t.rows || []).filter((_, i) => i !== rowIndex) }
        : t
    ))
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length === 0) {
          alert('Файл пуст')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim())
        const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_')
        
        const columns: TableColumn[] = headers.map(header => ({
          name: header,
          type: 'VARCHAR',
          nullable: true,
        }))

        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const row: Record<string, any> = {}
          headers.forEach((header, i) => {
            row[header] = values[i] || null
          })
          return row
        })

        const newTable: DatabaseTable = {
          name: tableName,
          columns,
          rows,
        }

        setTables([...tables, newTable])
        setEditingTable(tableName)
      } catch (error) {
        alert('Ошибка при загрузке CSV: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const handleSave = () => {
    onUpdate(node.id, tables)
    onClose()
  }

  const currentTable = tables.find(t => t.name === editingTable)

  const vendorNames: Record<string, string> = {
    'snowflake': 'Snowflake',
    'redshift': 'AWS Redshift',
    'bigquery': 'Google BigQuery',
    'databricks': 'Databricks',
    'synapse': 'Azure Synapse',
    'teradata': 'Teradata',
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
        minWidth: '700px',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Управление данными хранилища
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
          }}
        >
          ×
        </button>
      </div>

      {/* Информация о платформе */}
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>Платформа:</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#20c997' }}>
          {vendorNames[vendor] || vendor}
        </div>
      </div>

      {/* Таблицы */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Название таблицы"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTable()
              }
            }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleAddTable}
            style={{
              padding: '10px 20px',
              backgroundColor: '#20c997',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Добавить таблицу
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4dabf7',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Загрузить CSV
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tables.map((table) => (
            <div
              key={table.name}
              style={{
                padding: '12px',
                backgroundColor: editingTable === table.name ? '#3d3d3d' : '#1e1e1e',
                border: `2px solid ${editingTable === table.name ? '#20c997' : '#555'}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setEditingTable(editingTable === table.name ? null : table.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                    {table.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {table.columns.length} колонок, {table.rows?.length || 0} строк
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTable(table.name)
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentTable && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
            Таблица "{currentTable.name}"
          </h4>

          {/* Колонки */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '10px' }}>Колонки:</div>
            <div style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
              {currentTable.columns.map((column, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{column.name}</span>
                    <span style={{ color: '#20c997', marginLeft: '8px' }}>({column.type})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteColumn(currentTable.name, index)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Название колонки"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                style={{
                  padding: '8px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value as SQLColumnType)}
                style={{
                  padding: '8px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              >
                {sqlTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={newColumnNullable}
                  onChange={(e) => setNewColumnNullable(e.target.checked)}
                />
                NULL
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={newColumnPrimaryKey}
                  onChange={(e) => setNewColumnPrimaryKey(e.target.checked)}
                />
                PRIMARY KEY
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={newColumnUnique}
                  onChange={(e) => setNewColumnUnique(e.target.checked)}
                />
                UNIQUE
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Значение по умолчанию"
                value={newColumnDefault}
                onChange={(e) => setNewColumnDefault(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={() => handleAddColumn(currentTable.name)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#20c997',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить колонку
              </button>
            </div>
          </div>

          {/* Данные таблицы */}
          {currentTable.columns.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>Данные:</div>
                <button
                  onClick={() => handleAddRow(currentTable.name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4dabf7',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Добавить строку
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #555', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#2d2d2d' }}>
                      {currentTable.columns.map((col, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '8px',
                            textAlign: 'left',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderBottom: '1px solid #555',
                          }}
                        >
                          {col.name}
                        </th>
                      ))}
                      <th style={{ padding: '8px', borderBottom: '1px solid #555' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentTable.rows || []).map((row, rowIndex) => (
                      <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#1e1e1e' : '#2d2d2d' }}>
                        {currentTable.columns.map((col, colIndex) => (
                          <td key={colIndex} style={{ padding: '6px', borderBottom: '1px solid #444' }}>
                            <input
                              type="text"
                              value={String(row[col.name] || '')}
                              onChange={(e) => handleUpdateRow(currentTable.name, rowIndex, col.name, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px',
                                backgroundColor: '#1e1e1e',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '12px',
                              }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '6px', borderBottom: '1px solid #444' }}>
                          <button
                            onClick={() => handleDeleteRow(currentTable.name, rowIndex)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#20c997',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
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














