import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, QueueVendor } from '../types'

interface QueueConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { 
    vendor: QueueVendor
    queueType?: 'fifo' | 'standard' | 'priority'
    visibilityTimeout?: number
    messageRetention?: number
  }) => void
  onClose: () => void
}

const vendors: Array<{ value: QueueVendor; label: string; description: string }> = [
  { value: 'rabbitmq', label: 'RabbitMQ', description: 'Открытая платформа для очередей сообщений' },
  { value: 'amazon-sqs', label: 'Amazon SQS', description: 'Управляемая очередь сообщений от AWS' },
  { value: 'azure-queue', label: 'Azure Queue', description: 'Очередь сообщений от Microsoft Azure' },
  { value: 'google-cloud-tasks', label: 'Google Cloud Tasks', description: 'Управляемая очередь задач от Google' },
  { value: 'redis-queue', label: 'Redis Queue', description: 'Очередь на базе Redis' },
  { value: 'beanstalkd', label: 'Beanstalkd', description: 'Простая и быстрая очередь задач' },
  { value: 'bull', label: 'Bull', description: 'Очередь задач для Node.js на базе Redis' },
]

export default function QueueConfigPanel({
  node,
  onUpdate,
  onClose,
}: QueueConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<QueueVendor | undefined>(
    data.queueConfig?.vendor
  )
  const [queueType, setQueueType] = useState<'fifo' | 'standard' | 'priority' | undefined>(
    data.queueConfig?.queueType
  )
  const [visibilityTimeout, setVisibilityTimeout] = useState<number | undefined>(
    data.queueConfig?.visibilityTimeout
  )
  const [messageRetention, setMessageRetention] = useState<number | undefined>(
    data.queueConfig?.messageRetention
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
        queueType,
        visibilityTimeout,
        messageRetention,
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
          Настройка очереди
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
          Тип очереди:
        </label>
        <select
          value={queueType || ''}
          onChange={(e) => setQueueType(e.target.value as any)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <option value="">Не выбрано</option>
          <option value="fifo">FIFO (First In First Out)</option>
          <option value="standard">Стандартная</option>
          <option value="priority">Приоритетная</option>
        </select>
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
          Таймаут видимости (секунды):
        </label>
        <input
          type="number"
          value={visibilityTimeout || ''}
          onChange={(e) => setVisibilityTimeout(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="30"
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
          Время хранения сообщений (дни):
        </label>
        <input
          type="number"
          value={messageRetention || ''}
          onChange={(e) => setMessageRetention(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="7"
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












