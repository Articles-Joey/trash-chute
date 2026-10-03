"use client";

import Box from "@mui/material/Box";
import { useState, useEffect } from "react";

export default function IsDev({ className, noOutline, children, inline }) {
    const userReduxState = false;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (children && userReduxState?.roles?.isDev && isMounted) {
        return (
            <Box
                className={`is-dev-content ${noOutline ? "no-outline" : ""} ${className || ""}`}
                sx={{ display: inline ? "inline-block" : "block" }}
            >
                {children}
            </Box>
        );
    }

    return null;
}
