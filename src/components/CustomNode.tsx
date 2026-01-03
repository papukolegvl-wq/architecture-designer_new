import React, { useState, useEffect, useRef } from 'react'
import { Handle, Position, NodeProps, useStore } from 'reactflow'
import { ComponentData, ComponentType, ComponentLink } from '../types'
import {
  Server,
  Database,
  MessageSquare,
  Globe,
  HardDrive,
  Cloud,
  Zap,
  Shield,
  Loader,
  Box,
  Warehouse,
  Lock,
  Network,
  GitBranch,
  Info,
  User,
  ExternalLink,
  Settings,
  Archive,
  Code,
  Container,
  Search,
  Activity,
  FileText,
  Link as LinkIcon,
  Link2,
  Layers,
  BarChart3,
  Key,
  FileCode,
  Clock,
  Cpu,
  Wifi,
  Mail,
  MessageCircle,
  Sparkles,
  CheckCircle,
  Brain,
  Bot,
  Workflow,
  Table as TableIcon,
} from 'lucide-react'

const componentIcons: Record<string, React.ReactNode> = {
  frontend: <Globe size={32} />,
  service: <Server size={32} />,
  'auth-service': <Lock size={32} />,
  database: <Database size={32} />,
  'data-warehouse': <Warehouse size={32} />,
  'message-broker': <MessageSquare size={32} />,
  'api-gateway': <Network size={32} />,
  cache: <HardDrive size={32} />,
  'object-storage': <Box size={32} />,
  cdn: <Cloud size={32} />,
  lambda: <Zap size={32} />,
  'load-balancer': <Loader size={32} />,
  firewall: <Shield size={32} />,
  esb: <GitBranch size={32} />,
  client: <User size={32} />,
  'external-system': <ExternalLink size={32} />,
  controller: <Settings size={32} />,
  repository: <Archive size={32} />,
  class: <Code size={32} />,
  server: <Server size={32} />,
  container: <Container size={32} />,
  orchestrator: <Layers size={32} />,
  group: <Layers size={32} />,
  'service-discovery': <Search size={32} />,
  'web-server': <Globe size={32} />,
  monitoring: <Activity size={32} />,
  logging: <FileText size={32} />,
  queue: <MessageSquare size={32} />,
  'event-bus': <Layers size={32} />,
  'stream-processor': <Zap size={32} />,
  'search-engine': <Search size={32} />,
  'analytics-service': <BarChart3 size={32} />,
  'business-intelligence': <BarChart3 size={32} />,
  'graph-database': <Network size={32} />,
  'time-series-database': <Clock size={32} />,
  'service-mesh': <Network size={32} />,
  'configuration-management': <Settings size={32} />,
  'ci-cd-pipeline': <GitBranch size={32} />,
  'backup-service': <HardDrive size={32} />,
  'identity-provider': <Key size={32} />,
  'secret-management': <Lock size={32} />,
  'api-client': <LinkIcon size={32} />,
  'api-documentation': <FileCode size={32} />,
  'integration-platform': <GitBranch size={32} />,
  'batch-processor': <Cpu size={32} />,
  'etl-service': <Database size={32} />,
  'data-lake': <Warehouse size={32} />,
  'edge-computing': <Cpu size={32} />,
  'iot-gateway': <Wifi size={32} />,
  blockchain: <LinkIcon size={32} />,
  'ml-ai-service': <Sparkles size={32} />,
  'llm-model': <Brain size={32} />,
  'vector-database': <Database size={32} />,
  'ai-agent': <Bot size={32} />,
  'ml-training': <Activity size={32} />,
  'ml-inference': <Cpu size={32} />,
  'ml-data-pipeline': <Workflow size={32} />,
  'gpu-cluster': <Server size={32} />,
  'notification-service': <MessageCircle size={32} />,
  'email-service': <Mail size={32} />,
  'sms-gateway': <MessageCircle size={32} />,
  proxy: <Server size={32} />,
  'vpn-gateway': <Shield size={32} />,
  'dns-service': <Globe size={32} />,
  'system-component': <Box size={32} />,
  table: <TableIcon size={32} />,
}

