export type ComponentType =
  | 'service'
  | 'database'
  | 'message-broker'
  | 'api-gateway'
  | 'cache'
  | 'load-balancer'
  | 'frontend'
  | 'auth-service'
  | 'cdn'
  | 'object-storage'
  | 'data-warehouse'
  | 'lambda'
  | 'firewall'
  | 'system'
  | 'esb'
  | 'client'
  | 'external-system'
  | 'business-domain'
  | 'controller'
  | 'repository'
  | 'class'
  | 'server'
  | 'container'
  | 'orchestrator'
  | 'service-discovery'
  | 'web-server'
  | 'monitoring'
  | 'logging'
  | 'queue'
  | 'event-bus'
  | 'stream-processor'
  | 'search-engine'
  | 'analytics-service'
  | 'business-intelligence'
  | 'graph-database'
  | 'time-series-database'
  | 'service-mesh'
  | 'configuration-management'
  | 'ci-cd-pipeline'
  | 'backup-service'
  | 'identity-provider'
  | 'secret-management'
  | 'api-client'
  | 'api-documentation'
  | 'integration-platform'
  | 'batch-processor'
  | 'etl-service'
  | 'data-lake'
  | 'edge-computing'
  | 'iot-gateway'
  | 'blockchain'
  | 'ml-ai-service'
  | 'llm-model'
  | 'vector-database'
  | 'ml-training'
  | 'ml-inference'
  | 'ai-agent'
  | 'ml-data-pipeline'
  | 'gpu-cluster'
  | 'notification-service'
  | 'email-service'
  | 'sms-gateway'
  | 'proxy'
  | 'vpn-gateway'
  | 'dns-service'
  | 'group'
  | 'system-component'
  | 'note'

export type ConnectionType = 'rest' | 'grpc' | 'async' | 'database-connection' | 'database-replication' | 'cache-connection' | 'dependency' | 'composition' | 'aggregation' | 'method-call' | 'inheritance' | 'bidirectional' | 'async-bidirectional'

export type ReplicationApproach =
  | 'master-slave'
  | 'master-master'
  | 'cdc'
  | 'etl'
  | 'streaming'
  | 'snapshot'

export type ReplicationTool =
  | 'debezium'
  | 'kafka-connect'
  | 'apache-nifi'
  | 'airbyte'
  | 'dms'
  | 'goldengate'
  | 'native-replication'

export type DatabaseType = 'sql' | 'nosql'
export type NoSQLType = 'document' | 'column' | 'key-value' | 'graph' | 'time-series'
export type DatabaseVendor =
  | 'postgresql'
  | 'mysql'
  | 'oracle'
  | 'sql-server'
  | 'mongodb'
  | 'elasticsearch'
  | 'cassandra'
  | 'redis'
  | 'dynamodb'
  | 'neo4j'
  | 'influxdb'

export type SQLColumnType =
  | 'INTEGER'
  | 'BIGINT'
  | 'VARCHAR'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIMESTAMP'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'BLOB'
  | 'JSON'

export type NoSQLFieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'Object'
  | 'Array'
  | 'Null'
  | 'Binary'

export interface TableColumn {
  name: string
  type: SQLColumnType | NoSQLFieldType
  nullable?: boolean
  primaryKey?: boolean
  unique?: boolean
  defaultValue?: string
}

export interface TableRow {
  [columnName: string]: string | number | boolean | null
}

export interface DatabaseTable {
  name: string
  columns: TableColumn[]
  rows?: TableRow[]
}

export interface NoSQLDocument {
  _id?: string
  [key: string]: any
}

export interface NoSQLCollection {
  name: string
  documents: NoSQLDocument[]
}

export interface KeyValuePair {
  key: string
  value: string | number | boolean | object
}

export interface KeyValueStore {
  pairs: KeyValuePair[]
}

export interface DatabaseConfig {
  dbType?: DatabaseType
  nosqlType?: NoSQLType
  vendor?: DatabaseVendor
  tables?: DatabaseTable[]
}

export type CacheType = 'distributed' | 'in-memory'

export interface CacheConfig {
  cacheType?: CacheType
}

export type ServiceLanguage =
  | 'java'
  | 'python'
  | 'nodejs'
  | 'go'
  | 'csharp'
  | 'rust'
  | 'kotlin'
  | 'scala'

export type FrontendFramework =
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'nextjs'
  | 'nuxt'
  | 'vanilla'

export type DataWarehouseVendor =
  | 'snowflake'
  | 'redshift'
  | 'bigquery'
  | 'databricks'
  | 'synapse'
  | 'teradata'

