import { useState, useEffect, useMemo } from 'react'
import { Edge, Node } from 'reactflow'
import { ConnectionType, ComponentData, EdgePathType } from '../types'

interface ConnectionPanelProps {
  edge: Edge
  nodes: Node[]
  onUpdate: (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType, customColor?: string) => void
  onDelete: () => void
}

const connectionTypes: Array<{ value: ConnectionType; label: string }> = [
  { value: 'rest', label: 'REST' },
  { value: 'grpc', label: 'gRPC' },
  { value: 'async', label: 'Асинхронный' },
  { value: 'ws', label: 'WebSocket' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'database-connection', label: 'Database Connection' },
  { value: 'database-replication', label: 'Database Replication' },
  { value: 'cache-connection', label: 'Cache Connection' },
  { value: 'related', label: 'Имеет отношение' },
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
  const [customColor, setCustomColor] = useState<string>(
    (edge.data?.customColor as string) || ''
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
    const color = edge.data?.customColor as string
    if (color) {
      setCustomColor(color)
    } else {
      setCustomColor('')
    }


  }, [edge])

  const handleChange = (newType: ConnectionType) => {
    setConnectionType(newType)
    onUpdate(edge.id, newType, dataDescription, pathType, customColor)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDataDescription(newDescription)
    onUpdate(edge.id, connectionType, newDescription, pathType, customColor)
  }

  const handlePathTypeChange = (newPathType: EdgePathType) => {
    setPathType(newPathType)
    onUpdate(edge.id, connectionType, dataDescription, newPathType, customColor)
  }

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor)
    onUpdate(edge.id, connectionType, dataDescription, pathType, newColor)
  }

  // Определяем доступные типы связи на основе соединенных компонентов
  const availableTypes = useMemo(() => {
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!targetNode) {
      return connectionTypes
    }

    const targetData = targetNode.data as ComponentData

    // Всегда разрешаем основные типы для максимальной гибкости проектирования
    const coreValues = ['rest', 'grpc', 'async', 'ws', 'graphql', 'related']

    // Специализированные типы добавляются в зависимости от целевого компонента
    const allowedValues = new Set([...coreValues])

    if (targetData.type === 'cache') {
      allowedValues.add('cache-connection')
    } else if (targetData.type === 'database' || targetData.type === 'data-warehouse') {
      allowedValues.add('database-connection')
      allowedValues.add('database-replication')
    } else if (targetData.type === 'message-broker') {
      // 'async' уже в coreValues
    }

    // Если текущий тип не входит в список, добавляем его, чтобы он не пропадал
    const currentType = (edge.data?.connectionType as ConnectionType)
    if (currentType) {
      allowedValues.add(currentType)
    }

    return connectionTypes.filter((t) => allowedValues.has(t.value))
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
          Цвет линии:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['', '#4dabf7', '#51cf66', '#ff6b6b', '#ffd43b', '#adb5bd', '#f06595', '#845ef7'].map((color) => (
            <div
              key={color || 'default'}
              onClick={() => handleColorChange(color)}
              title={color ? color : 'По умолчанию'}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: color || '#4dabf7',
                border: customColor === color ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: customColor === color ? '0 0 0 2px #4dabf7' : 'none',
              }}
            >
              {!color && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#fff',
                  transformOrigin: 'center',
                  rotate: '45deg'
                }} />
              )}
            </div>
          ))}
          <input
            type="color"
            value={customColor || '#4dabf7'}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: '30px',
              height: '30px',
              padding: '0',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          />
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
    </div >
  )
}

