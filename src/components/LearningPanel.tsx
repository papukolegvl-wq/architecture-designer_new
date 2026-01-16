
import React, { useState, useMemo } from 'react'
import { Node, Edge } from 'reactflow'
import { X, Check, ArrowRight, BookOpen, AlertCircle, ChevronLeft, Layers, Shield, Zap, Activity, Server, Database, Globe, Lock, Eye, Play, Box, GitBranch, Scale, RefreshCw, FileCode, Target, MousePointer, AppWindow, Milestone } from 'lucide-react'
import { ComponentData } from '../types'

// --- Types ---

interface ValidationReqComponent {
    type: string
    count: number
}

interface ValidationReqConnection {
    from: string
    to: string
    bidirectional?: boolean
    type?: string // Opional edge type check
}

interface ValidationParams {
    requiredComponents: ValidationReqComponent[]
    requiredConnections: ValidationReqConnection[]
    minTotalComponents?: number
}

interface Lesson {
    id: string
    title: string
    pattern: string
    tactic: string
    description: string
    keyIdea?: string
    dataFlow?: string[]
    commonMistakes?: string[]
    instructions: string[]
    validationParams: ValidationParams
    realWorldExample?: string
}

interface QualityCategory {
    id: string
    title: string
    icon: React.ReactNode
    description: string
    lessons: Lesson[]
}

// --- Data: Categories and Lessons ---

