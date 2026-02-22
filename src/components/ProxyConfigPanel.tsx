import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ProxyVendor } from '../types'

interface ProxyConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { 
    vendor: ProxyVendor
    proxyType?: 'forward' | 'reverse' | 'transparent'
    rulesCount?: number
  }) => void
  onClose: () => void
}

const vendors: Array<{ value: ProxyVendor; label: string; description: string }> = [
  { value: 'nginx', label: 'NGINX', description: 'Высокопроизводительный веб-сервер и обратный прокси' },
  { value: 'haproxy', label: 'HAProxy', description: 'Надежный балансировщик нагрузки и прокси' },
  { value: 'squid', label: 'Squid', description: 'Кэширующий прокси-сервер' },
  { value: 'traefik', label: 'Traefik', description: 'Современный обратный прокси и балансировщик нагрузки' },
  { value: 'envoy', label: 'Envoy', description: 'Высокопроизводительный прокси-сервис для облачных приложений' },
]

const proxyTypes: Array<{ value: 'forward' | 'reverse' | 'transparent'; label: string; description: string }> = [
  { value: 'forward', label: 'Прямой (Forward)', description: 'Прокси для клиентов' },
  { value: 'reverse', label: 'Обратный (Reverse)', description: 'Прокси для серверов' },
  { value: 'transparent', label: 'Прозрачный (Transparent)', description: 'Прокси без изменения запросов' },
]

export default function ProxyConfigPanel({
  node,
  onUpdate,
  onClose,
}: ProxyConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<ProxyVendor | undefined>(
    data.proxyConfig?.vendor
  )
  const [proxyType, setProxyType] = useState<'forward' | 'reverse' | 'transparent' | undefined>(
    data.proxyConfig?.proxyType
  )
  const [rulesCount, setRulesCount] = useState<number | undefined>(
    data.proxyConfig?.rulesCount
  )

  useEffect(() => {
    if (!vendor && vendors.length > 0) {
      setVendor(vendors[0].value)
    }
  }, [vendor])

  const handleSave = () => {
    if (vendor) {
      onUpdate(node.id, { 
        vendor,
        proxyType,
        rulesCount,
      })
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#2d2d2d',
        border: '2px solid #4dabf7',
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
          Настройка прокси
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
                border: `2px solid ${vendor === v.value ? '#4dabf7' : '#555'}`,
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
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ccc',
          }}
        >
          Тип прокси:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {proxyTypes.map((t) => (
            <label
              key={t.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: proxyType === t.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${proxyType === t.value ? '#4dabf7' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setProxyType(t.value)}
            >
              <input
                type="radio"
                name="proxyType"
                value={t.value}
                checked={proxyType === t.value}
                onChange={() => setProxyType(t.value)}
                style={{ cursor: 'pointer', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                  {t.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{t.description}</div>
              </div>
            </label>
          ))}
        </div>
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
          Количество правил:
        </label>
        <input
          type="number"
          value={rulesCount || ''}
          onChange={(e) => setRulesCount(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="0"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#666'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#555'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!vendor}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: vendor ? '#4dabf7' : '#555',
            color: vendor ? '#000' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: vendor ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: vendor ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (vendor) {
              e.currentTarget.style.backgroundColor = '#339af0'
            }
          }}
          onMouseLeave={(e) => {
            if (vendor) {
              e.currentTarget.style.backgroundColor = '#4dabf7'
            }
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}












