import { useState, useMemo } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ComponentType } from '../types'
import { List, Search, X } from 'lucide-react'

interface ComponentListPanelProps {
  nodes: Node[]
  onNodeSelect: (nodeId: string) => void
  onClose: () => void
}

export default function ComponentListPanel({ nodes, onNodeSelect, onClose }: ComponentListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ComponentType | 'all'>('all')

  // Получаем все уникальные типы компонентов
  const componentTypes = useMemo(() => {
    const types = new Set<ComponentType>()
    nodes.forEach(node => {
      const data = node.data as ComponentData
      if (data?.type) {
        types.add(data.type)
      }
    })
    return Array.from(types).sort()
  }, [nodes])

  // Фильтруем узлы
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const data = node.data as ComponentData
      const matchesSearch = searchQuery === '' || 
        (data?.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (data?.type || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || data?.type === filterType
      return matchesSearch && matchesType
    })
  }, [nodes, searchQuery, filterType])

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId)
    onClose()
  }

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
        width: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={24} />
          Список компонентов
        </h2>
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

      {/* Поиск */}
      <div style={{ marginBottom: '12px', position: 'relative' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#888',
            pointerEvents: 'none',
          }} 
        />
        <input
          type="text"
          placeholder="Поиск компонентов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4dabf7'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#555'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#888'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Фильтр по типу */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '6px 12px',
            backgroundColor: filterType === 'all' ? '#4dabf7' : '#2d2d2d',
            color: '#fff',
            border: `1px solid ${filterType === 'all' ? '#4dabf7' : '#555'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          Все
        </button>
        {componentTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 12px',
              backgroundColor: filterType === type ? '#4dabf7' : '#2d2d2d',
              color: '#fff',
              border: `1px solid ${filterType === type ? '#4dabf7' : '#555'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Список компонентов */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Компоненты не найдены
          </div>
        ) : (
          filteredNodes.map(node => {
            const data = node.data as ComponentData
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{
                  padding: '12px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e1e1e'
                }}
              >
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  {data?.label || node.id}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  Тип: {data?.type || 'unknown'} | ID: {node.id.substring(0, 8)}...
                </div>
                {data?.comment && (
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                    {data.comment.substring(0, 50)}{data.comment.length > 50 ? '...' : ''}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div style={{ marginTop: '12px', color: '#888', fontSize: '12px', textAlign: 'center' }}>
        Найдено: {filteredNodes.length} из {nodes.length}
      </div>
    </div>
  )
}

