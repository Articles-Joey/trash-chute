"use client"
import { useEffect, useRef } from "react"
import { useGameStore } from "@/hooks/useGameStore"

export default function SprintMeter() {
    const fillRef = useRef(null)
    const trackRef = useRef(null)
    const labelRef = useRef(null)

    useEffect(() => {
        // Subscribe directly — no React re-renders, smooth 60fps DOM updates
        const unsub = useGameStore.subscribe((state) => {
            const { sprintMeter, sprintOnCooldown } = state

            if (fillRef.current) {
                fillRef.current.style.width = `${sprintMeter * 100}%`

                if (sprintOnCooldown) {
                    fillRef.current.style.background = "linear-gradient(90deg, #ff4444, #ff8800)"
                } else if (sprintMeter < 0.35) {
                    fillRef.current.style.background = "linear-gradient(90deg, #ffaa00, #ffdd00)"
                } else {
                    fillRef.current.style.background = "linear-gradient(90deg, #00ccff, #00ffcc)"
                }
            }

            if (labelRef.current) {
                if (sprintOnCooldown) {
                    labelRef.current.textContent = "Recovering..."
                } else if (sprintMeter >= 1) {
                    labelRef.current.textContent = "Sprint  [Shift]"
                } else if (sprintMeter <= 0) {
                    labelRef.current.textContent = "Exhausted"
                } else {
                    labelRef.current.textContent = "Sprint  [Shift]"
                }
            }
        })

        return () => unsub()
    }, [])

    return (
        <div className="sprint-meter">
            <div className="sprint-meter__label" ref={labelRef}>
                Sprint  [Shift]
            </div>
            <div className="sprint-meter__track" ref={trackRef}>
                <div className="sprint-meter__fill" ref={fillRef} />
            </div>
        </div>
    )
}