export type ObjectStorageVendor =
  | 's3'
  | 'azure-blob'
  | 'gcs'
  | 'minio'

export type MessageBrokerVendor =
  | 'kafka'
  | 'rabbitmq'
  | 'activemq'
  | 'nats'
  | 'pulsar'
  | 'redis-pubsub'
  | 'amazon-sqs'
  | 'azure-service-bus'

export type MessageDeliveryType =
  | 'push'
  | 'pull'
  | 'pub-sub'

export type CDNVendor =
  | 'cloudflare'
  | 'aws-cloudfront'
  | 'azure-cdn'
  | 'gcp-cdn'
  | 'akamai'

export type LambdaVendor =
  | 'aws-lambda'
  | 'azure-functions'
  | 'gcp-cloud-functions'
  | 'vercel'
  | 'cloudflare-workers'

export type AuthServiceVendor =
  | 'auth0'
  | 'okta'
  | 'keycloak'
  | 'aws-cognito'
  | 'azure-ad'
  | 'firebase-auth'
  | 'oauth2'
  | 'jwt'

export type FirewallVendor =
  | 'aws-waf'
  | 'azure-waf'
  | 'cloudflare-waf'
  | 'modsecurity'
  | 'nginx-waf'
  | 'fortinet'

export type LoadBalancerVendor =
  | 'nginx'
  | 'haproxy'
  | 'aws-alb'
  | 'azure-lb'
  | 'gcp-lb'
  | 'traefik'

export type ApiGatewayVendor =
  | 'aws-api-gateway'
  | 'azure-api-management'
  | 'kong'
  | 'tyk'
  | 'apigee'
  | 'nginx-plus'

export type ESBVendor =
  | 'mule-esb'
  | 'wso2-esb'
  | 'apache-camel'
  | 'jboss-fuse'
  | 'tibco-businessworks'
  | 'oracle-service-bus'
  | 'ibm-integration-bus'

export interface ServiceConfig {
  language?: ServiceLanguage
}

export interface FrontendConfig {
  framework?: FrontendFramework
}

export interface DataWarehouseConfig {
  vendor?: DataWarehouseVendor
  tables?: DatabaseTable[]
  schemas?: DataWarehouseSchema[]
}

export interface DataWarehouseSchema {
  name: string
  tables: DatabaseTable[]
}

export interface ObjectStorageConfig {
  vendor?: ObjectStorageVendor
}

export interface BrokerMessage {
  id?: string
  key?: string
  value: string | object
  headers?: Record<string, string>
  timestamp?: string
}

export interface KafkaTopic {
  name: string
  messages: BrokerMessage[]
}

export interface RabbitMQQueue {
  name: string
  messages: BrokerMessage[]
}

export interface SQSQueue {
  name: string
  messages: BrokerMessage[]
}

export interface RedisChannel {
  name: string
  messages: BrokerMessage[]
}

export interface MessageBrokerConfig {
  vendor?: MessageBrokerVendor
  deliveryType?: MessageDeliveryType
  kafkaTopics?: KafkaTopic[]
  rabbitmqQueues?: RabbitMQQueue[]
  sqsQueues?: SQSQueue[]
  redisChannels?: RedisChannel[]
}

export interface CDNConfig {
  vendor?: CDNVendor
}

export interface LambdaConfig {
  vendor?: LambdaVendor
}

export interface AuthServiceConfig {
  vendor?: AuthServiceVendor
}

export interface FirewallConfig {
  vendor?: FirewallVendor
}

export interface LoadBalancerConfig {
  vendor?: LoadBalancerVendor
}

export interface ApiGatewayConfig {
  vendor?: ApiGatewayVendor
  rateLimiting?: boolean
  authentication?: boolean
  requestTransformation?: boolean
  responseTransformation?: boolean
  caching?: boolean
  loadBalancing?: boolean
  circuitBreaker?: boolean
  apiVersioning?: boolean
}

export interface ESBConfig {
  vendor?: ESBVendor
  messageRouting?: boolean
  protocolTransformation?: boolean
  dataTransformation?: boolean
  serviceOrchestration?: boolean
  eventDriven?: boolean
}

export interface RedirectedEdge {
  edgeId: string
  originalSource: string
  originalTarget: string
}

export interface SystemConfig {
  childNodes?: string[] // IDs узлов внутри системы
  domainColor?: string // Цвет бизнес-домена
  collapsed?: boolean // Состояние сворачивания системы
  originalWidth?: number // Оригинальная ширина перед сворачиванием
  originalHeight?: number // Оригинальная высота перед сворачиванием
  redirectedEdges?: RedirectedEdge[] // Связи, перенаправленные при сворачивании
}

