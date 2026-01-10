import { useState, useEffect, useMemo } from 'react'
import { Node } from 'reactflow'
import { ConnectionType, ComponentData } from '../types'

interface ConnectionTypeSelectorProps {
  sourceNode: Node
  targetNode: Node
  onSelect: (type: ConnectionType, relationshipType?: '1:1' | '1:n' | 'n:1' | 'n:m') => void
  onCancel: () => void
}

const connectionTypes: Array<{ value: ConnectionType; label: string; description: string }> = [
  { value: 'rest', label: 'REST', description: 'HTTP REST API' },
  { value: 'grpc', label: 'gRPC', description: 'gRPC протокол' },
  { value: 'async', label: 'Асинхронный', description: 'Через брокер сообщений' },
  { value: 'get-information', label: 'Получение информации', description: 'Запрос данных без указания протокола' },
  { value: 'send-information', label: 'Отправка информации', description: 'Передача данных без указания протокола' },
  { value: 'bidirectional', label: 'Двухсторонняя стрелка', description: 'Двухстороннее соединение' },
  { value: 'async-bidirectional', label: 'Асинхронная двухсторонняя стрелка', description: 'Асинхронное двухстороннее соединение' },
  { value: 'database-connection', label: 'Database Connection', description: 'Прямое подключение к БД' },
  { value: 'database-replication', label: 'Database Replication', description: 'Репликация между БД' },
  { value: 'cache-connection', label: 'Cache Connection', description: 'Подключение к кешу (Redis, Memcached)' },
  { value: 'dependency', label: 'Зависимость', description: 'Зависимость между компонентами' },
  { value: 'composition', label: 'Композиция', description: 'Композиция (часть-целое)' },
  { value: 'aggregation', label: 'Агрегация', description: 'Агрегация (слабая связь)' },
  { value: 'method-call', label: 'Вызов метода', description: 'Вызов метода класса' },
  { value: 'inheritance', label: 'Наследование', description: 'Наследование класса' },
  { value: 'relationship', label: 'Имеет отношение', description: 'Общая связь/отношение между компонентами' },
]

const architecturalTypes: Array<{ value: ConnectionType; label: string; description: string }> = [
  { value: 'dependency', label: 'Зависимость', description: 'Зависимость между компонентами' },
  { value: 'composition', label: 'Композиция', description: 'Композиция (часть-целое)' },
  { value: 'aggregation', label: 'Агрегация', description: 'Агрегация (слабая связь)' },
  { value: 'method-call', label: 'Вызов метода', description: 'Вызов метода класса' },
  { value: 'inheritance', label: 'Наследование', description: 'Наследование класса' },
  { value: 'relationship', label: 'Имеет отношение', description: 'Общая связь/отношение между компонентами' },
]