const componentColors: Record<string, string> = {
  frontend: '#339af0',
  service: '#4dabf7',
  'auth-service': '#ff6b6b',
  database: '#51cf66',
  'data-warehouse': '#20c997',
  'message-broker': '#ffd43b',
  'api-gateway': '#ff6b6b',
  cache: '#845ef7',
  'object-storage': '#fd7e14',
  cdn: '#51cf66',
  lambda: '#ffd43b',
  'load-balancer': '#4dabf7',
  firewall: '#dc3545',
  esb: '#9c88ff',
  client: '#ff8787',
  'external-system': '#ffa94d',
  controller: '#4dabf7',
  repository: '#51cf66',
  class: '#845ef7',
  server: '#339af0',
  container: '#51cf66',
  orchestrator: '#20c997',
  'service-discovery': '#4dabf7',
  'web-server': '#51cf66',
  monitoring: '#ff6b6b',
  logging: '#ffa94d',
  queue: '#ffd43b',
  'event-bus': '#845ef7',
  'stream-processor': '#4dabf7',
  'search-engine': '#20c997',
  'analytics-service': '#339af0',
  'business-intelligence': '#4dabf7',
  'graph-database': '#51cf66',
  'time-series-database': '#845ef7',
  'service-mesh': '#9c88ff',
  'configuration-management': '#ffa94d',
  'ci-cd-pipeline': '#20c997',
  'backup-service': '#666',
  'identity-provider': '#ff6b6b',
  'secret-management': '#dc3545',
  'api-client': '#4dabf7',
  'api-documentation': '#339af0',
  'integration-platform': '#9c88ff',
  'batch-processor': '#845ef7',
  'etl-service': '#20c997',
  'data-lake': '#51cf66',
  'edge-computing': '#ffa94d',
  'iot-gateway': '#4dabf7',
  blockchain: '#333',
  'ml-ai-service': '#fab005',
  'llm-model': '#ae3ec9',
  'vector-database': '#748ffc',
  'ai-agent': '#f03e3e',
  'ml-training': '#fcc419',
  'ml-inference': '#37b24d',
  'ml-data-pipeline': '#4dabf7',
  'gpu-cluster': '#228be6',
  'notification-service': '#ffd43b',
  'email-service': '#339af0',
  'sms-gateway': '#4dabf7',
  proxy: '#666',
  'vpn-gateway': '#dc3545',
  'dns-service': '#51cf66',
  table: '#5C7CFA',
}

interface CustomNodeProps extends NodeProps<ComponentData> {
  onInfoClick?: (componentType: ComponentType) => void
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onCommentClick?: (nodeId: string) => void
  onStatusChange?: (nodeId: string, status: 'new' | 'existing') => void
}

