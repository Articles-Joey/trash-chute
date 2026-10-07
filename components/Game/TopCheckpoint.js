import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useGameStore } from "@/hooks/useGameStore";

export default function TopCheckpoint({ position, args }) {
    const unlocked = useGameStore((state) => state.topCheckpoint);

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            userData={{ topCheckpoint: true }}
        >
            <CuboidCollider
                args={args.map((size) => size / 2)}
                sensor
            />
            <mesh castShadow>
                <boxGeometry args={args} />
                <meshStandardMaterial
                    transparent={true}
                    opacity={0.25}
                    color={unlocked ? "green" : "red"}
                />
            </mesh>
        </RigidBody>
    );
}
