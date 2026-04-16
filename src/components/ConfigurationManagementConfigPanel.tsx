import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, ConfigurationManagementVendor } from '../types'

interface ConfigurationManagementConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: { vendor: ConfigurationManagementVendor; configCount?: number; secretCount?: number }) => void
    onClose: () => void
}

const vendors: Array<{ value: ConfigurationManagementVendor; label: string; description: string }> = [
    { value: 'consul', label: 'HashiCorp Consul', description: 'Управление конфигурациями и service discovery' },
    { value: 'etcd', label: 'etcd', description: 'Распределенное хранилище ключ-значение' },
    { value: 'hashiCorp-vault', label: 'HashiCorp Vault', description: 'Управление секретами и конфигурациями' },
    { value: 'aws-systems-manager', label: 'AWS Systems Manager', description: 'Управление ресурсами и конфигами в AWS' },
    { value: 'azure-key-vault', label: 'Azure Key Vault', description: 'Облачный сервис управления секретами' },
]

export default function ConfigurationManagementConfigPanel({
    node,
    onUpdate,
    onClose,
}: ConfigurationManagementConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<ConfigurationManagementVendor | undefined>(
        data.configurationManagementConfig?.vendor
    )
    const [configCount, setConfigCount] = useState<number>(
        data.configurationManagementConfig?.configCount || 0
    )

    useEffect(() => {
        if (!vendor && vendors.length > 0) {
            setVendor(vendors[0].value)
        }
    }, [vendor])

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor, configCount })
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
                border: '2px solid #ffa94d',
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
                    Настройка управления конфигурацией
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
                    Инструмент конфигурации:
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
                                border: `2px solid ${vendor === v.value ? '#ffa94d' : '#555'}`,
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
                    Количество параметров:
                </label>
                <input
                    type="number"
                    value={configCount}
                    onChange={(e) => setConfigCount(parseInt(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: '#fff',
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
                        backgroundColor: vendor ? '#ffa94d' : '#555',
                        color: vendor ? '#000' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: vendor ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
