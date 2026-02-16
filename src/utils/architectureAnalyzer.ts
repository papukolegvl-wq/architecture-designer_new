import { Node, Edge } from 'reactflow'
import { ComponentData, ComponentType } from '../types'

export interface ArchitectureRecommendation {
  id: string
  type: 'warning' | 'info' | 'suggestion'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  relatedNodes?: string[]
  relatedEdges?: string[]
  suggestedComponents?: ComponentType[]
  suggestedConnections?: {
    from: ComponentType
    to: ComponentType
    connectionType: string
    description: string
  }[]
}

export function analyzeArchitecture(nodes: Node[], edges: Edge[]): ArchitectureRecommendation[] {
  const recommendations: ArchitectureRecommendation[] = []
  const nodeDataMap = new Map(nodes.map(n => [n.id, n.data as ComponentData]))

  // 1. Проверка прямого синхронного взаимодействия между сервисами
  const serviceToServiceSync = edges.filter(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    return (
      sourceData?.type === 'service' &&
      targetData?.type === 'service' &&
      (edge.data?.connectionType === 'rest' || edge.data?.connectionType === 'grpc')
    )
  })

  if (serviceToServiceSync.length > 0) {
    recommendations.push({
      id: 'direct-service-sync',
      type: 'suggestion',
      title: 'Прямое синхронное взаимодействие между сервисами',
      description: 'Обнаружено прямое синхронное взаимодействие между сервисами. Для повышения отказоустойчивости и масштабируемости рассмотрите возможность использования асинхронной коммуникации через брокер сообщений.',
      severity: 'medium',
      relatedEdges: serviceToServiceSync.map(e => e.id),
      suggestedComponents: ['message-broker'],
      suggestedConnections: [
        {
          from: 'service',
          to: 'message-broker',
          connectionType: 'async',
          description: 'Service → Message Broker (Async) для публикации сообщений'
        },
        {
          from: 'message-broker',
          to: 'service',
          connectionType: 'async',
          description: 'Message Broker → Service (Async) для подписки на сообщения'
        }
      ]
    })
  }

  // 2. Frontend напрямую к сервисам (без API Gateway)
  const frontendToService = edges.filter(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    return sourceData?.type === 'frontend' && nodeDataMap.get(edge.target)?.type === 'service'
  })

  if (frontendToService.length > 0) {
    recommendations.push({
      id: 'frontend-direct-service',
      type: 'warning',
      title: 'Frontend подключается напрямую к сервисам',
      description: 'Frontend подключается напрямую к сервисам без API Gateway. Рекомендуется использовать API Gateway как единую точку входа для централизованной аутентификации, rate limiting, версионирования API и упрощения управления.',
      severity: 'high',
      relatedEdges: frontendToService.map(e => e.id),
      suggestedComponents: ['api-gateway'],
      suggestedConnections: [
        {
          from: 'frontend',
          to: 'api-gateway',
          connectionType: 'rest',
          description: 'Frontend → API Gateway (REST)'
        },
        {
          from: 'api-gateway',
          to: 'service',
          connectionType: 'rest',
          description: 'API Gateway → Service (REST)'
        }
      ]
    })
  }

  // 3. Множественные сервисы без Load Balancer
  const serviceNodes = nodes.filter(n => (n.data as ComponentData).type === 'service')
  const hasLoadBalancer = nodes.some(n => (n.data as ComponentData).type === 'load-balancer')
  const frontendNodes = nodes.filter(n => (n.data as ComponentData).type === 'frontend')
  
  if (serviceNodes.length > 1 && frontendNodes.length > 0 && !hasLoadBalancer) {
    recommendations.push({
      id: 'multiple-services-no-lb',
      type: 'suggestion',
      title: 'Множественные сервисы без балансировщика нагрузки',
      description: 'Обнаружено несколько сервисов без балансировщика нагрузки. Добавьте Load Balancer для распределения нагрузки, обеспечения высокой доступности и горизонтального масштабирования.',
      severity: 'medium',
      relatedNodes: serviceNodes.map(n => n.id),
      suggestedComponents: ['load-balancer'],
      suggestedConnections: [
        {
          from: 'frontend',
          to: 'load-balancer',
          connectionType: 'rest',
          description: 'Frontend → Load Balancer (REST)'
        },
        {
          from: 'load-balancer',
          to: 'service',
          connectionType: 'rest',
          description: 'Load Balancer → Service (REST) - для каждого сервиса'
        }
      ]
    })
  }

  // 4. Частые запросы к БД без кеша
  const dbConnections = edges.filter(edge => {
    const targetData = nodeDataMap.get(edge.target)
    return targetData?.type === 'database' && edge.data?.connectionType === 'database-connection'
  })
  
  const hasCache = nodes.some(n => (n.data as ComponentData).type === 'cache')
  const servicesWithDb = new Set(dbConnections.map(e => e.source))
  
  if (dbConnections.length > 2 && servicesWithDb.size > 1 && !hasCache) {
    recommendations.push({
      id: 'frequent-db-no-cache',
      type: 'suggestion',
      title: 'Частые запросы к базе данных без кеша',
      description: 'Обнаружено несколько соединений с базой данных от разных сервисов. Рассмотрите добавление кеша для уменьшения нагрузки на БД и ускорения ответов приложения.',
      severity: 'medium',
      relatedEdges: dbConnections.map(e => e.id),
      suggestedComponents: ['cache'],
      suggestedConnections: [
        {
          from: 'service',
          to: 'cache',
          connectionType: 'cache-connection',
          description: 'Service → Cache (Cache Connection) для кэширования данных из БД'
        }
      ]
    })
  }

  // 5. Отсутствие мониторинга и логирования
  const hasMonitoring = nodes.some(n => {
    const data = n.data as ComponentData
    return data.type === 'service' && (n.data as any).hasMonitoring
  })
  
  if (serviceNodes.length > 2 && !hasMonitoring) {
    recommendations.push({
      id: 'no-monitoring',
      type: 'info',
      title: 'Рекомендация: Добавьте мониторинг и логирование',
      description: 'Для системы с несколькими сервисами рекомендуется внедрить централизованное логирование (ELK Stack, Loki) и мониторинг (Prometheus, Grafana) для отслеживания производительности и диагностики проблем.',
      severity: 'low',
    })
  }

  // 6. Множественные прямые зависимости между сервисами (высокая связанность)
  const serviceDependencies = new Map<string, number>()
  edges.forEach(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    if (sourceData?.type === 'service' && targetData?.type === 'service') {
      const count = serviceDependencies.get(edge.source) || 0
      serviceDependencies.set(edge.source, count + 1)
    }
  })

  const highlyCoupledServices = Array.from(serviceDependencies.entries())
    .filter(([_, count]) => count > 3)
    .map(([nodeId]) => nodeId)

  if (highlyCoupledServices.length > 0) {
    recommendations.push({
      id: 'high-coupling',
      type: 'warning',
      title: 'Высокая связанность между сервисами',
      description: 'Обнаружены сервисы с большим количеством прямых зависимостей. Рассмотрите использование Event-Driven архитектуры или API Gateway для уменьшения связанности и улучшения масштабируемости.',
      severity: 'high',
      relatedNodes: highlyCoupledServices,
      suggestedComponents: ['message-broker', 'api-gateway'],
      suggestedConnections: [
        {
          from: 'service',
          to: 'message-broker',
          connectionType: 'async',
          description: 'Service → Message Broker (Async) для событийной коммуникации'
        },
        {
          from: 'api-gateway',
          to: 'service',
          connectionType: 'rest',
          description: 'API Gateway → Service (REST) для централизованного доступа'
        }
      ]
    })
  }

  // 7. Отсутствие Circuit Breaker при множественных вызовах
  const apiGatewayNodes = nodes.filter(n => (n.data as ComponentData).type === 'api-gateway')
  const apiGatewayWithCircuitBreaker = apiGatewayNodes.filter(n => {
    const config = (n.data as ComponentData).apiGatewayConfig
    return config?.circuitBreaker === true
  })

  if (apiGatewayNodes.length > 0 && apiGatewayWithCircuitBreaker.length === 0 && serviceNodes.length > 2) {
    recommendations.push({
      id: 'no-circuit-breaker',
      type: 'suggestion',
      title: 'Рекомендуется включить Circuit Breaker',
      description: 'При наличии API Gateway и множественных сервисов рекомендуется включить Circuit Breaker для защиты от каскадных сбоев и улучшения отказоустойчивости системы.',
      severity: 'medium',
      relatedNodes: apiGatewayNodes.map(n => n.id),
    })
  }

  // 8. Сервисы без аутентификации
  const hasAuthService = nodes.some(n => (n.data as ComponentData).type === 'auth-service')
  const serviceToServiceEdges = edges.filter(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    return sourceData?.type === 'service' && targetData?.type === 'service'
  })

  if (serviceNodes.length > 1 && serviceToServiceEdges.length > 0 && !hasAuthService) {
    recommendations.push({
      id: 'no-auth-service',
      type: 'suggestion',
      title: 'Рекомендуется добавить сервис аутентификации',
      description: 'При взаимодействии между сервисами рекомендуется использовать централизованный сервис аутентификации для управления токенами и контроля доступа.',
      severity: 'medium',
      suggestedComponents: ['auth-service'],
      suggestedConnections: [
        {
          from: 'service',
          to: 'auth-service',
          connectionType: 'rest',
          description: 'Service → Auth Service (REST) для проверки токенов'
        },
        {
          from: 'api-gateway',
          to: 'auth-service',
          connectionType: 'rest',
          description: 'API Gateway → Auth Service (REST) для централизованной аутентификации'
        }
      ]
    })
  }

  // 9. Отсутствие CDN для статического контента
  const hasCDN = nodes.some(n => (n.data as ComponentData).type === 'cdn')
  if (frontendNodes.length > 0 && !hasCDN) {
    recommendations.push({
      id: 'no-cdn',
      type: 'info',
      title: 'Рекомендация: Добавьте CDN',
      description: 'Для frontend приложений рекомендуется использовать CDN для доставки статического контента (CSS, JS, изображения), что ускорит загрузку страниц и снизит нагрузку на основной сервер.',
      severity: 'low',
      relatedNodes: frontendNodes.map(n => n.id),
      suggestedComponents: ['cdn'],
    })
  }

  // 10. Отсутствие Firewall/WAF
  const hasFirewall = nodes.some(n => (n.data as ComponentData).type === 'firewall')
  if (frontendNodes.length > 0 && serviceNodes.length > 0 && !hasFirewall) {
    recommendations.push({
      id: 'no-firewall',
      type: 'suggestion',
      title: 'Рекомендуется добавить Firewall/WAF',
      description: 'Для защиты веб-приложений рекомендуется использовать Firewall или WAF (Web Application Firewall) для защиты от сетевых атак и фильтрации вредоносного трафика.',
      severity: 'medium',
      suggestedComponents: ['firewall'],
    })
  }

  // 11. Прямое подключение к базе данных без пула соединений (информационное)
  if (dbConnections.length > 0) {
    recommendations.push({
      id: 'db-connection-pool',
      type: 'info',
      title: 'Рекомендация: Используйте пул соединений',
      description: 'При работе с базой данных убедитесь, что используется пул соединений для эффективного управления подключениями и предотвращения исчерпания ресурсов БД.',
      severity: 'low',
      relatedEdges: dbConnections.map(e => e.id),
    })
  }

  // 12. Отсутствие резервного копирования данных
  const hasObjectStorage = nodes.some(n => (n.data as ComponentData).type === 'object-storage')
  if (nodes.some(n => (n.data as ComponentData).type === 'database') && !hasObjectStorage) {
    recommendations.push({
      id: 'no-backup',
      type: 'suggestion',
      title: 'Рекомендуется настроить резервное копирование',
      description: 'Для баз данных рекомендуется настроить автоматическое резервное копирование в объектное хранилище для защиты от потери данных.',
      severity: 'high',
      suggestedComponents: ['object-storage'],
      suggestedConnections: [
        {
          from: 'service',
          to: 'object-storage',
          connectionType: 'rest',
          description: 'Service → Object Storage (REST) для сохранения резервных копий БД'
        }
      ]
    })
  }

  // 13. Использование синхронной коммуникации для долгих операций
  const longRunningOps = edges.filter(edge => {
    const sourceData = nodeDataMap.get(edge.source)
    const targetData = nodeDataMap.get(edge.target)
    // Если сервис вызывает другой сервис синхронно, это может быть проблемой для долгих операций
    return (
      sourceData?.type === 'service' &&
      targetData?.type === 'service' &&
      (edge.data?.connectionType === 'rest' || edge.data?.connectionType === 'grpc')
    )
  })

  if (longRunningOps.length > 0) {
    recommendations.push({
      id: 'sync-long-operations',
      type: 'info',
      title: 'Синхронная коммуникация для операций',
      description: 'Если сервисы выполняют долгие операции, рассмотрите использование асинхронной коммуникации через брокер сообщений для предотвращения таймаутов и улучшения отзывчивости системы.',
      severity: 'low',
      relatedEdges: longRunningOps.map(e => e.id),
    })
  }

  return recommendations
}