const categories: QualityCategory[] = [
    {
        id: 'scalability',
        title: 'Масштабируемость',
        icon: <Activity size={20} />,
        description: 'Способность системы справляться с ростом нагрузки.',
        lessons: [
            {
                id: 'scalability-lb',
                title: 'Load Balancing (Балансировка)',
                pattern: 'Load Balancer',
                tactic: 'Распределение нагрузки.',
                description: 'Компонент, распределяющий входящий трафик между инстансами приложений. Может работать на уровне L4 (Transport, TCP/UDP) или L7 (Application, HTTP/gRPC). Включает в себя терминацию SSL/TLS.',
                keyIdea: 'Ни один сервер не должен стать узким местом (Bottleneck), и отказ одного не должен валить систему.',
                dataFlow: [
                    '1. Клиент отправляет HTTPS запрос на VIP (Virtual IP) балансировщика.',
                    '2. Балансировщик терминирует SSL, расшифровывает пакет.',
                    '3. Выбирает Target по алгоритму (Least Connections для длинных сессий, Round Robin для коротких).',
                    '4. Перенаправляет запрос на приватный IP выбранного сервиса.',
                ],
                commonMistakes: [
                    '❌ Балансировщик как SPOF (нужен HA-кластер, например, через VRRP/Keepalived).',
                    '❌ Отсутствие Session Affinity (Sticky Sessions) для приложений, хранящих стейт в памяти.',
                    '❌ "Thundering Herd" — одновременный рестарт всех бэкендов после сбоя.',
                    '❌ Ненастроенные Health Checks (TCP check проходит, а приложение выдает 500).'
                ],
                instructions: [
                    '1. Разместите компонент "Балансировщик" (Load Balancer).',
                    '2. Разместите два компонента "Сервис" (Service), представляющих экземпляры приложения.',
                    '3. Соедините "Балансировщик" с первым "Сервисом".',
                    '4. Соедините "Балансировщик" со вторым "Сервисом".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'NGINX Upstream (L7), HAProxy (High Performance), AWS ALB (Application Load Balancer), Kubernetes Ingress.'
            },
            {
                id: 'scalability-sharding',
                title: 'Database Sharding',
                pattern: 'Sharding',
                tactic: 'Горизонтальное партиционирование.',
                description: 'Метод горизонтального масштабирования БД, когда данные распределяются по разным физическим серверам (шардам) на основе Sharding Key. Позволяет преодолеть лимиты записи (Write IOPS) одного сервера.',
                keyIdea: 'Разделяй и властвуй: данные распределены, запросы изолированы.',
                dataFlow: [
                    '1. Клиент/Proxy вычисляет хэш от Shard Key (e.g. hash(User_ID) % 3).',
                    '2. Запрос маршрутизируется исключительно на Шард №2.',
                    '3. Шард выполняет операцию локально, не зная о других шардах (Shared Nothing).',
                ],
                commonMistakes: [
                    '❌ "Hot Shard" — неудачный выбор ключа (например, дата), приводящий к записи всех данных в один шард.',
                    '❌ Cross-Shard Joins — попытка связать таблицы с разных серверов (убивает производительность).',
                    '❌ Отсутствие стратегии решардинга (что делать, когда 3 сервера переполнятся?).',
                    '❌ Утеря транзакционности (ACID) между шардами.'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис" (Application Service).',
                    '2. Разместите три компонента "База данных" (Database), представляющие отдельные шарды.',
                    '3. Проведите связь от "Сервиса" к первому шарду "База данных".',
                    '4. Проведите связь от "Сервиса" ко второму шарду "База данных".',
                    '5. Проведите связь от "Сервиса" к третьему шарду "База данных".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 3 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                },
                realWorldExample: 'MongoDB Sharded Cluster, Cassandra (Ring Architecture), Vitess (for MySQL), Citus (for PostgreSQL).'
            },
            {
                id: 'scalability-microservices',
                title: 'Microservices',
                pattern: 'Database per Service',
                tactic: 'Декомпозиция по бизнес-доменам.',
                description: 'Разделение монолита на автономные сервисы. Каждый микросервис владеет своей базой данных. Доступ к данным чужого сервиса — ТОЛЬКО через его API. Это обеспечивает независимый деплой и масштабирование.',
                keyIdea: 'Share-Nothing Architecture. Инкапсуляция данных внутри сервиса.',
                dataFlow: [
                    '1. Client делает запрос в API Gateway.',
                    '2. Gateway маршрутизирует в Order Service.',
                    '3. Order Service пишет в Order DB.',
                    '4. Order Service отправляет событие "OrderCreated".',
                    '5. Payment Service ловит событие и списывает деньги в Payment DB.'
                ],
                commonMistakes: [
                    '❌ Distributed Monolith — тесная связность, синхронные HTTP-цепочки вызовов.',
                    '❌ Shared Database — несколько сервисов лезут в одну БД (нарушение изоляции).',
                    '❌ Игнорирование Eventual Consistency (попытка сделать все транзакционно сразу).',
                    '❌ Сложность отладки и трассировки (нужен Distributed Tracing).'
                ],
                instructions: [
                    '1. Разместите компонент "API Gateway".',
                    '2. Создайте Сервис А: добавьте "Сервис" и "Базу данных", соедините Сервис -> БД.',
                    '3. Создайте Сервис Б: добавьте второй "Сервис" и вторую "Базу данных", соедините Сервис -> БД.',
                    '4. Подключите "API Gateway" к Сервису А.',
                    '5. Подключите "API Gateway" к Сервису Б.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'database', count: 2 }, { type: 'api-gateway', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'database' }, { from: 'api-gateway', to: 'service' }]
                },
                realWorldExample: 'Netflix (1000+ services), Uber, Amazon. Implementation: Spring Boot, GoKit, gRPC.'
            },
            {
                id: 'scalability-async',
                title: 'Async Messaging',
                pattern: 'Message Queue / Broker',
                tactic: 'Асинхронный обмен сообщениями.',
                description: 'Развязывание сервисов (Decoupling) через брокер сообщений. Позволяет сглаживать пики нагрузки (Load Leveling) и гарантировать доставку сообщений (Durability).',
                keyIdea: 'Producer не ждет Consumer. Fire and Forget.',
                dataFlow: [
                    '1. Producer отправляет событие (Event) в Топик брокера.',
                    '2. Брокер сохраняет сообщение на диск (Persistence) и шлет ACK.',
                    '3. Consumer (в группе) вычитывает сообщение.',
                    '4. Consumer обрабатывает задачу и шлет ACK брокеру (Commit Offset).',
                ],
                commonMistakes: [
                    '❌ Отсутствие идемпотентности у Consumer-а (сообщение может прийти дважды: At-least-once delivery).',
                    '❌ Использование БД как очереди (Polling убивает базу).',
                    '❌ Потеря порядка сообщений (если важен порядок, нужно партиционирование по ключу).',
                    '❌ Отсутствие Dead Letter Queue (DLQ) для битых сообщений.'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Producer).',
                    '2. Разместите компонент "Очередь" (Queue/Broker).',
                    '3. Разместите "Сервис" (Consumer).',
                    '4. Создайте связь от Producer к "Очереди".',
                    '5. Создайте связь от "Очереди" к Consumer.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'queue', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'queue' }, { from: 'queue', to: 'service' }]
                },
                realWorldExample: 'Apache Kafka (Log-based), RabbitMQ (Queue-based), Amazon SQS/SNS.'
            },
            {
                id: 'scalability-cache',
                title: 'Caching Strategies',
                pattern: 'Cache-Aside / Write-Through',
                tactic: 'Снижение latency и нагрузки на БД.',
                description: 'Хранение часто запрашиваемых данных в быстрой in-memory базе. Pattern Cache-Aside: приложение само управляет кэшем. Pattern Write-Through: кэш сам пишет в БД.',
                keyIdea: 'Память быстрее диска, но дороже и меньше.',
                dataFlow: [
                    '1. App запрашивает User ID=1.',
                    '2. App проверяет Redis (GET user:1).',
                    '3. Cache Miss: App идет в Postgres (SELECT * FROM users WHERE id=1).',
                    '4. App записывает результат в Redis (SETEX user:1 3600 ...) и возвращает ответ.',
                ],
                commonMistakes: [
                    '❌ Кэширование без TTL (Time To Live) — память переполнится.',
                    '❌ Cache Penetration — запросы несуществующих ключей пробивают кэш насмерть (нужен Bloom Filter/Null object).',
                    '❌ Cache Stampede — 1000 запросов одновременно идут в БД при протухании горячего ключа (нужна Locking/Probabilistic eviction).',
                    '❌ Рассинхрон с БД (нужна инвалидация при записи).'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис" (Service).',
                    '2. Разместите компонент "Кэш" (Cache).',
                    '3. Разместите компонент "База данных" (Database).',
                    '4. Соедините "Сервис" с "Кэшем".',
                    '5. Соедините "Сервис" с "Базой данных".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'cache', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'cache' }, { from: 'service', to: 'database' }]
                },
                realWorldExample: 'Redis (In-memory structure store), Memcached. Used for Session storage, API responses, counters.'
            },
            {
                id: 'scalability-cdn',
                title: 'CDN (Content Delivery Network)',
                pattern: 'Edge Caching',
                tactic: 'Географическое распределение статики.',
                description: 'Сеть серверов (PoP), кэширующая контент максимально близко к конечному пользователю. Снижает нагрузку на Origin и уменьшает Latency.',
                keyIdea: 'Speed of Light matters. Доставляй контент с соседней улицы.',
                dataFlow: [
                    '1. Браузер запрашивает style.css.',
                    '2. DNS направляет пользователя на ближайший Edge Server (например, во Frankfurt).',
                    '3. Edge отдает файл из кэша. Если нет — идет на Origin сервер (в US), кэширует и отдает.',
                ],
                commonMistakes: [
                    '❌ Использование CDN для динамического/приватного API без настройки (риск утечки).',
                    '❌ Отсутствие версионирования ассетов (style.v1.css) — проблемы с инвалидацией.',
                    '❌ Игнорирование HTTP заголовков Cache-Control и ETag.'
                ],
                instructions: [
                    '1. Разместите компонент "Клиент".',
                    '2. Разместите компонент "CDN".',
                    '3. Разместите компонент "Сервер" (Origin).',
                    '4. Соедините "Клиент" с "CDN".',
                    '5. Соедините "CDN" с "Сервером".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cdn', count: 1 }, { type: 'server', count: 1 }],
                    requiredConnections: [{ from: 'cdn', to: 'server' }]
                },
                realWorldExample: 'Cloudflare, AWS CloudFront, Akamai. Uses Anycast IP to route to nearest PoP.'
            },
            {
                id: 'scalability-serverless',
                title: 'Serverless / FaaS',
                pattern: 'Function as a Service',
                tactic: 'Event-driven compute.',
                description: 'Модель облачных вычислений, где облачный провайдер динамически управляет выделением ресурсов. Код (функция) запускается только в ответ на события.',
                keyIdea: 'No Server to Manage. Scale to Zero.',
                dataFlow: [
                    '1. Пользователь загружает фото в Object Storage (S3).',
                    '2. S3 генерирует событие "ObjectCreated".',
                    '3. Облако запускает Lambda-функцию для ресайза фото.',
                    '4. Функция сохраняет превью и умирает.',
                ],
                commonMistakes: [
                    '❌ Cold Starts — задержка 1-5 сек при запуске "холодного" контейнера (проблема для API).',
                    '❌ Использование Serverless для задач с длительным выполнением (Hard limits 15 min).',
                    '❌ Проблемы с коннектами к RDBMS (исчерпание лимитов подключений) — нужен Proxy.',
                    '❌ Vendor Lock-in (привязка к инфраструктуре AWS/Azure).'
                ],
                instructions: [
                    '1. Разместите компонент "API Gateway".',
                    '2. Разместите первый компонент "Бессерверная функция" (Logic A).',
                    '3. Разместите второй компонент "Бессерверная функция" (Logic B).',
                    '4. Создайте связь от "API Gateway" к первой функции.',
                    '5. Создайте связь от "API Gateway" ко второй функции.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'lambda', count: 2 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'lambda' }]
                },
                realWorldExample: 'AWS Lambda, Azure Functions, Google Cloud Functions, Vercel Functions.'
            },
            {
                id: 'scalability-cqrs',
                title: 'CQRS + Event Sourcing',
                pattern: 'Command Query Responsibility Segregation',
                tactic: 'Разделение моделей чтения и записи.',
                description: 'Паттерн, где операции модификации (Command) и чтения (Query) разделены на разные модели и базы данных. Часто используется с Event Sourcing, где состояние — это последовательность событий.',
                keyIdea: 'Оптимизируй Write для целостности, а Read для скорости и масштаба.',
                dataFlow: [
                    '1. Command Service валидирует и пишет в Write DB (Event Store).',
                    '2. Событие пушится в Шину (Kafka).',
                    '3. Projection Service (Worker) читает событие и обновляет Read DB (Elastic/Redis).',
                    '4. Query Service читает готовый "View" из Read DB мгновенно.',
                ],
                commonMistakes: [
                    '❌ Eventual Consistency Lag — пользователь не видит свои изменения сразу (нужен UI Optimistic Updates).',
                    '❌ Сложность инфраструктуры x2 (нужны 2 базы, шина, воркеры).',
                    '❌ Необходимость обработки идемпотентности и порядка событий.'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Command).',
                    '2. Разместите "Базу данных" (Write DB). Соедините Command -> Write DB.',
                    '3. Разместите компонент "Event Bus". Соедините Command -> Event Bus.',
                    '4. Разместите "Сервис" (Updater). Соедините Event Bus -> Updater.',
                    '5. Разместите "Базу данных" (Read DB). Соедините Updater -> Read DB.',
                    '6. Разместите "Сервис" (Query). Соедините Read DB -> Query.'
                ],
                validationParams: {
                    requiredComponents: [
                        { type: 'service', count: 3 },
                        { type: 'database', count: 2 },
                        { type: 'event-bus', count: 1 }
                    ],
                    requiredConnections: [
                        { from: 'service', to: 'database' },
                        { from: 'service', to: 'event-bus' },
                        { from: 'event-bus', to: 'service' },
                        { from: 'database', to: 'service' }
                    ]
                },
                realWorldExample: 'High-load systems (banking, ordering). Axon Framework, Kafka Streams Projections.'
            },
            {
                id: 'scalability-parallel',
                title: 'Parallel Processing / Fan-out',
                pattern: 'Competing Consumers / Worker Pool',
                tactic: 'Параллелизм на уровне данных.',
                description: 'Обработка большого массива задач путем их распределения между множеством параллельных воркеров. Используется для фоновых задач, ресайза картинок, аналитики.',
                keyIdea: 'Divide and Conquer. Батчинг повышает пропускную способность.',
                dataFlow: [
                    '1. Producer разбивает задачу на чанки и кладет в Очередь.',
                    '2. Свободные Воркеры разбирают задачи (Pull).',
                    '3. Воркеры обрабатывают их параллельно.',
                    '4. Результаты складываются в Result DB.',
                ],
                commonMistakes: [
                    '❌ "Poison Pill" — сообщение, которое крашит воркер, возвращается в очередь и крашит следующий (бесконечный цикл). Нужен Retry Limit / DLQ.',
                    '❌ Race Conditions при записи результатов в общую БД.',
                    '❌ Истощение пула соединений к БД из-за тысяч воркеров.'
                ],
                instructions: [
                    '1. Разместите компонент "Очередь" (Queue).',
                    '2. Разместите три компонента "Пакетный обработчик" (Batch Processor).',
                    '3. Соедините "Очередь" с первым обработчиком.',
                    '4. Соедините "Очередь" со вторым обработчиком.',
                    '5. Соедините "Очередь" с третьим обработчиком.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'queue', count: 1 }, { type: 'batch-processor', count: 3 }],
                    requiredConnections: [{ from: 'queue', to: 'batch-processor' }]
                },
                realWorldExample: 'Video Transcoding, Sending Emails, Data Ingestion pipelines (Hadoop/Spark).'
            },
            {
                id: 'scalability-edge',
                title: 'Edge Computing / IoT',
                pattern: 'Fog Computing',
                tactic: 'Обработка данных "на краю".',
                description: 'Перенос вычислений с центрального облака на периферийные устройства (шлюзы, локальные серверы). Критично для снижения задержек и экономии трафика.',
                keyIdea: 'Решай проблемы локально. В облако шли только агрегаты.',
                dataFlow: [
                    '1. 1000 сенсоров шлют телеметрию (1 GB/sec) на IoT Gateway (Edge).',
                    '2. Gateway фильтрует шум, анализирует (ML inference) и реагирует (Stop Machine).',
                    '3. В Облако передается только отчет об инциденте (1 KB).',
                ],
                commonMistakes: [
                    '❌ Зависимость Edge-устройств от постоянного интернета (они должны работать Offline).',
                    '❌ Security at Edge — физический доступ к устройству позволяет хакеру извлечь ключи (нужен TPM/Secure Enclave).',
                    '❌ Сложность обновления прошивок и моделей на тысячах устройств.'
                ],
                instructions: [
                    '1. Разместите "IoT Шлюз" (IoT Gateway).',
                    '2. Разместите "Edge Computing" (Локальная обработка).',
                    '3. Разместите "Облако" (System).',
                    '4. Соедините "IoT Шлюз" с "Edge Computing".',
                    '5. Соедините "Edge Computing" с "Облаком".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'iot-gateway', count: 1 }, { type: 'edge-computing', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [{ from: 'iot-gateway', to: 'edge-computing' }, { from: 'edge-computing', to: 'system' }]
                },
                realWorldExample: 'Smart Factories, Autonomous Cars, Amazon Greengrass, Azure IoT Edge.'
            },
        ]
    },
    {
        id: 'availability',
        title: 'Доступность',
        icon: <Globe size={20} />,
        description: 'Гарантия работоспособности системы при сбоях.',
        lessons: [
            {
                id: 'avail-replication',
                title: 'Active-Passive Replication',
                pattern: 'Primary-Replica',
                tactic: 'Резервирование данных.',
                description: 'Наличие резервной копии БД (Replica), которая получает поток изменений (WAL logs) от Primary. Используется для Failover и (иногда) для масштабирования чтения.',
                keyIdea: 'Один пишет, другой ждет (Cold/Warm Standby).',
                dataFlow: [
                    '1. Приложение пишет данные в Primary.',
                    '2. Primary подтверждает запись и асинхронно шлет WAL-лог в Replica.',
                    '3. Replica применяет изменения.',
                    '4. При падении Primary, Orchestrator повышает Replica до Primary (Failover).',
                ],
                commonMistakes: [
                    '❌ Replication Lag — чтение с реплики может вернуть устаревшие данные.',
                    '❌ Split Brain — оба узла считают себя главными и принимают разную запись (нужен Quorum/Fencing).',
                    '❌ Отсутствие бэкапов (репликация мгновенно удалит данные и на реплике при DROP TABLE).'
                ],
                instructions: [
                    '1. Разместите компонент "База данных" (Primary/Master).',
                    '2. Разместите второй компонент "База данных" (Secondary/Replica).',
                    '3. Создайте связь от Master к Replica для настройки репликации.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 2 }],
                    requiredConnections: [{ from: 'database', to: 'database' }]
                },
                realWorldExample: 'PostgreSQL Streaming Replication, MySQL Binlog Replication, AWS RDS Multi-AZ.'
            },
            {
                id: 'avail-redundancy',
                title: 'Service Redundancy (N+1)',
                pattern: 'Horizontal Scaling',
                tactic: 'Избыточность вычислительных мощностей.',
                description: 'Запуск нескольких экземпляров критического сервиса. Если один падает, остальные берут нагрузку на себя. Важно разносить их по разным физическим хостам (Anti-Affinity).',
                keyIdea: 'Устранение единой точки отказа (SPOF).',
                dataFlow: [
                    '1. Балансировщик принимает запросы.',
                    '2. Проверяет здоровье (Health Check) инстансов.',
                    '3. Шлет запрос только живому инстансу.',
                ],
                commonMistakes: [
                    '❌ Размещение всех реплик на одной физической машине/стойке/AZ.',
                    '❌ Отсутствие запаса по мощности (N+1 может не хватить для пика, нужно N+2).',
                    '❌ State (состояние) в памяти инстанса (теряется при падении, используйте Redis).'
                ],
                instructions: [
                    '1. Разместите "Балансировщик" (Load Balancer).',
                    '2. Разместите три компонента "Сервис" (Service), обеспечивающих избыточность (N+1).',
                    '3. Соедините "Балансировщик" с первым сервисом.',
                    '4. Соедините "Балансировщик" со вторым сервисом.',
                    '5. Соедините "Балансировщик" с третьим сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'Kubernetes ReplicaSet (relicas: 3), AWS Auto Scaling Group.'
            },
            {
                id: 'avail-circuit-breaker',
                title: 'Circuit Breaker',
                pattern: 'Circuit Breaker',
                tactic: 'Предотвращение каскадных сбоев.',
                description: 'Паттерн для защиты системы от перегрузки. Если сервис начинает тормозить или ошибаться, Breaker "размыкает цепь" и мгновенно возвращает ошибку, давая упавшему сервису прийти в себя.',
                keyIdea: 'Fail Fast. Не жди таймаута, если сервис мертв.',
                dataFlow: [
                    '1. Client вызывает Service B через Breaker.',
                    '2. Ошибки превышают порог (50%). Breaker переходит в состояние OPEN.',
                    '3. Новые запросы отбиваются мгновенно (Fail fast).',
                    '4. Через timeout (5s) Breaker переходит в HALF-OPEN (пропускает 1 тестовый запрос).',
                    '5. Если успех — CLOSED. Если ошибка — снова OPEN.'
                ],
                commonMistakes: [
                    '❌ Отсутствие логики Fallback (возврат заглушки/кэша при ошибке).',
                    '❌ Слишком долгий Time to recover (система простаивает, хотя сервис уже жив).',
                    '❌ Отсутствие "Bulkhead" (изоляции пулов потоков) — один тормозящий метод вешает весь сервис.'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Client), который делает запросы.',
                    '2. Разместите компонент "Circuit Breaker" для защиты.',
                    '3. Разместите "Сервис" (Server), который может отказывать.',
                    '4. Соедините Client -> Circuit Breaker.',
                    '5. Соедините Circuit Breaker -> Server.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'circuit-breaker', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'circuit-breaker' }, { from: 'circuit-breaker', to: 'service' }]
                },
                realWorldExample: 'Netflix Hystrix, Resilience4j, Polly (.NET), Istio Circuit Breaking.'
            },
            {
                id: 'avail-failover',
                title: 'Failover & Disaster Recovery',
                pattern: 'Active-Standby',
                tactic: 'Автоматическое переключение.',
                description: 'Стратегия переключения трафика на резервный дата-центр или регион в случае тотального сбоя (Disaster). Использует DNS или Global Load Balancer.',
                keyIdea: 'RTO (Recovery Time) и RPO (Recovery Point) определяют стратегию.',
                dataFlow: [
                    '1. Health Checks обнаруживают, что Region A недоступен.',
                    '2. DNS сервис (Route53) удаляет IP Region A из ответа.',
                    '3. Трафик перенаправляется в Region B (Standby).',
                ],
                commonMistakes: [
                    '❌ DNS TTL слишком большой (клиенты кэшируют плохой IP часами).',
                    '❌ Cold Standby в резервном регионе не прогрет и падает от нагрузки.',
                    '❌ Split Brain в кластере управления (нужен Quorum).'
                ],
                instructions: [
                    '1. Разместите "DNS сервис" (Global Traffic Manager).',
                    '2. Разместите два "Балансировщика" (Load Balancer) для разных регионов.',
                    '3. Соедините DNS с первым Балансировщиком (Primary Region).',
                    '4. Соедините DNS со вторым Балансировщиком (Failover Region).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'dns-service', count: 1 }, { type: 'load-balancer', count: 2 }],
                    requiredConnections: [{ from: 'dns-service', to: 'load-balancer' }]
                },
                realWorldExample: 'AWS Route53 Failover Record, Cloudflare Load Balancing.'
            },
            {
                id: 'avail-backup',
                title: 'Backup & Point-in-Time Recovery',
                pattern: 'Backup / Archive',
                tactic: 'Восстановление после сбоев.',
                description: 'Регулярное создание снапшотов данных. Point-in-Time Recovery позволяет откатиться на **любую** секунду в прошлом (используя Full Backup + WAL logs).',
                keyIdea: 'Backup strategy is useless without Restore Strategy.',
                dataFlow: [
                    '1. Cron запускает процесс бэкапа (pg_dump / snapshot).',
                    '2. Данные шифруются и заливаются в Object Storage (S3 Glacier).',
                    '3. Периодически запускается Test Restore для проверки архивов.',
                ],
                commonMistakes: [
                    '❌ Хранение бэкапов в том же аккаунте/регионе (хакер удалит и базу, и бэкапы).',
                    '❌ Отсутствие проверки бэкапов (файл есть, но битый).',
                    '❌ RPO (Recovery Point) = 24 часа. (Потеря данных за сутки недопустима для банка).'
                ],
                instructions: [
                    '1. Разместите "Базу данных" (Source), которая хранит данные.',
                    '2. Разместите "Сервис Резервного Копирования" (Backup Service).',
                    '3. Разместите "Объектное хранилище" (Object Storage) для архивов.',
                    '4. Соедините Базу данных -> Backup Service.',
                    '5. Соедините Backup Service -> Object Storage.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 1 }, { type: 'backup-service', count: 1 }, { type: 'object-storage', count: 1 }],
                    requiredConnections: [{ from: 'database', to: 'backup-service' }, { from: 'backup-service', to: 'object-storage' }]
                },
                realWorldExample: 'AWS Backup, Velero (for K8s), Postgres WAL Archiving (Barman).'
            },
            {
                id: 'avail-monitor',
                title: 'Health Checks & Probes',
                pattern: 'Watchdog / Monitoring',
                tactic: 'Обнаружение сбоев.',
                description: 'Механизм, позволяющий оркестратору (K8s) узнать состояние приложения. Liveness Probe: жив ли процесс? Readiness Probe: готов ли принимать трафик?',
                keyIdea: 'Не шли трафик тому, кто не готов.',
                dataFlow: [
                    '1. K8s шлет GET /healthz каждые 10 сек.',
                    '2. Сервис проверяет коннект к БД Local Cache.',
                    '3. Если БД недоступна — возвращает 503 (Not Ready).',
                    '4. K8s убирает под из балансировки, но не перезагружает (если Liveness OK).',
                ],
                commonMistakes: [
                    '❌ Deep Health Check в Liveness Probe — если БД тормозит, K8s рестартует все поды (Cascading Failure).',
                    '❌ Отсутствие таймаутов на проверки.',
                    '❌ Проверка внешних зависимостей (не надо проверять Google.com в readiness пробах).'
                ],
                instructions: [
                    '1. Разместите компонент "Мониторинг" (Orchestrator/K8s).',
                    '2. Разместите два компонента "Сервис" (Service).',
                    '3. Создайте связь от "Мониторинга" к первому "Сервису" (Health Probe).',
                    '4. Создайте связь от "Мониторинга" ко второму "Сервису".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'monitoring', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'monitoring', to: 'service' }]
                },
                realWorldExample: 'Kubernetes Liveness/Readiness Probes, AWS ELB Health Checks.'
            },
            {
                id: 'avail-graceful',
                title: 'Graceful Degradation',
                pattern: 'Fallback / Feature Flags',
                tactic: 'Частичная работоспособность.',
                description: 'Способность системы отключать некритичный функционал при перегрузке или сбоях, сохраняя ядро. Например, интернет-магазин показывает товары, но отключает "Рекомендации".',
                keyIdea: 'Лучше ограниченный сервис, чем никакого.',
                dataFlow: [
                    '1. Сервис пытается получить рекомендации от Recommendation Engine.',
                    '2. Таймаут/Ошибка соединения.',
                    '3. Сервис ловит ошибку и возвращает пустой список или "Популярные товары" из кэша.',
                    '4. UI рендерит страницу без блока "Рекомендовано для вас".',
                ],
                commonMistakes: [
                    '❌ Отсутствие таймаутов (клиент висит вечно).',
                    '❌ Fallback, который сам потребляет много ресурсов (и добивает систему).',
                    '❌ Скрытие критических ошибок (система молчит, а заказы не принимаются).'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Service).',
                    '2. Разместите "Внешнюю Систему" (External System), которая может упасть.',
                    '3. Разместите "Кэш" (Cache) для фоллбэка.',
                    '4. Соедините Сервис -> Внешняя Система (основной поток).',
                    '5. Соедините Сервис -> Кэш (резервный поток).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'external-system', count: 1 }, { type: 'cache', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'external-system' }, { from: 'service', to: 'cache' }]
                },
                realWorldExample: 'Netflix UI (if recommendation service fails, showing generic lists), Amazon Checkout.'
            },
            {
                id: 'avail-multi-region',
                title: 'Multi-Region Deployment',
                pattern: 'Geodistribution',
                tactic: 'Географическое распределение.',
                description: 'Развертывание инстансов в разных регионах (US, EU, Asia) для снижения задержек (Latency) и защиты от падения целого региона.',
                keyIdea: 'Data Sovereignty (GDPR) и Latency диктуют архитектуру.',
                dataFlow: [
                    '1. Пользователь из Берлина обращается к google.com.',
                    '2. GeoDNS видит IP пользователя и отдает IP Load Balancer во Frankfurt.',
                    '3. Данные пользователя (German Profile) загружаются из локальной EU-базы.',
                ],
                commonMistakes: [
                    '❌ Синхронная репликация между регионами (скорость света ограничивает RTT ~100ms+).',
                    '❌ Игнорирование законов о хранении данных (GDPR запрещает вывозить данные граждан ЕС в США).',
                    '❌ Сложность деплоя (нужен CD пайплайн, катящий сразу везде).'
                ],
                instructions: [
                    '1. Разместите "DNS сервис" (GeoDNS).',
                    '2. Разместите два компонента "Сервер" (Server/Service), по одному на регион.',
                    '3. Создайте связь от DNS к первому Серверу (Region A).',
                    '4. Создайте связь от DNS к второму Серверу (Region B).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'dns-service', count: 1 }, { type: 'server', count: 2 }],
                    requiredConnections: [{ from: 'dns-service', to: 'server' }]
                },
                realWorldExample: 'Netflix global control plane, AWS Global Accelerator.'
            },
            {
                id: 'avail-queue-leveling',
                title: 'Queue-Based Load Leveling',
                pattern: 'Load Leveling',
                tactic: 'Сглаживание пиков.',
                description: 'Использование очереди как буфера, чтобы сервис мог обрабатывать запросы с постоянной скоростью, несмотря на всплески трафика ("Backpressure").',
                keyIdea: 'Буферизируй всплески, спасай базу.',
                dataFlow: [
                    '1. API Gateway принимает 10 000 req/sec во время распродажи.',
                    '2. Gateway сбрасывает запросы в Kafka/RabbitMQ (очень быстро).',
                    '3. Order Service разбирает очередь со скоростью 500 req/sec (его предел).',
                    '4. База данных жива и счастлива.',
                ],
                commonMistakes: [
                    '❌ Очередь переполняется и OOM (нужен мониторинг глубины и лимиты).',
                    '❌ Пользователь ждет синхронного ответа (паттерн работает только для асинхронных задач).',
                    '❌ Потеря сообщений при перезагрузке брокера.'
                ],
                instructions: [
                    '1. Разместите "API Gateway" (принимает трафик).',
                    '2. Разместите "Очередь" (Queue) для буферизации.',
                    '3. Разместите "Сервис" (Service) Worker.',
                    '4. Соедините API Gateway -> Очередь.',
                    '5. Соедините Очередь -> Сервис.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'queue', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'queue' }, { from: 'queue', to: 'service' }]
                },
                realWorldExample: 'Black Friday sales handling, Log ingestion systems.'
            },
            {
                id: 'avail-active-active',
                title: 'Active-Active Replication',
                pattern: 'Multi-Master',
                tactic: 'Одновременная запись в несколько узлов.',
                description: 'Конфигурация, где все узлы (в разных ЦОД) принимают запись. Требует сложного разрешения конфликтов (Conflict Resolution Strategy).',
                keyIdea: '100% SLA... теоретически. На практике — ад синхронизации.',
                dataFlow: [
                    '1. Пользователь 1 пишет в DC1 (User.name = "Alice").',
                    '2. Пользователь 2 пишет в DC2 (User.name = "Bob") одновременно.',
                    '3. Системы репликации пытаются слить изменения. Возникает конфликт.',
                    '4. Применяется стратегия "Last Write Wins" (по timestamp).',
                ],
                commonMistakes: [
                    '❌ Игнорирование конфликтов (потеря данных).',
                    '❌ Использование автоинкрементных ID на разных мастерах (дублирование PK).',
                    '❌ Ожидание мгновенной консистентности между континентами.'
                ],
                instructions: [
                    '1. Разместите "Балансировщик" (Load Balancer).',
                    '2. Разместите две "Базы данных" (Active Node A и Active Node B).',
                    '3. Подключите Балансировщик к первой БД.',
                    '4. Подключите Балансировщик ко второй БД.',
                    '5. Создайте связь между базами данных для двусторонней синхронизации.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 2 }, { type: 'load-balancer', count: 1 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'database' }, { from: 'database', to: 'database' }]
                },
                realWorldExample: 'Google Spanner (TrueTime), Amazon DynamoDB Global Tables, CockroachDB.'
            },
        ]
    },
    {
        id: 'security',
        title: 'Безопасность',
        icon: <Shield size={20} />,
        description: 'Защита данных и ресурсов от угроз.',
        lessons: [
            {
                id: 'sec-firewall',
                title: 'Firewall / DMZ',
                pattern: 'Firewall',
                tactic: 'Фильтрация трафика.',
                description: 'Сетевой экран, изолирующий внутреннюю защищенную сеть от внешней (интернет) путем фильтрации пакетов.',
                keyIdea: 'Запрещено все, что не разрешено явно.',
                dataFlow: [
                    '1. Внешний запрос приходит на публичный IP.',
                    '2. Firewall проверяет правила (IP, Port, Protocol).',
                    '3. Разрешенный трафик (e.g., tcp/443) проходит к Серверу в DMZ.',
                ],
                commonMistakes: [
                    '❌ Правило Any-Any Allow в проде.',
                    '❌ Размещение Базы Данных в DMZ (публичном сегменте).',
                    '❌ Отсутствие Deny logging для анализа атак.'
                ],
                instructions: [
                    '1. Разместите компонент "Внешняя система" (Интернет).',
                    '2. Разместите компонент "Межсетевой экран" (Firewall).',
                    '3. Разместите компонент "Сервер" (Protected Server).',
                    '4. Соедините "Внешнюю систему" с "Межсетевым экраном".',
                    '5. Соедините "Межсетевой экран" с "Сервером".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'firewall', count: 1 }, { type: 'server', count: 1 }],
                    requiredConnections: [{ from: 'firewall', to: 'server' }]
                }
            },
            {
                id: 'sec-auth-service',
                title: 'Auth Service',
                pattern: 'Identity Provider',
                tactic: 'Централизованная аутентификация.',
                description: 'Вынос логики проверки личности (Authentication) и выдачи токенов в отдельный надежный компонент.',
                keyIdea: 'Единый источник истины о пользователях.',
                dataFlow: [
                    '1. Пользователь отправляет логин/пароль в API Gateway.',
                    '2. Gateway пересылает креды в Auth Service.',
                    '3. Auth Service проверяет хэш пароля и возвращает JWT Token.',
                ],
                commonMistakes: [
                    '❌ Реализация Auth логики в каждом микросервисе (дублирование и дыры).',
                    '❌ Хранение паролей в открытом виде.',
                    '❌ Отсутствие механизма отзыва (Revocation) токенов.'
                ],
                instructions: [
                    '1. Разместите компонент "API Gateway".',
                    '2. Разместите компонент "Сервис аутентификации" (Auth Service).',
                    '3. Соедините "API Gateway" с "Сервисом аутентификации".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'auth-service', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'auth-service' }]
                }
            },
            {
                id: 'sec-api-gateway',
                title: 'API Gateway Security',
                pattern: 'Gateway Offloading',
                tactic: 'Проверка токенов на входе.',
                description: 'API Gateway действует как единая точка входа, проверяющая авторизацию запросов перед их передачей внутренним сервисам.',
                keyIdea: 'Никаких неавторизованных запросов внутри периметра.',
                dataFlow: [
                    '1. Клиент шлет запрос с Bearer Token.',
                    '2. API Gateway валидирует подпись токена (Stateless) или зовет Auth (Stateful).',
                    '3. Если валидно — запрос проксируется в Сервис.',
                ],
                commonMistakes: [
                    '❌ Пропуск "сырых" запросов к внутренним API.',
                    '❌ Отсутствие Rate Limiting на Gateway (риск DDOS).',
                    '❌ Gateway имеет слишком много бизнес-логики.'
                ],
                instructions: [
                    '1. Разместите компонент "API Gateway".',
                    '2. Разместите два компонента "Сервис".',
                    '3. Соедините "API Gateway" с первым "Сервисом".',
                    '4. Соедините "API Gateway" со вторым "Сервисом".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'service' }]
                }
            },
            {
                id: 'sec-secrets',
                title: 'Secrets Management',
                pattern: 'Vault',
                tactic: 'Безопасное хранение секретов.',
                description: 'Централизованное хранение ключей и паролей в Vault, исключающее их нахождение в коде или конфигурационных файлах.',
                keyIdea: 'Код не знает паролей. Код знает, где их взять.',
                dataFlow: [
                    '1. App стартует и аутентифицируется в Vault (через Role/Cert).',
                    '2. App запрашивает секрет (например, DB Password).',
                    '3. Vault возвращает секрет (возможно, временный TTL).',
                    '4. App использует секрет для коннекта к БД.',
                ],
                commonMistakes: [
                    '❌ Хардкод паролей в Git.',
                    '❌ Передача секретов через Environment Variables (видны в process list).',
                    '❌ Долгоживущие секреты без ротации.'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис".',
                    '2. Разместите компонент "Управление секретами" (Secret Management).',
                    '3. Разместите компонент "Базу данных".',
                    '4. Соедините "Сервис" с "Управлением секретами".',
                    '5. Соедините "Сервис" с "Базой данных".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'secret-management', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'secret-management' }, { from: 'service', to: 'database' }]
                }
            },
            {
                id: 'sec-waf',
                title: 'WAF (Web App Firewall)',
                pattern: 'WAF',
                tactic: 'Защита от атак уровня приложений.',
                description: 'Специализированный Firewall, анализирующий HTTP-трафик для блокировки атак (SQL Injection, XSS, CSRF).',
                keyIdea: 'Глубокая инспекция HTTP пакетов.',
                dataFlow: [
                    '1. Хакер посылает запрос с SQL Injection.',
                    '2. WAF анализирует тело и заголовки запроса.',
                    '3. WAF распознает сигнатуру атаки и блокирует запрос.',
                    '4. Легитимный трафик проходит к Веб-серверу.',
                ],
                commonMistakes: [
                    '❌ Работа в режиме "Monitoring Only" без блокировки.',
                    '❌ Отсутствие настройки под конкретное приложение (Generic Rules).',
                    '❌ SSL Termination перед WAF не настроен (WAF не видит шифрованный трафик).',
                ],
                instructions: [
                    '1. Разместите компонент "Клиент" (Client).',
                    '2. Разместите компонент "WAF".',
                    '3. Разместите компонент "Веб-сервер" (Web Server).',
                    '4. Соедините "Клиент" с "WAF".',
                    '5. Соедините "WAF" с "Веб-сервером".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'waf', count: 1 }, { type: 'web-server', count: 1 }],
                    requiredConnections: [{ from: 'waf', to: 'web-server' }]
                }
            },
            {
                id: 'sec-vpn',
                title: 'VPN Access',
                pattern: 'VPN Gateway',
                tactic: 'Защищенный туннель.',
                description: 'Предоставление доступа к внутренним корпоративным ресурсам через шифрованный канал (туннель).',
                keyIdea: 'Интернет — это враждебная среда. Строй туннель.',
                dataFlow: [
                    '1. Удаленный сотрудник запускает VPN-клиент.',
                    '2. Устанавливается шифрованный туннель к VPN Шлюзу.',
                    '3. Трафик к внутренним серверам идет внутри туннеля.',
                ],
                commonMistakes: [
                    '❌ Split Tunneling (утечка корпоративного трафика в открытый инет).',
                    '❌ Слабая аутентификация пользователя (без MFA).',
                    '❌ Доступ ко всей подсети, а не к конкретным ресурсам (Zero Trust лучше).',
                ],
                instructions: [
                    '1. Разместите компонент "Клиент" (Remote Employee).',
                    '2. Разместите компонент "VPN шлюз".',
                    '3. Разместите компонент "Сервер" (Internal Server).',
                    '4. Соедините "Клиент" с "VPN шлюзом".',
                    '5. Соедините "VPN шлюз" с "Сервером".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'vpn-gateway', count: 1 }, { type: 'server', count: 1 }],
                    requiredConnections: [{ from: 'vpn-gateway', to: 'server' }]
                }
            },
            {
                id: 'sec-audit',
                title: 'Audit Logging',
                pattern: 'Audit Trail',
                tactic: 'Регистрация действий.',
                description: 'Непрерывная запись всех значимых событий безопасности и действий пользователей для последующего анализа.',
                keyIdea: 'Если это не записано, этого не было.',
                dataFlow: [
                    '1. Пользователь выполняет действие (Edit/Delete).',
                    '2. Сервис выполняет действие и асинхронно отправляет событие в Audit Log.',
                    '3. Audit Log сохраняет: Кто? Что? Где? Когда?',
                ],
                commonMistakes: [
                    '❌ Логирование чувствительных данных (паролей, PII).',
                    '❌ Возможность модификации логов хакером (нужен WORM storage).',
                    '❌ Слишком короткий срок хранения логов.'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис".',
                    '2. Разместите компонент "Audit Log".',
                    '3. Соедините "Сервис" с "Audit Log".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'audit-log', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'audit-log' }]
                }
            },
            {
                id: 'sec-ids',
                title: 'IDS (Intrusion Detection)',
                pattern: 'Sidecar Monitor',
                tactic: 'Анализ трафика.',
                description: 'Система пассивного мониторинга, анализирующая копию сетевого трафика на предмет аномалий и сигнатур атак.',
                keyIdea: 'Слушай сеть, ищи зло.',
                dataFlow: [
                    '1. Весь трафик проходит через Firewall к Серверу.',
                    '2. Firewall (или TAP) дублирует пакеты в IDS.',
                    '3. IDS анализирует копию и шлет алерт админу, если нашла атаку.',
                ],
                commonMistakes: [
                    '❌ Огромное количество ложных срабатываний (Alert Fatigue).',
                    '❌ Анализ зашифрованного трафика без расшифровки (бесполезно).',
                    '❌ Отсутствие реакции на инцидент.'
                ],
                instructions: [
                    '1. Разместите компонент "Межсетевой экран" (Firewall).',
                    '2. Разместите компонент "Сервер".',
                    '3. Разместите компонент "Мониторинг" (IDS).',
                    '4. Соедините "Межсетевой экран" с "Сервером".',
                    '5. Соедините "Межсетевой экран" с "Мониторингом".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'server', count: 1 }, { type: 'firewall', count: 1 }],
                    requiredConnections: [{ from: 'firewall', to: 'server' }]
                }
            },
            {
                id: 'sec-crypt',
                title: 'Encryption (Шифрование)',
                pattern: 'Application-Level Encryption / Envelope Encryption',
                tactic: 'Шифрование данных перед записью.',
                description: 'Сервис запрашивает ключи у KMS, шифрует данные и только потом пишет их в БД. База данных хранит нечитаемый шифротекст.',
                keyIdea: 'База данных видит только мусор, ключи у нее нет.',
                dataFlow: [
                    '1. Сервис получает конфиденциальные данные.',
                    '2. Сервис запрашивает Data Encryption Key (DEK) у KMS.',
                    '3. Сервис шифрует данные и пишет шифротекст в БД.',
                ],
                commonMistakes: [
                    '❌ Хранение ключа шифрования в той же БД.',
                    '❌ Использование слабых алгоритмов (DES, MD5).',
                    '❌ Нет ротации ключей.'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис".',
                    '2. Разместите компонент "KMS" (Key Management Service).',
                    '3. Разместите компонент "Базу данных".',
                    '4. Соедините "Сервис" с "KMS".',
                    '5. Соедините "Сервис" с "Базой данных".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'database', count: 1 }, { type: 'kms', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'kms' }, { from: 'service', to: 'database' }]
                }
            },
            {
                id: 'sec-ddos',
                title: 'DDoS Protection',
                pattern: 'Scrubbing Center / CDN',
                tactic: 'Поглощение объемных атак.',
                description: 'Использование распределенной сети (CDN) или очистительных центров для поглощения вредоносного трафика до того, как он достигнет Origin.',
                keyIdea: 'Масса (емкость сети) побеждает массу (трафик ботнета).',
                dataFlow: [
                    '1. Весь входящий трафик направляется на CDN (Anycast IP).',
                    '2. CDN фильтрует L3/L4 атаки и кэширует контент.',
                    '3. Только чистые запросы проксируются на Балансировщик.',
                ],
                commonMistakes: [
                    '❌ Раскрытие реального IP-адреса Origin сервера (Atacker bypasses CDN).',
                    '❌ Отсутствие Rate Limiting на уровне приложения.',
                    '❌ Полагаться только на Firewal (он упадет первым).'
                ],
                instructions: [
                    '1. Разместите компонент "Внешняя система" (Attacker).',
                    '2. Разместите компонент "CDN".',
                    '3. Разместите компонент "Балансировщик" (Load Balancer).',
                    '4. Соедините "Внешнюю систему" с "CDN".',
                    '5. Соедините "CDN" с "Балансировщиком".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cdn', count: 1 }, { type: 'load-balancer', count: 1 }],
                    requiredConnections: [{ from: 'cdn', to: 'load-balancer' }]
                }
            },
        ]
    },
    {
        id: 'observability',
        title: 'Наблюдаемость',
        icon: <Eye size={20} />,
        description: 'Понимание внутреннего состояния системы.',
        lessons: [
            {
                id: 'obs-log',
                title: 'Centralized Logging',
                pattern: 'Log Aggregator',
                tactic: 'Сбор логов в одном месте.',
                description: 'Агрегация логов от всех сервисов в единое хранилище для удобного поиска и анализа.',
                keyIdea: 'Логи — это поток событий (Stream), а не файлы.',
                dataFlow: [
                    '1. Сервис пишет лог в Stdout/Stderr (формат JSON).',
                    '2. Агент (Fluentd/Filebeat) читает поток и отправляет в хранилище (Elasticsearch).',
                    '3. Разработчик ищет логи через Kibana.',
                ],
                commonMistakes: [
                    '❌ Запись логов в локальные файлы внутри контейнера (теряются при рестарте).',
                    '❌ Неструктурированный текст вместо JSON (сложно парсить).',
                    '❌ Логирование секретов или огромных пейлоадов.'
                ],
                instructions: [
                    '1. Добавьте 2 компонента "Сервис".',
                    '2. Добавьте компонент "Логирование" (Logging).',
                    '3. Соедините первый Сервис с Логированием.',
                    '4. Соедините второй Сервис с Логированием.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'logging', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'logging' }]
                }
            },
            {
                id: 'obs-metric',
                title: 'Metrics Visualization',
                pattern: 'Pull-Based Monitoring (Prometheus style)',
                tactic: 'Сбор метрик (Scraping).',
                description: 'Система мониторинга периодически опрашивает (pull) сервисы и базы данных для сбора метрик (Time Series Data).',
                keyIdea: 'Знай, "сколько" и "как быстро", прямо сейчас.',
                dataFlow: [
                    '1. Сервис выставляет endpoint /metrics.',
                    '2. Prometheus периодически делает GET /metrics (Scrape).',
                    '3. Grafana рисует графики на основе данных из Prometheus.',
                ],
                commonMistakes: [
                    '❌ High Cardinality (слишком много уникальных значений меток, например user_id).',
                    '❌ Push-модель там, где можно Pull (усложняет агенты).',
                    '❌ Сбор метрик, которые никто не смотрит (шум).'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Service).',
                    '2. Добавьте "Базу данных" (Database).',
                    '3. Добавьте "Мониторинг" (Monitoring).',
                    '4. Соедините Мониторинг с Сервисом (Scrape).',
                    '5. Соедините Мониторинг с Базой данных (Scrape).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'monitoring', count: 1 }, { type: 'service', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'monitoring', to: 'service' }, { from: 'monitoring', to: 'database' }]
                }
            },
            {
                id: 'obs-trace',
                title: 'Distributed Tracing',
                pattern: 'Tracing',
                tactic: 'Отслеживание запроса.',
                description: 'Идентификация полного пути запроса через множество микросервисов для отладки задержек и ошибок.',
                keyIdea: 'Единый Trace ID связывает все логи и вызовы.',
                dataFlow: [
                    '1. Клиент делает запрос -> Сервис А (генерирует Trace ID).',
                    '2. Сервис А вызывает Сервис Б, передавая Trace ID в заголовках.',
                    '3. Оба сервиса шлют Spans (отрезки времени) в Jaeger.',
                ],
                commonMistakes: [
                    '❌ Потеря контекста (Trace ID) при асинхронных вызовах.',
                    '❌ 100% сэмплирование в проде (дорого и медленно).',
                    '❌ Неинструментированные БД или внешние вызовы (слепые пятна).'
                ],
                instructions: [
                    '1. Добавьте 3 компонента "Сервис".',
                    '2. Добавьте компонент "Tracing".',
                    '3. Соедините все три Сервиса с Tracing.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'tracing', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'service', to: 'tracing' }]
                }
            },
            {
                id: 'obs-alert',
                title: 'Alerting',
                pattern: 'Alert Manager',
                tactic: 'Уведомление об инцидентах.',
                description: 'Автоматическая отправка оповещений инженерам при выходе метрик за критические пороги.',
                keyIdea: 'Буди человека только если он должен что-то сделать.',
                dataFlow: [
                    '1. Monitoring вычисляет правило (Error Rate > 5%).',
                    '2. Если True — шлет событие в Alert Manager.',
                    '3. Alert Manager группирует, дедуплицирует и звонит в PagerDuty.',
                ],
                commonMistakes: [
                    '❌ Alert Fatigue (слишком много неважных алертов).',
                    '❌ Алерты на CPU (причина), а не на Latency/Errors (симптом).',
                    '❌ Отсутствие Playbooks (инструкций) к алертам.'
                ],
                instructions: [
                    '1. Добавьте "Мониторинг" (Monitoring).',
                    '2. Добавьте "Alert Manager".',
                    '3. Добавьте "Команда" (Team) или Email.',
                    '4. Соедините Мониторинг с Alert Manager.',
                    '5. Соедините Alert Manager с Командой.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'monitoring', count: 1 }, { type: 'alert-manager', count: 1 }, { type: 'team', count: 1 }],
                    requiredConnections: [{ from: 'monitoring', to: 'alert-manager' }, { from: 'alert-manager', to: 'team' }]
                }
            },
            {
                id: 'obs-health',
                title: 'Health Endpoint',
                pattern: 'Health Check',
                tactic: 'Самодиагностика.',
                description: 'Сервис предоставляет специальный HTTP endpoint (/health) сообщает о своей готовности принимать трафик.',
                keyIdea: 'Простой ответ на сложный вопрос "Ты жив?".',
                dataFlow: [
                    '1. Load Balancer шлет GET /health.',
                    '2. Сервис проверяет коннект к БД.',
                    '3. Возвращает 200 OK.',
                ],
                commonMistakes: [
                    '❌ Кэширование ответа health check (всегда OK, даже если труп).',
                    '❌ Тяжелые проверки (SELECT count(*) from large_table).',
                    '❌ Отсутствие Liveness и Readiness проб (Kubernetes distinction).'
                ],
                instructions: [
                    '1. Добавьте "Балансировщик" (Load Balancer).',
                    '2. Добавьте "Сервис" (Service).',
                    '3. Соедините Балансировщик с Сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                }
            },
            {
                id: 'obs-audit',
                title: 'User Activity Tracking',
                pattern: 'Activity Stream',
                tactic: 'Анализ поведения.',
                description: 'Сбор аналитических событий о действиях пользователя для продуктовой аналитики.',
                keyIdea: 'Понимай, как пользователи используют продукт.',
                dataFlow: [
                    '1. Браузер (Frontend) отправляет событие нажатия кнопки.',
                    '2. Analytics Service буферизует события.',
                    '3. События сохраняются в Data Warehouse (BigQuery/ClickHouse).',
                ],
                commonMistakes: [
                    '❌ Блокировка UI потока отправкой метрик.',
                    '❌ Отправка PII (персональных данных) в аналитику.',
                    '❌ Потеря событий при закрытии вкладки (используй Beacon API).'
                ],
                instructions: [
                    '1. Добавьте компонент "Frontend".',
                    '2. Добавьте компонент "Сервис аналитики" (Analytics).',
                    '3. Соедините Frontend с Сервисом аналитики.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'analytics-service', count: 1 }, { type: 'frontend', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'analytics-service' }]
                }
            },
            {
                id: 'obs-crash',
                title: 'Crash Reporting',
                pattern: 'Error Tracking',
                tactic: 'Сбор ошибок.',
                description: 'Автоматический сбор Stack Trace неперехваченных исключений с клиентов и серверов.',
                keyIdea: 'Ошибки случаются. Надо знать о них первыми.',
                dataFlow: [
                    '1. JS падает с ошибкой в браузере пользователя.',
                    '2. Sentry/Bugsnag SDK перехватывает ошибку.',
                    '3. Отправляет отчет с контекстом (OS, Browser, User) на сервер.',
                ],
                commonMistakes: [
                    '❌ "Swallowing errors" (пустые try-catch блоки).',
                    '❌ Отсутствие Source Maps (нечитаемый минифицированный код в логе).',
                    '❌ Логирование чувствительных данных в payload ошибки.'
                ],
                instructions: [
                    '1. Добавьте компонент "Frontend".',
                    '2. Добавьте компонент "Error Tracking".',
                    '3. Соедините Frontend с Error Tracking.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'logging', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'logging' }]
                }
            },
            {
                id: 'obs-cost',
                title: 'Cost Monitoring',
                pattern: 'FinOps Monitor',
                tactic: 'Отслеживание затрат.',
                description: 'Мониторинг расходов на инфраструктуру в реальном времени для предотвращения перерасхода бюджета.',
                keyIdea: 'Облако бесконечно, но деньги — нет.',
                dataFlow: [
                    '1. Cloud Provider собирает метрики использования ресурсов.',
                    '2. Cost Management система агрегирует данные по тегам/проектам.',
                    '3. При превышении бюджета отправляется Alert.',
                ],
                commonMistakes: [
                    '❌ Зомби-ресурсы (забытые сервера/диски).',
                    '❌ Over-provisioning (покупка слишком мощных серверов "на всякий случай").',
                    '❌ Отсутствие тегирования ресурсов (непонятно, кто тратит).'
                ],
                instructions: [
                    '1. Добавьте "Облако" (System).',
                    '2. Добавьте "Cost Monitoring".',
                    '3. Соедините Облако с Cost Monitoring.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cost-monitoring', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [{ from: 'system', to: 'cost-monitoring' }]
                }
            },
            {
                id: 'obs-slo',
                title: 'SLO/SLA Tracking',
                pattern: 'SLO Manager',
                tactic: 'Контроль уровня сервиса.',
                description: 'Отслеживание соблюдения целевых показателей уровня обслуживания (SLO) и бюджета ошибок.',
                keyIdea: '100% надежности не существует и она не нужна.',
                dataFlow: [
                    '1. Monitoring собирает SLI (Service Level Indicators, например Availability).',
                    '2. SLO Manager сравненивает текущее значение с Target (99.9%).',
                    '3. Вычисляется оставшийся Error Budget.',
                ],
                commonMistakes: [
                    '❌ Обещание 100% SLA.',
                    '❌ Измерение показателей, не влияющих на пользователя (CPU load vs Response Time).',
                    '❌ Отсутствие действий при исчерпании бюджета ошибок (Freezing deploys).'
                ],
                instructions: [
                    '1. Добавьте "Мониторинг" (Monitoring).',
                    '2. Добавьте "SLO Manager".',
                    '3. Соедините Мониторинг с SLO Manager.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'slo-manager', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'monitoring', to: 'slo-manager' }]
                }
            },
            {
                id: 'obs-profiling',
                title: 'Continuous Profiling',
                pattern: 'Profiler',
                tactic: 'Анализ производительности кода.',
                description: 'Постоянный сбор профилей (CPU, Memory, Locks) с работающих сервисов для поиска узких мест.',
                keyIdea: 'Видеть, где код "тупит" в продакшене.',
                dataFlow: [
                    '1. Агент (Profiler) подключается к процессу приложения.',
                    '2. Периодически снимает Stack Trace (сэмплирование).',
                    '3. Строит Flame Graph: ширина блока = время выполнения.',
                ],
                commonMistakes: [
                    '❌ Высокий оверхед от профилировщика (тормозит прод).',
                    '❌ Профилирование только в Dev среде (данные не репрезентативны).',
                    '❌ Игнорирование блокировок (Lock contention) и I/O wait.'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Service).',
                    '2. Добавьте "Мониторинг" (Profiler).',
                    '3. Соедините Сервис с Мониторингом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'monitoring' }]
                }
            }
        ]
    },
    {
        id: 'performance',
        title: 'Производительность',
        icon: <Zap size={20} />,
        description: 'Скорость реакции и обработки запросов.',
        lessons: [
            {
                id: 'perf-cache',
                title: 'In-Memory Caching',
                pattern: 'Cache',
                tactic: 'Снижение задержек.',
                description: 'Хранение часто запрашиваемых данных в быстрой оперативной памяти (Redis, Memcached) для снижения нагрузки на БД.',
                keyIdea: 'Самый быстрый запрос тот, который не дошел до базы.',
                dataFlow: [
                    '1. Сервис получает запрос на чтение ID=123.',
                    '2. Проверяет Кэш. Если есть (Cache Hit) — возвращает сразу.',
                    '3. Если нет (Cache Miss) — идет в БД, сохраняет в Кэш и возвращает.',
                ],
                commonMistakes: [
                    '❌ Cache Stampede (одновременный запрос протухшего ключа тысячами клиентов).',
                    '❌ Хранение вечно (нужен TTL).',
                    '❌ Рассинхрон с БД (нужна стратегия инвалидации).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Service).',
                    '2. Добавьте "Кэш" (Cache).',
                    '3. Соедините Сервис с Кэшем.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'cache', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'cache' }]
                }
            },
            {
                id: 'perf-db-index',
                title: 'Search Index',
                pattern: 'Search Engine',
                tactic: 'Быстрый поиск.',
                description: 'Использование специализированного движка (Elasticsearch/Solr) для полнотекстового поиска и сложной фильтрации.',
                keyIdea: 'База данных для хранения, Поисковик — для поиска.',
                dataFlow: [
                    '1. Сервис пишет данные в Основную БД.',
                    '2. Per-commit hook или CDC реплицирует данные в Elasticsearch.',
                    '3. Поисковые запросы от клиента идут напрямую в Search Engine.',
                ],
                commonMistakes: [
                    '❌ "Like %query%" в SQL базе на миллионах строк.',
                    '❌ Синхронная запись в поиск (тормозит транзакции БД).',
                    '❌ Split Brain (данные в поиске отстают от БД).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Service).',
                    '2. Добавьте "Поисковый движок" (Search Engine).',
                    '3. Соедините Сервис с Поисковым движком.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'search-engine', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'search-engine' }]
                }
            },
            {
                id: 'perf-compression',
                title: 'Compression / Minification',
                pattern: 'CDN / Proxy',
                tactic: 'Уменьшение объема данных.',
                description: 'Автоматическое сжатие (Gzip/Brotli) статических ресурсов и ответов API для ускорения загрузки.',
                keyIdea: 'Меньше байт летит по сети — быстрее ответ.',
                dataFlow: [
                    '1. Frontend запрашивает style.css.',
                    '2. CDN видит заголовок "Accept-Encoding: gzip".',
                    '3. Бэкенд/CDN жмет файл и отдает меньший размер.',
                ],
                commonMistakes: [
                    '❌ Сжатие уже сжатых форматов (PNG/JPEG/Zip) — трата CPU.',
                    '❌ Отсутствие кэширования сжатых копий.',
                    '❌ BREACH атака (аккуратнее с секретами в сжатом контенте).',
                ],
                instructions: [
                    '1. Добавьте "Frontend".',
                    '2. Добавьте "CDN".',
                    '3. Соедините Frontend с CDN.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'cdn', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'cdn' }]
                }
            },
            {
                id: 'perf-pool',
                title: 'Connection Pooling',
                pattern: 'Proxy / Pooler',
                tactic: 'Переиспользование соединений.',
                description: 'Использование промежуточного слоя (PgBouncer/HikariCP) для поддержания пула прогретых соединений к БД.',
                keyIdea: 'Handshake — это дорого. Держи трубу открытой.',
                dataFlow: [
                    '1. Сервис требует коннект к БД.',
                    '2. Proxy дает ему уже готовое соединение из пула.',
                    '3. После запроса соединение не закрывается, а возвращается в пул.',
                ],
                commonMistakes: [
                    '❌ Открытие нового коннекта на каждый HTTP запрос.',
                    '❌ Пул слишком маленький (очередь на стороне аппа) или большой (DB OOM).',
                    '❌ Prepared statements могут не работать через некоторые пулеры.',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Service).',
                    '2. Добавьте "Прокси" (Proxy).',
                    '3. Добавьте "Базу данных" (Database).',
                    '4. Соедините Сервис с Прокси.',
                    '5. Соедините Прокси с Базой данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'proxy', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'proxy' }, { from: 'proxy', to: 'database' }]
                }
            },
            {
                id: 'perf-async',
                title: 'Async Processing',
                pattern: 'Background Job',
                tactic: 'Вынос тяжелых задач.',
                description: 'Вынос долгих операций (отправка email, генерация PDF) в фоновые процессы через очередь.',
                keyIdea: 'Отпусти пользователя быстро, доделай работу потом.',
                dataFlow: [
                    '1. API получает запрос "Сгенерируй отчет".',
                    '2. API кладет задачу в RabbitMQ и возвращает "202 Accepted".',
                    '3. Worker берет задачу и делает 5 минут.',
                ],
                commonMistakes: [
                    '❌ Обработка тяжелых задач в потоке HTTP запроса.',
                    '❌ Отсутствие DLQ (брошенные задачи блокируют очередь).',
                    '❌ Потеря задач при рестарте (in-memory queues).',
                ],
                instructions: [
                    '1. Добавьте "API Gateway".',
                    '2. Добавьте "Очередь" (Queue).',
                    '3. Добавьте "Пакетный обработчик" (Batch Processor).',
                    '4. Соедините API Gateway с Очередью.',
                    '5. Соедините Очередь с Обработчиком.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'queue', count: 1 }, { type: 'batch-processor', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'queue' }, { from: 'queue', to: 'batch-processor' }]
                }
            },
            {
                id: 'perf-http2',
                title: 'Efficient Protocols',
                pattern: 'gRPC / HTTP/2',
                tactic: 'Бинарные протоколы.',
                description: 'Использование бинарных протоколов (gRPC/Protobuf) вместо текстовых (REST/JSON) для внутренних коммуникаций.',
                keyIdea: 'JSON удобен людям, Protobuf удобен машинам.',
                dataFlow: [
                    '1. Service A упаковывает объект в бинарный формат.',
                    '2. Отправляет по мультиплексированному HTTP/2 соединению.',
                    '3. Service B распаковывает (очень быстро благодаря строгой схеме).',
                ],
                commonMistakes: [
                    '❌ Использование XML/SOAP в новых проектах.',
                    '❌ Отсутствие версионирования .proto файлов.',
                    '❌ Применение gRPC для публичного API (сложно для фронтенда).',
                ],
                instructions: [
                    '1. Добавьте первый "Сервис".',
                    '2. Добавьте второй "Сервис".',
                    '3. Соедините их между собой.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'service' }] // Can't easily validate protocol type visually yet
                }
            },
            {
                id: 'perf-read-replica',
                title: 'Read Replicas',
                pattern: 'CQRS Lite',
                tactic: 'Масштабирование чтения.',
                description: 'Разделение нагрузки: запись идет в Master, а “тяжелое” чтение распределяется по Read Replicas.',
                keyIdea: 'Запись одна, читателей много.',
                dataFlow: [
                    '1. Приложение пишет в Master DB.',
                    '2. Приложение читает из Replica 1, Replica 2.',
                    '3. Данные между БД синхронизируются асинхронно.',
                ],
                commonMistakes: [
                    '❌ Чтение своих же записей сразу (Lag репликации даст старые данные).',
                    '❌ Запись в Реплику (она Read-Only).',
                    '❌ Балансировка только на одну реплику.',
                ],
                instructions: [
                    '1. Добавьте "Сервис".',
                    '2. Добавьте 2 "Базы данных".',
                    '3. Соедините Сервис с каждой из Баз данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'database', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                }
            },
            {
                id: 'perf-cdn',
                title: 'Static Content Offloading',
                pattern: 'CDN',
                tactic: 'Разгрузка сервера.',
                description: 'Отдача тяжелого контента (видео, картинки, JS) с географически близких к пользователю Edge серверов.',
                keyIdea: 'Speed of Light is slow. Сократи дистанцию.',
                dataFlow: [
                    '1. Пользователь из Австралии запрашивает image.jpg.',
                    '2. Запрос идет на POP (Point of Presence) в Сиднее.',
                    '3. Если там есть файл (Cache Hit), он отдается за 10мс.',
                ],
                commonMistakes: [
                    '❌ Кэширование динамического HTML.',
                    '❌ Отсутствие Cache Busting (имя файла v1.jpg) при обновлении.',
                    '❌ Игнорирование HTTP Headers (Cache-Control).',
                ],
                instructions: [
                    '1. Добавьте "Клиент" (Client).',
                    '2. Добавьте "CDN".',
                    '3. Соедините Клиент с CDN.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'client', count: 1 }, { type: 'cdn', count: 1 }],
                    requiredConnections: [{ from: 'client', to: 'cdn' }]
                }
            },
            {
                id: 'perf-scaling',
                title: 'Auto-Scaling',
                pattern: 'Horizontal Scaling',
                tactic: 'Добавление ресурсов.',
                description: 'Автоматическое добавление новых экземпляров сервиса при росте нагрузки (CPU/RAM/RPS) и удаление при спаде.',
                keyIdea: 'Плати только за то, что используешь.',
                dataFlow: [
                    '1. Cloud Watch видит CPU > 80%.',
                    '2. Auto Scaling Group запускает новые VM.',
                    '3. Load Balancer начинает слать трафик на новые ноды.',
                ],
                commonMistakes: [
                    '❌ Scaling Storm (постоянный up/down из-за отсутствия cooldown).',
                    '❌ Холодный старт (новые ноды не успевают запуститься при резком скачке).',
                    '❌ База данных становится бутылочным горлышком при скейлинге аппа.',
                ],
                instructions: [
                    '1. Добавьте "Балансировщик" (Load Balancer).',
                    '2. Добавьте 3 компонента "Сервис".',
                    '3. Соедините Балансировщик со всеми Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                }
            },
            {
                id: 'perf-nosql',
                title: 'Polyglot Persistence',
                pattern: 'NoSQL Optimized',
                tactic: 'Специализированные БД.',
                description: 'Использование разных типов баз данных для разных задач (Redis для кэша, Mongo для документов, Neo4j для графов).',
                keyIdea: 'Выбери правильный инструмент для работы.',
                dataFlow: [
                    '1. Профиль пользователя хранится в RDBMS (SQL).',
                    '2. Корзина покупок (SESSION) — в Redis.',
                    '3. Каталог товаров (JSON) — в MongoDB.',
                ],
                commonMistakes: [
                    '❌ Использование NoSQL, потому что "это модно" (теряем ACID).',
                    '❌ Сложность поддержки зоопарка технологий.',
                    '❌ Проблемы с согласованностью данных между разными БД.',
                ],
                instructions: [
                    '1. Добавьте "Сервис".',
                    '2. Добавьте 2 "Базы данных" (SQL и NoSQL).',
                    '3. Соедините Сервис с обеими Базами данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'database', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                }
            }
        ]
    },
    {
        id: 'modifiability',
        title: 'Модифицируемость',
        icon: <Box size={20} />,
        description: 'Легкость внесения изменений и расширения системы.',
        lessons: [
            {
                id: 'mod-layers',
                title: 'Layered Architecture',
                pattern: 'Layers',
                tactic: 'Разделение ответственности.',
                description: 'Организация кода в горизонтальные слои (Presentation, Business, Data), где каждый слой зависит только от нижнего.',
                keyIdea: 'Изменения в UI не должны ломать БД, и наоборот.',
                dataFlow: [
                    '1. Frontend (Presentation) вызывает API Gateway.',
                    '2. API Gateway вызывает Service (Business Logic).',
                    '3. Service обращается к Database (Data Layer).',
                ],
                commonMistakes: [
                    '❌ Пропуск слоев (Frontend ходит сразу в БД).',
                    '❌ Циклические зависимости между слоями.',
                    '❌ "God Class" сервисы, знающие обо всем.'
                ],
                instructions: [
                    '1. Добавьте "Frontend".',
                    '2. Добавьте "API Gateway".',
                    '3. Добавьте "Сервис" (Business).',
                    '4. Добавьте "Базу данных" (Data).',
                    '5. Соедините их последовательно: Frontend -> Gateway -> Service -> DB.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'api-gateway', count: 1 }, { type: 'service', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [
                        { from: 'frontend', to: 'api-gateway' },
                        { from: 'api-gateway', to: 'service' },
                        { from: 'service', to: 'database' }
                    ]
                }
            },
            {
                id: 'mod-custom-node',
                title: 'Microservices / Plugins',
                pattern: 'Microkernel',
                tactic: 'Расширяемость.',
                description: 'Ядро системы минимально, а функциональность добавляется через плагины или микросервисы.',
                keyIdea: 'Добавляй фичи, не меняя ядро.',
                dataFlow: [
                    '1. Core System запускается.',
                    '2. Загружает Plugin A и Plugin B.',
                    '3. Делегирует выполнение специфичных задач плагинам.',
                ],
                commonMistakes: [
                    '❌ Сложный API плагинов (никто не хочет писать под вас).',
                    '❌ Отсутствие изоляции (плагин роняет ядро).',
                    '❌ Версионная несовместимость.'
                ],
                instructions: [
                    '1. Добавьте "Систему" (Core).',
                    '2. Добавьте 2 компонента "Сервис" (Plugins).',
                    '3. Соедините Систему с Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'system', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'system', to: 'service' }]
                }
            },
            {
                id: 'mod-bff',
                title: 'Backend for Frontend (BFF)',
                pattern: 'BFF',
                tactic: 'Адаптация API.',
                description: 'Создание отдельного backend-слоя для каждого типа клиента (Web, Mobile) для оптимизации данных.',
                keyIdea: 'Каждому клиенту — свой идеальный API.',
                dataFlow: [
                    '1. Web Client вызывает Web BFF (полный набор полей).',
                    '2. Mobile Client вызывает Mobile BFF (компактный JSON).',
                    '3. Оба BFF вызывают один и тот же Downstream Service.',
                ],
                commonMistakes: [
                    '❌ Дублирование бизнес-логики в BFF (BFF должен быть тупым).',
                    '❌ BFF превращается в "Super Gateway".',
                    '❌ Отсутствие кодогенерации клиентов по Spec.'
                ],
                instructions: [
                    '1. Добавьте "Frontend" (Web).',
                    '2. Добавьте компонент "BFF" (Web BFF).',
                    '3. Добавьте "Мобильное приложение" (Mobile).',
                    '4. Добавьте компонент "BFF" (Mobile BFF).',
                    '5. Добавьте "Сервис" (Core).',
                    '6. Соедините каждого клиента со своим BFF.',
                    '7. Соедините оба BFF с Core Сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'client', count: 1 }, { type: 'bff', count: 2 }, { type: 'service', count: 1 }],
                    requiredConnections: [
                        { from: 'frontend', to: 'bff' },
                        { from: 'client', to: 'bff' },
                        { from: 'bff', to: 'service' }
                    ]
                }
            },
            {
                id: 'mod-adapter',
                title: 'Adapter',
                pattern: 'Wrapper',
                tactic: 'Совместимость интерфейсов.',
                description: 'Промежуточный компонент, который преобразует интерфейс одной системы (часто Legacy) в формат, ожидаемый клиентом.',
                keyIdea: 'Делает несовместимое совместимым.',
                dataFlow: [
                    '1. Современный Сервис вызывает Адаптер (JSON/REST).',
                    '2. Адаптер конвертирует вызов в SOAP/XML.',
                    '3. Адаптер вызывает Legacy Систему.',
                ],
                commonMistakes: [
                    '❌ Утечка абстракций (Legacy ошибки просачиваются наружу).',
                    '❌ Адаптер выполняет бизнес-логику (он должен только транслировать).',
                    '❌ Прямой вызов Legacy в обход адаптера.'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Client).',
                    '2. Добавьте "Адаптер" (Wrapper).',
                    '3. Добавьте "Внешнюю систему" (Legacy).',
                    '4. Соедините Client с Adapter.',
                    '5. Соедините Adapter с Legacy.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'adapter', count: 1 }, { type: 'external-system', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'adapter' }, { from: 'adapter', to: 'external-system' }]
                }
            },
            {
                id: 'mod-facade',
                title: 'Facade',
                pattern: 'Facade',
                tactic: 'Скрытие сложности.',
                description: 'Компонент, предоставляющий упрощенный интерфейс к сложной подсистеме или группе компонентов.',
                keyIdea: 'Сделай сложное простым для потребителя.',
                dataFlow: [
                    '1. Клиент вызывает метод Фасада (напр. "initSystem").',
                    '2. Фасад вызывает Сервис А, Сервис Б и Сервис В.',
                    '3. Фасад агрегирует результат и отдает Клиенту.',
                ],
                commonMistakes: [
                    '❌ Фасад становится "God Object" (знает слишком много).',
                    '❌ Фасад содержит бизнес-логику (должен только делегировать).',
                    '❌ Клиенты обходят Фасад и зависят от подсистем напрямую.'
                ],
                instructions: [
                    '1. Добавьте "Клиент".',
                    '2. Добавьте "Фасад".',
                    '3. Добавьте 3 компонента "Подсистема" (Service).',
                    '4. Соедините Клиента с Фасадом.',
                    '5. Соедините Фасад с каждым Сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'client', count: 1 }, { type: 'facade', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'client', to: 'facade' }, { from: 'facade', to: 'service' }]
                }
            }
        ]
    },
    {
        id: 'deployability',
        title: 'Развертываемость',
        icon: <GitBranch size={20} />,
        description: 'Способность системы к частным и безопасным обновлениям.',
        lessons: [
            {
                id: 'deploy-cicd',
                title: 'CI/CD Pipeline',
                pattern: 'Delivery Pipeline',
                tactic: 'Автоматизация поставки.',
                description: 'Полная автоматизация процесса сборки, тестирования и развертывания кода.',
                keyIdea: 'От коммита до прода — без рук.',
                dataFlow: [
                    '1. Разработчик пушит код в VCS (Git).',
                    '2. CI/CD Pipeline запускает тесты и сборку.',
                    '3. При успехе Pipeline деплоит артефакт в Систему.',
                ],
                commonMistakes: [
                    '❌ Ручные шаги внутри пайплайна (Approve gate допустим, ручной копипаст — нет).',
                    '❌ Тестирование не тех артефактов, что идут в прод (Rebuild vs Promote).',
                    '❌ Отсутствие возможности отката (Rollback).'
                ],
                instructions: [
                    '1. Добавьте "Разработчика" (Developer).',
                    '2. Добавьте "VCS" (Git).',
                    '3. Добавьте "CI/CD пайплайн".',
                    '4. Добавьте "Систему" (Prod).',
                    '5. Соедините по цепочке: Dev -> VCS -> Pipeline -> System.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'developer', count: 1 }, { type: 'vcs', count: 1 }, { type: 'ci-cd-pipeline', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [
                        { from: 'developer', to: 'vcs' },
                        { from: 'vcs', to: 'ci-cd-pipeline' },
                        { from: 'ci-cd-pipeline', to: 'system' }
                    ]
                }
            },
            {
                id: 'deploy-bluegreen',
                title: 'Blue-Green Deployment',
                pattern: 'Blue-Green',
                tactic: 'Нулевой даунтайм.',
                description: 'Наличие двух идентичных окружений. Одно (Blue) обслуживает трафик, другое (Green) обновляется. Переключение мгновенное.',
                keyIdea: 'Мгновенный свитч и легкий откат.',
                dataFlow: [
                    '1. Load Balancer шлет 100% трафика на Blue (v1).',
                    '2. Деплоим v2 на Green. Гоняем тесты.',
                    '3. Load Balancer переключает 100% трафика на Green (v2).',
                ],
                commonMistakes: [
                    '❌ Общая база данных без обратной совместимости схем.',
                    '❌ Обрывание активных сессий при переключении (нужен Draining).',
                    '❌ Экономия на резервном контуре (Green слабее Blue).'
                ],
                instructions: [
                    '1. Добавьте "Балансировщик".',
                    '2. Добавьте "Сервис" (назовите Blue).',
                    '3. Добавьте "Сервис" (назовите Green).',
                    '4. Соедините Балансировщик с обоими Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                }
            },
            {
                id: 'deploy-canary',
                title: 'Canary Release',
                pattern: 'Canary',
                tactic: 'Постепенная раскатка.',
                description: 'Выкатка новой версии на малый процент пользователей (канарейка) для проверки на реальном трафике.',
                keyIdea: 'Тестируй на живых (но по чуть-чуть).',
                dataFlow: [
                    '1. LB шлет 95% трафика на Stable Service.',
                    '2. LB шлет 5% трафика на Canary Service (vNext).',
                    '3. Мониторинг сравнивает метрики ошибок. Если OK — увеличиваем %.',
                ],
                commonMistakes: [
                    '❌ "Липкие" сессии (Sticky Sessions) мешают честному распределению.',
                    '❌ Канарейка не репрезентативна (только внутренние юзеры).',
                    '❌ Ручной анализ метрик вместо автоматического (Kayenta).'
                ],
                instructions: [
                    '1. Добавьте "Балансировщик".',
                    '2. Добавьте "Сервис" (Stable).',
                    '3. Добавьте "Сервис" (Canary).',
                    '4. Соедините Балансировщик с обоими.',
                    '5. Добавьте "Мониторинг", соединенный с Canary.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 2 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [
                        { from: 'load-balancer', to: 'service' },
                        { from: 'service', to: 'monitoring' }
                    ]
                }
            },
            {
                id: 'deploy-flags',
                title: 'Feature Flags',
                pattern: 'Feature Toggles',
                tactic: 'Разделение деплоя и релиза.',
                description: 'Использование конфигурации для включения/выключения фич в рантайме без передеплоя кода.',
                keyIdea: 'Код уже там, но он спит.',
                dataFlow: [
                    '1. Сервис получает запрос.',
                    '2. Сервис спрашивает Feature Flag Service: "Включена ли фича X для юзера Y?".',
                    '3. Если да — выполняется новый код, если нет — старый.',
                ],
                commonMistakes: [
                    '❌ Технический долг (бесконечное накопление старых флагов).',
                    '❌ Случайное включение dev-флага в проде.',
                    '❌ Флаг как часть конфигурации файла (требует рестарта), а не сервис.'
                ],
                instructions: [
                    '1. Добавьте "Сервис".',
                    '2. Добавьте "Feature Flag Service".',
                    '3. Соедините Сервис с Feature Flag Service.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'feature-flag', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'feature-flag' }]
                }
            }
        ]
    },
    {
        id: 'consistency',
        title: 'Согласованность',
        icon: <Scale size={20} />,
        description: 'Целостность данных в распределенной системе.',
        lessons: [
            {
                id: 'cons-saga',
                title: 'Saga Pattern (Orchestration)',
                pattern: 'Saga',
                tactic: 'Компенсирующие транзакции.',
                description: 'Управление распределенной транзакцией через последовательный вызов локальных транзакций сервисов. В случае ошибки — запуск отмены (компенсации).',
                keyIdea: 'Нет глобального rollback, есть "извини, отменяем".',
                dataFlow: [
                    '1. Оркестратор говорит "Сервис А, зарезервируй товар". (Done)',
                    '2. Оркестратор говорит "Сервис Б, спиши деньги". (Fail)',
                    '3. Оркестратор говорит "Сервис А, отмени резерв" (Compensate).',
                ],
                commonMistakes: [
                    '❌ Отсутствие идемпотентности (повторный вызов отмены ломает все).',
                    '❌ Смешивание логики саги и бизнес-логики сервиса.',
                    '❌ Наблюдаемость промежуточных (грязных) состояний.'
                ],
                instructions: [
                    '1. Добавьте "Saga Orchestrator".',
                    '2. Добавьте 3 компонента "Сервис".',
                    '3. Соедините Оркестратор с каждым из Сервисов (двусторонне).',
                ],
                validationParams: {
                    requiredComponents: [{ type: 'saga', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'saga', to: 'service' }]
                }
            },
            {
                id: 'cons-cdc',
                title: 'Change Data Capture (CDC)',
                pattern: 'CDC / Outbox',
                tactic: 'Надежная публикация событий.',
                description: 'Захват изменений данных прямо из лога транзакций базы данных для отправки в шину событий.',
                keyIdea: 'База данных — единственный источник правды.',
                dataFlow: [
                    '1. Сервис пишет в DB.',
                    '2. CDC-коннектор (Debezium) читает Transaction Log базы.',
                    '3. Событие изменения гарантированно летит в Kafka.',
                ],
                commonMistakes: [
                    '❌ Dual Write (писать в БД и в Кафку из кода — будет рассинхрон).',
                    '❌ Раскрытие внутренней структуры БД в публичных событиях.',
                    '❌ Отставание репликации CDC.'
                ],
                instructions: [
                    '1. Добавьте "Базу данных".',
                    '2. Добавьте компонент "CDC".',
                    '3. Добавьте "Очередь" (или Event Bus).',
                    '4. Соедините БД с CDC.',
                    '5. Соедините CDC с Очередью.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 1 }, { type: 'cdc', count: 1 }, { type: 'queue', count: 1 }],
                    requiredConnections: [{ from: 'database', to: 'cdc' }, { from: 'cdc', to: 'queue' }]
                }
            }
        ]
    },
    {
        id: 'interoperability',
        title: 'Интеграция',
        icon: <RefreshCw size={20} />,
        description: 'Взаимодействие разнородных систем.',
        lessons: [
            {
                id: 'interop-esb',
                title: 'Enterprise Service Bus',
                pattern: 'ESB',
                tactic: 'Оркестрация и трансформация.',
                description: 'Централизованная шина для маршрутизации, трансформации протоколов и сообщений между сервисами.',
                keyIdea: 'Умная труба, глупые терминалы (SOA era).',
                dataFlow: [
                    '1. Сервис А шлет XML.',
                    '2. ESB трансформирует XML в JSON, обогащает данными.',
                    '3. ESB вызывает Сервис Б.',
                ],
                commonMistakes: [
                    '❌ Бутылочное горлышко (вся логика в ESB).',
                    '❌ Сложность тестирования правил ESB.',
                    '❌ Единая точка отказа.'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Source).',
                    '2. Добавьте "ESB".',
                    '3. Добавьте "Сервис" (Target).',
                    '4. Соедините Source с ESB.',
                    '5. Соедините ESB с Target.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'esb', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'esb' }, { from: 'esb', to: 'service' }]
                }
            },
            {
                id: 'interop-acl',
                title: 'Anti-Corruption Layer (ACL)',
                pattern: 'ACL',
                tactic: 'Изоляция домена.',
                description: 'Слой-транслятор, защищающий модель данных новой системы от "загрязнения" концепциями легаси системы.',
                keyIdea: 'Не позволяй легаси диктовать свои правила новой системе.',
                dataFlow: [
                    '1. Новый домен вызывает интерфейс ACL.',
                    '2. ACL транслирует запрос в термины старой системы.',
                    '3. Ответ транслируется обратно в чистую модель.',
                ],
                commonMistakes: [
                    '❌ Просачивание типов данных Legacy через ACL.',
                    '❌ Отсутствие ACL при интеграции с внешней SaaS (Vendor Lock-in).',
                ],
                instructions: [
                    '1. Добавьте "Бизнес-домен" (New Context).',
                    '2. Добавьте "Facade Service" (ACL).',
                    '3. Добавьте "Внешнюю систему" (Legacy/SaaS).',
                    '4. Соедините Бизнес-домен с ACL.',
                    '5. Соедините ACL с Внешней системой.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'business-domain', count: 1 }, { type: 'facade', count: 1 }, { type: 'external-system', count: 1 }],
                    requiredConnections: [{ from: 'business-domain', to: 'facade' }, { from: 'facade', to: 'external-system' }]
                }
            }
        ]
    },
    {
        id: 'testability',
        title: 'Тестируемость',
        icon: <FileCode size={20} />,
        description: 'Способность системы к проверке корректности работы.',
        lessons: [
            {
                id: 'test-contract',
                title: 'Consumer-Driven Contracts',
                pattern: 'Contract Testing',
                tactic: 'Верификация контрактов.',
                description: 'Потребители API фиксируют свои ожидания в виде контрактов (Pact). Provider API обязан проходить тесты на соответствие этим контрактам.',
                keyIdea: 'Не ламай клієнтів зворотною несумісністю. Контракт належить Consumer.',
                dataFlow: [
                    '1. Consumer публикует контракт в Broker.',
                    '2. Provider запускает provider-verification тесты (генерируются из контракта).',
                    '3. Если Provider нарушил контракт — деплой блокируется.',
                ],
                commonMistakes: [
                    '❌ Тестирование реализации вместо поведения.',
                    '❌ Отсутствие брокера контрактов.',
                    '❌ Попытка использовать End-to-End тесты для всего.'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Consumer).',
                    '2. Добавьте "Contract Testing" (Broker).',
                    '3. Добавьте "Сервис" (Provider).',
                    '4. Соедините Consumer с Broker.',
                    '5. Соедините Broker с Provider.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'contract-testing', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'contract-testing' }, { from: 'contract-testing', to: 'service' }]
                }
            },
            {
                id: 'test-chaos',
                title: 'Chaos Engineering',
                pattern: 'Chaos Monkey',
                tactic: 'Внедрение сбоев.',
                description: 'Преднамеренное введение неисправностей (отключение серверов, задержки сети) в продакшене для проверки устойчивости системы.',
                keyIdea: 'Ломай систему сам, пока это не сделали пользователи.',
                dataFlow: [
                    '1. Chaos Agent выбирает жертву (Сервис).',
                    '2. Вносит Latency или убивает процесс.',
                    '3. Мониторинг проверяет, выжила ли система (Graceful degradation).',
                ],
                commonMistakes: [
                    '❌ Запуск хаоса без хорошего мониторинга (не поймете, что случилось).',
                    '❌ Начинать сразу с прода (начните с Test env).',
                    '❌ Отсутствие кнопки "Stop All" (Panic button).'
                ],
                instructions: [
                    '1. Добавьте "Chaos Testing" (Chaos Monkey).',
                    '2. Добавьте "Систему" (Target).',
                    '3. Добавьте "Мониторинг".',
                    '4. Соедините Chaos Testing с Системой.',
                    '5. Соедините Систему с Мониторингом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'chaos-testing', count: 1 }, { type: 'system', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'chaos-testing', to: 'system' }]
                }
            }
        ]
    },
    {
        id: 'functional',
        title: 'Функциональность',
        icon: <Target size={20} />,
        description: 'Способность системы выполнять требуемые задачи (ISO 25010).',
        lessons: [
            {
                id: 'func-domain-model',
                title: 'Rich Domain Model',
                pattern: 'DDD (Domain-Driven Design)',
                tactic: 'Инкапсуляция бизнес-правил.',
                description: 'Бизнес-логика живет внутри сущностей (Rich Model), а не в сервисах (Anemic Model). Гарантирует, что данные всегда валидны.',
                keyIdea: 'Объект сам отвечает за свое состояние.',
                dataFlow: [
                    '1. API вызывает метод сущности Order.addItem().',
                    '2. Сущность Order проверяет лимиты и правила.',
                    '3. Сущность генерирует Domain Event "ItemAdded".',
                ],
                commonMistakes: [
                    '❌ Anemic Model (сущности — просто мешки геттеров/сеттеров).',
                    '❌ Размывание логики по сервисам и контроллерам.',
                    '❌ Отсутствие инвариантов (Entity может быть создана невалидной).'
                ],
                instructions: [
                    '1. Добавьте "API слой" (Controller).',
                    '2. Добавьте "Доменную Модель" (Rich Entity).',
                    '3. Добавьте "Базу данных".',
                    '4. Соедините API с Моделью (вызов метода).',
                    '5. Соедините Модель с БД (Persistence).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'controller', count: 1 }, { type: 'domain-model', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'controller', to: 'domain-model' }, { from: 'domain-model', to: 'database' }]
                }
            },
            {
                id: 'func-fsm',
                title: 'Finite State Machine',
                pattern: 'State Machine',
                tactic: 'Формализация переходов.',
                description: 'Явное управление жизненным циклом объекта (Заказ: New -> Paid -> Shipped) через машину состояний, запрещающую некорректные переходы.',
                keyIdea: 'Нельзя отправить заказ, который не оплачен.',
                dataFlow: [
                    '1. Сервис получает команду "Ship Order".',
                    '2. State Machine проверяет текущий статус (Paid).',
                    '3. Если переход разрешен — меняет статус на Shipped.',
                ],
                commonMistakes: [
                    '❌ Изменение статусов строками в коде (order.status = "shipped").',
                    '❌ Разбросанная логика переходов (if/else ад).',
                    '❌ Отсутствие истории переходов (Audit Log).'
                ],
                instructions: [
                    '1. Добавьте "Сервис Заказов".',
                    '2. Добавьте "State Machine" (Logic).',
                    '3. Добавьте "Базу данных".',
                    '4. Соедините Сервис с State Machine.',
                    '5. Соедините State Machine с БД.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'state-machine', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'state-machine' }, { from: 'state-machine', to: 'database' }]
                }
            }
        ]
    },
    {
        id: 'usability',
        title: 'Удобство',
        icon: <MousePointer size={20} />,
        description: 'Удобство использования, защита от ошибок и эстетика.',
        lessons: [
            {
                id: 'use-command',
                title: 'Command Pattern (Undo/Redo)',
                pattern: 'Command',
                tactic: 'Отмена действий.',
                description: 'Инкапсуляция всех действий пользователя в объекты-команды, что позволяет легко реализовать отмену (Undo) и повтор (Redo).',
                keyIdea: 'Каждое действие можно "проиграть" назад.',
                dataFlow: [
                    '1. Пользователь жмет "Удалить". UI создает Command object.',
                    '2. Command выполняется и сохраняется в History Stack.',
                    '3. При нажатии Undo — берем последнюю команду и зовем undo().',
                ],
                commonMistakes: [
                    '❌ Разрушающие действия без возможности отмены.',
                    '❌ Хранение только состояния (State) вместо дельты изменений.',
                    '❌ Потеря контекста при рестарте приложения.'
                ],
                instructions: [
                    '1. Добавьте "UI" (Frontend).',
                    '2. Добавьте "Command Handler".',
                    '3. Добавьте "History Stack".',
                    '4. Соедините UI с Command Handler.',
                    '5. Соедините Command Handler с History Stack.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'command-handler', count: 1 }, { type: 'history-stack', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'command-handler' }, { from: 'command-handler', to: 'history-stack' }]
                }
            },
            {
                id: 'use-i18n',
                title: 'Internationalization (I18N)',
                pattern: 'Localization Service',
                tactic: 'Адаптация под пользователя.',
                description: 'Архитектура, позволяющая легко адаптировать интерфейс под разные языки и регионы без изменения кода.',
                keyIdea: 'Код — отдельно, тексты — отдельно.',
                dataFlow: [
                    '1. Client запрашивает страницу (Header: Accept-Language: uk-UA).',
                    '2. Сервис смотрит в Dictionary Service за переводами.',
                    '3. Отдает контент на нужном языке.',
                ],
                commonMistakes: [
                    '❌ Хардкод строк в коде.',
                    '❌ Конкатенация строк в коде ("Hello " + name), ломающая грамматику.',
                    '❌ Форматирование дат/чисел без учета локали.'
                ],
                instructions: [
                    '1. Добавьте "Клиент" (Frontend).',
                    '2. Добавьте "Backend Service".',
                    '3. Добавьте "Словарь" (Dictionary DB).',
                    '4. Соедините Клиента с Backend.',
                    '5. Соедините Backend со Словарем.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'backend', count: 1 }, { type: 'dictionary-db', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'backend' }, { from: 'backend', to: 'dictionary-db' }]
                }
            }
        ]
    },
    {
        id: 'portability',
        title: 'Переносимость',
        icon: <AppWindow size={20} />,
        description: 'Легкость переноса системы в другую среду (Cloud, OS).',
        lessons: [
            {
                id: 'port-containers',
                title: 'Containerization',
                pattern: 'Containers (Docker)',
                tactic: 'Упаковка зависимостей.',
                description: 'Упаковка приложения и всех его зависимостей в единый образ (Container Image), гарантирующий одинаковую работу везде.',
                keyIdea: 'Работает на моей машине = Работает в проде.',
                dataFlow: [
                    '1. Разработчик пишет Dockerfile.',
                    '2. CI строит Image и кладет в Registry.',
                    '3. Orchestrator (K8s) скачивает и запускает контейнер.',
                ],
                commonMistakes: [
                    '❌ Хранение данных (State) внутри контейнера (теряются при рестарте).',
                    '❌ "Толстые" образы (нужен Multi-stage build).',
                    '❌ Запуск от pооt (безопасность).'
                ],
                instructions: [
                    '1. Добавьте "Registry" (Docker Hub).',
                    '2. Добавьте "Оркестратор" (K8s).',
                    '3. Добавьте "Контейнер" (App Pod).',
                    '4. Соедините Registry с Оркестратором.',
                    '5. Соедините Оркестратор с Контейнером (Запуск).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'registry', count: 1 }, { type: 'orchestrator', count: 1 }, { type: 'container', count: 1 }],
                    requiredConnections: [{ from: 'registry', to: 'orchestrator' }, { from: 'orchestrator', to: 'container' }]
                }
            },
            {
                id: 'port-hexagonal',
                title: 'Hexagonal Architecture',
                pattern: 'Ports & Adapters',
                tactic: 'Изоляция ядра от инфраструктуры.',
                description: 'Бизнес-логика (Ядро) не зависит от БД или UI. Взаимодействие идет через Порты (интерфейсы) и Адаптеры (реализации).',
                keyIdea: 'Замени БД или Фреймворк, не трогая бизнес-логику.',
                dataFlow: [
                    '1. Driver Adapter (Controller) вызывает Порт (Input Port).',
                    '2. Core выполняет логику.',
                    '3. Core вызывает Порт (Output Port), реализованный Driven Adapter-ом (DB).',
                ],
                commonMistakes: [
                    '❌ Использование ORM сущностей в доменном слое.',
                    '❌ Просачивание HTTP/JSON в ядро.',
                    '❌ Циклическая зависимость (Ядро зависит от БД).'
                ],
                instructions: [
                    '1. Добавьте "Web Adapter" (Driver).',
                    '2. Добавьте "Core Domain" (Hexagon).',
                    '3. Добавьте "DB Adapter" (Driven).',
                    '4. Соедините Web Adapter с Core.',
                    '5. Соедините Core с DB Adapter.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'web-adapter', count: 1 }, { type: 'core-domain', count: 1 }, { type: 'db-adapter', count: 1 }],
                    requiredConnections: [{ from: 'web-adapter', to: 'core-domain' }, { from: 'core-domain', to: 'db-adapter' }]
                }
            }
        ]
    },
    {
        id: 'planning',
        title: 'Планирование',
        icon: <Milestone size={20} />,
        description: 'Управление планами и дорожными картами.',
        lessons: [
            {
                id: 'plan-roadmap',
                title: 'Создание Дорожной Карты',
                pattern: 'Roadmap',
                tactic: 'Визуализация сроков.',
                description: 'Построение дорожной карты проекта с использованием фаз, задач и вех для наглядного отображения плана работ.',
                keyIdea: 'Разбивай большое на этапы.',
                dataFlow: [
                    '1. Проект делится на Фазы (Phases) или Релизы.',
                    '2. Внутри фаз определяются Задачи (Tasks).',
                    '3. Ключевые достижения отмечаются Вехами (Milestones).',
                    '4. Связи показывают порядок выполнения (Dependencies).',
                ],
                commonMistakes: [
                    '❌ Слишком мелкие задачи (микроменеджмент).',
                    '❌ Отсутствие зависимостей (непонятен критический путь).',
                    '❌ Нереалистичные сроки вех.',
                ],
                instructions: [
                    '1. Добавьте компонент "Phase / Release" из категории Management.',
                    '2. Поместите внутрь него компонент "Task / Item".',
                    '3. Добавьте компонент "Milestone".',
                    '4. Соедините Task с Milestone для отображения зависимости.',
                ],
                validationParams: {
                    requiredComponents: [
                        { type: 'roadmap-phase', count: 1 },
                        { type: 'roadmap-task', count: 1 },
                        { type: 'roadmap-milestone', count: 1 }
                    ],
                    requiredConnections: [{ from: 'roadmap-task', to: 'roadmap-milestone' }]
                }
            }
        ]
    }
]

