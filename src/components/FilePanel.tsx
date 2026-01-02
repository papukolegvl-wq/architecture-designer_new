import React, { useRef } from 'react'

interface FilePanelProps {
  onSave: () => void
  onLoad: (file: File) => void
  onExportDrawIO: () => void
  onSaveLayout?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export default function FilePanel({ onSave, onLoad, onExportDrawIO, onSaveLayout, onUndo, onRedo, canUndo, canRedo }: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onLoad(file)
      // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #555',
        borderRadius: '12px',
        padding: '15px 20px',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1000,
        maxWidth: '95vw',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginRight: '10px', whiteSpace: 'nowrap' }}>
        Файлы:
      </h3>
      {onUndo && onRedo && (
        <>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '12px',
              backgroundColor: canUndo ? '#666' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: canUndo ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = '#555'
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = '#666'
              }
            }}
            title="Отменить (Ctrl+Z)"
          >
            ↶ Отменить
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '12px',
              backgroundColor: canRedo ? '#666' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: canRedo ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (canRedo) {
                e.currentTarget.style.backgroundColor = '#555'
              }
            }}
            onMouseLeave={(e) => {
              if (canRedo) {
                e.currentTarget.style.backgroundColor = '#666'
              }
            }}
            title="Повторить (Ctrl+Shift+Z)"
          >
            ↷ Повторить
          </button>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={onSave}
        style={{
          width: '100%',
          padding: '12px',
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
        💾 Сохранить
      </button>
      <button
        onClick={handleLoadClick}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#51cf66',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#40c057'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#51cf66'
        }}
      >
        📂 Загрузить
      </button>
      <button
        onClick={onExportDrawIO}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#20c997',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1aa179'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#20c997'
        }}
        title="Экспорт в формат draw.io (можно открыть в app.diagrams.net)"
      >
        📊 Экспорт в draw.io
      </button>
      <button
        onClick={() => {
          const event = new CustomEvent('showAIAssistant')
          window.dispatchEvent(event)
        }}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#9c88ff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#8b7ae8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#9c88ff'
        }}
        title="AI Ассистент для помощи в построении архитектуры"
      >
        ✨ AI Ассистент
      </button>
      {onSaveLayout && (
        <button
          onClick={onSaveLayout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#845ef7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7048e8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#845ef7'
          }}
          title="Сохранить текущее размещение компонентов на рабочем пространстве"
        >
          📐 Сохранить размещение
        </button>
      )}
    </div>
  )
}

