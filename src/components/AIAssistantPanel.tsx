import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Sparkles, Loader2, Send, FileText, HelpCircle, Copy, Minimize2, Maximize2, RefreshCcw, MessageSquare, GraduationCap, CheckCircle2, AlertCircle, Save, FolderOpen, History, TrendingUp } from 'lucide-react'
import {
  initializeGemini,
  isGeminiInitialized,
  generateArchitectureFromDescription,
  generateImprovementRecommendations,
  explainArchitectureDecision,
  AIGeneratedArchitecture,
  generateArchitectureCase,
  evaluateArchitectureSolution,
  architectureToText,
} from '../utils/geminiService'
import {
  ArchitectureCase,
  ArchitectureEvaluation,
  LearningProject,
  LearningHistoryItem,
  ComponentData,
  ComponentType,
  ConnectionType,
  RoadmapStep as RoadmapStepType
} from '../types'
import { Node, Edge } from 'reactflow'
import {
  saveLearningProject,
  loadLearningProject
} from '../utils/fileUtils'

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
  onGenerateArchitecture?: () => void
  onLoadProject?: (nodes: Node[], edges: Edge[]) => void
}

type AssistantMode = 'chat' | 'generate' | 'learning'

export default function AIAssistantPanel({
  nodes,
  edges,
  onClose,
  onLoadProject
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
  const [mode, setMode] = useState<AssistantMode>(() => {
    try {
      return (localStorage.getItem('assistant-mode') as AssistantMode) || 'generate'
    } catch (e) {
      return 'generate'
    }
  })
  const [loading, setLoading] = useState(false)
  const [loadingCase, setLoadingCase] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [improvementRecommendations, setImprovementRecommendations] = useState<string>(() => {
    try {
      return localStorage.getItem('assistant-recommendations') || ''
    } catch (e) {
      return ''
    }
  })

  // Состояние для обучения (learning)
  const [currentCase, setCurrentCase] = useState<ArchitectureCase | null>(null)
  const [evaluation, setEvaluation] = useState<ArchitectureEvaluation | null>(null)
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('assistant-learning-history')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'god'>(() => {
    try {
      return (localStorage.getItem('assistant-difficulty') as any) || 'beginner'
    } catch (e) {
      return 'beginner'
    }
  })
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('assistant-selected-attributes')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })


  // Состояние для перемещения и сворачивания
  const [position, setPosition] = useState({ x: 50, y: 50 }) // в процентах или пикселях
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Функция для прокрутки вниз
  const scrollToBottom = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  // Прокрутка при изменении сообщений в чате или кейса
  useEffect(() => {
    if (mode === 'learning' && currentCase) {
      setTimeout(scrollToBottom, 100)
    }
  }, [chatMessages.length, mode, currentCase, scrollToBottom])

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

  // Эффекты для сохранения состояния в localStorage
  useEffect(() => {
    localStorage.setItem('assistant-mode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('assistant-chat-messages', JSON.stringify(chatMessages))
  }, [chatMessages])

  useEffect(() => {
    localStorage.setItem('assistant-recommendations', improvementRecommendations)
  }, [improvementRecommendations])

  useEffect(() => {
    if (currentCase) {
      localStorage.setItem('assistant-current-case', JSON.stringify(currentCase))
    } else {
      localStorage.removeItem('assistant-current-case')
    }
  }, [currentCase])

  useEffect(() => {
    if (evaluation) {
      localStorage.setItem('assistant-current-evaluation', JSON.stringify(evaluation))
    } else {
      localStorage.removeItem('assistant-current-evaluation')
    }
  }, [evaluation])

  useEffect(() => {
    localStorage.setItem('assistant-learning-history', JSON.stringify(learningHistory))
  }, [learningHistory])

  useEffect(() => {
    localStorage.setItem('assistant-difficulty', difficulty)
  }, [difficulty])

  useEffect(() => {
    localStorage.setItem('assistant-selected-attributes', JSON.stringify(selectedAttributes))
  }, [selectedAttributes])

  const handleClearChat = () => {
    if (window.confirm('Очистить историю чата?')) {
      setChatMessages([])
      localStorage.removeItem('assistant-chat-messages')
    }
  }

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
    { id: 'fault-tolerance', label: 'Отказоустойчивость', description: 'Способность системы продолжать работу при сбоях' },
    { id: 'elasticity', label: 'Эластичность', description: 'Способность автоматически адаптироваться к изменяющейся нагрузке' },
    { id: 'interoperability', label: 'Интероперабельность', description: 'Способность взаимодействовать с другими системами' },
    { id: 'testability', label: 'Тестируемость', description: 'Возможность эффективно тестировать систему' },
    { id: 'portability', label: 'Переносимость', description: 'Способность работать в различных средах' },
    { id: 'observability', label: 'Наблюдаемость', description: 'Возможность понимать внутреннее состояние системы' },
    { id: 'compliance', label: 'Соответствие стандартам', description: 'Соблюдение законодательных и отраслевых требований (GDPR, HIPAA)' },
  ]

  // Helper function to format chat message text (handling bold and lists)
  const formatText = (text: string) => {
    if (!text) return null;

    // 1. Tokenize into logical blocks (paragraphs, list items) to handle soft wraps
    const rawLines = text.split('\n');
    const logicalBlocks: { type: 'list' | 'text' | 'spacer', content: string }[] = [];

    let currentBlock: { type: 'list' | 'text' | 'spacer', content: string } | null = null;
    const listRegex = /^(\* |- |\d+\.\s)/;

    rawLines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentBlock) {
          logicalBlocks.push(currentBlock);
          currentBlock = null;
        }
        logicalBlocks.push({ type: 'spacer', content: '' });
        return;
      }

      const isListStart = listRegex.test(trimmed);

      if (isListStart) {
        if (currentBlock) {
          logicalBlocks.push(currentBlock);
        }
        currentBlock = { type: 'list', content: trimmed };
      } else {
        if (currentBlock && currentBlock.type !== 'spacer') {
          currentBlock.content += ' ' + trimmed;
        } else {
          currentBlock = { type: 'text', content: trimmed };
        }
      }
    });

    if (currentBlock) {
      logicalBlocks.push(currentBlock);
    }

    // 2. Render blocks
    return logicalBlocks.map((block, i) => {
      if (block.type === 'spacer') {
        return <div key={i} style={{ height: '8px' }} />;
      }

      const parts = block.content.split(/(\*\*.*?\*\*)/g);
      const formattedContent = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={index} style={{ color: '#fff', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (block.type === 'list') {
        const isBullet = block.content.startsWith('* ') || block.content.startsWith('- ');
        let displayContent = formattedContent;

        if (isBullet) {
          const firstPart = parts[0];
          if (firstPart && !firstPart.startsWith('**')) {
            const stripped = firstPart.substring(2);
            displayContent = [stripped, ...formattedContent.slice(1)];
          }

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
              <span style={{ color: '#4dabf7', lineHeight: '1.5', fontSize: '14px' }}>•</span>
              <span style={{ flex: 1, lineHeight: '1.5' }}>{displayContent}</span>
            </div>
          );
        }
        return (
          <div key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{formattedContent}</div>
        );
      }

      return <div key={i} style={{ marginBottom: '4px', lineHeight: '1.4' }}>{formattedContent}</div>;
    });
  };

  // Main function to parse structured content (<BLOCK:TYPE>...</BLOCK:TYPE>)
  const renderStructuredContent = (content: string) => {
    if (!content) return null;

    const blocks: { type: string, content: string }[] = [];
    const regex = /<BLOCK:(ANSWER|RECOMMENDATIONS|ISSUES)>([\s\S]*?)<\/BLOCK:\1>/g;
    let match;
    let lastIndex = 0;
    let foundBlocks = false;

    while ((match = regex.exec(content)) !== null) {
      foundBlocks = true;
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index).trim();
        if (text) blocks.push({ type: 'TEXT', content: text });
      }
      blocks.push({ type: match[1], content: match[2].trim() });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      const text = content.substring(lastIndex).trim();
      if (text) blocks.push({ type: 'TEXT', content: text });
    }

    if (!foundBlocks) {
      return <div style={{ color: '#eee', fontSize: '14px' }}>{formatText(content)}</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {blocks.map((block, i) => {
          if (block.type === 'TEXT') {
            return <div key={i} style={{ color: '#eee', fontSize: '14px' }}>{formatText(block.content)}</div>;
          }

          let style = {};
          let title = '';

          if (block.type === 'ANSWER') {
            style = { borderLeft: '3px solid #4dabf7', paddingLeft: '10px' };
            title = 'Ответ';
          } else if (block.type === 'RECOMMENDATIONS') {
            style = { backgroundColor: '#51cf6615', border: '1px solid #51cf6640', borderRadius: '6px', padding: '10px' };
            title = '💡 Рекомендации';
          } else if (block.type === 'ISSUES') {
            style = { backgroundColor: '#ff6b6b15', border: '1px solid #ff6b6b40', borderRadius: '6px', padding: '10px' };
            title = '⚠️ Замечания / Ошибки';
          }

          return (
            <div key={i} style={style}>
              {title && <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.8 }}>{title}</div>}
              <div style={{ color: '#eee', fontSize: '14px' }}>{formatText(block.content)}</div>
            </div>
          );
        })}
      </div>
    );
  };

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

  // ... (keeping other handlers same until render) ...



  // ... skip to render ...

  // Inside render function, specifically Improvement section:
  /*
                {mode === 'generate' && improvementRecommendations && (
                  <div style={{ padding: '16px', backgroundColor: '#1e1e1e', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    
                    // ... buttons ...
                    
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
                      // Removed whiteSpace and lineHeight as they are now handled by renderStructuredContent
                      position: 'relative',
                      transition: 'color 0.3s',
                    }}>
                      {loading && (
                        <div style={{
                           // ... loader ...
                        }}>
                           // ...
                        </div>
                      )}
                      
                      {renderStructuredContent(improvementRecommendations)}
                      
                    </div>
                // ...
  */

  // Inside chat render:
  /*
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} ...>
                           ...
                           {renderStructuredContent(msg.content)}
                        </div>
                      ))}
  */


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
      let contextPrompt = userMessage // Simplified

      if (mode === 'learning' && currentCase) {
        contextPrompt = `
          Ты — Архитектурный Наставник и Строгий Коуч (Principal Architect).
          Контекст: Режим обучения "Архитектурный тренажер".
          
          ЗАДАЧА: ${currentCase.title}
          Описание: ${currentCase.description}
          Бизнес-требования: ${currentCase.businessRequirements.join(', ')}
          Атрибуты качества: ${currentCase.qualityAttributes.join(', ')}
          
          ${evaluation ? `
          ТЕКУЩАЯ ОЦЕНКА ЭКСПЕРТА: ${evaluation.score}/100.
          ВЕРДИКТ ЭКСПЕРТА: ${evaluation.summary}
          ЧТО ПРОПУЩЕНО: ${evaluation.missedRequirements.join('; ')}
          ШАГИ ДО 100%: ${evaluation.roadmapTo100.map(r => r.description).join('; ')}
          ` : 'Решение еще не проверялось экспертом. Будь строг!'}
          
          ИНСТРУКЦИЯ (СТРОГО):
          1. Твоя цель — довести архитектуру до 100% соответствия КЕЙСУ. 
          2. ЕСЛИ ЕСТЬ ЧТО ПРОПУЩЕНО, ТЫ ДОЛЖЕН ПЕРВООЧЕРЕДНО СООБЩИТЬ ОБ ЭТОМ.
          3. НЕ ГОВОРИ "ГОТОВО", если оценка меньше 100% или есть missedRequirements.
          4. Проверь соответствие ВСЕМ бизнес-требованиям. Если чего-то не хватает — скажи об этом.
          5. В ответе всегда указывай: "Добавь компонент: 'Имя' (Type: тип)" или "Создай связь: 'Label A' -> 'Label B' (Type: тип)".
          6. Будь краток і пиши відразу по справі.

          Вопрос пользователя: ${userMessage}
        `.trim()
      } else {
        contextPrompt = `
          Ты — Архитектурный Эксперт. 
          
          ИНСТРУКЦИЯ:
          1. ПИШИ СРАЗУ ОТВЕТ. Не повторяй вопрос.
          2. Если на схеме уже есть упоминаемые компоненты, используй их Label.
          3. Якщо потрібно додати компонент, вказуй тип: "Добавь компонент: 'Имя' (Type: тип)".
          4. Якщо потрібно з'єднати: "Создай связь: 'Label A' -> 'Label B' (Type: тип)".

          Вопрос: ${userMessage}
        `.trim()
      }

      const response = await explainArchitectureDecision(contextPrompt, nodes, edges, chatMessages)
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
    const targetDiff = diff || 'beginner'
    setLoadingCase(true)
    setError(null)
    setEvaluation(null)
    try {
      const newCase = await generateArchitectureCase(targetDiff)
      setCurrentCase(newCase)

      // Добавляем приветственное сообщение от наставника
      const welcomeMessage = `Я подготовил для вас кейс: "${newCase.title}". 
      
Ознакомьтесь с описанием требований и атрибутов качества выше. Я готов ответить на любые ваши уточняющие вопросы по заданию или помочь с выбором архитектурных решений. 

Когда будете готовы, вы сможете запросить оценку вашей работы нажав кнопку "Проверить решение". Удачи!`

      setChatMessages([{ role: 'assistant', content: welcomeMessage }])
      setMode('learning')

      // Очищаем предыдущий ввод
      setInputValue('')

    } catch (err: any) {
      setError(err.message || 'Ошибка при генерации кейса')
    } finally {
      setLoadingCase(false)
    }
  }

  const handleCheckSolution = async () => {
    if (!currentCase) return
    setLoading(true)
    setError(null)
    try {
      const result = await evaluateArchitectureSolution(nodes, edges, currentCase)
      setEvaluation(result)

      // Add to history
      const historyItem: LearningHistoryItem = {
        timestamp: Date.now(),
        score: result.score,
        summary: result.summary,
        correctDecisions: result.correctDecisions,
        missedRequirements: result.missedRequirements,
        optimizationSuggestions: result.optimizationSuggestions
      }
      setLearningHistory(prev => [...prev, historyItem])

    } catch (err: any) {
      setError(err.message || 'Ошибка при оценке решения')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProject = async () => {
    if (!currentCase) return

    // Create current history item if we have an evaluation but haven't saved it to history yet
    // Actually handleCheckSolution already saves to history.
    // So we just take current state.

    const project: LearningProject = {
      id: crypto.randomUUID(),
      version: '1.0',
      lastModified: Date.now(),
      case: currentCase,
      nodes,
      edges,
      chatMessages,
      history: learningHistory,
      currentEvaluation: evaluation
    }

    await saveLearningProject(project)
  }

  const handleLoadProject = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const project = await loadLearningProject(file)

          // Restore state
          setCurrentCase(project.case)
          setChatMessages(project.chatMessages || [])
          setLearningHistory(project.history || [])
          setEvaluation(project.currentEvaluation)

          // Restore diagram
          if (onLoadProject) {
            onLoadProject(project.nodes, project.edges)
          }

          setMode('learning')
        } catch (err: any) {
          setError('Ошибка при загрузке проекта: ' + err.message)
        }
      }
      input.click()
    } catch (err) {
      console.error(err)
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
          transition: isDragging ? 'none' : 'width 0.3s, max-width 0.3s, height 0.3s, padding 0.3s',
          overflow: 'hidden',
        }}
      >
        <ErrorBoundary>
          <div
            onMouseDown={handleMouseDown}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMinimized ? 0 : '20px',
              cursor: isDragging ? 'grabbing' : 'grab',
              padding: '4px 0',
              userSelect: 'none'
            }}
          >
            <h2 style={{ fontSize: isMinimized ? '14px' : '20px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
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
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflowY: 'auto',
                paddingRight: '10px',
                // Кастомный скроллбар
                scrollbarWidth: 'thin',
                scrollbarColor: '#4dabf7 #252525'
              }}
            >
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100%' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
                        {chatMessages.length === 0 && (
                          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                            <MessageSquare size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>Начните диалог с AI ассистентом...</p>
                          </div>
                        )}

                        {!loading && chatMessages.length > 0 && (
                          <div style={{ alignSelf: 'center', marginBottom: '10px' }}>
                            <button
                              onClick={handleClearChat}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: 'transparent',
                                color: '#888',
                                border: '1px solid #444',
                                borderRadius: '12px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ff6b6b'
                                e.currentTarget.style.borderColor = '#ff6b6b'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#888'
                                e.currentTarget.style.borderColor = '#444'
                              }}
                            >
                              <RefreshCcw size={12} />
                              Очистить чат
                            </button>
                          </div>
                        )}

                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: msg.role === 'user' ? '#2d2d2d' : '#1e1e1e',
                              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                              maxWidth: '85%',
                              border: msg.role === 'user' ? '1px solid #444' : '1px solid #4dabf730',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              userSelect: 'text',
                              cursor: 'auto',
                            }}
                          >
                            <div style={{ fontSize: '11px', color: msg.role === 'user' ? '#888' : '#4dabf7', marginBottom: '4px', fontWeight: 'bold' }}>
                              {msg.role === 'user' ? 'ВЫ' : 'AI ASSISTANT'}
                            </div>
                            {renderStructuredContent(msg.content)}
                          </div>
                        ))}

                        {loading && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', padding: '10px' }}>
                            <Loader2 size={18} className="animate-spin" color="#4dabf7" />
                            <span style={{ fontSize: '13px' }}>AI печатает...</span>
                          </div>
                        )}
                      </div>

                      <div style={{
                        position: 'sticky',
                        bottom: '-20px', // Compensate parent padding 
                        margin: '0 -20px -20px -20px', // Stretch to edges
                        padding: '16px',
                        backgroundColor: '#252525',
                        borderTop: '1px solid #333',
                        zIndex: 10
                      }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleChat();
                              }
                            }}
                            placeholder="Ваш вопрос об архитектуре..."
                            style={{
                              flex: 1,
                              padding: '12px',
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #444',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '14px',
                              resize: 'none',
                              minHeight: '46px',
                              maxHeight: '120px',
                              fontFamily: 'inherit',
                              lineHeight: '1.4',
                            }}
                          />
                          <button
                            onClick={handleChat}
                            disabled={loading || !inputValue.trim()}
                            style={{
                              width: '46px',
                              height: '46px',
                              backgroundColor: loading || !inputValue.trim() ? '#333' : '#4dabf7',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                          >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '6px', textAlign: 'center' }}>
                          Shift+Enter для новой строки • Enter для отправки
                        </div>
                      </div>
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
                        // whiteSpace and lineHeight handled by renderStructuredContent
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
                        {renderStructuredContent(improvementRecommendations)}
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
                          {loadingCase ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
                              <Loader2 size={48} className="animate-spin" color="#4dabf7" />
                              <div>
                                <h3 style={{ color: '#fff', marginBottom: '8px' }}>Генерация кейса...</h3>
                                <p style={{ color: '#888', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                                  ИИ придумывает интересную задачу для вашего уровня. Это может занять несколько секунд.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
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
                                    disabled={loadingCase}
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

                              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  onClick={handleLoadProject}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    color: '#aaa',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}
                                >
                                  <FolderOpen size={16} />
                                  Загрузить сохраненный проект
                                </button>
                              </div>
                            </>
                          )}
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
                                  title="Сбросить и выбрать новый кейс"
                                >
                                  <RefreshCcw size={12} />
                                  Новый
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

                                    {evaluation.roadmapTo100 && evaluation.roadmapTo100.length > 0 && (
                                      <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', border: '1px solid #51cf66', boxShadow: '0 0 10px rgba(81, 207, 102, 0.2)' }}>
                                        <h4 style={{ color: '#51cf66', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                          <TrendingUp size={18} /> Путь к 100% (Roadmap)
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {evaluation.roadmapTo100.map((step: any, i) => (
                                            <div key={i} style={{ borderLeft: '2px solid #51cf66', paddingLeft: '15px', paddingBottom: '5px' }}>
                                              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px', fontSize: '14px' }}>
                                                {i + 1}. {step.title}
                                              </div>
                                              <div style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.4', marginBottom: '8px' }}>
                                                {step.description}
                                              </div>

                                              {((step.componentsToAdd && step.componentsToAdd.length > 0) || (step.connectionsToAdd && step.connectionsToAdd.length > 0)) && (
                                                <div style={{ backgroundColor: '#252525', padding: '10px', borderRadius: '6px', fontSize: '12px', marginTop: '8px' }}>
                                                  {step.componentsToAdd && step.componentsToAdd.length > 0 && (
                                                    <div style={{ marginBottom: step.connectionsToAdd && step.connectionsToAdd.length > 0 ? '8px' : '0' }}>
                                                      <span style={{ color: '#4dabf7', fontWeight: 'bold' }}>Добавить компоненты:</span>
                                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                                        {step.componentsToAdd.map((c: string, j: number) => (
                                                          <span key={j} style={{ backgroundColor: '#4dabf720', color: '#4dabf7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #4dabf740' }}>
                                                            {c}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                  {step.connectionsToAdd && step.connectionsToAdd.length > 0 && (
                                                    <div>
                                                      <span style={{ color: '#ff922b', fontWeight: 'bold' }}>Связать:</span>
                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                                        {step.connectionsToAdd.map((conn: any, j: number) => (
                                                          <div key={j} style={{ color: '#eee', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ color: '#fff' }}>{conn.from}</span>
                                                            <span style={{ color: '#888' }}>→</span>
                                                            <span style={{ color: '#fff' }}>{conn.to}</span>
                                                            <span style={{ color: '#888', fontSize: '11px' }}>({conn.type})</span>
                                                            {conn.description && <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: '11px' }}>— {conn.description}</span>}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Обсуждение с наставником (всегда доступно) */}
                            <div style={{ marginTop: evaluation ? '20px' : '0', borderTop: evaluation ? '1px solid #444' : 'none', paddingTop: evaluation ? '20px' : '0' }}>
                              {chatMessages.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
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
                                        {renderStructuredContent(msg.content)}
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

                              <div style={{
                                marginTop: '24px',
                                padding: '16px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '12px',
                                border: '1px solid #333'
                              }}>
                                <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '14px' }}>Остались вопросы или я что-то пропустил?</h4>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                  <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleChat();
                                      }
                                    }}
                                    placeholder="Напишите наставнику..."
                                    style={{
                                      flex: 1,
                                      padding: '12px',
                                      backgroundColor: '#252525',
                                      border: '1px solid #444',
                                      borderRadius: '8px',
                                      color: '#fff',
                                      fontSize: '13px',
                                      resize: 'none',
                                      minHeight: '40px',
                                      maxHeight: '100px',
                                      fontFamily: 'inherit',
                                      lineHeight: '1.4',
                                    }}
                                  />
                                  <button
                                    onClick={handleChat}
                                    disabled={loading || !inputValue.trim()}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      backgroundColor: loading || !inputValue.trim() ? '#333' : '#4dabf7',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                              <button
                                onClick={handleSaveProject}
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  backgroundColor: 'transparent',
                                  color: '#aaa',
                                  border: '1px solid #444',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2d2d2d'
                                  e.currentTarget.style.borderColor = '#666'
                                  e.currentTarget.style.color = '#fff'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.borderColor = '#444'
                                  e.currentTarget.style.color = '#aaa'
                                }}
                              >
                                <Save size={16} />
                                Сохранить проект
                              </button>
                              <p style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                Сохранится всё: задание, схема, чат и оценки. Можно продолжить позже.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}
