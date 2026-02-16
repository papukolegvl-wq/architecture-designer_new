import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, MLServiceVendor } from '../types'

interface MLServiceConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: MLServiceVendor }) => void
    onClose: () => void
}

const vendors: Array<{ value: MLServiceVendor; label: string; description: string }> = [
    { value: 'aws-sagemaker', label: 'AWS SageMaker', description: 'Комплексная платформа ML в AWS' },
    { value: 'azure-machine-learning', label: 'Azure Machine Learning', description: 'Управляемый ML сервис в Azure' },
    { value: 'google-cloud-ai', label: 'Google Cloud Vertex AI', description: 'Единая платформа AI/ML в GCP' },
    { value: 'databricks-ml', label: 'Databricks Machine Learning', description: 'Платформа ML на базе Lakehouse' },
    { value: 'h2o-ai', label: 'H2O.ai', description: 'Демократизированная платформа AI' },
]

export default function MLServiceConfigPanel({
    node,
    onUpdate,
    onClose,
}: MLServiceConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<MLServiceVendor | undefined>(
        data.mlServiceConfig?.vendor
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
                border: '2px solid #845ef7',
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
                    Настройка ML/AI сервиса
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>Провайдер/Платформа:</label>
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
                                border: `2px solid ${vendor === v.value ? '#845ef7' : '#555'}`,
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
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#845ef7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить</button>
            </div>
        </div>
    )
}
