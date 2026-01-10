import { Node, Edge } from 'reactflow'

export interface ArchitectureCase {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'god'
  description: string
  businessGoals?: string[]
  businessRequirements: string[]
  functionalRequirements?: string[]
  nonFunctionalRequirements?: string[]
  qualityAttributes: string[]
  expectedComponents?: string[]
  recommendedTactics?: {
    qualityAttribute: string
    tactic: string
    description: string
    components?: string[]
    implementationSteps?: {
      step: number
      action: string
      details: string
      connections?: {
        from: string
        to: string
        type: string
        purpose: string
      }[]
    }[]
  }[]
}

export interface RoadmapStep {
  title: string
  description: string
  componentsToAdd?: string[]
  connectionsToAdd?: {
    from: string
    to: string
    type: string
    description?: string
  }[]
}

export interface ArchitectureEvaluation {
  score: number // 0-100
  correctDecisions: string[]
  missedRequirements: string[]
  optimizationSuggestions: string[]
  roadmapTo100: RoadmapStep[]
  summary: string
}

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
  | 'security-engineer'
  | 'qa-engineer'
  | 'dba'
  | 'designer'
  | 'sre-engineer'
  | 'data-scientist'
  | 'support'
  | 'compliance-officer'
  | 'cloud-hosting'
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
  | 'table'
  | 'data-quality'
  | 'data-observability'
  | 'metadata-catalog'
  | 'reverse-etl'
  | 'feature-store'
  | 'cdc-service'
  | 'lakehouse'
  | 'business-process'
  | 'dashboard'
  | 'vpc'
  | 'subnet'
  | 'routing-table'
  | 'internet-gateway'
  | 'nat-gateway'
  | 'transit-gateway'
  | 'direct-connect'
  | 'container-registry'
  | 'waf'
  | 'shield'
  | 'hsm'
  | 'kms'
  | 'iam-policy'
  | 'security-group'
  | 'soc-siem'
  | 'block-storage'
  | 'file-storage'
  | 'archive-storage'
  | 'payment-gateway'
  | 'workflow-engine'
  | 'scheduler'
  | 'state-machine'
  | 'crm'
  | 'erp'
  | 'billing-system'
  | 'data-mesh-node'
  | 'data-governance'
  | 'schema-registry'
  | 'master-data-management'
  | 'media-transcoder'
  | 'media-streaming'
  | 'volume'
  | 'cpu'
  | 'worker'
  | 'background-task'
  | 'feature-flags'
  | 'health-check'
  | 'config-store'
  | 'vcs'
  | 'customer'
  | 'developer'
  | 'analyst'
  | 'devops'
  | 'architect'
  | 'product-manager'
  | 'team'
  | 'image'


export type ConnectionType = 'rest' | 'grpc' | 'async' | 'get-information' | 'send-information' | 'database-connection' | 'database-replication' | 'cache-connection' | 'dependency' | 'composition' | 'aggregation' | 'method-call' | 'inheritance' | 'bidirectional' | 'async-bidirectional' | 'relationship'

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
  | 'qlik-replicate'
  | 'striim'
  | 'dbvisit'
  | 'attunity'

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
  foreignKey?: {
    targetTableId: string
    targetColumnName: string
  }
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

export type CacheVendor =
  | 'redis'
  | 'memcached'
  | 'hazelcast'
  | 'ehcache'
  | 'infinispan'

export interface CacheConfig {
  cacheType?: CacheType
  vendor?: CacheVendor
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
  | 'teradata'
  | 'clickhouse'
  | 'greenplum'
  | 'synapse'
  | 'databricks-sql'

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
  | 'google-pub-sub'
  | 'confluent-cloud'
  | 'aws-msk'
  | 'azure-event-hubs'
  | 'amazon-kinesis'
  | 'ibm-mq'
  | 'activemq'

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

export interface ServiceEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description?: string
}

