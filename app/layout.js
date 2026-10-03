import { Suspense } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AppThemeProvider from "@/components/AppThemeProvider";
import SocketLogicHandler from "@/components/SocketLogicHandler";
import GlobalClientModals from "@/components/UI/GlobalClientModals";
import LayoutClient from "./layoutClient";
import packageInfo from "@/package.json";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

export const metadata = {
    title: process.env.NEXT_PUBLIC_GAME_NAME,
    description: packageInfo.description,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <AppThemeProvider>
                        <LayoutClient />
                        <Suspense>
                            <SocketLogicHandler />
                            <GlobalClientModals />
                        </Suspense>
                        {children}
                    </AppThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
