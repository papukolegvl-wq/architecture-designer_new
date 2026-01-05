import { GoogleGenerativeAI } from '@google/generative-ai'
import { Node, Edge } from 'reactflow'
import { ComponentData, ComponentType, ConnectionType, ArchitectureCase, ArchitectureEvaluation } from '../types'

// Инициализация Gemini AI
// ВАЖНО: API ключ должен храниться в переменных окружения или настройках приложения
let genAI: GoogleGenerativeAI | null = null
let storedApiKey: string = '' // Сохраняем API ключ отдельно для прямых запросов

export function initializeGemini(apiKey: string) {
  if (!apiKey) {
    console.warn('⚠️ Gemini API ключ не предоставлен')
    return false
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    // Сохраняем API ключ отдельно для прямых запросов к API
    storedApiKey = apiKey
    return true
  } catch (error) {
    console.error('❌ Ошибка инициализации Gemini:', error)
    return false
  }
}

export function isGeminiInitialized(): boolean {
  return genAI !== null
}

// Функция для получения списка доступных моделей
async function getAvailableModelsList(): Promise<string[]> {
  if (!storedApiKey) {
    return []
  }

  try {
    // Используем v1beta, так как новые модели часто появляются там первыми
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${storedApiKey}`
    )

    if (response.ok) {
      const data = await response.json()
      if (data.models && Array.isArray(data.models)) {
        // Фильтруем модели, которые поддерживают generateContent
        const geminiModels = data.models
          .filter((m: any) => {
            const name = m.name?.replace('models/', '') || ''
            const supportsGenerateContent = m.supportedGenerationMethods?.includes('generateContent') || true
            return name.startsWith('gemini') && supportsGenerateContent
          })
          .map((m: any) => m.name?.replace('models/', '') || '')
          .sort()
        console.log('📋 Доступные модели Gemini:', geminiModels)
        return geminiModels
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.warn('Ошибка при получении списка моделей:', errorData)
    }
  } catch (e) {
    console.warn('Не удалось получить список моделей:', e)
  }

  return []
}

// Функция для получения модели с автоматическим fallback
async function getAvailableModel(prompt: string) {
  if (!genAI) {
    throw new Error('Gemini не инициализирован')
  }

  if (!storedApiKey) {
    throw new Error('API ключ не найден. Переинициализируйте Gemini с правильным API ключом.')
  }

  // Сначала получаем список доступных моделей
  const availableModels = await getAvailableModelsList()

  let modelsToTry: { name: string, version: string }[] = []

  // Fallback list (hardcoded) in case discovery fails or returns empty
  const fallbackModels = [
    { name: 'gemini-1.5-flash', version: 'v1beta' },
    { name: 'gemini-1.5-flash', version: 'v1' },
    { name: 'gemini-1.5-pro', version: 'v1beta' },
    { name: 'gemini-1.5-pro', version: 'v1' },
    { name: 'gemini-pro', version: 'v1' },
    { name: 'gemini-2.5-flash-lite', version: 'v1beta' },
    { name: 'gemini-2.0-flash-lite-001', version: 'v1beta' },
  ]

  if (availableModels.length > 0) {
    // Сортировка от "Лучшей" к "Худшей" (по качеству/способностям)
    const sortedModels = availableModels.sort((a, b) => {
      const getScore = (name: string) => {
        let score = 0;
        // 1. Поколение (чем выше, тем лучше)
        if (name.includes('2.5')) score += 300;
        else if (name.includes('2.0')) score += 200;
        else if (name.includes('1.5')) score += 100;

        // 2. Класс (Pro > Flash > Lite)
        if (name.includes('pro')) score += 50;      // Pro - самые умные
        else if (name.includes('flash') && !name.includes('lite')) score += 30; // Flash - средние
        else if (name.includes('lite')) score += 10; // Lite - простые

        return score;
      };

      return getScore(b) - getScore(a); // По убыванию (Best first)
    })

    console.log('🔄 Порядок перебора моделей (Quality Desc):', sortedModels);
    modelsToTry = sortedModels.map(name => ({ name, version: 'v1beta' }))
  } else {
    modelsToTry = fallbackModels
  }

  let lastError: any = null

  // Пробуем прямые запросы к API
  for (const modelInfo of modelsToTry) {
    try {
      console.log(`🔄 Пробуем модель ${modelInfo.name}...`)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${modelInfo.name}:generateContent?key=${storedApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ УСПЕХ: Модель ${modelInfo.name} ответила.`)
        const mockResult = {
          response: {
            text: () => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        }
        return { model: null, result: mockResult }
      } else {
        // Обработка ошибок
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorMsg;
        } catch (e) { }

        console.warn(`❌ Модель ${modelInfo.name} отклонила запрос: ${response.status} - ${errorMsg}`);
        lastError = new Error(`HTTP ${response.status}: ${errorMsg}`);

        // Если 429 (лимиты) или 404 (нет доступа) или 503 (перегрузка) - просто идем дальше
        if (response.status === 429 || response.status === 404 || response.status === 503) {
          console.warn(`⚠️ Пропускаем ${modelInfo.name} и ищем следующую свободную...`);
          continue;
        }
      }
    } catch (e: any) {
      console.warn(`❌ Ошибка сети с ${modelInfo.name}:`, e.message)
      lastError = e
      continue
    }
  }

  // Final error if NO models worked
  throw new Error(
    'К сожалению, свободных моделей сейчас нет. Все доступные AI модели перегружены лимитами (429). Попробуйте позже.'
  )
}

