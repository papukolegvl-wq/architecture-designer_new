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

  const defaultPrompt = `Ты выступаешь в роли ведущего эксперта-архитектора мирового уровня (Principal Enterprise Architect & CTO level).
Твоя специализация охватывает все современные методологии (Cloud Native, Microservices, Modular Monolith, Domain-Driven Design), паттерны (Saga, CQRS, Event Sourcing), инструменты (Kubernetes, Terraform, Service Mesh) и фреймворки.
Твоя задача: провести глубокий и комплексный архитектурный обзор системы.

Для каждого аспекта ты обязан:
1. Дать структурированное объяснение: почему это хорошо или плохо.
2. Привести конкретные практические примеры реализации (включая упоминание конкретных технологий: Kafka, Redis, PostgreSQL, gRPC и т.д.).
3. Описать альтернативные подходы и объяснить, почему тот или иной вариант лучше в данном контексте (Trade-off analysis).
4. Если есть проблемы — сформировать четкий пошаговый план улучшения с обоснованием каждого шага.

Проанализируй следующую архитектуру с точки зрения этих высоких стандартов:

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

  const defaultPrompt = `Ты выступаешь в роли ведущего эксперта-архитектора мирового уровня (Principal Enterprise Architect).
Твоя цель: превратить текущее решение в эталонную архитектуру.
Используй свою глубокую экспертизу в Cloud Native, Security (Zero Trust), High Availability и Scalability.

Проанализируй архитектуру и предложи улучшения. Твой ответ должен быть максимально подробным и обучающим.

ДЛЯ КАЖДОЙ РЕКОМЕНДАЦИИ:
1. **Контекст и проблема**: Объясни, почему текущее решение неоптимально.
2. **Решение (Solution)**: Четко опиши, что нужно сделать. Называй конкретные паттерны (например, "Circuit Breaker", "Outbox Pattern").
3. **Технологический стек**: Предложи конкретные инструменты (например, "Используй Istio для mTLS", "Замени REST на gRPC для внутренних вызовов").
4. **Step-by-Step Plan**: Дай пошаговый алгоритм внедрения этого изменения.

Текущая архитектура:

Текущая архитектура:
${architectureDescription}

${improvementPrompt ? `Требования к улучшению: ${improvementPrompt}` : 'Улучши архитектуру, добавив недостающие компоненты, оптимизировав соединения и следуя best practices.'}

Предоставь рекомендации в понятном и интуитивном формате. Для каждого предложения укажи:

1. **Какие компоненты добавить:**
   - Название компонента и его тип (например: "API Gateway", "Кэш Redis", "Балансировщик нагрузки")
   - Зачем он нужен и какую проблему решает
   - Где его лучше разместить в архитектуре

2. **Что с чем соединить:**
   - Какие компоненты нужно соединить
   - Тип соединения (REST API, асинхронное сообщение, подключение к БД и т.д.)
   - Зачем это соединение нужно и какую пользу оно принесет

3. **Объяснение:**
   - Почему именно эти изменения улучшат архитектуру
   - Какие конкретные преимущества это даст (производительность, масштабируемость, надежность и т.д.)

Доступные типы компонентов: service, database, message-broker, api-gateway, cache, load-balancer, frontend, auth-service, cdn, object-storage, data-warehouse, lambda, firewall, esb, monitoring, logging, queue, event-bus, и другие.

Доступные типы соединений: rest, grpc, async, database-connection, cache-connection, database-replication.

Опиши рекомендации простым и понятным языком, как будто объясняешь коллеге.

Структурируй свой ответ, используя следующие теги:

<BLOCK:RECOMMENDATIONS>
Список конкретных рекомендаций по улучшению.
</BLOCK:RECOMMENDATIONS>

<BLOCK:ISSUES>
Найденные проблемы, которые исправляют эти рекомендации.
</BLOCK:ISSUES>

<BLOCK:ANSWER>
Общее объяснение и преимущества предлагаемых изменений.
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

  const prompt = `Ты — ведущий эксперт-архитектор (Principal Architect). Твоя задача — дать исчерпывающий, глубокий профессиональный ответ.
Не ограничивайся поверхностными суждениями. Копай вглубь. Используй терминологию (CAP-теорема, уровни изоляции транзакций, виды консистентности и т.д.).

Отвечая на вопрос:
1. Дай прямой ответ.
2. Приведи аргументы "За" и "Против" (Pros & Cons).
3. Приведи пример из реальной практики (Real-world scenario).
4. Если уместно, предложи альтернативные подходы.

Вопрос пользователя на основе следующей архитектуры:

    Архитектура:
${architectureDescription}

Вопрос пользователя: ${question}

Дай развернутый ответ.Структурируй его, используя следующие теги(используй только те, которые уместны):

  <BLOCK: ANSWER >
    Твой прямой ответ на вопрос и объяснения.
</BLOCK:ANSWER>

      < BLOCK: RECOMMENDATIONS >
        Конкретные рекомендации по улучшению(если есть).
</BLOCK:RECOMMENDATIONS>

          < BLOCK: ISSUES >
            Ошибки, риски или проблемы, найденные в архитектуре(если есть).
</BLOCK:ISSUES>

Не пиши ничего вне этих блоков.`

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

  const prompt = `Ты — эксперт по High Load системам, Cost Optimization и Performance Engineering.
Твоя задача: найти "узкие места" и предложить решения для кратного роста производительности или снижения затрат.

Используй методики FinOps и Performance Tuning.
Для каждого предложения:
- Объясни физику процесса (почему здесь тормозит или почему это дорого).
- Предложи решение (архитектурный паттерн, настройка, смена технологии).
- Опиши ожидаемый эффект (например, "снижение латентности на 30%", "уменьшение bill на 20%").

Проанализируй архитектуру:

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

// Генерация бизнес-кейса для обучения
export async function generateArchitectureCase(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
): Promise<ArchitectureCase> {
  if (!genAI) {
    throw new Error('Gemini не инициализирован. Укажите API ключ.')
  }

  const prompt = `Ты — строгий экзаменатор уровня Principal Architect в Big Tech компании.
Твоя задача: создать архитектурный челлендж (Business Case), который проверит глубину знаний кандидата.

Кейс должен быть:
- Реалистичным (ситуация из жизни Enterprise).
- Сложным (содержать скрытые проблемы, противоречивые требования).
- Требовать компромиссов (Trade-offs), например, "Скорость vs Надежность".

Создай интересную архитектурную задачу (бизнес-кейс) для обучения.
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
      summary: 'API ключ не установлен. Пожалуйста, настройте ключ Gemini API.'
    }
  }

  const architectureDescription = architectureToText(nodes, edges)

  const prompt = `Ты — Principal Architect, проводящий Architecture Review Committee.
Наша цель — не пропустить в продакшн слабое решение.
Ты должен быть максимально требовательным, но конструктивным.

Твой анализ должен включать:
1. **Глубокий разбор**: Оцени не только наличие компонентов, но и связи, выбор технологий, паттерны.
2. **Trade-off Analysis**: Правильно ли выбраны компромиссы?
3. **Безопасность и Надежность**: Найди уязвимости и единые точки отказа.
4. **Вердикт**: Четкий и обоснованный.

Оцени решение пользователя для следующей задачи.
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
