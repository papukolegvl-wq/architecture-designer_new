import React, { useRef, useState, useEffect } from 'react'
import { Menu, X, Check, FileDown, Layout } from 'lucide-react'
import html2canvas from 'html2canvas'

interface FilePanelProps {
  onSave: (selectedWorkspaceIds?: string[]) => void | Promise<void>
  onLoad: (file: File) => void
  onExportDrawIO: () => void
  onExportPNG?: () => void
  onSaveLayout?: (targetWorkspaceIds?: string[]) => void
  workspaces: { id: string; name: string }[]
  activeWorkspaceId: string
}

export default function FilePanel({
  onSave,
  onLoad,
  onExportDrawIO,
  onExportPNG,
  onSaveLayout,
  workspaces,
  activeWorkspaceId
}: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSaveLayoutDialog, setShowSaveLayoutDialog] = useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set([activeWorkspaceId]))
  const [targetLayoutWorkspaceIds, setTargetLayoutWorkspaceIds] = useState<Set<string>>(new Set([activeWorkspaceId]))
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

  // Reset selections when dialogs open
  useEffect(() => {
    if (showSaveDialog) {
      setSelectedWorkspaces(new Set([activeWorkspaceId]))
    }
  }, [showSaveDialog, activeWorkspaceId])

  useEffect(() => {
    if (showSaveLayoutDialog) {
      setTargetLayoutWorkspaceIds(new Set([activeWorkspaceId]))
    }
  }, [showSaveLayoutDialog, activeWorkspaceId])


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

  const toggleWorkspaceSelection = (id: string) => {
    const newSelection = new Set(selectedWorkspaces)
    if (newSelection.has(id)) {
      if (newSelection.size > 1) newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedWorkspaces(newSelection)
  }

  const toggleLayoutWorkspaceSelection = (id: string) => {
    const newSelection = new Set(targetLayoutWorkspaceIds)
    if (newSelection.has(id)) {
      // Allow deselecting all? Probably fine, logic will handle empty
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setTargetLayoutWorkspaceIds(newSelection)
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
                setShowSaveDialog(true)
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
                  setShowSaveLayoutDialog(true)
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

      {/* Save File Dialog */}
      {showSaveDialog && (
        <div style={modalOverlayStyle} onClick={() => setShowSaveDialog(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={titleStyle}>
              <span>Сохранение файла</span>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', color: '#ccc', fontSize: '14px' }}>
              Выберите вкладки для сохранения:
            </div>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '20px',
              border: '1px solid #444',
              borderRadius: '4px',
              background: '#222'
            }}>
              {workspaces.map(ws => (
                <div
                  key={ws.id}
                  onClick={() => toggleWorkspaceSelection(ws.id)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedWorkspaces.has(ws.id) ? '#3a3a3a' : 'transparent',
                    borderBottom: '1px solid #333'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: `2px solid ${selectedWorkspaces.has(ws.id) ? '#4dabf7' : '#666'}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedWorkspaces.has(ws.id) ? '#4dabf7' : 'transparent'
                  }}>
                    {selectedWorkspaces.has(ws.id) && <Check size={12} color="white" strokeWidth={4} />}
                  </div>
                  <span style={{ color: ws.id === activeWorkspaceId ? '#fff' : '#ccc', fontWeight: ws.id === activeWorkspaceId ? 600 : 400 }}>
                    {ws.name} {ws.id === activeWorkspaceId && '(Текущая)'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{ ...buttonStyle, backgroundColor: '#444', color: 'white' }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onSave(Array.from(selectedWorkspaces))
                  setShowSaveDialog(false)
                }}
                style={{ ...buttonStyle, backgroundColor: '#4dabf7', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={selectedWorkspaces.size === 0}
              >
                <FileDown size={16} />
                Сохранить {selectedWorkspaces.size > 0 && `(${selectedWorkspaces.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Layout Dialog */}
      {showSaveLayoutDialog && onSaveLayout && (
        <div style={modalOverlayStyle} onClick={() => setShowSaveLayoutDialog(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={titleStyle}>
              <span>Сохранить размещение</span>
              <button
                onClick={() => setShowSaveLayoutDialog(false)}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', color: '#ccc', fontSize: '14px' }}>
              Выберите вкладку, куда сохранить текущее размещение:
            </div>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '20px',
              border: '1px solid #444',
              borderRadius: '4px',
              background: '#222'
            }}>
              {workspaces.map(ws => (
                <div
                  key={ws.id}
                  onClick={() => toggleLayoutWorkspaceSelection(ws.id)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: targetLayoutWorkspaceIds.has(ws.id) ? '#3a3a3a' : 'transparent',
                    borderBottom: '1px solid #333'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: `2px solid ${targetLayoutWorkspaceIds.has(ws.id) ? '#845ef7' : '#666'}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: targetLayoutWorkspaceIds.has(ws.id) ? '#845ef7' : 'transparent'
                  }}>
                    {targetLayoutWorkspaceIds.has(ws.id) && <Check size={12} color="white" strokeWidth={4} />}
                  </div>
                  <span style={{ color: ws.id === activeWorkspaceId ? '#fff' : '#ccc', fontWeight: ws.id === activeWorkspaceId ? 600 : 400 }}>
                    {ws.name} {ws.id === activeWorkspaceId && '(Текущая)'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowSaveLayoutDialog(false)}
                style={{ ...buttonStyle, backgroundColor: '#444', color: 'white' }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onSaveLayout(Array.from(targetLayoutWorkspaceIds))
                  setShowSaveLayoutDialog(false)
                }}
                style={{ ...buttonStyle, backgroundColor: '#845ef7', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layout size={16} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
