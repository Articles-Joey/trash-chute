"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ReplayIcon from "@mui/icons-material/Replay";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import ArticlesButton from "@/components/UI/Button";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";

function LeftPanelContent() {
    const reloadScene = useStore((state) => state.reloadScene);
    const debug = useStore((state) => state.debug);
    const sidebar = useStore((state) => state.sidebar);
    const api = useGameStore((state) => state.api);
    const topCheckpoint = useGameStore((state) => state.topCheckpoint);
    const setTopCheckpoint = useGameStore((state) => state.setTopCheckpoint);

    return (
        <Box className={sidebar ? "left-panel" : "left-panel collapsed"} sx={{ width: "100%" }}>
            <Card sx={{ bgcolor: "game.card", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 }, display: "flex", flexWrap: "wrap" }}>
                    <GameMenuPrimaryButtonGroup useStore={useStore} type="GameMenu" useRouter={useRouter} />
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        onClick={reloadScene}
                        startIcon={<ReplayIcon />}
                    >
                        Reload Game
                    </ArticlesButton>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        disabled={!topCheckpoint}
                        onClick={() => api?.position?.set(0, 55.98, 94.25)}
                        startIcon={<RocketLaunchIcon />}
                    >
                        Teleport Top
                    </ArticlesButton>
                    <ArticlesButton
                        variant="link"
                        small
                        sx={{ width: "100%", textAlign: "center", mt: "1rem" }}
                        onClick={() => setTopCheckpoint(false)}
                    >
                        Reset Checkpoints
                    </ArticlesButton>
                    {debug && <DebugPanel />}
                </CardContent>
            </Card>
        </Box>
    );
}

export default memo(LeftPanelContent);

function DebugPanel() {
    const freezeObstacles = useGameStore((state) => state.freezeObstacles);
    const setFreezeObstacles = useGameStore((state) => state.setFreezeObstacles);

    return (
        <Box sx={{ mt: "1rem", p: "0.5rem", border: 1, borderColor: "divider", width: "100%" }}>
            <Typography variant="h6" component="h5" sx={{ mb: "0.5rem" }}>Debug Panel</Typography>
            <Box sx={{ width: "100%", display: "flex" }}>
                {[false, true].map((value) => (
                    <ArticlesButton
                        key={String(value)}
                        small
                        sx={{ width: "50%" }}
                        active={freezeObstacles === value}
                        onClick={() => setFreezeObstacles(value)}
                    >
                        {value ? "Freeze" : "Unfreeze"}
                    </ArticlesButton>
                ))}
            </Box>
        </Box>
    );
}
