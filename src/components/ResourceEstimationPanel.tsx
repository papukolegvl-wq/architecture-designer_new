import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Save, Calculator, Users } from 'lucide-react';
import { Node } from 'reactflow';
import {
    ResourceRole,
    ResourceActivity,
    ResourceComplexity,
    DependencyLevel,
    ResourceRecord,
    ResourceEstimate,
    ComponentData
} from '../types';
import {
    calculateITMD,
    BASE_MD_MATRIX,
    COMPLEXITY_FACTORS,
    DEPENDENCY_FACTORS
} from '../utils/resourceCalculations';

interface ResourceEstimationPanelProps {
    node: Node;
    onClose: () => void;
    onUpdate: (nodeId: string, resources: ResourceEstimate) => void;
}

export default function ResourceEstimationPanel({
    node,
    onClose,
    onUpdate,
}: ResourceEstimationPanelProps) {
    const [records, setRecords] = useState<ResourceRecord[]>([]);

    // Initialize from node data
    useEffect(() => {
        const data = node.data as ComponentData;
        if (data.resources?.records) {
            setRecords(data.resources.records);
        } else {
            setRecords([]);
        }
    }, [node]);

    const totalITMD = useMemo(() => {
        return records.reduce((sum, record) => sum + record.itmd, 0);
    }, [records]);

    const handleAddRecord = () => {
        const newRecord: ResourceRecord = {
            id: Date.now().toString(),
            role: 'Backend',
            activity: 'development',
            baseMD: 0,
            complexity: 'Medium',
            dependencyLevel: 1,
            itmd: 0
        };
        // Calculate initial values
        const calculated = calculateITMD(newRecord.role, newRecord.activity, newRecord.complexity, newRecord.dependencyLevel);
        newRecord.baseMD = calculated.baseMD;
        newRecord.itmd = calculated.itmd;

        setRecords([...records, newRecord]);
    };

    const handleDeleteRecord = (id: string) => {
        setRecords(records.filter(r => r.id !== id));
    };

    const handleUpdateRecord = (id: string, field: keyof ResourceRecord, value: any) => {
        setRecords(records.map(record => {
            if (record.id === id) {
                const updatedRecord = { ...record, [field]: value };

                // Recalculate if affecting fields changed
                if (['role', 'activity', 'complexity', 'dependencyLevel'].includes(field)) {
                    const calculated = calculateITMD(
                        updatedRecord.role,
                        updatedRecord.activity,
                        updatedRecord.complexity,
                        updatedRecord.dependencyLevel
                    );
                    updatedRecord.baseMD = calculated.baseMD;
                    updatedRecord.itmd = calculated.itmd;
                }

                return updatedRecord;
            }
            return record;
        }));
    };

    const handleSave = () => {
        const estimate: ResourceEstimate = {
            records,
            totalITMD
        };
        onUpdate(node.id, estimate);
        onClose();
    };

    const roles: ResourceRole[] = ['Analyst', 'Backend', 'QA', 'DevOps'];
    const activities: ResourceActivity[] = ['design', 'development', 'testing', 'deployment', 'support'];
    const complexities: ResourceComplexity[] = ['Low', 'Medium', 'High', 'Very High'];
    const dependencyLevels: DependencyLevel[] = [1, 2, 3, 4, 5];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000,
                backdropFilter: 'blur(5px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '90%',
                    maxWidth: '1200px',
                    height: '85%',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    border: '1px solid #333',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '20px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#252525',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={24} color="#4dabf7" />
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
                            Resource Estimation: {(node.data as ComponentData).label}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#888' }}>Role</th>
                                <th style={{ padding: '12px', color: '#888' }}>Activity</th>
                                <th style={{ padding: '12px', color: '#888', textAlign: 'center' }}>Base MD</th>
                                <th style={{ padding: '12px', color: '#888' }}>Complexity</th>
                                <th style={{ padding: '12px', color: '#888' }}>Dependencies (1-5)</th>
                                <th style={{ padding: '12px', color: '#4dabf7', fontWeight: 'bold', textAlign: 'right' }}>ITMD</th>
                                <th style={{ padding: '12px', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            value={record.role}
                                            onChange={(e) => handleUpdateRecord(record.id, 'role', e.target.value)}
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                color: '#eee',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                width: '100%'
                                            }}
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            value={record.activity}
                                            onChange={(e) => handleUpdateRecord(record.id, 'activity', e.target.value)}
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                color: '#eee',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                width: '100%'
                                            }}
                                        >
                                            {activities.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <span style={{ color: '#aaa' }}>{record.baseMD}</span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            value={record.complexity}
                                            onChange={(e) => handleUpdateRecord(record.id, 'complexity', e.target.value)}
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                color: '#eee',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                width: '100%'
                                            }}
                                        >
                                            {complexities.map(c =>
                                                <option key={c} value={c}>{c} ({COMPLEXITY_FACTORS[c]})</option>
                                            )}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <select
                                            value={record.dependencyLevel}
                                            onChange={(e) => handleUpdateRecord(record.id, 'dependencyLevel', parseInt(e.target.value))}
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                color: '#eee',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                width: '100%'
                                            }}
                                        >
                                            {dependencyLevels.map(d =>
                                                <option key={d} value={d}>Level {d} (x{DEPENDENCY_FACTORS[d]})</option>
                                            )}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#4dabf7' }}>
                                        {record.itmd} MD
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDeleteRecord(record.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff6b6b',
                                                cursor: 'pointer',
                                                opacity: 0.8
                                            }}
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={7} style={{ padding: '16px 0' }}>
                                    <button
                                        onClick={handleAddRecord}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: 'transparent',
                                            border: '1px dashed #444',
                                            color: '#888',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            width: '100%',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#4dabf7';
                                            e.currentTarget.style.color = '#4dabf7';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#444';
                                            e.currentTarget.style.color = '#888';
                                        }}
                                    >
                                        <Plus size={16} />
                                        Add Resource Role
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid #333',
                    backgroundColor: '#252525',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calculator size={20} color="#fab005" />
                            <span style={{ color: '#888' }}>Total ITMD:</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fab005' }}>
                                {totalITMD.toFixed(2)} MD
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                color: '#eee',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#4dabf7',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Save size={18} />
                            Save Estimates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
