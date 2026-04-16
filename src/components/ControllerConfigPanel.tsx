import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ControllerEndpoint } from '../types'
import { X, Plus, Trash2 } from 'lucide-react'

interface ControllerConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { endpoints: ControllerEndpoint[] }) => void
  onClose: () => void
}

export default function ControllerConfigPanel({
  node,
  onUpdate,
  onClose,
}: ControllerConfigPanelProps) {
  const data = node.data as ComponentData
  const [endpoints, setEndpoints] = useState<ControllerEndpoint[]>(
    data.controllerConfig?.endpoints || []
  )

  const handleAddEndpoint = () => {
    setEndpoints([
      ...endpoints,
      {
        path: '',
        method: 'GET',
        description: '',
      },
    ])
  }

  const handleRemoveEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index))
  }

  const handleEndpointChange = (
    index: number,
    field: keyof ControllerEndpoint,
    value: string
  ) => {
    const updated = [...endpoints]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setEndpoints(updated)
  }

  const handleSave = () => {
    // Фильтруем endpoints с заполненным path
    const validEndpoints = endpoints.filter((e) => e.path.trim() !== '')
    onUpdate(node.id, { endpoints: validEndpoints })
    onClose()
  }

  const methodColors: Record<string, string> = {
    GET: '#51cf66',
    POST: '#4dabf7',
    PUT: '#ffd43b',
    DELETE: '#ff6b6b',
    PATCH: '#845ef7',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #4dabf7',
        borderRadius: '12px',
        padding: '25px',
        minWidth: '500px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
          Настройка контроллера: {data.label}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3 style={{ color: '#fff', margin: 0, fontSize: '14px' }}>
            Endpoints (запросы)
          </h3>
          <button
            onClick={handleAddEndpoint}
            style={{
              backgroundColor: '#4dabf7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <Plus size={14} />
            Добавить endpoint
          </button>
        </div>

        {endpoints.length === 0 ? (
          <div
            style={{
              color: '#888',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px',
            }}
          >
            Нет endpoints. Нажмите "Добавить endpoint" для создания.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: '#4dabf7', fontSize: '12px', fontWeight: 'bold' }}>
                    Endpoint #{index + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveEndpoint(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: '0 0 120px' }}>
                      <label
                        style={{
                          display: 'block',
                          color: '#fff',
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}
                      >
                        Метод HTTP
                      </label>
                      <select
                        value={endpoint.method}
                        onChange={(e) =>
                          handleEndpointChange(
                            index,
                            'method',
                            e.target.value
                          )
                        }
                        style={{
                          width: '100%',
                          padding: '6px',
                          backgroundColor: '#2d2d2d',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          color: '#fff',
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}
                      >
                        Путь (Path) *
                      </label>
                      <input
                        type="text"
                        value={endpoint.path}
                        onChange={(e) =>
                          handleEndpointChange(index, 'path', e.target.value)
                        }
                        placeholder="/api/users/:id"
                        style={{
                          width: '100%',
                          padding: '6px',
                          backgroundColor: '#2d2d2d',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#fff',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      Описание
                    </label>
                    <textarea
                      value={endpoint.description || ''}
                      onChange={(e) =>
                        handleEndpointChange(index, 'description', e.target.value)
                      }
                      placeholder="Описание того, что делает этот endpoint"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '6px',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: '8px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#888',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: methodColors[endpoint.method] || '#666',
                        color: '#fff',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span style={{ color: '#fff' }}>
                      {endpoint.path || '/path'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#4dabf7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}












