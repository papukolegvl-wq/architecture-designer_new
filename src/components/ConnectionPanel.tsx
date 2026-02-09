import { useState, useEffect, useMemo } from 'react'
import { Edge, Node } from 'reactflow'
import { ArrowLeftRight, EyeOff, Target, XCircle, TrendingUp, AlertTriangle, Tag, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { ConnectionType, ComponentData, EdgePathType } from '../types'
import { handleTextareaTab } from '../utils/textUtils'

interface ConnectionPanelProps {
  edge: Edge
  nodes: Node[]
  onUpdate: (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType, customColor?: string, accented?: boolean, isBackground?: boolean, toBeDeleted?: boolean, increasedLoad?: boolean, hasIncorrectData?: boolean, incorrectDataComment?: string, toBeDeletedComment?: string, increasedLoadComment?: string, showProtocolBadge?: boolean, isTruthSource?: boolean) => void
  onDelete: () => void
  onReverse?: (edgeId: string) => void
}

const connectionTypes: Array<{ value: ConnectionType; label: string }> = [
  { value: 'rest', label: 'REST' },
  { value: 'grpc', label: 'gRPC' },
  { value: 'async', label: 'Асинхронний' },
  { value: 'ws', label: 'WebSocket' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'database-connection', label: 'Database Connection' },
  { value: 'database-replication', label: 'Database Replication' },
  { value: 'cache-connection', label: 'Cache Connection' },
  { value: 'etl', label: 'ETL / Pipeline' },
  { value: 'jdbc', label: 'JDBC / SQL' },
  { value: 'kafka', label: 'Kafka / Streaming' },
  { value: 'related', label: 'Має відношення' },
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
  const [isTruthSource, setIsTruthSource] = useState<boolean>(
    !!edge.data?.isTruthSource
  )
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

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
    setIsTruthSource(!!edge.data?.isTruthSource)
  }, [edge])

  const handleIsTruthSourceToggle = (newIsTruthSource: boolean) => {
    setIsTruthSource(newIsTruthSource)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, newIsTruthSource)
  }

  const handleChange = (newType: ConnectionType) => {
    setConnectionType(newType)
    onUpdate(edge.id, newType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDataDescription(newDescription)
    onUpdate(edge.id, connectionType, newDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handlePathTypeChange = (newPathType: EdgePathType) => {
    setPathType(newPathType)
    onUpdate(edge.id, connectionType, dataDescription, newPathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor)
    onUpdate(edge.id, connectionType, dataDescription, pathType, newColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleAccentedToggle = (newAccented: boolean) => {
    setAccented(newAccented)
    // Если включаем акцент, выключаем фон
    const newBackground = newAccented ? false : isBackground
    if (newAccented) setIsBackground(false)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, newAccented, newBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleBackgroundToggle = (newBackground: boolean) => {
    setIsBackground(newBackground)
    // Если включаем фон, выключаем акцент
    const newAccented = newBackground ? false : accented
    if (newBackground) setAccented(false)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, newAccented, newBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleDeletedToggle = (newDeleted: boolean) => {
    setToBeDeleted(newDeleted)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, newDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleDeleteCommentChange = (newComment: string) => {
    setToBeDeletedComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, newComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleLoadToggle = (newLoad: boolean) => {
    setIncreasedLoad(newLoad)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, newLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleLoadCommentChange = (newComment: string) => {
    setIncreasedLoadComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, newComment, showProtocolBadge, isTruthSource)
  }

  const handleIncorrectDataToggle = (newIncorrect: boolean) => {
    setHasIncorrectData(newIncorrect)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, newIncorrect, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleIncorrectDataCommentChange = (newComment: string) => {
    setIncorrectDataComment(newComment)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, newComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource)
  }

  const handleShowProtocolToggle = (newShow: boolean) => {
    setShowProtocolBadge(newShow)
    onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, newShow, isTruthSource)
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
        padding: '8px',
        width: '220px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <h3 style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
        Налаштування зв'язку
      </h3>
      <div style={{ marginBottom: '6px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '2px',
            fontSize: '11px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип зв'язку:
        </label>
        <select
          value={connectionType}
          onChange={(e) => handleChange(e.target.value as ConnectionType)}
          style={{
            width: '100%',
            padding: '2px 4px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#2d2d2d',
            color: 'white',
            fontSize: '11px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {availableTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Колір лінії:
        </label>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px',
              backgroundColor: '#2d2d2d',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: customColor || '#4dabf7',
                border: '1px solid rgba(255,255,255,0.2)'
              }} />
              <span style={{ fontSize: '11px', color: '#fff' }}>
                {customColor || 'За замовчуванням'}
              </span>
            </div>
            {isColorPickerOpen ? <ChevronUp size={12} color="#888" /> : <ChevronDown size={12} color="#888" />}
          </div>

          {isColorPickerOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: '#2d2d2d',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '12px',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  '', // По умолчанию
                  '#1971c2', '#339af0', '#74c0fc', // Blues
                  '#087f5b', '#20c997', '#63e6be', // Teals/Greens
                  '#2f9e44', '#51cf66', '#94d82d', // Greens/Lime
                  '#f08c00', '#fcc419', '#ffd43b', // Oranges/Yellows
                  '#e03131', '#ff6b6b', '#ff8787', // Reds
                  '#6741d9', '#845ef7', '#b197fc', // Purples
                  '#c2255e', '#f06595', '#faa2c1', // Pinks
                  '#343a40', '#868e96', '#adb5bd', // Grays
                ].map((color) => (
                  <div
                    key={color || 'default'}
                    onClick={() => {
                      handleColorChange(color);
                      setIsColorPickerOpen(false);
                    }}
                    title={color ? color : 'За замовчуванням'}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: color || '#4dabf7',
                      border: customColor === color ? '2px solid #fff' : '2px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: customColor === color ? `0 0 0 2px ${color || '#4dabf7'}` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {!color && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        width: '10px',
                        height: '2px',
                        backgroundColor: '#fff',
                      }} />
                    )}
                  </div>
                ))}

                {/* Custom Color Input Wrapper */}
                <div style={{ position: 'relative', width: '16px', height: '16px', overflow: 'hidden', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <input
                    type="color"
                    value={customColor || '#4dabf7'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{
                      position: 'absolute',
                      top: '-25%',
                      left: '-25%',
                      width: '150%',
                      height: '150%',
                      padding: '0',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип лінії:
        </label>
        <select
          value={pathType}
          onChange={(e) => handlePathTypeChange(e.target.value as EdgePathType)}
          style={{
            width: '100%',
            padding: '2px 4px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#2d2d2d',
            color: 'white',
            fontSize: '11px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="straight">Пряма</option>
          <option value="step">Прямокутна</option>
          <option value="smoothstep">Прямокутна зі скругленням</option>
        </select>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', fontWeight: '500', color: '#ccc' }}>
          Відображення та стиль:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Группа взаимоисключающих стилей */}
          <select
            value={accented ? 'accent' : (isBackground ? 'background' : 'normal')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'accent') handleAccentedToggle(true);
              else if (val === 'background') handleBackgroundToggle(true);
              else {
                setAccented(false);
                setIsBackground(false);
                onUpdate(edge.id, connectionType, dataDescription, pathType, customColor, false, false, toBeDeleted, increasedLoad, hasIncorrectData, incorrectDataComment, toBeDeletedComment, increasedLoadComment, showProtocolBadge, isTruthSource);
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#2d2d2d',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="normal">Звичайний стиль</option>
            <option value="accent">Акцент (презентація)</option>
            <option value="background">У фоні (приглушена)</option>
          </select>

          {/* Группа взаимоисключающих статусов */}
          <select
            value={toBeDeleted ? 'delete' : (increasedLoad ? 'load' : (hasIncorrectData ? 'incorrect' : 'normal'))}
            onChange={(e) => {
              const val = e.target.value;
              setToBeDeleted(val === 'delete');
              setIncreasedLoad(val === 'load');
              setHasIncorrectData(val === 'incorrect');
              onUpdate(
                edge.id, connectionType, dataDescription, pathType, customColor, accented, isBackground,
                val === 'delete', val === 'load', val === 'incorrect',
                incorrectDataComment, toBeDeletedComment, increasedLoadComment,
                showProtocolBadge, isTruthSource
              );
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#2d2d2d',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="normal">Без спец. статусу</option>
            <option value="delete">Статус: Видалити</option>
            <option value="load">Статус: Високе навантаження</option>
            <option value="incorrect">Статус: Помилка в даних</option>
          </select>
        </div>

        {/* Поля для комментариев к статусам */}
        {toBeDeleted && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={toBeDeletedComment}
              onChange={(e) => handleDeleteCommentChange(e.target.value)}
              placeholder="Причина видалення..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #dc3545',
                backgroundColor: '#1e1e1e',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
        )}
        {increasedLoad && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={increasedLoadComment}
              onChange={(e) => handleLoadCommentChange(e.target.value)}
              placeholder="Деталі навантаження..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #fab005',
                backgroundColor: '#1e1e1e',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
        )}
        {hasIncorrectData && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={incorrectDataComment}
              onChange={(e) => handleIncorrectDataCommentChange(e.target.value)}
              placeholder="Опис помилки..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #fd7e14',
                backgroundColor: '#1e1e1e',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
        )}

        {/* Компактные переключатели для независимых флагов */}
        <div style={{ marginTop: '12px' }}>
          <div
            onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '8px 0',
              borderTop: '1px solid #444',
            }}
          >
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#888', cursor: 'pointer' }}>
              Додатково:
            </label>
            {isAdditionalOpen ? <ChevronUp size={12} color="#888" /> : <ChevronDown size={12} color="#888" />}
          </div>

          {isAdditionalOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={14} color={showProtocolBadge ? '#339af0' : '#888'} />
                  <span style={{ fontSize: '11px', color: '#fff' }}>Показати протокол</span>
                </div>
                <input
                  type="checkbox"
                  checked={showProtocolBadge}
                  onChange={(e) => handleShowProtocolToggle(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={14} color={isTruthSource ? '#51cf66' : '#888'} />
                  <span style={{ fontSize: '11px', color: '#fff' }}>Джерело істини</span>
                </div>
                <input
                  type="checkbox"
                  checked={isTruthSource}
                  onChange={(e) => handleIsTruthSourceToggle(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </label>
            </div>
          )}
        </div>
      </div>



      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Опис даних (опціонально):
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
          placeholder="Наприклад: JSON дані користувача, SQL запити, кешовані дані..."
          style={{
            width: '100%',
            minHeight: '40px',
            padding: '4px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #555',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />

        <div style={{ marginTop: '2px', fontSize: '10px', color: '#888' }}>
          Вкажіть, які дані передаються або отримуються по цьому з'єднанню
        </div>
      </div>


      <button
        onClick={() => onReverse?.(edge.id)}
        style={{
          width: '100%',
          padding: '6px',
          backgroundColor: '#3d3d3d',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '8px',
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
        <ArrowLeftRight size={12} />
        Змінити напрямок
      </button>

      <button
        onClick={onDelete}
        style={{
          width: '100%',
          padding: '4px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px',
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
        Видалити зв'язок
      </button>
    </div >
  )
}

