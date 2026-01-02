import { ComponentType, ConnectionType } from '../types'
import { X } from 'lucide-react'

interface ConnectionErrorPanelProps {
  sourceType: ComponentType
  targetType: ComponentType
  connectionType: ConnectionType
  onClose: () => void
}

const getErrorReason = (
  sourceType: ComponentType,
  targetType: ComponentType,
  connectionType: ConnectionType
): { reason: string; solution: string } => {
  // Frontend пытается подключиться к чему-то кроме API Gateway или Load Balancer
  if (sourceType === 'frontend') {
    if (targetType !== 'api-gateway' && targetType !== 'load-balancer') {
      return {
        reason: `Frontend не может напрямую подключаться к ${getComponentName(targetType)}. В реальной архитектуре клиентские приложения обращаются к серверной части через промежуточные компоненты.`,
        solution: `Используйте API Gateway или Load Balancer как промежуточный компонент: Frontend → API Gateway/Load Balancer → ${getComponentName(targetType)}`
      }
    }
  }

  // Попытка подключить компонент, который не может быть источником
  const passiveComponents: ComponentType[] = ['database', 'cache', 'object-storage', 'data-warehouse', 'cdn', 'lambda', 'firewall']
  if (passiveComponents.includes(sourceType)) {
    return {
      reason: `${getComponentName(sourceType)} не может быть источником соединения. Этот компонент только принимает запросы, но не инициирует их.`,
      solution: `Используйте Service как источник: Service → ${getComponentName(targetType)}`
    }
  }

  // Попытка подключить к Firewall
  if (targetType === 'firewall') {
    return {
      reason: `Firewall не может быть целевым компонентом для соединений. Firewall работает на сетевом уровне и не является конечной точкой для приложений.`,
      solution: `Firewall автоматически защищает все сетевые соединения. Не нужно создавать явные соединения к нему.`
    }
  }

  // Неправильный тип соединения для Database
  if (targetType === 'database' && connectionType !== 'database-connection') {
    return {
      reason: `К базе данных можно подключаться только через тип соединения "Database Connection", а не "${getConnectionTypeName(connectionType)}".`,
      solution: `Используйте тип соединения "Database Connection" для подключения Service → Database`
    }
  }

  // Неправильный тип соединения для Cache
  if (targetType === 'cache' && connectionType !== 'cache-connection') {
    return {
      reason: `К кешу можно подключаться только через тип соединения "Cache Connection", а не "${getConnectionTypeName(connectionType)}".`,
      solution: `Используйте тип соединения "Cache Connection" для подключения Service → Cache`
    }
  }

  // Попытка подключить к CDN напрямую
  if (targetType === 'cdn' || sourceType === 'cdn') {
    return {
      reason: `CDN не подключается напрямую к другим компонентам. CDN работает на уровне доставки статического контента и не требует явных соединений.`,
      solution: `CDN автоматически кэширует и доставляет статический контент. Настройте CDN для вашего домена отдельно.`
    }
  }

  // Попытка использовать async без брокера сообщений
  if (connectionType === 'async' && sourceType !== 'message-broker' && targetType !== 'message-broker') {
    return {
      reason: `Асинхронное соединение (Async) требует участия брокера сообщений. Один из компонентов должен быть Message Broker.`,
      solution: `Используйте Message Broker как промежуточный компонент: ${getComponentName(sourceType)} → Message Broker → ${getComponentName(targetType)}`
    }
  }

  // Service пытается подключиться к Load Balancer
  if (sourceType === 'service' && targetType === 'load-balancer') {
    return {
      reason: `Service не может подключаться к Load Balancer. В реальной архитектуре Load Balancer находится перед сервисами, а не после них.`,
      solution: `Правильная архитектура: Frontend/API Gateway → Load Balancer → Service`
    }
  }

  // API Gateway пытается подключиться к базе данных напрямую
  if (sourceType === 'api-gateway' && targetType === 'database') {
    return {
      reason: `API Gateway не должен напрямую подключаться к базе данных. API Gateway работает как прокси и маршрутизирует запросы к сервисам.`,
      solution: `Используйте Service как промежуточный компонент: API Gateway → Service → Database`
    }
  }

  // API Gateway пытается подключиться к кешу напрямую
  if (sourceType === 'api-gateway' && targetType === 'cache') {
    return {
      reason: `API Gateway может кэшировать ответы, но не подключается напрямую к внешнему кешу. Кеш используется сервисами.`,
      solution: `Используйте Service как промежуточный компонент: API Gateway → Service → Cache`
    }
  }

  // Попытка подключить к Object Storage не через REST
  if (targetType === 'object-storage' && connectionType !== 'rest') {
    return {
      reason: `К Object Storage можно подключаться только через REST API, а не через "${getConnectionTypeName(connectionType)}".`,
      solution: `Используйте тип соединения "REST" для подключения Service → Object Storage`
    }
  }

  // Попытка подключить к Data Warehouse не через Database Connection
  if (targetType === 'data-warehouse' && connectionType !== 'database-connection') {
    return {
      reason: `К Data Warehouse можно подключаться только через тип соединения "Database Connection", а не "${getConnectionTypeName(connectionType)}".`,
      solution: `Используйте тип соединения "Database Connection" для подключения Service → Data Warehouse`
    }
  }

  // Попытка подключить к Lambda не через REST или Async
  if (targetType === 'lambda' && connectionType !== 'rest' && connectionType !== 'async') {
    return {
      reason: `К Lambda можно подключаться только через REST или Async, а не через "${getConnectionTypeName(connectionType)}".`,
      solution: `Используйте тип соединения "REST" или "Async" для подключения к Lambda`
    }
  }

  // Общая ошибка для несовместимых компонентов
  return {
    reason: `${getComponentName(sourceType)} не может подключаться к ${getComponentName(targetType)} через ${getConnectionTypeName(connectionType)}. Эти компоненты несовместимы для такого типа соединения.`,
    solution: `Проверьте архитектуру. Возможно, нужен промежуточный компонент (например, Service или API Gateway) для связи между этими компонентами.`
  }
}

