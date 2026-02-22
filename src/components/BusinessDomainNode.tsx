import React, { useState, useEffect, memo, useRef } from 'react'
import { NodeProps, useReactFlow, NodeResizer, Handle, Position, useStore } from 'reactflow'
import { ComponentData, ComponentLink, ComponentType } from '../types'
import { Building2, Link as LinkIcon, Link2, Info, Palette, Sparkles, CheckCircle, AlertTriangle, Settings } from 'lucide-react'

interface BusinessDomainNodeProps extends NodeProps<ComponentData> {
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onInfoClick?: (componentType: ComponentType) => void
  onColorChange?: (nodeId: string, color: string | undefined) => void
}

function BusinessDomainNode({ id, data, selected, onLinkClick, onLinkConfigClick, onInfoClick, onColorChange }: BusinessDomainNodeProps) {
  const { getNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Бизнес-домен')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.systemConfig?.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const zoom = useStore((s) => s.transform[2])
  const connectedHandleIds = useStore((s) =>
    s.edges
      .filter((e) => e.source === id || e.target === id)
      .map((e) => (e.source === id ? e.sourceHandle : e.targetHandle))
  );
  const isConnecting = useStore((s) => !!s.connectionStartHandle);
  const isSimple = zoom < 0.4
  const isMedium = zoom < 0.7

  // Получаем цвет домена из конфигурации или используем цвет по умолчанию
  const domainColor = data.customColor || data.systemConfig?.domainColor || '#ffa94d'

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onInfoClick) {
      onInfoClick(data.type)
    }
  }

  // Функция для обновления размера домена
  const updateDomainSize = React.useCallback(() => {
    const allNodes = getNodes()
    const domainNode = allNodes.find(n => n.id === id)
    if (!domainNode) return

    const padding = 40
    const minWidth = 400
    const minHeight = 300

    const domainX = domainNode.position.x
    const domainY = domainNode.position.y
    const currentWidth = domainNode.width || minWidth
    const currentHeight = domainNode.height || minHeight

    // Сначала проверяем сохраненные дочерние узлы
    let insideNodes = allNodes.filter(node => {
      if (node.id === id || node.type === 'system' || (node.type === 'business-domain' && node.id !== id) || node.type === 'external-system') return false
      if (childNodes.includes(node.id)) return true

      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= domainX &&
        nodeCenterY >= domainY &&
        nodeCenterX <= domainX + currentWidth &&
        nodeCenterY <= domainY + currentHeight
      )
    })

    if (insideNodes.length === 0) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    insideNodes.forEach(node => {
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      minX = Math.min(minX, nodeX)
      minY = Math.min(minY, nodeY)
      maxX = Math.max(maxX, nodeX + nodeWidth)
      maxY = Math.max(maxY, nodeY + nodeHeight)
    })

    const newWidth = Math.max(minWidth, maxX - minX + padding * 2)
    const newHeight = Math.max(minHeight, maxY - minY + padding * 2)
    const newX = minX - padding
    const newY = minY - padding

    if (!isManuallyResized) {
      window.dispatchEvent(new CustomEvent('systemSizeUpdate', {
        detail: {
          systemId: id,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      }))
    }

    // Обновляем список дочерних узлов
    const newChildNodes = insideNodes.map(n => n.id)
    if (JSON.stringify(newChildNodes.sort()) !== JSON.stringify(childNodes.sort())) {
      setChildNodes(newChildNodes)
      window.dispatchEvent(new CustomEvent('systemNodesUpdate', {
        detail: {
          systemId: id,
          childNodes: newChildNodes,
        },
      }))
    }
  }, [id, getNodes, childNodes, isManuallyResized])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  useEffect(() => {
    const timer = setTimeout(updateDomainSize, 100)
    return () => clearTimeout(timer)
  }, [updateDomainSize])

  useEffect(() => {
    const handleNodesChange = () => {
      if (!isManuallyResized) {
        updateDomainSize()
      }
    }

    window.addEventListener('nodeschange', handleNodesChange)
    window.addEventListener('nodesremove', handleNodesChange)
    window.addEventListener('nodeadd', handleNodesChange)

    return () => {
      window.removeEventListener('nodeschange', handleNodesChange)
      window.removeEventListener('nodesremove', handleNodesChange)
      window.removeEventListener('nodeadd', handleNodesChange)
    }
  }, [updateDomainSize, isManuallyResized])

  useEffect(() => {
    const handleSystemSizeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ systemId: string; x: number; y: number; width: number; height: number }>
      if (customEvent.detail.systemId === id) {
        setIsManuallyResized(false)
      }
    }

    window.addEventListener('systemSizeUpdate', handleSystemSizeUpdate as EventListener)
    return () => {
      window.removeEventListener('systemSizeUpdate', handleSystemSizeUpdate as EventListener)
    }
  }, [id])

  useEffect(() => {
    const handleSystemNodesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ systemId: string; childNodes: string[] }>
      if (customEvent.detail.systemId === id) {
        setChildNodes(customEvent.detail.childNodes)
      }
    }

    window.addEventListener('systemNodesUpdate', handleSystemNodesUpdate as EventListener)
    return () => {
      window.removeEventListener('systemNodesUpdate', handleSystemNodesUpdate as EventListener)
    }
  }, [id])

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel)
    window.dispatchEvent(new CustomEvent('nodeLabelUpdate', {
      detail: { nodeId: id, label: newLabel },
    }))
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        border: isSimple ? 'none' : `1.5px dashed ${isHovered && !document.documentElement.classList.contains('light-theme') ? domainColor + 'AA' : (isHovered ? '#444' : domainColor)}`,
        borderRadius: '8px',
        backgroundColor: isSimple ? 'transparent' : (isHovered && !document.documentElement.classList.contains('light-theme') ? `${domainColor}05` : `${domainColor}01`),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: isSimple ? '4px' : '8px',
        overflow: 'visible',
        cursor: selected ? 'move' : 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Генерируем точки подключения по всему периметру */}
      {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
          const isHorizontal = pos === Position.Top || pos === Position.Bottom;
          const isCenter = p === 50;
          const color = domainColor;

          const targetId = `${pos}-target-${p}`;
          const sourceId = `${pos}-source-${p}`;

          const isTargetConnected = connectedHandleIds.includes(targetId);
          const isSourceConnected = connectedHandleIds.includes(sourceId);
          const shouldRender = isHovered || isTargetConnected || isSourceConnected || isConnecting || isCenter || selected;

          const style: React.CSSProperties = {
            [isHorizontal ? 'left' : 'top']: `${p}%`,
            [pos]: '-5px',
            opacity: shouldRender ? 1 : 0,
            borderRadius: '50%',
            width: isCenter ? '10px' : '6px',
            height: isCenter ? '10px' : '6px',
            background: '#1e1e1e',
            border: 'none',
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter ? 30 : 25,
            pointerEvents: shouldRender ? 'all' : 'none',
          };

          return (
            <React.Fragment key={`${pos}-${p}`}>
              <Handle
                type="target"
                position={pos}
                id={targetId}
                style={style}
              />
              <Handle
                type="source"
                position={pos}
                id={sourceId}
                style={style}
              />
            </React.Fragment>
          );
        })
      )}
      <NodeResizer
        color={domainColor}
        isVisible={selected}
        minWidth={400}
        minHeight={300}
        handleStyle={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#333',
          border: 'none',
          boxShadow: 'none',
        }}
        lineStyle={{
          borderWidth: '1px',
          borderColor: '#444',
          borderStyle: 'dashed',
        }}
        onResizeStart={() => setIsManuallyResized(true)}
        onResize={(_event, { width, height }) => {
          window.dispatchEvent(
            new CustomEvent('nodeSizeUpdate', {
              detail: { nodeId: id, width, height },
            })
          );
        }}
      />
      {/* Кнопки управления - справа вверху */}
      {!isSimple && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Link buttons - only visible when selected */}
          {selected && (
            <>
              {data.link && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (onLinkClick && data.link) {
                      onLinkClick(data.link)
                    }
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `1px solid #51cf66`,
                    color: '#51cf66',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: 0,
                    pointerEvents: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#51cf66'
                    e.currentTarget.style.color = 'var(--color-bg-primary)'
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                    e.currentTarget.style.color = '#51cf66'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title={data.link.label || 'Перейти по ссылке'}
                >
                  <LinkIcon size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (onLinkConfigClick) {
                    onLinkConfigClick(id)
                  }
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1px solid ${data.link ? '#51cf66' : '#888'}`,
                  color: data.link ? '#51cf66' : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = data.link ? '#51cf66' : 'var(--color-bg-secondary)'
                  e.currentTarget.style.color = data.link ? 'var(--color-bg-primary)' : 'var(--color-text-primary)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                  e.currentTarget.style.color = data.link ? '#51cf66' : '#888'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
              >
                <Link2 size={14} />
              </button>
            </>
          )}

          {/* Color picker button */}
          {selected && (
            <div style={{ position: 'relative' }} ref={colorPickerRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1px solid ${domainColor}60`,
                  color: domainColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = domainColor
                  e.currentTarget.style.color = 'var(--color-bg-primary)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                  e.currentTarget.style.color = domainColor
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title="Изменить цвет"
              >
                <Palette size={14} />
              </button>

              {/* Color picker dropdown */}
              {showColorPicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '4px',
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '8px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minWidth: '180px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>
                    Выберите цвет:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[
                      '#000000', '#343a40', '#ffa94d', '#ff922b', '#fd7e14',
                      '#339af0', '#4dabf7', '#51cf66', '#20c997', // Blues & Greens
                      '#ff6b6b', '#845ef7', '#fcc419', '#96f2d7', // Accents
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('[BusinessDomainNode] Dispatching color update:', id, c)
                          window.dispatchEvent(new CustomEvent('nodeColorUpdate', { bubbles: true, detail: { nodeId: id, color: c } }))
                          if (onColorChange) onColorChange(id, c)
                          setShowColorPicker(false)
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: domainColor === c ? '2px solid #fff' : '1px solid #444',
                          background: c,
                          cursor: 'pointer',
                          boxShadow: domainColor === c ? `0 0 6px ${c}` : 'none',
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={domainColor}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        window.dispatchEvent(new CustomEvent('nodeColorUpdate', { detail: { nodeId: id, color: e.target.value } }))
                        if (onColorChange) onColorChange(id, e.target.value)
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                      title="Выбрать произвольный цвет"
                    />
                    <span style={{ fontSize: '10px', color: '#888' }}>Другой цвет</span>
                  </div>
                  {data.customColor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.dispatchEvent(new CustomEvent('nodeColorUpdate', { detail: { nodeId: id, color: undefined } }))
                        if (onColorChange) onColorChange(id, undefined)
                        setShowColorPicker(false)
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        color: '#888',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      Сбросить цвет
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info button - only visible when selected */}
          {selected && (
            <button
              onClick={handleInfoClick}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-secondary)',
                border: `1px solid ${domainColor}60`,
                color: domainColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = domainColor
                e.currentTarget.style.color = 'var(--color-bg-primary)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                e.currentTarget.style.color = domainColor
                e.currentTarget.style.transform = 'scale(1)'
              }}
              title="Информация о компоненте"
            >
              <Info size={14} />
            </button>
          )}

          {(selected || data.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                const nextStatus = !data.status ? 'new' : data.status === 'new' ? 'existing' : data.status === 'existing' ? 'refinement' : undefined
                const event = new CustomEvent('componentStatusChange', {
                  detail: { nodeId: id, status: nextStatus },
                })
                window.dispatchEvent(event)
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-secondary)',
                border: `1px solid ${data.status === 'new' ? '#40c057' : data.status === 'existing' ? '#339af0' : data.status === 'refinement' ? '#fab005' : '#888'}`,
                color: data.status === 'new' ? '#40c057' : data.status === 'existing' ? '#339af0' : data.status === 'refinement' ? '#fab005' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
                pointerEvents: 'auto',
              }}
              title={`Статус: ${data.status === 'new' ? 'Новый' : data.status === 'existing' ? 'Существующий' : data.status === 'refinement' ? 'Требует доработки' : 'По умолчанию'}`}
            >
              {data.status === 'new' ? <Sparkles size={14} /> : data.status === 'existing' ? <CheckCircle size={14} /> : data.status === 'refinement' ? <AlertTriangle size={14} /> : <Settings size={14} />}
            </button>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          padding: '4px 8px',
          backgroundColor: `${domainColor}1A`,
          borderRadius: '4px',
        }}
      >
        <Building2 size={16} color={domainColor} />
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              setIsEditing(false)
              handleLabelChange(label)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(false)
                handleLabelChange(label)
              }
              if (e.key === 'Escape') {
                setIsEditing(false)
                setLabel(data.label || 'Бизнес-домен')
              }
            }}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: `1px solid ${domainColor}`,
              borderRadius: '4px',
              padding: '2px 6px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            style={{
              flex: 1,
              color: domainColor,
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'text',
            }}
          >
            {label}
          </span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Дочерние узлы будут отображаться здесь через ReactFlow */}
      </div>
    </div>
  )
}


// Экспортируем компонент без мемоизации для гарантированного обновления
export default BusinessDomainNode
