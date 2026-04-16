import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ESBVendor } from '../types'

interface ESBConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: {
    vendor: ESBVendor
    messageRouting?: boolean
    protocolTransformation?: boolean
    dataTransformation?: boolean
    serviceOrchestration?: boolean
    eventDriven?: boolean
  }) => void
  onClose: () => void
}

const vendors: Array<{ value: ESBVendor; label: string; description: string }> = [
  { value: 'mule-esb', label: 'Mule ESB', description: 'MuleSoft Enterprise Service Bus' },
  { value: 'wso2-esb', label: 'WSO2 ESB', description: 'WSO2 Enterprise Service Bus' },
  { value: 'apache-camel', label: 'Apache Camel', description: 'Apache Camel integration framework' },
  { value: 'jboss-fuse', label: 'JBoss Fuse', description: 'Red Hat JBoss Fuse ESB' },
  { value: 'tibco-businessworks', label: 'TIBCO BusinessWorks', description: 'TIBCO BusinessWorks integration platform' },
  { value: 'oracle-service-bus', label: 'Oracle Service Bus', description: 'Oracle Service Bus' },
  { value: 'ibm-integration-bus', label: 'IBM Integration Bus', description: 'IBM Integration Bus (IIB)' },
]

export default function ESBConfigPanel({
  node,
  onUpdate,
  onClose,
}: ESBConfigPanelProps) {
  const data = node.data as ComponentData
  const [vendor, setVendor] = useState<ESBVendor | undefined>(
    data.esbConfig?.vendor
  )
  const [messageRouting, setMessageRouting] = useState(
    data.esbConfig?.messageRouting ?? true
  )
  const [protocolTransformation, setProtocolTransformation] = useState(
    data.esbConfig?.protocolTransformation ?? true
  )
  const [dataTransformation, setDataTransformation] = useState(
    data.esbConfig?.dataTransformation ?? true
  )
  const [serviceOrchestration, setServiceOrchestration] = useState(
    data.esbConfig?.serviceOrchestration ?? false
  )
  const [eventDriven, setEventDriven] = useState(
    data.esbConfig?.eventDriven ?? false
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
        messageRouting,
        protocolTransformation,
        dataTransformation,
        serviceOrchestration,
        eventDriven,
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
        border: '2px solid #9c88ff',
        borderRadius: '12px',
        padding: '25px',
        minWidth: '450px',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          Настройка ESB
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
                border: `2px solid ${vendor === v.value ? '#9c88ff' : '#555'}`,
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
          Характеристики ESB:
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
              backgroundColor: messageRouting ? '#3d3d3d' : 'transparent',
              border: `1px solid ${messageRouting ? '#9c88ff' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={messageRouting}
              onChange={(e) => setMessageRouting(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Маршрутизация сообщений</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: protocolTransformation ? '#3d3d3d' : 'transparent',
              border: `1px solid ${protocolTransformation ? '#9c88ff' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={protocolTransformation}
              onChange={(e) => setProtocolTransformation(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Трансформация протоколов</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: dataTransformation ? '#3d3d3d' : 'transparent',
              border: `1px solid ${dataTransformation ? '#9c88ff' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={dataTransformation}
              onChange={(e) => setDataTransformation(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Трансформация данных</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: serviceOrchestration ? '#3d3d3d' : 'transparent',
              border: `1px solid ${serviceOrchestration ? '#9c88ff' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={serviceOrchestration}
              onChange={(e) => setServiceOrchestration(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Оркестрация сервисов</span>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: eventDriven ? '#3d3d3d' : 'transparent',
              border: `1px solid ${eventDriven ? '#9c88ff' : '#555'}`,
            }}
          >
            <input
              type="checkbox"
              checked={eventDriven}
              onChange={(e) => setEventDriven(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#fff' }}>Событийно-ориентированная архитектура</span>
          </label>
        </div>
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
            backgroundColor: vendor ? '#9c88ff' : '#555',
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
              e.currentTarget.style.backgroundColor = '#8b7aff'
            }
          }}
          onMouseLeave={(e) => {
            if (vendor) {
              e.currentTarget.style.backgroundColor = '#9c88ff'
            }
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}














