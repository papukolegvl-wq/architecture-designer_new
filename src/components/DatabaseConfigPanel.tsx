import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, DatabaseType, NoSQLType, DatabaseVendor } from '../types'

interface DatabaseConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { dbType: DatabaseType; nosqlType?: NoSQLType; vendor?: DatabaseVendor }) => void
  onClose: () => void
  onOpenSchemaEditor?: (nodeId: string) => void
}

const databaseTypes: Array<{ value: DatabaseType; label: string }> = [
  { value: 'sql', label: 'SQL' },
  { value: 'nosql', label: 'NoSQL' },
]

const nosqlTypes: Array<{ value: NoSQLType; label: string; description: string }> = [
  { value: 'document', label: 'Документоориентированная', description: 'MongoDB, CouchDB' },
  { value: 'column', label: 'Колоночная', description: 'Cassandra, HBase' },
  { value: 'key-value', label: 'Ключ-значение', description: 'Redis, DynamoDB' },
  { value: 'graph', label: 'Графовая', description: 'Neo4j, ArangoDB' },
  { value: 'time-series', label: 'Временные ряды', description: 'InfluxDB, TimescaleDB' },
]

const sqlVendors: Array<{ value: DatabaseVendor; label: string }> = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sql-server', label: 'SQL Server' },
]

const nosqlVendors: Record<NoSQLType, Array<{ value: DatabaseVendor; label: string }>> = {
  document: [
    { value: 'mongodb', label: 'MongoDB' },
  ],
  column: [
    { value: 'cassandra', label: 'Cassandra' },
  ],
  'key-value': [
    { value: 'redis', label: 'Redis' },
    { value: 'dynamodb', label: 'DynamoDB' },
  ],
  graph: [
    { value: 'neo4j', label: 'Neo4j' },
  ],
  'time-series': [
    { value: 'influxdb', label: 'InfluxDB' },
  ],
}

const searchVendors: Array<{ value: DatabaseVendor; label: string }> = [
  { value: 'elasticsearch', label: 'Elasticsearch' },
]

export default function DatabaseConfigPanel({
  node,
  onUpdate,
  onClose,
  onOpenSchemaEditor,
}: DatabaseConfigPanelProps) {
  const data = node.data as ComponentData
  const [dbType, setDbType] = useState<DatabaseType>(
    data.databaseConfig?.dbType || 'sql'
  )
  const [nosqlType, setNosqlType] = useState<NoSQLType | undefined>(
    data.databaseConfig?.nosqlType
  )
  const [vendor, setVendor] = useState<DatabaseVendor | undefined>(
    data.databaseConfig?.vendor
  )

  useEffect(() => {
    if (dbType === 'nosql' && !nosqlType) {
      setNosqlType('document')
    }
    // Сбрасываем vendor при смене типа
    if (dbType === 'sql') {
      setVendor(undefined)
    }
  }, [dbType, nosqlType])

  const availableVendors = dbType === 'sql' 
    ? sqlVendors 
    : nosqlType 
      ? [...(nosqlVendors[nosqlType] || []), ...searchVendors]
      : []

  const handleSave = () => {
    onUpdate(node.id, {
      dbType,
      nosqlType: dbType === 'nosql' ? nosqlType : undefined,
      vendor,
    })
    onClose()
  }

  const handleSaveAndAddData = () => {
    onUpdate(node.id, {
      dbType,
      nosqlType: dbType === 'nosql' ? nosqlType : undefined,
      vendor,
    })
    onClose()
    // После сохранения конфигурации открываем редактор схемы для добавления данных
    setTimeout(() => {
      if (onOpenSchemaEditor) {
        onOpenSchemaEditor(node.id)
      } else {
        // Fallback на событие, если callback не передан
        const event = new CustomEvent('openSchemaEditor', {
          detail: { nodeId: node.id },
        })
        window.dispatchEvent(event)
      }
    }, 200)
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
        minWidth: '350px',
        maxWidth: '400px',
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
          Тип СУБД:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {databaseTypes.map((type) => (
            <label
              key={type.value}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: dbType === type.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${dbType === type.value ? '#51cf66' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setDbType(type.value)}
            >
              <input
                type="radio"
                name="dbType"
                value={type.value}
                checked={dbType === type.value}
                onChange={() => setDbType(type.value)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {dbType === 'nosql' && (
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
            Тип NoSQL:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nosqlTypes.map((type) => (
              <label
                key={type.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: nosqlType === type.value ? '#3d3d3d' : 'transparent',
                  border: `2px solid ${nosqlType === type.value ? '#51cf66' : '#555'}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => {
                  setNosqlType(type.value)
                  setVendor(undefined)
                }}
              >
                <input
                  type="radio"
                  name="nosqlType"
                  value={type.value}
                  checked={nosqlType === type.value}
                  onChange={() => {
                    setNosqlType(type.value)
                    setVendor(undefined)
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {availableVendors.length > 0 && (
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
            Конкретная СУБД:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableVendors.map((v) => (
              <label
                key={v.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                  border: `1px solid ${vendor === v.value ? '#51cf66' : '#555'}`,
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
                <span style={{ fontSize: '14px', color: '#fff' }}>{v.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              backgroundColor: '#51cf66',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#40c057'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#51cf66'
            }}
          >
            Сохранить
          </button>
        </div>
        {(dbType && vendor) && (
          <button
            onClick={handleSaveAndAddData}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4dabf7',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#339af0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4dabf7'
            }}
          >
            Сохранить и добавить данные
          </button>
        )}
      </div>
    </div>
  )
}

