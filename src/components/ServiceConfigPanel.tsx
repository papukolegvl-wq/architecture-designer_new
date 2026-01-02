import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ServiceLanguage } from '../types'

interface ServiceConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { language: ServiceLanguage }) => void
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

  const handleSave = () => {
    if (language) {
      onUpdate(node.id, { language })
    }
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
        minWidth: '350px',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
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














