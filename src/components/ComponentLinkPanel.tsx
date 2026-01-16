import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ComponentLink } from '../types'
import { X, Link as LinkIcon } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  nodes: Node[]
  edges: any[]
}

interface ComponentLinkPanelProps {
  node: Node
  workspaces: Workspace[]
  activeWorkspaceId: string
  onUpdate: (nodeId: string, link: ComponentLink | null) => void
  onClose: () => void
}

export default function ComponentLinkPanel({
  node,
  workspaces,
  activeWorkspaceId,
  onUpdate,
  onClose,
}: ComponentLinkPanelProps) {
  const data = node.data as ComponentData
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>(
    data.link?.targetWorkspaceId || activeWorkspaceId
  )
  const [targetNodeId, setTargetNodeId] = useState<string>(
    data.link?.targetNodeId || ''
  )
  const [linkLabel, setLinkLabel] = useState<string>(
    data.link?.label || ''
  )

  const targetWorkspace = workspaces.find(w => w.id === targetWorkspaceId)
  
  // Получаем все узлы из выбранной вкладки
  const allNodesInWorkspace = targetWorkspace?.nodes || []
  
  // Фильтруем узлы: исключаем только текущий узел, если он на той же вкладке
  // Все остальные компоненты доступны для ссылок (включая system, business-domain и все остальные типы)
  const availableNodes = allNodesInWorkspace.filter((targetNode) => {
    // Исключаем текущий узел только если он на той же вкладке
    if (targetNode.id === node.id && targetWorkspaceId === activeWorkspaceId) {
      return false
    }
    // Включаем все остальные узлы - проверяем что у узла есть data
    // SystemNode (type: 'system') и другие специальные типы узлов также доступны для ссылок
    // Проверяем как data, так и type узла, чтобы включить SystemNode
    const hasData = targetNode.data !== undefined && targetNode.data !== null
    const isSystemNode = targetNode.type === 'system' || (targetNode.data as ComponentData)?.type === 'system'
    const isBusinessDomain = targetNode.type === 'business-domain' || (targetNode.data as ComponentData)?.type === 'business-domain'
    const isContainer = targetNode.type === 'container' || (targetNode.data as ComponentData)?.type === 'container'
    const isGroup = targetNode.type === 'group' || (targetNode.data as ComponentData)?.type === 'group'
    
    // Включаем узел если у него есть data ИЛИ это специальный тип узла (system, business-domain, container, group)
    return hasData || isSystemNode || isBusinessDomain || isContainer || isGroup
  })
  
  // Логируем для отладки (только если есть SystemNode в списке)
  if (availableNodes.some(n => (n.data as ComponentData)?.type === 'system' || n.type === 'system')) {
    console.log('ComponentLinkPanel - Available nodes (including System):', {
      totalNodes: allNodesInWorkspace.length,
      availableNodes: availableNodes.length,
      currentNodeId: node.id,
      currentNodeType: (node.data as ComponentData)?.type || node.type,
      systemNodes: availableNodes.filter(n => (n.data as ComponentData)?.type === 'system' || n.type === 'system').map(n => ({
        id: n.id,
        label: (n.data as ComponentData)?.label,
      })),
    })
  }
  
  // Обновляем targetNodeId при изменении targetWorkspaceId, если текущий выбранный узел не существует в новой вкладке
  useEffect(() => {
    const targetWorkspace = workspaces.find(w => w.id === targetWorkspaceId)
    const allNodesInWorkspace = targetWorkspace?.nodes || []
    const availableNodes = allNodesInWorkspace.filter((targetNode) => {
      if (targetNode.id === node.id && targetWorkspaceId === activeWorkspaceId) {
        return false
      }
      // Включаем узел если у него есть data ИЛИ это специальный тип узла
      const hasData = targetNode.data !== undefined && targetNode.data !== null
      const isSystemNode = targetNode.type === 'system' || (targetNode.data as ComponentData)?.type === 'system'
      const isBusinessDomain = targetNode.type === 'business-domain' || (targetNode.data as ComponentData)?.type === 'business-domain'
      const isContainer = targetNode.type === 'container' || (targetNode.data as ComponentData)?.type === 'container'
      const isGroup = targetNode.type === 'group' || (targetNode.data as ComponentData)?.type === 'group'
      return hasData || isSystemNode || isBusinessDomain || isContainer || isGroup
    })
    
    if (targetNodeId && !availableNodes.find(n => n.id === targetNodeId)) {
      setTargetNodeId('')
    }
  }, [targetWorkspaceId, targetNodeId, workspaces, node.id, activeWorkspaceId])
  
  // Отладочная информация
  useEffect(() => {
    console.log('ComponentLinkPanel - Workspace info:', {
      targetWorkspaceId,
      activeWorkspaceId,
      currentNodeId: node.id,
      workspacesCount: workspaces.length,
      targetWorkspaceExists: !!targetWorkspace,
      allNodesInWorkspace: targetWorkspace?.nodes?.length || 0,
      availableNodesCount: availableNodes.length,
      availableNodeIds: availableNodes.map(n => n.id),
    })
  }, [targetWorkspaceId, targetWorkspace, availableNodes, node.id, activeWorkspaceId, workspaces.length])

  const handleSave = () => {
    if (targetNodeId) {
      const link: ComponentLink = {
        targetWorkspaceId,
        targetNodeId,
        ...(linkLabel.trim() && { label: linkLabel.trim() }),
      }
      onUpdate(node.id, link)
    } else {
      onUpdate(node.id, null)
    }
    onClose()
  }

  const handleRemove = () => {
    onUpdate(node.id, null)
    onClose()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #4dabf7',
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
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LinkIcon size={20} />
          Ссылка на компонент: {data.label}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            Вкладка назначения
          </label>
          <select
            value={targetWorkspaceId}
            onChange={(e) => {
              setTargetWorkspaceId(e.target.value)
              setTargetNodeId('') // Сбрасываем выбор узла при смене вкладки
            }}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
            }}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            Компонент назначения
          </label>
          {!targetWorkspace ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#888',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              Вкладка не найдена
            </div>
          ) : availableNodes.length === 0 ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#888',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {targetWorkspaceId === activeWorkspaceId && node.id 
                ? 'На этой вкладке нет других компонентов для ссылки' 
                : 'На выбранной вкладке нет компонентов'}
            </div>
          ) : (
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <option value="">-- Выберите компонент --</option>
              {availableNodes.map((targetNode) => {
                const targetData = targetNode.data as ComponentData
                const nodeLabel = targetData?.label || targetNode.id
                const nodeType = targetData?.type || targetNode.type || 'unknown'
                // Улучшаем отображение типов для специальных узлов
                const typeLabel = nodeType === 'system' ? 'Система' :
                                 nodeType === 'business-domain' ? 'Бизнес-домен' :
                                 nodeType === 'container' ? 'Контейнер' :
                                 nodeType === 'group' ? 'Группа' :
                                 nodeType
                return (
                  <option key={targetNode.id} value={targetNode.id}>
                    {nodeLabel} ({typeLabel})
                  </option>
                )
              })}
            </select>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            Подпись ссылки (необязательно)
          </label>
          <input
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="например: Детализация"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>

        {data.link && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #555',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#888',
            }}
          >
            <div style={{ color: '#fff', marginBottom: '4px' }}>Текущая ссылка:</div>
            <div>
              Вкладка: {workspaces.find(w => w.id === data.link?.targetWorkspaceId)?.name || 'Неизвестно'}
            </div>
            <div>
              Компонент: {
                workspaces
                  .find(w => w.id === data.link?.targetWorkspaceId)
                  ?.nodes.find(n => n.id === data.link?.targetNodeId)
                  ?.data.label || 'Неизвестно'
              }
            </div>
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
        {data.link && (
          <button
            onClick={handleRemove}
            style={{
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Удалить ссылку
          </button>
        )}
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
          disabled={!targetNodeId}
          style={{
            backgroundColor: targetNodeId ? '#4dabf7' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: targetNodeId ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            opacity: targetNodeId ? 1 : 0.5,
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}

