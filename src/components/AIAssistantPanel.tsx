import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Sparkles, Loader2, Send, FileText, HelpCircle, Copy, Minimize2, Maximize2, RefreshCcw, MessageSquare, GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Code, List, Cloud, Database, ChevronDown, ChevronUp } from 'lucide-react'
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
  onGenerateArchitecture?: () => void
}

type AssistantMode = 'chat' | 'generate' | 'learning'
export default function AIAssistantPanel({
  nodes,
  edges,
  onClose,
}: AIAssistantPanelProps) {
  const [selectedPattern, setSelectedPattern] = useState<any>(null)
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
  const [loadingCase, setLoadingCase] = useState(false)
  const [caseType, setCaseType] = useState<'solution' | 'infrastructure' | 'data'>('solution')
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [improvementRecommendations, setImprovementRecommendations] = useState<string>('')

  // Состояние для обучения (learning)
  const [currentCase, setCurrentCase] = useState<ArchitectureCase | null>(null)
  const [evaluation, setEvaluation] = useState<ArchitectureEvaluation | null>(null)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'god'>('beginner')
  const [userSelectedQualityAttributes, setUserSelectedQualityAttributes] = useState<string[]>([])
  const [showCorrectAttributes, setShowCorrectAttributes] = useState(false)

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
    { id: 'fault-tolerance', label: 'Отказоустойчивость', description: 'Способность системы продолжать работу при сбоях' },
    { id: 'elasticity', label: 'Эластичность', description: 'Способность автоматически адаптироваться к изменяющейся нагрузке' },
    { id: 'interoperability', label: 'Интероперабельность', description: 'Способность взаимодействовать с другими системами' },
    { id: 'testability', label: 'Тестируемость', description: 'Возможность эффективно тестировать систему' },
    { id: 'portability', label: 'Переносимость', description: 'Способность работать в различных средах' },
    { id: 'observability', label: 'Наблюдаемость', description: 'Возможность понимать внутреннее состояние системы' },
    { id: 'compliance', label: 'Соответствие стандартам', description: 'Соблюдение законодательных и отраслевых требований (GDPR, HIPAA)' },
  ]

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  // Helper function to render structured content blocks
  const renderStructuredContent = (content: string) => {
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

    const formatText = (text: string) => {
      // 1. Tokenize into logical blocks (paragraphs, list items) to handle soft wraps
      const rawLines = text.split('\n');
      const logicalBlocks: { type: 'list' | 'text' | 'spacer', content: string }[] = [];

      let currentBlock: { type: 'list' | 'text' | 'spacer', content: string } | null = null;

      const listRegex = /^(\* |- |\d+\.\s)/;

      rawLines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          // Empty line -> finalize current block and add spacer
          if (currentBlock) {
            logicalBlocks.push(currentBlock);
            currentBlock = null;
          }
          logicalBlocks.push({ type: 'spacer', content: '' });
          return;
        }

        const isListStart = listRegex.test(trimmed);

        if (isListStart) {
          // New list item -> finalize current block and start new list block
          if (currentBlock) {
            logicalBlocks.push(currentBlock);
          }
          currentBlock = { type: 'list', content: trimmed };
        } else {
          // Continuation of previous block or new paragraph
          if (currentBlock && currentBlock.type !== 'spacer') {
            // Append to current block (soft wrap), treating newline as space
            currentBlock.content += ' ' + trimmed;
          } else {
            // New text paragraph
            currentBlock = { type: 'text', content: trimmed };
          }
        }
      });

      // Push remaining block
      if (currentBlock) {
        logicalBlocks.push(currentBlock);
      }

      // 2. Render blocks
      return logicalBlocks.map((block, i) => {
        if (block.type === 'spacer') {
          return <div key={i} style={{ height: '8px' }} />;
        }

        // Parse bold **text** within the full block content
        // We capture both **text** and strict *text* if needed, but current focus is **
        const parts = block.content.split(/(\*\*.*?\*\*)/g);
        const formattedContent = parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return <strong key={index} style={{ color: '#fff', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (block.type === 'list') {
          // Determine list style
          const isBullet = block.content.startsWith('* ') || block.content.startsWith('- ');
          let displayContent = formattedContent;

          // Remove the marker from display content if we use custom bullet
          // Note: formattedContent is an array of strings/elements. We need to strip marker from the first element if it's a string.
          if (isBullet) {
            const firstPart = parts[0];
            // If first part is the marker text
            if (firstPart && !firstPart.startsWith('**')) {
              // It's plain text, strip the first 2 chars (* )
              const stripped = firstPart.substring(2);
              // Reconstruct formatted content array
              displayContent = [stripped, ...formattedContent.slice(1)];
            }

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
                <span style={{ color: '#4dabf7', lineHeight: '1.5', fontSize: '14px' }}>•</span>
                <span style={{ flex: 1, lineHeight: '1.5' }}>{displayContent}</span>
              </div>
            );
          }

          // For numbered lists, we keep the number but maybe style it?
          // Current request didn't ask for stylized numbers, just cleaning up *
          return (
            <div key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{formattedContent}</div>
          );
        }

        return <div key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{formattedContent}</div>;
      });
    };

    if (!foundBlocks) {
      return <div style={{ color: '#eee', fontSize: '14px' }}>{formatText(content)}</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {blocks.map((block, i) => {
          if (block.type === 'TEXT') return <div key={i} style={{ color: '#eee', fontSize: '14px' }}>{formatText(block.content)}</div>;

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

  const handleStartLearning = async (diff?: 'beginner' | 'intermediate' | 'advanced' | 'god', type: 'solution' | 'infrastructure' | 'data' = caseType) => {
    const targetDiff = diff || 'beginner'
    setLoadingCase(true)
    setError(null)
    setEvaluation(null)
    setUserSelectedQualityAttributes([]) // Сбрасываем выбор пользователя
    setShowCorrectAttributes(false) // Скрываем правильные атрибуты
    try {
      const newCase = await generateArchitectureCase(targetDiff, type)
      setCurrentCase(newCase)
      setMode('learning')
    } catch (err: any) {
      console.error('Ошибка при генерации кейса:', err);
      const errorMessage = err?.message || 'Не удалось сгенерировать кейс. Попробуйте еще раз.';
      setError(errorMessage);
    } finally {
      setLoadingCase(false);
    }
  };

  const handleDownloadCase = () => {
    if (!currentCase) return

    const mdContent = `
# ${currentCase.title}

**Сложность:** ${currentCase.difficulty.toUpperCase()}
**ID:** ${currentCase.id}

## Описание
${currentCase.description}

## Бизнес-требования
${currentCase.businessRequirements.map(req => `- ${req}`).join('\n')}

## Атрибуты качества
${currentCase.qualityAttributes.map(attr => `- ${attr}`).join('\n')}

## Рекомендуемые компоненты
${(currentCase.expectedComponents || []).map(comp => {
      if (typeof comp === 'string') return `- ${comp}`
      return `### ${comp.name} (${comp.type})
${comp.description}
*Связи:* ${comp.connections || 'Нет'}`
    }).join('\n\n')}

## Рекомендуемые паттерны
${(currentCase.suitablePatterns || []).map(group => `### ${group.category}
${group.patterns.map(p => `#### ${p.name}
${p.description}
**Как реализовать:**
${p.implementation || '-'}
**Benefits:**
${p.benefits || '-'}`).join('\n')}`).join('\n\n')}

## Рекомендуемые тактики
${(currentCase.recommendedTactics || []).map(group => `### ${group.attribute}
${group.tactics.map(t => `#### ${t.title}
${t.instruction}`).join('\n')}`).join('\n\n')}
`

    const blob = new Blob([mdContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `case_${currentCase.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                  Оцінити архітектуру
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

                      {chatMessages.map((msg, idx) => {
                        // Функция для парсинга структурированного ответа
                        const renderContent = (content: string) => {
                          const blocks: { type: string, content: string }[] = [];
                          const regex = /<BLOCK:(ANSWER|RECOMMENDATIONS|ISSUES)>([\s\S]*?)<\/BLOCK:\1>/g;
                          let match;
                          let lastIndex = 0;
                          let foundBlocks = false;

                          while ((match = regex.exec(content)) !== null) {
                            foundBlocks = true;
                            // Добавляем текст между блоками (если есть)
                            if (match.index > lastIndex) {
                              const text = content.substring(lastIndex, match.index).trim();
                              if (text) blocks.push({ type: 'TEXT', content: text });
                            }
                            blocks.push({ type: match[1], content: match[2].trim() });
                            lastIndex = regex.lastIndex;
                          }

                          // Добавляем остаток текста
                          if (lastIndex < content.length) {
                            const text = content.substring(lastIndex).trim();
                            if (text) blocks.push({ type: 'TEXT', content: text });
                          }

                          if (!foundBlocks) {
                            return <div style={{ color: '#eee', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '14px' }}>{content}</div>;
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {blocks.map((block, i) => {
                                if (block.type === 'TEXT') return <div key={i} style={{ color: '#eee', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{block.content}</div>;

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
                                    <div style={{ color: '#eee', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '14px' }}>{block.content}</div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        };

                        return (
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
                            }}
                          >
                            <div style={{ fontSize: '11px', color: msg.role === 'user' ? '#888' : '#4dabf7', marginBottom: '4px', fontWeight: 'bold' }}>
                              {msg.role === 'user' ? 'ВЫ' : 'AI ASSISTANT'}
                            </div>
                            {renderContent(msg.content)}
                          </div>
                        )
                      })}

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
                      <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px dashed #444' }}>
                        <FileText size={48} color="#888" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Нет архитектуры для оценки</h3>
                        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '0', maxWidth: '400px', margin: '0 auto' }}>
                          Добавьте компоненты на рабочую область, чтобы AI мог проанализировать и оценить вашу архитектуру.
                        </p>
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
                            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
                              Выберите тип кейса и уровень сложности. Спроектируйте решение и получите оценку эксперта.
                            </p>

                            {/* Case Type Selector */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', backgroundColor: '#1e1e1e', padding: '4px', borderRadius: '8px', width: 'fit-content', margin: '0 auto 24px' }}>
                              <button
                                onClick={() => setCaseType('solution')}
                                style={{
                                  padding: '6px 16px',
                                  backgroundColor: caseType === 'solution' ? '#4dabf7' : 'transparent',
                                  color: caseType === 'solution' ? 'white' : '#888',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s',
                                }}
                              >
                                Solution Architecture
                              </button>
                              <button
                                onClick={() => setCaseType('infrastructure')}
                                style={{
                                  padding: '6px 16px',
                                  backgroundColor: caseType === 'infrastructure' ? '#ae3ec9' : 'transparent',
                                  color: caseType === 'infrastructure' ? 'white' : '#888',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Cloud size={14} />
                                Infrastructure
                              </button>
                              <button
                                onClick={() => setCaseType('data')}
                                style={{
                                  padding: '6px 16px',
                                  backgroundColor: caseType === 'data' ? '#12b886' : 'transparent',
                                  color: caseType === 'data' ? 'white' : '#888',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Database size={14} />
                                Data Architecture
                              </button>
                            </div>

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
                                  {diff === 'beginner' ? 'Начальный' : diff === 'intermediate' ? 'Средний' : diff === 'advanced' ? 'Продвинутый' : 'Бог'}
                                </button>
                              ))}
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
                                onClick={handleDownloadCase}
                                title="Скачать кейс"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #4dabf7',
                                  color: '#4dabf7',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <ArrowRight size={12} style={{ transform: 'rotate(90deg)' }} />
                                Скачать
                              </button>
                              <button
                                onClick={() => {
                                  if (currentCase) {
                                    setCurrentCase(null)
                                    handleStartLearning(currentCase.difficulty, caseType)
                                  }
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
                                title="Сгенерировать новый кейс этого же уровня"
                              >
                                <RefreshCcw size={12} />
                                Сменить кейс
                              </button>
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
                                title="Вернуться к выбору уровня сложности"
                              >
                                <List size={12} />
                                Меню
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
                                {currentCase.hideQualityAttributes && !showCorrectAttributes ? (
                                  <>
                                    <h4 style={{ color: '#51cf66', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Выберите атрибуты качества:</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {qualityAttributes.map((attr) => (
                                        <label
                                          key={attr.id}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 8px',
                                            backgroundColor: userSelectedQualityAttributes.includes(attr.label) ? '#51cf6620' : '#1e1e1e',
                                            border: `1px solid ${userSelectedQualityAttributes.includes(attr.label) ? '#51cf66' : '#333'}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            transition: 'all 0.2s',
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!userSelectedQualityAttributes.includes(attr.label)) {
                                              e.currentTarget.style.backgroundColor = '#2d2d2d'
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!userSelectedQualityAttributes.includes(attr.label)) {
                                              e.currentTarget.style.backgroundColor = '#1e1e1e'
                                            }
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={userSelectedQualityAttributes.includes(attr.label)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setUserSelectedQualityAttributes([...userSelectedQualityAttributes, attr.label])
                                              } else {
                                                setUserSelectedQualityAttributes(userSelectedQualityAttributes.filter(a => a !== attr.label))
                                              }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                          />
                                          <span style={{ color: '#ccc', flex: 1 }}>{attr.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => setShowCorrectAttributes(true)}
                                      disabled={userSelectedQualityAttributes.length === 0}
                                      style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: userSelectedQualityAttributes.length === 0 ? '#666' : '#51cf66',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: userSelectedQualityAttributes.length === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <CheckCircle2 size={14} />
                                      Посмотреть необходимые атрибуты и сравнить
                                    </button>
                                  </>
                                ) : showCorrectAttributes && currentCase.correctQualityAttributes ? (
                                  <>
                                    <h4 style={{ color: '#51cf66', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сравнение атрибутов качества:</h4>

                                    {/* Статистика */}
                                    {(() => {
                                      const correct = currentCase.correctQualityAttributes || []
                                      const selected = userSelectedQualityAttributes
                                      const matches = selected.filter(s => correct.includes(s))
                                      const missed = correct.filter(c => !selected.includes(c))
                                      const extra = selected.filter(s => !correct.includes(s))
                                      const accuracy = correct.length > 0 ? Math.round((matches.length / correct.length) * 100) : 0

                                      return (
                                        <>
                                          <div style={{
                                            padding: '10px',
                                            backgroundColor: '#2d2d2d',
                                            borderRadius: '6px',
                                            marginBottom: '12px',
                                            border: '1px solid #444'
                                          }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <span style={{ color: '#aaa', fontSize: '11px' }}>Точность:</span>
                                              <span style={{
                                                color: accuracy >= 70 ? '#51cf66' : accuracy >= 40 ? '#fcc419' : '#ff6b6b',
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                              }}>
                                                {accuracy}%
                                              </span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#888', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                              <span>✅ Совпадений: {matches.length}</span>
                                              <span>❌ Упущено: {missed.length}</span>
                                              <span>⚠️ Лишних: {extra.length}</span>
                                            </div>
                                          </div>

                                          {/* Правильные атрибуты */}
                                          <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '11px', color: '#51cf66', fontWeight: 'bold', marginBottom: '6px' }}>
                                              ✅ Правильные атрибуты:
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              {correct.map((attr, i) => (
                                                <div
                                                  key={i}
                                                  style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: selected.includes(attr) ? '#51cf6620' : '#ff6b6b20',
                                                    border: `1px solid ${selected.includes(attr) ? '#51cf66' : '#ff6b6b'}`,
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    color: selected.includes(attr) ? '#51cf66' : '#ff6b6b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                  }}
                                                >
                                                  {selected.includes(attr) ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                  {attr}
                                                  {!selected.includes(attr) && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>(упущено)</span>}
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Лишние атрибуты */}
                                          {extra.length > 0 && (
                                            <div>
                                              <div style={{ fontSize: '11px', color: '#fcc419', fontWeight: 'bold', marginBottom: '6px' }}>
                                                ⚠️ Лишние атрибуты:
                                              </div>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {extra.map((attr, i) => (
                                                  <div
                                                    key={i}
                                                    style={{
                                                      padding: '4px 8px',
                                                      backgroundColor: '#fcc41920',
                                                      border: '1px solid #fcc419',
                                                      borderRadius: '4px',
                                                      fontSize: '11px',
                                                      color: '#fcc419',
                                                    }}
                                                  >
                                                    {attr}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <button
                                            onClick={() => {
                                              setShowCorrectAttributes(false)
                                              setUserSelectedQualityAttributes([])
                                            }}
                                            style={{
                                              marginTop: '12px',
                                              width: '100%',
                                              padding: '6px 12px',
                                              backgroundColor: '#666',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              fontSize: '11px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '6px',
                                            }}
                                          >
                                            <RefreshCcw size={12} />
                                            Попробовать снова
                                          </button>
                                        </>
                                      )
                                    })()}
                                  </>
                                ) : (
                                  <>
                                    <h4 style={{ color: '#51cf66', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Качества:</h4>
                                    <ul style={{ paddingLeft: '18px', color: '#aaa', fontSize: '12px', margin: 0 }}>
                                      {(currentCase.qualityAttributes || []).map((attr, i) => <li key={i}>{typeof attr === 'string' ? attr : JSON.stringify(attr)}</li>)}
                                    </ul>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* AI Designed Architecture Toggle - Always Available */}








                          {currentCase.suitablePatterns && currentCase.suitablePatterns.length > 0 && (
                            <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                              <h4 style={{ color: '#ae3ec9', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Рекомендуемые паттерны:</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {currentCase.suitablePatterns.map((group, i) => (
                                  <div key={i}>
                                    <div style={{ color: '#eee', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #333' }}>
                                      {group.category}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {group.patterns && Array.isArray(group.patterns) && group.patterns.map((pattern, j) => (
                                        <div key={j} style={{
                                          backgroundColor: '#ae3ec910',
                                          border: '1px solid #ae3ec930',
                                          borderRadius: '6px',
                                          padding: '10px',
                                          flex: '1 1 calc(50% - 8px)',
                                          minWidth: '200px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s'
                                        }}
                                          onClick={() => setSelectedPattern(pattern)}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ae3ec920';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(174, 62, 201, 0.2)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ae3ec910';
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                          }}
                                        >
                                          <div style={{ color: '#ae3ec9', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {pattern.name}
                                            <ArrowRight size={12} />
                                          </div>
                                          <div style={{ color: '#aaa', fontSize: '11px', lineHeight: '1.3' }}>
                                            {pattern.description}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Modal for Pattern Details */}
                          {selectedPattern && (
                            <div style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              zIndex: 1000,
                              backdropFilter: 'blur(4px)'
                            }}
                              onClick={() => setSelectedPattern(null)}
                            >
                              <div style={{
                                backgroundColor: '#1e1e1e',
                                borderRadius: '12px',
                                border: '1px solid #ae3ec9',
                                width: '90%',
                                maxWidth: '600px',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                padding: '24px',
                                boxShadow: '0 0 30px rgba(174, 62, 201, 0.2)',
                                position: 'relative'
                              }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setSelectedPattern(null)}
                                  style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#888',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={20} />
                                </button>

                                <h3 style={{ color: '#ae3ec9', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                  {selectedPattern.name}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                  <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>Описание</h4>
                                  <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>{selectedPattern.description}</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                  <h4 style={{ color: '#4dabf7', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Code size={16} /> Как реализовать
                                  </h4>
                                  <div style={{ backgroundColor: '#262626', padding: '12px', borderRadius: '8px', border: '1px solid #333', color: '#ddd', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                    {selectedPattern.implementation || 'Информация отсутствует'}
                                  </div>
                                </div>

                                <div>
                                  <h4 style={{ color: '#51cf66', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={16} /> Что дает (Benefits)
                                  </h4>
                                  <div style={{ backgroundColor: '#262626', padding: '12px', borderRadius: '8px', border: '1px solid #333', color: '#ddd', fontSize: '13px', lineHeight: '1.5' }}>
                                    {selectedPattern.benefits || 'Информация отсутствует'}
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}

                          {currentCase.recommendedTactics && currentCase.recommendedTactics.length > 0 && (
                            <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                              <h4 style={{ color: '#4dabf7', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Рекомендуемые тактики:</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {currentCase.recommendedTactics.map((group, groupIdx) => (
                                  <div key={groupIdx}>
                                    <div style={{ color: '#eee', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '4px', height: '12px', backgroundColor: '#4dabf7', borderRadius: '2px' }}></div>
                                      {group.attribute}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {group.tactics && Array.isArray(group.tactics) && group.tactics.map((tactic, tacticIdx) => (
                                        <details
                                          key={tacticIdx}
                                          style={{
                                            backgroundColor: '#262626',
                                            borderRadius: '6px',
                                            border: '1px solid #383838',
                                            overflow: 'hidden'
                                          }}
                                          onToggle={(e) => {
                                            // Optional: close others or animate
                                          }}
                                        >
                                          <summary
                                            style={{
                                              padding: '10px 12px',
                                              cursor: 'pointer',
                                              fontSize: '13px',
                                              color: '#ddd',
                                              fontWeight: '500',
                                              userSelect: 'none',
                                              outline: 'none',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              listStyle: 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                          >
                                            <span style={{ color: '#4dabf7', fontSize: '14px', fontWeight: 'bold' }}>+</span>
                                            {tactic.title}
                                          </summary>
                                          <div style={{
                                            padding: '16px',
                                            borderTop: '1px solid #383838',
                                            backgroundColor: '#1e1e1e',
                                            fontSize: '13px',
                                            color: '#bbb',
                                            // lineHeight and whiteSpace handled by renderStructuredContent
                                          }}>
                                            <div style={{ marginBottom: '8px', color: '#4dabf7', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>Инструкция по внедрению:</div>
                                            {renderStructuredContent(tactic.instruction)}
                                          </div>
                                        </details>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>


                        {/* Check Solution functionality removed as per request */}
                      </div>

                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </ErrorBoundary>
      </div >
    </ErrorBoundary >
  )
}
