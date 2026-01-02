import { Node, Edge } from 'reactflow'
import { ComponentData } from '../types'
import { BarChart3, Network, Link2 } from 'lucide-react'

interface StatisticsPanelProps {
  nodes: Node[]
  edges: Edge[]
  onClose: () => void
}

export default function StatisticsPanel({ nodes, edges, onClose }: StatisticsPanelProps) {
  // Подсчет компонентов по типам
  const componentCounts: Record<string, number> = {}
  nodes.forEach(node => {
    const data = node.data as ComponentData
    const type = data?.type || 'unknown'
    componentCounts[type] = (componentCounts[type] || 0) + 1
  })

  // Подсчет связей по типам
  const connectionCounts: Record<string, number> = {}
  edges.forEach(edge => {
    const connectionType = edge.data?.connectionType || 'unknown'
    connectionCounts[connectionType] = (connectionCounts[connectionType] || 0) + 1
  })

  // Подсчет компонентов с комментариями
  const nodesWithComments = nodes.filter(node => {
    const data = node.data as ComponentData
    return data?.comment && data.comment.trim().length > 0
  }).length

  // Подсчет компонентов со ссылками
  const nodesWithLinks = nodes.filter(node => {
    const data = node.data as ComponentData
    return data?.link
  }).length

  const totalComponents = nodes.length
  const totalConnections = edges.length

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #555',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={24} />
          Статистика диаграммы
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#444'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#888'
          }}
        >
          ×
        </button>
      </div>

      {/* Общая статистика */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={18} />
          Общая информация
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Всего компонентов</div>
            <div style={{ color: '#4dabf7', fontSize: '24px', fontWeight: 'bold' }}>{totalComponents}</div>
          </div>
          <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Всего связей</div>
            <div style={{ color: '#51cf66', fontSize: '24px', fontWeight: 'bold' }}>{totalConnections}</div>
          </div>
          <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>С комментариями</div>
            <div style={{ color: '#ffd43b', fontSize: '24px', fontWeight: 'bold' }}>{nodesWithComments}</div>
          </div>
          <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Со ссылками</div>
            <div style={{ color: '#845ef7', fontSize: '24px', fontWeight: 'bold' }}>{nodesWithLinks}</div>
          </div>
        </div>
      </div>

      {/* Компоненты по типам */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>Компоненты по типам</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {Object.entries(componentCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#fff', fontSize: '14px' }}>{type}</span>
                <span style={{ color: '#4dabf7', fontSize: '16px', fontWeight: 'bold' }}>{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Связи по типам */}
      <div>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link2 size={18} />
          Связи по типам
        </h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {Object.entries(connectionCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#fff', fontSize: '14px' }}>{type}</span>
                <span style={{ color: '#51cf66', fontSize: '16px', fontWeight: 'bold' }}>{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

