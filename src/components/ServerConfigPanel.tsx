import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ServerConfig, ServerVendor } from '../types'

interface ServerConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: ServerConfig) => void
    onClose: () => void
}

const vendors: Array<{ value: ServerVendor; label: string; icon: string }> = [
    { value: 'ubuntu', label: 'Ubuntu', icon: '🐧' },
    { value: 'debian', label: 'Debian', icon: '🍥' },
    { value: 'centos', label: 'CentOS', icon: '💠' },
    { value: 'rhel', label: 'RHEL', icon: '🎩' },
    { value: 'windows-server', label: 'Windows', icon: '🪟' },
    { value: 'alpine', label: 'Alpine', icon: '🏔️' },
    { value: 'amazon-linux', label: 'Amazon Linux', icon: '☁️' },
]

export default function ServerConfigPanel({
    node,
    onUpdate,
    onClose,
}: ServerConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<ServerVendor | undefined>(
        data.serverConfig?.vendor
    )
    const [instanceType, setInstanceType] = useState(data.serverConfig?.instanceType || '')

    const handleSave = () => {
        onUpdate(node.id, {
            ...data.serverConfig,
            vendor,
            instanceType
        })
        onClose()
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#2d2d2d',
                border: '2px solid #51cf66',
                borderRadius: '12px',
                padding: '25px',
                minWidth: '350px',
                maxWidth: '400px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1001,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                    Настройка Сервера
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#ccc' }}>
                    Операционная система:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {vendors.map((v) => (
                        <label
                            key={v.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: vendor === v.value ? '#3d3d3d' : 'transparent',
                                border: `2px solid ${vendor === v.value ? '#51cf66' : '#555'}`,
                                transition: 'all 0.2s',
                            }}
                            onClick={() => setVendor(v.value)}
                        >
                            <input type="radio" name="vendor" value={v.value} checked={vendor === v.value} onChange={() => setVendor(v.value)} style={{ cursor: 'pointer' }} />
                            <span style={{ fontSize: '20px' }}>{v.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{v.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Тип инстанса (например, t3.micro)</label>
                <input
                    type="text"
                    value={instanceType}
                    onChange={(e) => setInstanceType(e.target.value)}
                    placeholder="t3.micro"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #555', borderRadius: '6px', color: '#fff' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Сохранить</button>
            </div>
        </div>
    )
}
