import { memo } from "react";

import ArticlesButton from "@/components/UI/Button";

import { useSocketStore } from "@/hooks/useSocketStore";
import { useGameStore } from "@/hooks/useGameStore";
// import { Dropdown, DropdownButton } from "react-bootstrap";
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { useStore } from "@/hooks/useStore";
// import { Debug } from "@react-three/cannon";

import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

function LeftPanelContent(props) {

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const reloadScene = useStore(state => state.reloadScene);
    // const toggleDarkMode = useStore(state => state.toggleDarkMode);
    // const darkMode = useStore(state => state.darkMode);
    // const setShowSettingsModal = useStore(state => state.setShowSettingsModal);
    const debug = useStore(state => state.debug);
    // const setDebug = useStore(state => state.setDebug);
    const sidebar = useStore(state => state.sidebar);
    // const toggleSidebar = useStore(state => state.toggleSidebar);

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

                    <GameMenuPrimaryButtonGroup 
                        useStore={useStore}
                        type="GameMenu"
                    />

                    <ArticlesButton
                        size="sm"
                        className="w-50"
                        onClick={reloadScene}
                    >
                        <i className="fad fa-redo"></i>
                        Reload Game
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