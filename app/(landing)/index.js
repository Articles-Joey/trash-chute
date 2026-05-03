"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';

import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';

// const GameScoreboard = dynamic(() =>
//     import('@articles-media/articles-dev-box/GameScoreboard'),
//     { ssr: false }
// );
const Ad = dynamic(() =>
    import('@articles-media/articles-dev-box/Ad'),
    { ssr: false }
);

const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);

import NicknameInput from '@articles-media/articles-dev-box/NicknameInput';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

const SharedBackgroundImage = () => (
    <Image
        src={`/img/game-preview.webp`}
        alt=""
        fill
        style={{ objectFit: 'cover', objectPosition: 'bottom' }}
    />
);


const LandingBackgroundAnimation = dynamic(() => import('@/components/Game/LandingBackgroundAnimation'), {
    ssr: false,
    loading: () => <SharedBackgroundImage />
});

const game_key = 'trash-chute'
const game_name = 'Trash Chute'

export default function LobbyPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        "3029"
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    // const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const _hasHydrated = useStore((state) => state._hasHydrated)

    const landingAnimation = useStore((state) => state.landingAnimation)

    const nickname = useStore((state) => state.nickname)
    const setNickname = useStore((state) => state.setNickname)
    const randomNickname = useStore((state) => state.randomNickname)

    const darkMode = useStore((state) => state.darkMode)
    const toggleDarkMode = useStore((state) => state.toggleDarkMode)

    const setShowInfoModal = useStore((state) => state.setShowInfoModal)
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal)
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal)

    const lobbyDetails = useStore((state) => state.lobbyDetails)
    const setLobbyDetails = useStore((state) => state.setLobbyDetails)

    // const [showInfoModal, setShowInfoModal] = useState(false)
    // const [showSettingsModal, setShowSettingsModal] = useState(false)
    // const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    // const [lobbyDetails, setLobbyDetails] = useState({
    //     players: [],
    //     games: [],
    // })

    useEffect(() => {

        socket.on('game:death-race-landing-details', function (msg) {
            console.log('game:death-race-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:death-race-landing-details');
        };

    }, [])

    // Rather all in one logic in store with initial value flash then scattered logic
    // useEffect(() => {

    //     // Only on first load
    //     if (nickname === null && _hasHydrated) {
    //         randomNickname()
    //     }

    // }, [nickname, _hasHydrated])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:death-race-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:death-race-landing')
        };

    }, [socket.connected]);

    return (

        <div className={`${game_key}-landing-page`}>

            {/* <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Trash Chute/trash-chute-lobby-background.png`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
                />
            </div> */}
            <div className='background-wrap'>
                {landingAnimation ?
                    <LandingBackgroundAnimation />
                    :
                    <SharedBackgroundImage />
                }
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div
                    className=''
                    style={{ "width": "20rem" }}
                >

                    <div
                        className="card card-articles card-sm mb-3"
                    >

                        {/* <div style={{ position: 'relative', height: '200px' }}>
                            <Image
                                src={Logo}
                                alt=""
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div> */}

                        <div className='card-header d-flex align-items-center'>

                            <NicknameInput 
                                useStore={useStore}
                            />

                        </div>

                        <div className="card-body">

                            <Link href={{
                                pathname: `/play`
                            }}>
                                <ArticlesButton
                                    className={`w-100 mb-3`}
                                    small
                                >
                                    <i className="fas fa-play"></i>
                                    Play Single Player
                                </ArticlesButton>
                            </Link>

                            <div className="fw-bold mb-1 small text-center">
                                {lobbyDetails?.players?.length || 0} player{lobbyDetails?.players?.length > 1 && 's'} in the lobby.
                            </div>

                            <div className="servers">

                                {[1, 2, 3, 4].map(id => {

                                    let lobbyLookup = lobbyDetails?.games?.find(lobby =>
                                        parseInt(lobby.server_id) == id
                                    )

                                    return (
                                        <div key={id} className="server">

                                            <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                                <div className='mb-0'>{lobbyLookup?.players?.length || 0}/4</div>
                                            </div>

                                            <div className='d-flex justify-content-around w-100 mb-1'>
                                                {[1, 2, 3, 4].map(player_count => {

                                                    let playerLookup = false

                                                    if (lobbyLookup?.players?.length >= player_count) playerLookup = true

                                                    return (
                                                        <div key={player_count} className="icon" style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            ...(playerLookup ? {
                                                                backgroundColor: 'black',
                                                            } : {
                                                                backgroundColor: 'gray',
                                                            }),
                                                            border: '1px solid black'
                                                        }}>

                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: `/play`,
                                                    query: {
                                                        server: id
                                                    }
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>

                                        </div>
                                    )
                                })}

                            </div>

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <GameMenuPrimaryButtonGroup 
                                useStore={useStore}
                                type="Landing"
                            />    

                        </div>

                    </div>

                    <ReturnToLauncherButton />

                </div>

                {/* <GameScoreboard
                    game={game_name}
                    style="Default"
                    darkMode={darkMode ? true : false}
                /> */}

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={game_name}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

            </div>
        </div>
    );
}