function CustomNode({ data, selected, id, onInfoClick, onLinkClick, onLinkConfigClick, onStatusChange }: CustomNodeProps) {
  const icon = componentIcons[data.type] || <Server size={32} />
  const color = componentColors[data.type] || '#4dabf7'
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [label, setLabel] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const zoom = useStore((s) => s.transform[2])
  const connectedHandleIds = useStore((s) => {
    // Оптимизированный селектор: фильтруем только те грани, которые связаны с этим узлом
    const ids: string[] = []
    for (const e of s.edges) {
      if (e.source === id && e.sourceHandle) ids.push(e.sourceHandle)
      if (e.target === id && e.targetHandle) ids.push(e.targetHandle)
    }
    return ids
  }, (a, b) => JSON.stringify(a) === JSON.stringify(b));

  const isConnecting = useStore((s) => !!s.connectionStartHandle);
  const isSimple = zoom < 0.4
  const isMedium = zoom < 0.7

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onInfoClick) {
      onInfoClick(data.type)
    }
  }

  useEffect(() => {
    setLabel(data.label)
  }, [data.label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (selected) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (label.trim() && label !== data.label) {
      // Обновляем label через изменение data
      const event = new CustomEvent('nodeLabelUpdate', {
        detail: { nodeId: id, label: label.trim() },
      })
      window.dispatchEvent(event)
    } else {
      setLabel(data.label)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Останавливаем распространение события, чтобы глобальный обработчик не удалял компонент
    e.stopPropagation()

    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label)
      setIsEditing(false)
    }
    // Backspace и Delete обрабатываются нормально в input, не блокируем их
  }

  // Определяем подпись для отображения
  const getSubtitle = () => {
    if (data.type === 'database') {
      if (data.databaseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          postgresql: 'PostgreSQL',
          mysql: 'MySQL',
          oracle: 'Oracle',
          'sql-server': 'SQL Server',
          mongodb: 'MongoDB',
          elasticsearch: 'Elasticsearch',
          cassandra: 'Cassandra',
          redis: 'Redis',
          dynamodb: 'DynamoDB',
          neo4j: 'Neo4j',
          influxdb: 'InfluxDB',
        }
        return vendorLabels[data.databaseConfig.vendor] || 'Database'
      }
      if (data.databaseConfig?.dbType) {
        return data.databaseConfig.dbType === 'sql' ? 'SQL' : 'NoSQL'
      }
      return 'Database'
    } else if (data.type === 'cache') {
      if (data.cacheConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          redis: 'Redis',
          memcached: 'Memcached',
          hazelcast: 'Hazelcast',
          ehcache: 'Ehcache',
          infinispan: 'Infinispan',
        }
        return vendorLabels[data.cacheConfig.vendor] || 'Cache'
      }
      if (data.cacheConfig?.cacheType) {
        return data.cacheConfig.cacheType === 'distributed' ? 'Distributed' : 'In-Memory'
      }
      return 'Cache'
    } else if (data.type === 'frontend') {
      if (data.frontendConfig?.framework) {
        const frameworkLabels: Record<string, string> = {
          react: 'React',
          vue: 'Vue',
          angular: 'Angular',
          svelte: 'Svelte',
          nextjs: 'Next.js',
          nuxt: 'Nuxt',
          vanilla: 'Vanilla JS',
        }
        return frameworkLabels[data.frontendConfig.framework] || 'Frontend'
      }
      return 'Frontend'
    } else if (data.type === 'service') {
      if (data.serviceConfig?.language) {
        const languageLabels: Record<string, string> = {
          java: 'Java',
          python: 'Python',
          nodejs: 'Node.js',
          go: 'Go',
          csharp: 'C#',
          rust: 'Rust',
          kotlin: 'Kotlin',
          scala: 'Scala',
        }
        return languageLabels[data.serviceConfig.language] || 'Service'
      }
      return 'Service'
    } else if (data.type === 'data-warehouse') {
      if (data.dataWarehouseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          snowflake: 'Snowflake',
          redshift: 'Redshift',
          bigquery: 'BigQuery',
          databricks: 'Databricks',
          synapse: 'Synapse',
          teradata: 'Teradata',
        }
        return vendorLabels[data.dataWarehouseConfig.vendor] || 'Data Warehouse'
      }
      return 'Data Warehouse'
    } else if (data.type === 'message-broker') {
      if (data.messageBrokerConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          kafka: 'Kafka',
          rabbitmq: 'RabbitMQ',
          activemq: 'ActiveMQ',
          nats: 'NATS',
          pulsar: 'Pulsar',
          'redis-pubsub': 'Redis Pub/Sub',
          'amazon-sqs': 'SQS',
          'azure-service-bus': 'Service Bus',
        }
        const vendorLabel = vendorLabels[data.messageBrokerConfig.vendor] || 'Broker'
        if (data.messageBrokerConfig.deliveryType) {
          const deliveryLabels: Record<string, string> = {
            push: 'Push',
            pull: 'Pull',
            'pub-sub': 'Pub-Sub',
          }
          return `${vendorLabel} (${deliveryLabels[data.messageBrokerConfig.deliveryType] || data.messageBrokerConfig.deliveryType})`
        }
        return vendorLabel
      }
      return 'Message Broker'
    } else if (data.type === 'lambda') {
      if (data.lambdaConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-lambda': 'AWS Lambda',
          'azure-functions': 'Azure Functions',
          'gcp-cloud-functions': 'GCP Functions',
          vercel: 'Vercel',
          'cloudflare-workers': 'Cloudflare Workers',
        }
        return vendorLabels[data.lambdaConfig.vendor] || 'Lambda'
      }
      return 'Lambda'
    } else if (data.type === 'cdn') {
      if (data.cdnConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          cloudflare: 'Cloudflare',
          'aws-cloudfront': 'CloudFront',
          'azure-cdn': 'Azure CDN',
          'gcp-cdn': 'GCP CDN',
          akamai: 'Akamai',
        }
        return vendorLabels[data.cdnConfig.vendor] || 'CDN'
      }
      return 'CDN'
    } else if (data.type === 'object-storage') {
      if (data.objectStorageConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          s3: 'S3',
          'azure-blob': 'Azure Blob',
          gcs: 'GCS',
          minio: 'MinIO',
        }
        return vendorLabels[data.objectStorageConfig.vendor] || 'Object Storage'
      }
      return 'Object Storage'
    } else if (data.type === 'auth-service') {
      if (data.authServiceConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          auth0: 'Auth0',
          okta: 'Okta',
          keycloak: 'Keycloak',
          'aws-cognito': 'Cognito',
          'azure-ad': 'Azure AD',
          'firebase-auth': 'Firebase Auth',
          oauth2: 'OAuth2',
          jwt: 'JWT',
        }
        return vendorLabels[data.authServiceConfig.vendor] || 'Auth'
      }
      return 'Auth Service'
    } else if (data.type === 'firewall') {
      if (data.firewallConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-waf': 'AWS WAF',
          'azure-waf': 'Azure WAF',
          'cloudflare-waf': 'Cloudflare WAF',
          modsecurity: 'ModSecurity',
          'nginx-waf': 'NGINX WAF',
          fortinet: 'Fortinet',
        }
        return vendorLabels[data.firewallConfig.vendor] || 'Firewall'
      }
      return 'Firewall'
    } else if (data.type === 'load-balancer') {
      if (data.loadBalancerConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          nginx: 'NGINX',
          haproxy: 'HAProxy',
          'aws-alb': 'AWS ALB',
          'azure-lb': 'Azure LB',
          'gcp-lb': 'GCP LB',
          traefik: 'Traefik',
        }
        return vendorLabels[data.loadBalancerConfig.vendor] || 'Load Balancer'
      }
      return 'Load Balancer'
    } else if (data.type === 'api-gateway') {
      if (data.apiGatewayConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-api-gateway': 'AWS API Gateway',
          'azure-api-management': 'Azure API Mgmt',
          kong: 'Kong',
          tyk: 'Tyk',
          apigee: 'Apigee',
          'nginx-plus': 'NGINX Plus',
        }
        return vendorLabels[data.apiGatewayConfig.vendor] || 'API Gateway'
      }
      return 'API Gateway'
    } else if (data.type === 'esb') {
      if (data.esbConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'mule-esb': 'Mule ESB',
          'wso2-esb': 'WSO2 ESB',
          'apache-camel': 'Apache Camel',
          'jboss-fuse': 'JBoss Fuse',
          'tibco-businessworks': 'TIBCO BW',
          'oracle-service-bus': 'Oracle SB',
          'ibm-integration-bus': 'IBM IIB',
        }
        return vendorLabels[data.esbConfig.vendor] || 'ESB'
      }
      return 'ESB'
    } else if (data.type === 'client') {
      return 'Client'
    } else if (data.type === 'external-system') {
      return 'External System'
    } else if (data.type === 'controller') {
      if (data.controllerConfig?.endpoints && data.controllerConfig.endpoints.length > 0) {
        return `${data.controllerConfig.endpoints.length} endpoint(s)`
      }
      return 'Controller'
    } else if (data.type === 'repository') {
      if (data.repositoryConfig?.data && data.repositoryConfig.data.length > 0) {
        return `${data.repositoryConfig.data.length} таблиц(ы)`
      }
      return 'Repository'
    } else if (data.type === 'class') {
      if (data.classConfig?.methods && data.classConfig.methods.length > 0) {
        return `${data.classConfig.methods.length} метод(ов)`
      }
      return 'Class'
    } else if (data.type === 'server') {
      return 'Server'
    } else if (data.type === 'orchestrator') {
      return 'Orchestrator'
    } else if (data.type === 'group') {
      return 'Group'
    } else if (data.type === 'service-discovery') {
      return 'Service Discovery'
    } else if (data.type === 'web-server') {
      return 'Web Server'
    } else if (data.type === 'monitoring') {
      return 'Monitoring'
    } else if (data.type === 'logging') {
      return 'Logging'
    } else if (data.type === 'queue') {
      if (data.queueConfig?.vendor) {
        return data.queueConfig.vendor
      }
      return 'Queue'
    } else if (data.type === 'event-bus') {
      if (data.eventBusConfig?.vendor) {
        return data.eventBusConfig.vendor
      }
      return 'Event Bus'
    } else if (data.type === 'stream-processor') {
      if (data.streamProcessorConfig?.vendor) {
        return data.streamProcessorConfig.vendor
      }
      return 'Stream Processor'
    } else if (data.type === 'search-engine') {
      if (data.searchEngineConfig?.vendor) {
        return data.searchEngineConfig.vendor
      }
      return 'Search Engine'
    } else if (data.type === 'analytics-service') {
      return 'Analytics'
    } else if (data.type === 'business-intelligence') {
      return 'BI'
    } else if (data.type === 'graph-database') {
      if (data.graphDatabaseConfig?.vendor) {
        return data.graphDatabaseConfig.vendor
      }
      return 'Graph DB'
    } else if (data.type === 'time-series-database') {
      if (data.timeSeriesDatabaseConfig?.vendor) {
        return data.timeSeriesDatabaseConfig.vendor
      }
      return 'Time Series DB'
    } else if (data.type === 'service-mesh') {
      if (data.serviceMeshConfig?.vendor) {
        return data.serviceMeshConfig.vendor
      }
      return 'Service Mesh'
    } else if (data.type === 'configuration-management') {
      if (data.configurationManagementConfig?.vendor) {
        return data.configurationManagementConfig.vendor
      }
      return 'Config Management'
    } else if (data.type === 'ci-cd-pipeline') {
      if (data.ciCdPipelineConfig?.vendor) {
        return data.ciCdPipelineConfig.vendor
      }
      return 'CI/CD'
    } else if (data.type === 'backup-service') {
      return 'Backup'
    } else if (data.type === 'identity-provider') {
      if (data.identityProviderConfig?.vendor) {
        return data.identityProviderConfig.vendor
      }
      return 'Identity Provider'
    } else if (data.type === 'secret-management') {
      if (data.secretManagementConfig?.vendor) {
        return data.secretManagementConfig.vendor
      }
      return 'Secret Management'
    } else if (data.type === 'api-client') {
      return 'API Client'
    } else if (data.type === 'api-documentation') {
      return 'API Docs'
    } else if (data.type === 'integration-platform') {
      if (data.integrationPlatformConfig?.vendor) {
        return data.integrationPlatformConfig.vendor
      }
      return 'Integration Platform'
    } else if (data.type === 'batch-processor') {
      if (data.batchProcessorConfig?.vendor) {
        return data.batchProcessorConfig.vendor
      }
      return 'Batch Processor'
    } else if (data.type === 'etl-service') {
      if (data.etlServiceConfig?.vendor) {
        return data.etlServiceConfig.vendor
      }
      return 'ETL Service'
    } else if (data.type === 'data-lake') {
      if (data.dataLakeConfig?.vendor) {
        return data.dataLakeConfig.vendor
      }
      return 'Data Lake'
    } else if (data.type === 'edge-computing') {
      return 'Edge Computing'
    } else if (data.type === 'iot-gateway') {
      return 'IoT Gateway'
    } else if (data.type === 'blockchain') {
      return 'Blockchain'
    } else if (data.type === 'system-component') {
      return 'Система'
    } else if (data.type === 'ml-ai-service') {
      if (data.mlServiceConfig?.vendor) {
        return data.mlServiceConfig.vendor
      }
      return 'ML/AI Service'
    } else if (data.type === 'notification-service') {
      if (data.notificationServiceConfig?.vendor) {
        return data.notificationServiceConfig.vendor
      }
      return 'Notifications'
    } else if (data.type === 'email-service') {
      if (data.emailServiceConfig?.vendor) {
        return data.emailServiceConfig.vendor
      }
      return 'Email Service'
    } else if (data.type === 'sms-gateway') {
      if (data.smsGatewayConfig?.vendor) {
        return data.smsGatewayConfig.vendor
      }
      return 'SMS Gateway'
    } else if (data.type === 'proxy') {
      if (data.proxyConfig?.vendor) {
        return data.proxyConfig.vendor
      }
      return 'Proxy'
    } else if (data.type === 'vpn-gateway') {
      if (data.vpnGatewayConfig?.vendor) {
        return data.vpnGatewayConfig.vendor
      }
      return 'VPN Gateway'
    } else if (data.type === 'dns-service') {
      if (data.dnsServiceConfig?.vendor) {
        return data.dnsServiceConfig.vendor
      }
      return 'DNS Service'
    } else if (data.type === 'vector-database') {
      if (data.vectorDatabaseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          pinecone: 'Pinecone',
          milvus: 'Milvus',
          weaviate: 'Weaviate',
          qdrant: 'Qdrant',
          chroma: 'Chroma',
          faiss: 'FAISS',
          zilliz: 'Zilliz',
          'elastic-vector': 'Elastic Vector',
          pgvector: 'pgvector',
        }
        return vendorLabels[data.vectorDatabaseConfig.vendor] || 'Vector DB'
      }
      return 'Vector Database'
    }
    return data.connectionType === 'sync' ? 'Sync' : 'Async'
  }

  // Определяем стили для новых компонентов - более яркое выделение
  const isNew = data.status === 'new'
  const borderColor = selected
    ? color
    : data.status === 'new'
      ? '#40c057' // Более яркий зеленый
      : data.status === 'existing'
        ? '#ffa94d'
        : '#444'
  const borderStyle = data.status === 'new'
    ? 'dashed'
    : data.status === 'existing'
      ? 'double'
      : 'solid'
  const borderWidth = data.status === 'existing' ? '3px' : data.status === 'new' ? '4px' : '2px' // Увеличена толщина для новых

  // Для новых компонентов добавляем очень яркую подсветку
  const boxShadow = isNew
    ? selected
      ? `0 8px 40px ${color}70, 0 0 0 3px ${color}40, 0 0 30px #40c05780, 0 0 60px #40c05740, 0 0 90px #40c05720`
      : `0 4px 20px rgba(0,0,0,0.5), 0 0 25px #40c05770, 0 0 50px #40c05750, 0 0 75px #40c05730`
    : selected
      ? `0 8px 24px ${color}50, 0 0 0 2px ${color}30`
      : '0 4px 12px rgba(0,0,0,0.4)'

  // Для новых компонентов добавляем более яркую зеленую подсветку фона
  const backgroundColor = isNew ? '#1a2e1a' : '#1e1e1e' // Более зеленый фон

  return (
    <div
      style={{
        padding: isSimple ? '8px' : '16px 20px',
        borderRadius: '12px',
        background: isSimple ? color : backgroundColor,
        border: `${borderWidth} ${borderStyle} ${selected ? color : isSimple ? 'transparent' : borderColor}`,
        color: '#f8f9fa',
        minWidth: isSimple ? '60px' : '200px',
        minHeight: isSimple ? '60px' : '110px',
        boxShadow: boxShadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isSimple ? 'center' : 'flex-start',
        borderLeft: isSimple ? `none` : `${borderWidth} solid ${color}`,
        overflow: 'visible',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {!isSimple && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 100,
          }}
        >
          {/* Link status indicator */}
          {data.link && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#51cf66',
                boxShadow: '0 0 5px #51cf66',
                margin: 'auto 4px',
              }}
              title={`Связан с: ${data.link.label || data.link.targetNodeId}`}
            />
          )}

          {/* Status button */}
          {onStatusChange && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                const newStatus = data.status === 'new' ? 'existing' : data.status === 'existing' ? undefined : 'new'
                onStatusChange(id, newStatus as any)
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '4px',
                color: data.status === 'new' ? '#51cf66' : data.status === 'existing' ? '#ffd43b' : '#888',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Изменить статус"
            >
              {data.status === 'new' ? <Sparkles size={12} /> : data.status === 'existing' ? <CheckCircle size={12} /> : <Settings size={12} />}
            </button>
          )}

          {/* Link buttons */}
          {data.link && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onLinkClick) onLinkClick(data.link!)
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '4px',
                color: '#51cf66',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Перейти по ссылке"
            >
              <LinkIcon size={12} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onLinkConfigClick) onLinkConfigClick(id)
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: data.link ? '#51cf66' : '#888',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
          >
            <Link2 size={12} />
          </button>

          <button
            onClick={handleInfoClick}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: color,
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Инфо"
          >
            <Info size={12} />
          </button>
        </div>
      )}

      {/* Генерируем точки подключения по всему периметру */}
      {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
          const isHorizontal = pos === Position.Top || pos === Position.Bottom;
          const isCenter = p === 50;
          const targetId = `${pos}-target-${p}`;
          const sourceId = `${pos}-source-${p}`;

          const isTargetConnected = connectedHandleIds.includes(targetId);
          const isSourceConnected = connectedHandleIds.includes(sourceId);

          // ОПТИМИЗАЦИЯ: Рендерим handle только если необходимо
          const shouldRender = isHovered || isConnecting || isCenter || isTargetConnected || isSourceConnected;

          if (!shouldRender) return null;

          const style: React.CSSProperties = {
            [isHorizontal ? 'left' : 'top']: `${p}%`,
            [pos]: '-5px',
            opacity: isHovered || isConnecting ? (isCenter ? 0.8 : 0.4) : (isTargetConnected || isSourceConnected ? 0.6 : 0),
            borderRadius: '50%',
            width: isCenter ? '12px' : '8px',
            height: isCenter ? '12px' : '8px',
            background: isCenter ? color : `${color}80`,
            border: isCenter ? `2px solid #fff` : `1px solid ${color}`,
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter ? 30 : 25,
            pointerEvents: 'all',
          };

          return (
            <React.Fragment key={`${pos}-${p}`}>
              <Handle
                type="target"
                position={pos}
                id={targetId}
                style={style}
              />
              <Handle
                type="source"
                position={pos}
                id={sourceId}
                style={style}
              />
            </React.Fragment>
          );
        })
      )}

      {/* BACKWARD COMPATIBILITY: Добавляем handles со старым форматом ID для существующих edges */}
      {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => {
        const oldTargetId = `${pos}-target`;
        const oldSourceId = `${pos}-source`;

        const isTargetConnected = connectedHandleIds.includes(oldTargetId);
        const isSourceConnected = connectedHandleIds.includes(oldSourceId);

        // Рендерим только если подключено или в режиме поиска связей
        const shouldRender = isTargetConnected || isSourceConnected || (isHovered && isConnecting);

        if (!shouldRender) return null;

        const isHorizontal = pos === Position.Top || pos === Position.Bottom;
        const style: React.CSSProperties = {
          width: '8px',
          height: '8px',
          background: color,
          border: `2px solid #fff`,
          cursor: 'crosshair',
          transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
          zIndex: 30,
          opacity: 1,
          pointerEvents: 'all',
        };

        return (
          <React.Fragment key={`legacy-${pos}`}>
            <Handle
              type="target"
              position={pos}
              id={oldTargetId}
              style={style}
            />
            <Handle
              type="source"
              position={pos}
              id={oldSourceId}
              style={style}
            />
          </React.Fragment>
        );
      })}

      {!isSimple && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMedium ? '4px' : '12px',
            width: '100%',
          }}
        >
          {/* Icon container with gradient background */}
          <div
            style={{
              width: isMedium ? '40px' : '64px',
              height: isMedium ? '40px' : '64px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              boxShadow: `0 8px 16px rgba(0,0,0,0.2)`,
              position: 'relative',
            }}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement, { size: isMedium ? 24 : 32 })
              : icon}

            {/* Status dot */}
            {data.status === 'new' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ffd43b',
                  border: '2px solid #1e1e1e',
                  boxShadow: '0 0 5px #ffd43b',
                }}
                title="Новый компонент"
              />
            )}
          </div>

          {/* Label */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            {isEditing && !isMedium ? (
              <input
                ref={inputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  color: '#fff',
                  fontSize: isMedium ? '12px' : '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  outline: 'none',
                  width: '100%',
                }}
                autoFocus
              />
            ) : (
              <div
                style={{
                  color: '#fff',
                  fontSize: isMedium ? '12px' : '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {label}
              </div>
            )}
          </div>

          {/* Subtitle / Type badge - hide in Medium view */}
          {!isMedium && (
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: `${color}cc`,
                backgroundColor: `${color}15`,
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: '600',
              }}
            >
              {getSubtitle()}
            </div>
          )}

          {/* Metadata / Config - Hide in Medium view */}
          {!isMedium && (
            <div
              style={{
                marginTop: '8px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {/* Database tables / Repository info */}
              {(data.type === 'database' || data.type === 'repository') && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {data.databaseConfig?.tables?.length || 0} таблиц(ы)
                </div>
              )}

              {data.type === 'table' && data.tableConfig?.columns && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #333',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {data.tableConfig.columns.map((column, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 6px',
                          backgroundColor: '#2d2d2d',
                          borderRadius: '4px',
                          marginBottom: '2px',
                          border: `1px solid ${color}20`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {column.primaryKey && <Key size={10} style={{ color: '#ffd43b' }} />}
                          {column.foreignKey && <Link2 size={10} style={{ color: '#4dabf7' }} />}
                          <span style={{ color: '#fff', fontWeight: '500' }}>{column.name}</span>
                        </div>
                        <span style={{ color: '#888', fontSize: '9px' }}>{column.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class methods list */}
              {data.type === 'class' && data.classConfig?.methods && data.classConfig.methods.length > 0 && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #333',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: color, fontWeight: '600', marginBottom: '4px' }}>
                    Методы:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                    }}
                  >
                    {data.classConfig.methods.slice(0, 5).map((method, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '10px',
                          color: '#ccc',
                          textAlign: 'left',
                          padding: '4px 8px',
                          backgroundColor: '#2d2d2d',
                          borderRadius: '4px',
                          border: `1px solid ${color}20`,
                          wordBreak: 'break-word',
                        }}
                      >
                        <span style={{ color: color, fontWeight: '600' }}>
                          {method.visibility || 'public'}
                        </span>
                        {' '}
                        <span style={{ color: method.returnType ? '#4dabf7' : '#888' }}>
                          {method.returnType || 'void'}
                        </span>
                        {' '}
                        <span style={{ color: '#fff', fontWeight: '500' }}>
                          {method.name || `метод${index + 1}`}
                        </span>
                      </div>
                    ))}
                    {data.classConfig.methods.length > 5 && (
                      <div style={{ fontSize: '10px', color: color, textAlign: 'center', fontStyle: 'italic' }}>
                        +{data.classConfig.methods.length - 5} еще...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comment bubble */}
              {data.comment && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#888',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    borderLeft: `2px solid ${color}`,
                    fontStyle: 'italic',
                  }}
                >
                  {data.comment}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isSimple && (
        <div style={{ color: '#fff' }}>
          {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
      )}
    </div>
  )
}

export default React.memo(CustomNode, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.type === nextProps.data?.type &&
    prevProps.data?.status === nextProps.data?.status &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})
