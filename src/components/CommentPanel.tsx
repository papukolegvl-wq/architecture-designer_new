import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData } from '../types'
import { MessageSquare } from 'lucide-react'

interface CommentPanelProps {
  node: Node
  onUpdate: (nodeId: string, comment: string) => void
  onClose: () => void
}

export default function CommentPanel({ node, onUpdate, onClose }: CommentPanelProps) {
  const data = node.data as ComponentData
  const [comment, setComment] = useState(data?.comment || '')

  const handleSave = () => {
    onUpdate(node.id, comment.trim())
    onClose()
  }

  const handleDelete = () => {
    onUpdate(node.id, '')
    onClose()
  }

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
        width: '500px',
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={24} />
          Комментарий к компоненту
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

      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>
          Компонент: <span style={{ color: '#fff' }}>{data?.label || node.id}</span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите комментарий или аннотацию к компоненту..."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '12px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4dabf7'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#555'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {data?.comment && (
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
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
            Удалить
          </button>
        )}
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4dabf7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#339af0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4dabf7'
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}

