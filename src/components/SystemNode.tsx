import React, { useState, useEffect, memo, useRef } from 'react'
import { NodeProps, useReactFlow, NodeResizer, useStore } from 'reactflow'
import { ComponentData, ComponentLink } from '../types'
import { Box, Link as LinkIcon, Link2 } from 'lucide-react'

interface SystemNodeProps extends NodeProps<ComponentData> {
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
}

function SystemNode({ id, data, selected, onLinkClick, onLinkConfigClick }: SystemNodeProps) {
  const { getNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Система')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.systemConfig?.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(false)
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
    // Используем более гибкую логику: проверяем пересечение с текущей областью системы
    const systemX = systemNode.position.x
    const systemY = systemNode.position.y
    const currentWidth = systemNode.width || minWidth
    const currentHeight = systemNode.height || minHeight

    // Сначала находим узлы, которые уже точно внутри текущей системы
    // Система может содержать контейнеры, серверы и другие компоненты
    let insideNodes = allNodes.filter(node => {
      if (node.id === id || node.type === 'system' || node.type === 'business-domain') return false
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      // Проверяем, находится ли узел внутри системы
      // Узел считается внутри, если его центр находится в системе
      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= systemX &&
        nodeCenterY >= systemY &&
        nodeCenterX <= systemX + currentWidth &&
        nodeCenterY <= systemY + currentHeight
      )
    })

    // Убрана логика автоматического "прилипания" узлов рядом с системой
    // Теперь система содержит только узлы, которые действительно находятся внутри неё

    if (insideNodes.length === 0) {
      // Если нет узлов внутри, используем минимальный размер
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

    // Вычисляем границы всех узлов внутри системы
    // Вычисляем относительно текущей позиции системы, а не абсолютные координаты
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    insideNodes.forEach(node => {
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      // Вычисляем координаты узла относительно позиции системы
      const relativeX = nodeX - systemX
      const relativeY = nodeY - systemY

      minX = Math.min(minX, relativeX)
      minY = Math.min(minY, relativeY)
      maxX = Math.max(maxX, relativeX + nodeWidth)
      maxY = Math.max(maxY, relativeY + nodeHeight)
    })

    // Вычисляем новый размер системы с отступами
    // Размер вычисляем на основе относительных координат узлов
    // Если узлы выходят за границы системы, увеличиваем размер
    const newWidth = Math.max(minWidth, maxX - minX + padding * 2)
    const newHeight = Math.max(minHeight, maxY - minY + padding * 2)

    // НЕ изменяем позицию системы - она остается на месте
    // Позиция системы фиксирована и не меняется при перемещении компонентов внутри

    const nodeIds = insideNodes.map(node => node.id)

    // Обновляем всегда, чтобы система реагировала на изменения
    setChildNodes(nodeIds)

    // Отправляем событие для обновления только размера системы (без изменения позиции)
    const event = new CustomEvent('systemSizeUpdate', {
      detail: {
        systemId: id,
        childNodes: nodeIds,
        width: newWidth,
        height: newHeight,
        position: { x: systemX, y: systemY }, // Сохраняем текущую позицию, не меняем её
      },
    })
    window.dispatchEvent(event)
  }, [id, getNodes, childNodes])

  // Отслеживаем изменения размера узла для определения ручного изменения
  useEffect(() => {
    const allNodes = getNodes()
    const systemNode = allNodes.find(n => n.id === id)
    if (!systemNode) return

    // Если размер узла изменился, но это не было вызвано нашим обновлением,
    // значит пользователь изменил размер вручную
    const checkManualResize = () => {
      const currentNodes = getNodes()
      const currentNode = currentNodes.find(n => n.id === id)
      if (!currentNode) return

      const systemNode = allNodes.find(n => n.id === id)
      if (!systemNode) return

      // Проверяем, изменился ли размер
      const widthChanged = Math.abs((currentNode.width || 400) - (systemNode.width || 400)) > 5
      const heightChanged = Math.abs((currentNode.height || 300) - (systemNode.height || 300)) > 5

      if (widthChanged || heightChanged) {
        // Небольшая задержка, чтобы убедиться, что это не наше автоматическое обновление
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
    // Обновляем сразу при монтировании
    if (!isManuallyResized) {
      updateSystemSize()
    }

    // Обновляем при изменениях узлов с дебаунсингом
    const handleNodesChange = () => {
      // Очищаем предыдущий таймаут
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Устанавливаем новый таймаут с задержкой
      debounceTimeoutRef.current = window.setTimeout(() => {
        if (!isManuallyResized) {
          updateSystemSize()
        } else {
          // Даже при ручном размере обновляем список узлов
          updateSystemSize()
        }
      }, 150) // Увеличено с 50ms до 150ms для дебаунсинга
    }

    // Слушаем события изменения узлов
    window.addEventListener('nodeschange', handleNodesChange)
    window.addEventListener('nodeadd', handleNodesChange)
    window.addEventListener('nodesremove', handleNodesChange) // При удалении узлов

    // Также периодически проверяем (на случай, если события не сработали)
    // Увеличиваем интервал для лучшей производительности при большом количестве компонентов
    const interval = setInterval(() => {
      if (!isManuallyResized) {
        updateSystemSize()
      } else {
        // Обновляем только список узлов, не размер
        updateSystemSize()
      }
    }, 500) // Увеличено с 100ms до 500ms для лучшей производительности

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


  const borderColor = selected ? '#4dabf7' : '#666'
  const backgroundColor = 'rgba(77, 171, 247, 0.05)'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: isSimple ? 'none' : `2px dashed ${borderColor}`,
        borderRadius: '8px',
        backgroundColor: isSimple ? 'transparent' : backgroundColor,
        position: 'relative',
        minWidth: isSimple ? 100 : 400,
        minHeight: isSimple ? 100 : 300,
        padding: isSimple ? '10px' : '20px',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Resize handles для изменения размера системы */}
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={400}
        minHeight={300}
        handleStyle={{
          width: '14px',
          height: '14px',
          border: `2px solid ${borderColor}`,
          borderRadius: '50%',
          background: '#4dabf7',
          opacity: 0.8,
        }}
        lineStyle={{
          borderWidth: '2px',
          borderColor: borderColor,
          borderStyle: 'dashed',
        }}
        onResizeStart={() => {
          // При начале изменения размера помечаем, что размер изменяется вручную
          setIsManuallyResized(true)
        }}
        onResize={(width, height) => {
          // При изменении размера обновляем размер системы
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

      {/* Иконка системы */}
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
        <Box size={isSimple ? 16 : 20} color={borderColor} />
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
              color: '#f8f9fa',
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

      {/* Кнопки для работы со ссылками */}
      {!isSimple && onLinkConfigClick && (
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
          {/* Кнопка перехода по ссылке (если ссылка установлена) */}
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
                color: '#000',
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
          {/* Кнопка настройки ссылки */}
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
              backgroundColor: '#2d2d2d',
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
              e.currentTarget.style.backgroundColor = data.link ? '#51cf66' : '#444'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2d2d'
              e.currentTarget.style.color = data.link ? '#51cf66' : '#888'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
          >
            <Link2 size={14} />
          </button>
        </div>
      )}

      {/* Индикатор количества компонентов */}
      {!isMedium && childNodes.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: onLinkConfigClick ? '50px' : '10px',
            background: 'rgba(77, 171, 247, 0.2)',
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '12px',
            color: '#4dabf7',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        >
          {childNodes.length} компонент{childNodes.length !== 1 ? 'ов' : ''}
        </div>
      )}
    </div>
  )
}

// Мемоизируем компонент для оптимизации производительности
export default memo(SystemNode, (prevProps, nextProps) => {
  // Перерисовываем только если изменились важные свойства
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.systemConfig?.childNodes?.length === nextProps.data?.systemConfig?.childNodes?.length
  )
})