interface LearningPanelProps {
    nodes: Node[]
    edges: Edge[]
    onClose: () => void
}

export default function LearningPanel({ nodes, edges, onClose }: LearningPanelProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)

    const activeCategory = categories.find(c => c.id === selectedCategory)
    const activeLesson = activeCategory?.lessons.find(l => l.id === selectedLessonId)

    const handleValidation = () => {
        if (!activeLesson) return

        let isValid = true
        let errorMsg = ''
        const currentComponents = nodes.map(n => (n.data as ComponentData).type)

        // 1. Check Components
        for (const req of activeLesson.validationParams.requiredComponents) {
            // Handle generic fallback if specific type not found (simplified)
            const count = currentComponents.filter(t => t === req.type).length

            if (count < req.count) {
                isValid = false
                errorMsg = `Не найдено достаточно компонентов типа "${req.type}". Нужно: ${req.count}, есть: ${count}.`
                break
            }
        }

        if (isValid) {
            // 2. Check Connections
            for (const reqConn of activeLesson.validationParams.requiredConnections) {
                // Find matching edges
                const matches = edges.filter(e => {
                    const sNode = nodes.find(n => n.id === e.source)
                    const tNode = nodes.find(n => n.id === e.target)
                    if (!sNode || !tNode) return false;

                    const sType = (sNode.data as ComponentData).type
                    const tType = (tNode.data as ComponentData).type

                    const direct = sType === reqConn.from && tType === reqConn.to
                    const reverse = reqConn.bidirectional && sType === reqConn.to && tType === reqConn.from

                    return direct || reverse
                })

                if (matches.length === 0) {
                    isValid = false
                    errorMsg = `Нет связи между "${reqConn.from}" и "${reqConn.to}".`
                    break
                }
            }
        }

        setFeedback({
            success: isValid,
            message: isValid ? 'Отлично! Архитектура соответствует паттерну.' : errorMsg
        })
    }

    return (
        <div
            tabIndex={-1}
            style={{
                position: 'absolute',
                top: '80px',
                right: '20px',
                width: '450px',
                maxHeight: 'calc(100vh - 100px)',
                backgroundColor: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'text',
                cursor: 'auto',
                outline: 'none'
            }}
            onCopy={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.currentTarget.focus()}
        >
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#3d3d3d'
            }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} />
                    {activeLesson ? 'Урок' : activeCategory ? activeCategory.title : 'Обучение Архитектуре'}
                </h3>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

                {/* Level 1: Categories */}
                {!selectedCategory && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <p style={{ color: '#ccc', margin: '0 0 8px 0', fontSize: '14px' }}>Выберите качество архитектуры:</p>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#333',
                                    border: '1px solid #555',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#444'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#333'}
                            >
                                <div style={{ color: '#4dabf7' }}>{cat.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{cat.title}</div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{cat.description}</div>
                                </div>
                                <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#666' }} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Level 2: Lessons List */}
                {selectedCategory && !selectedLessonId && activeCategory && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4dabf7',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0,
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <ChevronLeft size={14} /> Назад к категориям
                        </button>

                        <h2 style={{ color: 'white', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {activeCategory.icon} {activeCategory.title}
                        </h2>

                        {activeCategory.lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => {
                                    setSelectedLessonId(lesson.id)
                                    setFeedback(null)
                                }}
                                style={{
                                    padding: '14px',
                                    backgroundColor: '#333',
                                    border: '1px solid #555',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#4dabf7'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#555'}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{lesson.title}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{lesson.pattern}</div>
                                </div>
                                <Play size={14} color="#4dabf7" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Level 3: Active Lesson */}
                {activeLesson && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => {
                                setSelectedLessonId(null)
                                setFeedback(null)
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4dabf7',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0,
                                fontSize: '14px',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <ChevronLeft size={14} /> Назад к списку
                        </button>

                        <div>
                            <h2 style={{ color: 'white', margin: '0 0 4px 0' }}>{activeLesson.title}</h2>
                            <div style={{ color: '#20c997', fontSize: '14px', fontWeight: 500 }}>{activeLesson.pattern}</div>
                        </div>

                        <div style={{ backgroundColor: '#333', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', userSelect: 'text' }}>
                            <div style={{ fontSize: '14px', color: '#ccc' }}>{activeLesson.description}</div>

                            {activeLesson.keyIdea && (
                                <div style={{ fontSize: '13px', color: '#ffd43b', fontWeight: 600 }}>
                                    🔑 Ключевая идея: <span style={{ fontWeight: 400, color: '#fff' }}>{activeLesson.keyIdea}</span>
                                </div>
                            )}

                            {activeLesson.dataFlow && (
                                <div style={{ fontSize: '13px' }}>
                                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>🔄 Поток данных:</div>
                                    <ol style={{ margin: 0, paddingLeft: '20px', color: '#ccc', lineHeight: '1.4' }}>
                                        {activeLesson.dataFlow.map((step, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {activeLesson.commonMistakes && (
                                <div style={{ fontSize: '13px' }}>
                                    <div style={{ color: '#ff6b6b', fontWeight: 600, marginBottom: '4px' }}>❌ Частые ошибки:</div>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#ff8787', lineHeight: '1.4' }}>
                                        {activeLesson.commonMistakes.map((mistake, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{mistake}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeLesson.realWorldExample && (
                                <div style={{ fontSize: '13px', marginTop: '12px', borderTop: '1px solid #444', paddingTop: '12px' }}>
                                    <div style={{ color: '#4dabf7', fontWeight: 600, marginBottom: '4px' }}>🏢 Реальный пример:</div>
                                    <div style={{ color: '#ddd' }}>{activeLesson.realWorldExample}</div>
                                </div>
                            )}

                            <div style={{ fontSize: '13px', color: '#ffd43b', marginTop: '4px', fontStyle: 'italic' }}>
                                💡 Тактика: {activeLesson.tactic}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', margin: '0 0 8px 0' }}>Задание:</h4>
                            <div style={{ backgroundColor: '#252525', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ddd', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeLesson.instructions.map((inst, i) => (
                                        <li key={i}>{inst}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {feedback && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '6px',
                                backgroundColor: feedback.success ? 'rgba(32, 201, 151, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                                border: `1px solid ${feedback.success ? '#20c997' : '#ff6b6b'}`,
                                color: feedback.success ? '#20c997' : '#ff6b6b',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '10px'
                            }}>
                                {feedback.success ? <Check size={20} /> : <AlertCircle size={20} />}
                                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{feedback.message}</div>
                            </div>
                        )}

                        <button
                            onClick={handleValidation}
                            style={{
                                padding: '14px',
                                backgroundColor: '#339af0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '16px',
                                marginTop: 'auto',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Проверить решение
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}
