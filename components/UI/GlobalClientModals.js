"use client";

import DevBoxGlobalClientModals from "@articles-media/articles-dev-box/GlobalClientModals";
import { useAudioStore } from "@/hooks/useAudioStore";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import packageInfo from "@/package.json";

export default function GlobalClientModals() {
    return (
        <DevBoxGlobalClientModals
            useStore={useStore}
            useAudioStore={useAudioStore}
            useTouchControlsStore={useTouchControlsStore}
            useSocketStore={useSocketStore}
            packageInfo={packageInfo}
            infoModalConfig={{ previewImage: "/img/game-preview.webp" }}
            settingsModalConfig={{
                tabs: {
                    Graphics: {
                        darkMode: true,
                        landingAnimation: true,
                    },
                    Audio: {
                        sliders: [
                            { key: "backgroundMusicVolume", label: "Background Music Volume" },
                            { key: "soundEffectsVolume", label: "Sound Effects Volume" },
                        ],
                    },
                    Controls: {
                        touchControls: true,
                        defaultKeyBindings: {},
                    },
                    Multiplayer: { visible: false },
                    Other: {},
                },
            }}
        />
    );
}
