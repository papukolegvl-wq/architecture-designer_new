import { useState, useRef } from 'react'
import { Node } from 'reactflow'
import { ComponentData, DatabaseTable, TableColumn, SQLColumnType, NoSQLCollection, NoSQLDocument, KeyValuePair, KeyValueStore } from '../types'

interface DatabaseSchemaEditorProps {
  node: Node
  onUpdate: (nodeId: string, tables: DatabaseTable[], collections?: NoSQLCollection[], keyValueStore?: KeyValueStore) => void
  onClose: () => void
}

const sqlTypes: SQLColumnType[] = [
  'INTEGER', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN', 
  'DATE', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE', 'BLOB', 'JSON'
]

export default function DatabaseSchemaEditor({
  node,
  onUpdate,
  onClose,
}: DatabaseSchemaEditorProps) {
  const data = node.data as ComponentData
  const dbType = data.databaseConfig?.dbType
  const nosqlType = data.databaseConfig?.nosqlType
  const vendor = data.databaseConfig?.vendor
  
  const [tables, setTables] = useState<DatabaseTable[]>(data.databaseConfig?.tables || [])
  const [collections, setCollections] = useState<NoSQLCollection[]>((data.databaseConfig as any)?.collections || [])
  const [keyValueStore, setKeyValueStore] = useState<KeyValueStore>((data.databaseConfig as any)?.keyValueStore || { pairs: [] })
  
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [editingCollection, setEditingCollection] = useState<string | null>(null)
  const [newTableName, setNewTableName] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState<SQLColumnType>('VARCHAR')
  const [newColumnNullable, setNewColumnNullable] = useState(false)
  const [newColumnPrimaryKey, setNewColumnPrimaryKey] = useState(false)
  const [newColumnUnique, setNewColumnUnique] = useState(false)
  const [newColumnDefault, setNewColumnDefault] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newDocumentJson, setNewDocumentJson] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [keyValueFile, setKeyValueFile] = useState<File | null>(null)
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [selectedCollectionForJson, setSelectedCollectionForJson] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const keyValueFileInputRef = useRef<HTMLInputElement>(null)
  const jsonFileInputRef = useRef<HTMLInputElement>(null)

  // Если база данных не настроена, показываем сообщение
  if (!dbType) {
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
            Настройка базы данных
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
          Сначала необходимо выбрать тип базы данных (SQL/NoSQL) и СУБД.
          Двойной клик по компоненту базы данных откроет панель настройки.
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

  const handleDeleteRow = (tableName: string, rowIndex: number) => {
    setTables(tables.map(t => 
      t.name === tableName 
        ? { ...t, rows: (t.rows || []).filter((_, i) => i !== rowIndex) }
        : t
    ))
  }

  const handleUpdateRow = (tableName: string, rowIndex: number, columnName: string, value: any) => {
    setTables(tables.map(t => 
      t.name === tableName 
        ? {
            ...t,
            rows: (t.rows || []).map((row, i) => 
              i === rowIndex ? { ...row, [columnName]: value } : row
            )
          }
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

  const handleKeyValueFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        const pairs: KeyValuePair[] = []
        let hasError = false
        let errorLine = 0

        lines.forEach((line, index) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return

          // Проверяем формат: ключ=значение или ключ:значение или JSON
          let key: string
          let value: any

          if (trimmedLine.includes('=')) {
            const [k, ...vParts] = trimmedLine.split('=')
            key = k.trim()
            value = vParts.join('=').trim()
          } else if (trimmedLine.includes(':')) {
            const [k, ...vParts] = trimmedLine.split(':')
            key = k.trim()
            value = vParts.join(':').trim()
          } else {
            // Пытаемся распарсить как JSON объект
            try {
              const obj = JSON.parse(trimmedLine)
              if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                Object.entries(obj).forEach(([k, v]) => {
                  pairs.push({ key: k, value: v as string | number | boolean | object })
                })
                return
              } else {
                throw new Error('Неверный формат')
              }
            } catch {
              hasError = true
              errorLine = index + 1
              return
            }
          }

          if (!key) {
            hasError = true
            errorLine = index + 1
            return
          }

          // Пытаемся распарсить значение как JSON
          try {
            value = JSON.parse(value)
          } catch {
            // Оставляем как строку
          }

          pairs.push({ key, value })
        })

        if (hasError) {
          alert(`Ошибка в строке ${errorLine}: формат должен быть "ключ=значение" или "ключ:значение" или JSON объект`)
          return
        }

        if (pairs.length === 0) {
          alert('Не найдено ни одной пары ключ-значение')
          return
        }

        setKeyValueStore({ pairs: [...keyValueStore.pairs, ...pairs] })
        setKeyValueFile(null)
        alert(`Успешно загружено ${pairs.length} пар ключ-значение`)
      } catch (error) {
        alert('Ошибка при загрузке файла: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const handleJsonFileUpload = () => {
    if (!selectedCollectionForJson.trim()) {
      alert('Сначала выберите или создайте коллекцию')
      return
    }

    const file = jsonFile
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        let documents: NoSQLDocument[]

        // Пытаемся распарсить как массив JSON объектов
        try {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) {
            documents = parsed.map((doc, index) => ({
              _id: doc._id || `doc_${Date.now()}_${index}`,
              ...doc,
            }))
          } else if (typeof parsed === 'object' && parsed !== null) {
            // Один объект
            documents = [{
              _id: parsed._id || `doc_${Date.now()}`,
              ...parsed,
            }]
          } else {
            throw new Error('Неверный формат JSON')
          }
        } catch {
          // Пытаемся распарсить построчно (NDJSON)
          const lines = text.split('\n').filter(line => line.trim())
          documents = lines.map((line, index) => {
            try {
              const doc = JSON.parse(line)
              return {
                _id: doc._id || `doc_${Date.now()}_${index}`,
                ...doc,
              }
            } catch {
              throw new Error(`Ошибка парсинга JSON в строке ${index + 1}`)
            }
          })
        }

        const collection = collections.find(c => c.name === selectedCollectionForJson)
        if (collection) {
          setCollections(collections.map(c => 
            c.name === selectedCollectionForJson 
              ? { ...c, documents: [...c.documents, ...documents] }
              : c
          ))
        } else {
          setCollections([...collections, {
            name: selectedCollectionForJson,
            documents,
          }])
        }

        setJsonFile(null)
        setSelectedCollectionForJson('')
        alert(`Успешно загружено ${documents.length} документов`)
      } catch (error) {
        alert('Ошибка при загрузке JSON: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: NoSQLCollection = {
        name: newCollectionName.trim(),
        documents: [],
      }
      setCollections([...collections, newCollection])
      setNewCollectionName('')
      setEditingCollection(newCollection.name)
      if (!selectedCollectionForJson) {
        setSelectedCollectionForJson(newCollection.name)
      }
    }
  }

  const handleDeleteCollection = (collectionName: string) => {
    setCollections(collections.filter(c => c.name !== collectionName))
    if (editingCollection === collectionName) {
      setEditingCollection(null)
    }
    if (selectedCollectionForJson === collectionName) {
      setSelectedCollectionForJson('')
    }
  }

  const handleAddDocument = (collectionName: string) => {
    try {
      const document = newDocumentJson.trim() ? JSON.parse(newDocumentJson) : {}
      const newDoc: NoSQLDocument = {
        _id: `doc_${Date.now()}`,
        ...document,
      }
      setCollections(collections.map(c => 
        c.name === collectionName 
          ? { ...c, documents: [...c.documents, newDoc] }
          : c
      ))
      setNewDocumentJson('')
    } catch (error) {
      alert('Ошибка парсинга JSON: ' + (error as Error).message)
    }
  }

  const handleDeleteDocument = (collectionName: string, docIndex: number) => {
    setCollections(collections.map(c => 
      c.name === collectionName 
        ? { ...c, documents: c.documents.filter((_, i) => i !== docIndex) }
        : c
    ))
  }

  const handleAddKeyValue = () => {
    if (newKey.trim()) {
      let value: any = newValue.trim()
      try {
        value = JSON.parse(value)
      } catch {
        // Если не JSON, оставляем как строку
      }
      
      const newPair: KeyValuePair = {
        key: newKey.trim(),
        value,
      }
      setKeyValueStore({
        pairs: [...keyValueStore.pairs, newPair]
      })
      setNewKey('')
      setNewValue('')
    }
  }

  const handleDeleteKeyValue = (index: number) => {
    setKeyValueStore({
      pairs: keyValueStore.pairs.filter((_, i) => i !== index)
    })
  }

  const handleSave = () => {
    if (dbType === 'sql') {
      onUpdate(node.id, tables)
    } else if (nosqlType === 'key-value') {
      onUpdate(node.id, [], undefined, keyValueStore)
    } else {
      onUpdate(node.id, [], collections)
    }
    onClose()
  }

  const currentTable = tables.find(t => t.name === editingTable)
  const currentCollection = collections.find(c => c.name === editingCollection)

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
          Редактор схемы и данных базы данных
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

      {/* Информация о выбранной БД */}
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>Тип БД:</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#51cf66' }}>
          {dbType === 'sql' ? 'SQL' : `NoSQL (${nosqlType})`}
          {vendor && ` - ${vendor}`}
        </div>
      </div>

      {/* SQL базы данных */}
      {dbType === 'sql' && (
        <>
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
                  backgroundColor: '#51cf66',
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
                    border: `2px solid ${editingTable === table.name ? '#51cf66' : '#555'}`,
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
                        <span style={{ color: '#51cf66', marginLeft: '8px' }}>({column.type})</span>
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
                      backgroundColor: '#51cf66',
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
        </>
      )}

      {/* NoSQL - Document (MongoDB) */}
      {dbType === 'nosql' && nosqlType === 'document' && (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
              Загрузка JSON документов
            </h4>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
                {vendor === 'elasticsearch' 
                  ? 'Выберите или создайте индекс:' 
                  : 'Выберите или создайте коллекцию:'}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={selectedCollectionForJson}
                  onChange={(e) => setSelectedCollectionForJson(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                >
                  <option value="">{vendor === 'elasticsearch' ? '-- Выберите индекс --' : '-- Выберите коллекцию --'}</option>
                  {collections.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={vendor === 'elasticsearch' ? 'Новое название индекса' : 'Новое название коллекции'}
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCollection()
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                <button
                  onClick={handleAddCollection}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#51cf66',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Создать
                </button>
              </div>
            </div>

            {selectedCollectionForJson && (
              <div style={{ marginBottom: '15px' }}>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setJsonFile(file)
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  disabled={!selectedCollectionForJson}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: selectedCollectionForJson ? '#4dabf7' : '#555',
                    color: selectedCollectionForJson ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedCollectionForJson ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '10px',
                  }}
                >
                  {jsonFile ? `Файл: ${jsonFile.name}` : 'Загрузить JSON файл'}
                </button>
                {jsonFile && (
                  <button
                    onClick={handleJsonFileUpload}
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
                    {vendor === 'elasticsearch' 
                      ? `Импортировать в индекс "${selectedCollectionForJson}"`
                      : `Импортировать в коллекцию "${selectedCollectionForJson}"`}
                  </button>
                )}
              </div>
            )}

            {/* Список коллекций/индексов и документов */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '10px' }}>
                {vendor === 'elasticsearch' ? 'Индексы:' : 'Коллекции:'}
              </div>
              {collections.map((collection) => (
                <div
                  key={collection.name}
                  style={{
                    padding: '12px',
                    backgroundColor: editingCollection === collection.name ? '#3d3d3d' : '#2d2d2d',
                    border: `2px solid ${editingCollection === collection.name ? '#51cf66' : '#555'}`,
                    borderRadius: '8px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingCollection(editingCollection === collection.name ? null : collection.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        {collection.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {collection.documents.length} документов
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCollection(collection.name)
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

            {currentCollection && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                  {vendor === 'elasticsearch' 
                    ? `Индекс "${currentCollection.name}"`
                    : `Коллекция "${currentCollection.name}"`}
                </h4>

                <div style={{ marginBottom: '15px' }}>
                  <textarea
                    placeholder='JSON документ, например: {"name": "John", "age": 30}'
                    value={newDocumentJson}
                    onChange={(e) => setNewDocumentJson(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '10px',
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #555',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      marginBottom: '10px',
                    }}
                  />
                  <button
                    onClick={() => handleAddDocument(currentCollection.name)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#51cf66',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Добавить документ
                  </button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {currentCollection.documents.map((doc, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        backgroundColor: '#2d2d2d',
                        borderRadius: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <pre style={{ 
                          margin: 0, 
                          color: '#fff', 
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {JSON.stringify(doc, null, 2)}
                        </pre>
                        <button
                          onClick={() => handleDeleteDocument(currentCollection.name, index)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            marginLeft: '10px',
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* NoSQL - Key-Value */}
      {dbType === 'nosql' && nosqlType === 'key-value' && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
            Key-Value хранилище
          </h4>

          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '10px' }}>
              Загрузить из файла (формат: ключ=значение или ключ:значение, каждая пара на новой строке, или JSON объект):
            </div>
            <input
              ref={keyValueFileInputRef}
              type="file"
              accept=".txt,.json"
              onChange={handleKeyValueFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => keyValueFileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4dabf7',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '10px',
              }}
            >
              {keyValueFile ? `Файл: ${keyValueFile.name}` : 'Загрузить файл с ключ-значение парами'}
            </button>
            {keyValueFile && (
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                Выбран файл: {keyValueFile.name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '10px' }}>Или добавьте вручную:</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Ключ"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                placeholder="Значение (может быть JSON)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                style={{
                  flex: 2,
                  padding: '10px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleAddKeyValue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#51cf66',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '10px' }}>
              Загруженные пары ({keyValueStore.pairs.length}):
            </div>
            {keyValueStore.pairs.map((pair, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#4dabf7', fontWeight: '600', marginBottom: '4px' }}>
                    {pair.key}
                  </div>
                  <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
                    {typeof pair.value === 'object' ? JSON.stringify(pair.value) : String(pair.value)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKeyValue(index)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '10px',
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
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
            backgroundColor: '#51cf66',
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
