import { ComponentType } from '../types'
import { X } from 'lucide-react'
import { getComponentDefinition } from '../utils/componentDefinitions'

interface ComponentInfoPanelProps {
  componentType: ComponentType
  onClose: () => void
  onCompare?: (type: ComponentType) => void
}



export default function ComponentInfoPanel({ componentType, onClose, onCompare }: ComponentInfoPanelProps) {
  const info = getComponentDefinition(componentType)


  // Если описание не найдено, показываем заглушку
  if (!info) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2d2d2d',
          border: '2px solid #4dabf7',
          borderRadius: '16px',
          padding: '30px',
          minWidth: '500px',
          maxWidth: '700px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
          zIndex: 2000,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
            Информация о компоненте
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaa',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.backgroundColor = '#3d3d3d'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#aaa'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', margin: 0 }}>
          Описание для компонента "{componentType}" пока не добавлено.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #4dabf7',
        borderRadius: '16px',
        padding: '30px',
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        zIndex: 2000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          {info.title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.backgroundColor = '#3d3d3d'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#aaa'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4dabf7', marginBottom: '12px' }}>
          Описание
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', margin: 0 }}>
          {info.description}
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4dabf7', marginBottom: '12px' }}>
          Примеры использования
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc' }}>
          {info.useCases.map((useCase, index) => (
            <li key={index} style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '8px' }}>
              {useCase}
            </li>
          ))}
        </ul>
      </div>


    </div>
  )
}


