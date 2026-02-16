import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, CacheType } from '../types'

interface CacheConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { cacheType: CacheType }) => void
  onClose: () => void
}

const cacheTypes: Array<{ value: CacheType; label: string; description: string }> = [
  { 
    value: 'distributed', 
    label: 'Распределенный', 
    description: 'Redis, Memcached, Hazelcast - общий кеш для всех экземпляров' 
  },
  { 
    value: 'in-memory', 
    label: 'В памяти приложения', 
    description: 'Локальный кеш в памяти каждого экземпляра приложения' 
  },
]

export default function CacheConfigPanel({
  node,
  onUpdate,
  onClose,
}: CacheConfigPanelProps) {
  const data = node.data as ComponentData
  const [cacheType, setCacheType] = useState<CacheType>(
    data.cacheConfig?.cacheType || 'distributed'
  )

  const handleSave = () => {
    onUpdate(node.id, { cacheType })
    onClose()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #845ef7',
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
          Настройка кеша
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
          Тип кеша:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cacheTypes.map((type) => (
            <label
              key={type.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: cacheType === type.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${cacheType === type.value ? '#845ef7' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setCacheType(type.value)}
            >
              <input
                type="radio"
                name="cacheType"
                value={type.value}
                checked={cacheType === type.value}
                onChange={() => setCacheType(type.value)}
                style={{ cursor: 'pointer', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  {type.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{type.description}</div>
              </div>
            </label>
          ))}
        </div>
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
            backgroundColor: '#845ef7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7048e8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#845ef7'
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}














