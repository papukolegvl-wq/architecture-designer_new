import React, { useState, useEffect, memo, useRef } from 'react'
import { NodeProps, useReactFlow, NodeResizer, useStore } from 'reactflow'
import { ComponentData, ComponentLink } from '../types'
import { Box, Link as LinkIcon, Link2, Palette, Sparkles, CheckCircle, AlertTriangle, Settings, ExternalLink, Network } from 'lucide-react'

interface SystemNodeProps extends NodeProps<ComponentData> {
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onColorChange?: (nodeId: string, color: string | undefined) => void
}

function SystemNode({ id, data, selected, onLinkClick, onLinkConfigClick, onColorChange }: SystemNodeProps) {
  const { getNodes, setNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Система')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.systemConfig?.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<number | null>(null)
  const zoom = useStore((s) => s.transform[2])
  const isSimple = zoom < 0.4
  const isMedium = zoom < 0.7


  // Функция для обновления размера системы
  const updateSystemSize = React.useCallback(() => {
    const allNodes = getNodes()
    const systemNode = allNodes.find(n => n.id === id)
    if (!systemNode) return

    const padding = 40 // Отступ от краев
    const minWidth = 400
    const minHeight = 300

    // Находим все узлы, которые находятся внутри текущей системы
    const systemX = systemNode.position.x
    const systemY = systemNode.position.y
    const currentWidth = systemNode.width || minWidth
    const currentHeight = systemNode.height || minHeight

    let insideNodes = allNodes.filter(node => {
      if (node.id === id) return false
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= systemX &&
        nodeCenterY >= systemY &&
        nodeCenterX <= systemX + currentWidth &&
        nodeCenterY <= systemY + currentHeight
      )
    })

    if (insideNodes.length === 0) {
      const nodeIds: string[] = []
      if (childNodes.length !== nodeIds.length) {
        setChildNodes(nodeIds)
        const event = new CustomEvent('systemSizeUpdate', {
          detail: {
            systemId: id,
            childNodes: nodeIds,
            width: minWidth,
            height: minHeight,
            position: { x: systemX, y: systemY },
          },
        })
        window.dispatchEvent(event)
      }
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    insideNodes.forEach(node => {
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const relativeX = nodeX - systemX
      const relativeY = nodeY - systemY

      minX = Math.min(minX, relativeX)
      minY = Math.min(minY, relativeY)
      maxX = Math.max(maxX, relativeX + nodeWidth)
      maxY = Math.max(maxY, relativeY + nodeHeight)
    })

    const newWidth = Math.max(minWidth, maxX - minX + padding * 2)
    const newHeight = Math.max(minHeight, maxY - minY + padding * 2)

    const nodeIds = insideNodes.map(node => node.id)

    setChildNodes(nodeIds)

    const event = new CustomEvent('systemSizeUpdate', {
      detail: {
        systemId: id,
        childNodes: nodeIds,
        width: newWidth,
        height: newHeight,
        position: { x: systemX, y: systemY },
      },
    })
    window.dispatchEvent(event)
  }, [id, getNodes, childNodes])

  // Отслеживаем изменения размера узла для определения ручного изменения
  useEffect(() => {
    const allNodes = getNodes()
    const systemNode = allNodes.find(n => n.id === id)
    if (!systemNode) return

    const checkManualResize = () => {
      const currentNodes = getNodes()
      const currentNode = currentNodes.find(n => n.id === id)
      if (!currentNode) return

      const systemNode = allNodes.find(n => n.id === id)
      if (!systemNode) return

      const widthChanged = Math.abs((currentNode.width || 400) - (systemNode.width || 400)) > 5
      const heightChanged = Math.abs((currentNode.height || 300) - (systemNode.height || 300)) > 5

      if (widthChanged || heightChanged) {
        setTimeout(() => {
          setIsManuallyResized(true)
        }, 200)
      }
    }

    const interval = setInterval(checkManualResize, 100)
    return () => clearInterval(interval)
  }, [id, getNodes])

  // Автоматически определяем узлы внутри системы и подстраиваем размер
  useEffect(() => {
    if (!isManuallyResized) {
      updateSystemSize()
    }

    const handleNodesChange = () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = window.setTimeout(() => {
        if (!isManuallyResized) {
          updateSystemSize()
        } else {
          updateSystemSize()
        }
      }, 150)
    }

    window.addEventListener('nodeschange', handleNodesChange)
    window.addEventListener('nodeadd', handleNodesChange)
    window.addEventListener('nodesremove', handleNodesChange)

    const interval = setInterval(() => {
      if (!isManuallyResized) {
        updateSystemSize()
      } else {
        updateSystemSize()
      }
    }, 500)

    return () => {
      clearInterval(interval)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      window.removeEventListener('nodeschange', handleNodesChange)
      window.removeEventListener('nodeadd', handleNodesChange)
      window.removeEventListener('nodesremove', handleNodesChange)
    }
  }, [id, updateSystemSize, isManuallyResized])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (label.trim()) {
      const event = new CustomEvent('nodeLabelUpdate', {
        detail: { nodeId: id, label: label.trim() },
      })
      window.dispatchEvent(event)
    } else {
      setLabel(data.label)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label)
      setIsEditing(false)
    }
  }

  const borderColor = data.customColor ? (selected ? data.customColor + 'AA' : data.customColor) : (selected ? '#4dabf799' : (document.documentElement.classList.contains('light-theme') ? '#444' : '#555'))
  const backgroundColor = data.customColor
    ? `${data.customColor}05` // ~1-2% opacity
    : 'rgba(77, 171, 247, 0.01)'
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: isSimple ? 'none' : `2px dashed ${isHovered && !document.documentElement.classList.contains('light-theme') ? borderColor : (isHovered ? '#333' : borderColor)}`,
        borderRadius: '8px',
        backgroundColor: isSimple ? 'transparent' : (isHovered && !document.documentElement.classList.contains('light-theme') ? backgroundColor : (isHovered ? 'rgba(0,0,0,0.03)' : backgroundColor)),
        position: 'relative',
        minWidth: isSimple ? 100 : 400,
        minHeight: isSimple ? 100 : 300,
        padding: isSimple ? '10px' : '20px',
        boxSizing: 'border-box',
        overflow: 'visible',
        cursor: selected ? 'move' : 'pointer',
        transition: 'all 0.2s',
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer
        color={borderColor}
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
        onResizeStart={() => {
          setIsManuallyResized(true)
        }}
        onResize={(_event, { width, height }) => {
          const systemNode = getNodes().find(n => n.id === id)
          if (systemNode) {
            const event = new CustomEvent('systemSizeUpdate', {
              detail: {
                systemId: id,
                childNodes: childNodes,
                width: width,
                height: height,
                position: systemNode.position,
              },
            })
            window.dispatchEvent(event)
          }
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {data.type === 'external-component' ? (
          <ExternalLink size={isSimple ? 16 : 20} color={borderColor} />
        ) : data.type === 'cluster' ? (
          <Network size={isSimple ? 16 : 20} color={borderColor} />
        ) : (
          <Box size={isSimple ? 16 : 20} color={borderColor} />
        )}
        {!isSimple && (isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: 'transparent',
              border: '1px solid #4dabf7',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--color-text-primary)',
              fontSize: isMedium ? '12px' : '14px',
              fontWeight: 600,
              outline: 'none',
              minWidth: '100px',
            }}
          />
        ) : (
          <span
            style={{
              color: borderColor,
              fontSize: isMedium ? '12px' : '14px',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {!isSimple && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          {data.link && onLinkClick && (
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
                backgroundColor: '#51cf66',
                border: '1px solid #51cf66',
                color: 'var(--color-bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#40c057'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#51cf66'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              title={data.link.label || 'Перейти по ссылке'}
            >
              <LinkIcon size={14} />
            </button>
          )}
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
                  border: `1px solid ${data.customColor || (selected ? '#4dabf7' : '#888')}`,
                  color: data.customColor || (selected ? '#4dabf7' : '#888'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = data.customColor || '#4dabf7'
                  e.currentTarget.style.color = 'var(--color-bg-primary)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                  e.currentTarget.style.color = data.customColor || (selected ? '#4dabf7' : '#888')
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title="Изменить цвет"
              >
                <Palette size={14} />
              </button>

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
                      '#000000', '#343a40', '#339af0', '#4dabf7', '#51cf66',
                      '#ffd43b', '#ff6b6b', '#845ef7', '#20c997', '#fd7e14',
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          if (onColorChange) onColorChange(id, c)
                          setShowColorPicker(false)
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: (data.customColor || '#4dabf7') === c ? '2px solid #fff' : '1px solid #444',
                          background: c,
                          cursor: 'pointer',
                          boxShadow: (data.customColor || '#4dabf7') === c ? `0 0 6px ${c}` : 'none',
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={data.customColor || '#4dabf7'}
                      onChange={(e) => {
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
                      onClick={() => {
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
          {selected && onLinkConfigClick && (
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
    </div>
  )
}

// Мемоизируем компонент для оптимизации производительности
export default memo(SystemNode, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})