// Helper function to extract detailed configuration from component data
function extractComponentDetails(data: ComponentData): string {
  let details = ''

  // Хелпер для форматирования строк конфигурации
  const addConfig = (name: string, config: any) => {
    if (!config) return

    // Пропускаем пустые объекты
    if (Object.keys(config).length === 0) return

    details += `    [${name}]:\n`
    for (const [key, value] of Object.entries(config)) {
      if (value === undefined || value === null || value === '') continue

      // Форматируем сложные объекты (массивы, вложенные объекты)
      let displayValue = value
      if (Array.isArray(value)) {
        displayValue = value.length > 0
          ? value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ')
          : 'empty'
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value)
      }

      details += `      - ${key}: ${displayValue}\n`
    }
  }

  // Проверяем все возможные конфигурации
  addConfig('Database Config', data.databaseConfig)
  addConfig('Table Structure', data.tableConfig) // Для таблиц
  addConfig('Service Config', data.serviceConfig)
  addConfig('Frontend Config', data.frontendConfig)
  addConfig('Message Broker', data.messageBrokerConfig)
  addConfig('API Gateway', data.apiGatewayConfig)
  addConfig('Load Balancer', data.loadBalancerConfig)
  addConfig('Cache', data.cacheConfig)
  addConfig('Container', data.containerConfig)
  addConfig('Auth Service', data.authServiceConfig)
  addConfig('Firewall', data.firewallConfig)
  addConfig('CDN', data.cdnConfig)
  addConfig('Lambda/Function', data.lambdaConfig)
  addConfig('ESB', data.esbConfig)
  addConfig('Data Warehouse', data.dataWarehouseConfig)
  addConfig('Object Storage', data.objectStorageConfig)

  // Новые конфиги
  addConfig('Queue', data.queueConfig)
  addConfig('Event Bus', data.eventBusConfig)
  addConfig('Stream Processor', data.streamProcessorConfig)
  addConfig('Search Engine', data.searchEngineConfig)
  addConfig('Graph DB', data.graphDatabaseConfig)
  addConfig('Time Series DB', data.timeSeriesDatabaseConfig)
  addConfig('Service Mesh', data.serviceMeshConfig)
  addConfig('Config Management', data.configurationManagementConfig)
  addConfig('CI/CD', data.ciCdPipelineConfig)
  addConfig('Identity Provider', data.identityProviderConfig)
  addConfig('Secret Management', data.secretManagementConfig)
  addConfig('Integration Platform', data.integrationPlatformConfig)
  addConfig('Batch Processor', data.batchProcessorConfig)
  addConfig('ETL Service', data.etlServiceConfig)
  addConfig('Data Lake', data.dataLakeConfig)
  addConfig('ML Service', data.mlServiceConfig)
  addConfig('Notification Service', data.notificationServiceConfig)
  addConfig('Email Service', data.emailServiceConfig)
  addConfig('SMS Gateway', data.smsGatewayConfig)
  addConfig('Proxy', data.proxyConfig)
  addConfig('VPN Gateway', data.vpnGatewayConfig)
  addConfig('DNS Service', data.dnsServiceConfig)
  addConfig('Backup Service', data.backupServiceConfig)
  addConfig('Analytics', data.analyticsServiceConfig)
  addConfig('BI', data.businessIntelligenceConfig)
  addConfig('Orchestrator', data.orchestratorConfig)
  addConfig('Vector DB', data.vectorDatabaseConfig)

  // System/Group configs
  addConfig('System Config', data.systemConfig)
  addConfig('Group Config', data.groupConfig)

  // Code level configs
  addConfig('Class Config', data.classConfig)
  addConfig('Controller Config', data.controllerConfig)
  addConfig('Repository Config', data.repositoryConfig)

  return details
}

