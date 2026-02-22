import React, { useRef, useState, useEffect } from 'react'
import { Menu, X, Check, Layout } from 'lucide-react'
import html2canvas from 'html2canvas'

interface FilePanelProps {
  onSave: (selectedWorkspaceIds?: string[]) => void | Promise<void>
  onLoad: (file: File) => void
  onExportDrawIO: () => void
  onExportPNG?: () => void
  onSaveLayout?: (targetWorkspaceIds?: string[]) => void
  onTogglePalette?: () => void
  workspaces: { id: string; name: string }[]
  activeWorkspaceId: string
  onExportActivityDiagram?: () => void
  onLoadNewTab?: (file: File) => void
}

export default function FilePanel({
  onSave,
  onLoad,
  onExportDrawIO,
  onExportPNG,
  onSaveLayout,
  onTogglePalette,
  workspaces,
  activeWorkspaceId,
  onExportActivityDiagram,
  onLoadNewTab
}: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loadMode, setLoadMode] = useState<'current' | 'new'>('current')

  const menuRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (loadMode === 'new' && onLoadNewTab) {
        onLoadNewTab(file)
      } else {
        onLoad(file)
      }

      // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    setIsOpen(false)
  }

  const handleLoadClick = (mode: 'current' | 'new' = 'current') => {
    setLoadMode(mode)
    // Wait for state update is not needed for synchronized logic, but good to be safe if handling complex effects.
    // However, setLoadMode is async. But React 18 batches. 
    // To be safer, we can trigger click after a tiny timeout or rely on batching.
    // Actually, relying on state set immediately before click might be tricky if not careful.
    // Let's use a timeout to ensure state is set, or better, just use two inputs? 
    // Or just simple state. In React event handler, updates are batched. 
    // But file input click is programmatic.
    // Let's just use setTimeout 0.
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
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





  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#2d2d2d',
    borderRadius: '8px',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    border: '1px solid #444',
  }

  const titleStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  }

  return (
    <>
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
              💾 Сохранить состояние
            </button>

            <button
              onClick={() => handleLoadClick('current')}
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
              onClick={() => handleLoadClick('new')}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#51cf66'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              📑 Загрузить в новую вкладку
            </button>

            {onTogglePalette && (
              <button
                onClick={() => {
                  onTogglePalette()
                  setIsOpen(false)
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff922b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                title="Открыть библиотеку компонентов"
              >
                <Layout size={14} /> 🧱 Компоненты
              </button>
            )}

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

            {onExportActivityDiagram && (
              <button
                onClick={() => {
                  onExportActivityDiagram()
                  setIsOpen(false)
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4dabf7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                title="Сгенерировать Activity Diagram на основе порядковых номеров (Mermaid)"
              >
                🔄 Activity Diagram (Mermaid)
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

            <button
              onClick={() => {
                const event = new CustomEvent('showLearningPanel')
                window.dispatchEvent(event)
                setIsOpen(false)
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD43B'
                e.currentTarget.style.color = '#333'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'white'
              }}
              title="Интерактивное обучение архитектурным паттернам"
            >
              🎓 Обучение
            </button>

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




    </>
  )
}
