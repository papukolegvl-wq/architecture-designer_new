import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ServiceLanguage, ServiceEndpoint } from '../types'
import { Plus, Trash2 } from 'lucide-react'

interface ServiceConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { language: ServiceLanguage; endpoints?: ServiceEndpoint[] }) => void
  onClose: () => void
}

const languages: Array<{ value: ServiceLanguage; label: string; icon: string }> = [
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'nodejs', label: 'Node.js', icon: '🟢' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'kotlin', label: 'Kotlin', icon: '🔵' },
  { value: 'scala', label: 'Scala', icon: '🔴' },
]

export default function ServiceConfigPanel({
  node,
  onUpdate,
  onClose,
}: ServiceConfigPanelProps) {
  const data = node.data as ComponentData
  const [language, setLanguage] = useState<ServiceLanguage | undefined>(
    data.serviceConfig?.language
  )
  const [endpoints, setEndpoints] = useState<ServiceEndpoint[]>(
    data.serviceConfig?.endpoints || []
  )
  const [newPath, setNewPath] = useState('')
  const [newMethod, setNewMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')

  const handleSave = () => {
    if (language) {
      onUpdate(node.id, { language, endpoints })
    }
    onClose()
  }

  const handleAddEndpoint = () => {
    if (newPath.trim()) {
      setEndpoints([...endpoints, { path: newPath.trim(), method: newMethod }])
      setNewPath('')
      setNewMethod('GET')
    }
  }

  const handleRemoveEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index))
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
        minWidth: '400px',
        maxWidth: '450px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Настройка сервиса
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#aaa'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Язык программирования:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {languages.map((lang) => (
            <label
              key={lang.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: language === lang.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${language === lang.value ? '#4dabf7' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setLanguage(lang.value)}
            >
              <input
                type="radio"
                name="language"
                value={lang.value}
                checked={language === lang.value}
                onChange={() => setLanguage(lang.value)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '20px' }}>{lang.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {lang.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Endpoints:
        </label>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <select
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value as any)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #555',
              backgroundColor: '#3d3d3d',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <input
            type="text"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="/api/path"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #555',
              backgroundColor: '#3d3d3d',
              color: '#fff',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddEndpoint()
              e.stopPropagation()
            }}
          />
          <button
            onClick={handleAddEndpoint}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#4dabf7',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={!newPath.trim()}
          >
            <Plus size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {endpoints.map((ep, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: '#3d3d3d',
              borderRadius: '6px',
              border: '1px solid #555'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: ep.method === 'GET' ? '#4dabf7' : ep.method === 'POST' ? '#51cf66' : ep.method === 'DELETE' ? '#ff6b6b' : '#ffa94d',
                  color: '#fff'
                }}>{ep.method}</span>
                <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}>{ep.path}</span>
              </div>
              <button
                onClick={() => handleRemoveEndpoint(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {endpoints.length === 0 && (
            <div style={{ color: '#777', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
              Нет добавленных endpoints
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#666'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#555'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!language}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: language ? '#4dabf7' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: language ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: language ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (language) {
              e.currentTarget.style.backgroundColor = '#339af0'
            }
          }}
          onMouseLeave={(e) => {
            if (language) {
              e.currentTarget.style.backgroundColor = '#4dabf7'
            }
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}














