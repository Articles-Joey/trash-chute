"use client";
import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/hooks/useGameStore";

export default function SprintMeter() {
    const fillRef = useRef(null);
    const trackRef = useRef(null);
    const labelRef = useRef(null);

    useEffect(() => {
        // Subscribe directly — no React re-renders, smooth 60fps DOM updates
        const unsub = useGameStore.subscribe((state) => {
            const { sprintMeter, sprintOnCooldown } = state;

            if (fillRef.current) {
                fillRef.current.style.width = `${sprintMeter * 100}%`;

                if (sprintOnCooldown) {
                    fillRef.current.style.background =
                        "linear-gradient(90deg, #ff4444, #ff8800)";
                } else if (sprintMeter < 0.35) {
                    fillRef.current.style.background =
                        "linear-gradient(90deg, #ffaa00, #ffdd00)";
                } else {
                    fillRef.current.style.background =
                        "linear-gradient(90deg, #00ccff, #00ffcc)";
                }
            }

            if (labelRef.current) {
                if (sprintOnCooldown) {
                    labelRef.current.textContent = "Recovering...";
                } else if (sprintMeter >= 1) {
                    labelRef.current.textContent = "Sprint  [Shift]";
                } else if (sprintMeter <= 0) {
                    labelRef.current.textContent = "Exhausted";
                } else {
                    labelRef.current.textContent = "Sprint  [Shift]";
                }
            }
        });

        return () => unsub();
    }, []);

    return (
        <Box
            sx={{
                position: "absolute",
                bottom: 60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 180,
                zIndex: 1,
                pointerEvents: "none",
                "@media (min-width: 992px)": { bottom: 24 },
            }}
        >
            <Box
                ref={labelRef}
                sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "10px",
                    textAlign: "center",
                    mb: "5px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                }}
            >
                Sprint [Shift]
            </Box>
            <Box
                ref={trackRef}
                sx={{
                    height: 8,
                    bgcolor: "rgba(0,0,0,0.45)",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    overflow: "hidden",
                    boxShadow: "0 0 6px rgba(0,0,0,0.6)",
                }}
            >
                <Box
                    ref={fillRef}
                    sx={{
                        height: "100%",
                        width: "100%",
                        borderRadius: "4px",
                        background: "linear-gradient(90deg, #00ccff, #00ffcc)",
                        transition: "background 0.4s ease",
                        willChange: "width",
                    }}
                />
            </Box>
        </Box>
    );
}
