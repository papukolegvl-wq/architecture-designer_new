import { GoogleGenerativeAI } from '@google/generative-ai'
import { Node, Edge } from 'reactflow'
import { ComponentData, ComponentType, ConnectionType } from '../types'

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
  expectedComponents?: Array<{
    name: string
    type: string
    description: string
    connections: string
  }> | string[]
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

export interface ArchitectureCase {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
  description: string
  businessRequirements: string[]
  qualityAttributes: string[]
  expectedComponents?: ComponentRecommendation[] | string[]
  recommendedTactics?: Array<{
    attribute: string
    tactics: Array<{
      title: string
      instruction: string
    }>
  }>
}

// Генерация бизнес-кейса для обучения
export async function generateArchitectureCase(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
): Promise<ArchitectureCase> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const prompt = `Role: Expert Solutions Architect specializing in System Quality Attributes, Design Tactics, and Data Architecture.

Context: Ты — архитектор мирового уровня с глубокой экспертизой в проектировании систем и баз данных. Твоя цель — создавать РЕАЛИСТИЧНЫЕ, ГЛУБОКИЕ, СЛОЖНЫЕ и НЕПОВТОРЯЮЩИЕСЯ архитектурные задачи из разных доменов (FinTech, IoT, E-commerce, Healthcare, EdTech, Logistics, Social Media, Gaming, Streaming, Analytics). Избегай банальных примеров.

КРИТИЧЕСКИ ВАЖНО: Каждый кейс должен включать проработку АРХИТЕКТУРЫ ДАННЫХ и БАЗ ДАННЫХ, так как архитектурные решения напрямую продиктованы структурой и моделью данных.

Core Instruction: При проектировании опирайся на тактики для атрибутов качества:

Доступность (Availability): Active-Passive, Active-Active, Circuit Breaker, Bulkhead, Throttling, Multi-Region Replication.
Производительность (Performance): Caching (Write-through/behind), Sharding, Async Processing, Compression, CDN, Read Replicas, Materialized Views.
Безопасность (Security): OAuth2, mTLS, WAF, Encryption at Rest/Transit, DDoS Protection, Row-Level Security, Data Masking.
Модифицируемость (Modifiability): API Gateway, Hexagonal Architecture, Event-Driven, Microkernels, Schema Versioning.
Масштабируемость (Scalability): Horizontal/Vertical Scaling, Queue-based Load Leveling, Database Partitioning, Sharding, CQRS.
Тестируемость (Testability): Contract Testing, Chaos Engineering hooks, Observability agents, Test Data Management.

Категории паттернов для рекомендаций:
1. Макро-архитектура: Monolithic, Microservices, Serverless, SOA, Event-Driven Architecture.
2. Обмен данными: Event-Driven, CQRS, Event Sourcing, API Gateway / BFF, Saga Pattern.
3. Структурные: Layered / N-Tier, Hexagonal / Clean Architecture, Micro Frontends.
4. Работа с данными: Database per Service, Sharding / Replication, Polyglot Persistence, CDC, Data Lake/Warehouse.
5. Инфраструктурные: Circuit Breaker, Sidecar, Blue-Green / Canary Deployment, Service Mesh.

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ К КЕЙСАМ:

1. **Проработка Баз Данных и Моделей Данных:**
   - Опиши структуру данных и их взаимосвязи
   - Укажи типы данных (транзакционные, аналитические, временные ряды, графы, документы)
   - Обоснуй выбор типа БД (SQL vs NoSQL vs NewSQL vs Hybrid)
   - Опиши паттерны работы с данными (Sharding, Replication, Partitioning, Denormalization)
   - Укажи объемы данных и требования к консистентности (CAP theorem)

2. **Связь Данных и Архитектуры:**
   - Как модель данных влияет на выбор архитектурного стиля
   - Какие компоненты отвечают за управление данными
   - Как обеспечивается консистентность данных между сервисами
   - Стратегии миграции и версионирования схем

3. **Примеры Сценариев с Данными:**
   - FinTech: транзакции, ACID, аудит, compliance, temporal data
   - E-commerce: каталог товаров, инвентарь, заказы, рекомендации
   - IoT: временные ряды, телеметрия, агрегация, stream processing
   - Social Media: графы пользователей, лента новостей, поиск
   - Analytics: Data Lake, ETL/ELT, OLAP, real-time analytics

Создай УНИКАЛЬНЫЙ бизнес-кейс с ГЛУБОКОЙ проработкой данных.
Уровень сложности: ${difficulty}.

Верни ответ ТОЛЬКО в формате JSON:
  {
    "id": "уникальный_id_${Date.now()}",
    "title": "Креативное и Профессиональное Название",
    "difficulty": "${difficulty}",
    "description": "Общее описание бизнес-проблемы с акцентом на данные и их роль в системе",
    "businessRequirements": [
      "требование 1 (включая требования к данным)",
      "требование 2 (объемы, консистентность, latency)"
    ],
    "qualityAttributes": [
      "атрибут 1",
      "атрибут 2"
    ],
    "suitablePatterns": [
      {
        "category": "Работа с данными",
        "patterns": [
           { 
             "name": "Database Sharding",
             "description": "Краткое описание сути паттерна.",
             "implementation": "Подробная пошаговая инструкция:\\n1. Определите ключ шардирования (например, user_id).\\n2. Создайте несколько экземпляров БД.\\n3. Настройте роутинг запросов на основе ключа.\\n4. Реализуйте механизм ребалансировки.",
             "benefits": "Что конкретно дает: горизонтальное масштабирование, изоляция данных, улучшение производительности."
           }
        ]
      },
      {
        "category": "Макро-архитектура",
        "patterns": [
           { 
             "name": "Microservices with Database per Service",
             "description": "Каждый микросервис владеет своей БД.",
             "implementation": "1. Выделите bounded contexts.\\n2. Создайте отдельную БД для каждого сервиса.\\n3. Используйте API для межсервисного взаимодействия.\\n4. Реализуйте Saga для распределенных транзакций.",
             "benefits": "Автономность сервисов, независимое масштабирование, polyglot persistence."
           }
        ]
      }
    ],
    "expectedComponents": [
       {
         "name": "PostgreSQL Cluster (Primary + Replicas)",
         "type": "database",
         "description": "Основная транзакционная БД для хранения заказов, пользователей. Используется master-slave репликация для read scaling. Партиционирование по дате для архивных данных.",
         "connections": "Принимает запросы от Order Service и User Service через connection pool. Реплики используются для аналитических запросов."
       },
       {
         "name": "Redis Cache",
         "type": "cache",
         "description": "In-memory кэш для сессий пользователей, каталога товаров, результатов частых запросов. TTL 5-60 минут в зависимости от типа данных.",
         "connections": "Используется всеми сервисами через Redis client. Инвалидация через pub/sub при обновлении данных."
       },
       {
         "name": "Kafka Event Stream",
         "type": "message-broker",
         "description": "Distributed log для событий изменения данных (CDC), интеграции между сервисами, аудита. Retention 7 дней.",
         "connections": "Producers: все сервисы при изменении данных. Consumers: Analytics Service, Audit Service, Notification Service."
       }
    ],
    "recommendedTactics": [
      {
        "attribute": "Производительность",
        "tactics": [
          {
            "title": "Read Replicas для масштабирования чтения",
            "instruction": "1. Добавьте 2-3 read replica для PostgreSQL.\\n2. Настройте read-only подключения в приложении.\\n3. Используйте connection pooler (PgBouncer).\\n4. Это снизит нагрузку на master и улучшит latency для read-heavy операций."
          },
          {
            "title": "Materialized Views для аналитики",
            "instruction": "1. Создайте materialized views для сложных агрегаций.\\n2. Настройте автоматическое обновление (REFRESH MATERIALIZED VIEW).\\n3. Индексируйте views для быстрого доступа.\\n4. Это ускорит аналитические запросы в 10-100 раз."
          }
        ]
      },
      {
        "attribute": "Масштабируемость",
        "tactics": [
          {
            "title": "Database Sharding по customer_id",
            "instruction": "1. Разделите данные на шарды по customer_id (hash-based).\\n2. Используйте Vitess или Citus для управления шардами.\\n3. Реализуйте routing layer в приложении.\\n4. Это позволит горизонтально масштабировать БД при росте пользователей."
          }
        ]
      },
      {
        "attribute": "Доступность",
        "tactics": [
          {
            "title": "Multi-Region Database Replication",
            "instruction": "1. Настройте асинхронную репликацию в другой регион.\\n2. Используйте Global Load Balancer для failover.\\n3. Реализуйте conflict resolution для eventual consistency.\\n4. Это обеспечит disaster recovery и снизит latency для глобальных пользователей."
          }
        ]
      }
    ]
  }

Будь креативным и ОБЯЗАТЕЛЬНО включай глубокую проработку баз данных и моделей данных.
Для каждого атрибута качества предложи 2-3 тактики, связанные с данными.
В "expectedComponents" детально опиши компоненты для работы с данными (БД, кэши, очереди, data pipelines).
В "recommendedTactics" дай конкретные советы по оптимизации работы с данными.
Верни только JSON.`

  try {
    const { result } = await getAvailableModel(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI не вернул валидный JSON')

    const parsed = JSON.parse(jsonMatch[0])
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
