import React, { useState, useEffect, memo } from 'react'
import { NodeProps, useReactFlow, NodeResizer, Handle, Position, useStore } from 'reactflow'
import { ComponentData } from '../types'
import { Layers, Link as LinkIcon, Link2, Sparkles, CheckCircle, AlertTriangle, Settings } from 'lucide-react'

function GroupNode({
  id,
  data,
  selected,
  onLinkClick,
  onLinkConfigClick,
}: NodeProps<ComponentData> & {
  onLinkClick?: (link: any) => void,
  onLinkConfigClick?: (nodeId: string) => void,
  onColorChange?: (nodeId: string, color: string | undefined) => void
}) {
  const { getNodes } = useReactFlow()
  const [label, setLabel] = useState(data.label || 'Группа')
  const [isEditing, setIsEditing] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.groupConfig?.childNodes || [])
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

  // Функция для обновления размера группы
  const updateGroupSize = React.useCallback(() => {
    const allNodes = getNodes()
    const groupNode = allNodes.find(n => n.id === id)
    if (!groupNode) return

    const padding = 30
    const minWidth = 300
    const minHeight = 200

    const groupX = groupNode.position.x
    const groupY = groupNode.position.y
    const currentWidth = groupNode.width || minWidth
    const currentHeight = groupNode.height || minHeight

    // Находим узлы внутри группы
    let insideNodes = allNodes.filter(node => {
      if (node.id === id) return false
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= groupX &&
        nodeCenterY >= groupY &&
        nodeCenterX <= groupX + currentWidth &&
        nodeCenterY <= groupY + currentHeight
      )
    })

    const childIds = insideNodes.map(n => n.id)
    setChildNodes(childIds)

    if (!isManuallyResized && insideNodes.length > 0) {
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

      if (groupNode.width !== newWidth || groupNode.height !== newHeight) {
        const event = new CustomEvent('groupSizeUpdate', {
          detail: {
            groupId: id,
            childNodes: childIds,
            width: newWidth,
            height: newHeight,
            position: { x: groupX, y: groupY },
          },
        })
        window.dispatchEvent(event)
      }
    }
  }, [id, getNodes, isManuallyResized])

  useEffect(() => {
    updateGroupSize()
    const interval = setInterval(updateGroupSize, 500)
    return () => clearInterval(interval)
  }, [updateGroupSize])

  useEffect(() => {
    const handleNodesChange = () => {
      updateGroupSize()
    }
    window.addEventListener('nodesChange', handleNodesChange)
    return () => window.removeEventListener('nodesChange', handleNodesChange)
  }, [updateGroupSize])

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
      setLabel(data.label || 'Группа')
    }
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label || 'Группа')
      setIsEditing(false)
    }
  }

  const groupColor = '#845ef7' // Фиолетовый цвет для групп
  const borderColor = selected ? '#4dabf7' : groupColor

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isSimple ? 'transparent' : (isHovered && !document.documentElement.classList.contains('light-theme') ? groupColor + '30' : groupColor + '20'),
        border: isSimple ? 'none' : `2px dashed ${isHovered && !document.documentElement.classList.contains('light-theme') ? borderColor : (isHovered ? '#333' : borderColor)}`,
        borderRadius: '12px',
        padding: isSimple ? '10px' : '20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: selected && !isSimple ? `0 0 20px ${borderColor}40` : (isHovered && !document.documentElement.classList.contains('light-theme') ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'),
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
          const color = borderColor;

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
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        onResizeStart={() => setIsManuallyResized(true)}
        onResize={(_event, { width, height }) => {
          window.dispatchEvent(
            new CustomEvent('nodeSizeUpdate', {
              detail: { nodeId: id, width, height },
            })
          );
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
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: data.status === 'new' ? '#40c057' : data.status === 'existing' ? '#339af0' : data.status === 'refinement' ? '#fab005' : '#888',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`Статус: ${data.status === 'new' ? 'Новый' : data.status === 'existing' ? 'Существующий' : data.status === 'refinement' ? 'Требует доработки' : 'По умолчанию'}`}
          >
            {data.status === 'new' ? <Sparkles size={12} /> : data.status === 'existing' ? <CheckCircle size={12} /> : data.status === 'refinement' ? <AlertTriangle size={12} /> : <Settings size={12} />}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Layers size={24} color={groupColor} />
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

      {!isMedium && childNodes.length > 0 && (
        <div style={{
          color: '#888',
          fontSize: '12px',
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid #555'
        }}>
          Компонентов в группе: {childNodes.length}
        </div>
      )}
    </div>
  )
}

// Мемоизируем компонент для оптимизации производительности
export default memo(GroupNode, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.groupConfig?.childNodes?.length === nextProps.data?.groupConfig?.childNodes?.length
  )
})