// Преобразование архитектуры в текстовое описание для AI
export function architectureToText(nodes: Node[], edges: Edge[]): string {
  const nodeDataMap = new Map(nodes.map(n => [n.id, n.data as ComponentData]))

  let description = 'Архитектура системы:\n\n'

  // Описание компонентов
  description += 'Компоненты (Nodes):\n'
  nodes.forEach(node => {
    const data = nodeDataMap.get(node.id)
    if (data) {
      const label = data.label || 'Unnamed'
      if (data.type === 'note') {
        description += `    Текст заметки: ${label}\n`
      } else {
        description += `- Компонент: "${label}" (ID: ${node.id}, Тип: ${data.type})\n`
      }

      if (data.comment) {
        description += `    Описание (Comment): ${data.comment}\n`
      }

      // Добавляем детальную конфигурацию (Вендоры, настройки и т.д.)
      const details = extractComponentDetails(data)
      if (details) {
        description += details
      }
    }
  })

  // Описание соединений
  description += '\nСоединения (Edges):\n'
  edges.forEach(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    const connectionType = (edge.data as any)?.connectionType || 'unknown'

    if (sourceData && targetData) {
      description += `- [${sourceData.label || edge.source}] -> [${targetData.label || edge.target}]\n`
      description += `    Тип связи: ${connectionType}\n`

      // Подпись на стрелке (label или data.description)
      const label = edge.label || (edge.data as any)?.label || (edge.data as any)?.description
      if (label) {
        description += `    Подпись/Описание связи: ${label}\n`
      }

      const replication = (edge.data as any)?.replicationConfig
      if (replication) {
        description += `    Replication: ${JSON.stringify(replication)}\n`
      }

      const relType = (edge.data as any)?.relationshipType
      if (relType) {
        description += `    Relationship (ERD): ${relType}\n`
      }
    }
  })

  // Log the generated description for debugging purposes
  console.log('generated Architecture Description for AI:', description);

  return description
}

// Интерфейсы для ответов AI
export interface AIRecommendation {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestedComponents?: ComponentType[]
  suggestedConnections?: {
    from: ComponentType
    to: ComponentType
    connectionType: ConnectionType
    description: string
  }[]
  relatedNodes?: string[]
  relatedEdges?: string[]
}

export interface AIGeneratedArchitecture {
  components: Array<{
    type: ComponentType
    name: string
    description?: string
    position?: { x: number; y: number }
  }>
  connections: Array<{
    from: string
    to: string
    connectionType: ConnectionType
    description?: string
  }>
}

// Interfaces moved to types.ts

