import { useState } from 'react'
import { X, Plus, Lock } from 'lucide-react'

interface Tab {
  id: string
  name: string
  isLocked?: boolean
}

interface TabsPanelProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
  onTabRename: (tabId: string, newName: string) => void
}

export default function TabsPanel({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onTabRename,
}: TabsPanelProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        backgroundColor: '#1e1e1e',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        zIndex: 1000,
        gap: '4px',
      }}
    >
      {tabs.map((tab) => {
        const isEditing = editingTabId === tab.id
        return (
          <div
            key={tab.id}
            onClick={(e) => {
              // Не переключаем вкладку, если кликнули на input для редактирования
              if ((e.target as HTMLElement).tagName !== 'INPUT') {
                onTabClick(tab.id)
              }
            }}
            onDoubleClick={() => {
              if (!tab.isLocked) {
                setEditingTabId(tab.id)
                setEditingName(tab.name)
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: activeTabId === tab.id ? '#2d2d2d' : '#252525',
              border: activeTabId === tab.id ? '1px solid #4dabf7' : '1px solid #333',
              borderBottom: activeTabId === tab.id ? 'none' : '1px solid #333',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              color: activeTabId === tab.id ? '#fff' : '#aaa',
              fontSize: '14px',
              fontWeight: activeTabId === tab.id ? '500' : '400',
              transition: 'all 0.2s',
              position: 'relative',
              minWidth: '120px',
              maxWidth: '200px',
            }}
            onMouseEnter={(e) => {
              if (activeTabId !== tab.id) {
                e.currentTarget.style.backgroundColor = '#2a2a2a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTabId !== tab.id) {
                e.currentTarget.style.backgroundColor = '#252525'
              }
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => {
                  if (editingName.trim()) {
                    onTabRename(tab.id, editingName.trim())
                  }
                  setEditingTabId(null)
                  setEditingName('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingName.trim()) {
                      onTabRename(tab.id, editingName.trim())
                    }
                    setEditingTabId(null)
                    setEditingName('')
                  }
                  if (e.key === 'Escape') {
                    setEditingTabId(null)
                    setEditingName('')
                  }
                  e.stopPropagation()
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #4dabf7',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  outline: 'none',
                  minWidth: '80px',
                }}
              />
            ) : (
              <div
                style={{
                  overflow: 'hidden',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Двойной клик для переименования"
              >
                {tab.isLocked && (
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Lock size={12} style={{ color: '#ff6b6b' }} />
                  </span>
                )}
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {tab.name}
                </span>
              </div>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                disabled={tab.isLocked}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tab.isLocked ? '#444' : '#888',
                  cursor: tab.isLocked ? 'not-allowed' : 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  opacity: tab.isLocked ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!tab.isLocked) {
                    e.currentTarget.style.backgroundColor = '#3d3d3d'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tab.isLocked) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#888'
                  }
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )
      })}
      <button
        onClick={onNewTab}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          backgroundColor: '#252525',
          border: '1px solid #333',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          color: '#aaa',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2a2a2a'
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#252525'
          e.currentTarget.style.color = '#aaa'
        }}
        title="Создать новую вкладку"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

