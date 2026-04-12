import { memo } from "react";

import Link from "next/link";

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from "@/components/UI/Button";

import { useSocketStore } from "@/hooks/useSocketStore";
import { useGameStore } from "@/hooks/useGameStore";
import { Dropdown, DropdownButton } from "react-bootstrap";
// import useFullscreen from "@/hooks/useFullScreen";
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { useStore } from "@/hooks/useStore";
import { Debug } from "@react-three/cannon";

function LeftPanelContent(props) {

    const {
        // isFullscreen,
        // requestFullscreen,
        // exitFullscreen,
        reloadScene
    } = props;

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const toggleDarkMode = useStore(state => state.toggleDarkMode);
    const darkMode = useStore(state => state.darkMode);
    const setShowSettingsModal = useStore(state => state.setShowSettingsModal);

    const debug = useStore(state => state.debug);
    const setDebug = useStore(state => state.setDebug);

    const sidebar = useStore(state => state.sidebar);
    const toggleSidebar = useStore(state => state.toggleSidebar);

    const {
        // debug,
        // setDebug,
        api,
        setTopCheckpoint,
        topCheckpoint
    } = useGameStore(state => ({
        debug: state.debug,
        setDebug: state.setDebug,
        api: state.api,
        setTopCheckpoint: state.setTopCheckpoint,
        topCheckpoint: state.topCheckpoint
    }));

    return (
        <div className={`left-panel w-100 ${!sidebar ? 'collapsed' : ''}`}>

            <div className="card card-articles card-sm">

                <div className="card-body d-flex flex-wrap">

                    <Link
                        href={'/'}
                        className="w-50"
                    >
                        <ArticlesButton
                            className='w-100'
                            small
                        >
                            <i className="fad fa-arrow-alt-square-left"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen()
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                    <div
                        className="d-flex w-50"
                    >
                        <ArticlesButton
                            small
                            className="w-100"
                            onClick={() => {
                                setShowSettingsModal(true)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            <span>Settings</span>
                        </ArticlesButton>
                        <ArticlesButton
                            small
                            className=""
                            active={darkMode}
                            onClick={() => {
                                toggleDarkMode()
                            }}
                        >
                            <i className="fad fa-sun"></i>
                        </ArticlesButton>
                    </div>

                    <ArticlesButton
                        size="sm"
                        className="w-50"
                        onClick={reloadScene}
                    >
                        <i className="fad fa-redo"></i>
                        Reload Game
                    </ArticlesButton>

                    {/* <div className='w-50'>
                        <DropdownButton
                            variant="articles w-100"
                            size='sm'
                            id="dropdown-basic-button"
                            className="dropdown-articles"
                            title={
                                <span>
                                    <i className="fad fa-bug"></i>
                                    <span>Debug </span>
                                    <span>{debug ? 'On' : 'Off'}</span>
                                </span>
                            }
                        >

                            <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                {[
                                    false,
                                    true
                                ]
                                    .map(location =>
                                        <Dropdown.Item
                                            key={location}
                                            onClick={() => {
                                                setDebug(location)
                                            }}
                                            className="d-flex justify-content-between"
                                        >
                                            {location ? 'True' : 'False'}
                                        </Dropdown.Item>
                                    )}

                            </div>

                        </DropdownButton>
                    </div> */}

                    <ArticlesButton
                        small
                        className="w-50"
                        active={sidebar}
                        onClick={() => {
                            toggleSidebar()
                        }}
                    >
                        <i className='fad fa-expand'></i>
                        <span>Sidebar</span>
                    </ArticlesButton>

                    <ArticlesButton
                        size="sm"
                        className="w-50"
                        disabled={!topCheckpoint}
                        onClick={() => {
                            api?.position?.set(
                                0, 55.98, 94.25
                            );
                        }}
                    >
                        <i className="fad fa-ufo"></i>
                        Teleport Top
                    </ArticlesButton>

                    <button
                        className="w-100 btn btn-link small text-center mt-3"
                        onClick={() => {
                            setTopCheckpoint(false)
                        }}
                    >
                        Reset Checkpoints
                    </button>

                    {debug &&
                        <DebugPanel />
                    }

                </div>

            </div>

        </div>
    )

}

export default memo(LeftPanelContent)

function DebugPanel() {

    const obstacles = useGameStore(state => state.obstacles);
    const freezeObstacles = useGameStore(state => state.freezeObstacles);
    const setFreezeObstacles = useGameStore(state => state.setFreezeObstacles);

    return (
        <div className="debug-panel mt-3 p-2 border w-100">


            <h5>Debug Panel</h5>

            <div className="w-100">
                {[false, true].map(value =>

                    <ArticlesButton
                        key={value}
                        small
                        className="w-50"
                        active={freezeObstacles === value}
                        onClick={() => setFreezeObstacles(value)}
                    >
                        {value ? 'Freeze' : 'Unfreeze'}
                    </ArticlesButton>
                )}
            </div>

        </div>
    )
}