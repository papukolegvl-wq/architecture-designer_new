import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, MessageBrokerVendor, MessageDeliveryType } from '../types'

interface MessageBrokerConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { vendor: MessageBrokerVendor; deliveryType: MessageDeliveryType }) => void
  onClose: () => void
  onOpenMessagesPanel?: (nodeId: string, addExample?: boolean) => void
}

const vendors: Array<{ value: MessageBrokerVendor; label: string; description: string }> = [
  { value: 'kafka', label: 'Apache Kafka', description: 'Распределенная платформа потоковой обработки' },
  { value: 'rabbitmq', label: 'RabbitMQ', description: 'Message broker на AMQP' },
  { value: 'activemq', label: 'Apache ActiveMQ', description: 'Open source message broker' },
  { value: 'nats', label: 'NATS', description: 'Легковесный message broker' },
  { value: 'pulsar', label: 'Apache Pulsar', description: 'Cloud-native messaging' },
  { value: 'redis-pubsub', label: 'Redis Pub/Sub', description: 'Pub/Sub через Redis' },
  { value: 'amazon-sqs', label: 'Amazon SQS', description: 'AWS Simple Queue Service' },
  { value: 'azure-service-bus', label: 'Azure Service Bus', description: 'Microsoft messaging service' },
]

const deliveryTypes: Array<{ value: MessageDeliveryType; label: string; description: string }> = [
  { value: 'push', label: 'Push', description: 'Брокер отправляет сообщения потребителю' },
  { value: 'pull', label: 'Pull', description: 'Потребитель запрашивает сообщения' },
  { value: 'pub-sub', label: 'Pub-Sub', description: 'Издатель-подписчик (публикация/подписка)' },
]

export default function MessageBrokerConfigPanel({
  node,
  onUpdate,
  onClose,
  onOpenMessagesPanel,
}: MessageBrokerConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<MessageBrokerVendor | undefined>(
    data.messageBrokerConfig?.vendor
  )
  const [deliveryType, setDeliveryType] = useState<MessageDeliveryType>(
    data.messageBrokerConfig?.deliveryType || 'pub-sub'
  )

  useEffect(() => {
    // Автоматически выбираем первый vendor если не выбран
    if (!vendor && vendors.length > 0) {
      setVendor(vendors[0].value)
    }
  }, [vendor])

  const handleSave = () => {
    if (vendor) {
      onUpdate(node.id, { vendor, deliveryType })
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
        border: '2px solid #ffd43b',
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
          Настройка брокера сообщений
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
          Брокер сообщений:
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
                border: `2px solid ${vendor === v.value ? '#ffd43b' : '#555'}`,
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
          Тип доставки сообщений:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {deliveryTypes.map((type) => (
            <label
              key={type.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: deliveryType === type.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${deliveryType === type.value ? '#ffd43b' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setDeliveryType(type.value)}
            >
              <input
                type="radio"
                name="deliveryType"
                value={type.value}
                checked={deliveryType === type.value}
                onChange={() => setDeliveryType(type.value)}
                style={{ cursor: 'pointer', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                  {type.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              backgroundColor: vendor ? '#ffd43b' : '#555',
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
                e.currentTarget.style.backgroundColor = '#ffc107'
              }
            }}
            onMouseLeave={(e) => {
              if (vendor) {
                e.currentTarget.style.backgroundColor = '#ffd43b'
              }
            }}
          >
            Сохранить
          </button>
        </div>
        {vendor && onOpenMessagesPanel && (
          <>
            <button
              onClick={() => {
                handleSave()
                setTimeout(() => {
                  onOpenMessagesPanel!(node.id, false)
                }, 100)
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4dabf7',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s',
                marginBottom: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#339af0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4dabf7'
              }}
            >
              Сохранить и добавить сообщения
            </button>
            <button
              onClick={() => {
                handleSave()
                setTimeout(() => {
                  onOpenMessagesPanel!(node.id, true)
                }, 100)
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#51cf66',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#40c057'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#51cf66'
              }}
            >
              Сохранить и добавить пример сообщения
            </button>
          </>
        )}
      </div>
    </div>
  )
}