// Анализ архитектуры с помощью AI
export async function analyzeArchitectureWithAI(
  nodes: Node[],
  edges: Edge[],
  prompt?: string
): Promise<AIRecommendation[]> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const architectureDescription = architectureToText(nodes, edges)

  const defaultPrompt = `Ты выступаешь в роли Архитектурного Коуча (Architecture Coach) и Ведущего Эксперта (Principal Architect).
Твоя цель — не просто найти ошибки, а стать наставником для пользователя, помогая ему довести проект до 100% совершенства.

ТВОЯ ЗАДАЧА:
1.  **Глубокий анализ технологий**: Ты ОБЯЗАН распознавать не только типы компонентов (например, "Database"), но и КОНКРЕТНЫЕ технологии/вендоры, если они указаны (например, "MongoDB", "PostgreSQL", "Kafka", "Redis").
    *   Если указана MongoDB, оценивай решение именно как документную NoSQL базу, а не просто как "хранилище".
    *   Если указан Redis как кэш, проверяй сценарии использования именно для Redis.

2.  **Целостное восприятие**: Анализируй архитектуру как единое целое. Читай описания внутри компонентов (Comment/Description) и пояснения на связях (Edges). Они могут содержать критически важную бизнес-логику.

3.  **Стиль общения — Коучинг**:
    *   Вместо сухой критики ("Ошибка: не хватает кэша"), используй мотивирующую формулировку: "Чтобы довести производительность до идеала, отличным шагом будет добавление кэширования. Это снизит нагрузку на [Базу Данных]...".
    *   Объясняй *почему* (Why) и *как* (How).

ПРОАНАЛИЗИРУЙ СЛЕДУЮЩУЮ АРХИТЕКТУРУ:

${architectureDescription}

ТВОЙ ОТВЕТ ДОЛЖЕН БЫТЬ В ФОРМАТЕ JSON (валидный список рекомендаций):
[
  {
    "title": "Заголовок рекомендации",
    "description": "Текст рекомендации в стиле Коуча. Начни с похвалы или признания того, что уже сделано, затем предложи улучшение. Ссылайся на конкретные технологии из схемы (например: 'Твой выбор MongoDB отличен для гибкой схемы данных, однако для улучшения...').",
    "severity": "low" | "medium" | "high",
    "suggestedComponents": ["тип_компонента1", "тип_компонента2"],
    "suggestedConnections": [
      {
        "from": "тип_компонента",
        "to": "тип_компонента",
        "connectionType": "rest" | "async" | "database-connection" | ...,
        "description": "Описание соединения"
      }
    ]
  }
]

Помни: Твоя задача — научить и улучшить. Будь конкретен, называй вещи своими именами (не "база данных", а "твоя PostgreSQL").`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt || defaultPrompt)
    const response = result.response
    const text = response.text()

    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('AI не вернул валидный JSON')
    }

    const recommendations = JSON.parse(jsonMatch[0]) as AIRecommendation[]
    return recommendations
  } catch (error) {
    console.error('Ошибка при анализе архитектуры с AI:', error)
    throw error
  }
}

// Генерация рекомендаций по улучшению архитектуры
export async function generateImprovementRecommendations(
  nodes: Node[],
  edges: Edge[],
  improvementPrompt?: string
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const architectureDescription = architectureToText(nodes, edges)

  const defaultPrompt = `Ты — Архитектурный Коуч (Architecture Coach). Твоя миссия — помочь пользователю создать архитектуру уровня Enterprise, доведя текущий проект до 100% соответствия требованиям.

ПРАВИЛА АНАЛИЗА:
1.  **Точное распознавание технологий**: Ты должен "видеть" конкретные вендоры.
    *   Если компонент это "PostgreSQL", то рекомендации должны быть для реляционных БД и специфичны для PostgreSQL (vacuum, WAL, replication slots).
    *   Если "MongoDB", то говорим о шардинге, реплика сетах и документной модели.
    *   Если технология не указана, предложи наиболее подходящую для контекста.
2.  **Целостный контекст**: Учитывай связи между компонентами и комментарии пользователя. Текст внутри узлов и на стрелках — это часть требований.
3.  **Структурированный "Идеальный мир"**: Четко опиши, как должна выглядеть архитектура в финале.

Текущая архитектура:
${architectureDescription}

${improvementPrompt ? `Дополнительные требования пользователя: ${improvementPrompt}` : 'Цель: Довести архитектуру до идеала по стандартам High Availability, Security и Scalability.'}

ФОРМАТ ОТВЕТА (Строго следуй блокам):

<BLOCK:RECOMMENDATIONS>
*   **[Компонент/Область]**:
    *   **Что сделать**: (Конкретное действие, например "Добавить Redis Cluster перед PostgreSQL")
    *   **Зачем**: (Объясни пользу: "Снизит Read-нагрузку на 40%")
    *   **Техническая деталь**: (Если известна технология, дай специфичный совет, например для Redis: "Настрой eviction policy allkeys-lru")
</BLOCK:RECOMMENDATIONS>

<BLOCK:ISSUES>
*   **Проблема**: (Что сейчас не так или отсутствует)
*   **Риск**: (К чему это приведет: "Потеря данных при сбое", "Высокий латенси")
</BLOCK:ISSUES>

<BLOCK:ANSWER>
**Общее видение (The Vision):**
Здесь опиши, как выглядит эта система в "Идеальном состоянии" (100% готовность). Опиши ключевые потоки данных и взаимодействия.
Будь вдохновляющим и структурным. Объясни, как предложенные изменения трансформируют текущий проект в это идеальное состояние.
Используй роль Коуча: "Отличная база! Чтобы сделать из этого мощную Enterprise систему, нам осталось добавить несколько штрихов..."
</BLOCK:ANSWER>

Не пиши ничего вне этих блоков.`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(defaultPrompt)
    const response = result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error('Ошибка при генерации рекомендаций по улучшению:', error)
    throw error
  }
}

