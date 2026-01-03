import { ComponentType } from '../types'

export interface ComparisonMetric {
    name: string
    label: string
    description: string
    type: 'rating' | 'text' | 'boolean'
}

export interface ComparisonVendor {
    id: string
    name: string
    description: string
    metrics: Record<string, any>
}

export interface ComparisonCategory {
    componentType: ComponentType
    metrics: ComparisonMetric[]
    vendors: ComparisonVendor[]
}

export const comparisonData: Record<string, ComparisonCategory> = {
    database: {
        componentType: 'database',
        metrics: [
            { name: 'scalability', label: 'Масштабируемость', description: 'Способность обрабатывать растущую нагрузку', type: 'rating' },
            { name: 'performance_reads', label: 'Скорость чтения', description: 'Производительность при запросах на чтение', type: 'rating' },
            { name: 'performance_writes', label: 'Скорость записи', description: 'Производительность при сохранении данных', type: 'rating' },
            { name: 'acid', label: 'ACID комплаенс', description: 'Гарантии транзакционности', type: 'boolean' },
            { name: 'complexity', label: 'Сложность управления', description: 'Трудозатраты на поддержку и настройку', type: 'rating' },
            { name: 'cost', label: 'Стоимость', description: 'Лицензии и TCO', type: 'text' },
        ],
        vendors: [
            {
                id: 'postgresql',
                name: 'PostgreSQL',
                description: 'Мощная объектно-реляционная база данных с открытым исходным кодом.',
                metrics: { scalability: 4, performance_reads: 4, performance_writes: 4, acid: true, complexity: 3, cost: 'Бесплатно (Open Source)' }
            },
            {
                id: 'mongodb',
                name: 'MongoDB',
                description: 'Гибкая документо-ориентированная NoSQL база данных.',
                metrics: { scalability: 5, performance_reads: 5, performance_writes: 5, acid: true, complexity: 2, cost: 'Бесплатно (Community Edition)' }
            },
            {
                id: 'mysql',
                name: 'MySQL',
                description: 'Самая популярная реляционная БД с открытым кодом.',
                metrics: { scalability: 3, performance_reads: 5, performance_writes: 4, acid: true, complexity: 2, cost: 'Бесплатно (Open Source)' }
            },
            {
                id: 'cassandra',
                name: 'Cassandra',
                description: 'Высокомасштабируемая NoSQL БД для огромных объемов данных.',
                metrics: { scalability: 5, performance_reads: 4, performance_writes: 5, acid: false, complexity: 5, cost: 'Бесплатно (Open Source)' }
            }
        ]
    },
    'message-broker': {
        componentType: 'message-broker',
        metrics: [
            { name: 'throughput', label: 'Пропускная способность', description: 'Объем сообщений в секунду', type: 'rating' },
            { name: 'latency', label: 'Задержка', description: 'Время доставки сообщения', type: 'rating' },
            { name: 'persistence', label: 'Персистентность', description: 'Гарантия сохранности на диске', type: 'boolean' },
            { name: 'ordering', label: 'Гарантия порядка', description: 'Соблюдение очередности сообщений', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'kafka',
                name: 'Apache Kafka',
                description: 'Платформа потоковой передачи событий для высоких нагрузок.',
                metrics: { throughput: 5, latency: 4, persistence: true, ordering: true }
            },
            {
                id: 'rabbitmq',
                name: 'RabbitMQ',
                description: 'Универсальный и надежный брокер сообщений.',
                metrics: { throughput: 4, latency: 5, persistence: true, ordering: true }
            },
            {
                id: 'nats',
                name: 'NATS',
                description: 'Легковесная и очень быстрая система обмена сообщениями.',
                metrics: { throughput: 5, latency: 5, persistence: false, ordering: false }
            }
        ]
    },
    'llm-model': {
        componentType: 'llm-model',
        metrics: [
            { name: 'reasoning', label: 'Рассуждения', description: 'Способность к решению сложных логических задач', type: 'rating' },
            { name: 'context_window', label: 'Окно контекста', description: 'Максимальный объем входных данных', type: 'text' },
            { name: 'speed', label: 'Скорость', description: 'Токены в секунду', type: 'rating' },
            { name: 'price', label: 'Цена', description: 'Стоимость за 1 млн токенов', type: 'text' },
        ],
        vendors: [
            {
                id: 'gpt-4o',
                name: 'GPT-4o (OpenAI)',
                description: 'Флагманская модель от OpenAI с мультимодальными возможностями.',
                metrics: { reasoning: 5, context_window: '128k', speed: 4, price: '$5 / $15' }
            },
            {
                id: 'claude-3-5-sonnet',
                name: 'Claude 3.5 Sonnet (Anthropic)',
                description: 'Высокопроизводительная модель с отличным качеством кодинга.',
                metrics: { reasoning: 5, context_window: '200k', speed: 4, price: '$3 / $15' }
            },
            {
                id: 'llama-3-1-405b',
                name: 'Llama 3.1 405B (Meta)',
                description: 'Самая мощная Open Source модель в мире.',
                metrics: { reasoning: 5, context_window: '128k', speed: 3, price: 'Бесплатно (Self-hosted)' }
            }
        ]
    },
    'search-engine': {
        componentType: 'search-engine',
        metrics: [
            { name: 'full_text_search', label: 'Полнотекстовый поиск', description: 'Качество и возможности поиска текста', type: 'rating' },
            { name: 'indexing_speed', label: 'Скорость индексации', description: 'Скорость добавления новых данных', type: 'rating' },
            { name: 'query_speed', label: 'Скорость запросов', description: 'Скорость выполнения поисковых запросов', type: 'rating' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Возможность работы в кластере', type: 'rating' },
            { name: 'complexity', label: 'Сложность', description: 'Сложность настройки и поддержки', type: 'rating' },
        ],
        vendors: [
            {
                id: 'elasticsearch',
                name: 'Elasticsearch',
                description: 'Распределенный поисковый и аналитический движок.',
                metrics: { full_text_search: 5, indexing_speed: 4, query_speed: 5, scalability: 5, complexity: 4 }
            },
            {
                id: 'opensearch',
                name: 'OpenSearch',
                description: 'Open source форк Elasticsearch от Amazon.',
                metrics: { full_text_search: 5, indexing_speed: 4, query_speed: 5, scalability: 5, complexity: 4 }
            },
            {
                id: 'algolia',
                name: 'Algolia',
                description: 'Поиск как услуга (SaaS) с акцентом на скорость и UX.',
                metrics: { full_text_search: 4, indexing_speed: 5, query_speed: 5, scalability: 5, complexity: 1 }
            }
        ]
    },
    'data-warehouse': {
        componentType: 'data-warehouse',
        metrics: [
            { name: 'analytics_speed', label: 'Аналитические запросы', description: 'Скорость выполнения сложных агрегаций', type: 'rating' },
            { name: 'storage_cost', label: 'Стоимость хранения', description: 'Цена за ГБ данных', type: 'rating' },
            { name: 'concurrency', label: 'Конкурентность', description: 'Количество одновременных запросов', type: 'rating' },
            { name: 'ecosystem', label: 'Экосистема', description: 'Интеграция с BI инструментами', type: 'rating' },
        ],
        vendors: [
            {
                id: 'snowflake',
                name: 'Snowflake',
                description: 'Облачное хранилище данных с разделением вычислений и хранения.',
                metrics: { analytics_speed: 5, storage_cost: 3, concurrency: 5, ecosystem: 5 }
            },
            {
                id: 'bigquery',
                name: 'Google BigQuery',
                description: 'Serverless хранилище данных от Google Cloud.',
                metrics: { analytics_speed: 5, storage_cost: 4, concurrency: 4, ecosystem: 5 }
            },
            {
                id: 'clickhouse',
                name: 'ClickHouse',
                description: 'Быстрая колоночная СУБД для аналитики в реальном времени.',
                metrics: { analytics_speed: 5, storage_cost: 5, concurrency: 3, ecosystem: 4 }
            }
        ]
    },
    'queue': {
        componentType: 'queue',
        metrics: [
            { name: 'delivery_guarantee', label: 'Гарантии доставки', description: 'At-least-once, Exactly-once', type: 'text' },
            { name: 'throughput', label: 'Пропускная способность', description: 'Сообщений в секунду', type: 'rating' },
            { name: 'priority', label: 'Приоритеты', description: 'Поддержка приоритетных очередей', type: 'boolean' },
            { name: 'complexity', label: 'Сложность', description: 'Сложность настройки и поддержки', type: 'rating' },
        ],
        vendors: [
            {
                id: 'rabbitmq',
                name: 'RabbitMQ',
                description: 'Популярный Open Source брокер сообщений (AMQP).',
                metrics: { delivery_guarantee: 'At-least-once', throughput: 4, priority: true, complexity: 3 }
            },
            {
                id: 'amazon-sqs',
                name: 'Amazon SQS',
                description: 'Полностью управляемый сервис очередей от AWS.',
                metrics: { delivery_guarantee: 'At-least-once', throughput: 5, priority: true, complexity: 1 }
            },
            {
                id: 'activemq',
                name: 'ActiveMQ',
                description: 'Классический Java Message Service (JMS) брокер.',
                metrics: { delivery_guarantee: 'Exactly-once (XA)', throughput: 3, priority: true, complexity: 4 }
            }
        ]
    },
    'cache': {
        componentType: 'cache',
        metrics: [
            { name: 'performance', label: 'Производительность', description: 'Скорость операций чтения/записи', type: 'rating' },
            { name: 'data_types', label: 'Типы данных', description: 'Поддержка сложных структур данных', type: 'rating' },
            { name: 'persistence', label: 'Персистентность', description: 'Возможность сохранения на диск', type: 'boolean' },
            { name: 'clustering', label: 'Кластеризация', description: 'Возможности масштабирования', type: 'rating' },
        ],
        vendors: [
            {
                id: 'redis',
                name: 'Redis',
                description: 'Сверхбыстрое in-memory хранилище структур данных.',
                metrics: { performance: 5, data_types: 5, persistence: true, clustering: 4 }
            },
            {
                id: 'memcached',
                name: 'Memcached',
                description: 'Простая и быстрая система кэширования объектов в памяти.',
                metrics: { performance: 5, data_types: 1, persistence: false, clustering: 3 }
            },
            {
                id: 'hazelcast',
                name: 'Hazelcast',
                description: 'Распределенная in-memory вычислительная платформа.',
                metrics: { performance: 4, data_types: 4, persistence: true, clustering: 5 }
            }
        ]
    },
    'etl-service': {
        componentType: 'etl-service',
        metrics: [
            { name: 'connectors', label: 'Коннекторы', description: 'Количество готовых источников и приемников', type: 'text' },
            { name: 'ease_of_use', label: 'Простота использования', description: 'Удобство UI и настройки', type: 'rating' },
            { name: 'realtime', label: 'Real-time', description: 'Поддержка потоковой передачи данных', type: 'boolean' },
            { name: 'price', label: 'Цена', description: 'Модель ценообразования', type: 'text' },
        ],
        vendors: [
            {
                id: 'airbyte',
                name: 'Airbyte',
                description: 'Ведущая Open Source платформа интеграции данных.',
                metrics: { connectors: '350+', ease_of_use: 4, realtime: false, price: 'Бесплатно / Cloud' }
            },
            {
                id: 'fivetran',
                name: 'Fivetran',
                description: 'Автоматизированная платформа перемещения данных (ELT).',
                metrics: { connectors: '500+', ease_of_use: 5, realtime: true, price: 'Высокая (Volume-based)' }
            },
            {
                id: 'talend',
                name: 'Talend',
                description: 'Enterprise платформа для интеграции и управления данными.',
                metrics: { connectors: '1000+', ease_of_use: 3, realtime: true, price: 'Лицензия' }
            }
        ]
    },
    'stream-processor': {
        componentType: 'stream-processor',
        metrics: [
            { name: 'latency', label: 'Задержка', description: 'Скорость обработки событий', type: 'text' },
            { name: 'state_management', label: 'Управление состоянием', description: 'Работа с stateful операциями', type: 'rating' },
            { name: 'windowing', label: 'Оконные функции', description: 'Гибкость работы с временными окнами', type: 'rating' },
            { name: 'ecosystem', label: 'Экосистема', description: 'Интеграция с другими инстурментами', type: 'rating' },
        ],
        vendors: [
            {
                id: 'kafka-streams',
                name: 'Kafka Streams',
                description: 'Библиотека для создания потоковых приложений на базе Kafka.',
                metrics: { latency: 'Миллисекунды', state_management: 4, windowing: 4, ecosystem: 5 }
            },
            {
                id: 'apache-flink',
                name: 'Apache Flink',
                description: 'Фреймворк для мощной потоковой обработки с низкой задержкой.',
                metrics: { latency: 'Суб-миллисекунды', state_management: 5, windowing: 5, ecosystem: 4 }
            },
            {
                id: 'apache-spark',
                name: 'Spark Streaming',
                description: 'Микро-батчевая обработка в экосистеме Spark.',
                metrics: { latency: 'Секунды', state_management: 3, windowing: 3, ecosystem: 5 }
            }
        ]
    },
    'api-gateway': {
        componentType: 'api-gateway',
        metrics: [
            { name: 'performance', label: 'Производительность', description: 'Overhead на запрос', type: 'rating' },
            { name: 'flexibility', label: 'Гибкость', description: 'Возможности плагинов и кастомизации', type: 'rating' },
            { name: 'deployment', label: 'Варианты развертывания', description: 'Cloud, On-premise, Hybrid', type: 'text' },
            { name: 'security', label: 'Безопасность', description: 'Встроенные функции защиты', type: 'rating' },
        ],
        vendors: [
            {
                id: 'kong',
                name: 'Kong Gateway',
                description: 'Самый популярный Open Source API Gateway.',
                metrics: { performance: 5, flexibility: 5, deployment: 'Any', security: 4 }
            },
            {
                id: 'aws-api-gateway',
                name: 'AWS API Gateway',
                description: 'Полностью управляемый сервис от AWS.',
                metrics: { performance: 4, flexibility: 3, deployment: 'AWS Cloud', security: 5 }
            },
            {
                id: 'apigee',
                name: 'Apigee (Google)',
                description: 'Платформа управления API для Enterprise сектора.',
                metrics: { performance: 4, flexibility: 5, deployment: 'Hybrid / Cloud', security: 5 }
            }
        ]
    },
    'batch-processor': {
        componentType: 'batch-processor',
        metrics: [
            { name: 'orchestration', label: 'Оркестрация', description: 'Управление зависимостями задач (DAGs)', type: 'rating' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Параллельное выполнение задач', type: 'rating' },
            { name: 'usability', label: 'Удобство', description: 'UI мониторинга и отладки', type: 'rating' },
            { name: 'code_based', label: 'Code-based', description: 'Определение процессов через код (Python)', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'apache-airflow',
                name: 'Apache Airflow',
                description: 'Стандарт де-факто для оркестрации рабочих процессов.',
                metrics: { orchestration: 5, scalability: 4, usability: 4, code_based: true }
            },
            {
                id: 'prefect',
                name: 'Prefect',
                description: 'Современный оркестратор с фокусом на DX и гибридное исполнение.',
                metrics: { orchestration: 4, scalability: 5, usability: 5, code_based: true }
            },
            {
                id: 'dagster',
                name: 'Dagster',
                description: 'Оркестратор с фокусом на данные и тестирование пайплайнов.',
                metrics: { orchestration: 5, scalability: 4, usability: 4, code_based: true }
            }
        ]
    }
}

export interface RecommendationScenario {
    id: string
    label: string
    description: string
    recommendedTypes: ComponentType[]
    recommendedVendors: string[] // vendor IDs
    reasoning: string
}

export const recommendationScenarios: RecommendationScenario[] = [
    {
        id: 'transactional',
        label: 'Транзакционные нагрузки (OLTP)',
        description: 'Высокая частота небольших транзакций, строгая согласованность данных (ACID).',
        recommendedTypes: ['database'],
        recommendedVendors: ['postgresql', 'mysql', 'sql-server'],
        reasoning: 'Для OLTP нагрузок лучше всего подходят реляционные базы данных, обеспечивающие ACID транзакции и надежность хранения строк.'
    },
    {
        id: 'analytical',
        label: 'Аналитические запросы (OLAP)',
        description: 'Сложные выборки по большим объемам данных, агрегации, отчетность.',
        recommendedTypes: ['data-warehouse', 'database'],
        recommendedVendors: ['snowflake', 'bigquery', 'clickhouse'],
        reasoning: 'Колоночные базы данных и хранилища данных (DWH) оптимизированы для чтения и агрегации больших массивов данных.'
    },
    {
        id: 'search',
        label: 'Полнотекстовый поиск',
        description: 'Быстрый поиск по тексту, фасетная навигация, ранжирование результатов.',
        recommendedTypes: ['search-engine'],
        recommendedVendors: ['elasticsearch', 'opensearch', 'algolia'],
        reasoning: 'Специализированные поисковые движки используют обратные индексы для мгновенного поиска по текстовым данным.'
    },
    {
        id: 'bigdata-nosql',
        label: 'Высоконагруженная запись / Big Data',
        description: 'Миллионы событий в секунду, гибкая схема данных, горизонтальное масштабирование.',
        recommendedTypes: ['database'],
        recommendedVendors: ['cassandra', 'mongodb', 'dynamodb'],
        reasoning: 'NoSQL базы данных (особенно семейство Wide Column и Document) обеспечивают высокую доступность и скорость записи при горизонтальном масштабировании.'
    },
    {
        id: 'data-integration',
        label: 'Интеграция данных (ETL/ELT)',
        description: 'Перемещение данных между системами, нормализация, загрузка в DWH.',
        recommendedTypes: ['etl-service'],
        recommendedVendors: ['airbyte', 'fivetran', 'talend'],
        reasoning: 'Специализированные ETL-инструменты предоставляют сотни готовых коннекторов и управляют надежностью передачи данных.'
    },
    {
        id: 'stream-processing',
        label: 'Потоковая обработка (Streaming)',
        description: 'Обработка событий в реальном времени, оконные функции, агрегации на лету.',
        recommendedTypes: ['message-broker', 'stream-processor'],
        recommendedVendors: ['kafka', 'kafka-streams', 'apache-flink'],
        reasoning: 'Использование брокера для буферизации (Kafka) и потокового движка (Flink/Streams) позволяет обрабатывать данные с минимальной задержкой.'
    },
    {
        id: 'api-management',
        label: 'Управление API',
        description: 'Единая точка входа, аутентификация, rate limiting, мониторинг API.',
        recommendedTypes: ['api-gateway'],
        recommendedVendors: ['kong', 'aws-api-gateway', 'apigee'],
        reasoning: 'API Gateway централизует сквозную функциональность (безопасность, лимиты), разгружая микросервисы.'
    },
    {
        id: 'task-orchestration',
        label: 'Оркестрация задач',
        description: 'Планирование и выполнение зависимых задач по расписанию (DAGs).',
        recommendedTypes: ['batch-processor'],
        recommendedVendors: ['apache-airflow', 'prefect', 'dagster'],
        reasoning: 'Оркестраторы рабочих процессов (Workflow Engines) позволяют описывать сложные зависимости между задачами и мониторить их исполнение.'
    },
    {
        id: 'caching',
        label: 'Кэширование',
        description: 'Ускорение доступа к часто запрашиваемым данным, снижение нагрузки на БД.',
        recommendedTypes: ['cache'],
        recommendedVendors: ['redis', 'memcached', 'hazelcast'],
        reasoning: 'In-memory хранилища обеспечивают суб-миллисекундный доступ к данным, что критично для высоконагруженных систем.'
    },
    {
        id: 'async-processing',
        label: 'Асинхронная обработка',
        description: 'Отложенное выполнение задач, развязывание сервисов, сглаживание пиков нагрузки.',
        recommendedTypes: ['queue', 'message-broker'], // Добавляем queue
        recommendedVendors: ['rabbitmq', 'amazon-sqs', 'kafka'],
        reasoning: 'Очереди сообщений позволяют сервисам не блокироваться при отправке задач и гарантируют, что задача будет обработана консьюмером.'
    }
]
