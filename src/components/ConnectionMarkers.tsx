import React from 'react';
import { ConnectionType } from '../types';

const connectionColors: Record<ConnectionType | 'default', string> = {
    async: '#ffd43b',
    'async-bidirectional': '#ffd43b',
    'database-connection': '#51cf66',
    'database-replication': '#20c997',
    'cache-connection': '#845ef7',
    dependency: '#9c88ff',
    composition: '#ff6b6b',
    aggregation: '#ff8787',
    'method-call': '#51cf66',
    inheritance: '#4dabf7',
    rest: '#4dabf7',
    grpc: '#4dabf7',
    bidirectional: '#4dabf7',
    default: '#4dabf7',
};

const ConnectionMarkers: React.FC = () => {
    const selectedColor = '#4dabf7';

    return (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                {Object.entries(connectionColors).map(([type, color]) => (
                    <React.Fragment key={type}>
                        {/* Standard arrowhead */}
                        <marker
                            id={`arrowhead-${type}`}
                            markerWidth="15"
                            markerHeight="15"
                            refX="12"
                            refY="7.5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 15 15"
                        >
                            <path d="M0,0 L0,15 L15,7.5 z" fill={color} stroke={color} strokeWidth="0.5" />
                        </marker>

                        {/* Selected arrowhead */}
                        <marker
                            id={`arrowhead-${type}-selected`}
                            markerWidth="15"
                            markerHeight="15"
                            refX="12"
                            refY="7.5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 15 15"
                        >
                            <path
                                d="M0,0 L0,15 L15,7.5 z"
                                fill={type === 'async-bidirectional' ? color : selectedColor}
                                stroke={type === 'async-bidirectional' ? color : selectedColor}
                                strokeWidth="0.5"
                            />
                        </marker>

                        {/* Start arrowhead (for bidirectional) */}
                        <marker
                            id={`arrowhead-start-${type}`}
                            markerWidth="15"
                            markerHeight="15"
                            refX="3"
                            refY="7.5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 15 15"
                        >
                            <path d="M15,0 L15,15 L0,7.5 z" fill={color} stroke={color} strokeWidth="0.5" />
                        </marker>

                        {/* Start arrowhead selected */}
                        <marker
                            id={`arrowhead-start-${type}-selected`}
                            markerWidth="15"
                            markerHeight="15"
                            refX="3"
                            refY="7.5"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 15 15"
                        >
                            <path
                                d="M15,0 L15,15 L0,7.5 z"
                                fill={type === 'async-bidirectional' ? color : selectedColor}
                                stroke={type === 'async-bidirectional' ? color : selectedColor}
                                strokeWidth="0.5"
                            />
                        </marker>
                    </React.Fragment>
                ))}

                {/* Generic markers for fallback */}
                <marker
                    id="arrowhead-default"
                    markerWidth="15"
                    markerHeight="15"
                    refX="12"
                    refY="7.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 15 15"
                >
                    <path d="M0,0 L0,15 L15,7.5 z" fill="#4dabf7" stroke="#4dabf7" strokeWidth="0.5" />
                </marker>
            </defs>
        </svg>
    );
};

export default ConnectionMarkers;
