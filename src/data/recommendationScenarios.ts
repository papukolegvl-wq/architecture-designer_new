import { ComponentType } from '../types'

export interface RecommendationScenario {
    id: string
    label: string
    description: string
    recommendedTypes: ComponentType[]
    recommendedVendors: string[] // vendor IDs
    reasoning: string
    icon?: string
    category?: 'Data' | 'Microservices' | 'Infrastructure' | 'AI' | 'DevOps' | 'Security' | 'FinTech' | 'SaaS' | 'Gaming' | 'IoT' | 'Healthcare' | 'E-commerce' | 'Entertainment' | 'Social' | 'Mobile' | 'Enterprise' | 'Education'
}

export const recommendationScenarios: RecommendationScenario[] = [
    // --- Data & Databases ---
    {
        id: 'transactional',
        label: 'Транзакционные нагрузки (OLTP)',
        description: 'Классическая онлайн-обработка транзакций с требованиями ACID.',
        recommendedTypes: ['database'],
        recommendedVendors: ['postgresql', 'mysql', 'sql-server'],
        reasoning: 'Реляционные СУБД (RDBMS) гарантируют целостность данных и поддержку сложных SQL-запросов, что критично для финансовых и учетных систем.',
        icon: 'Database',
        category: 'Data'
    },
    {
        id: 'analytical',
        label: 'Аналитические хранилища (OLAP)',
        description: 'Сложные аналитические запросы к историческим данным.',
        recommendedTypes: ['data-warehouse', 'database'],
        recommendedVendors: ['snowflake', 'bigquery', 'clickhouse'],
        reasoning: 'Колоночная архитектура позволяет эффективно сжимать данные и выполнять агрегации по миллионам строк за миллисекунды.',
        icon: 'BarChart3',
        category: 'Data'
    },
    {
        id: 'bigdata-nosql',
        label: 'High-Scale Write (NoSQL)',
        description: 'Запись огромных потоков данных с гибкой схемой.',
        recommendedTypes: ['database'],
        recommendedVendors: ['cassandra', 'mongodb', 'dynamodb'],
        reasoning: 'Системы на базе LSM-деревьев или документо-ориентированные БД легко масштабируются горизонтально для записи терабайтов данных.',
        icon: 'Zap',
        category: 'Data'
    },
    {
        id: 'time-series-metrics',
        label: 'Метрики и Временные Ряды',
        description: 'Сбор и анализ данных, привязанных к метке времени (IoT, мониторинг).',
        recommendedTypes: ['time-series-database'],
        recommendedVendors: ['influxdb', 'timescaledb', 'prometheus-tsdb'],
        reasoning: 'Специализированные TSDB оптимизированы для непрерывной записи (append-only) и запросов по временным диапазонам.',
        icon: 'Activity',
        category: 'IoT'
    },
    {
        id: 'graph-relations',
        label: 'Социальный Граф и Связи',
        description: 'Глубокий анализ взаимосвязей между сущностями.',
        recommendedTypes: ['graph-database'],
        recommendedVendors: ['neo4j', 'amazon-neptune', 'arangodb'],
        reasoning: 'Графовые базы данных хранят связи как объекты первого класса, что делает обход графа (друзья друзей, рекомендации) молниеносным.',
        icon: 'Share2',
        category: 'Data'
    },

    // --- Search & AI ---
    {
        id: 'full-text-search',
        label: 'Поисковый Движок (FTS)',
        description: 'Релевантный поиск по тексту, фасеты и фильтрация.',
        recommendedTypes: ['search-engine'],
        recommendedVendors: ['elasticsearch', 'opensearch', 'algolia'],
        reasoning: 'Использование обратных индексов (Inverted Index) позволяет находить документы по ключевым словам практически мгновенно.',
        icon: 'Search',
        category: 'Data'
    },
    {
        id: 'vector-search',
        label: 'Семантический Поиск (Vector)',
        description: 'Поиск похожих объектов на основе векторных представлений (Embeddings).',
        recommendedTypes: ['vector-database'],
        recommendedVendors: ['pinecone', 'milvus', 'weaviate'],
        reasoning: 'Векторные БД используют алгоритмы ANN (HNSW, IVF) для поиска по смыслу, а не по точному совпадению слов.',
        icon: 'ScanSearch',
        category: 'AI'
    },
    {
        id: 'rag-architecture',
        label: 'RAG (Retrieval-Augmented)',
        description: 'Генерация ответов LLM с использованием контекста из базы знаний.',
        recommendedTypes: ['llm-model', 'vector-database', 'orchestrator'],
        recommendedVendors: ['gpt-4o', 'pinecone', 'langchain'],
        reasoning: 'Сочетание "памяти" (Vector DB) и "интеллекта" (LLM) позволяет создавать точных и актуальных AI-ассистентов.',
        icon: 'BrainCircuit',
        category: 'AI'
    },

    // --- Architecture Patterns ---
    {
        id: 'event-driven',
        label: 'Event-Driven Architecture',
        description: 'Асинхронное взаимодействие сервисов через события.',
        recommendedTypes: ['message-broker', 'queue'],
        recommendedVendors: ['kafka', 'rabbitmq', 'amazon-sqs'],
        reasoning: 'EDA снижает связанность (coupling) компонентов и позволяет им масштабироваться независимо, повышая общую надежность.',
        icon: 'Network',
        category: 'Microservices'
    },
    {
        id: 'microservices-comm',
        label: 'Микросервисное взаимодействие',
        description: 'Синхронные и асинхронные вызовы между сервисами.',
        recommendedTypes: ['api-gateway', 'service-discovery', 'service-mesh'],
        recommendedVendors: ['kong', 'consul', 'istio'],
        reasoning: 'Для управления трафиком в распределенной системе необходимы Service Discovery и API Gateway для единой точки входа.',
        icon: 'Server',
        category: 'Microservices'
    },
    {
        id: 'api-management',
        label: 'Публичный API (API Gateway)',
        description: 'Управление доступом, квотами и версионированием внешнего API.',
        recommendedTypes: ['api-gateway', 'auth-service'],
        recommendedVendors: ['aws-api-gateway', 'kong', 'auth0'],
        reasoning: 'Шлюз берет на себя cross-cutting concerns: аутентификацию, rate limiting, кэширование ответов и мониторинг.',
        icon: 'Webhook',
        category: 'Microservices'
    },
    {
        id: 'serverless-backend',
        label: 'Serverless Backend',
        description: 'Полностью бессерверная архитектура для веб-приложений.',
        recommendedTypes: ['lambda', 'api-gateway', 'database'],
        recommendedVendors: ['aws-lambda', 'aws-api-gateway', 'dynamodb'],
        reasoning: 'Позволяет платить только за время выполнения кода, автоматически масштабируется от 0 до тысяч запросов.',
        icon: 'CloudLightning',
        category: 'Infrastructure'
    },

    // --- Performance & Scale ---
    {
        id: 'high-performance-cache',
        label: 'Высокоскоростной Кэш',
        description: 'Снижение нагрузки на БД и ускорение отклика.',
        recommendedTypes: ['cache'],
        recommendedVendors: ['redis', 'memcached', 'hazelcast'],
        reasoning: 'Хранение горячих данных в оперативной памяти (In-Memory) обеспечивает суб-миллисекундный доступ.',
        icon: 'Gauge',
        category: 'Infrastructure'
    },
    {
        id: 'global-content-delivery',
        label: 'Глобальная доставка (CDN)',
        description: 'Раздача статики и медиа с минимальной задержкой по миру.',
        recommendedTypes: ['cdn', 'object-storage'],
        recommendedVendors: ['cloudflare', 'aws-cloudfront', 'aws-s3'],
        reasoning: 'CDN кэширует контент на Edge-серверах близко к пользователю, разгружая центральные сервера.',
        icon: 'Globe',
        category: 'Infrastructure'
    },
    {
        id: 'load-balancing-l7',
        label: 'L7 Балансировка Нагрузки',
        description: 'Умное распределение HTTP/HTTPS трафика.',
        recommendedTypes: ['load-balancer'],
        recommendedVendors: ['nginx', 'haproxy', 'aws-alb'],
        reasoning: 'Балансировщики прикладного уровня (L7) могут маршрутизировать запросы на основе URL, заголовков и cookies.',
        icon: 'ArrowLeftRight',
        category: 'Infrastructure'
    },

    // --- DevOps & Operations ---
    {
        id: 'ci-cd-automation',
        label: 'CI/CD Пайплайн',
        description: 'Автоматическая сборка, тестирование и деплой кода.',
        recommendedTypes: ['ci-cd-pipeline', 'vcs'],
        recommendedVendors: ['github-actions', 'gitlab-ci', 'jenkins'],
        reasoning: 'Непрерывная интеграция и доставка (CI/CD) ускоряют time-to-market и снижают риск человеческих ошибок.',
        icon: 'GitMerge',
        category: 'DevOps'
    },
    {
        id: 'k8s-orchestration',
        label: 'Оркестрация Контейнеров',
        description: 'Управление жизненным циклом тысяч контейнеров.',
        recommendedTypes: ['orchestrator', 'container', 'service-discovery'],
        recommendedVendors: ['kubernetes', 'docker', 'etcd'],
        reasoning: 'Kubernetes стал стандартом для запуска микросервисов, обеспечивая самовосстановление и автоматическое масштабирование.',
        icon: 'Box',
        category: 'DevOps'
    },
    {
        id: 'iac-provisioning',
        label: 'Infrastructure as Code',
        description: 'Управление инфраструктурой через конфигурационные файлы.',
        recommendedTypes: ['configuration-management'],
        recommendedVendors: ['terraform', 'ansible', 'pulumi'],
        reasoning: 'Подход IaC позволяет версионировать инфраструктуру, проверять изменения и избегать дрифта конфигураций.',
        icon: 'FileCode',
        category: 'DevOps'
    },
    {
        id: 'observability-stack',
        label: 'Full-Stack Observability',
        description: 'Централизованные логи, метрики и распределенный трейсинг.',
        recommendedTypes: ['monitoring', 'logging', 'service-mesh'],
        recommendedVendors: ['prometheus', 'grafana', 'elk-stack'],
        reasoning: 'Без глубокой наблюдаемости невозможно эффективно отлаживать и эксплуатировать распределенные системы.',
        icon: 'Eye',
        category: 'DevOps'
    },

    // --- Data Engineering ---
    {
        id: 'etl-pipeline',
        label: 'ETL Пайплайн данных',
        description: 'Извлечение, трансформация и загрузка данных из разных источников.',
        recommendedTypes: ['etl-service', 'batch-processor'],
        recommendedVendors: ['airbyte', 'apache-airflow', 'dbt'],
        reasoning: 'Современные стеки данных (MDS) используют ELT подход, загружая "сырые" данные и трансформируя их уже в DWH.',
        icon: 'Workflow',
        category: 'Data'
    },
    {
        id: 'stream-analytics',
        label: 'Потоковая аналитика',
        description: 'Обработка данных в движении (Data in Motion).',
        recommendedTypes: ['stream-processor', 'message-broker'],
        recommendedVendors: ['apache-flink', 'kafka', 'spark-streaming'],
        reasoning: 'Позволяет реагировать на события (например, мошенничество) мгновенно, не дожидаясь ночных батчей.',
        icon: 'Zap',
        category: 'Data'
    },
    {
        id: 'data-lakehouse',
        label: 'Data Lakehouse',
        description: 'Гибрид озера данных и хранилища.',
        recommendedTypes: ['data-lake', 'data-warehouse'],
        recommendedVendors: ['databricks', 'aws-lake-formation', 'delta-lake'],
        reasoning: 'Объединяет гибкость Data Lake (хранение любых форматов) с управлением и качеством Data Warehouse.',
        icon: 'Database',
        category: 'Data'
    },

    // --- Security ---
    {
        id: 'zero-trust',
        label: 'Zero Trust Network',
        description: 'Сетевая безопасность "никому не доверяй".',
        recommendedTypes: ['identity-provider', 'vpn-gateway', 'service-mesh'],
        recommendedVendors: ['cloudflare-access', 'tailscale', 'istio'],
        reasoning: 'Каждый запрос должен быть аутентифицирован и авторизован, независимо от того, находится ли пользователь внутри сети.',
        icon: 'ShieldCheck',
        category: 'Security'
    },
    {
        id: 'secrets-management',
        label: 'Centralized Secrets',
        description: 'Безопасное хранение паролей, ключей и сертификатов.',
        recommendedTypes: ['secret-management', 'identity-provider'],
        recommendedVendors: ['hashicorp-vault', 'aws-secrets-manager'],
        reasoning: 'Исключает хранение секретов в коде, поддерживает ротацию и детальный аудит доступа.',
        icon: 'Lock',
        category: 'Security'
    },
    {
        id: 'waf-protection',
        label: 'Web Application Firewall',
        description: 'Защита от OWASP Top 10 атак (SQLi, XSS).',
        recommendedTypes: ['firewall'],
        recommendedVendors: ['cloudflare-waf', 'aws-waf'],
        reasoning: 'WAF фильтрует вредоносный HTTP трафик на границе сети, защищая приложение от взлома.',
        icon: 'ShieldAlert',
        category: 'Security'
    },

    // --- FinTech & Blockchain ---
    {
        id: 'crypto-exchange',
        label: 'Криптобиржа (CEX)',
        description: 'Мэтчинг ордеров, горячие/холодные кошельки.',
        recommendedTypes: ['database', 'cache', 'message-broker'],
        recommendedVendors: ['time-series-database', 'redis', 'kafka'],
        reasoning: 'Требует экстремально низкой задержки (Low Latency) и абсолютной точности данных.',
        icon: 'Bitcoin',
        category: 'FinTech'
    },
    {
        id: 'audit-log',
        label: 'Неизменяемый Аудит',
        description: 'Хранение истории действий без возможности подделки.',
        recommendedTypes: ['blockchain', 'database'],
        recommendedVendors: ['amazon-qldb', 'postgresql'],
        reasoning: 'Для комплаенса часто требуется Immutable Ledger, где записи защищены криптографически.',
        icon: 'FileText',
        category: 'FinTech'
    },

    // --- IoT & Edge ---
    {
        id: 'iot-smart-factory',
        label: 'Умное производство (IIoT)',
        description: 'Сбор телеметрии с датчиков и управление оборудованием.',
        recommendedTypes: ['iot-gateway', 'edge-computing', 'time-series-database'],
        recommendedVendors: ['azure-iot-edge', 'aws-iot-greengrass', 'influxdb'],
        reasoning: 'Обработка данных на Edge снижает нагрузку на сеть и позволяет работать автономно при обрывах связи.',
        icon: 'Factory',
        category: 'IoT'
    },
    {
        id: 'connected-vehicles',
        label: 'Подключенный транспорт',
        description: 'Стриминг геопозиции и телеметрии автопарка.',
        recommendedTypes: ['stream-processor', 'database'],
        recommendedVendors: ['kafka', 'postgis', 'redis'],
        reasoning: 'Гео-пространственные индексы (GeoSpatial) необходимы для эффективного поиска объектов на карте в реальном времени.',
        icon: 'Car',
        category: 'IoT'
    },

    // --- Specific Scenarios (Adding Variety to reach scale) ---
    {
        id: 'realtime-bidding',
        label: 'Real-Time Bidding (AdTech)',
        description: 'Аукцион рекламы за миллисекунды.',
        recommendedTypes: ['cache', 'database', 'load-balancer'],
        recommendedVendors: ['aerospike', 'redis', 'nginx'],
        reasoning: 'Жесткий SLA (<100ms) требует in-memory БД и максимально оптимизированного сетевого стека.',
        icon: 'DollarSign',
        category: 'E-commerce'
    },
    {
        id: 'video-streaming',
        label: 'Видео-стриминг (VOD)',
        description: 'Хранение, транскодирование и раздача видео.',
        recommendedTypes: ['object-storage', 'cdn', 'queue'],
        recommendedVendors: ['aws-s3', 'aws-cloudfront', 'aws-elemental'],
        reasoning: 'Тяжелый контент должен храниться в объектном хранилище и кэшироваться через CDN.',
        icon: 'Video',
        category: 'Entertainment' // Assuming type matches generic or I simply stick to standard types
    },
    {
        id: 'collaborative-editor',
        label: 'Совместное редактирование',
        description: 'Google Docs-like работа с документами.',
        recommendedTypes: ['store-kv', 'websocket-server'], // Abstracting some types if not in enum
        recommendedVendors: ['redis', 'socket-io', 'yjs'], // Assuming we might add these or map to existing
        reasoning: 'Использование CRDT (Conflict-free Replicated Data Types) и WebSockets для синхронизации курсоров и текста.',
        icon: 'Edit3',
        category: 'SaaS'
    },
    {
        id: 'chat-app',
        label: 'Мессенджер / Чат',
        description: 'Обмен сообщениями в реальном времени, статусы присутствия.',
        recommendedTypes: ['database', 'cache', 'message-broker'],
        recommendedVendors: ['cassandra', 'redis', 'rabbitmq'],
        reasoning: 'Cassandra идеальна для истории сообщений (Write Heavy), Redis для статусов online/offline.',
        icon: 'MessageCircle',
        category: 'Social'
    },
    {
        id: 'ml-training-pipeline',
        label: 'ML Обучение Моделей',
        description: 'Подготовка данных и тренировка нейросетей.',
        recommendedTypes: ['data-lake', 'batch-processor', 'container'],
        recommendedVendors: ['aws-sagemaker', 'airflow', 'docker'],
        reasoning: 'Требует мощных вычислений (GPU) и оркестрации этапов подготовки данных.',
        icon: 'Brain',
        category: 'AI'
    },
    {
        id: 'recommendation-system',
        label: 'Система Рекомендаций',
        description: 'Персонализированная выдача контента.',
        recommendedTypes: ['vector-database', 'cache', 'analytics-service'],
        recommendedVendors: ['pinecone', 'redis', 'spark'],
        reasoning: 'Сочетает коллаборативную фильтрацию (Batch/Spark) и векторный поиск (Real-time).',
        icon: 'Star',
        category: 'AI'
    },
    {
        id: 'fraud-detection',
        label: 'Антифрод Система',
        description: 'Выявление подозрительных транзакций на лету.',
        recommendedTypes: ['stream-processor', 'graph-database', 'ml-inference'],
        recommendedVendors: ['flink', 'neo4j', 'aws-sagemaker'],
        reasoning: 'Анализ графа связей и паттернов поведения в реальном времени блокирует мошенников.',
        icon: 'ShieldOff',
        category: 'FinTech'
    },
    {
        id: 'inventory-management',
        label: 'Управление запасами (Inventory)',
        description: 'Точный учет остатков на складах, резервирование.',
        recommendedTypes: ['database', 'queue'],
        recommendedVendors: ['postgresql', 'rabbitmq'],
        reasoning: 'Использование оптимистических блокировок или очередей для предотвращения overselling (продажи воздуха).',
        icon: 'Package',
        category: 'E-commerce'
    },
    {
        id: 'leaderboard',
        label: 'Игровые Таблицы Лидеров',
        description: 'Ранжирование миллионов игроков в реальном времени.',
        recommendedTypes: ['cache'],
        recommendedVendors: ['redis'],
        reasoning: 'Redis Sorted Sets (ZSET) идеально подходят для реализации лидербордов с операциями за O(log(N)).',
        icon: 'Trophy',
        category: 'Gaming'
    },
    {
        id: 'matchmaking',
        label: 'Game Matchmaking',
        description: 'Подбор соперников по уровню (ELO).',
        recommendedTypes: ['cache', 'server'],
        recommendedVendors: ['redis', 'agones'], // Agones for K8s game server
        reasoning: 'Требует быстрого поиска групп игроков с близкими параметрами в памяти.',
        icon: 'Users',
        category: 'Gaming'
    },
    {
        id: 'telemedicine',
        label: 'Телемедицина (HIPAA)',
        description: 'Защищенные видео-консультации и хранение медкарт.',
        recommendedTypes: ['database', 'storage', 'auth-service'],
        recommendedVendors: ['postgresql', 'aws-s3', 'auth0'],
        reasoning: 'Критически важно шифрование данных (At-rest/In-transit) и строгий контроль доступа.',
        icon: 'Stethoscope',
        category: 'Healthcare'
    },
    {
        id: 'ehr-system',
        label: 'Электронные медкарты (EHR)',
        description: 'Долгосрочное хранение истории болезней.',
        recommendedTypes: ['database', 'audit-log'],
        recommendedVendors: ['postgresql', 'mongo-atlas'], // FHIR support
        reasoning: 'Поддержка стандартов интероперабельности (FHIR, HL7) и версионирование документов.',
        icon: 'FileHeart',
        category: 'Healthcare'
    },
    {
        id: 'mobile-backend',
        label: 'Mobile BaaS',
        description: 'Бэкенд для мобильных приложений "из коробки".',
        recommendedTypes: ['baas', 'auth-service', 'database'],
        recommendedVendors: ['firebase', 'supabase', 'appwrite'],
        reasoning: 'Ускоряет разработку за счет готовых SDK для Auth, DB, Storage и Push-уведомлений.',
        icon: 'Smartphone',
        category: 'Mobile' // Assuming generic or SaaS
    },
    {
        id: 'push-notifications',
        label: 'Рассылка Уведомлений',
        description: 'Миллионы пушей пользователям.',
        recommendedTypes: ['notification-service', 'queue'],
        recommendedVendors: ['firebase-fcm', 'onesignal', 'kafka'],
        reasoning: 'Очереди необходимы для сглаживания пиков отправки при массовых рассылках.',
        icon: 'Bell',
        category: 'Mobile'
    },
    {
        id: 'loyalty-program',
        label: 'Программа Лояльности',
        description: 'Начисление баллов, скидки, кэшбэк.',
        recommendedTypes: ['database', 'rules-engine'],
        recommendedVendors: ['postgresql', 'drools'], // Generic rules engine
        reasoning: 'Транзакционность начисления баллов и гибкий движок правил для акций.',
        icon: 'Gift',
        category: 'E-commerce'
    },
    {
        id: 'supply-chain',
        label: 'Цепочки Поставок',
        description: 'Трекинг движения товаров от производителя к покупателю.',
        recommendedTypes: ['blockchain', 'iot-gateway'],
        recommendedVendors: ['hyperledger', 'aws-iot'],
        reasoning: 'Прозрачность и невозможность подделки истории перемещений.',
        icon: 'Truck',
        category: 'Enterprise'
    },
    {
        id: 'crm-system',
        label: 'CRM Система',
        description: 'Управление отношениями с клиентами.',
        recommendedTypes: ['database', 'search-engine'],
        recommendedVendors: ['salesforce', 'postgresql', 'elasticsearch'],
        reasoning: 'Единый профиль клиента, агрегирующий данные из продаж, маркетинга и поддержки.',
        icon: 'Users',
        category: 'Enterprise'
    },
    {
        id: 'erp-core',
        label: 'ERP Ядро',
        description: 'Управление ресурсами предприятия.',
        recommendedTypes: ['database', 'reporting'],
        recommendedVendors: ['sap-hana', 'oracle-db'],
        reasoning: 'Мощная транзакционная база данных и интеграционная шина.',
        icon: 'Briefcase',
        category: 'Enterprise'
    },
    {
        id: 'booking-system',
        label: 'Система Бронирования',
        description: 'Отели, авиабилеты, столики.',
        recommendedTypes: ['database', 'cache'],
        recommendedVendors: ['postgresql', 'redis'],
        reasoning: 'Строгая консистентность для избежания Double Booking (двойного бронирования).',
        icon: 'CalendarCheck',
        category: 'SaaS'
    },
    {
        id: 'ticketing-concerts',
        label: 'Продажа Билетов (High Load)',
        description: 'Старт продаж на популярные концерты.',
        recommendedTypes: ['queue', 'cache'],
        recommendedVendors: ['queue-it', 'redis'], // Queue-it virtual waiting room
        reasoning: 'Виртуальная очередь (Waiting Room) защищает бэкенд от лавины запросов в первые секунды.',
        icon: 'Ticket',
        category: 'E-commerce'
    },
    {
        id: 'static-site-hosting',
        label: 'Jamstack Хостинг',
        description: 'Хостинг статических сайтов и SPA.',
        recommendedTypes: ['cdn', 'serverless'],
        recommendedVendors: ['vercel', 'netlify', 'cloudflare-pages'],
        reasoning: 'Максимальная производительность и безопасность за счет пре-рендеринга и CDN.',
        icon: 'Layout',
        category: 'Infrastructure'
    },
    {
        id: 'image-processing',
        label: 'Обработка Изображений',
        description: 'Ресайз, кроп, фильтры на лету.',
        recommendedTypes: ['serverless', 'cdn'],
        recommendedVendors: ['aws-lambda', 'cloudinary', 'imgix'],
        reasoning: 'Serverless функции отлично подходят для event-based обработки загруженных файлов.',
        icon: 'Image',
        category: 'SaaS'
    },
    {
        id: 'doc-management',
        label: 'Документооборот (DMS)',
        description: 'Версионирование, OCR, поиск сканов.',
        recommendedTypes: ['object-storage', 'search-engine', 'ocr-service'],
        recommendedVendors: ['aws-textract', 'elasticsearch', 's3'],
        reasoning: 'Извлечение текста из сканов (OCR) и полнотекстовый поиск по ним.',
        icon: 'FileText',
        category: 'Enterprise'
    },
    {
        id: 'learning-lms',
        label: 'LMS Платформа',
        description: 'Курсы, тесты, прогресс студентов.',
        recommendedTypes: ['database', 'video-streaming'],
        recommendedVendors: ['postgresql', 'mux'],
        reasoning: 'Отслеживание прогресса обучения и качественная доставка видео-контента.',
        icon: 'GraduationCap',
        category: 'Education' // Fallback to SaaS or Enterprise if explicit type limited
    },
    {
        id: 'geo-fencing',
        label: 'Гео-фенсинг и Маркетинг',
        description: 'Уведомления при входе в зону.',
        recommendedTypes: ['database', 'notification-service'],
        recommendedVendors: ['postgis', 'firebase-fcm'],
        reasoning: 'Эффективные пространственные запросы (Point in Polygon).',
        icon: 'MapPin',
        category: 'Mobile'
    },
    {
        id: 'ab-testing',
        label: 'A/B Тестирование',
        description: 'Сплит трафика и анализ конверсий.',
        recommendedTypes: ['feature-flags', 'analytics-service'],
        recommendedVendors: ['launchdarkly', 'google-analytics'],
        reasoning: 'Динамическое управление фичами (Toggle) без перевыкладки кода.',
        icon: 'Split',
        category: 'DevOps'
    },
    {
        id: 'archive-storage',
        label: 'Долгосрочный Архив',
        description: 'Холодное хранение бэкапов и логов.',
        recommendedTypes: ['object-storage'],
        recommendedVendors: ['aws-glacier', 'azure-archive'],
        reasoning: 'Экстремально дешевое хранение для данных, доступ к которым нужен редко (Cold Storage).',
        icon: 'Archive',
        category: 'Infrastructure'
    },
    {
        id: 'hybrid-cloud',
        label: 'Hybrid Cloud',
        description: 'Соединение On-premise и Pubic Cloud.',
        recommendedTypes: ['vpn-gateway', 'container-orchestrator'],
        recommendedVendors: ['aws-direct-connect', 'anthos', 'openshift'],
        reasoning: 'Позволяет держать чувствительные данные у себя, а вычислительную мощность брать из облака.',
        icon: 'CloudCog',
        category: 'Infrastructure'
    },
    {
        id: 'multi-region',
        label: 'Multi-Region Failover',
        description: 'Катастрофоустойчивость глобального уровня.',
        recommendedTypes: ['dns-service', 'database'],
        recommendedVendors: ['route53', 'dynamodb-global', 'aurora-global'],
        reasoning: 'Репликация данных между континентами и автоматическое переключение DNS при аварии региона.',
        icon: 'Globe2',
        category: 'Infrastructure'
    }
]
