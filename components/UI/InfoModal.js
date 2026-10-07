"use client";

import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";
import packageInfo from "@/package.json";

export default function GameInfoModal({ show, setShow }) {
    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Info"
            size="md"
            modalClassName="games-info-modal"
            contentSx={{ p: 0 }}
        >
            <Box sx={{ aspectRatio: "16 / 9" }}>
                <Box
                    component="img"
                    src="/img/game-preview.webp"
                    alt="Trash Chute game preview"
                    sx={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </Box>
            <Box sx={{ p: "1rem" }}>{packageInfo.description}</Box>
        </ArticlesModal>
    );
}
