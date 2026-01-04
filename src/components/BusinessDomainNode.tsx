import React, { useState, useEffect, memo } from 'react'
import { NodeProps, useReactFlow, NodeResizer, Handle, Position, useStore } from 'reactflow'
import { ComponentData, ComponentLink } from '../types'
import { Building2, Link as LinkIcon, Link2, Info } from 'lucide-react'

interface BusinessDomainNodeProps extends NodeProps<ComponentData> {
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onInfoClick?: (componentType: string) => void
}

function BusinessDomainNode({ id, data, selected, onLinkClick, onLinkConfigClick, onInfoClick }: BusinessDomainNodeProps) {
  const { getNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Бизнес-домен')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.systemConfig?.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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
  const domainColor = data.systemConfig?.domainColor || '#ffa94d'

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
          nodeId: id,
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
          nodeId: id,
          childNodes: newChildNodes,
        },
      }))
    }
  }, [id, getNodes, childNodes, isManuallyResized])

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
      const customEvent = event as CustomEvent<{ nodeId: string; x: number; y: number; width: number; height: number }>
      if (customEvent.detail.nodeId === id) {
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
      const customEvent = event as CustomEvent<{ nodeId: string; childNodes: string[] }>
      if (customEvent.detail.nodeId === id) {
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
        border: isSimple ? 'none' : `2px dashed ${domainColor}`,
        borderRadius: '8px',
        backgroundColor: isSimple ? 'transparent' : `${domainColor}08`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: isSimple ? '4px' : '8px',
        overflow: 'visible',
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
            opacity: shouldRender ? (isHovered || isConnecting || selected ? (isCenter ? 0.8 : 0.3) : (isTargetConnected || isSourceConnected ? 0.6 : 0)) : 0,
            borderRadius: '50%',
            width: isCenter ? '12px' : '10px',
            height: isCenter ? '12px' : '10px',
            background: isCenter ? color : `${color}40`,
            border: isCenter ? `2px solid #fff` : `1px solid ${color}60`,
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter ? 30 : 25,
            boxShadow: isCenter && (isHovered || isConnecting || selected) ? `0 0 8px ${color}` : undefined,
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
        onResizeStart={() => setIsManuallyResized(true)}
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
          {/* Link buttons */}
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
                backgroundColor: '#2d2d2d',
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
                e.currentTarget.style.color = '#000'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d'
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

          {/* Info button */}
          <button
            onClick={handleInfoClick}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#2d2d2d',
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
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2d2d'
              e.currentTarget.style.color = domainColor
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Информация о компоненте"
          >
            <Info size={14} />
          </button>
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
              color: '#fff',
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


// Мемоизируем компонент для оптимизации производительности
export default memo(BusinessDomainNode, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.systemConfig?.childNodes?.length === nextProps.data?.systemConfig?.childNodes?.length
  )
})
