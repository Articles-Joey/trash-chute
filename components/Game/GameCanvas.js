import { memo, Suspense, useMemo, useRef } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Text, Stats } from "@react-three/drei";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

import { Model as SpacesuitModel } from "@/components/Models/Spacesuit";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { useGameStore } from "@/hooks/useGameStore";

import { Player } from "./Player";
import { FPV } from "./FPV";
import TopCheckpoint from "./TopCheckpoint";
import Obstacles from "./Obstacles";
import Ramp from "./Ramp";
import Wall from "./Wall";
import { ModelSkybox } from "../Models/Forest_clearing_1_top_skybox";
import { useStore } from "@/hooks/useStore";

function GameCanvas({ landingAnimation }) {
    const debug = useStore((state) => state.debug);
    const darkMode = useStore((state) => state.darkMode);
    const graphicsQuality = useStore((state) => state.graphicsQuality);
    const showStats = useStore((state) => state?.debugConfig?.showStats);

    const {
        // debug,
        controlType,
        topCheckpoint,
    } = useGameStore((state) => ({
        // debug: state.debug,
        controlType: state.controlType,
        topCheckpoint: state.topCheckpoint,
    }));

    let gameContent = (
        <>
            <ModelSkybox scale={300} />

            {/* {controlType == "Mouse and Keyboard" && */}
            {!landingAnimation && <Player />}

            {/* Bottom Ground */}
            <Ground
                args={[10, 0.25, 5]}
                position={[0, 0, 0]}
            />

            <SpacesuitModel
                position={[0, 0.15, -1]}
                scale={0.6}
                action="Run"
            />

            <Ramp
                args={[10, 0.25, 100]}
                position={[0, 25, 43.5]}
                rotation={[degToRad(-30), 0, 0]}
            />

            {/* Top Ground */}
            <Ground
                args={[10, 0.25, 15]}
                position={[0, 49.98, 94.25]}
            />

            <TopCheckpoint
                args={[10 / 1.2, 2.25, 15 / 1.2]}
                position={[0, 51, 94.25]}
            />

            {topCheckpoint && <CheckpointText />}

            <ModelKennyNLMiniGolfFlagRed position={[0, 49.98, 90.25]} />

            <Wall
                args={[0.1, 50, 100]}
                position={[-5, 25, 50]}
            />

            <Wall
                args={[0.1, 50, 100]}
                position={[5, 25, 50]}
            />

            <Obstacles />
        </>
    );

    return (
        <Canvas
            camera={{
                position: [0, -2, -10],
                fov: 50,
                far: 10000.0,
            }}
            id="game-canvas"
            shadows
            key={graphicsQuality}
        >
            {showStats && (
                <>
                    <Stats className="stats-overlay" />
                </>
            )}

            {/* {controlType !== "Mouse and Keyboard" &&
                <OrbitControls
                // autoRotate={gameState?.status == 'In Lobby'}
                />
            } */}

            <Sky sunPosition={[0, 10, 0]} />

            <ambientLight intensity={darkMode ? 1 : 3} />
            {/* <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} /> */}

            {!landingAnimation && controlType == "Mouse and Keyboard" && (
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            )}

            <Suspense fallback={null}>
                <Physics
                    debug={debug}
                    colliders={false}
                    gravity={[0, -9.81, 0]}
                    timeStep={1 / 60}
                >
                    {gameContent}
                </Physics>
            </Suspense>

            {landingAnimation && <LandingCamera />}
        </Canvas>
    );
}

export default memo(GameCanvas);

function CheckpointText() {
    const textRef = useRef(null);
    const cameraPosition = useMemo(() => new Vector3(), []);
    const textPosition = useMemo(() => new Vector3(), []);

    useFrame(({ camera }) => {
        const text = textRef.current;
        if (!text) return;

        camera.getWorldPosition(cameraPosition);
        text.getWorldPosition(textPosition);
        // Calculate yaw directly to keep the text upright through a full 360°.
        text.rotation.set(
            0,
            Math.atan2(
                cameraPosition.x - textPosition.x,
                cameraPosition.z - textPosition.z,
            ),
            0,
        );
    });

    return (
        <Text
            ref={textRef}
            position={[0, 54, 94.25]}
            color="black"
            outlineColor="white"
            outlineWidth={0.05}
        >
            You made it!
        </Text>
    );
}

function Ground({ args, position }) {
    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            friction={0}
            restitution={0}
        >
            <CuboidCollider args={args.map((size) => size / 2)} />
            <mesh castShadow>
                <boxGeometry args={args} />
                <meshStandardMaterial color="gray" />
            </mesh>
        </RigidBody>
    );
}

const TARGET = [0, 1, 0];
const CAM_Y = 1;
const CAM_Z = -14;
const SWING_RANGE = 3; // units left/right from center
const SWING_SPEED = 0.3; // radians per second

function LandingCamera() {
    const { camera } = useThree();
    useFrame(({ clock }) => {
        camera.position.x =
            Math.sin(clock.elapsedTime * SWING_SPEED) * SWING_RANGE;
        camera.position.y = CAM_Y;
        camera.position.z = CAM_Z;
        camera.lookAt(...TARGET);
    });
    return null;
}
