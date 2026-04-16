import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ClassMethod } from '../types'
import { X, Plus, Trash2 } from 'lucide-react'

interface ClassConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { methods: ClassMethod[] }) => void
  onClose: () => void
}

export default function ClassConfigPanel({
  node,
  onUpdate,
  onClose,
}: ClassConfigPanelProps) {
  const data = node.data as ComponentData
  const [methods, setMethods] = useState<ClassMethod[]>(
    data.classConfig?.methods || []
  )

  const handleAddMethod = () => {
    setMethods([
      ...methods,
      {
        name: '',
        returnType: '',
        parameters: '',
        visibility: 'public',
      },
    ])
  }

  const handleRemoveMethod = (index: number) => {
    setMethods(methods.filter((_, i) => i !== index))
  }

  const handleMethodChange = (
    index: number,
    field: keyof ClassMethod,
    value: string
  ) => {
    const updated = [...methods]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setMethods(updated)
  }

  const handleSave = () => {
    // Фильтруем методы с заполненным именем
    const validMethods = methods.filter((m) => m.name.trim() !== '')
    onUpdate(node.id, { methods: validMethods })
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
          Настройка класса: {data.label}
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
            Методы класса
          </h3>
          <button
            onClick={handleAddMethod}
            style={{
              backgroundColor: '#845ef7',
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
            Добавить метод
          </button>
        </div>

        {methods.length === 0 ? (
          <div
            style={{
              color: '#888',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px',
            }}
          >
            Нет методов. Нажмите "Добавить метод" для создания.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {methods.map((method, index) => (
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
                  <span style={{ color: '#845ef7', fontSize: '12px', fontWeight: 'bold' }}>
                    Метод #{index + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveMethod(index)}
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
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#fff',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      Видимость
                    </label>
                    <select
                      value={method.visibility || 'public'}
                      onChange={(e) =>
                        handleMethodChange(
                          index,
                          'visibility',
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
                      <option value="public">public</option>
                      <option value="private">private</option>
                      <option value="protected">protected</option>
                    </select>
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
                      Имя метода *
                    </label>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) =>
                        handleMethodChange(index, 'name', e.target.value)
                      }
                      placeholder="например: getUserById"
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

                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#fff',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      Тип возвращаемого значения
                    </label>
                    <input
                      type="text"
                      value={method.returnType || ''}
                      onChange={(e) =>
                        handleMethodChange(index, 'returnType', e.target.value)
                      }
                      placeholder="например: User, void, String"
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

                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#fff',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      Параметры
                    </label>
                    <input
                      type="text"
                      value={method.parameters || ''}
                      onChange={(e) =>
                        handleMethodChange(index, 'parameters', e.target.value)
                      }
                      placeholder="например: int id, String name"
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
            backgroundColor: '#845ef7',
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












