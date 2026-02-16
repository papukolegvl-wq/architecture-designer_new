import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ApiGatewayVendor } from '../types'

interface ApiGatewayConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: {
    vendor: ApiGatewayVendor
    rateLimiting?: boolean
    authentication?: boolean
    requestTransformation?: boolean
    responseTransformation?: boolean
    caching?: boolean
    loadBalancing?: boolean
    circuitBreaker?: boolean
    apiVersioning?: boolean
  }) => void
  onClose: () => void
}

const vendors: Array<{ value: ApiGatewayVendor; label: string; description: string }> = [
  { value: 'aws-api-gateway', label: 'AWS API Gateway', description: 'API Gateway от Amazon' },
  { value: 'azure-api-management', label: 'Azure API Management', description: 'API Management от Microsoft' },
  { value: 'kong', label: 'Kong', description: 'Open source API gateway' },
  { value: 'tyk', label: 'Tyk', description: 'Open source API gateway' },
  { value: 'apigee', label: 'Apigee', description: 'API management от Google' },
  { value: 'nginx-plus', label: 'NGINX Plus', description: 'API gateway на базе NGINX' },
]

export default function ApiGatewayConfigPanel({
  node,
  onUpdate,
  onClose,
}: ApiGatewayConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<ApiGatewayVendor | undefined>(
    data.apiGatewayConfig?.vendor
  )
  const [rateLimiting, setRateLimiting] = useState(
    data.apiGatewayConfig?.rateLimiting ?? true
  )
  const [authentication, setAuthentication] = useState(
    data.apiGatewayConfig?.authentication ?? true
  )
  const [requestTransformation, setRequestTransformation] = useState(
    data.apiGatewayConfig?.requestTransformation ?? false
  )
  const [responseTransformation, setResponseTransformation] = useState(
    data.apiGatewayConfig?.responseTransformation ?? false
  )
  const [caching, setCaching] = useState(
    data.apiGatewayConfig?.caching ?? false
  )
  const [loadBalancing, setLoadBalancing] = useState(
    data.apiGatewayConfig?.loadBalancing ?? true
  )
  const [circuitBreaker, setCircuitBreaker] = useState(
    data.apiGatewayConfig?.circuitBreaker ?? false
  )
  const [apiVersioning, setApiVersioning] = useState(
    data.apiGatewayConfig?.apiVersioning ?? false
  )

  useEffect(() => {
    if (!vendor && vendors.length > 0) {
      setVendor(vendors[0].value)
    }
  }, [vendor])

  // Автоматическое сохранение при изменении любого параметра
  useEffect(() => {
    if (vendor) {
      onUpdate(node.id, {
        vendor,
        rateLimiting,
        authentication,
        requestTransformation,
        responseTransformation,
        caching,
        loadBalancing,
        circuitBreaker,
        apiVersioning,
      })
    }
  }, [
    vendor,
    rateLimiting,
    authentication,
    requestTransformation,
    responseTransformation,
    caching,
    loadBalancing,
    circuitBreaker,
    apiVersioning,
    node.id,
    onUpdate
  ])

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #ff6b6b',
        borderRadius: '12px',
        padding: '25px',
        minWidth: '400px',
        maxWidth: '450px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Настройка API Gateway
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
          Провайдер/Технология:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {vendors.map((v) => (
            <label
              key={v.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${vendor === v.value ? '#ff6b6b' : '#555'}`,
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
                style={{ cursor: 'pointer', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                  {v.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{v.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Характеристики API Gateway:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: rateLimiting ? '#3d3d3d' : 'transparent',
              border: `1px solid ${rateLimiting ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={rateLimiting}
              onChange={(e) => setRateLimiting(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Ограничение скорости (Rate Limiting)</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: authentication ? '#3d3d3d' : 'transparent',
              border: `1px solid ${authentication ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={authentication}
              onChange={(e) => setAuthentication(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Аутентификация и авторизация</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: requestTransformation ? '#3d3d3d' : 'transparent',
              border: `1px solid ${requestTransformation ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={requestTransformation}
              onChange={(e) => setRequestTransformation(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Трансформация запросов</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: responseTransformation ? '#3d3d3d' : 'transparent',
              border: `1px solid ${responseTransformation ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={responseTransformation}
              onChange={(e) => setResponseTransformation(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Трансформация ответов</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: caching ? '#3d3d3d' : 'transparent',
              border: `1px solid ${caching ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={caching}
              onChange={(e) => setCaching(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Кэширование ответов</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: loadBalancing ? '#3d3d3d' : 'transparent',
              border: `1px solid ${loadBalancing ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={loadBalancing}
              onChange={(e) => setLoadBalancing(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Балансировка нагрузки</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: circuitBreaker ? '#3d3d3d' : 'transparent',
              border: `1px solid ${circuitBreaker ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={circuitBreaker}
              onChange={(e) => setCircuitBreaker(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Circuit Breaker (защита от сбоев)</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: apiVersioning ? '#3d3d3d' : 'transparent',
              border: `1px solid ${apiVersioning ? '#ff6b6b' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={apiVersioning}
              onChange={(e) => setApiVersioning(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Версионирование API</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#ff6b6b',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff5252'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff6b6b'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}

