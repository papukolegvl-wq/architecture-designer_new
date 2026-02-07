import { useState, useEffect, useMemo } from 'react'
import { Edge, Node } from 'reactflow'
import { ArrowLeftRight, EyeOff, Target, XCircle, TrendingUp, AlertTriangle, Tag } from 'lucide-react'
import { ConnectionType, ComponentData, EdgePathType } from '../types'
import { handleTextareaTab } from '../utils/textUtils'

interface ConnectionPanelProps {
  edge: Edge
  nodes: Node[]
  onUpdate: (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType, customColor?: string, accented?: boolean, isBackground?: boolean, toBeDeleted?: boolean, increasedLoad?: boolean, hasIncorrectData?: boolean, incorrectDataComment?: string, toBeDeletedComment?: string, increasedLoadComment?: string, showProtocolBadge?: boolean) => void
  onDelete: () => void
  onReverse?: (edgeId: string) => void
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
  { value: 'etl', label: 'ETL / Pipeline' },
  { value: 'jdbc', label: 'JDBC / SQL' },
  { value: 'kafka', label: 'Kafka / Streaming' },
  { value: 'related', label: 'Имеет отношение' },
]

export default function ConnectionPanel({
  edge,
  nodes,
  onUpdate,
  onDelete,
  onReverse,
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
  const [accented, setAccented] = useState<boolean>(
    (edge.data?.accented as boolean) || false
  )
  const [isBackground, setIsBackground] = useState<boolean>(
    (edge.data?.isBackground as boolean) || false
  )
  const [toBeDeleted, setToBeDeleted] = useState<boolean>(
    (edge.data?.toBeDeleted as boolean) || false
  )
  const [increasedLoad, setIncreasedLoad] = useState<boolean>(
    (edge.data?.increasedLoad as boolean) || false
  )
  const [hasIncorrectData, setHasIncorrectData] = useState<boolean>(
    (edge.data?.hasIncorrectData as boolean) || false
  )

  const [incorrectDataComment, setIncorrectDataComment] = useState<string>(
    (edge.data?.incorrectDataComment as string) || ''
  )
  const [toBeDeletedComment, setToBeDeletedComment] = useState<string>(
    (edge.data?.toBeDeletedComment as string) || ''
  )
  const [increasedLoadComment, setIncreasedLoadComment] = useState<string>(
    (edge.data?.increasedLoadComment as string) || ''
  )
  const [showProtocolBadge, setShowProtocolBadge] = useState<boolean>(
    !!edge.data?.showProtocolBadge
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

    const isAccented = edge.data?.accented as boolean
    setAccented(!!isAccented)
    const background = edge.data?.isBackground as boolean
    setIsBackground(!!background)
    const isDeleted = edge.data?.toBeDeleted as boolean
    setToBeDeleted(!!isDeleted)
    const isIncreased = edge.data?.increasedLoad as boolean
    const isIncorrect = edge.data?.hasIncorrectData as boolean
    setHasIncorrectData(!!isIncorrect)
    const incorrectComment = edge.data?.incorrectDataComment as string
    setIncorrectDataComment(incorrectComment || '')
    const deleteComment = edge.data?.toBeDeletedComment as string
    setToBeDeletedComment(deleteComment || '')
    const loadComment = edge.data?.increasedLoadComment as string
    setIncreasedLoadComment(loadComment || '')
    setShowProtocolBadge(!!edge.data?.showProtocolBadge)

  }, [edge])

  const handleChange = (newType: ConnectionType) => {
    setConnectionType(newType)
    onUpdate(edge.id, newType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDataDescription(newDescription)
    onUpdate(edge.id, connectionType, newDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handlePathTypeChange = (newPathType: EdgePathType) => {
    setPathType(newPathType)
    onUpdate(edge.id, connectionType, dataDescription, newPathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor)
    onUpdate(edge.id, connectionType, dataDescription, pathType, newColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleAccentedToggle = (newAccented: boolean) => {
    setAccented(newAccented)
    // Если включаем акцент, выключаем фон
    const newBackground = newAccented ? false : isBackground
    if (newAccented) setIsBackground(false)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, newAccented, newBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleBackgroundToggle = (newBackground: boolean) => {
    setIsBackground(newBackground)
    // Если включаем фон, выключаем акцент
    const newAccented = newBackground ? false : accented
    if (newBackground) setAccented(false)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, newAccented, newBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleDeletedToggle = (newDeleted: boolean) => {
    setToBeDeleted(newDeleted)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, newDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleDeleteCommentChange = (newComment: string) => {
    setToBeDeletedComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, newComment, increasedLoadComment, showProtocolBadge)
  }

  const handleLoadToggle = (newLoad: boolean) => {
    setIncreasedLoad(newLoad)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, newLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleLoadCommentChange = (newComment: string) => {
    setIncreasedLoadComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, newComment, showProtocolBadge)
  }

  const handleIncorrectDataToggle = (newIncorrect: boolean) => {
    setHasIncorrectData(newIncorrect)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, newIncorrect, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleIncorrectDataCommentChange = (newComment: string) => {
    setIncorrectDataComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, newComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge)
  }

  const handleShowProtocolToggle = (newShow: boolean) => {
    setShowProtocolBadge(newShow)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, newShow)
  }

  // Определяем доступные типы связи на основе соединенных компонентов
  const availableTypes = useMemo(() => {
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!targetNode) {
      return connectionTypes
    }

    const targetData = targetNode.data as ComponentData

    // Всегда разрешаем основные типы для максимальной гибкости проектирования
    const coreValues = ['rest', 'grpc', 'async', 'ws', 'graphql', 'related', 'etl', 'kafka', 'jdbc', 'database-connection']

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

      <div style={{ marginBottom: '10px' }}>
        <label
          onClick={() => handleAccentedToggle(!accented)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: accented ? '#e6498020' : '#3d3d3d50',
            border: `1px solid ${accented ? '#e64980' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: accented ? '#e64980' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: accented ? '#e64980' : '#fff' }}>Акцент</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Выделить линию для презентации</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: accented ? '#e64980' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: accented ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          onClick={() => handleBackgroundToggle(!isBackground)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: isBackground ? '#adb5bd20' : '#3d3d3d50',
            border: `1px solid ${isBackground ? '#adb5bd' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isBackground ? '#adb5bd' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <EyeOff size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: isBackground ? '#adb5bd' : '#fff' }}>В фоне</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Сделать линию приглушенной</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: isBackground ? '#adb5bd' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: isBackground ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label
          onClick={() => handleShowProtocolToggle(!showProtocolBadge)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: showProtocolBadge ? '#339af020' : '#3d3d3d50',
            border: `1px solid ${showProtocolBadge ? '#339af0' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: showProtocolBadge ? '#339af0' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <Tag size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: showProtocolBadge ? '#339af0' : '#fff' }}>Протокол</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Показать тип протокола на линии</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: showProtocolBadge ? '#339af0' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: showProtocolBadge ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label
          onClick={() => handleDeletedToggle(!toBeDeleted)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: toBeDeleted ? '#dc354520' : '#3d3d3d50',
            border: `1px solid ${toBeDeleted ? '#dc3545' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: toBeDeleted ? '#dc3545' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <XCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: toBeDeleted ? '#dc3545' : '#fff' }}>Удалить</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Пометить как удаляемую связь</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: toBeDeleted ? '#dc3545' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: toBeDeleted ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
        {toBeDeleted && (
          <div style={{ marginTop: '8px', marginLeft: '12px', marginRight: '1px' }}>
            <input
              type="text"
              value={toBeDeletedComment}
              onChange={(e) => handleDeleteCommentChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Tab') {
                  handleTextareaTab(e as any, toBeDeletedComment, setToBeDeletedComment);
                  const newComment = toBeDeletedComment.substring(0, (e.target as any).selectionStart) + '  ' + toBeDeletedComment.substring((e.target as any).selectionEnd);
                  handleDeleteCommentChange(newComment);
                }
              }}
              placeholder="Текст для удаления (под значком)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #dc3545',
                backgroundColor: '#2d2d2d',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          onClick={() => handleLoadToggle(!increasedLoad)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: increasedLoad ? '#fab00520' : '#3d3d3d50',
            border: `1px solid ${increasedLoad ? '#fab005' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: increasedLoad ? '#fab005' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: increasedLoad ? '#fab005' : '#fff' }}>Нагрузка</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Пометить увеличение нагрузки</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: increasedLoad ? '#fab005' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: increasedLoad ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
        {increasedLoad && (
          <div style={{ marginTop: '8px', marginLeft: '12px', marginRight: '1px' }}>
            <input
              type="text"
              value={increasedLoadComment}
              onChange={(e) => handleLoadCommentChange(e.target.value)}
              placeholder="Текст ошибки (под значком)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #fab005',
                backgroundColor: '#2d2d2d',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          onClick={() => handleIncorrectDataToggle(!hasIncorrectData)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: hasIncorrectData ? '#fd7e1420' : '#3d3d3d50',
            border: `1px solid ${hasIncorrectData ? '#fd7e14' : '#444'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: hasIncorrectData ? '#fd7e14' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: hasIncorrectData ? '#fd7e14' : '#fff' }}>Данные</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Пометить некорректные данные</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: hasIncorrectData ? '#fd7e14' : '#555',
            borderRadius: '10px',
            position: 'relative',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: hasIncorrectData ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
        {hasIncorrectData && (
          <div style={{ marginTop: '8px', marginLeft: '12px', marginRight: '1px' }}>
            <input
              type="text"
              value={incorrectDataComment}
              onChange={(e) => handleIncorrectDataCommentChange(e.target.value)}
              placeholder="Текст ошибки (под значком)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #fd7e14',
                backgroundColor: '#2d2d2d',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
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
            e.stopPropagation()
            if (e.key === 'Tab') {
              handleTextareaTab(e, dataDescription, setDataDescription);
              const newDescription = dataDescription.substring(0, e.currentTarget.selectionStart) + '  ' + dataDescription.substring(e.currentTarget.selectionEnd);
              handleDescriptionChange(newDescription);
            }
            // Разрешаем Enter проходить дальше для стандартного поведения textarea
          }}
          onKeyUp={(e) => {
            e.stopPropagation()
          }}
          onClick={(e) => {
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
        onClick={() => onReverse?.(edge.id)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#3d3d3d',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4d4d4d'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3d3d3d'
        }}
      >
        <ArrowLeftRight size={16} />
        Поменять направление
      </button>

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

