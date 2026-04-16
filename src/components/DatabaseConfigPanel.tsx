import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, DatabaseType, NoSQLType, DatabaseVendor, DatabaseConfig, ResiliencePatterns } from '../types'

interface DatabaseConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: DatabaseConfig) => void
  onClose: () => void
  onOpenSchemaEditor?: (nodeId: string) => void
}

const databaseTypes: Array<{ value: DatabaseType; label: string }> = [
  { value: 'sql', label: 'SQL' },
  { value: 'nosql', label: 'NoSQL' },
]

const nosqlTypes: Array<{ value: NoSQLType; label: string; description: string }> = [
  { value: 'document', label: 'Документоориентированная', description: 'MongoDB, CouchDB' },
  { value: 'column', label: 'Колоночная', description: 'Cassandra, HBase' },
  { value: 'key-value', label: 'Ключ-значение', description: 'Redis, DynamoDB' },
  { value: 'graph', label: 'Графовая', description: 'Neo4j, ArangoDB' },
  { value: 'time-series', label: 'Временные ряды', description: 'InfluxDB, TimescaleDB' },
]

const sqlVendors: Array<{ value: DatabaseVendor; label: string }> = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sql-server', label: 'SQL Server' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'cockroachdb', label: 'CockroachDB' },
  { value: 'tidb', label: 'TiDB' },
  { value: 'duckdb', label: 'DuckDB' },
]

const nosqlVendors: Record<NoSQLType, Array<{ value: DatabaseVendor; label: string }>> = {
  document: [
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'couchdb', label: 'CouchDB' },
    { value: 'ravendb', label: 'RavenDB' },
    { value: 'firebase', label: 'Firebase Realtime DB' },
  ],
  column: [
    { value: 'cassandra', label: 'Cassandra' },
    { value: 'scylladb', label: 'ScyllaDB' },
    { value: 'hbase', label: 'HBase' },
    { value: 'bigtable', label: 'BigTable' },
    { value: 'clickhouse', label: 'ClickHouse' },
    { value: 'apache-druid', label: 'Apache Druid' },
    { value: 'pinot', label: 'Apache Pinot' },
  ],
  'key-value': [
    { value: 'redis', label: 'Redis' },
    { value: 'dynamodb', label: 'DynamoDB' },
    { value: 'riak', label: 'Riak' },
    { value: 'memcached', label: 'Memcached' },
    { value: 'aerospike', label: 'Aerospike' },
  ],
  graph: [
    { value: 'neo4j', label: 'Neo4j' },
    { value: 'arangodb', label: 'ArangoDB' },
    { value: 'neptune', label: 'Amazon Neptune' },
    { value: 'orientdb', label: 'OrientDB' },
    { value: 'janusgraph', label: 'JanusGraph' },
  ],
  'time-series': [
    { value: 'influxdb', label: 'InfluxDB' },
    { value: 'timescaledb', label: 'TimescaleDB' },
    { value: 'prometheus', label: 'Prometheus' },
    { value: 'victoriametrics', label: 'VictoriaMetrics' },
  ],
}

const searchVendors: Array<{ value: DatabaseVendor; label: string }> = [
  { value: 'elasticsearch', label: 'Elasticsearch' },
]

