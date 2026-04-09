import { useSphere } from "@react-three/cannon";
import { memo, useEffect, useMemo } from "react";
import { ModelSpikyBall } from "@/components/Models/Spiky Ball";
import { ModelStylizedRock } from "@/components/Models/Stylized_rock";

function Obstacles() {

    return (
        <group>

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 52, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[0, 50, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 54, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 100, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 100, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[1, 150, 80]}
            />

            <Obstacle
                args={[1, 6, 6]}
                position={[-1, 150, 80]}
            />

        </group>
    )

}

export default memo(Obstacles)

function Obstacle({ args, position, rotation }) {

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
    }))

    const ModelComponent = useMemo(() => (Math.random() > 0.5 ? ModelSpikyBall : ModelStylizedRock), []);
    const isSpikyBall = ModelComponent === ModelSpikyBall;
    const scale = useMemo(() => args[0] * (isSpikyBall ? 1.5 : 2.5), []);

    useEffect(() => {

        const unsubscribe = api.position.subscribe((p) => {

            if (p[1] < -10) {

                api.position.set(
                    position[0],
                    position[1],
                    position[2],
                );

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

        })

        return () => unsubscribe();

    }, [api.position])

    return (
        <group ref={ref} castShadow>
            <ModelComponent scale={scale} />
        </group>
    )

}