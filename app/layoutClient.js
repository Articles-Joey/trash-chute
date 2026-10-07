"use client";
import { Suspense } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useStore } from "@/hooks/useStore";
import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import GlobalBody from "@articles-media/articles-dev-box/GlobalBody";
import HotkeyHandler from "@articles-media/articles-dev-box/HotkeyHandler";

export default function LayoutClient({}) {
    return (
        <>
            <GlobalBody />
            <DarkModeHandler useStore={useStore} />
            <Suspense>
                <HotkeyHandler
                    useStore={useStore}
                    useHotkeys={useHotkeys}
                />
            </Suspense>
        </>
    );
}
