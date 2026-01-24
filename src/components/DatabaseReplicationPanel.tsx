import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ReplicationApproach, ReplicationTool } from '../types'

const getToolDescription = (tool: ReplicationTool): string => {
  const descriptions: Record<ReplicationTool, string> = {
    'debezium': 'CDC платформа на базе Kafka',
    'kafka-connect': 'Коннекторы для интеграции через Kafka',
    'apache-nifi': 'Потоковая обработка и маршрутизация данных',
    'airbyte': 'Open-source платформа для интеграции данных',
    'dms': 'AWS Database Migration Service',
    'goldengate': 'Oracle GoldenGate для репликации в реальном времени',
    'native-replication': 'Встроенные механизмы репликации СУБД',
  }
  return descriptions[tool] || ''
}

interface DatabaseReplicationPanelProps {
  sourceNode: Node
  targetNode: Node
  onSelect: (approach: ReplicationApproach, tool?: ReplicationTool) => void
  onCancel: () => void
}

const replicationApproaches: Array<{
  value: ReplicationApproach
  label: string
  description: string
  tools: Array<{ value: ReplicationTool; label: string }>
}> = [
  {
    value: 'master-slave',
    label: 'Master-Slave',
    description: 'Односторонняя репликация от главной к подчиненной БД',
    tools: [
      { value: 'native-replication', label: 'Нативная репликация БД' },
      { value: 'dms', label: 'AWS DMS' },
      { value: 'goldengate', label: 'Oracle GoldenGate' },
    ],
  },
  {
    value: 'master-master',
    label: 'Master-Master',
    description: 'Двусторонняя репликация между БД',
    tools: [
      { value: 'native-replication', label: 'Нативная репликация БД' },
      { value: 'goldengate', label: 'Oracle GoldenGate' },
    ],
  },
  {
    value: 'cdc',
    label: 'CDC (Change Data Capture)',
    description: 'Захват изменений данных в реальном времени',
    tools: [
      { value: 'debezium', label: 'Debezium' },
      { value: 'kafka-connect', label: 'Kafka Connect' },
      { value: 'goldengate', label: 'Oracle GoldenGate' },
    ],
  },
  {
    value: 'etl',
    label: 'ETL',
    description: 'Извлечение, преобразование и загрузка данных',
    tools: [
      { value: 'apache-nifi', label: 'Apache NiFi' },
      { value: 'airbyte', label: 'Airbyte' },
      { value: 'dms', label: 'AWS DMS' },
    ],
  },
  {
    value: 'streaming',
    label: 'Streaming',
    description: 'Потоковая передача данных',
    tools: [
      { value: 'kafka-connect', label: 'Kafka Connect' },
      { value: 'debezium', label: 'Debezium' },
    ],
  },
  {
    value: 'snapshot',
    label: 'Snapshot',
    description: 'Периодическое создание снимков данных',
    tools: [
      { value: 'airbyte', label: 'Airbyte' },
      { value: 'dms', label: 'AWS DMS' },
      { value: 'apache-nifi', label: 'Apache NiFi' },
    ],
  },
]

export default function DatabaseReplicationPanel({
  sourceNode,
  targetNode,
  onSelect,
  onCancel,
}: DatabaseReplicationPanelProps) {
  const [selectedApproach, setSelectedApproach] = useState<ReplicationApproach | null>(null)
  const [selectedTool, setSelectedTool] = useState<ReplicationTool | undefined>(undefined)

  const sourceData = sourceNode.data as ComponentData
  const targetData = targetNode.data as ComponentData

  const selectedApproachData = replicationApproaches.find((a) => a.value === selectedApproach)

  useEffect(() => {
    if (selectedApproachData && selectedApproachData.tools.length > 0) {
      setSelectedTool(selectedApproachData.tools[0].value)
    } else {
      setSelectedTool(undefined)
    }
  }, [selectedApproach])

  const handleConfirm = () => {
    if (selectedApproach) {
      onSelect(selectedApproach, selectedTool)
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
        border: '2px solid #51cf66',
        borderRadius: '12px',
        padding: '30px',
        minWidth: '500px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '15px' }}>
        Настройка репликации между базами данных
      </h3>
      <div style={{ marginBottom: '20px', fontSize: '13px', color: '#aaa' }}>
        <div style={{ marginBottom: '5px' }}>
          <strong style={{ color: '#fff' }}>От:</strong> {sourceData.label}
        </div>
        <div>
          <strong style={{ color: '#fff' }}>К:</strong> {targetData.label}
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
          Подход к репликации:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {replicationApproaches.map((approach) => (
            <label
              key={approach.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: selectedApproach === approach.value ? '#3d3d3d' : 'transparent',
                border: `2px solid ${selectedApproach === approach.value ? '#51cf66' : '#555'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setSelectedApproach(approach.value)}
            >
              <input
                type="radio"
                name="replicationApproach"
                value={approach.value}
                checked={selectedApproach === approach.value}
                onChange={() => setSelectedApproach(approach.value)}
                style={{ cursor: 'pointer', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  {approach.label}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{approach.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {selectedApproachData && selectedApproachData.tools.length > 0 && (
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
            Инструмент для реализации:
          </label>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#3d3d3d', 
            borderRadius: '8px',
            marginBottom: '10px',
            fontSize: '12px',
            color: '#aaa',
            border: '1px solid #555'
          }}>
            Выберите инструмент, который будет использоваться для реализации выбранного подхода
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedApproachData.tools.map((tool) => (
              <label
                key={tool.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: selectedTool === tool.value ? '#3d3d3d' : 'transparent',
                  border: `2px solid ${selectedTool === tool.value ? '#51cf66' : '#555'}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedTool(tool.value)}
                onMouseEnter={(e) => {
                  if (selectedTool !== tool.value) {
                    e.currentTarget.style.backgroundColor = '#353535'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTool !== tool.value) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <input
                  type="radio"
                  name="replicationTool"
                  value={tool.value}
                  checked={selectedTool === tool.value}
                  onChange={() => setSelectedTool(tool.value)}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                    {tool.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>
                    {getToolDescription(tool.value)}
                  </div>
                </div>
              </label>
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
          onClick={handleConfirm}
          disabled={!selectedApproach || (selectedApproachData && selectedApproachData.tools.length > 0 && !selectedTool)}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: (selectedApproach && (!selectedApproachData || selectedApproachData.tools.length === 0 || selectedTool)) ? '#51cf66' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (selectedApproach && (!selectedApproachData || selectedApproachData.tools.length === 0 || selectedTool)) ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: (selectedApproach && (!selectedApproachData || selectedApproachData.tools.length === 0 || selectedTool)) ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (selectedApproach && (!selectedApproachData || selectedApproachData.tools.length === 0 || selectedTool)) {
              e.currentTarget.style.backgroundColor = '#40c057'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedApproach && (!selectedApproachData || selectedApproachData.tools.length === 0 || selectedTool)) {
              e.currentTarget.style.backgroundColor = '#51cf66'
            }
          }}
        >
          Создать
        </button>
      </div>
    </div>
  )
}

