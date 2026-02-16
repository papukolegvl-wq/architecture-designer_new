
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
                title: 'Load Balancing (E-commerce)',
                pattern: 'Load Balancer',
                tactic: 'Распределение нагрузки.',
                description: 'Сценарий: "Черная пятница" в интернет-магазине. Тысячи пользователей одновременно обновляют страницу товара. Один сервер не справляется.',
                keyIdea: 'Ни один кассир не должен собрать очередь, если свободны другие.',
                dataFlow: [
                    '1. Покупатель заходит на сайт (HTTPS запрос на VIP).',
                    '2. Балансировщик принимает запрос и расшифровывает SSL.',
                    '3. Выбирает наименее загруженный инстанс "Storefront".',
                    '4. Перенаправляет запрос на него.',
                ],
                commonMistakes: [
                    '❌ Балансировщик как SPOF (нужен HA-кластер).',
                    '❌ Хранение корзины в памяти (Session Affinity теряется при сбое узла).',
                    '❌ "Thundering Herd" — одновременный рестарт всех бэкендов после сбоя.',
                ],
                instructions: [
                    '1. Разместите "Балансировщик" (Load Balancer) для приема трафика.',
                    '2. Разместите два компонента "Сервис" (назовем их Storefront A и Storefront B).',
                    '3. Соедините "Балансировщик" с первым "Сервисом".',
                    '4. Соедините "Балансировщик" со вторым "Сервисом".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'Amazon Retail, Shopify Black Friday handling (millions of RPM).'
            },
            {
                id: 'scalability-sharding',
                title: 'Database Sharding (SaaS / Social)',
                pattern: 'Sharding',
                tactic: 'Горизонтальное партиционирование.',
                description: 'Сценарий: Социальная сеть с миллиардом пользователей. База данных просто не успевает записывать лайки и сообщения в одну таблицу.',
                keyIdea: 'Разделяй пользователей по корзинам (Shards).',
                dataFlow: [
                    '1. Пользователь ID=123 (EU) хочет поставить лайк.',
                    '2. Приложение вычисляет Шард: UserID % 3 = 0 (Shard A).',
                    '3. Запрос на запись уходит ТОЛЬКО в Shard A.',
                ],
                commonMistakes: [
                    '❌ "Hot Shard" — все знаменитости попали на один шард и положили его.',
                    '❌ Cross-Shard Joins — попытка найти "друзей друзей друзей" на разных серверах.',
                    '❌ Утеря транзакционности (нельзя одной транзакцией обновить два разных шарда).',
                ],
                instructions: [
                    '1. Разместите компонент "Сервис" (Social Network API).',
                    '2. Разместите три компонента "База данных" (Shard 1, Shard 2, Shard 3).',
                    '3. Проведите связь от "Сервиса" к каждому из трех шардов.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 3 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                },
                realWorldExample: 'Discord (Messages), Slack, Instagram (Media storage).'
            },
            {
                id: 'scalability-microservices',
                title: 'Microservices (Taxi App)',
                pattern: 'Database per Service',
                tactic: 'Декомпозиция по бизнес-доменам.',
                description: 'Сценарий: Приложение такси. Сервис Заказов (Orders) не должен зависеть от падения Сервиса Платежей (Payments). У каждого своя база.',
                keyIdea: 'Share-Nothing Architecture. Чужую базу трогать нельзя.',
                dataFlow: [
                    '1. Пользователь вызывает такси через API Gateway.',
                    '2. Gateway зовет Order Service (создает заказ).',
                    '3. Order Service пишет в СВОЮ базу.',
                    '4. Order Service шлет событие. Payment Service видит его и списывает деньги в СВОЕЙ базе.'
                ],
                commonMistakes: [
                    '❌ Distributed Monolith — сервисы ходят друг к другу по HTTP синхронно.',
                    '❌ Shared Database — Заказы и Платежи в одной схеме БД (нарушение изоляции).',
                    '❌ Потеря целостности (нужны Saga или Eventual Consistency).',
                ],
                instructions: [
                    '1. Разместите "API Gateway".',
                    '2. Создайте ветку "Orders": добавьте "Сервис" и подсоедините к нему "Базу данных".',
                    '3. Создайте ветку "Payments": добавьте второй "Сервис" и вторую "Базу данных".',
                    '4. Подключите "API Gateway" к обоим сервисам (Orders и Payments).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'database', count: 2 }, { type: 'api-gateway', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'database' }, { from: 'api-gateway', to: 'service' }]
                },
                realWorldExample: 'Uber (4000+ services). Drivers, Riders, Eats, Maps separated.'
            },
            {
                id: 'scalability-async',
                title: 'Async Messaging (Supply Chain)',
                pattern: 'Publisher-Subscriber',
                tactic: 'Асинхронность и Decoupling.',
                description: 'Сценарий: Система логистики. При создании заказа нужно уведомить Склад, Курьеров и Бухгалтерию. Делать это последовательно (синхронно) — долго и ненадежно.',
                keyIdea: 'Fire and Forget. Брось письмо в ящик и иди дальше.',
                dataFlow: [
                    '1. Order Service (Producer) кидает событие "Заказ создан" в брокер.',
                    '2. Брокер (Kafka/Rabbit) сохраняет и ждет.',
                    '3. Склад (Consumer A) читает: "Резервирую товар".',
                    '4. Курьер (Consumer B) читает: "Ищу водителя".',
                ],
                commonMistakes: [
                    '❌ Использование БД как очереди (Polling каждые 100мс убивает базу).',
                    '❌ Необработанные сообщения (нужен DLQ - Dead Letter Queue).',
                    '❌ Ожидание мгновенной реакции (это Eventually Consistent система).',
                ],
                instructions: [
                    '1. Разместите "Сервис" (Order Service).',
                    '2. Разместите компонент "Очередь" (Message Broker).',
                    '3. Разместите "Сервис" (Warehouse Service).',
                    '4. Соедините Order Service -> Очередь.',
                    '5. Соедините Очередь -> Warehouse Service.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'queue', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'queue' }, { from: 'queue', to: 'service' }]
                },
                realWorldExample: 'FedEx/UPS tracking systems, Banking transaction processing.'
            },
            {
                id: 'scalability-cache',
                title: 'Caching (News Portal)',
                pattern: 'Cache-Aside',
                tactic: 'Снижение нагрузки на БД.',
                description: 'Сценарий: Новостной портал. Горячая новость "Итоги выборов" запрашивается 10,000 раз в секунду. База умрет. Нужен кэш.',
                keyIdea: 'Память (RAM) быстрее диска (SSD) в 1000 раз.',
                dataFlow: [
                    '1. Читатель открывает статью.',
                    '2. Бэкенд проверяет Redis. Если есть (Hit) — отдает сразу.',
                    '3. Если нет (Miss) — идет в тяжелую БД, берет статью, кладет в Redis и отдает.'
                ],
                commonMistakes: [
                    '❌ Кэширование без TTL (память закончится).',
                    '❌ Cache Stampede — кэш протух, и сразу 1000 запросов пробили его в базу.',
                    '❌ Рассинхрон — новость обновили, а в кэше старая версия.'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис" (News Backend).',
                    '2. Разместите "Кэш" (Redis/Memcached).',
                    '3. Разместите "Базу данных" (Main DB).',
                    '4. Соедините Сервис -> Кэш.',
                    '5. Соедините Сервис -> База данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'cache', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'cache' }, { from: 'service', to: 'database' }]
                },
                realWorldExample: 'Twitter Timelines, Reddit Comments, CNN.com.'
            },
            {
                id: 'scalability-cdn',
                title: 'CDN (Streaming Service)',
                pattern: 'Edge Caching',
                tactic: 'Географическая дистрибуция.',
                description: 'Сценарий: Видеостриминг (Netflix/YouTube). Пользователь из Австралии не должен качать фильм с сервера в США (пинги ужасные, буферизация). Ему нужен сервер в Сиднее.',
                keyIdea: 'Доставляй контент с соседней улицы.',
                dataFlow: [
                    '1. Пользователь нажимает Play.',
                    '2. Плеер запрашивает video-chunk.mp4.',
                    '3. Запрос летит на ближайший Edge-сервер CDN (в городе пользователя).',
                    '4. Edge отдает файл из кэша мгновенно.'
                ],
                commonMistakes: [
                    '❌ Использование CDN для приватных данных без подписи (Signed URLs).',
                    '❌ Отсутствие версионирования (обновили картинку, а CDN отдает старую).',
                    '❌ Неправильные HTTP заголовки Cache-Control (браузер кэширует ошибки).'
                ],
                instructions: [
                    '1. Разместите "Клиент" (Viewer).',
                    '2. Разместите "CDN" (Edge Network).',
                    '3. Разместите "Сервер" (Origin Server в США).',
                    '4. Соедините Клиент -> CDN.',
                    '5. Соедините CDN -> Сервер.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cdn', count: 1 }, { type: 'server', count: 1 }],
                    requiredConnections: [{ from: 'cdn', to: 'server' }]
                },
                realWorldExample: 'Netflix Open Connect, YouTube Googlevideo, Cloudflare Stream.'
            },
            {
                id: 'scalability-serverless',
                title: 'Serverless (Image Processing)',
                pattern: 'Function as a Service',
                tactic: 'Событийная обработка.',
                description: 'Сценарий: Пользователь загружает аватарку. Нам нужно создать 3 версии (small, medium, large). Держать для этого сервер 24/7 дорого. Используем лямбду.',
                keyIdea: 'Нет работы — не платишь (Scale to Zero).',
                dataFlow: [
                    '1. Пользователь грузит файл в S3 (хранилище).',
                    '2. S3 кидает событие "FileUploaded".',
                    '3. Облако запускает Lambda-функцию "Resizer".',
                    '4. Функция режет картинку и кладет обратно. И выключается.'
                ],
                commonMistakes: [
                    '❌ Cold Starts — пользователь ждет 2 секунды, пока "прогреется" контейнер.',
                    '❌ Использование Serverless для задач > 15 минут (timeout).',
                    '❌ Соединение с обычной SQL базой (закончатся коннекты, нужен Proxy).',
                ],
                instructions: [
                    '1. Разместите "API Gateway" (Front Door).',
                    '2. Разместите "Бессерверную функцию" (Upload Handler).',
                    '3. Разместите вторую "Бессерверную функцию" (Thumbnail Generator).',
                    '4. Подключите все к API Gateway (для упрощения задачи).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'lambda', count: 2 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'lambda' }]
                },
                realWorldExample: 'Instagram image uploads, PDF generation services, Scheduled Cron jobs.'
            },
            {
                id: 'scalability-cqrs',
                title: 'CQRS (Banking Ledger)',
                pattern: 'Command Query Responsibility Segregation',
                tactic: 'Разделение чтения и записи.',
                description: 'Сценарий: Банковский процессинг. Операции перевода (Command) супер-критичны и сложны. Просмотр баланса (Query) прост и част. Разделяем их на разные сервисы.',
                keyIdea: 'Оптимизируй Write для надежности, а Read для скорости.',
                dataFlow: [
                    '1. Клиент делает перевод (Command Service -> Write DB).',
                    '2. Событие "MoneySent" летит в Шину (Event Bus).',
                    '3. Projection Service ловит его и обновляет "быструю" Read DB.',
                    '4. Клиент смотрит баланс через Query Service -> Read DB.'
                ],
                commonMistakes: [
                    '❌ Lag — клиент сделал перевод, обновил страницу, а баланс старый (нужен Optimistic UI).',
                    '❌ Сложность x3 — теперь у вас две базы и синхронизация.',
                    '❌ Потеря событий — баланс никогда не сойдется.'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Command).',
                    '2. Разместите "Базу данных" (Write DB). Соедините Command -> Write DB.',
                    '3. Разместите "Event Bus" (Kafka). Соедините Command -> Event Bus.',
                    '4. Разместите "Сервис" (Projector). Соедините Event Bus -> Projector.',
                    '5. Разместите "Базу данных" (Read DB). Соедините Projector -> Read DB.',
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
                realWorldExample: 'Bank transaction logs vs Balance check, High-load Booking systems.'
            },
            {
                id: 'scalability-parallel',
                title: 'Fan-Out (Analytics Pipeline)',
                pattern: 'Parallel Workers',
                tactic: 'Параллельная обработка.',
                description: 'Сценарий: Обработка логов. Каждую секунду прилетает 10GB логов. Один сервер подавится. Нужно разбить данные на куски (partitioning) и скормить их 100 воркерам.',
                keyIdea: 'Divide and Conquer. Разделяй проблемы на маленькие части.',
                dataFlow: [
                    '1. Ingest Service принимает логи и кидает в Kafka (с Partitioning key).',
                    '2. Группа Воркеров (Consumer Group) читает топик.',
                    '3. Каждый воркер берет свой кусок и обрабатывает его.',
                    '4. Результаты пишутся в Data Warehouse.'
                ],
                commonMistakes: [
                    '❌ Race Conditions — два воркера пытаются обновить одну запись.',
                    '❌ Poison Pill — битое сообщение крашит воркер, возвращается в очередь и крашит следующего.',
                    '❌ Узкое место на записи — воркеры быстры, а база в конце не успевает.'
                ],
                instructions: [
                    '1. Разместите "Очередь" (Kafka Topic).',
                    '2. Разместите три "Пакетных обработчика" (Worker 1, 2, 3).',
                    '3. Подключите все обработчики к Очереди.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'queue', count: 1 }, { type: 'batch-processor', count: 3 }],
                    requiredConnections: [{ from: 'queue', to: 'batch-processor' }]
                },
                realWorldExample: 'Video Transcoding (YouTube), ETL pipelines, MapReduce jobs.'
            },
            {
                id: 'scalability-edge',
                title: 'Edge/IoT (Smart Factory)',
                pattern: 'Fog Computing',
                tactic: 'Локальная обработка.',
                description: 'Сценарий: "Умный завод". Датчики вибрации на турбине шлют 1ТБ данных в час. Слать это все в облако — разоришься на трафике. Нужно обрабатывать на месте.',
                keyIdea: 'Решай проблемы там, где они возникают.',
                dataFlow: [
                    '1. Датчики шлют данные на локальный IoT Gateway (компьютер в цехе).',
                    '2. Gateway анализирует вибрацию (ML модель).',
                    '3. Если "Опасно" — шлет команду "СТОП" на турбину (мгновенно).',
                    '4. В облако уходит только отчет: "Была тревога".'
                ],
                commonMistakes: [
                    '❌ Зависимость от интернета (интернет отпал, турбина взорвалась).',
                    '❌ Физическая безопасность (хакер может воткнуть флешку в Gateway).',
                    '❌ Сложность обновления софта на тысячах устройств.'
                ],
                instructions: [
                    '1. Разместите "IoT Шлюз" (Local Gateway).',
                    '2. Разместите "Edge Computing" (ML Processor).',
                    '3. Разместите "Облако" (Central System).',
                    '4. Соедините IoT Шлюз -> Edge.',
                    '5. Соедините Edge -> Облако.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'iot-gateway', count: 1 }, { type: 'edge-computing', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [{ from: 'iot-gateway', to: 'edge-computing' }, { from: 'edge-computing', to: 'system' }]
                },
                realWorldExample: 'Tesla Autopilot (process video locally), Smart Cities, Oil Rigs.'
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
                title: 'Data Replication (Healthcare)',
                pattern: 'Primary-Replica',
                tactic: 'Сохранность данных.',
                description: 'Сценарий: Медицинская карта пациента. Потерять запись "У пациента аллергия на пенициллин" недопустима. Данные должны лежать минимум на двух дисках.',
                keyIdea: 'Резервная копия спасает жизни.',
                dataFlow: [
                    '1. Врач сохраняет диагноз в Primary DB.',
                    '2. Primary подтверждает запись и шлет данные в Replica DB.',
                    '3. Если Primary сгорит, мы переключаемся на Replica, где данные уже есть.',
                ],
                commonMistakes: [
                    '❌ Async Replication Lag — врач записал, открыл на другом планшете, а данных еще нет.',
                    '❌ Split Brain — два сервера подумали, что они главные, и записали разные данные.',
                    '❌ Бэкапы не делаются (репликация спасает от сбоя оборудования, но не от `DROP TABLE`).'
                ],
                instructions: [
                    '1. Разместите "Базу данных" (Primary DB).',
                    '2. Разместите вторую "Базу данных" (Secondary DB).',
                    '3. Соедините Primary -> Secondary.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 2 }],
                    requiredConnections: [{ from: 'database', to: 'database' }]
                },
                realWorldExample: 'Hospital Information Systems (HIS), Banking Ledgers.'
            },
            {
                id: 'avail-redundancy',
                title: 'Redundancy (Payment System)',
                pattern: 'Horizontal Scaling',
                tactic: 'Избыточность.',
                description: 'Сценарий: Обработка платежей картой. Если один сервер "Visa Gateway" завис, платеж должен пройти через второй или третий.',
                keyIdea: 'Дублируй критические узлы (N+1).',
                dataFlow: [
                    '1. Терминал шлет запрос на Балансировщик.',
                    '2. Балансировщик видит, что Узел А не отвечает.',
                    '3. Пересылает запрос на Узел Б.',
                    '4. Оплата проходит успешно.'
                ],
                commonMistakes: [
                    '❌ Размещение всех реплик в одной стойке (питание стойки упало - все умерли).',
                    '❌ Отсутствие запаса мощности (в пике нужно N+2, а не просто N).',
                    '❌ Сохранение состояния транзакции в памяти конкретного сервера.'
                ],
                instructions: [
                    '1. Разместите "Балансировщик".',
                    '2. Разместите три компонента "Сервис" (Payment Node 1, 2, 3).',
                    '3. Подключите все узлы к Балансировщику.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'Visa/Mastercard processing centers, Telecommunications.'
            },
            {
                id: 'avail-circuit-breaker',
                title: 'Circuit Breaker (Travel Aggregator)',
                pattern: 'Circuit Breaker',
                tactic: 'Изоляция сбоев.',
                description: 'Сценарий: Агрегатор авиабилетов. Мы опрашиваем 100 авиакомпаний. API "Pobeda Airlines" начало тормозить (30 сек ответ). Если мы будем всех ждать, наш сайт зависнет.',
                keyIdea: 'Если партнер умер, перестань ему звонить.',
                dataFlow: [
                    '1. Наш Сервис вызывает API авиакомпании.',
                    '2. Получает 5 ошибок подряд (Timeout).',
                    '3. Circuit Breaker "открывается" и сразу возвращает ошибку, не делая запросов.',
                    '4. Сайт работает быстро, просто без рейсов этой авиакомпании.'
                ],
                commonMistakes: [
                    '❌ Отсутствие дефолтного ответа (Fallback).',
                    '❌ Слишком долгое восстановление (Half-Open state logic).',
                    '❌ Отсутствие изоляции потоков (один тормоз может занять все треды сервера).'
                ],
                instructions: [
                    '1. Разместите "Сервис" (Aggregator).',
                    '2. Разместите "Circuit Breaker" (защита).',
                    '3. Разместите "Сервис" (Slow Airline API).',
                    '4. Соедините Aggregator -> Circuit Breaker.',
                    '5. Соедините Circuit Breaker -> Airline API.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'circuit-breaker', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'circuit-breaker' }, { from: 'circuit-breaker', to: 'service' }]
                },
                realWorldExample: 'Skyscanner, Expedia, Microservices calling unpredictable Legacy systems.'
            },
            {
                id: 'avail-failover',
                title: 'Disaster Recovery (Stock Exchange)',
                pattern: 'Active-Standby',
                tactic: 'Катастрофоустойчивость.',
                description: 'Сценарий: Нью-Йоркская биржа. Ураган обесточил дата-центр в Нью-Джерси. Торги не должны остановиться ни на минуту. Переключаемся на Чикаго.',
                keyIdea: 'Всегда имей запасной аэродром.',
                dataFlow: [
                    '1. Мониторинг видит, что DC1 недоступен.',
                    '2. DNS сервис меняет запись "exchange.com" на IP DC2 (Чикаго).',
                    '3. Трейдеры автоматически перенаправляются в живой дата-центр.'
                ],
                commonMistakes: [
                    '❌ Cold Standby не "прогрет" и падает от резкой нагрузки.',
                    '❌ DNS кэширование (трейдеры еще час ломятся в мертвый DC1).',
                    '❌ Split Brain (оба DC работают и принимают встречные заявки).'
                ],
                instructions: [
                    '1. Разместите "DNS сервис" (Global Traffic Manager).',
                    '2. Разместите "Балансировщик" (DC1, New York).',
                    '3. Разместите "Балансировщик" (DC2, Chicago).',
                    '4. Подключите DNS к обоим балансировщикам.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'dns-service', count: 1 }, { type: 'load-balancer', count: 2 }],
                    requiredConnections: [{ from: 'dns-service', to: 'load-balancer' }]
                },
                realWorldExample: 'NASDAQ, NYSE, Cloud Region Failover (AWS us-east-1 -> us-west-2).'
            },
            {
                id: 'avail-backup',
                title: 'Backup (Legal Archive)',
                pattern: 'Backup / Archive',
                tactic: 'Восстановление данных.',
                description: 'Сценарий: Юридическая фирма. Вирус-шифровальщик уничтожил все документы. Закон требует хранить дела 50 лет. Спасет только "холодный" бэкап в другом месте.',
                keyIdea: 'Бэкап не проверен = бэкапа нет.',
                dataFlow: [
                    '1. Ночью запускается скрипт резервного копирования.',
                    '2. Данные шифруются и улетают в S3 Glacier (дешевое хранилище).',
                    '3. Раз в месяц происходит тестовое восстановление.'
                ],
                commonMistakes: [
                    '❌ Хранение бэкапов на том же сервере (вирус съест и их).',
                    '❌ Игнорирование шифрования (утечка всего архива компании).',
                    '❌ RPO=24 часа (потеряли работу целого дня).'
                ],
                instructions: [
                    '1. Разместите "Базу данных" (Document Store).',
                    '2. Разместите "Сервис Резервного Копирования" (Backup Agent).',
                    '3. Разместите "Объектное хранилище" (Secure Storage).',
                    '4. Соедините DB -> Backup Agent.',
                    '5. Соедините Backup Agent -> Storage.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 1 }, { type: 'backup-service', count: 1 }, { type: 'object-storage', count: 1 }],
                    requiredConnections: [{ from: 'database', to: 'backup-service' }, { from: 'backup-service', to: 'object-storage' }]
                },
                realWorldExample: 'Iron Mountain Digital, AWS Backup, Corporate Compliance strategies.'
            },
            {
                id: 'avail-monitor',
                title: 'Health Checks (Ride Hailing)',
                pattern: 'Watchdog',
                tactic: 'Обнаружение проблем.',
                description: 'Сценарий: Агрегатор такси. 1000 микросервисов. Как понять, почему водители не могут уйти на линию? Kubernetes должен сам убивать зависшие поды.',
                keyIdea: 'Не притворяйся живым, если не можешь работать.',
                dataFlow: [
                    '1. K8s спрашивает сервис каждые 5 сек: "Ты жив?".',
                    '2. Сервис проверяет: "База доступна? Кэш доступен?".',
                    '3. Если нет — отвечает 500. K8s перезапускает его.'
                ],
                commonMistakes: [
                    '❌ "Deep Checks" в Liveness Probe — если база тормозит, K8s убьет все сервисы (Cascade Fail).',
                    '❌ Отсутствие таймаутов на проверки.',
                    '❌ Проверка внешних сайтов (интернет моргнул - сервис умер).'
                ],
                instructions: [
                    '1. Разместите "Мониторинг" (K8s Controller).',
                    '2. Разместите два "Сервиса" (Driver API).',
                    '3. Подключите Мониторинг к обоим сервисам (Health Probes).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'monitoring', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'monitoring', to: 'service' }]
                },
                realWorldExample: 'Kubernetes Probes, Load Balancer Health Checks.'
            },
            {
                id: 'avail-graceful',
                title: 'Graceful Degradation (Video UI)',
                pattern: 'Fallback',
                tactic: 'Частичный отказ.',
                description: 'Сценарий: Онлайн-кинотеатр. Сервис "Рекомендации" ("Вам может понравиться") упал. Нельзя показывать пользователю ошибку 500. Покажите просто список новинок.',
                keyIdea: 'Худой мир лучше доброй ссоры (или пустой страницы).',
                dataFlow: [
                    '1. UI запрашивает персональные рекомендации.',
                    '2. Сервис Рекомендаций не отвечает (Timeot).',
                    '3. UI идет в Кэш за списком "Топ-10 за неделю".',
                    '4. Пользователь даже не заметил сбоя.'
                ],
                commonMistakes: [
                    '❌ Блокировка всей страницы из-за второстепенного виджета.',
                    '❌ Бесконечный спиннер (Loader) вместо контента.',
                    '❌ Отсутствие мониторинга на срабатывание фоллбэков.'
                ],
                instructions: [
                    '1. Разместите "Сервис" (UI BFF).',
                    '2. Разместите "Внешнюю Систему" (RecSys - Unreliable).',
                    '3. Разместите "Кэш" (Redis with Top-10).',
                    '4. Соедините BFF -> RecSys (Primary).',
                    '5. Соедините BFF -> Кэш (Fallback).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'external-system', count: 1 }, { type: 'cache', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'external-system' }, { from: 'service', to: 'cache' }]
                },
                realWorldExample: 'Netflix UI resilience, Amazon Homepage (static fallbacks).'
            },
            {
                id: 'avail-multi-region',
                title: 'Multi-Region (MMO Game)',
                pattern: 'Geodistribution',
                tactic: 'Близость к пользователю.',
                description: 'Сценарий: Онлайн-шутер. Пинг решает все. Игроку из Берлина нужен сервер во Франкфурте, игроку из Токио — в Японии.',
                keyIdea: 'Законы физики не обманешь.',
                dataFlow: [
                    '1. Игрок запускает игру.',
                    '2. GeoDNS определяет IP игрока (Германия).',
                    '3. Возвращает адрес игрового сервера в EU-Central.',
                    '4. Пинг 20мс. Игрок счастлив.'
                ],
                commonMistakes: [
                    '❌ Синхронизация баз данных между регионами в реальном времени (невозможно для игр).',
                    '❌ Общие глобальные таблицы лидеров, которые тормозят локальный геймплей.',
                    '❌ GDPR (данные игрока из ЕС нельзя хранить в США).'
                ],
                instructions: [
                    '1. Разместите "DNS сервис" (Matchmaker).',
                    '2. Разместите "Сервер" (EU Server).',
                    '3. Разместите "Сервер" (US Server).',
                    '4. Соедините DNS -> EU Server.',
                    '5. Соедините DNS -> US Server.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'dns-service', count: 1 }, { type: 'server', count: 2 }],
                    requiredConnections: [{ from: 'dns-service', to: 'server' }]
                },
                realWorldExample: 'Fortnite, CS:GO matchmaking, Riot Direct.'
            },
            {
                id: 'avail-queue-leveling',
                title: 'Queue Leveling (Ticket Sales)',
                pattern: 'Load Leveling',
                tactic: 'Сглаживание пиков.',
                description: 'Сценарий: Старт продаж билетов на концерт Taylor Swift. 1,000,000 человек ломятся на сайт за 1 секунду. Если всех пустить к базе — она взорвется.',
                keyIdea: 'Поставь их в очередь, как в кассу.',
                dataFlow: [
                    '1. Gateway принимает запрос и тут же кидает в Очередь (Kafka).',
                    '2. Пользователь видит "Вы в очереди, ваше место 5432".',
                    '3. Consumer не спеша (500 req/sec) разбирает очередь и бронирует билеты в БД.'
                ],
                commonMistakes: [
                    '❌ Очередь не резиновая (нужен лимит длины).',
                    '❌ Пользователь не знает, что происходит (нужен WebSocket для обновления позиции).',
                    '❌ Очередь упала и потеряла заказы (нужен Persistence).'
                ],
                instructions: [
                    '1. Разместите "API Gateway" (Ticket Site).',
                    '2. Разместите "Очередь" (Waiting Room).',
                    '3. Разместите "Сервис" (Booking Worker).',
                    '4. Gateway -> Очередь.',
                    '5. Очередь -> Сервис.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'queue', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'queue' }, { from: 'queue', to: 'service' }]
                },
                realWorldExample: 'Ticketmaster Virtual Waiting Room, Black Friday Flash Sales.'
            },
            {
                id: 'avail-active-active',
                title: 'Active-Active (Messenger)',
                pattern: 'Multi-Master',
                tactic: 'Глобальная доступность.',
                description: 'Сценарий: Мессенджер. Пользователь А подключен к серверу в Азии, Пользователь Б — в США. Они переписываются. Оба сервера должны принимать запись сообщений.',
                keyIdea: 'Две головы лучше... но сложнее договориться.',
                dataFlow: [
                    '1. User A пишет сообщение в Asia Node.',
                    '2. User B пишет ответ в US Node.',
                    '3. Базы данных синхронизируются в фоне (Conflict Resolution: Last Write Wins).',
                    '4. Сообщения появляются у обоих.'
                ],
                commonMistakes: [
                    '❌ Конфликты (одновременное редактирование профиля в разных регионах).',
                    '❌ Автоинкремент ID (нужны UUID или диапазоны ID для каждого региона).',
                    '❌ Ожидание, что данные появятся мгновенно (Speed of Light problem).'
                ],
                instructions: [
                    '1. Разместите "Балансировщик".',
                    '2. Разместите две "Базы данных" (Node Asia, Node US).',
                    '3. Подключите Балансировщик к обоим узлам.',
                    '4. Соедините базы между собой для репликации.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 2 }, { type: 'load-balancer', count: 1 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'database' }, { from: 'database', to: 'database' }]
                },
                realWorldExample: 'Google Spanner, DynamoDB Global Tables, Telegram DC architecture.'
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
                title: 'Firewall (Corporate Network)',
                pattern: 'Firewall',
                tactic: 'Фильтрация трафика.',
                description: 'Сценарий: Офисная сеть "Big Corp". Бухгалтерия не должна быть видна из Гостевого Wi-Fi. Сервер с базой данных не должен торчать в интернет.',
                keyIdea: 'Запрещено все, что не разрешено явно.',
                dataFlow: [
                    '1. Хакер сканирует порты публичного IP.',
                    '2. Firewall блокирует все входящие, кроме 443 (VPN) и 80 (Web).',
                    '3. Сотрудник из бухгалтерии получает доступ к 1C-серверу через разрешенное правило.',
                ],
                commonMistakes: [
                    '❌ Правило "Allow Any Any" (временное, которое стало постоянным).',
                    '❌ Размещение Базы Данных в DMZ (публичном сегменте).',
                    '❌ Отсутствие Deny logging для анализа атак.'
                ],
                instructions: [
                    '1. Разместите компонент "Внешняя система" (Internet/Guest).',
                    '2. Разместите компонент "Межсетевой экран" (Firewall).',
                    '3. Разместите компонент "Сервер" (Sensitive Internal DB).',
                    '4. Соедините "Внешнюю систему" с "Межсетевым экраном".',
                    '5. Соедините "Межсетевой экран" с "Сервером".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'firewall', count: 1 }, { type: 'server', count: 1 }],
                    requiredConnections: [{ from: 'firewall', to: 'server' }]
                },
                realWorldExample: 'Palo Alto Networks, Cisco ASA, AWS Security Groups.'
            },
            {
                id: 'sec-auth-service',
                title: 'Auth Service (SaaS Platform)',
                pattern: 'Identity Provider',
                tactic: 'Централизованная аутентификация.',
                description: 'Сценарий: SaaS платформа с 50 микросервисами. Если каждый сервис будет сам проверять логин/пароль — мы сойдем с ума. Нужен единый центр выдачи пропусков.',
                keyIdea: 'Единый источник истины о пользователях.',
                dataFlow: [
                    '1. Пользователь логинится через форму входа.',
                    '2. Auth Service проверяет пароль и выдает подписанный JWT токен.',
                    '3. Пользователь идет с этим токеном в любой другой микросервис.',
                ],
                commonMistakes: [
                    '❌ Реализация Auth логики в каждом микросервисе (Copy-Paste уязвимостей).',
                    '❌ Хранение паролей без "соли" и хэширования.',
                    '❌ Невозможность отозвать украденный токен (нужен Blacklist или короткий TTL).'
                ],
                instructions: [
                    '1. Разместите компонент "API Gateway".',
                    '2. Разместите компонент "Сервис аутентификации" (Auth Service).',
                    '3. Соедините "API Gateway" с "Сервисом аутентификации".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'auth-service', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'auth-service' }]
                },
                realWorldExample: 'Auth0, Keycloak, AWS Cognito, Google Sign-In.'
            },
            {
                id: 'sec-api-gateway',
                title: 'Gateway Security (Public API)',
                pattern: 'Gateway Offloading',
                tactic: 'Проверка токенов на входе.',
                description: 'Сценарий: Публичный API погоды. Мы не хотим, чтобы каждый внутренний микросервис проверял токены и лимиты. Пусть это делает "вышибала" на входе.',
                keyIdea: 'Никаких неавторизованных запросов внутри дома.',
                dataFlow: [
                    '1. Клиент шлет запрос с API Key.',
                    '2. API Gateway проверяет ключ и лимиты (1000 req/day).',
                    '3. Если ОК — проксирует запрос чистому микросервису.',
                ],
                commonMistakes: [
                    '❌ Пропуск "сырых" запросов в обход Gateway.',
                    '❌ Gateway становится "Богом" и содержит бизнес-логику.',
                    '❌ Отсутствие Rate Limiting (один клиент кладет весь API).'
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
                },
                realWorldExample: 'Kong, Apigee, AWS API Gateway.'
            },
            {
                id: 'sec-secrets',
                title: 'Secrets Management (Fintech)',
                pattern: 'Vault',
                tactic: 'Безопасное хранение секретов.',
                description: 'Сценарий: Банковское ядро. Пароль от базы данных клиентов нельзя хранить в Git репозитории или конфиг файле. Он должен браться из защищенного сейфа.',
                keyIdea: 'Код не знает паролей. Код знает, где их взять.',
                dataFlow: [
                    '1. Приложение стартует и стучится в Vault.',
                    '2. Vault проверяет сертификат приложения.',
                    '3. Vault выдает временный (TTL 5 мин) пароль к БД.',
                    '4. Приложение подключается к БД.'
                ],
                commonMistakes: [
                    '❌ Hardcoded credentials в исходном коде (даже в энкодере).',
                    '❌ Передача секретов через ENV variables (видны в диспетчере задач).',
                    '❌ Использование одного "Root пароля" для всех сервисов.'
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
                },
                realWorldExample: 'HashiCorp Vault, AWS Secrets Manager, Azure Key Vault.'
            },
            {
                id: 'sec-waf',
                title: 'WAF (E-commerce Protection)',
                pattern: 'WAF',
                tactic: 'Защита от атак уровня приложений.',
                description: 'Сценарий: Интернет-магазин в Черную Пятницу. Хакеры пытаются внедрить SQL-инъекции в поле "Search", чтобы слить базу клиентов.',
                keyIdea: 'Умный страж, понимающий HTTP.',
                dataFlow: [
                    '1. Бот шлет запрос: GET /search?q=\' OR 1=1; DROP TABLE Users;--',
                    '2. WAF анализирует тело запроса и видит SQL сигнатуру.',
                    '3. WAF блокирует запрос (403 Forbidden).',
                    '4. База данных в безопасности.'
                ],
                commonMistakes: [
                    '❌ Режим "Monitoring Only" (видим атаку, но не блокируем).',
                    '❌ Ложные срабатывания (блокировка легитимных клиентов).',
                    '❌ Отсутствие SSL терминации на WAF (он не видит шифрованный трафик).'
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
                },
                realWorldExample: 'Cloudflare WAF, AWS WAF, Imperva.'
            },
            {
                id: 'sec-vpn',
                title: 'VPN (Remote Work)',
                pattern: 'VPN Gateway',
                tactic: 'Защищенный периметр.',
                description: 'Сценарий: 2020 год, все ушли на удаленку. Админы должны подключаться к внутренним серверам компании из дома безопасно, как будто они в офисе.',
                keyIdea: 'Туннель через враждебный интернет.',
                dataFlow: [
                    '1. Сисадмин запускает OpenVPN клиент на ноутбуке.',
                    '2. Создается зашифрованный туннель до офисного шлюза.',
                    '3. Внутри туннеля сисадмин заходит по SSH на сервер.',
                ],
                commonMistakes: [
                    '❌ Split Tunneling (корпоративный трафик защищен, а YouTube смотрится напрямую — риск заражения).',
                    '❌ Слабые пароли для VPN (нужен MFA!).',
                    '❌ Доступ ко всей сети сразу (нужна микросегментация).'
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
                },
                realWorldExample: 'OpenVPN, WireGuard, Cisco AnyConnect, Tailscale.'
            },
            {
                id: 'sec-audit',
                title: 'Audit Logging (Medical Data)',
                pattern: 'Audit Trail',
                tactic: 'Регистрация действий.',
                description: 'Сценарий: Больница. Врач посмотрел карту болезни знаменитости. Законом (HIPAA/GDPR) требуется знать, КТО, КОГДА и ЗАЧЕМ смотрел эти данные.',
                keyIdea: 'Если это не записано, этого не было.',
                dataFlow: [
                    '1. Врач открывает карту пациента.',
                    '2. Система показывает карту И пишет событие в Audit Log.',
                    '3. "User: Dr. House, Action: READ, Resource: Patient #13, Time: 12:00".',
                ],
                commonMistakes: [
                    '❌ Логи можно удалить или подделать (нужен WORM - Write Once Read Many).',
                    '❌ Логирование самих медицинских данных (утечка в логи).',
                    '❌ Срок хранения меньше требуемого законом (нужно хранить годами).'
                ],
                instructions: [
                    '1. Разместите компонент "Сервис".',
                    '2. Разместите компонент "Audit Log".',
                    '3. Соедините "Сервис" с "Audit Log".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'audit-log', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'audit-log' }]
                },
                realWorldExample: 'CloudTrail, Splunk, Kibana Audit Logs.'
            },
            {
                id: 'sec-ids',
                title: 'IDS (Gov Cloud)',
                pattern: 'Sidecar Monitor',
                tactic: 'Анализ трафика.',
                description: 'Сценарий: Правительственный дата-центр. Мы не знаем новые типы атак, но можем увидеть аномалии. Вдруг сервер начал майнить биткоины или сканировать соседей?',
                keyIdea: 'Слушай сеть, ищи зло.',
                dataFlow: [
                    '1. Весь трафик копируется (Port Mirroring) на сенсор IDS.',
                    '2. IDS видит сигнатуру "WannaCry exploit".',
                    '3. IDS шлет красный алерт дежурному офицеру безопасности.',
                ],
                commonMistakes: [
                    '❌ Огромное количество ложных срабатываний (Alert Fatigue).',
                    '❌ Анализ зашифрованного трафика без расшифровки (бесполезно).',
                    '❌ Отсутствие реакции (система кричит, а все спят).'
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
                },
                realWorldExample: 'Snort, Suricata, AWS GuardDuty.'
            },
            {
                id: 'sec-crypt',
                title: 'Encryption (PCI DSS)',
                pattern: 'Envelope Encryption',
                tactic: 'Шифрование данных.',
                description: 'Сценарий: Платежный шлюз. Хранить номера кредиток (PAN) в открытом виде запрещено стандартом PCI DSS. Если базу украдут — данные должны быть мусором для хакера.',
                keyIdea: 'База данных хранит сейф, а ключ у нас.',
                dataFlow: [
                    '1. Сервис получает номер карты.',
                    '2. Сервис просит ключ у KMS (Key Management Service).',
                    '3. Сервис шифрует карту и пишет шифротекст в БД.',
                ],
                commonMistakes: [
                    '❌ Хранение ключа шифрования в той же БД рядом с данными.',
                    '❌ Самодельные алгоритмы шифрования (всегда используйте AES-GCM).',
                    '❌ Нет ротации ключей (один ключ на 10 лет).'
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
                },
                realWorldExample: 'AWS KMS, HashiCorp Vault Transit Engine, Google Cloud KMS.'
            },
            {
                id: 'sec-ddos',
                title: 'DDoS Protection (Online Gaming)',
                pattern: 'Scrubbing Center',
                tactic: 'Поглощение атак.',
                description: 'Сценарий: Запуск MMO игры. Конкуренты заказали атаку, чтобы "положить" сервера логина в день старта. Нам нужна защита, которая примет удар на себя.',
                keyIdea: 'Масса (емкость сети) побеждает массу (трафик ботнета).',
                dataFlow: [
                    '1. Миллионы ботов шлют мусорный трафик.',
                    '2. Весь трафик заворачивается в Scrubbing Center (огромная труба).',
                    '3. Мусор фильтруется, к нам долетают только чистые пакеты игроков.',
                ],
                commonMistakes: [
                    '❌ Засвет реального IP-адреса сервера (атака пойдет в обход защиты).',
                    '❌ Блокировка легитимных игроков (False Positives).',
                    '❌ Защита только Web (для игр нужна защита UDP протокола).'
                ],
                instructions: [
                    '1. Разместите компонент "Внешняя система" (Botnet).',
                    '2. Разместите компонент "CDN".',
                    '3. Разместите компонент "Балансировщик" (Game Server LB).',
                    '4. Соедините "Внешнюю систему" с "CDN".',
                    '5. Соедините "CDN" с "Балансировщиком".'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cdn', count: 1 }, { type: 'load-balancer', count: 1 }],
                    requiredConnections: [{ from: 'cdn', to: 'load-balancer' }]
                },
                realWorldExample: 'Cloudflare Magic Transit, AWS Shield Advanced, Akamai Prolexic.'
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
                title: 'Logging (Logistics)',
                pattern: 'Log Aggregator',
                tactic: 'Сбор логов в одном месте.',
                description: 'Сценарий: Логистическая компания. Посылка потерялась. Нужно найти все записи о ней по ID трека среди терабайтов логов с 500 серверов сортировочных центров.',
                keyIdea: 'Логи — это поток событий (Stream), а не файлы.',
                dataFlow: [
                    '1. Сортировочный робот пишет "Parcel #123 Scanned" в Stdout.',
                    '2. Агент (Filebeat) ловит строку, добавляет метки (Region=US) и шлет в Elastic.',
                    '3. Оператор вводит ID #123 в Kibana и видит весь путь посылки.',
                ],
                commonMistakes: [
                    '❌ Запись логов в файлы внутри контейнера (контейнер умер = логи пропали).',
                    '❌ Текстовые логи вместо JSON (нельзя автоматически парсить поля).',
                    '❌ Логирование PII (адрес клиента) в открытом виде.'
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
                },
                realWorldExample: 'ELK Stack (Elasticsearch, Logstash, Kibana), Datadog Logs, Splunk.'
            },
            {
                id: 'obs-metric',
                title: 'Metrics (Trading)',
                pattern: 'Pull-Based Monitoring',
                tactic: 'Сбор метрик в реальном времени.',
                description: 'Сценарий: Биржа. Трейдерам важна каждая миллисекунда. Мы должны знать latency ордеров прямо сейчас. Если задержка выше 100мс — мы теряем миллионы.',
                keyIdea: 'Знай, "сколько" и "как быстро", прямо сейчас.',
                dataFlow: [
                    '1. Торговый движок на C++ инкрементирует счетчик `orders_processed` в RAM.',
                    '2. Prometheus каждые 15 сек забирает (Scrape) значения метрик.',
                    '3. Grafana рисует график "Orders Per Second" на стене в офисе.',
                ],
                commonMistakes: [
                    '❌ High Cardinality (метрика с user_id каждого юзера убьет Prometheus).',
                    '❌ Путать метрики (агрегаты) и логи (события).',
                    '❌ Отсутствие алертов на "отсутствие данных".'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Trading Engine).',
                    '2. Добавьте "Базу данных" (Database).',
                    '3. Добавьте "Мониторинг" (Prometheus).',
                    '4. Соедините Мониторинг с Сервисом (Scrape).',
                    '5. Соедините Мониторинг с Базой данных (Scrape).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'monitoring', count: 1 }, { type: 'service', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'monitoring', to: 'service' }, { from: 'monitoring', to: 'database' }]
                },
                realWorldExample: 'Prometheus, Grafana, VictoriaMetrics.'
            },
            {
                id: 'obs-trace',
                title: 'Tracing (E-commerce)',
                pattern: 'Distributed Tracing',
                tactic: 'Полный путь запроса.',
                description: 'Сценарий: Пользователь нажал "Купить", и сайт завис. Где проблема? В Сервисе Корзины? В Платежке? В Базе? Трейсинг покажет всю цепочку.',
                keyIdea: 'Единый Trace ID связывает все логи и вызовы.',
                dataFlow: [
                    '1. Frontend генерирует TraceID=abc и зовет Backend.',
                    '2. Backend зовет Payment Service, передавая TraceID=abc в заголовке.',
                    '3. Payment Service зовет Database.',
                    '4. Jaeger показывает диаграмму Ганта: БД тормозила 5 секунд.',
                ],
                commonMistakes: [
                    '❌ Потеря контекста (забыли передать хедер при асинхронном вызове).',
                    '❌ 100% сэмплирование (хранить трейс каждого чиха дорого, достаточно 1%).',
                    '❌ Неинструментированные базы данных (черные ящики в трейсе).'
                ],
                instructions: [
                    '1. Добавьте 3 компонента "Сервис".',
                    '2. Добавьте компонент "Tracing".',
                    '3. Соедините все три Сервиса с Tracing.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'tracing', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'service', to: 'tracing' }]
                },
                realWorldExample: 'Jaeger, Zipkin, OpenTelemetry, Honeycomb.'
            },
            {
                id: 'obs-alert',
                title: 'Alerting (Power Plant)',
                pattern: 'Alert Manager',
                tactic: 'Уведомление об инцидентах.',
                description: 'Сценарий: Система охлаждения АЭС. Если температура > 100°C в течение 1 минуты — звони дежурному инженеру на пейджер немедленно, даже ночью.',
                keyIdea: 'Буди человека только если он должен что-то сделать.',
                dataFlow: [
                    '1. Prometheus видит: temp=105 уже 60 секунд.',
                    '2. Шлет алерт в AlertManager.',
                    '3. AlertManager группирует (чтобы не спамить) и звонит в PagerDuty.',
                    '4. Инженер просыпается и бежит чинить.'
                ],
                commonMistakes: [
                    '❌ Алерт на каждый чих (инженер привыкает и игнорирует — "Волки!").',
                    '❌ Алерты без Playbook (пришло уведомление, а что делать — непонятно).',
                    '❌ Отсутствие эскалации (если дежурный помер, кто узнает?).'
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
                },
                realWorldExample: 'PagerDuty, OpsGenie, Alertmanager.'
            },
            {
                id: 'obs-health',
                title: 'Healthcheck (Cloud LB)',
                pattern: 'Health Check',
                tactic: 'Самодиагностика.',
                description: 'Сценарий: Облачный балансировщик перед кластером. Он должен знать, на какие сервера слать трафик, а какие зависли или обновляются.',
                keyIdea: 'Простой ответ на сложный вопрос "Ты жив?".',
                dataFlow: [
                    '1. Load Balancer пингует /health endpoint каждые 5 сек.',
                    '2. Сервис А отвечает 200 OK — трафик идет.',
                    '3. Сервис Б отвечает 500 (БД отвалилась) — LB выключает его из ротации.',
                ],
                commonMistakes: [
                    '❌ Локальный ответ "Я жив" при мертвых зависимостях (Zombies).',
                    '❌ Тяжелые проверки в healthcheck (выполнять SQL query каждую секунду - плохая идея).',
                    '❌ Отсутствие таймаутов.'
                ],
                instructions: [
                    '1. Добавьте "Балансировщик" (Load Balancer).',
                    '2. Добавьте "Сервис" (Service).',
                    '3. Соедините Балансировщик с Сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 1 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'K8s Liveness/Readiness Probes, AWS ALB Targeting.'
            },
            {
                id: 'obs-audit',
                title: 'Product Analytics (Mobile App)',
                pattern: 'Activity Stream',
                tactic: 'Анализ поведения.',
                description: 'Сценарий: Маркетологи хотят знать, на какие кнопки жмут пользователи в новом приложении, чтобы понять, удобен ли интерфейс ("Воронка продаж").',
                keyIdea: 'Понимай, как пользователи используют продукт.',
                dataFlow: [
                    '1. Юзер нажимает "Добавить в корзину".',
                    '2. Приложение шлет событие {event: "add_to_cart", item: "socks"} в аналитику.',
                    '3. Данные улетают в Data Warehouse для постройки Dashboard.',
                ],
                commonMistakes: [
                    '❌ Блокировка UI при отправке событий (приложение тормозит).',
                    '❌ Отправка PII (имя, телефон) в систему аналитики (нарушение GDPR).',
                    '❌ Потеря событий при закрытии приложения (нужен local buffer).'
                ],
                instructions: [
                    '1. Добавьте компонент "Frontend".',
                    '2. Добавьте компонент "Сервис аналитики" (Analytics).',
                    '3. Соедините Frontend с Сервисом аналитики.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'analytics-service', count: 1 }, { type: 'frontend', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'analytics-service' }]
                },
                realWorldExample: 'Google Analytics, Amplitude, Mixpanel, Segment.'
            },
            {
                id: 'obs-crash',
                title: 'Crash Reporting (Game)',
                pattern: 'Error Tracking',
                tactic: 'Ловля багов.',
                description: 'Сценарий: Игра падает у 1% пользователей. У них разные телефоны и версии Android. Нужно собрать стектрейсы, чтобы понять, в какой строке кода ошибка.',
                keyIdea: 'Ошибки случаются. Узнай о них первым.',
                dataFlow: [
                    '1. Игрок убивает Босса, игра вылетает (Crash).',
                    '2. При следующем запуске SDK отправляет отчет (Stacktrace + Device Info).',
                    '3. Разработчик видит: `NullPointerException at Boss.cs:42`.',
                ],
                commonMistakes: [
                    '❌ "Swallowing errors" (пустые try-catch блоки скрывают проблему).',
                    '❌ Отсутствие Source Maps (в отчете виден только минифицированный мусор).',
                    '❌ Логирование паролей в отчете об ошибке.'
                ],
                instructions: [
                    '1. Добавьте компонент "Frontend" (Mobile Game).',
                    '2. Добавьте компонент "Error Tracking".',
                    '3. Соедините Frontend с Error Tracking.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'logging', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'logging' }]
                },
                realWorldExample: 'Sentry, Bugsnag, Crashlytics (Firebase).'
            },
            {
                id: 'obs-cost',
                title: 'Cost Monitor (Startup)',
                pattern: 'FinOps Monitor',
                tactic: 'Контроль бюджета.',
                description: 'Сценарий: Стартап забыл выключить мощный GPU сервер на выходные. В понедельник пришел счет на $5000. Нужен мониторинг трат.',
                keyIdea: 'Облако бесконечно, но деньги — нет.',
                dataFlow: [
                    '1. Cloud Provider собирает биллинг каждый час.',
                    '2. Система мониторинга прогнозирует траты на конец месяца.',
                    '3. Если прогноз > Бюджета — шлет Alert CEO в Slack.',
                ],
                commonMistakes: [
                    '❌ Зомби-ресурсы (забытые диски и Load Balancers).',
                    '❌ Over-provisioning (взяли сервер в 10 раз мощнее, чем надо).',
                    '❌ Отсутствие тегов (Costs Tagging) — непонятно, какой отдел потратил деньги.'
                ],
                instructions: [
                    '1. Добавьте "Облако" (System).',
                    '2. Добавьте "Cost Monitoring".',
                    '3. Соедините Облако с Cost Monitoring.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'cost-monitoring', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [{ from: 'system', to: 'cost-monitoring' }]
                },
                realWorldExample: 'AWS Cost Explorer, Kubecost, CloudHealth.'
            },
            {
                id: 'obs-slo',
                title: 'SLO Tracking (SaaS)',
                pattern: 'SLO Manager',
                tactic: 'Инженерия надежности.',
                description: 'Сценарий: SaaS сервис обещает клиентам доступность 99.9%. У нас есть "Бюджет Ошибок" (Error Budget) — 43 минуты простоя в месяц. Если бюджет кончается — мы замораживаем релизы.',
                keyIdea: '100% надежности не существует. Договоритесь о 99.something%.',
                dataFlow: [
                    '1. Мониторинг считает успешные запросы (SLI).',
                    '2. SLO виджет показывает: "Осталось бюджета: 15 минут".',
                    '3. Команда видит: "Бюджет сгорел, чиним техдолг на следующей неделе".',
                ],
                commonMistakes: [
                    '❌ Обещание 100% SLA (технически невозможно и безумно дорого).',
                    '❌ Измерение CPU вместо User Experience (юзеру плевать на CPU, ему важна скорость загрузки).',
                    '❌ Отсутствие последствий (SLO нарушен, а мы продолжаем катить фичи).'
                ],
                instructions: [
                    '1. Добавьте "Мониторинг" (Monitoring).',
                    '2. Добавьте "SLO Manager".',
                    '3. Соедините Мониторинг с SLO Manager.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'slo-manager', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'monitoring', to: 'slo-manager' }]
                },
                realWorldExample: 'Google SRE Book practices, Nobl9, Datadog SLO.'
            },
            {
                id: 'obs-profiling',
                title: 'Profiling (AI Inference)',
                pattern: 'Continuous Profiler',
                tactic: 'Поиск узких мест.',
                description: 'Сценарий: Сервис генерации картинок работает 5 секунд. Почему? CPU? Память? I/O? Профайлер показывает, что 4 секунды мы просто ждем загрузку весов модели с диска.',
                keyIdea: 'Не гадай, где тормозит. Смотри Flame Graph.',
                dataFlow: [
                    '1. Профайлер подключается к процессу Python.',
                    '2. Каждые 10мс смотрит, какая функция выполняется.',
                    '3. Строит график: 80% времени занимает `load_model()`.',
                    '4. Решение: кэшировать модель в RAM.',
                ],
                commonMistakes: [
                    '❌ Преждевременная оптимизация без замеров.',
                    '❌ Профилирование в Debug режиме (он медленнее Release).',
                    '❌ Игнорирование блокировок (Lock Contention) — CPU свободен, а потоки стоят.'
                ],
                instructions: [
                    '1. Добавьте "Сервис" (AI Service).',
                    '2. Добавьте "Мониторинг" (Profiler).',
                    '3. Соедините Сервис с Мониторингом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'monitoring' }]
                },
                realWorldExample: 'Pyroscope, Datadog Continuous Profiler, pprof.'
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
                title: 'Caching (News Portal)',
                pattern: 'Cache',
                tactic: 'Снижение задержек.',
                description: 'Сценарий: Новостной портал. Горячая новость "Выборы 2024" открывается 100,000 раз в секунду. База данных умрет через 100мс. Ответ нужно отдать из RAM.',
                keyIdea: 'Самый быстрый запрос тот, который не дошел до базы.',
                dataFlow: [
                    '1. Читатель запрашивает статью ID=555.',
                    '2. API проверяет Redis. Если есть (Hit) — отдает за 2мс.',
                    '3. Если нет (Miss) — идет в MySQL, кладет в Redis на 5 минут и отдает.',
                ],
                commonMistakes: [
                    '❌ Cache Stampede (все ломанулись в БД, когда кэш протух).',
                    '❌ Кэширование персональных данных (User-Specific) в общем кэше.',
                    '❌ Рассинхрон: в статье поправили опечатку, а в кэше старая версия.',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (News API).',
                    '2. Добавьте "Кэш" (Redis).',
                    '3. Добавьте "Базу данных" (MySQL).',
                    '4. Соедините Сервис с Кэшем.',
                    '5. Соедините Сервис с Базой данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'cache', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'cache' }, { from: 'service', to: 'database' }]
                },
                realWorldExample: 'Redis, Memcached, Varnish.'
            },
            {
                id: 'perf-db-index',
                title: 'Search Index (E-commerce)',
                pattern: 'Search Engine',
                tactic: 'Быстрый поиск.',
                description: 'Сценарий: Магазин электроники. Пользователь ищет "красный ноутбук дешевле 50к". SQL `LIKE` убьет базу. Нужен обратный индекс.',
                keyIdea: 'База данных для хранения, Поисковик — для поиска.',
                dataFlow: [
                    '1. Админ добавляет товар в Postgres.',
                    '2. CDC-процесс за 100мс реплицирует товар в Elastic.',
                    '3. Клиент вводит "ноутбук" — API идет только в Elastic.',
                ],
                commonMistakes: [
                    '❌ Поиск через `LIKE %query%` в основной БД (Full scan убийца).',
                    '❌ Синхронная запись в Elastic внутри SQL транзакции (тормозит создание товара).',
                    '❌ Отказ от переиндексации (данные разъехались).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Store API).',
                    '2. Добавьте "Базу данных" (Postgres).',
                    '3. Добавьте "Поисковый движок" (Elasticsearch).',
                    '4. Соедините Сервис с Поисковым движком.',
                    '5. Соедините Сервис с Базой данных (для записи).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'search-engine', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'search-engine' }, { from: 'service', to: 'database' }]
                },
                realWorldExample: 'Elasticsearch, Solr, Meilisearch, Algolia.'
            },
            {
                id: 'perf-compression',
                title: 'Compression (Mobile Feed)',
                pattern: 'CDN / Proxy',
                tactic: 'Уменьшение объема данных.',
                description: 'Сценарий: Лента соцсети в метро (плохой интернет). JSON-ответы весят 2МБ, картинки — 5МБ. Нужно сжать всё, чтобы лента грузилась за 1с, а не 10с.',
                keyIdea: 'Меньше байт летит по сети — быстрее ответ.',
                dataFlow: [
                    '1. App просит ленту. Заголовок `Accept-Encoding: gzip, br`.',
                    '2. Nginx на лету жмет JSON (текст сжимается в 10 раз).',
                    '3. Картинки отдаются в формате WebP/AVIF через CDN.',
                ],
                commonMistakes: [
                    '❌ Сжатие уже сжатого (ZIP файлов) — зря греем CPU.',
                    '❌ Отсутствие кэширования сжатых ответов (жмем одно и то же).',
                    '❌ Использование Gzip там, где нужен Brotli (текст) или AVIF (фото).',
                ],
                instructions: [
                    '1. Добавьте "Frontend" (App).',
                    '2. Добавьте "CDN" (Compression Proxy).',
                    '3. Соедините Frontend с CDN.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'cdn', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'cdn' }]
                },
                realWorldExample: 'Nginx Gzip, Cloudflare Brotli, WebP images.'
            },
            {
                id: 'perf-pool',
                title: 'Connection Pooling (Java Helper)',
                pattern: 'Proxy / Pooler',
                tactic: 'Переиспользование соединений.',
                description: 'Сценарий: Legacy Enterprise Java App. Создание соединения к Oracle занимает 0.5с (Handshake, SSL). Если открывать его на каждый запрос — система встанет.',
                keyIdea: 'Handshake — это дорого. Держи трубу открытой.',
                dataFlow: [
                    '1. App стартует и открывает 10 соединений к БД (Pool).',
                    '2. Пришел запрос. Поток берет свободное соединение, делает SELECT.',
                    '3. Возвращает соединение в пул, не закрывая TCP сокет.',
                ],
                commonMistakes: [
                    '❌ `new Connection()` на каждый запрос (Time Wait socket exhaustion).',
                    '❌ Размер пула > количества ядер CPU БД (потоки БД будут драться за процессор).',
                    '❌ Утечка соединений (забыл вернуть в пул — пул исчерпан).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Legacy App).',
                    '2. Добавьте "Прокси" (Connection Pool / PgBouncer).',
                    '3. Добавьте "Базу данных" (Oracle).',
                    '4. Соедините Сервис с Прокси.',
                    '5. Соедините Прокси с Базой данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'proxy', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'proxy' }, { from: 'proxy', to: 'database' }]
                },
                realWorldExample: 'HikariCP, PgBouncer, Odyssey.'
            },
            {
                id: 'perf-async',
                title: 'Async Jobs (PDF Reports)',
                pattern: 'Background Job',
                tactic: 'Вынос тяжелых задач.',
                description: 'Сценарий: Пользователь нажал "Скачать выписку за 5 лет". Генерация PDF занимает 2 минуты. HTTP запрос отвалится по таймауту через 30с. Делаем асинхронно.',
                keyIdea: 'Отпусти пользователя быстро, доделай работу потом.',
                dataFlow: [
                    '1. API принимает заказ, кладет задачу в RabbitMQ и отвечает "ОК, жди".',
                    '2. Worker (фоновый процесс) берет задачу, генерит PDF.',
                    '3. Отправляет готовый файл на Email пользователя.',
                ],
                commonMistakes: [
                    '❌ Генерация тяжелого отчета прямо в контроллере API.',
                    '❌ Отсутствие Retry (если PDF упал - попробуй еще раз).',
                    '❌ Нет Dead Letter Queue (битая задача вечно крутится в обработке).',
                ],
                instructions: [
                    '1. Добавьте "API Gateway".',
                    '2. Добавьте "Очередь" (RabbitMQ).',
                    '3. Добавьте "Пакетный обработчик" (Worker).',
                    '4. Соедините API Gateway с Очередью.',
                    '5. Соедините Очередь с Обработчиком.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'api-gateway', count: 1 }, { type: 'queue', count: 1 }, { type: 'batch-processor', count: 1 }],
                    requiredConnections: [{ from: 'api-gateway', to: 'queue' }, { from: 'queue', to: 'batch-processor' }]
                },
                realWorldExample: 'RabbitMQ, Celery, Sidekiq, AWS SQS.'
            },
            {
                id: 'perf-http2',
                title: 'High-Perf Protocol (gRPC)',
                pattern: 'gRPC / HTTP/2',
                tactic: 'Бинарные протоколы.',
                description: 'Сценарий: Микросервисы общаются друг с другом 10,000 раз в секунду. JSON парсинг сжирает 50% CPU. Переходим на бинарный gRPC — экономим железо в 2 раза.',
                keyIdea: 'JSON удобен людям, Protobuf удобен машинам.',
                dataFlow: [
                    '1. Service A сериализует объект в бинарный Protobuf (очень быстро).',
                    '2. Шлет по HTTP/2 (одно соединение, много стримов).',
                    '3. Service B десериализует по заранее известной схеме.',
                ],
                commonMistakes: [
                    '❌ Использование XML в 2024 году (тяжело и медленно).',
                    '❌ gRPC "наружу" в браузер (нужен gRPC Web прокси).',
                    '❌ Потеря обратной совместимости в .proto файлах.',
                ],
                instructions: [
                    '1. Добавьте первый "Сервис" (Client).',
                    '2. Добавьте второй "Сервис" (Server).',
                    '3. Соедините их между собой.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'service' }]
                },
                realWorldExample: 'gRPC, Apache Thrift, Avro.'
            },
            {
                id: 'perf-read-replica',
                title: 'Read Replicas (Social Feed)',
                pattern: 'CQRS Lite',
                tactic: 'Масштабирование чтения.',
                description: 'Сценарий: Соцсеть. Пост пишут 1 раз, а читают миллион раз. Master БД захлебывается. Создаем 5 Read-реплик и отправляем читателей туда.',
                keyIdea: 'Запись одна, читателей много.',
                dataFlow: [
                    '1. Автор пишет пост -> Master DB.',
                    '2. Асинхронно пост летит в Replicas (lag < 1s).',
                    '3. Читатели запрашивают ленту -> Load Balancer раскидывает по Replicas.',
                ],
                commonMistakes: [
                    '❌ Читать свои данные из реплики (юзер запостил, обновил страницу — поста нет из-за лага).',
                    '❌ Запись в Реплику (она Read-Only, упадет ошибка).',
                    '❌ Все реплики в одной зоне доступности (упадет зона - упадет чтение).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Feed API).',
                    '2. Добавьте "Базу данных" (Master).',
                    '3. Добавьте "Базу данных" (Replica 1).',
                    '4. Добавьте "Базу данных" (Replica 2).',
                    '5. Соедините Сервис со всеми Базами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'database', count: 3 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                },
                realWorldExample: 'PostgreSQL Streaming Replication, AWS Aurora Read Replicas.'
            },
            {
                id: 'perf-cdn',
                title: 'CDN (Game Updates)',
                pattern: 'CDN',
                tactic: 'Разгрузка сервера.',
                description: 'Сценарий: Вышел патч к игре на 50Гб. Миллион игроков качают его одновременно. Наш сервер сгорит. Раздаем через глобальную CDN.',
                keyIdea: 'Speed of Light is slow. Сократи дистанцию.',
                dataFlow: [
                    '1. Игрок из Японии качает update.bin.',
                    '2. Запрос попадает на Edge сервер в Токио.',
                    '3. Файл отдается с диска Edge сервера, нагрузка на наш Origin = 0.',
                ],
                commonMistakes: [
                    '❌ Отсутствие Cache-Control заголовков (CDN не будет кэшировать).',
                    '❌ Кэширование приватных данных (токены/аккаунты) — утечка данных.',
                    '❌ Cache invalidation (патч обновили, а игроки качают старый).',
                ],
                instructions: [
                    '1. Добавьте "Клиент" (Gamer).',
                    '2. Добавьте "CDN".',
                    '3. Соедините Клиент с CDN.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'client', count: 1 }, { type: 'cdn', count: 1 }],
                    requiredConnections: [{ from: 'client', to: 'cdn' }]
                },
                realWorldExample: 'Akamai, Cloudflare, AWS CloudFront, Fastly.'
            },
            {
                id: 'perf-scaling',
                title: 'Auto-Scaling (Ticket Sale)',
                pattern: 'Horizontal Scaling',
                tactic: 'Добавление ресурсов.',
                description: 'Сценарий: Старт продаж билетов на концерт. Трафик вырастает в 100 раз за 1 минуту. Система сама запускает 50 новых серверов.',
                keyIdea: 'Плати только за то, что используешь.',
                dataFlow: [
                    '1. CloudWatch видит: CPU Load > 70%.',
                    '2. Auto-Scaling Group командует: +5 серверов.',
                    '3. Load Balancer регистрирует новые ноды и шлет людей туда.',
                ],
                commonMistakes: [
                    '❌ Медленный старт приложения (билеты кончатся раньше, чем Java запустится).',
                    '❌ БД не резиновая (апп масштабируется, а база падает от коннектов).',
                    '❌ Flapping (запуск-остановка) при пороговых значениях (69% -> 71%).',
                ],
                instructions: [
                    '1. Добавьте "Балансировщик" (Load Balancer).',
                    '2. Добавьте 3 компонента "Сервис".',
                    '3. Соедините Балансировщик со всеми Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'AWS Auto Scaling, K8s HPA.'
            },
            {
                id: 'perf-nosql',
                title: 'Polyglot Persistence (Travel App)',
                pattern: 'NoSQL Optimized',
                tactic: 'Специализированные БД.',
                description: 'Сценарий: Приложение для путешествий. Билеты (транзакции) храним надежно в SQL. Маршруты (графы) — в Neo4j. Сессии — в Redis. Логи — в Elastic.',
                keyIdea: 'Выбери правильный инструмент для работы.',
                dataFlow: [
                    '1. Покупка билета -> PostgreSQL (ACID).',
                    '2. Поиск "как добраться из А в Б" -> Neo4j (Graph).',
                    '3. История просмотров -> Cassandra (Write heavy).',
                ],
                commonMistakes: [
                    '❌ Использование MongoDB для финансовых транзакций (раньше были проблемы с ACID).',
                    '❌ "Зоопарк" технологий (нужна команда экспертов для поддержки 5 разных БД).',
                    '❌ Сложность бэкапов и согласованности.',
                ],
                instructions: [
                    '1. Добавьте "Сервис".',
                    '2. Добавьте 2 "Базы данных" (SQL и NoSQL).',
                    '3. Соедините Сервис с обеими Базами данных.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'database', count: 2 }],
                    requiredConnections: [{ from: 'service', to: 'database' }]
                },
                realWorldExample: 'Uber (Schemaless + Postgres + Redis), Netflix.'
            },
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
                title: 'Layered Arch (Enterprise ERP)',
                pattern: 'Layers',
                tactic: 'Разделение ответственности.',
                description: 'Сценарий: Корпоративная ERP система. UI меняется часто, Бизнес-правила (налоги) — реже, База данных — почти никогда. Разделяем слои, чтобы изменения в UI не ломали расчет налогов.',
                keyIdea: 'Изменения в UI не должны ломать БД, и наоборот.',
                dataFlow: [
                    '1. UI (React) вызывает API Controller.',
                    '2. Controller вызывает Service (Бизнес-логика).',
                    '3. Service вызывает Repository (SQL запросы).',
                ],
                commonMistakes: [
                    '❌ Протечка абстракций (SQL сущности используются в UI).',
                    '❌ Обход слоев (Controller лезет прямо в БД для скорости).',
                    '❌ "God Class" сервисы на 5000 строк кода.',
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
                },
                realWorldExample: 'Java Spring MVC, .NET Clean Architecture.'
            },
            {
                id: 'mod-custom-node',
                title: 'Plugins (IDE)',
                pattern: 'Microkernel',
                tactic: 'Расширяемость.',
                description: 'Сценарий: VS Code. Само ядро (редактор текста) весит мало. Поддержка Python, Go, Git реализована через плагины. Ядро не знает про Python.',
                keyIdea: 'Добавляй фичи, не меняя ядро.',
                dataFlow: [
                    '1. Ядро запускается и сканирует папку /plugins.',
                    '2. Находит Plugin A (Python) и регистрирует его.',
                    '3. При открытии .py файла Ядро отдает управление плагину.',
                ],
                commonMistakes: [
                    '❌ Тесная связность (плагин лезет в кишки ядра).',
                    '❌ Отсутствие изоляции (кривой плагин крашит весь редактор).',
                    '❌ Сложный API для авторов плагинов.',
                ],
                instructions: [
                    '1. Добавьте "Систему" (Core).',
                    '2. Добавьте 2 компонента "Сервис" (Plugins).',
                    '3. Соедините Систему с Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'system', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'system', to: 'service' }]
                },
                realWorldExample: 'VS Code, Eclipse, WordPress, Chrome Extensions.'
            },
            {
                id: 'mod-bff',
                title: 'BFF (Streaming Platform)',
                pattern: 'BFF',
                tactic: 'Адаптация API.',
                description: 'Сценарий: Видеосервис. На SmartTV нужен XML и мало картинок (слабый проц). На iPhone нужен JSON и HD обложки. Делаем разные бэкенды для каждого фронта.',
                keyIdea: 'Каждому клиенту — свой идеальный API.',
                dataFlow: [
                    '1. TV App вызывает TV-BFF (дай список фильмов XML).',
                    '2. iPhone App вызывает Mobile-BFF (дай список фильмов JSON).',
                    '3. Оба BFF идут в единый Core Service, который просто хранит данные.',
                ],
                commonMistakes: [
                    '❌ Дублирование бизнес-логики в BFF (они должны только форматировать).',
                    '❌ BFF превращается в "супер-прокси", который ничего не делает.',
                    '❌ Зоопарк BFF (слишком много вариантов на каждый чих).',
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
                },
                realWorldExample: 'Netflix (API Adapter per device), Soundcloud.'
            },
            {
                id: 'mod-adapter',
                title: 'Adapter (Legacy Banking)',
                pattern: 'Wrapper',
                tactic: 'Совместимость интерфейсов.',
                description: 'Сценарий: Новый модный React Frontend должен работать со старой банковской системой на COBOL (1980 год). Адаптер превращает REST JSON запросы в вызовы мейнфрейма.',
                keyIdea: 'Делает несовместимое совместимым.',
                dataFlow: [
                    '1. Frontend шлет `POST /transfer` (JSON).',
                    '2. Адаптер парсит JSON и формирует EBCDIC файл.',
                    '3. Адаптер отправляет файл в Мейнфрейм по FTP.',
                ],
                commonMistakes: [
                    '❌ Размытие границ (бизнес-логика переползает в адаптер).',
                    '❌ Адаптер падает от ошибок легаси системы (нужен Circuit Breaker).',
                    '❌ Попытка переписать все легаси сразу вместо адаптации.',
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
                },
                realWorldExample: 'JCA Adapters, SOAP to REST Gateways.'
            },
            {
                id: 'mod-facade',
                title: 'Facade (Smart Home)',
                pattern: 'Facade',
                tactic: 'Скрытие сложности.',
                description: 'Сценарий: Умный дом. Чтобы включить режим "Кино", нужно: опустить шторы, погасить свет, включить ТВ, включить колонки. Фасад делает это одной командой.',
                keyIdea: 'Сделай сложное простым для потребителя.',
                dataFlow: [
                    '1. Пользователь нажимает "Movie Mode".',
                    '2. Фасад шлет команды: Light.off(), Blinds.close(), TV.on().',
                    '3. Пользователь счастлив, не зная деталей API лампочек.',
                ],
                commonMistakes: [
                    '❌ Фасад становится "Богом", который знает всё про всех.',
                    '❌ Жесткая привязка (добавление новой лампочки требует переписывания Фасада).',
                    '❌ Клиенты обходят фасад (теряется смысл упрощения).',
                ],
                instructions: [
                    '1. Добавьте "Клиент".',
                    '2. Добавьте "Фасад".',
                    '3. Добавьте 3 компонента "Подсистема" (Devices).',
                    '4. Соедините Клиента с Фасадом.',
                    '5. Соедините Фасад с каждым Сервисом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'client', count: 1 }, { type: 'facade', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'client', to: 'facade' }, { from: 'facade', to: 'service' }]
                },
                realWorldExample: 'GraphQL Aggregation, API Gateways (implements Facade pattern).'
            },
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
                title: 'CI/CD (Bank App)',
                pattern: 'Delivery Pipeline',
                tactic: 'Автоматизация поставки.',
                description: 'Сценарий: Банковское приложение. Нельзя просто так залить код в прод. Нужны автотесты, SAST сканеры безопасности, апрув от менеджера и деплой в защищенный контур.',
                keyIdea: 'От коммита до прода — без рук (вернее, без ручных ошибок).',
                dataFlow: [
                    '1. Разработчик пушит код в Master.',
                    '2. CI запускает Unit тесты и SonarQube (Quality Gate).',
                    '3. CD деплоит в Prod только если Quality Gate = Pass.',
                ],
                commonMistakes: [
                    '❌ Ручной деплой через FTP или `scp` (привет, 2005 год).',
                    '❌ "У меня локально работает" (нет идентичности сред).',
                    '❌ Хранение секретов (ключей API) прямо в коде, который виден в CI логах.',
                ],
                instructions: [
                    '1. Добавьте "Разработчика" (Developer).',
                    '2. Добавьте "VCS" (Gitlab/GitHub).',
                    '3. Добавьте "CI/CD пайплайн" (Jenkins).',
                    '4. Добавьте "Систему" (Production).',
                    '5. Соедините по цепочке: Dev -> VCS -> Pipeline -> System.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'developer', count: 1 }, { type: 'vcs', count: 1 }, { type: 'ci-cd-pipeline', count: 1 }, { type: 'system', count: 1 }],
                    requiredConnections: [
                        { from: 'developer', to: 'vcs' },
                        { from: 'vcs', to: 'ci-cd-pipeline' },
                        { from: 'ci-cd-pipeline', to: 'system' }
                    ]
                },
                realWorldExample: 'GitLab CI, GitHub Actions, Jenkins, CircleCI.'
            },
            {
                id: 'deploy-bluegreen',
                title: 'Blue-Green (Payment)',
                pattern: 'Blue-Green',
                tactic: 'Нулевой даунтайм.',
                description: 'Сценарий: Платежный шлюз. 1 секунда простоя = потеря $1000. Обновляемся так: поднимаем новую версию рядом, проверяем, переключаем рубильник. Старую гасим только если все ОК.',
                keyIdea: 'Мгновенный свитч и легкий откат.',
                dataFlow: [
                    '1. Load Balancer шлет 100% трафика на Blue (Active).',
                    '2. DevOps деплоит Green (Passive) и гоняет тесты.',
                    '3. Одной командой LB переключается на Green.',
                ],
                commonMistakes: [
                    '❌ База данных меняется несовместимым образом (Blue ломается при накатке миграций для Green).',
                    '❌ Забыли про Cron-джобы (они могут запуститься дважды).',
                    '❌ Экономия (Green слабее Blue, и падает под нагрузкой).',
                ],
                instructions: [
                    '1. Добавьте "Балансировщик".',
                    '2. Добавьте "Сервис" (Blue v1).',
                    '3. Добавьте "Сервис" (Green v2).',
                    '4. Соедините Балансировщик с обоими Сервисами.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'load-balancer', count: 1 }, { type: 'service', count: 2 }],
                    requiredConnections: [{ from: 'load-balancer', to: 'service' }]
                },
                realWorldExample: 'AWS CodeDeploy, Kubernetes Services switch.'
            },
            {
                id: 'deploy-canary',
                title: 'Canary (Social Feature)',
                pattern: 'Canary',
                tactic: 'Постепенная раскатка.',
                description: 'Сценарий: Новый дизайн ленты новостей. Вдруг пользователям не зайдет? Включаем только для 5% сотрудников офиса. Если нет багов — для 10%, потом 50%, потом 100%.',
                keyIdea: 'Тестируй на живых (но по чуть-чуть).',
                dataFlow: [
                    '1. 99% юзеров видят Stable версию.',
                    '2. 1% (Canary) видят новую версию.',
                    '3. Если Error Rate у канарейки растет — автоматический откат.',
                ],
                commonMistakes: [
                    '❌ Выбор канарейки (только сотрудники с мощными Mac, а у реальных юзеров тормозит).',
                    '❌ Sticky Sessions (юзер прыгает между старой и новой версией).',
                    '❌ Ручной мониторинг (человек спит, а канарейка лежит).',
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
                },
                realWorldExample: 'Spinnaker, Argo Rollouts, Istio.'
            },
            {
                id: 'deploy-flags',
                title: 'Feature Flags (Dark Mode)',
                pattern: 'Feature Toggles',
                tactic: 'Разделение деплоя и релиза.',
                description: 'Сценарий: Релиз "Темной темы" назначен на 12:00. Код уже залит неделю назад, но скрыт за `if (feature.enabled)`. В 12:00 маркетолог жмет кнопку в админке.',
                keyIdea: 'Код уже там, но он спит.',
                dataFlow: [
                    '1. Frontend запрашивает: `GET /flags`.',
                    '2. Flag Service отвечает: `{ dark_mode: true }`.',
                    '3. Frontend перекрашивается в черный.',
                ],
                commonMistakes: [
                    '❌ Растянутый `if/else` по всему коду (сложно поддерживать).',
                    '❌ Вечные флаги (фича в проде 2 года, а флаг все еще есть).',
                    '❌ Флаг в конфиг-файле (требует редеплоя для включения).',
                ],
                instructions: [
                    '1. Добавьте "Сервис".',
                    '2. Добавьте "Feature Flag Service".',
                    '3. Соедините Сервис с Feature Flag Service.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'feature-flag', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'feature-flag' }]
                },
                realWorldExample: 'LaunchDarkly, Unleash, Split.io.'
            },
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
                title: 'Saga (Travel Booking)',
                pattern: 'Saga',
                tactic: 'Компенсирующие транзакции.',
                description: 'Сценарий: Бронирование отпуска. Самолет забронировали, Отель забронировали, а Машина недоступна. Нужно отмениь Отель и Самолет, чтобы вернуть деньги.',
                keyIdea: 'Нет глобального rollback, есть "извини, отменяем".',
                dataFlow: [
                    '1. Оркест: "Авиакомпания, бронируй!" -> OK.',
                    '2. Оркест: "Отель, бронируй!" -> OK.',
                    '3. Оркест: "Машина, бронируй!" -> FAIL.',
                    '4. Оркест: "Отель, отмена!", "Авиа, отмена!" (Compensate).',
                ],
                commonMistakes: [
                    '❌ Операции не идемпотентны (повторная отмена снимает деньги дважды).',
                    '❌ Синхронные ожидания (Сага может идти часами).',
                    '❌ Потеря состояния Саги (где мы остановились?).',
                ],
                instructions: [
                    '1. Добавьте "Saga Orchestrator" (Booking).',
                    '2. Добавьте 3 компонента "Сервис" (Flight, Hotel, Car).',
                    '3. Соедините Оркестратор с каждым из Сервисов (двусторонне).',
                ],
                validationParams: {
                    requiredComponents: [{ type: 'saga', count: 1 }, { type: 'service', count: 3 }],
                    requiredConnections: [{ from: 'saga', to: 'service' }]
                },
                realWorldExample: 'Temporal.io, Camunda, MassTransit.'
            },
            {
                id: 'cons-cdc',
                title: 'CDC (Search Indexer)',
                pattern: 'CDC / Outbox',
                tactic: 'Надежная публикация событий.',
                description: 'Сценарий: Данные в SQL базе обновляются часто. Нужно обновлять поисковый индекс в Elastic. Писать код в сервисе (Dual Write) — ненадежно. Читаем прямо лог БД (Write Ahead Log).',
                keyIdea: 'База данных — единственный источник правды.',
                dataFlow: [
                    '1. App делает `INSERT INTO Users`.',
                    '2. Debezium читает бинарный лог Postgres.',
                    '3. Генерирует событие в Kafka: `{op: "c", after: {id: 1, name: "Ion"}}`.',
                    '4. Indexer читает Kafka и пишет в Elastic.',
                ],
                commonMistakes: [
                    '❌ Локальные транзакции (сначала записал в Кафку, потом база упала).',
                    '❌ Стыковка схем (поменяли колонку в БД — Debezium сломался).',
                    '❌ Безопасность (в лог попали пароли).',
                ],
                instructions: [
                    '1. Добавьте "Базу данных".',
                    '2. Добавьте компонент "CDC" (Debezium).',
                    '3. Добавьте "Очередь" (Kafka).',
                    '4. Соедините БД с CDC.',
                    '5. Соедините CDC с Очередью.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'database', count: 1 }, { type: 'cdc', count: 1 }, { type: 'queue', count: 1 }],
                    requiredConnections: [{ from: 'database', to: 'cdc' }, { from: 'cdc', to: 'queue' }]
                },
                realWorldExample: 'Debezium, Kafka Connect, AWS DMS.'
            },
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
                title: 'ESB (Legacy Telecom)',
                pattern: 'ESB',
                tactic: 'Оркестрация и трансформация.',
                description: 'Сценарий: Телеком оператор. Биллинг (XML) должен говорить с CRM (SOAP) и Активацией SIM (Telnet). Прямые связи — это хаос. Ставим Шину.',
                keyIdea: 'Умная труба, глупые терминалы (SOA era).',
                dataFlow: [
                    '1. CRM шлет команду "Создай абонента" (SOAP).',
                    '2. ESB конвертит SOAP -> proprietary binary format.',
                    '3. ESB вызывает старый коммутатор ZTE.',
                ],
                commonMistakes: [
                    '❌ Вся бизнес-логика уехала в ESB (теперь это монолит-распределитель).',
                    '❌ Единая точка отказа (упала шина — встал весь завод).',
                    '❌ Трудно дебажить и версионировать.',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (CRM).',
                    '2. Добавьте "ESB" (BizTalk/Mule).',
                    '3. Добавьте "Сервис" (Billing).',
                    '4. Соедините Source с ESB.',
                    '5. Соедините ESB с Target.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'esb', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'esb' }, { from: 'esb', to: 'service' }]
                },
                realWorldExample: 'MuleSoft, Tibco, BizTalk, WSO2.'
            },
            {
                id: 'interop-acl',
                title: 'ACL (Corp Acquisition)',
                pattern: 'ACL',
                tactic: 'Изоляция домена.',
                description: 'Сценарий: Большая Корпорация купила Стартап. У них разные форматы User ID. Чтобы не переписывать код Стартапа, ставим ACL, который мапит ID-шники на лету.',
                keyIdea: 'Не позволяй чужому хаосу проникнуть в твой порядок.',
                dataFlow: [
                    '1. Corp System запрашивает юзера GUID-123.',
                    '2. ACL переводит GUID-123 -> INT-555.',
                    '3. Startup System отдает данные по INT-555.',
                ],
                commonMistakes: [
                    '❌ Просачивание "грязной" модели в чистую (Leakage).',
                    '❌ Отсутствие кэширования в ACL (постоянная трансляция нагружает CPU).',
                    '❌ Попытка сделать ACL двусторонним "магическим" синхронизатором.',
                ],
                instructions: [
                    '1. Добавьте "Бизнес-домен" (New Corp).',
                    '2. Добавьте "Facade Service" (ACL).',
                    '3. Добавьте "Внешнюю систему" (Bought Startup).',
                    '4. Соедините Бизнес-домен с ACL.',
                    '5. Соедините ACL с Внешней системой.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'business-domain', count: 1 }, { type: 'facade', count: 1 }, { type: 'external-system', count: 1 }],
                    requiredConnections: [{ from: 'business-domain', to: 'facade' }, { from: 'facade', to: 'external-system' }]
                },
                realWorldExample: 'Domain-Driven Design (Eric Evans) patterns.'
            },
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
                title: 'Contract Tests (Public API)',
                pattern: 'Contract Testing',
                tactic: 'Верификация контрактов.',
                description: 'Сценарий: Вы разрабатываете Public Weather API. Тысячи клиентов используют его. Если вы измените поле `temp` на `temperature` без предупреждения — все сломаются. Контракты (Pact) это предотвратят.',
                keyIdea: 'Не ламай клієнтів зворотною несумісністю. Контракт належить Consumer.',
                dataFlow: [
                    '1. Клиент (Consumer) пишет тест: "Ожидаю поле temp: number".',
                    '2. Этот "контракт" загружается на Pact Broker.',
                    '3. Ваш CI (Provider) скачивает контракт и проверяет, что API ему соответствует.',
                ],
                commonMistakes: [
                    '❌ Тестирование реализации вместо API.',
                    '❌ Игнорирование проверки контрактов перед деплоем.',
                    '❌ Использование E2E тестов там, где достаточно контрактных (медленно и хрупко).',
                ],
                instructions: [
                    '1. Добавьте "Сервис" (Consumer).',
                    '2. Добавьте "Contract Testing" (Pact Broker).',
                    '3. Добавьте "Сервис" (Provider).',
                    '4. Соедините Consumer с Broker.',
                    '5. Соедините Broker с Provider.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 2 }, { type: 'contract-testing', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'contract-testing' }, { from: 'contract-testing', to: 'service' }]
                },
                realWorldExample: 'Pact, Spring Cloud Contract.'
            },
            {
                id: 'test-chaos',
                title: 'Chaos Monkey (Netflix)',
                pattern: 'Chaos Monkey',
                tactic: 'Внедрение сбоев.',
                description: 'Сценарий: Netflix специально выключает сервера в рабочее время, чтобы убедиться, что система самовосстанавливается, а пользователи не замечают сбоя.',
                keyIdea: 'Ломай систему сам, пока это не сделали хакеры или природа.',
                dataFlow: [
                    '1. Chaos Agent случайно убивает процесс "Service A".',
                    '2. Мониторинг фиксирует скачок ошибок?',
                    '3. Система должна автоматически перенаправить трафик на живые ноды.',
                ],
                commonMistakes: [
                    '❌ Запуск хаоса в пятницу вечером (плохая идея).',
                    '❌ Тестирование без бэкапов.',
                    '❌ Отсутствие способа мгновенно остановить эксперимент при реальных проблемах.',
                ],
                instructions: [
                    '1. Добавьте "Chaos Testing" (Simian Army).',
                    '2. Добавьте "Систему" (Target).',
                    '3. Добавьте "Мониторинг".',
                    '4. Соедините Chaos Testing с Системой.',
                    '5. Соедините Систему с Мониторингом.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'chaos-testing', count: 1 }, { type: 'system', count: 1 }, { type: 'monitoring', count: 1 }],
                    requiredConnections: [{ from: 'chaos-testing', to: 'system' }]
                },
                realWorldExample: 'Netflix Simian Army, Gremlin, Chaos Mesh.'
            },
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
                title: 'Rich Domain Model (E-shop)',
                pattern: 'DDD (Domain-Driven Design)',
                tactic: 'Инкапсуляция бизнес-правил.',
                description: 'Сценарий: Оформление заказа. Нельзя добавить товар, если его нет на складе. Нельзя применить просроченный купон. Эта логика должна быть внутри класса Order, а не размазана по сервисам.',
                keyIdea: 'Объект сам отвечает за свое состояние.',
                dataFlow: [
                    '1. API вызывает метод сущности `Order.addItem(item)`.',
                    '2. Сущность Order внутри себя проверяет `item.stock > 0`.',
                    '3. Если ОК — уменьшает сток и генерирует событие `ItemAdded`.',
                ],
                commonMistakes: [
                    '❌ Anemic Model (сущности — просто мешки геттеров/сеттеров/DTO).',
                    '❌ Размазывание бизнес-правил по Service Layer (Transaction Script).',
                    '❌ Возможность создать Order в невалидном состоянии (без id или user).',
                ],
                instructions: [
                    '1. Добавьте "API слой" (Controller).',
                    '2. Добавьте "Доменную Модель" (Rich Order Entity).',
                    '3. Добавьте "Базу данных".',
                    '4. Соедините API с Моделью (вызов метода).',
                    '5. Соедините Модель с БД (Persistence).'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'controller', count: 1 }, { type: 'domain-model', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'controller', to: 'domain-model' }, { from: 'domain-model', to: 'database' }]
                },
                realWorldExample: 'JPA/Hibernate @Entity with methods, Aggregates in DDD.'
            },
            {
                id: 'func-fsm',
                title: 'FSM (Delivery Drone)',
                pattern: 'State Machine',
                tactic: 'Формализация переходов.',
                description: 'Сценарий: Дрон-доставщик. Он не может перейти из состояния "Charging" сразу в "Delivering", минуя "Ready". Машина состояний жестко контролирует этот граф.',
                keyIdea: 'Запрещенные переходы невозможны физически.',
                dataFlow: [
                    '1. Диспетчер шлет команду "Fly".',
                    '2. FSM проверяет: CurrentState == Ready? Battery > 80%?',
                    '3. Если да — NewState = Flying. Иначе — Error.',
                ],
                commonMistakes: [
                    '❌ Изменение статусов напрямую в БД (`UPDATE orders SET status="shipped"`).',
                    '❌ Hardcoded `if/else` логика, разбросанная по коду.',
                    '❌ Отсутствие лога переходов (Audit Trail) — кто перевел дрон в "Crash"?',
                ],
                instructions: [
                    '1. Добавьте "Control Center".',
                    '2. Добавьте "State Machine" (Logic).',
                    '3. Добавьте "Hardware" (Drone).',
                    '4. Соедините Control Center с State Machine.',
                    '5. Соедините State Machine с Hardware.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'service', count: 1 }, { type: 'state-machine', count: 1 }, { type: 'database', count: 1 }],
                    requiredConnections: [{ from: 'service', to: 'state-machine' }, { from: 'state-machine', to: 'database' }]
                },
                realWorldExample: 'Spring Statemachine, XState, Tinder (Game Loop).'
            },
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
                title: 'Command (Text Editor)',
                pattern: 'Command',
                tactic: 'Отмена действий.',
                description: 'Сценарий: Google Docs. Вы случайно удалили абзац. Нажимаете Ctrl+Z. Система должна отменить действие. Для этого "Удаление" должно быть объектом, а не просто функцией.',
                keyIdea: 'Каждое действие можно "проиграть" назад.',
                dataFlow: [
                    '1. User нажал "Delete". Создался объект `DeleteCommand(text, pos)`.',
                    '2. Команда выполнилась удалила текст.',
                    '3. Команда легла в стек истории. При Ctrl+Z она выполнит `undo()`.',
                ],
                commonMistakes: [
                    '❌ Необратимые действия (отправка email) в Undo-стеке.',
                    '❌ Undo отменяет не последнее действие, а что-то другое (Race Condition).',
                    '❌ Стек истории бесконечно растет и "ест" память (нужен лимит 50).',
                ],
                instructions: [
                    '1. Добавьте "UI" (Editor).',
                    '2. Добавьте "Command Handler".',
                    '3. Добавьте "History Stack".',
                    '4. Соедините UI с Command Handler.',
                    '5. Соедините Command Handler с History Stack.'
                ],
                validationParams: {
                    requiredComponents: [{ type: 'frontend', count: 1 }, { type: 'command-handler', count: 1 }, { type: 'history-stack', count: 1 }],
                    requiredConnections: [{ from: 'frontend', to: 'command-handler' }, { from: 'command-handler', to: 'history-stack' }]
                },
                realWorldExample: 'Redux (Time Travel), CQRS Commands.'
            },
            {
                id: 'use-i18n',
                title: 'I18N (Global Netflix)',
                pattern: 'Localization Service',
                tactic: 'Адаптация под пользователя.',
                description: 'Сценарий: Netflix запускается в Японии. Цены в Yen, текст справа-налево (или вертикально), дата YYYY-MM-DD. Хардкод строк в коде сделает запуск невозможным.',
                keyIdea: 'Код — отдельно, тексты — отдельно.',
                dataFlow: [
                    '1. App грузится. User Locale = "ja-JP".',
                    '2. App тянет JSON словарь для Японии.',
                    '3. Вместо "Buy" рендерится "購入" (Kounyuu).',
                ],
                commonMistakes: [
                    '❌ Конкатенация: "Hello " + name (в некоторых языках имя идет первым).',
                    '❌ Использование картинок с текстом (придется перерисовывать под каждый язык).',
                    '❌ Забыли про Pluralization (1 file, 2 files, 5 files - в русском сложнее: 1 файл, 2 файла, 5 файлов).',
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
                },
                realWorldExample: 'i18next, react-intl, GNU gettext.'
            },
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
                title: 'Docker (Microservices)',
                pattern: 'Containers',
                tactic: 'Упаковка зависимостей.',
                description: 'Сценарий: "На моем компе работает, а на сервере нет" — классика. Docker упаковывает приложение вместе с Linux-библиотеками в "черный ящик", который работает одинаково везде.',
                keyIdea: 'Грузовой контейнер стандарта ISO 668.',
                dataFlow: [
                    '1. Dev пишет Dockerfile (Инструкция сборки).',
                    '2. CI собирает Image (неизменяемый слепок системы).',
                    '3. Kubernetes запускает Image на любом сервере.',
                ],
                commonMistakes: [
                    '❌ Хранение логов или БД внутри контейнера (они эфемерны, удалятся при рестарте).',
                    '❌ "Fat Container" (Ubuntu + Vim + SSH + App = 2GB). Нужен Alpine.',
                    '❌ Запуск от Root (если хакнут контейнер — хакнут хост).',
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
                },
                realWorldExample: 'Docker, Kubernetes, Podman.'
            },
            {
                id: 'port-hexagonal',
                title: 'Hexagonal (Banking Core)',
                pattern: 'Ports & Adapters',
                tactic: 'Изоляция ядра от инфраструктуры.',
                description: 'Сценарий: Банковское ядро. Сегодня мы храним данные в Oracle, завтра в Postgres. Сегодня API REST, завтра gRPC. Бизнес-логика (расчет кредита) не должна знать об этом.',
                keyIdea: 'Бизнес-логика в центре, инфраструктура — сбоку.',
                dataFlow: [
                    '1. REST Controller (Adapter) вызывает Interface `ICreditService` (Port).',
                    '2. `CreditService` (Core) считает процент.',
                    '3. `CreditService` вызывает `ISaveRepository` (Port), не зная, что там Postgres.',
                ],
                commonMistakes: [
                    '❌ Использование аннотаций `@Table`, `@Controller` внутри Domain Core.',
                    '❌ Просачивание DTO из контроллера в ядро.',
                    '❌ Смешивание логики валидации HTTP и бизнес-валидации.',
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
                },
                realWorldExample: 'Alistair Cockburn\'s Hexagonal Arch, Onion Arch.'
            },
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
                title: 'Roadmap (MVP Launch)',
                pattern: 'Roadmap',
                tactic: 'Визуализация сроков.',
                description: 'Сценарий: Запуск стартапа. Нельзя сделать всё сразу. Делим на фазы: MVP (только суть), V1 (фичи), V2 (красота). Визуализируем, кто кого блокирует.',
                keyIdea: 'Слон слишком большой, ешь его по частям.',
                dataFlow: [
                    '1. Фаза 1: MVP (Login + Feed). Deadline: 1 month.',
                    '2. Задачи: Backend API, React Frontend.',
                    '3. Milestone: "First 100 users".',
                ],
                commonMistakes: [
                    '❌ "Водопад" под маской Agile (план на год вперед с точностью до дня).',
                    '❌ Отсутствие буфера на риски (в баги уйдет 30% времени).',
                    '❌ Забытые зависимости (Frontend готов, а Backend нет API).',
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
                },
                realWorldExample: 'Jira Roadmap, Gantt Charts, Linear.'
            },
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
                            <div style={{ color: '#20c997', fontSize: '14px', fontWeight: 500 }}>
                                💡 Паттерн: {activeLesson.pattern}
                            </div>
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
