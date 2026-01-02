import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, DataWarehouseVendor } from '../types'

interface DataWarehouseConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { vendor: DataWarehouseVendor }) => void
  onClose: () => void
  onOpenDataPanel?: (nodeId: string, addExample?: boolean) => void
}

const vendors: Array<{ value: DataWarehouseVendor; label: string; description: string }> = [
  { value: 'snowflake', label: 'Snowflake', description: 'Cloud data platform' },
  { value: 'redshift', label: 'AWS Redshift', description: 'Amazon data warehouse' },
  { value: 'bigquery', label: 'Google BigQuery', description: 'Google data warehouse' },
  { value: 'databricks', label: 'Databricks', description: 'Lakehouse platform' },
  { value: 'synapse', label: 'Azure Synapse', description: 'Microsoft analytics service' },
  { value: 'teradata', label: 'Teradata', description: 'Enterprise data warehouse' },
]

export default function DataWarehouseConfigPanel({
  node,
  onUpdate,
  onClose,
  onOpenDataPanel,
}: DataWarehouseConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<DataWarehouseVendor | undefined>(
    data.dataWarehouseConfig?.vendor
  )

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
        border: '2px solid #20c997',
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
          Платформа:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            disabled={!vendor}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: vendor ? '#20c997' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: vendor ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: vendor ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (vendor) {
                e.currentTarget.style.backgroundColor = '#1aa179'
              }
            }}
            onMouseLeave={(e) => {
              if (vendor) {
                e.currentTarget.style.backgroundColor = '#20c997'
              }
            }}
          >
            Сохранить
          </button>
        </div>
        {vendor && onOpenDataPanel && (
          <button
            onClick={() => {
              handleSave()
              setTimeout(() => {
                onOpenDataPanel!(node.id, false)
              }, 100)
            }}
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