const vendorDetails: Record<string, { pros: string[]; cons: string[] }> = {
  postgresql: {
    pros: ['Высокая надежность и соответствие ACID', 'Мощная поддержка JSONB', 'Огромное количество расширений (PostGIS, TimescaleDB)', 'Активное Open Source сообщество'],
    cons: ['Потребление памяти на каждое соединение', 'Сложность вертикального масштабирования', 'Вакуумирование (Autovacuum) может влиять на производительность']
  },
  mysql: {
    pros: ['Высокая скорость на чтении', 'Простота настройки и репликации', 'Стандарт индустрии для веб-приложений'],
    cons: ['Ограниченная поддержка сложных оконных функций (в старых версиях)', 'Проблемы с производительностью при больших объемах данных и сложных Join', 'Лицензионная политика Oracle']
  },
  oracle: {
    pros: ['Высочайшая производительность корпоративного уровня', 'Продвинутые функции безопасности', 'Мощная поддержка PL/SQL'],
    cons: ['Очень высокая стоимость лицензий', 'Сложность в администрировании', 'Тяжеловесность и привязка к вендору (Vendor Lock-in)']
  },
  'sql-server': {
    pros: ['Отличная интеграция с экосистемой Microsoft', 'Мощные инструменты визуализации и BI', 'Удобная среда разработки (SSMS)'],
    cons: ['Высокая стоимость (кроме Express версии)', 'Лучше всего работает только на Windows', 'Сложная система лицензирования']
  },
  mariadb: {
    pros: ['Полная совместимость с MySQL', 'Более современные движки хранилищ (ColumnStore)', 'Полный Open Source'],
    cons: ['Меньшая популярность в облачных провайдерах по сравнению с MySQL', 'Некоторые различия в реализации новых функций']
  },
  sqlite: {
    pros: ['Не требует сервера (Zero-config)', 'Невероятная скорость для локальных данных', 'Идеально для мобильных приложений'],
    cons: ['Не подходит для многопользовательской записи', 'Отсутствие сетевого доступа "из коробки"', 'Ограниченная поддержка типов данных']
  },
  cockroachdb: {
    pros: ['Географическое распределение', 'Горизонтальное масштабирование ACID', 'Высокая отказоустойчивость'],
    cons: ['Высокое потребление ресурсов', 'Задержки выше, чем у локальных БД', 'Сложность в отладке распределенных транзакций']
  },
  tidb: {
    pros: ['Совместимость с протоколом MySQL', 'Гибридная нагрузка (HTAP)', 'Горизонтальное масштабирование'],
    cons: ['Сложная архитектура из множества компонентов', 'Меньшее сообщество вне Китая']
  },
  duckdb: {
    pros: ['Аналитическая БД внутри процесса', 'Высокая скорость векторизованных запросов', 'Отличная работа с Pandas/Parquet'],
    cons: ['Только для аналитики (OLAP), не для транзакций', 'Однопользовательский доступ к файлу']
  },
  mongodb: {
    pros: ['Гибкая схема документов', 'Удобное горизонтальное масштабирование (Sharding)', 'Нативный JSON формат'],
    cons: ['Высокое потребление оперативной памяти', 'Отсутствие сложных Join "из коробки"', 'Риск потери данных при неправильной настройке Write Concern']
  },
  couchdb: {
    pros: ['Нативная репликация "Master-Master"', 'HTTP API и версионность документов', 'Надежность'],
    cons: ['Медленная работа с индексами (View)', 'Специфическая модель данных', 'Меньшая популярность']
  },
  ravendb: {
    pros: ['ACID в NoSQL', 'Встроенные индексы и полнотекстовый поиск', 'Удобная админка'],
    cons: ['Платная лицензия для крупных проектов', 'Привязка к .NET экосистеме (хотя есть SDK для всех)']
  },
  firebase: {
    pros: ['Real-time синхронизация', 'Полный Managed сервис', 'Быстрый старт'],
    cons: ['Сложность сложных запросов и фильтрации', 'Непредсказуемая стоимость при росте трафика', 'Vendor Lock-in (Google)']
  },
  cassandra: {
    pros: ['Линейное масштабирование', 'Запись быстрее чтения', 'Нет единой точки отказа'],
    cons: ['Сложность проектирования моделей данных (Query-based)', 'Требует глубоких знаний для настройки', 'Большое потребление диска']
  },
  scylladb: {
    pros: ['Производительность Cassandra на C++', 'Низкие задержки', 'Эффективное использование ресурсов'],
    cons: ['Сложность настройки как у Cassandra', 'Меньшая экосистема инструментов']
  },
  hbase: {
    pros: ['Работа поверх HDFS', 'Огромные объемы данных (Петабайты)', 'Интеграция с Hadoop'],
    cons: ['Зависимость от Zookeeper и HDFS', 'Не подходит для данных малого объема', 'Высокие задержки на чтение']
  },
  bigtable: {
    pros: ['Managed сервис Google Cloud', 'Масштабируемость до миллионов операций', 'Высокая доступность'],
    cons: ['Высокая стоимость минимального кластера', 'Специфическая модель данных']
  },
  clickhouse: {
    pros: ['Самая быстрая аналитическая БД', 'Сжатие данных в 10-100 раз', 'SQL поддержка'],
    cons: ['Не подходит для точечных обновлений (Update/Delete)', 'Сложность в управлении кластером', 'Потребление ресурсов при вставке мелких пачек']
  },
  'apache-druid': {
    pros: ['Real-time аналитика', 'Низкие задержки на запросы', 'Масштабируемость'],
    cons: ['Сложная инфраструктура', 'Высокий порог вхождения', 'Дороговизна ресурсов']
  },
  pinot: {
    pros: ['Аналитика в реальном времени', 'Ультра-низкие задержки', 'Интеграция с Kafka'],
    cons: ['Сложное управление индексами', 'Требует много оперативной памяти']
  },
  redis: {
    pros: ['Невероятная скорость (In-memory)', 'Богатый набор структур данных', 'Простота использования'],
    cons: ['Данные ограничены объемом RAM', 'Сложность обеспечения долговечности данных', 'Однопоточность ядра (в классических версиях)']
  },
  dynamodb: {
    pros: ['Serverless, не требует серверов', 'Стабильная производительность при любом масштабе', 'Интеграция с AWS AWS'],
    cons: ['Сложная модель ценообразования (RCU/WCU)', 'Ограничение размера документа в 400KB', 'Трудности с индексацией (GSI)']
  },
  memcached: {
    pros: ['Максимальная простота', 'Многопоточность', 'Эффективное кэширование'],
    cons: ['Только Key-Value строки', 'Нет постоянного хранения (только кэш)', 'Нет репликации данных']
  },
  aerospike: {
    pros: ['Оптимизация под SSD/NVMe', 'Суб-миллисекундные задержки', 'Высокая плотность данных'],
    cons: ['Высокая стоимость лицензии Enterprise', 'Сложная конфигурация']
  },
  neo4j: {
    pros: ['Идеально для сложных связей', 'Язык запросов Cypher', 'Визуализация графов'],
    cons: ['Медленнее на простых табличных данных', 'Сложность масштабирования (в бесплатной версии)', 'Высокое потребление памяти для кэша графа']
  },
  arangodb: {
    pros: ['Мультимодельная (Документы + Графы)', 'Язык запросов AQL', 'Удобный веб-интерфейс'],
    cons: ['Менее производительна чем специализированные БД', 'Сложность оптимизации под разные типы нагрузок одновременно']
  },
  influxdb: {
    pros: ['Специализация на временных рядах', 'Высокая скорость вставки метрик', 'Встроенный язык Flux'],
    cons: ['Проблемы с высокой кардинальностью тегов', 'Ограничения в бесплатной версии кластеризации']
  },
  timescaledb: {
    pros: ['Знакомый SQL (базируется на Postgres)', 'Автоматические гипертаблицы', 'Мощная аналитика'],
    cons: ['Зависимость от стабильности Postgres', 'Сложнее масштабировать чем InfluxDB']
  },
  elasticsearch: {
    pros: ['Лучший полнотекстовый поиск', 'Мощная аналитика логов (ELK)', 'Горизонтальное масштабирование'],
    cons: ['Очень тяжелый по ресурсам (RAM/CPU)', 'Задержка индексации (Near Real-time)', 'Сложность в поддержке индексов']
  },
  prometheus: {
    pros: ['Идеально для Kubernetes', 'Мощный язык PromQL', 'Pull-модель сбора метрик'],
    cons: ['Только краткосрочное хранение (по умолчанию)', 'Не подходит для хранения детальных логов или событий', 'Нет встроенной кластеризации']
  },
  victoriametrics: {
    pros: ['Высокое сжатие данных', 'Совместимость с Prometheus API', 'Низкие задержки'],
    cons: ['Меньшая экосистема чем у Prometheus', 'Свои нюансы в языке запросов MetricsQL']
  },
  riak: {
    pros: ['Высокая доступность и отказоустойчивость', 'Предсказуемая масштабируемость', 'Модель данных Key-Value'],
    cons: ['Сложность в эксплуатации', 'Меньшее сообщество', 'Требует много дискового пространства']
  },
  neptune: {
    pros: ['Managed сервис AWS', 'Поддержка Gremlin и SPARQL', 'Высокая доступность'],
    cons: ['Vendor Lock-in (AWS)', 'Высокая стоимость', 'Ограниченная гибкость настройки']
  },
  orientdb: {
    pros: ['Мультимодель (Графы + Документы)', 'Поддержка SQL-подобных запросов', 'Хорошая производительность на связях'],
    cons: ['Менее стабилен чем Neo4j', 'Сложная документация', 'Меньшее сообщество']
  },
  janusgraph: {
    pros: ['Масштабируемость до триллионов ребер', 'Интеграция с Big Data (Hadoop/Spark)', 'Выбор хранилища (Cassandra/HBase)'],
    cons: ['Очень сложная настройка и эксплуатация', 'Зависимость от внешних компонентов (Storage/Indexer)', 'Высокие требования к ресурсам']
  }
}

