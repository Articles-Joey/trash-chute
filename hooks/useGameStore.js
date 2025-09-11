"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist, createJSONStorage } from 'zustand/middleware'
// import { nanoid } from 'nanoid'

// const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
// const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const useStore = create()(
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
        }),
        {
            name: 'trash-chute-game-storage', // name of the item in the storage (must be unique)
            // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        },
    ),
)