import React, { useState, useRef, useEffect } from 'react'
import { ComponentType } from '../types'
import { getComponentDefinition } from '../utils/componentDefinitions'
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react'
import { components, categoryLabels, ComponentCategory, Component } from './componentData'

interface ComponentPaletteProps {
  onComponentClick: (type: ComponentType) => void
  onRecommendationClick?: () => void
}

export default function ComponentPalette({ onComponentClick, onRecommendationClick }: ComponentPaletteProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('all')
  const [hoveredComponent, setHoveredComponent] = useState<Component | null>(null)
  const paletteRef = useRef<HTMLDivElement>(null)

  // Фильтрация компонентов
  const filteredComponents = components.filter(component => {
    const term = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === '' ||
      component.label.toLowerCase().includes(term) ||
      component.type.toLowerCase().includes(term) ||
      (component.vendor && component.vendor.toLowerCase().includes(term))

    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Загружаем позицию и состояние сворачивания из localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('component-palette-position')
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    const savedCollapsed = localStorage.getItem('component-palette-collapsed')
    if (savedCollapsed) {
      try {
        setIsCollapsed(JSON.parse(savedCollapsed))
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  }, [])

  // Сохраняем позицию и состояние сворачивания в localStorage
  useEffect(() => {
    localStorage.setItem('component-palette-position', JSON.stringify(position))
  }, [position])

  useEffect(() => {
    localStorage.setItem('component-palette-collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (paletteRef.current) {
      const rect = paletteRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleDragStart = (e: React.DragEvent, component: Component) => {
    e.dataTransfer.setData('application/reactflow', component.type)
    e.dataTransfer.setData('application/reactflow/vendor', component.vendor || '')
    e.dataTransfer.setData('application/reactflow/label', component.defaultLabel || component.label)
    e.dataTransfer.setData('text/plain', component.type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      ref={paletteRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '520px',
        backgroundColor: '#1e1e1e',
        border: '2px solid #444',
        borderRadius: '12px',
        padding: isCollapsed ? '12px 16px' : '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 10,
        maxHeight: isCollapsed ? 'auto' : 'calc(100vh - 40px)',
        overflowY: isCollapsed ? 'visible' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default',
        transition: 'padding 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCollapsed ? '0' : '12px',
          paddingBottom: isCollapsed ? '0' : '10px',
          borderBottom: isCollapsed ? 'none' : '2px solid #444',
        }}
      >
        <h2
          onMouseDown={handleMouseDown}
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'grab',
            userSelect: 'none',
            margin: 0,
            flex: 1,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.cursor = 'grab'
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.cursor = 'default'
            }
          }}
        >
          {isDragging ? '🖐 Перетаскивание...' : '☰ Компоненты'}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRecommendationClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333'
              e.currentTarget.style.color = '#ffd43b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#fff'
            }}
            title="Ассистент по выбору технологий"
          >
            <Lightbulb size={20} />
          </button>
          <button
            onClick={toggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <>
          {/* Поиск */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Поиск компонентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4dabf7'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#555'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Категории */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(Object.keys(categoryLabels) as ComponentCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: selectedCategory === category ? '#4dabf7' : '#2d2d2d',
                  color: '#fff',
                  border: `1px solid ${selectedCategory === category ? '#4dabf7' : '#555'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedCategory === category ? '600' : '400',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#333'
                    e.currentTarget.style.borderColor = '#666'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                    e.currentTarget.style.borderColor = '#555'
                  }
                }}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          {/* Список компонентов */}
          {filteredComponents.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888',
              fontSize: '14px'
            }}>
              Компоненты не найдены
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
              }}
            >
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component)}
                  onClick={() => onComponentClick(component.type)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#2d2d2d',
                    border: `2px solid ${component.color}40`,
                    borderRadius: '8px',
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredComponent(component)
                    e.currentTarget.style.borderColor = component.color
                    e.currentTarget.style.backgroundColor = '#333'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${component.color}30`
                  }}
                  onMouseLeave={(e) => {
                    setHoveredComponent(null)
                    e.currentTarget.style.borderColor = `${component.color}40`
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.cursor = 'grabbing'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.cursor = 'grab'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: `linear-gradient(135deg, ${component.color}20, ${component.color}10)`,
                      border: `2px solid ${component.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: component.color,
                      marginBottom: '2px',
                    }}
                  >
                    {React.cloneElement(component.icon as React.ReactElement, { size: 18 })}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      color: '#fff',
                      lineHeight: '1.1',
                    }}
                  >
                    {component.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Информационная панель при наведении */}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#252525',
            borderRadius: '6px',
            border: '1px solid #333',
            minHeight: '80px',
            transition: 'opacity 0.2s',
            opacity: hoveredComponent ? 1 : 0.6
          }}>
            {hoveredComponent ? (
              <>
                <div style={{
                  color: hoveredComponent.color,
                  fontWeight: '600',
                  fontSize: '12px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {React.cloneElement(hoveredComponent.icon as React.ReactElement, { size: 14 })}
                  {hoveredComponent.label}
                </div>
                <div style={{
                  color: '#aaa',
                  fontSize: '11px',
                  lineHeight: '1.4'
                }}>
                  {getComponentDefinition(hoveredComponent.type).description}
                  {hoveredComponent.vendor && (
                    <div style={{ marginTop: '4px', color: '#666' }}>
                      Вендор: {hoveredComponent.vendor.toUpperCase()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                color: '#666',
                fontSize: '11px',
                fontStyle: 'italic',
                textAlign: 'center',
                paddingTop: '20px'
              }}>
                Наведите на компонент для описания
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
