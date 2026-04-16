import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, WebServerConfig, WebServerVendor } from '../types'

interface WebServerConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: WebServerConfig) => void
    onClose: () => void
}

const vendors: Array<{ value: WebServerVendor; label: string; icon: string }> = [
    { value: 'nginx', label: 'Nginx', icon: '🟩' },
    { value: 'apache', label: 'Apache', icon: '🪶' },
    { value: 'iis', label: 'IIS', icon: '🟦' },
    { value: 'caddy', label: 'Caddy', icon: '🔒' },
    { value: 'tomcat', label: 'Tomcat', icon: '🐱' },
    { value: 'jetty', label: 'Jetty', icon: '⛵' },
    { value: 'lighttpd', label: 'Lighttpd', icon: '⚡' },
]

export default function WebServerConfigPanel({
    node,
    onUpdate,
    onClose,
}: WebServerConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<WebServerVendor | undefined>(
        data.webServerConfig?.vendor
    )
    const [port, setPort] = useState(data.webServerConfig?.port || 80)
    const [ssl, setSsl] = useState(data.webServerConfig?.ssl || false)

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor, port, ssl })
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
                    Настройка Веб-сервера
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#ccc' }}>
                    Веб-сервер:
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Порт</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 80)}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #555', borderRadius: '6px', color: '#fff' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
                    <input type="checkbox" checked={ssl} onChange={(e) => setSsl(e.target.checked)} />
                    Включить SSL (HTTPS)
                </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
                <button onClick={handleSave} disabled={!vendor} style={{ flex: 1, padding: '12px', backgroundColor: vendor ? '#51cf66' : '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: vendor ? 'pointer' : 'not-allowed', opacity: vendor ? 1 : 0.5 }}>Сохранить</button>
            </div>
        </div>
    )
}