export interface ServiceConfig {
  language?: ServiceLanguage
  endpoints?: ServiceEndpoint[]
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
  vendor?: ContainerVendor
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
  | 'snaplogic'
  | 'jitterbit'
  | 'wso2'
  | 'boomi'
  | 'mulesoft'

export type BatchProcessorVendor =
  | 'apache-airflow'
  | 'luigi'
  | 'prefect'
  | 'aws-batch'
  | 'azure-batch'
  | 'google-cloud-composer'
  | 'prefect'
  | 'dagster'
  | 'argo-workflows'
  | 'kubeflow'
  | 'step-functions'
  | 'dask'
  | 'apache-beam'
  | 'spring-batch'

export type ETLServiceVendor =
  | 'talend'
  | 'informatica'
  | 'apache-nifi'
  | 'pentaho'
  | 'matillion'
  | 'fivetran'
  | 'airbyte'
  | 'stitch'
  | 'hevo'
  | 'rivery'
  | 'integrate-io'
  | 'xplenty'
  | 'estuary'
  | 'portable'
  | 'dbt'
  | 'informatica'
  | 'talend'
  | 'ibm-datastage'
  | 'sap-data-services'
  | 'pentaho'
  | 'ab-initio'
  | 'cloverdx'
  | 'oracle-odi'
  | 'aws-glue'
  | 'azure-data-factory'
  | 'google-data-fusion'
  | 'sap-data-intelligence'

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

export type OrchestratorVendor =
  | 'kubernetes'
  | 'docker-swarm'
  | 'openshift'
  | 'nomad'
  | 'ecs'
  | 'eks'
  | 'aks'
  | 'gke'

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
  | 'google-backup'
  | 'rubrik'

export type VCSVendor =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'azure-devops'
  | 'aws-codecommit'
  | 'gitea'

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

export type VectorDatabaseVendor =
  | 'pinecone'
  | 'milvus'
  | 'weaviate'
  | 'qdrant'
  | 'chroma'
  | 'faiss'
  | 'zilliz'
  | 'elastic-vector'
  | 'pgvector'

export type CDCServiceVendor =
  | 'debezium'
  | 'qlik-replicate'
  | 'oracle-goldengate'
  | 'aws-dms'
  | 'striim'
  | 'fivetran-cdc'
  | 'airbyte-cdc'
  | 'dbvisit'

export type LakehouseVendor =
  | 'databricks'
  | 'delta-lake'
  | 'apache-iceberg'
  | 'apache-hudi'

export type DataQualityVendor =
  | 'great-expectations'
  | 'soda'
  | 'monte-carlo'
  | 'bigeye'
  | 'deequ'
  | 'talend-dq'
  | 'informatica-dq'

export type DataObservabilityVendor =
  | 'databand'
  | 'whylabs'
  | 'metaplane'
  | 'anomalo'

export type MetadataCatalogVendor =
  | 'apache-atlas'
  | 'datahub'
  | 'amundsen'
  | 'collibra'
  | 'alation'
  | 'atlan'
  | 'openmetadata'

export type ReverseETLVendor =
  | 'hightouch'
  | 'census'
  | 'polytomic'

export type FeatureStoreVendor =
  | 'feast'
  | 'tecton'
  | 'hopsworks'

export type WorkflowEngineVendor =
  | 'temporal'
  | 'camunda'
  | 'airflow'
  | 'prefect'
  | 'n8n'
  | 'dagster'
  | 'argo-workflows'
  | 'conductor'
  | 'logic-apps'
  | 'step-functions'
  | 'dkron'

export interface WorkflowEngineConfig {
  vendor?: WorkflowEngineVendor
  version?: string
  workflowCount?: number
}

export type SchedulerVendor =
  | 'cron'
  | 'quartz'
  | 'hangfire'
  | 'aws-cloudwatch-events'
  | 'google-cloud-scheduler'
  | 'azure-scheduler'
  | 'apache-airflow'
  | 'rundeck'
  | 'celery-beat'
  | 'kubernetes-cronjob'

export interface SchedulerConfig {
  vendor?: SchedulerVendor
  schedule?: string // cron expression
  timezone?: string
}

export type SOCSIEMVendor =
  | 'splunk'
  | 'elastic-security'
  | 'azure-sentinel'
  | 'aws-security-hub'
  | 'google-chronicle'
  | 'datadog'
  | 'ibm-qradar'
  | 'alienvault'
  | 'rapid7'
  | 'wazuh'

export interface SOCSIEMConfig {
  vendor?: SOCSIEMVendor
  logRetentionDays?: number
  features?: string[]
}

export type MonitoringVendor =
  | 'prometheus'
  | 'grafana'
  | 'datadog'
  | 'new-relic'
  | 'zabbix'
  | 'nagios'
  | 'dynatrace'
  | 'appdynamics'
  | 'aws-cloudwatch'
  | 'google-cloud-monitoring'
  | 'azure-monitor'

export interface MonitoringConfig {
  vendor?: MonitoringVendor
  metricsRetentionDays?: number
}

export type LoggingVendor =
  | 'elastic-stack'
  | 'fluentd'
  | 'graylog'
  | 'splunk'
  | 'datadog-logs'
  | 'aws-cloudwatch-logs'
  | 'google-cloud-logging'
  | 'loki'
  | 'rsyslog'

export interface LoggingConfig {
  vendor?: LoggingVendor
  logRetentionDays?: number
}

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

export interface CDCServiceConfig {
  vendor?: CDCServiceVendor
  sourceSystems?: string[]
  targetSystems?: string[]
}

export interface LakehouseConfig {
  vendor?: LakehouseVendor
  tableFormats?: ('delta' | 'iceberg' | 'hudi')[]
  storagePlatform?: string
}

export interface DataQualityConfig {
  vendor?: DataQualityVendor
  rulesCount?: number
  monitoredTables?: string[]
}

export interface DataObservabilityConfig {
  vendor?: DataObservabilityVendor
  monitoredPipelines?: string[]
  incidentCount?: number
}

export interface MetadataCatalogConfig {
  vendor?: MetadataCatalogVendor
  assetCount?: number
  lineageEnabled?: boolean
}

export interface ReverseETLConfig {
  vendor?: ReverseETLVendor
  syncCount?: number
  targetSaaS?: string[]
}

export interface FeatureStoreConfig {
  vendor?: FeatureStoreVendor
  featureCount?: number
  onlineStorage?: string
  offlineStorage?: string
}

export interface OrchestratorConfig {
  vendor?: OrchestratorVendor
  clusterSize?: number
  version?: string
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


export interface ServerConfig {
  vendor?: ServerVendor
  osVersion?: string
  cpu?: string
}

export interface WebServerConfig {
  vendor?: WebServerVendor
  port?: number
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

export interface VectorDatabaseConfig {
  vendor?: VectorDatabaseVendor
  dimensions?: number
  indexType?: 'hnsw' | 'ivf' | 'flat' | 'diskann'
  distanceMetric?: 'cosine' | 'euclidean' | 'dot-product'
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

export interface BusinessProcessConfig {
  childNodes?: string[]
  isManuallyResized?: boolean
}


export type ServerVendor = 'linux' | 'windows' | 'bare-metal' | 'vmware' | 'ec2' | 'gce' | 'azure-vm'
export type WebServerVendor = 'nginx' | 'apache' | 'iis' | 'caddy' | 'tomcat'
export type ContainerVendor = 'docker' | 'podman' | 'lxc' | 'containerd' // Fixed typo

// New Vendor Types
export type InternetGatewayVendor = 'aws-igw' | 'azure-gateway' | 'google-cloud-gateway' | 'cisco' | 'juniper'
export type NATGatewayVendor = 'aws-nat' | 'azure-nat' | 'google-cloud-nat' | 'pfsense'
export type IoTGatewayVendor = 'aws-iot-greengrass' | 'azure-iot-edge' | 'kafka-connect' | 'hivemq'
export type EdgeComputingVendor = 'cloudflare-workers' | 'lambda-edge' | 'vercel-edge' | 'fly-io'
export type BlockStorageVendor = 'ebs' | 'azure-disk' | 'gcp-pd' | 'ceph'
export type FileStorageVendor = 'efs' | 'azure-files' | 'gcp-filestore' | 'glusterfs'
export type ArchiveStorageVendor = 'glacier' | 'azure-archive' | 'gcp-archive'
export type LLMModelVendor = 'gpt-4' | 'claude-3' | 'llama-3' | 'gemini' | 'mistral'
export type AIAgentVendor = 'langchain' | 'autogen' | 'crewai' | 'superagi'
export type MLTrainingVendor = 'sagemaker' | 'vertex-ai' | 'azure-ml' | 'databricks'
export type MLInferenceVendor = 'sagemaker-endpoints' | 'vertex-prediction' | 'kserve' | 'vllm'
export type MLDataPipelineVendor = 'airflow' | 'prefect' | 'dagster' | 'kubeflow'
export type ClientVendor = 'web-client' | 'mobile-client' | 'desktop-client' | 'iot-device' | 'external-user' | 'internal-user'

// New Vendors Step 192
export type MDMVendor = 'informatica-mdm' | 'tibco-ebx' | 'semarchy' | 'ataccama'
export type ServiceDiscoveryVendor = 'consul' | 'etcd' | 'zookeeper' | 'eureka' | 'coredns'
export type VPCVendor = 'aws-vpc' | 'azure-vnet' | 'gcp-vpc' | 'oci-vcn'
export type SubnetVendor = 'public-subnet' | 'private-subnet' | 'isolated-subnet'
export type RoutingTableVendor = 'aws-route-table' | 'azure-route-table' | 'gcp-routes'
export type WAFVendor = 'aws-waf' | 'azure-waf' | 'cloudflare-waf' | 'imperva' | 'f5-big-ip'
export type DDoSProtectionVendor = 'aws-shield' | 'azure-ddos' | 'cloudflare-ddos' | 'akamai-prolexic'
export type HSMVendor = 'aws-cloudhsm' | 'azure-dedicated-hsm' | 'google-cloud-hsm' | 'thales'
export type KMSVendor = 'aws-kms' | 'azure-key-vault' | 'google-kms' | 'hashicorp-vault'
export type TransitGatewayVendor = 'aws-transit-gateway' | 'azure-virtual-wan' | 'google-ncc'
export type DirectConnectVendor = 'aws-direct-connect' | 'azure-expressroute' | 'google-interconnect'
export type ContainerRegistryVendor = 'ecr' | 'acr' | 'gcr' | 'docker-hub' | 'harbor'



export interface ServerConfig {
  vendor?: ServerVendor
  osVersion?: string
  cpu?: string
  childNodes?: string[]
  isManuallyResized?: boolean
}

export interface WebServerConfig {
  vendor?: WebServerVendor
  port?: number
}

// Restored Configs
export interface MonitoringConfig {
  vendor?: MonitoringVendor
  metricsRetentionDays?: number
}

export interface LoggingConfig {
  vendor?: LoggingVendor
  logRetentionDays?: number
}

export interface EmailServiceConfig {
  vendor?: EmailServiceVendor
  dailyLimit?: number
  templatesCount?: number
}

export interface SMSGatewayConfig {
  vendor?: SMSGatewayVendor
  throughput?: number
}

export interface DNSServiceConfig {
  vendor?: DNSServiceVendor
  zoneCount?: number
}

// New Configs
export interface InternetGatewayConfig { vendor?: InternetGatewayVendor }
export interface NATGatewayConfig { vendor?: NATGatewayVendor }
export interface IoTGatewayConfig { vendor?: IoTGatewayVendor }
export interface EdgeComputingConfig { vendor?: EdgeComputingVendor }
export interface BlockStorageConfig { vendor?: BlockStorageVendor }
export interface FileStorageConfig { vendor?: FileStorageVendor }
export interface ArchiveStorageConfig { vendor?: ArchiveStorageVendor }
export interface LLMModelConfig { vendor?: LLMModelVendor }
export interface AIAgentConfig { vendor?: AIAgentVendor }
export interface MLTrainingConfig { vendor?: MLTrainingVendor }
export interface MLInferenceConfig { vendor?: MLInferenceVendor }
export interface MLDataPipelineConfig { vendor?: MLDataPipelineVendor }

// New Configs Step 192
export interface MDMConfig { vendor?: MDMVendor }
export interface ServiceDiscoveryConfig { vendor?: ServiceDiscoveryVendor }
export interface VPCConfig { vendor?: VPCVendor }
export interface SubnetConfig { vendor?: SubnetVendor }
export interface RoutingTableConfig { vendor?: RoutingTableVendor }
export interface WAFConfig { vendor?: WAFVendor }
export interface DDoSProtectionConfig { vendor?: DDoSProtectionVendor }
export interface HSMConfig { vendor?: HSMVendor }
export interface KMSConfig { vendor?: KMSVendor }
export interface TransitGatewayConfig { vendor?: TransitGatewayVendor }
export interface DirectConnectConfig { vendor?: DirectConnectVendor }
export interface ContainerRegistryConfig { vendor?: ContainerRegistryVendor }
export interface ClientConfig { vendor?: ClientVendor }


export interface ImageConfig {
  dataURL: string
  width?: number
  height?: number
}


export interface ComponentData {
  type: ComponentType
  label: string
  connectionType: 'sync' | 'async'
  link?: ComponentLink
  color?: string // Кастомный цвет компонента
  comment?: string // Комментарий/аннотация к компоненту
  groupId?: string // ID группы для группировки компонентов
  status?: 'new' | 'existing' // Статус компонента: новый или существующий
  tableConfig?: DatabaseTable
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
  orchestratorConfig?: OrchestratorConfig
  vectorDatabaseConfig?: VectorDatabaseConfig
  cdcServiceConfig?: CDCServiceConfig
  lakehouseConfig?: LakehouseConfig
  dataQualityConfig?: DataQualityConfig
  dataObservabilityConfig?: DataObservabilityConfig
  metadataCatalogConfig?: MetadataCatalogConfig
  reverseEtlConfig?: ReverseETLConfig
  featureStoreConfig?: FeatureStoreConfig
  businessProcessConfig?: BusinessProcessConfig
  workflowEngineConfig?: WorkflowEngineConfig
  schedulerConfig?: SchedulerConfig
  socSiemConfig?: SOCSIEMConfig
  monitoringConfig?: MonitoringConfig
  imageConfig?: ImageConfig
  loggingConfig?: LoggingConfig
  serverConfig?: ServerConfig
  webServerConfig?: WebServerConfig
  internetGatewayConfig?: InternetGatewayConfig
  natGatewayConfig?: NATGatewayConfig
  iotGatewayConfig?: IoTGatewayConfig
  edgeComputingConfig?: EdgeComputingConfig
  blockStorageConfig?: BlockStorageConfig
  fileStorageConfig?: FileStorageConfig
  archiveStorageConfig?: ArchiveStorageConfig
  llmModelConfig?: LLMModelConfig
  aiAgentConfig?: AIAgentConfig
  mlTrainingConfig?: MLTrainingConfig
  mlInferenceConfig?: MLInferenceConfig
  mlDataPipelineConfig?: MLDataPipelineConfig
  mdmConfig?: MDMConfig
  serviceDiscoveryConfig?: ServiceDiscoveryConfig // Not to be confused with ServiceMesh
  vpcConfig?: VPCConfig
  subnetConfig?: SubnetConfig
  routingTableConfig?: RoutingTableConfig
  wafConfig?: WAFConfig
  ddosProtectionConfig?: DDoSProtectionConfig
  hsmConfig?: HSMConfig
  kmsConfig?: KMSConfig
  transitGatewayConfig?: TransitGatewayConfig
  directConnectConfig?: DirectConnectConfig
  containerRegistryConfig?: ContainerRegistryConfig
  clientConfig?: ClientConfig

  // Generic expandable frame properties
  isExpanded?: boolean
  childNodes?: string[]
  isManuallyResized?: boolean
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
  relationshipType?: '1:1' | '1:n' | 'n:1' | 'n:m'
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

export interface LearningHistoryItem {
  timestamp: number
  score: number
  summary: string
  correctDecisions: string[]
  missedRequirements: string[]
  optimizationSuggestions: string[]
}

export interface LearningProject {
  id: string
  version: string
  lastModified: number
  case: ArchitectureCase
  nodes: Node[]
  edges: Edge[]
  chatMessages: { role: 'user' | 'assistant'; content: string }[]
  history: LearningHistoryItem[]
  currentEvaluation: ArchitectureEvaluation | null
}

export interface Workspace {
  id: string
  name: string
  nodes: Node[]
  edges: Edge[]
  viewport?: { x: number; y: number; zoom: number }
  isLocked?: boolean
}

// Animation-related types
export interface AnimationSettings {
  speed: number // 0.5 - 3.0
  direction: 'forward' | 'bidirectional'
  particleDensity: number // 1 - 10
  loopMode: boolean
}

export interface RecordingState {
  isRecording: boolean
  startTime: number | null
  duration: number
}
