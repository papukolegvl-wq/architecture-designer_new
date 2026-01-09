import React, { useRef, useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import html2canvas from 'html2canvas'

interface FilePanelProps {
  onSave: () => void | Promise<void>
  onLoad: (file: File) => void
  onExportDrawIO: () => void
  onExportPNG?: () => void
  onExportMarkdown?: () => void
  onSaveLayout?: () => void
  onExportAnimation?: () => void
  onExportRegion?: () => void
}

export default function FilePanel({ onSave, onLoad, onExportDrawIO, onExportPNG, onExportMarkdown, onSaveLayout, onExportAnimation, onExportRegion }: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onLoad(file)
      // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    setIsOpen(false)
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const menuItemStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const,
    transition: 'background-color 0.2s',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 16px',
          backgroundColor: '#2d2d2d',
          color: 'white',
          border: '2px solid #555',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3d3d3d'
          e.currentTarget.style.borderColor = '#666'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2d2d2d'
          e.currentTarget.style.borderColor = '#555'
        }}
      >
        <Menu size={18} />
        Меню
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            backgroundColor: '#2d2d2d',
            border: '2px solid #555',
            borderRadius: '8px',
            minWidth: '220px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => {
              onSave()
              setIsOpen(false)
            }}
            style={menuItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4dabf7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            💾 Сохранить
          </button>

          <button
            onClick={handleLoadClick}
            style={menuItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#51cf66'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            📂 Загрузить
          </button>

          <button
            onClick={() => {
              onExportDrawIO()
              setIsOpen(false)
            }}
            style={menuItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#20c997'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Экспорт в формат draw.io (можно открыть в app.diagrams.net)"
          >
            📊 Экспорт в draw.io
          </button>

          {onExportPNG && (
            <button
              onClick={() => {
                onExportPNG()
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b6b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Экспорт диаграммы в PNG изображение"
            >
              🖼️ Экспорт в PNG
            </button>
          )}

          {onExportMarkdown && (
            <button
              onClick={() => {
                onExportMarkdown()
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffa94d'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Экспорт описания архитектуры в Markdown"
            >
              📝 Экспорт в Markdown
            </button>
          )}

          <button
            onClick={() => {
              const event = new CustomEvent('showAIAssistant')
              window.dispatchEvent(event)
              setIsOpen(false)
            }}
            style={menuItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#9c88ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="AI Ассистент для помощи в построении архитектуры"
          >
            ✨ AI Ассистент
          </button>

          {onExportAnimation && (
            <button
              onClick={() => {
                onExportAnimation()
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#cc5de8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Записать видео всего экрана или вкладки"
            >
              🎥 Записать весь экран
            </button>
          )}

          {onExportRegion && (
            <button
              onClick={() => {
                onExportRegion()
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f06595'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Выделить область для записи видео"
            >
              🔲 Записать область
            </button>
          )}

          {onSaveLayout && (
            <button
              onClick={() => {
                onSaveLayout()
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#845ef7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Сохранить текущее размещение компонентов на рабочем пространстве"
            >
              📐 Сохранить размещение
            </button>
          )}
        </div>
      )}
    </div>
  )
}
