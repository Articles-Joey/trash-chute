"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist, createJSONStorage } from 'zustand/middleware'
// import { nanoid } from 'nanoid'

// const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
// const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const useControlsStore = create()(
    persist(
        (set, get) => ({

            touchControls: {
                enabled: false,
                forward: false,
                backward: false,
                left: false,
                right: false,
                jump: false,
                lookX: 0,
                lookY: 0,
            },
            setTouchControls: (partialUpdate) => {
                set((prev) => ({
                    touchControls: { ...prev.touchControls, ...partialUpdate }
                }))
            }

        }),
        {
            name: 'trash-chute-touch-controls-storage',
            // Only persist the enabled flag — input state is transient
            partialize: (state) => ({
                // touchControls: { 
                //     // enabled: state.touchControls.enabled 
                // }
            }),
            version: 1,
            // Deep-merge nested touchControls so new fields survive schema changes
            merge: (persistedState, currentState) => ({
                ...currentState,
                touchControls: { ...currentState.touchControls, ...persistedState.touchControls }
            }),
        },
    ),
)