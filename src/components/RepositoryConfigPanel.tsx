import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, RepositoryData } from '../types'
import { X, Plus, Trash2 } from 'lucide-react'

interface RepositoryConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { data: RepositoryData[] }) => void
  onClose: () => void
}

export default function RepositoryConfigPanel({
  node,
  onUpdate,
  onClose,
}: RepositoryConfigPanelProps) {
  const data = node.data as ComponentData
  const [repositoryData, setRepositoryData] = useState<RepositoryData[]>(
    data.repositoryConfig?.data || []
  )

  const handleAddData = () => {
    setRepositoryData([
      ...repositoryData,
      {
        table: '',
        operations: [],
        description: '',
      },
    ])
  }

  const handleRemoveData = (index: number) => {
    setRepositoryData(repositoryData.filter((_, i) => i !== index))
  }

  const handleDataChange = (
    index: number,
    field: keyof RepositoryData,
    value: string | ('read' | 'write' | 'update' | 'delete')[]
  ) => {
    const updated = [...repositoryData]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setRepositoryData(updated)
  }

  const handleToggleOperation = (
    index: number,
    operation: 'read' | 'write' | 'update' | 'delete'
  ) => {
    const data = repositoryData[index]
    const operations = data.operations || []
    const newOperations = operations.includes(operation)
      ? operations.filter((op) => op !== operation)
      : [...operations, operation]
    handleDataChange(index, 'operations', newOperations)
  }

  const handleSave = () => {
    // Фильтруем данные с заполненной таблицей
    const validData = repositoryData.filter((d) => d.table?.trim() !== '')
    onUpdate(node.id, { data: validData })
    onClose()
  }

  const operationLabels: Record<string, string> = {
    read: 'Чтение',
    write: 'Запись',
    update: 'Обновление',
    delete: 'Удаление',
  }

  const operationColors: Record<string, string> = {
    read: '#51cf66',
    write: '#4dabf7',
    update: '#ffd43b',
    delete: '#ff6b6b',
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
          Настройка репозитория: {data.label}
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
            Данные из базы
          </h3>
          <button
            onClick={handleAddData}
            style={{
              backgroundColor: '#51cf66',
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
            Добавить данные
          </button>
        </div>

        {repositoryData.length === 0 ? (
          <div
            style={{
              color: '#888',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px',
            }}
          >
            Нет данных. Нажмите "Добавить данные" для создания.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {repositoryData.map((dataItem, index) => (
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
                  <span style={{ color: '#51cf66', fontSize: '12px', fontWeight: 'bold' }}>
                    Данные #{index + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveData(index)}
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
                      Таблица/Коллекция *
                    </label>
                    <input
                      type="text"
                      value={dataItem.table || ''}
                      onChange={(e) =>
                        handleDataChange(index, 'table', e.target.value)
                      }
                      placeholder="например: users, products, orders"
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
                      Операции
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {(['read', 'write', 'update', 'delete'] as const).map(
                        (operation) => {
                          const isSelected =
                            dataItem.operations?.includes(operation) || false
                          return (
                            <button
                              key={operation}
                              onClick={() => handleToggleOperation(index, operation)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: isSelected
                                  ? operationColors[operation]
                                  : '#2d2d2d',
                                color: isSelected ? '#fff' : '#888',
                                border: `1px solid ${
                                  isSelected
                                    ? operationColors[operation]
                                    : '#555'
                                }`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'all 0.2s',
                              }}
                            >
                              {operationLabels[operation]}
                            </button>
                          )
                        }
                      )}
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
                      value={dataItem.description || ''}
                      onChange={(e) =>
                        handleDataChange(index, 'description', e.target.value)
                      }
                      placeholder="Описание данных, которые получаются из этой таблицы"
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
            backgroundColor: '#51cf66',
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












