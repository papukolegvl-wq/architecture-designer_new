import { ArchitectureRecommendation } from '../utils/architectureAnalyzer'
import { X, AlertTriangle, Info, Lightbulb, Plus, ArrowRight, Wrench } from 'lucide-react'
import { ComponentType } from '../types'

interface ArchitectureRecommendationsPanelProps {
  recommendations: ArchitectureRecommendation[]
  onClose: () => void
  onBuildRecommendation?: (recommendation: ArchitectureRecommendation) => void
}

const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return '#dc3545'
    case 'medium':
      return '#ffd43b'
    case 'low':
      return '#51cf66'
    default:
      return '#4dabf7'
  }
}

const getTypeIcon = (type: 'warning' | 'info' | 'suggestion') => {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={20} />
    case 'suggestion':
      return <Lightbulb size={20} />
    case 'info':
      return <Info size={20} />
  }
}

const getComponentLabel = (componentType: ComponentType): string => {
  const labels: Partial<Record<ComponentType, string>> = {
    'service': 'Сервис',
    'database': 'База данных',
    'message-broker': 'Брокер сообщений',
    'api-gateway': 'API Gateway',
    'cache': 'Кеш',
    'load-balancer': 'Балансировщик нагрузки',
    'frontend': 'Клиентское приложение',
    'auth-service': 'Сервис аутентификации',
    'cdn': 'CDN',
    'object-storage': 'Объектное хранилище',
    'data-warehouse': 'Хранилище данных',
    'lambda': 'Serverless функция',
    'firewall': 'Firewall/WAF',
    'system': 'Система',
    'esb': 'ESB',
    'client': 'Клиент',
    'external-system': 'Внешняя система',
    'business-domain': 'Бизнес-домен',
    'controller': 'Контроллер',
    'repository': 'Репозиторий',
    'class': 'Класс',
    'server': 'Сервер',
    'orchestrator': 'Оркестратор',
    'group': 'Группа',
    'service-discovery': 'Обнаружение сервисов',
    'web-server': 'Веб-сервер',
    'monitoring': 'Мониторинг',
    'logging': 'Логирование',
    'queue': 'Очередь',
    'event-bus': 'Шина событий',
    'stream-processor': 'Потоковый обработчик',
    'search-engine': 'Поисковая система',
    'analytics-service': 'Сервис аналитики',
    'business-intelligence': 'Business Intelligence',
    'graph-database': 'Графовая БД',
    'time-series-database': 'Временные ряды',
    'service-mesh': 'Сервисная сеть',
    'configuration-management': 'Управление конфигурацией',
    'ci-cd-pipeline': 'CI/CD пайплайн',
    'backup-service': 'Резервное копирование',
    'identity-provider': 'Провайдер идентичности',
    'secret-management': 'Управление секретами',
    'api-client': 'API клиент',
    'api-documentation': 'Документация API',
    'integration-platform': 'Платформа интеграций',
    'batch-processor': 'Пакетный обработчик',
    'etl-service': 'ETL сервис',
    'data-lake': 'Data Lake',
    'edge-computing': 'Граничные вычисления',
    'iot-gateway': 'IoT шлюз',
    'blockchain': 'Блокчейн',
    'ml-ai-service': 'ML/AI сервис',
    'notification-service': 'Сервис уведомлений',
    'email-service': 'Email сервис',
    'sms-gateway': 'SMS шлюз',
    'proxy': 'Прокси',
    'vpn-gateway': 'VPN шлюз',
    'dns-service': 'DNS сервис',
  }
  return labels[componentType] || componentType
}

export default function ArchitectureRecommendationsPanel({
  recommendations,
  onClose,
  onBuildRecommendation,
}: ArchitectureRecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return null
  }

  // Сортируем рекомендации по важности
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #4dabf7',
        borderRadius: '16px',
        padding: '20px',
        minWidth: '600px',
        maxWidth: '800px',
        maxHeight: '60vh',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        zIndex: 1500,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={24} color="#4dabf7" />
          Архитектурные рекомендации ({recommendations.length})
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedRecommendations.map((rec) => {
          const severityColor = getSeverityColor(rec.severity)
          return (
            <div
              key={rec.id}
              style={{
                padding: '16px',
                backgroundColor: '#1e1e1e',
                border: `2px solid ${severityColor}40`,
                borderRadius: '12px',
                borderLeft: `4px solid ${severityColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                <div style={{ color: severityColor, marginTop: '2px' }}>
                  {getTypeIcon(rec.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 8px 0' }}>
                    {rec.title}
                  </h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', margin: '0 0 12px 0' }}>
                    {rec.description}
                  </p>
                  
                  {/* Предложенные компоненты */}
                  {rec.suggestedComponents && rec.suggestedComponents.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '12px', padding: '12px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#4dabf7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} />
                        Добавить компоненты:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {rec.suggestedComponents.map((componentType, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#1e1e1e',
                              border: '1px solid #4dabf7',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#4dabf7',
                              fontWeight: '500',
                            }}
                          >
                            {getComponentLabel(componentType)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Предложенные соединения */}
                  {rec.suggestedConnections && rec.suggestedConnections.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '12px', padding: '12px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#51cf66', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowRight size={16} />
                        Настроить соединения:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {rec.suggestedConnections.map((conn, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#1e1e1e',
                              border: '1px solid #51cf66',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              color: '#ccc',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ color: '#4dabf7', fontWeight: '500' }}>{getComponentLabel(conn.from)}</span>
                              <ArrowRight size={14} color="#51cf66" />
                              <span style={{ color: '#4dabf7', fontWeight: '500' }}>{getComponentLabel(conn.to)}</span>
                              <span style={{ color: '#aaa', marginLeft: '8px' }}>({conn.connectionType})</span>
                            </div>
                            {conn.description && (
                              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                {conn.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${severityColor}20`,
                          color: severityColor,
                          fontWeight: '500',
                        }}
                      >
                        {rec.severity === 'high' ? 'Высокий приоритет' : 
                         rec.severity === 'medium' ? 'Средний приоритет' : 
                         'Низкий приоритет'}
                      </span>
                      {rec.type === 'warning' && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#dc354520',
                            color: '#dc3545',
                            fontWeight: '500',
                          }}
                        >
                          Предупреждение
                        </span>
                      )}
                    </div>
                    {onBuildRecommendation && (rec.suggestedComponents && rec.suggestedComponents.length > 0) && (
                      <button
                        onClick={() => onBuildRecommendation(rec)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          backgroundColor: '#4dabf7',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#339af0'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#4dabf7'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <Wrench size={16} />
                        Построить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

