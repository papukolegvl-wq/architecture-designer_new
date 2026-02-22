import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, FrontendFramework } from '../types'

interface FrontendConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { framework: FrontendFramework }) => void
  onClose: () => void
}

const frameworks: Array<{ value: FrontendFramework; label: string; description: string }> = [
  { value: 'react', label: 'React', description: 'Библиотека от Facebook' },
  { value: 'vue', label: 'Vue.js', description: 'Прогрессивный фреймворк' },
  { value: 'angular', label: 'Angular', description: 'Фреймворк от Google' },
  { value: 'svelte', label: 'Svelte', description: 'Компилируемый фреймворк' },
  { value: 'nextjs', label: 'Next.js', description: 'React фреймворк (SSR)' },
  { value: 'nuxt', label: 'Nuxt.js', description: 'Vue фреймворк (SSR)' },
  { value: 'vanilla', label: 'Vanilla JS', description: 'Чистый JavaScript' },
]

export default function FrontendConfigPanel({
  node,
  onUpdate,
  onClose,
}: FrontendConfigPanelProps) {
  const data = node.data as ComponentData
  const [framework, setFramework] = useState<FrontendFramework | undefined>(
    data.frontendConfig?.framework
  )

  const handleSave = () => {
    if (framework) {
      onUpdate(node.id, { framework })
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
        border: '2px solid #339af0',
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
          Настройка фронтенда
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
          Фреймворк/Технология:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {frameworks.map((fw) => (
            <label
              key={fw.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: framework === fw.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${framework === fw.value ? '#339af0' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setFramework(fw.value)}
            >
              <input
                type="radio"
                name="framework"
                value={fw.value}
                checked={framework === fw.value}
                onChange={() => setFramework(fw.value)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                  {fw.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{fw.description}</div>
              </div>
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
          disabled={!framework}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: framework ? '#339af0' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: framework ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: framework ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (framework) {
              e.currentTarget.style.backgroundColor = '#228be6'
            }
          }}
          onMouseLeave={(e) => {
            if (framework) {
              e.currentTarget.style.backgroundColor = '#339af0'
            }
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}