export interface ContainerConfig {
  childNodes?: string[] // IDs узлов внутри контейнера (обычно серверы)
  image?: string // Docker образ
  ports?: string[] // Публикуемые порты
  environment?: Record<string, string> // Переменные окружения
  resources?: {
    cpu?: string // Лимит CPU
    memory?: string // Лимит памяти
  }
  isManuallyResized?: boolean // Флаг ручного изменения размера
}

export interface GroupConfig {
  childNodes: string[] // IDs узлов в группе
  isGrouped: boolean // Флаг группировки
}

export interface ClassMethod {
  name: string
  returnType?: string
  parameters?: string
  visibility?: 'public' | 'private' | 'protected'
}

export interface ClassConfig {
  methods?: ClassMethod[]
}

export interface ControllerEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description?: string
}

export interface ControllerConfig {
  endpoints?: ControllerEndpoint[]
}

export interface RepositoryData {
  table?: string
  operations?: ('read' | 'write' | 'update' | 'delete')[]
  description?: string
}

export interface RepositoryConfig {
  data?: RepositoryData[]
}

export interface ComponentLink {
  targetWorkspaceId: string
  targetNodeId: string
  label?: string
}

// Новые типы для вендоров
export type QueueVendor =
  | 'rabbitmq'
  | 'amazon-sqs'
  | 'azure-queue'
  | 'google-cloud-tasks'
  | 'redis-queue'
  | 'beanstalkd'
  | 'bull'

export type EventBusVendor =
  | 'aws-eventbridge'
  | 'google-pub-sub'
  | 'azure-event-grid'
  | 'kafka-events'
  | 'apache-pulsar'

export type StreamProcessorVendor =
  | 'kafka-streams'
  | 'apache-flink'
  | 'apache-spark'
  | 'aws-kinesis'
  | 'google-dataflow'
  | 'azure-stream-analytics'

export type SearchEngineVendor =
  | 'elasticsearch'
  | 'opensearch'
  | 'solr'
  | 'algolia'
  | 'meilisearch'
  | 'typesense'

export type GraphDatabaseVendor =
  | 'neo4j'
  | 'amazon-neptune'
  | 'arangodb'
  | 'orientdb'
  | 'dgraph'

export type TimeSeriesDatabaseVendor =
  | 'influxdb'
  | 'timescaledb'
  | 'prometheus'
  | 'graphite'
  | 'opentsdb'
  | 'questdb'

export type ServiceMeshVendor =
  | 'istio'
  | 'linkerd'
  | 'consul-connect'
  | 'aws-app-mesh'
  | 'kuma'

export type ConfigurationManagementVendor =
  | 'consul'
  | 'etcd'
  | 'hashiCorp-vault'
  | 'aws-systems-manager'
  | 'azure-key-vault'

export type CICDPipelineVendor =
  | 'jenkins'
  | 'gitlab-ci'
  | 'github-actions'
  | 'circleci'
  | 'travis-ci'
  | 'azure-devops'

export type IdentityProviderVendor =
  | 'okta'
  | 'auth0'
  | 'keycloak'
  | 'azure-ad-b2c'
  | 'ping-identity'
  | 'saml'

export type SecretManagementVendor =
  | 'hashicorp-vault'
  | 'aws-secrets-manager'
  | 'azure-key-vault'
  | 'google-secret-manager'
  | 'cyberark'

export type IntegrationPlatformVendor =
  | 'mulesoft'
  | 'zapier'
  | 'boomi'
  | 'tibco'
  | 'workato'
  | 'tray-io'

export type BatchProcessorVendor =
  | 'apache-airflow'
  | 'luigi'
  | 'prefect'
  | 'aws-batch'
  | 'azure-batch'
  | 'google-cloud-composer'

export type ETLServiceVendor =
  | 'talend'
  | 'informatica'
  | 'apache-nifi'
  | 'pentaho'
  | 'matillion'
  | 'fivetran'

export type DataLakeVendor =
  | 'aws-s3-data-lake'
  | 'azure-data-lake'
  | 'google-cloud-storage'
  | 'hadoop-hdfs'
  | 'databricks-delta'

export type MLServiceVendor =
  | 'aws-sagemaker'
  | 'azure-machine-learning'
  | 'google-cloud-ai'
  | 'databricks-ml'
  | 'h2o-ai'

export type NotificationServiceVendor =
  | 'aws-sns'
  | 'firebase-cloud-messaging'
  | 'onesignal'
  | 'pusher'
  | 'twilio-notify'

