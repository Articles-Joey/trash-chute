import { useBox, useCompoundBody, useConvexPolyhedron, useCylinder, useSphere } from "@react-three/cannon";
import { memo, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { ConvexGeometry } from "three-stdlib";
import { Vector3 } from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { ModelBurger } from "@/components/Models/Burger";
import { ModelCan } from "@/components/Models/Can";
import { ModelDumpster } from "@/components/Models/Dumpster";
import { ModelSpikyBall } from "@/components/Models/Spiky Ball";
import { ModelStylizedRock } from "@/components/Models/Stylized_rock";

// collisionArgs:  passed directly to cannon shape (sphere: [radius], box: [x,y,z half-extents], cylinder: [radiusTop, radiusBottom, height, segments], capsule: { radius, halfHeight })
// modelScale:     three.js visual scale, independent of collision — tune to match the collision visually
// modelOffset:    [x, y, z] position of the model relative to the collision centre (omit for no offset)
const OBSTACLE_TYPES = [
    {
        ModelComponent: ModelSpikyBall,
        collision: 'sphere',
        collisionArgs: [1],
        modelScale: 1.25
    },
    {
        ModelComponent: ModelStylizedRock,
        // collision: 'convex',
        // collisionArgs: null,
        collision: 'sphere',
        collisionArgs: [1],
        modelScale: 1
    },
    {
        ModelComponent: ModelBurger,
        // collision: 'convex',
        // collisionArgs: null,
        collision: 'sphere',
        collisionArgs: [1],
        modelScale: 1.5
    },
    {
        ModelComponent: ModelCan,
        collision: 'cylinder',
        collisionArgs: [0.5, 0.5, 2, 8],
        modelScale: [2, 3, 2],
        modelOffset: [0, -0.9, 0]
    },
    {
        ModelComponent: ModelDumpster,
        // collision: 'convex',
        // collisionArgs: null,
        collision: 'sphere',
        collisionArgs: [1],
        modelScale: [0.5, 0.6, 0.5],
        modelOffset: [0, -0.5, 0]
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
                baseHeight + (i * heightIncrement),
                80
            ],
            typeIndex: Math.floor(Math.random() * OBSTACLE_TYPES.length),
        }));
    }, []);

    return (
        <group>
            {obstacles.map((obstacle) => {
                const type = OBSTACLE_TYPES[obstacle.typeIndex];
                const ObstacleComponent =
                    type.collision === 'box' ? ObstacleBox :
                        type.collision === 'cylinder' ? ObstacleCylinder :
                            type.collision === 'capsule' ? ObstacleCapsule :
                                type.collision === 'convex' ? ObstacleBurger :
                                    ObstacleSphere;
                return (
                    <ObstacleComponent
                        key={obstacle.id}
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

export default memo(Obstacles)

function useObstacleReset(api, position) {
    const freezeObstacles = useGameStore((s) => s.freezeObstacles);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!mountedRef.current) return;
        if (freezeObstacles) {
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.linearFactor.set(0, 0, 0);
            api.angularFactor.set(0, 0, 0);
        } else {
            api.linearFactor.set(1, 1, 1);
            api.angularFactor.set(1, 1, 1);
        }
    }, [freezeObstacles, api]);

    useEffect(() => {
        const unsubscribe = api.position.subscribe((p) => {
            if (!mountedRef.current) return;
            if (p[1] < -10) {
                api.position.set(position[0], position[1], position[2]);
                api.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                );
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                );
            }
        });
        return () => unsubscribe();
    }, [api, position]);
}

function ObstacleSphere({ args, position, rotation, ModelComponent, scale, modelOffset }) {
    const [ref, api] = useSphere(() => ({
        mass: 50,
        type: 'Dynamic',
        args: args,
        position: position,
        rotation: rotation,
        angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
        ],
        userData: { obstacle: true, spikyBall: ModelComponent === ModelSpikyBall },
    }));
    useObstacleReset(api, position);
    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} position={modelOffset} />
        </group>
    );
}

function ObstacleBox({ args, position, rotation, ModelComponent, scale, modelOffset }) {
    const [ref, api] = useBox(() => ({
        mass: 50,
        type: 'Dynamic',
        args: args,
        position: position,
        rotation: rotation,
        angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
        ],
        userData: { obstacle: true, spikyBall: false },
    }));
    useObstacleReset(api, position);
    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} position={modelOffset} />
        </group>
    );
}

function ObstacleCylinder({ args, position, rotation, ModelComponent, scale, modelOffset }) {
    const [ref, api] = useCylinder(() => ({
        mass: 50,
        type: 'Dynamic',
        args: args,
        position: position,
        rotation: rotation,
        angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
        ],
        userData: { obstacle: true, spikyBall: false },
    }));
    useObstacleReset(api, position);
    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} position={modelOffset} />
        </group>
    );
}

// Capsule = cylinder body + sphere cap at top + sphere cap at bottom
function ObstacleCapsule({ args, position, rotation, ModelComponent, scale, modelOffset }) {
    const { radius, halfHeight } = args;
    const [ref, api] = useCompoundBody(() => ({
        mass: 50,
        type: 'Dynamic',
        position: position,
        rotation: rotation,
        angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
        ],
        userData: { obstacle: true, spikyBall: false },
        shapes: [
            { type: 'Cylinder', args: [radius, radius, halfHeight * 2, 8], position: [0, 0, 0] },
            { type: 'Sphere', args: [radius], position: [0, halfHeight, 0] },
            { type: 'Sphere', args: [radius], position: [0, -halfHeight, 0] },
        ],
    }));
    useObstacleReset(api, position);
    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} position={modelOffset} />
        </group>
    );
}

// Burger.jsx applies scale={100} internally to its mesh; combine with modelScale to get world-space vertex positions
function ObstacleBurger({ position, rotation, ModelComponent, scale, modelOffset }) {
    const { nodes } = useGLTF('models/Burger-transformed.glb');

    const [vertices, faces] = useMemo(() => {
        const s = (Array.isArray(scale) ? scale[0] : scale) * 100;
        const posArr = nodes.Burger.geometry.attributes.position.array;
        const points = [];
        for (let i = 0; i < posArr.length; i += 3) {
            points.push(new Vector3(posArr[i] * s, posArr[i + 1] * s, posArr[i + 2] * s));
        }
        const hull = new ConvexGeometry(points);
        const hullPos = hull.attributes.position.array;
        const verts = [];
        for (let i = 0; i < hullPos.length; i += 3) {
            verts.push([hullPos[i], hullPos[i + 1], hullPos[i + 2]]);
        }
        const fcs = [];
        if (hull.index) {
            const idx = hull.index.array;
            for (let i = 0; i < idx.length; i += 3) fcs.push([idx[i], idx[i + 1], idx[i + 2]]);
        } else {
            for (let i = 0; i < verts.length; i += 3) fcs.push([i, i + 1, i + 2]);
        }
        return [verts, fcs];
    }, [nodes, scale]);

    const [ref, api] = useConvexPolyhedron(() => ({
        mass: 50,
        type: 'Dynamic',
        args: [vertices, faces],
        position,
        rotation,
        angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
        ],
        userData: { obstacle: true, spikyBall: false },
    }), null, [vertices, faces]);
    useObstacleReset(api, position);
    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} position={modelOffset} />
        </group>
    );
}