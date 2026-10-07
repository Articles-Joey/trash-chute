import {
    BallCollider,
    CapsuleCollider,
    CuboidCollider,
    CylinderCollider,
    RigidBody,
    useAfterPhysicsStep,
} from "@react-three/rapier";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Euler, Quaternion } from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { ModelBurger } from "@/components/Models/Burger";
import { ModelCan } from "@/components/Models/Can";
import { ModelDumpster } from "@/components/Models/Dumpster";
import { ModelSpikyBall } from "@/components/Models/Spiky Ball";
import { ModelStylizedRock } from "@/components/Models/Stylized_rock";
import {
    OBSTACLE_COLLISION_GROUPS,
    OBSTACLE_BOUNDARY_COLLISION_GROUPS,
} from "./physicsGroups";

// collisionArgs: sphere [radius], box [width, height, depth], cylinder [halfHeight, radius], capsule { radius, halfHeight }.
// modelScale:     three.js visual scale, independent of collision — tune to match the collision visually
// modelOffset:    [x, y, z] position of the model relative to the collision centre (omit for no offset)
const OBSTACLE_TYPES = [
    {
        ModelComponent: ModelSpikyBall,
        collision: "sphere",
        collisionArgs: [1],
        modelScale: 1.25,
    },
    {
        ModelComponent: ModelStylizedRock,
        // collision: 'convex',
        // collisionArgs: null,
        collision: "sphere",
        collisionArgs: [1],
        modelScale: 1,
    },
    {
        ModelComponent: ModelBurger,
        // collision: 'convex',
        // collisionArgs: null,
        collision: "sphere",
        collisionArgs: [1],
        modelScale: 1.5,
    },
    {
        ModelComponent: ModelCan,
        collision: "cylinder",
        collisionArgs: [1, 0.5],
        modelScale: [2, 3, 2],
        modelOffset: [0, -0.9, 0],
    },
    {
        ModelComponent: ModelDumpster,
        // collision: 'convex',
        // collisionArgs: null,
        collision: "sphere",
        collisionArgs: [1],
        modelScale: [0.5, 0.6, 0.5],
        modelOffset: [0, -0.5, 0],
    },
];

function Obstacles() {
    const obstacleCount = 14;
    const baseHeight = 50;
    const heightIncrement = 15;

    const obstacles = useMemo(() => {
        return Array.from({ length: obstacleCount }).map((_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 4,
                baseHeight + i * heightIncrement,
                80,
            ],
            typeIndex: Math.floor(Math.random() * OBSTACLE_TYPES.length),
        }));
    }, []);

    return (
        <group>
            <ObstacleBounds
                height={baseHeight + (obstacleCount - 1) * heightIncrement + 20}
            />
            {obstacles.length > 0 &&
                obstacles.map((obstacle) => {
                    const type = OBSTACLE_TYPES[obstacle.typeIndex];
                    return (
                        <Obstacle
                            key={obstacle.id}
                            collision={type.collision}
                            args={type.collisionArgs}
                            position={obstacle.position}
                            ModelComponent={type.ModelComponent}
                            scale={type.modelScale}
                            modelOffset={type.modelOffset}
                        />
                    );
                })}
        </group>
    );
}

export default memo(Obstacles);

function ObstacleBounds({ height }) {
    // Match the visible side walls' inner faces at X = ±4.95.
    const sideX = 5.45;
    const halfDepth = 50;
    // The front wall starts above the visible walls, leaving the lower exit open.
    const endWallBottom = 50;
    const endWallHalfHeight = (height - endWallBottom) / 2;
    // The checkpoint platform begins at Z = 94.25 - 15 / 2.
    const checkpointStartZ = 86.75;

    return (
        <RigidBody
            type="fixed"
            colliders={false}
            collisionGroups={OBSTACLE_BOUNDARY_COLLISION_GROUPS}
            friction={0}
            restitution={0}
        >
            <CuboidCollider
                args={[0.5, height / 2, halfDepth]}
                position={[-sideX, height / 2, halfDepth]}
            />
            <CuboidCollider
                args={[0.5, height / 2, halfDepth]}
                position={[sideX, height / 2, halfDepth]}
            />
            <CuboidCollider
                args={[sideX + 0.5, endWallHalfHeight, 0.5]}
                position={[0, endWallBottom + endWallHalfHeight, -0.5]}
            />
            <CuboidCollider
                name="checkpoint-containment-wall"
                args={[sideX + 0.5, height / 2, 0.5]}
                position={[0, height / 2, checkpointStartZ + 0.5]}
            />
        </RigidBody>
    );
}

function randomAngularVelocity() {
    return Array.from({ length: 3 }, () => (Math.random() - 0.5) * 10);
}

function useObstacleReset(bodyRef, position) {
    const freezeObstacles = useGameStore((s) => s.freezeObstacles);
    const resetRotation = useMemo(() => new Quaternion(), []);
    const resetEuler = useMemo(() => new Euler(), []);

    useEffect(() => {
        const body = bodyRef.current;
        if (!body) return;
        // Lock every axis so gravity and impacts cannot move a frozen obstacle.
        body.setEnabledTranslations(
            !freezeObstacles,
            !freezeObstacles,
            !freezeObstacles,
            true,
        );
        body.setEnabledRotations(
            !freezeObstacles,
            !freezeObstacles,
            !freezeObstacles,
            true,
        );
        if (freezeObstacles) {
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
    }, [bodyRef, freezeObstacles]);

    useAfterPhysicsStep(() => {
        const body = bodyRef.current;
        if (!body || freezeObstacles || body.translation().y >= -10) return;

        body.setTranslation(
            { x: position[0], y: position[1], z: position[2] },
            true,
        );
        resetEuler.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
        );
        body.setRotation(resetRotation.setFromEuler(resetEuler), true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        const [x, y, z] = randomAngularVelocity();
        body.setAngvel({ x, y, z }, true);
    });
}

function Obstacle({
    collision,
    args,
    position,
    rotation,
    ModelComponent,
    scale,
    modelOffset,
}) {
    const bodyRef = useRef(null);
    const [angularVelocity] = useState(randomAngularVelocity);
    const userData = useMemo(
        () => ({
            obstacle: true,
            spikyBall: ModelComponent === ModelSpikyBall,
        }),
        [ModelComponent],
    );
    useObstacleReset(bodyRef, position);

    let collider;
    switch (collision) {
        case "box":
            collider = <CuboidCollider args={args.map((size) => size / 2)} />;
            break;
        case "cylinder":
            collider = <CylinderCollider args={args} />;
            break;
        case "capsule":
            collider = (
                <CapsuleCollider args={[args.halfHeight, args.radius]} />
            );
            break;
        case "convex":
            // Rapier builds hulls from the model, including its scale and offset.
            break;
        default:
            collider = <BallCollider args={args} />;
    }

    return (
        <RigidBody
            ref={bodyRef}
            position={position}
            rotation={rotation}
            angularVelocity={angularVelocity}
            colliders={collision === "convex" ? "hull" : false}
            collisionGroups={OBSTACLE_COLLISION_GROUPS}
            mass={50}
            friction={0}
            restitution={0}
            linearDamping={0.01}
            angularDamping={0.01}
            canSleep={false}
            ccd
            userData={userData}
        >
            {collider}
            <ModelComponent
                scale={scale}
                position={modelOffset}
            />
        </RigidBody>
    );
}
