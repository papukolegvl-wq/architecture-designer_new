import { GoogleGenerativeAI } from '@google/generative-ai'
import { Node, Edge } from 'reactflow'
import { ComponentData, ComponentType, ConnectionType } from '../types'
import { domains, subDomains, technicalConstraints, businessTwists } from '../data/caseGenerationData'

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
    { name: 'gemini-2.0-flash-exp', version: 'v1beta' },
    { name: 'gemini-2.0-flash', version: 'v1beta' },
    { name: 'gemini-1.5-pro', version: 'v1beta' },
    { name: 'gemini-1.5-pro', version: 'v1' },
    { name: 'gemini-pro', version: 'v1' },
    { name: 'gemini-2.5-flash-lite', version: 'v1beta' },
    { name: 'gemini-2.0-flash-lite-001', version: 'v1beta' },
    { name: 'gemini-2.0-flash-thinking-exp', version: 'v1beta' },
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

// Преобразование архитектуры в текстовое описание для AI
function architectureToText(nodes: Node[], edges: Edge[]): string {
  const nodeDataMap = new Map(nodes.map(n => [n.id, n.data as ComponentData]))

  let description = 'Архитектура системы:\n\n'

  // Описание компонентов
  description += 'Компоненты:\n'
  nodes.forEach(node => {
    const data = nodeDataMap.get(node.id)
    if (data) {
      description += `- ${data.label || node.id} (${data.type})\n`
      if (data.comment) {
        description += `  Описание: ${data.comment}\n`
      }
    }
  })

  // Описание соединений
  description += '\nСоединения:\n'
  edges.forEach(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    const connectionType = (edge.data as any)?.connectionType || 'unknown'

    if (sourceData && targetData) {
      description += `- ${sourceData.label || edge.source} → ${targetData.label || edge.target} (${connectionType})\n`
      if ((edge.data as any)?.description) {
        description += `  Описание: ${(edge.data as any).description}\n`
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

export interface ArchitectureCase {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
  description: string
  businessRequirements: string[]
  qualityAttributes: string[]
  hideQualityAttributes?: boolean // Флаг для скрытия атрибутов качества в режиме обучения
  correctQualityAttributes?: string[] // Правильные атрибуты качества для сравнения
  expectedComponents?: ComponentRecommendation[] | string[]
  aiDesignedArchitecture?: Array<{
    step: string
    description: string
    components?: Array<{
      name: string
      reasoning: string
    }>
    connections?: Array<{
      path: string
      reasoning: string
    }>
  }>
  suitablePatterns?: Array<{
    category: string
    patterns: Array<{
      name: string
      description: string
      implementation: string
      benefits: string
    }>
  }>
  recommendedTactics?: Array<{
    attribute: string
    tactics: Array<{
      title: string
      instruction: string
    }>
  }>
}



export interface ArchitectureEvaluation {
  score: number // 0-100
  correctDecisions: string[]
  missedRequirements: string[]
  optimizationSuggestions: string[]
  summary: string
}

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

  const defaultPrompt = `Ты эксперт по архитектуре программного обеспечения. Проанализируй следующую архитектуру и предоставь рекомендации по улучшению.

${architectureDescription}

Предоставь рекомендации в формате JSON массива, где каждый элемент имеет структуру:
{
  "title": "Название рекомендации",
  "description": "Подробное описание проблемы и решения",
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

Доступные типы компонентов: service, database, message-broker, api-gateway, cache, load-balancer, frontend, auth-service, cdn, object-storage, data-warehouse, lambda, firewall, esb, monitoring, logging, queue, event-bus, и другие.

Доступные типы соединений: rest, grpc, async, database-connection, cache-connection, database-replication.

Верни только валидный JSON массив без дополнительного текста.`

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

  const defaultPrompt = `🏗 РОЛЬ

Ты — Elite Solution Architect AI — ведущий архитектор уровня Principal Architect / CTO / Chief Engineer.

Твоя миссия — проектировать оптимальные, масштабируемые, безопасные, экономически эффективные и долгосрочные технические решения.

Ты объединяешь:
• глубокую техническую экспертизу
• реальный инженерный опыт
• бизнес-мышление и понимание ROI
• мастерство системного дизайна
• знания Cloud и DevOps
• экспертизу в безопасности и комплаенсе
• современные практики AI и Data Engineering

Ты мыслишь категориями архитектуры, компромиссов (trade-offs), рисков, масштабирования, поддержки и эволюции системы.

🧮 АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

Всегда оптимизируй по следующим критериям:
✓ Масштабируемость (Scalability)
✓ Отказоустойчивость (Fault Tolerance)
✓ Безопасность (Security)
✓ Производительность (Performance)
✓ Экономическая эффективность (Cost Efficiency)
✓ Поддерживаемость (Maintainability)
✓ Наблюдаемость (Observability)
✓ Минимизация vendor lock-in
✓ Продуктивность команды

Всегда объясняй компромиссы и почему принято именно такое решение.

📊 ТЕКУЩАЯ АРХИТЕКТУРА:
${architectureDescription}

${improvementPrompt ? `🎯 ТРЕБОВАНИЯ К УЛУЧШЕНИЮ: ${improvementPrompt}` : '🎯 ЗАДАЧА: Улучши архитектуру, добавив недостающие компоненты, оптимизировав соединения и следуя enterprise best practices.'}

📐 ФОРМАТ ОТВЕТА

Структурируй анализ следующим образом:

<BLOCK:ISSUES>
**Критические проблемы и риски:**
• Перечисли найденные архитектурные проблемы
• Укажи потенциальные риски (производительность, безопасность, масштабируемость)
• Оцени severity каждой проблемы (Critical/High/Medium/Low)
</BLOCK:ISSUES>

<BLOCK:RECOMMENDATIONS>
**Архитектурные рекомендации:**

Для каждой рекомендации укажи:

**1. Компоненты для добавления:**
• Название и тип компонента (например: "API Gateway", "Redis Cache", "Load Balancer")
• Технологический стек (конкретные технологии: Nginx, HAProxy, AWS ALB, etc.)
• Зачем нужен и какую проблему решает
• Где разместить в архитектуре
• Trade-offs и альтернативы

**2. Соединения и интеграции:**
• Какие компоненты соединить
• Тип соединения (REST API, gRPC, async messaging, database connection)
• Протоколы и паттерны (Request-Response, Pub/Sub, Event Sourcing, CQRS)
• Обоснование выбора

**3. Паттерны и тактики:**
• Архитектурные паттерны (Circuit Breaker, Retry, Bulkhead, Rate Limiting)
• Тактики для атрибутов качества
• Референсные архитектуры

**4. Безопасность и Compliance:**
• Механизмы аутентификации/авторизации (OAuth2, OIDC, mTLS)
• Шифрование (at rest, in transit)
• Secrets management
• Compliance требования (GDPR, HIPAA, SOC2)

**5. Observability:**
• Мониторинг (Prometheus, Grafana, Datadog)
• Логирование (ELK, Loki)
• Distributed Tracing (Jaeger, OpenTelemetry)
• Alerting стратегия

**6. Deployment & DevOps:**
• CI/CD пайплайны
• Infrastructure as Code (Terraform, Pulumi)
• Контейнеризация и оркестрация (Docker, Kubernetes)
• Стратегия развертывания (Blue-Green, Canary, Rolling)
</BLOCK:RECOMMENDATIONS>

<BLOCK:ANSWER>
**Итоговое резюме:**
• Общая оценка архитектуры (0-100)
• Ключевые преимущества предлагаемых изменений
• Приоритизация рекомендаций (что внедрять в первую очередь)
• Ожидаемые метрики улучшения (latency, throughput, availability)
• Оценка стоимости внедрения (Low/Medium/High)
• Roadmap внедрения (Quick Wins → Strategic Improvements)
</BLOCK:ANSWER>

🧰 ДОСТУПНЫЕ ТЕХНОЛОГИИ

**Backend & APIs:** Java, Kotlin, Go, Python, Node.js, C#, Rust, Spring, Quarkus, .NET, FastAPI, NestJS
**Frontend:** React, Vue, Angular, Next.js, Flutter, React Native
**Data:** PostgreSQL, MySQL, MongoDB, DynamoDB, Redis, Cassandra, Kafka, RabbitMQ, NATS
**Cloud:** AWS, Azure, GCP, Kubernetes, Docker, Terraform, Serverless
**Security:** OAuth2, OIDC, Zero Trust, IAM, KMS, Vault
**AI/ML:** LLM, RAG, Vector DBs, MLOps

Доступные типы компонентов: service, database, message-broker, api-gateway, cache, load-balancer, frontend, auth-service, cdn, object-storage, data-warehouse, lambda, firewall, waf, zero-trust, iam, kms, secrets-vault, monitoring, logging, tracing, alert-manager, service-mesh, circuit-breaker, rate-limiter, и другие.

Доступные типы соединений: rest, grpc, async, database-connection, cache-connection, database-replication.

📝 СТИЛЬ КОММУНИКАЦИИ

• Структурированный и четкий
• Практичный и технически точный
• С ориентацией на бизнес-ценность
• Используй конкретные примеры
• Избегай расплывчатых формулировок
• Будь решительным в рекомендациях

Не пиши ничего вне указанных блоков <BLOCK:...>.`

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

  const prompt = `🏗 РОЛЬ

Ты — Elite Solution Architect AI — ведущий архитектор уровня Principal Architect / CTO / Chief Engineer.

Твоя миссия — проектировать оптимальные, масштабируемые, безопасные, экономически эффективные и долгосрочные технические решения.

📋 ЗАДАЧА

На основе следующего описания спроектируй полную архитектуру системы:

${description}

🧮 АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

Проектируй с учетом:
✓ Масштабируемость (Scalability)
✓ Отказоустойчивость (Fault Tolerance)
✓ Безопасность (Security)
✓ Производительность (Performance)
✓ Экономическая эффективность (Cost Efficiency)
✓ Поддерживаемость (Maintainability)
✓ Наблюдаемость (Observability)

📐 ФОРМАТ ОТВЕТА

Верни архитектуру ТОЛЬКО в формате JSON (без markdown, без дополнительного текста):

{
  "components": [
    {
      "type": "тип_компонента",
      "name": "Название компонента",
      "description": "Подробное описание: зачем нужен, какую роль играет, какие технологии использует",
      "position": { "x": 100, "y": 100 }
    }
  ],
  "connections": [
    {
      "from": "название_компонента1",
      "to": "название_компонента2",
      "connectionType": "rest" | "grpc" | "async" | "database-connection" | ...,
      "description": "Описание соединения: протокол, паттерн, зачем нужно"
    }
  ]
}

🧰 ДОСТУПНЫЕ КОМПОНЕНТЫ

**Infrastructure & Networking:**
- load-balancer (ALB, NLB, HAProxy, Nginx)
- api-gateway (Kong, AWS API Gateway, Apigee)
- cdn (CloudFront, Cloudflare, Akamai)
- firewall, waf (Web Application Firewall)
- proxy, vpn-gateway, dns-service

**Backend & Services:**
- service (микросервисы)
- lambda (serverless functions)
- auth-service (OAuth2, OIDC)
- bff (Backend for Frontend)

**Data & Storage:**
- database (PostgreSQL, MySQL, MongoDB, DynamoDB)
- cache (Redis, Memcached)
- object-storage (S3, Azure Blob, GCS)
- data-warehouse (Snowflake, BigQuery, Redshift)
- data-lake, vector-database

**Messaging & Events:**
- message-broker (Kafka, RabbitMQ, SQS)
- queue, event-bus
- stream-processor (Kafka Streams, Flink)

**Security:**
- zero-trust, iam, kms, secrets-vault
- token-service, policy-engine, audit-log
- dlp, fraud-detection, compliance

**Observability:**
- monitoring (Prometheus, Grafana, Datadog)
- logging (ELK, Loki)
- tracing (Jaeger, OpenTelemetry)
- alert-manager, slo-manager

**Reliability Patterns:**
- circuit-breaker, rate-limiter, scheduler
- feature-flag, gateway-cache, edge-cache

**AI/ML:**
- llm-model, vector-database, ai-agent
- ml-training, ml-inference, ml-data-pipeline
- prompt-store, prompt-router, model-registry

**DevOps & Development:**
- ci-cd-pipeline, vcs
- service-mesh, orchestrator (Kubernetes)
- configuration-management

**Frontend:**
- frontend (React, Vue, Angular, Next.js)
- client (mobile apps, web browsers)

🔗 ДОСТУПНЫЕ ТИПЫ СОЕДИНЕНИЙ

- **rest** - REST API (HTTP/HTTPS)
- **grpc** - gRPC (высокопроизводительный RPC)
- **async** - Асинхронное сообщение (Kafka, RabbitMQ)
- **database-connection** - Подключение к БД
- **cache-connection** - Подключение к кэшу
- **database-replication** - Репликация данных

📍 РАЗМЕЩЕНИЕ КОМПОНЕНТОВ

Расположи компоненты логично:
- **Frontend слева** (x: 50-200)
- **API Gateway/Load Balancer** (x: 300-400)
- **Backend Services в центре** (x: 500-800)
- **Databases справа** (x: 900-1100)
- **Messaging/Queue** (x: 500-700, y: 300-400)
- **Monitoring/Logging внизу** (x: любой, y: 500-600)

Группируй связанные компоненты близко друг к другу.

🎯 ТРЕБОВАНИЯ К АРХИТЕКТУРЕ

1. **Обязательно включи:**
   - Load Balancer или API Gateway (точка входа)
   - Как минимум 1 сервис/lambda
   - База данных
   - Кэш (если нужна производительность)
   - Monitoring и Logging (observability)

2. **Добавь при необходимости:**
   - Message Broker (для async обработки)
   - Auth Service (если есть пользователи)
   - CDN (для статики)
   - Circuit Breaker, Rate Limiter (reliability)
   - Secrets Vault (для безопасности)

3. **Опиши каждый компонент:**
   - Конкретные технологии (например: "Redis Cache", "PostgreSQL Database", "Kafka Message Broker")
   - Зачем нужен
   - Какую проблему решает

4. **Опиши каждое соединение:**
   - Протокол и паттерн
   - Что передается
   - Зачем нужно

Верни ТОЛЬКО валидный JSON без дополнительного текста, markdown или комментариев.`

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

  const prompt = `🏗 РОЛЬ

Ты — Elite Solution Architect AI — ведущий архитектор уровня Principal Architect / CTO / Chief Engineer.

Твоя миссия — помогать разработчикам и архитекторам принимать правильные технические решения, объясняя сложные концепции простым языком, но с глубоким техническим пониманием.

Ты объединяешь:
• глубокую техническую экспертизу
• реальный инженерный опыт
• способность объяснять сложное простыми словами
• понимание бизнес-контекста
• знание современных практик и паттернов

📊 ТЕКУЩАЯ АРХИТЕКТУРА:
${architectureDescription}

❓ ВОПРОС ПОЛЬЗОВАТЕЛЯ:
${question}

📐 ФОРМАТ ОТВЕТА

Структурируй ответ используя следующие блоки (используй только уместные):

<BLOCK:ANSWER>
**Прямой ответ на вопрос:**
• Дай четкий, конкретный ответ
• Объясни концепции и термины
• Приведи примеры из реальной практики
• Укажи best practices
• Объясни trade-offs и альтернативы
</BLOCK:ANSWER>

<BLOCK:RECOMMENDATIONS>
**Конкретные рекомендации:**
• Что нужно добавить или изменить
• Какие технологии использовать (с конкретными названиями)
• Как реализовать (пошаговый план)
• Какие паттерны применить
• Референсные архитектуры и примеры
</BLOCK:RECOMMENDATIONS>

<BLOCK:ISSUES>
**Потенциальные проблемы и риски:**
• Что может пойти не так
• Антипаттерны, которых следует избегать
• Технический долг
• Проблемы масштабируемости/безопасности/производительности
• Severity оценка (Critical/High/Medium/Low)
</BLOCK:ISSUES>

🧰 ТЕХНОЛОГИЧЕСКАЯ ЭКСПЕРТИЗА

Ты эксперт в:
**Backend & APIs:** Java, Kotlin, Go, Python, Node.js, C#, Rust, Spring, Quarkus, .NET, FastAPI, NestJS, REST, GraphQL, gRPC
**Frontend & Mobile:** React, Vue, Angular, Next.js, Flutter, React Native, Swift, Kotlin
**Data & Messaging:** PostgreSQL, MySQL, MongoDB, DynamoDB, Redis, Cassandra, Kafka, RabbitMQ, NATS, SQS
**Cloud & Infrastructure:** AWS, Azure, GCP, Kubernetes, Docker, Helm, Terraform, Pulumi, Serverless
**DevOps & Observability:** CI/CD (GitHub Actions, GitLab, Jenkins, ArgoCD), Monitoring (Prometheus, Grafana, Datadog), Logging (ELK, Loki), Tracing (Jaeger, OpenTelemetry)
**Security & Compliance:** OAuth2, OIDC, SSO, Zero Trust, IAM, KMS, Vault, GDPR, HIPAA, SOC2
**AI & Data:** LLMs, RAG, Vector DBs (Pinecone, Weaviate), ML pipelines, MLOps, Data Lakes, Streaming

🧮 АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

Всегда учитывай:
✓ Масштабируемость (Scalability)
✓ Отказоустойчивость (Fault Tolerance)
✓ Безопасность (Security)
✓ Производительность (Performance)
✓ Экономическая эффективность (Cost Efficiency)
✓ Поддерживаемость (Maintainability)
✓ Наблюдаемость (Observability)
✓ Минимизация vendor lock-in
✓ Продуктивность команды

📝 СТИЛЬ КОММУНИКАЦИИ

• Структурированный и четкий
• Практичный с конкретными примерами
• Технически точный, но понятный
• С ориентацией на бизнес-ценность
• Избегай расплывчатых формулировок
• Будь решительным, но объясняй trade-offs

Отвечай как опытный коллега-архитектор, который делится знаниями и помогает принять правильное решение.

Не пиши ничего вне указанных блоков <BLOCK:...>.`

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

  const prompt = `Ты эксперт по оптимизации архитектуры программного обеспечения.Проанализируй архитектуру и предложи конкретные способы оптимизации производительности, масштабируемости, безопасности и стоимости.

    Архитектура:
${architectureDescription}

${focusPrompt}

Предоставь структурированный список рекомендаций с приоритетами.`

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

export interface ComponentRecommendation {
  name: string
  type: string
  description: string
  connections: string
}

// Генерация бизнес-кейса для обучения
export async function generateArchitectureCase(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god',
  caseType: 'solution' | 'infrastructure' | 'data' = 'solution'
): Promise<ArchitectureCase> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  // --- Procedural Generation Logic ---
  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const selectedDomain = getRandomElement(domains);
  const availableSubDomains = subDomains[selectedDomain] || [];
  const selectedSubDomain = availableSubDomains.length > 0 ? getRandomElement(availableSubDomains) : selectedDomain;

  const selectedConstraint = getRandomElement(technicalConstraints);
  const selectedTwist = getRandomElement(businessTwists);

  // Create a unique seed for the user to potentially reference (or just for randomness flavor)
  const caseSeed = Math.floor(Math.random() * 10000);

  let prompt = '';

  if (caseType === 'infrastructure') {
    prompt = `Role: Senior Cloud Infrastructure Engineer expert in Multi-Cloud (AWS, Azure, GCP, Oracle) and Hybrid environments.

Context: Ты — ведущий инженер по облачной инфраструктуре. 
Твоя задача — спроектировать решение для уникального кейса #${caseSeed}.

ПАРАМЕТРЫ КЕЙСА (ОБЯЗАТЕЛЬНО СЛЕДУЙ ИМ):
- Индустрия: ${selectedDomain}
- Специфика (Sub-domain): ${selectedSubDomain}
- Ключевое техническое ограничение: ${selectedConstraint}
- Сюжетный поворот (Business Twist): ${selectedTwist}

Инструкция:
Используя эти жесткие вводные, создай ДЕТАЛЬНЫЙ и РЕАЛИСТИЧНЫЙ сценарий инцидента или запроса на изменение инфраструктуры.
Это не должна быть абстрактная задача. Придумай название вымышленной компании, контекст, цифры (RPS, TB данных, бюджет).

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ К ОТВЕТУ:
1. **Максимальный Реализм:** Используй реальные названия сервисов (AWS, Azure, K8s, Terraform и т.д.).
2. **Сложность:** Уровень сложности - ${difficulty}. Проблема должна требовать нетривиального архитектурного решения.
3. **Как AI спроектировал архитектуру:**
   - В блоке aiDesignedArchitecture пошагово опиши, как ты (как эксперт) решил бы эту задачу.
   - Обоснуй выбор компонентов (почему именно этот сервис, а не аналог).
   - Опиши топологию (регионы, зоны доступности, сети).

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "infra_case_${Date.now()}_${caseSeed}",
    "title": "[${selectedDomain}] Креативное название кейса",
    "difficulty": "${difficulty}",
    "description": "Подробное описание: кто мы (компания), что у нас сейчас есть (текущий стек), какая возникла проблема (${selectedTwist}) и какие у нас ограничения (${selectedConstraint}).",
    "businessRequirements": [
      "Требование 1 (связанное с ${selectedTwist})",
      "Требование 2 (связанное с ${selectedConstraint})"
    ],
    "qualityAttributes": [
      "Атрибут 1",
      "Атрибут 2"
    ],
    "aiDesignedArchitecture": [
      {
        "step": "Шаг 1. Название",
        "description": "Описание действия...",
        "components": [
          { "name": "Название 1", "reasoning": "Зачем добавляем..." }
        ],
        "connections": [
          { "path": "Комп 1 -> Комп 2", "reasoning": "Зачем связываем..." }
        ]
      }
    ],
    "suitablePatterns": [
      {
        "category": "Название категории",
        "patterns": [
           {
             "name": "Название паттерна",
             "description": "Описание.",
             "implementation": "Как внедрить.",
             "benefits": "Польза."
           }
        ]
      }
    ],
    "expectedComponents": [
       {
         "name": "Название компонента",
         "type": "Тип",
         "description": "Описание и роль.",
         "connections": "Связи."
       }
    ],
    "recommendedTactics": [
      {
        "attribute": "Атрибут",
        "tactics": [
          {
            "title": "Название тактики",
            "instruction": "Инструкция."
          }
        ]
      }
    ]
  }

Наполни массивы suitablePatterns, expectedComponents и recommendedTactics реальными, полезными данными, соответствующими кейсу. Прописывай ДЕТАЛЬНЫЕ инструкции по реализации.`;
  } else if (caseType === 'data') {
    prompt = `Role: Expert Data Architect and Big Data Engineer specializing in Data Pipelines, Data Warehousing, and Real-time Processing.

Context: Ты — ведущий архитектор данных. Твоя задача — спроектировать решение для уникального кейса #${caseSeed} в области архитектуры данных.

ПАРАМЕТРЫ КЕЙСА (ОБЯЗАТЕЛЬНО СЛЕДУЙ ИМ):
- Индустрия: ${selectedDomain}
- Специфика (Sub-domain): ${selectedSubDomain}
- Ключевое техническое ограничение: ${selectedConstraint}
- Сюжетный поворот (Business Twist): ${selectedTwist}

Инструкция:
Создай ГЛУБОКИЙ и СЛОЖНЫЙ сценарий, сфокусированный на ПОТОКАХ ДАННЫХ, ХРАНЕНИИ и ОБРАБОТКЕ.
Темы кейса: ETL/ELT пайплайны, Data Lake, Data Warehouse, Real-time streaming (Kafka/Flink), Batch processing (Spark/Airflow), Data Quality, Governance.

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ К ОТВЕТУ:
1. **Проработка Data Stack:** Опиши выбор между SQL/NoSQL/Object Storage, выбор инструментов обработки.
2. **Сложность:** Уровень - ${difficulty}. Опиши объемы данных (PB/EB), требования к свежести данных (data freshness).
3. **Как AI спроектировал архитектуру:** В блоке aiDesignedArchitecture пошагово опиши проектирование пайплайнов и систем хранения.

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "data_case_${Date.now()}_${caseSeed}",
    "title": "[Data] ${selectedDomain}: Креативное название",
    "difficulty": "${difficulty}",
    "description": "Подробное описание задачи. Фокус на архитектуре данных, проблеме (${selectedTwist}) и ограничении (${selectedConstraint}).",
    "businessRequirements": [
      "Обработка данных в реальном времени",
      "Обеспечение качества данных"
    ],
    "qualityAttributes": [
      "Data Integrity",
      "Scalability",
      "Data Freshness"
    ],
    "aiDesignedArchitecture": [
      {
        "step": "Шаг 1. Ingestion Layer",
        "description": "Мы используем Kafka для...",
        "components": [
          { "name": "Kafka Cluster", "reasoning": "Для отказоустойчивой очереди..." }
        ],
        "connections": [
          { "path": "Source -> Kafka", "reasoning": "Для передачи событий..." }
        ]
      }
    ],
    "suitablePatterns": [
      {
        "category": "Название категории",
        "patterns": [
           {
             "name": "Название паттерна",
             "description": "Описание.",
             "implementation": "Как внедрить.",
             "benefits": "Польза."
           }
        ]
      }
    ],
    "expectedComponents": [
       {
         "name": "Название компонента",
         "type": "Тип",
         "description": "Описание и роль.",
         "connections": "Связи."
       }
    ],
    "recommendedTactics": [
      {
        "attribute": "Атрибут",
        "tactics": [
          {
            "title": "Название тактики",
            "instruction": "Инструкция."
          }
        ]
      }
    ]
  }

Наполни массивы suitablePatterns, expectedComponents и recommendedTactics реальными, полезными данными, соответствующими кейсу. Прописывай ДЕТАЛЬНЫЕ инструкции по реализации.`;
  } else {
    // Solution Architecture Case
    prompt = `Role: Expert Solutions Architect specializing in System Design and Data Architecture.

Context: Ты — архитектор мирового уровня.
Твоя задача — спроектировать решение для уникального кейса #${caseSeed}.

ПАРАМЕТРЫ КЕЙСА (ОБЯЗАТЕЛЬНО СЛЕДУЙ ИМ):
- Индустрия: ${selectedDomain}
- Специфика (Sub-domain): ${selectedSubDomain}
- Ключевое техническое ограничение: ${selectedConstraint}
- Сюжетный поворот (Business Twist): ${selectedTwist}

Инструкция:
Создай ГЛУБОКИЙ и СЛОЖНЫЙ сценарий проектирования системы с нуля или рефакторинга.
Особый упор сделай на АРХИТЕКТУРУ ДАННЫХ (модели, базы данных, потоки), так как это ${difficulty} уровень.

Требования к кейсу:
1. Продумай название компании и ее бизнес-модель.
2. Опиши текущие боли, вызванные "${selectedTwist}".
3. Учти ограничение "${selectedConstraint}" при выборе технологий (например, если Low Latency — забудь про тяжелые ETL в реалтайме).

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ К ОТВЕТУ:
1. **Проработка Баз Данных:** Опиши, какие БД нужны (SQL/NoSQL), почему, как данные будут шардироваться или реплицироваться.
2. **Как AI спроектировал архитектуру:** В блоке aiDesignedArchitecture дай эталонное решение. Шаг за шагом.

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "solution_case_${Date.now()}_${caseSeed}",
    "title": "[${selectedDomain}] Креативное название",
    "difficulty": "${difficulty}",
    "description": "Подробное описание задачи. Бизнес-контекст, проблема (${selectedTwist}), технический ландшафт и жесткое ограничение (${selectedConstraint}).",
    "businessRequirements": [
      "Бизнес-цель 1",
      "Техническое требование 1"
    ],
    "qualityAttributes": [
      "Атрибут 1",
      "Атрибут 2"
    ],
    "aiDesignedArchitecture": [
      {
        "step": "Шаг 1. Анализ данных",
        "description": "Мы выбираем...",
        "components": [
          { "name": "Component A", "reasoning": "Обоснование..." }
        ],
        "connections": [
          { "path": "A -> B", "reasoning": "Обоснование связи..." }
        ]
      }
    ],
    "suitablePatterns": [
      {
        "category": "Название категории",
        "patterns": [
           {
             "name": "Название паттерна",
             "description": "Описание.",
             "implementation": "Как внедрить.",
             "benefits": "Польза."
           }
        ]
      }
    ],
    "expectedComponents": [
       {
         "name": "Название компонента",
         "type": "Тип",
         "description": "Описание и роль.",
         "connections": "Связи."
       }
    ],
    "recommendedTactics": [
      {
        "attribute": "Атрибут",
        "tactics": [
          {
            "title": "Название тактики",
            "instruction": "Инструкция."
          }
        ]
      }
    ]
  }

Наполни массивы aiDesignedArchitecture, suitablePatterns, expectedComponents и recommendedTactics реальными, полезными данными, соответствующими кейсу. 
В aiDesignedArchitecture ОБЯЗАТЕЛЬНО указывай для каждого компонента и связи поле reasoning (ЗАЧЕМ мы это делаем / обоснование выбора).
Прописывай ДЕТАЛЬНЫЕ инструкции по реализации.`;
  }

  // Используем функцию автоматического выбора модели
  try {
    const { result } = await getAvailableModel(prompt)
    const text = result.response.text()

    console.log('Gemini Case Response Raw:', text); // Debug log

    let parsed: any;

    // 1. Try to find the first '{' and the last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
      try {
        parsed = JSON.parse(jsonCandidate);
      } catch (e) {
        console.warn('First attempt JSON parse failed, trying code block extraction...');

        // 2. Try to find JSON in Markdown block
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
        if (codeBlockMatch) {
          try {
            parsed = JSON.parse(codeBlockMatch[1]);
          } catch (e2) {
            console.warn('Markdown JSON parse failed:', e2);
          }
        }

        // 3. Try non-greedy match for first JSON object
        if (!parsed) {
          try {
            const nonGreedyMatch = text.match(/(\{[\s\S]*?\})(?=\s*[^}]*$)/);
            if (nonGreedyMatch) {
              parsed = JSON.parse(nonGreedyMatch[1]);
            }
          } catch (e3) {
            console.error('All JSON extraction attempts failed:', e3);
          }
        }
      }
    }

    if (!parsed) {
      throw new Error(`AI не вернул валидный JSON. Ответ: ${text.substring(0, 100)}...`);
    }

    const correctAttributes = sanitizeStringArray(parsed.qualityAttributes)

    return {
      id: parsed.id || Date.now().toString(),
      title: parsed.title || 'Архитектурная задача',
      difficulty: parsed.difficulty || difficulty,
      description: parsed.description || 'Нет описания',
      businessRequirements: sanitizeStringArray(parsed.businessRequirements),
      qualityAttributes: [], // Скрываем атрибуты качества
      hideQualityAttributes: true, // Флаг, что атрибуты скрыты
      correctQualityAttributes: correctAttributes, // Сохраняем правильные атрибуты для сравнения
      expectedComponents: parsed.expectedComponents || [],
      aiDesignedArchitecture: parsed.aiDesignedArchitecture || [],
      suitablePatterns: Array.isArray(parsed.suitablePatterns) ? parsed.suitablePatterns : [],
      recommendedTactics: Array.isArray(parsed.recommendedTactics) ? parsed.recommendedTactics : []
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
      summary: 'API ключ не установлен. Пожалуйста, настройте ключ Gemini API.'
    }
  }

  const architectureDescription = architectureToText(nodes, edges)

  const prompt = `Ты строгий, но справедливый архитектурный эксперт.Оцени решение пользователя для следующей задачи.
    ЗАДАЧА: ${currentCase.title}
${currentCase.description}

РЕШЕНИЕ ПОЛЬЗОВАТЕЛЯ:
${architectureDescription}

Верни ответ ТОЛЬКО в формате JSON:
  {
    "score": число от 0 до 100,
      "correctDecisions": ["что сделано правильно"],
        "missedRequirements": ["какие требования не выполнены"],
          "optimizationSuggestions": ["советы по улучшению"],
            "summary": "Общий вывод эксперта"
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
        summary: 'AI вернул некорректные данные. Попробуйте еще раз.'
      }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      correctDecisions: sanitizeStringArray(parsed.correctDecisions),
      missedRequirements: sanitizeStringArray(parsed.missedRequirements),
      optimizationSuggestions: sanitizeStringArray(parsed.optimizationSuggestions),
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
      summary: `Ошибка: ${error.message || 'Неизвестная ошибка'}. Попробуйте повторить запрос.`
    }
  }
}

