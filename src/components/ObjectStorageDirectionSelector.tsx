import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ObjectStorageDirection, ConnectionType } from '../types'

interface DataDirectionSelectorProps {
  sourceNode: Node
  targetNode: Node
  connectionType: ConnectionType
  onSelect: (direction: ObjectStorageDirection) => void
  onCancel: () => void
}

export default function DataDirectionSelector({
  sourceNode,
  targetNode,
  connectionType: _connectionType,
  onSelect,
  onCancel,
}: DataDirectionSelectorProps) {
  const [selectedDirection, setSelectedDirection] = useState<ObjectStorageDirection>('download')

  const sourceData = sourceNode.data as ComponentData
  const targetData = targetNode.data as ComponentData

  // Определяем текст в зависимости от типа соединения
  const getTitle = () => {
    if (targetData.type === 'object-storage') {
      return 'Выберите направление данных'
    } else if (targetData.type === 'database' || targetData.type === 'data-warehouse') {
      return 'Выберите направление данных'
    } else if (targetData.type === 'message-broker') {
      return 'Выберите направление сообщений'
    }
    return 'Выберите направление данных'
  }

  const getDescription = (direction: ObjectStorageDirection) => {
    if (targetData.type === 'object-storage') {
      if (direction === 'bidirectional') {
        return 'Сервис отправляет и получает данные из объектного хранилища'
      }
      return direction === 'download' 
        ? 'Сервис получает данные из объектного хранилища'
        : 'Сервис отправляет данные в объектное хранилище'
    } else if (targetData.type === 'database' || targetData.type === 'data-warehouse') {
      if (direction === 'bidirectional') {
        return 'Сервис читает и записывает данные в базу данных'
      }
      return direction === 'download'
        ? 'Сервис получает данные из базы данных'
        : 'Сервис отправляет данные в базу данных'
    } else if (targetData.type === 'message-broker') {
      if (direction === 'bidirectional') {
        return 'Сервис публикует и подписывается на сообщения в брокере'
      }
      return direction === 'download'
        ? 'Сервис получает сообщения из брокера (подписка)'
        : 'Сервис отправляет сообщения в брокер (публикация)'
    }
    if (direction === 'bidirectional') {
      return 'Двунаправленный обмен данными'
    }
    return direction === 'download'
      ? 'Получение данных'
      : 'Отправка данных'
  }

  const handleConfirm = () => {
    onSelect(selectedDirection)
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
        {getTitle()}
      </h3>
      <div style={{ marginBottom: '20px', fontSize: '13px', color: '#aaa' }}>
        <div style={{ marginBottom: '5px' }}>
          <strong style={{ color: '#fff' }}>От:</strong> {sourceData.label}
        </div>
        <div>
          <strong style={{ color: '#fff' }}>К:</strong> {targetData.label}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: selectedDirection === 'download' ? '#3d3d3d' : 'transparent',
            border: `2px solid ${selectedDirection === 'download' ? '#4dabf7' : '#555'}`,
            transition: 'all 0.2s',
          }}
          onClick={() => setSelectedDirection('download')}
        >
          <input
            type="radio"
            name="direction"
            value="download"
            checked={selectedDirection === 'download'}
            onChange={() => setSelectedDirection('download')}
            style={{ cursor: 'pointer' }}
          />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                Получение данных (Download)
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                {getDescription('download')}
              </div>
            </div>
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: selectedDirection === 'upload' ? '#3d3d3d' : 'transparent',
            border: `2px solid ${selectedDirection === 'upload' ? '#4dabf7' : '#555'}`,
            transition: 'all 0.2s',
          }}
          onClick={() => setSelectedDirection('upload')}
        >
          <input
            type="radio"
            name="direction"
            value="upload"
            checked={selectedDirection === 'upload'}
            onChange={() => setSelectedDirection('upload')}
            style={{ cursor: 'pointer' }}
          />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                Отправка данных (Upload)
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                {getDescription('upload')}
              </div>
            </div>
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: selectedDirection === 'bidirectional' ? '#3d3d3d' : 'transparent',
            border: `2px solid ${selectedDirection === 'bidirectional' ? '#4dabf7' : '#555'}`,
            transition: 'all 0.2s',
          }}
          onClick={() => setSelectedDirection('bidirectional')}
        >
          <input
            type="radio"
            name="direction"
            value="bidirectional"
            checked={selectedDirection === 'bidirectional'}
            onChange={() => setSelectedDirection('bidirectional')}
            style={{ cursor: 'pointer' }}
          />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
                Двунаправленная (Bidirectional)
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                {getDescription('bidirectional')}
              </div>
            </div>
        </label>
      </div>
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
          Создать
        </button>
      </div>
    </div>
  )
}