export default function ConnectionTypeSelector({
  sourceNode,
  targetNode,
  onSelect,
  onCancel,
}: ConnectionTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null)
  const [relationshipType, setRelationshipType] = useState<'1:1' | '1:n' | 'n:1' | 'n:m'>('1:n')

  const sourceData = sourceNode.data as ComponentData
  const targetData = targetNode.data as ComponentData

  // Определяем, являются ли компоненты архитектурными (controller, class, repository)
  const isArchitecturalConnection = useMemo(() => {
    const architecturalTypes = ['controller', 'class', 'repository']
    return architecturalTypes.includes(sourceData.type) && architecturalTypes.includes(targetData.type)
  }, [sourceData.type, targetData.type])

  // Все типы соединений доступны без ограничений
  const availableTypes = useMemo(() => {
    // Если это соединение между архитектурными компонентами, показываем специальные типы
    if (isArchitecturalConnection) {
      // Для controller-class показываем method-call и dependency
      if (sourceData.type === 'controller' && targetData.type === 'class') {
        return [
          { value: 'method-call' as ConnectionType, label: 'Вызов метода', description: 'Контроллер вызывает методы класса' },
          { value: 'dependency' as ConnectionType, label: 'Зависимость', description: 'Контроллер зависит от класса' },
          { value: 'relationship' as ConnectionType, label: 'Имеет отношение', description: 'Связь между компонентами' },
        ]
      }
      // Для class-repository показываем dependency, composition, aggregation
      if (sourceData.type === 'class' && targetData.type === 'repository') {
        return [
          { value: 'dependency' as ConnectionType, label: 'Зависимость', description: 'Класс зависит от репозитория' },
          { value: 'composition' as ConnectionType, label: 'Композиция', description: 'Класс содержит репозиторий (часть-целое)' },
          { value: 'aggregation' as ConnectionType, label: 'Агрегация', description: 'Класс использует репозиторий (слабая связь)' },
          { value: 'relationship' as ConnectionType, label: 'Имеет отношение', description: 'Связь между компонентами' },
        ]
      }
      // Для class-class показываем inheritance, dependency, composition
      if (sourceData.type === 'class' && targetData.type === 'class') {
        return [
          { value: 'inheritance' as ConnectionType, label: 'Наследование', description: 'Наследование класса' },
          { value: 'dependency' as ConnectionType, label: 'Зависимость', description: 'Зависимость между классами' },
          { value: 'composition' as ConnectionType, label: 'Композиция', description: 'Композиция (часть-целое)' },
          { value: 'relationship' as ConnectionType, label: 'Имеет отношение', description: 'Связь между компонентами' },
        ]
      }
      // Для остальных архитектурных соединений показываем все архитектурные типы
      return architecturalTypes.map(type => ({
        value: type.value,
        label: type.label,
        description: type.description,
      }))
    }

    // Для остальных соединений показываем все типы
    // Исключаем только очень специфические архитектурные если они не подходят,
    // но в данном приложении мы разрешаем всё.
    // Однако, для чистоты UI отфильтруем типы, которые обычно не используются вне кода.

    // ДОБАВЛЯЕМ 'relationship' во все списки
    const filtered = connectionTypes.filter(type =>
      !['dependency', 'composition', 'aggregation', 'method-call', 'inheritance'].includes(type.value) || type.value === 'relationship'
    )

    // Если оба - таблицы, добавляем специальные типы для БД
    if (sourceData.type === 'table' && targetData.type === 'table') {
      return [
        { value: 'database-connection' as ConnectionType, label: 'Связь таблиц', description: 'Отношение между таблицами БД' },
        ...filtered.filter(t => t.value !== 'database-connection')
      ]
    }

    // Если один из них Team (команда), убедимся что Relationship доступен (он и так в filtered теперь)

    return filtered
  }, [isArchitecturalConnection, sourceData.type, targetData.type])

  // Автоматически выбираем первый доступный тип
  useEffect(() => {
    if (availableTypes.length > 0 && !selectedType) {
      setSelectedType(availableTypes[0].value)
    }
  }, [availableTypes, selectedType])

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType, (sourceData.type === 'table' && targetData.type === 'table') ? relationshipType : undefined)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2d2d2d',
        border: '2px solid #555',
        borderRadius: '12px',
        padding: '30px',
        minWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '15px' }}>
        Выберите тип связи
      </h3>
      <div style={{ marginBottom: '20px', fontSize: '13px', color: '#aaa' }}>
        <div style={{ marginBottom: '5px' }}>
          <strong style={{ color: '#fff' }}>От:</strong> {sourceData.label}
        </div>
        <div>
          <strong style={{ color: '#fff' }}>К:</strong> {targetData.label}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
        {availableTypes.map((type) => (
          <label
            key={type.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: selectedType === type.value ? 'rgba(77, 171, 247, 0.1)' : 'transparent',
              border: `1px solid ${selectedType === type.value ? '#4dabf7' : '#444'}`,
              transition: 'all 0.2s',
            }}
            onClick={() => setSelectedType(type.value)}
          >
            <input
              type="radio"
              name="connectionType"
              value={type.value}
              checked={selectedType === type.value}
              onChange={() => setSelectedType(type.value)}
              style={{ cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                {type.label}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>{type.description}</div>
            </div>
          </label>
        ))}
      </div>

      {sourceData.type === 'table' && targetData.type === 'table' && selectedType === 'database-connection' && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '10px' }}>Тип отношения:</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['1:1', '1:n', 'n:1', 'n:m'] as const).map(rel => (
              <button
                key={rel}
                onClick={() => setRelationshipType(rel)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: relationshipType === rel ? '#4dabf7' : '#3d3d3d',
                  color: '#fff',
                  border: `1px solid ${relationshipType === rel ? '#4dabf7' : '#555'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#aaa',
            border: '1px solid #555',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#888'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#555'
            e.currentTarget.style.color = '#aaa'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedType}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: selectedType ? '#4dabf7' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedType ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
        >
          Создать
        </button>
      </div>
    </div>
  )
}
