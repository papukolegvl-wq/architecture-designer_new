import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, BackupServiceVendor } from '../types'

interface BackupServiceConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: { 
    vendor: BackupServiceVendor
    backupFrequency?: 'daily' | 'weekly' | 'monthly' | 'continuous'
    retentionPeriod?: string
    backupType?: 'full' | 'incremental' | 'differential'
  }) => void
  onClose: () => void
}

const vendors: Array<{ value: BackupServiceVendor; label: string; description: string }> = [
  { value: 'aws-backup', label: 'AWS Backup', description: 'Управляемый сервис резервного копирования от Amazon' },
  { value: 'azure-backup', label: 'Azure Backup', description: 'Сервис резервного копирования от Microsoft' },
  { value: 'google-cloud-backup', label: 'Google Cloud Backup', description: 'Сервис резервного копирования от Google' },
  { value: 'veeam', label: 'Veeam', description: 'Платформа резервного копирования для виртуальных сред' },
  { value: 'acronis', label: 'Acronis', description: 'Комплексное решение для резервного копирования' },
  { value: 'commvault', label: 'Commvault', description: 'Платформа управления данными и резервного копирования' },
  { value: 'veritas-netbackup', label: 'Veritas NetBackup', description: 'Корпоративное решение для резервного копирования' },
]

const backupFrequencies: Array<{ value: 'daily' | 'weekly' | 'monthly' | 'continuous'; label: string }> = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'continuous', label: 'Непрерывно' },
]

const backupTypes: Array<{ value: 'full' | 'incremental' | 'differential'; label: string }> = [
  { value: 'full', label: 'Полное' },
  { value: 'incremental', label: 'Инкрементальное' },
  { value: 'differential', label: 'Дифференциальное' },
]

export default function BackupServiceConfigPanel({
  node,
  onUpdate,
  onClose,
}: BackupServiceConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<BackupServiceVendor | undefined>(
    data.backupServiceConfig?.vendor
  )
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'continuous' | undefined>(
    data.backupServiceConfig?.backupFrequency
  )
  const [retentionPeriod, setRetentionPeriod] = useState<string | undefined>(
    data.backupServiceConfig?.retentionPeriod
  )
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential' | undefined>(
    data.backupServiceConfig?.backupType
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
        backupFrequency,
        retentionPeriod,
        backupType,
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
          Настройка резервного копирования
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
          Частота резервного копирования:
        </label>
        <select
          value={backupFrequency || ''}
          onChange={(e) => setBackupFrequency(e.target.value as any)}
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
          {backupFrequencies.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
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
          Тип резервного копирования:
        </label>
        <select
          value={backupType || ''}
          onChange={(e) => setBackupType(e.target.value as any)}
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
          {backupTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
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
          Период хранения (например, 30 дней):
        </label>
        <input
          type="text"
          value={retentionPeriod || ''}
          onChange={(e) => setRetentionPeriod(e.target.value)}
          placeholder="30 дней"
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












