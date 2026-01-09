import { useState, useRef, useCallback } from 'react';

interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const useScreenRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const rafRef = useRef<number | null>(null);

    const startRecording = useCallback(async (cropRect?: CropRect) => {
        try {
            const displayMediaOptions = {
                video: {
                    displaySurface: 'browser', // Prefer browser tab
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            let recordingStream = stream;

            // If cropping is requested and valid
            if (cropRect) {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.muted = true;

                // Wait for video metadata to load to know dimensions
                await new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        video.play();
                        resolve(null);
                    };
                });

                const canvas = document.createElement('canvas');
                canvas.width = cropRect.width;
                canvas.height = cropRect.height;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    const draw = () => {
                        // Determine scale factor between screen logic points and actual video pixels
                        // NOTE: getDisplayMedia streams might be different resolution than screen CSS pixels
                        // We'll trust the selector maps roughly to the browser viewport if sharing current tab

                        // Usually for "Current Tab", the video size matches the viewport size * devicePixelRatio
                        // But simplified: user selects CSS coordinates.
                        // We need to map CSS coordinates (cropRect) to Video coordinates.

                        // Assuming the user records the *current* window/screen where the selection was made.
                        // Simple approach: ratio based on window.innerWidth vs video.videoWidth

                        // Check if we are recording the whole screen or just window? 
                        // We can't know for sure what the user picked, but "Current Tab" is most likely.
                        // Best effort mapping: 
                        const scaleX = video.videoWidth / window.innerWidth;
                        const scaleY = video.videoHeight / window.innerHeight;

                        const sx = cropRect.x * scaleX;
                        const sy = cropRect.y * scaleY;
                        const sw = cropRect.width * scaleX;
                        const sh = cropRect.height * scaleY;

                        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                        rafRef.current = requestAnimationFrame(draw);
                    };
                    draw();

                    // Capture stream from canvas
                    // 30 FPS default
                    recordingStream = canvas.captureStream(30);

                    canvasRef.current = canvas;
                    videoRef.current = video;
                }
            }

            const mediaRecorder = new MediaRecorder(recordingStream, {
                mimeType: 'video/webm;codecs=vp9',
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = `architecture-animation-${cropRect ? 'cropped-' : ''}${new Date().toISOString()}.webm`;
                a.click();
                window.URL.revokeObjectURL(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                recordingStream.getTracks().forEach(track => track.stop());

                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.srcObject = null;
                }

                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting screen recording:", err);
            // User likely cancelled the picker
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording,
    };
};
