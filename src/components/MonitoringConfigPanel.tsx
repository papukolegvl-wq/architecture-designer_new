import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, MonitoringVendor } from '../types'

interface MonitoringConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: {
        vendor: MonitoringVendor
        metricsRetentionDays?: number
    }) => void
    onClose: () => void
}

const vendors: Array<{ value: MonitoringVendor; label: string; description: string }> = [
    { value: 'prometheus', label: 'Prometheus', description: 'Open-source monitoring' },
    { value: 'grafana', label: 'Grafana', description: 'Observability platform' },
    { value: 'datadog', label: 'Datadog', description: 'Cloud monitoring' },
    { value: 'new-relic', label: 'New Relic', description: 'Full-stack observability' },
    { value: 'zabbix', label: 'Zabbix', description: 'Enterprise monitoring' },
    { value: 'nagios', label: 'Nagios', description: 'IT infrastructure monitoring' },
    { value: 'dynatrace', label: 'Dynatrace', description: 'AI-powered observability' },
    { value: 'appdynamics', label: 'AppDynamics', description: 'APM' },
    { value: 'aws-cloudwatch', label: 'AWS CloudWatch', description: 'AWS Monitoring' },
    { value: 'google-cloud-monitoring', label: 'Google Cloud Monitoring', description: 'GCP Monitoring' },
    { value: 'azure-monitor', label: 'Azure Monitor', description: 'Azure Monitoring' },
]

export default function MonitoringConfigPanel({
    node,
    onUpdate,
    onClose,
}: MonitoringConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<MonitoringVendor | undefined>(
        data.monitoringConfig?.vendor
    )
    const [metricsRetentionDays, setMetricsRetentionDays] = useState<number>(
        data.monitoringConfig?.metricsRetentionDays || 14
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
                metricsRetentionDays
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
                border: '2px solid #ff6b6b',
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
                    Настройка мониторинга
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
                    Система мониторинга:
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
                                border: `2px solid ${vendor === v.value ? '#ff6b6b' : '#555'}`,
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
                    Хранение метрик (дней):
                </label>
                <input
                    type="number"
                    value={metricsRetentionDays}
                    onChange={(e) => setMetricsRetentionDays(Number(e.target.value))}
                    min="1"
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
                        backgroundColor: vendor ? '#ff6b6b' : '#555',
                        color: vendor ? '#fff' : 'white',
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
                            e.currentTarget.style.backgroundColor = '#fa5252'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (vendor) {
                            e.currentTarget.style.backgroundColor = '#ff6b6b'
                        }
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
