import { useState, useEffect, useMemo } from 'react'
import { Edge, Node } from 'reactflow'
import { ConnectionType, ComponentData, EdgePathType } from '../types'

interface ConnectionPanelProps {
  edge: Edge
  nodes: Node[]
  onUpdate: (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType) => void
  onDelete: () => void
}

const connectionTypes: Array<{ value: ConnectionType; label: string }> = [
  { value: 'rest', label: 'REST' },
  { value: 'grpc', label: 'gRPC' },
  { value: 'async', label: 'Асинхронный' },
  { value: 'database-connection', label: 'Database Connection' },
  { value: 'database-replication', label: 'Database Replication' },
  { value: 'cache-connection', label: 'Cache Connection' },
]

export default function ConnectionPanel({
  edge,
  nodes,
  onUpdate,
  onDelete,
}: ConnectionPanelProps) {
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    (edge.data?.connectionType as ConnectionType) || 'rest'
  )
  const [dataDescription, setDataDescription] = useState<string>(
    (edge.data?.dataDescription as string) || ''
  )
  const [pathType, setPathType] = useState<EdgePathType>(
    (edge.data?.pathType as EdgePathType) || 'step'
  )


  useEffect(() => {
    const edgeType = edge.data?.connectionType as ConnectionType
    if (edgeType) {
      setConnectionType(edgeType)
    }
    const description = edge.data?.dataDescription as string
    if (description !== undefined) {
      setDataDescription(description || '')
    }
    const path = edge.data?.pathType as EdgePathType
    if (path) {
      setPathType(path)
    }

  }, [edge])

  const handleChange = (newType: ConnectionType) => {
    setConnectionType(newType)
    onUpdate(edge.id, newType, dataDescription, pathType)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDataDescription(newDescription)
    onUpdate(edge.id, connectionType, newDescription, pathType)
  }

  const handlePathTypeChange = (newPathType: EdgePathType) => {
    setPathType(newPathType)
    onUpdate(edge.id, connectionType, dataDescription, newPathType)
  }

  // Определяем доступные типы связи на основе соединенных компонентов
  const availableTypes = useMemo(() => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!sourceNode || !targetNode) {
      return connectionTypes.filter((t) => t.value !== 'async')
    }

    const targetData = targetNode.data as ComponentData

    // Если целевой компонент - кеш, доступна только Cache Connection
    if (targetData.type === 'cache') {
      return connectionTypes.filter((t) => t.value === 'cache-connection')
    }

    // Если целевой компонент - брокер, доступна только асинхронная связь
    if (targetData.type === 'message-broker') {
      return connectionTypes.filter((t) => t.value === 'async')
    }

    // Если целевой компонент - БД, доступна только Database Connection
    if (targetData.type === 'database') {
      return connectionTypes.filter((t) => t.value === 'database-connection')
    }

    // Для синхронных компонентов доступны REST и gRPC
    return connectionTypes.filter((t) => t.value !== 'async')
  }, [edge, nodes])

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '1px solid #555',
        borderRadius: '8px',
        padding: '20px',
        minWidth: '250px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
        Настройка связи
      </h3>
      <div style={{ marginBottom: '15px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип связи:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {availableTypes.map((type) => (
            <label
              key={type.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor:
                  connectionType === type.value ? '#3d3d3d' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <input
                type="radio"
                name="connectionType"
                value={type.value}
                checked={connectionType === type.value}
                onChange={() => handleChange(type.value)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#fff' }}>{type.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип линии:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: pathType === 'straight' ? '#3d3d3d' : 'transparent',
              transition: 'background-color 0.2s',
            }}
          >
            <input
              type="radio"
              name="pathType"
              value="straight"
              checked={pathType === 'straight'}
              onChange={() => handlePathTypeChange('straight')}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#fff' }}>Прямая</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: pathType === 'step' ? '#3d3d3d' : 'transparent',
              transition: 'background-color 0.2s',
            }}
          >
            <input
              type="radio"
              name="pathType"
              value="step"
              checked={pathType === 'step'}
              onChange={() => handlePathTypeChange('step')}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#fff' }}>Прямоугольная</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: pathType === 'smoothstep' ? '#3d3d3d' : 'transparent',
              transition: 'background-color 0.2s',
            }}
          >
            <input
              type="radio"
              name="pathType"
              value="smoothstep"
              checked={pathType === 'smoothstep'}
              onChange={() => handlePathTypeChange('smoothstep')}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#fff' }}>Прямоугольная со скруглением</span>
          </label>
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Описание данных (опционально):
        </label>
        <textarea
          value={dataDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          onKeyDown={(e) => {
            // Предотвращаем удаление компонентов при нажатии Backspace/Delete в поле ввода
            e.stopPropagation()
          }}
          onKeyUp={(e) => {
            // Предотвращаем распространение событий клавиатуры
            e.stopPropagation()
          }}
          onClick={(e) => {
            // Предотвращаем клики по textarea от попадания в другие обработчики
            e.stopPropagation()
          }}
          placeholder="Например: JSON данные пользователя, SQL запросы, кешированные данные..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '8px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #555',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#888' }}>
          Укажите, какие данные передаются или получаются по этому соединению
        </div>
      </div>


      <button
        onClick={onDelete}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#c82333'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#dc3545'
        }}
      >
        Удалить связь
      </button>
    </div>
  )
}

