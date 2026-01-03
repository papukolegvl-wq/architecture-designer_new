import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Sparkles, Loader2, Send, FileText, HelpCircle, Copy, Minimize2, Maximize2, RefreshCcw, MessageSquare, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  initializeGemini,
  isGeminiInitialized,
  generateArchitectureFromDescription,
  generateImprovementRecommendations,
  explainArchitectureDecision,
  AIGeneratedArchitecture,
  generateArchitectureCase,
  evaluateArchitectureSolution,
  ArchitectureCase,
  ArchitectureEvaluation
} from '../utils/geminiService'
import { Node, Edge } from 'reactflow'
import { ComponentData, ComponentType, ConnectionType } from '../types'

// ErrorBoundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Panel Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff6b6b', textAlign: 'center', backgroundColor: '#2d2d2d', borderRadius: '12px', border: '1px solid #ff6b6b' }}>
          <h3>Что-то пошло не так</h3>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Произошла ошибка в интерфейсе ассистента.</p>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px', fontFamily: 'monospace', padding: '10px', backgroundColor: '#1e1e1e', borderRadius: '4px' }}>
            {this.state.error?.message}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '8px 16px', backgroundColor: '#4dabf7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

interface AIAssistantPanelProps {
  nodes: Node[]
  edges: Edge[]
  onClose: () => void
}

type AssistantMode = 'chat' | 'generate' | 'learning'

