import React, { useState, useRef } from 'react'
import { Node } from 'reactflow'
import { ComponentData, BrokerMessage, KafkaTopic, RabbitMQQueue, SQSQueue, RedisChannel } from '../types'

interface MessageBrokerMessagesPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: {
    kafkaTopics?: KafkaTopic[]
    rabbitmqQueues?: RabbitMQQueue[]
    sqsQueues?: SQSQueue[]
    redisChannels?: RedisChannel[]
  }) => void
  onClose: () => void
  addExampleMessage?: boolean
}

export default function MessageBrokerMessagesPanel({
  node,
  onUpdate,
  onClose,
  addExampleMessage = false,
}: MessageBrokerMessagesPanelProps) {
  const data = node.data as ComponentData
  const vendor = data.messageBrokerConfig?.vendor
  const deliveryType = data.messageBrokerConfig?.deliveryType

  const [kafkaTopics, setKafkaTopics] = useState<KafkaTopic[]>(
    data.messageBrokerConfig?.kafkaTopics || []
  )
  const [rabbitmqQueues, setRabbitmqQueues] = useState<RabbitMQQueue[]>(
    data.messageBrokerConfig?.rabbitmqQueues || []
  )
  const [sqsQueues, setSqsQueues] = useState<SQSQueue[]>(
    data.messageBrokerConfig?.sqsQueues || []
  )
  const [redisChannels, setRedisChannels] = useState<RedisChannel[]>(
    data.messageBrokerConfig?.redisChannels || []
  )

  // Добавляем пример сообщения при первом открытии, если нужно
  React.useEffect(() => {
    if (addExampleMessage && vendor) {
      const exampleMessage: BrokerMessage = {
        id: `example_${Date.now()}`,
        value: {
          type: 'example',
          message: 'Это пример сообщения',
          timestamp: new Date().toISOString(),
          data: {
            userId: 12345,
            action: 'user.login',
            metadata: {
              ip: '192.168.1.1',
              userAgent: 'Mozilla/5.0...'
            }
          }
        },
        timestamp: new Date().toISOString(),
      }

      if (vendor === 'kafka') {
        if (kafkaTopics.length === 0) {
          setKafkaTopics([{
            name: 'example-topic',
            messages: [{
              ...exampleMessage,
              key: 'example-key',
              headers: {
                'Content-Type': 'application/json',
                'Source': 'example-service'
              }
            }]
          }])
          setEditingTopic('example-topic')
        }
      } else if (vendor === 'rabbitmq') {
        if (rabbitmqQueues.length === 0) {
          setRabbitmqQueues([{
            name: 'example-queue',
            messages: [exampleMessage]
          }])
          setEditingQueue('example-queue')
        }
      } else if (vendor === 'amazon-sqs') {
        if (sqsQueues.length === 0) {
          setSqsQueues([{
            name: 'example-queue',
            messages: [exampleMessage]
          }])
          setEditingQueue('example-queue')
        }
      } else if (vendor === 'redis-pubsub') {
        if (redisChannels.length === 0) {
          setRedisChannels([{
            name: 'example-channel',
            messages: [exampleMessage]
          }])
          setEditingChannel('example-channel')
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addExampleMessage, vendor])

  const [newTopicName, setNewTopicName] = useState('')
  const [newQueueName, setNewQueueName] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [editingQueue, setEditingQueue] = useState<string | null>(null)
  const [editingChannel, setEditingChannel] = useState<string | null>(null)
  const [newMessageKey, setNewMessageKey] = useState('')
  const [newMessageValue, setNewMessageValue] = useState('')
  const [newMessageHeaders, setNewMessageHeaders] = useState('')
  const jsonFileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (vendor === 'kafka') {
      onUpdate(node.id, { kafkaTopics })
    } else if (vendor === 'rabbitmq') {
      onUpdate(node.id, { rabbitmqQueues })
    } else if (vendor === 'amazon-sqs') {
      onUpdate(node.id, { sqsQueues })
    } else if (vendor === 'redis-pubsub') {
      onUpdate(node.id, { redisChannels })
    }
    onClose()
  }

  // Kafka
  const handleAddKafkaTopic = () => {
    if (newTopicName.trim()) {
      setKafkaTopics([...kafkaTopics, { name: newTopicName.trim(), messages: [] }])
      setNewTopicName('')
      setEditingTopic(newTopicName.trim())
    }
  }

  const handleDeleteKafkaTopic = (topicName: string) => {
    setKafkaTopics(kafkaTopics.filter(t => t.name !== topicName))
    if (editingTopic === topicName) {
      setEditingTopic(null)
    }
  }

  const handleAddKafkaMessage = (topicName: string) => {
    try {
      let value: string | object = newMessageValue.trim()
      try {
        value = JSON.parse(value)
      } catch {
        // Оставляем как строку
      }

      let headers: Record<string, string> = {}
      if (newMessageHeaders.trim()) {
        try {
          headers = JSON.parse(newMessageHeaders)
        } catch {
          // Игнорируем ошибку парсинга headers
        }
      }

      const message: BrokerMessage = {
        id: `msg_${Date.now()}`,
        key: newMessageKey.trim() || undefined,
        value,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        timestamp: new Date().toISOString(),
      }

      setKafkaTopics(kafkaTopics.map(t =>
        t.name === topicName
          ? { ...t, messages: [...t.messages, message] }
          : t
      ))

      setNewMessageKey('')
      setNewMessageValue('')
      setNewMessageHeaders('')
    } catch (error) {
      alert('Ошибка при добавлении сообщения: ' + (error as Error).message)
    }
  }

  const handleDeleteKafkaMessage = (topicName: string, messageId: string) => {
    setKafkaTopics(kafkaTopics.map(t =>
      t.name === topicName
        ? { ...t, messages: t.messages.filter(m => m.id !== messageId) }
        : t
    ))
  }

  // RabbitMQ
  const handleAddRabbitMQQueue = () => {
    if (newQueueName.trim()) {
      setRabbitmqQueues([...rabbitmqQueues, { name: newQueueName.trim(), messages: [] }])
      setNewQueueName('')
      setEditingQueue(newQueueName.trim())
    }
  }

  const handleDeleteRabbitMQQueue = (queueName: string) => {
    setRabbitmqQueues(rabbitmqQueues.filter(q => q.name !== queueName))
    if (editingQueue === queueName) {
      setEditingQueue(null)
    }
  }

  const handleAddRabbitMQMessage = (queueName: string) => {
    try {
      let value: string | object = newMessageValue.trim()
      try {
        value = JSON.parse(value)
      } catch {
        // Оставляем как строку
      }

      const message: BrokerMessage = {
        id: `msg_${Date.now()}`,
        value,
        timestamp: new Date().toISOString(),
      }

      setRabbitmqQueues(rabbitmqQueues.map(q =>
        q.name === queueName
          ? { ...q, messages: [...q.messages, message] }
          : q
      ))

      setNewMessageValue('')
    } catch (error) {
      alert('Ошибка при добавлении сообщения: ' + (error as Error).message)
    }
  }

  const handleDeleteRabbitMQMessage = (queueName: string, messageId: string) => {
    setRabbitmqQueues(rabbitmqQueues.map(q =>
      q.name === queueName
        ? { ...q, messages: q.messages.filter(m => m.id !== messageId) }
        : q
    ))
  }

  // SQS
  const handleAddSQSQueue = () => {
    if (newQueueName.trim()) {
      setSqsQueues([...sqsQueues, { name: newQueueName.trim(), messages: [] }])
      setNewQueueName('')
      setEditingQueue(newQueueName.trim())
    }
  }

  const handleDeleteSQSQueue = (queueName: string) => {
    setSqsQueues(sqsQueues.filter(q => q.name !== queueName))
    if (editingQueue === queueName) {
      setEditingQueue(null)
    }
  }

  const handleAddSQSMessage = (queueName: string) => {
    try {
      let value: string | object = newMessageValue.trim()
      try {
        value = JSON.parse(value)
      } catch {
        // Оставляем как строку
      }

      const message: BrokerMessage = {
        id: `msg_${Date.now()}`,
        value,
        timestamp: new Date().toISOString(),
      }

      setSqsQueues(sqsQueues.map(q =>
        q.name === queueName
          ? { ...q, messages: [...q.messages, message] }
          : q
      ))

      setNewMessageValue('')
    } catch (error) {
      alert('Ошибка при добавлении сообщения: ' + (error as Error).message)
    }
  }

  const handleDeleteSQSMessage = (queueName: string, messageId: string) => {
    setSqsQueues(sqsQueues.map(q =>
      q.name === queueName
        ? { ...q, messages: q.messages.filter(m => m.id !== messageId) }
        : q
    ))
  }

  // Redis Pub/Sub
  const handleAddRedisChannel = () => {
    if (newChannelName.trim()) {
      setRedisChannels([...redisChannels, { name: newChannelName.trim(), messages: [] }])
      setNewChannelName('')
      setEditingChannel(newChannelName.trim())
    }
  }

  const handleDeleteRedisChannel = (channelName: string) => {
    setRedisChannels(redisChannels.filter(c => c.name !== channelName))
    if (editingChannel === channelName) {
      setEditingChannel(null)
    }
  }

  const handleAddRedisMessage = (channelName: string) => {
    try {
      let value: string | object = newMessageValue.trim()
      try {
        value = JSON.parse(value)
      } catch {
        // Оставляем как строку
      }

      const message: BrokerMessage = {
        id: `msg_${Date.now()}`,
        value,
        timestamp: new Date().toISOString(),
      }

      setRedisChannels(redisChannels.map(c =>
        c.name === channelName
          ? { ...c, messages: [...c.messages, message] }
          : c
      ))

      setNewMessageValue('')
    } catch (error) {
      alert('Ошибка при добавлении сообщения: ' + (error as Error).message)
    }
  }

  const handleDeleteRedisMessage = (channelName: string, messageId: string) => {
    setRedisChannels(redisChannels.map(c =>
      c.name === channelName
        ? { ...c, messages: c.messages.filter(m => m.id !== messageId) }
        : c
    ))
  }

  const handleJsonFileUpload = (target: 'kafka' | 'rabbitmq' | 'sqs' | 'redis') => {
    const file = jsonFileInputRef.current?.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)

        if (target === 'kafka') {
          if (Array.isArray(parsed)) {
            // Массив топиков
            const topics: KafkaTopic[] = parsed.map((item: any) => ({
              name: item.topic || item.name || `topic_${Date.now()}`,
              messages: (item.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                key: msg.key,
                value: msg.value,
                headers: msg.headers,
                timestamp: msg.timestamp || new Date().toISOString(),
              })),
            }))
            setKafkaTopics([...kafkaTopics, ...topics])
          } else if (parsed.topic || parsed.name) {
            // Один топик
            setKafkaTopics([...kafkaTopics, {
              name: parsed.topic || parsed.name,
              messages: (parsed.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                key: msg.key,
                value: msg.value,
                headers: msg.headers,
                timestamp: msg.timestamp || new Date().toISOString(),
              })),
            }])
          }
        } else if (target === 'rabbitmq') {
          if (Array.isArray(parsed)) {
            const queues: RabbitMQQueue[] = parsed.map((item: any) => ({
              name: item.queue || item.name || `queue_${Date.now()}`,
              messages: (item.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                value: msg.value || msg.body,
                timestamp: msg.timestamp || new Date().toISOString(),
              })),
            }))
            setRabbitmqQueues([...rabbitmqQueues, ...queues])
          }
        } else if (target === 'sqs') {
          if (Array.isArray(parsed)) {
            const queues: SQSQueue[] = parsed.map((item: any) => ({
              name: item.queue || item.name || `queue_${Date.now()}`,
              messages: (item.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                value: msg.value || msg.body,
                timestamp: msg.timestamp || new Date().toISOString(),
              })),
            }))
            setSqsQueues([...sqsQueues, ...queues])
          }
        } else if (target === 'redis') {
          if (Array.isArray(parsed)) {
            const channels: RedisChannel[] = parsed.map((item: any) => ({
              name: item.channel || item.name || `channel_${Date.now()}`,
              messages: (item.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                value: msg.value || msg.message,
                timestamp: msg.timestamp || new Date().toISOString(),
              })),
            }))
            setRedisChannels([...redisChannels, ...channels])
          }
        }

        alert('Данные успешно загружены')
      } catch (error) {
        alert('Ошибка при загрузке JSON: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const currentTopic = kafkaTopics.find(t => t.name === editingTopic)
  const currentQueue = rabbitmqQueues.find(q => q.name === editingQueue) || sqsQueues.find(q => q.name === editingQueue)
  const currentChannel = redisChannels.find(c => c.name === editingChannel)

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
        minWidth: '700px',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Управление сообщениями брокера
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
          }}
        >
          ×
        </button>
      </div>

      {/* Информация о брокере */}
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>Брокер:</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffd43b' }}>
          {vendor === 'kafka' ? 'Kafka' :
           vendor === 'rabbitmq' ? 'RabbitMQ' :
           vendor === 'amazon-sqs' ? 'Amazon SQS' :
           vendor === 'redis-pubsub' ? 'Redis Pub/Sub' :
           vendor || 'Не выбран'}
          {deliveryType && ` (${deliveryType})`}
        </div>
      </div>

      {/* Kafka - Топики */}
      {vendor === 'kafka' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Название топика"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddKafkaTopic()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleAddKafkaTopic}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffd43b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить топик
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={() => handleJsonFileUpload('kafka')}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4dabf7',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Загрузить JSON
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {kafkaTopics.map((topic) => (
                <div
                  key={topic.name}
                  style={{
                    padding: '12px',
                    backgroundColor: editingTopic === topic.name ? '#3d3d3d' : '#1e1e1e',
                    border: `2px solid ${editingTopic === topic.name ? '#ffd43b' : '#555'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingTopic(editingTopic === topic.name ? null : topic.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        {topic.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {topic.messages.length} сообщений
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteKafkaTopic(topic.name)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentTopic && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                Топик "{currentTopic.name}"
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ключ сообщения (опционально)"
                    value={newMessageKey}
                    onChange={(e) => setNewMessageKey(e.target.value)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #555',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Headers (JSON, опционально)"
                    value={newMessageHeaders}
                    onChange={(e) => setNewMessageHeaders(e.target.value)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #555',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <textarea
                  placeholder='Значение сообщения (может быть JSON объектом)'
                  value={newMessageValue}
                  onChange={(e) => setNewMessageValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    marginBottom: '10px',
                  }}
                />
                <button
                  onClick={() => handleAddKafkaMessage(currentTopic.name)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffd43b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Добавить сообщение
                </button>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentTopic.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        {message.key && (
                          <div style={{ fontSize: '12px', color: '#4dabf7', marginBottom: '4px' }}>
                            Key: {message.key}
                          </div>
                        )}
                        <pre style={{
                          margin: 0,
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {typeof message.value === 'object' ? JSON.stringify(message.value, null, 2) : String(message.value)}
                        </pre>
                        {message.headers && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            Headers: {JSON.stringify(message.headers)}
                          </div>
                        )}
                        {message.timestamp && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteKafkaMessage(currentTopic.name, message.id || '')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '10px',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* RabbitMQ - Очереди */}
      {vendor === 'rabbitmq' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Название очереди"
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRabbitMQQueue()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleAddRabbitMQQueue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffd43b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить очередь
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={() => handleJsonFileUpload('rabbitmq')}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4dabf7',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Загрузить JSON
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rabbitmqQueues.map((queue) => (
                <div
                  key={queue.name}
                  style={{
                    padding: '12px',
                    backgroundColor: editingQueue === queue.name ? '#3d3d3d' : '#1e1e1e',
                    border: `2px solid ${editingQueue === queue.name ? '#ffd43b' : '#555'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingQueue(editingQueue === queue.name ? null : queue.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        {queue.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {queue.messages.length} сообщений
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRabbitMQQueue(queue.name)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentQueue && 'messages' in currentQueue && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                Очередь "{currentQueue.name}"
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <textarea
                  placeholder='Сообщение (может быть JSON объектом)'
                  value={newMessageValue}
                  onChange={(e) => setNewMessageValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    marginBottom: '10px',
                  }}
                />
                <button
                  onClick={() => handleAddRabbitMQMessage(currentQueue.name)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffd43b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Добавить сообщение
                </button>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentQueue.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <pre style={{
                          margin: 0,
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {typeof message.value === 'object' ? JSON.stringify(message.value, null, 2) : String(message.value)}
                        </pre>
                        {message.timestamp && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteRabbitMQMessage(currentQueue.name, message.id || '')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '10px',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* SQS - Очереди */}
      {vendor === 'amazon-sqs' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Название очереди"
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSQSQueue()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleAddSQSQueue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffd43b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить очередь
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={() => handleJsonFileUpload('sqs')}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4dabf7',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Загрузить JSON
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sqsQueues.map((queue) => (
                <div
                  key={queue.name}
                  style={{
                    padding: '12px',
                    backgroundColor: editingQueue === queue.name ? '#3d3d3d' : '#1e1e1e',
                    border: `2px solid ${editingQueue === queue.name ? '#ffd43b' : '#555'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingQueue(editingQueue === queue.name ? null : queue.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        {queue.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {queue.messages.length} сообщений
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSQSQueue(queue.name)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentQueue && 'messages' in currentQueue && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                Очередь "{currentQueue.name}"
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <textarea
                  placeholder='Сообщение (может быть JSON объектом)'
                  value={newMessageValue}
                  onChange={(e) => setNewMessageValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    marginBottom: '10px',
                  }}
                />
                <button
                  onClick={() => handleAddSQSMessage(currentQueue.name)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffd43b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Добавить сообщение
                </button>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentQueue.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <pre style={{
                          margin: 0,
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {typeof message.value === 'object' ? JSON.stringify(message.value, null, 2) : String(message.value)}
                        </pre>
                        {message.timestamp && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSQSMessage(currentQueue.name, message.id || '')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '10px',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Redis Pub/Sub - Каналы */}
      {vendor === 'redis-pubsub' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Название канала"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRedisChannel()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleAddRedisChannel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffd43b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Добавить канал
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={() => handleJsonFileUpload('redis')}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4dabf7',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Загрузить JSON
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {redisChannels.map((channel) => (
                <div
                  key={channel.name}
                  style={{
                    padding: '12px',
                    backgroundColor: editingChannel === channel.name ? '#3d3d3d' : '#1e1e1e',
                    border: `2px solid ${editingChannel === channel.name ? '#ffd43b' : '#555'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingChannel(editingChannel === channel.name ? null : channel.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        {channel.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        {channel.messages.length} сообщений
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRedisChannel(channel.name)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentChannel && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                Канал "{currentChannel.name}"
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <textarea
                  placeholder='Сообщение (может быть JSON объектом)'
                  value={newMessageValue}
                  onChange={(e) => setNewMessageValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    marginBottom: '10px',
                  }}
                />
                <button
                  onClick={() => handleAddRedisMessage(currentChannel.name)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffd43b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Добавить сообщение
                </button>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentChannel.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <pre style={{
                          margin: 0,
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {typeof message.value === 'object' ? JSON.stringify(message.value, null, 2) : String(message.value)}
                        </pre>
                        {message.timestamp && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteRedisMessage(currentChannel.name, message.id || '')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '10px',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!vendor && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>
          Сначала необходимо выбрать брокер сообщений в настройках компонента
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
            opacity: vendor ? 1 : 0.5,
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}