// Генерация архитектуры по описанию
export async function generateArchitectureFromDescription(
  description: string
): Promise<AIGeneratedArchitecture> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const prompt = `Ты — ведущий архитектурный эксперт (Principal Architect). Твоя задача — спроектировать идеальную систему с нуля, используя лучшие мировые практики.
Ты должен мыслить как CTO технологического гиганта (Google, Uber, Netflix).

На основе следующего описания создай архитектуру, которая будет:
- Масштабируемой (Scalable)
- Отказоустойчивой (Resilient)
- Безопасной (Secure by Design)
- Экономически эффективной (Cost Efficient)

Описание задачи: ${description}

    Описание: ${description}

Создай архитектуру в формате JSON:
  {
    "components": [
      {
        "type": "тип_компонента",
        "name": "Название компонента",
        "description": "Описание компонента",
        "position": { "x": 100, "y": 100 }
      }
    ],
      "connections": [
        {
          "from": "название_компонента1",
          "to": "название_компонента2",
          "connectionType": "rest" | "async" | "database-connection" | ...,
          "description": "Описание соединения"
        }
      ]
  }

Доступные типы компонентов: service, database, message - broker, api - gateway, cache, load - balancer, frontend, auth - service, cdn, object - storage, data - warehouse, lambda, firewall, esb, monitoring, logging, queue, event - bus, и другие.

Доступные типы соединений: rest, grpc, async, database - connection, cache - connection, database - replication.

Расположи компоненты так, чтобы они логично группировались(frontend слева, backend в центре, базы данных справа).

Верни только валидный JSON без дополнительного текста.`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt)
    const response = result.response
    const text = response.text()

    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI не вернул валидный JSON')
    }

    const architecture = JSON.parse(jsonMatch[0]) as AIGeneratedArchitecture
    return architecture
  } catch (error) {
    console.error('Ошибка при генерации архитектуры:', error)
    throw error
  }
}

// Получение объяснения архитектурного решения
export async function explainArchitectureDecision(
  question: string,
  nodes: Node[],
  edges: Edge[]
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const architectureDescription = architectureToText(nodes, edges)

  const prompt = `Ты — Архитектурный Наставник (Architecture Mentor). Твоя задача — дать максимально краткий, конкретный и практичный ответ.

ПРИНЦИПЫ ОТВЕТА:
1.  **Конкретные рекомендации по связям**: Если пользователь спрашивает "С чего начать?" или "Что добавить?", сначала проверь, нет ли уже нужных компонентов на схеме. Если они есть, твоим первым советом должно быть: "Соедини [Узел А] и [Узел Б] типом связи [Тип]".
2.  **Специфика**: Всегда используй названия («label») из схемы пользователя. Ты должен понимать, что "Auth Service" и "Сервис аутентификации" — это один и то же узел.
3.  **Краткость**: Твой ответ должен быть не более 2-4 предложений. Никакой воды.
4.  **Признание ошибок**: Если ты что-то пропустил (например, узел уже есть), просто скажи: "Да, я пропустил [X], виноват. Давай тогда свяжем его с [Y]".

Вопрос пользователя на основе следующей архитектуры:
${architectureDescription}

Вопрос пользователя: ${question}

ФОРМАТ ОТВЕТА (строго):
- Прямой ответ на вопрос.
- Конкретное действие ("С чего начать" или "Что изменить").
- (Опционально) 1 ключевой риск.

Не используй приветствия и вступления.`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Ошибка при получении объяснения:', error)
    throw error
  }
}