const patterns = [
  { key: 'fixedWindowThrottling', label: 'Fixed Window Throttling', description: 'Ограничение количества запросов в фиксированном временном окне.' },
  { key: 'leakyBucket', label: 'Leaky Bucket', description: 'Алгоритм "дырявого ведра" для сглаживания всплесков трафика.' },
  { key: 'tokenBucket', label: 'Token Bucket', description: 'Алгоритм "ведра токенов", допускающий кратковременные всплески.' },
  { key: 'userBasedRateLimiting', label: 'User-based Rate Limiting', description: 'Ограничение частоты запросов индивидуально для каждого пользователя.' },
  { key: 'ipBasedRateLimiting', label: 'IP-based Rate Limiting', description: 'Ограничение частоты запросов для каждого IP-адреса.' },
  { key: 'globalRateLimiting', label: 'Global Rate Limiting', description: 'Общее ограничение нагрузки на всю систему или сервис.' },
  { key: 'fixedWindowCounter', label: 'Fixed Window Counter', description: 'Простой счетчик запросов, сбрасываемый через фиксированные интервалы.' },
  { key: 'circuitBreaker', label: 'Circuit Breaker', description: 'Предотвращение каскадных сбоев путем временного отключения вызовов к неисправному сервису.' },
  { key: 'backpressure', label: 'Backpressure', description: 'Механизм обратного давления для предотвращения перегрузки, сигнализирующий отправителю замедлиться.' },
  { key: 'exponentialBackoff', label: 'Exponential Backoff', description: 'Экспоненциальное увеличение времени ожидания между повторными попытками после сбоя.' },
]

