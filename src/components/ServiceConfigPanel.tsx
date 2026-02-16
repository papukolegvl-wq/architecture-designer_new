import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ServiceLanguage, ServiceConfig } from '../types'

interface ServiceConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: ServiceConfig) => void
  onClose: () => void
}

const languages: Array<{ value: ServiceLanguage; label: string; icon: string }> = [
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'nodejs', label: 'Node.js', icon: '🟢' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'kotlin', label: 'Kotlin', icon: '🔵' },
  { value: 'scala', label: 'Scala', icon: '🔴' },
]

export default function ServiceConfigPanel({
  node,
  onUpdate,
  onClose,
}: ServiceConfigPanelProps) {
  const data = node.data as ComponentData
  const [language, setLanguage] = useState<ServiceLanguage | undefined>(
    data.serviceConfig?.language
  )


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
        minWidth: '350px',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Настройка сервиса
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
          Язык программирования:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {languages.map((lang) => (
            <label
              key={lang.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: language === lang.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${language === lang.value ? '#4dabf7' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setLanguage(lang.value)
                onUpdate(node.id, { language: lang.value })
              }}
            >
              <input
                type="radio"
                name="language"
                value={lang.value}
                checked={language === lang.value}
                onChange={() => {
                  setLanguage(lang.value)
                  onUpdate(node.id, { language: lang.value })
                }}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '20px' }}>{lang.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {lang.label}
              </span>
            </label>
          ))}
        </div>
      </div>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
          {[
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
          ].map((option) => (
            <label
              key={option.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: data.serviceConfig?.[option.key as keyof ServiceConfig] ? '#3d3d3d' : 'transparent',
                border: `1px solid ${data.serviceConfig?.[option.key as keyof ServiceConfig] ? '#4dabf7' : '#555'}`,
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={!!data.serviceConfig?.[option.key as keyof ServiceConfig]}
                onChange={(e) => {
                  onUpdate(node.id, { [option.key]: e.target.checked })
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

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#4dabf7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#339af0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4dabf7'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
