"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist, createJSONStorage } from 'zustand/middleware'
// import { nanoid } from 'nanoid'

// const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
// const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const useGameStore = create()(
    persist(
        (set, get) => ({

            // Mouse and Keyboard
            // Touch
            controlType: "Mouse and Keyboard",
            setControlType: (newValue) => {
                set((prev) => ({
                    controlType: newValue
                }))
            },

            topCheckpoint: false,
            setTopCheckpoint: (newValue) => {
                set((prev) => ({
                    topCheckpoint: newValue
                }))
                // setLocalStorage('game:trash-chute:topCheckpoint', newValue)
            },

            debug: false,
            setDebug: (newValue) => {
                set((prev) => ({
                    debug: newValue
                }))
            },

            freezeObstacles: false,
            setFreezeObstacles: (newValue) => {
                set((prev) => ({
                    freezeObstacles: newValue
                }))
            },

            // galleryTheme: "Forest",
            // setGalleryTheme: (newValue) => {
            //     set((prev) => ({
            //         galleryTheme: newValue
            //     }))
            // },

            // music: false,
            // setMusic: (newValue) => {
            //     set((prev) => ({
            //         music: newValue
            //     }))
            // },

            // playerRotation: false,
            // setPlayerRotation: (newValue) => {
            //     set((prev) => ({
            //         playerRotation: newValue
            //     }))
            // },

            // multiplayer: {},
            // setMultiplayer: (newValue) => {
            //     set((prev) => ({
            //         multiplayer: newValue
            //     }))
            // },

            // playerLocation: false,
            // setPlayerLocation: (newValue) => {
            //     set((prev) => ({
            //         playerLocation: newValue
            //     }))
            // },

            ref: null,
            api: null,
            position: [0, 0, 0], // Initial sphere position
            setPlayer: (ref, api) => set({ ref, api }),
            setPosition: (position) => set({ position }),

            tagCounter: 0,
            setTagCounter: (tagCounter) => set({ tagCounter }),

            sprintMeter: 1,          // 0..1 normalized
            sprintOnCooldown: false,
            setSprintMeter: (meter, onCooldown) => set({ sprintMeter: meter, sprintOnCooldown: onCooldown }),

            isThirdPerson: false,
            cameraDistance: 6,
            setIsThirdPerson: (isThirdPerson) => set({ isThirdPerson }),
            setCameraDistance: (cameraDistance) => set({ cameraDistance }),
        }),
        {
            name: 'trash-chute-game-storage', // name of the item in the storage (must be unique)
            // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        },
    ),
)