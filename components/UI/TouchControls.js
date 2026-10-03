"use client";

import { memo, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useControlsStore } from "@/hooks/useControlsStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

function TouchControlsBase() {
    const leftZoneRef = useRef(null);
    const lookZoneRef = useRef(null);
    const touchEnabled = useTouchControlsStore((state) => state.enabled);
    const setTouchControls = useControlsStore((state) => state.setTouchControls);

    useEffect(() => {
        setTouchControls({ enabled: touchEnabled });
    }, [touchEnabled, setTouchControls]);

    useEffect(() => {
        if (!touchEnabled || !leftZoneRef.current || !lookZoneRef.current) return;

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
            setTouchControls({ forward: false, backward: false, left: false, right: false, jump: false, lookX: 0, lookY: 0 });
        };
    }, [touchEnabled, setTouchControls]);

    return (
        <Box
            sx={{
                position: "absolute",
                bottom: 50,
                left: 0,
                width: "100%",
                height: 150,
                zIndex: 1,
                bgcolor: "rgba(0,0,0,0.5)",
                p: 0,
                display: touchEnabled ? "flex" : "none",
            }}
        >

            <Box ref={leftZoneRef} sx={{ flex: 1, height: "100%", position: "relative" }} />

            <Box sx={{ flex: "0 0 90px", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", pr: "0.75rem" }}>
                <Button
                    sx={{
                        width: 64,
                        height: 64,
                        minWidth: 64,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.6)",
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textTransform: "none",
                        cursor: "pointer",
                        userSelect: "none",
                        touchAction: "none",
                        pointerEvents: "all",
                        "&:active": { bgcolor: "rgba(255,255,255,0.35)" },
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); setTouchControls({ jump: true }); }}
                    onTouchEnd={(e) => { e.stopPropagation(); setTouchControls({ jump: false }); }}
                >
                    Jump
                </Button>
            </Box>

            <Box ref={lookZoneRef} sx={{ flex: 1, height: "100%", position: "relative" }} />

        </Box>
    );
}

const TouchControls = memo(TouchControlsBase);

export default TouchControls;