export type EmailServiceVendor =
  | 'sendgrid'
  | 'aws-ses'
  | 'mailgun'
  | 'postmark'
  | 'mailchimp'

export type SMSGatewayVendor =
  | 'twilio'
  | 'aws-sns-sms'
  | 'nexmo'
  | 'messagebird'
  | 'plivo'

export type ProxyVendor =
  | 'nginx'
  | 'haproxy'
  | 'squid'
  | 'traefik'
  | 'envoy'

export type VPNGatewayVendor =
  | 'openvpn'
  | 'wireguard'
  | 'aws-vpn'
  | 'azure-vpn'
  | 'fortinet'

export type DNSServiceVendor =
  | 'aws-route53'
  | 'cloudflare-dns'
  | 'google-cloud-dns'
  | 'azure-dns'
  | 'dyn'

export type BackupServiceVendor =
  | 'aws-backup'
  | 'azure-backup'
  | 'google-cloud-backup'
  | 'veeam'
  | 'acronis'
  | 'commvault'
  | 'veritas-netbackup'

export type AnalyticsServiceVendor =
  | 'google-analytics'
  | 'mixpanel'
  | 'amplitude'
  | 'segment'
  | 'snowplow'
  | 'adobe-analytics'

export type BusinessIntelligenceVendor =
  | 'tableau'
  | 'power-bi'
  | 'qlik'
  | 'looker'
  | 'metabase'
  | 'superset'

// Конфигурации для новых компонентов
export interface QueueConfig {
  vendor?: QueueVendor
  queueType?: 'fifo' | 'standard' | 'priority'
  visibilityTimeout?: number
  messageRetention?: number
}

export interface EventBusConfig {
  vendor?: EventBusVendor
  eventTypes?: string[]
  routingRules?: string[]
}

export interface StreamProcessorConfig {
  vendor?: StreamProcessorVendor
  processingMode?: 'real-time' | 'batch' | 'hybrid'
  windowSize?: string
}

export interface SearchEngineConfig {
  vendor?: SearchEngineVendor
  indexCount?: number
  documentCount?: number
  searchFields?: string[]
}

export interface GraphDatabaseConfig {
  vendor?: GraphDatabaseVendor
  nodeCount?: number
  relationshipCount?: number
}

export interface TimeSeriesDatabaseConfig {
  vendor?: TimeSeriesDatabaseVendor
  retentionPeriod?: string
  metricsCount?: number
}

export interface ServiceMeshConfig {
  vendor?: ServiceMeshVendor
  trafficPolicy?: string
  securityPolicy?: string
}

export interface ConfigurationManagementConfig {
  vendor?: ConfigurationManagementVendor
  configCount?: number
  secretCount?: number
}

export interface CICDPipelineConfig {
  vendor?: CICDPipelineVendor
  pipelineCount?: number
  buildFrequency?: string
}

export interface IdentityProviderConfig {
  vendor?: IdentityProviderVendor
  userCount?: number
  protocol?: 'oauth2' | 'saml' | 'openid-connect'
}

export interface SecretManagementConfig {
  vendor?: SecretManagementVendor
  secretCount?: number
  rotationPolicy?: string
}

export interface IntegrationPlatformConfig {
  vendor?: IntegrationPlatformVendor
  integrationCount?: number
  connectorTypes?: string[]
}

export interface BatchProcessorConfig {
  vendor?: BatchProcessorVendor
  jobCount?: number
  schedule?: string
}

export interface ETLServiceConfig {
  vendor?: ETLServiceVendor
  pipelineCount?: number
  dataSourceCount?: number
}

export interface DataLakeConfig {
  vendor?: DataLakeVendor
  storageSize?: string
  dataFormat?: 'parquet' | 'json' | 'csv' | 'avro'
}

export interface MLServiceConfig {
  vendor?: MLServiceVendor
  modelCount?: number
  trainingFrequency?: string
}

export interface NotificationServiceConfig {
  vendor?: NotificationServiceVendor
  channelTypes?: ('push' | 'email' | 'sms' | 'webhook')[]
  subscriberCount?: number
}

export interface EmailServiceConfig {
  vendor?: EmailServiceVendor
  dailyLimit?: number
  templatesCount?: number
}

export interface SMSGatewayConfig {
  vendor?: SMSGatewayVendor
  dailyLimit?: number
  region?: string
}

export interface ProxyConfig {
  vendor?: ProxyVendor
  proxyType?: 'forward' | 'reverse' | 'transparent'
  rulesCount?: number
}

