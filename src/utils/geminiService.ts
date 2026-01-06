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

const AVAILABLE_COMPONENTS: ComponentType[] = [
  'service', 'database', 'message-broker', 'api-gateway', 'cache', 'load-balancer',
  'frontend', 'auth-service', 'cdn', 'object-storage', 'data-warehouse', 'lambda',
  'firewall', 'system', 'esb', 'client', 'external-system', 'business-domain',
  'controller', 'repository', 'class', 'server', 'container', 'orchestrator',
  'service-discovery', 'web-server', 'monitoring', 'logging', 'queue', 'event-bus',
  'stream-processor', 'search-engine', 'analytics-service', 'business-intelligence',
  'graph-database', 'time-series-database', 'service-mesh', 'configuration-management',
  'ci-cd-pipeline', 'backup-service', 'identity-provider', 'secret-management',
  'api-client', 'api-documentation', 'integration-platform', 'batch-processor',
  'etl-service', 'data-lake', 'edge-computing', 'iot-gateway', 'blockchain',
  'ml-ai-service', 'llm-model', 'vector-database', 'ml-training', 'ml-inference',
  'ai-agent', 'ml-data-pipeline', 'gpu-cluster', 'notification-service', 'email-service',
  'sms-gateway', 'proxy', 'vpn-gateway', 'dns-service', 'table', 'data-quality',
  'data-observability', 'metadata-catalog', 'reverse-etl', 'feature-store',
  'cdc-service', 'lakehouse', 'business-process', 'dashboard'
]

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

  let description = 'ТЕКУЩАЯ АРХИТЕКТУРА НА ХОЛСТЕ:\n\n'

  // Описание компонентов
  description += 'КОМПОНЕНТЫ (Nodes):\n'
  if (nodes.length === 0) {
    description += '    (На холсте пока нет компонентов)\n'
  }
  nodes.forEach(node => {
    const data = nodeDataMap.get(node.id)
    if (data) {
      const label = data.label || 'Unnamed'
      if (data.type === 'note') {
        description += `  - ЗАМЕТКА [ID: ${node.id}]: "${label}"\n`
      } else {
        description += `  - УЗЕЛ [ID: ${node.id}]: Label="${label}", Type="${data.type}"\n`
      }

      if (data.comment) {
        description += `    ОПИСАНИЕ/КОММЕНТАРИЙ: ${data.comment}\n`
      }

      // Добавляем детальную конфигурацию (Вендоры, настройки и т.д.)
      const details = extractComponentDetails(data)
      if (details) {
        description += details
      }
    }
  })

  // Описание соединений
  description += '\nСВЯЗИ МЕЖДУ КОМПОНЕНТАМИ (Edges):\n'
  if (edges.length === 0) {
    description += '    (На холсте пока нет связей)\n'
  }
  edges.forEach(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    const connectionType = (edge.data as any)?.connectionType || 'unknown'

    if (sourceData && targetData) {
      description += `  - [${sourceData.label || sourceData.type}] --(${connectionType})--> [${targetData.label || targetData.type}]\n`

      // Подпись на стрелке (label или data.description)
      const label = edge.label || (edge.data as any)?.label || (edge.data as any)?.description
      if (label) {
        description += `    ТЕКСТ НА СВЯЗИ: "${label}"\n`
      }

      const replication = (edge.data as any)?.replicationConfig
      if (replication) {
        description += `    REPLICATION: ${JSON.stringify(replication)}\n`
      }

      const relType = (edge.data as any)?.relationshipType
      if (relType) {
        description += `    RELATIONSHIP (ERD): ${relType}\n`
      }
    }
  })

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

  // Добавление списка доступных компонентов в промпт
  const availableComponentsStr = AVAILABLE_COMPONENTS.join(', ')

  const defaultPrompt = `Ты выступаешь в роли Архитектурного Коуча (Architecture Coach) и Ведущего Эксперта (Principal Architect).
Твоя цель — не просто найти ошибки, а стать наставником для пользователя, помогая ему довести проект до 100% совершенства.

ТВОИ ПРИОРИТЕТЫ:
1.  **ГЛУБОКИЙ АНАЛИЗ ТЕКУЩЕГО СОСТОЯНИЯ**: Сначала проанализируй существующие узлы, их типы, вендоры и связи. Понимай контекст через Comment/Description.
2.  **СЕМАНТИЧЕСКИЙ АНАЛИЗ**: Прежде чем предложить добавить компонент, проверь, нет ли его уже на схеме. Если есть узел с похожим смыслом (даже если Label отличается), НЕ предлагай добавлять новый. Используй существующий.
3.  **КОНКРЕТНЫЕ ДЕЙСТВИЯ**: 
    - Если нужно добавить компонент, укажи конкретный ТИП из списка ниже.
    - Если компоненты есть, но не соединены, твоя главная рекомендация — "Создай связь между [Label A] и [Label B] типа [connectionType]". ОБЯЗАТЕЛЬНО используй Label существующих узлов.
4.  **ЗАПРЕТ НА ПОВТОРЫ И ВВОДНЫЕ ФРАЗЫ**: 
    - ПИШИ СРАЗУ ПО СУЩЕСТВУ. 
    - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО повторять или перефразировать вопрос пользователя.
    - ЗАПРЕЩЕНО писать "Как я понял...", "Ваш запрос касается...". Начинай ответ прямо с первой рекомендации.

ДОСТУПНЫЕ ТИПЫ КОМПОНЕНТОВ (для "suggestedComponents"): ${availableComponentsStr}

ПРОАНАЛИЗИРУЙ СЛЕДУЮЩУЮ АРХИТЕКТУРУ:

${architectureDescription}

ТВОЙ ОТВЕТ ДОЛЖЕН БЫТЬ В ФОРМАТЕ JSON (валидный список рекомендаций):
[
  {
    "title": "Заголовок рекомендации",
    "description": "Текст рекомендации. Будь максимально конкретен. Указывай названия (Label) узлов пользователя. Объясни ПОЧЕМУ это важно.",
    "severity": "low" | "medium" | "high",
    "suggestedComponents": ["тип_из_списка_выше"],
    "suggestedConnections": [
      {
        "from": "Label_СУЩЕСТВУЮЩЕГО_узла_A",
        "to": "Label_СУЩЕСТВУЮЩЕГО_узла_B",
        "connectionType": "rest" | "grpc" | "async" | "get-information" | "send-information" | "database-connection" | ...,
        "description": "Техническая цель этой связи"
      }
    ]
  }
]
`

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt ? `${defaultPrompt}\n\nУЧТИ КОНКРЕТНЫЙ ЗАПРОС ПОЛЬЗОВАТЕЛЯ: ${prompt}` : defaultPrompt)
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

  const defaultPrompt = `Ты — Архитектурный Бог и Главный Оптимизатор (Staff Solutions Architect). Твоя задача — провести рефакторинг текущей системы до состояния 99.999% доступности и идеальной масштабируемости.

КРИТИЧЕСКИЕ ПРИНЦИПЫ:
1. **NO SPOF (Single Point of Failure)**: Ищи узкие места и предлагай резервирование, кэширование и очереди.
2. **ASYNC FIRST**: Если связь может быть асинхронной (через Message Broker), она ДОЛЖНА быть такой. Синхронные цепочки — это зло.
3. **OBSERVABILITY**: Каждая подсистема должна иметь Monitoring/Logging. Если их нет — это ошибка.
4. **COST OPTIMIZATION**: Не предлагай Postgres там, где хватит Redis, и не предлагай Kafka там, где хватит RabbitMQ, если это не обосновано нагрузкой.
5. **ACTIONABLE ADVICE**: Твои советы должны содержать: "Соедини [Label A] и [Label B]", "Добавь [Type] с именем [Name]".

Текущая архитектура:
${architectureDescription}

${improvementPrompt ? `Запрос пользователя: ${improvementPrompt}` : 'Цель: Глобальная оптимизация структуры.'}

ФОРМАТ ОТВЕТА:

<BLOCK:RECOMMENDATIONS>
*   **[Домен Оптимизации]**:
    - **Действие**: Что именно сделать (напр. "Внедрить паттерн Circuit Breaker между 'API Gateway' и 'Order Service'").
    - **Зачем (The Why)**: Техническое обоснование через задержки или надежность.
    - **Риск игнорирования**: Что упадет, если это не сделать.
</BLOCK:RECOMMENDATIONS>

<BLOCK:ISSUES>
*   **Архитектурный долг**: Напр. "Сильная зацепленность (Tight Coupling) между биллингом и складом".
*   **Критичность**: Low | Medium | High | Critical.
</BLOCK:ISSUES>

<BLOCK:ANSWER>
**Финальный инженерный вердикт:**
Краткий итог: к чему мы придем после внедрения этих правок.
</BLOCK:ANSWER>`

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

КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать типы компонентов, которых нет в списке ниже.
ДОСТУПНЫЕ ТИПЫ КОМПОНЕНТОВ: ${AVAILABLE_COMPONENTS.join(', ')}

Доступные типы соединений: rest, grpc, async, database-connection, cache-connection, database-replication.

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

export async function explainArchitectureDecision(
  question: string,
  nodes: Node[],
  edges: Edge[],
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const architectureDescription = architectureToText(nodes, edges)

  const prompt = `Ты — Архитектурный Бог и Бескомпромиссный Principal Architect. Твой уровень — Staff Engineer в Tier-1 Big Tech. Ты не просто советуешь компоненты, ты проектируешь системы, которые выдерживают миллионы RPS и годы эксплуатации.

КРИТИЧЕСКИЕ ПРАВИЛА ТВОЕГО ИНТЕЛЛЕКТА:
1.  **FIRST PRINCIPLES THINKING**: Анализируй решение через фундаментальные показатели: задержки (p99 latency), пропускная способность, стоимость владения, CAP-теорема, согласованность данных.
2.  **TRADE-OFFS (КОМПРОМИССЫ) — ОБЯЗАТЕЛЬНО**: Ни одно решение не является идеальным. Если ты что-то предлагаешь, ты ОБЯЗАН написать, чем мы жертвуем (сложность, задержка, деньги).
3.  **АНТИ-ПАДДАКИВАНИЕ (EXTREME)**: Если пользователь делает "как проще", а не "как правильно" — разбей это решение техническими аргументами. Не позволяй создавать "свалку сервисов".
4.  **ГЛУБОКИЙ АНАЛИЗ СУЩЕСТВУЮЩЕГО**: Не просто смотри на типы. Если видишь "Redis", думай: это Cache, Message Broker или Session Store? Исходи из семантики связей.
6.  **MANDATORY GAP ANALYSIS**: Если в контексте переданы "Бизнес-требования" или "Атрибуты качества", ты ОБЯЗАН проверить холст на соответствие КАЖДОМУ пункту.
7.  **IMPLICIT AUDIT (НЕВИДИМЫЕ ТРЕБОВАНИЯ)**: Даже если пользователь не просил, настоящая High Availability архитектура ДОЛЖНА иметь:
    - **Auth**: Auth Service / Identity Provider (если есть пользователи).
    - **SPOF Check**: Узлы не должны быть в единственном экземпляре (нужны Load Balancers, Replicas).
    - **Observability**: Monitoring и Logging.
    - **Backups**: Backup Service для БД.
    Если этого нет — ХВАЛИТЬ АРХИТЕКТУРУ ЗАПРЕЩЕНО. Напиши, что это "Прототип, а не Production-ready система".
8.  **ЦЕЛОСТНОСТЬ СОВЕТОВ**: Любой узел, упоминаемый в связях, должен быть либо на холсте, либо в списке "ДОБАВИТЬ".
9.  **ZERO TOLERANCE FOR ANTI-PATTERNS**: Категорически запрещено предлагать промежуточные шаги, которые нарушают твои же правила.
10. **PRE-FLIGHT CHECK**: Перед выводом ответа проверь: "Не пропустил ли я отсутствие Auth или SPOF?".
11. **ПАТТЕРНЫ ВМЕСТО СТРЕЛОК**: Предлагай не просто связь, а архитектурный паттерн: Event Sourcing, CQRS, Transactional Outbox, Saga, Backpressure.

АРХИТЕКТУРНЫЕ ЗАПРЕТЫ (TABOO):
-   **Direct DB Access**: API Gateway/Frontend -> DB (Смертный грех).
-   **Anemic Model**: Сервисы-пустышки, которые только перекладывают JSON.
-   **Distributed Monolith**: Сильная связность через синхронные REST-вызовы там, где нужна асинхронность.
-   **Data Silos**: Дублирование мастер-данных без стратегии синхронизации.

Архитектура пользователя для анализа:
${architectureDescription}

Вопрос пользователя: ${question}

${history && history.length > 0 ? `
КОНТЕКСТ ЭВОЛЮЦИИ СИСТЕМЫ:
${history.map(m => `${m.role === 'user' ? 'Инженер' : 'Principal Architect'}: ${m.content}`).join('\n')}
` : ''}

ФОРМАТ ОТВЕТА (СТРОГО):
1. **АНАЛИЗ**: Краткий, жесткий технический вердикт (с учетом Бизнес-требований и Implicit Audit).
2. **ЧТО ДОБАВИТЬ**: 
   - Список новых компонентов: 'Имя' (Type: тип). Если ничего добавлять не нужно, напиши "Новые компоненты не требуются".
3. **ЧТО С ЧЕМ СВЯЗАТЬ**:
   - Конкретные инструкции: '[Label A]' -> '[Label B]' (Type: rest/async/etc). Используй Label существующих или только что добавленных узлов.
4. **ТЕХНИЧЕСКОЕ ОБОСНОВАНИЕ (ЗАЧЕМ)**:
   - Почему выбраны эти связи и компоненты? Какие паттерны они реализуют (Saga, CQRS, Outbox)? Какие компромиссы (trade-offs) мы принимаем?
5. **EDGE CASES**: О чем пользователь забыл? (Race conditions, Cascading failures).`

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

Кейс должен быть структурированным и содержать:
1. **Бизнес-цели (Business Goals)**: Чего компания хочет достичь глобально? (Например: Выход на рынок Европы, Снижение затрат на 30%).
2. **Бизнес-требования (Business Requirements)**: Что именно должна делать система для бизнеса?
3. **Функциональные требования (Functional Requirements)**: Конкретные функции системы.
4. **Нефункциональные требования (Non-Functional Requirements)**: Требования к надежности, масштабируемости, безопасности (в дополнение к Quality Attributes).

Кейс должен быть:
- Реалистичным(ситуация из жизни Enterprise).
- Сложным(содержать скрытые проблемы, противоречивые требования).
- Требовать компромиссов(Trade-offs), например, "Скорость vs Надежность".

Создай интересную архитектурную задачу(бизнес-кейс) для обучения.
Уровень сложности: ${difficulty}.

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "уникальный_id",
    "title": "Название задачи",
    "difficulty": "${difficulty}",
    "description": "Общее описание бизнес-проблемы",
    "businessGoals": ["цель 1", "цель 2"],
    "businessRequirements": ["требование 1", "требование 2"],
    "functionalRequirements": ["функционал 1", "функционал 2"],
    "nonFunctionalRequirements": ["требование к качеству 1", "требование к качеству 2"],
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
      businessGoals: sanitizeStringArray(parsed.businessGoals),
      businessRequirements: sanitizeStringArray(parsed.businessRequirements),
      functionalRequirements: sanitizeStringArray(parsed.functionalRequirements),
      nonFunctionalRequirements: sanitizeStringArray(parsed.nonFunctionalRequirements),
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

  const prompt = `Ты — Верховный Архитектор и Бескомпромиссный Экзаменатор. Твоя цель — провести глубокий аудит системы и выставить оценку (0-100%). Ты судишь по стандартам высоконагруженных систем (High Availability, Fault Tolerance, Disaster Recovery).

КРИТИЧЕСКИЕ КРИТЕРИИ ОЦЕНКИ:
1. **PRACTICALITY vs THEORY**: Не снижай баллы за отсутствие "модных" слов, если решение технически верное. Но БУДЬ ЖЕСТОК к архитектурным грехам (Direct DB access, Monolithic coupling, Lack of observability).
2. **FALLBACKS & FAILURES**: Если система не выдержит падения одной БД или сервиса — это не 100%. Ищи отсутствие очередей (Message Brokers) там, где синхронный вызов убьет систему.
3. **DATA INTEGRITY**: Оценивай, как данные синхронизируются между сервисами. Если есть "User DB" и "Product DB", но нет механизма их связи (кроме REST) — это слабая интеграция.
4. **ROADMAP**: План до 100% должен быть конкретным: какие паттерны внедрить (напр. Circuit Breaker, Saga, Event-Driven).
5. **JSON ONLY**: Ответ должен быть строго в формате JSON.

ЗАПРЕТЫ (TABOO - СРАЗУ -40 БАЛЛОВ ЗА КАЖДЫЙ):
- **Direct DB Access**: Любая связь Gateway/Frontend -> Database. Только через Service.
- **Security Breach**: Доступ к User DB без Auth Service.
- **Tight Coupling**: Цепочка из >3 синхронных вызовов (A -> B -> C -> D). Используй асинхронные очереди или 'get-information'/'send-information' там, где детали протокола пока не важны.

КЕЙС: ${currentCase.title}
ОПИСАНИЕ: ${currentCase.description}

БИЗНЕС-ЦЕЛИ: ${(currentCase.businessGoals || []).join(', ')}
БИЗНЕС-ТРЕБОВАНИЯ: ${(currentCase.businessRequirements || []).join(', ')}
ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ: ${(currentCase.functionalRequirements || []).join(', ')}
НЕФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ: ${(currentCase.nonFunctionalRequirements || []).join(', ')}
АТРИБУТЫ КАЧЕСТВА: ${(currentCase.qualityAttributes || []).join(', ')}

ТЕКУЩАЯ СХЕМА (ТЕХНИЧЕСКИЙ СРЕЗ):
${architectureDescription}

ВЕРНИ ТОЛЬКО ВАЛИДНЫЙ JSON:
  {
    "score": число 0 - 100,
      "correctDecisions": ["Конкретно, что сделано правильно. Упоминай Label узлов."],
        "missedRequirements": ["Что именно из условий не выполнено или выполнено неверно."],
          "roadmapTo100": [
            {
              "title": "Название шага (например, 'Организация связи') ",
              "description": "Инструкция: что именно сделать. Пример: 'Соедините [Label A] и [Label B] для передачи событий'.",
              "componentsToAdd": ["тип_из_доступного_списка"],
              "connectionsToAdd": [
                {
                  "from": "Label_СУЩЕСТВУЮЩЕГО_узла_A",
                  "to": "Label_СУЩЕСТВУЮЩЕГО_узла_B",
                  "type": "rest | async | database-connection | ...",
                  "description": "Зачем нужна эта связь"
                }
              ]
            }
          ],
            "optimizationSuggestions": ["Технические советы по производительности, безопасности, стоимости."],
              "summary": "Краткий технический вердикт. Без вступлений."
  }

КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО предлагать компоненты, которых нет в списке ниже.
ДОСТУПНЫЕ ТИПЫ КОМПОНЕНТОВ: ${AVAILABLE_COMPONENTS.join(', ')}
  `

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