export default function AIAssistantPanel({
  nodes,
  edges,
  onClose,
}: AIAssistantPanelProps) {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Загружаем API ключ из localStorage
    try {
      return localStorage.getItem('gemini-api-key') || ''
    } catch (e) {
      return ''
    }
  })
  const [isInitialized, setIsInitialized] = useState(isGeminiInitialized())
  const [mode, setMode] = useState<AssistantMode>('generate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [improvementRecommendations, setImprovementRecommendations] = useState<string>('')

  // Состояние для обучения (learning)
  const [currentCase, setCurrentCase] = useState<ArchitectureCase | null>(null)
  const [evaluation, setEvaluation] = useState<ArchitectureEvaluation | null>(null)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'god'>('beginner')

  // Состояние для перемещения и сворачивания
  const [position, setPosition] = useState({ x: 50, y: 50 }) // в процентах или пикселях
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  // Обработка перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    // Не начинаем тащить, если кликнули по кнопкам или инпутам
    if ((e.target as HTMLElement).closest('button, input, textarea')) return

    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - dragStartPos.current.x
      const dy = e.clientY - dragStartPos.current.y

      dragStartPos.current = { x: e.clientX, y: e.clientY }

      setPosition((prev: { x: number, y: number }) => ({
        x: prev.x + dx,
        y: prev.y + dy
      }))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Инициализация позиции по центру при первом открытии
  useEffect(() => {
    if (panelRef.current && position.x === 50 && position.y === 50) {
      const { innerWidth, innerHeight } = window
      const width = Math.min(900, innerWidth * 0.9)
      const height = Math.min(800, innerHeight * 0.8)
      setPosition({
        x: (innerWidth - width) / 2,
        y: (innerHeight - height) / 2
      })
    }
  }, [])

  // Атрибуты качества для улучшения архитектуры
  const qualityAttributes = [
    { id: 'performance', label: 'Производительность', description: 'Оптимизация скорости работы системы' },
    { id: 'scalability', label: 'Масштабируемость', description: 'Возможность масштабирования системы' },
    { id: 'reliability', label: 'Надежность', description: 'Устойчивость к сбоям и отказоустойчивость' },
    { id: 'security', label: 'Безопасность', description: 'Защита данных и системы' },
    { id: 'maintainability', label: 'Поддерживаемость', description: 'Упрощение поддержки и развития' },
    { id: 'cost', label: 'Экономичность', description: 'Оптимизация стоимости инфраструктуры' },
    { id: 'availability', label: 'Доступность', description: 'Обеспечение высокой доступности сервисов' },
    { id: 'monitoring', label: 'Мониторинг', description: 'Добавление систем мониторинга и логирования' },
  ]

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  const handleInitialize = () => {
    if (!apiKey.trim()) {
      setError('Пожалуйста, введите API ключ')
      return
    }

    const success = initializeGemini(apiKey)
    if (success) {
      setIsInitialized(true)
      localStorage.setItem('gemini-api-key', apiKey)
      setError(null)
    } else {
      setError('Не удалось инициализировать Gemini. Проверьте API ключ.')
    }
  }

  const handleImprove = async () => {
    if (nodes.length === 0 && edges.length === 0) {
      setError('Нет текущей архитектуры для улучшения')
      return
    }

    if (selectedAttributes.length === 0) {
      setError('Выберите хотя бы один атрибут качества для улучшения')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Формируем описание выбранных атрибутов качества
      const attributesDescription = selectedAttributes
        .map(id => {
          const attr = qualityAttributes.find(a => a.id === id)
          return attr ? attr.label : id
        })
        .join(', ')

      const improvementPrompt = `Улучши архитектуру, фокусируясь на следующих атрибутах качества: ${attributesDescription}. ${inputValue.trim() ? `Дополнительные требования: ${inputValue.trim()}` : ''}`

      const recommendations = await generateImprovementRecommendations(nodes, edges, improvementPrompt)
      setImprovementRecommendations(recommendations)
      setMode('generate')
    } catch (err: any) {
      setError(err.message || 'Ошибка при улучшении архитектуры')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyRecommendations = () => {
    if (improvementRecommendations) {
      navigator.clipboard.writeText(improvementRecommendations)
      alert('Рекомендации скопированы в буфер обмена!')
    }
  }

  const handleGenerate = async () => {
    if (!inputValue.trim()) {
      setError('Введите описание архитектуры')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const architecture = await generateArchitectureFromDescription(inputValue)
      // Конвертируем в формат приложения для скачивания
      const convertAIToAppFormat = (aiArchitecture: AIGeneratedArchitecture): { nodes: Node[]; edges: Edge[] } => {
        const nodes: Node[] = aiArchitecture.components.map((comp: any, index: number) => {
          const nodeId = `ai-generated-${comp.type}-${index}-${Date.now()}`
          const position = comp.position || {
            x: 100 + (index % 5) * 200,
            y: 100 + Math.floor(index / 5) * 150
          }

          const componentData: ComponentData = {
            type: comp.type as ComponentType,
            label: comp.name,
            comment: comp.description,
            connectionType: 'sync',
          }

          return {
            id: nodeId,
            type: 'custom',
            position,
            data: componentData,
            width: 200,
            height: 100,
          } as Node
        })

        const nameToIdMap = new Map<string, string>()
        aiArchitecture.components.forEach((comp, index) => {
          const nodeId = nodes[index].id
          nameToIdMap.set(comp.name, nodeId)
        })

        const edges: Edge[] = aiArchitecture.connections
          .filter(conn => nameToIdMap.has(conn.from) && nameToIdMap.has(conn.to))
          .map((conn, index) => {
            const sourceId = nameToIdMap.get(conn.from)!
            const targetId = nameToIdMap.get(conn.to)!

            return {
              id: `ai-edge-${index}-${Date.now()}`,
              source: sourceId,
              target: targetId,
              type: 'animated',
              data: {
                connectionType: conn.connectionType as ConnectionType,
                description: conn.description,
              },
              deletable: true,
              // @ts-ignore
              deleteOnSourceNodeDelete: true,
              deleteOnTargetNodeDelete: true,
            } as Edge
          })

        return { nodes, edges }
      }

      const { nodes: newNodes, edges: newEdges } = convertAIToAppFormat(architecture)
      const data = {
        nodes: newNodes,
        edges: newEdges,
        version: '1.0',
      }

      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `architecture-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Архитектура сгенерирована и скачана! Откройте файл через "Загрузить" в панели файлов.')
      setInputValue('')
    } catch (err: any) {
      setError(err.message || 'Ошибка при генерации архитектуры')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setChatMessages((prev: any[]) => [...prev, { role: 'user', content: userMessage }])
    setInputValue('')
    setLoading(true)
    setError(null)

    try {
      let contextPrompt = userMessage

      if (mode === 'learning' && currentCase) {
        contextPrompt = `
          Контекст: Пользователь находится в режиме обучения "Архитектурный тренажер".
          Текущая задача: ${currentCase.title}
          Описание задачи: ${currentCase.description}
          Требования: ${(currentCase.businessRequirements || []).join(', ')}
          Атрибуты качества: ${(currentCase.qualityAttributes || []).join(', ')}
          
          ${evaluation ? `
          Оценка текущего решения: ${evaluation.score}/100
          Верные решения: ${(evaluation.correctDecisions || []).join(', ')}
          Упущенные требования: ${(evaluation.missedRequirements || []).join(', ')}
          Рекомендации: ${(evaluation.optimizationSuggestions || []).join(', ')}
          Общий итог: ${evaluation.summary}
          ` : 'Пользователь еще не проверил решение, он в процессе проектирования.'}

          Вопрос пользователя: ${userMessage}
          
          Отвечай как опытный архитектурный наставник. Помогай разобраться, но не давай готовое решение целиком, если задача еще не решена.
        `.trim()
      } else if (improvementRecommendations) {
        // Если есть рекомендации, добавляем их в контекст неявно
        contextPrompt = `На основе предыдущих рекомендаций: "${improvementRecommendations.substring(0, 1000)}...". Вопрос: ${userMessage}`
      }

      const response = await explainArchitectureDecision(contextPrompt, nodes, edges)
      setChatMessages((prev: any[]) => [...prev, { role: 'assistant', content: response }])
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении ответа')
      setChatMessages((prev: any[]) => [...prev, { role: 'assistant', content: `Ошибка: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleDiscussRecommendations = () => {
    if (!improvementRecommendations) return
    setMode('chat')
    setChatMessages(prev => [
      ...prev,
      { role: 'assistant', content: `Я проанализировал вашу архитектуру и предложил рекомендации. Вы можете спросить меня подробнее о любой из них или запросить альтернативы.` }
    ])
  }

  const handleStartLearning = async (diff?: 'beginner' | 'intermediate' | 'advanced' | 'god') => {
    const targetDiff = diff || difficulty
    setLoading(true)
    setError(null)
    setEvaluation(null)
    try {
      const newCase = await generateArchitectureCase(targetDiff)
      setCurrentCase(newCase)
      setMode('learning')
    } catch (err: any) {
      setError(err.message || 'Ошибка при генерации кейса')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckSolution = async () => {
    if (!currentCase) return
    setLoading(true)
    setError(null)
    try {
      const result = await evaluateArchitectureSolution(nodes, edges, currentCase)
      setEvaluation(result)
    } catch (err: any) {
      setError(err.message || 'Ошибка при оценке решения')
    } finally {
      setLoading(false)
    }
  }

  if (!isInitialized) {
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
          maxWidth: '600px',
          zIndex: 2000,
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#4dabf7" />
            Настройка Gemini AI
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
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>
            API ключ Gemini:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Введите ваш Google AI Studio API ключ"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #444',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            Получите API ключ на{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#4dabf7' }}>
              Google AI Studio
            </a>
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#dc354520', border: '1px solid #dc3545', borderRadius: '8px', color: '#dc3545', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleInitialize}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4dabf7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Инициализировать
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        ref={panelRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          backgroundColor: '#2d2d2d',
          border: '2px solid #4dabf7',
          borderRadius: '16px',
          padding: isMinimized ? '10px 20px' : '20px',
          width: isMinimized ? 'auto' : '90%',
          maxWidth: isMinimized ? '300px' : '900px',
          maxHeight: isMinimized ? 'auto' : '90vh',
          zIndex: 2000,
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          cursor: isDragging ? 'grabbing' : (isMinimized ? 'pointer' : 'default'),
          transition: isDragging ? 'none' : 'width 0.3s, max-width 0.3s, height 0.3s, padding 0.3s',
          overflow: 'hidden',
        }}
      >
        <ErrorBoundary>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? 0 : '20px' }}>
            <h2 style={{ fontSize: isMinimized ? '14px' : '20px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
              {isMinimized ? 'Ассистент' : 'Ассистент'}
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
                title={isMinimized ? "Развернуть" : "Свернуть"}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d3d3d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c92a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <React.Fragment>

              {/* Режимы работы */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setMode('generate')
                    setInputValue('')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: mode === 'generate' ? '#4dabf7' : '#1e1e1e',
                    color: '#fff',
                    border: '1px solid #4dabf7',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={16} />
                  Генерация
                </button>
                <button
                  onClick={() => {
                    setMode('learning')
                    setInputValue('')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: mode === 'learning' ? '#4dabf7' : '#1e1e1e',
                    color: '#fff',
                    border: '1px solid #4dabf7',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <GraduationCap size={16} />
                  Обучение
                </button>
              </div>

              {error && (
                <div style={{ padding: '12px', backgroundColor: '#dc354520', border: '1px solid #dc3545', borderRadius: '8px', color: '#dc3545', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {/* Контент в зависимости от режима */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: '200px' }}>
                {mode === 'chat' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: msg.role === 'user' ? '#1e1e1e' : '#2d2d2d',
                          borderRadius: '8px',
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                          {msg.role === 'user' ? 'Вы' : 'AI'}
                        </div>
                        <div style={{ color: '#fff', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      </div>
                    ))}
                    {loading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4dabf7' }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>AI думает...</span>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'generate' && improvementRecommendations && (
                  <div style={{ padding: '16px', backgroundColor: '#1e1e1e', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ color: '#fff', margin: 0 }}>Рекомендации по улучшению архитектуры</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleCopyRecommendations}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#51cf66',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Copy size={14} />
                          Копировать
                        </button>
                        <button
                          onClick={handleImprove}
                          disabled={loading}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4dabf7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          title="Повторный анализ текущей схемы"
                        >
                          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                          {loading ? 'Анализирую...' : 'Проверить исправления'}
                        </button>
                        <button
                          onClick={handleDiscussRecommendations}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#845ef7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <MessageSquare size={14} />
                          Обсудить в чате
                        </button>
                        <button
                          onClick={() => {
                            setImprovementRecommendations('')
                            setSelectedAttributes([])
                            setInputValue('')
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          title="Очистить и начать заново"
                        >
                          <X size={14} />
                          Очистить
                        </button>
                      </div>
                    </div>
                    <div style={{
                      color: loading ? '#888' : '#ccc',
                      fontSize: '14px',
                      overflow: 'auto',
                      maxHeight: '500px',
                      padding: '16px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      position: 'relative',
                      transition: 'color 0.3s',
                    }}>
                      {loading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          zIndex: 1,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e1e1e', padding: '10px 20px', borderRadius: '8px', border: '1px solid #4dabf7' }}>
                            <Loader2 size={20} className="animate-spin" color="#4dabf7" />
                            <span style={{ color: '#fff', fontSize: '14px' }}>Обновление анализа...</span>
                          </div>
                        </div>
                      )}
                      {improvementRecommendations}
                    </div>
                    <p style={{ color: '#888', fontSize: '11px', marginTop: '12px', marginBottom: 0 }}>
                      💡 Используйте эти рекомендации для ручного улучшения архитектуры. Добавьте предложенные компоненты и соединения на рабочую область.
                    </p>
                  </div>
                )}

                {mode === 'generate' && !improvementRecommendations && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {nodes.length > 0 || edges.length > 0 ? (
                      <>
                        <div>
                          <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>
                            Выберите атрибуты качества для улучшения:
                          </h3>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '10px',
                            marginBottom: '16px'
                          }}>
                            {qualityAttributes.map((attr) => (
                              <label
                                key={attr.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  padding: '12px',
                                  backgroundColor: selectedAttributes.includes(attr.id) ? '#4dabf750' : '#1e1e1e',
                                  border: `1px solid ${selectedAttributes.includes(attr.id) ? '#4dabf7' : '#444'}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!selectedAttributes.includes(attr.id)) {
                                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!selectedAttributes.includes(attr.id)) {
                                    e.currentTarget.style.backgroundColor = '#1e1e1e'
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAttributes.includes(attr.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAttributes([...selectedAttributes, attr.id])
                                    } else {
                                      setSelectedAttributes(selectedAttributes.filter(id => id !== attr.id))
                                    }
                                  }}
                                  style={{
                                    marginTop: '2px',
                                    cursor: 'pointer',
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>
                                    {attr.label}
                                  </div>
                                  <div style={{ color: '#888', fontSize: '12px' }}>
                                    {attr.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={handleImprove}
                            disabled={loading || selectedAttributes.length === 0}
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: loading || selectedAttributes.length === 0 ? '#666' : '#51cf66',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: loading || selectedAttributes.length === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!loading && selectedAttributes.length > 0) {
                                e.currentTarget.style.backgroundColor = '#40c057'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading && selectedAttributes.length > 0) {
                                e.currentTarget.style.backgroundColor = '#51cf66'
                              }
                            }}
                          >
                            {loading ? 'Улучшаю...' : '✨ Улучшить архитектуру'}
                          </button>
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '13px' }}>
                              Дополнительные требования (опционально):
                            </label>
                            <textarea
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder="Опишите дополнительные требования к улучшению..."
                              style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '12px',
                                backgroundColor: '#1e1e1e',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                              }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>
                          Создать новую архитектуру:
                        </h3>
                        <textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Опишите архитектуру, которую нужно создать..."
                          style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '12px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            marginBottom: '12px',
                          }}
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={loading || !inputValue.trim()}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading || !inputValue.trim() ? '#666' : '#4dabf7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        >
                          {loading ? 'Генерирую...' : '🚀 Сгенерировать архитектуру'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {mode === 'learning' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!currentCase ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px dashed #444' }}>
                        <GraduationCap size={48} color="#4dabf7" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Архитектурный тренажер</h3>
                        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                          Выберите уровень сложности и получите бизнес-кейс. Спроектируйте архитектуру и узнайте оценку эксперта.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          {(['beginner', 'intermediate', 'advanced', 'god'] as const).map((diff) => (
                            <button
                              key={diff}
                              onClick={() => handleStartLearning(diff)}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: diff === 'god' ? '#ae3ec920' : '#4dabf720',
                                color: diff === 'god' ? '#ae3ec9' : '#4dabf7',
                                border: `1px solid ${diff === 'god' ? '#ae3ec9' : '#4dabf7'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = diff === 'god' ? '#ae3ec940' : '#4dabf740';
                                if (diff === 'god') e.currentTarget.style.boxShadow = '0 0 15px rgba(174, 62, 201, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = diff === 'god' ? '#ae3ec920' : '#4dabf720';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {diff === 'god' && <Sparkles size={14} />}
                              {diff === 'beginner' ? 'Начальный' : diff === 'intermediate' ? 'Средний' : diff === 'advanced' ? 'Продвинутый' : 'Бог архитектуры'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #4dabf740' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{currentCase.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: currentCase.difficulty === 'god' ? '#ae3ec920' : '#4dabf720',
                                color: currentCase.difficulty === 'god' ? '#ae3ec9' : '#4dabf7',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                border: currentCase.difficulty === 'god' ? '1px solid #ae3ec940' : 'none'
                              }}>
                                {currentCase.difficulty === 'god' ? 'БОГ АРХИТЕКТУРЫ' : currentCase.difficulty.toUpperCase()}
                              </span>
                              <button
                                onClick={() => {
                                  setCurrentCase(null)
                                  setEvaluation(null)
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #666',
                                  color: '#888',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <RefreshCcw size={12} />
                                Сменить кейс
                              </button>
                            </div>
                          </div>
                          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>{currentCase.description}</p>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                              <div>
                                <h4 style={{ color: '#4dabf7', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Требования:</h4>
                                <ul style={{ paddingLeft: '18px', color: '#aaa', fontSize: '12px', margin: 0 }}>
                                  {(currentCase.businessRequirements || []).map((req, i) => <li key={i}>{typeof req === 'string' ? req : JSON.stringify(req)}</li>)}
                                </ul>
                              </div>
                              <div>
                                <h4 style={{ color: '#51cf66', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Качества:</h4>
                                <ul style={{ paddingLeft: '18px', color: '#aaa', fontSize: '12px', margin: 0 }}>
                                  {(currentCase.qualityAttributes || []).map((attr, i) => <li key={i}>{typeof attr === 'string' ? attr : JSON.stringify(attr)}</li>)}
                                </ul>
                              </div>
                            </div>

                            {currentCase.expectedComponents && currentCase.expectedComponents.length > 0 && (
                              <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                                <h4 style={{ color: '#fcc419', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Рекомендуемые компоненты:</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {currentCase.expectedComponents.map((comp, i) => (
                                    <span key={i} style={{ padding: '4px 8px', backgroundColor: '#fcc41915', color: '#fcc419', borderRadius: '4px', fontSize: '11px', border: '1px solid #fcc41930' }}>
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>


                          {!evaluation ? (
                            <button
                              onClick={handleCheckSolution}
                              disabled={loading || (nodes.length === 0)}
                              style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: nodes.length === 0 ? '#444' : (currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66'),
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: (loading || nodes.length === 0) ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s',
                                boxShadow: currentCase.difficulty === 'god' && nodes.length > 0 ? '0 4px 15px rgba(174, 62, 201, 0.3)' : 'none'
                              }}
                            >
                              {loading ? <Loader2 className="animate-spin" /> : (currentCase.difficulty === 'god' ? <Sparkles size={20} /> : <GraduationCap size={20} />)}
                              {currentCase.difficulty === 'god' ? 'Получить божественную оценку' : 'Проверить решение'}
                            </button>
                          ) : (
                            <div style={{ padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '12px', border: `2px solid ${currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66'}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '30px',
                                    border: `4px solid ${currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66'
                                  }}>
                                    {evaluation.score}
                                  </div>
                                  <h3 style={{ color: '#fff', margin: 0 }}>Оценка эксперта</h3>
                                </div>
                                <button
                                  onClick={() => {
                                    setEvaluation(null)
                                    setCurrentCase(null)
                                  }}
                                  style={{ background: 'transparent', border: '1px solid #666', color: '#888', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  Новая задача
                                </button>
                              </div>

                              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <button
                                  onClick={() => setEvaluation(null)}
                                  style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#4dabf7',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontWeight: '600'
                                  }}
                                >
                                  <RefreshCcw size={16} />
                                  Исправить и проверить снова
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                  <p style={{ color: '#eee', fontSize: '15px', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>{currentCase.difficulty === 'god' ? '🌟 ' : ''}"{evaluation.summary}"</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                  <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', border: `1px solid ${currentCase.difficulty === 'god' ? '#ae3ec940' : '#51cf6620'}` }}>
                                    <h4 style={{ color: currentCase.difficulty === 'god' ? '#ae3ec9' : '#51cf66', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                      <CheckCircle2 size={18} /> {currentCase.difficulty === 'god' ? 'Божественные решения' : 'Плюсы'}
                                    </h4>
                                    <ul style={{ paddingLeft: '20px', color: '#ccc', fontSize: '13px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {(evaluation.correctDecisions || []).map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                  </div>

                                  <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', border: '1px solid #ff922b20' }}>
                                    <h4 style={{ color: '#ff922b', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                      <AlertCircle size={18} /> Ошибки и пропуски
                                    </h4>
                                    <ul style={{ paddingLeft: '20px', color: '#ccc', fontSize: '13px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {(evaluation.missedRequirements || []).map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                  </div>

                                  <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', border: '1px solid #4dabf720' }}>
                                    <h4 style={{ color: '#4dabf7', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                      <RefreshCcw size={16} /> Рекомендации эксперта
                                    </h4>
                                    <ul style={{ paddingLeft: '20px', color: '#ccc', fontSize: '13px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {(evaluation.optimizationSuggestions || []).map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              {chatMessages.length > 0 && (
                                <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
                                  <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px' }}>Обсуждение с наставником:</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {chatMessages.map((msg, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          padding: '12px',
                                          backgroundColor: msg.role === 'user' ? '#1e1e1e' : '#2d2d2d',
                                          borderRadius: '8px',
                                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                          maxWidth: '80%',
                                          border: msg.role === 'user' ? '1px solid #444' : `1px solid ${currentCase?.difficulty === 'god' ? '#ae3ec940' : '#4dabf740'}`
                                        }}
                                      >
                                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                                          {msg.role === 'user' ? 'Вы' : 'AI Наставник'}
                                        </div>
                                        <div style={{ color: '#fff', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{msg.content}</div>
                                      </div>
                                    ))}
                                    {loading && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4dabf7' }}>
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span>Наставник печатает...</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}
