import { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { ComponentData, BatchProcessorVendor } from '../types'

interface BatchProcessorConfigPanelProps {
    node: Node
    onUpdate: (nodeId: string, config: {
        vendor: BatchProcessorVendor
        jobCount?: number
        schedule?: string
    }) => void
    onClose: () => void
}

const vendors: Array<{ value: BatchProcessorVendor; label: string; description: string }> = [
    { value: 'spring-batch', label: 'Spring Batch', description: 'Фреймворк для пакетной обработки на Java' },
    { value: 'apache-airflow', label: 'Apache Airflow', description: 'Платформа для создания, планирования и мониторинга рабочих процессов' },
    { value: 'aws-batch', label: 'AWS Batch', description: 'Пакетная обработка в AWS' },
    { value: 'azure-batch', label: 'Azure Batch', description: 'Пакетная обработка в Azure' },
    { value: 'google-cloud-composer', label: 'Cloud Composer', description: 'Управляемый Airflow в GCP' },
    { value: 'prefect', label: 'Prefect', description: 'Современный оркестратор потоков данных' },
    { value: 'dagster', label: 'Dagster', description: 'Оркестратор для данных' },
    { value: 'argo-workflows', label: 'Argo Workflows', description: 'Оркестратор рабочих процессов для Kubernetes' },
    { value: 'luigi', label: 'Luigi', description: 'Python пакет для построения сложных пайплайнов' },
    { value: 'kubeflow', label: 'Kubeflow', description: 'ML toolkit для Kubernetes' },
    { value: 'step-functions', label: 'AWS Step Functions', description: 'Оркестрация serverless приложений' },
    { value: 'apache-beam', label: 'Apache Beam', description: 'Унифицированная модель для batch и stream обработки' },
    { value: 'dask', label: 'Dask', description: 'Библиотека для параллельных вычислений в Python' },
]

export default function BatchProcessorConfigPanel({
    node,
    onUpdate,
    onClose,
}: BatchProcessorConfigPanelProps) {
    const data = node.data as ComponentData
    const [vendor, setVendor] = useState<BatchProcessorVendor | undefined>(
        data.batchProcessorConfig?.vendor
    )
    const [jobCount, setJobCount] = useState<number | undefined>(
        data.batchProcessorConfig?.jobCount
    )
    const [schedule, setSchedule] = useState<string | undefined>(
        data.batchProcessorConfig?.schedule
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
                jobCount,
                schedule,
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
                border: '2px solid #4dabf7',
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
                    Настройка пакетного обработчика
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
                                border: `2px solid ${vendor === v.value ? '#4dabf7' : '#555'}`,
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
                    Количество задач (Jobs):
                </label>
                <input
                    type="number"
                    value={jobCount || ''}
                    onChange={(e) => setJobCount(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="1"
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
                    Расписание (Cron или описание):
                </label>
                <input
                    type="text"
                    value={schedule || ''}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="0 0 * * *"
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
                        backgroundColor: vendor ? '#4dabf7' : '#555',
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
                            e.currentTarget.style.backgroundColor = '#339af0'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (vendor) {
                            e.currentTarget.style.backgroundColor = '#4dabf7'
                        }
                    }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    )
}
