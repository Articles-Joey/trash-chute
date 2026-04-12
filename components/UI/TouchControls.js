import { memo, useEffect, useRef } from "react";
import { useControlsStore } from "@/hooks/useControlsStore";

function TouchControlsBase() {
    const leftZoneRef = useRef(null);
    const lookZoneRef = useRef(null);
    const touchEnabled = useControlsStore((state) => state.touchControls.enabled);
    const setTouchControls = useControlsStore((state) => state.setTouchControls);

    useEffect(() => {
        if (!leftZoneRef.current || !lookZoneRef.current) return;

        const nipplejs = require('nipplejs');

        // Left joystick — movement (static, centered)
        const leftManager = nipplejs.create({
            zone: leftZoneRef.current,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
        });

        leftManager
            .on('move', (evt, data) => {
                if (!data.vector) return;
                const { x, y } = data.vector;
                const t = 0.3;
                setTouchControls({
                    forward: y > t,
                    backward: y < -t,
                    left: x < -t,
                    right: x > t,
                });
            })
            .on('end', () => {
                setTouchControls({ forward: false, backward: false, left: false, right: false });
            });

        // Right joystick — camera look (static, centered)
        const lookManager = nipplejs.create({
            zone: lookZoneRef.current,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
        });

        lookManager
            .on('move', (evt, data) => {
                if (!data.vector) return;
                setTouchControls({ lookX: data.vector.x, lookY: data.vector.y });
            })
            .on('end', () => {
                setTouchControls({ lookX: 0, lookY: 0 });
            });

        return () => {
            leftManager.destroy();
            lookManager.destroy();
        };
    }, [setTouchControls]);

    return (
        <div className={`touch-controls-area${!touchEnabled ? ' d-none' : ''}`}>

            <div className="touch-zone touch-zone-left" ref={leftZoneRef} />

            <div className="touch-zone touch-zone-jump">
                <button
                    className="touch-jump-button"
                    onTouchStart={(e) => { e.stopPropagation(); setTouchControls({ jump: true }); }}
                    onTouchEnd={(e) => { e.stopPropagation(); setTouchControls({ jump: false }); }}
                >
                    Jump
                </button>
            </div>

            <div className="touch-zone touch-zone-look" ref={lookZoneRef} />

        </div>
    );
}

const TouchControls = memo(TouchControlsBase);

export default TouchControls;