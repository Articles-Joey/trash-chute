"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'
import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

// import useFullscreen from '@/hooks/useFullScreen';
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import GameMenu from '@articles-media/articles-dev-box/GameMenu';

import { useControllerStore } from '@/hooks/useControllerStore';

import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/Game/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import SprintMeter from '@/components/UI/SprintMeter';
import CameraZoomIndicator from '@/components/UI/CameraZoomIndicator';
import TouchControls from '@/components/UI/TouchControls';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    useEffect(() => {

        if (server && socket.connected) {
            socket.emit('join-room', `game:trash-chute-room-${server}`, {
                game_id: server,
                nickname: JSON.parse(localStorage.getItem('game:nickname')),
                client_version: '1',

            });
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:trash-chute-room-${server}')
        // };

    }, [server, socket.connected]);

    const sceneKey = useStore((state) => state.sceneKey)
    const menuOpen = useStore((state) => state.menuOpen)
    const sidebar = useStore((state) => state.sidebar)

    return (

        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': menuOpen,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            <div className='canvas-wrap'>

                <GameCanvas
                    key={sceneKey}
                />

                <SprintMeter />

                <TouchControls />

                <CameraZoomIndicator />

            </div>

        </div>
    );
}