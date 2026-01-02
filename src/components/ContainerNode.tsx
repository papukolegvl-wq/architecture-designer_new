import React, { useState, useEffect, memo } from 'react'
import { NodeProps, useReactFlow, NodeResizer, Handle, Position, useStore } from 'reactflow'
import { ComponentData } from '../types'
import { Package, Link as LinkIcon, Link2 } from 'lucide-react'

function ContainerNode({
  id,
  data,
  selected,
  onLinkClick,
  onLinkConfigClick
}: NodeProps<ComponentData> & {
  onLinkClick?: (link: any) => void,
  onLinkConfigClick?: (nodeId: string) => void
}) {
  const { getNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Контейнер')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.containerConfig?.childNodes || [])
  // Инициализируем isManuallyResized из данных, если они есть
  const [isManuallyResized, setIsManuallyResized] = useState(false)

  // Эффект для инициализации и обновления из пропсов
  useEffect(() => {
    if (data.containerConfig?.isManuallyResized !== undefined) {
      setIsManuallyResized(data.containerConfig.isManuallyResized)
    }
  }, [data.containerConfig?.isManuallyResized])
  const [isHovered, setIsHovered] = useState(false)
  const zoom = useStore((s) => s.transform[2])
  const connectedHandleIds = useStore((s) =>
    s.edges
      .filter((e) => e.source === id || e.target === id)
      .map((e) => (e.source === id ? e.sourceHandle : e.targetHandle))
  )
  const isConnecting = useStore((s) => !!s.connectionStartHandle);
  const isSimple = zoom < 0.4
  const isMedium = zoom < 0.7

  // Функция для обновления размера контейнера
  const updateContainerSize = React.useCallback(() => {
    const allNodes = getNodes()
    const containerNode = allNodes.find(n => n.id === id)
    if (!containerNode) return

    const padding = 30 // Отступ от краев
    const minWidth = 300
    const minHeight = 200

    const containerX = containerNode.position.x
    const containerY = containerNode.position.y
    const currentWidth = containerNode.width || minWidth
    const currentHeight = containerNode.height || minHeight

    // Находим узлы внутри контейнера (обычно серверы)
    let insideNodes = allNodes.filter(node => {
      if (node.id === id || node.type === 'container' || node.type === 'system') return false
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= containerX &&
        nodeCenterY >= containerY &&
        nodeCenterX <= containerX + currentWidth &&
        nodeCenterY <= containerY + currentHeight
      )
    })

    // Обновляем список дочерних узлов
    const childIds = insideNodes.map(n => n.id)

    // Проверяем, изменился ли состав дочерних узлов
    const childrenChanged = JSON.stringify(childIds.sort()) !== JSON.stringify(childNodes.sort())

    if (childrenChanged) {
      setChildNodes(childIds)
    }

    // Если есть изменения в детях или размерах (и не ручной режим), отправляем обновление
    // Важно: всегда отправляем обновление если состав детей изменился, чтобы обновить их groupId
    if (childrenChanged || (!isManuallyResized && insideNodes.length > 0)) {
      // Вычисляем границы всех дочерних узлов
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

      // Вычисляем новый размер контейнера (только если не ручной режим)
      let newWidth = containerNode.width || minWidth
      let newHeight = containerNode.height || minHeight

      if (!isManuallyResized && insideNodes.length > 0) {
        newWidth = Math.max(minWidth, maxX - minX + padding * 2)
        newHeight = Math.max(minHeight, maxY - minY + padding * 2)
      }

      // Обновляем если размеры изменились или изменился состав детей
      if (containerNode.width !== newWidth || containerNode.height !== newHeight || childrenChanged) {
        const event = new CustomEvent('containerSizeUpdate', {
          detail: {
            containerId: id,
            childNodes: childIds,
            width: newWidth,
            height: newHeight,
            position: { x: containerX, y: containerY },
          },
        })
        window.dispatchEvent(event)
      }
    }
  }, [id, getNodes, isManuallyResized, childNodes])

  useEffect(() => {
    updateContainerSize()
    const interval = setInterval(updateContainerSize, 500)
    return () => clearInterval(interval)
  }, [updateContainerSize])

  // Слушаем изменения узлов
  useEffect(() => {
    const handleNodesChange = () => {
      updateContainerSize()
    }
    window.addEventListener('nodesChange', handleNodesChange)
    return () => window.removeEventListener('nodesChange', handleNodesChange)
  }, [updateContainerSize])

  const handleLabelDoubleClick = () => {
    setIsEditing(true)
  }

  const handleLabelBlur = () => {
    setIsEditing(false)
    if (label.trim()) {
      const event = new CustomEvent('nodeLabelUpdate', {
        detail: { nodeId: id, label: label.trim() }
      })
      window.dispatchEvent(event)
    } else {
      setLabel(data.label || 'Контейнер')
    }
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label || 'Контейнер')
      setIsEditing(false)
    }
  }

  const containerColor = '#51cf66' // Зеленый цвет для контейнеров
  const borderColor = selected ? '#4dabf7' : containerColor

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isSimple ? 'transparent' : containerColor + '15',
        border: isSimple ? 'none' : `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: isSimple ? '10px' : '20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: selected && !isSimple ? `0 0 20px ${borderColor}40` : 'none',
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
          const color = borderColor;

          const targetId = `${pos}-target-${p}`;
          const sourceId = `${pos}-source-${p}`;

          const isTargetConnected = connectedHandleIds.includes(targetId);
          const isSourceConnected = connectedHandleIds.includes(sourceId);
          const shouldRender = isHovered || isTargetConnected || isSourceConnected || isConnecting;

          if (!shouldRender) return null;

          const style: React.CSSProperties = {
            [isHorizontal ? 'left' : 'top']: `${p}%`,
            [pos]: '-5px',
            opacity: isHovered || isConnecting ? (isCenter ? 0.8 : 0.3) : (isTargetConnected || isSourceConnected ? 0.6 : 0),
            borderRadius: '50%',
            width: isCenter ? '12px' : '10px',
            height: isCenter ? '12px' : '10px',
            background: isCenter ? color : `${color}40`,
            border: isCenter ? `2px solid #fff` : `1px solid ${color}60`,
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter ? 30 : 25,
            boxShadow: (isCenter && isHovered) || (isCenter && isConnecting) ? `0 0 8px ${color}` : undefined,
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
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        onResizeStart={() => {
          setIsManuallyResized(true)
          // Persist the manual resize state
          const event = new CustomEvent('containerManualResize', {
            detail: { containerId: id, isManuallyResized: true }
          })
          window.dispatchEvent(event)
        }}
      />

      {!isSimple && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 100,
          }}
        >
          {data.link && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onLinkClick) onLinkClick(data.link)
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '4px',
                color: '#51cf66',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Перейти по ссылке"
            >
              <LinkIcon size={12} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onLinkConfigClick) onLinkConfigClick(id)
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: data.link ? '#51cf66' : '#888',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
          >
            <Link2 size={12} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Package size={24} color={containerColor} />
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: '#1e1e1e',
              border: '1px solid #4dabf7',
              borderRadius: '4px',
              padding: '4px 8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          />
        ) : (
          <h3
            onDoubleClick={handleLabelDoubleClick}
            style={{
              margin: 0,
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'text',
              flex: 1,
            }}
          >
            {label}
          </h3>
        )}
      </div>

      {!isMedium && data.containerConfig?.image && (
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
          Образ: {data.containerConfig.image}
        </div>
      )}

      {!isMedium && childNodes.length > 0 && (
        <div style={{
          color: '#888',
          fontSize: '12px',
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid #555'
        }}>
          Компонентов внутри: {childNodes.length}
        </div>
      )}
    </div>
  )
}

// Мемоизируем компонент для оптимизации производительности
export default memo(ContainerNode, (prevProps: any, nextProps: any) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.containerConfig?.childNodes?.length === nextProps.data?.containerConfig?.childNodes?.length &&
    prevProps.data?.containerConfig?.isManuallyResized === nextProps.data?.containerConfig?.isManuallyResized &&
    // Важно: проверяем размеры, так как NodeResizer зависит от них
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  )
})

