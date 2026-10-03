"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import classNames from "classnames";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import LeftPanelContent from "@/components/Game/LeftPanel";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import SprintMeter from "@/components/UI/SprintMeter";
import CameraZoomIndicator from "@/components/UI/CameraZoomIndicator";
import TouchControls from "@/components/UI/TouchControls";

const GameCanvas = dynamic(
    () => import("@/components/Game/GameCanvas"),
    { ssr: false },
);

export default function GamePage() {
    const socket = useSocketStore((state) => state.socket);
    const searchParams = useSearchParams();
    const server = searchParams.get("server");
    const sceneKey = useStore((state) => state.sceneKey);
    const showMenu = useStore((state) => state.showMenu);
    const sidebar = useStore((state) => state.sidebar);
    const { isFullscreen } = useFullscreen();

    useEffect(() => {
        if (server && socket.connected) {
            socket.emit("join-room", `game:trash-chute-room-${server}`, {
                game_id: server,
                nickname: JSON.parse(localStorage.getItem("game:nickname")),
                client_version: "1",
            });
        }
    }, [server, socket, socket.connected]);

    return (
        <Box
            className={classNames(`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`, {
                "menu-open": showMenu,
                fullscreen: isFullscreen,
                "show-sidebar": sidebar,
            })}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{ position: "relative", display: "flex" }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{ style: "Corner Button", menuBarButtonPosition: "Left" }}
                sidebarConfig={{ style: "Static Panel" }}
            />
            <Box
                className="canvas-wrap"
                sx={{
                    position: "relative",
                    width: "100vw",
                    height: "100vh",
                    "& canvas": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                    },
                }}
            >
                <GameCanvas key={sceneKey} />
                <SprintMeter />
                <TouchControls />
                <CameraZoomIndicator />
            </Box>
        </Box>
    );
}