const getComponentName = (type: ComponentType): string => {
  const names: Partial<Record<ComponentType, string>> = {
    'frontend': 'Frontend',
    'service': 'Service',
    'database': 'Database',
    'message-broker': 'Message Broker',
    'api-gateway': 'API Gateway',
    'cache': 'Cache',
    'load-balancer': 'Load Balancer',
    'auth-service': 'Auth Service',
    'cdn': 'CDN',
    'object-storage': 'Object Storage',
    'data-warehouse': 'Data Warehouse',
    'lambda': 'Lambda',
    'firewall': 'Firewall',
    'system': 'System',
    'esb': 'ESB',
    'client': 'Client',
    'external-system': 'External System',
    'business-domain': 'Business Domain',
    'controller': 'Controller',
    'repository': 'Repository',
    'class': 'Class',
    'server': 'Server',
    'orchestrator': 'Orchestrator',
    'group': 'Group',
    'service-discovery': 'Service Discovery',
    'web-server': 'Web Server',
    'monitoring': 'Monitoring',
    'logging': 'Logging',
    'queue': 'Queue',
    'event-bus': 'Event Bus',
    'stream-processor': 'Stream Processor',
    'search-engine': 'Search Engine',
    'analytics-service': 'Analytics Service',
    'business-intelligence': 'Business Intelligence',
    'graph-database': 'Graph Database',
    'time-series-database': 'Time Series Database',
    'service-mesh': 'Service Mesh',
    'configuration-management': 'Configuration Management',
    'ci-cd-pipeline': 'CI/CD Pipeline',
    'backup-service': 'Backup Service',
    'identity-provider': 'Identity Provider',
    'secret-management': 'Secret Management',
    'api-client': 'API Client',
    'api-documentation': 'API Documentation',
    'integration-platform': 'Integration Platform',
    'batch-processor': 'Batch Processor',
    'etl-service': 'ETL Service',
    'data-lake': 'Data Lake',
    'edge-computing': 'Edge Computing',
    'iot-gateway': 'IoT Gateway',
    'blockchain': 'Blockchain',
    'ml-ai-service': 'ML/AI Service',
    'notification-service': 'Notification Service',
    'email-service': 'Email Service',
    'sms-gateway': 'SMS Gateway',
    'proxy': 'Proxy',
    'vpn-gateway': 'VPN Gateway',
    'dns-service': 'DNS Service',
  }
  return names[type] || type
}

const getConnectionTypeName = (type: ConnectionType): string => {
  const names: Partial<Record<ConnectionType, string>> = {
    'rest': 'REST',
    'grpc': 'gRPC',
    'async': 'Async',
    'database-connection': 'Database Connection',
    'database-replication': 'Database Replication',
    'cache-connection': 'Cache Connection',
    'dependency': 'Dependency',
    'composition': 'Composition',
    'aggregation': 'Aggregation',
    'method-call': 'Method Call',
    'inheritance': 'Inheritance',
  }
  return names[type] || type
}

export default function ConnectionErrorPanel({
  sourceType,
  targetType,
  connectionType,
  onClose,
}: ConnectionErrorPanelProps) {
  const { reason, solution } = getErrorReason(sourceType, targetType, connectionType)

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #dc3545',
        borderRadius: '16px',
        padding: '30px',
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        zIndex: 2000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#dc3545', margin: 0 }}>
          Невозможно создать соединение
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.backgroundColor = '#3d3d3d'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#aaa'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ff6b6b', marginBottom: '12px' }}>
          Причина
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', margin: 0 }}>
          {reason}
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#51cf66', marginBottom: '12px' }}>
          Как реализовать
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', margin: 0, padding: '12px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #51cf6640' }}>
          {solution}
        </p>
      </div>
    </div>
  )
}