export interface VPNGatewayConfig {
  vendor?: VPNGatewayVendor
  connectionCount?: number
  protocol?: 'ipsec' | 'ssl' | 'wireguard'
}

export interface DNSServiceConfig {
  vendor?: DNSServiceVendor
  domainCount?: number
  recordCount?: number
}

export interface BackupServiceConfig {
  vendor?: BackupServiceVendor
  backupFrequency?: 'daily' | 'weekly' | 'monthly' | 'continuous'
  retentionPeriod?: string
  backupType?: 'full' | 'incremental' | 'differential'
}

export interface AnalyticsServiceConfig {
  vendor?: AnalyticsServiceVendor
  eventCount?: number
  userCount?: number
  dashboardCount?: number
}

export interface BusinessIntelligenceConfig {
  vendor?: BusinessIntelligenceVendor
  dashboardCount?: number
  reportCount?: number
  dataSourceCount?: number
}

export interface ComponentData {
  type: ComponentType
  label: string
  connectionType: 'sync' | 'async'
  link?: ComponentLink
  comment?: string // Комментарий/аннотация к компоненту
  groupId?: string // ID группы для группировки компонентов
  status?: 'new' | 'existing' // Статус компонента: новый или существующий
  databaseConfig?: DatabaseConfig
  cacheConfig?: CacheConfig
  serviceConfig?: ServiceConfig
  frontendConfig?: FrontendConfig
  dataWarehouseConfig?: DataWarehouseConfig
  objectStorageConfig?: ObjectStorageConfig
  messageBrokerConfig?: MessageBrokerConfig
  cdnConfig?: CDNConfig
  lambdaConfig?: LambdaConfig
  authServiceConfig?: AuthServiceConfig
  firewallConfig?: FirewallConfig
  loadBalancerConfig?: LoadBalancerConfig
  apiGatewayConfig?: ApiGatewayConfig
  esbConfig?: ESBConfig
  systemConfig?: SystemConfig
  containerConfig?: ContainerConfig
  groupConfig?: GroupConfig
  classConfig?: ClassConfig
  controllerConfig?: ControllerConfig
  repositoryConfig?: RepositoryConfig
  queueConfig?: QueueConfig
  eventBusConfig?: EventBusConfig
  streamProcessorConfig?: StreamProcessorConfig
  searchEngineConfig?: SearchEngineConfig
  graphDatabaseConfig?: GraphDatabaseConfig
  timeSeriesDatabaseConfig?: TimeSeriesDatabaseConfig
  serviceMeshConfig?: ServiceMeshConfig
  configurationManagementConfig?: ConfigurationManagementConfig
  ciCdPipelineConfig?: CICDPipelineConfig
  identityProviderConfig?: IdentityProviderConfig
  secretManagementConfig?: SecretManagementConfig
  integrationPlatformConfig?: IntegrationPlatformConfig
  batchProcessorConfig?: BatchProcessorConfig
  etlServiceConfig?: ETLServiceConfig
  dataLakeConfig?: DataLakeConfig
  mlServiceConfig?: MLServiceConfig
  notificationServiceConfig?: NotificationServiceConfig
  emailServiceConfig?: EmailServiceConfig
  smsGatewayConfig?: SMSGatewayConfig
  proxyConfig?: ProxyConfig
  vpnGatewayConfig?: VPNGatewayConfig
  dnsServiceConfig?: DNSServiceConfig
  backupServiceConfig?: BackupServiceConfig
  analyticsServiceConfig?: AnalyticsServiceConfig
  businessIntelligenceConfig?: BusinessIntelligenceConfig
}

export interface DatabaseReplicationConfig {
  approach: ReplicationApproach
  tool?: ReplicationTool
}

export type ObjectStorageDirection = 'upload' | 'download' | 'bidirectional'

export type EdgePathType = 'straight' | 'step' | 'smoothstep'

export interface Waypoint {
  x: number
  y: number
  id?: string // Уникальный ID для каждого waypoint
}

export interface ConnectionData {
  connectionType: ConnectionType
  replicationConfig?: DatabaseReplicationConfig
  // Контрольные точки для перетаскивания стрелок (массив для поддержки нескольких точек изгиба)
  waypoints?: Waypoint[]
  // Обратная совместимость: старые одиночные waypoint координаты
  waypointX?: number
  waypointY?: number
  // Тип линии: прямая, прямоугольная, прямоугольная со скруглением
  pathType?: EdgePathType
  // X-координата вертикального сегмента для прямоугольных линий (для смещения по горизонтали)
  verticalSegmentX?: number
}