const internalTemplates: Record<string, DatabaseInternalArchitecture> = {
  postgresql: {
    storageStrategy: 'Row-oriented',
    consistencyModel: 'Strong (ACID)',
    components: [
      { id: '1', type: 'index', label: 'B-Tree Indexes', technologies: ['B-Tree', 'GiST', 'GIN'] },
      { id: '2', type: 'log', label: 'WAL (Write Ahead Log)', technologies: ['REDO Log'] },
      { id: '3', type: 'cache', label: 'Shared Buffers', technologies: ['Buffer Pool'] },
      { id: '4', type: 'disk', label: 'Heap Storage', technologies: ['MVCC'] },
    ]
  },
  mysql: {
    storageStrategy: 'Row-oriented (InnoDB)',
    consistencyModel: 'Strong (ACID)',
    components: [
      { id: '1', type: 'index', label: 'B+Tree Indexes', technologies: ['Clustered Index'] },
      { id: '2', type: 'log', label: 'Redo Log & Binlog', technologies: ['WAL'] },
      { id: '3', type: 'cache', label: 'InnoDB Buffer Pool', technologies: ['LRU Cache'] },
      { id: '4', type: 'disk', label: 'Tablespaces', technologies: ['.ibd files'] },
    ]
  },
  redis: {
    storageStrategy: 'In-memory (Key-Value)',
    consistencyModel: 'Strong (Single-threaded)',
    components: [
      { id: '1', type: 'cache', label: 'RAM Dataset', technologies: ['Hashes', 'Lists', 'Sets'] },
      { id: '2', type: 'log', label: 'AOF (Append Only File)', technologies: ['Journaling'] },
      { id: '3', type: 'disk', label: 'RDB Snapshots', technologies: ['Point-in-time recovery'] },
      { id: '4', type: 'network', label: 'Sentinel / Cluster', technologies: ['Replication'] },
    ]
  },
  elasticsearch: {
    storageStrategy: 'Inverted Index (Lucene)',
    consistencyModel: 'Eventual (Near real-time)',
    components: [
      { id: '1', type: 'index', label: 'Inverted Index', technologies: ['Term Dict', 'Posting Lists'] },
      { id: '2', type: 'disk', label: 'Lucene Segments', technologies: ['Immutable files'] },
      { id: '3', type: 'log', label: 'Translog', technologies: ['Durability'] },
      { id: '4', type: 'cache', label: 'Field Data Cache', technologies: ['OS Page Cache'] },
    ]
  },
  cassandra: {
    storageStrategy: 'LSM-Tree',
    consistencyModel: 'Eventual (Tunable)',
    components: [
      { id: '1', type: 'disk', label: 'SSTables', technologies: ['Bloom Filters', 'Index Files'] },
      { id: '2', type: 'cache', label: 'Memtables', technologies: ['In-memory write buffer'] },
      { id: '3', type: 'log', label: 'CommitLog', technologies: ['WAL'] },
      { id: '4', type: 'network', label: 'Gossip Protocol', technologies: ['Consistent Hashing'] },
    ]
  },
  mongodb: {
    storageStrategy: 'Document (WiredTiger)',
    consistencyModel: 'Strong/Eventual (Tunable)',
    components: [
      { id: '1', type: 'disk', label: 'BSON Data Files', technologies: ['Compression'] },
      { id: '2', type: 'cache', label: 'WiredTiger Cache', technologies: ['Page Cache'] },
      { id: '3', type: 'log', label: 'Oplog', technologies: ['Replication Log'] },
      { id: '4', type: 'index', label: 'Compound Indexes', technologies: ['Multikey Indexes'] },
    ]
  },
  clickhouse: {
    storageStrategy: 'Columnar (MergeTree)',
    consistencyModel: 'Eventual',
    components: [
      { id: '1', type: 'disk', label: 'Column Parts', technologies: ['Heavy Compression'] },
      { id: '2', type: 'index', label: 'Sparse Primary Index', technologies: ['Data Skipping'] },
      { id: '3', type: 'log', label: 'Write Log', technologies: ['Batched inserts'] },
      { id: '4', type: 'cache', label: 'Mark Cache', technologies: ['Uncompressed Cache'] },
    ]
  }
}

