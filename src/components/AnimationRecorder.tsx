import React, { useState, useRef, useCallback } from 'react'
import { Video, Square, Download, X } from 'lucide-react'

interface AnimationRecorderProps {
    onClose: () => void
}

export default function AnimationRecorder({ onClose }: AnimationRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<number | null>(null)

    const startRecording = useCallback(async () => {
        try {
            // Get the ReactFlow canvas element
            const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
            if (!reactFlowElement) {
                alert('Canvas not found!')
                return
            }

            // Create a canvas stream from the ReactFlow element
            // We'll use canvas.captureStream() if available, otherwise fall back to MediaRecorder
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                alert('Failed to create canvas context')
                return
            }

            // Set canvas size to match the viewport
            const rect = reactFlowElement.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.height

            // For now, we'll use a workaround: capture the entire window
            // Note: This requires user permission and works best in supported browsers
            const stream = await (navigator.mediaDevices as any).getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 },
                },
                audio: false,
            })

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
            })

            chunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                setRecordedBlob(blob)
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start(100) // Capture in 100ms chunks
            setIsRecording(true)
            setRecordingTime(0)

            // Start timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            alert('Failed to start recording. Please make sure to allow screen capture.')
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isRecording])

    const downloadRecording = useCallback(() => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `architecture-animation-${Date.now()}.webm`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }, [recordedBlob])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: '16px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '90%',
                    border: '1px solid #333',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#fff' }}>
                        <Video size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Record Animation
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Instructions */}
                {!isRecording && !recordedBlob && (
                    <div style={{ marginBottom: '24px', color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
                        <p style={{ margin: '0 0 12px 0' }}>
                            Click "Start Recording" to capture your architecture animation.
                        </p>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                            • Make sure your animation is playing before recording<br />
                            • You'll be asked to select which tab/window to share<br />
                            • Select "This tab" for best results<br />
                            • Click "Stop" when finished
                        </p>
                    </div>
                )}

                {/* Recording Status */}
                {isRecording && (
                    <div
                        style={{
                            marginBottom: '24px',
                            padding: '16px',
                            backgroundColor: '#ff4444',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    animation: 'pulse 1s infinite',
                                }}
                            />
                            <span style={{ color: '#fff', fontWeight: 600 }}>RECORDING</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                            {formatTime(recordingTime)}
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {recordedBlob && (
                    <div
                        style={{
                            marginBottom: '24px',
                            padding: '16px',
                            backgroundColor: '#2d4f2d',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: '#4CAF50',
                            fontSize: '14px',
                        }}
                    >
                        ✓ Recording completed successfully! ({formatTime(recordingTime)})
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {!isRecording && !recordedBlob && (
                        <button
                            onClick={startRecording}
                            style={{
                                flex: 1,
                                padding: '14px',
                                backgroundColor: '#4CAF50',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#45a049'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4CAF50'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <Video size={18} />
                            Start Recording
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            style={{
                                flex: 1,
                                padding: '14px',
                                backgroundColor: '#ff4444',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#cc0000'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ff4444'
                            }}
                        >
                            <Square size={18} />
                            Stop Recording
                        </button>
                    )}

                    {recordedBlob && (
                        <>
                            <button
                                onClick={downloadRecording}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#4CAF50',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#45a049'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#4CAF50'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                <Download size={18} />
                                Download Video
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '14px 20px',
                                    backgroundColor: '#666',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Close
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    )
}
