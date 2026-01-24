import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, SMSGatewayVendor } from '../types'

interface SMSGatewayConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: SMSGatewayVendor }) => void
    onClose: () => void
}

const vendors: Array<{ value: SMSGatewayVendor; label: string; description: string }> = [
    { value: 'twilio', label: 'Twilio', description: 'Облачная коммуникационная платформа' },
    { value: 'aws-sns-sms', label: 'AWS SNS (SMS)', description: 'Отправка SMS через Amazon SNS' },
    { value: 'nexmo', label: 'Vonage (Nexmo)', description: 'API для обмена SMS и звонками' },
    { value: 'messagebird', label: 'MessageBird', description: 'Омниканальные коммуникации' },
    { value: 'plivo', label: 'Plivo', description: 'SMS и голосовые API сервисы' },
]

export default function SMSGatewayConfigPanel({
    node,
    onUpdate,
    onClose,
}: SMSGatewayConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<SMSGatewayVendor | undefined>(
        data.smsGatewayConfig?.vendor
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
                border: '2px solid #fd7e14',
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
                    Настройка SMS шлюза
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>Провайдер/Шлюз:</label>
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
                                border: `2px solid ${vendor === v.value ? '#fd7e14' : '#555'}`,
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
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить</button>
            </div>
        </div>
    )
}