export default function DatabaseConfigPanel({
  node,
  onUpdate,
  onClose,
  onOpenSchemaEditor,
}: DatabaseConfigPanelProps) {
  const data = node.data as ComponentData
  const [dbType, setDbType] = useState<DatabaseType>(
    data.databaseConfig?.dbType || 'sql'
  )
  const [nosqlType, setNosqlType] = useState<NoSQLType | undefined>(
    data.databaseConfig?.nosqlType
  )
  const [vendor, setVendor] = useState<DatabaseVendor | undefined>(
    data.databaseConfig?.vendor
  )
  const [activeTab, setActiveTab] = useState<'general' | 'internal'>('general')

  useEffect(() => {
    if (dbType === 'nosql' && !nosqlType) {
      setNosqlType('document')
    }
    // Сбрасываем vendor при смене типа
    if (dbType === 'sql') {
      // Don't reset vendor if its already SQL vendor
      if (vendor && !sqlVendors.some(v => v.value === vendor)) {
        setVendor(undefined)
      }
    }
  }, [dbType, nosqlType])

  // Автоматическое сохранение при изменении параметров
  useEffect(() => {
    onUpdate(node.id, {
      ...data.databaseConfig,
      dbType,
      nosqlType: dbType === 'nosql' ? nosqlType : undefined,
      vendor,
    })
  }, [dbType, nosqlType, vendor, node.id])

  const handleOpenDataEditor = () => {
    onClose()
    // Открываем редактор схемы для добавления данных
    setTimeout(() => {
      if (onOpenSchemaEditor) {
        onOpenSchemaEditor(node.id)
      } else {
        // Fallback на событие, если callback не передан
        const event = new CustomEvent('openSchemaEditor', {
          detail: { nodeId: node.id },
        })
        window.dispatchEvent(event)
      }
    }, 200)
  }

  const handlePatternToggle = (key: keyof ResiliencePatterns, checked: boolean) => {
    onUpdate(node.id, {
      ...data.databaseConfig,
      [key]: checked
    })
  }

  const availableVendors = dbType === 'sql'
    ? sqlVendors
    : nosqlType
      ? [...(nosqlVendors[nosqlType] || []), ...searchVendors]
      : []

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #51cf66',
        borderRadius: '12px',
        padding: '25px',
        minWidth: '350px',
        maxWidth: '430px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Настройка базы данных
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#aaa'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', backgroundColor: '#1e1e1e', padding: '4px', borderRadius: '8px' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'general' ? '#3d3d3d' : 'transparent',
            color: activeTab === 'general' ? '#51cf66' : '#aaa',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Общие
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'internal' ? '#3d3d3d' : 'transparent',
            color: activeTab === 'internal' ? '#51cf66' : '#aaa',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Внутренняя архитектура
        </button>
      </div>

      {activeTab === 'general' ? (
        <>

      <div style={{ marginBottom: '20px' }}>
        <label
          onClick={() => {
            const event = new CustomEvent('nodeDataUpdate', {
              detail: {
                nodeId: node.id,
                data: {
                  ...data,
                  isTruthSource: !data.isTruthSource
                }
              }
            })
            window.dispatchEvent(event)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: data.isTruthSource ? '#51cf6620' : '#3d3d3d',
            border: `2px solid ${data.isTruthSource ? '#51cf66' : '#555'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: data.isTruthSource ? '#51cf66' : '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: data.isTruthSource ? '#51cf66' : '#fff' }}>Источник истины (Master)</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Эталонное джерело данных</div>
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            backgroundColor: data.isTruthSource ? '#51cf66' : '#555',
            borderRadius: '10px',
            position: 'relative',
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: data.isTruthSource ? '19px' : '3px',
              transition: 'all 0.2s',
            }} />
          </div>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип СУБД:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {databaseTypes.map((type) => (
            <label
              key={type.value}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: dbType === type.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${dbType === type.value ? '#51cf66' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setDbType(type.value)}
            >
              <input
                type="radio"
                name="dbType"
                value={type.value}
                checked={dbType === type.value}
                onChange={() => setDbType(type.value)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {dbType === 'nosql' && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ccc',
            }}
          >
            Тип NoSQL:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nosqlTypes.map((type) => (
              <label
                key={type.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: nosqlType === type.value ? '#3d3d3d' : 'transparent',
                  border: `2px solid ${nosqlType === type.value ? '#51cf66' : '#555'}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => {
                  setNosqlType(type.value)
                  setVendor(undefined)
                }}
              >
                <input
                  type="radio"
                  name="nosqlType"
                  value={type.value}
                  checked={nosqlType === type.value}
                  onChange={() => {
                    setNosqlType(type.value)
                    setVendor(undefined)
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {availableVendors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ccc',
            }}
          >
            Конкретная СУБД:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableVendors.map((v) => (
              <label
                key={v.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                  border: `1px solid ${vendor === v.value ? '#51cf66' : '#555'}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => setVendor(v.value)}
              >
                <input
                  type="radio"
                  name="vendor"
                  value={v.value}
                  checked={vendor === v.value}
                  onChange={() => setVendor(v.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: '#fff' }}>{v.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {vendor && vendorDetails[vendor] && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '10px', border: '1px solid #444' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#51cf66', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>✅</span> Плюсы
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#eee', fontSize: '12px', lineHeight: '1.5' }}>
              {vendorDetails[vendor].pros.map((pro, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ color: '#ff6b6b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>❌</span> Минусы
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#eee', fontSize: '12px', lineHeight: '1.5' }}>
              {vendorDetails[vendor].cons.map((con, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{con}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Паттерны и ограничения:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
          {patterns.map((option) => (
            <label
              key={option.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: data.databaseConfig?.[option.key as keyof ResiliencePatterns] ? '#3d3d3d' : 'transparent',
                border: `1px solid ${data.databaseConfig?.[option.key as keyof ResiliencePatterns] ? '#51cf66' : '#555'}`,
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={!!data.databaseConfig?.[option.key as keyof ResiliencePatterns]}
                onChange={(e) => {
                  handlePatternToggle(option.key as keyof ResiliencePatterns, e.target.checked)
                }}
                style={{ cursor: 'pointer', marginTop: '4px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                  {option.label}
                </span>
                <span style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
      </>
      ) : (
        <div style={{ color: '#fff' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>Спецификация архитектуры:</label>
              {vendor && internalTemplates[vendor] && (
                <button
                  onClick={() => {
                    const template = internalTemplates[vendor];
                    onUpdate(node.id, {
                      ...data.databaseConfig,
                      internalArchitecture: JSON.parse(JSON.stringify(template))
                    });
                  }}
                  style={{
                    backgroundColor: '#51cf6620',
                    border: '1px solid #51cf66',
                    color: '#51cf66',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Применить шаблон {vendor}
                </button>
              )}
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', border: '1px solid #444' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Стратегия хранения</label>
                <input
                  type="text"
                  value={data.databaseConfig?.internalArchitecture?.storageStrategy || ''}
                  onChange={(e) => {
                    onUpdate(node.id, {
                      ...data.databaseConfig,
                      internalArchitecture: {
                        ...(data.databaseConfig?.internalArchitecture || { components: [] }),
                        storageStrategy: e.target.value
                      }
                    })
                  }}
                  placeholder="Напр. Row-oriented, Columnar..."
                  style={{ width: '100%', backgroundColor: '#2d2d2d', border: '1px solid #444', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' }}>Модель консистентности</label>
                <input
                  type="text"
                  value={data.databaseConfig?.internalArchitecture?.consistencyModel || ''}
                  onChange={(e) => {
                    onUpdate(node.id, {
                      ...data.databaseConfig,
                      internalArchitecture: {
                        ...(data.databaseConfig?.internalArchitecture || { components: [] }),
                        consistencyModel: e.target.value
                      }
                    })
                  }}
                  placeholder="Напр. Strong (ACID), Eventual..."
                  style={{ width: '100%', backgroundColor: '#2d2d2d', border: '1px solid #444', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '10px' }}>Внутренние компоненты</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['disk', 'cache', 'index', 'log', 'network'].map((type) => {
                    const comp = data.databaseConfig?.internalArchitecture?.components?.find(c => c.type === type);
                    const iconMap: Record<string, string> = { disk: '💾', cache: '⚡', index: '🔍', log: '📝', network: '🌐' };
                    const labelMap: Record<string, string> = { disk: 'Диск', cache: 'Кэш', index: 'Индексы', log: 'Журнал', network: 'Сеть' };

                    return (
                      <div key={type} style={{ backgroundColor: comp ? '#51cf6610' : '#2d2d2d', border: `1px solid ${comp ? '#51cf6640' : '#444'}`, borderRadius: '6px', padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: comp ? '8px' : '0' }}>
                          <span style={{ fontSize: '16px' }}>{iconMap[type]}</span>
                          <span style={{ flex: 1, fontSize: '13px', fontWeight: 'bold' }}>{labelMap[type]}</span>
                          <input
                            type="checkbox"
                            checked={!!comp}
                            onChange={(e) => {
                              const components = [...(data.databaseConfig?.internalArchitecture?.components || [])];
                              if (e.target.checked) {
                                components.push({ id: Date.now().toString(), type: type as any, label: labelMap[type], technologies: [] });
                              } else {
                                const index = components.findIndex(c => c.type === type);
                                if (index > -1) components.splice(index, 1);
                              }
                              onUpdate(node.id, {
                                ...data.databaseConfig,
                                internalArchitecture: {
                                  ...(data.databaseConfig?.internalArchitecture || { components: [] }),
                                  components
                                }
                              });
                            }}
                          />
                        </div>
                        {comp && (
                          <div style={{ paddingLeft: '26px' }}>
                            <input
                              type="text"
                              value={comp.label}
                              onChange={(e) => {
                                const components = data.databaseConfig?.internalArchitecture?.components?.map(c =>
                                  c.type === type ? { ...c, label: e.target.value } : c
                                ) || [];
                                onUpdate(node.id, {
                                  ...data.databaseConfig,
                                  internalArchitecture: {
                                    ...(data.databaseConfig?.internalArchitecture || { components: [] }),
                                    components
                                  }
                                });
                              }}
                              style={{ width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', color: '#fff', fontSize: '12px', marginBottom: '5px' }}
                            />
                            <input
                              type="text"
                              value={comp.technologies?.join(', ') || ''}
                              onChange={(e) => {
                                const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                                const components = data.databaseConfig?.internalArchitecture?.components?.map(c =>
                                  c.type === type ? { ...c, technologies: techs } : c
                                ) || [];
                                onUpdate(node.id, {
                                  ...data.databaseConfig,
                                  internalArchitecture: {
                                    ...(data.databaseConfig?.internalArchitecture || { components: [] }),
                                    components
                                  }
                                });
                              }}
                              placeholder="Технологии (через запятую)..."
                              style={{ width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', color: '#aaa', fontSize: '11px' }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#51cf66',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#40c057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#51cf66'
          }}
        >
          Готово
        </button>
        {(dbType && vendor) && (
          <button
            onClick={handleOpenDataEditor}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4dabf7',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#339af0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4dabf7'
            }}
          >
            Редактировать данные/схему
          </button>
        )}
      </div>
    </div>
  )
}
