import { useState } from 'react'
import { Node } from 'reactflow'
import { ComponentData, VCSConfig, VCSVendor } from '../types'

interface VCSConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: VCSConfig) => void
    onClose: () => void
}

const vendors: Array<{ value: VCSVendor; label: string; icon: string }> = [
    { value: 'github', label: 'GitHub', icon: '🐙' },
    { value: 'gitlab', label: 'GitLab', icon: '🦊' },
    { value: 'bitbucket', label: 'Bitbucket', icon: '🗑️' },
    { value: 'azure-repos', label: 'Azure Repos', icon: '☁️' },
    { value: 'aws-codecommit', label: 'AWS CodeCommit', icon: '📦' },
    { value: 'gitea', label: 'Gitea', icon: '🍵' },
]

export default function VCSConfigPanel({
    node,
    onUpdate,
    onClose,
}: VCSConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<VCSVendor | undefined>(
        data.vcsConfig?.vendor
    )
    const [repositoryName, setRepositoryName] = useState(
        data.vcsConfig?.repositoryName || ''
    )
    const [isPrivate, setIsPrivate] = useState(
        data.vcsConfig?.isPrivate || false
    )

    const handleSave = () => {
        if (vendor) {
            onUpdate(node.id, { vendor, repositoryName, isPrivate })
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
                    Настройка VCS (GitHub и др.)
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
                >
                    ×
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#ccc' }}>
                    Инструмент / Сервис:
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
                            <input
                                type="radio"
                                name="vendor"
                                value={v.value}
                                checked={vendor === v.value}
                                onChange={() => setVendor(v.value)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '20px' }}>{v.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                                {v.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
                    Имя репозитория
                </label>
                <input
                    type="text"
                    value={repositoryName}
                    onChange={(e) => setRepositoryName(e.target.value)}
                    placeholder="user/repo"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #555',
                        borderRadius: '6px',
                        color: '#fff',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
                    <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    Приватный репозиторий
                </label>
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
                        backgroundColor: vendor ? '#51cf66' : '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: vendor ? 'pointer' : 'not-allowed',
                        opacity: vendor ? 1 : 0.5,
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