// Предложения по оптимизации
export async function getOptimizationSuggestions(
  nodes: Node[],
  edges: Edge[],
  focusArea?: string
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const architectureDescription = architectureToText(nodes, edges)

  const focusPrompt = focusArea
    ? `Особое внимание удели: ${focusArea} `
    : ''

  const prompt = `Ты — Архитектурный Коуч и Эксперт по High Load.Твоя задача — найти пути к идеальной производительности и экономии.

    ИНСТРУКЦИИ:
  1. ** Специфика **: Твои советы должны быть заточены под выбранные вендоры(PostgreSQL, AWS, и т.д.).
2. ** Смысл связей **: Учитывай подписи на стрелках.Если через связь идет "тяжелый JSON", посоветуй сжатие или смену формата.
3. ** Формат **: Четко, по делу, с обоснованием эффекта.

Проанализируй архитектуру:
${architectureDescription}

${focusPrompt}

Предоставь структурированный список рекомендаций с приоритетами, используя подход Коуча(помогаем достичь 100 % эффективности).`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Ошибка при получении предложений по оптимизации:', error)
    throw error
  }
}

// Helper to sanitize string arrays
function sanitizeStringArray(arr: any[]): string[] {
  if (!Array.isArray(arr)) return []
  return arr.map(item => {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item !== null) {
      // Try to find a text-like property
      return item.text || item.description || item.value || JSON.stringify(item)
    }
    return String(item)
  })
}

// Генерация бизнес-кейса для обучения
export async function generateArchitectureCase(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
): Promise<ArchitectureCase> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const prompt = `Ты — строгий экзаменатор уровня Principal Architect в Big Tech компании.
Твоя задача: создать архитектурный челлендж(Business Case), который проверит глубину знаний кандидата.

Кейс должен быть:
  - Реалистичным(ситуация из жизни Enterprise).
- Сложным(содержать скрытые проблемы, противоречивые требования).
- Требовать компромиссов(Trade - offs), например, "Скорость vs Надежность".

Создай интересную архитектурную задачу(бизнес - кейс) для обучения.
Уровень сложности: ${difficulty}.

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "уникальный_id",
      "title": "Название задачи",
        "difficulty": "${difficulty}",
          "description": "Общее описание бизнес-проблемы",
            "businessRequirements": ["требование 1", "требование 2"],
              "qualityAttributes": ["атрибут 1", "атрибут 2"],
                "expectedComponents": ["тип_компонента1", "тип_компонента2"]
  }

Будь креативным.
Верни только JSON.`

  try {
    const { result } = await getAvailableModel(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI не вернул валидный JSON')

    const parsed = JSON.parse(jsonMatch[0])
    return {
      id: parsed.id || Date.now().toString(),
      title: parsed.title || 'Архитектурная задача',
      difficulty: parsed.difficulty || difficulty,
      description: parsed.description || 'Нет описания',
      businessRequirements: sanitizeStringArray(parsed.businessRequirements),
      qualityAttributes: sanitizeStringArray(parsed.qualityAttributes),
      expectedComponents: sanitizeStringArray(parsed.expectedComponents)
    } as ArchitectureCase
  } catch (error) {
    console.error('Ошибка при генерации кейса:', error)
    throw error
  }
}

