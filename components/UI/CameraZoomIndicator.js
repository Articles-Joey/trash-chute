'use client'

import { useGameStore } from '@/hooks/useGameStore';

const MIN_DISTANCE = 2;
const MAX_DISTANCE = 20;

export default function CameraZoomIndicator() {

    const cameraDistance = useGameStore(state => state.cameraDistance);
    const isThirdPerson = useGameStore(state => state.isThirdPerson);

    if (!isThirdPerson) return null;

    const zoomPercent = Math.round((1 - (cameraDistance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE)) * 100);

    return (
        // <>
            <div className="camera-zoom-indicator">
                <div className="camera-zoom-bar">
                    <div
                        className="camera-zoom-fill"
                        style={{ height: `${zoomPercent}%` }}
                    />
                </div>
                <span className="camera-zoom-label">{zoomPercent}%</span>
            </div>
        // </>
    );
}
