import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ContainerConfig, ContainerVendor } from '../types'

interface ContainerConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: ContainerConfig) => void
    onClose: () => void
}

const vendors: Array<{ value: ContainerVendor; label: string; icon: string }> = [
    { value: 'docker', label: 'Docker', icon: '🐳' },
    { value: 'podman', label: 'Podman', icon: '🦭' },
    { value: 'containerd', label: 'Containerd', icon: '📦' },
    { value: 'lxc', label: 'LXC', icon: '🐧' },
    { value: 'cri-o', label: 'CRI-O', icon: '⚙️' },
]

export default function ContainerConfigPanel({
    node,
    onUpdate,
    onClose,
}: ContainerConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<ContainerVendor | undefined>(
        data.containerConfig?.vendor
    )
    const [image, setImage] = useState(data.containerConfig?.image || '')

    const handleSave = () => {
        onUpdate(node.id, {
            ...data.containerConfig,
            vendor,
            image
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
                    Настройка Контейнера
                </h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#ccc' }}>
                    Среда выполнения (Runtime):
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Образ (Image)</label>
                <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="nginx:latest"
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
