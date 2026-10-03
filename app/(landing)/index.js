"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArticlesButton from "@/components/UI/Button";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import SessionButton from "@articles-media/articles-dev-box/SessionButton";
import NicknameInput from "@articles-media/articles-dev-box/NicknameInput";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import RotatingMascot from "@/components/UI/RotatingMascot";

const GameScoreboard = dynamic(
    () => import("@articles-media/articles-dev-box/GameScoreboard"),
    { ssr: false },
);
const Ad = dynamic(
    () => import("@articles-media/articles-dev-box/Ad"),
    { ssr: false },
);
const ReturnToLauncherButton = dynamic(
    () => import("@articles-media/articles-dev-box/ReturnToLauncherButton"),
    { ssr: false },
);

const SharedBackgroundImage = () => (
    <Image
        src="/img/game-preview.webp"
        alt=""
        fill
        style={{ objectFit: "cover", objectPosition: "bottom" }}
    />
);

const LandingBackgroundAnimation = dynamic(
    () => import("@/components/Game/LandingBackgroundAnimation"),
    { ssr: false, loading: () => <SharedBackgroundImage /> },
);

export default function LobbyPage() {
    const socket = useSocketStore((state) => state.socket);
    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);
    const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails({ token: userToken });
    const landingAnimation = useStore((state) => state.landingAnimation);
    const darkMode = useStore((state) => state.darkMode);
    const lobbyDetails = useStore((state) => state.lobbyDetails);
    const setLobbyDetails = useStore((state) => state.setLobbyDetails);

    useEffect(() => {
        const handleLandingDetails = (message) => {
            if (JSON.stringify(message) !== JSON.stringify(useStore.getState().lobbyDetails)) {
                setLobbyDetails(message);
            }
        };

        socket.on("landing-details", handleLandingDetails);
        return () => socket.off("landing-details", handleLandingDetails);
    }, [socket, setLobbyDetails]);

    useEffect(() => {
        if (socket.connected) socket.emit("join-room", "landing");
        return () => socket.emit("leave-room", "landing");
    }, [socket, socket.connected]);

    return (
        <Box
            className={`${process.env.NEXT_PUBLIC_GAME_KEY}-landing-page`}
            sx={{
                position: "relative",
                isolation: "isolate",
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                "& .scoreboard": {
                    mt: "1rem",
                    mb: "1rem",
                    maxWidth: 300,
                    width: "100%",
                    "@media (min-width: 992px)": {
                        mt: 0,
                        mb: 0,
                        display: "block",
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                    },
                },
                "& .ad-wrap": {
                    mt: "1rem",
                    "@media (min-width: 992px)": {
                        mt: 0,
                        display: "block",
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                    },
                },
            }}
        >
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                    "& img": { filter: "blur(2px)" },
                }}
            >
                {landingAnimation ? <LandingBackgroundAnimation /> : <SharedBackgroundImage />}
            </Box>
            <Box
                sx={{
                    width: "100%",
                    px: "0.75rem",
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column-reverse",
                    justifyContent: "center",
                    alignItems: "center",
                    "@media (min-width: 576px)": { maxWidth: 540 },
                    "@media (min-width: 768px)": { maxWidth: 720 },
                    "@media (min-width: 992px)": { maxWidth: 960, flexDirection: "row" },
                    "@media (min-width: 1200px)": { maxWidth: 1140 },
                    "@media (min-width: 1400px)": { maxWidth: 1320 },
                }}
            >
                <Box sx={{ width: "20rem", maxWidth: "100%" }}>
                    <Card sx={{ mb: "1rem", bgcolor: "game.card", backgroundImage: "none", border: 1, borderColor: "divider", fontSize: "0.875rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", p: 1, borderBottom: 1, borderColor: "divider" }}>
                            <NicknameInput useStore={useStore} />
                        </Box>
                        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                            <ArticlesButton
                                component={Link}
                                href="/play"
                                sx={{ width: "100%" }}
                                small
                                startIcon={<PlayArrowIcon />}
                            >
                                Play Single Player
                            </ArticlesButton>
                            <Box sx={{ fontSize: "0.875em", textAlign: "center", mt: "0.5rem" }}>
                                Multiplayer coming soon!
                            </Box>
                            <Box sx={{ display: "none", mt: "1rem" }}>
                                <Box sx={{ fontWeight: 700, mb: "0.25rem", fontSize: "0.875em", textAlign: "center" }}>
                                    {lobbyDetails?.players?.length || 0} player{lobbyDetails?.players?.length > 1 && "s"} in the lobby.
                                </Box>
                                <Box sx={{ display: "grid", gap: "5px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                                    {[1, 2].map((id) => {
                                        const lobby = lobbyDetails?.games?.find((game) => parseInt(game.server_id) === id);

                                        return (
                                            <Box
                                                key={id}
                                                sx={{ p: "0.5rem", border: "1px solid rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center" }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", mb: "0.5rem" }}>
                                                    <Box sx={{ fontSize: "0.9rem" }}><b>Server {id}</b></Box>
                                                    <Box>{lobby?.players?.length || 0}/4</Box>
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-around", width: "100%", mb: "0.25rem" }}>
                                                    {[1, 2, 3, 4].map((playerCount) => (
                                                        <Box
                                                            key={playerCount}
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                bgcolor: lobby?.players?.length >= playerCount ? "black" : "gray",
                                                                border: "1px solid black",
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                                <ArticlesButton
                                                    component={Link}
                                                    href={{ pathname: "/play", query: { server: id } }}
                                                    sx={{ px: "3rem" }}
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </CardContent>
                        <Box sx={{ p: 1, borderTop: 1, borderColor: "divider", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            <GameMenuPrimaryButtonGroup useStore={useStore} type="Landing" useRouter={useRouter} />
                        </Box>
                    </Card>
                    <SessionButton port={process.env.NEXT_PUBLIC_GAME_PORT} friendsButton />
                    <ReturnToLauncherButton />
                </Box>
                <GameScoreboard
                    game={process.env.NEXT_PUBLIC_GAME_NAME}
                    style="Default"
                    darkMode={Boolean(darkMode)}
                    prepend={
                        <Box sx={{ width: "100%", height: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <RotatingMascot />
                        </Box>
                    }
                />
                <Ad
                    style="Default"
                    section="Games"
                    section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                    darkMode={Boolean(darkMode)}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />
            </Box>
        </Box>
    );
}
