import React, { useState } from 'react'
import { Play, Pause, StopCircle, FastForward, Rewind } from 'lucide-react'

interface AnimationControllerProps {
    isAnimating: boolean
    animationSpeed: number
    animationDirection: 'forward' | 'bidirectional'
    particleDensity: number
    loopMode: boolean
    onPlayPause: () => void
    onStop: () => void
    onSpeedChange: (speed: number) => void
    onDirectionChange: (direction: 'forward' | 'bidirectional') => void
    onParticleDensityChange: (density: number) => void
    onLoopModeChange: (loop: boolean) => void
}

export default function AnimationController({
    isAnimating,
    animationSpeed,
    animationDirection,
    particleDensity,
    loopMode,
    onPlayPause,
    onStop,
    onSpeedChange,
    onDirectionChange,
    onParticleDensityChange,
    onLoopModeChange,
}: AnimationControllerProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                zIndex: 1000,
                minWidth: '280px',
                maxWidth: '320px',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    Animation Controls
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px',
                    }}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>

            {isExpanded && (
                <>
                    {/* Play/Pause/Stop Controls */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                            onClick={onPlayPause}
                            style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: isAnimating ? '#ff6b6b' : '#4CAF50',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                            {isAnimating ? 'Pause' : 'Play'}
                        </button>
                        <button
                            onClick={onStop}
                            style={{
                                padding: '10px',
                                backgroundColor: '#666',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1'
                            }}
                        >
                            <StopCircle size={16} />
                        </button>
                    </div>

                    {/* Speed Control */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
                            Speed: {animationSpeed.toFixed(1)}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={animationSpeed}
                            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: '#4CAF50',
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            <span>0.5x</span>
                            <span>3x</span>
                        </div>
                    </div>

                    {/* Direction Control */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
                            Direction
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => onDirectionChange('forward')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: animationDirection === 'forward' ? '#4CAF50' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <FastForward size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Forward
                            </button>
                            <button
                                onClick={() => onDirectionChange('bidirectional')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: animationDirection === 'bidirectional' ? '#4CAF50' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Rewind size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Bi-directional
                            </button>
                        </div>
                    </div>

                    {/* Particle Density */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
                            Particle Density: {particleDensity}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={particleDensity}
                            onChange={(e) => onParticleDensityChange(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: '#4CAF50',
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Loop Mode */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="loop-mode"
                            checked={loopMode}
                            onChange={(e) => onLoopModeChange(e.target.checked)}
                            style={{
                                width: '16px',
                                height: '16px',
                                accentColor: '#4CAF50',
                                cursor: 'pointer',
                            }}
                        />
                        <label
                            htmlFor="loop-mode"
                            style={{
                                fontSize: '12px',
                                color: '#aaa',
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}
                        >
                            Loop Animation
                        </label>
                    </div>
                </>
            )}
        </div>
    )
}
