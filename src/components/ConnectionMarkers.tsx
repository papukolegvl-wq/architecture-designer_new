import React from 'react';
import { ConnectionType } from '../types';

const connectionColors: Record<string, string> = {
    async: '#ffd43b',
    'async-bidirectional': '#ffd43b',
    'database-connection': '#51cf66',
    'database-replication': '#20c997',
    'cache-connection': '#845ef7',
    ws: '#339af0',
    wss: '#339af0',
    graphql: '#e64980',
    dependency: '#9c88ff',
    composition: '#ff6b6b',
    aggregation: '#ff8787',
    'method-call': '#51cf66',
    inheritance: '#4dabf7',
    rest: '#4dabf7',
    grpc: '#4dabf7',
    bidirectional: '#4dabf7',
    related: '#adb5bd',
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
                            markerWidth="16"
                            markerHeight="16"
                            refX="15.5"
                            refY="8"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 16 16"
                        >
                            <path d="M0,0 L16,8 L0,16 L4,8 Z" fill={color} />
                        </marker>

                        {/* Selected arrowhead */}
                        <marker
                            id={`arrowhead-${type}-selected`}
                            markerWidth="16"
                            markerHeight="16"
                            refX="15.5"
                            refY="8"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M0,0 L16,8 L0,16 L4,8 Z"
                                fill={type === 'async-bidirectional' ? color : selectedColor}
                            />
                        </marker>

                        {/* Start arrowhead (for bidirectional) */}
                        <marker
                            id={`arrowhead-start-${type}`}
                            markerWidth="16"
                            markerHeight="16"
                            refX="0.5"
                            refY="8"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 16 16"
                        >
                            <path d="M16,0 L0,8 L16,16 L12,8 Z" fill={color} />
                        </marker>

                        {/* Start arrowhead selected */}
                        <marker
                            id={`arrowhead-start-${type}-selected`}
                            markerWidth="16"
                            markerHeight="16"
                            refX="0.5"
                            refY="8"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M16,0 L0,8 L16,16 L12,8 Z"
                                fill={type === 'async-bidirectional' ? color : selectedColor}
                            />
                        </marker>
                    </React.Fragment>
                ))}

                {/* Generic markers for fallback */}
                <marker
                    id="arrowhead-default"
                    markerWidth="16"
                    markerHeight="16"
                    refX="15.5"
                    refY="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 16 16"
                >
                    <path d="M0,0 L16,8 L0,16 L4,8 Z" fill="#4dabf7" />
                </marker>

                {/* Crow's Foot Notation Markers */}
                {/* ... (leaving crows foot as is for now as it's specifically for DB diagrams) ... */}

                {/* Dynamic Marker that inherits color from the edge */}
                <marker
                    id="arrowhead-dynamic"
                    markerWidth="16"
                    markerHeight="16"
                    refX="15.5"
                    refY="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 16 16"
                >
                    <path d="M0,0 L16,8 L0,16 L4,8 Z" fill="context-stroke" />
                </marker>

                <marker
                    id="arrowhead-start-dynamic"
                    markerWidth="16"
                    markerHeight="16"
                    refX="0.5"
                    refY="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 16 16"
                >
                    <path d="M16,0 L0,8 L16,16 L12,8 Z" fill="context-stroke" />
                </marker>

                {/* Selected dynamic variants */}
                <marker
                    id="arrowhead-dynamic-selected"
                    markerWidth="16"
                    markerHeight="16"
                    refX="15.5"
                    refY="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 16 16"
                >
                    <path d="M0,0 L16,8 L0,16 L4,8 Z" fill="context-stroke" />
                </marker>
                <marker
                    id="arrowhead-start-dynamic-selected"
                    markerWidth="16"
                    markerHeight="16"
                    refX="0.5"
                    refY="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    viewBox="0 0 16 16"
                >
                    <path d="M16,0 L0,8 L16,16 L12,8 Z" fill="context-stroke" />
                </marker>
            </defs>
        </svg>
    );
};

export default ConnectionMarkers;