// Оценка решения пользователя
export async function evaluateArchitectureSolution(
  nodes: Node[],
  edges: Edge[],
  currentCase: ArchitectureCase
): Promise<ArchitectureEvaluation> {
  if (!genAI) {
    // Вместо ошибки возвращаем объект с сообщением
    return {
      score: 0,
      correctDecisions: [],
      missedRequirements: [],
      optimizationSuggestions: [],
      roadmapTo100: [],
      summary: 'API ключ не установлен. Пожалуйста, настройте ключ Gemini API.'
    }
  }

  const architectureDescription = architectureToText(nodes, edges)

  const prompt = `Ты — Архитектурный Коуч, принимающий экзамен(Architecture Review).Твоя задача — оценить решение пользователя по бизнес - кейсу и помочь ему довести его до идеала(100 %).

ПРАВИЛА ОЦЕНКИ:
1. **Семантический поиск**: Перед тем как предложить ДОБАВИТЬ («componentsToAdd») новый компонент, ВНИМАТЕЛЬНО проверь список существующих компонентов. Если на холсте уже есть узел с похожим смыслом (например, "Сервис аутентификации", "Auth", "Identity Service" — это одно и то же), НЕ предлагай его добавлять. Признай его наличие в "correctDecisions".
2. **Приоритет связей**: Если нужные компоненты уже есть, но они не соединены — твоим первым шагом в "roadmapTo100" должно быть установление связей («connectionsToAdd»).
3. **Конкретика в связях**: В "connectionsToAdd" всегда указывай конкретные названия («label») узлов из решения пользователя. Описывай ЗАЧЕМ нужна эта связь (например, "для проверки токенов" или "для сохранения логов").
4. **Технологический радар**: Проверь, подходят ли КОНКРЕТНЫЕ выбранные технологии под требования кейса.

ЗАДАЧА: ${currentCase.title}
${currentCase.description}

РЕШЕНИЕ ПОЛЬЗОВАТЕЛЯ:
${architectureDescription}

ВЕРНИ ТОЛЬКО JSON:
{
  "score": число 0-100,
  "correctDecisions": ["что сделано верно, учитывая названия узлов пользователя"],
  "missedRequirements": ["что упущено из условий"],
  "roadmapTo100": [
    {
      "title": "Заголовок шага",
      "description": "ПОШАГОВАЯ инструкция: что именно сделать с существующими узлами или что добавить.",
      "componentsToAdd": ["тип_компонента"],
      "connectionsToAdd": [
        {
          "from": "Label_узла_A",
          "to": "Label_узла_B",
          "type": "rest | async | ...",
          "description": "зачем эта связь"
        }
      ]
    }
  ],
  "optimizationSuggestions": ["советы по качеству"],
  "summary": "Твой вердикт. Будь краток и конструктивен."
}

Верни только JSON.`

  try {
    // Внутренний try-catch для обработки ошибок API без падения всего приложения
    const { result } = await getAvailableModel(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('AI вернул неверный формат:', text)
      return {
        score: 0,
        correctDecisions: [],
        missedRequirements: ['Ошибка формата ответа AI'],
        optimizationSuggestions: [],
        roadmapTo100: [],
        summary: 'AI вернул некорректные данные. Попробуйте еще раз.'
      }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      correctDecisions: sanitizeStringArray(parsed.correctDecisions),
      missedRequirements: sanitizeStringArray(parsed.missedRequirements),
      optimizationSuggestions: sanitizeStringArray(parsed.optimizationSuggestions),
      roadmapTo100: Array.isArray(parsed.roadmapTo100) ? parsed.roadmapTo100.map((step: any) => ({
        title: step.title || 'Шаг',
        description: step.description || '',
        componentsToAdd: sanitizeStringArray(step.componentsToAdd),
        connectionsToAdd: Array.isArray(step.connectionsToAdd) ? step.connectionsToAdd.map((conn: any) => ({
          from: conn.from || '',
          to: conn.to || '',
          type: conn.type || 'default',
          description: conn.description || ''
        })) : []
      })) : [],
      summary: parsed.summary || 'Нет описания'
    } as ArchitectureEvaluation

  } catch (error: any) {
    console.error('Ошибка при оценке решения:', error)
    // Возвращаем объект ошибки вместо выброса исключения
    return {
      score: 0,
      correctDecisions: [],
      missedRequirements: ['Произошла ошибка при обращении к API'],
      optimizationSuggestions: [],
      roadmapTo100: [],
      summary: `Ошибка: ${error.message || 'Неизвестная ошибка'}. Попробуйте повторить запрос.`
    }
  }
}
