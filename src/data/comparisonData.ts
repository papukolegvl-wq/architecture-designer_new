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
    },
    'object-storage': {
        componentType: 'object-storage',
        metrics: [
            { name: 'durability', label: 'Надежность (Durability)', description: 'Гарантия сохранности данных', type: 'text' },
            { name: 'availability', label: 'Доступность', description: 'SLA доступности сервиса', type: 'text' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Способность хранить петабайты данных', type: 'rating' },
            { name: 'cost', label: 'Стоимость', description: 'Цена за ГБ/месяц', type: 'text' },
        ],
        vendors: [
            {
                id: 'aws-s3',
                name: 'Amazon S3',
                description: 'Индустриальный стандарт объектного хранилища.',
                metrics: { durability: '99.999999999%', availability: '99.99%', scalability: 5, cost: 'От $0.023 / GB' }
            },
            {
                id: 'azure-blob',
                name: 'Azure Blob Storage',
                description: 'Объектное хранилище от Microsoft Azure.',
                metrics: { durability: '99.999999999%', availability: '99.9%', scalability: 5, cost: 'От $0.018 / GB' }
            },
            {
                id: 'gcs',
                name: 'Google Cloud Storage',
                description: 'Высокопроизводительное хранилище от Google.',
                metrics: { durability: '99.999999999%', availability: '99.9%', scalability: 5, cost: 'От $0.020 / GB' }
            },
            {
                id: 'minio',
                name: 'MinIO',
                description: 'Высокопроизводительное S3-совместимое хранилище (On-premise).',
                metrics: { durability: 'Управляется вами', availability: 'Управляется вами', scalability: 4, cost: 'Бесплатно / Лицензия' }
            }
        ]
    },
    'firewall': {
        componentType: 'firewall',
        metrics: [
            { name: 'protection_layers', label: 'Уровни защиты', description: 'L3/L4/L7 защита', type: 'text' },
            { name: 'throughput', label: 'Пропускная способность', description: 'Максимальный объем трафика', type: 'rating' },
            { name: 'waf_capabilities', label: 'WAF функции', description: 'Защита от SQLi, XSS и др.', type: 'rating' },
            { name: 'ease_of_management', label: 'Удобство управления', description: 'Настройка правил и мониторинг', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-waf',
                name: 'AWS WAF',
                description: 'Файрвол веб-приложений от Amazon.',
                metrics: { protection_layers: 'L7', throughput: 5, waf_capabilities: 4, ease_of_management: 4 }
            },
            {
                id: 'cloudflare-waf',
                name: 'Cloudflare WAF',
                description: 'Передовая защита на уровне Edge с огромной сетью.',
                metrics: { protection_layers: 'L3-L7', throughput: 5, waf_capabilities: 5, ease_of_management: 5 }
            },
            {
                id: 'check-point',
                name: 'Check Point Quantum',
                description: 'Классический аппаратный и облачный сетевой файрвол.',
                metrics: { protection_layers: 'L3-L7', throughput: 4, waf_capabilities: 4, ease_of_management: 3 }
            }
        ]
    },
    'load-balancer': {
        componentType: 'load-balancer',
        metrics: [
            { name: 'algorithms', label: 'Алгоритмы', description: 'Round Robin, Least Conn, и др.', type: 'text' },
            { name: 'layer', label: 'Уровни (OSI)', description: 'L4 (TCP) или L7 (HTTP)', type: 'text' },
            { name: 'ssl_termination', label: 'SSL Termination', description: 'Разгрузка SSL на балансировщик', type: 'boolean' },
            { name: 'performance', label: 'Производительность', description: 'Запросы в секунду', type: 'rating' },
        ],
        vendors: [
            {
                id: 'nginx',
                name: 'NGINX',
                description: 'Самый популярный софтверный балансировщик и прокси.',
                metrics: { algorithms: 'Множество', layer: 'L4/L7', ssl_termination: true, performance: 5 }
            },
            {
                id: 'haproxy',
                name: 'HAProxy',
                description: 'Надежный и производительный балансировщик с фокусом на L4/L7.',
                metrics: { algorithms: 'Все современные', layer: 'L4/L7', ssl_termination: true, performance: 5 }
            },
            {
                id: 'aws-alb',
                name: 'AWS Application Load Balancer',
                description: 'Управляемый L7 балансировщик от AWS.',
                metrics: { algorithms: 'RR, LOR', layer: 'L7', ssl_termination: true, performance: 4 }
            }
        ]
    },
    'cdn': {
        componentType: 'cdn',
        metrics: [
            { name: 'nodes_count', label: 'Точки присутствия (PoPs)', description: 'Географическое покрытие', type: 'rating' },
            { name: 'cache_purge_speed', label: 'Скорость очистки кэша', description: 'Как быстро кэш обновляется', type: 'rating' },
            { name: 'edge_computing', label: 'Edge Computing', description: 'Выполнение кода на границе сети', type: 'boolean' },
            { name: 'cost', label: 'Стоимость трафика', description: 'Цена за ТБ', type: 'text' },
        ],
        vendors: [
            {
                id: 'cloudflare',
                name: 'Cloudflare',
                description: 'Глобальная сеть с фокусом на скорость и безопасность.',
                metrics: { nodes_count: 5, cache_purge_speed: 5, edge_computing: true, cost: 'От $0 (Free Tier)' }
            },
            {
                id: 'cloudfront',
                name: 'AWS CloudFront',
                description: 'CDN от AWS, глубоко интегрированная с S3.',
                metrics: { nodes_count: 4, cache_purge_speed: 4, edge_computing: true, cost: 'Объемная скидка' }
            },
            {
                id: 'akamai',
                name: 'Akamai',
                description: 'Одна из старейших и крупнейших CDN сетей в мире.',
                metrics: { nodes_count: 5, cache_purge_speed: 3, edge_computing: true, cost: 'Высокая (Enterprise)' }
            }
        ]
    },
    'monitoring': {
        componentType: 'monitoring',
        metrics: [
            { name: 'data_retention', label: 'Хранение данных', description: 'Срок хранения метрик', type: 'text' },
            { name: 'alerting', label: 'Алертинг', description: 'Гибкость настройки уведомлений', type: 'rating' },
            { name: 'visualisation', label: 'Визуализация', description: 'Качество дашбордов', type: 'rating' },
            { name: 'overhead', label: 'Влияние на систему', description: 'Ресурсы на сбор метрик', type: 'rating' },
        ],
        vendors: [
            {
                id: 'prometheus',
                name: 'Prometheus',
                description: 'Стандарт для мониторинга Kubernetes и микросервисов.',
                metrics: { data_retention: 'Зависит от диска', alerting: 5, visualisation: 3, overhead: 4 }
            },
            {
                id: 'datadog',
                name: 'Datadog',
                description: 'Облачная платформа мониторинга и аналитики.',
                metrics: { data_retention: '15 месяцев', alerting: 5, visualisation: 5, overhead: 5 }
            },
            {
                id: 'zabbix',
                name: 'Zabbix',
                description: 'Классическая система мониторинга сетей и серверов.',
                metrics: { data_retention: 'Зависит от БД', alerting: 4, visualisation: 3, overhead: 3 }
            }
        ]
    },
    'logging': {
        componentType: 'logging',
        metrics: [
            { name: 'search_speed', label: 'Скорость поиска', description: 'Быстрота нахождения записей', type: 'rating' },
            { name: 'indexing_cost', label: 'Стоимость индексации', description: 'Цена за объем логов', type: 'rating' },
            { name: 'storage_efficiency', label: 'Эффективность хранения', description: 'Сжатие логов', type: 'rating' },
            { name: 'visual_analysis', label: 'Анализ и визуализация', description: 'Инструменты разбора логов', type: 'rating' },
        ],
        vendors: [
            {
                id: 'elasticsearch-loki',
                name: 'Grafana Loki',
                description: 'Экономичная система сбора логов по принципу Prometheus.',
                metrics: { search_speed: 4, indexing_cost: 5, storage_efficiency: 5, visual_analysis: 4 }
            },
            {
                id: 'elk-stack',
                name: 'ELK Stack',
                description: 'Самое мощное решение для поиска и анализа логов.',
                metrics: { search_speed: 5, indexing_cost: 3, storage_efficiency: 3, visual_analysis: 5 }
            },
            {
                id: 'splunk',
                name: 'Splunk',
                description: 'Enterprise платформа для анализа машинных данных.',
                metrics: { search_speed: 5, indexing_cost: 2, storage_efficiency: 4, visual_analysis: 5 }
            }
        ]
    },
    'orchestrator': {
        componentType: 'orchestrator',
        metrics: [
            { name: 'scaling_speed', label: 'Скорость масштабирования', description: 'Как быстро создаются поды/контейнеры', type: 'rating' },
            { name: 'ecosystem', label: 'Экосистема', description: 'Поддержка тулинга и плагинов', type: 'rating' },
            { name: 'complexity', label: 'Сложность', description: 'Трудозатраты на поддержку', type: 'rating' },
            { name: 'self_healing', label: 'Авто-восстановление', description: 'Возможности health checks', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'kubernetes',
                name: 'Kubernetes (K8s)',
                description: 'Индустриальный стандарт оркестрации контейнеров.',
                metrics: { scaling_speed: 4, ecosystem: 5, complexity: 5, self_healing: true }
            },
            {
                id: 'nomad',
                name: 'HashiCorp Nomad',
                description: 'Простой и гибкий оркестратор для контейнеров и бинарников.',
                metrics: { scaling_speed: 5, ecosystem: 3, complexity: 2, self_healing: true }
            },
            {
                id: 'docker-swarm',
                name: 'Docker Swarm',
                description: 'Нативный и простой оркестратор в составе Docker.',
                metrics: { scaling_speed: 3, ecosystem: 2, complexity: 1, self_healing: true }
            }
        ]
    },
    'service-mesh': {
        componentType: 'service-mesh',
        metrics: [
            { name: 'traffic_management', label: 'Управление трафиком', description: 'Canary, Blue-Green, и др.', type: 'rating' },
            { name: 'observability', label: 'Наблюдаемость', description: 'Встроенный трейсинг и метрики', type: 'rating' },
            { name: 'security', label: 'Безопасность', description: 'mTLS и авторизация', type: 'rating' },
            { name: 'performance_impact', label: 'Влияние на задержку', description: 'Дополнительный латентность', type: 'rating' },
        ],
        vendors: [
            {
                id: 'istio',
                name: 'Istio',
                description: 'Самая функциональная Service Mesh с богатой экосистемой.',
                metrics: { traffic_management: 5, observability: 5, security: 5, performance_impact: 3 }
            },
            {
                id: 'linkerd',
                name: 'Linkerd',
                description: 'Ультра-легкая и безопасная Service Mesh.',
                metrics: { traffic_management: 3, observability: 4, security: 5, performance_impact: 5 }
            },
            {
                id: 'consul-mesh',
                name: 'Consul Connect',
                description: 'Классическое решение от HashiCorp для любой инфраструктуры.',
                metrics: { traffic_management: 4, observability: 3, security: 4, performance_impact: 4 }
            }
        ]
    },
    'auth-service': {
        componentType: 'auth-service',
        metrics: [
            { name: 'protocols', label: 'Протоколы', description: 'OIDC, OAuth2, SAML, и др.', type: 'text' },
            { name: 'mfa', label: 'MFA', description: 'Поддержка многофакторной аутентификации', type: 'boolean' },
            { name: 'user_management', label: 'Управление пользователями', description: 'Легкость CRUD операций', type: 'rating' },
            { name: 'deployment', label: 'Тип сервиса', description: 'SaaS или Self-hosted', type: 'text' },
        ],
        vendors: [
            {
                id: 'keycloak',
                name: 'Keycloak',
                description: 'Мощное Open Source решение от Red Hat.',
                metrics: { protocols: 'OIDC, OAuth2, SAML', mfa: true, user_management: 4, deployment: 'Self-hosted' }
            },
            {
                id: 'auth0',
                name: 'Auth0 (Okta)',
                description: 'Лучшее в классе SaaS решение для аутентификации.',
                metrics: { protocols: 'OIDC, OAuth2, SAML+', mfa: true, user_management: 5, deployment: 'SaaS / Cloud' }
            },
            {
                id: 'okta',
                name: 'Okta Enterprise',
                description: 'Флагманское решение для корпоративного сектора (IAM).',
                metrics: { protocols: 'OIDC, OAuth2, SAML+', mfa: true, user_management: 5, deployment: 'SaaS' }
            }
        ]
    },
    'ci-cd-pipeline': {
        componentType: 'ci-cd-pipeline',
        metrics: [
            { name: 'ease_of_setup', label: 'Легкость настройки', description: 'YAML, UI, и др.', type: 'rating' },
            { name: 'runners', label: 'Раннеры', description: 'Скорость и масштабирование воркеров', type: 'rating' },
            { name: 'integration', label: 'Интеграции', description: 'Связь с облаками и Docker', type: 'rating' },
            { name: 'cost', label: 'Стоимость', description: 'Цена за минуту или месяц', type: 'text' },
        ],
        vendors: [
            {
                id: 'github-actions',
                name: 'GitHub Actions',
                description: 'Нативная CI/CD система в составе GitHub.',
                metrics: { ease_of_setup: 5, runners: 4, integration: 5, cost: 'Бесплатно / за минуту' }
            },
            {
                id: 'gitlab-ci',
                name: 'GitLab CI/CD',
                description: 'Мощная система с продвинутыми пайплайнами.',
                metrics: { ease_of_setup: 4, runners: 5, integration: 5, cost: 'Бесплатно / Лицензия' }
            },
            {
                id: 'jenkins',
                name: 'Jenkins',
                description: 'Классический Open Source инструмент с тысячами плагинов.',
                metrics: { ease_of_setup: 2, runners: 5, integration: 4, cost: 'Бесплатно (Self-hosted)' }
            }
        ]
    },
    'vector-database': {
        componentType: 'vector-database',
        metrics: [
            { name: 'search_speed', label: 'Скорость ANN поиска', description: 'Поиск ближайших соседей', type: 'rating' },
            { name: 'indices_support', label: 'Типы индексов', description: 'HNSW, IVF, и др.', type: 'text' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Поддержка миллиардов векторов', type: 'rating' },
            { name: 'hybrid_search', label: 'Гибридный поиск', description: 'Векторы + Текст', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'pinecone',
                name: 'Pinecone',
                description: 'SaaS решение для векторного поиска без забот об инфраструктуре.',
                metrics: { search_speed: 5, indices_support: 'Управляемые', scalability: 5, hybrid_search: true }
            },
            {
                id: 'milvus',
                name: 'Milvus',
                description: 'Самая продвинутая Open Source векторная БД.',
                metrics: { search_speed: 5, indices_support: 'HNSW, IVF, etc', scalability: 5, hybrid_search: true }
            },
            {
                id: 'weaviate',
                name: 'Weaviate',
                description: 'Векторная БД с графовыми возможностями и легкой интеграцией с AI.',
                metrics: { search_speed: 4, indices_support: 'HNSW', scalability: 4, hybrid_search: true }
            }
        ]
    },
    'lambda': {
        componentType: 'lambda',
        metrics: [
            { name: 'runtime_support', label: 'Поддержка языков', description: 'Node.js, Python, Go, etc.', type: 'text' },
            { name: 'cold_start', label: 'Холодный старт', description: 'Задержка при первом запуске', type: 'rating' },
            { name: 'max_duration', label: 'Макс. время выполнения', description: 'Таймаут функции', type: 'text' },
            { name: 'scaling', label: 'Масштабируемость', description: 'Автоматическое создание инстансов', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-lambda',
                name: 'AWS Lambda',
                description: 'Первопроходец Serverless вычислений от AWS.',
                metrics: { runtime_support: 'Все основные', cold_start: 4, max_duration: '15 мин', scaling: 5 }
            },
            {
                id: 'google-functions',
                name: 'Google Cloud Functions',
                description: 'Легковесные функции от Google Cloud.',
                metrics: { runtime_support: 'Множество', cold_start: 4, max_duration: '9 мин', scaling: 5 }
            },
            {
                id: 'azure-functions',
                name: 'Azure Functions',
                description: 'Событийно-ориентированные функции от Microsoft.',
                metrics: { runtime_support: 'Все основные', cold_start: 3, max_duration: '10 мин+', scaling: 5 }
            }
        ]
    },
    'data-lake': {
        componentType: 'data-lake',
        metrics: [
            { name: 'format_support', label: 'Форматы данных', description: 'Parquet, Iceberg, Hudi, etc.', type: 'text' },
            { name: 'governance', label: 'Управление (Governance)', description: 'Контроль доступа и метаданные', type: 'rating' },
            { name: 'query_engine', label: 'Движок запросов', description: 'Athena, Presto, Spark', type: 'text' },
            { name: 'partitioning', label: 'Партиционирование', description: 'Гибкость структуры данных', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-lake-formation',
                name: 'AWS Lake Formation',
                description: 'Централизованное управление озером данных на базе S3.',
                metrics: { format_support: 'Любые', governance: 5, query_engine: 'Athena/Glue', partitioning: 5 }
            },
            {
                id: 'databricks',
                name: 'Databricks Lakehouse',
                description: 'Единая платформа для данных, аналитики и ИИ.',
                metrics: { format_support: 'Delta, Parquet', governance: 4, query_engine: 'Photon', partitioning: 5 }
            },
            {
                id: 'azure-data-lake',
                name: 'Azure Data Lake Storage',
                description: 'Масштабируемое и безопасное озеро данных от Azure.',
                metrics: { format_support: 'Любые', governance: 4, query_engine: 'Synapse', partitioning: 5 }
            }
        ]
    },
    'graph-database': {
        componentType: 'graph-database',
        metrics: [
            { name: 'graph_model', label: 'Модель графа', description: 'Property Graph или RDF', type: 'text' },
            { name: 'query_language', label: 'Язык запросов', description: 'Cypher, Gremlin, SPAQRL', type: 'text' },
            { name: 'performance_traversal', label: 'Скорость обхода', description: 'Производительность для глубоких связей', type: 'rating' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Поддержка огромных графов', type: 'rating' },
        ],
        vendors: [
            {
                id: 'neo4j',
                name: 'Neo4j',
                description: 'Лидер в области графовых баз данных с нативной обработкой связей.',
                metrics: { graph_model: 'Property Graph', query_language: 'Cypher', performance_traversal: 5, scalability: 4 }
            },
            {
                id: 'amazon-neptune',
                name: 'Amazon Neptune',
                description: 'Полностью управляемый графовый сервис от AWS.',
                metrics: { graph_model: 'Property/RDF', query_language: 'Gremlin/Cypher', performance_traversal: 4, scalability: 5 }
            },
            {
                id: 'arangodb',
                name: 'ArangoDB',
                description: 'Мультимодельная БД (Graph + Doc + KV).',
                metrics: { graph_model: 'Property Graph', query_language: 'AQL', performance_traversal: 4, scalability: 4 }
            }
        ]
    },
    'time-series-database': {
        componentType: 'time-series-database',
        metrics: [
            { name: 'ingest_rate', label: 'Запись (Ingest)', description: 'Скорость записи точек данных', type: 'rating' },
            { name: 'compression', label: 'Сжатие', description: 'Эффективность хранения временных рядов', type: 'rating' },
            { name: 'retention_policies', label: 'Retention Policies', description: 'Автоматическая очистка старых данных', type: 'boolean' },
            { name: 'query_syntax', label: 'Синтаксис запросов', description: 'SQL-like или функциональный', type: 'text' },
        ],
        vendors: [
            {
                id: 'influxdb',
                name: 'InfluxDB',
                description: 'Специализированная БД для метрик и событий.',
                metrics: { ingest_rate: 5, compression: 4, retention_policies: true, query_syntax: 'Flux / SQL' }
            },
            {
                id: 'timescaledb',
                name: 'TimescaleDB',
                description: 'Временные ряды на базе PostgreSQL.',
                metrics: { ingest_rate: 4, compression: 5, retention_policies: true, query_syntax: 'Standard SQL' }
            },
            {
                id: 'prometheus-tsdb',
                name: 'Prometheus TSDB',
                description: 'Хранилище метрик, оптимизированное для мониторинга.',
                metrics: { ingest_rate: 5, compression: 5, retention_policies: true, query_syntax: 'PromQL' }
            }
        ]
    },
    'secret-management': {
        componentType: 'secret-management',
        metrics: [
            { name: 'dynamic_secrets', label: 'Динамические секреты', description: 'Генерация временных паролей на лету', type: 'boolean' },
            { name: 'auth_methods', label: 'Методы аутентификации', description: 'K8s, IAM, AppRole, etc.', type: 'text' },
            { name: 'auditing', label: 'Аудит', description: 'Детальные логи доступа к секретам', type: 'rating' },
            { name: 'high_availability', label: 'Отказоустойчивость', description: 'Работа в кластерном режиме', type: 'rating' },
        ],
        vendors: [
            {
                id: 'hashicorp-vault',
                name: 'HashiCorp Vault',
                description: 'Золотой стандарт управления секретами и защиты данных.',
                metrics: { dynamic_secrets: true, auth_methods: 'Очень много', auditing: 5, high_availability: 5 }
            },
            {
                id: 'aws-secrets-manager',
                name: 'AWS Secrets Manager',
                description: 'Управляемый сервис от AWS с автоматической ротацией.',
                metrics: { dynamic_secrets: true, auth_methods: 'IAM', auditing: 5, high_availability: 5 }
            },
            {
                id: 'azure-key-vault',
                name: 'Azure Key Vault',
                description: 'Безопасное хранилище ключей и секретов в Azure.',
                metrics: { dynamic_secrets: false, auth_methods: 'Entra ID', auditing: 4, high_availability: 5 }
            }
        ]
    },
    'notification-service': {
        componentType: 'notification-service',
        metrics: [
            { name: 'channels', label: 'Каналы', description: 'Push, Webhook, SMS, Email', type: 'text' },
            { name: 'templating', label: 'Шаблонизация', description: 'Управление текстом уведомлений', type: 'rating' },
            { name: 'personalization', label: 'Персонализация', description: 'Сегментация пользователей', type: 'rating' },
            { name: 'reliability', label: 'Надежность доставки', description: 'Retry механизмы и отчеты', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-sns',
                name: 'Amazon SNS',
                description: 'Сервис Pub/Sub уведомлений масштаба AWS.',
                metrics: { channels: 'Push, SMS, Email, HTTP', templating: 2, personalization: 3, reliability: 5 }
            },
            {
                id: 'onesignal',
                name: 'OneSignal',
                description: 'Популярный сервис для Push уведомлений и Email маркетинга.',
                metrics: { channels: 'Push, Email, SMS', templating: 5, personalization: 5, reliability: 4 }
            },
            {
                id: 'firebase-fcm',
                name: 'Firebase Cloud Messaging',
                description: 'Бесплатная доставка Push-уведомлений от Google.',
                metrics: { channels: 'Push', templating: 3, personalization: 4, reliability: 5 }
            }
        ]
    }
    ,
    'edge-computing': {
        componentType: 'edge-computing',
        metrics: [
            { name: 'latency', label: 'Задержка', description: 'Время отклика для пользователя', type: 'rating' },
            { name: 'cold_start', label: 'Холодный старт', description: 'Время запуска функции', type: 'rating' },
            { name: 'runtime', label: 'Среда выполнения', description: 'Поддерживаемые языки (V8, Node, etc.)', type: 'text' },
            { name: 'global_reach', label: 'Глобальное покрытие', description: 'Количество точек присутствия', type: 'rating' },
        ],
        vendors: [
            {
                id: 'cloudflare-workers',
                name: 'Cloudflare Workers',
                description: 'Serverless платформа на базе V8 изолятов с нулевым холодным стартом.',
                metrics: { latency: 5, cold_start: 5, runtime: 'V8 (JS/Wasm)', global_reach: 5 }
            },
            {
                id: 'lambda-edge',
                name: 'AWS Lambda@Edge',
                description: 'Запуск Node.js/Python функций на CDN CloudFront.',
                metrics: { latency: 4, cold_start: 3, runtime: 'Node.js, Python', global_reach: 4 }
            },
            {
                id: 'vercel-edge',
                name: 'Vercel Edge Functions',
                description: 'Оптимизировано для фронтенд-фреймворков и Next.js.',
                metrics: { latency: 5, cold_start: 5, runtime: 'Edge Runtime', global_reach: 4 }
            }
        ]
    },
    'server': {
        componentType: 'server',
        metrics: [
            { name: 'performance', label: 'Производительность', description: 'CPU/RAM соотношение', type: 'rating' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Вертикальное и горизонтальное', type: 'rating' },
            { name: 'price_performance', label: 'Цена/Качество', description: 'Стоимость единицы вычислительной мощности', type: 'rating' },
            { name: 'management', label: 'Управление', description: 'Удобство консоли и API', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-ec2',
                name: 'Amazon EC2',
                description: 'Самый широкий выбор типов инстансов на рынке.',
                metrics: { performance: 5, scalability: 5, price_performance: 4, management: 4 }
            },
            {
                id: 'digitalocean',
                name: 'DigitalOcean Droplets',
                description: 'Простые и понятные виртуальные машины для разработчиков.',
                metrics: { performance: 4, scalability: 3, price_performance: 5, management: 5 }
            },
            {
                id: 'hetzner',
                name: 'Hetzner Cloud',
                description: 'Непревзойденное соотношение цены и производительности в Европе.',
                metrics: { performance: 4, scalability: 3, price_performance: 5, management: 3 }
            }
        ]
    },
    'container': {
        componentType: 'container',
        metrics: [
            { name: 'isolation', label: 'Изоляция', description: 'Уровень безопасности контейнера', type: 'rating' },
            { name: 'performance', label: 'Производительность', description: 'Оверхед на виртуализацию', type: 'rating' },
            { name: 'ecosystem', label: 'Экосистема', description: 'Инструменты и образы', type: 'rating' },
            { name: 'standard', label: 'Стандарт', description: 'OCI совместимость', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'docker',
                name: 'Docker Engine',
                description: 'Стандарт де-факто для контейнеризации.',
                metrics: { isolation: 4, performance: 4, ecosystem: 5, standard: true }
            },
            {
                id: 'podman',
                name: 'Podman',
                description: 'Daemonless контейнерный движок, совместимый с Docker.',
                metrics: { isolation: 5, performance: 5, ecosystem: 4, standard: true }
            },
            {
                id: 'containerd',
                name: 'containerd',
                description: 'Легковесный runtime, используемый в Kubernetes.',
                metrics: { isolation: 4, performance: 5, ecosystem: 5, standard: true }
            }
        ]
    },
    'web-server': {
        componentType: 'web-server',
        metrics: [
            { name: 'performance', label: 'Статика/RPS', description: 'Скорость отдачи статики', type: 'rating' },
            { name: 'config_ease', label: 'Настройка', description: 'Простота конфигурационных файлов', type: 'rating' },
            { name: 'features', label: 'Функциональность', description: 'Модули, проксирование, кэш', type: 'rating' },
            { name: 'memory', label: 'Потребление памяти', description: 'Эффективность ресурсов', type: 'rating' },
        ],
        vendors: [
            {
                id: 'nginx',
                name: 'NGINX',
                description: 'Высокопроизводительный веб-сервер и обратный прокси.',
                metrics: { performance: 5, config_ease: 3, features: 5, memory: 4 }
            },
            {
                id: 'apache',
                name: 'Apache HTTP Server',
                description: 'Гибкий, модульный веб-сервер с долгой историей.',
                metrics: { performance: 3, config_ease: 2, features: 5, memory: 2 }
            },
            {
                id: 'caddy',
                name: 'Caddy',
                description: 'Современный веб-сервер с автоматическим HTTPS.',
                metrics: { performance: 4, config_ease: 5, features: 4, memory: 3 }
            }
        ]
    },
    'service-discovery': {
        componentType: 'service-discovery',
        metrics: [
            { name: 'consistency', label: 'Консистентность', description: 'CP или AP (CAP теорема)', type: 'text' },
            { name: 'health_checks', label: 'Health Checks', description: 'Встроенные проверки здоровья', type: 'boolean' },
            { name: 'integration', label: 'Интеграция', description: 'DNS, HTTP API, gRPC', type: 'rating' },
            { name: 'complexity', label: 'Сложность', description: 'Эксплуатационные расходы', type: 'rating' },
        ],
        vendors: [
            {
                id: 'consul',
                name: 'HashiCorp Consul',
                description: 'Полнофункциональное решение для Service Mesh и Discovery.',
                metrics: { consistency: 'CP (Raft)', health_checks: true, integration: 5, complexity: 4 }
            },
            {
                id: 'etcd',
                name: 'etcd',
                description: 'Надежное Key-Value хранилище для распределенных систем (K8s).',
                metrics: { consistency: 'CP (Raft)', health_checks: false, integration: 3, complexity: 4 }
            },
            {
                id: 'eureka',
                name: 'Netflix Eureka',
                description: 'AP-система discovery для микросервисов (Spring Cloud).',
                metrics: { consistency: 'AP', health_checks: true, integration: 3, complexity: 2 }
            }
        ]
    },
    'configuration-management': {
        componentType: 'configuration-management',
        metrics: [
            { name: 'architecture', label: 'Архитектура', description: 'Agent-based или Agentless', type: 'text' },
            { name: 'language', label: 'Язык описания', description: 'YAML, DSL, Ruby', type: 'text' },
            { name: 'idempotency', label: 'Идемпотентность', description: 'Гарантия стабильного состояния', type: 'rating' },
            { name: 'learning_curve', label: 'Порог вхождения', description: 'Сложность изучения', type: 'rating' },
        ],
        vendors: [
            {
                id: 'ansible',
                name: 'Ansible',
                description: 'Простой Agentless инструмент на базе YAML.',
                metrics: { architecture: 'Agentless (SSH)', language: 'YAML', idempotency: 4, learning_curve: 5 }
            },
            {
                id: 'terraform',
                name: 'Terraform',
                description: 'Инфраструктура как код (IaC) для облаков.',
                metrics: { architecture: 'Client-only', language: 'HCL', idempotency: 5, learning_curve: 3 }
            },
            {
                id: 'chef',
                name: 'Chef',
                description: 'Мощная система управления конфигурациями на Ruby.',
                metrics: { architecture: 'Agent-based', language: 'Ruby DSL', idempotency: 5, learning_curve: 2 }
            }
        ]
    },
    'backup-service': {
        componentType: 'backup-service',
        metrics: [
            { name: 'rto_rpo', label: 'RTO / RPO', description: 'Минимальное время и потери данных', type: 'rating' },
            { name: 'deduplication', label: 'Дедупликация', description: 'Экономия места хранения', type: 'rating' },
            { name: 'platform_support', label: 'Платформы', description: 'VM, DB, Cloud, SaaS', type: 'rating' },
            { name: 'encryption', label: 'Шифрование', description: 'Безопасность бэкапов', type: 'boolean' },
        ],
        vendors: [
            {
                id: 'aws-backup',
                name: 'AWS Backup',
                description: 'Централизованное управление бэкапами в AWS.',
                metrics: { rto_rpo: 4, deduplication: 3, platform_support: 4, encryption: true }
            },
            {
                id: 'veeam',
                name: 'Veeam',
                description: 'Лидер Enterprise решений для бэкапа и восстановления.',
                metrics: { rto_rpo: 5, deduplication: 5, platform_support: 5, encryption: true }
            },
            {
                id: 'velero',
                name: 'Velero',
                description: 'Open Source инструмент для бэкапа Kubernetes кластеров.',
                metrics: { rto_rpo: 3, deduplication: 1, platform_support: 2, encryption: true }
            }
        ]
    },
    'proxy': {
        componentType: 'proxy',
        metrics: [
            { name: 'protocols', label: 'Протоколы', description: 'HTTP/1.1, HTTP/2, gRPC', type: 'rating' },
            { name: 'dynamic_config', label: 'Динамическая конфиг.', description: 'Обновление без перезагрузки', type: 'boolean' },
            { name: 'observability', label: 'Наблюдаемость', description: 'Метрики и трейсинг', type: 'rating' },
            { name: 'performance', label: 'Производительность', description: 'RPS и задержки', type: 'rating' },
        ],
        vendors: [
            {
                id: 'envoy',
                name: 'Envoy Proxy',
                description: 'Cloud-native прокси для Service Mesh.',
                metrics: { protocols: 5, dynamic_config: true, observability: 5, performance: 5 }
            },
            {
                id: 'traefik',
                name: 'Traefik',
                description: 'Современный прокси с автоматическим обнаружением сервисов.',
                metrics: { protocols: 4, dynamic_config: true, observability: 4, performance: 4 }
            },
            {
                id: 'nginx-proxy',
                name: 'NGINX',
                description: 'Проверенный временем надежный прокси-сервер.',
                metrics: { protocols: 4, dynamic_config: false, observability: 3, performance: 5 }
            }
        ]
    },
    'dns-service': {
        componentType: 'dns-service',
        metrics: [
            { name: 'propagation', label: 'Скорость обновления', description: 'Время распространения записей', type: 'rating' },
            { name: 'anycast', label: 'Anycast сеть', description: 'Глобальная доступность и скорость', type: 'boolean' },
            { name: 'security', label: 'Безопасность', description: 'DNSSEC, DDoS защита', type: 'rating' },
            { name: 'api', label: 'API', description: 'Удобство автоматизации', type: 'rating' },
        ],
        vendors: [
            {
                id: 'route53',
                name: 'Amazon Route 53',
                description: 'Масштабируемый облачный DNS сервис от AWS.',
                metrics: { propagation: 4, anycast: true, security: 5, api: 5 }
            },
            {
                id: 'cloudflare-dns',
                name: 'Cloudflare DNS',
                description: 'Самый быстрый публичный DNS сервис (1.1.1.1).',
                metrics: { propagation: 5, anycast: true, security: 5, api: 5 }
            },
            {
                id: 'google-dns',
                name: 'Google Cloud DNS',
                description: 'Надежный DNS сервис в инфраструктуре Google.',
                metrics: { propagation: 5, anycast: true, security: 4, api: 4 }
            }
        ]
    },
    'iot-gateway': {
        componentType: 'iot-gateway',
        metrics: [
            { name: 'protocol_support', label: 'Протоколы', description: 'MQTT, CoAP, HTTP', type: 'rating' },
            { name: 'offline_mode', label: 'Offline режим', description: 'Работа без связи с облаком', type: 'boolean' },
            { name: 'device_management', label: 'Управление', description: 'Регистрация и OTA обновления', type: 'rating' },
            { name: 'scalability', label: 'Масштабируемость', description: 'Миллионы устройств', type: 'rating' },
        ],
        vendors: [
            {
                id: 'aws-iot-greengrass',
                name: 'AWS IoT Greengrass',
                description: 'Расширяет AWS на граничные устройства.',
                metrics: { protocol_support: 5, offline_mode: true, device_management: 5, scalability: 5 }
            },
            {
                id: 'azure-iot-edge',
                name: 'Azure IoT Edge',
                description: 'Контейнеризованные модули IoT от Microsoft.',
                metrics: { protocol_support: 4, offline_mode: true, device_management: 5, scalability: 5 }
            },
            {
                id: 'emqx',
                name: 'EMQX',
                description: 'Open Source MQTT брокер для IoT.',
                metrics: { protocol_support: 5, offline_mode: false, device_management: 3, scalability: 5 }
            }
        ]
    },
    'identity-provider': {
        componentType: 'identity-provider',
        metrics: [
            { name: 'sso', label: 'SSO', description: 'Единый вход для всех приложений', type: 'rating' },
            { name: 'directory', label: 'Каталог', description: 'Интеграция с AD / LDAP', type: 'rating' },
            { name: 'adaptive_auth', label: 'Адаптивная защита', description: 'Анализ рисков при входе', type: 'rating' },
            { name: 'pricing', label: 'Ценообразование', description: 'Стоимость за пользователя', type: 'text' },
        ],
        vendors: [
            {
                id: 'okta',
                name: 'Okta',
                description: 'Лидер рынка IDaaS решений.',
                metrics: { sso: 5, directory: 5, adaptive_auth: 5, pricing: 'Высокая' }
            },
            {
                id: 'entra-id',
                name: 'Microsoft Entra ID',
                description: 'Бывший Azure AD, стандарт для Windows-сетей.',
                metrics: { sso: 5, directory: 5, adaptive_auth: 4, pricing: 'Входит в M365' }
            },
            {
                id: 'auth0',
                name: 'Auth0',
                description: 'Ориентирован на разработчиков и B2C приложения.',
                metrics: { sso: 5, directory: 4, adaptive_auth: 5, pricing: 'Средняя' }
            }
        ]
    },
    'vpn-gateway': {
        componentType: 'vpn-gateway',
        metrics: [
            { name: 'speed', label: 'Скорость', description: 'Пропускная способность туннеля', type: 'rating' },
            { name: 'security', label: 'Безопасность', description: 'Протоколы шифрования', type: 'rating' },
            { name: 'ease_of_use', label: 'Удобство', description: 'Настройка клиента и сервера', type: 'rating' },
            { name: 'platform_support', label: 'ОС', description: 'Windows, Mac, Linux, Mobile', type: 'rating' },
        ],
        vendors: [
            {
                id: 'wireguard',
                name: 'WireGuard',
                description: 'Современный, быстрый и простой VPN протокол.',
                metrics: { speed: 5, security: 5, ease_of_use: 4, platform_support: 4 }
            },
            {
                id: 'openvpn',
                name: 'OpenVPN',
                description: 'Классический стандарт VPN с высокой совместимостью.',
                metrics: { speed: 3, security: 5, ease_of_use: 2, platform_support: 5 }
            },
            {
                id: 'tailscale',
                name: 'Tailscale',
                description: 'Mesh VPN на базе WireGuard с нулевой конфигурацией.',
                metrics: { speed: 4, security: 5, ease_of_use: 5, platform_support: 5 }
            }
        ]
    },
    'vcs': {
        componentType: 'vcs',
        metrics: [
            { name: 'collaboration', label: 'Коллаборация', description: 'Code Review, PRs, Wiki', type: 'rating' },
            { name: 'cicd', label: 'Встроенный CI/CD', description: 'Качество пайплайнов', type: 'rating' },
            { name: 'storage', label: 'Хранение (LFS)', description: 'Лимиты на большие файлы', type: 'rating' },
            { name: 'price', label: 'Цена', description: 'Бесплатный план', type: 'text' },
        ],
        vendors: [
            {
                id: 'github',
                name: 'GitHub',
                description: 'Самая популярная платформа для разработки.',
                metrics: { collaboration: 5, cicd: 5, storage: 4, price: 'Отличный Free Tier' }
            },
            {
                id: 'gitlab',
                name: 'GitLab',
                description: 'Платформа полного цикла DevOps.',
                metrics: { collaboration: 4, cicd: 5, storage: 4, price: 'Free Self-hosted' }
            },
            {
                id: 'bitbucket',
                name: 'Bitbucket',
                description: 'Тесная интеграция с Jira и продуктами Atlassian.',
                metrics: { collaboration: 3, cicd: 3, storage: 3, price: 'Ограниченный Free' }
            }
        ]
    },
    'blockchain': {
        componentType: 'blockchain',
        metrics: [
            { name: 'tps', label: 'TPS', description: 'Транзакций в секунду', type: 'text' },
            { name: 'decentralization', label: 'Децентрализация', description: 'Количество нод валидаторов', type: 'rating' },
            { name: 'smart_contracts', label: 'Смарт-контракты', description: 'Гибкость программирования', type: 'rating' },
            { name: 'finality', label: 'Финализация', description: 'Время до необратимости', type: 'text' },
        ],
        vendors: [
            {
                id: 'ethereum',
                name: 'Ethereum',
                description: 'Ведущая платформа смарт-контрактов.',
                metrics: { tps: '~15 (L1)', decentralization: 5, smart_contracts: 5, finality: '~15 мин' }
            },
            {
                id: 'solana',
                name: 'Solana',
                description: 'Высокопроизводительный блокчейн с низкой задержкой.',
                metrics: { tps: '65,000+', decentralization: 3, smart_contracts: 4, finality: '~400 мс' }
            },
            {
                id: 'hyperledger-fabric',
                name: 'Hyperledger Fabric',
                description: 'Корпоративный приватный блокчейн.',
                metrics: { tps: '3,000+', decentralization: 1, smart_contracts: 4, finality: 'Мгновенно' }
            }
        ]
    },
    'analytics-service': {
        componentType: 'analytics-service',
        metrics: [
            { name: 'realtime', label: 'Real-time', description: 'Задержка появления данных', type: 'rating' },
            { name: 'customization', label: 'Кастомизация', description: 'Гибкость отчетов', type: 'rating' },
            { name: 'privacy', label: 'Приватность', description: 'GDPR/HIPAA комплаенс', type: 'rating' },
            { name: 'integration', label: 'SDK', description: 'Простота внедрения', type: 'rating' },
        ],
        vendors: [
            {
                id: 'google-analytics',
                name: 'Google Analytics 4',
                description: 'Стандарт веб-аналитики.',
                metrics: { realtime: 3, customization: 4, privacy: 3, integration: 5 }
            },
            {
                id: 'mixpanel',
                name: 'Mixpanel',
                description: 'Аналитика поведения пользователей (Product Analytics).',
                metrics: { realtime: 5, customization: 5, privacy: 4, integration: 5 }
            },
            {
                id: 'posthog',
                name: 'PostHog',
                description: 'Open Source платформа продуктовой аналитики.',
                metrics: { realtime: 4, customization: 5, privacy: 5, integration: 4 }
            }
        ]
    },
    'business-intelligence': {
        componentType: 'business-intelligence',
        metrics: [
            { name: 'visualizations', label: 'Визуализации', description: 'Качество и разнообразие графиков', type: 'rating' },
            { name: 'data_sources', label: 'Источники данных', description: 'Поддержка различных БД и API', type: 'rating' },
            { name: 'self_service', label: 'Self-Service', description: 'Удобство для бизнес-пользователей', type: 'rating' },
            { name: 'pricing', label: 'Цена', description: 'Лицензионная модель', type: 'text' },
        ],
        vendors: [
            {
                id: 'power-bi',
                name: 'Microsoft Power BI',
                description: 'Лидер BI рынка, глубокая интеграция с Microsoft.',
                metrics: { visualizations: 5, data_sources: 5, self_service: 4, pricing: '$10/мес' }
            },
            {
                id: 'tableau',
                name: 'Tableau',
                description: 'Мощнейший инструмент для визуального анализа данных.',
                metrics: { visualizations: 5, data_sources: 5, self_service: 3, pricing: '$75/мес' }
            },
            {
                id: 'superset',
                name: 'Apache Superset',
                description: 'Современная Open Source BI платформа.',
                metrics: { visualizations: 4, data_sources: 4, self_service: 3, pricing: 'Бесплатно' }
            }
        ]
    },
    'subnet': {
        componentType: 'subnet',
        metrics: [
            { name: 'isolation', label: 'Изоляция', description: 'Уровень сетевой изоляции', type: 'rating' },
            { name: 'routing', label: 'Маршрутизация', description: 'Гибкость настройки таблиц маршрутов', type: 'rating' },
            { name: 'security', label: 'Безопасность', description: 'Поддержка ACL и Security Groups', type: 'rating' },
            { name: 'ipv6', label: 'IPv6', description: 'Поддержка IPv6', type: 'boolean' },
        ],
        vendors: [
            { id: 'public-subnet', name: 'Public Subnet', description: 'Подсеть с доступом в интернет.', metrics: { isolation: 2, routing: 5, security: 4, ipv6: true } },
            { id: 'private-subnet', name: 'Private Subnet', description: 'Изолированная подсеть для внутренних ресурсов.', metrics: { isolation: 5, routing: 4, security: 5, ipv6: true } }
        ]
    },
    'vpc': {
        componentType: 'vpc',
        metrics: [
            { name: 'scalability', label: 'Масштабируемость', description: 'Лимиты на количество ресурсов и подсетей', type: 'rating' },
            { name: 'connectivity', label: 'Связность', description: 'Peering, VPN, Direct Connect', type: 'rating' },
            { name: 'management', label: 'Управление', description: 'Удобство IaC и консоли', type: 'rating' },
        ],
        vendors: [
            { id: 'aws-vpc', name: 'AWS VPC', description: 'Virtual Private Cloud от Amazon.', metrics: { scalability: 5, connectivity: 5, management: 5 } },
            { id: 'azure-vnet', name: 'Azure VNet', description: 'Virtual Network от Microsoft.', metrics: { scalability: 5, connectivity: 5, management: 4 } },
            { id: 'gcp-vnet', name: 'GCP VPC', description: 'Virtual Private Cloud от Google.', metrics: { scalability: 5, connectivity: 4, management: 5 } }
        ]
    },
    'monorepo': {
        componentType: 'monorepo',
        metrics: [
            { name: 'build_speed', label: 'Скорость сборки', description: 'Использование кэширования и инкрементальных билдов', type: 'rating' },
            { name: 'dependency_management', label: 'Управление зависимостями', description: 'Единые версии библиотек', type: 'rating' },
            { name: 'tooling', label: 'Инструментарий', description: 'Наборы CLI и плагинов', type: 'rating' },
        ],
        vendors: [
            { id: 'nx', name: 'Nx', description: 'Мощный инструмент для Monorepos с отличным кэшированием.', metrics: { build_speed: 5, dependency_management: 5, tooling: 5 } },
            { id: 'turborepo', name: 'Turborepo', description: 'Высокопроизводительная система сборки от Vercel.', metrics: { build_speed: 5, dependency_management: 4, tooling: 4 } },
            { id: 'lerna', name: 'Lerna', description: 'Классический инструмент для управления JS монорепозиториями.', metrics: { build_speed: 3, dependency_management: 4, tooling: 3 } }
        ]
    },
    'micro-frontend': {
        componentType: 'micro-frontend',
        metrics: [
            { name: 'integration', label: 'Интеграция', description: 'Runtime или Build-time интеграция', type: 'text' },
            { name: 'isolation', label: 'Изоляция', description: 'Изоляция стилей и JS контекста', type: 'rating' },
            { name: 'communication', label: 'Взаимодействие', description: 'Событийная шина или общие сторы', type: 'rating' },
        ],
        vendors: [
            { id: 'module-federation', name: 'Module Federation', description: 'Загрузка кода во время выполнения (Webpack 5+).', metrics: { integration: 'Runtime', isolation: 4, communication: 5 } },
            { id: 'single-spa', name: 'single-spa', description: 'Фреймворк для объединения нескольких микрофонтендов.', metrics: { integration: 'Runtime', isolation: 3, communication: 4 } }
        ]
    },
    'dashboard': {
        componentType: 'dashboard',
        metrics: [
            { name: 'interactivity', label: 'Интерактивность', description: 'Фильтры, drill-down и др.', type: 'rating' },
            { name: 'customization', label: 'Кастомизация', description: 'Гибкость тем и стилей', type: 'rating' },
            { name: 'data_refresh', label: 'Обновление данных', description: 'Real-time или батчевое', type: 'rating' },
        ],
        vendors: [
            { id: 'grafana', name: 'Grafana', description: 'Лидер в визуализации метрик и логов.', metrics: { interactivity: 5, customization: 5, data_refresh: 5 } },
            { id: 'kibana', name: 'Kibana', description: 'Визуализация данных из Elasticsearch.', metrics: { interactivity: 4, customization: 3, data_refresh: 4 } }
        ]
    }
}

export * from './recommendationScenarios'
