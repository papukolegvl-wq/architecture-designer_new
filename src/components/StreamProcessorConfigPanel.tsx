import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, StreamProcessorVendor } from '../types'

interface StreamProcessorConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: StreamProcessorVendor }) => void
    onClose: () => void
}

const vendors: Array<{ value: StreamProcessorVendor; label: string; description: string }> = [
    { value: 'kafka-streams', label: 'Kafka Streams', description: 'Библиотека потоковой обработки для Kafka' },
    { value: 'apache-flink', label: 'Apache Flink', description: 'Фреймворк для обработки потоковых данных' },
    { value: 'apache-spark', label: 'Apache Spark Streaming', description: 'Обработка микро-батчей данных' },
    { value: 'aws-kinesis', label: 'AWS Kinesis Data Analytics', description: 'Аналитика потоков в реальном времени' },
    { value: 'google-dataflow', label: 'Google Cloud Dataflow', description: 'Управляемый сервис обработки данных' },
    { value: 'azure-stream-analytics', label: 'Azure Stream Analytics', description: 'Аналитика в реальном времени от Microsoft' },
]

export default function StreamProcessorConfigPanel({
    node,
    onUpdate,
    onClose,
}: StreamProcessorConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<StreamProcessorVendor | undefined>(
        data.streamProcessorConfig?.vendor
    )

    useEffect(() => {
        if (!vendor && vendors.length > 0) {
            setVendor(vendors[0].value)
        }
    }, [vendor])

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor })
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
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Настройка потокового обработчика
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>Провайдер/Технология:</label>
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
                            }}
                            onClick={() => setVendor(v.value)}
                        >
                            <input type="radio" checked={vendor === v.value} readOnly style={{ marginTop: '4px' }} />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{v.label}</div>
                                <div style={{ fontSize: '12px', color: '#aaa' }}>{v.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#4dabf7', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Сохранить</button>
            </div>
        </div>
    )
}
