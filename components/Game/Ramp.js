import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";
import { useStore } from "@/hooks/useStore";

export default function Ramp({ args, position, rotation }) {
    const darkMode = useStore((state) => state.darkMode);

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const sandTextures = useTexture(
        {
            map: "/img/textures/sand/GroundSand005_COL_2K.jpg",
            normalMap: "/img/textures/sand/GroundSand005_NRM_2K.jpg",
            aoMap: "/img/textures/sand/GroundSand005_AO_2K.jpg",
        },
        (textures) => {
            Object.values(textures).forEach((t) => {
                t.wrapS = t.wrapT = RepeatWrapping;
                t.repeat.set(2, 20);
            });
        },
    );

    const isLowQuality = graphicsQuality === "Low";

    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={rotation}
            colliders={false}
            friction={0}
            restitution={0}
        >
            <CuboidCollider args={args.map((size) => size / 2)} />
            <mesh castShadow>
                <boxGeometry args={args} />
                {isLowQuality ? (
                    <meshStandardMaterial color="#d2b48c" />
                ) : (
                    <meshStandardMaterial {...sandTextures} />
                )}
            </mesh>
        </RigidBody>
    );
}
